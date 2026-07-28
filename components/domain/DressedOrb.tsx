"use client";

import type { ReactNode } from "react";
import { TONE_VAR, rewardById } from "@/lib/gamification/catalog";
import type { CompanionSlot } from "@/lib/gamification/types";
import type { TutorState } from "@/lib/tutor/types";
import { cn } from "@/lib/ui/cn";
import { Companion } from "./Companion";
import { Orb, type OrbMood } from "./Orb";

export interface DressedOrbProps {
  equipped: Record<string, string>;
  size?: number;
  mood?: OrbMood;
  live?: boolean;
  state?: TutorState;
  children?: ReactNode;
  className?: string;
}

const PLACEMENT: Record<CompanionSlot, string> = {
  hat: "left-1/2 top-[-14%] -translate-x-1/2",
  held: "right-[-16%] top-[52%]",
  badge: "left-[-12%] top-[58%]",
  aura: "inset-0",
};

function moodToState(mood: OrbMood): TutorState {
  if (mood === "delighted") return "celebrating";
  return "idle";
}

export function DressedOrb({
  equipped,
  size = 140,
  mood = "idle",
  live = false,
  state,
  children,
  className,
}: DressedOrbProps) {
  const aura = rewardById(equipped.aura ?? "");
  const pieces = (["hat", "held", "badge"] as const)
    .map((slot) => ({ slot, reward: rewardById(equipped[slot] ?? "") }))
    .filter((row) => row.reward);

  const core =
    children ??
    (live ? (
      <Companion
        size={size}
        state={state ?? moodToState(mood)}
        equipped={equipped}
      />
    ) : (
      <Orb size={size} mood={mood} equipped={equipped} />
    ));

  // Lottie glow look already paints bloom; only show aura reward if no free glow look
  const showAuraBadge = Boolean(aura) && !equipped.glow;

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {showAuraBadge && aura && (
        <span
          aria-hidden="true"
          className="absolute inset-[-12%] rounded-full blur-xl"
          style={{ background: TONE_VAR[aura.tone], opacity: 0.38 }}
        />
      )}

      <div className="relative grid size-full place-items-center">{core}</div>

      {pieces.map(({ slot, reward }) => {
        const Icon = reward!.icon;
        const glyph = Math.round(size * (slot === "hat" ? 0.3 : 0.26));

        return (
          <span
            key={slot}
            title={reward!.name}
            className={cn("absolute grid place-items-center", PLACEMENT[slot])}
            style={
              slot === "hat" ? undefined : { width: glyph * 1.6, height: glyph * 1.6 }
            }
          >
            <span
              className="grid place-items-center rounded-full bg-surface shadow-[--shadow-card] ring-1 ring-line"
              style={{ width: glyph * 1.5, height: glyph * 1.5 }}
            >
              <Icon
                size={glyph}
                strokeWidth={2}
                style={{ color: TONE_VAR[reward!.tone] }}
                aria-hidden="true"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
