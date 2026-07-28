import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { statsForGame } from "@/lib/services/arcade";

const GAME_IDS = ["dungeon-dash"];

export const GET = handler(async () => {
  const { user } = await requireVerified();
  const games = await Promise.all(
    GAME_IDS.map((gameId) => statsForGame(user.id, gameId)),
  );

  return json({ games });
});
