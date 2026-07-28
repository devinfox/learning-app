import type { ActionIconId, ActionId } from "../types";

export interface ActionPresentation {
  name: string;
  blurb: string;
  icon: ActionIconId;
  lockedBlurb?: string;
}

export interface ActionKit {
  id: string;
  tell: string | null;
  actions: Record<ActionId, ActionPresentation>;
}

const SURGE_LOCKED = "Fill the surge meter to use this.";

export const ACTION_KITS: Record<string, ActionKit> = {
  battle: {
    id: "battle",
    tell: null,
    actions: {
      attack: {
        name: "Strike",
        blurb: "Interrupts an enemy that is charging.",
        icon: "swords",
      },
      shield: {
        name: "Shield",
        blurb: "Blocks a heavy swing before it lands.",
        icon: "shield",
      },
      surge: {
        name: "Surge",
        blurb: "Hits everything at once.",
        icon: "sparkles",
        lockedBlurb: SURGE_LOCKED,
      },
    },
  },

  track: {
    id: "track",
    tell: "The next cart is already rolling.",
    actions: {
      attack: {
        name: "Lay Plank",
        blurb: "Drop a fresh plank across the gap.",
        icon: "hammer",
      },
      shield: {
        name: "Brace Rail",
        blurb: "Pin the rail so it holds under load.",
        icon: "anchor",
      },
      surge: {
        name: "Crystal Weld",
        blurb: "Fuse the whole span in one go.",
        icon: "zap",
        lockedBlurb: SURGE_LOCKED,
      },
    },
  },
};

export function actionKitFor(id: string | undefined): ActionKit {
  return ACTION_KITS[id ?? "battle"] ?? ACTION_KITS.battle;
}
