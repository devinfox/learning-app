"use client";

import { ChevronDown, Flame, Timer, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CountUp,
  LevelBadge,
  MeterBar,
  Podium,
  Pop,
  ProgressNav,
  RankDelta,
  SparkBurst,
  StreakPips,
  useReveal,
} from "@/components/domain";
import {
  AppShell,
  MobileMasthead,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api } from "@/lib/api";
import { cn } from "@/lib/ui/cn";

interface HouseWire {
  id: string;
  name: string;
  motto: string;
  tint: string;
  points: number;
  members: number;
  share: number;
  leading: boolean;
  behindLeader: number;
  roster: Array<{ name: string; thisWeek: number; isYou: boolean }>;
}

interface Payload {
  you: {
    houseId: string;
    rank: number | null;
    movement: number;
    thisWeek: number;
    lastWeek: number;
    bestWeek: number;
    total: number;
    activeWeeks: number;
    level: { level: number; into: number; need: number; percent: number; ceiling: number };
    beatingBest: boolean;
    weekResetsAt: string;
    toNextRank: number;
  };
  houses: HouseWire[];
  division: Array<{
    rank: number;
    name: string;
    houseId: string;
    houseName: string;
    tint: string;
    thisWeek: number;
    level: number;
    movement: number;
    isYou: boolean;
  }>;
  leaderWeek: number;
  learnerCount: number;
  breakdown: Array<{ source: string; label: string; points: number; count: number }>;
  weeks: Array<{ startsAt: string; points: number }>;
  recent: Array<{ id: string; at: string; label: string; detail: string; points: number }>;
}

function untilReset(iso: string): string {
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return "Resetting now";
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return `${Math.max(1, hours)}h left`;
  return `${Math.round(hours / 24)}d left`;
}

