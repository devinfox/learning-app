import { clearSessionCookie } from "@/lib/auth/session";
import { resetDatabase } from "@/lib/db/seed";
import { ApiError, handler, json } from "@/lib/http";

export const POST = handler(async () => {
  if (process.env.NODE_ENV === "production") {
    throw ApiError.forbidden("Not available in production.");
  }

  await resetDatabase();
  await clearSessionCookie();

  return json({ reset: true });
});
