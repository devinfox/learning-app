import type PhaserNamespace from "phaser";

type Scene = PhaserNamespace.Scene;
type Container = PhaserNamespace.GameObjects.Container;
type Graphics = PhaserNamespace.GameObjects.Graphics;

/** Math Mines world palette — calm environment, bright gameplay accents. */
export const PALETTE = {
  void: 0x07051a,
  deep: 0x0e0a28,
  cave: 0x1a1248,
  caveLit: 0x2b1d66,
  rock: 0x3a2d6e,
  rockMid: 0x4a3a88,
  rockLit: 0x5c4aa0,
  rockHighlight: 0x7a68c4,
  crystal: 0x6fe3ff,
  crystalDeep: 0x2a8fa0,
  crystalGlow: 0xa8f4ff,
  amethyst: 0x9a6bff,
  amethystDeep: 0x5a2fad,
  lantern: 0xff9f45,
  lanternCore: 0xfff0c8,
  gold: 0xf2c14e,
  goldBright: 0xffe8a0,
  bronze: 0xd8a13a,
  bronzeDark: 0x8a6418,
  rail: 0xc4a45a,
  railDark: 0x6a5428,
  tunic: 0xc14b4b,
  tunicDark: 0x8d3232,
  skin: 0xe8b58a,
  bone: 0xf4efe2,
  shadow: 0x05030f,
  mint: 0x7ee7c1,
  coral: 0xff8a7a,
  dust: 0xc8b8ff,
};

export const GROUND_LINE = 348;
export const HEAD_Y = -142;
export const VIEW_W = 1280;
export const VIEW_H = 720;

export function roundedRect(
  g: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: number,
  alpha = 1,
): void {
  g.fillStyle(color, alpha);
  g.fillRoundedRect(x, y, width, height, radius);
}

export function crystalShard(
  g: Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  alpha = 1,
): void {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(x, y - height);
  g.lineTo(x + width / 2, y - height * 0.35);
  g.lineTo(x + width * 0.28, y);
  g.lineTo(x - width * 0.28, y);
  g.lineTo(x - width / 2, y - height * 0.35);
  g.closePath();
  g.fillPath();
  // Specular facet
  g.fillStyle(0xffffff, alpha * 0.28);
  g.beginPath();
  g.moveTo(x - width * 0.08, y - height * 0.85);
  g.lineTo(x + width * 0.12, y - height * 0.45);
  g.lineTo(x - width * 0.02, y - height * 0.35);
  g.closePath();
  g.fillPath();
}

function rockBoulder(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  base: number,
  shade: number,
  highlight: number,
): void {
  g.fillStyle(shade, 1);
  g.fillEllipse(x + 4, y + 6, w * 1.05, h * 0.9);
  g.fillStyle(base, 1);
  g.fillEllipse(x, y, w, h);
  g.fillStyle(highlight, 0.55);
  g.fillEllipse(x - w * 0.18, y - h * 0.22, w * 0.35, h * 0.28);
  g.fillStyle(PALETTE.shadow, 0.18);
  g.fillEllipse(x + w * 0.12, y + h * 0.18, w * 0.4, h * 0.22);
}

function lanternPost(g: Graphics, x: number, y: number): void {
  // Ambient pool
  g.fillStyle(PALETTE.lantern, 0.06);
  g.fillCircle(x, y + 40, 90);
  g.fillStyle(PALETTE.lantern, 0.1);
  g.fillCircle(x, y + 8, 48);
  g.fillStyle(PALETTE.lanternCore, 0.12);
  g.fillCircle(x, y, 22);
  // Pole
  g.fillStyle(PALETTE.bronzeDark, 1);
  g.fillRoundedRect(x - 3.5, y - 78, 7, 52, 3);
  g.fillStyle(PALETTE.rail, 1);
  g.fillRoundedRect(x - 2.5, y - 76, 5, 12, 2);
  // Housing
  g.fillStyle(PALETTE.bronzeDark, 1);
  g.fillRoundedRect(x - 11, y - 18, 22, 8, 2);
  g.fillStyle(PALETTE.gold, 1);
  g.fillCircle(x, y, 13);
  g.fillStyle(PALETTE.lanternCore, 1);
  g.fillCircle(x - 2, y - 2, 6);
  g.fillStyle(0xffffff, 0.55);
  g.fillCircle(x - 4, y - 4, 2.5);
}

