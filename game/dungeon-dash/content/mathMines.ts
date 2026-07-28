import type { EnemySpec, Mission, RoomTemplate } from "../types";

export const ENEMIES: Record<string, EnemySpec> = {
  goblin: {
    id: "goblin",
    name: "Grumble Goblin",
    resolve: 100,
    palette: { body: "#5fbf6a", shade: "#3d8a4a", accent: "#f4d35e" },
    shape: "goblin",
    intents: ["charge", "heavy"],
  },
  slime: {
    id: "slime",
    name: "Crystal Slime",
    resolve: 50,
    palette: { body: "#4fc3e8", shade: "#2a7ba8", accent: "#c9f2ff" },
    shape: "slime",
    intents: ["swarm", "charge"],
  },
  mole: {
    id: "mole",
    name: "Miscounting Mole",
    resolve: 100,
    palette: { body: "#a97bd6", shade: "#6f47a0", accent: "#ffd9a0" },
    shape: "mole",
    intents: ["heavy", "charge"],
  },
};

export const ROOMS: Record<string, RoomTemplate> = {
  "mm-entrance": {
    id: "mm-entrance",
    type: "battle",
    title: "The Mine Gate",
    premise: "A Grumble Goblin has jammed the gate lever and will not budge.",
    questionCount: 2,
    enemyIds: ["goblin"],
    objectiveLabel: "Clear the gate",
    backdrop: "mine-gate",
    actionKit: "battle",
  },
  "mm-broken-track": {
    id: "mm-broken-track",
    type: "trap",
    title: "The Broken Track",
    premise: "The cart track is missing planks and the carts are still coming.",
    questionCount: 2,
    enemyIds: [],
    objectiveLabel: "Rebuild the track",
    backdrop: "broken-track",
    actionKit: "track",
  },
  "mm-slime-pair": {
    id: "mm-slime-pair",
    type: "battle",
    title: "The Dripping Tunnel",
    premise: "Two Crystal Slimes are swallowing every gem that rolls past.",
    questionCount: 2,
    enemyIds: ["slime", "slime"],
    objectiveLabel: "Clear the tunnel",
    backdrop: "dripping-tunnel",
    actionKit: "battle",
  },
};

export const MISSIONS: Mission[] = [
  {
    id: "runaway-crystal-carts",
    worldSlug: "math-mines",
    title: "The Runaway Crystal Carts",
    premise:
      "A crew of goblins rerouted the crystal carts. Reach the control room before the mine fills with bouncing gems.",
    skillLabel: "Multiplication facts, 4 to 9",
    estimatedMinutes: 4,
    roomIds: ["mm-entrance", "mm-broken-track", "mm-slime-pair"],
    startingBand: 3,
  },
];

export function roomsFor(mission: Mission): RoomTemplate[] {
  return mission.roomIds.map((id) => ROOMS[id]);
}
