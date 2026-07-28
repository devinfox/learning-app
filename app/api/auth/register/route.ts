import { createSession, setSessionCookie } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { registerSchema } from "@/lib/schemas";
import { register, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const body = await readJson(request, registerSchema);
  const { user, profile, verification } = await register(body);

  const session = await createSession(user.id);
  await setSessionCookie(session);

  return json(
    {
      account: toAccountView(user, profile),
      verification: {
        expiresAt: verification.expiresAt,
        resendableAt: verification.resendableAt,
        devCode: verification.devCode,
      },
    },
    { status: 201 },
  );
});