function numberCarve(g: Graphics, x: number, y: number, digit: string): void {
  // Soft recessed carving — subject detail, not wall spam
  g.fillStyle(PALETTE.deep, 0.35);
  g.fillRoundedRect(x - 14, y - 18, 28, 34, 6);
  g.lineStyle(2, PALETTE.rockHighlight, 0.35);
  g.strokeRoundedRect(x - 14, y - 18, 28, 34, 6);
  // Simple glyph bars for 4 / 7 / 8 vibes without true text raster
  g.fillStyle(PALETTE.amethyst, 0.45);
  if (digit === "4") {
    g.fillRect(x - 6, y - 10, 3, 18);
    g.fillRect(x - 6, y - 2, 14, 3);
    g.fillRect(x + 5, y - 10, 3, 18);
  } else if (digit === "7") {
    g.fillRect(x - 8, y - 10, 16, 3);
    g.fillRect(x + 4, y - 10, 3, 18);
  } else {
    g.fillRoundedRect(x - 7, y - 10, 14, 18, 5);
    g.fillStyle(PALETTE.deep, 0.5);
    g.fillRoundedRect(x - 3, y - 5, 6, 8, 2);
  }
}

function groundShadow(scene: Scene, width: number, alpha = 0.4): Graphics {
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.shadow, alpha);
  g.fillEllipse(0, 0, width, width * 0.22);
  g.fillStyle(PALETTE.shadow, alpha * 0.45);
  g.fillEllipse(0, 2, width * 0.72, width * 0.14);
  return g;
}

// ---------------------------------------------------------------------------
// Hero — lightweight placeholder (buddy swap later)
// ---------------------------------------------------------------------------

export interface HeroParts {
  container: Container;
  body: Container;
  shield: Container;
  weapon: Container;
  head: Container;
  shadow: Graphics;
}

/** Simple modular stand-in. Buddy art plugs in behind the same pose hooks. */
export function buildGladiator(scene: Scene): HeroParts {
  const container = scene.add.container(0, 0);
  const shadow = groundShadow(scene, 108, 0.38);
  container.add(shadow);

  const body = scene.add.container(0, 0);
  const bodyG = scene.add.graphics();
  // Legs
  roundedRect(bodyG, -24, -44, 18, 44, 9, PALETTE.skin);
  roundedRect(bodyG, 6, -44, 18, 44, 9, PALETTE.skin);
  roundedRect(bodyG, -26, -12, 20, 12, 5, PALETTE.bronzeDark);
  roundedRect(bodyG, 6, -12, 20, 12, 5, PALETTE.bronzeDark);
  // Torso — base / shade / highlight
  roundedRect(bodyG, -30, -86, 60, 46, 14, PALETTE.tunicDark);
  roundedRect(bodyG, -28, -88, 56, 42, 13, PALETTE.tunic);
  roundedRect(bodyG, -22, -86, 24, 14, 7, 0xe07070, 0.45);
  // Chest plate
  roundedRect(bodyG, -32, -126, 64, 46, 15, PALETTE.bronzeDark);
  roundedRect(bodyG, -30, -128, 60, 42, 14, PALETTE.bronze);
  roundedRect(bodyG, -26, -126, 28, 12, 6, PALETTE.gold, 0.7);
  body.add(bodyG);
  container.add(body);

  const weapon = scene.add.container(32, -108);
  const weaponG = scene.add.graphics();
  roundedRect(weaponG, -8, -6, 16, 14, 6, PALETTE.skin);
  roundedRect(weaponG, 4, -5, 10, 12, 4, PALETTE.bronzeDark);
  roundedRect(weaponG, 12, -8, 8, 18, 3, PALETTE.gold);
  weaponG.fillStyle(PALETTE.bone, 1);
  weaponG.beginPath();
  weaponG.moveTo(20, -6);
  weaponG.lineTo(72, -3);
  weaponG.lineTo(84, 0);
  weaponG.lineTo(72, 3);
  weaponG.lineTo(20, 6);
  weaponG.closePath();
  weaponG.fillPath();
  weaponG.fillStyle(0xffffff, 0.35);
  weaponG.fillTriangle(28, -3, 68, -1, 28, 0);
  weapon.add(weaponG);
  container.add(weapon);

  const head = scene.add.container(0, HEAD_Y);
  const headG = scene.add.graphics();
  headG.fillStyle(PALETTE.skin, 1);
  headG.fillCircle(0, 2, 20);
  headG.fillStyle(PALETTE.bronzeDark, 1);
  headG.slice(0, 2, 24, Math.PI, 0, false);
  headG.fillPath();
  headG.fillStyle(PALETTE.bronze, 1);
  headG.slice(0, 2, 22, Math.PI, 0, false);
  headG.fillPath();
  roundedRect(headG, -24, -2, 8, 20, 4, PALETTE.bronze);
  roundedRect(headG, 16, -2, 8, 20, 4, PALETTE.bronze);
  headG.fillStyle(PALETTE.gold, 1);
  headG.fillRoundedRect(-4, -40, 8, 22, 4);
  headG.fillStyle(PALETTE.tunic, 1);
  headG.fillEllipse(0, -42, 28, 14);
  // Eyes — large, readable
  headG.fillStyle(0xffffff, 1);
  headG.fillCircle(-7, 4, 5);
  headG.fillCircle(7, 4, 5);
  headG.fillStyle(PALETTE.deep, 1);
  headG.fillCircle(-6, 5, 2.8);
  headG.fillCircle(8, 5, 2.8);
  head.add(headG);
  container.add(head);

  const shield = scene.add.container(-36, -98);
  const shieldG = scene.add.graphics();
  shieldG.fillStyle(PALETTE.shadow, 0.35);
  shieldG.fillCircle(3, 4, 36);
  shieldG.fillStyle(PALETTE.bronzeDark, 1);
  shieldG.fillCircle(0, 0, 36);
  shieldG.fillStyle(PALETTE.tunic, 1);
  shieldG.fillCircle(0, 0, 29);
  shieldG.fillStyle(PALETTE.tunicDark, 1);
  shieldG.fillCircle(2, 3, 22);
  shieldG.fillStyle(PALETTE.gold, 1);
  shieldG.fillCircle(0, 0, 10);
  shieldG.lineStyle(3.5, PALETTE.gold, 1);
  shieldG.strokeCircle(0, 0, 21);
  shieldG.fillStyle(0xffffff, 0.2);
  shieldG.fillEllipse(-8, -10, 14, 10);
  shield.add(shieldG);
  container.add(shield);

  return { container, body, shield, weapon, head, shadow };
}

