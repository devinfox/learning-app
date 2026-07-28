"use client";

import { useEffect, useRef } from "react";
import type { GameBus } from "../bridge/events";
import type { BuddyAtlas } from "../host/buddyAtlas";

export interface GameCanvasProps {
  bus: GameBus;
  atlas: BuddyAtlas | null | undefined;
  onReady(): void;
}

export function GameCanvas({ bus, atlas, onReady }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return bus.onEvent((event) => {
      if (event.type === "SCENE_READY") onReady();
    });
  }, [bus, onReady]);

  useEffect(() => {
    if (atlas === undefined) return;

    let disposed = false;
    let game: { destroy(removeCanvas: boolean): void } | null = null;

    void (async () => {
      const [{ createGame }, { decodeAtlas }] = await Promise.all([
        import("../phaser/game"),
        import("../host/buddyAtlas"),
      ]);
      if (disposed || !hostRef.current) return;

      let buddy = null;
      if (atlas) {
        try {
          buddy = { atlas, textures: await decodeAtlas(atlas) };
        } catch (error) {
          console.warn("[dungeon-dash] buddy textures failed to decode", error);
        }
      }
      if (disposed || !hostRef.current) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      game = createGame(hostRef.current, bus, reduced, buddy);
    })();

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, [bus, atlas]);

  return <div ref={hostRef} className="dd-stage" aria-hidden="true" />;
}
