"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizOption } from "@/components/domain";
import { Button, ProgressBar, Skeleton, Text } from "@/components/ui";
import { api, apiPost } from "@/lib/api";

interface QuizPayload {
  quiz: {
    id: string;
    title: string;
    totalQuestions: number;
    maxScore: number;
    questions: Array<{ id: string; order: number; prompt: string; options: string[] }>;
  };
  attemptId: string | null;
}

export default function QuizPage() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [data, setData] = useState<QuizPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<QuizPayload>(`/api/lessons/${params.lessonId}/quiz`)
      .then(setData)
      .catch(() => router.push(`/lessons/${params.lessonId}`));
  }, [params.lessonId, router]);

  async function submit() {
    if (!data?.attemptId) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/attempts/${data.attemptId}/submit`, { answers: picked });
      router.push(`/results/${data.attemptId}`);
    } catch {
      setSubmitting(false);
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

  const question = data.quiz.questions[index];
  const isLast = index === data.quiz.questions.length - 1;
  const answered = picked[question.id] !== undefined;

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 bg-ground/90 pt-safe backdrop-blur-md">
        <div className="mx-auto max-w-[34rem] px-5 py-3">
          <Text variant="h3">{data.quiz.title}</Text>
        </div>
        <ProgressBar
          value={((index + 1) / data.quiz.questions.length) * 100}
          tone="cosmos"
          size="md"
          className="rounded-none"
          label="Quiz progress"
        />
      </header>

      <div className="mx-auto max-w-[34rem] px-5 pb-32 pt-6">
        <Text variant="caption" tone="muted">
          Question {index + 1} of {data.quiz.questions.length}
        </Text>
        <Text variant="h2" className="mt-2">
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

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ground/95 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-[34rem] px-5 py-3">
          {isLast ? (
            <Button fullWidth onClick={submit} loading={submitting} disabled={!answered}>
              Submit
            </Button>
          ) : (
            <Button fullWidth onClick={() => setIndex(index + 1)} disabled={!answered}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
