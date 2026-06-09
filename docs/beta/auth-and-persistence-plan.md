# Auth and Persistence Plan

HitList needs authenticated, durable user data before beta. The current app screens are built, but the app state is currently local React state seeded from `lib/seed.ts`.

## Goals

- Users can create accounts.
- Users can sign in and sign out.
- User data persists across app restarts.
- User data is isolated by account.
- Existing screens keep their current product behavior while the data source moves behind them.

## Current State

- `supabase/schema.sql` has been finalized for beta and mirrored into `supabase/migrations/20260608000000_hitlist_beta_schema.sql`.
- The schema includes:
  - `skills`
  - `partners`
  - `training_logs`
  - `notes`
  - `hits`
  - `media`
- Tables include database-owned `user_id` defaults using `auth.uid()` and RLS policies.
- Explicit authenticated-role grants are included because newer Supabase projects may not expose new public tables to the Data API automatically.
- The React app uses `HitListProvider` in `lib/store.tsx` as the app-facing persistence boundary.
- `Settings` signs out through Supabase Auth.

## Target Architecture

- Supabase Auth for accounts and sessions.
- Supabase Postgres for durable app data.
- Client-side app state wraps Supabase reads/writes through a repository/data-access layer.
- Supabase session persistence uses the current Expo/Supabase quickstart path: `react-native-url-polyfill` plus `expo-sqlite/localStorage`.
- Route gating uses Expo Router SDK 56 protected routes (`Stack.Protected`) so unauthenticated users see auth screens, not app data.
- One Supabase project is acceptable for beta. Separate staging can come later if tester volume, production data risk, or release process complexity makes it worthwhile.

## Code Architecture Principles

- Keep UI screens free of direct Supabase query details.
- Use small functions that do one thing and can be unit-tested.
- Keep DB row mapping in one place.
- Keep `useHitList` or an equivalent app-facing hook as the screen boundary.
- Let the database be the source of truth for IDs, timestamps, and user ownership once Supabase is wired.
- Treat `stage` as legacy. Levels, active state, hits, logs, notes, partners, and media are the beta model.

## Phase 1: Supabase Project Setup

- Confirm/create the beta Supabase project.
- Apply `supabase/migrations/20260608000000_hitlist_beta_schema.sql`.
- Verify RLS policies.
- Verify authenticated API access to all tables.
- Use a single Supabase project for beta unless the release process changes.

Current implementation note: the local Codex session did not have Supabase MCP tools, `SUPABASE_ACCESS_TOKEN`, or an authenticated CLI profile, so the hosted project could not be created or migrated from this environment. The repo is ready for either `npx supabase db push` after `supabase link`, or pasting the migration SQL into the Supabase SQL editor.

## Phase 2: Auth Flow

Add screens or route group for:

- Sign up.
- Sign in.
- Sign out.
- Password reset if required for beta.
- Loading/restoring session state.

Minimum beta auth requirements:

- Email/password or magic link.
- Persisted session.
- Clean sign-out.
- Protected app routes.
- No user data visible after sign-out.

## Phase 3: Data Wiring

Replace local-only state with Supabase-backed operations for:

- Skills
- Partners
- Training logs
- Hits
- Notes
- Media

The existing `useHitList` API can remain as a compatibility boundary if that reduces UI churn.

## Phase 4: Migration From Seed Data

Decide one:

- New accounts start empty.
- New accounts get sample data inserted once.
- Development builds use seeds, beta builds start empty.

For beta, default recommendation is empty accounts plus maybe a visible sample/demo reset only in development.

## Phase 5: Data Integrity Rules

Verify these behaviors:

- Skill creation writes `user_id`.
- Active/inactive state persists.
- `last_touched_at` updates when expected.
- Standalone hits can be unattributed.
- Standalone hits do not require `training_log_id`.
- Training-log hits can be partner-attributed or unattributed.
- Partner names are deduped per user using database-generated normalized names.
- Notes can be standalone or tied to training logs.
- Training logs can be edited after creation.
- Media metadata failures do not prevent saving a URL.
- Deleting/removing entities does not orphan visible broken UI.

## Phase 6: Loading and Error States

Add user-facing states for:

- Initial session loading.
- Initial app data loading.
- Empty account.
- Save failure.
- Network failure.
- Retry after failure.

Avoid silently losing user actions. If a save fails, the user should know.

## Phase 7: Verification

Test with two accounts:

- User A creates skills, hits, partners, media, and notes.
- User B signs in and cannot see User A data.
- User A signs back in and data returns.
- App restarts preserve session and data.
- Sign-out clears protected app state.

## Beta Exit Criteria

- Authenticated user can complete all primary app journeys.
- App restart does not lose data.
- RLS blocks cross-user reads/writes.
- No screen relies on seed data to look functional.
- Settings sign-out is real.
