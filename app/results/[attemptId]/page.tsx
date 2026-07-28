"use client";

import { ArrowRight, ChevronRight, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CountUp,
  LevelBadge,
  MeterBar,
  Orb,
  Pop,
  RewardUnlock,
  SparkBurst,
  TierDot,
  TIER_MEANING,
  TIER_NAME,
  usePrefersReducedMotion,
} from "@/components/domain";
import { Button, ProgressRing, Skeleton, Text } from "@/components/ui";
import { api } from "@/lib/api";
import { rewardById } from "@/lib/gamification/catalog";
import type { MasteryTier } from "@/lib/services/mastery";
import { cn } from "@/lib/ui/cn";

interface Payload {
  attempt: {
    id: string;
    kind: "placement" | "lesson" | "exam" | "final";
    title: string;
    subjectName: string;
    lessonId: string | null;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    maxScore: number;
    percent: number;
    durationSeconds: number;
    passed: boolean;
  };
  points: {
    earned: Array<{ source: string; label: string; detail: string; points: number }>;
    gained: number;
    thisWeek: number;
    bestWeek: number;
    beatingBest: boolean;
    level: { level: number; into: number; need: number; percent: number };
    levelledUp: boolean;
  };
  tier: { before: MasteryTier; after: MasteryTier } | null;
  unlocked: Array<{ id: string; name: string; blurb: string; reason: string; earnedAt: string }>;
}

const BEAT = { ring: 250, verdict: 1150, points: 1650, level: 2250, extras: 2900 };

interface Band {
  label: string;
  headline: string;
  tone: string;
  stars: number;
}

function bandFor(percent: number, passed: boolean): Band {
  if (percent === 100)
    return { label: "Perfect", headline: "Every single one", tone: "var(--color-lumen)", stars: 3 };
  if (percent >= 85)
    return { label: "Brilliant", headline: "That was brilliant", tone: "var(--color-ray-3)", stars: 3 };
  if (percent >= 70)
    return { label: "Strong", headline: "Strong run", tone: "var(--color-ray-2)", stars: 2 };
  if (passed)
    return { label: "Passed", headline: "Through it", tone: "var(--color-ray-1)", stars: 1 };
  return { label: "Not yet", headline: "Not this time", tone: "var(--color-line-strong)", stars: 0 };
}

