"use client";

import { ChevronRight, Flame, GraduationCap, Lock, Play, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CountUp,
  MasteryRing,
  MeterBar,
  ProgressNav,
  TierDot,
  TIER_MEANING,
  TIER_NAME,
  TIER_TINT,
} from "@/components/domain";
import {
  AppShell,
  Button,
  MobileMasthead,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPost } from "@/lib/api";
import type { MasteryTier } from "@/lib/services/mastery";
import { cn } from "@/lib/ui/cn";

interface ChapterWire {
  id: string;
  title: string;
  order: number;
  tier: MasteryTier;
  percent: number;
  completed: boolean;
  unlocked: boolean;
  nextTierAt: string | null;
  current: boolean;
}

interface ExamWire {
  id: string;
  kind: "exam" | "final";
  title: string;
  unlocked: boolean;
  requirement: string;
  best: { score: number; maxScore: number; percent: number; passed: boolean } | null;
}

interface CourseWire {
  subjectId: string;
  slug: string;
  name: string;
  syllabusId: string | null;
  status: string;
  chapters: ChapterWire[];
  counts: Record<MasteryTier, number> | null;
  charge: number;
  points: number;
  exams: ExamWire[];
}

interface Payload {
  courses: CourseWire[];
  totals: { chapters: number; lit: number; byTier: Record<MasteryTier, number> };
  points: { total: number; thisWeek: number; bestWeek: number; weekResetsAt: string };
}

const LEGEND: MasteryTier[] = ["lit", "bright", "radiant", "prism"];

function countdown(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000);
  if (days <= 0) return "ready now";
  return `${days} day${days === 1 ? "" : "s"}`;
}

