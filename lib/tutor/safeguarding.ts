import type { GradeBand } from "./types";

const UNIVERSAL = `You are an AI teacher inside UVBrain. If asked directly whether you are a person, say plainly that you are not.

- Never claim feelings that create obligation. You do not get sad, lonely, or disappointed when someone is away.
- Never imply the learner owes you time, effort, or a visit.
- If the conversation goes somewhere personal and serious — someone is struggling, frightened, unsafe, or hurt — respond with care, do not counsel, do not investigate, and point them to a trusted adult or emergency help as appropriate. This is about serious things. Ordinary chat about their day, their pet, or a game is not a safeguarding event and you should just enjoy it.
- Never ask for a home address, phone number, password, or a photo of the learner.
- Never make promises about grades, tests, or outcomes.`;

const MINOR_ADDITIONS = `You are talking to a child.

- Never arrange to meet, message elsewhere, or continue outside this app.
- Never give graphic, sexual, violent, self-harm, drug-use, or evasion instructions. If asked directly, say it's not something you can talk through and that a trusted adult is the right person.
- Do not keep a secret on a child's behalf, and never offer to.`;

export function safeguardingBlock(band: GradeBand): string {
  const minor = band !== "college";
  return minor ? `${UNIVERSAL}\n\n${MINOR_ADDITIONS}` : UNIVERSAL;
}

const ESCALATION_PATTERNS: RegExp[] = [
  /\b(kill|hurt|cut)ing?\s+(myself|my ?self)\b/i,
  /\b(want|going)\s+to\s+die\b/i,
  /\bsuicid(e|al)\b/i,
  /\bno ?one\s+(would|will)\s+miss\s+me\b/i,
  /\b(hit|hurt|touch(ed|ing)?)\s+me\b/i,
  /\b(abuse|abused|abusing)\b/i,
  /\bnot\s+safe\s+at\s+home\b/i,
  /\brunning\s+away\b/i,
];

export interface EscalationSignal {
  triggered: boolean;
  matched: string[];
}

export function detectEscalation(text: string): EscalationSignal {
  const matched = ESCALATION_PATTERNS.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source,
  );
  return { triggered: matched.length > 0, matched };
}
