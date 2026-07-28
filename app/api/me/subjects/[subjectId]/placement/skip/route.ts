import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { skipPlacement } from "@/lib/services/enrollment";

export const POST = handler(
  async (
    _request: Request,
    ctx: RouteContext<"/api/me/subjects/[subjectId]/placement/skip">,
  ) => {
    const { user } = await requireVerified();
    const { subjectId } = await ctx.params;
    const enrollment = await skipPlacement({ userId: user.id, subjectId });
    return json({ enrollment });
  },
);
