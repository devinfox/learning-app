import type { Metadata } from "next";
import { RunScreen } from "@/game/dungeon-dash/ui/RunScreen";

export const metadata: Metadata = {
  title: "Dungeon Dash",
};

export default function DungeonDashPage() {
  return <RunScreen missionId="runaway-crystal-carts" />;
}
