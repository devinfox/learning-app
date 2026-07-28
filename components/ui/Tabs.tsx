"use client";

import { cn } from "@/lib/ui/cn";

export interface TabItem {
  id: string;
  label: string;
  flagged?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}

export function Tabs({ items, value, onChange, label = "Subjects", className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("no-scrollbar flex gap-2 overflow-x-auto px-4", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-cosmos text-white"
                : "bg-surface-sunken text-ink-muted hover:bg-line",
            )}
          >
            {item.label}
            {item.flagged && !active && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 size-2 rounded-full bg-lumen-deep"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
