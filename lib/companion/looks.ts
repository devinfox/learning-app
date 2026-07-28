/**
 * Free Lottie cosmetics — always unlocked. Stored in companion.equipped
 * under look slots (eyes / glow / hair). Separate from earned milestone rewards.
 */

export type LookSlot = "eyes" | "glow" | "hair";

export const LOOK_SLOTS: LookSlot[] = ["eyes", "glow", "hair"];

export function isLookSlot(slot: string): slot is LookSlot {
  return (LOOK_SLOTS as string[]).includes(slot);
}

export interface EyeLook {
  id: string;
  name: string;
  /** Iris radial stops: center → mid → deep → rim (hex) */
  iris: [string, string, string, string];
  swatch: string;
}

export interface GlowLook {
  id: string;
  name: string;
  /** CSS colors for bloom layers */
  core: string;
  mid: string;
  outer: string;
  swatch: string;
}

export type HairStyleId =
  | "hair-none"
  | "hair-soft-bob"
  | "hair-long-flow"
  | "hair-ponytail"
  | "hair-curls"
  | "hair-twin-puffs"
  | "hair-short-crop"
  | "hair-messy"
  | "hair-side-sweep"
  | "hair-afro-puff";

export interface HairLook {
  id: HairStyleId;
  name: string;
  group: "none" | "feminine" | "masculine" | "any";
  /** Primary fill */
  color: string;
  /** Highlight */
  highlight: string;
  /** Shadow / depth */
  shadow: string;
  swatch: string;
}

export const EYE_LOOKS: EyeLook[] = [
  {
    id: "eyes-prism",
    name: "Prism",
    iris: ["#7EE8FF", "#4A8CFF", "#5B3CE4", "#2A1460"],
    swatch: "#5B3CE4",
  },
  {
    id: "eyes-ocean",
    name: "Ocean",
    iris: ["#A8F0FF", "#3DB8E8", "#1A6FA8", "#0A3A5C"],
    swatch: "#3DB8E8",
  },
  {
    id: "eyes-forest",
    name: "Forest",
    iris: ["#B8F5C8", "#3DB87A", "#1A6B48", "#0A3A28"],
    swatch: "#3DB87A",
  },
  {
    id: "eyes-amber",
    name: "Amber",
    iris: ["#FFE8A0", "#F0A830", "#C46A10", "#5C3010"],
    swatch: "#F0A830",
  },
  {
    id: "eyes-rose",
    name: "Rose",
    iris: ["#FFD0E8", "#E86AB0", "#A03070", "#501028"],
    swatch: "#E86AB0",
  },
  {
    id: "eyes-night",
    name: "Night",
    iris: ["#C8D0FF", "#6A70C8", "#303868", "#101428"],
    swatch: "#6A70C8",
  },
  {
    id: "eyes-honey",
    name: "Honey",
    iris: ["#FFF0C8", "#E8B850", "#A87820", "#4A3010"],
    swatch: "#E8B850",
  },
  {
    id: "eyes-mint",
    name: "Mint",
    iris: ["#D0FFF0", "#50D8B8", "#209080", "#104840"],
    swatch: "#50D8B8",
  },
];

export const GLOW_LOOKS: GlowLook[] = [
  {
    id: "glow-lavender",
    name: "Lavender",
    core: "rgb(255 244 214 / 0.28)",
    mid: "rgb(212 196 255 / 0.16)",
    outer: "rgb(158 182 255 / 0.08)",
    swatch: "#C4B0FF",
  },
  {
    id: "glow-cyan",
    name: "Cyan",
    core: "rgb(220 250 255 / 0.32)",
    mid: "rgb(100 210 240 / 0.18)",
    outer: "rgb(60 170 220 / 0.1)",
    swatch: "#5AD0F0",
  },
  {
    id: "glow-peach",
    name: "Peach",
    core: "rgb(255 236 210 / 0.34)",
    mid: "rgb(255 180 140 / 0.16)",
    outer: "rgb(255 150 120 / 0.08)",
    swatch: "#FFB090",
  },
  {
    id: "glow-mint",
    name: "Mint",
    core: "rgb(230 255 240 / 0.3)",
    mid: "rgb(120 230 180 / 0.16)",
    outer: "rgb(80 200 150 / 0.08)",
    swatch: "#70E0B0",
  },
  {
    id: "glow-pink",
    name: "Pink",
    core: "rgb(255 230 245 / 0.32)",
    mid: "rgb(255 150 200 / 0.16)",
    outer: "rgb(240 100 170 / 0.08)",
    swatch: "#FF90C0",
  },
  {
    id: "glow-gold",
    name: "Gold",
    core: "rgb(255 248 210 / 0.36)",
    mid: "rgb(255 200 80 / 0.16)",
    outer: "rgb(240 170 40 / 0.08)",
    swatch: "#F0C050",
  },
  {
    id: "glow-violet",
    name: "Violet",
    core: "rgb(240 230 255 / 0.3)",
    mid: "rgb(140 80 220 / 0.18)",
    outer: "rgb(90 40 180 / 0.1)",
    swatch: "#8C50DC",
  },
];

