import Phaser from "phaser";
import type { GameBus, SceneCommand } from "../bridge/events";
import { ENEMIES } from "../content/mathMines";
import type { EnemyState } from "../types";
import { createHero } from "./hero";
import { BUS_KEY, REDUCED_MOTION_KEY } from "./keys";
import {
  buildBackdrop,
  buildEnemy,
  drawAmbientParticles,
  GROUND_LINE,
  HEAD_Y,
  PALETTE,
  type BackdropLayers,
  type EnemyParts,
  type HeroParts,
} from "./art";

const HERO_X = 300;
const GROUND_Y = 382;
const ENEMY_SLOTS = [900, 1070, 740];
const OBJECTIVE_X = 635;

// Depth stack — actors sit between play and fore layers
const Z = {
  far: 0,
  mid: 10,
  play: 20,
  actors: 30,
  bars: 40,
  particles: 50,
  atmosphere: 55,
  fore: 60,
  fx: 70,
};

interface EnemyView {
  key: string;
  slotX: number;
  parts: EnemyParts;
  bar: Phaser.GameObjects.Graphics;
  maxResolve: number;
}

export class RoomScene extends Phaser.Scene {
  private bus!: GameBus;
  private reducedMotion = false;
  private layers: BackdropLayers | null = null;
  private hero: HeroParts | null = null;
  private enemies: EnemyView[] = [];
  private objectiveFill: Phaser.GameObjects.Graphics | null = null;
  private detach: (() => void) | null = null;
  private idleTweens = new Set<Phaser.Tweens.Tween>();
  private transientFx = new Set<Phaser.GameObjects.GameObject>();
  private ambientT = 0;
  private parallaxBound = false;

  constructor() {
    super("room");
  }

  create(): void {
    this.bus = this.game.registry.get(BUS_KEY) as GameBus;
    this.reducedMotion = Boolean(this.game.registry.get(REDUCED_MOTION_KEY));
    this.detach = this.bus.onCommand((command) => this.handle(command));
    this.events.once("shutdown", () => this.detach?.());
    this.bus.emit({ type: "SCENE_READY" });
  }

  update(_time: number, delta: number): void {
    if (!this.layers) return;
    this.ambientT += delta * 0.001;
    drawAmbientParticles(
      this.layers.particleGfx,
      this.layers.particles,
      this.ambientT,
      this.reducedMotion,
    );

    // Soft lantern pulse on atmosphere is free; parallax on pointer is subtle
    if (!this.reducedMotion && this.parallaxBound) {
      const ptr = this.input.activePointer;
      const nx = Phaser.Math.Clamp((ptr.x - 640) / 640, -1, 1);
      const ny = Phaser.Math.Clamp((ptr.y - 360) / 360, -1, 1);
      this.layers.far.setPosition(nx * -6, ny * -3);
      this.layers.mid.setPosition(nx * -12, ny * -5);
      this.layers.play.setPosition(nx * -18, ny * -7);
      this.layers.fore.setPosition(nx * -28, ny * -10);
    }
  }

  private clearTransientFx(): void {
    for (const fx of this.transientFx) fx.destroy();
    this.transientFx.clear();
  }

  private settle(enemies: EnemyState[], objective: number): void {
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.idleTweens.clear();
    this.clearTransientFx();
    this.cameras.main.resetFX();

    if (this.hero) {
      this.hero.container.setPosition(HERO_X, GROUND_Y);
      this.hero.container.setAngle(0);
      this.hero.container.setAlpha(1);
      this.hero.container.setScale(1);
      this.hero.weapon.setAngle(0);
      this.hero.shield.setScale(1);
      this.hero.shield.setAngle(0);
      this.hero.head.setY(HEAD_Y);
      this.hero.shadow.setScale(1);
      this.hero.shadow.setAlpha(0.38);
    }

    if (this.layers && !this.reducedMotion) {
      this.layers.far.setPosition(0, 0);
      this.layers.mid.setPosition(0, 0);
      this.layers.play.setPosition(0, 0);
      this.layers.fore.setPosition(0, 0);
    }

    for (const enemy of enemies) {
      const view = this.enemies.find((entry) => entry.key === enemy.key);
      if (!view) continue;
      view.parts.container.setPosition(view.slotX, GROUND_Y);
      view.parts.container.setAngle(0);
      view.parts.container.setScale(1.15);
      view.parts.container.setAlpha(enemy.alive ? 1 : 0);
      view.parts.body.setPosition(0, 0);
      view.parts.face.setPosition(0, 0);
      view.parts.shadow.setScale(1);
      view.bar.setAlpha(enemy.alive ? 1 : 0);
      this.drawBar(view, enemy.resolve);
    }

    this.updateObjective(objective);
    this.idleLoop();
  }

