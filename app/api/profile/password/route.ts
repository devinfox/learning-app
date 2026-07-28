import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { changePasswordSchema } from "@/lib/schemas";
import { requestPasswordChange } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const { currentPassword } = await readJson(request, changePasswordSchema);
  const issued = await requestPasswordChange(user, currentPassword);

  return json({
    expiresAt: issued.expiresAt,
    resendableAt: issued.resendableAt,
    devCode: issued.devCode,
  });
});
