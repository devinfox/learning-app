import { createSession, setSessionCookie } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { loginSchema } from "@/lib/schemas";
import { login, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const body = await readJson(request, loginSchema);
  const { user, profile } = await login(body);

  const session = await createSession(user.id);
  await setSessionCookie(session);

  return json({ account: toAccountView(user, profile) });
});