  private motion(ms: number): number {
    return this.reducedMotion ? 1 : ms;
  }

  private handle(command: SceneCommand): void {
    try {
      switch (command.type) {
        case "SET_REDUCED_MOTION":
          this.reducedMotion = command.on;
          break;
        case "LOAD_ROOM":
          this.loadRoom(command);
          break;
        case "PLAY_INTRO":
          this.playIntro();
          break;
        case "PLAY_PLAYER_MOVE":
          this.playPlayerMove(command);
          break;
        case "SYNC_ENEMIES":
          this.syncEnemies(command.enemies);
          break;
        case "SETTLE":
          this.settle(command.enemies, command.objective);
          break;
        case "PLAY_ENEMY_TURN":
          this.playEnemyTurn(command.hit, command.hazard);
          break;
        case "UPDATE_OBJECTIVE":
          this.updateObjective(command.progress);
          break;
        case "ROOM_CLEARED":
          this.playRoomCleared();
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "scene failure";
      console.error(`[dungeon-dash] scene error on ${command.type}`, error);
      this.bus.emit({ type: "SCENE_ERROR", message });
    }
  }

  private loadRoom(command: Extract<SceneCommand, { type: "LOAD_ROOM" }>): void {
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.idleTweens.clear();
    this.transientFx.clear();
    this.children.removeAll(true);
    this.enemies = [];
    this.objectiveFill = null;
    this.parallaxBound = false;
    this.ambientT = 0;

    this.layers = buildBackdrop(this, command.room.backdrop);
    // Unpack layers onto the scene display list so per-layer depth works
    // (actors sit between play and foreground for real occlusion).
    const layerRoot = this.layers.container;
    const layerKids = [...layerRoot.list] as Phaser.GameObjects.GameObject[];
    for (const child of layerKids) {
      layerRoot.remove(child, false);
      this.add.existing(child);
    }
    layerRoot.destroy(false);

    this.layers.far.setDepth(Z.far);
    this.layers.mid.setDepth(Z.mid);
    this.layers.play.setDepth(Z.play);
    this.layers.particleGfx.setDepth(Z.particles);
    this.layers.atmosphere.setDepth(Z.atmosphere);
    this.layers.fore.setDepth(Z.fore);

    if (command.room.type === "trap") {
      this.objectiveFill = this.add.graphics().setDepth(Z.play + 1);
      this.updateObjective(0);
    }

    this.hero = createHero(this);
    this.hero.container.setDepth(Z.actors);
    this.hero.container.setPosition(HERO_X - 320, GROUND_Y);

    command.enemies.forEach((enemy, index) => {
      const spec = ENEMIES[enemy.specId];
      const parts = buildEnemy(this, spec.shape, {
        body: Phaser.Display.Color.HexStringToColor(spec.palette.body).color,
        shade: Phaser.Display.Color.HexStringToColor(spec.palette.shade).color,
        accent: Phaser.Display.Color.HexStringToColor(spec.palette.accent).color,
      });
      const x = ENEMY_SLOTS[index] ?? 900 + index * 150;
      parts.container.setDepth(Z.actors);
      parts.container.setPosition(x, GROUND_Y);
      parts.container.setScale(1.15);
      parts.container.setAlpha(0);
      const bar = this.add.graphics().setDepth(Z.bars);
      bar.setAlpha(0);
      this.enemies.push({
        key: enemy.key,
        slotX: x,
        parts,
        bar,
        maxResolve: enemy.maxResolve,
      });
      this.drawBar(this.enemies[index], enemy.resolve);
    });

    this.parallaxBound = !this.reducedMotion;
    this.bus.emit({ type: "ROOM_READY", roomId: command.room.id });
  }

  private drawBar(view: EnemyView, resolve: number): void {
    const { x } = view.parts.container;
    const ratio = Math.max(0, resolve / view.maxResolve);
    view.bar.clear();
    if (ratio <= 0) return;
    const by = GROUND_Y - 168;
    // Frame
    view.bar.fillStyle(PALETTE.void, 0.75);
    view.bar.fillRoundedRect(x - 54, by, 108, 16, 8);
    view.bar.lineStyle(1.5, PALETTE.rockHighlight, 0.5);
    view.bar.strokeRoundedRect(x - 54, by, 108, 16, 8);
    // Fill
    const color = ratio > 0.35 ? PALETTE.crystal : PALETTE.lantern;
    view.bar.fillStyle(color, 1);
    view.bar.fillRoundedRect(x - 50, by + 3, 100 * ratio, 10, 5);
    // Shine
    view.bar.fillStyle(0xffffff, 0.25);
    view.bar.fillRoundedRect(x - 48, by + 4, 100 * ratio * 0.55, 3, 2);
  }

  private playIntro(): void {
    if (!this.hero) return;
    this.time.removeAllEvents();

    // Hero run-in with squash land
    this.tweens.add({
      targets: this.hero.container,
      x: HERO_X,
      duration: this.motion(720),
      ease: "Cubic.easeOut",
    });
    this.tweens.add({
      targets: this.hero.container,
      scaleY: { from: 0.92, to: 1 },
      scaleX: { from: 1.06, to: 1 },
      duration: this.motion(280),
      delay: this.motion(500),
      ease: "Back.easeOut",
    });

    this.enemies.forEach((view, index) => {
      const delay = this.motion(260 + index * 140);
      this.tweens.add({
        targets: [view.parts.container, view.bar],
        alpha: 1,
        duration: this.motion(380),
        delay,
      });
      this.tweens.add({
        targets: view.parts.container,
        y: { from: GROUND_Y - 80, to: GROUND_Y },
        duration: this.motion(480),
        delay,
        ease: "Bounce.easeOut",
      });
      // Land dust
      this.time.delayedCall(delay + this.motion(360), () => {
        this.burst(view.slotX, GROUND_Y - 8, PALETTE.dust, 6, 0.6);
      });
    });

    this.idleLoop();

    this.time.delayedCall(this.motion(1100), () =>
      this.bus.emit({ type: "INTRO_COMPLETE" }),
    );
  }

  private idleLoop(): void {
    if (this.reducedMotion || !this.hero) return;

    // Hero breathing + head bob
    this.idleTweens.add(
      this.tweens.add({
        targets: this.hero.body,
        scaleY: 1.02,
        scaleX: 0.99,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      }),
    );
    this.idleTweens.add(
      this.tweens.add({
        targets: this.hero.head,
        y: HEAD_Y - 4,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      }),
    );
    this.idleTweens.add(
      this.tweens.add({
        targets: this.hero.shadow,
        scaleX: 1.05,
        alpha: 0.32,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      }),
    );

    this.enemies.forEach((view, index) => {
      // Squishy bob
      this.idleTweens.add(
        this.tweens.add({
          targets: view.parts.body,
          y: -7 - index * 1.5,
          scaleY: 1.04,
          scaleX: 0.97,
          duration: 850 + index * 140,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        }),
      );
      // Eye glance
      this.idleTweens.add(
        this.tweens.add({
          targets: view.parts.face,
          x: { from: -2, to: 3 },
          duration: 2200 + index * 200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
          delay: index * 300,
        }),
      );
      this.idleTweens.add(
        this.tweens.add({
          targets: view.parts.shadow,
          scaleX: 1.08,
          alpha: 0.34,
          duration: 850 + index * 140,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        }),
      );
    });
  }

  private burst(
    x: number,
    y: number,
    color: number,
    count: number,
    power: number,
  ): void {
    if (this.reducedMotion) {
      this.flash(x, y, color, power * 0.5);
      return;
    }
    for (let i = 0; i < count; i++) {
      const angle = (-Math.PI * 0.75) + (Math.PI * 0.5 * i) / Math.max(1, count - 1);
      const dist = 28 + power * 50 + Math.random() * 20;
      const size = 3 + Math.random() * 5 * power;
      const speck = this.add.circle(x, y, size, color, 0.9).setDepth(Z.fx);
      this.transientFx.add(speck);
      this.tweens.add({
        targets: speck,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 20,
        alpha: 0,
        scale: 0.2,
        duration: this.motion(320 + Math.random() * 180),
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.transientFx.delete(speck);
          speck.destroy();
        },
      });
    }
  }

