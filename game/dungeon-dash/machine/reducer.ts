import { ENEMIES } from "../content/mathMines";
import { createRng } from "../lib/rng";
import { adjustBand } from "../questions/difficulty";
import {
  COUNTERS,
  MAX_HEARTS,
  MAX_POWER,
  SURGE_MULTIPLIER,
  type EnemyIntent,
  type EnemyState,
  type RoomTemplate,
} from "../types";
import type { RunEvent, RunState, RunStats } from "./types";

const EMPTY_STATS: RunStats = {
  roomsCleared: 0,
  enemiesDefeated: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  perfectAnswers: 0,
  correctedAnswers: 0,
  assists: 0,
};

export const INITIAL_STATE: RunState = {
  phase: "booting",
  runId: "",
  seed: 0,
  missionId: "",
  missionTitle: "",
  rooms: [],
  roomIndex: 0,
  hearts: MAX_HEARTS,
  power: 0,
  band: 3,
  enemies: [],
  objective: 0,
  questionIndex: 0,
  question: null,
  questionLoading: false,
  pendingAction: null,
  attempt: 1,
  hintLevel: 0,
  hint: null,
  eliminated: [],
  revealedIndex: null,
  explanation: null,
  lastEffectiveness: 0,
  countered: false,
  assisted: false,
  rescued: false,
  history: [],
  stats: EMPTY_STATS,
  announcement: "",
};

export function currentRoom(state: RunState): RoomTemplate | null {
  return state.rooms[state.roomIndex] ?? null;
}

export function intentFor(
  intents: EnemyIntent[],
  seed: number,
  roomIndex: number,
  slot: number,
  questionIndex: number,
): EnemyIntent {
  const rng = createRng(seed + roomIndex * 1013 + slot * 101 + questionIndex * 17);
  return rng.pick(intents);
}

function spawnEnemies(
  room: RoomTemplate,
  seed: number,
  roomIndex: number,
): EnemyState[] {
  return room.enemyIds.map((specId, slot) => {
    const spec = ENEMIES[specId];
    return {
      key: `${room.id}_${slot}`,
      specId,
      name: spec.name,
      resolve: spec.resolve,
      maxResolve: spec.resolve,
      intent: intentFor(spec.intents, seed, roomIndex, slot, 0),
      alive: true,
    };
  });
}

function enterRoom(state: RunState, roomIndex: number): RunState {
  const room = state.rooms[roomIndex];
  return {
    ...state,
    phase: "roomIntro",
    roomIndex,
    enemies: spawnEnemies(room, state.seed, roomIndex),
    objective: 0,
    questionIndex: 0,
    question: null,
    questionLoading: false,
    pendingAction: null,
    attempt: 1,
    hintLevel: 0,
    hint: null,
    eliminated: [],
    revealedIndex: null,
    explanation: null,
    lastEffectiveness: 0,
    countered: false,
    assisted: false,
    announcement: `${room.title}. ${room.premise}`,
  };
}

function totalResolve(enemies: EnemyState[]): number {
  return enemies.reduce((sum, enemy) => sum + enemy.maxResolve, 0);
}

function applyDamage(enemies: EnemyState[], amount: number): EnemyState[] {
  let remaining = amount;
  return enemies.map((enemy) => {
    if (!enemy.alive || remaining <= 0) return enemy;
    const dealt = Math.min(enemy.resolve, remaining);
    remaining -= dealt;
    const resolve = enemy.resolve - dealt;
    return { ...enemy, resolve, alive: resolve > 0 };
  });
}

function roomComplete(state: RunState, room: RoomTemplate): boolean {
  return room.enemyIds.length > 0
    ? state.enemies.every((enemy) => !enemy.alive)
    : state.objective >= 1;
}

function resolveAnswer(
  state: RunState,
  event: Extract<RunEvent, { type: "VERDICT" }>,
): RunState {
  const room = currentRoom(state);
  if (!room || !state.question) return state;

  const { verdict } = event;

  if (!verdict.resolved) {
    return {
      ...state,
      attempt: state.attempt + 1,
      hint: verdict.hint,
      hintLevel: verdict.hint ? state.hintLevel + 1 : state.hintLevel,
      eliminated:
        verdict.hint?.directive?.kind === "eliminate"
          ? [...state.eliminated, verdict.hint.directive.optionIndex]
          : state.eliminated,
      announcement: verdict.hint?.text ?? "Not quite. Try again.",
    };
  }

  const action = state.pendingAction ?? "attack";
  const frontEnemy = state.enemies.find((enemy) => enemy.alive) ?? null;
  const countered = frontEnemy ? COUNTERS[frontEnemy.intent] === action : false;
  const isLast = state.questionIndex >= room.questionCount - 1;

  const record = {
    skillId: verdict.skillId,
    format: verdict.format,
    correct: verdict.correct,
    hintLevel: state.hintLevel,
    attempts: state.attempt,
    effectiveness: verdict.effectiveness,
    responseMs: event.responseMs,
  };
  const history = [...state.history, record];

  const multiplier = action === "surge" ? SURGE_MULTIPLIER : 1;
  let enemies = state.enemies;
  let objective = state.objective;
  let assisted = false;

  if (room.enemyIds.length > 0) {
    const perQuestion = totalResolve(state.enemies) / room.questionCount;
    enemies = applyDamage(enemies, perQuestion * verdict.effectiveness * multiplier);
    if (isLast && enemies.some((enemy) => enemy.alive)) {
      enemies = enemies.map((enemy) => ({ ...enemy, resolve: 0, alive: false }));
      assisted = true;
    }
  } else {
    objective = Math.min(1, objective + (verdict.effectiveness * multiplier) / room.questionCount);
    if (isLast && objective < 1) {
      objective = 1;
      assisted = true;
    }
  }

  const defeated =
    state.enemies.filter((enemy) => enemy.alive).length -
    enemies.filter((enemy) => enemy.alive).length;

  const power =
    action === "surge"
      ? 0
      : Math.min(
          MAX_POWER,
          state.power + verdict.effectiveness * (countered ? 30 : 20),
        );

  return {
    ...state,
    phase: "playingMove",
    enemies,
    objective,
    power,
    band: adjustBand(state.band, history),
    history,
    countered,
    assisted,
    hint: null,
    revealedIndex: verdict.correctIndex,
    explanation: verdict.explanation,
    lastEffectiveness: verdict.effectiveness,
    stats: {
      ...state.stats,
      questionsAnswered: state.stats.questionsAnswered + 1,
      questionsCorrect: state.stats.questionsCorrect + (verdict.correct ? 1 : 0),
      enemiesDefeated: state.stats.enemiesDefeated + defeated,
      perfectAnswers:
        state.stats.perfectAnswers + (verdict.effectiveness === 1 ? 1 : 0),
      correctedAnswers:
        state.stats.correctedAnswers +
        (verdict.effectiveness === 0.85 || verdict.effectiveness === 0.7 ? 1 : 0),
      assists: state.stats.assists + (assisted ? 1 : 0),
    },
    announcement: assisted
      ? "Your gear finishes the job. Keep going."
      : verdict.explanation ?? "Nice move.",
  };
}

