"use client";

import { BookOpenText, Bot, House, Sparkles, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/subjects", label: "Subjects", Icon: BookOpenText },
  { href: "/scoreboard", label: "Score", Icon: Trophy },
  { href: "/tutor", label: "AI Tutor", Icon: Bot },
  { href: "/companion", label: "Buddy", Icon: Sparkles },
  { href: "/profile", label: "Profile", Icon: UserRound },
] as const;

export interface BottomNavProps {
  activeHref?: string;
  className?: string;
}

export function BottomNav({ activeHref, className }: BottomNavProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 bg-cosmos pb-safe",
        "rounded-t-[--radius-sheet]",
        className,
      )}
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = current === href || current.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-2 transition-colors",
                  active ? "text-lumen" : "text-white/55 hover:text-white/80",
                )}
              >
                <Icon size={24} strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                <span className="text-[0.625rem] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
