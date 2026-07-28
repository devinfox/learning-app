"use client";

import { ClipboardList, Lock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProgressNav } from "@/components/domain";
import {
  AppShell,
  MobileMasthead,
  ProgressBar,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api } from "@/lib/api";
import { cn } from "@/lib/ui/cn";

interface ProjectWire {
  id: string;
  title: string;
  blurb: string;
  subjectName: string;
  criteria: number;
  maxScore: number;
  unlocked: boolean;
  requirement: string;
  chaptersDone: number;
  chaptersRequired: number;
  submission: {
    id: string;
    status: "grading" | "scored" | "failed";
    score: number;
    maxScore: number;
    submittedAt: string;
  } | null;
}

function statusLine(project: ProjectWire): string {
  if (!project.submission) {
    return project.unlocked ? "Not started" : project.requirement;
  }
  if (project.submission.status === "grading") return "Being marked";
  if (project.submission.status === "failed") return "Marking did not finish";
  return `Scored ${project.submission.score} of ${project.submission.maxScore}`;
}

function ProjectsScreen() {
  const toast = useToast();
  const [projects, setProjects] = useState<ProjectWire[] | null>(null);

  const load = useCallback(() => {
    api<{ projects: ProjectWire[] }>("/api/projects")
      .then((result) => setProjects(result.projects))
      .catch(() => toast.show("Couldn't load your projects.", "error"));
  }, [toast]);

  useEffect(load, [load]);

  if (!projects) {
    return (
      <AppShell>
        <MobileMasthead />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-32 rounded-[--radius-card]" />
          <Skeleton className="h-32 rounded-[--radius-card]" />
        </div>
      </AppShell>
    );
  }

  const open = projects.filter((row) => row.unlocked);
  const locked = projects.filter((row) => !row.unlocked);

  return (
    <AppShell>
      <MobileMasthead />

      <header className="px-5 pt-4 lg:pt-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          The long pieces
        </p>
        <Text variant="display" className="mt-1.5 block">
          Projects
        </Text>
        <p className="mt-2 max-w-[46ch] text-body text-ink-muted">
          These are worth the most points of anything in UVBrain, because they take
          the longest and nobody can do them for you. You can see exactly how each
          one is marked before you start.
        </p>
        <span aria-hidden="true" className="mt-4 block h-[3px] w-16 rounded-full bg-spectrum" />
      </header>

      <div className="mt-6 px-5">
        <ProgressNav />
      </div>

      {open.length > 0 && (
        <section className="mt-7 px-5">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
            Open to you
          </h2>
          <ul className="mt-3 space-y-3">
            {open.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="block rounded-[--radius-card] bg-surface p-5 shadow-[--shadow-card] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-brand">
                      <ClipboardList size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.6875rem] uppercase tracking-wide text-ink-subtle">
                        {project.subjectName}
                      </span>
                      <Text variant="h3" as="span" className="mt-0.5 block">
                        {project.title}
                      </Text>
                      <span className="mt-1 block text-caption text-ink-muted">
                        {project.blurb}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <span
                      className={cn(
                        "text-caption font-semibold",
                        project.submission?.status === "scored"
                          ? "text-verdant-ink"
                          : "text-ink-muted",
                      )}
                    >
                      {statusLine(project)}
                    </span>
                    <span className="text-[0.6875rem] text-ink-subtle">
                      {project.criteria} things it is marked on · up to{" "}
                      {project.maxScore}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {locked.length > 0 && (
        <section className="mt-8 px-5 pb-4">
          <h2 className="font-sans text-sm font-semibold tracking-wide text-ink-muted">
            Not open yet
          </h2>
          <p className="mt-1 text-caption text-ink-subtle">
            Nothing here is hidden — each one says what opens it.
          </p>
          <ul className="mt-3 space-y-2.5">
            {locked.map((project) => (
              <li
                key={project.id}
                className="rounded-[--radius-card] border border-line bg-surface-sunken p-4"
              >
                <div className="flex items-center gap-3">
                  <Lock size={16} className="shrink-0 text-ink-subtle" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption font-semibold text-ink">
                      {project.title}
                    </span>
                    <span className="block text-[0.6875rem] text-ink-subtle">
                      {project.subjectName} · {project.requirement}
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={
                    project.chaptersRequired > 0
                      ? (project.chaptersDone / project.chaptersRequired) * 100
                      : 0
                  }
                  tone="brand"
                  className="mt-3"
                  label={`${project.title} unlock progress`}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length === 0 && (
        <div className="mt-8 px-5">
          <div className="rounded-[--radius-card] bg-surface p-6 text-center shadow-[--shadow-card]">
            <Text variant="h3">No projects yet</Text>
            <Text variant="body" tone="muted" className="mt-2 block">
              Add a subject and the first project appears once you are a few
              chapters in.
            </Text>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ProjectsScreen />
    </ToastProvider>
  );
}
