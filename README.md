# UVBrain

An adaptive tutoring app for school-age learners. A learner picks a subject,
takes a placement check, gets a syllabus, and works through lessons with a
voice-capable study buddy alongside them.

Built with Next.js 16, React 19, Tailwind 4 and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

No external services are required. The database is a folder of JSON files at
`data/`, created and seeded on first request.

```bash
curl -X POST localhost:3000/api/dev/reset       # wipe back to a fresh seed
curl -X POST localhost:3000/api/dev/seed-demo   # a grade-4 demo learner
curl -X POST localhost:3000/api/dev/seed-emma   # a kindergarten demo learner
```

## Configuration

Copy your keys into `.env.local`. Both are optional.

| Variable | Effect |
|---|---|
| `OPENAI_API_KEY` | Switches syllabus generation, lesson authoring and the tutor over to the model. Without it, content comes from the authored packs in `lib/courses/packs` and the tutor returns a scripted reply. |
| `OPENAI_MODEL` | Defaults to `gpt-5.4`. |
| `OPENAI_TRANSCRIBE_MODEL` | Defaults to `gpt-4o-transcribe`. |
| `ELEVENLABS_API_KEY` | Text-to-speech for the study buddy. Without it the buddy replies in text. |
| `ELEVENLABS_VOICE_ID` | Defaults to `21m00Tcm4TlvDq8ikWAM`. |
| `ELEVENLABS_MODEL_ID` | Defaults to `eleven_turbo_v2_5`. |

Persistence, streaming, progress and scoring behave the same with or without
keys.

## Layout

```
app/            routes and API handlers
components/ui   design-system primitives
components/domain  product components
lib/db          types, file-backed store, seeds
lib/services    domain logic; the only layer routes call
lib/tutor       the study buddy: bands, memory, briefs, prompt assembly
lib/courses     authored course packs
docs/           design system, backend, gamification, study buddy
```

`/design` renders a live gallery of the component library.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Documentation

- [`docs/backend.md`](docs/backend.md) - API surface, data layer, generation pipelines
- [`docs/brand.md`](docs/brand.md) - design tokens, contrast, typography
- [`docs/study-buddy.md`](docs/study-buddy.md) - tutor architecture
- [`docs/gamification.md`](docs/gamification.md) - the reward layer
