import type { ActionId, EnemyState, RoomTemplate } from "../types";

export type SceneCommand =
  | { type: "LOAD_ROOM"; room: RoomTemplate; enemies: EnemyState[]; seed: number }
  | { type: "PLAY_INTRO" }
  | {
      type: "PLAY_PLAYER_MOVE";
      actionId: ActionId;
      effectiveness: number;
      countered: boolean;
      assisted: boolean;
    }
  | { type: "SYNC_ENEMIES"; enemies: EnemyState[] }
  | { type: "SETTLE"; enemies: EnemyState[]; objective: number }
  | { type: "PLAY_ENEMY_TURN"; hit: boolean; hazard: boolean }
  | { type: "UPDATE_OBJECTIVE"; progress: number }
  | { type: "ROOM_CLEARED" }
  | { type: "SET_REDUCED_MOTION"; on: boolean };

export type SceneEvent =
  | { type: "SCENE_READY" }
  | { type: "ROOM_READY"; roomId: string }
  | { type: "INTRO_COMPLETE" }
  | { type: "MOVE_ANIMATION_COMPLETE"; actionId: ActionId }
  | { type: "ENEMY_TURN_COMPLETE" }
  | { type: "SCENE_ERROR"; message: string };

type CommandHandler = (command: SceneCommand) => void;
type EventHandler = (event: SceneEvent) => void;

export interface GameBus {
  send(command: SceneCommand): void;
  emit(event: SceneEvent): void;
  onCommand(handler: CommandHandler): () => void;
  onEvent(handler: EventHandler): () => void;
  clear(): void;
}

export function createGameBus(): GameBus {
  const commandHandlers = new Set<CommandHandler>();
  const eventHandlers = new Set<EventHandler>();

  return {
    send(command) {
      commandHandlers.forEach((handler) => handler(command));
    },
    emit(event) {
      eventHandlers.forEach((handler) => handler(event));
    },
    onCommand(handler) {
      commandHandlers.add(handler);
      return () => commandHandlers.delete(handler);
    },
    onEvent(handler) {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },
    clear() {
      commandHandlers.clear();
      eventHandlers.clear();
    },
  };
}

export function sendAndWait(
  bus: GameBus,
  command: SceneCommand,
  type: SceneEvent["type"],
  timeoutMs: number,
): Promise<void> {
  const settled = waitForEvent(bus, type, timeoutMs);
  bus.send(command);
  return settled;
}

export function waitForEvent(
  bus: GameBus,
  type: SceneEvent["type"],
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (timedOut: boolean) => {
      if (settled) return;
      settled = true;
      off();
      clearTimeout(timer);
      if (timedOut) {
        console.warn(`[dungeon-dash] timed out waiting for ${type}`);
      }
      resolve();
    };

    const off = bus.onEvent((event) => {
      if (event.type === type) finish(false);
    });

    const timer = setTimeout(() => finish(true), timeoutMs);
  });
}