// ---------------------------------------------------------------------------
// Enemies — distinct silhouettes + material planes
// ---------------------------------------------------------------------------

export interface EnemyParts {
  container: Container;
  body: Container;
  face: Container;
  shadow: Graphics;
  accent: Container;
}

export function buildEnemy(
  scene: Scene,
  shape: "goblin" | "slime" | "mole",
  palette: { body: number; shade: number; accent: number },
): EnemyParts {
  const container = scene.add.container(0, 0);
  const shadow = groundShadow(scene, shape === "slime" ? 118 : 104, 0.42);
  container.add(shadow);

  const body = scene.add.container(0, 0);
  const g = scene.add.graphics();
  const accent = scene.add.container(0, 0);
  const accentG = scene.add.graphics();

  if (shape === "goblin") {
    // Chunky triangle-shouldered goblin
    g.fillStyle(palette.shade, 1);
    g.fillEllipse(0, -30, 86, 70);
    g.fillStyle(palette.body, 1);
    g.fillEllipse(0, -38, 76, 64);
    // Belly highlight
    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(-8, -42, 28, 22);
    // Pointy ears
    g.fillStyle(palette.body, 1);
    g.beginPath();
    g.moveTo(-28, -58);
    g.lineTo(-62, -92);
    g.lineTo(-22, -68);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(28, -58);
    g.lineTo(62, -92);
    g.lineTo(22, -68);
    g.closePath();
    g.fillPath();
    g.fillStyle(palette.shade, 1);
    g.beginPath();
    g.moveTo(-30, -60);
    g.lineTo(-52, -82);
    g.lineTo(-26, -66);
    g.closePath();
    g.fillPath();
    // Feet
    roundedRect(g, -36, -16, 26, 16, 8, palette.shade);
    roundedRect(g, 10, -16, 26, 16, 8, palette.shade);
    // Club
    accentG.fillStyle(PALETTE.bronzeDark, 1);
    accentG.fillRoundedRect(34, -70, 12, 48, 5);
    accentG.fillStyle(PALETTE.rock, 1);
    accentG.fillCircle(40, -78, 16);
    accentG.fillStyle(PALETTE.rockLit, 0.5);
    accentG.fillCircle(36, -82, 7);
    // Crystal belt buckle
    crystalShard(accentG, 0, -18, 14, 18, palette.accent, 0.95);
  } else if (shape === "slime") {
    // Squishy dome with translucent layers
    g.fillStyle(palette.shade, 0.55);
    g.fillEllipse(0, -18, 108, 42);
    g.fillStyle(palette.body, 0.88);
    g.slice(0, -22, 50, Math.PI, 0, false);
    g.fillPath();
    g.fillRect(-50, -24, 100, 28);
    g.fillStyle(palette.body, 0.5);
    g.fillEllipse(0, -48, 78, 46);
    // Inner gel
    g.fillStyle(palette.accent, 0.35);
    g.fillEllipse(-4, -36, 36, 28);
    // Specular
    g.fillStyle(0xffffff, 0.4);
    g.fillEllipse(-16, -52, 22, 14);
    g.fillStyle(0xffffff, 0.2);
    g.fillEllipse(18, -40, 10, 8);
    // Drips
    g.fillStyle(palette.body, 0.75);
    g.fillEllipse(-28, -6, 12, 16);
    g.fillEllipse(22, -4, 10, 14);
    // Floating crystal core
    crystalShard(accentG, 0, -28, 18, 26, palette.accent, 0.9);
  } else {
    // Broad mole — heavy shoulders, snout
    g.fillStyle(palette.shade, 1);
    g.fillEllipse(0, -32, 92, 74);
    g.fillStyle(palette.body, 1);
    g.fillEllipse(0, -40, 80, 66);
    g.fillStyle(0xffffff, 0.1);
    g.fillEllipse(-10, -52, 30, 20);
    // Snout
    g.fillStyle(palette.accent, 1);
    g.fillEllipse(0, -28, 40, 26);
    g.fillStyle(palette.shade, 1);
    g.fillCircle(-6, -30, 4);
    g.fillCircle(6, -30, 4);
    // Claws
    roundedRect(g, -44, -14, 28, 14, 7, palette.shade);
    roundedRect(g, 16, -14, 28, 14, 7, palette.shade);
    g.fillStyle(PALETTE.bone, 1);
    g.fillTriangle(-40, -12, -36, 4, -30, -12);
    g.fillTriangle(-28, -12, -24, 4, -18, -12);
    g.fillTriangle(20, -12, 24, 4, 30, -12);
    g.fillTriangle(32, -12, 36, 4, 42, -12);
    // Hard hat crystal
    accentG.fillStyle(PALETTE.gold, 1);
    accentG.fillEllipse(0, -78, 44, 18);
    accentG.fillStyle(PALETTE.bronzeDark, 1);
    accentG.fillRect(-20, -74, 40, 6);
    crystalShard(accentG, 0, -82, 16, 22, PALETTE.crystal, 1);
  }

  body.add(g);
  container.add(body);
  accent.add(accentG);
  container.add(accent);

  const face = scene.add.container(0, 0);
  const faceG = scene.add.graphics();
  const eyeY = shape === "slime" ? -36 : shape === "mole" ? -54 : -52;
  const eyeSpread = shape === "slime" ? 16 : 15;
  // White sclera
  faceG.fillStyle(0xffffff, 1);
  faceG.fillCircle(-eyeSpread, eyeY, shape === "slime" ? 13 : 12);
  faceG.fillCircle(eyeSpread, eyeY, shape === "slime" ? 13 : 12);
  // Pupils offset for life
  faceG.fillStyle(PALETTE.deep, 1);
  faceG.fillCircle(-eyeSpread + 2, eyeY + 2, 5.5);
  faceG.fillCircle(eyeSpread + 3, eyeY + 2, 5.5);
  faceG.fillStyle(0xffffff, 0.7);
  faceG.fillCircle(-eyeSpread, eyeY, 2);
  faceG.fillCircle(eyeSpread + 1, eyeY, 2);
  // Brows (not slime)
  if (shape !== "slime") {
    faceG.fillStyle(palette.shade, 1);
    faceG.fillRoundedRect(-eyeSpread - 12, eyeY - 18, 24, 6, 3);
    faceG.fillRoundedRect(eyeSpread - 12, eyeY - 18, 24, 6, 3);
  }
  // Little mouth
  faceG.fillStyle(palette.shade, 0.9);
  if (shape === "goblin") {
    faceG.fillEllipse(0, eyeY + 22, 18, 8);
    faceG.fillStyle(0xffd0a0, 0.5);
    faceG.fillTriangle(-4, eyeY + 18, 0, eyeY + 28, 4, eyeY + 18);
  } else if (shape === "slime") {
    faceG.fillEllipse(0, eyeY + 20, 16, 6);
  }
  face.add(faceG);
  container.add(face);

  return { container, body, face, shadow, accent };
}

