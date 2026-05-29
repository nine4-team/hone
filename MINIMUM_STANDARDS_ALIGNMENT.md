# Minimum Standards Alignment

Working notes for aligning HitList's mobile UI with the local Minimum Standards app and `nine4_ui_kit`.

## Source

- Minimum Standards app: `/Users/benjaminmackenzie/Dev/minimum_standards/apps/mobile`
- Shared UI kit: `/Users/benjaminmackenzie/Dev/nine4_ui_kit/src`

## Tokens

- Screen background: `#f7f8fa`
- Chrome/card/surface background: `#fff`
- Primary text: `#111`
- Secondary text: `#666`
- Tertiary text: `#999`
- Secondary border: `#e0e0e0`
- Brand accent: `#987e55`
- Accent surface: `#F5F3EF`
- Screen padding: `16`
- Card list gap: `12`
- Card padding: `16`
- Card radius: `12` to `16`

## Patterns To Preserve

- Cards should clearly read as cards: white surface, border, slight shadow when useful, stable radius.
- Primary actions can be visible. Secondary actions should not become repeated loud text buttons.
- Icon buttons are plain touch targets, not bordered mini-cards inside cards.
- State is communicated by accent color, not extra labels where the icon is clear.
- Section labels are small, restrained, and useful only when they clarify the surface.
- Typography is utilitarian: screen headers are not marketing hero headers.
- Lists should use consistent gutters and vertical rhythm.

## Semantic Text Roles

Skill cards should use semantic text roles rather than local arbitrary font choices:

- `skillCardName`: primary identity; strongest text in the card.
- `skillCardFocusLabel`: label for the current training lens.
- `skillCardFocusValue`: secondary content; more readable than metadata, quieter than the name.
- `skillCardMetaLabel`: label for operational metadata.
- `skillCardMetaValue`: tertiary metadata value.

Current implementation lives in `lib/typography.ts`.

Shared components and Skill Detail should consume centralized text roles instead of declaring local `fontSize`, `fontWeight`, or `lineHeight` values. Emphasis relationships such as a summary value being stronger than row values should be represented as named text roles, not local overrides.

As of the current pass, the shared primitives and Skill Detail have been moved onto centralized text roles. Remaining raw typography is deferred on older screens: Log Training, Partner Detail, New Skill, Settings, Arsenal, and Partners.

## HitList-Specific Decisions

- Equipped Skills is the main screen.
- Equipped Skill cards should show:
  - Skill name
  - Current level
  - Hit progress toward next level
  - Total hits
  - Two-ring circular progress dial
  - Fast log action
  - Equipped/unequipped switch using the Minimum Standards toggle pattern
- Equipped Skill dial should follow the Minimum Standards circular progress pattern: square/butt stroke caps, 12 o'clock start, equal stroke widths, and no visible gap between the hit-progress ring and level-progress ring.
- Outer ring shows current-level hit progress toward the next level. Inner ring shows level progress toward Level 10.
- Center text shows current-level hits and `LEVEL X`; lifetime hits belong in metadata below the skill name.
- Equip/unequip is core state, so it should be directly visible as a switch, not hidden in a menu.
- Skill Detail should use the same switch language as cards for equip/unequip; avoid a separate word-labeled `Equip`/`Unequip` button for the same state.
- Toggle pattern to lift from Minimum Standards:
  - Source: `/Users/benjaminmackenzie/Dev/minimum_standards/apps/mobile/src/screens/SnapshotsScreen.tsx`
  - Track: `50 x 30`, radius `15`, padding `2`
  - Thumb: `26 x 26`, radius `13`, white surface, subtle shadow/elevation
  - On track color: brand accent `#987e55`
  - Off track color: border/input neutral
- The persistent bottom menu follows the Minimum Standards pattern: a floating icon pill for primary sections plus a separate circular create button.
- Primary bottom nav is Equipped Skills, Arsenal, and Settings. Partners are reachable from Settings rather than first-level tabs.
- Destructive or less frequent actions should use a menu/sheet later.

## Deferred Alignment Work

These items are the remaining normalization/design-system work after the first alignment passes.

- Equip affordance: implemented with a shared stock React Native switch colored with the brand accent. Revisit only if simulator review shows the stock control feels materially off.
- Header treatment: continue checking pushed/modal/detail headers against Minimum Standards after the switch work lands.
- Skill Detail: continue reducing local layout special cases where shared components can carry the same semantics cleanly.
- Training Log: current form is functional but panel-heavy. Rework into a more restrained row/form pattern after the core card system is stable.
- Arsenal: replace the old Library/Pipeline surfaces with a whole-skill-set view sorted by level and hits, with careful search/filter/sort controls.
- Partner screens: now use shared rows/hit summaries, but still need final UX review once backend-backed data exists.
- Naming cleanup: color token names such as `sage` still map to Minimum Standards accent values and should be renamed to neutral/product terms to prevent future drift.
