# Hone

Hone is a mobile training companion for Brazilian jiu-jitsu practitioners. It
helps athletes choose a small set of techniques to develop, log successful live
executions, and see each skill progress over time.

## Product model

- **Focus:** maintain a small working set of techniques for deliberate practice.
- **Arsenal:** retain every saved technique, including skills outside the current
  focus.
- **Training logs:** record sessions, notes, media, partners, and successful live
  executions.
- **Progression:** convert logged executions into experience based on partner belt
  level and show progress toward the next skill level.
- **Partners:** preserve training history and attribution without making data entry
  mandatory for a quick log.

## Architecture

- Expo and React Native with file-based routing
- TypeScript application and domain logic
- Supabase authentication, Postgres persistence, storage, and row-level security
- SQLite support for responsive local application state
- EAS build and TestFlight distribution workflows
- Unit tests for progression, starter-skill, and training-log behavior

The domain calculations live in `lib/` and are kept separate from screens and
persistence adapters. Supabase migrations define the server-side schema, indexes,
and access controls.

## Run locally

Requirements:

- Node.js
- npm
- an Expo development environment
- a Supabase project for authenticated persistence

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set the public Supabase URL and publishable key in `.env.local`. Native builds use
an Expo development client rather than Expo Go.

## Verify

```bash
npm run check
```

This runs the TypeScript compiler and the domain test suite.
