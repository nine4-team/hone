# Build and Release Plan

This plan covers getting HitList built, signed, installed, and distributed for beta on both iOS and Android.

Expo SDK 56 docs should be checked before implementation work that touches Expo/EAS config. The repo's `AGENTS.md` requires using the exact versioned docs at `https://docs.expo.dev/versions/v56.0.0/`.

## Goals

- Produce reliable iOS and Android builds.
- Support fast internal smoke builds.
- Support real beta distribution through TestFlight and Google Play testing.
- Support website beta signup links for both iOS and Android testers.
- Make build steps repeatable enough that QA can happen on known build numbers.

## Current State

- `app.json` defines:
  - iOS bundle identifier: `com.benjaminmackenzie.hitlist`
  - Android package: `com.nine4.hitlist`
  - URL scheme: `hitlist`
  - `expo-sharing` config for both platforms
- `package.json` includes Expo SDK 56 dependencies.
- `eas.json` defines development, simulator development, preview, and production build profiles.
- EAS CLI is available via `npx eas-cli@latest`.
- The current shell is not logged into Expo. Remote EAS project initialization and builds require `npx eas-cli@latest login` or an `EXPO_TOKEN`.

## EAS Distribution Strategy

Use two distribution paths:

- EAS internal distribution for fast installable smoke builds.
- Store-backed beta distribution for the actual beta group.

EAS internal distribution means Expo creates installable app binaries and provides install links.

- Android: installable APK.
- iOS: ad hoc IPA that only works on registered Apple devices.

For the real beta:

- iOS should ship through TestFlight.
- Android should ship through Google Play closed testing for the current beta, using a public Google Group for self-serve tester signup.

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

- Run `npx eas-cli@latest login`.
- Run `npx eas-cli@latest init` or `npx eas-cli@latest build:configure --platform all`.
- Confirm `extra.eas.projectId` is written to `app.json`.
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

Follow the dedicated HitList TestFlight procedure in `docs/beta/testflight-release.md`.

- Create or confirm App Store Connect app record.
- Build production iOS binary.
- Submit to App Store Connect.
- Enable TestFlight internal testers.
- After the uploaded build finishes Apple processing, attach it to external testers if needed:
  `npm run testflight:distribute:ios -- <build-number> --groups "External Testing"`.
- This external step attaches an already-uploaded build to the external group. It is separate from the upload step.

Android:

- Follow the dedicated HitList Android Google Play procedure in `docs/beta/android-play-release.md`.
- Create or confirm Play Console app record.
- Build production Android artifact.
- For the current closed beta, use the self-serve Android signup page:
  `https://hitlist.nine4.co/android-beta`.
- Keep `hitlist-android-beta@googlegroups.com` attached to the closed testing track so website users can join without manual email allowlisting.
- After production access is granted, enable open testing and simplify the website CTA to the public Play opt-in flow.
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
- Which testers need iOS ad hoc access before TestFlight?

## Current Architecture Choices

- Use one Supabase project for beta unless release risk changes.
- Keep Supabase access behind a modular repository/data layer.
- Keep EAS profiles explicit about environment variables even if they point to the same Supabase project.
