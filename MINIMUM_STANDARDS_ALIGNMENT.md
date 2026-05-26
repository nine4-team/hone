# Minimum Standards Alignment

Working notes for aligning Hone's mobile UI with the local Minimum Standards app and `nine4_ui_kit`.

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

As of the current pass, the shared primitives and Skill Detail have been moved onto centralized text roles. Remaining raw typography is deferred on older screens: Pipeline, Log Training, Partner Detail, New Skill, Settings, Library, and Partners.

## Hone-Specific Decisions

- Active Skills is the main screen.
- Active Skill cards should show:
  - Skill name
  - Stage in the metadata row
  - Last touched
  - Long press logs training
  - Plain active-state icon with accent color when active
- Activate/deactivate is core state, so it should be directly visible as an icon, not hidden in a menu.
- Skill Detail uses the same pin icon language as cards for activate/deactivate; avoid a separate word-labeled `Activate`/`Deactivate` button for the same state.
- The persistent bottom menu follows the Minimum Standards pattern: a floating icon pill for primary sections plus a separate circular create button.
- Primary bottom nav is Active Skills, Pipeline, and Settings. Library and Partners are reachable from Settings rather than first-level tabs.
- Destructive or less frequent actions should use a menu/sheet later.

## Deferred Alignment Work

These items were identified during the first alignment pass but are intentionally deferred until Active Skills is stable.

- Header treatment: current screen headers are still louder and more left-heavy than Minimum Standards. Refactor to a calmer app-header pattern after the card/list language is settled.
- Skill Detail: still has mixed panel/card language, large title treatment, and chunky segmented controls. Rebuild after Active Skills using the shared primitives.
- Training Log: current form is functional but panel-heavy. Rework into a more restrained row/form pattern after the core card system is stable.
- Pipeline: board layout is rough and drag movement is deferred. Keep the current board as a working product surface, then revisit once Active and Detail are aligned.
- Partner screens: lower priority, but should later inherit the same card/list/header primitives.
- Naming cleanup: color token names such as `sage` still map to Minimum Standards accent values and should be renamed to neutral/product terms to prevent future drift.
