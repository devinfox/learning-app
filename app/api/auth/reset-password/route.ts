import { createSession, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ApiError, handler, json, readJson } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/schemas";
import { resetPassword, toAccountView } from "@/lib/services/accounts";

export const POST = handler(async (request: Request) => {
  const body = await readJson(request, resetPasswordSchema);
  const user = await resetPassword(body);

  const profile = await db.profiles.get(user.id);
  if (!profile) throw ApiError.notFound("Profile not found.");

  const session = await createSession(user.id);
  await setSessionCookie(session);

  return json({ account: toAccountView(user, profile) });
});
