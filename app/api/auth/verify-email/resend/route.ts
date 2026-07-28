import { requireAuth } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { resendVerification } from "@/lib/services/accounts";

export const POST = handler(async () => {
  const { user } = await requireAuth();
  const issued = await resendVerification(user);

  return json({
    expiresAt: issued.expiresAt,
    resendableAt: issued.resendableAt,
    devCode: issued.devCode,
  });
});
