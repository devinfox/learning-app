import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface ListRowProps {
  icon?: ReactNode;
  label: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  onClick?: () => void;
  href?: string;
  selected?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ListRow({
  icon,
  label,
  value,
  description,
  onClick,
  href,
  selected,
  showChevron = true,
  disabled,
  className,
}: ListRowProps) {
  const interactive = Boolean(onClick || href);

  const content = (
    <>
      {icon && (
        <span className="grid size-6 shrink-0 place-items-center text-ink-muted">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium text-ink">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block truncate text-xs text-ink-subtle">
            {description}
          </span>
        )}
      </span>
      {value && (
        <span className="shrink-0 text-sm text-ink-subtle">{value}</span>
      )}
      {selected ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cosmos text-white">
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        </span>
      ) : (
        interactive &&
        showChevron && (
          <ChevronRight
            size={18}
            className="shrink-0 text-ink-subtle"
            aria-hidden="true"
          />
        )
      )}
    </>
  );

  const shell = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
    interactive && !disabled && "hover:bg-surface-sunken active:bg-line",
    disabled && "pointer-events-none opacity-45",
    className,
  );

  if (href && !disabled) {
    return (
      <a href={href} className={shell} aria-current={selected ? "true" : undefined}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected ? true : undefined}
        className={shell}
      >
        {content}
      </button>
    );
  }

  return <div className={shell}>{content}</div>;
}

export interface ListGroupProps {
  children: ReactNode;
  className?: string;
}

export function ListGroup({ children, className }: ListGroupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[--radius-card] bg-surface",
        "divide-y divide-line shadow-[--shadow-card]",
        className,
      )}
    >
      {children}
    </div>
  );
}
