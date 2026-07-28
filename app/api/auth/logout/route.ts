import { clearSessionCookie, getAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, noContent } from "@/lib/http";

export const POST = handler(async () => {
  const auth = await getAuth();
  if (auth) await db.sessions.remove(auth.session.token);
  await clearSessionCookie();
  return noContent();
});
