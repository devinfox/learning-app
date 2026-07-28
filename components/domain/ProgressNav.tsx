"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";

const LINKS = [
  { href: "/progress", label: "Progress" },
  { href: "/projects", label: "Projects" },
  { href: "/scoreboard", label: "Scoreboard" },
];

export interface ProgressNavProps {
  ground?: "paper" | "cosmos";
  className?: string;
}

export function ProgressNav({ ground = "paper", className }: ProgressNavProps) {
  const pathname = usePathname();
  const cosmos = ground === "cosmos";

  return (
    <nav
      aria-label="Progress sections"
      className={cn(
        "flex gap-1 rounded-full p-1",
        cosmos ? "glass" : "bg-surface-sunken",
        className,
      )}
    >
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 rounded-full py-2 text-center text-caption font-semibold transition",
              active
                ? cosmos
                  ? "bg-white text-cosmos shadow-[0_0_20px_-4px_rgb(255_255_255/0.6)]"
                  : "bg-surface text-ink shadow-[--shadow-card]"
                : cosmos
                  ? "text-white/55 hover:text-white"
                  : "text-ink-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
