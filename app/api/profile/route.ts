import { requireAuth } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { profilePatchSchema } from "@/lib/schemas";
import { toAccountView, updateProfile } from "@/lib/services/accounts";

export const GET = handler(async () => {
  const { user, profile } = await requireAuth();
  return json({ account: toAccountView(user, profile) });
});

export const PATCH = handler(async (request: Request) => {
  const { user } = await requireAuth();
  const patch = await readJson(request, profilePatchSchema);
  const profile = await updateProfile(user.id, patch);
  return json({ account: toAccountView(user, profile) });
});
