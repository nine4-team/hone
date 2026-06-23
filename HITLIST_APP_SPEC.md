# HitList App Spec

This captures the current MVP product model for HitList. The older HTML brief is useful concept context; this document is the working product/spec snapshot.

For product philosophy and positioning, see [docs/product/hitlist-reframe.md](docs/product/hitlist-reframe.md).

## Core Product Shape

HitList helps grapplers get better at jiu jitsu faster so they can hit more moves on their friends and rivals.

The product should be built as a mobile app.

The app is organized around specific skills the user wants to improve. It helps the user:

1. Pick a small number of skills to focus on.
2. Train those skills deliberately.
3. Hit those skills live against resistance.
4. Log successful live hits.
5. Watch each skill level up over time.

Notes, media, training logs, and partner history support that experience. They help the user remember what matters, train with more intent, and see where their hits are coming from.

## Beta Auth And Persistence

The beta app requires Supabase Auth. App data is stored in Supabase Postgres behind row-level security, with every user-owned table restricted to rows where `auth.uid() = user_id`.

The client reads only public Supabase connection values from Expo public environment variables. Service-role and secret keys must never be shipped in the app.

## Product Model

### Arsenal

The Arsenal is where all skills live.

It includes every saved skill, whether or not the user is currently focusing on it.

The Arsenal should answer:

```text
What skills do I have, and how developed are they?
```

Default sort should show the user's strongest skills first:

1. Highest level
2. Highest total hits
3. Most recently touched

The Arsenal should support:

- Search by skill name
- Filter active/inactive
- Sort by level, hits, recent activity, created date, and name
- Future grouping by position or category

Arsenal rows/cards should show:

- Skill name
- Current level
- Total hits
- Progress toward next level
- Active/inactive state
- Last touched, if it fits cleanly

Future Arsenal grouping may show skills by position or category with level markers.

### Hit List

The Hit List is the small set of active skills the user is currently trying to hit live.

Activating a skill makes it appear on the Hit List screen. Deactivating a skill removes it from that screen, but does not delete it or reset progress. Inactive skills remain in the Arsenal.

The Hit List screen is the main screen.

Hit List skill cards should show:

- Skill name
- Current level
- Hit progress toward next level
- Total hits
- A two-ring circular progress dial
- Fast log action
- Deactivate affordance, if it fits cleanly

#### Hit List Skill Dial

The Hit List skill dial has two concentric rings:

- Outer ring: current-level XP progress toward the next level.
- Inner ring: current level progress toward Level 10.

The outer ring is the primary progress ring. It uses the brand color and fills from 12 o'clock based on `xpIntoLevel / 10`.

The inner ring shows level progress. It fills from 12 o'clock based on `currentLevel / 10`.

Ring styling:

- Both rings use square/butt stroke caps, matching the Minimum Standards circular progress implementation.
- Both rings use the same stroke width.
- The two rings should sit flush with no visible gap between them.
- The level ring fill and the center `LEVEL X` text must use the same color.
- In light mode, the level ring fill should be a light or medium gray rather than black.

Center content:

- The main center signal is the skill level.
- Show `LVL X` with total XP underneath.
- Do not show `/10` text in the center.

Metadata below the skill name:

- First row: `X XP until Level Y`.
- Do not show total hits on the dashboard tile; total hits belongs on Skill Detail.

Tooltips can explain that the Hit List is the user's focused working set and that skills can be activated or deactivated from the Arsenal.

The create-skill action belongs in the persistent bottom menu as a plus button, not as a per-screen header/content button.

On Skill Detail, the persistent plus button should open quick actions:

- Log Training
- New Skill

### Levels

Each skill has visible levels from Level 0 through Level 10.

Level progress is based on a skill's total **XP**, not its raw hit count. Each hit is worth XP equal to `hit.count × belt points of the partner hit on` (white = 1 when there is no partner or no belt). A skill's XP is the sum across all its hits. It takes 10 XP per level:

```text
0-9 XP = Level 0
10 XP = +1 level
100 XP = Level 10
```

A white-belt (or unattributed) hit is worth 1 XP, so leveling against white belts matches the old "1 hit = 1 point" behavior exactly. Existing hits have no belt, so this change does not move anyone's current levels. Hits on higher belts are worth proportionally more (a black-belt hit is 5 XP), so the same number of hits levels a skill faster when earned against tougher partners.

The number is not presented as scientific. It is clean, memorable, difficult, and achievable.

