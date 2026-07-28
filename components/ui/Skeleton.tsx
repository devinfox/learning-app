import { cn } from "@/lib/ui/cn";

export interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-4", index === lines - 1 && "w-2/3", className)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-line/70",
        !className?.includes("h-") && "h-4",
        className,
      )}
    />
  );
}
