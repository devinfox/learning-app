# Dungeon Dash

Build plan for the standalone game. The game is built first as a self-contained
module with a single seam to the rest of UVBrain, then wired to real accounts,
questions and rewards without rewriting the game.

## 1. What "standalone" means here

The game runs at `/arcade/dungeon-dash` inside this repo, but it imports nothing
from `lib/services`, `lib/db`, `lib/gamification` or `lib/tutor`. Everything it
needs from the outside arrives through one interface, `DungeonHost`.

During the standalone phase there is one implementation, `localHost`, backed by
authored content and localStorage. Integration later means writing a second
implementation, `apiHost`, against real routes. No game code changes.

Living in the repo rather than in a separate vanilla folder buys the design
tokens in `globals.css`, Tailwind 4, TypeScript, the motion kit in
`components/domain/Arcade.tsx`, and a clear path to the existing buddy character
in `components/domain/LottieBuddy.tsx` when it is time to back it in. A
standalone `file://` build would mean re-authoring all of that and porting later
anyway.

The route uses its own layout with no `AppShell`, no bottom nav and no session
requirement, so it is playable cold.

## 2. Rendering: Phaser for the world, React for everything readable

Phaser renders the room. React owns every piece of content a child has to read,
choose or hear. The split follows section 16 of the spec, and the boundary is
not negotiable in either direction: no question text, answer option or hint ever
lives inside the canvas, and no game logic ever lives inside a scene.

### Layers

The canvas sits in a fixed 1280x720 virtual space using
`Phaser.Scale.FIT` with `autoCenter`, so room templates place actors by virtual
coordinate and one template works at every screen size. Above it, a DOM overlay
holds the interface.

1. **Phaser canvas.** Parallax backdrop planes, actors (hero, enemies, chests,
   mechanisms, props), camera moves, particle emitters, room transitions and
   completion animations.
2. **Interface (DOM).** HUD, action tray, question panel, hint, pause, treasure
   reveal, results.

The canvas carries `aria-hidden="true"` and is never focusable. Everything a
screen reader or keyboard user needs is in layer 2. This is the single rule that
keeps Phaser from costing us accessibility.

### Mounting

`GameCanvas.tsx` is a client component that imports Phaser through
`next/dynamic` with `ssr: false`. Phaser touches `window` at module scope and
will break a server render otherwise. The instance is created on mount,
destroyed on unmount, and never recreated between rooms: rooms are scene
transitions inside one long-lived game instance, which is what keeps room-to-room
movement fast.

### The hero

The hero is the learner's own Lottie, wearing whatever they have equipped. The
placeholder gladiator remains as the fallback when the buddy cannot be built.

`createHero()` in `phaser/hero.ts` picks between them. Both return the same
`HeroParts` record of named containers (`container`, `body`, `shield`, `weapon`,
`head`, `shadow`) that `RoomScene` tweens directly, so the scene never branches
on which one it got.

For the buddy those names are a mapping rather than literal anatomy:

| Part | Buddy |
|---|---|
| `body` | the puff, hair and sparkles |
| `head` | the face plate, eyes and mouth, so the head bob drifts the face |
| `shield` | the glow, so a guard flares the aura |
| `shadow` | a drawn ellipse, which is why the body texture is exported without the baked cast shadow |
| `weapon` | an empty container, since Lottie carries nothing |

This is deliberately a mapping onto the existing contract rather than the
`HeroActor` abstraction with a `play(pose)` method that this document previously
proposed. The scene's choreography grew a lot of well-tuned detail, and
rewriting it to introduce the abstraction risked losing that for no gain the
learner can see. Extracting `HeroActor` is still worth doing, and the right
moment is when a second world needs a different hero.

### The buddy atlas

`host/buddyAtlas.tsx` renders the real `LottieBuddy` off-screen and slices it
into aligned parts. Nothing redraws the character, so the in-game avatar cannot
drift from the buddy on the rest of the site.

Parts: `glow`, `body`, `faceBase`, `eyesOpen`, `eyesClosed`, `mouthRest`,
`mouthOpen`. Every part is serialised at the same padded viewBox, so they stack
at one origin with no offset bookkeeping, and each is rasterised to a PNG data
URL. `decodeAtlas()` turns those into canvases that Phaser registers with
`textures.addCanvas`, which is synchronous and avoids an async decode inside the
scene.

