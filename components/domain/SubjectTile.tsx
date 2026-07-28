import {
  BookOpenText,
  Clapperboard,
  Columns3,
  FlaskConical,
  Landmark,
  Languages,
  Music4,
  Palette,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { Badge } from "@/components/ui/Badge";

const ICONS: Record<string, LucideIcon> = {
  translate: Languages,
  monument: Landmark,
  flask: FlaskConical,
  sigma: Sigma,
  column: Columns3,
  palette: Palette,
  clapperboard: Clapperboard,
  note: Music4,
};

export function subjectIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name]) || BookOpenText;
}

export interface SubjectTileProps {
  name: string;
  icon?: string;
  isNew?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SubjectTile({
  name,
  icon,
  isNew,
  selectable,
  selected,
  onClick,
  className,
}: SubjectTileProps) {
  const Icon = subjectIcon(icon);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selectable ? Boolean(selected) : undefined}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center gap-3",
        "rounded-[--radius-card] border p-4 transition",
        "active:scale-[0.98]",
        selected
          ? "border-brand bg-accent-soft"
          : "border-line bg-surface hover:border-line-strong",
        className,
      )}
    >
      {isNew && (
        <Badge tone="new" className="absolute right-2.5 top-2.5">
          New
        </Badge>
      )}

      {selectable && selected && (
        <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-brand text-on-brand">
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        </span>
      )}

      <Icon
        size={40}
        strokeWidth={1.5}
        aria-hidden="true"
        className={selected ? "text-brand" : "text-ink"}
      />
      <span className="text-center text-sm font-semibold text-ink">{name}</span>
    </button>
  );
}
