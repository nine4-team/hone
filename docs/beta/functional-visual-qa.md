# Functional Visual QA

Functional visual QA means using the polished app like a real beta user and confirming every visible action works.

This is not a design-polish review. The question is whether the app behaves correctly through the UI a user actually sees and touches.

## Method

Use computer/device control to click, tap, type, scroll, dismiss sheets, use back gestures, and restart the app.

Run the suite on:

- iOS simulator for fast iteration.
- Android emulator for fast iteration.
- Physical iOS device before beta release.
- Physical Android device before beta release.

Capture screenshots or screen recordings for failures.

## Failure Definition

A functional visual QA failure is any case where:

- A visible action does not work.
- A screen dead-ends unexpectedly.
- Saved data does not appear where the user expects.
- Saved data does not persist.
- A route opens the wrong screen.
- A sheet cannot be dismissed.
- Back navigation is confusing or broken.
- Keyboard blocks the primary action.
- Loading/error state traps the user.
- Native share does not route into the app.
- Auth state exposes the wrong user's data.

## Journey 1: First Use and Auth

- Install app.
- Open app.
- See signed-out state.
- Sign up.
- Reach main app.
- Sign out from Settings.
- Confirm protected app data is hidden.
- Sign in again.
- Confirm main app opens.
- Restart app.
- Confirm session restores.

## Journey 2: Build My Hit List

- Create a new active skill.
- Confirm Skill Detail opens.
- Navigate to Hit List.
- Confirm active skill appears.
- Navigate to Arsenal.
- Confirm skill appears.
- Create a new inactive skill.
- Confirm inactive skill does not appear on Hit List.
- Confirm inactive skill appears in Arsenal.
- Activate inactive skill.
- Confirm it appears on Hit List.
- Deactivate an active skill.
- Confirm it leaves Hit List but remains in Arsenal.

## Journey 3: Arsenal Organization

- Open Arsenal.
- Search for an existing skill.
- Confirm matching results.
- Search for a missing skill.
- Confirm empty state.
- Clear search.
- Open filter menu.
- Select Active only.
- Select Inactive only.
- Select All.
- Open sort menu.
- Sort by Level.
- Sort by Active first.
- Sort by Recent.
- Sort by Alphabetical.
- Open a skill detail if the card supports it.

## Journey 4: Quick Log From Hit List

- Open Hit List.
- Tap quick-log action on an active skill.
- Save one unattributed hit.
- Confirm success feedback.
- Confirm hit count updates.
- Open quick-log again.
- Save partner-attributed hit with existing partner.
- Save partner-attributed hit with new partner.
- Confirm Skill Detail hit summary updates.
- Confirm Partner Detail updates.
- Restart app and confirm hits persist.

## Journey 5: Full Training Log

- Open Skill Detail.
- Tap Log Training.
- Select each training type at least once across runs:
  - Study
  - Dialogue Drilling
  - Constraint Game
  - Rolling
- Open duration picker.
- Set duration.
- Add hit row.
- Remove hit row.
- Confirm last remaining row cannot be removed.
- Select no partner.
- Select existing partner.
- Select or create new partner if available.
- Increment/decrement hit counts.
- Add note.
- Save log.
- Confirm Skill Detail shows:
  - Updated level/hit progress.
  - Training log entry.
  - Hit rows.
  - Note linked to the log.
- Restart app and confirm log persists.

## Journey 6: Skill Detail Management

- Open Skill Detail.
- Toggle active state.
- Expand/collapse More stats.
- Expand/collapse Hits.
- Expand/collapse Media.
- Expand/collapse Notes.
- Expand/collapse Training Logs.
- Add standalone hit from Hits section.
- Add note.
- Edit note.
- Add media URL.
- Edit media.
- Remove media.
- Open media URL.
- Tap bottom navigation from Skill Detail.
- Return to Skill Detail and confirm state/data are sane.

## Journey 7: Partners

- Ensure at least one partner-attributed hit exists.
- Open Partners tab.
- Confirm partner list shows hit counts.
- Open Partner Detail.
- Confirm Hits By Skill.
- Confirm Timeline.
- Collapse and expand both sections.
- Edit partner name.
- Save.
- Confirm new name appears:
  - Partner list.
  - Partner detail.
  - Skill hit summaries.
  - Future partner pickers.
- Cancel an edit and confirm no change.

## Journey 8: Share Intake

Run the detailed cases in [Share Extension Test Plan](./share-extension-test-plan.md), including:

- Share YouTube URL.
- Share Instagram URL.
- Share generic URL.
- Share text with multiple URLs.
- Create new skill from shared link.
- Add shared link to existing skill.
- Confirm saved media appears on Skill Detail.
- Restart app and confirm shared media persists.

## Journey 9: Settings and Session Behavior

- Open Settings.
- Switch Light.
- Switch Dark.
- Switch Auto.
- Navigate away and back.
- Restart app.
- Confirm preference persists if theme persistence is in scope.
- Sign out.
- Confirm no protected data is visible.
- Sign in.
- Confirm user data returns.

## Journey 10: Cross-Platform Native Behavior

iOS:

- Safe areas look correct.
- Share extension appears and works.
- Keyboard does not block saves.
- Back navigation behaves correctly.
- TestFlight build launches cleanly.

Android:

- Back button behavior is correct.
- Share intent appears and works.
- Keyboard does not block saves.
- Adaptive icon looks correct.
- Play internal build installs/updates cleanly.

## Reporting Format

For each failure, record:

- Build number.
- Platform and OS version.
- Device/simulator.
- Journey and step.
- Expected result.
- Actual result.
- Screenshot or recording.
- Severity:
  - Blocker: prevents core beta usage.
  - High: breaks a primary flow.
  - Medium: confusing but recoverable.
  - Low: minor issue.

## Exit Criteria

- All core journeys pass on iOS and Android.
- All blocker/high failures are fixed or explicitly accepted.
- Share intake passes on physical iOS and Android devices.
- Auth and persistence pass after app restart.
