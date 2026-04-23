"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// -----------------------------------------------------------------------------
// Canvas & world constants
// -----------------------------------------------------------------------------

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

// Y-coordinate of the top edge of the ground (players stand on this line).
const GROUND_Y = 340;

// Colour palette (hex ints for Phaser graphics).
const COLOR_SKY_TOP = 0x0b0b12;
const COLOR_SKY_BOTTOM = 0x1a1a2e;
const COLOR_MOON = 0xfef3c7;
const COLOR_FAR_MOUNTAIN = 0x1f1f2e;
const COLOR_NEAR_TREE = 0x18181b;
const COLOR_GROUND_TILE = 0xfb7185; // rose dots on the ground line
const COLOR_GROUND_LINE = 0x27272a; // subtle ground line itself

const COLOR_WOLF_BODY = 0xd4d4d8; // zinc-300
const COLOR_WOLF_OUTLINE = 0x09090b;
const COLOR_WOLF_EYE = 0xfde047;

const COLOR_ROCK = 0x52525b; // zinc-600
const COLOR_ROCK_DARK = 0x3f3f46;
const COLOR_PILLAR = 0xa3a3a3; // zinc-400
const COLOR_PILLAR_DARK = 0x71717a;
const COLOR_CROW = 0x18181b;
const COLOR_PIT = 0x09090b;

const COLOR_SHIELD = 0x22d3ee;
const COLOR_DUST = 0xffffff;

// New item colours.
const COLOR_ITEM_SLOW = 0xa3e635; // lime-400
const COLOR_ITEM_2X = 0xfb7185; // rose-400
const COLOR_ITEM_MEGA = 0xfbbf24; // amber-400

// New obstacle colours.
const COLOR_FIRE_CORE = 0xfb923c; // orange-400
const COLOR_FIRE_GLOW = 0xfde68a; // yellow-200
const COLOR_METEOR_BODY = 0x78716c; // stone-500
const COLOR_METEOR_CORE = 0xea580c; // orange-600
const COLOR_METEOR_SHADOW = 0x18181b; // zinc-900
const COLOR_BOULDER = 0x52525b; // zinc-600
const COLOR_BOULDER_DARK = 0x27272a; // zinc-800

// -----------------------------------------------------------------------------
// Player (wolf)
// -----------------------------------------------------------------------------

const WOLF_WIDTH = 44;
const WOLF_HEIGHT = 32;
// Wolf stands on ground; body center sits half its height above ground line.
const WOLF_X = 140;

// Physics body (slightly smaller than sprite for forgiving collisions).
const WOLF_HIT_W = 32;
const WOLF_HIT_H = 24;

const GRAVITY_Y = 1800;

const JUMP_IMPULSE_TIER: Record<1 | 2 | 3, number> = {
  1: -620,
  2: -540,
  3: -440,
};

// Mega-jump one-shot impulse override.
const MEGA_JUMP_IMPULSE = -900;

// -----------------------------------------------------------------------------
// Scrolling / difficulty
// -----------------------------------------------------------------------------

const BASE_SCROLL_SPEED = 320; // px/s
const MAX_SCROLL_SPEED = 600; // px/s
const RAMP_START_S = 30;
const RAMP_END_S = 90;

const DIST_SCALE = 40; // distanceMeters += speed * dt / DIST_SCALE

// -----------------------------------------------------------------------------
// Obstacle spawning
// -----------------------------------------------------------------------------

const SPAWN_INTERVAL_START = 1100;
const SPAWN_INTERVAL_JITTER_START = 200;
const SPAWN_INTERVAL_LATE = 600;
const SPAWN_INTERVAL_JITTER_LATE = 150;
const SPAWN_INTERVAL_RAMP_END_S = 60;

type ObstacleKind =
  | "rock"
  | "pillar"
  | "crow"
  | "pit"
  | "fire"
  | "meteor"
  | "boulder";

// Rock sprite size & collision data
const ROCK_W = 32;
const ROCK_H = 28;
const PILLAR_W = 32;
const PILLAR_H = 72;
const CROW_W = 40;
const CROW_H = 28;

// Crow flies at a floating altitude above the ground.
const CROW_BASE_Y = GROUND_Y - 130;
const CROW_BOUNCE_AMP = 10;
const CROW_BOUNCE_PERIOD_MS = 1000;

// Pit is a ground gap. Width varies.
const PIT_WIDTH_MIN = 110;
const PIT_WIDTH_MAX = 180;

// Fire column — oscillates between up (dangerous) and down (safe) states.
const FIRE_W = 28;
const FIRE_MAX_H = 72;
// Sub-phase durations (ms). Total cycle = 3100 ms.
const FIRE_UP_MS = 1200;
const FIRE_DOWN_TRANSITION_MS = 300;
const FIRE_DOWN_MS = 1300;
const FIRE_UP_TRANSITION_MS = 300;
const FIRE_CYCLE_MS =
  FIRE_UP_MS + FIRE_DOWN_TRANSITION_MS + FIRE_DOWN_MS + FIRE_UP_TRANSITION_MS;

// Meteor stages
const METEOR_BODY_SIZE = 36;
const METEOR_DEBRIS_W = 28;
const METEOR_DEBRIS_H = 20;
const METEOR_SHADOW_R = 24;
const METEOR_SHADOW_MS = 1000;
const METEOR_DEBRIS_MS = 800;
const METEOR_FALL_SPEED = 800; // px/s
const METEOR_SPAWN_AHEAD_MIN = 200;
const METEOR_SPAWN_AHEAD_MAX = 350;

// Boulder
const BOULDER_D = 56;

// -----------------------------------------------------------------------------
// Items (shield + slow + 2x + mega jump)
// -----------------------------------------------------------------------------

const SHIELD_SIZE = 28;
const ITEM_SIZE = 28;
// Note: first-spawn delay kept the same so early game doesn't flood with items.
const ITEM_FIRST_DELAY_MS = 20_000;
// New interval range for the unified item pool.
const ITEM_INTERVAL_MIN_MS = 18_000;
const ITEM_INTERVAL_MAX_MS = 28_000;
// 아이템은 스프라이트 없이 매 250m마다 자동으로 랜덤 발동.
// 거리 기반 스폰 주기(m). 첫 스폰도 이 값부터.
const ITEM_SPAWN_INTERVAL_M = 250;

// Effect durations (ms)
const SHIELD_DURATION_MS = 10000;
const SLOW_DURATION_MS = 4000;
const TWOX_DURATION_MS = 5000;
// Slow scales speed by this factor while active.
const SLOW_FACTOR = 0.5;

type ItemKind = "shield" | "slow" | "twox" | "mega";

type ItemWeight = { kind: ItemKind; weight: number };
const ITEM_POOL: ItemWeight[] = [
  { kind: "shield", weight: 30 },
  { kind: "slow", weight: 25 },
  { kind: "twox", weight: 25 },
  { kind: "mega", weight: 20 },
];

// -----------------------------------------------------------------------------
// Misc
// -----------------------------------------------------------------------------

const BEST_KEY = "wolf-runner-best";

// After a game-over we ignore player input briefly so the *same* tap that
// caused the death doesn't immediately restart the run.
const GAMEOVER_INPUT_LOCK_MS = 300;

type GameStatus = "ready" | "playing" | "gameover";

export type WolfRunnerGameProps = {
  onGameOver?: (distanceMeters: number) => void;
};

