"use client";

import { Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArcadeCard, DungeonDashArt } from "@/components/domain";
import { AppShell, MobileMasthead, Section, Skeleton, Text } from "@/components/ui";
import { ApiClientError, api } from "@/lib/api";

interface GameStats {
  gameId: string;
  plays: number;
  questionsAnswered: number;
  questionsCorrect: number;
  perfectAnswers: number;
  bestRooms: number;
  lastPlayedAt: string | null;
}

export default function ArcadePage() {
  const router = useRouter();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [equipped, setEquipped] = useState<Record<string, string> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [statsOffline, setStatsOffline] = useState(false);

  useEffect(() => {
    api<{ games: GameStats[] }>("/api/arcade/stats")
      .then((result) => {
        setStats(result.games.find((game) => game.gameId === "dungeon-dash") ?? null);
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiClientError && error.status === 401) {
          router.push("/login");
          return;
        }
        console.warn("[arcade] stats are unavailable", error);
        setStatsOffline(true);
        setLoaded(true);
      });
  }, [router]);

  useEffect(() => {
    api<{ companion: { equipped: Record<string, string> } }>("/api/companion")
      .then((result) => setEquipped(result.companion.equipped))
      .catch(() => setEquipped(null));
  }, []);

  const answered = stats?.questionsAnswered ?? 0;
  const correct = stats?.questionsCorrect ?? 0;
  const accuracy = answered > 0 ? correct / answered : 0;

  return (
    <AppShell ground="cosmos">
      <MobileMasthead />

      <Section>
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <Gamepad2 size={14} aria-hidden="true" />
          Game room
        </p>
        <Text as="h1" variant="display" className="mt-1 text-white">
          Arcade
        </Text>
        <p className="mt-2 max-w-prose text-body text-white/65">
          Adventures that run on what you have been learning. Every answer powers
          something in the world.
        </p>
        <span
          className="mt-4 block h-[3px] w-20 rounded-full bg-spectrum"
          aria-hidden="true"
        />
      </Section>

      <Section>
        {!loaded ? (
          <Skeleton className="aspect-[4/5] w-full rounded-[1.5rem]" />
        ) : (
          <ArcadeCard
            href="/arcade/dungeon-dash"
            title="Dungeon Dash"
            tagline="Math Mines"
            description="Guide your buddy through the crystal mines. Pick a move, answer to power it, and clear the room before the carts arrive."
            art={<DungeonDashArt equipped={equipped} />}
            cta={stats && stats.plays > 0 ? "Continue your Dash" : "Start your first Dash"}
            stats={[
              {
                label: "Times played",
                value: `${stats?.plays ?? 0}`,
                detail: statsOffline
                  ? "Not counting yet"
                  : stats && stats.bestRooms > 0
                    ? `Best run: ${stats.bestRooms} rooms`
                    : "No runs yet",
              },
              {
                label: "Answers right",
                value: `${correct} of ${answered}`,
                fill: accuracy,
                detail: statsOffline
                  ? "Run migration 0002 to record plays"
                  : answered > 0
                    ? `${Math.round(accuracy * 100)}% across every Dash`
                    : "Play a Dash to start counting",
              },
            ]}
          />
        )}
      </Section>

      <Section>
        <div className="rounded-[1.5rem] border border-dashed border-white/15 p-6 text-center">
          <Text as="p" variant="h3" className="text-white/70">
            More cabinets coming
          </Text>
          <p className="mt-1 text-caption text-white/45">
            Grammar Castle is next into the arcade.
          </p>
        </div>
      </Section>
    </AppShell>
  );
}
