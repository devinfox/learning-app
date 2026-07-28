import { requireVerified } from "@/lib/auth/session";
import { handler, json, readQuery } from "@/lib/http";
import { dashboardQuerySchema } from "@/lib/schemas";
import { getDashboard } from "@/lib/services/dashboard";

export const GET = handler(async (request: Request) => {
  const { user, profile } = await requireVerified();
  const { subjectId } = readQuery(request, dashboardQuerySchema);

  const dashboard = await getDashboard({
    userId: user.id,
    name: profile.name,
    subjectId,
  });

  return json({ dashboard });
});
