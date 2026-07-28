"use client";

import { useSyncExternalStore } from "react";
import { ActionTray } from "./ActionTray";
import { GameCanvas } from "./GameCanvas";
import { Hud } from "./Hud";
import { QuestionPanel } from "./QuestionPanel";
import { useRun } from "./useRun";
import "./dungeon-dash.css";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void): () => void {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

export interface RunScreenProps {
  missionId: string;
}

export function RunScreen({ missionId }: RunScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const run = useRun(missionId, reducedMotion);
  const { state } = run;
  const room = state.rooms[state.roomIndex];

  return (
    <div className="dd-root">
      <GameCanvas bus={run.bus} atlas={run.atlas} onReady={run.setSceneReady} />

      {state.phase !== "booting" ? <Hud state={state} /> : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-6">
        {state.phase === "roomIntro" && room ? (
          <div className="dd-panel dd-rise pointer-events-auto w-full max-w-2xl p-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dd-cream-dim)]">
              {room.objectiveLabel}
            </p>
            <p className="dd-display mt-1.5 text-xl">{room.premise}</p>
          </div>
        ) : null}

        {state.phase === "choosingAction" ? (
          <ActionTray state={state} onChoose={run.chooseAction} />
        ) : null}

        {state.phase === "answering" ||
        state.phase === "playingMove" ||
        state.phase === "enemyTurn" ? (
          <QuestionPanel
            state={state}
            interactive={state.phase === "answering" && state.revealedIndex === null}
            onAnswer={run.answer}
            onHint={run.requestHint}
          />
        ) : null}

        {state.phase === "roomOutro" && room ? (
          <div className="dd-panel dd-rise pointer-events-auto w-full max-w-2xl p-5 text-center">
            <p className="dd-display text-2xl text-[var(--dd-gold)]">
              {room.objectiveLabel} complete
            </p>
            <p className="mt-1 text-sm text-[var(--dd-cream-dim)]">
              {state.assisted
                ? "Your gear covered the last stretch."
                : "Cleanly done."}
            </p>
            <button
              type="button"
              className="dd-btn dd-btn-primary mt-4 px-6 py-3 text-center"
              onClick={run.advance}
              autoFocus
            >
              {state.roomIndex + 1 >= state.rooms.length ? "Finish the Dash" : "Next room"}
            </button>
          </div>
        ) : null}
      </div>

      {state.phase === "runComplete" ? <Results state={state} /> : null}

      <p aria-live="polite" className="sr-only">
        {state.announcement}
      </p>
    </div>
  );
}

function Results({ state }: { state: ReturnType<typeof useRun>["state"] }) {
  const { stats } = state;
  const tricky = stats.correctedAnswers + stats.assists;

  return (
    <div className="dd-results-scrim absolute inset-0 flex items-center justify-center p-6">
      <div className="dd-panel dd-rise w-full max-w-lg p-7 text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dd-cream-dim)]">
          Dash complete
        </p>
        <h2 className="dd-display mt-1 text-3xl text-[var(--dd-gold)]">
          {state.missionTitle}
        </h2>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
          <Stat label="Rooms cleared" value={`${stats.roomsCleared}`} />
          <Stat label="Monsters defeated" value={`${stats.enemiesDefeated}`} />
          <Stat label="Facts nailed first try" value={`${stats.perfectAnswers}`} />
          <Stat label="Hearts left" value={`${state.hearts}`} />
        </dl>

        {tricky > 0 ? (
          <p className="mt-5 text-sm text-[var(--dd-mint)]">
            You learned from {tricky} tricky {tricky === 1 ? "question" : "questions"}.
          </p>
        ) : (
          <p className="mt-5 text-sm text-[var(--dd-mint)]">
            You went through the whole mine without a single stumble.
          </p>
        )}

        <button
          type="button"
          className="dd-btn dd-btn-primary mt-6 w-full py-3.5 text-center"
          onClick={() => window.location.reload()}
          autoFocus
        >
          Dash again
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--dd-line)] bg-[rgb(10_12_32/0.55)] px-3.5 py-3 shadow-[0_1px_0_rgb(255_255_255/0.06)_inset]">
      <dt className="text-[11px] uppercase tracking-wider text-[var(--dd-cream-dim)]">
        {label}
      </dt>
      <dd className="dd-display mt-0.5 text-2xl tabular-nums text-[var(--dd-gold-bright)]">
        {value}
      </dd>
    </div>
  );
}
