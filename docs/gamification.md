# Gamification

Two layers that do not mix: **rewards**, which record what you did, and
**points**, which score how well you are doing right now.

## Model

Rewards are granted directly by a milestone, never purchased. There is no
wallet and no shop: points buy nothing.

Points are a sport score, not a currency. They reset every Sunday, they are
derived from assessment performance, and no reward is unlocked by holding them.
Keeping the two layers separate is what lets a brass telescope still mean
"finished Weather and Water" rather than "had 400 spare points".

Rarity is specificity rather than scarcity. A telescope is awarded for
finishing *Weather and Water*, not by a roll. Collections run horizontal: two
learners have different sets, not a longer and a shorter one.

Every item on a learner's buddy traces back to a dated event.

## Layout

```
lib/gamification/
  types.ts     slots, triggers, the Reward/EarnedReward/LockedReward shapes
  catalog.ts   the 32 rewards; data only
  ledger.ts    events to earned state; pure derivation, nothing stored
  state.ts     what is equipped, room placement, opened state
  points.ts    the point rules, weekly buckets, per-source breakdown
  houses.ts    the four houses and the weekly standings
```

`Reward` carries a `trigger`. The ledger turns each trigger into three things:
whether it fired, the sentence printed under an earned item ("Finishing
Machines and Power"), and the sentence printed on a locked one ("Finish
Machines and Power").

### Derived, not stored

Unlocks are computed from the same `Progress` and `Attempt` rows that drive
mastery, on every read, matching `lib/services/mastery.ts`.

The rule is that anything a learner earned is derived and anything a learner
chose is stored. Equipping, room placement, the nickname and which rewards have
been opened live in the `companion-states` collection. Nothing else does. A
stored unlock would eventually disagree with the events that produced it.
Deriving costs one pass over a few hundred rows.

## Triggers

There is no trigger for answering correctly, answering quickly, or answering a
lot.

| Trigger | Fires on |
|---|---|
| `chapter` | Finishing a specific chapter of a specific course |
| `subject_complete` | Finishing every chapter in a course |
| `chapters_total` | N chapters finished anywhere |
| `quiz_retry` | Retaking a quiz that was not passed |
| `return_after_absence` | Coming back after 7+ days away |
| `active_weeks` | N separate weeks containing 3+ study days |
| `mastery` | Holding a chapter at Radiant or Prism |
| `lesson_thorough` | N lessons where every practice check was answered |

`quiz_retry` only counts when the previous attempt on that quiz failed. Passing
twice is revision, which is rewarded by the mastery tiers instead.

`active_weeks` counts weeks, not consecutive days, so learners without a device
at home are not penalised.

## Points

`points.ts` derives every point from `Attempt`, `Progress` and
`ProjectSubmission` rows on every read. Nothing is stored, so a balance cannot
drift from the events that produced it.

| Event | Points |
|---|---|
| Lesson finished | 10 |
| Quiz passed first time | raw score × 1.5 |
| Quiz passed on a retake | raw score × 0.6 |
| Full marks | +25, multiplied by the exam factor |
| Unit exam | × 2 |
| Final exam | × 3 |
| Project | 60, plus up to 240 more by rubric |
| Quiz sat and failed | 5, at most twice per quiz |

Three rules hold the shape and should not be relaxed:

- **A retake never out-earns a first-try pass.** Otherwise failing on purpose
  becomes the optimal strategy.
- **Only the first pass on a quiz pays.** Passing again is revision, which the
  mastery tiers reward instead. Without this, one easy quiz is a farm.
- **The effort floor is capped at two payouts per quiz.** It exists so a
  struggling learner is not on zero, not as an income stream.

Placement quizzes score nothing. They happen before any learning.

Weeks run Sunday to Sunday, matching `weekStats` in `mastery.ts`.

### Houses

Four houses — Nova, Tide, Grove, Solis — assigned by a hash of the user id, so
membership is derived rather than stored and can never disagree with itself.
A house total is the sum of its members' points this week. Competition is at
house level so a struggling learner still contributes rather than being ranked
last in public.

## Adding a reward

Add an entry to `CATALOG` in `catalog.ts`. The ledger, tiles, pickers and
celebration all read from it.

```ts
{
  id: "rw_sci_telescope",
  name: "Brass Telescope",
  blurb: "The whole of Weather and Water. Now look further up.",
  slot: "shelf",
  icon: Telescope,
  tone: "lumen",
  subjectSlug: "science-g4",
  trigger: { kind: "subject_complete", subjectSlug: "science-g4" },
}
```

Art is a lucide icon plus a brand tint, which keeps the set coherent and means
swapping in illustration later touches this file only.

## Slots

Four on the companion: `hat`, `held`, `aura`, `badge`. Five in the room:
`backdrop`, `floor`, `shelf`, `wall`, `pet`. One item per slot.

The room is a stage with fixed positions rather than a free-placement canvas.
Free placement would need drag targets, z-order, collision handling and undo.

## The pet

`Wren` sits in the room and has no state. There is no hunger, sickness or decay
loop, so a learner who was away is not penalised on return. Return pressure has
to come from the weekly rhythm and, eventually, class-level co-op goals.

## Where it surfaces

| Surface | Component |
|---|---|
| Dashboard row | `BuddyCard`, latest reward and its reason, no totals |
| Full screen | `/companion`: Look, Room, Milestones |
| On unlock | `RewardUnlock`, the only place the animated Lottie runs |
| Small everywhere | `Orb`, static SVG, no animation runtime |

The performance layer has five of its own, tied together by `ProgressNav`:

| Route | Ground | Does |
|---|---|---|
| `/results/[attemptId]` | Cosmos | the paced reveal after any assessment |
| `/progress` | Paper | mastery map, charge bars, exam entry points |
| `/scoreboard` | Cosmos | week, houses, division, point breakdown |
| `/exams/[quizId]` | Cosmos | unit and final exams, reviewable before hand-in |
| `/projects`, `/projects/[id]` | Paper | brief, rubric up front, marked result |

`/progress` and `/scoreboard` are deliberately on opposite grounds. The map is a
working view checked often; the scoreboard is an arrival.

### The arcade layer

`components/domain/Arcade.tsx` holds the motion kit these pages share:
`MeterBar` (fills from zero on mount, shines at full), `SparkBurst` (spectrum
motes), `LevelBadge`, `RankDelta`, `StreakPips`, `Podium`, `Pop` and
`useReveal`. Keyframes live in the arcade block of `globals.css`.

Everything routes through `useReveal`, which returns `true` immediately under
`prefers-reduced-motion`, so the reduced path is a real static render rather
than an animation played at 0.01ms.

**Levels** are `levelFor(total)` in `points.ts` — thresholds at
`50 · n · (n+1)`, so 100, 300, 600, 1000, 1500. They are a label on lifetime
points and unlock nothing; the weekly reset still governs competition.

The one rule for this layer: motion reports something true. A bar fills because
a number moved, a burst fires because a record broke. Decorative animation on a
screen a child checks daily becomes noise by the second week.

`Orb` and `Companion` are not interchangeable. The Lottie rig mounts a full
animation runtime, which is appropriate where a learner talks to the buddy and
wasteful for a nav item or a grid of tiles. Use `Orb` unless the buddy is
speaking or celebrating.

## Unlock reveal

`POST /api/lessons/[id]/complete` and `POST /api/attempts/[id]/submit` snapshot
the earned set before and after and return `unlocked[]`. The client shows
`RewardUnlock` before navigating on.

Quizzes and exams instead hand off to `/results/[attemptId]`, which reads
`GET /api/attempts/[attemptId]`. That route cannot diff before and after, so it
reports the rewards in `ledger.unseen` earned within a minute of the submission.

The reveal is sequenced rather than simultaneous: ring at 200ms, points at
1100ms, tier change at 1900ms, rewards at 2500ms. Under
`prefers-reduced-motion` every stage renders at once with no counting.

## Exams

`exams.ts` builds unit exams from blocks of three chapters and one final exam
per course. Questions are drawn from the chapter lesson quizzes, falling back to
the authored course pack when a lesson quiz has not been materialised, so a
course can offer exams before every lesson has been generated. When neither
source has questions the exam stays locked and says so rather than failing on
tap.

Exam quiz ids are deterministic — `exm_<syllabusId>_u2`, `exm_<syllabusId>_final`
— so retakes land on the same quiz row and the retry rules apply normally.

## Projects

`lib/projects/catalog.ts` holds authored templates per subject plus one generic
*Teach It Back* that any course gets. `services/projects.ts` materialises a
`Project` row per enrolment, gates it on completed chapters, and marks
submissions on the `grade_project` job.

Marking is AI against the rubric when `OPENAI_API_KEY` is set, and a plain
checklist grade when it is not. The UI always names which one happened;
a checklist grade must never be presented as a real mark. `TEACHER_OVERRIDE` is
the stub for human re-marking and is currently `false`.

The bar in the editor is the learner's own checklist, labelled as such. It is
not a predicted score and must not be styled as one.

## Not built

- **Class-level co-op goals.** Designed, unbuilt.
- **Age surfaces.** The model calls for K-5 pet, 6-12 companion and adult
  assistant with one override setting. Currently everyone gets the same
  companion.
- **Teacher marking.** `TEACHER_OVERRIDE` exists; no queue or teacher role does.
- **Under-13 policy review.** Points buy nothing and there is no purchasable
  currency, but nothing here has been through a COPPA review.

## Testing

`POST /api/dev/reset` then `POST /api/dev/seed-demo`. The seeded history is
tuned to fire all eight trigger kinds, including an 8-day absence and a failed
quiz retaken the next day. If you change `REVISION_DAYS` in `demo-seed.ts`,
check the absence gap survives; filling it disables `Back Again`.

`POST /api/dev/seed-emma` builds the same shape one band down at kindergarten
level. Worth checking there that only kindergarten items appear on the locked
shelf: the ledger drops locked rewards for courses a learner is not enrolled in.

`POST /api/dev/seed-classmates` adds twelve learners with attempt histories,
three per house, so the scoreboard has something to rank. Without it the
division list correctly shows a solo state rather than inventing opponents.