// ---------------------------------------------------------------------------
// Layered backdrop — far / mid / play / fore
// ---------------------------------------------------------------------------

export interface BackdropLayers {
  container: Container;
  far: Container;
  mid: Container;
  play: Container;
  fore: Container;
  atmosphere: Graphics;
  particles: { x: number; y: number; r: number; speed: number; phase: number }[];
  particleGfx: Graphics;
}

function paintSkyVault(g: Graphics): void {
  g.fillStyle(PALETTE.void, 1);
  g.fillRect(0, 0, VIEW_W, VIEW_H);
  // Deep cave gradient bands
  g.fillStyle(PALETTE.deep, 1);
  g.fillEllipse(VIEW_W / 2, 160, 1400, 620);
  g.fillStyle(PALETTE.cave, 1);
  g.fillEllipse(VIEW_W / 2, 200, 1100, 480);
  g.fillStyle(PALETTE.caveLit, 0.85);
  g.fillEllipse(VIEW_W / 2, 240, 820, 360);
  // Distant crystal haze
  g.fillStyle(PALETTE.amethyst, 0.08);
  g.fillEllipse(320, 180, 280, 160);
  g.fillStyle(PALETTE.crystal, 0.06);
  g.fillEllipse(920, 160, 320, 180);
}

function paintDistantCrystals(g: Graphics): void {
  const seeds = [
    [80, 300, 22, 70],
    [160, 280, 16, 50],
    [240, 310, 28, 90],
    [400, 270, 18, 55],
    [520, 295, 24, 80],
    [700, 265, 20, 65],
    [860, 300, 30, 95],
    [980, 275, 17, 52],
    [1100, 305, 26, 85],
    [1200, 285, 15, 48],
  ] as const;
  for (const [x, y, w, h] of seeds) {
    crystalShard(g, x, y, w, h, PALETTE.amethystDeep, 0.35);
    crystalShard(g, x + 6, y - 10, w * 0.6, h * 0.7, PALETTE.amethyst, 0.25);
  }
}

