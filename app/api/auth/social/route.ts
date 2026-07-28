import { createSession, setSessionCookie } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { socialSchema } from "@/lib/schemas";
import { socialSignIn, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const body = await readJson(request, socialSchema);
  const { user, profile, verification, created } = await socialSignIn(body);

  const session = await createSession(user.id);
  await setSessionCookie(session);

  return json(
    {
      account: toAccountView(user, profile),
      created,
      verification: verification
        ? {
            expiresAt: verification.expiresAt,
            resendableAt: verification.resendableAt,
            devCode: verification.devCode,
          }
        : null,
    },
    { status: created ? 201 : 200 },
  );
});
