alter table public.skills
  add column if not exists description text,
  add column if not exists hit_condition text;
