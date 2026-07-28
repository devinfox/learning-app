"use client";

import { Anchor, Hammer, Shield, Sparkles, Swords, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { actionKitFor } from "../content/actionKits";
import type { RunState } from "../machine/types";
import {
  ACTIONS,
  COUNTERS,
  INTENT_TELL,
  MAX_POWER,
  type ActionIconId,
  type ActionId,
} from "../types";

const ICONS: Record<ActionIconId, LucideIcon> = {
  swords: Swords,
  shield: Shield,
  sparkles: Sparkles,
  hammer: Hammer,
  anchor: Anchor,
  zap: Zap,
};

export interface ActionTrayProps {
  state: RunState;
  onChoose(action: ActionId): void;
}

export function ActionTray({ state, onChoose }: ActionTrayProps) {
  const room = state.rooms[state.roomIndex];
  const kit = actionKitFor(room?.actionKit);
  const frontEnemy = state.enemies.find((enemy) => enemy.alive) ?? null;
  const available = (action: ActionId) =>
    action !== "surge" || state.power >= MAX_POWER;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      const action = ACTIONS[index];
      if (!action || !available(action.id)) return;
      event.preventDefault();
      onChoose(action.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="dd-rise pointer-events-auto w-full max-w-3xl">
      <div className="dd-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dd-cream-dim)]">
            Choose your move
          </p>
          {frontEnemy ? (
            <p className="dd-intent">
              <span aria-hidden="true">⚠</span>
              {frontEnemy.name} is {INTENT_TELL[frontEnemy.intent]}
            </p>
          ) : (
            <p className="text-sm font-semibold text-[var(--dd-cyan)]">
              {kit.tell ?? room?.objectiveLabel}
            </p>
          )}
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {ACTIONS.map((action, index) => {
            const face = kit.actions[action.id];
            const Icon = ICONS[face.icon];
            const enabled = available(action.id);
            const counters = frontEnemy
              ? COUNTERS[frontEnemy.intent] === action.id
              : false;

            return (
              <button
                key={action.id}
                type="button"
                className="dd-btn"
                data-counter={counters || undefined}
                disabled={!enabled}
                onClick={() => onChoose(action.id)}
              >
                <span className="flex items-center gap-2">
                  <span className="dd-key">{index + 1}</span>
                  <Icon size={18} className="text-[var(--dd-cyan)]" aria-hidden="true" />
                  <span className="dd-display text-base">{face.name}</span>
                  {counters ? <span className="dd-badge ml-auto">Counter</span> : null}
                </span>
                <span className="mt-1.5 block text-xs leading-snug text-[var(--dd-cream-dim)]">
                  {!enabled && face.lockedBlurb ? face.lockedBlurb : face.blurb}
                </span>
              </button>
            );
          })}
        </div>

        {state.enemies.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--dd-cream-dim)]">
            {state.enemies.map((enemy) => (
              <li key={enemy.key}>
                {enemy.name}:{" "}
                {enemy.alive
                  ? `${Math.round((enemy.resolve / enemy.maxResolve) * 100)}% resolve`
                  : "defeated"}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
