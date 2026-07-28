"use client";

import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppShell,
  Button,
  MobileMasthead,
  ProgressBar,
  Skeleton,
  Spinner,
  Text,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPost } from "@/lib/api";
import { cn } from "@/lib/ui/cn";

interface Criterion {
  id: string;
  title: string;
  description: string;
  points: number;
  levels: string[];
}

interface Payload {
  project: {
    id: string;
    title: string;
    blurb: string;
    prompt: string;
    steps: string[];
    rubric: Criterion[];
    maxScore: number;
    subjectName: string;
    chaptersRequired: number;
  };
  unlocked: boolean;
  requirement: string;
  chaptersDone: number;
  teacherOverride: boolean;
  submission: {
    id: string;
    body: string;
    claimed: string[];
    status: "grading" | "scored" | "failed";
    scores: Array<{ criterionId: string; level: number; points: number; note: string }>;
    score: number;
    maxScore: number;
    feedback: string;
    gradedAt: string | null;
    gradedBy: "ai" | "teacher" | "checklist" | null;
    error: string | null;
    submittedAt: string;
  } | null;
}

const MARKER_LABEL: Record<string, string> = {
  ai: "Marked automatically against the rubric",
  teacher: "Marked by your teacher",
  checklist: "Checked against your own list — no marker was available",
};

