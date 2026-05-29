-- HitList MVP schema draft.
-- This is a starting point for Supabase/Postgres migrations, not yet applied to a project.

create type public.skill_stage as enum ('saved', 'mechanics', 'resistance', 'proven');
create type public.training_log_type as enum ('study', 'dialogue_drilling', 'constraint_game', 'rolling');
create type public.media_type as enum ('youtube', 'instagram', 'link');

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  stage public.skill_stage not null default 'saved',
  active boolean not null default true,
  current_focus text,
  last_touched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  type public.training_log_type not null,
  occurred_at timestamptz not null default now(),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  training_log_id uuid references public.training_logs (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  training_log_id uuid not null references public.training_logs (id) on delete cascade,
  partner_id uuid references public.partners (id) on delete set null,
  count integer not null check (count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  type public.media_type not null,
  url text not null,
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index skills_user_stage_idx on public.skills (user_id, stage);
create index skills_user_active_idx on public.skills (user_id, active);
create index training_logs_skill_occurred_idx on public.training_logs (skill_id, occurred_at desc);
create index notes_skill_created_idx on public.notes (skill_id, created_at desc);
create index hits_skill_idx on public.hits (skill_id);
create index hits_partner_idx on public.hits (partner_id);
create index media_skill_idx on public.media (skill_id);

alter table public.skills enable row level security;
alter table public.partners enable row level security;
alter table public.training_logs enable row level security;
alter table public.notes enable row level security;
alter table public.hits enable row level security;
alter table public.media enable row level security;

create policy "Users can manage own skills"
  on public.skills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own partners"
  on public.partners for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own training logs"
  on public.training_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own hits"
  on public.hits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own media"
  on public.media for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
