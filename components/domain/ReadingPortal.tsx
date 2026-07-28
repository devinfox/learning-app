"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Quote } from "lucide-react";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/ui/cn";

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface ReadingSource {
  title: string;
  attribution: string;
  body: string[];
  guidingQuestions: string[];
}

function buildMatcher(glossary: GlossaryTerm[]): {
  pattern: RegExp | null;
  lookup: Map<string, string>;
} {
  if (glossary.length === 0) return { pattern: null, lookup: new Map() };

  const lookup = new Map(glossary.map((row) => [row.term.toLowerCase(), row.definition]));
  const escaped = [...lookup.keys()]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  return {
    pattern: new RegExp(`\\b(${escaped.join("|")})(s|es)?\\b`, "gi"),
    lookup,
  };
}

function annotate(
  text: string,
  matcher: ReturnType<typeof buildMatcher>,
  onTerm: (term: string, definition: string) => void,
): ReactNode[] {
  if (!matcher.pattern) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  matcher.pattern.lastIndex = 0;

  for (const match of text.matchAll(matcher.pattern)) {
    const start = match.index ?? 0;
    const base = match[1].toLowerCase();
    const definition = matcher.lookup.get(base);
    if (!definition) continue;

    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <button
        key={`${start}-${base}`}
        type="button"
        onClick={() => onTerm(match[0], definition)}
        className="rounded-sm underline decoration-brand/50 decoration-dotted underline-offset-4 transition hover:decoration-brand focus-visible:bg-accent-soft"
      >
        {match[0]}
      </button>,
    );
    cursor = start + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length > 0 ? nodes : [text];
}

export interface ReadingPortalProps {
  heading: string;
  body: string[];
  source?: ReadingSource | null;
  glossary?: GlossaryTerm[];
  documentTitle?: string;
  page?: number;
  pageCount?: number;
  children?: ReactNode;
  className?: string;
}

export function ReadingPortal({
  heading,
  body,
  source,
  glossary = [],
  documentTitle,
  page,
  pageCount,
  children,
  className,
}: ReadingPortalProps) {
  const matcher = useMemo(() => buildMatcher(glossary), [glossary]);
  const [active, setActive] = useState<{ term: string; definition: string } | null>(null);

  const show = (term: string, definition: string) => setActive({ term, definition });
  const paginated = typeof page === "number" && typeof pageCount === "number";

  return (
    <article
      aria-label={paginated ? `Page ${page} of ${pageCount}` : undefined}
      className={cn(
        "mx-auto flex max-w-[48rem] flex-col rounded-[--radius-card] bg-surface",
        "px-6 py-8 shadow-[--shadow-card] sm:px-12 sm:py-12 lg:px-16",
        "aspect-[8.5/11]",
        className,
      )}
    >
      {paginated && (
        <header className="mb-8 border-b border-line pb-3">
          <Text variant="overline" tone="subtle" className="truncate">
            {documentTitle}
          </Text>
        </header>
      )}

      <div className="mx-auto w-full max-w-[38rem] flex-1">
        <Text variant="h1" className="mb-5">
          {heading}
        </Text>

        <div className="space-y-4 font-sans text-[1.0625rem] leading-[1.7] text-ink">
          {body.map((paragraph, index) => (
            <p key={index}>{annotate(paragraph, matcher, show)}</p>
          ))}
        </div>

        {source && (
          <figure className="mt-8 overflow-hidden rounded-[--radius-card] border border-line bg-surface-sunken">
            <figcaption className="flex items-start gap-2.5 border-b border-line px-5 py-4">
              <Quote size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <span className="min-w-0">
                <Text variant="h3" as="span" className="block">
                  {source.title}
                </Text>
                <Text variant="caption" tone="subtle" className="mt-0.5 block">
                  {source.attribution}
                </Text>
              </span>
            </figcaption>

            <blockquote className="space-y-3 border-l-[3px] border-brand/40 px-5 py-5 font-sans text-[1.0625rem] leading-[1.7] text-ink">
              {source.body.map((paragraph, index) => (
                <p key={index}>{annotate(paragraph, matcher, show)}</p>
              ))}
            </blockquote>

            <div className="border-t border-line px-5 py-4">
              <Text variant="overline" tone="muted">
                While you read
              </Text>
              <ul className="mt-2.5 space-y-2">
                {source.guidingQuestions.map((question) => (
                  <li key={question} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-brand"
                    />
                    <Text variant="body" tone="muted" as="span">
                      {question}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        )}

        {children}
      </div>

      {paginated && (
        <footer className="mt-10 flex items-center gap-3 border-t border-line pt-3">
          <span aria-hidden="true" className="h-[2px] w-8 rounded-full bg-spectrum" />
          <Text variant="caption" tone="subtle" className="tabular-nums">
            Page {page} of {pageCount}
          </Text>
        </footer>
      )}

      {active && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(1rem+var(--safe-bottom))]">
          <div className="mx-auto max-w-[34rem] rounded-[--radius-card] bg-cosmos p-4 shadow-[--shadow-raised]">
            <div data-ground="cosmos" className="flex items-start gap-3">
              <span className="min-w-0 flex-1">
                <Text variant="label" className="block capitalize">
                  {active.term}
                </Text>
                <Text variant="body" tone="muted" className="mt-1 block">
                  {active.definition}
                </Text>
              </span>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="shrink-0 rounded-full px-3 py-1 text-caption font-semibold text-lumen"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
