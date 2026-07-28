export type Viseme =
  | "REST"
  | "MBP"
  | "FV"
  | "TH"
  | "L"
  | "SZTDN"
  | "SHCHJ"
  | "KG"
  | "WOO"
  | "OH"
  | "EE"
  | "AA"
  | "UH_ER";

export interface VisemeCue {
  startMs: number;
  endMs: number;
  viseme: Viseme;
  confidence: number;
  strength?: number;
}

export interface MouthPose {
  width: number;
  opening: number;
  centerShift: number;
  tongue: number;
  closed: boolean;
}

export const MOUTH_POSES: Record<Viseme, MouthPose> = {
  REST: { width: 1.0, opening: 0.04, centerShift: 0, tongue: 0, closed: true },
  MBP: { width: 0.92, opening: 0.0, centerShift: 0, tongue: 0, closed: true },
  FV: { width: 0.98, opening: 0.15, centerShift: 0.04, tongue: 0, closed: false },
  TH: { width: 0.92, opening: 0.24, centerShift: 0.07, tongue: 0.7, closed: false },
  L: { width: 1.0, opening: 0.3, centerShift: 0.09, tongue: 0.55, closed: false },
  SZTDN: { width: 1.12, opening: 0.1, centerShift: 0.03, tongue: 0, closed: false },
  SHCHJ: { width: 0.84, opening: 0.22, centerShift: 0.07, tongue: 0, closed: false },
  KG: { width: 0.96, opening: 0.28, centerShift: 0.09, tongue: 0.2, closed: false },
  WOO: { width: 0.62, opening: 0.28, centerShift: 0.09, tongue: 0, closed: false },
  OH: { width: 0.76, opening: 0.48, centerShift: 0.14, tongue: 0, closed: false },
  EE: { width: 1.28, opening: 0.16, centerShift: 0.05, tongue: 0, closed: false },
  AA: { width: 1.02, opening: 0.68, centerShift: 0.2, tongue: 0.15, closed: false },
  UH_ER: { width: 0.92, opening: 0.38, centerShift: 0.11, tongue: 0, closed: false },
};

const PHONEME_TO_VISEME: Record<string, Viseme> = {
  p: "MBP", b: "MBP", m: "MBP",
  f: "FV", v: "FV",
  TH: "TH", DH: "TH",
  l: "L",
  s: "SZTDN", z: "SZTDN", t: "SZTDN", d: "SZTDN", n: "SZTDN",
  SH: "SHCHJ", ZH: "SHCHJ", CH: "SHCHJ", JH: "SHCHJ",
  k: "KG", g: "KG", NG: "KG",
  w: "WOO", UW: "WOO", UH: "WOO",
  OW: "OH", AO: "OH",
  IY: "EE", IH: "EE", y: "EE",
  AA: "AA", AE: "AA",
  AH: "UH_ER", ER: "UH_ER",
  r: "UH_ER",
  h: "UH_ER",
};

interface PhonemeHit {
  phoneme: string;
  start: number;
  end: number;
}

const VOWELS = "aeiou";

export function graphemesToPhonemes(text: string): PhonemeHit[] {
  const lower = text.toLowerCase();
  const out: PhonemeHit[] = [];
  let i = 0;

  const push = (phoneme: string, start: number, length: number) =>
    out.push({ phoneme, start, end: start + length });

  while (i < lower.length) {
    const c = lower[i];
    const next = lower[i + 1] ?? "";
    const pair = c + next;
    const prev = lower[i - 1] ?? "";

    if (!/[a-z]/.test(c)) {
      i += 1;
      continue;
    }

    if (lower.startsWith("sch", i)) { push("s", i, 1); push("k", i + 1, 2); i += 3; continue; }

    if (c === next && "bdfglmnprstz".includes(c)) { push(c === "s" ? "s" : c, i, 2); i += 2; continue; }

    if (pair === "th") { push("TH", i, 2); i += 2; continue; }
    if (pair === "sh") { push("SH", i, 2); i += 2; continue; }
    if (pair === "ch") { push("CH", i, 2); i += 2; continue; }
    if (pair === "ph") { push("f", i, 2); i += 2; continue; }
    if (pair === "wh") { push("w", i, 2); i += 2; continue; }
    if (pair === "ck") { push("k", i, 2); i += 2; continue; }
    if (pair === "ng") { push("NG", i, 2); i += 2; continue; }
    if (pair === "qu") { push("k", i, 1); push("w", i + 1, 1); i += 2; continue; }

    if (pair === "ee" || pair === "ea") { push("IY", i, 2); i += 2; continue; }
    if (pair === "oo") { push("UW", i, 2); i += 2; continue; }
    if (pair === "ou" || pair === "ow") { push("OW", i, 2); i += 2; continue; }
    if (pair === "oi" || pair === "oy") { push("AO", i, 1); push("IY", i + 1, 1); i += 2; continue; }
    if (pair === "au" || pair === "aw") { push("AO", i, 2); i += 2; continue; }
    if (pair === "ai" || pair === "ay") { push("AA", i, 2); i += 2; continue; }
    if (pair === "er" || pair === "ir" || pair === "ur") { push("ER", i, 2); i += 2; continue; }
    if (pair === "ar") { push("AA", i, 1); push("r", i + 1, 1); i += 2; continue; }
    if (pair === "or") { push("AO", i, 1); push("r", i + 1, 1); i += 2; continue; }

    if (c === "c") {
      push("eiy".includes(next) ? "s" : "k", i, 1);
      i += 1;
      continue;
    }
    if (c === "g") {
      push("eiy".includes(next) ? "JH" : "g", i, 1);
      i += 1;
      continue;
    }
    if (c === "x") { push("k", i, 1); push("s", i, 1); i += 1; continue; }
    if (c === "j") { push("JH", i, 1); i += 1; continue; }

    if (c === "e" && i === lower.length - 1 && out.length > 0 && /[a-z]/.test(prev)) {
      i += 1;
      continue;
    }

    if (VOWELS.includes(c)) {
      const map: Record<string, string> = { a: "AE", e: "IH", i: "IH", o: "OW", u: "AH" };
      push(map[c], i, 1);
      i += 1;
      continue;
    }

    if ("pbmfvlsztdnkgwrhy".includes(c)) { push(c, i, 1); i += 1; continue; }

    i += 1;
  }

  return out;
}