The outer progress ring on Equipped Skill cards shows progress toward the next level, not progress toward Level 10. The inner progress ring shows current level progress toward Level 10.

Example (all white-belt/unattributed hits, so XP equals hit count):

```text
36 XP = Level 3
Center = LVL 3 / 36 XP
Outer ring = 6/10 XP toward Level 4
Inner ring = coarse level progress reference
Metadata row 1 = 4 XP until Level 4
```

The rings and level fill are driven by XP. The center total and "until next level" row are XP. Total hits remains a raw hit count (people hit, not points) and belongs on Skill Detail. For white belts XP and hits are identical; they diverge only once higher-belt partners are involved.

After high levels:

- Levels are unbounded.
- Continue counting total hits on Skill Detail.
- Add playful high-level titles, glows, badge treatments, or achievement names later.

Post-Level-10 naming can wait until the core level experience feels good in the app. Do not use "mastered" language for Level 10.

### Hits

A hit is a successful live execution against resistance.

Do not use separate concepts for "successful execution" and "partner hit." They are the same product concept.

Use this model:

```text
Hit
- id
- skill_id
- training_log_id nullable
- partner_id nullable
- count
- created_at
- updated_at
```

A training log can have multiple hits because the user might hit the same move on several people in one training session.

Example:

```text
Training Log: Rolling
Skill: K Guard Entry

Hits:
- Alex x2
- Jordan x1
- Sam x1
- Unattributed x3
```

For fast logging, the user should be able to enter an unattributed hit count.

For detailed logging, the user should be able to add partner-attributed hit rows.

## Navigation

Primary bottom navigation should stay focused on:

- Hit List
- Partners
- Arsenal
- Settings

The Hit List tab is the user's active skills board. Partners stay as the fourth nav tab and are no longer linked from Settings.

There should not be a standalone Pipeline tab in the HitList MVP. Levels provide the main progress system, and the Arsenal provides the whole-skill-set view.

## Skill Detail

Skill Detail is the full record for a skill.

Sections:

- Header
- Level Progress
- Hits
- Media
- Notes
- Training Logs

Header should include:

- Skill name
- Current level
- Total hits
- Active/inactive control

Skill Detail should keep the persistent bottom navigation visible.

## Hits

Skill Detail should include a Hits section that aggregates hits by partner.

This is the skill-specific hit view: the people the user has hit this skill on.

Example:

```text
K Guard Entry Hits

Alex          8
Jordan        4
Sam           2
Unattributed 11
```

Partner Detail should show the inverse view: all skills hit on that partner.

## Notes

Notes are timestamped user-authored observations attached to a skill.

Notes can be standalone or linked to a training log.

Use this model:

```text
Note
- id
- skill_id
- training_log_id nullable
- body
- created_at
- updated_at
```

If `training_log_id` is null, the note is a standalone note.

If `training_log_id` is present, the note was created as part of a training log.

The Notes section on Skill Detail should show all notes for the skill, including notes linked to training logs.

Quick note creation belongs inside the Notes section, not as a separate Add Note section.

Notes should be editable after creation, including notes generated through training logs.

Notes and history are different. Notes are user-authored observations. History is system activity.

## Training Logs

Training logs are per skill.

A training log records practice/evidence for one skill at a point in time.

Use this model:

```text
TrainingLog
- id
- skill_id
- type
- occurred_at
- duration_minutes nullable
- created_at
- updated_at
```

Training log types:

```text
Study
Dialogue Drilling
Constraint Game
Rolling
```

Training log types describe what happened during a session. They are not skill stages and should not be treated as a pipeline.

Notes created during training logging should be real Note objects linked to the TrainingLog.

A TrainingLog can have zero, one, or many linked Notes.

Training logs should be editable after creation. Editing should allow correcting at least type, duration, linked notes, and linked hits. The edit affordance should be visible on each Training Log object card in Skill Detail.

## Partners

Partner is a real object.

Partners exist so users can see what they have hit on someone across time.

Use this model:

```text
Partner
- id
- name
- belt nullable
- created_at
- updated_at
```

### Partner Belt

A partner's belt sets how much XP each hit on that partner is worth (see Levels). Belt is optional; a missing belt is treated as white.

Belt is a single field on the partner profile. It uses one enum covering adult and kids ranks, each mapped to a point value:

```text
Adult:  white 1   blue 2   purple 3   brown 4   black 5
Kids:   white 1.0  grey 1.2  yellow 1.4  orange 1.6  green 1.8
```

