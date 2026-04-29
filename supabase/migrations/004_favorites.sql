-- User favorites (saved content packs / snippets for reuse)

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  topic_snapshot text,
  output jsonb not null,
  content_type text not null default 'full_pack'
    check (content_type in ('hook', 'caption', 'script', 'idea', 'full_pack')),
  platform text not null default 'tiktok',
  tags text[] not null default '{}'::text[],
  usage_count int not null default 0,
  source_generation_id uuid references public.generations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

create index if not exists favorites_user_platform_idx
  on public.favorites (user_id, platform);

create index if not exists favorites_tags_gin
  on public.favorites using gin (tags);

create unique index if not exists favorites_unique_generation_per_user
  on public.favorites (user_id, source_generation_id)
  where source_generation_id is not null;

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_update_own"
  on public.favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);