function paintCaveMouth(g: Graphics): void {
  // Overhanging roof stalactites
  for (let i = 0; i < 18; i++) {
    const x = 30 + i * 72;
    const h = 40 + (i % 5) * 22;
    const w = 18 + (i % 3) * 8;
    g.fillStyle(PALETTE.deep, 1);
    g.beginPath();
    g.moveTo(x - w / 2, 0);
    g.lineTo(x + w / 2, 0);
    g.lineTo(x + w * 0.15, h);
    g.lineTo(x - w * 0.15, h * 0.85);
    g.closePath();
    g.fillPath();
    g.fillStyle(PALETTE.cave, 0.7);
    g.beginPath();
    g.moveTo(x - w * 0.2, 0);
    g.lineTo(x + w * 0.1, 0);
    g.lineTo(x, h * 0.7);
    g.closePath();
    g.fillPath();
  }
}

function paintGround(g: Graphics): void {
  // Floor mass
  g.fillStyle(PALETTE.rock, 1);
  g.fillRoundedRect(-50, GROUND_LINE, VIEW_W + 100, 400, 40);
  // Lit edge
  g.fillStyle(PALETTE.rockMid, 1);
  g.fillRoundedRect(-50, GROUND_LINE, VIEW_W + 100, 28, 14);
  g.fillStyle(PALETTE.rockHighlight, 0.45);
  g.fillRoundedRect(-50, GROUND_LINE, VIEW_W + 100, 10, 6);
  // Stone grain bands
  for (let i = 0; i < 8; i++) {
    g.fillStyle(PALETTE.deep, 0.12 + (i % 3) * 0.03);
    g.fillEllipse(80 + i * 160, GROUND_LINE + 60 + (i % 2) * 40, 140, 28);
  }
  // Scatter pebbles
  for (let i = 0; i < 20; i++) {
    const x = 40 + i * 62 + (i % 3) * 8;
    const y = GROUND_LINE + 36 + (i % 4) * 18;
    g.fillStyle(i % 2 === 0 ? PALETTE.rockMid : PALETTE.rockLit, 0.7);
    g.fillEllipse(x, y, 14 + (i % 3) * 6, 8 + (i % 2) * 3);
  }
}

