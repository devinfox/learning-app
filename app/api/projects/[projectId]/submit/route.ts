import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { submitProjectSchema } from "@/lib/schemas";
import { submitProject } from "@/lib/services/projects";

export const POST = handler(
  async (request: Request, ctx: RouteContext<"/api/projects/[projectId]/submit">) => {
    const { user } = await requireVerified();
    const { projectId } = await ctx.params;
    const { body, claimed } = await readJson(request, submitProjectSchema);

    const submission = await submitProject({
      userId: user.id,
      projectId,
      body,
      claimed,
    });

    return json({
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    });
  },
);
