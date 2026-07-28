"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { TONE_VAR } from "@/lib/gamification/catalog";
import type { EarnedReward } from "@/lib/gamification/types";
import { cn } from "@/lib/ui/cn";
import { Companion } from "./Companion";

export interface RewardUnlockProps {
  rewards: EarnedReward[];
  occasion: string;
  onClose: () => void;
  closeLabel?: string;
}

export function RewardUnlock({
  rewards,
  occasion,
  onClose,
  closeLabel = "Nice",
}: RewardUnlockProps) {
  const [index, setIndex] = useState(0);
  const [revealedIndex, setRevealedIndex] = useState(-1);

  const reward = rewards[index];
  const isLast = index === rewards.length - 1;

  useEffect(() => {
    const timer = setTimeout(() => setRevealedIndex(index), 420);
    return () => clearTimeout(timer);
  }, [index]);

  const revealed = revealedIndex === index;

  if (!reward) return null;

  const Icon = reward.reward.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${occasion}. You unlocked ${reward.reward.name}.`}
      className="fixed inset-0 z-50 grid place-items-center bg-cosmos/85 p-5 backdrop-blur-md"
    >
      <div
        data-ground="cosmos"
        className="arcade-grid glass relative w-full max-w-[24rem] overflow-hidden rounded-[--radius-sheet] p-7 text-center"
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-[-30%] -top-1/2 h-[120%] blur-3xl transition-opacity duration-700",
            revealed ? "opacity-40" : "opacity-15",
          )}
          style={{ background: TONE_VAR[reward.reward.tone] }}
        />
        <p className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/60">
          {occasion}
        </p>

        <div className="relative mx-auto mt-5 grid h-[9.5rem] w-[9.5rem] place-items-center">
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-[-25%] rounded-full blur-2xl transition-opacity duration-700",
              revealed ? "opacity-70" : "opacity-25",
            )}
            style={{ background: TONE_VAR[reward.reward.tone] }}
          />
          <Companion state="celebrating" size={152} />
        </div>

        <div
          className={cn(
            "mt-6 transition-all duration-500",
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-cosmos/70 ring-1 ring-white/15">
            <Icon
              size={30}
              strokeWidth={1.9}
              style={{
                color: TONE_VAR[reward.reward.tone],
                filter: `drop-shadow(0 0 10px ${TONE_VAR[reward.reward.tone]})`,
              }}
              aria-hidden="true"
            />
          </span>

          <Text variant="h2" className="mt-4 block">
            {reward.reward.name}
          </Text>
          <Text variant="body" tone="muted" className="mt-2 block">
            {reward.reward.blurb}
          </Text>

          <Text variant="caption" tone="subtle" className="mt-4 block">
            {reward.reason}
          </Text>
        </div>

        <Button
          fullWidth
          size="lg"
          className="relative mt-7"
          onClick={() => (isLast ? onClose() : setIndex(index + 1))}
        >
          {isLast ? closeLabel : `Next (${index + 2} of ${rewards.length})`}
        </Button>
      </div>
    </div>
  );
}
