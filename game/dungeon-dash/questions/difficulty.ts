import type { QuestionFormat } from "../types";

export interface AttemptRecord {
  skillId: string;
  format: QuestionFormat;
  correct: boolean;
  hintLevel: number;
  attempts: number;
  effectiveness: number;
  responseMs: number;
}

const WINDOW = 8;
const MIN_SAMPLE = 4;
const MIN_BAND = 1;
const MAX_BAND = 5;

export function adjustBand(band: number, history: AttemptRecord[]): number {
  const window = history.slice(-WINDOW);
  if (window.length < MIN_SAMPLE) return band;

  const strong = window.filter((record) => record.effectiveness >= 0.85).length;
  const hinted = window.filter((record) => record.hintLevel > 0).length;
  const average =
    window.reduce((total, record) => total + record.effectiveness, 0) / window.length;
  const median = medianTime(window);

  if (strong / window.length >= 0.8 && hinted / window.length <= 0.125 && median < 12000) {
    return Math.min(MAX_BAND, band + 1);
  }

  if (average <= 0.5) {
    return Math.max(MIN_BAND, band - 1);
  }

  return band;
}

export function preferredFormat(
  history: AttemptRecord[],
  fallback: QuestionFormat,
): QuestionFormat {
  const recent = history.slice(-WINDOW);
  const missedTwice = recent.filter((record) => record.effectiveness <= 0.35);
  if (missedTwice.length < 2) return fallback;

  const lastMissedFormat = missedTwice[missedTwice.length - 1].format;
  const repeated = missedTwice.filter(
    (record) => record.format === lastMissedFormat,
  ).length;
  if (repeated < 2) return fallback;

  return lastMissedFormat === "array" ? "word" : "array";
}

function medianTime(records: AttemptRecord[]): number {
  const times = records.map((record) => record.responseMs).sort((a, b) => a - b);
  const middle = Math.floor(times.length / 2);
  return times.length % 2 === 0
    ? (times[middle - 1] + times[middle]) / 2
    : times[middle];
}
