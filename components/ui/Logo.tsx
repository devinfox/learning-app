import { cn } from "@/lib/ui/cn";

const NODE_RADIUS_RATIO = 18 / 190; // Glowing node radius over the mark's height.

const BRAIN_PATH =
  "M60 46 C78 26 118 24 142 42 C158 52 162 66 156 80 C168 86 168 104 154 110 " +
  "C150 126 132 136 116 132 C112 150 96 154 88 140 C74 150 52 146 44 128 " +
  "C24 120 22 74 40 58 C46 50 52 50 60 46 Z";

const GYRI = [
  "M58 52 C72 62 66 80 80 88 C68 96 74 112 60 120",
  "M92 44 C86 66 100 82 92 102 C86 118 94 128 90 138",
  "M120 48 C112 68 126 84 118 104",
  "M70 118 C86 128 102 124 110 130",
];

const RAYS_FULL = [
  { x2: 238, y2: 52, stroke: "var(--color-ray-1)" },
  { x2: 240, y2: 82, stroke: "var(--color-ray-2)" },
  { x2: 240, y2: 110, stroke: "var(--color-ray-3)" },
  { x2: 238, y2: 140, stroke: "var(--color-ray-4)" },
];

const RAYS_REDUCED = [
  { x2: 242, y2: 60, stroke: "var(--color-ray-1)" },
  { x2: 244, y2: 96, stroke: "var(--color-ray-3)" },
  { x2: 242, y2: 132, stroke: "var(--color-ray-4)" },
];

export interface LogoMarkProps {
  size?: number;
  simplified?: boolean;
  className?: string;
  title?: string;
}

export function LogoMark({
  size = 40,
  simplified,
  className,
  title = "UVBrain",
}: LogoMarkProps) {
  const reduce = simplified ?? size <= 32;
  const gradientId = reduce ? "uvb-prism-sm" : "uvb-prism";
  const rays = reduce ? RAYS_REDUCED : RAYS_FULL;
  const strokeWidth = reduce ? 8 : 6;

  return (
    <svg
      viewBox={reduce ? "20 18 230 156" : "0 0 250 190"}
      role="img"
      aria-label={title}
      style={{ height: size }}
      className={cn("w-auto shrink-0", className)}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="0.15" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="var(--color-prism-1)" />
          <stop offset="0.5" stopColor="var(--color-prism-2)" />
          <stop offset="1" stopColor="var(--color-prism-3)" />
        </linearGradient>
        {!reduce && (
          <radialGradient id="uvb-node" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.35" stopColor="#FFF3CE" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      <path
        d={BRAIN_PATH}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {!reduce && (
        <g
          stroke={`url(#${gradientId})`}
          strokeWidth="4.4"
          strokeLinecap="round"
          opacity="0.92"
          fill="none"
        >
          {GYRI.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}

      <g strokeWidth={reduce ? 8 : 4.6} strokeLinecap="round">
        {rays.map((ray) => (
          <line
            key={ray.stroke + ray.y2}
            x1="150"
            y1="96"
            x2={ray.x2}
            y2={ray.y2}
            stroke={ray.stroke}
          />
        ))}
      </g>

      {reduce ? (
        <circle cx="150" cy="96" r="10" fill="#FFFFFF" />
      ) : (
        <>
          <circle cx="150" cy="96" r="18" fill="url(#uvb-node)" />
          <circle cx="150" cy="96" r="6.6" fill="#FFFFFF" />
          <circle cx="150" cy="96" r="3" fill="#FFF7DC" />
        </>
      )}
    </svg>
  );
}

export interface LogoProps {
  size?: number;
  variant?: "lockup" | "mark";
  ground?: "light" | "cosmos";
  clearSpace?: boolean;
  className?: string;
}

export function Logo({
  size = 32,
  variant = "lockup",
  ground = "light",
  clearSpace = false,
  className,
}: LogoProps) {
  const padding = clearSpace ? Math.round(size * NODE_RADIUS_RATIO * 2) : 0;

  return (
    <span
      style={clearSpace ? { padding } : undefined}
      className={cn("inline-flex items-center gap-[0.35em]", className)}
    >
      <LogoMark size={size} />
      {variant === "lockup" && (
        <span
          aria-hidden="true"
          style={{ fontSize: size * 0.58 }}
          className="font-sans font-extrabold leading-none tracking-[-0.03em]"
        >
          <span className={ground === "cosmos" ? "text-lumen" : "text-lumen-deep"}>
            UV
          </span>
          <span className={ground === "cosmos" ? "text-white" : "text-ink"}>
            Brain
          </span>
        </span>
      )}
    </span>
  );
}
