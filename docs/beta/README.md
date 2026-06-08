# HitList Beta Readiness

This folder defines the work required to turn the current screen-complete HitList app into a beta-ready iOS and Android product.

The app already has the main UI surfaces:

- Hit List
- Arsenal
- Partners
- Settings
- Skill Detail
- New Skill
- Log Training
- Partner Detail
- Share Intake

Beta readiness is therefore not a ground-up UI build. The remaining work is to make the existing app durable, authenticated, distributable, and verified through functional user-journey testing on both platforms.

## Critical Path

1. Build and release pipeline
2. Auth
3. Persistence
4. Share extension validation
5. Automated safety checks
6. Functional visual QA
7. TestFlight and Google Play internal beta

## Key Beta Docs

- [Build and Release Plan](./build-and-release-plan.md)
- [Auth and Persistence Plan](./auth-and-persistence-plan.md)
- [Share Extension Test Plan](./share-extension-test-plan.md)
- [Functional Visual QA](./functional-visual-qa.md)
- [Beta Release Checklist](./beta-release-checklist.md)

## Current Repo Observations

- Expo SDK 56 is in use.
- Expo Router is the app entry and navigation layer.
- `app.json` already defines iOS and Android app identifiers.
- `expo-sharing` is configured for iOS and Android share intake.
- `supabase/schema.sql` exists as a schema draft.
- App state is currently backed by local React state seeded from `lib/seed.ts`.
- No `eas.json` is currently present.
- No automated test scripts are currently visible in `package.json`.

## Beta Definition

For this beta, a tester should be able to:

- Install the app on iOS or Android.
- Create an account.
- Sign in and sign out.
- Create and manage skills.
- Log hits and training sessions.
- Attribute hits to partners.
- Add notes and media.
- Save shared links into HitList from outside the app.
- Close and reopen the app without losing data.
- Use the app without visible dead ends in primary workflows.

## Not The Goal

This plan does not treat the app as an unpolished wireframe. The product UI is already substantially built. Functional visual QA means using the polished app the way a real beta user would and confirming the visible interactions work.
