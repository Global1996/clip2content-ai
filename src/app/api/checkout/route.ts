import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const plans = ["pro", "lifetime"] as const;
type CheckoutPlan = (typeof plans)[number];

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const pricePro = process.env.STRIPE_PRICE_PRO_MONTHLY;
    const priceLifetime = process.env.STRIPE_PRICE_LIFETIME;

    if (!secret || !pricePro || !priceLifetime) {
      return NextResponse.json(
        { error: "Billing is not configured", code: "BILLING_DISABLED" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { plan?: CheckoutPlan };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const plan = body.plan;
    if (!plan || !plans.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan", code: "INVALID_PLAN" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secret);

    const { data: ent } = await supabase
      .from("user_entitlements")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = ent?.stripe_customer_id ?? undefined;

    const priceId =
      plan === "pro" ? pricePro : priceLifetime;

    const successUrl = `${appUrl.replace(/\/$/, "")}/dashboard?checkout=success`;
    const cancelUrl = `${appUrl.replace(/\/$/, "")}/pricing?checkout=cancel`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: plan === "pro" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan,
      },
      allow_promotion_codes: true,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    if (plan === "pro") {
      sessionParams.subscription_data = {
        metadata: {
          user_id: user.id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json(
        { error: "No checkout URL returned", code: "STRIPE_SESSION" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Checkout failed", code: "CHECKOUT_ERROR" },
      { status: 500 }
    );
  }
}
