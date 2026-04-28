-- Per-user billing (Stripe sync via webhooks)

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'lifetime')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  updated_at timestamptz not null default now()
);

create index if not exists user_entitlements_stripe_customer_idx
  on public.user_entitlements (stripe_customer_id)
  where stripe_customer_id is not null;

alter table public.user_entitlements enable row level security;

create policy "user_entitlements_select_own"
  on public.user_entitlements for select
  using (auth.uid() = user_id);

-- Authenticated users may only create their free row (webhook uses service role for paid)
create policy "user_entitlements_insert_free_own"
  on public.user_entitlements for insert
  with check (auth.uid() = user_id and plan = 'free');

-- Backfill existing users as free tier
insert into public.user_entitlements (user_id, plan)
select id, 'free'
from auth.users
on conflict (user_id) do nothing;

-- New signups: entitlement row with free plan
create or replace function public.handle_new_user_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_entitlements (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_entitlement on auth.users;

create trigger on_auth_user_created_entitlement
  after insert on auth.users
  for each row
  execute function public.handle_new_user_entitlement();

comment on table public.user_entitlements is 'Plan and Stripe linkage; updates from /api/webhooks/stripe.';
comment on column public.user_entitlements.plan is 'free: 3 generations/day UTC; pro: subscription; lifetime: one-time payment.';
