"use client";

import { useEffect, useState } from "react";
import {
  cueAt,
  transitionMsFor,
  visualLeadMs,
  type Viseme,
  type VisemeCue,
} from "@/lib/tutor/visemes";
import type { LottieLook } from "@/lib/companion/looks";
import type { TutorState } from "@/lib/tutor/types";
import { cn } from "@/lib/ui/cn";
import { LottieBuddy } from "./LottieBuddy";

const STATE_LABEL: Record<TutorState, string> = {
  idle: "Study buddy, ready",
  listening: "Study buddy is listening",
  thinking: "Study buddy is thinking",
  speaking: "Study buddy is speaking",
  celebrating: "Study buddy is celebrating",
};

export interface CompanionProps {
  state?: TutorState;
  size?: number;
  showFace?: boolean;
  cues?: VisemeCue[] | null;
  getPlayheadMs?: () => number | null;
  label?: string;
  onClick?: () => void;
  /** Free cosmetics (eyes / glow / hair) */
  look?: Partial<LottieLook> | null;
  equipped?: Record<string, string> | null;
  className?: string;
}

export function Companion({
  state = "idle",
  size = 120,
  showFace = true,
  cues,
  getPlayheadMs,
  label,
  onClick,
  look,
  equipped,
  className,
}: CompanionProps) {
  const [pose, setPose] = useState<Viseme>("REST");
  const [transitionMs, setTransitionMs] = useState(80);

  useEffect(() => {
    if (!cues?.length || !getPlayheadMs) {
      setPose("REST");
      return;
    }

    let raf = 0;
    let current: Viseme = "REST";

    const tick = () => {
      const playhead = getPlayheadMs();

      if (playhead === null) {
        if (current !== "REST") {
          current = "REST";
          setTransitionMs(transitionMsFor("REST"));
          setPose("REST");
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const upcoming = cueAt(cues, playhead + 40);
      if (upcoming) {
        const cue = cueAt(cues, playhead + visualLeadMs(upcoming.viseme));
        if (cue && cue.viseme !== current) {
          current = cue.viseme;
          setTransitionMs(transitionMsFor(cue.viseme));
          setPose(cue.viseme);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cues, getPlayheadMs]);

  const interactive = Boolean(onClick);

  return (
    <div
      role="img"
      aria-roledescription="Study buddy"
      data-state={state}
      data-viseme={pose}
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-visible",
        className,
      )}
    >
      <span className="sr-only" aria-live="polite">
        {STATE_LABEL[state]}
      </span>

      <LottieBuddy
        state={state}
        size={size}
        pose={pose}
        transitionMs={transitionMs}
        showFace={showFace}
        look={look}
        equipped={equipped}
      />

      {interactive && (
        <button
          type="button"
          onClick={onClick}
          aria-label={label ?? STATE_LABEL[state]}
          className="absolute inset-0 z-10 rounded-full transition active:scale-95"
        />
      )}
    </div>
  );
}

export {
  useSpokenReply,
  type SpokenSegment,
} from "@/lib/ui/useSpokenReply";
