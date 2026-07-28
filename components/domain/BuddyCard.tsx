"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/Text";
import { api } from "@/lib/api";
import { rewardById } from "@/lib/gamification/catalog";
import { cn } from "@/lib/ui/cn";
import { DressedOrb } from "./DressedOrb";

interface Wire {
  id: string;
  name: string;
  reason: string;
  earnedAt: string;
}

interface Payload {
  companion: { equipped: Record<string, string>; nickname: string | null };
  earned: Wire[];
  unseenIds: string[];
}

export interface BuddyCardProps {
  onOpen: () => void;
  className?: string;
}

export function BuddyCard({ onOpen, className }: BuddyCardProps) {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    api<Payload>("/api/companion")
      .then(setData)
      .catch(() => undefined);
  }, []);

  if (!data) return null;

  const latest = data.earned[0];
  const unseen = data.unseenIds.length;
  const reward = latest ? rewardById(latest.id) : undefined;
  const Icon = reward?.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "relative flex w-full items-center gap-4 overflow-hidden bg-cosmos",
        "rounded-[--radius-card] p-4 text-left ring-1 ring-white/10 transition",
        "hover:ring-white/20 active:scale-[0.99]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgb(169 139 255 / 0.32) 0%, rgb(53 198 222 / 0.14) 38%, transparent 72%)",
        }}
      />
      <span className="relative z-10 shrink-0">
        <DressedOrb
          equipped={data.companion.equipped}
          size={64}
          mood={unseen > 0 ? "delighted" : "pleased"}
          live
          state={unseen > 0 ? "celebrating" : "idle"}
        />
        {unseen > 0 && (
          <span
            aria-label={`${unseen} not opened yet`}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lumen px-1.5 text-[0.625rem] font-bold text-cosmos"
          >
            {unseen}
          </span>
        )}
      </span>

      <span data-ground="cosmos" className="relative z-10 min-w-0 flex-1">
        <Text variant="label" as="span" className="block">
          {data.companion.nickname ?? "Your buddy"}
        </Text>
        {latest && Icon ? (
          <span className="mt-1 flex items-center gap-1.5">
            <Icon size={14} className="shrink-0 text-lumen" aria-hidden="true" />
            <Text variant="caption" tone="muted" as="span" className="truncate">
              {latest.name} — {latest.reason}
            </Text>
          </span>
        ) : (
          <Text variant="caption" tone="muted" as="span" className="mt-1 block">
            Finish a chapter and it&rsquo;ll have something to show you.
          </Text>
        )}
      </span>

      <ChevronRight size={20} className="relative z-10 shrink-0 text-white/50" aria-hidden="true" />
    </button>
  );
}