function paintMineGate(mid: Graphics, play: Graphics, fore: Graphics): void {
  // Arch gate on the right — dominant landmark
  const cx = 1080;
  const cy = 250;
  const r = 118;

  // Tunnel void
  mid.fillStyle(PALETTE.void, 1);
  mid.slice(cx, cy, r, Math.PI, 0, false);
  mid.fillPath();
  mid.fillRect(cx - r, cy, r * 2, GROUND_LINE - cy);

  // Depth rings inside tunnel
  mid.fillStyle(PALETTE.deep, 0.7);
  mid.slice(cx, cy, r * 0.72, Math.PI, 0, false);
  mid.fillPath();
  mid.fillStyle(PALETTE.cave, 0.5);
  mid.slice(cx, cy, r * 0.45, Math.PI, 0, false);
  mid.fillPath();
  // Distant glow
  mid.fillStyle(PALETTE.crystal, 0.15);
  mid.fillCircle(cx, cy + 40, 36);

  // Stone arch frame
  mid.lineStyle(28, PALETTE.rock, 1);
  mid.beginPath();
  mid.arc(cx, cy, r + 8, Math.PI, 0, false);
  mid.strokePath();
  mid.lineStyle(12, PALETTE.rockLit, 1);
  mid.beginPath();
  mid.arc(cx, cy, r + 4, Math.PI, 0, false);
  mid.strokePath();
  mid.fillStyle(PALETTE.rockMid, 1);
  mid.fillRect(cx - r - 22, cy - 8, 32, GROUND_LINE - cy + 8);
  mid.fillRect(cx + r - 10, cy - 8, 32, GROUND_LINE - cy + 8);
  // Highlight edges
  mid.fillStyle(PALETTE.rockHighlight, 0.5);
  mid.fillRect(cx - r - 18, cy, 6, GROUND_LINE - cy);
  mid.fillRect(cx + r + 8, cy, 6, GROUND_LINE - cy);

  // Lever post (gameplay landmark)
  play.fillStyle(PALETTE.bronzeDark, 1);
  play.fillRoundedRect(780, GROUND_LINE - 90, 14, 90, 4);
  play.fillStyle(PALETTE.rail, 1);
  play.fillRoundedRect(760, GROUND_LINE - 100, 54, 16, 6);
  play.fillStyle(PALETTE.coral, 1);
  play.fillCircle(768, GROUND_LINE - 92, 10);
  play.fillStyle(PALETTE.gold, 1);
  play.fillCircle(768, GROUND_LINE - 94, 4);

  // Side boulders
  rockBoulder(play, 140, GROUND_LINE - 10, 90, 50, PALETTE.rockMid, PALETTE.rock, PALETTE.rockHighlight);
  rockBoulder(play, 230, GROUND_LINE - 6, 60, 34, PALETTE.rock, PALETTE.deep, PALETTE.rockLit);
  rockBoulder(play, 640, GROUND_LINE - 8, 70, 38, PALETTE.rockMid, PALETTE.rock, PALETTE.rockLit);

  numberCarve(play, 200, 200, "4");
  numberCarve(play, 500, 170, "8");

  lanternPost(play, 190, 130);
  lanternPost(play, 560, 118);
  lanternPost(play, 900, 125);

  // Foreground arch lip
  fore.fillStyle(PALETTE.deep, 0.55);
  fore.fillTriangle(0, 0, 160, 0, 0, 280);
  fore.fillTriangle(VIEW_W, 0, VIEW_W - 180, 0, VIEW_W, 300);
  fore.fillStyle(PALETTE.shadow, 0.35);
  fore.fillEllipse(100, GROUND_LINE + 40, 200, 50);
  fore.fillEllipse(1180, GROUND_LINE + 50, 220, 55);
  // Hanging vine-like crystal strands
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 28;
    crystalShard(fore, x, 90 + i * 12, 10, 40 + i * 8, PALETTE.amethyst, 0.45);
  }
}

