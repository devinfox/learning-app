"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  start?: boolean;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 700,
  start = true,
  className,
}: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(from);
  const frame = useRef<number | null>(null);
  const running = start && !reduced && duration > 0;

  useEffect(() => {
    if (!running) return;

    const began = performance.now();

    const step = (at: number) => {
      const ratio = Math.min(1, (at - began) / duration);
      setAnimated(Math.round(from + (to - from) * (1 - (1 - ratio) ** 3)));
      if (ratio < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [to, from, duration, running]);

  const value = running ? animated : start ? to : from;

  return (
    <span className={className} aria-live="polite">
      {value.toLocaleString()}
    </span>
  );
}
