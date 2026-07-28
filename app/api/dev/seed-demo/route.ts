import { ApiError, handler, json } from "@/lib/http";
import { seedDemoLearner } from "@/lib/db/demo-seed";
import { ensureSeeded } from "@/lib/db/seed";

export const POST = handler(async () => {
  if (process.env.NODE_ENV === "production") {
    throw ApiError.forbidden("Not available in production.");
  }

  await ensureSeeded();
  return json({ demo: await seedDemoLearner() });
});