function ProjectScreen() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<Payload | null>(null);
  const [body, setBody] = useState("");
  const [claimed, setClaimed] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    (quiet = false) =>
      api<Payload>(`/api/projects/${params.projectId}`)
        .then((result) => {
          setData(result);
          return result;
        })
        .catch(() => {
          if (!quiet) toast.show("Couldn't load that project.", "error");
          return null;
        }),
    [params.projectId, toast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (data?.submission?.status !== "grading") return;

    timer.current = setTimeout(() => void load(true), 2000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data, load]);

  const rubric = data?.project.rubric ?? [];

  const selfCheck = useMemo(() => {
    if (rubric.length === 0) return 0;
    const written = body.trim().length >= 200 ? 1 : 0;
    return Math.round(
      ((claimed.length + written) / (rubric.length + 1)) * 100,
    );
  }, [claimed, body, rubric.length]);

  async function submit() {
    if (!data) return;
    setSending(true);
    try {
      await apiPost(`/api/projects/${data.project.id}/submit`, { body, claimed });
      setEditing(false);
      await load();
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : "Couldn't hand that in.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  if (!data) {
    return (
      <AppShell>
        <MobileMasthead />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton lines={4} />
          <Skeleton className="h-40 rounded-[--radius-card]" />
        </div>
      </AppShell>
    );
  }

  const { project, submission } = data;
  const scoreById = new Map((submission?.scores ?? []).map((row) => [row.criterionId, row]));
  const showEditor = data.unlocked && (editing || !submission);

  return (
    <AppShell>
      <MobileMasthead />

      <div className="px-5 pt-4 lg:pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All projects
        </Link>
      </div>

      <header className="mt-4 px-5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {project.subjectName}
        </p>
        <Text variant="display" className="mt-1.5 block">
          {project.title}
        </Text>
        <p className="mt-2 max-w-[46ch] text-body leading-relaxed text-ink-muted">
          {project.blurb}
        </p>
      </header>

      {!data.unlocked && (
        <div className="mt-6 px-5">
          <div className="flex items-center gap-3 rounded-[--radius-card] border border-line bg-surface-sunken p-4">
            <Lock size={18} className="shrink-0 text-ink-subtle" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-semibold text-ink">
                {data.requirement}
              </span>
              <span className="block text-[0.6875rem] text-ink-subtle">
                {data.chaptersDone} of {project.chaptersRequired} chapters done
              </span>
            </span>
          </div>
        </div>
      )}

      <section className="mt-7 px-5">
        <div className="rounded-[--radius-card] bg-surface p-5 shadow-[--shadow-card]">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
            The task
          </h2>
          <p className="mt-2.5 text-body leading-relaxed text-ink">{project.prompt}</p>

          <ol className="mt-5 space-y-2.5 border-t border-line pt-4">
            {project.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[0.625rem] font-bold text-brand">
                  {index + 1}
                </span>
                <span className="text-caption text-ink-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-7 px-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
            How it is marked
          </h2>
          <span className="text-[0.6875rem] text-ink-subtle">
            up to {project.maxScore}
          </span>
        </div>

        <ul className="mt-3 space-y-2.5">
          {rubric.map((criterion) => {
            const scored = scoreById.get(criterion.id);
            const ticked = claimed.includes(criterion.id);

            return (
              <li
                key={criterion.id}
                className="rounded-[--radius-card] bg-surface p-4 shadow-[--shadow-card]"
              >
                <div className="flex items-start gap-3">
                  {showEditor ? (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={ticked}
                      onClick={() =>
                        setClaimed((current) =>
                          current.includes(criterion.id)
                            ? current.filter((row) => row !== criterion.id)
                            : [...current, criterion.id],
                        )
                      }
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
                        ticked
                          ? "border-brand bg-brand text-on-brand"
                          : "border-line-strong bg-surface",
                      )}
                    >
                      {ticked && <Check size={13} aria-hidden="true" />}
                    </button>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-line-strong"
                    />
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block text-caption font-semibold text-ink">
                      {criterion.title}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-muted">
                      {criterion.description}
                    </span>
                  </span>

                  {scored ? (
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-base font-bold tabular-nums text-ink">
                        {scored.points}
                      </span>
                      <span className="block text-[0.625rem] text-ink-subtle">
                        of {criterion.points}
                      </span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-[0.6875rem] tabular-nums text-ink-subtle">
                      {criterion.points}
                    </span>
                  )}
                </div>

                {scored ? (
                  <div className="mt-3 rounded-[--radius-field] bg-surface-sunken p-3">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-subtle">
                      {criterion.levels[scored.level] ?? "Marked"}
                    </p>
                    <p className="mt-1 text-caption text-ink-muted">{scored.note}</p>
                  </div>
                ) : (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {criterion.levels.map((level, index) => (
                      <li
                        key={level}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.6875rem]",
                          index === criterion.levels.length - 1
                            ? "bg-accent-soft text-brand"
                            : "bg-surface-sunken text-ink-subtle",
                        )}
                      >
                        {level}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {submission?.status === "grading" && (
        <section className="mt-7 px-5">
          <div className="flex items-center gap-3 rounded-[--radius-card] bg-surface p-5 shadow-[--shadow-card]">
            <Spinner />
            <span className="min-w-0 flex-1">
              <span className="block text-caption font-semibold text-ink">
                Being marked
              </span>
              <span className="block text-[0.6875rem] text-ink-subtle">
                This usually takes a few seconds. You can leave the page.
              </span>
            </span>
          </div>
        </section>
      )}

      {submission?.status === "failed" && (
        <section className="mt-7 px-5">
          <div className="rounded-[--radius-card] border border-line bg-surface p-5 shadow-[--shadow-card]">
            <Text variant="h3">Marking did not finish</Text>
            <Text variant="body" tone="muted" className="mt-1.5 block">
              Nothing you wrote was lost. Hand it in again and it will be marked
              from scratch.
            </Text>
            <Button
              className="mt-4"
              onClick={() => {
                setBody(submission.body);
                setClaimed(submission.claimed);
                setEditing(true);
              }}
            >
              Open it again
            </Button>
          </div>
        </section>
      )}

      {submission?.status === "scored" && !editing && (
        <section className="mt-7 px-5">
          <div className="rounded-[--radius-card] bg-cosmos p-5 text-white" data-ground="cosmos">
            <div className="flex items-end justify-between gap-3">
              <span>
                <span className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-white/50">
                  Your score
                </span>
                <span className="mt-1 block font-display text-[2.5rem] font-bold leading-none tabular-nums text-white">
                  {submission.score}
                  <span className="text-xl text-white/45">/{submission.maxScore}</span>
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-lumen px-3 py-1.5 text-caption font-bold text-cosmos">
                <Sparkles size={14} aria-hidden="true" />
                points added
              </span>
            </div>

            <ProgressBar
              value={
                submission.maxScore > 0
                  ? (submission.score / submission.maxScore) * 100
                  : 0
              }
              tone={submission.score === submission.maxScore ? "lumen" : "spectrum"}
              size="md"
              className="mt-4"
              label="Project score"
            />

            <p className="mt-4 text-body leading-relaxed text-white/80">
              {submission.feedback}
            </p>

            <p className="mt-4 border-t border-white/10 pt-3 text-[0.6875rem] text-white/45">
              {MARKER_LABEL[submission.gradedBy ?? "checklist"]}
              {data.teacherOverride ? " · a teacher can re-mark this" : ""}
            </p>
          </div>

          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={() => {
              setBody(submission.body);
              setClaimed(submission.claimed);
              setEditing(true);
            }}
          >
            Hand in a better version
          </Button>
        </section>
      )}

      {showEditor && (
        <section className="mt-7 px-5 pb-6">
          <div className="rounded-[--radius-card] bg-surface p-5 shadow-[--shadow-card]">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
                Your work
              </h2>
              <span className="text-[0.6875rem] tabular-nums text-ink-subtle">
                {body.trim().length} characters
              </span>
            </div>

            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={14}
              placeholder="Write it here. You can come back and change it before you hand it in."
              className="mt-3"
            />

            <div className="mt-4 border-t border-line pt-4">
              <div className="flex items-center gap-3">
                <ProgressBar
                  value={selfCheck}
                  tone="brand"
                  size="md"
                  label="Your own checklist"
                />
                <span className="shrink-0 text-caption font-bold tabular-nums text-ink-muted">
                  {selfCheck}%
                </span>
              </div>
              <p className="mt-2 text-[0.6875rem] text-ink-subtle">
                This is your own checklist filling up, not your score. Ticking
                everything does not make it right — it just means you think you have
                covered it.
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              <Button
                fullWidth
                loading={sending}
                disabled={body.trim().length < 40}
                onClick={submit}
              >
                Hand it in
              </Button>
              {submission && (
                <Button fullWidth variant="ghost" onClick={() => setEditing(false)}>
                  Keep the version I handed in
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {!data.unlocked && (
        <div className="px-5 pb-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push("/progress")}
          >
            See what unlocks it
          </Button>
        </div>
      )}
    </AppShell>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ProjectScreen />
    </ToastProvider>
  );
}
