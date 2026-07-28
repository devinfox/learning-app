import { requireVerified } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ApiError, handler, json } from "@/lib/http";
import { bandForBirthYear } from "@/lib/tutor/bands";
import { getBrief } from "@/lib/tutor/course-brief";
import { isListeningEnabled, listen } from "@/lib/tutor/listen";
import type { GradeBand } from "@/lib/tutor/types";

const BANDS: GradeBand[] = ["early", "elementary", "middle", "high", "college"];

const MAX_BYTES = 10 * 1024 * 1024;

export const POST = handler(async (request: Request) => {
  if (!isListeningEnabled()) {
    throw new ApiError(503, "listening_unavailable", "Voice input is not configured.");
  }

  const { profile } = await requireVerified();

  const form = await request.formData().catch(() => null);
  if (!form) throw ApiError.badRequest("Expected a multipart body.");

  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    throw ApiError.badRequest("Attach an audio clip as `audio`.");
  }
  if (audio.size > MAX_BYTES) {
    throw ApiError.badRequest("That recording is too long.");
  }

  const requested = form.get("band");
  const band =
    typeof requested === "string" && BANDS.includes(requested as GradeBand)
      ? (requested as GradeBand)
      : bandForBirthYear(profile.birthYear);

  const subjectId = form.get("subjectId");
  const subject =
    typeof subjectId === "string" && subjectId ? await db.subjects.get(subjectId) : null;
  const brief = subject ? await getBrief(subject.id, null) : null;

  const lessonId = form.get("lessonId");
  const lesson =
    typeof lessonId === "string" && lessonId ? await db.lessons.get(lessonId) : null;

  const heard = await listen({
    audio,
    band,
    subjectName: subject?.name ?? null,
    lessonTitle: lesson?.title ?? null,
    keyTerms: brief?.keyTerms.map((entry) => entry.term) ?? [],
    language: profile.locale,
  });

  return json(heard);
});
