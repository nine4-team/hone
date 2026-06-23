-- Optional belt rank on partners. Drives how much XP a hit on that partner is
-- worth (white..black = 1..5; kids ranks sit between white and blue). A null
-- belt is treated as white by the app, so existing partners keep white-belt XP.
alter table public.partners
  add column if not exists belt text;

alter table public.partners
  drop constraint if exists partners_belt_check;

alter table public.partners
  add constraint partners_belt_check check (
    belt is null or belt in (
      'white', 'blue', 'purple', 'brown', 'black',
      'kids_white', 'kids_grey', 'kids_yellow', 'kids_orange', 'kids_green'
    )
  );
