import { requireAuth } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { verifyEmailSchema } from "@/lib/schemas";
import { toAccountView, verifyEmail } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { user, profile } = await requireAuth();
  const { code } = await readJson(request, verifyEmailSchema);

  const verified = await verifyEmail(user.id, code);

  return json({
    account: toAccountView(verified, profile),
    nextStep: profile.name && profile.birthYear !== null ? "dashboard" : "basic_info",
  });
});
