"use client";

import { Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanionRoom, Orb, OrbStage, RewardTile } from "@/components/domain";
import {
  AppShell,
  Button,
  MobileMasthead,
  Sheet,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPost } from "@/lib/api";
import {
  EYE_LOOKS,
  GLOW_LOOKS,
  HAIR_LOOKS,
  LOOK_SLOT_LABEL,
  LOOK_SLOTS,
  eyeLookById,
  glowLookById,
  hairLookById,
  lookFromEquipped,
  type LookSlot,
} from "@/lib/companion/looks";
import { cn } from "@/lib/ui/cn";
import { TONE_VAR, rewardById } from "@/lib/gamification/catalog";
import {
  COMPANION_SLOTS,
  ROOM_SLOTS,
  type EarnedReward,
  type LockedReward,
  type RewardSlot,
} from "@/lib/gamification/types";

interface Wire {
  id: string;
  name: string;
  blurb: string;
  slot: RewardSlot;
  subjectSlug: string | null;
  earnedAt?: string;
  reason?: string;
  requirement?: string;
  progress?: number | null;
}

interface CompanionPayload {
  companion: {
    equipped: Record<string, string>;
    room: Record<string, string>;
    nickname: string | null;
  };
  earned: Wire[];
  locked: Wire[];
  unseenIds: string[];
}

function toEntry(row: Wire): EarnedReward | LockedReward | null {
  const reward = rewardById(row.id);
  if (!reward) return null;

  return row.earnedAt
    ? { reward, earnedAt: row.earnedAt, reason: row.reason ?? "" }
    : { reward, requirement: row.requirement ?? "", progress: row.progress ?? null };
}

const SLOT_LABEL: Record<string, string> = {
  hat: "Hat",
  held: "Holding",
  aura: "Aura badge",
  badge: "Badge",
  backdrop: "Backdrop",
  floor: "Floor",
  shelf: "Shelf",
  wall: "Wall",
  pet: "Friend",
  ...LOOK_SLOT_LABEL,
};

