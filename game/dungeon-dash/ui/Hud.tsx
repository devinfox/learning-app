"use client";

import { Heart, Sparkles } from "lucide-react";
import type { RunState } from "../machine/types";
import { MAX_HEARTS, MAX_POWER } from "../types";

export interface HudProps {
  state: RunState;
}

export function Hud({ state }: HudProps) {
  const room = state.rooms[state.roomIndex];
  const full = state.power >= MAX_POWER;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
      <div className="dd-panel pointer-events-auto px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dd-cream-dim)]">
          {state.missionTitle}
        </p>
        <h1 className="dd-display mt-0.5 text-lg sm:text-xl">{room?.title ?? "Loading"}</h1>
        <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
          {state.rooms.map((entry, index) => (
            <span
              key={entry.id}
              className="dd-room-dot"
              data-state={
                index < state.roomIndex
                  ? "done"
                  : index === state.roomIndex
                    ? "current"
                    : "todo"
              }
            />
          ))}
        </div>
        <p className="sr-only">
          Room {state.roomIndex + 1} of {state.rooms.length}.
        </p>
      </div>

      <div className="dd-panel pointer-events-auto min-w-[190px] px-4 py-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_HEARTS }, (_, index) => (
            <Heart
              key={index}
              size={20}
              className="dd-heart"
              data-spent={index >= state.hearts}
              fill={index < state.hearts ? "currentColor" : "none"}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">
            {state.hearts} of {MAX_HEARTS} hearts remaining.
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Sparkles size={15} className="text-[var(--dd-gold)]" aria-hidden="true" />
          <div className="dd-meter flex-1">
            <div
              className="dd-meter-fill"
              data-full={full}
              style={{ width: `${state.power}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs tabular-nums text-[var(--dd-cream-dim)]">
            {Math.round(state.power)}
          </span>
        </div>
        <p className="sr-only">
          Surge meter {Math.round(state.power)} percent.
          {full ? " Surge is ready." : ""}
        </p>
      </div>
    </div>
  );
}
