"use client";

import { MessageCircle, X } from "lucide-react";
import { Text } from "@/components/ui/Text";
import { useBuddyConversation } from "@/lib/ui/useBuddyConversation";
import { cn } from "@/lib/ui/cn";
import { Companion } from "./Companion";
import { Waveform } from "./Chat";

export interface ReadingBuddyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  subjectId: string;
  slideIndex: number;
  slideHeading?: string;
  className?: string;
}

export function ReadingBuddy({
  open,
  onOpenChange,
  lessonId,
  subjectId,
  slideIndex,
  slideHeading,
  className,
}: ReadingBuddyProps) {
  const buddy = useBuddyConversation({
    enabled: open,
    autoConverse: true,
    trackTurns: false,
    activation: {
      surface: "lesson",
      subjectId,
      lessonId,
      slideIndex,
    },
  });

  const close = () => {
    buddy.stopAll();
    onOpenChange(false);
  };

  const status = buddy.notice
    ? buddy.notice
    : buddy.micError
      ? buddy.micError
      : !buddy.session
        ? "Waking up…"
        : buddy.listening
          ? "I'm listening…"
          : buddy.thinking
            ? "Thinking…"
            : buddy.speaking
              ? "Tap to interrupt"
              : buddy.conversing
                ? "Go ahead — ask about this page"
                : "Tap me to keep talking";

  if (!open) return null;

  return (
    <aside
      role="complementary"
      aria-label="Study buddy"
      className={cn(
        "pointer-events-auto fixed z-40 flex flex-col overflow-hidden",
        "border border-line bg-surface shadow-[--shadow-raised]",
        "inset-x-3 bottom-[calc(5.5rem+var(--safe-bottom))] max-h-[min(52dvh,22rem)]",
        "rounded-[--radius-sheet]",
        "sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24",
        "sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[20.5rem] sm:max-h-none",
        "lg:right-8 xl:right-10",
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-line px-3.5 py-2.5">
        <div className="min-w-0">
          <Text variant="overline" tone="muted">
            Study buddy
          </Text>
          {slideHeading && (
            <Text variant="caption" tone="subtle" className="mt-0.5 block truncate">
              {slideHeading}
            </Text>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close study buddy"
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-surface-sunken hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-3">
        <div className="relative grid place-items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full opacity-50 blur-2xl"
            style={{
              width: 140,
              height: 140,
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-brand, #5B3CE4) 32%, transparent) 0%, transparent 70%)",
            }}
          />
          {buddy.listening && (
            <span
              aria-hidden="true"
              className="absolute size-[7.5rem] animate-ping rounded-full bg-brand/15"
            />
          )}
          <Companion
            state={buddy.orbState}
            size={120}
            cues={buddy.spoken.cues}
            getPlayheadMs={buddy.spoken.getPlayheadMs}
            onClick={buddy.session ? buddy.onOrbTap : undefined}
            label={
              buddy.conversing ? "Stop the conversation" : "Tap and start talking"
            }
          />
        </div>

        <div className="flex h-9 w-full flex-col items-center justify-center">
          {buddy.listening ? (
            <Waveform levels={buddy.levels} className="w-full" />
          ) : (
            <p
              aria-live="polite"
              className={cn(
                "px-1 text-center text-xs leading-snug",
                buddy.notice || buddy.micError ? "text-ember-ink" : "text-ink-muted",
              )}
            >
              {status}
            </p>
          )}
        </div>

        <div className="w-full space-y-1 text-center">
          {buddy.lastHeard && (
            <p className="truncate text-[0.6875rem] text-ink-subtle">
              You: “{buddy.lastHeard}”
            </p>
          )}
          {(buddy.draft || buddy.lastAssistant) && (
            <p className="line-clamp-4 text-left text-[0.8125rem] leading-snug text-ink-muted">
              {buddy.draft || buddy.lastAssistant}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function ReadingBuddyTrigger({
  onClick,
  className,
  hidden,
}: {
  onClick: () => void;
  className?: string;
  hidden?: boolean;
}) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Talk to your study buddy about this page"
      className={cn(
        "group fixed z-40 flex items-center gap-2 rounded-full",
        "bg-cosmos py-1.5 pl-1.5 pr-3.5 shadow-[--shadow-raised]",
        "ring-1 ring-white/10 transition hover:brightness-110 active:scale-95",
        "bottom-[calc(5.75rem+var(--safe-bottom))] right-4 sm:bottom-8 sm:right-8",
        className,
      )}
    >
      <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-cosmos">
        <Companion size={44} state="idle" className="pointer-events-none" />
      </span>
      <span className="hidden text-left sm:block">
        <span className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-white/55">
          Stuck?
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-white">
          <MessageCircle size={14} aria-hidden="true" className="text-lumen" />
          Ask buddy
        </span>
      </span>
      <span className="grid size-9 place-items-center rounded-full bg-brand text-white sm:hidden">
        <MessageCircle size={18} aria-hidden="true" />
      </span>
    </button>
  );
}
