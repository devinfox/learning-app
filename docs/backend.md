# Backend

API and data layer. No external services are required; it runs offline with no
setup.

## Running

```bash
npm run dev
```

The database is a folder of JSON files at `data/`, created on first request and
seeded with the subject catalog. It is gitignored and hand-editable.

```bash
curl -X POST localhost:3000/api/dev/reset   # wipe back to a fresh seed
```

Set `OPENAI_API_KEY` in `.env.local` to switch syllabus generation, lesson
authoring and the tutor over to the model. Override the model with
`OPENAI_MODEL` (defaults to `gpt-5.4`). Without a key, content comes from the
authored course packs and the tutor returns a scripted reply. Persistence,
streaming, progress and scoring behave identically either way.

There is no mail provider. Verification codes are logged to the console and
returned as `devCode` on the response outside production.

## Layout

```
data/                     one JSON file per collection
lib/
  db/                     types, file-backed store, seed
  courses/packs/          authored course content
  ai/                     OpenAI client, generation, tutor streaming
  services/               domain logic; the only layer routes call
  auth/                   sessions, password hashing, OTP
  jobs.ts                 in-process runner for generation work
app/api/                  route handlers
```

Routes parse, authorise, delegate to a service and shape the response. Swapping
the JSON store for Postgres means reimplementing `lib/db/store.ts`; nothing
above `lib/db` touches the filesystem.

## Response envelope

```jsonc
{ "ok": true,  "data": { ... } }
{ "ok": false, "error": { "code": "...", "message": "...", "details": { ... } } }
```

`details` carries per-field messages on validation failures. Codes:
`bad_request` (400), `unauthorized` (401), `email_unverified` / `forbidden`
(403), `not_found` (404), `conflict` (409), `too_many_requests` (429).

## Content generation

Three async pipelines run as detached jobs. Every generation endpoint returns
immediately; clients poll the owning resource's `status`
(`generating` -> `ready` | `failed`).

1. **Placement quiz**, generated on first request to the placement endpoint.
   The attempt opens only once the quiz is `ready`, so the timer does not start
   while the learner is waiting.
2. **Syllabus**, created when a placement submission sets a level.
3. **Lesson**, generated lazily one chapter at a time, so a new enrolment costs
   one generation rather than eight.

All three expose a `retry` endpoint. Work stranded by a server restart is
marked failed on next boot rather than spinning indefinitely.

Measured latency on `gpt-5.4`: placement quiz ~37s, syllabus ~19s, lesson ~95s.
The tutor streams first tokens in a few seconds. Set `OPENAI_MODEL` to
`gpt-5.4-mini` or lower the `effort` values in `lib/ai/generate.ts` to trade
quality for speed.

## Endpoints

### Auth

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/auth/register` | Creates the account, signs in, sends a code |
| `POST` | `/api/auth/login` | |
| `POST` | `/api/auth/social` | Google / Apple; stands in for the OAuth callback |
| `POST` | `/api/auth/logout` | |
| `GET` | `/api/auth/session` | Returns `nextStep`: `welcome` \| `verify_email` \| `basic_info` \| `select_subjects` \| `placement` \| `dashboard` |
| `POST` | `/api/auth/verify-email` | `{ code }` |
| `POST` | `/api/auth/verify-email/resend` | 429 + `retryAfterSeconds` during cooldown |
| `POST` | `/api/auth/forgot-password` | Always 200, so registered emails cannot be probed |
| `POST` | `/api/auth/reset-password` | `{ email, code, password }`; signs in, revokes other sessions |

### Profile

| Method | Path | Notes |
|---|---|---|
| `GET` `PATCH` | `/api/profile` | Name, pronouns, birth year, avatar, locale, theme |
| `POST` | `/api/profile/onboarding` | Marks the one-time flow complete |
| `POST` | `/api/profile/email` | Sends a code to the new address |
| `POST` | `/api/profile/email/confirm` | `{ code }` |
| `POST` | `/api/profile/password` | `{ currentPassword }`, sends a code |
| `POST` | `/api/profile/password/confirm` | `{ code, password }`; keeps this session, revokes the rest |

### Subjects and placement

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/subjects?q=` | Searchable catalog |
| `GET` `POST` | `/api/me/subjects` | `isNew: true` drives the `New` badge |
| `GET` `DELETE` | `/api/me/subjects/[subjectId]` | GET returns the syllabus with per-chapter progress |
| `GET` | `/api/me/subjects/[subjectId]/placement` | Starts generation; poll `quiz.status`. `attemptId` is null until ready |
| `POST` | `/api/me/subjects/[subjectId]/placement/retry` | Re-run a failed generation |
| `POST` | `/api/me/subjects/[subjectId]/placement/skip` | Beginner syllabus, take the quiz later |
| `POST` | `/api/attempts/[attemptId]/submit` | Both quiz kinds; placement also sets level and starts the syllabus |

### Course

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/syllabi/[syllabusId]` | Poll while `status` is `generating` |
| `POST` | `/api/syllabi/[syllabusId]/retry` | |
| `POST` | `/api/syllabi/[syllabusId]/chapters/[chapterId]/lesson` | Starts a lesson |
| `GET` | `/api/lessons/[lessonId]` | Interactive answers are withheld |
| `POST` | `/api/lessons/[lessonId]/retry` | |
| `PATCH` | `/api/lessons/[lessonId]/progress` | `{ slideIndex }`; only moves forward |
| `POST` | `/api/lessons/[lessonId]/complete` | Returns the quiz to offer and the next chapter |
| `GET` | `/api/lessons/[lessonId]/quiz` | Opens an attempt |
| `POST` | `/api/lessons/[lessonId]/interactives/[id]/check` | Inline practice check; not recorded as a score |
| `GET` | `/api/dashboard?subjectId=` | Whole dashboard in one request |

### Tutor

| Method | Path | Notes |
|---|---|---|
| `GET` `POST` | `/api/chats` | List / create |
| `GET` `DELETE` | `/api/chats/[chatId]` | |
| `GET` | `/api/chats/[chatId]/messages` | Full transcript |
| `POST` | `/api/chats/[chatId]/messages` | Sends a message, streams the reply (SSE) |
| `POST` | `/api/uploads` | multipart `file`; returns an `Attachment` |
| `GET` | `/api/uploads/[fileId]` | Owner only |

The message stream emits four event types:

```
event: user_message   { "message": { ... } }   the persisted user turn
event: delta          { "text": "..." }        incremental reply text
event: done           { "message": { ... } }   the persisted reply
event: error          { "message": "..." }     generation failed mid-stream
```

The assistant message is written only once the stream completes, so an
abandoned request never leaves a truncated reply in history.

## Scoring

Every question is worth 10 points, so a 6-question quiz scores out of 60.
Unanswered questions count as incorrect, since the learner can advance without
selecting. Placement maps onto a level: `<40%` beginner, `<75%` intermediate,
else advanced. Attempt duration is measured server-side from when the quiz was
fetched.

## Course packs

Authored curricula live in `lib/courses/packs/`. Each pack holds a placement
assessment and chapters with slides, inline interactives, and an end-of-lesson
quiz. Linguistics and History are written; other subjects fall back to a
generic scaffold that keeps every screen functional.

Adding a subject's content is one file plus one line in `lib/courses/index.ts`.

## Known limits

- **Single process.** The job runner and the store's write lock are in-memory,
  so this will not scale horizontally as-is.
- **Attachments are not sent to the model.** They are stored, associated with
  the message, and referenced by name in the prompt, but not uploaded.
- **`/api/auth/social` trusts its input.** It models the post-OAuth callback,
  not the handshake. Wire it to a real provider before shipping.
