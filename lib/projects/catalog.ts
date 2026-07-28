import type { RubricCriterion } from "@/lib/db/types";

export interface ProjectTemplate {
  slug: string;
  subjectSlug: string | null;
  title: string;
  blurb: string;
  prompt: string;
  steps: string[];
  rubric: RubricCriterion[];
  chaptersRequired: number;
}

function criterion(
  id: string,
  title: string,
  description: string,
  levels: [string, string, string, string],
): RubricCriterion {
  return { id, title, description, points: 25, levels };
}

const EVIDENCE = criterion(
  "evidence",
  "You used real evidence",
  "Facts, dates and examples that came from the lessons rather than from memory alone.",
  [
    "No evidence from the course yet",
    "One or two facts, loosely attached",
    "Several facts, each doing a job",
    "Evidence throughout, and it is accurate",
  ],
);

const EXPLAIN = criterion(
  "explain",
  "You explained the why",
  "Not just what happened, but why it happened and why it mattered.",
  [
    "Tells what, not why",
    "Starts to explain in places",
    "Explains most of the way through",
    "Explains clearly, including the part that is hard",
  ],
);

const STRUCTURE = criterion(
  "structure",
  "It holds together",
  "A beginning, a middle and an end, in an order a reader can follow.",
  [
    "Ideas arrive in no order",
    "An order is there but it wanders",
    "Clear order, easy to follow",
    "Order that makes the argument land",
  ],
);

const VOICE = criterion(
  "voice",
  "It sounds like you",
  "Written in your own words, with something of your own in it.",
  [
    "Copied or very close to copied",
    "Mostly your words",
    "Your words throughout",
    "Your words, and a point of view",
  ],
);

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    slug: "factory-day",
    subjectSlug: "industrial-revolution",
    title: "A Day in the Factory",
    blurb: "Write the day of a child working in a mill in 1842.",
    prompt:
      "Write one day in the life of a child your age working in a cotton mill in 1842. Start when they wake and end when they sleep. Use what you learned about hours, machines, danger and pay. It should be true to the period even though the person is invented.",
    steps: [
      "List five real facts from the unit you want to use",
      "Decide who your child is — name, age, job in the mill",
      "Write the day in order, from waking to sleeping",
      "Go back and add one moment that shows why the reforms happened",
    ],
    rubric: [EVIDENCE, EXPLAIN, STRUCTURE, VOICE],
    chaptersRequired: 3,
  },
  {
    slug: "fair-shares",
    subjectSlug: "math-g4",
    title: "The Fair Shares Problem",
    blurb: "Split something four ways and prove it was fair.",
    prompt:
      "Invent a real situation where something has to be shared and it is not easy — a pizza, a bag of marbles, time on a games console. Share it fairly between four people using fractions, then prove that your answer is fair. Show your working in a way someone younger than you could follow.",
    steps: [
      "Describe the thing being shared and who is sharing it",
      "Show the fractions you used",
      "Prove the shares are equal — drawings count",
      "Explain what you would do if a fifth person turned up",
    ],
    rubric: [
      criterion(
        "method",
        "Your method works",
        "The fractions are right and the shares really are equal.",
        [
          "The shares are not equal yet",
          "Close, with one slip",
          "Equal shares, correct fractions",
          "Correct, and the method would work on any number",
        ],
      ),
      criterion(
        "working",
        "You showed your working",
        "Someone else could follow your steps and get the same answer.",
        [
          "Answer only",
          "Some steps shown",
          "Every step shown",
          "Every step shown and labelled",
        ],
      ),
      EXPLAIN,
      criterion(
        "stretch",
        "You took it further",
        "The fifth-person question, or another twist of your own.",
        [
          "Not attempted yet",
          "Attempted",
          "Answered correctly",
          "Answered, and you found the general rule",
        ],
      ),
    ],
    chaptersRequired: 3,
  },
  {
    slug: "water-report",
    subjectSlug: "science-g4",
    title: "Where Your Water Has Been",
    blurb: "Trace one glass of water all the way round the cycle.",
    prompt:
      "Follow one glass of water backwards. Where was it yesterday, last month, a hundred years ago? Take it round the whole water cycle at least once, naming each stage properly. Then say one thing about that journey that surprised you.",
    steps: [
      "Name every stage of the cycle in order",
      "Write the journey backwards from the glass",
      "Use the proper word for each change of state",
      "End with the thing that surprised you, and why",
    ],
    rubric: [
      criterion(
        "accuracy",
        "The science is right",
        "Each stage is named correctly and happens in a possible order.",
        [
          "Stages missing or out of order",
          "Mostly right, one stage off",
          "All stages correct",
          "All correct, with the right vocabulary throughout",
        ],
      ),
      EXPLAIN,
      STRUCTURE,
      VOICE,
    ],
    chaptersRequired: 3,
  },
  {
    slug: "between-the-lines",
    subjectSlug: "reading-g4",
    title: "What the Story Didn't Say",
    blurb: "Find three things a story means without saying.",
    prompt:
      "Choose a story you have read in this course. Find three things the story tells you without ever writing them down — about a character, about how someone feels, or about what is coming. For each one, quote the line that made you think it and explain how you got there.",
    steps: [
      "Pick your story and read it once more",
      "Find three lines that hint at something unsaid",
      "For each, write what it hints and how you know",
      "Say which of the three you are least sure about, and why",
    ],
    rubric: [
      criterion(
        "inference",
        "You read between the lines",
        "What you found is genuinely implied rather than stated outright.",
        [
          "Repeats what the text says",
          "One real inference",
          "Three real inferences",
          "Three, and one nobody else would have spotted",
        ],
      ),
      criterion(
        "quotes",
        "You anchored it in the text",
        "Every claim is tied to a line you can point at.",
        [
          "No quotes yet",
          "Some claims quoted",
          "Every claim quoted",
          "Every claim quoted and the quote is the strongest available",
        ],
      ),
      EXPLAIN,
      VOICE,
    ],
    chaptersRequired: 3,
  },
];

export const GENERIC_TEMPLATE: ProjectTemplate = {
  slug: "teach-it-back",
  subjectSlug: null,
  title: "Teach It Back",
  blurb: "Explain the hardest idea in this course to someone who has never met it.",
  prompt:
    "Pick the hardest idea you have met in this course so far. Explain it to someone two years younger than you who has never heard of it. You may use a story, a drawing described in words, or a step-by-step guide — but by the end they should be able to explain it back to you.",
  steps: [
    "Name the idea and say why it was hard",
    "Explain it once, plainly",
    "Add an example that makes it click",
    "Finish with a question that would prove they understood",
  ],
  rubric: [
    criterion(
      "clarity",
      "A younger reader could follow it",
      "No jargon left unexplained, no steps skipped.",
      [
        "Assumes too much",
        "Mostly followable",
        "Clear the whole way",
        "Clear, and the hard part is handled with care",
      ],
    ),
    EVIDENCE,
    criterion(
      "example",
      "Your example does work",
      "The example genuinely makes the idea easier, rather than decorating it.",
      [
        "No example yet",
        "An example, loosely related",
        "An example that helps",
        "An example that does the whole job",
      ],
    ),
    VOICE,
  ],
  chaptersRequired: 2,
};

export function templatesFor(subjectSlug: string): ProjectTemplate[] {
  const authored = PROJECT_TEMPLATES.filter((row) => row.subjectSlug === subjectSlug);
  return authored.length > 0 ? [...authored, GENERIC_TEMPLATE] : [GENERIC_TEMPLATE];
}
