import { cn } from "@/lib/ui/cn";

export interface RayRuleProps {
  width?: "full" | "short";
  className?: string;
}

export function RayRule({ width = "full", className }: RayRuleProps) {
  return (
    <span
      role="separator"
      className={cn(
        "block h-[3px] rounded-full bg-spectrum",
        width === "short" ? "w-16" : "w-full",
        className,
      )}
    />
  );
}

export interface RayBurstProps {
  size?: number;
  withNode?: boolean;
  className?: string;
}

export function RayBurst({ size = 96, withNode = true, className }: RayBurstProps) {
  const rays = [
    { angle: -34, color: "var(--color-ray-1)" },
    { angle: -11, color: "var(--color-ray-2)" },
    { angle: 11, color: "var(--color-ray-3)" },
    { angle: 34, color: "var(--color-ray-4)" },
  ];

  return (
    <svg
      viewBox="0 0 120 120"
      style={{ width: size, height: size }}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g strokeWidth="7" strokeLinecap="round">
        {rays.map((ray) => {
          const radians = (ray.angle * Math.PI) / 180;
          return (
            <line
              key={ray.angle}
              x1="34"
              y1="60"
              x2={34 + 66 * Math.cos(radians)}
              y2={60 + 66 * Math.sin(radians)}
              stroke={ray.color}
            />
          );
        })}
      </g>
      {withNode && (
        <>
          <circle cx="34" cy="60" r="20" fill="var(--color-lumen)" opacity="0.18" />
          <circle cx="34" cy="60" r="9" fill="var(--color-lumen)" />
        </>
      )}
    </svg>
  );
}

export interface PrismGlowProps {
  className?: string;
}

export function PrismGlow({ className }: PrismGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-prism opacity-25 blur-3xl" />
      <div className="absolute -top-10 right-[-15%] size-52 rounded-full bg-lumen opacity-[0.14] blur-3xl" />
    </div>
  );
}
