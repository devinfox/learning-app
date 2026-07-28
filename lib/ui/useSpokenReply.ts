"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { VisemeCue } from "@/lib/tutor/visemes";

export type SpokenSegment = { audioBase64: string; cues: VisemeCue[] };

export function useSpokenReply() {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const queueRef = useRef<SpokenSegment[]>([]);
  const drainingRef = useRef(false);
  const generationRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [cues, setCues] = useState<VisemeCue[] | null>(null);

  const stop = useCallback(() => {
    generationRef.current += 1;
    queueRef.current = [];
    drainingRef.current = false;
    try {
      sourceRef.current?.stop();
    } catch {
    }
    sourceRef.current = null;
    startedAtRef.current = null;
    setSpeaking(false);
    setCues(null);
  }, []);

  const playOne = useCallback(async (reply: SpokenSegment, generation: number) => {
    if (generation !== generationRef.current) return;

    contextRef.current ??= new AudioContext();
    const context = contextRef.current;
    if (context.state === "suspended") await context.resume();
    if (generation !== generationRef.current) return;

    const bytes = Uint8Array.from(atob(reply.audioBase64), (c) => c.charCodeAt(0));
    const raw = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const buffer = await context.decodeAudioData(raw);
    if (generation !== generationRef.current) return;

    await new Promise<void>((resolve) => {
      if (generation !== generationRef.current) {
        resolve();
        return;
      }
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => {
        if (sourceRef.current === source) {
          sourceRef.current = null;
          startedAtRef.current = null;
        }
        resolve();
      };
      setCues(reply.cues);
      startedAtRef.current = context.currentTime;
      sourceRef.current = source;
      source.start();
    });
  }, []);

  const drain = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    const generation = generationRef.current;
    setSpeaking(true);

    try {
      while (queueRef.current.length > 0 && generation === generationRef.current) {
        const next = queueRef.current.shift();
        if (!next) break;
        await playOne(next, generation);
      }
    } finally {
      if (generation === generationRef.current) {
        drainingRef.current = false;
        if (queueRef.current.length === 0) {
          setSpeaking(false);
          setCues(null);
          startedAtRef.current = null;
        } else {
          void drain();
        }
      }
    }
  }, [playOne]);

  const play = useCallback(
    async (reply: SpokenSegment) => {
      stop();
      queueRef.current = [reply];
      await drain();
    },
    [drain, stop],
  );

  const enqueue = useCallback(
    (reply: SpokenSegment) => {
      queueRef.current.push(reply);
      void drain();
    },
    [drain],
  );

  const whenIdle = useCallback(async () => {
    const generation = generationRef.current;
    while (
      generation === generationRef.current &&
      (drainingRef.current || queueRef.current.length > 0 || sourceRef.current)
    ) {
      await new Promise((r) => setTimeout(r, 40));
    }
  }, []);

  const getPlayheadMs = useCallback(() => {
    const context = contextRef.current;
    const startedAt = startedAtRef.current;
    if (!context || startedAt === null) return null;
    return (context.currentTime - startedAt) * 1000;
  }, []);

  return useMemo(
    () => ({ play, enqueue, stop, whenIdle, speaking, cues, getPlayheadMs }),
    [play, enqueue, stop, whenIdle, speaking, cues, getPlayheadMs],
  );
}
