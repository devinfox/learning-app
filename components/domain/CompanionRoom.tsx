"use client";

import { Plus } from "lucide-react";
import { TONE_VAR, rewardById } from "@/lib/gamification/catalog";
import type { Reward, RoomSlot } from "@/lib/gamification/types";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/ui/cn";
import { DressedOrb } from "./DressedOrb";

function Slot({
  slot,
  reward,
  size,
  onSlot,
  className,
}: {
  slot: RoomSlot;
  reward: Reward | undefined;
  size: number;
  onSlot?: (slot: RoomSlot) => void;
  className?: string;
}) {
  const Icon = reward?.icon;
  const label = reward
    ? `${EMPTY_LABEL[slot]}: ${reward.name}. Change it.`
    : `Add something to the ${EMPTY_LABEL[slot].toLowerCase()}`;

  const inner = reward && Icon ? (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-[-30%] rounded-full blur-xl"
        style={{ background: TONE_VAR[reward.tone], opacity: 0.3 }}
      />
      <Icon
        size={size * 0.54}
        strokeWidth={1.6}
        style={{
          color: TONE_VAR[reward.tone],
          filter: `drop-shadow(0 0 6px ${TONE_VAR[reward.tone]})`,
        }}
        aria-hidden="true"
      />
    </>
  ) : (
    <Plus size={size * 0.32} className="text-white/30" aria-hidden="true" />
  );

  const shared = cn(
    "absolute grid place-items-center rounded-2xl transition duration-200",
    reward ? "glass" : "border border-dashed border-white/20 bg-white/[0.03]",
    className,
  );

  if (!onSlot) {
    return (
      <div className={shared} style={{ width: size, height: size }}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSlot(slot)}
      aria-label={label}
      className={cn(shared, "hover:scale-105 hover:border-white/25 active:scale-95")}
      style={{ width: size, height: size }}
    >
      {inner}
    </button>
  );
}

export interface CompanionRoomProps {
  room: Record<string, string>;
  equipped: Record<string, string>;
  nickname?: string | null;
  onSlot?: (slot: RoomSlot) => void;
  className?: string;
}

const EMPTY_LABEL: Record<RoomSlot, string> = {
  backdrop: "Backdrop",
  floor: "Floor",
  shelf: "Shelf",
  wall: "Wall",
  pet: "Friend",
};

export function CompanionRoom({
  room,
  equipped,
  nickname,
  onSlot,
  className,
}: CompanionRoomProps) {
  const backdrop = rewardById(room.backdrop ?? "");
  const wall = rewardById(room.wall ?? "");
  const shelf = rewardById(room.shelf ?? "");
  const floor = rewardById(room.floor ?? "");
  const pet = rewardById(room.pet ?? "");

  return (
    <div
      className={cn(
        "arcade-grid relative isolate aspect-[4/3] w-full overflow-hidden",
        "rounded-[--radius-sheet] bg-cosmos ring-1 ring-white/10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: backdrop
            ? `radial-gradient(120% 90% at 50% 0%, ${TONE_VAR[backdrop.tone]}44, transparent 68%)`
            : "radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.07), transparent 68%)",
        }}
      />

      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          background:
            "linear-gradient(180deg, rgb(0 0 0 / 0.32), rgb(0 0 0 / 0.55))",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[26%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.28), transparent)",
        }}
      />

      <Slot slot="wall" reward={wall} size={54} onSlot={onSlot} className="left-[10%] top-[12%]" />
      <Slot slot="shelf" reward={shelf} size={54} onSlot={onSlot} className="right-[10%] top-[16%]" />
      <Slot slot="floor" reward={floor} size={58} onSlot={onSlot} className="left-[13%] bottom-[10%]" />
      <Slot slot="pet" reward={pet} size={48} onSlot={onSlot} className="right-[14%] bottom-[12%]" />

      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[64%] h-6 w-28 -translate-x-1/2 rounded-[50%] bg-white/25 blur-lg"
        />
        <DressedOrb equipped={equipped} size={112} mood="pleased" live state="idle" />
      </div>

      {nickname && (
        <div data-ground="cosmos" className="absolute inset-x-0 bottom-2 text-center">
          <Text variant="caption" tone="muted">
            {nickname}
          </Text>
        </div>
      )}

      {onSlot && (
        <button
          type="button"
          onClick={() => onSlot("backdrop")}
          className="glass absolute right-3 top-3 rounded-full px-3.5 py-1.5 text-caption font-medium text-white transition hover:brightness-125"
        >
          Backdrop
        </button>
      )}
    </div>
  );
}