function ProgressScreen() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<Payload | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Payload>("/api/progress")
      .then(setData)
      .catch(() => toast.show("Couldn't load your progress.", "error"));
  }, [toast]);

  useEffect(load, [load]);

  async function startExam(course: CourseWire, exam: ExamWire, index: number) {
    if (!course.syllabusId) return;
    setStarting(exam.id);
    try {
      const result = await apiPost<{ quizId: string }>("/api/exams", {
        syllabusId: course.syllabusId,
        unit: exam.kind === "final" ? "final" : index + 1,
      });
      router.push(`/exams/${result.quizId}`);
    } catch {
      toast.show("That exam isn't ready yet.", "error");
      setStarting(null);
    }
  }

  if (!data) {
    return (
      <AppShell>
        <MobileMasthead />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-44 rounded-[--radius-card]" />
          <Skeleton className="h-44 rounded-[--radius-card]" />
        </div>
      </AppShell>
    );
  }

  const { totals, points } = data;
  const litPercent =
    totals.chapters > 0 ? Math.round((totals.lit / totals.chapters) * 100) : 0;

  return (
    <AppShell>
      <MobileMasthead />

      <header className="px-5 pt-4 lg:pt-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Your map
        </p>
        <Text variant="display" className="mt-1.5 block">
          What&rsquo;s lit up
        </Text>
        <span aria-hidden="true" className="mt-4 block h-[3px] w-16 rounded-full bg-spectrum" />
      </header>

      <div className="mt-6 px-5">
        <ProgressNav />
      </div>

      <section className="mt-6 px-5">
        <div className="relative overflow-hidden rounded-[--radius-card] bg-cosmos p-5 text-white" data-ground="cosmos">
          <div className="flex items-center gap-5">
            <MasteryRing
              counts={totals.byTier}
              total={Math.max(1, totals.chapters)}
              size={112}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[2.25rem] font-bold leading-none tabular-nums text-white">
                <CountUp to={totals.lit} duration={900} />
                <span className="text-lg text-white/40">/{totals.chapters}</span>
              </p>
              <p className="mt-1 text-caption text-white/55">chapters lit</p>

              <div className="mt-3 flex items-center gap-2">
                <Zap size={13} className="shrink-0 text-lumen" aria-hidden="true" />
                <span className="text-caption font-bold tabular-nums text-white">
                  {points.thisWeek}
                </span>
                <span className="text-[0.6875rem] text-white/45">this week</span>
                {points.thisWeek >= points.bestWeek && points.thisWeek > 0 && (
                  <span className="rounded-full bg-lumen px-2 py-0.5 text-[0.625rem] font-bold text-cosmos">
                    best
                  </span>
                )}
              </div>
            </div>
          </div>

          <MeterBar
            value={litPercent}
            tint="var(--color-lumen)"
            height={10}
            delay={200}
            className="mt-5"
            label="Chapters lit"
          />
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {LEGEND.map((tier) => (
            <li key={tier} className="flex items-center gap-1.5">
              <TierDot tier={tier} size={9} glow={false} />
              <span className="text-[0.6875rem] text-ink-subtle">
                <span className="font-semibold text-ink-muted">{TIER_NAME[tier]}</span>{" "}
                {TIER_MEANING[tier].toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {data.courses.map((course, courseIndex) => (
        <section key={course.subjectId} className="mt-9 px-5">
          <div className="flex items-baseline justify-between gap-3">
            <Text variant="h3" className="min-w-0 truncate">
              {course.name}
            </Text>
            <Link
              href={`/subjects/${course.subjectId}`}
              className="shrink-0 text-caption font-semibold text-brand"
            >
              Open
            </Link>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <MeterBar
              value={course.charge}
              tint={
                course.charge >= 100
                  ? "var(--color-lumen)"
                  : "linear-gradient(90deg, var(--color-ray-1), var(--color-ray-2), var(--color-ray-3))"
              }
              track="var(--color-line)"
              height={12}
              delay={140 + courseIndex * 120}
              label={`${course.name} charge`}
            />
            <span className="shrink-0 font-display text-sm font-bold tabular-nums text-ink">
              {course.charge}%
            </span>
          </div>

          {course.chapters.length === 0 ? (
            <p className="mt-3 rounded-[--radius-card] bg-surface p-4 text-caption text-ink-muted shadow-[--shadow-card]">
              This course is still being built.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {course.chapters.map((chapter) => {
                const open = openChapter === chapter.id;
                const next = countdown(chapter.nextTierAt);

                return (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenChapter(open ? null : chapter.id)}
                      className={cn(
                        "press block w-full px-4 py-3 text-left shadow-[--shadow-card] transition-colors",
                        open
                          ? "rounded-t-[--radius-field]"
                          : "rounded-[--radius-field]",
                        chapter.current
                          ? "bg-accent-soft ring-1 ring-brand/30"
                          : "bg-surface",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <TierDot
                          tier={chapter.tier}
                          size={13}
                          className={cn(chapter.current && "animate-neon-pulse")}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-caption font-semibold text-ink">
                            {chapter.title}
                          </span>
                          <span className="block text-[0.6875rem] text-ink-subtle">
                            {chapter.unlocked
                              ? `${TIER_NAME[chapter.tier]} · ${TIER_MEANING[chapter.tier]}`
                              : "Locked until you pass the one before"}
                          </span>
                        </span>

                        {chapter.current && (
                          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[0.625rem] font-bold text-on-brand">
                            Next up
                          </span>
                        )}
                        {!chapter.unlocked && (
                          <Lock size={14} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                        )}
                      </span>

                      {chapter.percent > 0 && chapter.percent < 100 && (
                        <MeterBar
                          value={chapter.percent}
                          tint="var(--color-brand)"
                          track="var(--color-line)"
                          height={4}
                          delay={200}
                          className="mt-2.5"
                          label={`${chapter.title} progress`}
                        />
                      )}

                    </button>

                    {open && (
                      <div
                        className={cn(
                          "-mt-1 rounded-b-[--radius-field] px-4 pb-3 pt-3 shadow-[--shadow-card]",
                          chapter.current ? "bg-accent-soft" : "bg-surface",
                        )}
                      >
                        <div className="flex items-center gap-2 border-t border-line pt-3">
                          {LEGEND.map((tier) => (
                            <span
                              key={tier}
                              aria-hidden="true"
                              style={{
                                background:
                                  LEGEND.indexOf(chapter.tier) >= LEGEND.indexOf(tier)
                                    ? TIER_TINT[tier]
                                    : "var(--color-line)",
                              }}
                              className="h-1.5 flex-1 rounded-full"
                            />
                          ))}
                        </div>

                        <p className="mt-2.5 text-[0.6875rem] text-ink-muted">
                          {next
                            ? `Comes back brighter in ${next} — you do not have to do anything, it happens because you passed it.`
                            : chapter.tier === "prism"
                              ? "This one is as bright as it goes. It stayed with you for a month."
                              : chapter.unlocked
                                ? "Pass the quiz to brighten it."
                                : "Pass the chapter before this one to open it."}
                        </p>

                        {chapter.unlocked && (
                          <Link
                            href={`/subjects/${course.subjectId}`}
                            className="press mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-brand"
                          >
                            <Play size={13} aria-hidden="true" />
                            Open this chapter
                            <ChevronRight size={14} aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {course.exams.length > 0 && (
            <ul className="mt-3 space-y-2">
              {course.exams.map((exam, index) => (
                <li
                  key={exam.id}
                  className={cn(
                    "rounded-[--radius-card] p-4 shadow-[--shadow-card]",
                    exam.unlocked
                      ? "bg-cosmos text-white"
                      : "border border-line bg-surface-sunken",
                  )}
                  data-ground={exam.unlocked ? "cosmos" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        exam.unlocked ? "bg-white/15 text-lumen" : "bg-surface text-ink-subtle",
                      )}
                    >
                      <GraduationCap size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-caption font-bold",
                          exam.unlocked ? "text-white" : "text-ink",
                        )}
                      >
                        {exam.title}
                      </span>
                      <span
                        className={cn(
                          "block text-[0.6875rem]",
                          exam.unlocked ? "text-white/55" : "text-ink-subtle",
                        )}
                      >
                        {exam.kind === "final" ? "Worth ×3" : "Worth ×2"} · {exam.requirement}
                      </span>
                    </span>
                    {exam.unlocked ? (
                      <Button
                        size="sm"
                        variant="accent"
                        loading={starting === exam.id}
                        onClick={() => startExam(course, exam, index)}
                      >
                        {exam.best ? "Retake" : "Sit it"}
                      </Button>
                    ) : (
                      <Lock size={14} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                    )}
                  </div>

                  {exam.best && (
                    <>
                      <MeterBar
                        value={exam.best.percent}
                        tint={
                          exam.best.percent === 100
                            ? "var(--color-lumen)"
                            : "var(--color-ray-2)"
                        }
                        track={exam.unlocked ? "rgb(255 255 255 / 0.12)" : "var(--color-line)"}
                        height={6}
                        delay={260}
                        className="mt-3"
                        label={`${exam.title} best score`}
                      />
                      <p
                        className={cn(
                          "mt-1.5 text-[0.6875rem]",
                          exam.unlocked ? "text-white/45" : "text-ink-subtle",
                        )}
                      >
                        Your best: {exam.best.percent}%
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {data.courses.length === 0 && (
        <div className="mt-8 px-5">
          <div className="rounded-[--radius-card] bg-surface p-6 text-center shadow-[--shadow-card]">
            <Text variant="h3">Nothing lit yet</Text>
            <Text variant="body" tone="muted" className="mt-2 block">
              Add a subject and the map fills in as you go.
            </Text>
            <Button className="mt-4" onClick={() => router.push("/subjects")}>
              Pick a subject
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 px-5">
        <Link
          href="/scoreboard"
          className="press flex items-center gap-3 rounded-[--radius-card] bg-cosmos p-4 text-white transition hover:brightness-125"
        >
          <Flame size={18} className="shrink-0 text-lumen" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-caption font-bold">
              {points.thisWeek} points this week
            </span>
            <span className="block text-[0.6875rem] text-white/55">
              See where that puts you
            </span>
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </AppShell>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ProgressScreen />
    </ToastProvider>
  );
}
