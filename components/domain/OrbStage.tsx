"use client";

import type { ReactNode } from "react";
import type { TutorState } from "@/lib/tutor/types";
import { cn } from "@/lib/ui/cn";
import { DressedOrb } from "./DressedOrb";
import type { OrbMood } from "./Orb";

export interface OrbStageProps {
  equipped: Record<string, string>;
  size?: number;
  mood?: OrbMood;
  live?: boolean;
  state?: TutorState;
  caption?: ReactNode;
  className?: string;
}

export function OrbStage({
  equipped,
  size = 172,
  mood = "pleased",
  live = true,
  state,
  caption,
  className,
}: OrbStageProps) {
  return (
    <div
      className={cn(
        "arcade-grid relative isolate overflow-hidden rounded-[--radius-sheet] glass",
        "px-6 pb-7 pt-10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="animate-prism-drift pointer-events-none absolute inset-x-[-25%] -top-1/2 h-[140%] bg-prism opacity-[0.22] blur-3xl"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[74%] w-[70%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.16) 0%, rgb(255 255 255 / 0.02) 70%, transparent 100%)",
          clipPath: "polygon(36% 0, 64% 0, 100% 100%, 0 100%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <div className="relative grid place-items-center" style={{ height: size }}>
          <span
            aria-hidden="true"
            className="absolute bottom-[-6%] h-5 rounded-[50%] bg-white/35 blur-md"
            style={{ width: size * 0.62 }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-[-9%] h-9 rounded-[50%] bg-white/12 blur-xl"
            style={{ width: size * 0.95 }}
          />
          <DressedOrb
            equipped={equipped}
            size={size}
            mood={mood}
            live={live}
            state={state}
          />
        </div>

        <span
          aria-hidden="true"
          className="mt-4 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.4) 50%, transparent)",
          }}
        />

        {caption && <div className="mt-5">{caption}</div>}
      </div>
    </div>
  );
}
