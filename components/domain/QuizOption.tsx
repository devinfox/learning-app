import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type QuizOptionState = "idle" | "selected" | "correct" | "incorrect" | "revealed";

export interface QuizOptionProps {
  label: ReactNode;
  prefix?: string;
  state?: QuizOptionState;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SHELLS: Record<QuizOptionState, string> = {
  idle: "bg-surface-sunken border-transparent hover:bg-line",
  selected: "bg-accent-soft border-brand",
  correct: "bg-verdant/15 border-verdant",
  incorrect: "bg-ember/10 border-ember",
  revealed: "bg-verdant/10 border-verdant/50 border-dashed",
};

function Marker({ state }: { state: QuizOptionState }) {
  if (state === "correct" || state === "revealed") {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-verdant text-white">
        <Check size={14} strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  if (state === "incorrect") {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-ember text-white">
        <X size={14} strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  if (state === "selected") {
    return (
      <span className="grid size-6 place-items-center rounded-full bg-cosmos text-white">
        <Check size={14} strokeWidth={3} aria-hidden="true" />
      </span>
    );
  }
  return <span className="size-6 rounded-full border-2 border-line-strong" />;
}

export function QuizOption({
  label,
  prefix,
  state = "idle",
  onClick,
  disabled,
  className,
}: QuizOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "flex w-full items-center gap-3 rounded-[--radius-field] border-2 px-4 py-3.5",
        "text-left text-[0.9375rem] text-ink transition",
        "disabled:pointer-events-none",
        SHELLS[state],
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        {prefix && <span className="mr-1.5 text-ink-muted">{prefix}</span>}
        {label}
      </span>
      <Marker state={state} />
    </button>
  );
}
