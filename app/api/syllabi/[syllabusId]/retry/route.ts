import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { retrySyllabus } from "@/lib/services/courses";

export const POST = handler(
  async (_request: Request, ctx: RouteContext<"/api/syllabi/[syllabusId]/retry">) => {
    const { user } = await requireVerified();
    const { syllabusId } = await ctx.params;
    const syllabus = await retrySyllabus(user.id, syllabusId);
    return json({ syllabus: { id: syllabus.id, status: syllabus.status } });
  },
);
