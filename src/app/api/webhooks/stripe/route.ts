import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.user_id ?? session.client_reference_id ?? undefined;
        if (!userId) break;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        if (session.mode === "subscription") {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null;

          const { error } = await admin.from("user_entitlements").upsert(
            {
              user_id: userId,
              plan: "pro",
              stripe_customer_id: customerId,
              stripe_subscription_id: subId,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
          if (error) console.error("upsert pro", error);
        } else if (session.mode === "payment") {
          const { error } = await admin.from("user_entitlements").upsert(
            {
              user_id: userId,
              plan: "lifetime",
              stripe_customer_id: customerId,
              stripe_subscription_id: null,
              subscription_status: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
          if (error) console.error("upsert lifetime", error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;

        const { data: row } = await admin
          .from("user_entitlements")
          .select("user_id, plan")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        const uid = sub.metadata?.user_id ?? row?.user_id;
        if (!uid) break;
        if (row?.plan === "lifetime") break;

        const activeLike = ["active", "trialing", "past_due"].includes(
          sub.status
        );

        if (activeLike) {
          await admin
            .from("user_entitlements")
            .update({
              plan: "pro",
              stripe_subscription_id: subId,
              subscription_status: sub.status,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", uid);
        } else {
          await admin
            .from("user_entitlements")
            .update({
              plan: "free",
              stripe_subscription_id: null,
              subscription_status: sub.status,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", uid);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const subId = sub.id;

        const { data: row } = await admin
          .from("user_entitlements")
          .select("user_id, plan")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        if (!row?.user_id || row.plan === "lifetime") break;

        await admin
          .from("user_entitlements")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", row.user_id);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("webhook handler", e);
    return NextResponse.json(
      { received: true, error: "handler_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
