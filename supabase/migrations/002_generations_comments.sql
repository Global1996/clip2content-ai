-- Document generations table columns (informational)

comment on table public.generations is 'Saved AI generations per user (history).';

comment on column public.generations.user_id is 'Authenticated user (references auth.users).';
comment on column public.generations.topic is 'Input topic provided for generation.';
comment on column public.generations.output is 'Structured JSON result: hooks, scripts, caption, posts.';
comment on column public.generations.created_at is 'UTC timestamp when the generation was saved.';