function paintBrokenTrack(mid: Graphics, play: Graphics, fore: Graphics): void {
  const railY = GROUND_LINE + 22;

  // Rails with gap
  mid.fillStyle(PALETTE.railDark, 1);
  mid.fillRect(0, railY, 460, 10);
  mid.fillRect(0, railY + 22, 460, 10);
  mid.fillRect(820, railY, 480, 10);
  mid.fillRect(820, railY + 22, 480, 10);
  mid.fillStyle(PALETTE.rail, 1);
  mid.fillRect(0, railY, 460, 4);
  mid.fillRect(820, railY, 480, 4);

  // Ties
  for (let i = 0; i < 18; i++) {
    const x = i * 74;
    if (x > 430 && x < 840) continue;
    mid.fillStyle(PALETTE.rockLit, 1);
    mid.fillRoundedRect(x, railY - 4, 42, 40, 5);
    mid.fillStyle(PALETTE.bronzeDark, 0.5);
    mid.fillRect(x + 4, railY + 2, 34, 3);
  }

  // Broken planks in the gap (objective zone)
  play.fillStyle(PALETTE.rock, 0.5);
  play.fillRoundedRect(500, railY + 4, 50, 14, 4);
  play.fillRoundedRect(720, railY + 8, 60, 12, 4);
  // Gem flood pool under gap
  play.fillStyle(PALETTE.crystalDeep, 0.35);
  play.fillEllipse(640, railY + 70, 380, 70);
  play.fillStyle(PALETTE.crystal, 0.2);
  play.fillEllipse(640, railY + 62, 260, 40);
  for (let i = 0; i < 9; i++) {
    crystalShard(
      play,
      500 + i * 36,
      railY + 48 + (i % 3) * 8,
      12 + (i % 2) * 4,
      22 + (i % 3) * 6,
      i % 2 === 0 ? PALETTE.crystal : PALETTE.amethyst,
      0.7,
    );
  }

  // Cart wreck left
  play.fillStyle(PALETTE.bronzeDark, 1);
  play.fillRoundedRect(160, GROUND_LINE - 48, 90, 48, 8);
  play.fillStyle(PALETTE.rail, 1);
  play.fillRoundedRect(165, GROUND_LINE - 54, 80, 14, 5);
  play.fillStyle(PALETTE.deep, 1);
  play.fillCircle(180, GROUND_LINE - 2, 14);
  play.fillCircle(230, GROUND_LINE - 2, 14);
  play.fillStyle(PALETTE.rockLit, 1);
  play.fillCircle(180, GROUND_LINE - 2, 7);
  play.fillCircle(230, GROUND_LINE - 2, 7);
  crystalShard(play, 205, GROUND_LINE - 60, 16, 28, PALETTE.crystal, 0.9);

  rockBoulder(play, 1000, GROUND_LINE - 8, 80, 42, PALETTE.rockMid, PALETTE.rock, PALETTE.rockLit);
  rockBoulder(play, 400, GROUND_LINE - 6, 55, 30, PALETTE.rock, PALETTE.deep, PALETTE.rockMid);

  numberCarve(play, 340, 190, "7");

  lanternPost(play, 280, 125);
  lanternPost(play, 1000, 120);

  // Foreground dust / rubble
  fore.fillStyle(PALETTE.shadow, 0.4);
  fore.fillEllipse(200, GROUND_LINE + 55, 240, 48);
  fore.fillEllipse(1050, GROUND_LINE + 48, 200, 42);
  rockBoulder(fore, 60, GROUND_LINE + 30, 100, 55, PALETTE.rock, PALETTE.deep, PALETTE.rockMid);
  rockBoulder(fore, 1220, GROUND_LINE + 25, 90, 50, PALETTE.rockMid, PALETTE.rock, PALETTE.rockLit);
}

function paintDrippingTunnel(mid: Graphics, play: Graphics, fore: Graphics): void {
  // Concentric tunnel rings
  for (let i = 0; i < 6; i++) {
    mid.lineStyle(14 - i, PALETTE.rockLit, 0.45 - i * 0.05);
    mid.strokeEllipse(VIEW_W / 2, 210, 820 - i * 110, 420 - i * 55);
  }
  mid.fillStyle(PALETTE.void, 0.55);
  mid.fillEllipse(VIEW_W / 2, 220, 280, 160);

  // Ceiling drips (static gem drops)
  for (let i = 0; i < 12; i++) {
    const x = 90 + i * 100;
    const y = 70 + (i % 4) * 28;
    play.fillStyle(PALETTE.crystal, 0.75);
    play.fillCircle(x, y, 5 + (i % 3));
    play.fillStyle(PALETTE.crystalGlow, 0.35);
    play.fillCircle(x, y, 12);
    play.fillStyle(PALETTE.crystal, 0.4);
    play.fillRect(x - 1, y, 2, 18 + (i % 5) * 6);
  }

  // Pool floor reflections
  play.fillStyle(PALETTE.crystalDeep, 0.25);
  play.fillEllipse(VIEW_W / 2, GROUND_LINE + 50, 700, 80);
  play.fillStyle(PALETTE.amethyst, 0.12);
  play.fillEllipse(VIEW_W / 2, GROUND_LINE + 45, 400, 40);

  // Support beams
  for (const x of [220, 640, 1060]) {
    play.fillStyle(PALETTE.bronzeDark, 1);
    play.fillRect(x - 8, 40, 16, GROUND_LINE - 40);
    play.fillStyle(PALETTE.rail, 0.6);
    play.fillRect(x - 6, 40, 4, GROUND_LINE - 40);
    play.fillStyle(PALETTE.bronzeDark, 1);
    play.fillRoundedRect(x - 40, 80, 80, 14, 4);
  }

  rockBoulder(play, 120, GROUND_LINE - 6, 70, 36, PALETTE.rockMid, PALETTE.rock, PALETTE.rockLit);
  rockBoulder(play, 1160, GROUND_LINE - 8, 75, 40, PALETTE.rock, PALETTE.deep, PALETTE.rockMid);

  numberCarve(play, 400, 200, "8");
  numberCarve(play, 860, 180, "4");

  lanternPost(play, 400, 115);
  lanternPost(play, 880, 110);

  // Foreground hanging crystals (blur-ish larger, dimmer)
  for (let i = 0; i < 6; i++) {
    crystalShard(
      fore,
      30 + i * 40,
      60 + (i % 3) * 20,
      14,
      50 + i * 6,
      PALETTE.amethyst,
      0.4,
    );
    crystalShard(
      fore,
      VIEW_W - 40 - i * 36,
      50 + (i % 2) * 24,
      12,
      44 + i * 5,
      PALETTE.crystal,
      0.35,
    );
  }
  fore.fillStyle(PALETTE.shadow, 0.45);
  fore.fillEllipse(80, GROUND_LINE + 60, 180, 50);
  fore.fillEllipse(1200, GROUND_LINE + 55, 170, 48);
}

