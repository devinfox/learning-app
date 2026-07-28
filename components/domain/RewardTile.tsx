"use client";

import { Check, Lock } from "lucide-react";
import { TONE_VAR } from "@/lib/gamification/catalog";
import type { EarnedReward, LockedReward } from "@/lib/gamification/types";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/ui/cn";

export interface RewardTileProps {
  entry: EarnedReward | LockedReward;
  equipped?: boolean;
  unseen?: boolean;
  onClick?: () => void;
  className?: string;
}

function isEarned(entry: EarnedReward | LockedReward): entry is EarnedReward {
  return "earnedAt" in entry;
}

export function RewardTile({
  entry,
  equipped,
  unseen,
  onClick,
  className,
}: RewardTileProps) {
  const earned = isEarned(entry);
  const { reward } = entry;
  const Icon = reward.icon;
  const tone = TONE_VAR[reward.tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!earned}
      aria-pressed={earned ? Boolean(equipped) : undefined}
      style={
        equipped
          ? { borderColor: tone, boxShadow: `0 0 0 1px ${tone}, 0 0 24px -4px ${tone}` }
          : undefined
      }
      className={cn(
        "group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-[--radius-card] p-3.5 text-center",
        "transition duration-200",
        earned
          ? "glass hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          : "glass-sunken cursor-default",
        className,
      )}
    >
      {earned && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 top-0 size-24 -translate-x-1/2 -translate-y-1/3 rounded-full blur-2xl transition-opacity",
            unseen ? "animate-neon-pulse opacity-90" : "opacity-45 group-hover:opacity-75",
          )}
          style={{ background: tone }}
        />
      )}

      {unseen && (
        <span
          aria-label="Not opened yet"
          className="absolute right-2.5 top-2.5 size-2 rounded-full bg-lumen shadow-[0_0_10px_var(--color-lumen)]"
        />
      )}

      {equipped && (
        <span
          className="absolute left-2.5 top-2.5 grid size-5 place-items-center rounded-full text-cosmos"
          style={{ background: tone }}
        >
          <Check size={12} strokeWidth={3.5} aria-hidden="true" />
        </span>
      )}

      <span
        className={cn(
          "relative grid size-14 shrink-0 place-items-center rounded-2xl",
          earned ? "bg-white/10 ring-1 ring-white/15" : "bg-white/[0.04]",
        )}
      >
        {earned ? (
          <Icon
            size={26}
            strokeWidth={1.9}
            style={{ color: tone, filter: `drop-shadow(0 0 8px ${tone})` }}
            aria-hidden="true"
          />
        ) : (
          <Lock size={19} className="text-white/25" aria-hidden="true" />
        )}
      </span>

      <span className="relative min-w-0">
        <Text
          variant="caption"
          as="span"
          className={cn("block font-semibold", earned ? "text-white" : "text-white/45")}
        >
          {reward.name}
        </Text>
        <span
          className={cn(
            "mt-0.5 line-clamp-2 block text-[0.6875rem] leading-snug",
            earned ? "text-white/60" : "text-white/35",
          )}
        >
          {earned ? entry.reason : entry.requirement}
        </span>
      </span>

      {!earned && entry.progress !== null && entry.progress > 0 && (
        <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${Math.round(entry.progress * 100)}%`,
              background: tone,
              boxShadow: `0 0 8px ${tone}`,
            }}
          />
        </span>
      )}
    </button>
  );
}
