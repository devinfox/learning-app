import { requireVerified } from "@/lib/auth/session";
import { handler, json, readJson } from "@/lib/http";
import { arcadePlaySchema } from "@/lib/schemas";
import { recordPlay, statsForGame } from "@/lib/services/arcade";

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();
  const body = await readJson(request, arcadePlaySchema);

  await recordPlay({ userId: user.id, ...body });
  const stats = await statsForGame(user.id, body.gameId);

  return json({ stats });
});