export interface CharacterTiming {
  character: string;
  startMs: number;
  endMs: number;
}

export function buildCueTrack(text: string, timings: CharacterTiming[]): VisemeCue[] {
  const phonemes = graphemesToPhonemes(text);
  if (phonemes.length === 0) return [];

  const raw: VisemeCue[] = [];

  for (const hit of phonemes) {
    const span = timings.slice(hit.start, Math.max(hit.end, hit.start + 1));
    if (span.length === 0) continue;

    const viseme = PHONEME_TO_VISEME[hit.phoneme];
    if (!viseme) continue;

    raw.push({
      startMs: span[0].startMs,
      endMs: span[span.length - 1].endMs,
      viseme,
      confidence: 0.75,
    });
  }

  return applyTimingRules(raw, timings);
}

const DISTINCTIVE: ReadonlySet<Viseme> = new Set(["MBP", "FV", "TH"]);

const YIELDS_TO_VOWEL: ReadonlySet<Viseme> = new Set(["KG"]);

const MIN_CUE_MS = 40;
const SILENCE_PARTIAL_MS = 90;
const SILENCE_FULL_MS = 180;

function applyTimingRules(cues: VisemeCue[], timings: CharacterTiming[]): VisemeCue[] {
  if (cues.length === 0) return [];

  const merged: VisemeCue[] = [];
  for (const cue of cues) {
    const last = merged[merged.length - 1];
    if (last && last.viseme === cue.viseme && cue.startMs - last.endMs < 30) {
      last.endMs = cue.endMs;
    } else {
      merged.push({ ...cue });
    }
  }

  const kept = merged.filter((cue, index) => {
    const duration = cue.endMs - cue.startMs;
    if (DISTINCTIVE.has(cue.viseme)) return true;
    if (YIELDS_TO_VOWEL.has(cue.viseme) && duration < 90) {
      const neighbour = merged[index + 1] ?? merged[index - 1];
      return !neighbour;
    }
    return duration >= MIN_CUE_MS;
  });

  if (kept.length === 0) return [];

  const withRest: VisemeCue[] = [];
  const totalEnd = timings[timings.length - 1]?.endMs ?? kept[kept.length - 1].endMs;

  kept.forEach((cue, index) => {
    const previous = kept[index - 1];
    if (previous) {
      const gap = cue.startMs - previous.endMs;
      if (gap >= SILENCE_FULL_MS) {
        withRest.push({
          startMs: previous.endMs,
          endMs: cue.startMs,
          viseme: "REST",
          confidence: 0.9,
        });
      } else if (gap >= SILENCE_PARTIAL_MS) {
        withRest.push({
          startMs: previous.endMs,
          endMs: cue.startMs,
          viseme: "REST",
          confidence: 0.6,
          strength: 0.5,
        });
      }
    }
    withRest.push(cue);
  });

  withRest.push({
    startMs: totalEnd,
    endMs: totalEnd + 200,
    viseme: "REST",
    confidence: 1,
  });

  return withRest;
}

export function visualLeadMs(viseme: Viseme): number {
  switch (viseme) {
    case "MBP":
      return 75;
    case "WOO":
    case "OH":
      return 55;
    case "FV":
      return 45;
    case "TH":
      return 45;
    default:
      return 35;
  }
}

export function transitionMsFor(viseme: Viseme): number {
  if (viseme === "REST") return 80;
  if (viseme === "MBP") return 30;
  return 45;
}

export function cueAt(cues: VisemeCue[], ms: number): VisemeCue | null {
  for (let i = cues.length - 1; i >= 0; i -= 1) {
    if (ms >= cues[i].startMs) return cues[i];
  }
  return cues[0] ?? null;
}
