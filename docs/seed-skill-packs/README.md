# Seed Skill Packs

These JSON files are the editable source copy for the app's seed skill packs.
`lib/starterSkills.ts` imports them directly, so changes here affect the pack
picker and future skill-pack imports.

## Editing

- Edit one pack per file.
- Keep `slug` and each skill `key` stable once users may have imported a pack.
- Put user-facing notes on `media[].notes`, not `skills[].notes`.
- Write `media[].notes` as an array of lines. Blank lines become paragraph breaks
  when the app loads the pack.
- Start every media note with `Context:` so the starter-skill test can catch
  accidental note-format drift.
- `scrambler.json` is intentionally not shown in the app unless it is added back
  to the `skillPacks` array in `lib/starterSkills.ts`.
