"use client";

import { ArrowLeft, ArrowRight, GraduationCap, ShieldQuestionMark } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizOption } from "@/components/domain";
import { Button, Skeleton, Text } from "@/components/ui";
import { api, apiPost } from "@/lib/api";
import { cn } from "@/lib/ui/cn";

interface Payload {
  quiz: {
    id: string;
    title: string;
    totalQuestions: number;
    maxScore: number;
    questions: Array<{ id: string; order: number; prompt: string; options: string[] }>;
  };
  attemptId: string;
  exam: {
    kind: "exam" | "final";
    subjectName: string;
    covers: string[];
    previousBest: { percent: number; passed: boolean } | null;
    attempts: number;
  };
}

export default function ExamPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api<Payload>(`/api/exams/${params.quizId}`)
      .then(setData)
      .catch(() => router.push("/progress"));
  }, [params.quizId, router]);

  async function submit() {
    if (!data) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/attempts/${data.attemptId}/submit`, { answers: picked });
      router.push(`/results/${data.attemptId}`);
    } catch {
      setSubmitting(false);
      setConfirming(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[34rem] space-y-4 px-5 py-12">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton lines={4} />
      </div>
    );
  }

  const { quiz, exam } = data;
  const isFinal = exam.kind === "final";
  const answered = Object.keys(picked).length;

  if (!started) {
    return (
      <div
        data-ground="cosmos"
        className="arcade-ground relative min-h-dvh px-5 pb-12 pt-safe text-white"
      >
        <div className="mx-auto max-w-[30rem] pt-12">
          <span className="grid size-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
            <GraduationCap size={26} aria-hidden="true" />
          </span>

          <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            {exam.subjectName} · {isFinal ? "Final exam" : "Unit exam"}
          </p>
          <Text variant="display" className="mt-1.5 block text-white">
            {quiz.title}
          </Text>

          <p className="mt-3 max-w-[42ch] text-body leading-relaxed text-white/65">
            {isFinal
              ? "Everything you have covered in this course, in one sitting. It is worth three times what a lesson quiz is worth."
              : "This one spans several chapters at once, so it is worth double a lesson quiz. You can move back and forth between questions before you hand it in."}
          </p>

          <div className="glass mt-7 rounded-[--radius-card] p-5">
            <p className="text-caption font-semibold uppercase tracking-wide text-white/50">
              What it covers
            </p>
            <ul className="mt-3 space-y-1.5">
              {exam.covers.map((title) => (
                <li key={title} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white/35"
                  />
                  <span className="text-caption text-white/75">{title}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-wide text-white/45">
                  Questions
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {quiz.totalQuestions}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-wide text-white/45">
                  {exam.previousBest ? "Your best" : "Attempts"}
                </dt>
                <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
                  {exam.previousBest ? `${exam.previousBest.percent}%` : exam.attempts}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-5 flex items-start gap-2 text-caption text-white/45">
            <ShieldQuestionMark size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              There is no timer and no penalty for taking it again. A retake is worth
              less than passing first time, so it is worth thinking before you answer.
            </span>
          </p>

          <div className="mt-8 space-y-2.5">
            <Button fullWidth onClick={() => setStarted(true)}>
              Start the exam
            </Button>
            <Button fullWidth variant="ghost" onClick={() => router.push("/progress")}>
              Not yet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[index];

  return (
    <div data-ground="cosmos" className="arcade-ground min-h-dvh text-white">
      <header className="sticky top-0 z-30 bg-cosmos/85 pt-safe backdrop-blur-xl">
        <div className="mx-auto max-w-[34rem] px-5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <Text variant="h3" className="min-w-0 truncate text-white">
              {quiz.title}
            </Text>
            <span className="shrink-0 text-caption tabular-nums text-white/50">
              {answered}/{quiz.totalQuestions}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 pb-3">
            {quiz.questions.map((row, position) => {
              const done = picked[row.id] !== undefined;
              const here = position === index;
              return (
                <button
                  key={row.id}
                  type="button"
                  aria-label={`Question ${position + 1}${done ? ", answered" : ""}`}
                  aria-current={here ? "true" : undefined}
                  onClick={() => setIndex(position)}
                  className={cn(
                    "size-6 rounded-md text-[0.625rem] font-bold tabular-nums transition",
                    here
                      ? "bg-white text-cosmos"
                      : done
                        ? "bg-white/25 text-white"
                        : "bg-white/8 text-white/45 hover:bg-white/15",
                  )}
                >
                  {position + 1}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[34rem] px-5 pb-36 pt-6">
        <Text variant="caption" className="text-white/50">
          Question {index + 1} of {quiz.questions.length}
        </Text>
        <Text variant="h2" className="mt-2 text-white">
          {question.prompt}
        </Text>

        <div className="mt-6 space-y-2.5">
          {question.options.map((option, optionIndex) => (
            <QuizOption
              key={optionIndex}
              label={option}
              state={picked[question.id] === optionIndex ? "selected" : "idle"}
              onClick={() =>
                setPicked((current) => ({ ...current, [question.id]: optionIndex }))
              }
            />
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-cosmos/90 pb-safe backdrop-blur-xl">
        <div className="mx-auto flex max-w-[34rem] items-center gap-2.5 px-5 py-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </Button>

          {index < quiz.questions.length - 1 ? (
            <Button fullWidth onClick={() => setIndex(index + 1)}>
              Next
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          ) : (
            <Button
              fullWidth
              variant="accent"
              loading={submitting}
              onClick={() =>
                answered < quiz.totalQuestions ? setConfirming(true) : submit()
              }
            >
              Hand it in
            </Button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-cosmos/70 p-4 backdrop-blur-sm sm:place-items-center">
          <div className="glass w-full max-w-[26rem] rounded-[--radius-sheet] p-6">
            <Text variant="h2" className="block text-white">
              {quiz.totalQuestions - answered} left blank
            </Text>
            <p className="mt-2 text-body text-white/65">
              Blank answers score nothing. You can go back and fill them in, or hand
              it in as it stands.
            </p>
            <div className="mt-6 space-y-2.5">
              <Button fullWidth variant="secondary" onClick={() => setConfirming(false)}>
                Go back and finish
              </Button>
              <Button fullWidth loading={submitting} onClick={submit}>
                Hand it in anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
