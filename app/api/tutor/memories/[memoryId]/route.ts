import { requireVerified } from "@/lib/auth/session";
import { ApiError, handler, noContent } from "@/lib/http";
import { retireMemory } from "@/lib/tutor";

export const DELETE = handler(
  async (_request: Request, ctx: RouteContext<"/api/tutor/memories/[memoryId]">) => {
    const { user } = await requireVerified();
    const { memoryId } = await ctx.params;

    const retired = await retireMemory(user.id, memoryId);
    if (!retired) throw ApiError.notFound("Memory not found.");

    return noContent();
  },
);
