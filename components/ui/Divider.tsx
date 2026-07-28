import { cn } from "@/lib/ui/cn";

export interface DividerProps {
  className?: string;
  label?: string;
  variant?: "hairline" | "spectrum";
}

export function Divider({ className, label, variant = "hairline" }: DividerProps) {
  const rule =
    variant === "spectrum"
      ? "h-[3px] rounded-full bg-spectrum"
      : "h-px bg-line";

  if (!label) {
    return <span role="separator" className={cn("block w-full", rule, className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)} role="separator">
      <span className={cn("flex-1", rule)} />
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
        {label}
      </span>
      <span className={cn("flex-1", rule)} />
    </div>
  );
}
