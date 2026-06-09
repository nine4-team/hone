alter function public.set_updated_at() set search_path = '';

drop policy "Users can manage own skills" on public.skills;
drop policy "Users can manage own partners" on public.partners;
drop policy "Users can manage own training logs" on public.training_logs;
drop policy "Users can manage own notes" on public.notes;
drop policy "Users can manage own hits" on public.hits;
drop policy "Users can manage own media" on public.media;

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

create index training_logs_user_idx on public.training_logs (user_id);
create index notes_user_idx on public.notes (user_id);
create index notes_training_log_idx on public.notes (training_log_id);
create index hits_user_idx on public.hits (user_id);
create index media_user_idx on public.media (user_id);
