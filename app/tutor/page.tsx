"use client";

import { Brain, Keyboard, Volume2, VolumeX, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatBubble,
  ChatComposer,
  Companion,
  TypingIndicator,
  Waveform,
} from "@/components/domain";
import { AppShell, MobileMasthead, Skeleton, Text } from "@/components/ui";
import { api, ApiClientError } from "@/lib/api";
import type { TutorState } from "@/lib/tutor/types";
import type { VisemeCue } from "@/lib/tutor/visemes";
import { cn } from "@/lib/ui/cn";
import { useBuddyConversation } from "@/lib/ui/useBuddyConversation";

type Mode = "voice" | "chat";

interface SubjectOption {
  id: string;
  name: string;
}

interface DashboardSummary {
  subjects: SubjectOption[];
  selected: { subject: { id: string } } | null;
}

export default function TutorPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [equipped, setEquipped] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("voice");

  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceBlocked, setVoiceBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { dashboard } = await api<{ dashboard: DashboardSummary }>("/api/dashboard");
        if (cancelled) return;
        setSubjects(dashboard.subjects);
        setSubjectId(dashboard.selected?.subject.id ?? dashboard.subjects[0]?.id ?? null);

        void api<{
          companion: {
            nickname: string | null;
            equipped: Record<string, string>;
          };
        }>("/api/companion")
          .then((result) => {
            if (!cancelled) {
              setNickname(result.companion.nickname);
              setEquipped(result.companion.equipped ?? {});
            }
          })
          .catch(() => undefined);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiClientError && error.status === 401) {
          router.push("/login");
          return;
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const voice = mode === "voice";

  return (
    <AppShell className={cn(voice && "pb-[calc(4.5rem+var(--safe-bottom))] lg:pb-0")}>
      <MobileMasthead />

      <header
        className={cn(
          "flex items-start justify-between gap-4 px-5",
          voice ? "pt-1 lg:pt-6" : "pt-2 lg:pt-10",
        )}
      >
        <div className="min-w-0">
          {voice ? (
            <Text variant="caption" tone="muted">
              {nickname ?? "Study buddy"}
            </Text>
          ) : (
            <>
              <Text variant="display">Study buddy</Text>
              {loaded ? (
                <Text variant="caption" tone="muted" className="mt-1">
                  {subjects.length > 1
                    ? "Ask me anything — I can see all your classes"
                    : "Ask me anything you're working on"}
                </Text>
              ) : (
                <Skeleton className="mt-2 h-4 w-48" />
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setVoiceOn((on) => !on)}
            aria-pressed={voiceOn && !voiceBlocked}
            disabled={voiceBlocked}
            aria-label={voiceOn ? "Turn the buddy's voice off" : "Turn the buddy's voice on"}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors",
              voiceOn && !voiceBlocked
                ? "bg-accent-soft text-brand"
                : "bg-surface-sunken text-ink-subtle",
              voiceBlocked && "opacity-40",
            )}
          >
            {voiceOn && !voiceBlocked ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setMode(voice ? "chat" : "voice")}
            aria-label={voice ? "Switch to typing" : "Switch to talking"}
            className="grid size-10 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors hover:text-ink"
          >
            {voice ? <Keyboard size={18} /> : <Waves size={18} />}
          </button>
        </div>
      </header>

      {loaded && (
        <Conversation
          subjectId={subjectId}
          mode={mode}
          onNeedKeyboard={() => setMode("chat")}
          voiceOn={voiceOn}
          voiceBlocked={voiceBlocked}
          onVoiceUnavailable={() => setVoiceBlocked(true)}
          equipped={equipped}
        />
      )}
    </AppShell>
  );
}

function Conversation({
  subjectId,
  mode,
  onNeedKeyboard,
  voiceOn,
  voiceBlocked,
  onVoiceUnavailable,
  equipped,
}: {
  subjectId: string | null;
  mode: Mode;
  onNeedKeyboard: () => void;
  voiceOn: boolean;
  voiceBlocked: boolean;
  onVoiceUnavailable: () => void;
  equipped: Record<string, string>;
}) {
  const [typed, setTyped] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const buddy = useBuddyConversation({
    enabled: true,
    autoConverse: false,
    trackTurns: true,
    voiceOn: voiceOn && !voiceBlocked,
    onVoiceUnavailable,
    activation: {
      surface: "free",
      subjectId,
    },
  });

  const {
    session,
    turns,
    draft,
    thinking,
    notice,
    setNotice,
    conversing,
    setConversing,
    orbState,
    listening,
    speaking,
    recording,
    levels,
    micError,
    spoken,
    send,
    onOrbTap,
    stopAll,
  } = buddy;

  useEffect(() => {
    if (micError) onNeedKeyboard();
  }, [micError, onNeedKeyboard]);

  useEffect(() => {
    if (mode === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [turns, draft, thinking, mode]);

  const status = notice
    ? notice
    : micError
      ? micError
      : !session
        ? "Waking up…"
        : thinking
          ? "Thinking…"
          : speaking
            ? "Just talk if you want to jump in"
            : listening
              ? "I'm listening…"
              : conversing
                ? "Go ahead, I'm here"
                : "Tap me and just start talking";

  if (mode === "voice") {
    const lastUser = [...turns].reverse().find((t) => t.role === "user");
    const lastReply =
      draft || [...turns].reverse().find((t) => t.role === "assistant")?.content;

    return (
      <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9rem)]">
        <Stage
          state={orbState}
          cues={spoken.cues}
          getPlayheadMs={spoken.getPlayheadMs}
          onTap={session ? onOrbTap : undefined}
          recording={listening}
          levels={levels}
          status={status}
          isError={Boolean(notice || micError)}
          conversing={conversing}
          equipped={equipped}
        />

        <div className="shrink-0 space-y-1.5 px-6 pb-4">
          {lastUser && (
            <p className="truncate text-center text-xs text-ink-subtle">
              You said: “{lastUser.content}”
            </p>
          )}
          {lastReply && (
            <p className="line-clamp-2 text-center text-[0.8125rem] leading-snug text-ink-muted">
              {lastReply}
            </p>
          )}

          {session && session.memoryCount > 0 && !lastUser && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-subtle">
              <Brain size={12} aria-hidden="true" />
              Remembers {session.memoryCount} things about how you learn
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center px-5 pt-5">
        <Companion
          state={orbState}
          size={88}
          cues={spoken.cues}
          getPlayheadMs={spoken.getPlayheadMs}
          onClick={session ? onOrbTap : undefined}
          label="Tap to talk instead of typing"
          equipped={equipped}
        />
        <p
          aria-live="polite"
          className={cn(
            "mt-3 min-h-5 text-center text-sm",
            notice ? "text-ember-ink" : "text-ink-muted",
          )}
        >
          {status}
        </p>
      </section>

      <div className="mt-6 space-y-5 px-5">
        {turns.map((turn) => (
          <ChatBubble key={turn.id} role={turn.role}>
            {turn.content}
          </ChatBubble>
        ))}

        {draft && <ChatBubble role="assistant">{draft}</ChatBubble>}
        {thinking && !draft && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-[calc(4.75rem+var(--safe-bottom))] mt-6 px-5 lg:bottom-5">
        <ChatComposer
          value={typed}
          onChange={setTyped}
          onSend={() => {
            const value = typed;
            setTyped("");
            void send(value, false);
          }}
          onStartVoice={
            micError
              ? undefined
              : () => {
                  setNotice(null);
                  setConversing(true);
                }
          }
          onStopVoice={() => stopAll()}
          recording={recording}
          levels={levels}
          disabled={!session || thinking}
          placeholder={session ? "Ask anything" : "Waking up…"}
        />
      </div>
    </>
  );
}

function Stage({
  state,
  cues,
  getPlayheadMs,
  onTap,
  recording,
  levels,
  status,
  isError,
  conversing,
  equipped,
}: {
  state: TutorState;
  cues: VisemeCue[] | null;
  getPlayheadMs: () => number | null;
  onTap?: () => void;
  recording: boolean;
  levels: number[];
  status: string;
  isError: boolean;
  conversing: boolean;
  equipped: Record<string, string>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(240);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(Math.max(160, Math.floor(Math.min(width * 0.88, height * 0.78))));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-5"
    >
      <div className="relative grid place-items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full opacity-50 blur-3xl"
          style={{
            width: size * 1.35,
            height: size * 1.35,
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-brand, #5B3CE4) 32%, transparent) 0%, transparent 70%)",
          }}
        />
        {recording && (
          <span
            aria-hidden="true"
            className="absolute animate-ping rounded-full bg-brand/15"
            style={{ width: size * 0.94, height: size * 0.94 }}
          />
        )}
        <Companion
          state={state}
          size={size}
          cues={cues}
          getPlayheadMs={getPlayheadMs}
          onClick={onTap}
          label={conversing ? "Stop the conversation" : "Tap and start talking"}
          equipped={equipped}
        />
      </div>

      <div className="flex h-10 w-full max-w-xs flex-col items-center justify-center">
        {recording ? (
          <Waveform levels={levels} className="w-full" />
        ) : (
          <p
            aria-live="polite"
            className={cn(
              "text-center text-base",
              isError ? "text-ember-ink" : "text-ink-muted",
            )}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

function messageFor(error: unknown): string {
  return error instanceof ApiClientError
    ? error.message
    : "Something went wrong. Try that again.";
}
