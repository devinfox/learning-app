import Phaser from "phaser";
import type { GameBus } from "../bridge/events";
import type { BuddyAtlas } from "../host/buddyAtlas";
import { ATLAS_KEY, BUS_KEY, REDUCED_MOTION_KEY } from "./keys";
import { RoomScene } from "./RoomScene";

export interface PreparedBuddy {
  atlas: BuddyAtlas;
  textures: Record<string, HTMLCanvasElement>;
}

export function createGame(
  parent: HTMLElement,
  bus: GameBus,
  reducedMotion: boolean,
  buddy: PreparedBuddy | null,
): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#140d33",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: { noAudio: true },
    scene: [RoomScene],
  });

  game.registry.set(BUS_KEY, bus);
  game.registry.set(REDUCED_MOTION_KEY, reducedMotion);
  game.registry.set(ATLAS_KEY, buddy?.atlas ?? null);

  if (buddy) {
    for (const [key, canvas] of Object.entries(buddy.textures)) {
      if (!game.textures.exists(key)) game.textures.addCanvas(key, canvas);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__ddGame = game;
  }

  return game;
}
