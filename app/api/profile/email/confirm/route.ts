import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { confirmEmailSchema } from "@/lib/schemas";
import { confirmEmailChange, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { user, profile } = await requireVerified();
  const { code } = await readJson(request, confirmEmailSchema);
  const updated = await confirmEmailChange(user, code);

  return json({ account: toAccountView(updated, profile) });
});
