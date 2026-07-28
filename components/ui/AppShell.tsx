"use client";

import { BookOpenText, Bot, Gamepad2, House, Sparkles, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { Logo, LogoMark } from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/subjects", label: "Subjects", Icon: BookOpenText },
  { href: "/arcade", label: "Arcade", Icon: Gamepad2 },
  { href: "/scoreboard", label: "Score", Icon: Trophy },
  { href: "/tutor", label: "Study buddy", Icon: Bot },
  { href: "/companion", label: "Buddy", Icon: Sparkles },
  { href: "/profile", label: "Profile", Icon: UserRound },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface AppShellProps {
  children: ReactNode;
  aside?: ReactNode;
  ground?: "paper" | "cosmos";
  className?: string;
}

export function AppShell({
  children,
  aside,
  ground = "paper",
  className,
}: AppShellProps) {
  const pathname = usePathname();
  const cosmos = ground === "cosmos";

  return (
    <div
      data-ground={cosmos ? "cosmos" : undefined}
      className={cn(
        "min-h-dvh lg:flex",
        cosmos ? "arcade-ground text-white" : "bg-paper",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "hidden shrink-0 lg:flex lg:w-64 lg:flex-col",
          cosmos
            ? "border-r border-white/10 bg-white/[0.03] backdrop-blur-xl"
            : "border-r border-line bg-surface",
        )}
      >
        <div className="px-6 py-6">
          <Link href="/dashboard" aria-label="UVBrain home">
            <Logo size={28} />
          </Link>
        </div>

        <ul className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[--radius-field] px-3 py-2.5",
                    "text-body font-medium transition-colors",
                    active
                      ? cosmos
                        ? "glass text-white"
                        : "bg-accent-soft text-brand"
                      : cosmos
                        ? "text-white/60 hover:bg-white/5 hover:text-white"
                        : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4">
          <span className="block h-[3px] w-12 rounded-full bg-spectrum" aria-hidden="true" />
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 justify-center">
        <main
          className={cn(
            "w-full max-w-[34rem] pb-[calc(5.5rem+var(--safe-bottom))]",
            "lg:max-w-[46rem] lg:pb-12",
            aside && "xl:max-w-[42rem]",
            className,
          )}
        >
          {children}
        </main>

        {aside && (
          <aside className="hidden w-72 shrink-0 py-8 pr-8 xl:block">{aside}</aside>
        )}
      </div>

      <nav
        aria-label="Main"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 rounded-t-[--radius-sheet] pb-safe lg:hidden",
          cosmos
            ? "border-t border-white/10 bg-cosmos/80 backdrop-blur-2xl"
            : "bg-cosmos",
        )}
      >
        <ul className="flex items-stretch justify-around px-2 py-2">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
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
    </div>
  );
}

export function MobileMasthead({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between px-5 pt-safe lg:hidden", className)}>
      <Link href="/dashboard" aria-label="UVBrain home" className="py-3">
        <LogoMark size={26} />
      </Link>
    </div>
  );
}