Kids belts have no stripe variants. Kids values sit between adult white and adult blue, so a kids belt is always worth more than a default (white) hit and less than an adult blue.

Belt is editable on the partner detail screen. Partners created inline while logging start at white and can have their belt set later. Editing a partner's belt re-derives that partner's hit XP everywhere, including past hits — belt is never frozen onto a hit at log time, so users are not penalized for setting a belt late or correcting a mistake.

Only saved partners carry a belt. A hit against an unattributed or ad-hoc (typed, unsaved) partner counts as white.

**Coming soon — user belt.** The user's own profile will also carry a belt. It is part of the near-term plan so a user can share their profile and become someone else's partner, bringing their belt and other partner fields with them. The user's own belt does not affect their own XP (XP comes from the partner hit on); it is for display and profile sharing. The `belt` field is deliberately modeled as one field on a shared profile shape so it carries over when a user profile becomes a partner.

The app should support partner-level history:

```text
Partner: Alex

Hit on Alex:
- K Guard Entry x8
- RNC Finish x4
- Knee Cut x2

Recent:
- May 25: K Guard Entry x2
- May 18: RNC Finish x1
- May 12: Knee Cut x1
```

Partner creation should be lightweight. During logging, the user should be able to type a partner name, select an existing partner, or create a new partner inline.

## Media

Media attaches to a skill.

Supported media types:

- YouTube video
- Instagram video, if technically feasible
- Other link, if needed

MVP media should be link-only. Do not build direct user upload from device in the first version.

Users need to be able to add, edit, and remove skill media links from Skill Detail.

Media capture should feel light. Users should only need to provide or share a URL and optionally add a note. Do not require a user-authored title during media capture. Titles and thumbnails are fetched metadata, not user input.

Use this model:

```text
Media
- id
- skill_id
- type
- url
- title nullable, fetched
- thumbnail_url nullable, fetched
- notes nullable
- created_at
- updated_at
```

Media is not the same as notes, logs, or hits.

## Share Intake

Users should be able to create or enrich skills by sharing links from other apps into HitList.

Primary sources:

- YouTube
- Instagram
- Patreon
- Web browsers
- Any app that can share a URL or text containing a URL

Share intake is part of media capture. It should preserve the same MVP constraint as manual media capture: link-only, no direct device upload.

When HitList receives shared content, it should:

1. Extract a usable URL from the shared payload.
2. Normalize and classify the URL as YouTube, Instagram, or generic link.
3. Show a confirmation screen before mutating user data.
4. Let the user either create a new skill with the link attached or add the link to an existing skill.
5. Let the user add an optional note during intake.

For new skills created from shared media:

- The user must confirm or enter a skill name before saving.
- Fetched metadata may suggest a skill name, but must not silently create a skill name without user confirmation.
- The new skill should default to inactive unless the user changes that in the create flow.

For existing skills:

- The user should be able to search/select an existing skill.
- Adding shared media should use the same Media model as manual link capture.
- If metadata cannot be fetched, the app should still allow saving the link.

Normalization should be conservative. HitList should preserve the original shared text or URL internally where cheap, but the user-facing Media URL should be the normalized URL. If multiple URLs are present, the user should be asked to choose rather than the app silently selecting one.

Share intake should handle unsupported or malformed payloads gracefully by showing a recoverable state where the user can paste or edit the URL manually.

## History

History is separate from notes.

History records system events such as:

- Skill created
- Skill activated
- Skill deactivated
- Media added
- Training log created
- Hit logged
- Skill leveled up

History does not need to be prominent in the first UI, but the model should preserve important events where cheap.

## Excluded From MVP

Do not include these in the initial app build:

- Affiliate system
- Coaching layer
- Advanced analytics
- Partner quality scoring
- Direct video upload from device
- Position/category skill map
- Post-Level-10 achievement system

## Technical Direction

The app should be built with React Native / Expo.

Use the Minimum Standards look and feel.

Use Expo Router unless implementation work reveals a strong reason to change.

Supabase is the preferred backend direction over Firebase unless implementation work reveals a strong reason to change. The likely advantages are developer experience, relational data modeling, SQL migrations, and a clean fit for the app's objects: Skills, Notes, Training Logs, Hits, Partners, and Media.

Use a modular data-access layer rather than placing backend calls directly inside screens. Keep app-facing operations small and testable so user journeys can be automated with confidence.

`stage` is legacy product vocabulary. Do not carry it into new persistence work unless needed for temporary migration compatibility. Levels, active state, hits, training logs, notes, partners, and media are the beta model.
