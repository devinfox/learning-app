import { handler, json, readQuery } from "@/lib/http";
import { subjectQuerySchema } from "@/lib/schemas";
import { listSubjects } from "@/lib/services/catalog";

export const GET = handler(async (request: Request) => {
  const { q } = readQuery(request, subjectQuerySchema);
  return json({ subjects: await listSubjects(q) });
});
