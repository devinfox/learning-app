import { recoverAbandonedWork } from "@/lib/jobs";
import { db } from "./index";
import type { Subject } from "./types";

const SUBJECTS: Subject[] = [
  {
    id: "sub_linguistics",
    slug: "linguistics",
    name: "Linguistics",
    icon: "translate",
    blurb: "How language works — sound, structure, meaning, and change.",
  },
  {
    id: "sub_history",
    slug: "history",
    name: "History",
    icon: "monument",
    blurb: "Reading evidence and explaining how the past became the present.",
  },
  {
    id: "sub_science",
    slug: "science",
    name: "Science",
    icon: "flask",
    blurb: "Method, measurement, and the big explanatory frameworks.",
  },
  {
    id: "sub_mathematics",
    slug: "mathematics",
    name: "Mathematics",
    icon: "sigma",
    blurb: "From arithmetic intuition to proof and abstraction.",
  },
  {
    id: "sub_philosophy",
    slug: "philosophy",
    name: "Philosophy",
    icon: "column",
    blurb: "Arguments about knowledge, ethics, mind, and reality.",
  },
  {
    id: "sub_painting",
    slug: "painting",
    name: "Painting",
    icon: "palette",
    blurb: "Materials, composition, colour, and the history of looking.",
  },
  {
    id: "sub_filmmaking",
    slug: "filmmaking",
    name: "Filmmaking",
    icon: "clapperboard",
    blurb: "Story, shot, edit — how moving images are constructed.",
  },
  {
    id: "sub_music",
    slug: "music",
    name: "Music",
    icon: "note",
    blurb: "Rhythm, harmony, and how pieces are put together.",
  },
];

let seeding: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  seeding ??= (async () => {
    const existing = await db.subjects.all();
    const byId = new Set(existing.map((subject) => subject.id));
    const missing = SUBJECTS.filter((subject) => !byId.has(subject.id));
    if (missing.length > 0) {
      await db.subjects.insertMany(missing);
    }
    await recoverAbandonedWork();
  })();
  return seeding;
}

export async function resetDatabase(): Promise<void> {
  await Promise.all(Object.values(db).map((collection) => collection.truncate()));
  seeding = null;
  await ensureSeeded();
}

export { SUBJECTS };
