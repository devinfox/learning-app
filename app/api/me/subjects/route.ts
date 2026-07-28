import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { addSubjectSchema } from "@/lib/schemas";
import { addSubject, listEnrollments } from "@/lib/services/enrollment";

export const GET = handler(async () => {
  const { user } = await requireVerified();
  return json({ enrollments: await listEnrollments(user.id) });
});

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const { subjectId } = await readJson(request, addSubjectSchema);
  const enrollment = await addSubject(user.id, subjectId);
  return json({ enrollment }, { status: 201 });
});
