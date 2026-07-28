import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson, readQuery } from "@/lib/http";
import { briefQuerySchema, briefRequestSchema } from "@/lib/schemas";
import { ensureBrief, getBrief } from "@/lib/tutor";

export const POST = handler(async (request: Request) => {
  await requireVerified();
  const body = await readJson(request, briefRequestSchema);

  const brief = await ensureBrief({
    subjectId: body.subjectId,
    syllabusId: body.syllabusId ?? null,
  });

  return json({ brief: brief ? { id: brief.id, status: brief.status } : null });
});

export const GET = handler(async (request: Request) => {
  await requireVerified();
  const { subjectId, syllabusId } = readQuery(request, briefQuerySchema);

  const brief = await getBrief(subjectId, syllabusId ?? null);
  return json({ brief });
});