function CompanionScreen() {
  const toast = useToast();
  const [data, setData] = useState<CompanionPayload | null>(null);
  const [tab, setTab] = useState("look");
  const [picking, setPicking] = useState<RewardSlot | null>(null);
  const [lookSlot, setLookSlot] = useState<LookSlot | null>(null);
  const [naming, setNaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  const load = useCallback(() => {
    api<CompanionPayload>("/api/companion")
      .then((result) => {
        setData(result);
        setDraftName(result.companion.nickname ?? "");
      })
      .catch(() => toast.show("Couldn't load your buddy.", "error"));
  }, [toast]);

  useEffect(load, [load]);

  const entries = useMemo(() => {
    if (!data) return { earned: [], locked: [] };
    return {
      earned: data.earned.map(toEntry).filter(Boolean) as EarnedReward[],
      locked: data.locked.map(toEntry).filter(Boolean) as LockedReward[],
    };
  }, [data]);

  const unseen = useMemo(() => new Set(data?.unseenIds ?? []), [data]);

  useEffect(() => {
    if (!data || data.unseenIds.length === 0) return;
    void apiPost("/api/companion", { kind: "seen", rewardIds: data.unseenIds }).catch(
      () => undefined,
    );
  }, [data]);

  async function choose(slot: string, rewardId: string | null) {
    setPicking(null);
    setLookSlot(null);
    try {
      const result = await apiPost<{ companion: CompanionPayload["companion"] }>(
        "/api/companion",
        { kind: "equip", slot, rewardId },
      );
      setData((previous) => (previous ? { ...previous, companion: result.companion } : previous));
    } catch {
      toast.show("Couldn't change that just now.", "error");
    }
  }

  async function saveName() {
    setNaming(false);
    try {
      const result = await apiPost<{ companion: CompanionPayload["companion"] }>(
        "/api/companion",
        { kind: "nickname", nickname: draftName },
      );
      setData((previous) => (previous ? { ...previous, companion: result.companion } : previous));
    } catch {
      toast.show("Couldn't save that name.", "error");
    }
  }

  if (!data) {
    return (
      <AppShell>
        <MobileMasthead />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-56 rounded-[--radius-card]" />
        </div>
      </AppShell>
    );
  }

  const { companion } = data;
  const equippedIds = new Set(Object.values(companion.equipped));
  const roomIds = new Set(Object.values(companion.room));

  const optionsFor = (slot: RewardSlot) =>
    entries.earned.filter((row) => row.reward.slot === slot);

  return (
    <AppShell ground="cosmos">
      <MobileMasthead />

      <header className="px-5 pt-4 lg:pt-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          Earned, not bought
        </p>
        <Text variant="display" className="mt-1.5 block text-white">
          {companion.nickname ?? "Your buddy"}
        </Text>
        <p className="mt-2 max-w-[46ch] text-body text-white/60">
          Everything here came from something you actually did. Tap a piece to
          see what earned it.
        </p>
        <span
          aria-hidden="true"
          className="mt-4 block h-[3px] w-16 rounded-full bg-spectrum"
        />
      </header>

      <div className="mt-6 px-5">
        <div
          role="tablist"
          aria-label="Companion sections"
          className="glass flex gap-1 rounded-full p-1"
        >
          {[
            { id: "look", label: "Look", count: undefined as number | undefined },
            { id: "room", label: "Room", count: undefined as number | undefined },
            { id: "milestones", label: "Milestones", count: entries.earned.length },
          ].map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2",
                  "px-2 text-[0.8125rem] font-semibold transition sm:px-3 sm:text-caption",
                  active
                    ? "bg-white text-cosmos shadow-[0_0_20px_-4px_rgb(255_255_255/0.6)]"
                    : "text-white/55 hover:text-white",
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 text-[0.6875rem] tabular-nums",
                      active ? "bg-cosmos/10 text-cosmos" : "bg-white/10 text-white/70",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "look" && (
        <>
          <div className="mt-6 px-5">
            <OrbStage
              equipped={companion.equipped}
              live
              caption={
                <button
                  type="button"
                  onClick={() => setNaming(true)}
                  className="glass flex items-center gap-2 rounded-full px-4 py-2 text-white transition hover:brightness-125"
                >
                  <Text variant="label" as="span">
                    {companion.nickname ?? "Give it a name"}
                  </Text>
                  <Pencil size={14} aria-hidden="true" />
                </button>
              }
            />
          </div>

          <SectionHead title="Customize Lottie" />
          <p className="mb-3 px-5 text-caption text-white/45">
            Free looks — always available. Pick eyes, glow, and a hairstyle.
          </p>
          <div className="grid grid-cols-3 gap-3 px-5">
            {LOOK_SLOTS.map((slot) => {
              const look = lookFromEquipped(companion.equipped);
              const current =
                slot === "eyes"
                  ? eyeLookById(look.eyes)
                  : slot === "glow"
                    ? glowLookById(look.glow)
                    : hairLookById(look.hair);
              const swatch =
                "swatch" in current ? current.swatch : "#C4B0FF";

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setLookSlot(slot)}
                  className="glass relative flex flex-col items-center gap-2.5 overflow-hidden rounded-[--radius-card] p-4 transition hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-0 size-16 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-50 blur-xl"
                    style={{ background: swatch }}
                  />
                  <span
                    className="relative size-10 rounded-full ring-2 ring-white/25 shadow-[0_0_16px_-2px_rgb(255_255_255/0.35)]"
                    style={{
                      background:
                        slot === "eyes"
                          ? `radial-gradient(circle at 35% 30%, #fff 0%, ${swatch} 55%, #1a1030 100%)`
                          : slot === "glow"
                            ? `radial-gradient(circle, ${swatch} 0%, transparent 70%)`
                            : swatch,
                    }}
                  />
                  <span className="relative text-center">
                    <span className="block text-[0.6875rem] uppercase tracking-wide text-white/45">
                      {LOOK_SLOT_LABEL[slot]}
                    </span>
                    <span className="mt-0.5 block text-caption font-semibold text-white">
                      {current.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <SectionHead title="What it's wearing" />
          <div className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-4">
            {COMPANION_SLOTS.map((slot) => {
              const worn = rewardById(companion.equipped[slot] ?? "");
              const Icon = worn?.icon;
              const tone = worn ? TONE_VAR[worn.tone] : null;

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setPicking(slot)}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 overflow-hidden rounded-[--radius-card] p-4",
                    "transition duration-200 hover:-translate-y-0.5",
                    worn ? "glass" : "glass-sunken",
                  )}
                >
                  {tone && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-0 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-2xl"
                      style={{ background: tone }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative grid size-11 place-items-center rounded-full",
                      worn ? "bg-white/10 ring-1 ring-white/15" : "bg-white/[0.05]",
                    )}
                  >
                    {Icon && tone ? (
                      <Icon
                        size={20}
                        aria-hidden="true"
                        style={{ color: tone, filter: `drop-shadow(0 0 6px ${tone})` }}
                      />
                    ) : (
                      <Plus size={18} className="text-white/35" aria-hidden="true" />
                    )}
                  </span>
                  <span className="relative">
                    <span className="block text-[0.6875rem] uppercase tracking-wide text-white/45">
                      {SLOT_LABEL[slot]}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-caption font-semibold",
                        worn ? "text-white" : "text-white/35",
                      )}
                    >
                      {worn?.name ?? "Empty"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {tab === "room" && (
        <>
          <div className="mt-6 px-5">
            <CompanionRoom
              room={companion.room}
              equipped={companion.equipped}
              nickname={companion.nickname}
              onSlot={(slot) => setPicking(slot)}
            />
            <p className="mt-3 text-caption text-white/45">
              Tap any spot to put something there. Nothing in this room needs
              looking after — it just stays how you leave it.
            </p>
          </div>

          <SectionHead title="Things for the room" />
          <div className="grid grid-cols-3 gap-3 px-5 sm:grid-cols-4">
            {[...entries.earned, ...entries.locked]
              .filter((row) => ROOM_SLOTS.includes(row.reward.slot as never))
              .map((row) => (
                <RewardTile
                  key={row.reward.id}
                  entry={row}
                  equipped={roomIds.has(row.reward.id)}
                  unseen={unseen.has(row.reward.id)}
                  onClick={() => choose(row.reward.slot, row.reward.id)}
                />
              ))}
          </div>
        </>
      )}

      {tab === "milestones" && (
        <>
          <SectionHead title="Earned" count={entries.earned.length} />
          <div className="grid grid-cols-3 gap-3 px-5 sm:grid-cols-4">
            {entries.earned.map((row) => (
              <RewardTile
                key={row.reward.id}
                entry={row}
                equipped={equippedIds.has(row.reward.id) || roomIds.has(row.reward.id)}
                unseen={unseen.has(row.reward.id)}
                onClick={() => choose(row.reward.slot, row.reward.id)}
              />
            ))}
          </div>

          <SectionHead title="Still out there" count={entries.locked.length} />
          <p className="mb-3 px-5 text-caption text-white/45">
            Nothing here is hidden or random — each one says exactly what earns it.
          </p>
          <div className="grid grid-cols-3 gap-3 px-5 sm:grid-cols-4">
            {entries.locked.map((row) => (
              <RewardTile key={row.reward.id} entry={row} />
            ))}
          </div>
        </>
      )}

      <Sheet
        open={picking !== null}
        onClose={() => setPicking(null)}
        title={picking ? SLOT_LABEL[picking] : ""}
      >
        {picking && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {optionsFor(picking).map((row) => (
                <RewardTile
                  key={row.reward.id}
                  entry={row}
                  equipped={
                    (ROOM_SLOTS.includes(picking as never)
                      ? companion.room[picking]
                      : companion.equipped[picking]) === row.reward.id
                  }
                  onClick={() => choose(picking, row.reward.id)}
                />
              ))}
            </div>

            {optionsFor(picking).length === 0 && (
              <Text variant="body" tone="muted">
                Nothing for this spot yet. Finish a chapter and something will
                turn up.
              </Text>
            )}

            <Button variant="secondary" fullWidth onClick={() => choose(picking, null)}>
              Leave it empty
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet
        open={lookSlot !== null}
        onClose={() => setLookSlot(null)}
        title={lookSlot ? `Customize · ${LOOK_SLOT_LABEL[lookSlot]}` : ""}
      >
        {lookSlot && (
          <LookPicker
            slot={lookSlot}
            equipped={companion.equipped}
            onPick={(id) => choose(lookSlot, id)}
          />
        )}
      </Sheet>

      <Sheet open={naming} onClose={() => setNaming(false)} title="Name your buddy">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Orb size={72} mood="pleased" equipped={companion.equipped} />
          </div>
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            maxLength={24}
            placeholder="Type a name"
            className="w-full rounded-[--radius-field] border border-line bg-surface px-4 py-3 text-body text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <Button fullWidth onClick={saveName}>
            Save
          </Button>
        </div>
      </Sheet>
    </AppShell>
  );
}

function SectionHead({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mt-9 flex items-center gap-3 px-5 pb-4">
      <h2 className="font-display text-[1.0625rem] font-semibold text-white">{title}</h2>
      {count !== undefined && (
        <span className="glass rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold tabular-nums text-white">
          {count}
        </span>
      )}
      <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function LookPicker({
  slot,
  equipped,
  onPick,
}: {
  slot: LookSlot;
  equipped: Record<string, string>;
  onPick: (id: string) => void;
}) {
  const current = lookFromEquipped(equipped);
  const selected =
    slot === "eyes" ? current.eyes : slot === "glow" ? current.glow : current.hair;

  const options =
    slot === "eyes" ? EYE_LOOKS : slot === "glow" ? GLOW_LOOKS : HAIR_LOOKS;

  const groups =
    slot === "hair"
      ? [
          { label: "Default", items: HAIR_LOOKS.filter((h) => h.group === "none") },
          {
            label: "Softer styles",
            items: HAIR_LOOKS.filter((h) => h.group === "feminine" || h.group === "any"),
          },
          {
            label: "Shorter styles",
            items: HAIR_LOOKS.filter((h) => h.group === "masculine"),
          },
        ]
      : [{ label: null as string | null, items: options }];

  return (
    <div className="space-y-5">
      <div className="flex justify-center py-2">
        <Orb
          size={96}
          mood="pleased"
          equipped={{
            ...equipped,
            // live preview of hover isn't needed — sheet updates after pick
          }}
        />
      </div>

      {groups.map((group) => (
        <div key={group.label ?? "all"}>
          {group.label && (
            <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {group.label}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {group.items.map((item) => {
              const active = selected === item.id;
              const swatch = item.swatch;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPick(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-[--radius-card] p-3 transition",
                    "ring-1",
                    active
                      ? "bg-accent-soft ring-brand shadow-[0_0_0_1px_var(--color-brand)]"
                      : "bg-surface-sunken ring-line hover:bg-surface",
                  )}
                >
                  <span
                    className="size-10 rounded-full ring-1 ring-black/5"
                    style={{
                      background:
                        slot === "eyes"
                          ? `radial-gradient(circle at 35% 30%, #fff 0%, ${swatch} 50%, #1a1030 100%)`
                          : slot === "glow"
                            ? `radial-gradient(circle, ${swatch} 0%, ${swatch}88 40%, transparent 70%)`
                            : `linear-gradient(145deg, ${"highlight" in item ? item.highlight : swatch} 0%, ${swatch} 50%, ${"shadow" in item ? item.shadow : swatch} 100%)`,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "text-center text-[0.75rem] font-semibold leading-tight",
                      active ? "text-brand" : "text-ink-muted",
                    )}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <CompanionScreen />
    </ToastProvider>
  );
}
