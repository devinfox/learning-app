"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BuddyCard, CourseCard, Companion } from "@/components/domain";
import {
  AppShell,
  MobileMasthead,
  ProgressRing,
  Section,
  Skeleton,
  Tabs,
  Text,
} from "@/components/ui";
import { api } from "@/lib/api";

interface Dashboard {
  greeting: "morning" | "afternoon" | "evening";
  name: string;
  subjects: Array<{ id: string; name: string; isNew: boolean }>;
  selected: {
    subject: { id: string; name: string; icon: string };
    syllabusId: string | null;
    syllabusStatus: string | null;
    placementStatus: string;
    currentChapter: { id: string; title: string } | null;
    progress: { totalTopics: number; completed: number; remaining: number; percent: number };
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [subjectId, setSubjectId] = useState<string | undefined>();

  useEffect(() => {
    const query = subjectId ? `?subjectId=${subjectId}` : "";
    api<{ dashboard: Dashboard }>(`/api/dashboard${query}`)
      .then((result) => setData(result.dashboard))
      .catch(() => router.push("/login"));
  }, [subjectId, router]);

  const selected = data?.selected;

  return (
    <AppShell
      aside={
        selected && (
          <div className="space-y-4">
            <Text variant="label" tone="muted">
              Subject progress
            </Text>
            <ProgressRing value={selected.progress.percent} size={168} />
            <ProgressStats progress={selected.progress} />
          </div>
        )
      }
    >
      <MobileMasthead />

      <header className="px-5 pt-2 lg:pt-10">
        {data ? (
          <>
            <Text variant="caption" tone="muted">
              Good {data.greeting}, {data.name}
            </Text>
            <Text variant="display" className="mt-1">
              What do you want to learn today?
            </Text>
          </>
        ) : (
          <Skeleton className="h-12 w-3/4" />
        )}
      </header>

      {data && data.subjects.length > 0 && (
        <Tabs
          className="mt-6 px-5"
          value={subjectId ?? data.subjects[0]?.id}
          onChange={setSubjectId}
          items={data.subjects.map((subject) => ({
            id: subject.id,
            label: subject.name,
            flagged: subject.isNew,
          }))}
        />
      )}

      <div className="mt-5 space-y-8 px-5">
        <BuddyCard onOpen={() => router.push("/companion")} />

        {selected ? (
          <>
            <CourseCard
              subjectName={selected.subject.name}
              subjectIconName={selected.subject.icon}
              currentTopic={selected.currentChapter?.title ?? null}
              status={
                selected.placementStatus === "pending"
                  ? "awaiting_placement"
                  : selected.syllabusStatus === "generating"
                    ? "generating"
                    : selected.syllabusStatus === "failed"
                      ? "failed"
                      : "ready"
              }
              onStartLesson={() => router.push(`/subjects/${selected.subject.id}`)}
              onLearnWithAi={() => router.push("/tutor")}
              onTakePlacement={() => router.push(`/subjects/${selected.subject.id}/placement`)}
            />

            <Section title="Subject progress" ruled className="xl:hidden">
              <div className="flex items-center gap-5">
                <ProgressRing value={selected.progress.percent} />
                <ProgressStats progress={selected.progress} className="flex-1" />
              </div>
            </Section>
          </>
        ) : (
          <Skeleton className="h-64 rounded-[--radius-card]" />
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/tutor")}
        aria-label="Open your study buddy"
        className="fixed bottom-[calc(6rem+var(--safe-bottom))] right-5 z-30 lg:bottom-8"
      >
        <Companion size={64} state="idle" />
      </button>
    </AppShell>
  );
}

function ProgressStats({
  progress,
  className,
}: {
  progress: { totalTopics: number; completed: number; remaining: number };
  className?: string;
}) {
  const rows = [
    { label: "Total topics", value: progress.totalTopics, tone: "text-ink" },
    { label: "Completed", value: progress.completed, tone: "text-verdant-ink" },
    { label: "Remaining", value: progress.remaining, tone: "text-ink-subtle" },
  ];
  return (
    <dl className={className}>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between py-1">
          <dt className="text-body text-ink-muted">{row.label}</dt>
          <dd className={`text-body font-semibold tabular-nums ${row.tone}`}>
            {String(row.value).padStart(2, "0")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