export function buildBackdrop(scene: Scene, backdrop: string): BackdropLayers {
  const container = scene.add.container(0, 0);
  const far = scene.add.container(0, 0);
  const mid = scene.add.container(0, 0);
  const play = scene.add.container(0, 0);
  const fore = scene.add.container(0, 0);

  const farG = scene.add.graphics();
  const midG = scene.add.graphics();
  const playG = scene.add.graphics();
  const foreG = scene.add.graphics();
  const atmosphere = scene.add.graphics();
  const particleGfx = scene.add.graphics();

  paintSkyVault(farG);
  paintDistantCrystals(farG);
  paintCaveMouth(farG);
  paintGround(midG);

  if (backdrop === "mine-gate") paintMineGate(midG, playG, foreG);
  else if (backdrop === "broken-track") paintBrokenTrack(midG, playG, foreG);
  else paintDrippingTunnel(midG, playG, foreG);

  // Room color grade / vignette
  atmosphere.fillStyle(PALETTE.void, 0.35);
  atmosphere.fillRect(0, 0, VIEW_W, 50);
  atmosphere.fillStyle(PALETTE.void, 0.45);
  atmosphere.fillRect(0, VIEW_H - 80, VIEW_W, 80);
  // Side vignette
  atmosphere.fillStyle(PALETTE.void, 0.25);
  atmosphere.fillTriangle(0, 0, 100, 0, 0, VIEW_H);
  atmosphere.fillTriangle(VIEW_W, 0, VIEW_W - 100, 0, VIEW_W, VIEW_H);
  // Warm lantern wash (center-low)
  atmosphere.fillStyle(PALETTE.lantern, 0.04);
  atmosphere.fillEllipse(VIEW_W / 2, GROUND_LINE - 40, 900, 280);
  // Cool crystal wash upper
  atmosphere.fillStyle(PALETTE.crystal, 0.03);
  atmosphere.fillEllipse(VIEW_W / 2, 140, 1000, 200);

  far.add(farG);
  mid.add(midG);
  play.add(playG);
  fore.add(foreG);

  // Floating dust / mote data for ambient animation
  const particles: BackdropLayers["particles"] = [];
  for (let i = 0; i < 28; i++) {
    particles.push({
      x: 40 + Math.random() * (VIEW_W - 80),
      y: 40 + Math.random() * (GROUND_LINE - 60),
      r: 1.2 + Math.random() * 2.4,
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    });
  }

  container.add([far, mid, play, particleGfx, atmosphere, fore]);
  // Foreground should sit above actors — reparent order handled by RoomScene depths

  return {
    container,
    far,
    mid,
    play,
    fore,
    atmosphere,
    particles,
    particleGfx,
  };
}

export function drawAmbientParticles(
  gfx: Graphics,
  particles: BackdropLayers["particles"],
  t: number,
  reduced: boolean,
): void {
  gfx.clear();
  if (reduced) return;
  for (const p of particles) {
    const y = p.y + Math.sin(t * p.speed + p.phase) * 10;
    const x = p.x + Math.cos(t * p.speed * 0.6 + p.phase) * 6;
    const a = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(t * p.speed * 1.4 + p.phase));
    gfx.fillStyle(PALETTE.dust, a);
    gfx.fillCircle(x, y, p.r);
    if (p.r > 2.2) {
      gfx.fillStyle(PALETTE.crystalGlow, a * 0.35);
      gfx.fillCircle(x, y, p.r * 2.2);
    }
  }
}
