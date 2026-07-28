import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-press shadow-[0_1px_2px_rgb(18_12_36/0.08)]",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-sunken active:bg-line",
  accent:
    "bg-lumen text-cosmos hover:bg-lumen-deep active:bg-lumen-deep font-semibold",
  ghost: "text-ink-muted hover:bg-surface-sunken active:bg-line",
  danger: "bg-ember text-white hover:brightness-95 active:brightness-90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm rounded-[--radius-field] gap-1.5",
  md: "h-12 px-5 text-[0.9375rem] rounded-[--radius-field] gap-2",
  lg: "h-14 px-6 text-base rounded-[--radius-field] gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex items-center justify-center font-medium",
        "transition-[background-color,transform,filter] duration-150",
        "active:scale-[0.985] disabled:pointer-events-none",
        loading ? "cursor-wait" : "disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[inherit]",
          loading && "invisible",
        )}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={size === "sm" ? 16 : 20} />
        </span>
      )}
    </button>
  );
}
