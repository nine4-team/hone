create table public.starter_seed_state (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  starter_skill_version integer not null,
  seeded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.starter_seed_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  starter_key text not null,
  starter_skill_version integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, starter_key),
  unique (user_id, skill_id)
);

create trigger starter_seed_state_set_updated_at
  before update on public.starter_seed_state
  for each row execute function public.set_updated_at();

alter table public.starter_seed_state enable row level security;
alter table public.starter_seed_items enable row level security;

create policy "Users can manage own starter seed state"
  on public.starter_seed_state for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own starter seed items"
  on public.starter_seed_items for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.starter_seed_state to authenticated;
grant select, insert, update, delete on public.starter_seed_items to authenticated;
