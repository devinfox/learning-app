import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  tone?: "brand" | "cosmos";
  offsetForNav?: boolean;
  className?: string;
}

export function Fab({
  label,
  icon,
  tone = "brand",
  offsetForNav = true,
  className,
  type = "button",
  ...props
}: FabProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "fixed right-5 z-40 grid size-14 place-items-center rounded-full",
        "shadow-[--shadow-fab] transition active:scale-95",
        tone === "brand"
          ? "bg-brand text-on-brand hover:bg-brand-hover"
          : "bg-cosmos text-white hover:brightness-125",
        offsetForNav
          ? "bottom-[calc(6rem+var(--safe-bottom))]"
          : "bottom-[calc(1.5rem+var(--safe-bottom))]",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
