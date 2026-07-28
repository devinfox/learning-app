import type { Rng } from "../lib/rng";
import type { QuestionFormat } from "../types";
import type { GeneratedQuestion, HintStep } from "./types";

const BAND_RANGE: Record<number, [number, number]> = {
  1: [2, 5],
  2: [3, 6],
  3: [4, 8],
  4: [6, 9],
  5: [7, 9],
};

const WORD_CONTEXTS = [
  { subject: "mine carts", unit: "crystals", verb: "hold" },
  { subject: "lantern rows", unit: "lanterns", verb: "hold" },
  { subject: "gem pouches", unit: "gems", verb: "carry" },
  { subject: "track sections", unit: "planks", verb: "need" },
  { subject: "shelf rows", unit: "geodes", verb: "hold" },
];

function factorsFor(rng: Rng, band: number): [number, number] {
  const [low, high] = BAND_RANGE[band] ?? BAND_RANGE[3];
  const a = rng.int(low, high);
  const b = rng.int(low, high);
  return [a, b];
}

function distractorsFor(a: number, b: number): number[] {
  const answer = a * b;
  const candidates = [
    a + b,
    answer - a,
    answer + b,
    answer - b,
    answer + a,
    a * (b + 1),
  ];

  const seen = new Set<number>([answer]);
  const chosen: number[] = [];

  for (const value of candidates) {
    if (value <= 0 || seen.has(value)) continue;
    seen.add(value);
    chosen.push(value);
    if (chosen.length === 3) break;
  }

  let filler = answer + 1;
  while (chosen.length < 3) {
    if (!seen.has(filler)) {
      seen.add(filler);
      chosen.push(filler);
    }
    filler += 1;
  }

  return chosen;
}

function splitFor(a: number): [number, number] {
  if (a > 5) return [5, a - 5];
  if (a > 2) return [2, a - 2];
  return [1, a - 1];
}

function hintsFor(
  a: number,
  b: number,
  options: string[],
  correctIndex: number,
  format: QuestionFormat,
): HintStep[] {
  const [left, right] = splitFor(a);
  const eliminateIndex = options.findIndex(
    (option, index) => index !== correctIndex && Number(option) === a + b,
  );
  const fallbackIndex = options.findIndex((_, index) => index !== correctIndex);

  const first: HintStep = {
    text:
      format === "array"
        ? `Count part of it first. Split the rows into ${left} rows and ${right} rows.`
        : `Break ${a} × ${b} into ${left} × ${b} and ${right} × ${b}.`,
    directive:
      format === "array"
        ? { kind: "highlightArray", rows: a, cols: b, splitAfterRow: left }
        : { kind: "decompose", a, b, split: [left, right] },
  };

  const second: HintStep = {
    text: `${left} × ${b} = ${left * b}. Now add ${right} × ${b}, which is ${right * b}.`,
    directive: {
      kind: "eliminate",
      optionIndex: eliminateIndex >= 0 ? eliminateIndex : fallbackIndex,
    },
  };

  return [first, second];
}

function assemble(
  rng: Rng,
  id: string,
  band: number,
  format: QuestionFormat,
  a: number,
  b: number,
  prompt: string,
  diagram: GeneratedQuestion["diagram"],
): GeneratedQuestion {
  const answer = a * b;
  const values = rng.shuffle([answer, ...distractorsFor(a, b)]);
  const options = values.map(String);
  const correctIndex = values.indexOf(answer);

  return {
    id,
    skillId: `mult.${Math.min(a, b)}x${Math.max(a, b)}`,
    format,
    band,
    prompt,
    diagram,
    options,
    correctIndex,
    hints: hintsFor(a, b, options, correctIndex, format),
    explanation: `${a} × ${b} = ${answer}.`,
  };
}

function factQuestion(rng: Rng, band: number, id: string): GeneratedQuestion {
  const [a, b] = factorsFor(rng, band);
  return assemble(rng, id, band, "fact", a, b, `What is ${a} × ${b}?`, null);
}

function arrayQuestion(rng: Rng, band: number, id: string): GeneratedQuestion {
  const [a, b] = factorsFor(rng, band);
  return assemble(
    rng,
    id,
    band,
    "array",
    a,
    b,
    `The cart is loaded in ${a} rows of ${b}. How many crystals is that?`,
    { kind: "array", rows: a, cols: b },
  );
}

function wordQuestion(rng: Rng, band: number, id: string): GeneratedQuestion {
  const [a, b] = factorsFor(rng, band);
  const context = rng.pick(WORD_CONTEXTS);
  return assemble(
    rng,
    id,
    band,
    "word",
    a,
    b,
    `${a} ${context.subject} each ${context.verb} ${b} ${context.unit}. How many ${context.unit} altogether?`,
    null,
  );
}

const GENERATORS: Record<
  QuestionFormat,
  (rng: Rng, band: number, id: string) => GeneratedQuestion
> = {
  fact: factQuestion,
  array: arrayQuestion,
  word: wordQuestion,
};

export function generateQuestion(
  rng: Rng,
  band: number,
  id: string,
  format?: QuestionFormat,
): GeneratedQuestion {
  const chosen = format ?? rng.pick<QuestionFormat>(["fact", "array", "word"]);
  return GENERATORS[chosen](rng, band, id);
}
