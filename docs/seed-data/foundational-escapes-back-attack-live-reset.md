# Foundational Escapes + Back Attack Live Reset

Applied to `ben.mackenzie@gmail.com` on 2026-06-23 in Supabase project
`mmtdlutpnfafkszyybja`.

## Source Packs

- `escape-basics`
  - Side Control Escape
  - Mount Escape
  - Back Escape
- `back-attack-basics`
  - Snapdown
  - Go-behind
  - Back Take vs Turtle

Rear Naked Strangle was intentionally excluded.

The live reset recreated the six skills from the pack templates and attached the
pack media notes:

- Side Control Escape: 1 media item
- Mount Escape: 1 media item
- Back Escape: 3 media items
- Snapdown: 1 media item
- Go-behind: 1 media item
- Back Take vs Turtle: 1 media item

## Loaded Totals

| Skill | Raw hits | XP | Level | XP into level | Logs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Back Escape | 35 | 88 | 8 | 8 | 5 |
| Side Control Escape | 29 | 67 | 6 | 7 | 5 |
| Mount Escape | 66 | 166 | 16 | 6 | 14 |
| Go-behind | 20 | 43 | 4 | 3 | 3 |
| Snapdown | 16 | 32 | 3 | 2 | 3 |
| Back Take vs Turtle | 13 | 24 | 2 | 4 | 3 |

## Account Row Counts

- Skills: 6
- Partners: 6
- Training logs: 34
- Notes: 34
- Hit rows: 66
- Media: 8
- Skill pack imports: 2
- Skill pack import items: 6

## Partners

| Partner | Belt |
| --- | --- |
| Alex | Blue |
| Jordan | Purple |
| Sam | White |
| Priya | Brown |
| Casey | Blue |
| Morgan | White |

## Production Schema Note

Production was missing the additive `skills.description` and
`skills.hit_condition` columns already present in the repo migration
`20260611000000_add_skill_description_hit_condition.sql`. That migration was
applied before the reset so the seeded skills could keep descriptions and hit
conditions.

## Follow-up Changes

- `test@example.com` was deleted after the simulator was no longer needed.
- Mount Escape was expanded with realistic positional and rolling history to
  166 XP, which is Level 16 with 6 XP into the level.
- Back Take from Turtle Top was renamed to Back Take vs Turtle.
