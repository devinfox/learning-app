"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CALIBRATION_MS = 400;

const SPEECH_OVER_FLOOR = 2.6;
const SILENCE_OVER_FLOOR = 1.55;

const MIN_SPEECH_RMS = 0.022;
const MIN_SILENCE_RMS = 0.008;
const MAX_NOISE_FLOOR = 0.05;

const MIN_VOICED_MS = 180;
const MIN_TOTAL_VOICED_MS = 250;

const FLOOR_ADAPT = 0.02;

const BAR_COUNT = 32;

function noiseFloorFrom(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.25)] ?? MIN_SILENCE_RMS;
  return Math.min(floor, MAX_NOISE_FLOOR);
}

const ECHO_OVER_FLOOR = 2.2;
const ECHO_ADAPT = 0.08;
const ECHO_GUARD_VOICED_MS = 320;

export interface UseMicrophoneOptions {
  onClip: (clip: { blob: Blob; extension: string; durationMs: number }) => void;
  onSpeechStart?: () => void;
  isEchoRisk?: () => boolean;
  silenceMs?: number;
  maxMs?: number;
}

export interface UseMicrophoneResult {
  recording: boolean;
  levels: number[];
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
}

function pickMimeType(): { mimeType: string; extension: string } {
  const candidates: Array<{ mimeType: string; extension: string }> = [
    { mimeType: "audio/webm;codecs=opus", extension: "webm" },
    { mimeType: "audio/webm", extension: "webm" },
    { mimeType: "audio/mp4", extension: "mp4" },
    { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return candidate;
  }
  return { mimeType: "", extension: "webm" };
}

export function useMicrophone({
  onClip,
  onSpeechStart,
  isEchoRisk,
  silenceMs = 1100,
  maxMs = 20_000,
}: UseMicrophoneOptions): UseMicrophoneResult {
  const [recording, setRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const discardRef = useRef(false);
  const voicedTotalRef = useRef<() => number>(() => 0);
  const lastFloorRef = useRef(0);

  const onClipRef = useRef(onClip);
  useEffect(() => {
    onClipRef.current = onClip;
  }, [onClip]);

  const onSpeechStartRef = useRef(onSpeechStart);
  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart;
  }, [onSpeechStart]);

  const isEchoRiskRef = useRef(isEchoRisk);
  useEffect(() => {
    isEchoRiskRef.current = isEchoRisk;
  }, [isEchoRisk]);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;

    recorderRef.current = null;
    setRecording(false);
    setLevels([]);
  }, []);

  useEffect(() => teardown, [teardown]);

  const stopRecorder = useCallback((discard: boolean) => {
    discardRef.current = discard;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const stop = useCallback(() => stopRecorder(false), [stopRecorder]);
  const cancel = useCallback(() => stopRecorder(true), [stopRecorder]);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    setError(null);
    discardRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
    } catch (cause) {
      const name = (cause as { name?: string })?.name;
      setError(
        name === "NotAllowedError"
          ? "Microphone access was blocked. You can still type your question."
          : name === "NotFoundError"
            ? "No microphone found. You can still type your question."
            : "The microphone couldn't start. You can still type your question.",
      );
      return;
    }

    streamRef.current = stream;

    const { mimeType, extension } = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    const chunks: Blob[] = [];
    const startedAt = performance.now();
    let heardSpeech = false;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = () => {
      const durationMs = performance.now() - startedAt;
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const discard = discardRef.current;

      teardown();

      const spoken = voicedTotalRef.current();
      if (!discard && heardSpeech && spoken >= MIN_TOTAL_VOICED_MS && blob.size > 0) {
        onClipRef.current({ blob, extension, durationMs });
      }
    };

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    const samples = new Float32Array(analyser.fftSize);
    const history: number[] = [];
    const calibration: number[] = [];

    const openedDuringSpeech = Boolean(isEchoRiskRef.current?.());
    const skipCalibration = openedDuringSpeech && lastFloorRef.current > 0;

    let noiseFloor = skipCalibration ? lastFloorRef.current : MIN_SILENCE_RMS;
    let quietSince: number | null = null;
    let voicedMs = 0;
    let totalVoicedMs = 0;
    let lastTick = startedAt;
    let announced = false;
    let echoFloor = 0;

    const tick = () => {
      analyser.getFloatTimeDomainData(samples);

      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      const rms = Math.sqrt(sum / samples.length);

      const now = performance.now();
      const dt = now - lastTick;
      lastTick = now;

      const calibrating = !skipCalibration && now - startedAt < CALIBRATION_MS;
      if (calibrating) {
        calibration.push(rms);
        history.push(0.06);
        if (history.length > BAR_COUNT) history.shift();
        setLevels([...history]);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (calibration.length > 0) {
        noiseFloor = noiseFloorFrom(calibration);
        lastFloorRef.current = noiseFloor;
        calibration.length = 0;
      }

      const guarded = Boolean(isEchoRiskRef.current?.());
      if (!guarded) echoFloor = 0;

      const base = Math.max(MIN_SPEECH_RMS, noiseFloor * SPEECH_OVER_FLOOR);
      const speechAt =
        guarded && echoFloor > 0 ? Math.max(base, echoFloor * ECHO_OVER_FLOOR) : base;
      const silenceAt = Math.max(MIN_SILENCE_RMS, noiseFloor * SILENCE_OVER_FLOOR);
      const voiced = rms >= speechAt;
      const sustainMs = guarded ? ECHO_GUARD_VOICED_MS : MIN_VOICED_MS;

      if (guarded && !voiced) {
        echoFloor = echoFloor === 0 ? rms : echoFloor * (1 - ECHO_ADAPT) + rms * ECHO_ADAPT;
      }

      const excess = Math.max(0, rms - noiseFloor) / Math.max(speechAt, 1e-6);
      history.push(Math.min(1, Math.sqrt(excess) * 0.9));
      if (history.length > BAR_COUNT) history.shift();
      setLevels([...history]);

      if (voiced) {
        voicedMs += dt;
        totalVoicedMs += dt;
        if (voicedMs >= sustainMs) {
          heardSpeech = true;
          if (!announced) {
            announced = true;
            onSpeechStartRef.current?.();
          }
        }
        quietSince = null;
      } else {
        voicedMs = 0;
        if (rms < silenceAt) {
          noiseFloor = noiseFloor * (1 - FLOOR_ADAPT) + rms * FLOOR_ADAPT;
        }
        if (heardSpeech) {
          quietSince ??= now;
          if (now - quietSince >= silenceMs) {
            stopRecorder(false);
            return;
          }
        }
      }

      if (now - startedAt >= maxMs) {
        stopRecorder(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    voicedTotalRef.current = () => totalVoicedMs;

    recorder.start(250);
    setRecording(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [maxMs, silenceMs, stopRecorder, teardown]);

  return { recording, levels, error, start, stop, cancel };
}
