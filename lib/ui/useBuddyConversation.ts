"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiClientError, apiEventStream, apiPost, apiUpload } from "@/lib/api";
import type { GradeBand, TutorState, TutorSurface } from "@/lib/tutor/types";
import { useMicrophone } from "@/lib/ui/useMicrophone";
import { createSentenceSpeaker } from "@/lib/ui/streamSpeak";
import { useSpokenReply } from "@/lib/ui/useSpokenReply";

export interface BuddyActivation {
  surface: TutorSurface;
  subjectId?: string | null;
  lessonId?: string | null;
  slideIndex?: number | null;
}

export interface BuddyTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface UseBuddyConversationOptions {
  enabled: boolean;
  activation: BuddyActivation;
  autoConverse?: boolean;
  voiceOn?: boolean;
  onVoiceUnavailable?: () => void;
  trackTurns?: boolean;
}

function messageFor(error: unknown): string {
  return error instanceof ApiClientError
    ? error.message
    : "Something went wrong. Try that again.";
}

export function useBuddyConversation({
  enabled,
  activation,
  autoConverse = false,
  voiceOn = true,
  onVoiceUnavailable,
  trackTurns = false,
}: UseBuddyConversationOptions) {
  const [session, setSession] = useState<{
    chatId: string;
    band: GradeBand;
    memoryCount: number;
  } | null>(null);
  const [turns, setTurns] = useState<BuddyTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [conversing, setConversing] = useState(false);

  const spoken = useSpokenReply();
  const busyRef = useRef(false);
  const turnIdRef = useRef(0);
  const speakerCancelRef = useRef<(() => void) | null>(null);
  const nextTurnId = () => `turn-${++turnIdRef.current}`;

  const activationKey = [
    activation.surface,
    activation.subjectId ?? "",
    activation.lessonId ?? "",
    activation.slideIndex ?? "",
  ].join("|");

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      setTurns([]);
      setDraft("");
      setLastHeard(null);
      setNotice(null);
      setThinking(false);
      setConversing(false);
      speakerCancelRef.current?.();
      spoken.stop();
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const result = await apiPost<{
          chatId: string;
          greeting: string;
          context: { band: GradeBand; memoryCount?: number };
        }>("/api/tutor/activate", {
          surface: activation.surface,
          subjectId: activation.subjectId ?? null,
          lessonId: activation.lessonId ?? null,
          slideIndex: activation.slideIndex ?? null,
        });

        if (cancelled) return;

        setSession({
          chatId: result.chatId,
          band: result.context.band,
          memoryCount: result.context.memoryCount ?? 0,
        });
        setTurns([{ id: nextTurnId(), role: "assistant", content: result.greeting }]);
        setLastHeard(null);
        setDraft("");
        setNotice(null);
        if (autoConverse) setConversing(true);
      } catch (error) {
        if (!cancelled) setNotice(messageFor(error));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activationKey captures activation; spoken.stop stable enough
  }, [enabled, activationKey, autoConverse, trackTurns]);

  const handleVoiceUnavailable = useCallback(() => {
    setVoiceBlocked(true);
    onVoiceUnavailable?.();
  }, [onVoiceUnavailable]);

  const send = useCallback(
    async (content: string, viaVoice: boolean) => {
      const text = content.trim();
      if (!session || !text || busyRef.current) return;

      busyRef.current = true;
      setNotice(null);
      setLastHeard(text);
      speakerCancelRef.current?.();
      spoken.stop();

      if (trackTurns) {
        setTurns((existing) => [
          ...existing,
          { id: nextTurnId(), role: "user", content: text },
        ]);
      }
      setThinking(true);

      let reply = "";
      let failed = false;

      const speaker = createSentenceSpeaker({
        band: session.band,
        voiceOn,
        voiceBlocked,
        enqueue: spoken.enqueue,
        onVoiceUnavailable: handleVoiceUnavailable,
        onDraft: (full) => {
          reply = full;
          setDraft(full);
        },
      });
      speakerCancelRef.current = () => speaker.cancel();

      try {
        const stream = apiEventStream(`/api/chats/${session.chatId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: text,
            viaVoice,
            activation: {
              surface: activation.surface,
              subjectId: activation.subjectId ?? null,
              lessonId: activation.lessonId ?? null,
              slideIndex: activation.slideIndex ?? null,
            },
          }),
        });

        for await (const event of stream) {
          if (event.event === "delta") {
            const piece = (event.data as { text: string }).text;
            speaker.push(piece);
            if (piece) setThinking(false);
          } else if (event.event === "done") {
            const done = event.data as { message?: { content?: string } };
            if (done.message?.content) {
              reply = done.message.content;
              setDraft(reply);
            }
          } else if (event.event === "error") {
            failed = true;
            setNotice((event.data as { message: string }).message);
          }
        }

        await speaker.flush();
        if (!failed) await spoken.whenIdle();
      } catch (error) {
        failed = true;
        setNotice(messageFor(error));
        speaker.cancel();
      } finally {
        setThinking(false);
        setDraft("");
        busyRef.current = false;
        speakerCancelRef.current = null;
      }

      if (reply.trim() && !failed) {
        if (trackTurns) {
          setTurns((existing) => [
            ...existing,
            { id: nextTurnId(), role: "assistant", content: reply },
          ]);
        } else {
          setTurns([{ id: nextTurnId(), role: "assistant", content: reply }]);
        }
      }
    },
    [
      session,
      spoken,
      trackTurns,
      voiceOn,
      voiceBlocked,
      handleVoiceUnavailable,
      activation.surface,
      activation.subjectId,
      activation.lessonId,
      activation.slideIndex,
    ],
  );

  const onClip = useCallback(
    async ({ blob, extension }: { blob: Blob; extension: string }) => {
      if (!session) return;

      setThinking(true);
      try {
        const form = new FormData();
        form.append("audio", blob, `question.${extension}`);
        form.append("band", session.band);
        if (activation.subjectId) form.append("subjectId", activation.subjectId);
        if (activation.lessonId) form.append("lessonId", activation.lessonId);

        const heard = await apiUpload<{ text: string }>("/api/tutor/listen", form);
        setThinking(false);

        if (heard.text) await send(heard.text, true);
      } catch (error) {
        setThinking(false);
        setNotice(
          error instanceof ApiClientError && error.status === 503
            ? "Voice input isn't set up yet — you can still type."
            : messageFor(error),
        );
      }
    },
    [send, session, activation.subjectId, activation.lessonId],
  );

  const speakingRef = useRef(false);
  useEffect(() => {
    speakingRef.current = spoken.speaking;
  }, [spoken.speaking]);

  const isEchoRisk = useCallback(() => speakingRef.current, []);
  const onSpeechStart = useCallback(() => {
    if (speakingRef.current) spoken.stop();
  }, [spoken]);

  const mic = useMicrophone({
    onClip,
    onSpeechStart,
    isEchoRisk,
    maxMs: 90_000,
  });

  const speaking = spoken.speaking;

  useEffect(() => {
    if (!enabled || !conversing || !session) return;
    if (mic.recording || thinking || mic.error) return;

    const timer = setTimeout(() => void mic.start(), speaking ? 120 : 350);
    return () => clearTimeout(timer);
  }, [
    enabled,
    conversing,
    session,
    mic.recording,
    thinking,
    speaking,
    mic.error,
    mic.start,
  ]);

  useEffect(() => {
    if (!enabled) mic.cancel();
  }, [enabled, mic.cancel]);

  const orbState: TutorState = thinking
    ? "thinking"
    : speaking
      ? "speaking"
      : mic.recording
        ? "listening"
        : "idle";

  const listening = mic.recording && !speaking;

  const onOrbTap = useCallback(() => {
    if (!session) return;
    if (conversing) {
      mic.cancel();
      spoken.stop();
      speakerCancelRef.current?.();
      setConversing(false);
      return;
    }
    setNotice(null);
    setConversing(true);
  }, [session, conversing, mic, spoken]);

  const lastAssistant =
    [...turns].reverse().find((t) => t.role === "assistant")?.content ?? null;

  return useMemo(
    () => ({
      session,
      turns,
      draft,
      lastHeard,
      lastAssistant,
      thinking,
      notice,
      setNotice,
      conversing,
      setConversing,
      voiceBlocked,
      orbState,
      listening,
      speaking,
      recording: mic.recording,
      levels: mic.levels,
      micError: mic.error,
      spoken,
      send,
      onOrbTap,
      stopAll: () => {
        mic.cancel();
        spoken.stop();
        speakerCancelRef.current?.();
        setConversing(false);
      },
    }),
    [
      session,
      turns,
      draft,
      lastHeard,
      lastAssistant,
      thinking,
      notice,
      conversing,
      voiceBlocked,
      orbState,
      listening,
      speaking,
      mic.recording,
      mic.levels,
      mic.error,
      spoken,
      send,
      onOrbTap,
      mic,
    ],
  );
}
