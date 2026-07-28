"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Companion, LearningPath, MasteryRing, type PathChapter } from "@/components/domain";
import {
  AppShell,
  Button,
  EmptyState,
  RayRule,
  Section,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPost } from "@/lib/api";
import type { MasteryTier } from "@/lib/services/mastery";

interface SubjectPayload {
  subject: { id: string; name: string; icon: string; blurb: string };
  enrollment: { placementStatus: string; level: string | null };
  syllabus: {
    id: string;
    title: string;
    level: string;
    status: string;
    chapters: Array<{
      id: string;
      order: number;
      title: string;
      summary: string;
      lessonId: string | null;
      lessonStatus: PathChapter["lessonStatus"];
    }>;
    glossary: Array<{ term: string; definition: string }>;
    timeline: Array<{ year: string; event: string; why: string }>;
  } | null;
  mastery: {
    chapters: Array<{
      chapterId: string;
      tier: MasteryTier;
      percent: number;
      completed: boolean;
      unlocked: boolean;
      passedAttempts: number;
    }>;
    counts: Record<MasteryTier, number>;
    currentChapterId: string | null;
  } | null;
  week: {
    sessionsThisWeek: number;
    weeklyGoal: number;
    bestWeekSessions: number;
    chaptersBrightenedThisWeek: number;
  };
}

function CoursePage() {
  const params = useParams<{ subjectId: string }>();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<SubjectPayload | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await api<SubjectPayload>(`/api/me/subjects/${params.subjectId}`);
    setData(result);
  }, [params.subjectId]);

  useEffect(() => {
    load().catch(() => router.push("/login"));
  }, [load, router]);

  const chapters: PathChapter[] =
    data?.syllabus?.chapters.map((chapter) => {
      const mastery = data.mastery?.chapters.find((row) => row.chapterId === chapter.id);
      return {
        id: chapter.id,
        order: chapter.order,
        title: chapter.title,
        summary: chapter.summary,
        tier: mastery?.tier ?? "dim",
        percent: mastery?.percent ?? 0,
        completed: mastery?.completed ?? false,
        unlocked: mastery?.unlocked ?? false,
        passedQuiz: (mastery?.passedAttempts ?? 0) > 0,
        lessonId: chapter.lessonId,
        lessonStatus: chapter.lessonStatus,
      };
    }) ?? [];

  function retakeQuiz(chapter: PathChapter) {
    if (!chapter.lessonId || chapter.lessonStatus !== "ready") {
      toast.show("That lesson's quiz isn't ready yet.");
      return;
    }
    router.push(`/lessons/${chapter.lessonId}/quiz`);
  }

  async function openChapter(chapter: PathChapter) {
    if (!chapter.unlocked) {
      const index = chapters.findIndex((row) => row.id === chapter.id);
      const previous = index > 0 ? chapters[index - 1] : null;
      toast.show(
        previous
          ? `Pass the ${previous.title} quiz to unlock this one.`
          : "Pass the previous lesson\u2019s quiz to unlock this one.",
      );
      return;
    }
    if (chapter.lessonId && chapter.lessonStatus === "ready") {
      router.push(`/lessons/${chapter.lessonId}`);
      return;
    }
    if (!data?.syllabus) return;

    setOpening(chapter.id);
    try {
      const result = await apiPost<{ lesson: { id: string; status: string } }>(
        `/api/syllabi/${data.syllabus.id}/chapters/${chapter.id}/lesson`,
      );
      if (result.lesson.status === "ready") {
        router.push(`/lessons/${result.lesson.id}`);
      } else {
        toast.show("Preparing this lesson — it'll be ready shortly.");
        await load();
      }
    } catch {
      toast.show("Couldn't open that lesson.", "error");
    } finally {
      setOpening(null);
    }
  }

  const counts = data?.mastery?.counts;

  return (
    <AppShell
      aside={
        counts && (
          <div className="space-y-6">
            <div>
              <Text variant="label" tone="muted" className="mb-3 block">
                Mastery
              </Text>
              <MasteryRing counts={counts} total={chapters.length} />
            </div>
            <TierKey counts={counts} remaining={chapters.length} />
            {data && <WeekPanel week={data.week} />}
          </div>
        )
      }
    >
      <header className="px-5 pt-safe">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="-ml-2 mt-2 flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-surface-sunken"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={24} />
        </button>

        {data ? (
          <>
            <Text variant="display" className="mt-2">
              {data.subject.name}
            </Text>
            <Text variant="body" tone="muted" className="mt-2 max-w-[46ch]">
              {data.subject.blurb}
            </Text>
            <RayRule width="short" className="mt-4" />
          </>
        ) : (
          <Skeleton className="mt-3 h-10 w-2/3" />
        )}
      </header>

      {counts && (
        <div className="mt-7 flex items-center gap-5 px-5 xl:hidden">
          <MasteryRing counts={counts} total={chapters.length} size={124} />
          <TierKey counts={counts} remaining={chapters.length} className="flex-1" />
        </div>
      )}

      <Section title="Syllabus" ruled className="mt-8 px-5">
        {!data ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-24 rounded-[--radius-card]" />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <EmptyState
            title="Your syllabus is being prepared"
            description="We're building this course around what you already know. It'll appear here shortly."
          />
        ) : (
          <LearningPath
            chapters={chapters.map((chapter) =>
              chapter.id === opening ? { ...chapter, lessonStatus: "generating" } : chapter,
            )}
            currentChapterId={data.mastery?.currentChapterId ?? null}
            onOpen={openChapter}
            onRetry={openChapter}
            onRetakeQuiz={retakeQuiz}
          />
        )}
      </Section>

      {data?.syllabus?.timeline && data.syllabus.timeline.length > 0 && (
        <Section title="Timeline" ruled className="mt-8 px-5">
          <Timeline entries={data.syllabus.timeline} />
        </Section>
      )}

      {data?.syllabus?.glossary && data.syllabus.glossary.length > 0 && (
        <Section title="Glossary" ruled className="mt-8 px-5">
          <Glossary terms={data.syllabus.glossary} />
        </Section>
      )}

      <div className="mt-8 px-5 xl:hidden">
        {data && <WeekPanel week={data.week} />}
      </div>

      <button
        type="button"
        onClick={() => router.push("/tutor")}
        aria-label="Ask your study buddy about this course"
        className="fixed bottom-[calc(6rem+var(--safe-bottom))] right-5 z-30 lg:bottom-8"
      >
        <Companion size={64} state="idle" />
      </button>
    </AppShell>
  );
}

