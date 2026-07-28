"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export type ProgressTone = "lumen" | "spectrum" | "brand" | "cosmos";

const BAR_TONES: Record<ProgressTone, string> = {
  lumen: "bg-lumen-deep",
  spectrum: "bg-spectrum",
  brand: "bg-brand",
  cosmos: "bg-cosmos",
};

export interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  tone = "lumen",
  size = "sm",
  label,
  className,
}: ProgressBarProps) {
  const percent = clampPercent(value);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "w-full overflow-hidden rounded-full bg-line",
        size === "sm" ? "h-1.5" : "h-2",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", BAR_TONES[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  tone?: ProgressTone;
  children?: ReactNode;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 132,
  thickness = 12,
  tone = "lumen",
  children,
  label = "Subject progress",
  className,
}: ProgressRingProps) {
  const percent = clampPercent(value);
  const gradientId = useId();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const solid =
    tone === "lumen"
      ? "var(--color-lumen-deep)"
      : tone === "brand"
        ? "var(--color-brand)"
        : "var(--color-cosmos)";

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn("relative grid shrink-0 place-items-center", className)}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {tone === "spectrum" && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-ray-1)" />
              <stop offset="0.34" stopColor="var(--color-ray-2)" />
              <stop offset="0.67" stopColor="var(--color-ray-3)" />
              <stop offset="1" stopColor="var(--color-ray-4)" />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone === "spectrum" ? `url(#${gradientId})` : solid}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        {children ?? (
          <span
            className="font-display font-bold tabular-nums text-ink"
            style={{ fontSize: size * 0.22 }}
          >
            {percent}%
          </span>
        )}
      </span>
    </div>
  );
}

export interface StepDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function StepDots({ total, current, className }: StepDotsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden="true">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === current ? "w-5 bg-cosmos" : "w-1.5 bg-line-strong",
          )}
        />
      ))}
    </div>
  );
}
