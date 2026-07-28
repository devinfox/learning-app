import { createLocalHost } from "../game/dungeon-dash/host/localHost";
import type { DungeonHost } from "../game/dungeon-dash/host/types";
import { currentRoom, INITIAL_STATE, reduce } from "../game/dungeon-dash/machine/reducer";
import type { RunEvent, RunState } from "../game/dungeon-dash/machine/types";

type Strategy = "correct" | "wrong" | "skip";

const MISSION = "runaway-crystal-carts";
const failures: string[] = [];

function check(label: string, passed: boolean, detail: string): void {
  console.log(`  ${passed ? "ok  " : "FAIL"} ${label}${passed ? "" : ` (${detail})`}`);
  if (!passed) failures.push(`${label}: ${detail}`);
}

async function pickOption(
  host: DungeonHost,
  runId: string,
  questionId: string,
  optionCount: number,
  wantCorrect: boolean,
): Promise<number> {
  for (let candidate = 0; candidate < optionCount; candidate++) {
    const probe = await host.submitAnswer({
      runId,
      questionId,
      optionIndex: candidate,
      attemptNumber: 1,
      hintLevel: 0,
      responseMs: 3000,
    });
    if (probe.correct === wantCorrect) return candidate;
  }
  return 0;
}

async function playRun(label: string, strategy: Strategy): Promise<RunState> {
  const host = createLocalHost();
  const init = await host.startRun(MISSION);

  let state = reduce(INITIAL_STATE, { type: "START", init });
  const send = (event: RunEvent) => {
    state = reduce(state, event);
  };

  let guard = 0;
  while (state.phase !== "runComplete" && guard < 500) {
    guard += 1;
    const room = currentRoom(state);
    if (!room) break;

    if (state.phase === "roomIntro") {
      send({ type: "INTRO_DONE" });
    } else if (state.phase === "choosingAction") {
      send({ type: "CHOOSE_ACTION", action: state.power >= 100 ? "surge" : "attack" });
    } else if (state.phase === "answering" && !state.question) {
      const question = await host.nextQuestion({
        runId: state.runId,
        roomId: room.id,
        action: state.pendingAction ?? "attack",
        band: state.band,
        history: state.history,
      });
      send({ type: "QUESTION_READY", question });
    } else if (state.phase === "answering" && state.question) {
      const optionIndex =
        strategy === "skip"
          ? null
          : await pickOption(
              host,
              state.runId,
              state.question.id,
              state.question.options.length,
              strategy === "correct",
            );

      const verdict = await host.submitAnswer({
        runId: state.runId,
        questionId: state.question.id,
        optionIndex,
        attemptNumber: state.attempt,
        hintLevel: state.hintLevel,
        responseMs: 4200,
      });
      send({ type: "VERDICT", verdict, responseMs: 4200 });
    } else if (state.phase === "playingMove") {
      send({ type: "MOVE_DONE" });
    } else if (state.phase === "enemyTurn") {
      send({ type: "ENEMY_DONE" });
    } else if (state.phase === "roomOutro") {
      send({ type: "ADVANCE" });
    } else {
      break;
    }
  }

  console.log(`\n${label}`);
  console.log(
    `  phase=${state.phase} rooms=${state.stats.roomsCleared} questions=${state.stats.questionsAnswered} ` +
      `perfect=${state.stats.perfectAnswers} corrected=${state.stats.correctedAnswers} ` +
      `assists=${state.stats.assists} hearts=${state.hearts} power=${Math.round(state.power)} band=${state.band}`,
  );
  return state;
}

const perfect = await playRun("perfect run", "correct");
check("finishes", perfect.phase === "runComplete", perfect.phase);
check("clears every room", perfect.stats.roomsCleared === 3, `${perfect.stats.roomsCleared}`);
check("keeps every heart", perfect.hearts === 4, `${perfect.hearts}`);
check("needs no assist", perfect.stats.assists === 0, `${perfect.stats.assists}`);
check("answers six questions", perfect.stats.questionsAnswered === 6, `${perfect.stats.questionsAnswered}`);

const worst = await playRun("every answer wrong", "wrong");
check("finishes", worst.phase === "runComplete", worst.phase);
check("clears every room", worst.stats.roomsCleared === 3, `${worst.stats.roomsCleared}`);
check("never runs out of hearts", worst.hearts > 0, `${worst.hearts}`);
check("is carried by an assist per room", worst.stats.assists === 3, `${worst.stats.assists}`);
check("answers six questions", worst.stats.questionsAnswered === 6, `${worst.stats.questionsAnswered}`);

const skipped = await playRun("every question skipped", "skip");
check("finishes", skipped.phase === "runComplete", skipped.phase);
check("clears every room", skipped.stats.roomsCleared === 3, `${skipped.stats.roomsCleared}`);
check("never runs out of hearts", skipped.hearts > 0, `${skipped.hearts}`);

console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} check(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("all checks passed");