function ScoreboardScreen() {
  const toast = useToast();
  const [data, setData] = useState<Payload | null>(null);
  const [openHouse, setOpenHouse] = useState<string | null>(null);
  const banner = useReveal(600);

  const load = useCallback(() => {
    api<Payload>("/api/scoreboard")
      .then(setData)
      .catch(() => toast.show("Couldn't load the scoreboard.", "error"));
  }, [toast]);

  useEffect(load, [load]);

  if (!data) {
    return (
      <AppShell ground="cosmos">
        <MobileMasthead />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-56 rounded-[--radius-card]" />
          <Skeleton className="h-52 rounded-[--radius-card]" />
        </div>
      </AppShell>
    );
  }

  const { you, houses } = data;
  const yourHouse = houses.find((row) => row.id === you.houseId);
  const delta = you.thisWeek - you.lastWeek;
  const peakWeek = Math.max(1, ...data.weeks.map((row) => row.points));
  const podium = data.division.filter((row) => row.rank <= 3 && row.thisWeek > 0);

  return (
    <AppShell ground="cosmos">
      <MobileMasthead />

      <header className="px-5 pt-4 lg:pt-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          {yourHouse ? `House ${yourHouse.name}` : "This week"}
        </p>
        <Text variant="display" className="mt-1.5 block text-white">
          Scoreboard
        </Text>
        <span aria-hidden="true" className="mt-4 block h-[3px] w-16 rounded-full bg-spectrum" />
      </header>

      <div className="mt-6 px-5">
        <ProgressNav ground="cosmos" />
      </div>

      <section className="mt-6 px-5">
        <div className="glass arcade-grid relative overflow-hidden rounded-[--radius-card] p-5">
          <SparkBurst fire={you.beatingBest && banner} count={16} spread={150} />

          <div className="relative flex items-center gap-4">
            <LevelBadge
              level={you.level.level}
              tint={yourHouse?.tint ?? "var(--color-ray-1)"}
              size={52}
            />

            <div className="min-w-0 flex-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                Your week
              </p>
              <p className="font-display text-[3.25rem] font-bold leading-none tabular-nums text-lumen">
                <CountUp to={you.thisWeek} duration={1100} />
              </p>
            </div>

            <div className="shrink-0 text-right">
              {you.rank !== null && data.learnerCount > 1 && (
                <>
                  <p className="font-display text-3xl font-bold leading-none tabular-nums text-white">
                    #{you.rank}
                  </p>
                  <span className="mt-1 flex items-center justify-end gap-1">
                    <RankDelta movement={you.movement} />
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative mt-5">
            <div className="flex items-baseline justify-between gap-2 pb-1.5">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-white/45">
                Level {you.level.level}
              </span>
              <span className="text-[0.6875rem] font-bold tabular-nums text-white/70">
                {you.level.need} to level {you.level.level + 1}
              </span>
            </div>
            <MeterBar
              value={you.level.percent}
              tint="var(--color-lumen)"
              height={12}
              delay={300}
              label={`Level ${you.level.level} progress`}
            />
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5 text-caption text-white/60">
              {delta === 0 ? (
                <span>Level with last week</span>
              ) : delta > 0 ? (
                <>
                  <TrendingUp size={14} className="text-verdant-ink" aria-hidden="true" />
                  <span className="font-semibold text-white">+{delta}</span>
                  <span>on last week</span>
                </>
              ) : (
                <>
                  <TrendingDown size={14} className="text-ember-ink" aria-hidden="true" />
                  <span className="font-semibold text-white">{Math.abs(delta)}</span>
                  <span>behind last week</span>
                </>
              )}
            </span>

            {you.activeWeeks > 1 && (
              <span className="flex items-center gap-1.5 text-caption text-white/60">
                <Flame size={14} className="text-lumen" aria-hidden="true" />
                <span className="font-semibold text-white">{you.activeWeeks}</span>
                <span>weeks running</span>
              </span>
            )}

            <span className="ml-auto flex items-center gap-1 text-[0.6875rem] text-white/45">
              <Timer size={12} aria-hidden="true" />
              {untilReset(you.weekResetsAt)}
            </span>
          </div>

          {you.beatingBest && (
            <Pop delay={700} className="relative mt-4">
              <p className="flex items-center gap-2 rounded-full bg-lumen px-3.5 py-2 text-caption font-bold text-cosmos">
                <Zap size={14} aria-hidden="true" />
                Best week you have ever had
              </p>
            </Pop>
          )}

          {!you.beatingBest && you.toNextRank > 0 && (
            <p className="relative mt-4 rounded-[--radius-field] bg-white/[0.07] px-3.5 py-2.5 text-caption text-white/70">
              <span className="font-bold text-white">{you.toNextRank} points</span> and you
              take {data.division.find((row) => row.rank === (you.rank ?? 2) - 1)?.name ??
                "the next place"}
              .
            </p>
          )}
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="glass rounded-[--radius-card] p-5">
          <div className="flex items-baseline justify-between gap-3 pb-4">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/45">
              Last {data.weeks.length} weeks
            </span>
            <span className="text-[0.6875rem] font-bold tabular-nums text-white/70">
              best {you.bestWeek}
            </span>
          </div>
          <StreakPips weeks={data.weeks} peak={peakWeek} />
        </div>
      </section>

      {podium.length === 3 && (
        <>
          <SectionHead title="Top of the week" />
          <div className="px-5">
            <div className="glass rounded-[--radius-card] px-5 pb-0 pt-5">
              <Podium
                rows={podium.map((row) => ({
                  name: row.name,
                  points: row.thisWeek,
                  tint: row.tint,
                  isYou: row.isYou,
                }))}
              />
            </div>
          </div>
        </>
      )}

      <SectionHead title="Houses" />
      <div className="space-y-2.5 px-5">
        {houses.map((house, index) => {
          const yours = house.id === you.houseId;
          const open = openHouse === house.id;

          return (
            <div
              key={house.id}
              className={cn(
                "press relative overflow-hidden rounded-[--radius-card]",
                yours || house.leading ? "glass" : "glass-sunken",
              )}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenHouse(open ? null : house.id)}
                className="block w-full p-4 text-left"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      style={{ background: house.tint, boxShadow: `0 0 14px ${house.tint}` }}
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        house.leading && "animate-neon-pulse",
                      )}
                    />
                    <span className="truncate font-display text-base font-bold text-white">
                      {house.name}
                    </span>
                    {yours && (
                      <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[0.625rem] font-bold text-white">
                        Yours
                      </span>
                    )}
                    {house.leading && (
                      <span className="shrink-0 rounded-full bg-lumen px-2 py-0.5 text-[0.625rem] font-bold text-cosmos">
                        1st
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="font-display text-xl font-bold tabular-nums text-white">
                      <CountUp to={house.points} duration={900} />
                    </span>
                    <ChevronDown
                      size={15}
                      aria-hidden="true"
                      className={cn(
                        "text-white/35 transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </span>
                </div>

                <MeterBar
                  value={house.share * 100}
                  tint={house.tint}
                  height={12}
                  delay={160 + index * 130}
                  shine={house.leading}
                  className="mt-3"
                  label={`${house.name} points`}
                />

                <p className="mt-2 text-[0.6875rem] text-white/45">
                  {house.leading
                    ? house.motto
                    : `${house.behindLeader} behind · ${house.motto}`}
                </p>
              </button>

              {open && (
                <ul className="border-t border-white/10 px-4 py-2">
                  {house.roster.map((member) => (
                    <li
                      key={member.name}
                      className="flex items-center justify-between gap-3 py-1.5"
                    >
                      <span
                        className={cn(
                          "truncate text-caption",
                          member.isYou ? "font-bold text-lumen" : "text-white/70",
                        )}
                      >
                        {member.name}
                      </span>
                      <span className="shrink-0 text-caption font-bold tabular-nums text-white/80">
                        {member.thisWeek}
                      </span>
                    </li>
                  ))}
                  {house.roster.length === 0 && (
                    <li className="py-1.5 text-caption text-white/40">
                      Nobody has scored for {house.name} yet.
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <SectionHead title="Where your points came from" />
      <div className="px-5">
        {data.breakdown.length === 0 ? (
          <p className="glass-sunken rounded-[--radius-card] p-4 text-caption text-white/50">
            Nothing yet. Finish a lesson and this fills in.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.breakdown.map((row, index) => (
              <li key={row.source}>
                <div className="flex items-baseline justify-between gap-3 pb-1.5">
                  <span className="truncate text-caption font-semibold text-white">
                    {row.label}
                  </span>
                  <span className="shrink-0 text-caption font-bold tabular-nums text-white">
                    {row.points}
                  </span>
                </div>
                <MeterBar
                  value={(row.points / data.breakdown[0].points) * 100}
                  tint="var(--color-ray-1)"
                  height={8}
                  delay={140 + index * 110}
                  label={row.label}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <SectionHead title={data.learnerCount > 1 ? "Your division" : "Personal best"} />
      <div className="px-5">
        {data.learnerCount > 1 ? (
          <ul className="space-y-1.5">
            {data.division.map((row, index) => (
              <li
                key={`${row.rank}-${row.name}`}
                className={cn(
                  "relative overflow-hidden rounded-[--radius-field] px-3 py-2.5",
                  row.isYou ? "glass" : "glass-sunken",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 shrink-0 text-center font-display text-sm font-bold tabular-nums",
                      row.rank <= 3 ? "text-lumen" : "text-white/40",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{ background: row.tint }}
                    className="h-6 w-1 shrink-0 rounded-full"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-caption",
                        row.isYou ? "font-bold text-white" : "font-semibold text-white/85",
                      )}
                    >
                      {row.name}
                      <span className="ml-1.5 text-[0.625rem] font-semibold text-white/35">
                        Lv{row.level}
                      </span>
                    </span>
                  </span>
                  <RankDelta movement={row.movement} className="shrink-0" />
                  <span className="w-10 shrink-0 text-right font-display text-sm font-bold tabular-nums text-white">
                    {row.thisWeek}
                  </span>
                </div>
                <MeterBar
                  value={(row.thisWeek / data.leaderWeek) * 100}
                  tint={row.tint}
                  track="rgb(255 255 255 / 0.06)"
                  height={4}
                  delay={120 + index * 60}
                  className="mt-2"
                  label={`${row.name} points this week`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass rounded-[--radius-card] p-5">
            <p className="text-caption text-white/60">
              You are the only learner on this device, so there is nobody to rank
              against yet. Your best week so far is{" "}
              <span className="font-bold text-white">{you.bestWeek}</span> points, over{" "}
              {you.activeWeeks} {you.activeWeeks === 1 ? "week" : "weeks"} of work.
            </p>
            <p className="mt-3 text-caption text-white/45">
              Beating your own best is the only score that always counts.
            </p>
          </div>
        )}
      </div>

      <SectionHead title="Lately" />
      <ul className="space-y-2 px-5 pb-4">
        {data.recent.map((row, index) => (
          <li
            key={row.id}
            className={cn(
              "glass-sunken flex items-center gap-3 rounded-[--radius-field] px-4 py-3",
              index === 0 && "ring-1 ring-lumen/40",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-caption font-semibold text-white">
                {row.detail}
              </span>
              <span className="block truncate text-[0.6875rem] text-white/45">
                {row.label}
              </span>
            </span>
            <span className="shrink-0 font-display text-base font-bold tabular-nums text-lumen">
              +{row.points}
            </span>
          </li>
        ))}
        {data.recent.length === 0 && (
          <li className="glass-sunken rounded-[--radius-field] px-4 py-3 text-caption text-white/50">
            Nothing scored yet this term.
          </li>
        )}
      </ul>
    </AppShell>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mt-9 flex items-center gap-3 px-5 pb-4">
      <h2 className="font-display text-[1.0625rem] font-semibold text-white">{title}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ScoreboardScreen />
    </ToastProvider>
  );
}
