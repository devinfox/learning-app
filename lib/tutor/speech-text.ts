const LIST_MARKER = /^[ \t]*(?:[-*+•]|\d+[.)])[ \t]+/gm;

export function speechText(input: string): string {
  let text = input;

  text = text.replace(/```[a-z]*\n?([\s\S]*?)```/gi, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/(?<![A-Za-z0-9])\*([^*\n]+)\*(?![A-Za-z0-9])/g, "$1");
  text = text.replace(/___([^_]+)___/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(?<![A-Za-z0-9_])_([^_\n]+)_(?![A-Za-z0-9_])/g, "$1");
  text = text.replace(/~~([^~]+)~~/g, "$1");

  text = text.replace(/^[ \t]*#{1,6}[ \t]+/gm, "");
  text = text.replace(/^[ \t]*>[ \t]?/gm, "");

  text = text.replace(/^[ \t]*(?:[-*_][ \t]*){3,}$/gm, "");

  text = text.replace(LIST_MARKER, "");
  text = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return "";
      return /[.!?,;:—-]$/.test(trimmed) ? trimmed : `${trimmed}.`;
    })
    .join("\n");

  text = text.replace(/(?<=\s|^)[*_~]+(?=\s|$)/g, "");

  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{2,}/g, "\n");
  text = text.replace(/\n/g, " ");
  text = text.replace(/ ([.,!?;:])/g, "$1");
  text = text.replace(/\.{2,}(?!\.)/g, "…");

  return text.trim();
}
