import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { completeOnboarding, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async () => {
  const { user } = await requireVerified();
  const profile = await completeOnboarding(user.id);
  return json({ account: toAccountView(user, profile) });
});