export const HAIR_LOOKS: HairLook[] = [
  {
    id: "hair-none",
    name: "Fluffy crown",
    group: "none",
    color: "#E4D8FF",
    highlight: "#FFF8EE",
    shadow: "#B0A0E8",
    swatch: "#E4D8FF",
  },
  {
    id: "hair-soft-bob",
    name: "Soft bob",
    group: "feminine",
    /* Soft amber-gold; deep brown only used sparingly in shadow pockets */
    color: "#E8A820",
    highlight: "#FFF0C0",
    shadow: "#A86A18",
    swatch: "#F0B02E",
  },
  {
    id: "hair-long-flow",
    name: "Long flow",
    group: "feminine",
    color: "#2A1A14",
    highlight: "#6A4838",
    shadow: "#140C08",
    swatch: "#2A1A14",
  },
  {
    id: "hair-ponytail",
    name: "Ponytail",
    group: "feminine",
    color: "#8B3A2A",
    highlight: "#C07050",
    shadow: "#5A2018",
    swatch: "#8B3A2A",
  },
  {
    id: "hair-curls",
    name: "Soft curls",
    group: "feminine",
    color: "#C89040",
    highlight: "#F0C878",
    shadow: "#8A6020",
    swatch: "#C89040",
  },
  {
    id: "hair-twin-puffs",
    name: "Twin puffs",
    group: "any",
    color: "#1A1210",
    highlight: "#4A3830",
    shadow: "#0C0808",
    swatch: "#1A1210",
  },
  {
    id: "hair-short-crop",
    name: "Short crop",
    group: "masculine",
    color: "#2C2420",
    highlight: "#5A4A40",
    shadow: "#14100E",
    swatch: "#2C2420",
  },
  {
    id: "hair-messy",
    name: "Messy",
    group: "masculine",
    color: "#3A3028",
    highlight: "#6A5848",
    shadow: "#1C1814",
    swatch: "#3A3028",
  },
  {
    id: "hair-side-sweep",
    name: "Side sweep",
    group: "masculine",
    color: "#4A3A28",
    highlight: "#7A6048",
    shadow: "#281C14",
    swatch: "#4A3A28",
  },
  {
    id: "hair-afro-puff",
    name: "Afro puff",
    group: "any",
    color: "#1C1410",
    highlight: "#403028",
    shadow: "#0A0806",
    swatch: "#1C1410",
  },
];

const EYE_BY_ID = new Map<string, EyeLook>(EYE_LOOKS.map((x) => [x.id, x]));
const GLOW_BY_ID = new Map<string, GlowLook>(GLOW_LOOKS.map((x) => [x.id, x]));
const HAIR_BY_ID = new Map<string, HairLook>(HAIR_LOOKS.map((x) => [x.id, x]));

export function eyeLookById(id: string | undefined | null): EyeLook {
  return (id && EYE_BY_ID.get(id)) || EYE_LOOKS[0]!;
}

export function glowLookById(id: string | undefined | null): GlowLook {
  return (id && GLOW_BY_ID.get(id)) || GLOW_LOOKS[0]!;
}

export function hairLookById(id: string | undefined | null): HairLook {
  return (id && HAIR_BY_ID.get(id)) || HAIR_LOOKS[0]!;
}

export function lookById(slot: LookSlot, id: string | null | undefined) {
  if (slot === "eyes") return eyeLookById(id);
  if (slot === "glow") return glowLookById(id);
  return hairLookById(id);
}

export function isFreeLookId(id: string): boolean {
  return EYE_BY_ID.has(id) || GLOW_BY_ID.has(id) || HAIR_BY_ID.has(id);
}

export interface LottieLook {
  eyes: string;
  glow: string;
  hair: string;
}

export function lookFromEquipped(equipped: Record<string, string> | undefined | null): LottieLook {
  return {
    eyes: equipped?.eyes ?? "eyes-prism",
    glow: equipped?.glow ?? "glow-lavender",
    hair: equipped?.hair ?? "hair-none",
  };
}

export const LOOK_SLOT_LABEL: Record<LookSlot, string> = {
  eyes: "Eyes",
  glow: "Glow",
  hair: "Hair",
};