  private flash(x: number, y: number, color: number, scale: number): void {
    const ring = this.add.circle(x, y, 18, color, 0.75).setDepth(Z.fx);
    this.transientFx.add(ring);
    this.tweens.add({
      targets: ring,
      scale: 1 + scale * 3.2,
      alpha: 0,
      duration: this.motion(400),
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.transientFx.delete(ring);
        ring.destroy();
      },
    });
    // Soft outer glow
    const glow = this.add.circle(x, y, 28, color, 0.25).setDepth(Z.fx);
    this.transientFx.add(glow);
    this.tweens.add({
      targets: glow,
      scale: 1 + scale * 4,
      alpha: 0,
      duration: this.motion(520),
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.transientFx.delete(glow);
        glow.destroy();
      },
    });
  }

  private hitPause(ms: number): void {
    if (this.reducedMotion) return;
    this.tweens.pauseAll();
    this.time.delayedCall(ms, () => this.tweens.resumeAll());
  }

  private screenShake(intensity: number, duration: number): void {
    if (this.reducedMotion) return;
    this.cameras.main.shake(duration, intensity);
  }

  private playPlayerMove(
    command: Extract<SceneCommand, { type: "PLAY_PLAYER_MOVE" }>,
  ): void {
    if (!this.hero) {
      this.bus.emit({ type: "MOVE_ANIMATION_COMPLETE", actionId: command.actionId });
      return;
    }

    this.time.removeAllEvents();

    const power = Math.max(0.2, command.effectiveness);
    const alive = this.enemies.filter((v) => v.parts.container.alpha > 0.05);
    const target = alive[0] ?? this.enemies[0];
    const targetX =
      this.enemies.length === 0
        ? OBJECTIVE_X
        : (target?.parts.container.x ?? ENEMY_SLOTS[0]);
    const targetY = GROUND_Y - 70;

    // Anticipation crouch
    this.tweens.add({
      targets: this.hero.container,
      scaleY: 0.92,
      scaleX: 1.06,
      duration: this.motion(90),
      yoyo: true,
    });

    if (command.actionId === "attack") {
      this.tweens.add({
        targets: this.hero.container,
        x: HERO_X + 100 * power,
        duration: this.motion(160),
        yoyo: true,
        ease: "Quad.easeOut",
      });
      this.tweens.add({
        targets: this.hero.weapon,
        angle: { from: -20, to: 42 },
        duration: this.motion(200),
        delay: this.motion(50),
        yoyo: true,
        ease: "Back.easeIn",
      });
      this.time.delayedCall(this.motion(200), () => {
        this.hitPause(55);
        this.flash(targetX - 30, targetY, PALETTE.gold, power);
        this.burst(targetX - 20, targetY, PALETTE.goldBright, 8, power);
        this.burst(targetX - 20, targetY, PALETTE.crystal, 4, power * 0.6);
        this.screenShake(0.003 + power * 0.004, 100);
        this.recoilEnemy(target, power);
      });
    }

    if (command.actionId === "shield") {
      this.tweens.add({
        targets: this.hero.shield,
        scale: { from: 1, to: 1 + 0.4 * power },
        angle: { from: 0, to: -14 },
        duration: this.motion(220),
        yoyo: true,
        ease: "Back.easeOut",
      });
      this.time.delayedCall(this.motion(100), () => {
        this.flash(HERO_X - 36, GROUND_Y - 100, PALETTE.crystal, power);
        this.burst(HERO_X - 36, GROUND_Y - 100, PALETTE.crystalGlow, 6, power * 0.7);
      });
    }

    if (command.actionId === "surge") {
      // Wind-up
      this.tweens.add({
        targets: this.hero.weapon,
        angle: { from: 0, to: -120 },
        duration: this.motion(240),
        yoyo: true,
        ease: "Cubic.easeInOut",
      });
      this.tweens.add({
        targets: this.hero.container,
        scale: { from: 1, to: 1.08 },
        duration: this.motion(240),
        yoyo: true,
      });
      this.enemies.forEach((view, index) => {
        this.time.delayedCall(this.motion(200 + index * 80), () => {
          this.hitPause(40);
          this.flash(view.parts.container.x, targetY, PALETTE.amethyst, power * 1.3);
          this.burst(view.parts.container.x, targetY, PALETTE.amethyst, 10, power);
          this.burst(view.parts.container.x, targetY, PALETTE.crystal, 5, power);
          this.recoilEnemy(view, power * 1.2);
        });
      });
      this.screenShake(0.006 + power * 0.005, 160);
    }

    if (command.assisted) {
      this.time.delayedCall(this.motion(420), () => {
        this.flash(targetX, targetY, PALETTE.lantern, 0.9);
        this.burst(targetX, targetY, PALETTE.lanternCore, 7, 0.8);
      });
    }

    // Correct-answer energy: brighter trail when power is high
    if (power >= 0.85) {
      this.time.delayedCall(this.motion(80), () => {
        this.burst(HERO_X + 40, GROUND_Y - 100, PALETTE.mint, 5, 0.5);
      });
    }

    this.time.delayedCall(this.motion(780), () =>
      this.bus.emit({ type: "MOVE_ANIMATION_COMPLETE", actionId: command.actionId }),
    );
  }

  private recoilEnemy(view: EnemyView | undefined, power: number): void {
    if (!view || view.parts.container.alpha < 0.05) return;
    this.tweens.add({
      targets: view.parts.container,
      x: view.slotX + 18 * power,
      angle: 8 * power,
      duration: this.motion(90),
      yoyo: true,
      ease: "Quad.easeOut",
    });
    // White flash via alpha pulse on face
    this.tweens.add({
      targets: view.parts.face,
      alpha: 0.35,
      duration: this.motion(50),
      yoyo: true,
      repeat: 1,
    });
  }

  private syncEnemies(enemies: EnemyState[]): void {
    enemies.forEach((enemy) => {
      const view = this.enemies.find((entry) => entry.key === enemy.key);
      if (!view) return;
      this.drawBar(view, enemy.resolve);

      if (!enemy.alive && view.parts.container.alpha > 0) {
        // Defeat: squash → spin → confetti → fade
        this.tweens.add({
          targets: view.parts.container,
          scaleX: 1.35,
          scaleY: 0.55,
          duration: this.motion(120),
          ease: "Quad.easeOut",
          onComplete: () => {
            this.burst(view.slotX, GROUND_Y - 40, PALETTE.crystal, 10, 0.9);
            this.burst(view.slotX, GROUND_Y - 40, PALETTE.gold, 6, 0.7);
            this.tweens.add({
              targets: view.parts.container,
              alpha: 0,
              angle: 28,
              y: GROUND_Y + 24,
              scaleX: 0.4,
              scaleY: 0.4,
              duration: this.motion(360),
              ease: "Back.easeIn",
            });
          },
        });
        view.bar.clear();
      } else if (enemy.alive) {
        this.tweens.add({
          targets: view.parts.body,
          x: "+=12",
          duration: this.motion(80),
          yoyo: true,
          repeat: 1,
        });
      }
    });
  }

  private playEnemyTurn(hit: boolean, hazard: boolean): void {
    this.time.removeAllEvents();
    const attacker = this.enemies.find((view) => view.parts.container.alpha > 0.05);

    if (attacker && !hazard) {
      // Telegraph: lean back + flash eyes
      this.tweens.add({
        targets: attacker.parts.container,
        scaleX: 1.2,
        scaleY: 0.9,
        angle: -6,
        duration: this.motion(160),
        yoyo: false,
        ease: "Quad.easeOut",
      });
      this.flash(attacker.slotX, GROUND_Y - 90, PALETTE.coral, 0.35);

      this.time.delayedCall(this.motion(180), () => {
        this.tweens.add({
          targets: attacker.parts.container,
          x: attacker.slotX - 130,
          scaleX: 1.15,
          scaleY: 1.15,
          angle: 4,
          duration: this.motion(160),
          yoyo: true,
          ease: "Quad.easeIn",
        });
      });
    }

    if (hazard && !hit) {
      this.time.delayedCall(this.motion(100), () => {
        this.burst(640, GROUND_LINE + 30, PALETTE.crystal, 5, 0.4);
      });
    }

    if (hit && this.hero) {
      this.time.delayedCall(this.motion(320), () => {
        this.flash(HERO_X, GROUND_Y - 90, PALETTE.coral, 0.65);
        this.burst(HERO_X, GROUND_Y - 80, PALETTE.coral, 6, 0.5);
        this.screenShake(0.007, 140);
        this.tweens.add({
          targets: this.hero!.container,
          x: HERO_X - 40,
          angle: -8,
          duration: this.motion(120),
          yoyo: true,
        });
      });
    } else if (this.hero) {
      this.time.delayedCall(this.motion(300), () => {
        this.flash(HERO_X - 36, GROUND_Y - 100, PALETTE.crystal, 0.55);
        this.burst(HERO_X - 36, GROUND_Y - 100, PALETTE.mint, 4, 0.4);
        // Guard pose settle
        this.tweens.add({
          targets: this.hero!.shield,
          scale: 1.2,
          duration: this.motion(140),
          yoyo: true,
        });
      });
    }

    this.time.delayedCall(this.motion(720), () =>
      this.bus.emit({ type: "ENEMY_TURN_COMPLETE" }),
    );
  }

  private updateObjective(progress: number): void {
    if (!this.objectiveFill) return;
    this.objectiveFill.clear();
    const width = 380 * Math.max(0, Math.min(1, progress));
    // Track bed
    this.objectiveFill.fillStyle(PALETTE.void, 0.55);
    this.objectiveFill.fillRoundedRect(440, GROUND_LINE + 16, 400, 32, 8);
    this.objectiveFill.lineStyle(2, PALETTE.rail, 0.5);
    this.objectiveFill.strokeRoundedRect(440, GROUND_LINE + 16, 400, 32, 8);
    if (width <= 0) return;
    this.objectiveFill.fillStyle(PALETTE.crystalDeep, 1);
    this.objectiveFill.fillRoundedRect(450, GROUND_LINE + 22, width, 20, 6);
    this.objectiveFill.fillStyle(PALETTE.crystal, 1);
    this.objectiveFill.fillRoundedRect(450, GROUND_LINE + 22, width, 10, 5);
    this.objectiveFill.fillStyle(0xffffff, 0.3);
    this.objectiveFill.fillRoundedRect(452, GROUND_LINE + 24, width * 0.5, 4, 2);
  }

  private playRoomCleared(): void {
    if (!this.hero) return;
    this.tweens.add({
      targets: this.hero.weapon,
      angle: { from: 0, to: -80 },
      duration: this.motion(320),
      yoyo: true,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: this.hero.container,
      y: GROUND_Y - 16,
      duration: this.motion(280),
      yoyo: true,
      ease: "Sine.easeOut",
    });
    this.flash(HERO_X, GROUND_Y - 110, PALETTE.gold, 1.3);
    this.burst(HERO_X, GROUND_Y - 100, PALETTE.goldBright, 12, 1);
    this.burst(HERO_X, GROUND_Y - 100, PALETTE.crystal, 8, 0.8);
    this.screenShake(0.004, 120);
  }
}