export default function WolfRunnerGame({ onGameOver }: WolfRunnerGameProps = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onGameOverRef = useRef<typeof onGameOver>(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let destroyed = false;

    import("phaser").then((PhaserModule) => {
      if (destroyed) return;
      const Phaser = PhaserModule.default ?? PhaserModule;

      // Extended physics image types we'll attach runtime metadata to.
      type ObstacleSprite = Phaser.GameObjects.Image & {
        __kind?: ObstacleKind;
        __passed?: boolean;
        // Crow oscillation start time and base Y
        __crowT0?: number;
        __crowBaseY?: number;
        // Pit specifics
        __pitLeft?: number;
        __pitRight?: number;
        // Fire oscillation metadata
        __fireT0?: number;
        __firePhaseOffset?: number;
        __fireCurrentH?: number;
        __fireHazard?: boolean;
        // Meteor state machine
        __meteorStage?: "shadow" | "falling" | "debris";
        __meteorShadow?: Phaser.GameObjects.Arc;
        __meteorBody?: Phaser.GameObjects.Arc;
        __meteorBodyCore?: Phaser.GameObjects.Arc;
        __meteorDebris?: Phaser.GameObjects.Image;
        __meteorBodyY?: number;
        __meteorTimers?: Phaser.Time.TimerEvent[];
        // Boulder rotation
        __boulderRot?: number;
      };

      type ShieldSprite = Phaser.GameObjects.Image & {
        __t0?: number;
        __kind?: ItemKind;
      };

      class MainScene extends Phaser.Scene {
        // --- Actors -------------------------------------------------------
        private wolf!: Phaser.GameObjects.Image;
        // Running animation frame counter — swapped between wolf-run-a and wolf-run-b.
        private wolfFrame = 0;
        private wolfFrameTimer = 0;

        // Horizontal position is fixed; vertical is simulated manually so we can
        // keep full control over multi-jumps and pit falls without fighting
        // arcade physics' world-bounds behaviour.
        private wolfY = GROUND_Y - WOLF_HEIGHT / 2;
        private wolfVY = 0;
        private onGround = true;
        private jumpsUsed = 0;
        // While over a pit the wolf should fall off the screen and die on
        // reaching the bottom.
        private overPit = false;

        // --- Obstacles / shield / background -----------------------------
        private obstacles: ObstacleSprite[] = [];

        // Parallax layers (tile-sprites).
        private skyLayer!: Phaser.GameObjects.Graphics; // fixed gradient
        private moon!: Phaser.GameObjects.Graphics; // fixed
        private farMountains!: Phaser.GameObjects.TileSprite;
        private nearTrees!: Phaser.GameObjects.TileSprite;
        private groundTiles!: Phaser.GameObjects.TileSprite;
        private groundLine!: Phaser.GameObjects.Graphics;

        // Scanline overlay for retro flavour.
        private scanline!: Phaser.GameObjects.Graphics;

        // --- Input -------------------------------------------------------
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private keyW!: Phaser.Input.Keyboard.Key;
        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;

        // --- HUD / overlay -----------------------------------------------
        private distText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private shieldBadge!: Phaser.GameObjects.Text;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        // --- Timers / state ---------------------------------------------
        private spawnTimer?: Phaser.Time.TimerEvent;
        // 다음 아이템이 등장할 누적 거리(m). 거리 기반 스폰 임계값.
        private nextItemSpawnAt = ITEM_SPAWN_INTERVAL_M;

        private status: GameStatus = "ready";
        private elapsed = 0; // seconds since the current run started
        private distanceMeters = 0;
        private best = 0;
        private lastObstacleKind: ObstacleKind | null = null;

        // Shield: 10초간 무적 상태. 시간 만료 또는 피격 흡수 시 해제.
        private shieldEquipped = false;
        private shieldExpireAt = 0;
        private shieldTimer?: Phaser.Time.TimerEvent;
        private shieldAura?: Phaser.GameObjects.Arc;
        private shieldAuraTween?: Phaser.Tweens.Tween;

        // Timed item effects.
        private slowActive = false;
        private slowExpireAt = 0;
        private slowTimer?: Phaser.Time.TimerEvent;
        private twoxActive = false;
        private twoxExpireAt = 0;
        private twoxTimer?: Phaser.Time.TimerEvent;
        private megaJumpArmed = false;

        // Input lock after game-over so the same input doesn't auto-restart.
        private gameOverAt = 0;

        // Pit we're currently flying over (used to check at what point
        // ground support resumes / or when we fall in).
        private activePit: ObstacleSprite | null = null;

        constructor() {
          super("WolfRunner");
        }

        // -----------------------------------------------------------------
        // Texture generation
        // -----------------------------------------------------------------
        preload() {
          if (!this.textures.exists("wolf-run-a")) {
            this.generateWolfTexture("wolf-run-a", 0);
          }
          if (!this.textures.exists("wolf-run-b")) {
            this.generateWolfTexture("wolf-run-b", 1);
          }
          if (!this.textures.exists("rock-tex")) {
            this.generateRockTexture("rock-tex");
          }
          if (!this.textures.exists("pillar-tex")) {
            this.generatePillarTexture("pillar-tex");
          }
          if (!this.textures.exists("crow-tex")) {
            this.generateCrowTexture("crow-tex");
          }
          if (!this.textures.exists("shield-tex")) {
            this.generateShieldTexture("shield-tex");
          }
          if (!this.textures.exists("item-tex-shield")) {
            this.generateItemTexture("item-tex-shield", COLOR_SHIELD, "S");
          }
          if (!this.textures.exists("item-tex-slow")) {
            this.generateItemTexture("item-tex-slow", COLOR_ITEM_SLOW, "L");
          }
          if (!this.textures.exists("item-tex-twox")) {
            this.generateItemTexture("item-tex-twox", COLOR_ITEM_2X, "x2");
          }
          if (!this.textures.exists("item-tex-mega")) {
            this.generateItemTexture("item-tex-mega", COLOR_ITEM_MEGA, "^");
          }
          if (!this.textures.exists("far-mountains-tex")) {
            this.generateFarMountainsTexture("far-mountains-tex");
          }
          if (!this.textures.exists("near-trees-tex")) {
            this.generateNearTreesTexture("near-trees-tex");
          }
          if (!this.textures.exists("ground-tiles-tex")) {
            this.generateGroundTilesTexture("ground-tiles-tex");
          }
          if (!this.textures.exists("dust-tex")) {
            this.generateDustTexture("dust-tex");
          }
          if (!this.textures.exists("fire-tex")) {
            this.generateFireTexture("fire-tex");
          }
          if (!this.textures.exists("boulder-tex")) {
            this.generateBoulderTexture("boulder-tex");
          }
          if (!this.textures.exists("meteor-debris-tex")) {
            this.generateMeteorDebrisTexture("meteor-debris-tex");
          }
        }

        /**
         * Procedural wolf silhouette. `frame === 0` shows front-legs-forward,
         * `frame === 1` shows rear-legs-forward, giving a simple 2-frame run.
         */
        private generateWolfTexture(key: string, frame: 0 | 1) {
          const w = WOLF_WIDTH;
          const h = WOLF_HEIGHT;
          const g = this.add.graphics({ x: 0, y: 0 });

          // --- Body (flat ellipse) -----------------------------------
          g.fillStyle(COLOR_WOLF_BODY, 1);
          g.fillEllipse(w * 0.48, h * 0.55, w * 0.7, h * 0.5);
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokeEllipse(w * 0.48, h * 0.55, w * 0.7, h * 0.5);

          // --- Tail (angled up and back) -----------------------------
          g.fillStyle(COLOR_WOLF_BODY, 1);
          g.beginPath();
          g.moveTo(w * 0.18, h * 0.5);
          g.lineTo(w * 0.04, h * 0.25);
          g.lineTo(w * 0.14, h * 0.22);
          g.lineTo(w * 0.26, h * 0.5);
          g.closePath();
          g.fillPath();
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokePath();

          // --- Head (triangular snout pointing right) ----------------
          g.fillStyle(COLOR_WOLF_BODY, 1);
          g.beginPath();
          g.moveTo(w * 0.72, h * 0.35); // upper cheek
          g.lineTo(w * 0.98, h * 0.5); // nose
          g.lineTo(w * 0.72, h * 0.62); // lower jaw
          g.closePath();
          g.fillPath();
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokePath();

          // --- Ears ---------------------------------------------------
          g.fillStyle(COLOR_WOLF_BODY, 1);
          g.beginPath();
          g.moveTo(w * 0.7, h * 0.3);
          g.lineTo(w * 0.66, h * 0.1);
          g.lineTo(w * 0.8, h * 0.28);
          g.closePath();
          g.fillPath();
          g.beginPath();
          g.moveTo(w * 0.78, h * 0.3);
          g.lineTo(w * 0.76, h * 0.12);
          g.lineTo(w * 0.88, h * 0.32);
          g.closePath();
          g.fillPath();
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokePath();

          // --- Eye (yellow dot) --------------------------------------
          g.fillStyle(COLOR_WOLF_EYE, 1);
          g.fillCircle(w * 0.82, h * 0.42, 1.6);

          // --- Nose dot -----------------------------------------------
          g.fillStyle(COLOR_WOLF_OUTLINE, 1);
          g.fillCircle(w * 0.96, h * 0.5, 1.4);

          // --- Legs (4, alternating front/back pair) -----------------
          // Visible sprite height so we can draw legs below the body.
          const legTop = h * 0.72;
          const legH = h * 0.28 - 2;
          const legW = 4;

          // Two "front" legs around x ≈ 0.62 and 0.72, two "back" legs
          // around x ≈ 0.3 and 0.4. We offset one pair vertically per
          // frame to simulate the gallop.
          const frontOffset = frame === 0 ? 0 : 5;
          const backOffset = frame === 0 ? 5 : 0;

          g.fillStyle(COLOR_WOLF_BODY, 1);
          // front legs
          g.fillRect(w * 0.62, legTop + frontOffset * 0.4, legW, legH - frontOffset);
          g.fillRect(w * 0.72, legTop + frontOffset * 0.15, legW, legH - frontOffset * 0.6);
          // back legs
          g.fillRect(w * 0.3, legTop + backOffset * 0.4, legW, legH - backOffset);
          g.fillRect(w * 0.4, legTop + backOffset * 0.15, legW, legH - backOffset * 0.6);

          // Leg outline strokes
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokeRect(w * 0.62, legTop + frontOffset * 0.4, legW, legH - frontOffset);
          g.strokeRect(
            w * 0.72,
            legTop + frontOffset * 0.15,
            legW,
            legH - frontOffset * 0.6,
          );
          g.strokeRect(w * 0.3, legTop + backOffset * 0.4, legW, legH - backOffset);
          g.strokeRect(
            w * 0.4,
            legTop + backOffset * 0.15,
            legW,
            legH - backOffset * 0.6,
          );

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generateRockTexture(key: string) {
          const w = ROCK_W;
          const h = ROCK_H;
          const g = this.add.graphics({ x: 0, y: 0 });
          // body
          g.fillStyle(COLOR_ROCK, 1);
          g.beginPath();
          g.moveTo(0, h);
          g.lineTo(w * 0.1, h * 0.4);
          g.lineTo(w * 0.35, h * 0.15);
          g.lineTo(w * 0.6, h * 0.05);
          g.lineTo(w * 0.85, h * 0.3);
          g.lineTo(w, h);
          g.closePath();
          g.fillPath();

          // darker base strip
          g.fillStyle(COLOR_ROCK_DARK, 1);
          g.fillRect(0, h - 4, w, 4);

          // outline
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.beginPath();
          g.moveTo(0, h);
          g.lineTo(w * 0.1, h * 0.4);
          g.lineTo(w * 0.35, h * 0.15);
          g.lineTo(w * 0.6, h * 0.05);
          g.lineTo(w * 0.85, h * 0.3);
          g.lineTo(w, h);
          g.strokePath();

          // tiny speckles
          g.fillStyle(0xffffff, 0.15);
          g.fillRect(w * 0.3, h * 0.45, 2, 2);
          g.fillRect(w * 0.65, h * 0.3, 2, 2);
          g.fillRect(w * 0.5, h * 0.65, 2, 2);

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generatePillarTexture(key: string) {
          const w = PILLAR_W;
          const h = PILLAR_H;
          const g = this.add.graphics({ x: 0, y: 0 });
          // base
          g.fillStyle(COLOR_PILLAR, 1);
          g.fillRect(0, 0, w, h);
          // darker shade on right half
          g.fillStyle(COLOR_PILLAR_DARK, 1);
          g.fillRect(w * 0.55, 0, w * 0.45, h);
          // horizontal bands
          g.fillStyle(COLOR_WOLF_OUTLINE, 1);
          g.fillRect(0, h * 0.15, w, 2);
          g.fillRect(0, h * 0.45, w, 2);
          g.fillRect(0, h * 0.75, w, 2);
          // outline
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokeRect(0, 0, w, h);

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generateCrowTexture(key: string) {
          const w = CROW_W;
          const h = CROW_H;
          const g = this.add.graphics({ x: 0, y: 0 });
          // body ellipse
          g.fillStyle(COLOR_CROW, 1);
          g.fillEllipse(w * 0.55, h * 0.55, w * 0.55, h * 0.55);
          // wings
          g.beginPath();
          g.moveTo(w * 0.35, h * 0.5);
          g.lineTo(w * 0.05, h * 0.15);
          g.lineTo(w * 0.25, h * 0.55);
          g.closePath();
          g.fillPath();
          g.beginPath();
          g.moveTo(w * 0.7, h * 0.5);
          g.lineTo(w * 0.95, h * 0.2);
          g.lineTo(w * 0.75, h * 0.6);
          g.closePath();
          g.fillPath();
          // beak
          g.fillStyle(0xfacc15, 1);
          g.beginPath();
          g.moveTo(w * 0.82, h * 0.5);
          g.lineTo(w * 0.98, h * 0.55);
          g.lineTo(w * 0.82, h * 0.6);
          g.closePath();
          g.fillPath();
          // eye
          g.fillStyle(0xffffff, 1);
          g.fillCircle(w * 0.72, h * 0.48, 1.8);
          g.fillStyle(0x000000, 1);
          g.fillCircle(w * 0.74, h * 0.48, 0.9);

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generateShieldTexture(key: string) {
          const s = SHIELD_SIZE;
          const g = this.add.graphics({ x: 0, y: 0 });
          // dark back
          g.fillStyle(0x09090b, 1);
          g.fillCircle(s / 2, s / 2, s / 2);
          // glow halo
          g.fillStyle(COLOR_SHIELD, 0.3);
          g.fillCircle(s / 2, s / 2, s / 2);
          // main shield body
          g.fillStyle(COLOR_SHIELD, 1);
          g.beginPath();
          g.moveTo(s / 2, 3);
          g.lineTo(s - 3, s * 0.3);
          g.lineTo(s - 3, s * 0.6);
          g.lineTo(s / 2, s - 3);
          g.lineTo(3, s * 0.6);
          g.lineTo(3, s * 0.3);
          g.closePath();
          g.fillPath();
          // inner highlight
          g.fillStyle(0xffffff, 0.4);
          g.beginPath();
          g.moveTo(s / 2, 6);
          g.lineTo(s - 6, s * 0.32);
          g.lineTo(s - 6, s * 0.45);
          g.lineTo(s / 2, s * 0.55);
          g.lineTo(6, s * 0.45);
          g.lineTo(6, s * 0.32);
          g.closePath();
          g.fillPath();
          // outline
          g.lineStyle(1, 0x09090b, 1);
          g.strokeCircle(s / 2, s / 2, s / 2);

          g.generateTexture(key, s, s);
          g.destroy();
        }

        /**
         * Generic power-up item texture. We draw a hex-ish shield silhouette
         * tinted `color` and bake the provided glyph label on top via a
         * temporary Text object rendered to the same RenderTexture.
         */
        private generateItemTexture(key: string, color: number, label: string) {
          const s = ITEM_SIZE;
          const g = this.add.graphics({ x: 0, y: 0 });
          // dark back
          g.fillStyle(0x09090b, 1);
          g.fillCircle(s / 2, s / 2, s / 2);
          // glow halo
          g.fillStyle(color, 0.3);
          g.fillCircle(s / 2, s / 2, s / 2);
          // main body (hex shield)
          g.fillStyle(color, 1);
          g.beginPath();
          g.moveTo(s / 2, 3);
          g.lineTo(s - 3, s * 0.3);
          g.lineTo(s - 3, s * 0.6);
          g.lineTo(s / 2, s - 3);
          g.lineTo(3, s * 0.6);
          g.lineTo(3, s * 0.3);
          g.closePath();
          g.fillPath();
          // inner highlight band
          g.fillStyle(0xffffff, 0.35);
          g.beginPath();
          g.moveTo(s / 2, 6);
          g.lineTo(s - 6, s * 0.32);
          g.lineTo(s - 6, s * 0.45);
          g.lineTo(s / 2, s * 0.55);
          g.lineTo(6, s * 0.45);
          g.lineTo(6, s * 0.32);
          g.closePath();
          g.fillPath();
          // outline
          g.lineStyle(1, 0x09090b, 1);
          g.strokeCircle(s / 2, s / 2, s / 2);

          // Bake the graphics + the glyph into a RenderTexture so the texture
          // contains the label. Text size is tuned per-label length.
          const fontSize = label.length > 1 ? 10 : 14;
          const txt = this.add
            .text(s / 2, s / 2, label, {
              fontFamily: "monospace",
              fontSize: `${fontSize}px`,
              color: "#09090b",
              fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);

          const rt = this.add.renderTexture(0, 0, s, s).setVisible(false);
          rt.draw(g, 0, 0);
          rt.draw(txt, s / 2, s / 2);
          rt.saveTexture(key);

          g.destroy();
          txt.destroy();
          rt.destroy();
        }

        private generateFarMountainsTexture(key: string) {
          // 400x120 tile of distant mountain silhouettes.
          const W = 400;
          const H = 120;
          const g = this.add.graphics({ x: 0, y: 0 });
          g.fillStyle(COLOR_FAR_MOUNTAIN, 1);
          // A series of triangular peaks — keep endpoints at y=H so they tile.
          const points: [number, number][] = [
            [0, H],
            [40, 60],
            [80, 85],
            [130, 30],
            [170, 70],
            [220, 40],
            [270, 75],
            [320, 25],
            [360, 65],
            [400, H],
          ];
          g.beginPath();
          g.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i++) {
            g.lineTo(points[i][0], points[i][1]);
          }
          g.closePath();
          g.fillPath();

          // Subtle peak highlight (moonlit ridge).
          g.lineStyle(1, 0x3f3f55, 1);
          g.beginPath();
          g.moveTo(40, 60);
          g.lineTo(130, 30);
          g.moveTo(220, 40);
          g.lineTo(320, 25);
          g.strokePath();

          g.generateTexture(key, W, H);
          g.destroy();
        }

        private generateNearTreesTexture(key: string) {
          // 300x80 tile of silhouetted trees & bushes.
          const W = 300;
          const H = 80;
          const g = this.add.graphics({ x: 0, y: 0 });
          g.fillStyle(COLOR_NEAR_TREE, 1);
          // Baseline block to cover any gaps at the very bottom.
          g.fillRect(0, H - 6, W, 6);
          // Trees (triangles).
          const trees: [number, number, number][] = [
            // x, width, height
            [20, 22, 42],
            [60, 30, 56],
            [110, 18, 34],
            [145, 26, 48],
            [190, 34, 60],
            [245, 22, 40],
            [280, 16, 28],
          ];
          for (const [x, tw, th] of trees) {
            g.beginPath();
            g.moveTo(x, H - 6);
            g.lineTo(x + tw / 2, H - 6 - th);
            g.lineTo(x + tw, H - 6);
            g.closePath();
            g.fillPath();
          }
          // Bushes (small rounded mounds).
          for (const bx of [0, 85, 170, 225, 295]) {
            g.fillCircle(bx, H - 4, 8);
          }

          g.generateTexture(key, W, H);
          g.destroy();
        }

        private generateGroundTilesTexture(key: string) {
          // 80x20 repeating tile — dots + faint line under it.
          const W = 80;
          const H = 20;
          const g = this.add.graphics({ x: 0, y: 0 });
          // transparent background
          // subtle line at top
          g.fillStyle(COLOR_GROUND_LINE, 1);
          g.fillRect(0, 1, W, 1);
          // rose dots
          g.fillStyle(COLOR_GROUND_TILE, 1);
          for (let x = 6; x < W; x += 16) {
            g.fillCircle(x, 6, 1.5);
          }
          // faint ground shading
          g.fillStyle(0x1a1a24, 0.6);
          g.fillRect(0, 4, W, H - 4);
          g.generateTexture(key, W, H);
          g.destroy();
        }

        private generateDustTexture(key: string) {
          const s = 8;
          const g = this.add.graphics({ x: 0, y: 0 });
          g.fillStyle(COLOR_DUST, 0.9);
          g.fillCircle(s / 2, s / 2, s / 2);
          g.generateTexture(key, s, s);
          g.destroy();
        }

        /**
         * Fire column baseline texture — bottom-heavy flame with a softer
         * yellow core and a faint white glow. We draw the texture at the
         * maximum size and scale it vertically down to 0 with setDisplaySize
         * during the cycle.
         */
        private generateFireTexture(key: string) {
          const w = FIRE_W;
          const h = FIRE_MAX_H;
          const g = this.add.graphics({ x: 0, y: 0 });

          // Outer white glow halo (soft).
          g.fillStyle(0xffffff, 0.18);
          g.fillEllipse(w / 2, h * 0.7, w * 1.1, h * 0.9);

          // Outer flame — dark orange base fading to yellow tip.
          const steps = 10;
          for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            // i=0 bottom, i=steps-1 top
            const rr = Math.round(234 + (253 - 234) * t); // 0xea->0xfd
            const gg = Math.round(88 + (230 - 88) * t); // 0x58->0xe6
            const bb = Math.round(12 + (134 - 12) * t); // 0x0c->0x86
            const col = (rr << 16) | (gg << 8) | bb;
            const yTop = h - ((i + 1) * h) / steps;
            const yBot = h - (i * h) / steps;
            // Tapered width toward the top.
            const widthHere = w * (1 - t * 0.35);
            g.fillStyle(col, 0.95);
            g.fillRect(
              (w - widthHere) / 2,
              yTop,
              widthHere,
              yBot - yTop + 0.5,
            );
          }

          // Inner yellow core (thinner band, offset slightly for motion feel).
          g.fillStyle(COLOR_FIRE_GLOW, 0.65);
          g.fillEllipse(w / 2, h * 0.55, w * 0.45, h * 0.7);

          // Bright orange hot center at base.
          g.fillStyle(COLOR_FIRE_CORE, 0.8);
          g.fillEllipse(w / 2, h * 0.85, w * 0.65, h * 0.35);

          // Faint flicker specks.
          g.fillStyle(0xffffff, 0.5);
          g.fillCircle(w * 0.3, h * 0.3, 1.4);
          g.fillCircle(w * 0.65, h * 0.5, 1.2);
          g.fillCircle(w * 0.5, h * 0.15, 1.1);

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generateBoulderTexture(key: string) {
          const d = BOULDER_D;
          const g = this.add.graphics({ x: 0, y: 0 });

          // Dark outer rim.
          g.fillStyle(COLOR_BOULDER_DARK, 1);
          g.fillCircle(d / 2, d / 2, d / 2);
          // Main grey body (slightly inset).
          g.fillStyle(COLOR_BOULDER, 1);
          g.fillCircle(d / 2, d / 2, d / 2 - 2);
          // Shadow on the bottom-right.
          g.fillStyle(COLOR_BOULDER_DARK, 0.55);
          g.fillEllipse(d * 0.62, d * 0.66, d * 0.55, d * 0.45);
          // Highlight on the top-left.
          g.fillStyle(0xffffff, 0.18);
          g.fillEllipse(d * 0.38, d * 0.35, d * 0.35, d * 0.28);

          // Crack lines (darker).
          g.lineStyle(2, COLOR_BOULDER_DARK, 0.9);
          g.beginPath();
          g.moveTo(d * 0.2, d * 0.3);
          g.lineTo(d * 0.45, d * 0.55);
          g.lineTo(d * 0.35, d * 0.75);
          g.strokePath();
          g.beginPath();
          g.moveTo(d * 0.55, d * 0.25);
          g.lineTo(d * 0.68, d * 0.5);
          g.strokePath();
          g.beginPath();
          g.moveTo(d * 0.72, d * 0.6);
          g.lineTo(d * 0.85, d * 0.72);
          g.strokePath();

          // Outline.
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.strokeCircle(d / 2, d / 2, d / 2 - 1);

          g.generateTexture(key, d, d);
          g.destroy();
        }

        private generateMeteorDebrisTexture(key: string) {
          const w = METEOR_DEBRIS_W;
          const h = METEOR_DEBRIS_H;
          const g = this.add.graphics({ x: 0, y: 0 });

          // Base grey rubble mound.
          g.fillStyle(COLOR_METEOR_BODY, 1);
          g.beginPath();
          g.moveTo(0, h);
          g.lineTo(w * 0.15, h * 0.4);
          g.lineTo(w * 0.4, h * 0.2);
          g.lineTo(w * 0.65, h * 0.35);
          g.lineTo(w * 0.9, h * 0.5);
          g.lineTo(w, h);
          g.closePath();
          g.fillPath();

          // Hot orange core peeking through cracks.
          g.fillStyle(COLOR_METEOR_CORE, 0.85);
          g.fillCircle(w * 0.35, h * 0.6, 3);
          g.fillCircle(w * 0.7, h * 0.7, 2.5);
          g.fillRect(w * 0.45, h * 0.75, 3, 2);

          // Darker base strip.
          g.fillStyle(COLOR_BOULDER_DARK, 1);
          g.fillRect(0, h - 3, w, 3);

          // Outline.
          g.lineStyle(1, COLOR_WOLF_OUTLINE, 1);
          g.beginPath();
          g.moveTo(0, h);
          g.lineTo(w * 0.15, h * 0.4);
          g.lineTo(w * 0.4, h * 0.2);
          g.lineTo(w * 0.65, h * 0.35);
          g.lineTo(w * 0.9, h * 0.5);
          g.lineTo(w, h);
          g.strokePath();

          g.generateTexture(key, w, h);
          g.destroy();
        }

        // -----------------------------------------------------------------
        // Create
        // -----------------------------------------------------------------
        create() {
          this.cameras.main.setBackgroundColor("#0b0b12");

          // ------------------------------------------------------------
          // Background (depth 0..4)
          // ------------------------------------------------------------
          this.skyLayer = this.add.graphics().setDepth(0);
          this.drawSky();

          // Moon (static)
          this.moon = this.add.graphics().setDepth(1);
          this.drawMoon();

          // Far mountains (tile sprite, very slow)
          this.farMountains = this.add
            .tileSprite(
              GAME_WIDTH / 2,
              GROUND_Y - 60,
              GAME_WIDTH,
              120,
              "far-mountains-tex",
            )
            .setDepth(2);

          // Near trees/bushes (medium speed)
          this.nearTrees = this.add
            .tileSprite(
              GAME_WIDTH / 2,
              GROUND_Y - 40,
              GAME_WIDTH,
              80,
              "near-trees-tex",
            )
            .setDepth(3);

          // Ground tiles (full speed)
          this.groundTiles = this.add
            .tileSprite(
              GAME_WIDTH / 2,
              GROUND_Y + 10,
              GAME_WIDTH,
              20,
              "ground-tiles-tex",
            )
            .setDepth(4);

          // Thin ground line — we redraw this per frame so we can erase it
          // over pit regions.
          this.groundLine = this.add.graphics().setDepth(5);

          // ------------------------------------------------------------
          // Player (depth 10)
          // ------------------------------------------------------------
          this.wolf = this.add
            .image(WOLF_X, this.wolfY, "wolf-run-a")
            .setDepth(10)
            .setOrigin(0.5, 0.5);

          // ------------------------------------------------------------
          // HUD (depth 40+)
          // ------------------------------------------------------------
          this.distText = this.add
            .text(20, 14, "DIST 000m", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#e4e4e7",
            })
            .setDepth(40)
            .setShadow(0, 0, "#fb7185", 6, true, true);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH - 20, 14, `BEST ${this.formatDist(this.best)}m`, {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#a1a1aa",
            })
            .setOrigin(1, 0)
            .setDepth(40);

          this.shieldBadge = this.add
            .text(GAME_WIDTH - 20, 42, "", {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#22d3ee",
            })
            .setOrigin(1, 0)
            .setDepth(40);

          // ------------------------------------------------------------
          // Overlay (depth 50)
          // ------------------------------------------------------------
          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "WOLF RUNNER", {
              fontFamily: "monospace",
              fontSize: "40px",
              color: "#d4d4d8",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(50)
            .setShadow(0, 0, "#fde047", 10, true, true);

          this.overlaySub = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, "PRESS SPACE OR TAP TO RUN", {
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#e4e4e7",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(50);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 44, "", {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#a1a1aa",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(50);

          // ------------------------------------------------------------
          // Scanline overlay (depth 60)
          // ------------------------------------------------------------
          this.scanline = this.add.graphics().setDepth(60);
          this.scanline.fillStyle(0xffffff, 0.035);
          for (let y = 0; y < GAME_HEIGHT; y += 3) {
            this.scanline.fillRect(0, y, GAME_WIDTH, 1);
          }

          // ------------------------------------------------------------
          // Input
          // ------------------------------------------------------------
          this.cursors = this.input.keyboard!.createCursorKeys();
          this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
          this.keySpace = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
          );
          this.keyR = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

          this.input.on("pointerdown", this.handlePointerDown, this);

          this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

          this.enterReadyState();
        }

        private drawSky() {
          this.skyLayer.clear();
          // Simple two-stop vertical gradient via horizontal strips.
          const steps = 24;
          const top = Phaser.Display.Color.ValueToColor(COLOR_SKY_TOP);
          const bottom = Phaser.Display.Color.ValueToColor(COLOR_SKY_BOTTOM);
          for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const r = Math.round(top.red + (bottom.red - top.red) * t);
            const g = Math.round(top.green + (bottom.green - top.green) * t);
            const b = Math.round(top.blue + (bottom.blue - top.blue) * t);
            const color = (r << 16) | (g << 8) | b;
            this.skyLayer.fillStyle(color, 1);
            const y = Math.floor((i * GROUND_Y) / steps);
            const yNext = Math.floor(((i + 1) * GROUND_Y) / steps);
            this.skyLayer.fillRect(0, y, GAME_WIDTH, yNext - y);
          }
          // Ground fill below the ground line (dark slate).
          this.skyLayer.fillStyle(0x0a0a14, 1);
          this.skyLayer.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
        }

        private drawMoon() {
          const cx = GAME_WIDTH - 110;
          const cy = 80;
          // glow halo
          this.moon.fillStyle(COLOR_MOON, 0.15);
          this.moon.fillCircle(cx, cy, 42);
          this.moon.fillStyle(COLOR_MOON, 0.25);
          this.moon.fillCircle(cx, cy, 34);
          // body
          this.moon.fillStyle(COLOR_MOON, 0.95);
          this.moon.fillCircle(cx, cy, 26);
          // crater shading
          this.moon.fillStyle(0xeab308, 0.18);
          this.moon.fillCircle(cx + 4, cy - 6, 6);
          this.moon.fillCircle(cx - 8, cy + 4, 4);
          this.moon.fillCircle(cx + 2, cy + 10, 3);
        }

        // -----------------------------------------------------------------
        // State transitions
        // -----------------------------------------------------------------
        private enterReadyState() {
          this.status = "ready";
          this.elapsed = 0;
          this.distanceMeters = 0;
          this.nextItemSpawnAt = ITEM_SPAWN_INTERVAL_M;
          this.wolfY = GROUND_Y - WOLF_HEIGHT / 2;
          this.wolfVY = 0;
          this.onGround = true;
          this.jumpsUsed = 0;
          this.overPit = false;
          this.activePit = null;
          this.lastObstacleKind = null;
          this.wolf.setVisible(true);
          this.wolf.setRotation(0);
          this.wolf.setPosition(WOLF_X, this.wolfY);
          this.wolf.setTexture("wolf-run-a");
          this.clearObstacles();
          this.deactivateShield();
          this.clearEffects();
          this.updateShieldBadge();
          this.updateDistText();
          this.showOverlay(
            "WOLF RUNNER",
            "PRESS SPACE OR TAP TO RUN",
            this.best > 0 ? `BEST ${this.formatDist(this.best)}m` : "",
          );
        }

        private startGame() {
          if (this.status === "playing") return;
          this.status = "playing";
          this.elapsed = 0;
          this.distanceMeters = 0;
          this.nextItemSpawnAt = ITEM_SPAWN_INTERVAL_M;
          this.wolfY = GROUND_Y - WOLF_HEIGHT / 2;
          this.wolfVY = 0;
          this.onGround = true;
          this.jumpsUsed = 0;
          this.overPit = false;
          this.activePit = null;
          this.lastObstacleKind = null;
          this.wolf.setVisible(true);
          this.wolf.setRotation(0);
          this.wolf.setPosition(WOLF_X, this.wolfY);
          this.clearObstacles();
          this.deactivateShield();
          this.clearEffects();
          this.updateShieldBadge();
          this.hideOverlay();
          this.updateDistText();
          this.restartObstacleSpawner();

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
            audio.startWolfBgm();
          }
        }

        private triggerGameOver() {
          if (this.status !== "playing") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;
          this.stopObstacleSpawner();

          this.cameras.main.shake(260, 0.014);
          this.cameras.main.flash(180, 251, 113, 133);

          // Bouncy spin for the wolf as it tumbles.
          this.tweens.add({
            targets: this.wolf,
            angle: -380,
            y: this.wolf.y - 40,
            duration: 420,
            ease: "Cubic.easeOut",
          });
          this.tweens.add({
            targets: this.wolf,
            y: GROUND_Y + 20,
            delay: 400,
            duration: 260,
            ease: "Cubic.easeIn",
          });

          const distInt = Math.round(this.distanceMeters);
          if (distInt > this.best) {
            this.best = distInt;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.formatDist(this.best)}m`);
          }

          // Delay the overlay a touch so the death animation reads.
          this.time.delayedCall(500, () => {
            if (this.status !== "gameover") return;
            this.showOverlay(
              "GAME OVER",
              "PRESS R / SPACE / TAP TO RESTART",
              `DIST ${this.formatDist(distInt)}m   BEST ${this.formatDist(this.best)}m`,
            );
          });

          const audio = getAudioEngine();
          audio?.wolfHit();
          audio?.wolfGameOver();
          audio?.stopWolfBgm();

          try {
            onGameOverRef.current?.(distInt);
          } catch (err) {
            console.error("[wolf-runner] onGameOver callback error", err);
          }
        }

        private restartGame() {
          this.tweens.killTweensOf(this.wolf);
          this.wolf.setRotation(0);
          this.startGame();
        }

        private showOverlay(title: string, sub: string, score: string) {
          this.overlayTitle.setText(title).setVisible(true);
          this.overlaySub.setText(sub).setVisible(true);
          this.overlayScore.setText(score).setVisible(score.length > 0);
        }

        private hideOverlay() {
          this.overlayTitle.setVisible(false);
          this.overlaySub.setVisible(false);
          this.overlayScore.setVisible(false);
        }

        // -----------------------------------------------------------------
        // Input handlers
        // -----------------------------------------------------------------
        private handlePointerDown() {
          if (this.status === "ready") {
            this.startGame();
            return;
          }
          if (this.status === "gameover") {
            if (this.time.now - this.gameOverAt < GAMEOVER_INPUT_LOCK_MS) return;
            this.restartGame();
            return;
          }
          if (this.status === "playing") {
            this.tryJump();
          }
        }

        private tryJump() {
          if (this.status !== "playing") return;
          // On ground counts as the first jump tier; each subsequent jump
          // while airborne increments the tier up to 3.
          if (this.jumpsUsed >= 3) return;
          const tier = (this.jumpsUsed + 1) as 1 | 2 | 3;
          let impulse: number;
          if (this.megaJumpArmed) {
            impulse = MEGA_JUMP_IMPULSE;
            this.megaJumpArmed = false;
            this.updateShieldBadge();
          } else {
            impulse = JUMP_IMPULSE_TIER[tier];
          }
          this.wolfVY = impulse;
          this.jumpsUsed += 1;
          this.onGround = false;

          // Dust puff from the wolf's feet (only visually meaningful on the
          // 1st tier, but we show a small puff on every jump).
          this.spawnJumpDust(tier);

          getAudioEngine()?.wolfJump(tier);
        }

        private spawnJumpDust(tier: 1 | 2 | 3) {
          const count = tier === 1 ? 4 : 2;
          const baseY = tier === 1 ? GROUND_Y - 2 : this.wolfY + WOLF_HEIGHT / 2 - 2;
          for (let i = 0; i < count; i++) {
            const dust = this.add
              .image(
                WOLF_X + Phaser.Math.Between(-10, 10),
                baseY,
                "dust-tex",
              )
              .setDepth(9)
              .setAlpha(0.8)
              .setScale(Phaser.Math.FloatBetween(0.6, 1.1));
            this.tweens.add({
              targets: dust,
              x: dust.x + Phaser.Math.Between(-30, -5),
              y: dust.y - Phaser.Math.Between(4, 14),
              alpha: 0,
              scale: 0.2,
              duration: 360,
              ease: "Cubic.easeOut",
              onComplete: () => dust.destroy(),
            });
          }
        }

        private spawnLandDust() {
          for (let i = 0; i < 3; i++) {
            const dust = this.add
              .image(
                WOLF_X + Phaser.Math.Between(-14, 14),
                GROUND_Y - 2,
                "dust-tex",
              )
              .setDepth(9)
              .setAlpha(0.7)
              .setScale(0.9);
            this.tweens.add({
              targets: dust,
              x: dust.x + Phaser.Math.Between(-20, 20),
              y: dust.y - Phaser.Math.Between(2, 8),
              alpha: 0,
              scale: 0.2,
              duration: 280,
              ease: "Cubic.easeOut",
              onComplete: () => dust.destroy(),
            });
          }
        }

        // -----------------------------------------------------------------
        // Obstacles
        // -----------------------------------------------------------------
        private currentScrollSpeed(): number {
          let base: number;
          if (this.elapsed <= RAMP_START_S) base = BASE_SCROLL_SPEED;
          else if (this.elapsed >= RAMP_END_S) base = MAX_SCROLL_SPEED;
          else {
            const t = (this.elapsed - RAMP_START_S) / (RAMP_END_S - RAMP_START_S);
            base = Phaser.Math.Linear(BASE_SCROLL_SPEED, MAX_SCROLL_SPEED, t);
          }
          return this.slowActive ? base * SLOW_FACTOR : base;
        }

        private currentSpawnDelayMs(): number {
          const t = Phaser.Math.Clamp(this.elapsed / SPAWN_INTERVAL_RAMP_END_S, 0, 1);
          const base = Phaser.Math.Linear(
            SPAWN_INTERVAL_START,
            SPAWN_INTERVAL_LATE,
            t,
          );
          const jitter = Phaser.Math.Linear(
            SPAWN_INTERVAL_JITTER_START,
            SPAWN_INTERVAL_JITTER_LATE,
            t,
          );
          let delay = base + Phaser.Math.Between(-jitter, jitter);
          // 1000m+ 익스트림 구간: 스폰 간격 30% 단축.
          if (this.distanceMeters >= 1000) delay *= 0.7;
          return delay;
        }

        private pickObstacleKind(): ObstacleKind {
          const t = this.elapsed;
          type Entry = { kind: ObstacleKind; weight: number };
          let table: Entry[];
          // 1000m+ 도달 시 익스트림 티어: 위험한 장애물(meteor/boulder/pit) 비중 대폭 상승.
          if (this.distanceMeters >= 1000) {
            table = [
              { kind: "rock", weight: 8 },
              { kind: "pillar", weight: 10 },
              { kind: "crow", weight: 15 },
              { kind: "fire", weight: 20 },
              { kind: "meteor", weight: 20 },
              { kind: "boulder", weight: 17 },
              { kind: "pit", weight: 10 },
            ];
          } else if (t < 20) {
            // Early game — only ground-level rocks + pillars.
            table = [
              { kind: "rock", weight: 70 },
              { kind: "pillar", weight: 30 },
            ];
          } else if (t < 40) {
            // Introduce crows + fire columns.
            table = [
              { kind: "rock", weight: 40 },
              { kind: "pillar", weight: 25 },
              { kind: "crow", weight: 20 },
              { kind: "fire", weight: 15 },
            ];
          } else if (t < 60) {
            // Add meteor + boulder to the rotation.
            table = [
              { kind: "rock", weight: 25 },
              { kind: "pillar", weight: 20 },
              { kind: "crow", weight: 15 },
              { kind: "fire", weight: 15 },
              { kind: "meteor", weight: 15 },
              { kind: "boulder", weight: 10 },
            ];
          } else {
            // Late game — full variety including pits.
            table = [
              { kind: "rock", weight: 15 },
              { kind: "pillar", weight: 15 },
              { kind: "crow", weight: 15 },
              { kind: "fire", weight: 15 },
              { kind: "meteor", weight: 15 },
              { kind: "boulder", weight: 15 },
              { kind: "pit", weight: 10 },
            ];
          }
          // Prevent two pits back-to-back (too punishing).
          if (this.lastObstacleKind === "pit") {
            table = table.filter((e) => e.kind !== "pit");
          }
          // Prevent two meteors back-to-back (shadow previews would overlap
          // and become confusing).
          if (this.lastObstacleKind === "meteor") {
            table = table.filter((e) => e.kind !== "meteor");
          }
          const total = table.reduce((s, e) => s + e.weight, 0);
          let roll = Math.random() * total;
          for (const e of table) {
            roll -= e.weight;
            if (roll <= 0) return e.kind;
          }
          return table[0].kind;
        }

        private restartObstacleSpawner() {
          this.stopObstacleSpawner();
          const schedule = () => {
            if (this.status !== "playing") return;
            this.spawnObstacle();
            const delay = Math.max(300, this.currentSpawnDelayMs());
            this.spawnTimer = this.time.delayedCall(delay, schedule);
          };
          this.spawnTimer = this.time.delayedCall(900, schedule);
        }

        private stopObstacleSpawner() {
          if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = undefined;
          }
        }

        private spawnObstacle() {
          const kind = this.pickObstacleKind();
          this.lastObstacleKind = kind;
          const spawnX = GAME_WIDTH + 60;

          if (kind === "rock") {
            const obs = this.add.image(
              spawnX,
              GROUND_Y - ROCK_H / 2,
              "rock-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setOrigin(0.5, 0.5);
            obs.__kind = "rock";
            this.obstacles.push(obs);
            return;
          }

          if (kind === "pillar") {
            const obs = this.add.image(
              spawnX,
              GROUND_Y - PILLAR_H / 2,
              "pillar-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setOrigin(0.5, 0.5);
            obs.__kind = "pillar";
            this.obstacles.push(obs);
            return;
          }

          if (kind === "crow") {
            const baseY = CROW_BASE_Y + Phaser.Math.Between(-10, 10);
            const obs = this.add.image(
              spawnX,
              baseY,
              "crow-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setOrigin(0.5, 0.5);
            obs.__kind = "crow";
            obs.__crowT0 = this.time.now;
            obs.__crowBaseY = baseY;
            this.obstacles.push(obs);
            return;
          }

          if (kind === "pit") {
            const width = Phaser.Math.Between(PIT_WIDTH_MIN, PIT_WIDTH_MAX);
            // Represent the pit with a single invisible anchor sprite whose
            // __pitLeft/__pitRight define the gap in world coords.
            const obs = this.add.image(
              spawnX + width / 2,
              GROUND_Y + (GAME_HEIGHT - GROUND_Y) / 2,
              "shield-tex", // texture is irrelevant — we hide the sprite
            ) as ObstacleSprite;
            obs.setDepth(6).setAlpha(0);
            obs.__kind = "pit";
            obs.__pitLeft = spawnX;
            obs.__pitRight = spawnX + width;
            this.obstacles.push(obs);
            return;
          }

          if (kind === "fire") {
            // Fire column anchored to the ground — origin bottom so scaling
            // only changes the top edge.
            const obs = this.add.image(
              spawnX,
              GROUND_Y,
              "fire-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setOrigin(0.5, 1);
            obs.__kind = "fire";
            obs.__fireT0 = this.time.now;
            obs.__firePhaseOffset = Phaser.Math.Between(0, FIRE_CYCLE_MS);
            obs.__fireCurrentH = 0;
            obs.__fireHazard = false;
            // Start at 0 display height — will be adjusted each frame.
            obs.setDisplaySize(FIRE_W, 1);
            this.obstacles.push(obs);
            getAudioEngine()?.wolfFireHiss();
            return;
          }

          if (kind === "meteor") {
            // Shadow x is ahead of the wolf — translated into world space
            // relative to the spawn edge. We choose a distance ahead of the
            // wolf; because the shadow also scrolls left at scroll speed,
            // picking a spawnX past the right edge approximates "lands near
            // the wolf in ~1s". We simply anchor the shadow at a near-mid
            // screen target relative to GAME_WIDTH.
            const aheadOfWolf = Phaser.Math.Between(
              METEOR_SPAWN_AHEAD_MIN,
              METEOR_SPAWN_AHEAD_MAX,
            );
            const shadowX = WOLF_X + aheadOfWolf;

            // Carrier object (invisible anchor image, position represents
            // the shadow x). Keeps the existing obstacle array iteration
            // shape consistent.
            const obs = this.add.image(
              shadowX,
              GROUND_Y,
              "shield-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setAlpha(0);
            obs.__kind = "meteor";
            obs.__meteorStage = "shadow";
            obs.__meteorTimers = [];

            // Shadow arc on the ground.
            const shadow = this.add
              .circle(shadowX, GROUND_Y - 2, METEOR_SHADOW_R, COLOR_METEOR_SHADOW, 0.7)
              .setDepth(5);
            obs.__meteorShadow = shadow;
            // Pulsing alpha tween for the warning state.
            this.tweens.add({
              targets: shadow,
              alpha: { from: 0.5, to: 0.9 },
              duration: 250,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });

            // After METEOR_SHADOW_MS begin the falling stage.
            const t1 = this.time.delayedCall(METEOR_SHADOW_MS, () => {
              if (!obs.active) return;
              obs.__meteorStage = "falling";
              // Kill the shadow pulse — keep a static dimmer shadow during fall.
              this.tweens.killTweensOf(shadow);
              shadow.setAlpha(0.6);

              // Spawn the body starting above the screen at the current
              // shadow x (not obs.x which represents shadow x anyway).
              const bodyX = obs.x;
              const body = this.add
                .circle(bodyX, -METEOR_BODY_SIZE, METEOR_BODY_SIZE / 2, COLOR_METEOR_BODY, 1)
                .setDepth(7);
              const core = this.add
                .circle(bodyX, -METEOR_BODY_SIZE, METEOR_BODY_SIZE * 0.35, COLOR_METEOR_CORE, 1)
                .setDepth(8);
              obs.__meteorBody = body;
              obs.__meteorBodyCore = core;
              obs.__meteorBodyY = -METEOR_BODY_SIZE;
            });
            obs.__meteorTimers.push(t1);

            this.obstacles.push(obs);
            return;
          }

          if (kind === "boulder") {
            const obs = this.add.image(
              GAME_WIDTH + 30,
              GROUND_Y - BOULDER_D / 2,
              "boulder-tex",
            ) as ObstacleSprite;
            obs.setDepth(6).setOrigin(0.5, 0.5);
            obs.__kind = "boulder";
            obs.__boulderRot = 0;
            this.obstacles.push(obs);
            getAudioEngine()?.wolfBoulderRumble();
            return;
          }
        }

        /**
         * Step the fire column through its up/down cycle. Updates the
         * display height, hazard flag, and position of the sprite. Fires
         * a small spark visual while the column is high.
         */
        private updateFireObstacle(obs: ObstacleSprite, time: number) {
          const t0 = obs.__fireT0 ?? time;
          const offset = obs.__firePhaseOffset ?? 0;
          const phase = (time - t0 + offset) % FIRE_CYCLE_MS;
          let h: number;
          if (phase < FIRE_UP_MS) {
            // Fully up.
            h = FIRE_MAX_H;
          } else if (phase < FIRE_UP_MS + FIRE_DOWN_TRANSITION_MS) {
            const p = (phase - FIRE_UP_MS) / FIRE_DOWN_TRANSITION_MS;
            h = FIRE_MAX_H * (1 - p);
          } else if (phase < FIRE_UP_MS + FIRE_DOWN_TRANSITION_MS + FIRE_DOWN_MS) {
            h = 0;
          } else {
            const start = FIRE_UP_MS + FIRE_DOWN_TRANSITION_MS + FIRE_DOWN_MS;
            const p = (phase - start) / FIRE_UP_TRANSITION_MS;
            h = FIRE_MAX_H * Phaser.Math.Clamp(p, 0, 1);
          }
          obs.__fireCurrentH = h;
          // Hazard only when > 30% of max height.
          obs.__fireHazard = h >= FIRE_MAX_H * 0.3;
          // Anchor bottom at GROUND_Y (origin is 0.5, 1).
          obs.setPosition(obs.x, GROUND_Y);
          if (h > 0) {
            obs.setVisible(true);
            obs.setDisplaySize(FIRE_W, h);
          } else {
            obs.setVisible(false);
          }
        }

        /**
         * Tick the meteor state machine. Scrolls the shadow/body/debris
         * with the world, advances the falling stage, and triggers the
         * impact + debris handoff when the body reaches the ground.
         */
        private updateMeteorObstacle(
          obs: ObstacleSprite,
          scrollDx: number,
          dt: number,
        ) {
          // Always keep the shadow/body/debris in sync with the carrier x.
          if (obs.__meteorShadow) {
            obs.__meteorShadow.x -= scrollDx;
          }
          if (obs.__meteorStage === "falling") {
            if (
              obs.__meteorBody &&
              obs.__meteorBodyCore &&
              obs.__meteorBodyY !== undefined
            ) {
              obs.__meteorBodyY += METEOR_FALL_SPEED * dt;
              // Body x mirrors carrier x (already scrolled above).
              obs.__meteorBody.x = obs.x;
              obs.__meteorBody.y = obs.__meteorBodyY;
              obs.__meteorBodyCore.x = obs.x;
              obs.__meteorBodyCore.y = obs.__meteorBodyY;
              // Land when the body's bottom touches the ground line.
              if (obs.__meteorBodyY + METEOR_BODY_SIZE / 2 >= GROUND_Y) {
                this.onMeteorImpact(obs);
              }
            }
          } else if (obs.__meteorStage === "debris") {
            if (obs.__meteorDebris) {
              obs.__meteorDebris.x = obs.x;
            }
          }
        }

        /**
         * Transition the meteor from falling → debris. Emits an impact
         * effect, plays the SFX, shakes the camera, and spawns the
         * grounded debris chunk that remains hazardous for a short time.
         */
        private onMeteorImpact(obs: ObstacleSprite) {
          if (obs.__meteorStage !== "falling") return;
          obs.__meteorStage = "debris";

          const impactX = obs.x;
          // Destroy body + shadow immediately.
          if (obs.__meteorBody) {
            obs.__meteorBody.destroy();
            obs.__meteorBody = undefined;
          }
          if (obs.__meteorBodyCore) {
            obs.__meteorBodyCore.destroy();
            obs.__meteorBodyCore = undefined;
          }
          if (obs.__meteorShadow) {
            this.tweens.killTweensOf(obs.__meteorShadow);
            obs.__meteorShadow.destroy();
            obs.__meteorShadow = undefined;
          }

          // Spark particles — 5-8 orange rects flung outward + up.
          const count = Phaser.Math.Between(5, 8);
          for (let i = 0; i < count; i++) {
            const spark = this.add
              .rectangle(
                impactX + Phaser.Math.Between(-8, 8),
                GROUND_Y - 2,
                Phaser.Math.Between(3, 6),
                Phaser.Math.Between(2, 4),
                COLOR_METEOR_CORE,
                1,
              )
              .setDepth(9);
            this.tweens.add({
              targets: spark,
              x: spark.x + Phaser.Math.Between(-50, 50),
              y: spark.y - Phaser.Math.Between(10, 40),
              alpha: 0,
              duration: 420,
              ease: "Cubic.easeOut",
              onComplete: () => spark.destroy(),
            });
          }

          this.cameras.main.shake(100, 0.005);
          getAudioEngine()?.wolfMeteorImpact();

          // Spawn grounded debris at impact x.
          const debris = this.add.image(
            impactX,
            GROUND_Y - METEOR_DEBRIS_H / 2,
            "meteor-debris-tex",
          );
          debris.setDepth(6).setOrigin(0.5, 0.5);
          obs.__meteorDebris = debris;

          // After METEOR_DEBRIS_MS fade out and mark for cleanup.
          const t = this.time.delayedCall(METEOR_DEBRIS_MS, () => {
            if (!obs.active) return;
            if (!obs.__meteorDebris) return;
            this.tweens.add({
              targets: obs.__meteorDebris,
              alpha: 0,
              duration: 200,
              onComplete: () => {
                if (obs.__meteorDebris) {
                  obs.__meteorDebris.destroy();
                  obs.__meteorDebris = undefined;
                }
                // Remove the carrier so the filter/destroy path picks it
                // up on the next frame.
                if (obs.active) {
                  // Move it offscreen so the right-edge filter culls it.
                  obs.x = -9999;
                }
              },
            });
          });
          obs.__meteorTimers?.push(t);
        }

        private destroyObstacle(obs: ObstacleSprite) {
          // Clean up any sub-objects attached to compound obstacles.
          if (obs.__kind === "meteor") {
            if (obs.__meteorTimers) {
              for (const t of obs.__meteorTimers) {
                t.remove(false);
              }
              obs.__meteorTimers = undefined;
            }
            if (obs.__meteorShadow) {
              this.tweens.killTweensOf(obs.__meteorShadow);
              obs.__meteorShadow.destroy();
              obs.__meteorShadow = undefined;
            }
            if (obs.__meteorBody) {
              obs.__meteorBody.destroy();
              obs.__meteorBody = undefined;
            }
            if (obs.__meteorBodyCore) {
              obs.__meteorBodyCore.destroy();
              obs.__meteorBodyCore = undefined;
            }
            if (obs.__meteorDebris) {
              this.tweens.killTweensOf(obs.__meteorDebris);
              obs.__meteorDebris.destroy();
              obs.__meteorDebris = undefined;
            }
          }
          obs.destroy();
        }

        private clearObstacles() {
          for (const obs of this.obstacles) {
            this.destroyObstacle(obs);
          }
          this.obstacles = [];
        }

        // -----------------------------------------------------------------
        // Items — 매 ITEM_SPAWN_INTERVAL_M마다 랜덤 아이템 자동 발동.
        // 스프라이트·수집 과정 없이 즉시 applyItem() 호출.
        // -----------------------------------------------------------------
        private maybeApplyItemByDistance() {
          if (this.status !== "playing") return;
          if (this.distanceMeters < this.nextItemSpawnAt) return;
          const kind = this.pickItemKind();
          if (kind) this.applyItem(kind);
          this.nextItemSpawnAt += ITEM_SPAWN_INTERVAL_M;
        }

        /**
         * Weighted pick from ITEM_POOL. Returns null if every eligible kind
         * would be redundant at this moment (e.g. only `shield` remains but
         * the player already has a shield equipped).
         */
        private pickItemKind(): ItemKind | null {
          // Filter out shield if it's redundant (already equipped).
          const table = ITEM_POOL.filter((entry) => {
            if (entry.kind === "shield" && this.shieldEquipped) return false;
            return true;
          });
          if (table.length === 0) return null;
          const total = table.reduce((sum, e) => sum + e.weight, 0);
          let roll = Math.random() * total;
          for (const e of table) {
            roll -= e.weight;
            if (roll <= 0) return e.kind;
          }
          return table[0].kind;
        }

        private activateShield() {
          this.shieldEquipped = true;
          this.shieldExpireAt = this.time.now + SHIELD_DURATION_MS;
          if (this.shieldTimer) this.shieldTimer.remove(false);
          this.shieldTimer = this.time.delayedCall(SHIELD_DURATION_MS, () =>
            this.deactivateShield(),
          );
          if (!this.shieldAura) {
            this.shieldAura = this.add
              .circle(this.wolf.x, this.wolf.y, 30)
              .setStrokeStyle(2, COLOR_SHIELD, 0.9)
              .setDepth(11);
            this.shieldAuraTween = this.tweens.add({
              targets: this.shieldAura,
              scale: { from: 0.9, to: 1.15 },
              alpha: { from: 0.9, to: 0.45 },
              duration: 500,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          this.updateShieldBadge();
          getAudioEngine()?.wolfPickup();
        }

        private activateSlow() {
          this.slowActive = true;
          this.slowExpireAt = this.time.now + SLOW_DURATION_MS;
          if (this.slowTimer) {
            this.slowTimer.remove(false);
          }
          this.slowTimer = this.time.delayedCall(SLOW_DURATION_MS, () =>
            this.deactivateSlow(),
          );
          getAudioEngine()?.wolfItemSlow();
        }

        private deactivateSlow() {
          this.slowActive = false;
          this.slowTimer = undefined;
        }

        private activateTwox() {
          this.twoxActive = true;
          this.twoxExpireAt = this.time.now + TWOX_DURATION_MS;
          if (this.twoxTimer) {
            this.twoxTimer.remove(false);
          }
          this.twoxTimer = this.time.delayedCall(TWOX_DURATION_MS, () => {
            this.twoxActive = false;
            this.twoxTimer = undefined;
          });
          getAudioEngine()?.wolfItem2x();
        }

        private activateMega() {
          this.megaJumpArmed = true;
          getAudioEngine()?.wolfItemMega();
        }

        private applyItem(kind: ItemKind) {
          switch (kind) {
            case "shield":
              this.activateShield();
              break;
            case "slow":
              this.activateSlow();
              break;
            case "twox":
              this.activateTwox();
              break;
            case "mega":
              this.activateMega();
              break;
          }
          this.updateShieldBadge();
        }

        private clearEffects() {
          this.slowActive = false;
          this.twoxActive = false;
          this.megaJumpArmed = false;
          if (this.slowTimer) {
            this.slowTimer.remove(false);
            this.slowTimer = undefined;
          }
          if (this.twoxTimer) {
            this.twoxTimer.remove(false);
            this.twoxTimer = undefined;
          }
        }

        private deactivateShield() {
          this.shieldEquipped = false;
          if (this.shieldTimer) {
            this.shieldTimer.remove(false);
            this.shieldTimer = undefined;
          }
          if (this.shieldAuraTween) {
            this.shieldAuraTween.stop();
            this.shieldAuraTween = undefined;
          }
          if (this.shieldAura) {
            this.shieldAura.destroy();
            this.shieldAura = undefined;
          }
          this.updateShieldBadge();
        }

        private updateShieldBadge() {
          const parts: string[] = [];
          if (this.shieldEquipped) {
            const remain = Math.max(0, (this.shieldExpireAt - this.time.now) / 1000);
            parts.push(`SHIELD ${remain.toFixed(1)}s`);
          }
          if (this.slowActive) {
            const remain = Math.max(0, (this.slowExpireAt - this.time.now) / 1000);
            parts.push(`SLOW ${remain.toFixed(1)}s`);
          }
          if (this.twoxActive) {
            const remain = Math.max(0, (this.twoxExpireAt - this.time.now) / 1000);
            parts.push(`2X ${remain.toFixed(1)}s`);
          }
          if (this.megaJumpArmed) parts.push("MEGA");
          this.shieldBadge.setText(parts.join(" / "));
        }

        // -----------------------------------------------------------------
        // Collision helpers
        // -----------------------------------------------------------------
        private wolfBounds(): Phaser.Geom.Rectangle {
          return new Phaser.Geom.Rectangle(
            this.wolf.x - WOLF_HIT_W / 2,
            this.wolf.y - WOLF_HIT_H / 2,
            WOLF_HIT_W,
            WOLF_HIT_H,
          );
        }

        private obstacleBounds(obs: ObstacleSprite): Phaser.Geom.Rectangle | null {
          switch (obs.__kind) {
            case "rock":
              return new Phaser.Geom.Rectangle(
                obs.x - ROCK_W / 2 + 2,
                obs.y - ROCK_H / 2 + 4,
                ROCK_W - 4,
                ROCK_H - 4,
              );
            case "pillar":
              return new Phaser.Geom.Rectangle(
                obs.x - PILLAR_W / 2 + 2,
                obs.y - PILLAR_H / 2 + 2,
                PILLAR_W - 4,
                PILLAR_H - 4,
              );
            case "crow":
              return new Phaser.Geom.Rectangle(
                obs.x - CROW_W / 2 + 4,
                obs.y - CROW_H / 2 + 4,
                CROW_W - 8,
                CROW_H - 8,
              );
            case "fire": {
              // Only hazardous while the column is at least 30% height.
              if (!obs.__fireHazard) return null;
              const h = obs.__fireCurrentH ?? 0;
              if (h <= 0) return null;
              return new Phaser.Geom.Rectangle(
                obs.x - FIRE_W / 2 + 3,
                GROUND_Y - h + 2,
                FIRE_W - 6,
                h - 4,
              );
            }
            case "meteor": {
              if (obs.__meteorStage === "falling" && obs.__meteorBody) {
                // Use the body's current position for collision.
                return new Phaser.Geom.Rectangle(
                  obs.__meteorBody.x - METEOR_BODY_SIZE / 2 + 2,
                  obs.__meteorBody.y - METEOR_BODY_SIZE / 2 + 2,
                  METEOR_BODY_SIZE - 4,
                  METEOR_BODY_SIZE - 4,
                );
              }
              if (obs.__meteorStage === "debris" && obs.__meteorDebris) {
                return new Phaser.Geom.Rectangle(
                  obs.__meteorDebris.x - METEOR_DEBRIS_W / 2 + 2,
                  obs.__meteorDebris.y - METEOR_DEBRIS_H / 2 + 2,
                  METEOR_DEBRIS_W - 4,
                  METEOR_DEBRIS_H - 4,
                );
              }
              // Shadow stage is non-hazardous.
              return null;
            }
            case "boulder":
              return new Phaser.Geom.Rectangle(
                obs.x - BOULDER_D / 2 + 4,
                obs.y - BOULDER_D / 2 + 4,
                BOULDER_D - 8,
                BOULDER_D - 8,
              );
            case "pit":
            default:
              return null;
          }
        }

        private applyHit() {
          if (this.shieldEquipped) {
            this.deactivateShield();
            getAudioEngine()?.shieldBlock();
            // Brief cyan flash on hit-absorb.
            this.cameras.main.flash(120, 34, 211, 238);
            return true; // absorbed
          }
          this.triggerGameOver();
          return false;
        }

        // -----------------------------------------------------------------
        // Main update loop
        // -----------------------------------------------------------------
        update(time: number, delta: number) {
          const dt = delta / 1000;

          // ----- Keyboard jump/start handling --------------------------------
          const jumpPressed =
            Phaser.Input.Keyboard.JustDown(this.keySpace) ||
            (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
            Phaser.Input.Keyboard.JustDown(this.keyW);

          if (jumpPressed) {
            if (this.status === "ready") {
              this.startGame();
            } else if (this.status === "gameover") {
              if (time - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            } else if (this.status === "playing") {
              this.tryJump();
            }
          }

          if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            if (this.status === "gameover" || this.status === "ready") {
              this.restartGame();
            }
          }

          // While not playing, still animate the sky/moon very subtly but
          // skip the meat of the logic below.
          if (this.status !== "playing") {
            return;
          }

          // ----- Scroll world ------------------------------------------------
          const speed = this.currentScrollSpeed();
          const scrollDx = speed * dt;

          this.farMountains.tilePositionX += scrollDx * 0.15;
          this.nearTrees.tilePositionX += scrollDx * 0.4;
          this.groundTiles.tilePositionX += scrollDx;

          // Move obstacles left, tag passed ones (no score for now — distance
          // is our metric), destroy once off-screen.
          for (const obs of this.obstacles) {
            obs.x -= scrollDx;
            if (obs.__kind === "pit") {
              if (obs.__pitLeft !== undefined) obs.__pitLeft -= scrollDx;
              if (obs.__pitRight !== undefined) obs.__pitRight -= scrollDx;
            }
            if (obs.__kind === "crow" && obs.__crowT0 !== undefined && obs.__crowBaseY !== undefined) {
              const phase = ((time - obs.__crowT0) / CROW_BOUNCE_PERIOD_MS) * Math.PI * 2;
              obs.y = obs.__crowBaseY + Math.sin(phase) * CROW_BOUNCE_AMP;
            }
            if (obs.__kind === "fire") {
              this.updateFireObstacle(obs, time);
            }
            if (obs.__kind === "meteor") {
              this.updateMeteorObstacle(obs, scrollDx, dt);
            }
            if (obs.__kind === "boulder") {
              obs.__boulderRot =
                (obs.__boulderRot ?? 0) - (scrollDx / (BOULDER_D / 2));
              obs.setRotation(obs.__boulderRot);
            }
          }
          // Drop off-screen obstacles.
          this.obstacles = this.obstacles.filter((obs) => {
            let rightEdge: number;
            if (obs.__kind === "pit") {
              rightEdge = obs.__pitRight ?? obs.x;
            } else if (obs.__kind === "fire") {
              rightEdge = obs.x + FIRE_W / 2;
            } else if (obs.__kind === "boulder") {
              rightEdge = obs.x + BOULDER_D / 2;
            } else if (obs.__kind === "meteor") {
              // Debris stage uses the carrier position; earlier stages
              // we still use carrier x as proxy for shadow/body x.
              rightEdge = obs.x + METEOR_DEBRIS_W / 2;
            } else {
              rightEdge = obs.x + 80;
            }
            if (rightEdge < -20) {
              this.destroyObstacle(obs);
              return false;
            }
            return true;
          });

          // ----- Pit tracking ------------------------------------------------
          // Determine whether the wolf's feet are currently over a pit.
          this.activePit = null;
          for (const obs of this.obstacles) {
            if (obs.__kind !== "pit") continue;
            const left = obs.__pitLeft ?? 0;
            const right = obs.__pitRight ?? 0;
            if (WOLF_X >= left && WOLF_X <= right) {
              this.activePit = obs;
              break;
            }
          }
          this.overPit = this.activePit !== null;

          // ----- Physics (manual) -------------------------------------------
          // Apply gravity when airborne (or always while over a pit so you
          // can't float over it if you somehow land mid-gap).
          const wasOnGround = this.onGround;
          this.wolfVY += GRAVITY_Y * dt;
          this.wolfY += this.wolfVY * dt;

          const feetY = this.wolfY + WOLF_HEIGHT / 2;
          if (this.overPit) {
            // Falling through the pit — no ground to catch us.
            this.onGround = false;
            if (feetY > GAME_HEIGHT + 40) {
              // Dropped off the bottom: instant death.
              this.wolf.setVisible(false);
              this.triggerGameOver();
              return;
            }
          } else {
            // Land on the ground if we're at or below it.
            if (feetY >= GROUND_Y) {
              this.wolfY = GROUND_Y - WOLF_HEIGHT / 2;
              const wasFalling = this.wolfVY > 80;
              this.wolfVY = 0;
              if (!this.onGround) {
                this.onGround = true;
                this.jumpsUsed = 0;
                if (wasFalling) {
                  this.spawnLandDust();
                  getAudioEngine()?.wolfLand();
                }
              }
            } else {
              this.onGround = false;
            }
          }
          // `wasOnGround` retained for future use (e.g. coyote-time tuning).
          void wasOnGround;

          this.wolf.setPosition(WOLF_X, this.wolfY);

          // ----- Wolf run animation ------------------------------------------
          if (this.onGround) {
            this.wolfFrameTimer += delta;
            if (this.wolfFrameTimer > 60) {
              this.wolfFrameTimer = 0;
              this.wolfFrame = 1 - this.wolfFrame;
              this.wolf.setTexture(this.wolfFrame === 0 ? "wolf-run-a" : "wolf-run-b");
            }
          } else {
            // Mid-air — freeze on "a" with a slight tilt depending on vy.
            this.wolf.setTexture("wolf-run-a");
            const tilt = Phaser.Math.Clamp(this.wolfVY / 800, -0.35, 0.5);
            this.wolf.setRotation(tilt);
          }
          if (this.onGround) {
            this.wolf.setRotation(0);
          }

          // ----- Shield aura follow -----------------------------------------
          if (this.shieldEquipped && this.shieldAura) {
            this.shieldAura.setPosition(this.wolf.x, this.wolf.y);
          }

          // ----- Collision tests --------------------------------------------
          const wb = this.wolfBounds();
          for (const obs of this.obstacles) {
            if (obs.__kind === "pit") continue;
            const ob = this.obstacleBounds(obs);
            if (!ob) continue;
            if (Phaser.Geom.Intersects.RectangleToRectangle(wb, ob)) {
              const absorbed = this.applyHit();
              if (absorbed) {
                // Remove the offending obstacle so it doesn't repeatedly
                // fire on subsequent frames.
                this.destroyObstacle(obs);
                this.obstacles = this.obstacles.filter((o) => o !== obs);
              }
              break;
            }
          }

          // ----- Ground line draw (erase pit gaps) --------------------------
          this.groundLine.clear();
          this.groundLine.lineStyle(2, COLOR_GROUND_LINE, 1);
          const pits: Array<[number, number]> = [];
          for (const obs of this.obstacles) {
            if (obs.__kind !== "pit") continue;
            pits.push([obs.__pitLeft ?? 0, obs.__pitRight ?? 0]);
          }
          pits.sort((a, b) => a[0] - b[0]);
          let cursor = 0;
          for (const [l, r] of pits) {
            const ls = Math.max(cursor, 0);
            const le = Math.min(l, GAME_WIDTH);
            if (le > ls) {
              this.groundLine.beginPath();
              this.groundLine.moveTo(ls, GROUND_Y);
              this.groundLine.lineTo(le, GROUND_Y);
              this.groundLine.strokePath();
            }
            cursor = Math.max(cursor, r);
          }
          if (cursor < GAME_WIDTH) {
            this.groundLine.beginPath();
            this.groundLine.moveTo(Math.max(cursor, 0), GROUND_Y);
            this.groundLine.lineTo(GAME_WIDTH, GROUND_Y);
            this.groundLine.strokePath();
          }
          // Mask over the ground-tile strip for the pit regions.
          for (const [l, r] of pits) {
            const ls = Math.max(l, 0);
            const le = Math.min(r, GAME_WIDTH);
            if (le > ls) {
              this.groundLine.fillStyle(COLOR_PIT, 1);
              this.groundLine.fillRect(ls, GROUND_Y, le - ls, GAME_HEIGHT - GROUND_Y);
            }
          }

          // ----- Score / HUD ------------------------------------------------
          this.elapsed += dt;
          const multiplier = this.twoxActive ? 2 : 1;
          this.distanceMeters += (speed * dt * multiplier) / DIST_SCALE;
          this.updateDistText();
          // 거리 기반 아이템 스폰: 300m마다 다음 아이템 등장.
          this.maybeApplyItemByDistance();
          // Keep the effect HUD ticking its countdowns.
          this.updateShieldBadge();
        }

        private updateDistText() {
          this.distText.setText(`DIST ${this.formatDist(this.distanceMeters)}m`);
        }

        private formatDist(v: number): string {
          const n = Math.max(0, Math.round(v));
          return String(n).padStart(3, "0");
        }

        // -----------------------------------------------------------------
        // Best-score persistence
        // -----------------------------------------------------------------
        private loadBest(): number {
          try {
            const raw = localStorage.getItem(BEST_KEY);
            if (!raw) return 0;
            const v = parseInt(raw, 10);
            return Number.isFinite(v) && v >= 0 ? v : 0;
          } catch {
            return 0;
          }
        }

        private saveBest(value: number) {
          try {
            localStorage.setItem(BEST_KEY, String(Math.round(value)));
          } catch {
            // ignore (private mode etc)
          }
        }

        // -----------------------------------------------------------------
        // Teardown
        // -----------------------------------------------------------------
        private onShutdown() {
          this.stopObstacleSpawner();
          this.clearEffects();
          if (this.shieldAuraTween) {
            this.shieldAuraTween.stop();
            this.shieldAuraTween = undefined;
          }
          if (this.shieldAura) {
            this.shieldAura.destroy();
            this.shieldAura = undefined;
          }
          for (const obs of this.obstacles) this.destroyObstacle(obs);
          this.obstacles = [];
          this.input.off("pointerdown", this.handlePointerDown, this);
          getAudioEngine()?.stopWolfBgm();
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: "#0b0b12",
        parent: containerRef.current!,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        },
        // Wolf Runner does its own gravity/jump math so it doesn't need
        // arcade physics — it's cheaper + easier to reason about.
        scene: [MainScene],
        render: {
          pixelArt: false,
          antialias: true,
        },
      };

      gameRef.current = new Phaser.Game(config);
    });

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[800px] aspect-[2/1] border-2 border-zinc-400/30 rounded-lg shadow-[0_0_30px_rgba(253,224,71,0.12)] overflow-hidden bg-black touch-none select-none"
      style={{ touchAction: "none" }}
    />
  );
}
