import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyLarge"
  | "caption"
  | "label"
  | "overline";

export type TextTone = "default" | "muted" | "subtle" | "brand" | "onBrand";

const VARIANTS: Record<TextVariant, string> = {
  display: "font-display text-display font-bold",
  h1: "font-display text-h1 font-bold",
  h2: "font-display text-h2 font-semibold",
  h3: "font-display text-h3 font-semibold",
  bodyLarge: "font-sans text-[1.0625rem] leading-relaxed",
  body: "font-sans text-body",
  caption: "font-sans text-caption",
  label: "font-sans text-sm font-medium",
  overline: "font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
};

const TONES: Record<TextTone, string> = {
  default: "text-ink",
  muted: "text-ink-muted",
  subtle: "text-ink-subtle",
  brand: "text-brand",
  onBrand: "text-on-brand",
};

const ELEMENTS: Record<TextVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  bodyLarge: "p",
  body: "p",
  caption: "p",
  label: "span",
  overline: "span",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  tone?: TextTone;
  as?: ElementType;
  measure?: boolean;
  children: ReactNode;
}

export function Text({
  variant = "body",
  tone = "default",
  as,
  measure = false,
  className,
  children,
  ...props
}: TextProps) {
  const Component = as ?? ELEMENTS[variant];

  return (
    <Component
      className={cn(
        VARIANTS[variant],
        TONES[tone],
        measure && "max-w-[68ch]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Prose({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-[68ch] font-sans text-body text-ink",
        "[&_p]:leading-[1.65] [&_p+p]:mt-4",
        "[&_h2]:font-display [&_h2]:text-h2 [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3",
        "[&_h3]:font-display [&_h3]:text-h3 [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2",
        "[&_strong]:font-semibold [&_em]:italic",
        "[&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:marker:text-ink-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
