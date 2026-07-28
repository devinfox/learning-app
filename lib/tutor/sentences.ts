const SENTENCE_END = /([.!?…]+)(?:["'”’)\]]*)(\s+|$)/g;

export function takeSentences(buffer: string): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let cursor = 0;
  SENTENCE_END.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = SENTENCE_END.exec(buffer)) !== null) {
    const full = match[0];
    const punct = match[1];
    const end = match.index + full.length;

    if (punct === "." && /\d/.test(buffer[end] ?? "")) {
      continue;
    }

    const piece = buffer.slice(cursor, end).trim();
    if (piece.length > 0) sentences.push(piece);
    cursor = end;
  }

  return {
    sentences,
    rest: buffer.slice(cursor),
  };
}

export function takeOversizedClause(
  buffer: string,
  maxChars = 140,
): { sentence: string | null; rest: string } {
  const trimmed = buffer.trim();
  if (trimmed.length < maxChars) return { sentence: null, rest: buffer };

  const window = trimmed.slice(0, maxChars);
  const breakAt = Math.max(
    window.lastIndexOf("; "),
    window.lastIndexOf(", "),
    window.lastIndexOf(" — "),
    window.lastIndexOf(" - "),
    window.lastIndexOf(" "),
  );

  if (breakAt < 40) {
    return {
      sentence: trimmed.slice(0, maxChars).trim(),
      rest: trimmed.slice(maxChars),
    };
  }

  return {
    sentence: trimmed.slice(0, breakAt + 1).trim(),
    rest: trimmed.slice(breakAt + 1),
  };
}