The rig blinks by swapping `eyesOpen` for `eyesClosed` on a jittered 2.8 to 6.4
second timer. It runs off the scene's `update` event rather than a Phaser timer,
because the scene calls `time.removeAllEvents()` at the top of every animating
command and a timer-based blink would stop after the first move.

Four things this needed from `LottieBuddy`, all additive and all defaulting to
current behaviour: `showBody`, `showShadow`, `showEyes`, `showMouth` layer
gates, and `lidsClosed`. That last one matters more than it looks. The blink
lids default to `opacity: 0` **in CSS**, so a serialised SVG with no stylesheet
renders them opaque and every exported face comes out with its eyes shut.
Anything else that relies on CSS for its resting state will have the same
problem.

The atlas is cached per look in `localHost`, keyed on the equipped eyes, glow
and hair. Outside production, `?eyes=`, `?glow=` and `?hair=` on the run URL
override the saved look so a style can be previewed without writing to the
learner's companion state.

Known limits: the CSS bloom and the magical dust do not survive export, so the
glow is re-authored as an SVG radial gradient and the dust is dropped. SVG
filters rasterise inconsistently in Safari, and Lottie leans on them for its
fuzz and drop shadow, so the export needs checking there before this ships.

## 3. Run state machine

A hand written typed reducer, not XState.

The requirement that decides this is resume: the run state must be a plain
serializable snapshot so a refresh or a "leave Dash" restores the room the child
was in, and so the server can later validate the same shape. A discriminated
union plus an explicit transition table gives that with no runtime dependency.
If the table passes roughly thirty states, revisit XState.

States:

```
booting  loadingMission  enteringRoom  roomIntro  choosingAction
loadingQuestion  answering  showingHint  resolvingAnswer  playingMove
enemyTurn  roomOutro  choosingPath  openingTreasure  bossIntro  bossStage
buddyRescue  reviewRoom  runComplete  paused
```

Rules the machine enforces:

- Animation never blocks input for more than 600ms. Every cinematic state has a
  skip path, and every state after the first room is skippable.
- Exactly one question is in flight at a time.
- The child cannot reach a state where the run cannot continue.

**The machine lives in React and is the only authority.** Phaser scenes hold no
game state: not hearts, not enemy health, not question progress. A scene is a
renderer and an animation sequencer that is told what to play and reports when it
has finished. Hearts drawn on the canvas would eventually disagree with hearts in
the machine, and the bug would be invisible until a child saw it.

### The event bridge

One typed emitter, `gameBus`, with no untyped payloads. React commands the
scene; the scene reports facts back.

```ts
type SceneEvent =
  | { type: "ROOM_READY"; roomId: string }
  | { type: "INTRO_COMPLETE" }
  | { type: "MOVE_ANIMATION_COMPLETE"; actionId: string }
  | { type: "ENEMY_TURN_COMPLETE" }
  | { type: "TREASURE_READY" }
  | { type: "ROOM_EXIT_REACHED" }
  | { type: "SCENE_ERROR"; message: string };

type SceneCommand =
  | { type: "LOAD_ROOM"; template: RoomTemplate; seed: number }
  | { type: "PLAY_PLAYER_MOVE"; actionId: string; effectiveness: number }
  | { type: "PLAY_ENEMY_REACTION"; enemyId: string; reaction: ReactionId }
  | { type: "SHOW_HINT_EFFECT"; directive: HintDirective }
  | { type: "UPDATE_OBJECTIVE"; progress: number }
  | { type: "OPEN_DOOR" }
  | { type: "SPAWN_REWARD"; tier: LootTier }
  | { type: "SET_REDUCED_MOTION"; on: boolean }
  | { type: "TRANSITION_ROOM"; nextRoomId: string };
```

Two bridge rules, both learned the hard way in games shaped like this:

- **Every command that animates must answer with a completion event, and the
  machine must also time it out.** A dropped `MOVE_ANIMATION_COMPLETE` would
  otherwise hang the run forever. The timeout is the animation's nominal
  duration plus 500ms, and firing it logs a warning rather than failing quietly.
- **Effectiveness is passed to the scene, not derived by it.** The scene decides
  how big the fireball looks; it never decides how much damage it did.

