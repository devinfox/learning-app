"use client";

import { Lightbulb, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RunState } from "../machine/types";
import type { HintStep } from "../questions/types";

export interface QuestionPanelProps {
  state: RunState;
  interactive: boolean;
  onAnswer(optionIndex: number): void;
  onHint(): void;
}

function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function ArrayDiagram({
  rows,
  cols,
  hint,
}: {
  rows: number;
  cols: number;
  hint: HintStep | null;
}) {
  const splitAfter =
    hint?.directive?.kind === "highlightArray" ? hint.directive.splitAfterRow : -1;
  const size = Math.max(8, Math.min(14, Math.floor(112 / Math.max(rows, cols))));

  return (
    <div
      className="flex flex-none flex-col gap-1 rounded-xl border border-[var(--dd-line)] bg-[rgb(10_12_32/0.55)] p-2.5"
      role="img"
      aria-label={`${rows} rows of ${cols}`}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: cols }, (_, col) => (
            <span
              key={col}
              className="dd-array-cell"
              style={{ width: size, height: size }}
              data-group={splitAfter >= 0 && row >= splitAfter ? "b" : "a"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function QuestionPanel({
  state,
  interactive,
  onAnswer,
  onHint,
}: QuestionPanelProps) {
  const [selection, setSelection] = useState<{
    questionId: string;
    attempt: number;
    index: number;
  } | null>(null);
  const question = state.question;
  const current = selection?.questionId === question?.id ? selection : null;
  const selected = current?.index ?? null;
  const wasWrong = current !== null && current.attempt < state.attempt;

  useEffect(() => {
    if (!interactive || !question) return;
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index < 0 || index >= question.options.length) return;
      if (state.eliminated.includes(index)) return;
      event.preventDefault();
      setSelection({ questionId: question.id, attempt: state.attempt, index });
      onAnswer(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, question, state.attempt, state.eliminated, onAnswer]);

  if (!question) {
    return (
      <div className="dd-panel dd-rise pointer-events-auto w-full max-w-3xl p-6 text-center text-sm text-[var(--dd-cream-dim)]">
        Charging your move...
      </div>
    );
  }

  const revealed = state.revealedIndex;
  const hintsLeft = question.hintCount - state.hintLevel;

  const stateFor = (index: number): string => {
    if (revealed !== null && index === revealed) return "correct";
    if (revealed !== null && index === selected) return "wrong";
    if (state.eliminated.includes(index)) return "eliminated";
    if (wasWrong && selected === index) return "wrong";
    return "idle";
  };

  return (
    <div className="dd-panel dd-rise pointer-events-auto w-full max-w-4xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dd-cream-dim)]">
            Multiplication
          </p>
          <p className="dd-display mt-0.5 text-lg leading-snug sm:text-xl">
            {question.prompt}
          </p>
        </div>
        <button
          type="button"
          className="dd-btn dd-icon-btn flex-none p-2.5"
          onClick={() => speak(question.prompt)}
          aria-label="Read the question aloud"
        >
          <Volume2 size={18} aria-hidden="true" />
        </button>
      </div>

      {state.hint ? <p className="dd-hint">{state.hint.text}</p> : null}

      <div className="mt-2.5 flex items-stretch gap-3">
        {question.diagram?.kind === "array" ? (
          <ArrayDiagram
            rows={question.diagram.rows}
            cols={question.diagram.cols}
            hint={state.hint}
          />
        ) : null}

        <div className="grid flex-1 gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className="dd-btn dd-option"
            data-state={stateFor(index)}
            disabled={!interactive || state.eliminated.includes(index)}
            onClick={() => {
              setSelection({
                questionId: question.id,
                attempt: state.attempt,
                index,
              });
              onAnswer(index);
            }}
          >
            <span className="dd-key">{index + 1}</span>
            <span>{option}</span>
          </button>
        ))}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="dd-btn px-3 py-2 text-sm"
          disabled={!interactive || hintsLeft <= 0}
          onClick={onHint}
        >
          <span className="flex items-center gap-2">
            <Lightbulb size={16} aria-hidden="true" />
            {hintsLeft > 0 ? `Hint (${hintsLeft} left)` : "No hints left"}
          </span>
        </button>

        {state.explanation ? (
          <p className="text-sm text-[var(--dd-mint)]">{state.explanation}</p>
        ) : (
          <p className="text-xs text-[var(--dd-cream-dim)]">
            Attempt {state.attempt} of 2
          </p>
        )}
      </div>
    </div>
  );
}
