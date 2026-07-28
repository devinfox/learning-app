import { seedClassmates } from "@/lib/db/classmates-seed";
import { ensureSeeded } from "@/lib/db/seed";
import { ApiError, handler, json } from "@/lib/http";

export const POST = handler(async () => {
  if (process.env.NODE_ENV === "production") {
    throw ApiError.forbidden("Not available in production.");
  }

  await ensureSeeded();
  return json({ classmates: await seedClassmates() });
});
