# HitList Reframe

Created: 2026-05-28

Status: product direction note

Raw source: [docs/raw-thoughts/2026-05-28-hitlist-reframe.md](../raw-thoughts/2026-05-28-hitlist-reframe.md)

## One-Line Direction

**HitList** helps grapplers get better at jiu jitsu faster so they can hit more moves on their friends and rivals.

HitList is a deliberate practice app with a clear, motivating scoreboard: successful live executions against resistance.

## Working Tagline

**Get better at jiu jitsu faster. Hit more moves on your friends and rivals.**

## Product Hierarchy

**Core promise:** Get better at jiu jitsu faster.

**Mechanism:** Deliberate practice on specific, trackable skills.

**Metric:** Successful live executions against resistance.

**Emotional payoff:** Hit more fun, annoying, beautiful stuff on your friends.

**Product loop:** Pick a skill, train it deliberately, hit it live, level it up.

## Core Thesis

A **hit** is the most honest progress metric for a jiu jitsu skill.

Notes, videos, drilling, and training plans all matter, but they are inputs. The output is whether the user can execute the skill against resistance.

Important nuance:

- 100 hits on beginners is not the same as 100 hits on black belts.
- Opponent quality matters, but the app should not try to solve that perfectly in the MVP.

## Product Philosophy

**Problem:** Grapplers often improve slower than they could because training lacks sustained, deliberate focus on specific skills.

**Goal:** Get better at jiu jitsu faster.

**Mechanism:** Sustained deliberate practice on specific, trackable skills.

**Target:** Live hits give the user something concrete to chase, which motivates more intentional study, drilling, troubleshooting, games, and attempts in rolling.

**Signal:** Live hits show whether the skill is becoming usable against resistance, and help the user decide how to adjust practice.

**Metric:** Successful live executions against resistance.

**Emotional payoff:** Hit more fun, annoying, beautiful stuff on friends and rivals.

### Product Jobs

1. **Focus the work**  
   Help the user choose a small number of skills and sustain attention on them over time.

2. **Shape the practice**  
   Help the user turn that focus into better training: study, drilling, troubleshooting, live games, and rolling with intent.

3. **Track the signal**  
   Make live hits visible so the user can see progress and adjust what they do next.

4. **Reward the result**  
   Make successful live execution feel satisfying, cumulative, and worth continuing.

## Product Shape

HitList is organized around specific skills the user wants to improve.

Each skill can have:

- A name
- Notes
- Media
- Training logs
- Hits
- Partner history
- Active/inactive status
- Level progress

The primary user experience is:

1. Pick a skill to work on.
2. Train it deliberately.
3. Hit it live against resistance.
4. Log the hit.
5. Watch the skill level up over time.

Notes, media, training logs, and partner history support that experience. They help the user remember what matters, train with more intent, and see where their hits are coming from.

## Levels

### Level Rule

Each skill has visible levels from Level 0 through Level 10.

```text
0-9 hits = Level 0
10 hits = +1 level
100 hits = Level 10
```

The number is not presented as scientific. It is clean, memorable, difficult, and achievable.

Hit List skill tiles use a two-ring dial.

The outer ring shows current-level hit progress toward the next level. It fills from 12 o'clock based on `hitsIntoLevel / 10`.

The inner ring shows level progress toward Level 10. It fills from 12 o'clock based on `currentLevel / 10`.

Ring styling:

- Use square/butt stroke caps, matching the Minimum Standards circular progress implementation.
- Use equal stroke width for both rings.
- Keep the rings flush with no visible gap between them.
- Use the brand color for the hit progress fill.
- Use light or medium gray for the level progress fill in light mode.
- Match the center `LEVEL X` text color to the level progress fill color.

Center display:

- Show level as the primary signal.
- Show total XP under the level.
- Do not show `/10` text.

Metadata display:

- First row: `X XP until Level Y`.
- Do not show total hits on the dashboard tile; total hits belongs on Skill Detail.

Example:

```text
36 hits = Level 3
Center = 6 HITS
Center level text = LEVEL 3
Outer ring = 6/10 toward Level 4
Inner ring = 3/10 toward Level 10
Metadata row 1 = 4 hits until Level 4
Metadata row 2 = 36 total hits
```

### UI Implication

Hit List skill tiles should show:

- Skill name
- Current level
- Hit progress toward next level
- Total hits
- A two-ring circular progress dial
- Fast log action

This makes the Hit List screen the user's current target board, not just a list of things they are studying.

### After Level 10

Potential easter egg territory:

- Keep official levels capped at 10.
- Continue counting total hits.
- Add playful post-Level-10 titles, glows, badge treatments, or achievement names later.

Post-Level-10 naming can wait until the core level experience feels good in the app.

Do not use "mastered" language for Level 10.

## Arsenal And Hit List

