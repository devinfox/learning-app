"use client";

import { ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  InteractiveCheck,
  ReadingBuddy,
  ReadingBuddyTrigger,
  ReadingPortal,
  RewardUnlock,
} from "@/components/domain";
import {
  Button,
  ProgressBar,
  Skeleton,
  StepDots,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPatch, apiPost } from "@/lib/api";
import { rewardById } from "@/lib/gamification/catalog";
import type { EarnedReward } from "@/lib/gamification/types";
import { cn } from "@/lib/ui/cn";

interface Slide {
  id: string;
  order: number;
  heading: string;
  body: string[];
  reading: {
    title: string;
    attribution: string;
    body: string[];
    guidingQuestions: string[];
  } | null;
  interactive: {
    id: string;
    kind: "mcq" | "true_false" | "drag_drop";
    prompt: string;
    options: string[];
  } | null;
}

interface LessonPayload {
  glossary: Array<{ term: string; definition: string }>;
  lesson: {
    id: string;
    title: string;
    status: string;
    subjectId: string;
    quizId: string | null;
    slides: Slide[];
  };
  progress: {
    slideIndex: number;
    attemptedInteractiveIds: string[];
    completed: boolean;
  };
}

function LessonReader() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<LessonPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [attempted, setAttempted] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState<EarnedReward[]>([]);
  const [pendingQuiz, setPendingQuiz] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);

  useEffect(() => {
    api<LessonPayload>(`/api/lessons/${params.lessonId}`)
      .then((result) => {
        setData(result);
        setAttempted(new Set(result.progress.attemptedInteractiveIds));
        setIndex(Math.min(result.progress.slideIndex, result.lesson.slides.length - 1));
      })
      .catch(() => router.push("/dashboard"));
  }, [params.lessonId, router]);

  const slides = data?.lesson.slides ?? [];
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const needsAnswer = Boolean(slide?.interactive && !attempted.has(slide.interactive.id));

  const record = useCallback(
    (next: number) => {
      void apiPatch(`/api/lessons/${params.lessonId}/progress`, { slideIndex: next }).catch(
        () => undefined,
      );
    },
    [params.lessonId],
  );

  function go(delta: number) {
    if (delta > 0 && needsAnswer) return;
    const next = Math.max(0, Math.min(slides.length - 1, index + delta));
    setIndex(next);
    record(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finish() {
    setFinishing(true);
    try {
      const result = await apiPost<{
        quizId: string | null;
        unlocked: Array<{ id: string; reason: string; earnedAt: string }>;
      }>(`/api/lessons/${params.lessonId}/complete`);

      const earned = result.unlocked
        .map((row) => {
          const reward = rewardById(row.id);
          return reward ? { reward, earnedAt: row.earnedAt, reason: row.reason } : null;
        })
        .filter((row): row is EarnedReward => row !== null);

      if (earned.length > 0) {
        setUnlocked(earned);
        setPendingQuiz(Boolean(result.quizId));
        setFinishing(false);
        return;
      }

      if (result.quizId) {
        router.push(`/lessons/${params.lessonId}/quiz`);
      } else {
        toast.show("Lesson complete.", "success");
        router.push(`/subjects/${data?.lesson.subjectId}`);
      }
    } catch (error) {
      toast.show(
        error instanceof Error && error.message
          ? error.message
          : "Couldn't save that. Try again.",
        "error",
      );
      setFinishing(false);
    }
  }

  async function checkInteractive(interactiveId: string, answer: number[]) {
    const result = await apiPost<{
      correct: boolean;
      correctAnswer: number[];
      explanation: string;
    }>(`/api/lessons/${params.lessonId}/interactives/${interactiveId}/check`, { answer });
    setAttempted((previous) => new Set(previous).add(interactiveId));
    return result;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[42rem] space-y-4 px-5 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton lines={5} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-dvh bg-paper transition-[padding] duration-200",
        buddyOpen && "lg:pr-[22rem]",
      )}
    >
      <header className="sticky top-0 z-30 bg-ground/90 pt-safe backdrop-blur-md">
        <div className="mx-auto flex max-w-[42rem] items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(`/subjects/${data.lesson.subjectId}`)}
            aria-label="Back to course"
            className="-ml-2 grid size-10 place-items-center rounded-full text-ink transition hover:bg-surface-sunken"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <Text variant="caption" tone="subtle" className="truncate">
              {data.lesson.title}
            </Text>
          </div>
          <Text variant="caption" tone="subtle" className="shrink-0 tabular-nums">
            Page {index + 1} of {slides.length}
          </Text>
        </div>
        <ProgressBar
          value={((index + 1) / slides.length) * 100}
          tone="lumen"
          size="md"
          className="rounded-none"
          label="Lesson progress"
        />
      </header>

      <div className="px-4 pb-44 pt-7 sm:px-6">
        <ReadingPortal
          heading={slide.heading}
          body={slide.body}
          source={slide.reading}
          glossary={data.glossary}
          documentTitle={data.lesson.title}
          page={index + 1}
          pageCount={slides.length}
        >
          {slide.interactive && (
            <InteractiveCheck
              key={slide.interactive.id}
              id={slide.interactive.id}
              kind={slide.interactive.kind}
              prompt={slide.interactive.prompt}
              options={slide.interactive.options}
              onCheck={(answer) => checkInteractive(slide.interactive!.id, answer)}
              className="mt-8"
            />
          )}

          {isLast && data.lesson.quizId && (
            <div className="mt-8 rounded-[--radius-card] bg-cosmos p-5">
              <div data-ground="cosmos">
                <Text variant="overline" tone="muted">
                  Next
                </Text>
                <Text variant="h3" className="mt-1 block">
                  Lesson quiz
                </Text>
                <Text variant="body" tone="muted" className="mt-1.5 block">
                  Pass it to open the next lesson. You can retake it as many
                  times as you need.
                </Text>
              </div>
            </div>
          )}
        </ReadingPortal>

        <StepDots
          total={slides.length}
          current={index}
          className="mt-10 justify-center"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ground/95 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-[48rem] px-5 py-3">
          {needsAnswer && (
            <p className="mb-2 flex items-center justify-center gap-1.5 text-caption font-medium text-ink-muted">
              <PencilLine size={14} aria-hidden="true" />
              Answer the question on this page to keep going
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => go(-1)}
              disabled={index === 0}
              leadingIcon={<ChevronLeft size={18} />}
              className="flex-1"
            >
              Previous
            </Button>
            {isLast ? (
              <Button
                size="md"
                onClick={finish}
                loading={finishing}
                disabled={needsAnswer}
                trailingIcon={<ChevronRight size={18} />}
                className="flex-[1.4]"
              >
                {data.lesson.quizId ? "Lesson quiz" : "Finish lesson"}
              </Button>
            ) : (
              <Button
                size="md"
                onClick={() => go(1)}
                disabled={needsAnswer}
                trailingIcon={<ChevronRight size={18} />}
                className="flex-1"
              >
                Next page
              </Button>
            )}
          </div>
        </div>
      </div>

      {unlocked.length > 0 && (
        <RewardUnlock
          occasion="Lesson finished"
          rewards={unlocked}
          closeLabel={pendingQuiz ? "On to the quiz" : "Nice"}
          onClose={() => {
            setUnlocked([]);
            if (pendingQuiz) router.push(`/lessons/${params.lessonId}/quiz`);
            else router.push(`/subjects/${data.lesson.subjectId}`);
          }}
        />
      )}

      <ReadingBuddyTrigger
        hidden={buddyOpen}
        onClick={() => setBuddyOpen(true)}
      />
      <ReadingBuddy
        open={buddyOpen}
        onOpenChange={setBuddyOpen}
        lessonId={data.lesson.id}
        subjectId={data.lesson.subjectId}
        slideIndex={index}
        slideHeading={slide?.heading}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <LessonReader />
    </ToastProvider>
  );
}
