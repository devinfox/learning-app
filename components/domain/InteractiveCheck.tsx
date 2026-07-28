"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";
import { QuizOption, type QuizOptionState } from "./QuizOption";

export type InteractiveKind = "mcq" | "true_false" | "drag_drop";

export interface InteractiveResult {
  correct: boolean;
  correctAnswer: number[];
  explanation: string;
}

export interface InteractiveCheckProps {
  id: string;
  kind: InteractiveKind;
  prompt: string;
  options: string[];
  onCheck: (answer: number[]) => Promise<InteractiveResult>;
  className?: string;
}

export function InteractiveCheck({
  id,
  kind,
  prompt,
  options,
  onCheck,
  className,
}: InteractiveCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>(() => options.map((_, index) => index));
  const [result, setResult] = useState<InteractiveResult | null>(null);
  const [checking, setChecking] = useState(false);

  const isOrdering = kind === "drag_drop";
  const answer = isOrdering ? order : selected === null ? [] : [selected];
  const canCheck = answer.length > 0 && !checking;

  async function handleCheck() {
    setChecking(true);
    try {
      setResult(await onCheck(answer));
    } finally {
      setChecking(false);
    }
  }

  function reset() {
    setResult(null);
    if (!isOrdering) setSelected(null);
  }

  function move(from: number, direction: -1 | 1) {
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
    setResult(null);
  }

  function stateFor(index: number): QuizOptionState {
    if (!result) return selected === index ? "selected" : "idle";
    const isCorrectOption = result.correctAnswer[0] === index;
    if (selected === index) return isCorrectOption ? "correct" : "incorrect";
    if (isCorrectOption) return "revealed";
    return "idle";
  }

  return (
    <section
      aria-labelledby={`${id}-prompt`}
      className={cn(
        "rounded-[--radius-card] border border-line bg-surface p-4",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
        {isOrdering ? "Put these in order" : "Practice"}
      </p>
      <p id={`${id}-prompt`} className="mt-1.5 text-[0.9375rem] font-medium text-ink">
        {prompt}
      </p>

      {isOrdering ? (
        <ol className="mt-4 space-y-2">
          {order.map((optionIndex, position) => (
            <li
              key={optionIndex}
              className={cn(
                "flex items-center gap-2 rounded-[--radius-field] border-2 px-3 py-2.5",
                result
                  ? result.correctAnswer[position] === optionIndex
                    ? "border-verdant bg-verdant/10"
                    : "border-ember bg-ember/5"
                  : "border-transparent bg-surface-sunken",
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cosmos text-[0.6875rem] font-bold text-white tabular-nums">
                {position + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm text-ink">
                {options[optionIndex]}
              </span>
              <span className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(position, -1)}
                  disabled={position === 0}
                  aria-label={`Move "${options[optionIndex]}" up`}
                  className="grid size-6 place-items-center rounded text-ink-muted hover:bg-line disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(position, 1)}
                  disabled={position === order.length - 1}
                  aria-label={`Move "${options[optionIndex]}" down`}
                  className="grid size-6 place-items-center rounded text-ink-muted hover:bg-line disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 space-y-2">
          {options.map((option, index) => (
            <QuizOption
              key={index}
              label={option}
              prefix={kind === "true_false" ? `${String.fromCharCode(65 + index)})` : undefined}
              state={stateFor(index)}
              disabled={Boolean(result)}
              onClick={() => {
                setSelected(index);
                setResult(null);
              }}
            />
          ))}
        </div>
      )}

      {result ? (
        <div className="mt-4 space-y-3">
          <p
            className={cn(
              "text-sm font-medium",
              result.correct ? "text-verdant-ink" : "text-ember-ink",
            )}
          >
            {result.correct ? "Correct." : "Not quite."}
          </p>
          <p className="text-sm leading-relaxed text-ink-muted">{result.explanation}</p>
          <Button variant="ghost" size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      ) : (
        <Button
          fullWidth
          size="md"
          className="mt-4"
          disabled={!canCheck}
          loading={checking}
          onClick={handleCheck}
        >
          Check Answer
        </Button>
      )}
    </section>
  );
}
