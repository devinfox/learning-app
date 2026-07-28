"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizOption } from "@/components/domain";
import { Button, EmptyState, ProgressBar, Skeleton, Spinner, Text } from "@/components/ui";
import { api, apiPost } from "@/lib/api";

interface PlacementPayload {
  quiz: {
    id: string;
    title: string;
    status: "generating" | "ready" | "failed";
    questions: Array<{ id: string; order: number; prompt: string; options: string[] }>;
  };
  attemptId: string | null;
}

export default function PlacementPage() {
  const params = useParams<{ subjectId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PlacementPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await api<PlacementPayload>(
          `/api/me/subjects/${params.subjectId}/placement`,
        );
        if (cancelled) return;
        setData(result);
        if (result.quiz.status === "generating") timer = setTimeout(poll, 2500);
      } catch {
        if (!cancelled) router.push(`/subjects/${params.subjectId}`);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [params.subjectId, router]);

  async function submit() {
    if (!data?.attemptId) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/attempts/${data.attemptId}/submit`, { answers: picked });
      router.push(`/subjects/${params.subjectId}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function skip() {
    await apiPost(`/api/me/subjects/${params.subjectId}/placement/skip`).catch(() => undefined);
    router.push(`/subjects/${params.subjectId}`);
  }

  if (!data || data.quiz.status === "generating") {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={28} />
          <Text variant="h3">Writing your placement check</Text>
          <Text variant="body" tone="muted" className="max-w-[32ch]">
            A few questions, so we can start you in the right place rather than the beginning.
          </Text>
          <Button variant="ghost" size="sm" onClick={skip}>
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  if (data.quiz.status === "failed") {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6">
        <EmptyState
          title="We couldn't build that check"
          description="You can skip it and start at the beginning — you'll still get the whole course."
          action={<Button size="md" onClick={skip}>Skip for now</Button>}
        />
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
          label="Placement progress"
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

        <Button variant="ghost" size="sm" onClick={skip} className="mt-6">
          Skip this check
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ground/95 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-[34rem] px-5 py-3">
          <Button
            fullWidth
            onClick={isLast ? submit : () => setIndex(index + 1)}
            loading={submitting}
            disabled={!answered}
          >
            {isLast ? "See my result" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
