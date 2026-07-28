"use client";

import { Play, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/ui";

export interface ArcadeCardStat {
  label: string;
  value: string;
  detail?: string;
  fill?: number;
}

export interface ArcadeCardProps {
  href: string;
  title: string;
  tagline: string;
  description: string;
  art: ReactNode;
  stats: ArcadeCardStat[];
  cta: string;
}

export function ArcadeCard({
  href,
  title,
  tagline,
  description,
  art,
  stats,
  cta,
}: ArcadeCardProps) {
  return (
    <Link href={href} className="dd-cabinet group block" aria-label={`${title}. ${cta}`}>
      <article className="dd-cabinet__body">
        <div className="dd-cabinet__art">{art}</div>

        <div className="p-5">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#c6a8ff]">
            <Sparkles size={13} aria-hidden="true" />
            {tagline}
          </p>

          <Text as="h2" variant="h2" className="mt-1.5 text-white">
            {title}
          </Text>

          <p className="mt-2 text-body leading-relaxed text-white/70">{description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="dd-cabinet__stat">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                  {stat.label}
                </dt>
                <dd className="dd-display mt-0.5 text-xl tabular-nums text-white">
                  {stat.value}
                </dd>
                {stat.fill !== undefined && (
                  <div className="dd-cabinet__meter mt-2" aria-hidden="true">
                    <span style={{ width: `${Math.round(stat.fill * 100)}%` }} />
                  </div>
                )}
                {stat.detail && (
                  <p className="mt-1 text-[11px] text-white/45">{stat.detail}</p>
                )}
              </div>
            ))}
          </dl>

          <span className="dd-cabinet__cta mt-5">
            <Play size={16} fill="currentColor" aria-hidden="true" />
            {cta}
            <Target size={15} className="ml-auto opacity-50" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}