function takeEnemyTurn(state: RunState): RunState {
  const room = currentRoom(state);
  const hazard = room?.enemyIds.length === 0;
  const hit = !state.countered && state.lastEffectiveness <= 0.35;

  if (!hit) {
    return {
      ...state,
      phase: "enemyTurn",
      announcement: state.countered
        ? "Blocked it cleanly."
        : hazard
          ? "The track holds."
          : "It glances off you.",
    };
  }

  const hearts = state.hearts - 1;
  if (hearts <= 0) {
    return {
      ...state,
      phase: "enemyTurn",
      hearts: 2,
      rescued: true,
      announcement: "Your gear pulls you clear. You lose the bonus chest but keep going.",
    };
  }

  return {
    ...state,
    phase: "enemyTurn",
    hearts,
    announcement: hazard ? "A cart clips you." : "It lands a hit.",
  };
}

export function reduce(state: RunState, event: RunEvent): RunState {
  switch (event.type) {
    case "START": {
      const base: RunState = {
        ...INITIAL_STATE,
        runId: event.init.runId,
        seed: event.init.seed,
        missionId: event.init.mission.id,
        missionTitle: event.init.mission.title,
        rooms: event.init.rooms,
        band: event.init.band,
        stats: EMPTY_STATS,
        history: [],
      };
      return enterRoom(base, 0);
    }

    case "INTRO_DONE": {
      if (state.phase !== "roomIntro") return state;
      return { ...state, phase: "choosingAction", announcement: "Choose your move." };
    }

    case "CHOOSE_ACTION": {
      if (state.phase !== "choosingAction") return state;
      return {
        ...state,
        phase: "answering",
        pendingAction: event.action,
        questionLoading: true,
        question: null,
        attempt: 1,
        hintLevel: 0,
        hint: null,
        eliminated: [],
        revealedIndex: null,
        explanation: null,
      };
    }

    case "QUESTION_READY": {
      if (state.phase !== "answering") return state;
      return {
        ...state,
        question: event.question,
        questionLoading: false,
        announcement: event.question.prompt,
      };
    }

    case "HINT_READY": {
      return {
        ...state,
        hint: event.hint,
        hintLevel: state.hintLevel + 1,
        eliminated:
          event.hint.directive?.kind === "eliminate"
            ? [...state.eliminated, event.hint.directive.optionIndex]
            : state.eliminated,
        announcement: event.hint.text,
      };
    }

    case "VERDICT": {
      if (state.phase !== "answering") return state;
      return resolveAnswer(state, event);
    }

    case "MOVE_DONE": {
      if (state.phase !== "playingMove") return state;
      const room = currentRoom(state);
      if (!room) return state;

      if (roomComplete(state, room)) {
        return {
          ...state,
          phase: "roomOutro",
          stats: { ...state.stats, roomsCleared: state.stats.roomsCleared + 1 },
          announcement: `${room.objectiveLabel} complete.`,
        };
      }

      return takeEnemyTurn(state);
    }

    case "ENEMY_DONE": {
      if (state.phase !== "enemyTurn") return state;
      const room = currentRoom(state);
      if (!room) return state;

      const questionIndex = state.questionIndex + 1;
      const nextEnemies = state.enemies.map((enemy, slot) =>
        enemy.alive
          ? {
              ...enemy,
              intent: intentFor(
                ENEMIES[enemy.specId].intents,
                state.seed,
                state.roomIndex,
                slot,
                questionIndex,
              ),
            }
          : enemy,
      );

      return {
        ...state,
        phase: "choosingAction",
        questionIndex,
        enemies: nextEnemies,
        question: null,
        pendingAction: null,
        attempt: 1,
        hintLevel: 0,
        hint: null,
        eliminated: [],
        revealedIndex: null,
        explanation: null,
        countered: false,
        assisted: false,
        announcement: "Choose your move.",
      };
    }

    case "ADVANCE": {
      if (state.phase !== "roomOutro") return state;
      const nextIndex = state.roomIndex + 1;
      if (nextIndex >= state.rooms.length) {
        return { ...state, phase: "runComplete", announcement: "Dash complete." };
      }
      return enterRoom(state, nextIndex);
    }

    default:
      return state;
  }
}
