"use client";

import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { LottieBuddy } from "@/components/domain/LottieBuddy";
import { glowLookById, lookFromEquipped, type GlowLook } from "@/lib/companion/looks";
import { BUDDY_TEXTURE_PREFIX } from "../phaser/keys";

export type BuddyPartId =
  | "glow"
  | "body"
  | "faceBase"
  | "eyesOpen"
  | "eyesClosed"
  | "mouthRest"
  | "mouthOpen";

export interface BuddyAtlas {
  size: number;
  pad: number;
  originY: number;
  look: { eyes: string; glow: string; hair: string };
  parts: Record<BuddyPartId, string>;
}

export const BUDDY_PART_IDS: BuddyPartId[] = [
  "glow",
  "body",
  "faceBase",
  "eyesOpen",
  "eyesClosed",
  "mouthRest",
  "mouthOpen",
];

const PAD = 14;
const VIEW = 100 + PAD * 2;
const SHADOW_Y = 92;

function splitColor(css: string): { color: string; opacity: number } {
  const match = css.match(
    /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+))?\s*\)/i,
  );
  if (!match) return { color: css, opacity: 1 };
  return {
    color: `rgb(${match[1]},${match[2]},${match[3]})`,
    opacity: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function glowMarkup(glow: GlowLook, size: number): string {
  const core = splitColor(glow.core);
  const mid = splitColor(glow.mid);
  const outer = splitColor(glow.outer);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"`,
    ` viewBox="${-PAD} ${-PAD} ${VIEW} ${VIEW}">`,
    `<defs><radialGradient id="bloom" cx="50%" cy="55%" r="52%">`,
    `<stop offset="0%" stop-color="${core.color}" stop-opacity="${core.opacity}"/>`,
    `<stop offset="46%" stop-color="${mid.color}" stop-opacity="${mid.opacity}"/>`,
    `<stop offset="74%" stop-color="${outer.color}" stop-opacity="${outer.opacity}"/>`,
    `<stop offset="100%" stop-color="${outer.color}" stop-opacity="0"/>`,
    `</radialGradient></defs>`,
    `<rect x="${-PAD}" y="${-PAD}" width="${VIEW}" height="${VIEW}" fill="url(#bloom)"/>`,
    `</svg>`,
  ].join("");
}

function serializePart(
  root: Root,
  host: HTMLElement,
  node: ReactElement,
  size: number,
): string {
  flushSync(() => root.render(node));

  const svg = host.querySelector("svg");
  if (!svg) throw new Error("buddy svg did not render");

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("viewBox", `${-PAD} ${-PAD} ${VIEW} ${VIEW}`);
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));
  clone.removeAttribute("class");
  return new XMLSerializer().serializeToString(clone);
}

async function rasterize(markup: string, size: number): Promise<string> {
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.width = size;
    image.height = size;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("buddy part failed to rasterize"));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no 2d context for the buddy atlas");
    context.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderBuddyAtlas(
  equipped: Record<string, string> | null,
  size = 256,
): Promise<BuddyAtlas> {
  const look = lookFromEquipped(equipped);
  const glow = glowLookById(look.glow);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:100px;height:100px;opacity:0;pointer-events:none";
  document.body.appendChild(host);
  const root = createRoot(host);

  const shared = {
    size: 100,
    equipped,
    transitionMs: 0,
    showBloom: false,
    showDust: false,
  } as const;

  try {
    const markup: Record<BuddyPartId, string> = {
      glow: glowMarkup(glow, size),
      body: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showFace={false} showShadow={false} />,
        size,
      ),
      faceBase: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showBody={false} showEyes={false} showMouth={false} />,
        size,
      ),
      eyesOpen: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showBody={false} showMouth={false} lidsClosed={false} />,
        size,
      ),
      eyesClosed: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showBody={false} showMouth={false} lidsClosed />,
        size,
      ),
      mouthRest: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showBody={false} showEyes={false} pose="REST" />,
        size,
      ),
      mouthOpen: serializePart(
        root,
        host,
        <LottieBuddy {...shared} showBody={false} showEyes={false} pose="AA" />,
        size,
      ),
    };

    const rendered = await Promise.all(
      BUDDY_PART_IDS.map(async (id) => [id, await rasterize(markup[id], size)] as const),
    );

    return {
      size,
      pad: PAD,
      originY: (SHADOW_Y + PAD) / VIEW,
      look,
      parts: Object.fromEntries(rendered) as Record<BuddyPartId, string>,
    };
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function decodeAtlas(
  atlas: BuddyAtlas,
): Promise<Record<string, HTMLCanvasElement>> {
  const entries = await Promise.all(
    BUDDY_PART_IDS.map(async (id) => {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`buddy part ${id} failed to decode`));
        image.src = atlas.parts[id];
      });
      const canvas = document.createElement("canvas");
      canvas.width = atlas.size;
      canvas.height = atlas.size;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("no 2d context for the buddy atlas");
      context.drawImage(image, 0, 0);
      return [`${BUDDY_TEXTURE_PREFIX}${id}`, canvas] as const;
    }),
  );
  return Object.fromEntries(entries);
}