## 4. Determinism

A run is `seed + missionId`. A seeded PRNG (mulberry32) drives room selection,
enemy variants, question parameters and loot rolls. The same seed rebuilds the
same run after a refresh.

Loot rolling goes through the host from day one, even though `localHost` rolls
it locally. When the server takes over it is the only implementation that
changes, which satisfies the rule that the browser never decides which rare item
the child won.

## 5. The rule that makes it a game and not a quiz

**Room length is fixed by the template. Answer quality changes the quality of
what happens, never whether the child progresses.**

A battle room with two questions is always two questions long. A perfect run
through it looks dramatically different from a struggling run through it, but
both end with the enemy defeated and the exit open.

This is what lets us honour "incorrect answers never abruptly end the run"
without the game becoming consequence free. The consequences are hearts, power,
loot tier and the visual size of what the child caused to happen.

### Effectiveness

Per the spec:

| Outcome | Power |
|---|---|
| Correct first try | 1.00 |
| Correct after self-correction | 0.85 |
| Correct after a hint | 0.70 |
| Incorrect after two attempts | 0.35 |
| Skipped with guided explanation | 0.20 |

Effectiveness drives four things: damage or shield magnitude, whether the enemy
counterattacks, power meter gain, and a run-level loot quality score.

### Combat numbers

Enemy resolve is authored as "question count worth of full power damage", so
tuning stays readable:

- Common enemy: 2 questions. Stronger: 3. Boss: 5 to 7 stages.
- Full power action deals exactly `resolve / questionCount`.
- Weak actions deal less, and the shortfall is cleared by a buddy assist on the
  room's final question. The assist is visible and explained, not silent.

Hearts: 4. Full power and 0.85 take no damage. 0.70 is a glancing hit with no
heart loss. 0.35 and 0.20 cost one heart. Zero hearts triggers `buddyRescue`,
which costs the bonus chest, refills to 2, routes through a short `reviewRoom`,
and continues. It is never a game over.

Power meter: fills by `effectiveness * 20`, plus a bonus 10 when a child answers
a later question on a skill they previously missed. Recovery is rewarded more
than never missing, which matches the product line about learning from tricky
questions.

## 6. Question engine

Questions are generated from authored templates, not stored as flat lists. A
template owns its parameters, its distractors and its hint ladder together, so
hint quality is guaranteed rather than generated.

```ts
interface QuestionTemplate {
  id: string;
  skillId: string;
  format: QuestionFormat;
  band: [number, number];
  generate(rng: Rng, band: number): GeneratedQuestion;
}
```

A generated question carries prompt, optional diagram spec, options, correct
index, and two hint levels.

**Distractors must be diagnostic.** For 8 x 7 the wrong options are 15 (added),
49 (wrong factor squared) and 54 (off by one row), not random numbers. Diagnostic
distractors are what make error analysis questions and targeted hints possible,
and they are what tells us which misconception a child holds.

MVP formats, three of the eight in the spec: direct fact, array image, short
word problem. The rest arrive in Phase 2.

Hint ladder, level one is a strategy nudge and level two removes an option and
shows a worked first step. Both are authored strings or structured directives
(`highlight`, `eliminate`, `regroup`, `numberLine`), rendered by `HintPanel`.

### Difficulty

Pure function over the last eight relevant attempts:

- High accuracy, no hints, fast: band up by one.
- Correct but slow: hold.
- Correct after hints: hold, and change the representation rather than the
  difficulty.
- Same misconception twice: switch format and drop to the supported variant.
- Late-run fatigue signal: shorten wording, keep the skill target.

Bands move at most one step per adjustment and never mid-room.

## 6a. Action kits

Three actions run the whole game mechanically: `attack`, `shield`, `surge`. What
they are *called* is a per-room decision, because "Interrupts an enemy that is
charging" is nonsense in a room where the child is repairing a cart track.

`content/actionKits.ts` holds the presentation layer. A kit supplies a name,
blurb and icon per action, plus an optional `tell` for the line the tray shows
when a room has no enemy to telegraph. Each `RoomTemplate` names a kit.

| Kit | attack | shield | surge |
|---|---|---|---|
| `battle` | Strike | Shield | Surge |
| `track` | Lay Plank | Brace Rail | Crystal Weld |