The **Arsenal** is where all skills live, regardless of whether the user is currently focusing on them.

The **Hit List** is the small set of skills the user is currently trying to hit live.

Activating a skill makes it appear on the Hit List screen. Deactivating a skill removes it from that screen, but the skill remains in the Arsenal with its notes, media, logs, hits, partner history, and level progress.

Levels communicate progress. Training log types communicate how the user worked on the skill.

The Arsenal should show whole-set skill progress. Default sorting should put the highest-level skills at the top, with filters and alternate sorting considered carefully.

Future Arsenal grouping may organize skills by position or category with level markers.

## Terminology

### App Name

Use **HitList** as the working product name.

### Arsenal

Use **Arsenal** for the full collection of skills.

This supports the metaphor:

- Skills are weapons.
- The Arsenal is the user's full collection of skills.
- The user activates a small number of skills to focus on in training.
- With Hit List skills, the user starts hunting for hits.

### Hits

Keep **hit** as the core noun. A hit means a successful execution against resistance.

## Coaches, Gyms, and Distribution

### Coach-Curated Skills

Coaches should eventually be able to build a skill in their own account and distribute it to students.

Distributed skills should include:

- Name
- Notes
- Media links
- Cues
- Training guidance

Each student gets their own copy or instance so they can log their own hits.

### Media

YouTube and Instagram links are likely enough for early coach/content workflows.

Most early coach/content workflows can use hosted video links.

### Pricing Direction

Possible tiers:

- Athlete tier: around `$9.97` or `$10/month`.
- Gym tier: around `$97/month`, giving the gym a way to distribute skills to members.

Treat these as starting hypotheses, not final pricing.

### Affiliates

Content creators are a strong distribution channel.

Possible creator loop:

```text
Watch creator's video -> Save their skill pack in HitList -> Train it -> Log hits -> Discover more creator skills
```

Affiliate/referral mechanics could fit naturally once coach-created or creator-created skill packs exist.

## Social and Gym Layer

This is promising but later-stage.

Ideas:

- See what nearby people are working on.
- Find partners who want to roll with a shared focus.
- Gym-created weekly move challenges.
- Leaderboards for gym-selected skills.
- Gym prizes or recognition for challenge participation.

Why it matters:

- Makes the app more fun.
- Gives gym owners a retention/attendance story.
- Turns individual progress into a shared training game.

Start with gym-scoped challenges if/when the app has accounts and organizations.

## Copy and Positioning

### Tone

The product should be serious about getting better, but not self-serious.

The emotional truth:

```text
We do jiu jitsu because it is fun to hit cool, annoying, embarrassing moves on our friends.
```

The app helps users do that through deliberate practice, volume, better feedback, and focused training.

### Argument To Make

The marketing site or onboarding should argue:

- Hits are the clearest progress metric.
- Getting more hits requires both volume and quality of practice.
- Quality practice includes study, dialogue drilling, constraint games, and live rolling.
- HitList helps users connect those inputs to the outcome they actually care about.

### Possible Story Material

Use with care:

- Craig Jones / B-Team hit reels as proof that elite grapplers can repeatedly hit signature moves on excellent opponents.
- Personal stories about embarrassing misses or memorable hits.
- The contrast between "studying moves" and actually getting them live.

Needs factual verification before publishing:

- Any current records, names, achievements, or topical references.
- Any direct claims involving specific athletes or teams.

## Preloaded Hits

Users may want to start with an existing count for skills they already use.

This reduces friction for experienced users who already have real live reps with a skill.

Allow an optional starting count later, framed as an estimate.

Possible UI:

```text
Starting hits
[ 25 ]

Use your honest best estimate for live successful executions against resistance.
```

Avoid heavy-handed certification language. A light honesty nudge is enough.

## Triage

### Now

- Adopt HitList as the working product direction in docs.
- Make hits and levels the primary progress model.
- Keep "hit" defined as successful execution against resistance.
- Use Arsenal as the home for all skills.
- Use Hit List as the main focused working set.

### Next

- Update the app spec around the HitList direction.
- Sketch the revised Hit List screen around level dials.
- Define exact level calculations and copy.
- Decide the first-pass Arsenal filtering and sorting controls.
- Update onboarding and marketing copy around the hit thesis.

### Later

- Coach-created skill distribution.
- Creator affiliate skill packs.
- Gym tier and gym challenges.
- Local/gym social matching.
- Badges, achievements, and post-Level-10 visual flourishes.
- Optional preloaded hit estimates.

## Open Questions

- Does Level 1 begin at 0 hits or after the first 10 hits?
- Should training log types stay as Study, Dialogue Drilling, Constraint Game, and Rolling?
- Should users be able to set custom hit targets, or should the app stay opinionated at 10 hits per level?
- What are the minimum useful Arsenal filters and sorts for MVP?
- What is the smallest gym feature that proves the retention/attendance value?