function useStage(ready: boolean): number {
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);
  const paced = ready && !reduced;

  useEffect(() => {
    if (!paced) return;

    const timers = [
      setTimeout(() => setStage(1), BEAT.ring),
      setTimeout(() => setStage(2), BEAT.verdict),
      setTimeout(() => setStage(3), BEAT.points),
      setTimeout(() => setStage(4), BEAT.level),
      setTimeout(() => setStage(5), BEAT.extras),
    ];

    return () => timers.forEach(clearTimeout);
  }, [paced]);

  return paced ? stage : ready ? 5 : 0;
}

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    api<Payload>(`/api/attempts/${params.attemptId}`)
      .then(setData)
      .catch(() => setFailed(true));
  }, [params.attemptId]);

  const stage = useStage(Boolean(data));

  const rewards = useMemo(
    () =>
      (data?.unlocked ?? [])
        .map((row) => {
          const reward = rewardById(row.id);
          return reward ? { reward, earnedAt: row.earnedAt, reason: row.reason } : null;
        })
        .filter((row) => row !== null),
    [data],
  );

  if (failed) {
    return (
      <div className="mx-auto max-w-[30rem] px-5 py-16 text-center">
        <Text variant="h2">That result has gone</Text>
        <Text variant="body" tone="muted" className="mt-2 block">
          We could not find this attempt. It may belong to a different account.
        </Text>
        <Button className="mt-6" onClick={() => router.push("/progress")}>
          Back to your progress
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[30rem] space-y-4 px-5 py-16">
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton lines={3} />
      </div>
    );
  }

  const { attempt, points, tier } = data;
  const band = bandFor(attempt.percent, attempt.passed);
  const isExam = attempt.kind === "exam" || attempt.kind === "final";

  return (
    <div
      data-ground="cosmos"
      className="arcade-ground arcade-grid relative min-h-dvh px-5 pb-16 pt-safe text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          style={{ background: band.tone }}
          className={cn(
            "absolute -top-28 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-1000",
            stage >= 1 ? "opacity-20" : "opacity-0",
          )}
        />
      </div>

      <div className="relative mx-auto max-w-[30rem] pt-10">
        <p className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          {attempt.subjectName} · {attempt.title}
        </p>

        <div className="relative mt-6 flex justify-center">
          <SparkBurst fire={attempt.passed && stage >= 2} count={18} spread={170} />

          <ProgressRing
            value={stage >= 1 ? attempt.percent : 0}
            size={186}
            thickness={15}
            tone={attempt.percent === 100 ? "lumen" : "spectrum"}
            label="Your score"
            className={cn(
              "transition-transform duration-500",
              stage >= 2 ? "scale-100" : "scale-95",
            )}
          >
            <span className="text-center">
              <span className="block font-display text-[2.75rem] font-bold leading-none tabular-nums text-white">
                {stage >= 1 ? <CountUp to={attempt.percent} duration={950} /> : 0}
                <span className="text-2xl">%</span>
              </span>
              <span className="mt-1 block text-caption text-white/55">
                {attempt.correctAnswers} of {attempt.totalQuestions}
              </span>
            </span>
          </ProgressRing>
        </div>

        <div
          className={cn(
            "mt-6 flex justify-center gap-1.5 transition-opacity duration-500",
            stage >= 2 ? "opacity-100" : "opacity-0",
          )}
        >
          {[0, 1, 2].map((index) => (
            <Star
              key={index}
              size={26}
              aria-hidden="true"
              strokeWidth={2}
              className={cn(
                "transition-all duration-500",
                index < band.stars ? "scale-100" : "scale-90 opacity-25",
              )}
              style={{
                transitionDelay: `${index * 160}ms`,
                fill: index < band.stars ? band.tone : "transparent",
                color: index < band.stars ? band.tone : "rgb(255 255 255 / 0.4)",
              }}
            />
          ))}
        </div>

        {stage >= 2 && (
          <Pop delay={60}>
            <Text variant="display" className="mt-4 block text-center text-white">
              {band.headline}
            </Text>
          </Pop>
        )}

        <p className="mx-auto mt-2 max-w-[34ch] text-center text-body leading-relaxed text-white/60">
          {attempt.passed
            ? isExam
              ? "That covered several chapters at once, which is why it counted for more."
              : "You have got this one. Come back in a week and it counts for more."
            : "The pass points are still sitting there waiting. The second attempt usually lands."}
        </p>

        <div
          className={cn(
            "glass relative mt-7 overflow-hidden rounded-[--radius-card] p-5 transition-all duration-500",
            stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/45">
              <Sparkles size={14} aria-hidden="true" />
              Points
            </span>
            <span className="relative font-display text-[2.5rem] font-bold leading-none tabular-nums text-lumen">
              +{stage >= 3 ? <CountUp to={points.gained} duration={950} /> : 0}
            </span>
          </div>

          <ul className="mt-4 space-y-2.5">
            {points.earned.map((row, index) => (
              <li
                key={row.label + row.detail}
                style={{ transitionDelay: `${index * 120}ms` }}
                className={cn(
                  "flex items-center gap-3 transition-all duration-500",
                  stage >= 3 ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                )}
              >
                <span
                  aria-hidden="true"
                  style={{ background: band.tone }}
                  className="h-6 w-1 shrink-0 rounded-full"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-caption font-bold text-white">{row.detail}</span>
                  <span className="block truncate text-[0.6875rem] text-white/45">
                    {row.label}
                  </span>
                </span>
                <span className="shrink-0 font-display text-base font-bold tabular-nums text-white">
                  +{row.points}
                </span>
              </li>
            ))}
            {points.earned.length === 0 && (
              <li className="text-caption text-white/45">
                Nothing from this one yet — passing it is what pays.
              </li>
            )}
          </ul>
        </div>

        <div
          className={cn(
            "glass relative mt-3 overflow-hidden rounded-[--radius-card] p-5 transition-all duration-500",
            stage >= 4 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <SparkBurst fire={points.levelledUp && stage >= 4} count={20} spread={190} />

          <div className="relative flex items-center gap-4">
            <LevelBadge level={points.level.level} tint={band.tone} size={52} />
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold text-white">
                {points.levelledUp ? `Level ${points.level.level} reached` : `Level ${points.level.level}`}
              </p>
              <p className="text-[0.6875rem] text-white/50">
                {points.level.need} more to level {points.level.level + 1}
              </p>
            </div>
            <span className="shrink-0 text-right">
              <span className="block font-display text-lg font-bold tabular-nums text-white">
                {points.thisWeek}
              </span>
              <span className="block text-[0.625rem] uppercase tracking-wide text-white/40">
                this week
              </span>
            </span>
          </div>

          <MeterBar
            value={stage >= 4 ? points.level.percent : 0}
            tint="var(--color-lumen)"
            height={12}
            delay={stage >= 4 ? 120 : 999_999}
            className="relative mt-4"
            label="Level progress"
          />

          {points.beatingBest && (
            <Pop delay={400} className="relative mt-4">
              <p className="flex items-center gap-2 rounded-full bg-lumen px-3.5 py-2 text-caption font-bold text-cosmos">
                <Zap size={14} aria-hidden="true" />
                Best week you have ever had
              </p>
            </Pop>
          )}
        </div>

        {tier && (
          <div
            className={cn(
              "glass mt-3 flex items-center gap-3 rounded-[--radius-card] p-4 transition-all duration-500",
              stage >= 5 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <TierDot tier={tier.before} size={10} glow={false} />
            <ArrowRight size={14} className="text-white/35" aria-hidden="true" />
            <TierDot tier={tier.after} size={16} />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold text-white">
                Now {TIER_NAME[tier.after]}
              </span>
              <span className="block text-[0.6875rem] text-white/45">
                {TIER_MEANING[tier.after]}
              </span>
            </span>
          </div>
        )}

        {rewards.length > 0 && (
          <button
            type="button"
            onClick={() => setShowRewards(true)}
            className={cn(
              "press glass mt-3 flex w-full items-center gap-3 rounded-[--radius-card] p-4 text-left transition-all duration-500 hover:brightness-125",
              stage >= 5 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <Orb size={46} mood="delighted" rays={false} />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-bold text-white">
                {rewards.length === 1
                  ? `You unlocked ${rewards[0].reward.name}`
                  : `You unlocked ${rewards.length} things`}
              </span>
              <span className="block text-[0.6875rem] text-white/45">Tap to open</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-white/40" aria-hidden="true" />
          </button>
        )}

        <div
          className={cn(
            "mt-8 space-y-2.5 transition-opacity duration-500",
            stage >= 5 ? "opacity-100" : "opacity-0",
          )}
        >
          {!attempt.passed && attempt.lessonId && (
            <Button fullWidth variant="accent" onClick={() => router.push(`/lessons/${attempt.lessonId}/quiz`)}>
              Run it again
            </Button>
          )}
          {attempt.lessonId && (
            <Button
              fullWidth
              variant={attempt.passed ? "primary" : "secondary"}
              onClick={() => router.push(`/lessons/${attempt.lessonId}`)}
            >
              {attempt.passed ? "Review the lesson" : "Review the lesson first"}
            </Button>
          )}
          <Button fullWidth variant="secondary" onClick={() => router.push("/scoreboard")}>
            See the scoreboard
          </Button>
          <Link
            href="/progress"
            className="block py-2 text-center text-caption font-semibold text-white/55 transition hover:text-white"
          >
            What&rsquo;s lit up now
          </Link>
        </div>
      </div>

      {showRewards && (
        <RewardUnlock
          occasion={attempt.passed ? band.label : "You kept going"}
          rewards={rewards}
          onClose={() => setShowRewards(false)}
        />
      )}
    </div>
  );
}