The split matters: the machine, the scoring and the counter rules only ever see
`ActionId`, so a kit can never change what a move does. It changes only what the
child understands themselves to be doing, which is the whole point of section 30
of the spec. Adding a kit is one entry in `ACTION_KITS` plus one field on the
room; nothing else moves.

Icons are referenced by id rather than by component so the content layer stays
free of React. `ActionTray` maps id to a lucide component.

Rooms without enemies also aim their effects at the objective rather than at a
phantom enemy slot, which is what `OBJECTIVE_X` in `RoomScene` is for.

Kits still to author as their rooms land: treasure, chase, rescue, locked door
and boss.

## 7. Room templates

Twelve for the MVP, all in Math Mines:

| Type | Count | Templates |
|---|---|---|
| Battle | 4 | single, pair, swarm of three, hidden enemy needing Reveal |
| Trap | 3 | bridge planks, swinging pendulum gate, rising gem flood |
| Treasure | 2 | standard chest, bonus chest with a harder optional question |
| Chase | 1 | mine cart with two branch points |
| Branch | 1 | two tunnels, one hinting at a secret room |
| Boss | 1 | Foreman Forty-Two, five stages |

A template declares background, spawn and exit points, actor slots, question
count, camera behaviour, environmental effect and completion animation. Rooms
are picked by seed from the mission's pool, never generated by a model.

## 8. Art

This is the largest risk on the project, because there is no illustrator.

The plan is a parametric SVG art kit built the same way the buddy's hair was
built, and documented in `design-exports/hair/METHOD.md`: geometry emitted from
JavaScript, previewed in the browser, exported to SVG, editable in Illustrator
later if a designer joins.

The kit covers rounded blob bodies, crystals, carts, beams, banners, chests and
mechanism parts, each parameterised by a per-world palette ramp.

Phaser consumes the kit through `this.load.svg()` with an explicit width and
height, which rasterises at the size we ask for rather than at the SVG's
intrinsic size. Loading at twice the display size keeps actors crisp on retina
Chromebooks. Body parts load as separate images so a scene can compose and tween
them, which is what gives enemies four states (idle bob, telegraph, hit reaction,
defeat) from tweened containers rather than from frame-by-frame spritesheets. No
frame animation is authored by hand anywhere in the MVP.

The hero is a placeholder gladiator built from the same kit: a chunky helmet with
a crest, a round shield, a short sword, and the exaggerated silhouette the rest of
the world uses. It implements `HeroActor` so the real buddy can replace it later
without touching a scene. `LottieBuddy` is not modified at all in this phase.

## 9. Audio

Sound effects are synthesised with the Web Audio API, so the standalone build
ships with no audio assets: chimes, clicks, impacts, whooshes and the treasure
sting are all built from oscillators and noise bursts. This is genuinely good
enough for feedback sounds and it removes an asset dependency.

Music is the honest gap. The mixer, per-channel volumes, mute and reduced-sound
mode are built in Phase 3, wired to a loader that takes a per-world loop when
real audio exists. Until then the game is silent on the music channel and says
so rather than shipping a placeholder loop.

No failure buzzer, ever.

## 10. Accessibility

Built in from Phase 0, not retrofitted:

- The canvas is `aria-hidden` and never focusable. Everything readable or
  choosable is DOM. This is the rule that stops Phaser from costing us
  accessibility, and it holds without exception.
- Keyboard first. Actions and answers are real buttons, 1 to 4 shortcuts, a
  visible focus ring on every interactive element. No gameplay input is read from
  the canvas.
- Anything the scene communicates visually is also stated in the DOM. An enemy
  telegraphing a heavy attack shows a canvas animation and an announced status
  line, because a child using a screen reader still needs to pick the right
  action.
- Reduced motion is pushed into the scene as `SET_REDUCED_MOTION`, which shortens
  tweens, stops emitters and swaps camera shake for a border pulse on the DOM
  frame. The existing `useReveal` pattern covers the interface side.
- Read aloud uses the Web Speech API in standalone, so the game does not depend
  on the ElevenLabs route. The host interface exposes `speak()` so integration
  can upgrade it to the real tutor voice.
- Status is never colour alone. Hearts, correctness and enemy telegraphs all
  carry a shape or an icon.
- Text size, dyslexia-friendly face and simplified background are profile flags
  read by the stage.
