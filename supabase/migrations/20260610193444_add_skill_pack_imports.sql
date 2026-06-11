create table public.skill_pack_onboarding_state (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skill_pack_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pack_slug text not null,
  pack_version integer not null,
  import_mode text not null check (import_mode in ('active', 'arsenal')),
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, pack_slug)
);

create table public.skill_pack_import_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  import_id uuid not null references public.skill_pack_imports (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  template_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, template_key),
  unique (user_id, skill_id)
);

create index skill_pack_imports_user_idx on public.skill_pack_imports (user_id);
create index skill_pack_import_items_user_idx on public.skill_pack_import_items (user_id);
create index skill_pack_import_items_import_idx on public.skill_pack_import_items (import_id);

create trigger skill_pack_onboarding_state_set_updated_at
  before update on public.skill_pack_onboarding_state
  for each row execute function public.set_updated_at();

create trigger skill_pack_imports_set_updated_at
  before update on public.skill_pack_imports
  for each row execute function public.set_updated_at();

alter table public.skill_pack_onboarding_state enable row level security;
alter table public.skill_pack_imports enable row level security;
alter table public.skill_pack_import_items enable row level security;

create policy "Users can manage own skill pack onboarding state"
  on public.skill_pack_onboarding_state for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own skill pack imports"
  on public.skill_pack_imports for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own skill pack import items"
  on public.skill_pack_import_items for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.skill_pack_onboarding_state to authenticated;
grant select, insert, update, delete on public.skill_pack_imports to authenticated;
grant select, insert, update, delete on public.skill_pack_import_items to authenticated;

insert into public.skill_pack_onboarding_state (user_id, completed_at)
select user_id, seeded_at
from public.starter_seed_state
on conflict (user_id) do nothing;

insert into public.skill_pack_imports (user_id, pack_slug, pack_version, import_mode, imported_at)
select user_id, 'bjj-escape-foundations', starter_skill_version, 'active', seeded_at
from public.starter_seed_state
on conflict (user_id, pack_slug) do nothing;

insert into public.skill_pack_import_items (user_id, import_id, skill_id, template_key, created_at)
select starter.user_id, pack_import.id, starter.skill_id, starter.starter_key, starter.created_at
from public.starter_seed_items as starter
join public.skill_pack_imports as pack_import
  on pack_import.user_id = starter.user_id
  and pack_import.pack_slug = 'bjj-escape-foundations'
on conflict (user_id, template_key) do nothing;
