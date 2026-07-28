import type { MasteryTier } from "@/lib/services/mastery";
import { cn } from "@/lib/ui/cn";

export const TIER_TINT: Record<MasteryTier, string> = {
  dim: "var(--color-line-strong)",
  lit: "var(--color-ray-1)",
  bright: "var(--color-ray-2)",
  radiant: "var(--color-ray-3)",
  prism: "var(--color-lumen)",
};

export const TIER_NAME: Record<MasteryTier, string> = {
  dim: "Dim",
  lit: "Lit",
  bright: "Bright",
  radiant: "Radiant",
  prism: "Prism",
};

export const TIER_MEANING: Record<MasteryTier, string> = {
  dim: "Not started",
  lit: "Lesson finished",
  bright: "Quiz passed",
  radiant: "Held for a week",
  prism: "Held for a month",
};

export interface TierDotProps {
  tier: MasteryTier;
  size?: number;
  glow?: boolean;
  className?: string;
}

export function TierDot({ tier, size = 12, glow = true, className }: TierDotProps) {
  const tint = TIER_TINT[tier];
  const on = tier !== "dim";

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: on ? tint : "transparent",
        borderColor: tint,
        boxShadow: on && glow ? `0 0 ${size}px ${tint}` : undefined,
      }}
      className={cn("inline-block shrink-0 rounded-full border-2", className)}
    />
  );
}

export interface TierScaleProps {
  tier: MasteryTier;
  className?: string;
}

const ORDER: MasteryTier[] = ["lit", "bright", "radiant", "prism"];

export function TierScale({ tier, className }: TierScaleProps) {
  const reached = ORDER.indexOf(tier);

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`${TIER_NAME[tier]} — ${TIER_MEANING[tier]}`}
    >
      {ORDER.map((step, index) => (
        <span
          key={step}
          aria-hidden="true"
          style={{
            background: index <= reached ? TIER_TINT[step] : "transparent",
            borderColor: index <= reached ? TIER_TINT[step] : "var(--color-line-strong)",
          }}
          className="h-1.5 w-4 rounded-full border"
        />
      ))}
    </span>
  );
}
