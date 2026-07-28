import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { changeEmailSchema } from "@/lib/schemas";
import { requestEmailChange } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const { email } = await readJson(request, changeEmailSchema);
  const issued = await requestEmailChange(user, email);

  return json({
    pendingEmail: email,
    expiresAt: issued.expiresAt,
    resendableAt: issued.resendableAt,
    devCode: issued.devCode,
  });
});
