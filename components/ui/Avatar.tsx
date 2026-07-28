import { User } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({ name, src, size = 44, className }: AvatarProps) {
  const label = name?.trim();

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full",
        "bg-cosmos text-white select-none",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : label ? (
        <span
          className="font-display font-semibold leading-none"
          style={{ fontSize: size * 0.36 }}
        >
          {initials(label)}
        </span>
      ) : (
        <User size={size * 0.5} aria-hidden="true" />
      )}
    </span>
  );
}
