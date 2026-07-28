"use client";

import { ChevronUp, Minus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { usePrefersReducedMotion } from "./CountUp";

export function useReveal(delay = 0): boolean {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => setShown(true), Math.max(16, delay));
    return () => clearTimeout(timer);
  }, [delay, reduced]);

  return reduced || shown;
}

export interface MeterBarProps {
  value: number;
  tint?: string;
  track?: string;
  height?: number;
  delay?: number;
  ticks?: number;
  shine?: boolean;
  label?: string;
  className?: string;
}

export function MeterBar({
  value,
  tint = "var(--color-brand)",
  track = "rgb(255 255 255 / 0.1)",
  height = 10,
  delay = 0,
  ticks = 0,
  shine,
  label,
  className,
}: MeterBarProps) {
  const shown = useReveal(delay);
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const full = percent >= 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ height, background: track }}
      className={cn("relative w-full overflow-hidden rounded-full", className)}
    >
      {ticks > 0 && (
        <span aria-hidden="true" className="absolute inset-0 flex">
          {Array.from({ length: ticks }).map((_, index) => (
            <span
              key={index}
              className="flex-1 border-r border-black/20 last:border-0"
            />
          ))}
        </span>
      )}

      <span
        aria-hidden="true"
        style={{
          width: `${shown ? percent : 0}%`,
          background: tint,
          boxShadow: full ? `0 0 14px ${tint}` : undefined,
        }}
        className="relative block h-full rounded-full transition-[width] duration-[900ms] ease-out"
      >
        {(shine ?? full) && shown && percent > 6 && (
          <span
            aria-hidden="true"
            className="animate-bar-shine absolute inset-y-0 w-1/3 bg-white/45 blur-[3px]"
          />
        )}
      </span>
    </div>
  );
}

export interface SparkBurstProps {
  fire: boolean;
  count?: number;
  spread?: number;
  className?: string;
}

const RAY_VARS = [
  "var(--color-ray-1)",
  "var(--color-ray-2)",
  "var(--color-ray-3)",
  "var(--color-ray-4)",
];

export function SparkBurst({ fire, count = 14, spread = 130, className }: SparkBurstProps) {
  const reduced = usePrefersReducedMotion();
  if (!fire || reduced) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 z-10 size-0",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => {
        const angle = (index / count) * Math.PI * 2 + index * 0.35;
        const distance = spread * (0.55 + ((index * 37) % 45) / 100);

        return (
          <span
            key={index}
            style={
              {
                background: RAY_VARS[index % RAY_VARS.length],
                animationDelay: `${index * 26}ms`,
                "--mote-x": `${Math.cos(angle) * distance}px`,
                "--mote-y": `${Math.sin(angle) * distance}px`,
              } as React.CSSProperties
            }
            className="animate-mote absolute size-1.5 rounded-full"
          />
        );
      })}
    </span>
  );
}

export interface RankDeltaProps {
  movement: number;
  className?: string;
}

export function RankDelta({ movement, className }: RankDeltaProps) {
  if (movement === 0) {
    return (
      <span
        className={cn("inline-flex items-center text-white/30", className)}
        aria-label="No change since last week"
      >
        <Minus size={12} aria-hidden="true" />
      </span>
    );
  }

  const up = movement > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[0.6875rem] font-bold tabular-nums",
        up ? "text-verdant-ink" : "text-ember-ink",
        className,
      )}
      aria-label={`${up ? "Up" : "Down"} ${Math.abs(movement)} since last week`}
    >
      <ChevronUp
        size={12}
        aria-hidden="true"
        className={cn("transition-transform", !up && "rotate-180")}
      />
      {Math.abs(movement)}
    </span>
  );
}

export interface LevelBadgeProps {
  level: number;
  tint?: string;
  size?: number;
  className?: string;
}

export function LevelBadge({
  level,
  tint = "var(--color-ray-1)",
  size = 44,
  className,
}: LevelBadgeProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderColor: tint,
        boxShadow: `0 0 18px -4px ${tint}, inset 0 0 12px -6px ${tint}`,
      }}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[0.9rem] border-2 bg-white/[0.06]",
        className,
      )}
    >
      <span className="text-center leading-none">
        <span
          className="block text-[0.5rem] font-bold uppercase tracking-[0.12em]"
          style={{ color: tint }}
        >
          Lv
        </span>
        <span className="block font-display text-base font-bold tabular-nums text-white">
          {level}
        </span>
      </span>
    </span>
  );
}

export interface StreakPipsProps {
  weeks: Array<{ startsAt: string; points: number }>;
  peak: number;
  className?: string;
}

export function StreakPips({ weeks, peak, className }: StreakPipsProps) {
  const shown = useReveal(220);

  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-hidden="true">
      {weeks.map((week, index) => {
        const ratio = peak > 0 ? week.points / peak : 0;
        const live = index === weeks.length - 1;

        return (
          <span key={week.startsAt} className="flex flex-1 flex-col items-center gap-1">
            <span
              style={{
                height: shown ? Math.max(4, ratio * 58) : 4,
                background: live
                  ? "var(--color-lumen)"
                  : `rgb(255 255 255 / ${0.16 + ratio * 0.4})`,
                boxShadow: live ? "0 0 14px var(--color-lumen)" : undefined,
                transitionDelay: `${index * 70}ms`,
              }}
              className="w-full rounded-t-[3px] transition-[height] duration-700 ease-out"
            />
          </span>
        );
      })}
    </div>
  );
}

export interface PodiumProps {
  rows: Array<{ name: string; points: number; tint: string; isYou: boolean }>;
  className?: string;
}

const STANDS = [
  { order: 1, height: 74, place: 1 },
  { order: 0, height: 54, place: 2 },
  { order: 2, height: 40, place: 3 },
];

export function Podium({ rows, className }: PodiumProps) {
  const shown = useReveal(160);
  if (rows.length < 3) return null;

  return (
    <div className={cn("flex items-end justify-center gap-2", className)}>
      {STANDS.map((stand) => {
        const row = rows[stand.place - 1];
        if (!row) return null;

        return (
          <div
            key={stand.place}
            style={{ order: stand.order }}
            className="flex min-w-0 flex-1 flex-col items-center"
          >
            <span
              className={cn(
                "max-w-full truncate text-[0.6875rem] font-bold",
                row.isYou ? "text-lumen" : "text-white/80",
              )}
            >
              {row.name}
            </span>
            <span className="mb-1.5 font-display text-sm font-bold tabular-nums text-white">
              {row.points}
            </span>
            <span
              style={{
                height: shown ? stand.height : 0,
                background: `linear-gradient(180deg, ${row.tint} 0%, transparent 220%)`,
                transitionDelay: `${stand.place * 90}ms`,
              }}
              className="grid w-full place-items-start justify-center rounded-t-[--radius-field] pt-1.5 transition-[height] duration-700 ease-out"
            >
              <span className="font-display text-lg font-bold text-cosmos/70">
                {stand.place}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface PopProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Pop({ children, delay = 0, className }: PopProps) {
  const shown = useReveal(delay);

  return (
    <div className={cn(shown ? "animate-pop-in" : "opacity-0", className)}>
      {children}
    </div>
  );
}
