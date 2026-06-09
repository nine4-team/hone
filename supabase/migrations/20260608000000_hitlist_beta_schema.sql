-- HitList beta schema.
-- Apply this migration to the beta Supabase project.

create type public.training_log_type as enum ('study', 'dialogue_drilling', 'constraint_game', 'rolling');
create type public.media_type as enum ('youtube', 'instagram', 'link');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  active boolean not null default true,
  current_focus text,
  last_touched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  normalized_name text generated always as (lower(btrim(name))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_name)
);

create table public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  type public.training_log_type not null,
  occurred_at timestamptz not null default now(),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  training_log_id uuid references public.training_logs (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  training_log_id uuid references public.training_logs (id) on delete cascade,
  partner_id uuid references public.partners (id) on delete set null,
  count integer not null check (count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  type public.media_type not null,
  url text not null,
  title text,
  thumbnail_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index skills_user_active_idx on public.skills (user_id, active);
create index skills_user_touched_idx on public.skills (user_id, last_touched_at desc);
create index training_logs_skill_occurred_idx on public.training_logs (skill_id, occurred_at desc);
create index training_logs_user_idx on public.training_logs (user_id);
create index notes_skill_created_idx on public.notes (skill_id, created_at desc);
create index notes_user_idx on public.notes (user_id);
create index notes_training_log_idx on public.notes (training_log_id);
create index hits_skill_idx on public.hits (skill_id);
create index hits_training_log_idx on public.hits (training_log_id);
create index hits_partner_idx on public.hits (partner_id);
create index hits_user_idx on public.hits (user_id);
create index media_skill_idx on public.media (skill_id);
create index media_user_idx on public.media (user_id);

create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

create trigger training_logs_set_updated_at
  before update on public.training_logs
  for each row execute function public.set_updated_at();

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create trigger hits_set_updated_at
  before update on public.hits
  for each row execute function public.set_updated_at();

create trigger media_set_updated_at
  before update on public.media
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;
alter table public.partners enable row level security;
alter table public.training_logs enable row level security;
alter table public.notes enable row level security;
alter table public.hits enable row level security;
alter table public.media enable row level security;

create policy "Users can manage own skills"
  on public.skills for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own partners"
  on public.partners for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own training logs"
  on public.training_logs for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own notes"
  on public.notes for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own hits"
  on public.hits for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage own media"
  on public.media for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant usage on type public.training_log_type to authenticated;
grant usage on type public.media_type to authenticated;

grant select, insert, update, delete on public.skills to authenticated;
grant select, insert, update, delete on public.partners to authenticated;
grant select, insert, update, delete on public.training_logs to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.hits to authenticated;
grant select, insert, update, delete on public.media to authenticated;
