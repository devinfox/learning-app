"use client";

import { LottieBuddy } from "./LottieBuddy";

const SHARDS = [
  { x: 96, y: 250, w: 26, h: 62, o: 0.55 },
  { x: 140, y: 250, w: 18, h: 40, o: 0.4 },
  { x: 420, y: 250, w: 22, h: 54, o: 0.45 },
  { x: 462, y: 250, w: 30, h: 78, o: 0.6 },
  { x: 520, y: 250, w: 16, h: 36, o: 0.35 },
];

function shardPath(x: number, y: number, w: number, h: number): string {
  return [
    `M${x} ${y - h}`,
    `L${x + w / 2} ${y - h * 0.35}`,
    `L${x + w * 0.3} ${y}`,
    `L${x - w * 0.3} ${y}`,
    `L${x - w / 2} ${y - h * 0.35}`,
    "Z",
  ].join(" ");
}

export interface DungeonDashArtProps {
  equipped?: Record<string, string> | null;
}

export function DungeonDashArt({ equipped }: DungeonDashArtProps) {
  return (
    <div className="dd-art relative aspect-[16/9] w-full overflow-hidden rounded-[--radius-card]">
      <svg
        viewBox="0 0 640 360"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="dd-art-cave" cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#2a1d5e" />
            <stop offset="62%" stopColor="#1d1450" />
            <stop offset="100%" stopColor="#120c2c" />
          </radialGradient>
          <linearGradient id="dd-art-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a3688" />
            <stop offset="100%" stopColor="#2f2260" />
          </linearGradient>
          <radialGradient id="dd-art-lantern" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff9f45" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff9f45" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="640" height="360" fill="url(#dd-art-cave)" />

        <g className="dd-art__arch">
          <path
            d="M470 250 L470 150 A56 56 0 0 1 582 150 L582 250 Z"
            fill="#120c2c"
            opacity="0.92"
          />
          <path
            d="M470 250 L470 150 A56 56 0 0 1 582 150 L582 250"
            fill="none"
            stroke="#6b56b8"
            strokeWidth="7"
            strokeLinejoin="round"
          />
        </g>

        {SHARDS.map((shard) => (
          <path
            key={`${shard.x}-${shard.y}`}
            d={shardPath(shard.x, shard.y, shard.w, shard.h)}
            fill="#9a6bff"
            opacity={shard.o}
          />
        ))}

        <circle cx="196" cy="88" r="52" fill="url(#dd-art-lantern)" />
        <line x1="196" y1="30" x2="196" y2="76" stroke="#9a6f1f" strokeWidth="4" />
        <circle cx="196" cy="88" r="11" fill="#f2c14e" />
        <circle cx="193" cy="85" r="4" fill="#fff3d0" />

        <rect y="250" width="640" height="110" fill="url(#dd-art-floor)" />
        <rect y="250" width="640" height="7" rx="3" fill="#5c46a4" />

        <g className="dd-art__motes">
          <circle cx="120" cy="150" r="3" fill="#6fe3ff" opacity="0.7" />
          <circle cx="300" cy="96" r="2.4" fill="#c6a8ff" opacity="0.6" />
          <circle cx="392" cy="176" r="2.8" fill="#6fe3ff" opacity="0.5" />
          <circle cx="556" cy="108" r="2.2" fill="#ffd9a0" opacity="0.6" />
        </g>
      </svg>

      <div className="dd-art__buddy absolute bottom-[16%] left-[13%]">
        <LottieBuddy size={132} equipped={equipped ?? null} state="idle" />
      </div>

      <span className="dd-art__vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
