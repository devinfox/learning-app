# Study buddy

The tutoring companion. Four layers: a band layer that sets how it speaks, a
memory layer that accumulates what works for a specific learner, an analyzed
brief for the material being tutored, and an assembly step that turns all of it
into a single prompt.

Lives in `lib/tutor/`. The orb is `components/domain/Companion.tsx`.

## File map

```
lib/tutor/
  types.ts          GradeBand, TutorSurface, TutorState, LearnerMemory, CourseBrief
  config.ts         switches, memory thresholds
  bands.ts          the four bands: profile + voice per band
  safeguarding.ts   prompt rules + escalation screen
  memory.ts         record / reinforce / retire / extract / format
  course-brief.ts   the job that reads a course and briefs itself
  context.ts        assembleTutorContext()
  prompt.ts         buildTutorSystemPrompt() + greetingFor()
  index.ts
```

`lib/ai/tutor.ts` is transport only: it takes an assembled context plus a
transcript and streams tokens.

## Grade bands

One learner attribute drives register, analogy sourcing, reply length and
safety posture. Everything downstream reads the profile rather than branching on
the band, so adding a band is one entry in `BAND_PROFILES`.

| Band | Ages | Max reply | Voice |
|---|---|---|---|
| `elementary` | 5-10 | 4 sentences | warm, plain, patient |
| `middle` | 11-13 | 6 | a slightly older friend who is into this |
| `high` | 14-18 | 7 | a sharp study partner who does not pad |
| `college` | 18+ | 8 | a capable peer, comfortable with the technical term |

The band defaults from `profile.birthYear` via `bandForBirthYear`. Any request
can override it, which is how the Pet / Companion / Assistant setting works.

## Surfaces

Where the learner activates the buddy changes its job for that turn.

| Surface | Behaviour |
|---|---|
| `lesson` | Stays close to the slide on screen. Short replies. |
| `reading` | Helps them read the passage rather than replacing it. Points at the text. |
| `practice_test` | Will not give or confirm an answer. Clarifies, defines, asks leading questions. |
| `review` | Direct about right and wrong. Focuses on misses, names patterns. |
| `free` | Asks what they need before launching in. |

The active question is injected on `practice_test` explicitly marked
do-not-answer.

Re-send `activation` on every message, not just at activation, or a mid-test
turn loses its rules.

## Learner memory

| Kind | Records |
|---|---|
| `analogy` | An explanation that landed, and the concept it unlocked |
| `interest` | Something they care about, used for future analogies |
| `misconception` | A specific wrong model, plus the correction |
| `strength` | Picks up fast; do not over-explain |
| `struggle` | Recurring difficulty; slow down |
| `preference` | How they like to be taught |

**Extraction.** After a reply resolves, and outside its path so it adds no
latency, a cheap model call reads the exchange and extracts anything worth
keeping. Extraction is instructed that returning nothing is the common, correct
outcome, and that it records observations rather than inferences.

**Reinforcement.** A repeat observation merges rather than duplicating.
Confidence moves toward 1 asymptotically and `reinforcedCount` increments.

**Ranking.** Memories are filtered by confidence floor and staleness, then
scored by confidence plus reinforcement, with a boost for the subject in play
and for `interest`, which travels across subjects. Capped at 12 per turn.

Memories are visible and deletable via `GET /api/tutor/memories` and
`DELETE /api/tutor/memories/[id]`. They are soft-deleted rather than dropped so
a correction stays auditable.

## Personal context

The buddy also remembers what a learner tells it about themselves. Three kinds,
split by how long the memory should live.

| Kind | Horizon | Expires | Example |
|---|---|---|---|
| `plan` | episodic | 21 days after the event | "Going to the lake house this weekend" |
| `life` | episodic | 120 days | "Plays left mid, team was undefeated" |
| `circumstance` | enduring | never | "Told me in March that his grandad died" |

### Follow-ups

A `plan` carries a `followUpAt`, estimated by the extractor from what was said
("this weekend" becomes 2 days). Once that date passes, `claimDueFollowUps()`
surfaces it into the prompt with an instruction to open the reply by asking how
it went.

- **Claimed on read.** The claim sets `followedUpAt`, so each plan is raised
  once.
- **Start of conversation only.** Gated on `exchangeCount <= 1`.
- **A spent plan stops reaching the prompt.** It stays in the record for audit
  but is filtered out of `memoriesForPrompt`.

`FOLLOW_UP_WINDOW_DAYS` is 10. A follow-up older than that lapses rather than
being asked late.

### Circumstance

Never expires, never filtered by confidence or staleness, and sorted first in
the prompt under a heading telling the buddy to read it before anything else.

The extractor is told to record these factually and in the learner's own terms:
never diagnose, never soften, never speculate, and never infer a family
situation from a mood.

### Privacy

`GET /api/tutor/memories` returns every note including `horizon`, `expiresAt`
and `sensitive`. `DELETE` retires any of them.

The extractor is instructed never to store an address, school name, phone
number, or anyone's full name.

`detectEscalation` in `safeguarding.ts` currently only logs. Since the system
records disclosures of bereavement and illness, routing that to a human must be
wired before this is put in front of minors.

## Course brief

