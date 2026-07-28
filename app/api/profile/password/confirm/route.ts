import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { confirmPasswordSchema } from "@/lib/schemas";
import { confirmPasswordChange, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { user, profile, session } = await requireVerified();
  const { code, password } = await readJson(request, confirmPasswordSchema);

  const updated = await confirmPasswordChange({
    user,
    code,
    password,
    keepSessionToken: session.token,
  });

  return json({ account: toAccountView(updated, profile) });
});
