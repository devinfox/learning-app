import { handler, json, readJson } from "@/lib/http";
import { forgotPasswordSchema } from "@/lib/schemas";
import { requestPasswordReset } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const { email } = await readJson(request, forgotPasswordSchema);
  const issued = await requestPasswordReset(email);

  return json({
    sent: true,
    expiresAt: issued?.expiresAt ?? null,
    resendableAt: issued?.resendableAt ?? null,
    devCode: issued?.devCode,
  });
});
