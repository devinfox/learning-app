import { hasPack } from "@/lib/courses";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/db/seed";
import type { Subject } from "@/lib/db/types";
import { ApiError } from "@/lib/http";

export interface SubjectView extends Subject {
  authored: boolean;
}

export async function listSubjects(query?: string): Promise<SubjectView[]> {
  await ensureSeeded();
  const subjects = await db.subjects.all();
  const term = query?.trim().toLowerCase();

  return subjects
    .filter((subject) => !term || subject.name.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((subject) => ({ ...subject, authored: hasPack(subject.slug) }));
}

export async function getSubject(subjectId: string): Promise<Subject> {
  await ensureSeeded();
  const subject = await db.subjects.get(subjectId);
  if (!subject) throw ApiError.notFound("That subject doesn't exist.");
  return subject;
}