function Timeline({
  entries,
}: {
  entries: Array<{ year: string; event: string; why: string }>;
}) {
  return (
    <ol className="relative space-y-5 pl-1">
      {entries.map((entry, index) => (
        <li key={`${entry.year}-${index}`} className="relative flex gap-4">
          {index < entries.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[0.3125rem] top-4 bottom-[-1.25rem] w-[2px] rounded-full bg-line-strong/60"
            />
          )}
          <span
            aria-hidden="true"
            className="relative z-10 mt-[0.4rem] size-2.5 shrink-0 rounded-full bg-brand"
          />
          <div className="min-w-0 flex-1">
            <Text variant="label" className="tabular-nums">
              {entry.year}
            </Text>
            <Text variant="body" className="mt-0.5 block">
              {entry.event}
            </Text>
            <Text variant="caption" tone="subtle" className="mt-1 block">
              {entry.why}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Glossary({ terms }: { terms: Array<{ term: string; definition: string }> }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[--radius-card] bg-surface">
      {terms.map((row) => (
        <details key={row.term} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <Text variant="label" as="span" className="capitalize">
              {row.term}
            </Text>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="shrink-0 text-ink-subtle transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4">
            <Text variant="body" tone="muted">
              {row.definition}
            </Text>
          </div>
        </details>
      ))}
    </div>
  );
}

const TIERS: Array<{ tier: MasteryTier; label: string; swatch: string }> = [
  { tier: "prism", label: "Held a month", swatch: "bg-lumen" },
  { tier: "radiant", label: "Held a week", swatch: "bg-[--color-ray-3]" },
  { tier: "bright", label: "Quiz passed", swatch: "bg-[--color-ray-2]" },
  { tier: "lit", label: "Lesson done", swatch: "bg-[--color-ray-1]" },
];

function TierKey({
  counts,
  remaining,
  className,
}: {
  counts: Record<MasteryTier, number>;
  remaining: number;
  className?: string;
}) {
  const touched = TIERS.reduce((sum, row) => sum + (counts[row.tier] ?? 0), 0);
  return (
    <dl className={className}>
      {TIERS.map((row) => (
        <div key={row.tier} className="flex items-center gap-2 py-1">
          <span className={`size-2.5 shrink-0 rounded-full ${row.swatch}`} aria-hidden="true" />
          <dt className="flex-1 text-caption text-ink-muted">{row.label}</dt>
          <dd className="text-caption font-semibold tabular-nums text-ink">
            {counts[row.tier] ?? 0}
          </dd>
        </div>
      ))}
      <div className="flex items-center gap-2 py-1">
        <span className="size-2.5 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
        <dt className="flex-1 text-caption text-ink-muted">Not started</dt>
        <dd className="text-caption font-semibold tabular-nums text-ink-subtle">
          {Math.max(0, remaining - touched)}
        </dd>
      </div>
    </dl>
  );
}

function WeekPanel({ week }: { week: SubjectPayload["week"] }) {
  const met = week.sessionsThisWeek >= week.weeklyGoal;
  return (
    <Section title="This week" ruled>
      <div className="rounded-[--radius-card] bg-surface p-4 shadow-[--shadow-card]">
        <div className="flex items-baseline justify-between">
          <Text variant="body" tone="muted">
            Sessions
          </Text>
          <Text variant="h3" as="p" className="tabular-nums">
            {week.sessionsThisWeek}
            <span className="text-ink-subtle">/{week.weeklyGoal}</span>
          </Text>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className={met ? "h-full rounded-full bg-lumen-deep" : "h-full rounded-full bg-cosmos"}
            style={{
              width: `${Math.min(100, (week.sessionsThisWeek / week.weeklyGoal) * 100)}%`,
            }}
          />
        </div>
        <div className="mt-3 flex justify-between">
          <Text variant="caption" tone="muted">
            Best week
          </Text>
          <Text variant="caption" className="font-semibold tabular-nums">
            {week.bestWeekSessions} sessions
          </Text>
        </div>
      </div>
    </Section>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <CoursePage />
    </ToastProvider>
  );
}
