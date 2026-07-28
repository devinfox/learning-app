"use client";

import type { CSSProperties } from "react";
import {
  eyeLookById,
  glowLookById,
  hairLookById,
  lookFromEquipped,
  type HairLook,
  type LottieLook,
} from "@/lib/companion/looks";
import type { TutorState } from "@/lib/tutor/types";
import type { Viseme } from "@/lib/tutor/visemes";
import { MOUTH_POSES } from "@/lib/tutor/visemes";
import { cn } from "@/lib/ui/cn";
import { SOFT_BOB_LAYERS } from "./hair/softBobPaths";

export interface LottieBuddyProps {
  state?: TutorState;
  size?: number;
  pose?: Viseme;
  transitionMs?: number;
  showFace?: boolean;
  /** Free cosmetics: eyes / glow / hair ids */
  look?: Partial<LottieLook> | null;
  /** Or pass full equipped map from companion state */
  equipped?: Record<string, string> | null;
  className?: string;
}

/**
 * Lottie — a small floating intelligence made of soft glowing energy
 * that forms into a fluffy puff. SVG character (not lottie-web).
 */
export function LottieBuddy({
  state = "idle",
  size = 120,
  pose = "REST",
  transitionMs = 80,
  showFace = true,
  look,
  equipped,
  className,
}: LottieBuddyProps) {
  const id = `lottie-${size}-${state}`;
  const geometry = MOUTH_POSES[pose];

  const resolved = {
    ...lookFromEquipped(equipped ?? null),
    ...look,
  };
  const eyes = eyeLookById(resolved.eyes);
  const glow = glowLookById(resolved.glow);
  const hair = hairLookById(resolved.hair);

  // Mouth geometry in viewBox units (0–100). Face sits ~55% down.
  const mouthCx = 50;
  const mouthCy = 62 + geometry.centerShift * 2.2;
  const mouthW = 7.2 * geometry.width;
  const mouthH = Math.max(0.6, 6.5 * geometry.opening);
  const easing = `${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  const eyeSquish = pose !== "REST" && !geometry.closed ? 0.92 : 1;
  const thinking = state === "thinking";
  const celebrating = state === "celebrating";
  const listening = state === "listening";
  const speaking = state === "speaking";

  return (
    <div
      className={cn(
        "lottie-buddy relative shrink-0",
        `lottie-buddy--${state}`,
        className,
      )}
      style={{ width: size, height: size }}
      data-state={state}
      data-viseme={pose}
    >
      {/* Soft self-glow bloom — color from look */}
      <span
        aria-hidden="true"
        className="lottie-buddy__bloom pointer-events-none absolute rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${glow.core} 0%, ${glow.mid} 32%, ${glow.outer} 52%, transparent 68%)`,
        }}
      />

      {/* Iridescent magical dust that trails the float */}
      <MagicalDust state={state} />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        overflow="visible"
        aria-hidden="true"
        className="lottie-buddy__svg relative z-[1] block overflow-visible"
      >
        <defs>
          {/* Core body: warm cream center → lavender/periwinkle rim */}
          <radialGradient id={`${id}-body`} cx="42%" cy="36%" r="68%">
            <stop offset="0%" stopColor="#FFF9EE" />
            <stop offset="18%" stopColor="#FFF0D2" />
            <stop offset="42%" stopColor="#F5E4FF" />
            <stop offset="68%" stopColor="#D4C4FF" />
            <stop offset="88%" stopColor="#B8C8FF" />
            <stop offset="100%" stopColor="#9EB6FF" />
          </radialGradient>

          <radialGradient id={`${id}-under`} cx="50%" cy="78%" r="52%">
            <stop offset="0%" stopColor="#8AA0E8" stopOpacity="0.72" />
            <stop offset="45%" stopColor="#A8BCFF" stopOpacity="0.4" />
            <stop offset="78%" stopColor="#C4B0FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D8C8FF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${id}-cheek`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB8C8" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#FFC8D4" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFD0DC" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${id}-spec`} cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${id}-soft-spec`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#FFF8EE" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Pixar eyes — color from look */}
          <radialGradient id={`${id}-iris`} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor={eyes.iris[0]} />
            <stop offset="35%" stopColor={eyes.iris[1]} />
            <stop offset="70%" stopColor={eyes.iris[2]} />
            <stop offset="100%" stopColor={eyes.iris[3]} />
          </radialGradient>

          <radialGradient id={`${id}-hair`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={hair.highlight} />
            <stop offset="45%" stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.shadow} />
          </radialGradient>
          <radialGradient id={`${id}-hair-deep`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.shadow} />
          </radialGradient>

          <radialGradient id={`${id}-orb-blue`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E8FBFF" />
            <stop offset="40%" stopColor="#7AD4FF" />
            <stop offset="100%" stopColor="#4AA0F0" />
          </radialGradient>

          <radialGradient id={`${id}-orb-gold`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF8E0" />
            <stop offset="40%" stopColor="#FFD56A" />
            <stop offset="100%" stopColor="#F0A830" />
          </radialGradient>

          <linearGradient id={`${id}-ant-gold`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#E8D4FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD56A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${id}-ant-blue`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#D4E0FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7AD4FF" stopOpacity="0.9" />
          </linearGradient>

          {/* Gentle edge soften — readable tufts, not mush */}
          <filter id={`${id}-fuzz-soft`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.47" />
          </filter>
          <filter id={`${id}-fuzz-mid`} x="-18%" y="-18%" width="136%" height="136%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.27" />
          </filter>
          <filter id={`${id}-fuzz-halo`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.94" />
          </filter>
          {/* Soft drop shadow under the whole puff */}
          <filter id={`${id}-drop`} x="-40%" y="-30%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.8" result="blur" />
            <feOffset in="blur" dx="0" dy="3.5" result="off" />
            <feComponentTransfer in="off" result="shadow">
              <feFuncA type="linear" slope="0.22" />
            </feComponentTransfer>
            <feFlood floodColor="#7B8FD4" floodOpacity="0.45" result="color" />
            <feComposite in="color" in2="shadow" operator="in" result="tinted" />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Tuft fills — solid enough to read, soft fade at rim only */}
          <radialGradient id={`${id}-tuft`} cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#FFFCF6" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#F2E8FF" stopOpacity="0.88" />
            <stop offset="78%" stopColor="#D4C4FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C4D0FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-tuft-blue`} cx="40%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#E8F0FF" stopOpacity="0.98" />
            <stop offset="48%" stopColor="#C8D6FF" stopOpacity="0.88" />
            <stop offset="80%" stopColor="#A8BCFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#9EB6FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-tuft-deep`} cx="42%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#C8D4FF" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#B0C0FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#A0B4FF" stopOpacity="0" />
          </radialGradient>
          {/* Lavender base for crown bumps — firm silhouette before warm glow */}
          <radialGradient id={`${id}-top-base`} cx="45%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#E4D8FF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#C8BAF5" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#B0A0E8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#A090E0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-top-lobe`} cx="45%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#FFFCF4" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FFF0D8" stopOpacity="0.75" />
            <stop offset="72%" stopColor="#F0E0FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E0D0FF" stopOpacity="0" />
          </radialGradient>
          {/* Body — clearer lavender rim for silhouette definition */}
          <radialGradient id={`${id}-body-soft`} cx="42%" cy="36%" r="68%">
            <stop offset="0%" stopColor="#FFF9EE" />
            <stop offset="18%" stopColor="#FFF0D2" />
            <stop offset="42%" stopColor="#F5E4FF" />
            <stop offset="65%" stopColor="#D4C4FF" />
            <stop offset="82%" stopColor="#B8A8F0" stopOpacity="0.95" />
            <stop offset="94%" stopColor="#9E8CE0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8A78D4" stopOpacity="0.35" />
          </radialGradient>
          {/* Bottom edge accent — firmer underside for hover volume */}
          <radialGradient id={`${id}-bottom-edge`} cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#7A8CD8" stopOpacity="0" />
            <stop offset="45%" stopColor="#8A9CE0" stopOpacity="0" />
            <stop offset="72%" stopColor="#7B8FD4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6A7CC8" stopOpacity="0.48" />
          </radialGradient>
          <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Tiny soft aura only — star core stays crisp */}
          <filter id={`${id}-spark-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="b" />
            <feMerge>
              <feMergeNode in="b" />
            </feMerge>
          </filter>
          {/* Face plane: solid center, heavy edge feather so it dissolves into floof */}
          <radialGradient id={`${id}-face-mask`} cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="28%" stopColor="#fff" />
            <stop offset="48%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="64%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="80%" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}-face-feather`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
            <ellipse cx="50" cy="54" rx="30" ry="28" fill={`url(#${id}-face-mask)`} />
          </mask>
          <radialGradient id={`${id}-face-fill`} cx="42%" cy="36%" r="78%">
            <stop offset="0%" stopColor="#FFFBF2" stopOpacity="0.92" />
            <stop offset="22%" stopColor="#FFF0D8" stopOpacity="0.72" />
            <stop offset="48%" stopColor="#F5E4FF" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#D8C8FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#C4D0FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cast shadow — light as a feather */}
        <ellipse
          className="lottie-buddy__shadow"
          cx="50"
          cy="92"
          rx="22"
          ry="4.2"
          fill="#9EB0E8"
          opacity="0.22"
        />

        {/* Antennae — behind body slightly, fiber-optic tendrils */}
        <g className="lottie-buddy__antennae">
          {/* Left (gold tip) */}
          <g className="lottie-buddy__antenna lottie-buddy__antenna--gold">
            <path
              d="M42 22 C38 12, 30 6, 26 4"
              fill="none"
              stroke={`url(#${id}-ant-gold)`}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle
              className="lottie-buddy__orb lottie-buddy__orb--gold"
              cx="25.5"
              cy="3.2"
              r="3.1"
              fill={`url(#${id}-orb-gold)`}
              filter={`url(#${id}-glow)`}
            />
            <circle cx="24.4" cy="2.2" r="1" fill="#fff" opacity="0.75" />
          </g>

          {/* Right (blue tip) */}
          <g className="lottie-buddy__antenna lottie-buddy__antenna--blue">
            <path
              d="M58 22 C62 11, 70 5, 75 3"
              fill="none"
              stroke={`url(#${id}-ant-blue)`}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle
              className="lottie-buddy__orb lottie-buddy__orb--blue"
              cx="75.5"
              cy="2.6"
              r="3.1"
              fill={`url(#${id}-orb-blue)`}
              filter={`url(#${id}-glow)`}
            />
            <circle cx="74.5" cy="1.6" r="1" fill="#fff" opacity="0.75" />
          </g>
        </g>

        {/* Fluff body group — breathe + float applied via CSS on parent */}
        <g className="lottie-buddy__body" filter={`url(#${id}-drop)`}>
          {/* Soft outer halo — restrained so lavender edge can read */}
          <ellipse
            cx="50"
            cy="56"
            rx="34"
            ry="31"
            fill={`url(#${id}-body-soft)`}
            opacity="0.16"
            filter={`url(#${id}-fuzz-halo)`}
          />

          {/* Outer tufts — slight soften, still readable */}
          <g filter={`url(#${id}-fuzz-soft)`}>
            <ellipse cx="20" cy="52" rx="11" ry="14" fill={`url(#${id}-tuft-blue)`} />
            <ellipse cx="80" cy="52" rx="11" ry="14" fill={`url(#${id}-tuft-blue)`} />
            <ellipse cx="26" cy="70" rx="12" ry="10" fill={`url(#${id}-tuft-blue)`} />
            <ellipse cx="74" cy="70" rx="12" ry="10" fill={`url(#${id}-tuft-blue)`} />
            <ellipse cx="50" cy="78" rx="17" ry="10" fill={`url(#${id}-tuft-blue)`} />
            <ellipse cx="17" cy="60" rx="8" ry="9" fill={`url(#${id}-tuft-deep)`} />
            <ellipse cx="83" cy="60" rx="8" ry="9" fill={`url(#${id}-tuft-deep)`} />
            <ellipse cx="33" cy="80" rx="8" ry="6.5" fill={`url(#${id}-tuft-deep)`} />
            <ellipse cx="67" cy="80" rx="8" ry="6.5" fill={`url(#${id}-tuft-deep)`} />
          </g>

          {/* Mid body + cheek puffs */}
          <g filter={`url(#${id}-fuzz-mid)`}>
            <ellipse cx="50" cy="54" rx="31" ry="28.5" fill={`url(#${id}-body-soft)`} />
            <ellipse cx="50" cy="54" rx="29" ry="26.5" fill={`url(#${id}-under)`} />
            {/* Stronger underside for hover/squash readability */}
            <ellipse
              cx="50"
              cy="66"
              rx="24"
              ry="16"
              fill={`url(#${id}-bottom-edge)`}
            />
            <ellipse cx="24" cy="56" rx="8.5" ry="10" fill={`url(#${id}-tuft)`} />
            <ellipse cx="76" cy="56" rx="8.5" ry="10" fill={`url(#${id}-tuft)`} />
          </g>

          {/* Default fluffy crown (hidden under most hairstyles but still base volume) */}
          <g filter={`url(#${id}-fuzz-mid)`} opacity={hair.id === "hair-none" ? 1 : 0.35}>
            <ellipse cx="37" cy="32" rx="12.5" ry="11.5" fill={`url(#${id}-top-base)`} />
            <ellipse cx="63" cy="32" rx="12.5" ry="11.5" fill={`url(#${id}-top-base)`} />
            <ellipse cx="50" cy="26.5" rx="14.5" ry="13.5" fill={`url(#${id}-top-base)`} />
            <ellipse cx="37" cy="30.5" rx="10.5" ry="9" fill={`url(#${id}-top-lobe)`} />
            <ellipse cx="63" cy="30.5" rx="10.5" ry="9" fill={`url(#${id}-top-lobe)`} />
            <ellipse cx="50" cy="25" rx="12" ry="10.5" fill={`url(#${id}-top-lobe)`} />
            <ellipse cx="47" cy="22" rx="4.5" ry="3" fill="#fff" opacity="0.28" />
            <ellipse cx="34" cy="28" rx="3" ry="2.2" fill="#fff" opacity="0.22" />
            <ellipse cx="60" cy="28" rx="3" ry="2.2" fill="#fff" opacity="0.22" />
          </g>

          {/* Hair back: silhouette + falls (behind face opening) */}
          {hair.id !== "hair-none" && (
            <HairStyle id={id} hair={hair} layer="back" />
          )}

          {/* Face plane — softer so it doesn't compete with crown/cheeks */}
          <g mask={`url(#${id}-face-feather)`}>
            <ellipse
              cx="50"
              cy="54"
              rx="30"
              ry="28"
              fill={`url(#${id}-face-fill)`}
            />
            <ellipse
              className="lottie-buddy__highlight-soft"
              cx="42"
              cy="44"
              rx="11"
              ry="8"
              fill={`url(#${id}-soft-spec)`}
              transform="rotate(-18 42 44)"
            />
            <ellipse
              className="lottie-buddy__highlight-hard"
              cx="38"
              cy="40"
              rx="4.5"
              ry="2.6"
              fill={`url(#${id}-spec)`}
              transform="rotate(-28 38 40)"
            />
          </g>

          {/* Hair front: bangs + crown leaves over forehead */}
          {hair.id !== "hair-none" && (
            <HairStyle id={id} hair={hair} layer="front" />
          )}

          {/* Four larger white sparkles only — no multicolored clutter */}
          <g className="lottie-buddy__sparkles">
            <Sparkle cx={15} cy={46} size={3.6} glowId={`${id}-spark-glow`} />
            <Sparkle cx={85} cy={44} size={3.1} glowId={`${id}-spark-glow`} />
            <Sparkle cx={74} cy={76} size={2.7} glowId={`${id}-spark-glow`} />
            <Sparkle cx={26} cy={74} size={2.5} glowId={`${id}-spark-glow`} />
          </g>

          {showFace && (
            <g className="lottie-buddy__face">
              {/* Cheeks — almost invisible warm peach */}
              <ellipse cx="34" cy="58" rx="5.5" ry="3.2" fill={`url(#${id}-cheek)`} />
              <ellipse cx="66" cy="58" rx="5.5" ry="3.2" fill={`url(#${id}-cheek)`} />

              {/* Brows — floating above eyes so they always read */}
              <g className="lottie-buddy__brows">
                <path
                  className="lottie-buddy__brow lottie-buddy__brow--l"
                  d={
                    thinking
                      ? "M33.5 38.5 q4.5 -3.6 9 -0.4"
                      : celebrating
                        ? "M33.5 39.5 q4.5 -1.4 9 0.8"
                        : "M33.5 39 q4.5 -2.6 9 0"
                  }
                  fill="none"
                  stroke="#3A2860"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  opacity="0.82"
                />
                <path
                  className="lottie-buddy__brow lottie-buddy__brow--r"
                  d={
                    thinking
                      ? "M57.5 38 q4.5 -1.2 9 -3.2"
                      : celebrating
                        ? "M57.5 39.5 q4.5 0.8 9 -1.4"
                        : "M57.5 39 q4.5 -2.6 9 0"
                  }
                  fill="none"
                  stroke="#3A2860"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  opacity="0.82"
                />
              </g>

              {/* Eyes — large Pixar, ~30% of face width */}
              <g
                className="lottie-buddy__eyes"
                style={{
                  transform: `scaleY(${eyeSquish})`,
                  transformOrigin: "50px 50px",
                  transition: `transform ${easing}`,
                }}
              >
                <Eye
                  id={`${id}-L`}
                  cx={thinking ? 39.5 : 40}
                  cy={thinking ? 49 : 50}
                  irisId={`${id}-iris`}
                  lookX={thinking ? 0.8 : listening ? 0 : speaking ? 0.3 : 0}
                  lookY={thinking ? -1.4 : 0.4}
                />
                <Eye
                  id={`${id}-R`}
                  cx={thinking ? 60.5 : 60}
                  cy={thinking ? 49 : 50}
                  irisId={`${id}-iris`}
                  lookX={thinking ? 0.8 : listening ? 0 : speaking ? -0.2 : 0}
                  lookY={thinking ? -1.4 : 0.4}
                />
                {/* Soft lids for blink (CSS-driven) — match smaller whites */}
                <ellipse
                  className="lottie-buddy__lid lottie-buddy__lid--l"
                  cx={thinking ? 39.5 : 40}
                  cy={thinking ? 49 : 50}
                  rx={6.9}
                  ry={8.0}
                  fill="#FFF0D8"
                />
                <ellipse
                  className="lottie-buddy__lid lottie-buddy__lid--r"
                  cx={thinking ? 60.5 : 60}
                  cy={thinking ? 49 : 50}
                  rx={6.9}
                  ry={8.0}
                  fill="#FFF0D8"
                />
              </g>

              {/* Mouth — small, low; gentle corner lift for warmth */}
              <g className="lottie-buddy__mouth" style={{ transition: `all ${easing}` }}>
                {geometry.closed ? (
                  <path
                    d={
                      thinking
                        ? `M${mouthCx - mouthW * 0.35} ${mouthCy + 0.5} q${mouthW * 0.2} ${1.2} ${mouthW * 0.55} ${-0.4}`
                        : celebrating
                          ? `M${mouthCx - mouthW * 0.55} ${mouthCy - 0.2}
                             q${mouthW * 0.55} ${mouthW * 0.75} ${mouthW * 1.1} 0`
                          : `M${mouthCx - mouthW / 2} ${mouthCy - 0.35}
                             Q ${mouthCx} ${mouthCy + 2.9} ${mouthCx + mouthW / 2} ${mouthCy - 0.35}`
                    }
                    fill="none"
                    stroke="#3A2860"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ transition: `all ${easing}` }}
                  />
                ) : (
                  <g style={{ transition: `all ${easing}` }}>
                    <ellipse
                      cx={mouthCx}
                      cy={mouthCy}
                      rx={mouthW / 2}
                      ry={Math.max(mouthH / 2, 0.8)}
                      fill="#3A2860"
                      style={{ transition: `all ${easing}` }}
                    />
                    {geometry.tongue > 0 && (
                      <ellipse
                        cx={mouthCx}
                        cy={mouthCy + mouthH * 0.18}
                        rx={mouthW * 0.28}
                        ry={Math.max(mouthH * 0.28, 0.6)}
                        fill="#FF8FB0"
                        opacity={geometry.tongue}
                        style={{ transition: `all ${easing}` }}
                      />
                    )}
                  </g>
                )}
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/** Clean soft-bob vectors. layer=back behind face, front = bangs + sheen. */
function SoftBobHair({
  id,
  hair,
  layer,
}: {
  id: string;
  hair: HairLook;
  layer: "back" | "front";
}) {
  const L = SOFT_BOB_LAYERS;
  /* Warm amber edge — not dark brown helmet outline */
  const edge = hair.color;
  const edgeSoft = hair.highlight;

  if (layer === "back") {
    return (
      <g className="lottie-buddy__hair lottie-buddy__hair--soft-bob-back" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-bob-gold`} x1="25%" y1="5%" x2="75%" y2="95%">
            <stop offset="0%" stopColor={hair.highlight} />
            <stop offset="40%" stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.color} />
          </linearGradient>
          <linearGradient id={`${id}-bob-lift`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor={hair.highlight} />
            <stop offset="55%" stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.color} />
          </linearGradient>
          <linearGradient id={`${id}-bob-amber`} x1="30%" y1="10%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={hair.color} />
            <stop offset="60%" stopColor={hair.color} />
            <stop offset="100%" stopColor={hair.shadow} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${id}-bob-deep`} x1="35%" y1="20%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={hair.shadow} stopOpacity="0.55" />
            <stop offset="100%" stopColor={hair.shadow} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${id}-bob-sheen`} x1="20%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.9" />
            <stop offset="50%" stopColor={hair.highlight} stopOpacity="0.5" />
            <stop offset="100%" stopColor={hair.highlight} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={`${id}-bob-bounce`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#B8C8FF" stopOpacity="0" />
            <stop offset="55%" stopColor="#B8C8FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B8C8FF" stopOpacity="0.32" />
          </linearGradient>
        </defs>

        <g id={`${id}-Back-Cap`}>
          <path
            d={L.backCap.silhouette}
            fill={`url(#${id}-bob-gold)`}
            stroke={edge}
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={L.backCap.crown}
            fill={`url(#${id}-bob-lift)`}
            stroke={edgeSoft}
            strokeWidth={0.35}
            strokeLinejoin="round"
            opacity={0.95}
          />
        </g>

        <g id={`${id}-Left-Lock`}>
          <path
            d={L.leftLock}
            fill={`url(#${id}-bob-amber)`}
            stroke={edge}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        </g>

        <g id={`${id}-Right-Lock`}>
          <path
            d={L.rightLock}
            fill={`url(#${id}-bob-amber)`}
            stroke={edge}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        </g>

        <g id={`${id}-Shadows`} fill={`url(#${id}-bob-deep)`}>
          {L.shadows.map((s, i) => (
            <path key={i} d={s.d} opacity={s.opacity} />
          ))}
        </g>

        <g id={`${id}-Bounce-Light`} fill={`url(#${id}-bob-bounce)`} opacity={0.85}>
          <path d={L.bounceLight.left} />
          <path d={L.bounceLight.right} />
        </g>
      </g>
    );
  }

  return (
    <g className="lottie-buddy__hair lottie-buddy__hair--soft-bob-front" aria-hidden="true">
      <g id={`${id}-Front-Bangs`}>
        <path
          d={L.frontBangs.leftSwoop}
          fill={`url(#${id}-bob-lift)`}
          stroke={edge}
          strokeWidth={0.5}
          strokeLinejoin="round"
        />
        <path
          d={L.frontBangs.center}
          fill={`url(#${id}-bob-gold)`}
          stroke={edgeSoft}
          strokeWidth={0.4}
          strokeLinejoin="round"
        />
        <path
          d={L.frontBangs.right}
          fill={`url(#${id}-bob-gold)`}
          stroke={edgeSoft}
          strokeWidth={0.4}
          strokeLinejoin="round"
        />
      </g>

      <g id={`${id}-Highlights`} fill={`url(#${id}-bob-sheen)`}>
        <path d={L.highlights.crown} opacity={0.88} />
        <path d={L.highlights.mainBang} opacity={0.82} />
        <path d={L.highlights.leftSide} opacity={0.72} />
        <path d={L.highlights.rightSide} opacity={0.72} />
      </g>
    </g>
  );
}

function HairStyle({
  id,
  hair,
  layer = "back",
}: {
  id: string;
  hair: HairLook;
  layer?: "back" | "front";
}) {
  const fill = `url(#${id}-hair)`;
  const deep = `url(#${id}-hair-deep)`;
  const style = hair.id;

  if (style === "hair-soft-bob") {
    return <SoftBobHair id={id} hair={hair} layer={layer} />;
  }

  /* Ellipse styles only on back pass */
  if (layer === "front") return null;

  return (
    <g className="lottie-buddy__hair" aria-hidden="true">
      {style === "hair-long-flow" && (
        <>
          <ellipse cx="18" cy="52" rx="10" ry="22" fill={deep} />
          <ellipse cx="82" cy="52" rx="10" ry="22" fill={deep} />
          <ellipse cx="22" cy="74" rx="11" ry="16" fill={fill} />
          <ellipse cx="78" cy="74" rx="11" ry="16" fill={fill} />
          <ellipse cx="30" cy="86" rx="9" ry="10" fill={deep} opacity="0.9" />
          <ellipse cx="70" cy="86" rx="9" ry="10" fill={deep} opacity="0.9" />
          <ellipse cx="50" cy="22" rx="24" ry="15" fill={fill} />
          <ellipse cx="42" cy="36" rx="10" ry="7" fill={fill} opacity="0.9" />
          <ellipse cx="58" cy="36" rx="10" ry="7" fill={fill} opacity="0.9" />
          <ellipse cx="48" cy="20" rx="8" ry="4" fill={hair.highlight} opacity="0.4" />
        </>
      )}

      {style === "hair-ponytail" && (
        <>
          <ellipse cx="50" cy="24" rx="20" ry="13" fill={fill} />
          <ellipse cx="24" cy="48" rx="9" ry="14" fill={deep} opacity="0.9" />
          <ellipse cx="76" cy="48" rx="9" ry="14" fill={deep} opacity="0.9" />
          <ellipse cx="42" cy="36" rx="8" ry="5.5" fill={fill} opacity="0.9" />
          <ellipse cx="58" cy="36" rx="8" ry="5.5" fill={fill} opacity="0.9" />
          {/* High ponytail */}
          <ellipse cx="68" cy="16" rx="7" ry="9" fill={fill} />
          <ellipse cx="74" cy="8" rx="8" ry="10" fill={deep} />
          <ellipse cx="76" cy="0" rx="7" ry="9" fill={fill} />
          <ellipse cx="72" cy="12" rx="3" ry="2" fill={hair.highlight} opacity="0.45" />
        </>
      )}

      {style === "hair-curls" && (
        <>
          <ellipse cx="50" cy="22" rx="18" ry="12" fill={fill} />
          {[
            [22, 42, 9, 10],
            [30, 30, 8, 8],
            [70, 30, 8, 8],
            [78, 42, 9, 10],
            [26, 58, 8, 9],
            [74, 58, 8, 9],
            [36, 22, 7, 7],
            [64, 22, 7, 7],
            [50, 16, 8, 7],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? deep : fill} />
          ))}
          <ellipse cx="48" cy="18" rx="5" ry="3" fill={hair.highlight} opacity="0.4" />
        </>
      )}

      {style === "hair-twin-puffs" && (
        <>
          <ellipse cx="50" cy="26" rx="16" ry="10" fill={fill} />
          <ellipse cx="22" cy="22" rx="13" ry="13" fill={fill} />
          <ellipse cx="78" cy="22" rx="13" ry="13" fill={fill} />
          <ellipse cx="22" cy="22" rx="9" ry="9" fill={deep} opacity="0.5" />
          <ellipse cx="78" cy="22" rx="9" ry="9" fill={deep} opacity="0.5" />
          <ellipse cx="18" cy="18" rx="4" ry="3" fill={hair.highlight} opacity="0.35" />
          <ellipse cx="74" cy="18" rx="4" ry="3" fill={hair.highlight} opacity="0.35" />
          <ellipse cx="40" cy="36" rx="7" ry="5" fill={fill} opacity="0.85" />
          <ellipse cx="60" cy="36" rx="7" ry="5" fill={fill} opacity="0.85" />
        </>
      )}

      {style === "hair-short-crop" && (
        <>
          <ellipse cx="50" cy="28" rx="22" ry="16" fill={fill} />
          <ellipse cx="28" cy="40" rx="8" ry="10" fill={deep} opacity="0.85" />
          <ellipse cx="72" cy="40" rx="8" ry="10" fill={deep} opacity="0.85" />
          <ellipse cx="50" cy="22" rx="16" ry="8" fill={hair.highlight} opacity="0.25" />
          {/* Short textured top */}
          <ellipse cx="36" cy="18" rx="5" ry="4" fill={fill} />
          <ellipse cx="50" cy="15" rx="6" ry="4.5" fill={fill} />
          <ellipse cx="64" cy="18" rx="5" ry="4" fill={fill} />
        </>
      )}

      {style === "hair-messy" && (
        <>
          <ellipse cx="50" cy="26" rx="20" ry="14" fill={fill} />
          <ellipse cx="26" cy="38" rx="9" ry="12" fill={deep} opacity="0.9" />
          <ellipse cx="74" cy="38" rx="9" ry="12" fill={deep} opacity="0.9" />
          {[
            [32, 14, 6, 5],
            [44, 10, 5, 6],
            [56, 11, 6, 5],
            [68, 15, 5, 5],
            [38, 20, 4, 4],
            [62, 19, 4, 4],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={i % 2 ? deep : fill} />
          ))}
        </>
      )}

      {style === "hair-side-sweep" && (
        <>
          <ellipse cx="50" cy="26" rx="20" ry="13" fill={fill} />
          <ellipse cx="30" cy="40" rx="9" ry="12" fill={deep} opacity="0.9" />
          <ellipse cx="72" cy="42" rx="10" ry="14" fill={deep} />
          <ellipse cx="78" cy="58" rx="8" ry="12" fill={fill} />
          {/* Sweep across forehead to the right */}
          <ellipse cx="42" cy="34" rx="12" ry="7" fill={fill} transform="rotate(-18 42 34)" />
          <ellipse cx="58" cy="32" rx="14" ry="6.5" fill={fill} transform="rotate(-12 58 32)" />
          <ellipse cx="48" cy="20" rx="7" ry="3.5" fill={hair.highlight} opacity="0.35" />
        </>
      )}

      {style === "hair-afro-puff" && (
        <>
          <ellipse cx="50" cy="20" rx="26" ry="22" fill={fill} />
          <ellipse cx="28" cy="28" rx="14" ry="14" fill={deep} opacity="0.55" />
          <ellipse cx="72" cy="28" rx="14" ry="14" fill={deep} opacity="0.55" />
          <ellipse cx="50" cy="10" rx="16" ry="12" fill={deep} opacity="0.4" />
          <ellipse cx="36" cy="16" rx="6" ry="4" fill={hair.highlight} opacity="0.3" />
          <ellipse cx="60" cy="14" rx="5" ry="3.5" fill={hair.highlight} opacity="0.25" />
          <ellipse cx="50" cy="30" rx="14" ry="6" fill={fill} />
        </>
      )}
    </g>
  );
}

/** Sparse soft trail dust — fewer motes so white sparkles stay the star */
const DUST_MOTES: Array<{
  x: number;
  y: number;
  s: number;
  delay: number;
  dur: number;
  hue: number;
  dx: number;
  dy: number;
}> = [
  { x: 30, y: 68, s: 3.5, delay: 0, dur: 3.2, hue: 250, dx: -6, dy: 16 },
  { x: 52, y: 78, s: 3, delay: 0.8, dur: 3.4, hue: 200, dx: 2, dy: 20 },
  { x: 70, y: 66, s: 3.2, delay: 1.5, dur: 3.0, hue: 280, dx: 8, dy: 14 },
  { x: 42, y: 84, s: 2.6, delay: 2.1, dur: 3.6, hue: 220, dx: -3, dy: 18 },
  { x: 60, y: 82, s: 2.5, delay: 0.4, dur: 3.1, hue: 190, dx: 5, dy: 17 },
];

function MagicalDust({ state }: { state: TutorState }) {
  const lively =
    state === "celebrating" || state === "listening" || state === "speaking";

  return (
    <div aria-hidden="true" className="lottie-buddy__dust pointer-events-none absolute inset-0 overflow-visible">
      {DUST_MOTES.map((mote, i) => (
        <span
          key={i}
          className="lottie-buddy__mote"
          style={
            {
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              width: mote.s,
              height: mote.s,
              animationDelay: `${mote.delay}s`,
              animationDuration: `${mote.dur}s`,
              ["--dust-dx" as string]: `${mote.dx}px`,
              ["--dust-dy" as string]: `${mote.dy}px`,
              ["--dust-hue" as string]: String(mote.hue),
            } as CSSProperties
          }
        />
      ))}
      {lively &&
        [0, 1].map((i) => (
          <span
            key={`extra-${i}`}
            className="lottie-buddy__mote lottie-buddy__mote--bright"
            style={
              {
                left: `${40 + i * 16}%`,
                top: `${70 + i * 4}%`,
                width: 2.8,
                height: 2.8,
                animationDelay: `${i * 0.35}s`,
                animationDuration: `2.2s`,
                ["--dust-dx" as string]: `${(i - 0.5) * 8}px`,
                ["--dust-dy" as string]: `${18}px`,
                ["--dust-hue" as string]: String(210 + i * 40),
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}

/** Sharp 4-point star with a soft glow behind a crisp core */
function Sparkle({
  cx,
  cy,
  size = 3,
  color = "#FFFFFF",
  glowId,
}: {
  cx: number;
  cy: number;
  size?: number;
  color?: string;
  glowId: string;
}) {
  // Long thin spikes — classic anime sparkle, not a soft diamond blob
  const major = size;
  const minor = size * 0.22;
  const d = [
    `M ${cx} ${cy - major}`,
    `C ${cx + minor * 0.35} ${cy - minor} ${cx + minor} ${cy - minor * 0.35} ${cx + major} ${cy}`,
    `C ${cx + minor} ${cy + minor * 0.35} ${cx + minor * 0.35} ${cy + minor} ${cx} ${cy + major}`,
    `C ${cx - minor * 0.35} ${cy + minor} ${cx - minor} ${cy + minor * 0.35} ${cx - major} ${cy}`,
    `C ${cx - minor} ${cy - minor * 0.35} ${cx - minor * 0.35} ${cy - minor} ${cx} ${cy - major}`,
    "Z",
  ].join(" ");

  return (
    <g className="lottie-buddy__sparkle">
      {/* Soft bloom behind */}
      <path d={d} fill={color} opacity={0.45} filter={`url(#${glowId})`} />
      {/* Hard crisp star */}
      <path d={d} fill={color} opacity={0.95} />
      {/* Tiny hot center */}
      <circle cx={cx} cy={cy} r={size * 0.12} fill="#fff" opacity={0.95} />
    </g>
  );
}

function Eye({
  cx,
  cy,
  irisId,
  lookX = 0,
  lookY = 0,
}: {
  id: string;
  cx: number;
  cy: number;
  irisId: string;
  lookX?: number;
  lookY?: number;
}) {
  // ~7% smaller whites so eyes sit in the face, not on top of it
  const whiteRx = 6.7;
  const whiteRy = 7.8;
  const irisR = 5.35;
  const pupilR = 2.5;

  return (
    <g className="lottie-buddy__eye">
      {/* White */}
      <ellipse cx={cx} cy={cy} rx={whiteRx} ry={whiteRy} fill="#FFFFFF" />
      {/* Soft top lid weight */}
      <path
        d={`M${cx - whiteRx + 0.4} ${cy - 1}
            a${whiteRx - 0.4} ${whiteRy - 0.6} 0 0 1 ${2 * (whiteRx - 0.4)} 0`}
        fill="#F0E8FF"
        opacity="0.35"
      />
      {/* Iris */}
      <circle
        cx={cx + lookX}
        cy={cy + lookY + 0.6}
        r={irisR}
        fill={`url(#${irisId})`}
      />
      {/* Pupil */}
      <circle cx={cx + lookX * 1.1} cy={cy + lookY + 0.9} r={pupilR} fill="#1A0E38" />
      {/* Primary wet highlight */}
      <circle
        cx={cx + lookX - 1.8}
        cy={cy + lookY - 1.6}
        r={1.7}
        fill="#fff"
        opacity="0.95"
      />
      {/* Secondary highlight */}
      <circle
        cx={cx + lookX + 1.6}
        cy={cy + lookY + 1.8}
        r={0.85}
        fill="#fff"
        opacity="0.7"
      />
      {/* Tiny sparkle */}
      <circle
        cx={cx + lookX + 2.2}
        cy={cy + lookY - 0.4}
        r={0.45}
        fill="#C8F4FF"
        opacity="0.9"
      />
    </g>
  );
}
