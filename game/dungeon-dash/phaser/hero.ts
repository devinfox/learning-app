import type PhaserNamespace from "phaser";
import type { BuddyAtlas, BuddyPartId } from "../host/buddyAtlas";
import { buildGladiator, HEAD_Y, PALETTE, type HeroParts } from "./art";
import { ATLAS_KEY, BUDDY_TEXTURE_PREFIX } from "./keys";

const DISPLAY = 232;
const VIEW_UNITS = 128;
const SHADOW_UNIT = 92;
const CENTER_UNIT = 54;
const BLINK_MIN = 2800;
const BLINK_MAX = 6400;
const BLINK_HOLD = 100;

function textureKey(part: BuddyPartId): string {
  return `${BUDDY_TEXTURE_PREFIX}${part}`;
}

export function buddyTexturesReady(scene: PhaserNamespace.Scene): boolean {
  return (
    scene.textures.exists(textureKey("body")) &&
    scene.textures.exists(textureKey("eyesOpen"))
  );
}

function buildBuddy(scene: PhaserNamespace.Scene, atlas: BuddyAtlas): HeroParts {
  const perUnit = DISPLAY / VIEW_UNITS;
  const centerY = (CENTER_UNIT - SHADOW_UNIT) * perUnit;

  const container = scene.add.container(0, 0);

  const shadow = scene.add.graphics();
  shadow.fillStyle(PALETTE.shadow, 0.38);
  shadow.fillEllipse(0, 0, 118, 24);

  const layer = (
    part: BuddyPartId,
    parent: PhaserNamespace.GameObjects.Container,
    offsetY: number,
  ) => {
    const image = scene.add.image(0, offsetY, textureKey(part));
    image.setOrigin(0.5, atlas.originY);
    image.setDisplaySize(DISPLAY, DISPLAY);
    parent.add(image);
    return image;
  };

  const shield = scene.add.container(0, centerY);
  layer("glow", shield, -centerY);

  const body = scene.add.container(0, 0);
  layer("body", body, 0);

  const head = scene.add.container(0, HEAD_Y);
  layer("faceBase", head, -HEAD_Y);
  const eyes = layer("eyesOpen", head, -HEAD_Y);
  layer("mouthRest", head, -HEAD_Y);

  const weapon = scene.add.container(0, centerY);

  container.add([shadow, shield, body, head, weapon]);

  let nextBlinkAt = 0;
  let reopenAt = 0;

  const onUpdate = (time: number) => {
    if (nextBlinkAt === 0) {
      nextBlinkAt = time + BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN);
      return;
    }
    if (reopenAt > 0) {
      if (time >= reopenAt) {
        eyes.setTexture(textureKey("eyesOpen"));
        reopenAt = 0;
      }
      return;
    }
    if (time >= nextBlinkAt) {
      eyes.setTexture(textureKey("eyesClosed"));
      reopenAt = time + BLINK_HOLD;
      nextBlinkAt = time + BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN);
    }
  };

  scene.events.on("update", onUpdate);
  container.once("destroy", () => scene.events.off("update", onUpdate));

  return { container, body, shield, weapon, head, shadow };
}

export function createHero(scene: PhaserNamespace.Scene): HeroParts {
  const atlas = scene.game.registry.get(ATLAS_KEY) as BuddyAtlas | null;
  if (atlas && buddyTexturesReady(scene)) return buildBuddy(scene, atlas);
  return buildGladiator(scene);
}