- No reward is reduced by an accessibility setting being on.

## 11. Responsive

Desktop and landscape tablet are the primary targets, matching the Chromebook
audience. The stage scales as a whole, so layout does not reflow.

Portrait phone uses a different composition rather than a shrunk one: stage in
the top 40 percent, question and actions in the bottom 60, larger targets, fewer
simultaneous enemies, and boss framing that crops to a vertical safe area. This
is a Phase 3 deliverable.

## 12. The seam

```ts
interface DungeonHost {
  getProfile(): Promise<GameProfile>;
  getBuddyLook(): Promise<BuddyLook>;
  listMissions(worldSlug: string): Promise<Mission[]>;
  startRun(missionId: string): Promise<RunInit>;
  nextQuestion(req: NextQuestionRequest): Promise<SanitizedQuestion>;
  submitAnswer(req: AnswerRequest): Promise<AnswerVerdict>;
  completeRoom(req: CompleteRoomRequest): Promise<void>;
  completeRun(req: CompleteRunRequest): Promise<RunRewards>;
  saveSnapshot(run: RunSnapshot): Promise<void>;
  speak(text: string): Promise<void>;
}
```

`submitAnswer` returning the verdict is the important one. In `localHost` the
answer key is local; in `apiHost` the client never receives it. Routing every
answer through this call from the first commit is what makes the swap free.

## 13. File layout

```
app/arcade/dungeon-dash/       route and distraction-free layout
game/dungeon-dash/
  host/          DungeonHost, localHost, later apiHost
  machine/       run machine, state types, transitions, snapshot
  bridge/        gameBus, SceneEvent and SceneCommand types
  phaser/
    game.ts      config, scale setup, instance lifecycle
    scenes/      Boot, Preload, Room, Boss, Treasure
    entities/    Hero, Enemy, InteractiveObject, Prop
    systems/     RoomBuilder, MoveSequencer, ParticleSystem, CameraRig
  content/       worlds, missions, room templates, enemies, loot tables
  questions/     templates, distractors, hint ladders, difficulty
  art/           parametric SVG kit, palette ramps, asset manifest
  audio/         synth sfx, mixer
  ui/            GameCanvas, Hud, ActionTray, QuestionPanel, HintPanel,
                 Treasure, Results, PauseMenu
```

The dependency added is `phaser`. Nothing else in the stack changes.

## 14. Phases

### Phase 0: grey box

Phaser mounted and scaling correctly, the bridge with its completion timeouts,
the run machine, one battle room built from a template, action tray, question
panel, effectiveness model, the placeholder gladiator behind `HeroActor`, `localHost`.
Actors are `Graphics` rectangles. No art, no audio.

Exit: three rooms playable end to end, and the loop is enjoyable with rectangles.
If it is not fun here, art will not save it.

The other thing Phase 0 proves is the seam. If the bridge is right, every later
phase is content and art rather than replumbing.

Phase 0 is built and playable at `/arcade/dungeon-dash`. Three rooms of the
Runaway Crystal Carts mission (mine gate battle, broken track trap, dripping
tunnel with two slimes), three actions, three question formats, hint ladder,
adaptive band, and the results screen.

`npm run dd:smoke` drives the machine headlessly through three strategies and
asserts the guarantee that matters: a perfect run, a run where every answer is
wrong, and a run where every question is skipped all finish all three rooms with
hearts remaining. It is the check to run before touching the reducer.

What Phase 0 taught, worth carrying forward:

- **Phaser installed as 4.2.1, not 3.** Scene data does not arrive through
  `scene.add(key, Scene, true, data)` reliably, so the bus is passed through
  `game.registry` and read in `create()`. `Tween.complete()` ends a tween at its
  current value rather than its final one, so fast-forwarding animations does not
  work; the scene re-asserts state from a `SETTLE` command instead.
- **A hidden tab freezes Phaser but not the machine.** Browser rAF throttling
  stops tweens and `time.delayedCall`, while the bridge timeouts keep running on
  `setTimeout`, so the run advances with the scene stuck on an old frame. Two
  defences: `SETTLE` on `visibilitychange`, which re-asserts hero, enemies,
  objective and bars from machine state, and `time.removeAllEvents()` at the top
  of every animating command so a thawed timer cannot emit a stale completion
  into a later wait.
