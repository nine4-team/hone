# UI Normalization Plan

Product note: this plan predates the HitList rename and the Arsenal/Equipped Skills redesign. Use [HITLIST_APP_SPEC.md](../../HITLIST_APP_SPEC.md) as the source of truth for current navigation and product naming.

## Current Status

Completed normalization passes:

- Centralized text roles in `lib/typography.ts`.
- Added shared form controls in `components/FormControls.tsx`.
- Added shared list rows in `components/ListRow.tsx`.
- Added shared hit summary rows in `components/HitSummaryList.tsx`.
- Added shared stage presentation in `components/StageDisplay.tsx`.
- Added shared label-plus-info treatment in `components/InfoLabel.tsx`.
- Replaced one-off partner/hit display patterns on Partner screens and Skill Detail.
- Removed raw `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` usage outside `lib/typography.ts`.

## Remaining Normalization Work

### 1. Activation Switch

Decision:

- Active/inactive should be presented as a switch, not a pin icon.
- Activation is state, not a decorative pin action.
- Use the same switch treatment wherever active can be changed:
  - Active Skill cards
  - Library cards
  - Pipeline cards, if activation remains visible there
  - Skill Detail header
  - New Skill form

Current implementation:

- Uses the stock React Native `Switch` through `components/ActivationSwitch.tsx`.
- Active track uses HitList brand accent.
- Inactive track uses the neutral line color.
- Thumb uses the white surface color.

Minimum Standards custom-toggle source, if stock switch proves visually inadequate:

- `/Users/benjaminmackenzie/Dev/minimum_standards/apps/mobile/src/screens/SnapshotsScreen.tsx`
- `/Users/benjaminmackenzie/Dev/minimum_standards/apps/mobile/src/screens/standard-fields/VolumeFields.tsx`

Toggle specs to lift:

- Track: `50 x 30`
- Track radius: `15`
- Track padding: `2`
- Thumb: `26 x 26`
- Thumb radius: `13`
- Active track: brand accent `#987e55`
- Inactive track: neutral border/input color
- Thumb: white surface with subtle shadow/elevation

Implemented:

- Created shared `ActivationSwitch`.
- Replaced the pin icon in `SkillCard`.
- Replaced the pin icon in Skill Detail header.
- Replaced the native green `Switch` in New Skill.

Simulator note:

- Initial simulator review shows the stock switch is readable and correctly uses the brand accent.
- It is visually larger than the old pin icon on skill cards. Keep it for now unless the next design review decides the custom Minimum Standards geometry is worth lifting.

### 2. Final Header Pass

Review all `Screen` header variants after activation switch lands:

- Root tab screens
- Skill Detail
- Partner Detail
- New Skill modal
- Log Training modal

Goal:

- Same back affordance behavior.
- Same title centering behavior.
- Info tooltip placement uses `InfoLabel` so target text and icon share one horizontal centerline with a fixed token gap.
- No native headers mixed with app headers.

Implemented:

- Root `Screen` header info now uses `InfoLabel`.
- Pipeline stage descriptions now live behind `InfoLabel` instead of inline column text.

Tooltip rule:

- Do not place info icons by hand.
- Do not use absolute positioning, title-width measurement, or per-screen offsets for info tooltips.
- Pair target text and tooltip with `InfoLabel`.
- Use `InfoTooltip` only inside `InfoLabel` unless a future non-text target explicitly needs an icon-only tooltip.

### 3. Detail Screen Shared Layout Pass

Skill Detail is still the densest custom surface.

Review whether these should become shared components:

- Collapsible section header
- Composer actions
- Media card layout
- Training log card
- Note card

Do not abstract only for neatness. Abstract only if the same pattern is reused or likely to recur.

### 4. Training Log Form Refinement

The current form now uses shared controls, but the UX is still panel-heavy.

Future pass:

- Make sections feel lighter.
- Improve hit row editing/removal.
- Support editing existing training logs.
- Support correcting hit-list mistakes from source hit records.

### 5. Pipeline Interaction

Pipeline now uses shared stage display and snaps between full-width stage pages.

Implemented:

- Replaced free horizontal column scrolling with stable stage pages.
- Stages use `snapToInterval` and `disableIntervalMomentum` so users do not get stuck between stages.
- Pipeline opts out of parent vertical scrolling so horizontal swipes work across the full stage page, including empty space.
- Stage headers show directional chevrons when previous/next stages are available.

Future pass:

- Decide whether drag is required for MVP or deferred.
- If deferred, add a clear manual stage movement affordance that does not fight the Stage Detail selector.
- Keep Pipeline cards stage-free because the column provides stage context.

### 6. Token Naming Cleanup

Current `colors.sage` maps to the Minimum Standards brand accent.

Future pass:

- Rename product/color tokens to semantic names like `accent`, `accentDark`, `surface`, `surfaceMuted`.
- Avoid historical names that make future palette work confusing.
