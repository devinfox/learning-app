"use client";

import { cn } from "@/lib/ui/cn";
import { LottieBuddy } from "./LottieBuddy";

export type OrbMood = "idle" | "pleased" | "delighted" | "asleep";

export interface OrbProps {
  size?: number;
  mood?: OrbMood;
  rays?: boolean;
  className?: string;
  title?: string;
  /** When set, renders live LottieBuddy with cosmetics */
  equipped?: Record<string, string> | null;
}

/** Compact Lottie for cards, nav, and room. */
export function Orb({
  size = 40,
  mood = "idle",
  className,
  title,
  equipped,
}: OrbProps) {
  if (equipped !== undefined) {
    const state =
      mood === "delighted" ? "celebrating" : mood === "asleep" ? "idle" : "idle";
    return (
      <LottieBuddy
        size={size}
        state={state}
        equipped={equipped}
        className={className}
      />
    );
  }
  const id = `lottie-static-${size}-${mood}`;
  const eyeOpen = mood !== "asleep";
  const eyeCy = mood === "delighted" ? 48 : 50;
  const smile =
    mood === "delighted"
      ? "open"
      : mood === "pleased"
        ? "happy"
        : mood === "asleep"
          ? "rest"
          : "soft";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0 overflow-visible", className)}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="42%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#FFF9EE" />
          <stop offset="22%" stopColor="#FFF0D2" />
          <stop offset="48%" stopColor="#F5E4FF" />
          <stop offset="72%" stopColor="#D4C4FF" />
          <stop offset="100%" stopColor="#9EB6FF" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#7EE8FF" />
          <stop offset="40%" stopColor="#4A8CFF" />
          <stop offset="100%" stopColor="#2A1460" />
        </radialGradient>
        <radialGradient id={`${id}-orb-blue`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E8FBFF" />
          <stop offset="50%" stopColor="#7AD4FF" />
          <stop offset="100%" stopColor="#4AA0F0" />
        </radialGradient>
        <radialGradient id={`${id}-orb-gold`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF8E0" />
          <stop offset="50%" stopColor="#FFD56A" />
          <stop offset="100%" stopColor="#F0A830" />
        </radialGradient>
        <radialGradient id={`${id}-cheek`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB8C8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFB8C8" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-fuzz`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
        </filter>
        <filter id={`${id}-drop`} x="-35%" y="-25%" width="170%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur" />
          <feOffset in="blur" dx="0" dy="2.5" result="off" />
          <feComponentTransfer in="off" result="shadow">
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feFlood floodColor="#7B8FD4" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="shadow" operator="in" result="tinted" />
          <feMerge>
            <feMergeNode in="tinted" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-tuft`} cx="42%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#E8F0FF" stopOpacity="0.98" />
          <stop offset="60%" stopColor="#C4D0FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A8BCFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-top`} cx="45%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#FFFCF4" stopOpacity="1" />
          <stop offset="55%" stopColor="#FFF0D8" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#E8D8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-body-soft`} cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#FFF9EE" />
          <stop offset="40%" stopColor="#F5E4FF" />
          <stop offset="75%" stopColor="#D4C4FF" />
          <stop offset="100%" stopColor="#9EB6FF" stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id={`${id}-ant-gold`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E8D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD56A" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${id}-ant-blue`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#D4E0FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7AD4FF" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="93" rx="18" ry="3.2" fill="#9EB0E8" opacity="0.18" />

      {/* Antennae */}
      <path
        d="M42 24 C38 14, 31 8, 27 6"
        fill="none"
        stroke={`url(#${id}-ant-gold)`}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="26.5" cy="5.2" r="2.6" fill={`url(#${id}-orb-gold)`} />
      <circle cx="25.7" cy="4.4" r="0.8" fill="#fff" opacity="0.8" />

      <path
        d="M58 24 C62 13, 69 7, 74 5"
        fill="none"
        stroke={`url(#${id}-ant-blue)`}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="74.5" cy="4.6" r="2.6" fill={`url(#${id}-orb-blue)`} />
      <circle cx="73.7" cy="3.8" r="0.8" fill="#fff" opacity="0.8" />

      {/* Feathered floof + soft drop shadow */}
      <g filter={`url(#${id}-drop)`}>
        <g filter={`url(#${id}-fuzz)`}>
          <ellipse cx="22" cy="52" rx="10" ry="13" fill={`url(#${id}-tuft)`} />
          <ellipse cx="78" cy="52" rx="10" ry="13" fill={`url(#${id}-tuft)`} />
          <ellipse cx="28" cy="70" rx="11" ry="9" fill={`url(#${id}-tuft)`} />
          <ellipse cx="72" cy="70" rx="11" ry="9" fill={`url(#${id}-tuft)`} />
          <ellipse cx="50" cy="76" rx="16" ry="9" fill={`url(#${id}-tuft)`} />
          <ellipse cx="50" cy="54" rx="30" ry="28" fill={`url(#${id}-body-soft)`} />
          <ellipse cx="38" cy="33" rx="10" ry="9" fill={`url(#${id}-top)`} />
          <ellipse cx="62" cy="33" rx="10" ry="9" fill={`url(#${id}-top)`} />
          <ellipse cx="50" cy="28" rx="12" ry="11" fill={`url(#${id}-top)`} />
          <ellipse cx="47" cy="24" rx="4" ry="2.8" fill="#fff" opacity="0.35" />
        </g>
        <ellipse cx="50" cy="54" rx="22" ry="20" fill={`url(#${id}-body-soft)`} />
      </g>
      <ellipse cx="42" cy="44" rx="10" ry="7" fill="#fff" opacity="0.35" transform="rotate(-20 42 44)" />
      <ellipse cx="38" cy="40" rx="4" ry="2.4" fill="#fff" opacity="0.7" transform="rotate(-28 38 40)" />

      <ellipse cx="35" cy="58" rx="4.5" ry="2.6" fill={`url(#${id}-cheek)`} />
      <ellipse cx="65" cy="58" rx="4.5" ry="2.6" fill={`url(#${id}-cheek)`} />

      {/* Brows up so they read */}
      <path d="M35 39.5 q4.5 -2.4 9 0" stroke="#3A2860" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M56 39.5 q4.5 -2.4 9 0" stroke="#3A2860" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />

      {eyeOpen ? (
        <>
          <ellipse cx="41" cy={eyeCy} rx="6.2" ry="7.2" fill="#fff" />
          <ellipse cx="59" cy={eyeCy} rx="6.2" ry="7.2" fill="#fff" />
          <circle cx="41.2" cy={eyeCy + 0.6} r="4.6" fill={`url(#${id}-iris)`} />
          <circle cx="59.2" cy={eyeCy + 0.6} r="4.6" fill={`url(#${id}-iris)`} />
          <circle cx="41.2" cy={eyeCy + 0.9} r="2.1" fill="#1A0E38" />
          <circle cx="59.2" cy={eyeCy + 0.9} r="2.1" fill="#1A0E38" />
          <circle cx="39.6" cy={eyeCy - 1.2} r="1.4" fill="#fff" opacity="0.95" />
          <circle cx="57.6" cy={eyeCy - 1.2} r="1.4" fill="#fff" opacity="0.95" />
          <circle cx="42.8" cy={eyeCy + 2} r="0.7" fill="#fff" opacity="0.65" />
          <circle cx="60.8" cy={eyeCy + 2} r="0.7" fill="#fff" opacity="0.65" />
        </>
      ) : (
        <>
          <path d="M36 50 q5 4 10 0" stroke="#3A2860" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M54 50 q5 4 10 0" stroke="#3A2860" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}

      {smile === "open" ? (
        <>
          <ellipse cx="50" cy="64" rx="5" ry="3.6" fill="#3A2860" />
          <ellipse cx="50" cy="65.2" rx="2.6" ry="1.4" fill="#FF8FB0" opacity="0.9" />
        </>
      ) : smile === "happy" ? (
        <path
          d="M44 62 q6 5 12 0"
          stroke="#3A2860"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M45 62.5 q5 3.2 10 0"
          stroke="#3A2860"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