- **Scene commands must be awaited before they are sent.** `ROOM_READY` is
  emitted synchronously inside the `LOAD_ROOM` handler, so subscribing after the
  send misses it every time. `sendAndWait` exists for exactly this and should be
  used for every command that expects a completion.
- **A tween with `from` and `to` plus `yoyo` returns to `from`, not to the
  value the object had.** This left the sword rotated after every attack. Use a
  bare target value and let yoyo return to the live one.

Two tuning observations for later, both deliberate for now:

- Hearts are only at risk on a room's non-final question, because the last
  question always completes the room and skips the enemy turn. It makes rooms end
  on a win beat, and it makes hearts drain slowly in short rooms.
- Countering an enemy's telegraphed intent negates its attack whatever the answer
  quality. Tactics protect, knowledge advances. The surge meter bonus was made
  proportional to effectiveness so tactics alone cannot charge it.

### Phase 1: vertical slice

The full seven-room mission "The Runaway Crystal Carts": entrance battle, broken
track trap, slime room, branching tunnel, cart chase, Foreman Forty-Two, treasure
vault. Math Mines art kit, synthesised audio, treasure reveal, results screen.

Exit: a ten-year-old plays for seven minutes with no instruction and wants a
second run.

### Phase 2: systems

Landing screen, world map, mission select, adaptive difficulty, remaining
question formats, loot tables with duplicate protection, collection book, secret
rooms, pause and resume.

### Phase 3: polish

Full accessibility pass, phone composition, audio mixer, entrance and reward
animation timing, performance budget.

### Phase 4: integration

`apiHost`, server routes under `/api/dungeon-dash/`, server-side loot rolling,
buddy cosmetics read from `companion-states`, questions sourced from real
syllabus and mastery data, analytics events.

## 15. How rewards relate to the existing gamification layer

Dungeon Dash loot must live in its own namespace, separate from the 32 milestone
emblems in `lib/gamification/catalog.ts`.

The emblems are derived from dated events and carry a guarantee: every item on a
buddy traces back to something the learner did. Dropping randomly rolled game
loot into that catalog breaks the guarantee. Dungeon Dash gets its own
collections, its own materials, and its own shelf in the room. A Dungeon Dash
run can still *fire* an emblem trigger (finishing a mission is an event), but the
loot itself is a different class of object.

## 16. Risks

- **Art quality.** Mitigated by the parametric kit and by grey-boxing first, but
  this is the thing most likely to make the game feel cheap.
- **Music.** No assets and no synthesis plan good enough for a music bed. Needs a
  decision about sourcing.
- **Scope.** Four worlds is the spec, one world is the MVP. Grammar Castle
  should not start until Math Mines has been played by real children.
- **The question becoming the game.** The failure mode is a beautiful shell
  wrapped around a quiz. The guard is section 5: fixed room length, variable
  drama.
- **State leaking into scenes.** The specific way a Phaser build goes wrong is a
  scene quietly caching enemy health or hearts so it can animate them, and then
  disagreeing with the machine. Section 3 is the rule; code review is the guard.
- **Bridge deadlock.** A missing completion event hangs the run. Mitigated by
  timing out every animating command, but it needs to be in from the first
  commit rather than added after the first hang.
- **Bundle size.** Phaser is roughly 1MB minified. It must be dynamically
  imported and confined to the game route, never pulled into the dashboard
  bundle. Worth a size check in CI once the route exists.

## 17. Decisions

Settled on 2026-07-28: Phaser renders the world with React owning all readable
content; the game is built in this repo behind the `DungeonHost` seam; Dungeon
Dash loot lives in its own namespace and never enters the emblem catalog.

Still open:

1. **Display font.** The spec asks for Fredoka or Baloo 2. The brand runs
   Fraunces for display. A game-only face is defensible but it is a brand call.
2. **Palette.** Whether the game UI sits on brand Cosmos or on its own deeper
   navy, and whether world palettes are free of the brand ramp.
3. **Coins and a shop.** The spec has coins for purchases. The gamification model
   deliberately has no currency. If coins ship, earned emblems must stay
   unbuyable.
4. **Age band.** The spec targets 9 to 12. The seeded learners here are grade 4
   and kindergarten. This sets the buddy's in-game register.
