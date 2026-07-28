import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type IconButtonVariant = "plain" | "filled" | "outline" | "onDark";
export type IconButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<IconButtonVariant, string> = {
  plain: "text-ink hover:bg-surface-sunken active:bg-line",
  filled: "bg-cosmos text-white hover:brightness-125 active:brightness-110",
  outline: "border border-line-strong bg-surface text-ink hover:bg-surface-sunken",
  onDark: "text-white/90 hover:bg-white/10 active:bg-white/15",
};

const SIZES: Record<IconButtonSize, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-13",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  label,
  icon,
  variant = "plain",
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid place-items-center rounded-full transition",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