Runs once as a job against all available material (subject, syllabus, every
generated lesson's prose) and produces:

- `overview`, what the course covers and where it is going
- `bigIdeas`, the 3-6 things everything hangs off
- `throughLines`, ordered; what each part assumes from earlier parts
- `keyTerms`, with plain-language glosses
- `commonMisconceptions`, with corrections
- `analogySeeds`, everyday things the material resembles
- `probeQuestions`, questions that reveal real understanding

The prompt tells it to bring outside knowledge, fill gaps the material leaves,
and flag claims that are contested or outdated. Cached per subject/syllabus and
injected as prompt context every turn.

With no API key configured it still writes a thin brief from the authored
structure, so the buddy has course-level context.

## Context

There is one tutor for the whole learner, not one per subject.

`assembleTutorContext` builds a `LearnerRecord` covering every course the
learner is enrolled in, each with its full chapter list marked done or not done,
mastery tiers and level, plus their week rhythm and the rewards they have earned
with reasons attached. The course currently on screen is listed first and
flagged, but it is a focus rather than a filter, and the prompt states that
every listed course is available whichever one is open.

Reward reasons are included because "went back to a quiz that had not gone well"
describes how to teach a learner better than a score does.

## Conversation drift

Off-topic conversation is allowed. Safeguarding rules apply to genuinely serious
ground, not to ordinary chat.

The counterweight is the drift rule. `exchangeCount` is passed into the prompt,
and past roughly 14 messages the instruction sharpens: if the recent stretch has
been off-topic and is not going anywhere, answer briefly and offer the turn back
by name in the same message.

Two things override it: something that genuinely matters to the learner, and
their having just said they do not want to work right now. The offer is made
once.

This block sits last in the prompt. Placed mid-prompt it was consistently
ignored.

## Speech text

Text-to-speech reads the characters it is handed. `**1830**` produces a noise at
the asterisks rather than emphasis. Backticks click, hashes are read or
swallowed, and a `- ` list marker runs each item into the previous sentence with
no pause.

Two defences, in order:

1. **The model is told not to write markdown at all.** Plain prose, ordinary
   punctuation, several things given as a sentence rather than a list.
2. **`speechText()` strips whatever slips through**, in
   `lib/tutor/speech-text.ts`, applied in `speak()` before the synthesis call.
   It also converts list items into sentences, since dropping the marker alone
   removes the pause the line break carried.

Only the spoken copy is normalised. What the model wrote is stored and shown.

## The orb

`<Companion state={...} />` maps `TutorState` onto the four Lottie rigs in
`public/orb/` (shared face and body, different energy effects):

| State | Lottie | Speed | When |
|---|---|---|---|
| `idle` | Idle · Star | 1x | present, waiting |
| `listening` | Trail | 0.85x | mic open |
| `thinking` | Orbit | 1x | request in flight |
| `speaking` | Dash | 1x | TTS playing |
| `celebrating` | Dash | 1.4x | reward unlock |

The player prefetches all four JSONs, crossfades on state change, mutes the rig
mouth, and draws an SVG viseme mouth over the face with the audio playhead as
the master clock. The flat `Orb` SVG is the zero-cost stand-in for cards and
nav; hero surfaces use `DressedOrb live` or `Companion` directly.

## API

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/tutor/activate` | Open with context. Returns `chatId`, a surface-appropriate greeting, and what it knows. |
| `POST` | `/api/chats/[chatId]/messages` | Send a turn. Include `activation` so surface rules persist. Streams SSE. |
| `GET` | `/api/tutor/memories` | Everything recorded about the learner. |
| `DELETE` | `/api/tutor/memories/[id]` | Retire a note. |
| `POST` `GET` | `/api/tutor/brief` | Kick off / read the course analysis. |

## Safety

`safeguarding.ts` injects rules into every prompt, strictest for minors: never
claim to be human, never create obligation, never arrange to meet or continue
elsewhere, never keep a learner's secret, redirect anything serious to a trusted
adult.

It also screens learner input for disclosures such as self-harm, abuse or not
being safe at home. It over-triggers deliberately, since a false positive only
routes a message to a human.

`detectEscalation` currently logs a warning and nothing else. Routing an
escalation to a designated contact is not implemented in `lib/services/chat.ts`.
Who receives an escalation is a policy decision for the deploying district, and
it must be wired before the buddy is put in front of a child.

## Switches

In `lib/tutor/config.ts`, all code constants rather than environment variables:

| Switch | Effect |
|---|---|
| `TUTOR_ENABLED` | Master. Off returns a fixed unavailable message. |
| `COURSE_ANALYSIS_ENABLED` | Gates the brief job separately. |
| `LEARNER_MEMORY_WRITE_ENABLED` | Off still reads existing memories but records nothing new. |

Tuning: `MEMORY_CONFIDENCE_FLOOR` 0.4, `MAX_MEMORIES_IN_PROMPT` 12,
`MEMORY_STALE_AFTER_DAYS` 120.

## Cost

Each turn is one streaming conversation call at `effort: "low"` plus one cheap
extraction call afterwards. The expensive analysis happens once, in the course
brief. Extraction runs after the reply resolves, so it adds no latency to what
the learner sees.
