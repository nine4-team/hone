# Hone App Spec

This captures the current MVP product model for the Hone app itself. The older HTML brief is useful concept context; this document is the working product/spec snapshot.

## Core Product Shape

Hone is a deliberate grappling skill acquisition app.

The product should be built as a mobile app.

The core loop:

1. Capture a skill.
2. Mark important skills as active.
3. Track each skill through the acquisition pipeline.
4. Log practice against a specific skill.
5. Preserve notes, media, hits, and partner history.

## Pipeline

Each skill has one pipeline stage:

```text
Saved -> Mechanics -> Resistance -> Proven
```

Stage definitions:

- Saved: A skill the user wants to remember or may want to work on later.
- Mechanics: The user is figuring out how the skill works: grips, frames, angles, timing, entries, finishes, common failure points, and cues.
- Resistance: The user is trying to make the skill work against opposition.
- Proven: The user can rely on the skill repeatedly under meaningful resistance.

Stage movement is manual. The primary interaction should be dragging a skill card between pipeline columns.

## Active Skills

Active skills are the user's current working set.

Active is separate from pipeline stage. A skill can be active in any stage.

The main screen should be an Active Skills screen.

Active skills need an easy activate/deactivate affordance. Activating makes a skill appear on the Active Skills screen. Deactivating removes it from the Active Skills screen, but does not delete, archive, or otherwise change the skill.

Active skill cards should show:

- Skill name
- Stage
- Last touched
- Long press to log training
- Activate/deactivate affordance

The create-skill action belongs in the persistent bottom menu as a plus button, not as a per-screen header/content button.

On Skill Detail, the persistent plus button should open quick actions:

- Log Training
- New Skill

## Navigation

Primary bottom navigation should stay focused on:

- Active Skills
- Pipeline
- Settings

Library and Partners are accessed through Settings. They remain first-class product surfaces, but they should not occupy primary bottom-nav slots during the MVP.

## Pipeline View

Pipeline View shows four columns:

```text
Saved | Mechanics | Resistance | Proven
```

Pipeline cards do not need to display stage, because the column provides that context.

Pipeline cards should show:

- Skill name
- Last touched
- Activate/deactivate affordance, if it fits cleanly

## Skill Detail

Skill Detail is the full record for a skill.

Sections:

- Header
- Hit List
- Media
- Notes
- Training Logs

Header should include:

- Skill name
- Stage
- Activate/deactivate affordance using the same pin icon language as skill cards
- Stage movement affordance

Skill Detail should keep the persistent bottom navigation visible.

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

Notes created during training logging should be real Note objects linked to the TrainingLog.

A TrainingLog can have zero, one, or many linked Notes.

Training logs should be editable after creation. Editing should allow correcting at least type, duration, linked notes, and linked hits. The edit affordance should be visible on each Training Log object card in Skill Detail.

## Hits

A hit is a successful execution.

Do not use separate concepts for "successful execution" and "partner hit." They are the same product concept.

Use this model:

```text
Hit
- id
- skill_id
- training_log_id
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

## Partners

Partner is a real object.

Partners exist so users can see what they have hit on someone across time.

Use this model:

```text
Partner
- id
- name
- created_at
- updated_at
```

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

## Hit List

Skill Detail should include a Hit List section that aggregates hits by partner.

Example:

```text
K Guard Entry Hit List

Alex          8
Jordan        4
Sam           2
Unattributed 11
```

Partner Detail should show the inverse view: all skills hit on that partner.

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

## Library

The app should have a Library from the start.

Library is the place to find skills outside the Active Skills screen and beyond the Pipeline View.

It should support:

- Search by skill name
- Filter by stage
- Filter active/inactive
- Sort by last touched, created date, or name

## History

History is separate from notes.

History records system events such as:

- Skill created
- Stage changed
- Skill activated
- Skill deactivated
- Media added
- Training log created

History does not need to be prominent in the first UI, but the model should preserve important events where cheap.

## Excluded From MVP

Do not include these in the initial app build:

- Affiliate system
- Coaching layer
- Advanced analytics
- Automatic stage movement
- Partner quality scoring
- Current focus / focus lifecycle system
- Direct video upload from device

## Technical Direction

The app should be built with React Native / Expo.

Use the Minimum Standards look and feel.

Use Expo Router unless implementation work reveals a strong reason to change.

Supabase is the preferred backend direction over Firebase unless implementation work reveals a strong reason to change. The likely advantages are developer experience, relational data modeling, SQL migrations, and a clean fit for the app's objects: Skills, Notes, Training Logs, Hits, Partners, and Media.
