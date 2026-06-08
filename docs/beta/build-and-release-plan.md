# Build and Release Plan

This plan covers getting HitList built, signed, installed, and distributed for beta on both iOS and Android.

Expo SDK 56 docs should be checked before implementation work that touches Expo/EAS config. The repo's `AGENTS.md` requires using the exact versioned docs at `https://docs.expo.dev/versions/v56.0.0/`.

## Goals

- Produce reliable iOS and Android builds.
- Support fast internal smoke builds.
- Support real beta distribution through TestFlight and Google Play internal testing.
- Make build steps repeatable enough that QA can happen on known build numbers.

## Current State

- `app.json` defines:
  - iOS bundle identifier: `com.benjaminmackenzie.hitlist`
  - Android package: `com.benjaminmackenzie.hitlist`
  - URL scheme: `hitlist`
  - `expo-sharing` config for both platforms
- `package.json` includes Expo SDK 56 dependencies.
- There is no `eas.json` in the repo yet.

## EAS Distribution Strategy

Use two distribution paths:

- EAS internal distribution for fast installable smoke builds.
- Store-backed beta distribution for the actual beta group.

EAS internal distribution means Expo creates installable app binaries and provides install links.

- Android: installable APK.
- iOS: ad hoc IPA that only works on registered Apple devices.

For the real beta:

- iOS should ship through TestFlight.
- Android should ship through Google Play internal testing.

## Build Profiles

Add `eas.json` with at least:

- `development`
  - Uses development client.
  - For local/native debugging.
- `preview`
  - Internal distribution.
  - For QA smoke builds and quick tester installs.
- `production`
  - Store/TestFlight-ready build.
  - Auto-increments build numbers if desired.

## Phase 1: Local Tooling

- Verify Node version is compatible with Expo SDK 56.
- Verify package install from a clean checkout.
- Run Expo dependency validation.
- Confirm native build requirements for iOS and Android.
- Confirm Expo account access.
- Confirm Apple Developer and Google Play Console access.

## Phase 2: EAS Setup

- Run EAS project initialization.
- Add `eas.json`.
- Decide app version and build-number policy.
- Configure iOS credentials.
- Configure Android credentials.
- Confirm bundle ID/package ownership.
- Confirm app icons and splash assets.

## Phase 3: Preview Builds

- Build iOS preview.
- Build Android preview.
- Install both on physical devices.
- Confirm:
  - App launches.
  - Splash/icon look correct.
  - App can reach backend environment.
  - Auth works.
  - Share extension is present.

## Phase 4: Store Beta Builds

iOS:

- Create or confirm App Store Connect app record.
- Build production iOS binary.
- Submit to App Store Connect.
- Enable TestFlight internal testers.
- Add external testers later if needed.

Android:

- Create or confirm Play Console app record.
- Build production Android artifact.
- Upload to internal testing.
- Add tester group.
- Confirm install/update path.

## Required Build Checks

Before any beta candidate:

- TypeScript check passes.
- Unit/integration tests pass.
- Functional visual QA critical journeys pass on at least one simulator/emulator.
- Share intake smoke test passes.
- App installs on a physical iOS device.
- App installs on a physical Android device.

## Open Decisions

- Use EAS remote app versioning or repo-managed versions?
- Ship first beta through EAS internal links, stores, or both?
- Require separate staging and production Supabase projects?
- Which testers need iOS ad hoc access before TestFlight?
