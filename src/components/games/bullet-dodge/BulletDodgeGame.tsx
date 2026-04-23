"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const COLOR_BG = 0x09090b;
const COLOR_PLAYER = 0x22d3ee; // cyan
const COLOR_PLAYER_TRAIL = 0x67e8f9;
const COLOR_BULLET = 0xfb7185; // rose
const COLOR_BULLET_CORE = 0xffe4e6;
const COLOR_WALL = 0x27272a;

const PLAYER_SIZE = 18;
const PLAYER_RADIUS = 8;
// Ship silhouette is non-circular; give it a slightly forgiving circular hitbox.
const PLAYER_HITBOX_RADIUS = 6;
const PLAYER_SPEED = 320;

// Spaceship sprite dimensions (a bit taller than wide, pointing up).
const SHIP_TEX_W = 20;
const SHIP_TEX_H = 22;

const BULLET_RADIUS = 6;

// Difficulty curve (seconds) — tuned so 30s+ survival is a real "pro" benchmark.
const SPAWN_INTERVAL_START = 450;
const SPAWN_INTERVAL_MIN = 80;
const BULLET_SPEED_START = 210;
const BULLET_SPEED_MAX = 560;
const DIFFICULTY_RAMP_SECONDS = 45; // time to reach max difficulty (shortened)

// Volley pattern — occasional synced stripe of bullets from one edge.
const VOLLEY_MIN_TIME = 30; // seconds before volleys can trigger
const VOLLEY_INTERVAL_MS = 8000; // check cadence
const VOLLEY_CHANCE = 0.1; // chance per check window

// Item system
const ITEM_SIZE = 22;
const ITEM_FIRST_DELAY_MS = 7000;
const ITEM_INTERVAL_MIN_MS = 12000;
const ITEM_INTERVAL_MAX_MS = 20000;
const ITEM_LIFETIME_MS = 6000;
const ITEM_MAX_ACTIVE = 2;
const ITEM_SAFE_MARGIN = 50; // keep items away from canvas edges

const SHIELD_DURATION_MS = 3000;
const FREEZE_DURATION_MS = 3000;
const SLOW_DURATION_MS = 3000;
const SLOW_MULT = 0.35;
const BONUS_SECONDS = 5.0;

const BEST_KEY = "bullet-dodge-best";

type GameStatus = "ready" | "playing" | "gameover";

type Edge = "top" | "bottom" | "left" | "right";

type ItemKind = "shield" | "freeze" | "clear" | "slow" | "bonus";

type InputMode = "idle" | "keyboard" | "pointer";

// Minimum pointer movement (px) that counts as a real mouse move and
// switches the control scheme away from "keyboard". Below this threshold
// the pointer is considered to be merely resting on the canvas.
const POINTER_MOVE_THRESHOLD = 2;

const ITEM_DEFS: Record<
  ItemKind,
  { color: number; hex: string; letter: string; weight: number; label: string }
> = {
  shield: { color: 0x38bdf8, hex: "#38bdf8", letter: "S", weight: 24, label: "SHIELD" },
  freeze: { color: 0xe879f9, hex: "#e879f9", letter: "F", weight: 22, label: "FREEZE" },
  clear: { color: 0xfde047, hex: "#fde047", letter: "B", weight: 14, label: "BOMB" },
  slow: { color: 0xa3e635, hex: "#a3e635", letter: "L", weight: 20, label: "SLOW" },
  bonus: { color: 0xfb7185, hex: "#fb7185", letter: "+", weight: 20, label: "BONUS" },
};

const ITEM_KINDS: ItemKind[] = ["shield", "freeze", "clear", "slow", "bonus"];

export type BulletDodgeGameProps = {
  onGameOver?: (timeMs: number) => void;
};

export default function BulletDodgeGame({ onGameOver }: BulletDodgeGameProps = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onGameOverRef = useRef<typeof onGameOver>(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let destroyed = false;

    // Dynamic import so Phaser is only loaded on the client.
    import("phaser").then((PhaserModule) => {
      if (destroyed) return;
      const Phaser = PhaserModule.default ?? PhaserModule;

      type BulletSprite = Phaser.Physics.Arcade.Image & {
        // Stored velocity during freeze so we can restore on thaw.
        __frozenVel?: { x: number; y: number };
        // Track whether this bullet was slowed so we can restore on expiry.
        __slowed?: boolean;
      };

      type ItemSprite = Phaser.Physics.Arcade.Image & {
        __kind?: ItemKind;
        __label?: Phaser.GameObjects.Text;
        __expireAt?: number;
      };

      class MainScene extends Phaser.Scene {
        private player!: Phaser.Physics.Arcade.Image;
        private bullets!: Phaser.Physics.Arcade.Group;
        private items!: Phaser.Physics.Arcade.Group;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private keyA!: Phaser.Input.Keyboard.Key;
        private keyD!: Phaser.Input.Keyboard.Key;
        private keyW!: Phaser.Input.Keyboard.Key;
        private keyS!: Phaser.Input.Keyboard.Key;
        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;
        private timeText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private effectText!: Phaser.GameObjects.Text;
        private overlayText!: Phaser.GameObjects.Text;
        private overlaySubText!: Phaser.GameObjects.Text;
        private overlayScoreText!: Phaser.GameObjects.Text;
        private spawnTimer?: Phaser.Time.TimerEvent;
        private trailTimer?: Phaser.Time.TimerEvent;
        private itemSpawnTimer?: Phaser.Time.TimerEvent;
        private volleyTimer?: Phaser.Time.TimerEvent;

        // Effect state
        private shieldActive = false;
        private shieldExpireAt = 0;
        private shieldTimer?: Phaser.Time.TimerEvent;
        private shieldRing?: Phaser.GameObjects.Arc;
        private shieldRingTween?: Phaser.Tweens.Tween;

        private frozen = false;
        private freezeExpireAt = 0;
        private freezeTimer?: Phaser.Time.TimerEvent;

        private slowActive = false;
        private slowExpireAt = 0;
        private slowTimer?: Phaser.Time.TimerEvent;

        private pointerActive = false;
        private pointerTargetX = GAME_WIDTH / 2;
        private pointerTargetY = GAME_HEIGHT / 2;
        // Input source state machine. Keyboard and pointer are mutually
        // exclusive — whichever the player last used "wins" and the other
        // source is fully ignored until an explicit input from it arrives.
        private inputMode: InputMode = "idle";
        // Last observed pointer position, used to detect a *real* mouse move
        // (vs. the cursor merely sitting on the canvas while the player is
        // using the keyboard).
        private lastPointerX = GAME_WIDTH / 2;
        private lastPointerY = GAME_HEIGHT / 2;
        // Guard so we don't re-init lastPointerX/Y every pointermove: the
        // first pointermove after a reset seeds the baseline without counting
        // as a real move.
        private pointerBaselineSet = false;
        private status: GameStatus = "ready";
        private startedAt = 0;
        private elapsed = 0; // seconds
        private best = 0;

        constructor() {
          super("BulletDodge");
        }

        preload() {
          // Procedurally generated textures — no asset files.
          // Guard against duplicate texture creation under React StrictMode.
          if (!this.textures.exists("player-tex")) {
            this.generateShipTexture("player-tex");
          }
          if (!this.textures.exists("player-trail")) {
            this.generateCircleTexture("player-trail", PLAYER_RADIUS, COLOR_PLAYER_TRAIL);
          }
          if (!this.textures.exists("bullet-tex")) {
            this.generateBulletTexture(
              "bullet-tex",
              BULLET_RADIUS,
              COLOR_BULLET,
              COLOR_BULLET_CORE,
            );
          }
          for (const kind of ITEM_KINDS) {
            const key = `item-${kind}`;
            if (!this.textures.exists(key)) {
              this.generateItemTexture(key, ITEM_DEFS[kind].color);
            }
          }
        }

        private generateCircleTexture(key: string, radius: number, color: number) {
          const g = this.add.graphics({ x: 0, y: 0 });
          // subtle outer glow ring
          g.fillStyle(color, 0.25);
          g.fillCircle(radius, radius, radius);
          g.fillStyle(color, 1);
          g.fillCircle(radius, radius, radius * 0.75);
          g.fillStyle(0xffffff, 0.4);
          g.fillCircle(radius - radius / 3, radius - radius / 3, radius / 3.5);
          g.generateTexture(key, radius * 2, radius * 2);
          g.destroy();
        }

        // Classic top-down spaceship silhouette (Galaga-ish): pointed nose,
        // swept wings, wider engine block at the rear. Always points up.
        private generateShipTexture(key: string) {
          const w = SHIP_TEX_W;
          const h = SHIP_TEX_H;
          const cx = w / 2;

          const g = this.add.graphics({ x: 0, y: 0 });

          // Soft outer glow behind the ship (keeps the cyan aura consistent
          // with the old circle player).
          g.fillStyle(COLOR_PLAYER, 0.2);
          g.fillCircle(cx, h / 2, Math.max(w, h) / 2);

          // --- Wings (swept back) ---
          // Lighter cyan so the wings read as a secondary shape.
          g.fillStyle(COLOR_PLAYER_TRAIL, 1);
          g.beginPath();
          g.moveTo(cx, h * 0.45); //  wing root top
          g.lineTo(0, h * 0.78); //  left wing tip
          g.lineTo(w * 0.25, h * 0.86); //  left wing trailing edge
          g.lineTo(cx, h * 0.7); //  wing root bottom
          g.closePath();
          g.fillPath();

          g.beginPath();
          g.moveTo(cx, h * 0.45);
          g.lineTo(w, h * 0.78);
          g.lineTo(w * 0.75, h * 0.86);
          g.lineTo(cx, h * 0.7);
          g.closePath();
          g.fillPath();

          // --- Main fuselage (pointed nose -> wider engine block) ---
          g.fillStyle(COLOR_PLAYER, 1);
          g.beginPath();
          g.moveTo(cx, 0); //  nose tip
          g.lineTo(w * 0.72, h * 0.55); //  right shoulder
          g.lineTo(w * 0.68, h * 0.92); //  right engine corner
          g.lineTo(w * 0.32, h * 0.92); //  left engine corner
          g.lineTo(w * 0.28, h * 0.55); //  left shoulder
          g.closePath();
          g.fillPath();

          // --- Cockpit highlight ---
          g.fillStyle(0xffffff, 0.85);
          g.fillCircle(cx, h * 0.38, 1.6);
          g.fillStyle(COLOR_PLAYER_TRAIL, 0.6);
          g.fillCircle(cx, h * 0.5, 2.2);

          // --- Engine exhaust glow (small, tasteful booster hint) ---
          g.fillStyle(0xffffff, 0.9);
          g.fillRect(w * 0.44, h * 0.9, w * 0.12, 2);
          g.fillStyle(COLOR_PLAYER_TRAIL, 0.5);
          g.fillRect(w * 0.4, h * 0.93, w * 0.2, 1);

          g.generateTexture(key, w, h);
          g.destroy();
        }

        private generateBulletTexture(
          key: string,
          radius: number,
          outer: number,
          inner: number,
        ) {
          const g = this.add.graphics({ x: 0, y: 0 });
          // glow
          g.fillStyle(outer, 0.25);
          g.fillCircle(radius, radius, radius);
          // body
          g.fillStyle(outer, 1);
          g.fillCircle(radius, radius, radius * 0.78);
          // highlight core
          g.fillStyle(inner, 0.9);
          g.fillCircle(radius, radius, radius * 0.35);
          g.generateTexture(key, radius * 2, radius * 2);
          g.destroy();
        }

        private generateItemTexture(key: string, color: number) {
          const s = ITEM_SIZE;
          const g = this.add.graphics({ x: 0, y: 0 });
          // dark back card so the letter stays readable
          g.fillStyle(0x09090b, 1);
          g.fillRect(0, 0, s, s);
          // glow halo
          g.fillStyle(color, 0.25);
          g.fillCircle(s / 2, s / 2, s / 2);
          // main body rounded-ish rect (simulate via slight inset)
          g.fillStyle(color, 1);
          g.fillRect(2, 2, s - 4, s - 4);
          // top highlight
          g.fillStyle(0xffffff, 0.22);
          g.fillRect(2, 2, s - 4, Math.max(2, Math.floor(s / 5)));
          // outer frame
          g.lineStyle(1, 0x09090b, 1);
          g.strokeRect(0, 0, s, s);
          g.generateTexture(key, s, s);
          g.destroy();
        }

        create() {
          this.cameras.main.setBackgroundColor(COLOR_BG);

          // border
          const border = this.add.graphics();
          border.lineStyle(2, COLOR_WALL, 1);
          border.strokeRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2);

          // subtle scanline overlay inside canvas
          const scan = this.add.graphics().setDepth(30);
          scan.fillStyle(0xffffff, 0.03);
          for (let y = 0; y < GAME_HEIGHT; y += 3) {
            scan.fillRect(0, y, GAME_WIDTH, 1);
          }

          // Read best score
          this.best = this.loadBest();

          // Player
          this.player = this.physics.add.image(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            "player-tex",
          );
          // Centered circular hitbox — slightly smaller than the visible
          // silhouette so collisions feel fair on an irregular ship shape.
          // Offsets center the circle on the sprite's center of mass
          // (fuselage core, a touch above geometric center).
          const hitboxOffsetX = SHIP_TEX_W / 2 - PLAYER_HITBOX_RADIUS;
          const hitboxOffsetY = SHIP_TEX_H / 2 - PLAYER_HITBOX_RADIUS;
          this.player.setCircle(PLAYER_HITBOX_RADIUS, hitboxOffsetX, hitboxOffsetY);
          (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = false;
          this.player.setCollideWorldBounds(true);
          this.player.setDepth(5);

          // Bullets group
          this.bullets = this.physics.add.group({
            defaultKey: "bullet-tex",
            maxSize: 300,
          });

          // Items group (procedurally generated textures attached per-spawn)
          this.items = this.physics.add.group({ allowGravity: false });

          // Overlap: any bullet hitting player -> game over (unless shielded)
          this.physics.add.overlap(
            this.player,
            this.bullets,
            this.handleHit,
            undefined,
            this,
          );

          // Overlap: player picks up item
          this.physics.add.overlap(
            this.player,
            this.items,
            this.handlePlayerItem,
            undefined,
            this,
          );

          // Input
          this.cursors = this.input.keyboard!.createCursorKeys();
          this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
          this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
          this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
          this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
          this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          this.keyR = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

          this.input.on("pointerdown", this.handlePointerDown, this);
          this.input.on("pointerup", this.handlePointerUp, this);
          this.input.on("pointermove", this.handlePointerMove, this);

          // HUD
          this.timeText = this.add
            .text(20, 18, "TIME 00.0", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#fb7185",
            })
            .setDepth(40)
            .setShadow(0, 0, "#e11d48", 8, true, true);

          this.bestText = this.add
            .text(GAME_WIDTH - 20, 18, `BEST ${this.formatTime(this.best)}`, {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#fda4af",
            })
            .setOrigin(1, 0)
            .setDepth(40)
            .setShadow(0, 0, "#fb7185", 8, true, true);

          // Active effects badge (top-center)
          this.effectText = this.add
            .text(GAME_WIDTH / 2, 22, "", {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#e4e4e7",
              align: "center",
            })
            .setOrigin(0.5, 0)
            .setDepth(40);

          // Overlay
          this.overlayText = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "BULLET DODGE", {
              fontFamily: "monospace",
              fontSize: "48px",
              color: "#fb7185",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(50)
            .setShadow(0, 0, "#e11d48", 14, true, true);

          this.overlaySubText = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 + 20,
              "PRESS SPACE OR TAP TO START",
              {
                fontFamily: "monospace",
                fontSize: "18px",
                color: "#e4e4e7",
                align: "center",
              },
            )
            .setOrigin(0.5)
            .setDepth(50);

          this.overlayScoreText = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "", {
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#a1a1aa",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(50);

          // Trail (only while playing)
          this.trailTimer = this.time.addEvent({
            delay: 45,
            loop: true,
            callback: this.spawnPlayerTrail,
            callbackScope: this,
          });

          // Cleanup on scene shutdown
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

          this.enterReadyState();
        }

        private loadBest(): number {
          try {
            const raw = localStorage.getItem(BEST_KEY);
            if (!raw) return 0;
            const v = parseFloat(raw);
            return Number.isFinite(v) && v >= 0 ? v : 0;
          } catch {
            return 0;
          }
        }

        private saveBest(value: number) {
          try {
            localStorage.setItem(BEST_KEY, value.toFixed(1));
          } catch {
            // ignore storage errors (private mode, etc.)
          }
        }

        private formatTime(seconds: number): string {
          const clamped = Math.max(0, seconds);
          return clamped.toFixed(1).padStart(4, "0");
        }

        private resetInputMode() {
          // Force idle so the player only starts moving once the user issues
          // an explicit input (keyboard press or a real pointer movement).
          // Prevents the "mouse sitting near an edge yanks the ship on
          // restart" bug.
          this.inputMode = "idle";
          this.pointerActive = false;
          this.pointerTargetX = this.player?.x ?? GAME_WIDTH / 2;
          this.pointerTargetY = this.player?.y ?? GAME_HEIGHT / 2;
          this.lastPointerX = this.pointerTargetX;
          this.lastPointerY = this.pointerTargetY;
          this.pointerBaselineSet = false;
        }

        private enterReadyState() {
          this.status = "ready";
          this.elapsed = 0;
          this.updateTimeText();
          this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
          this.resetInputMode();
          this.player.setVisible(true);
          this.showOverlay(
            "BULLET DODGE",
            "PRESS SPACE OR TAP TO START",
            this.best > 0 ? `BEST ${this.formatTime(this.best)}s` : "",
          );
          // Clear any lingering bullets / items / effects from a previous run
          this.clearBullets();
          this.clearItems();
          this.clearEffects();
          // Stop all timers
          this.stopSpawner();
          this.stopItemSpawner();
          this.stopVolleyTimer();
          this.updateEffectText();
        }

        private startGame() {
          if (this.status === "playing") return;
          this.status = "playing";
          this.startedAt = this.time.now;
          this.elapsed = 0;
          this.hideOverlay();
          this.clearBullets();
          this.clearItems();
          this.clearEffects();
          // Clear any stale input mode from the previous run. The first
          // keyboard press / real pointer move after this will decide the
          // control scheme for the new run.
          this.resetInputMode();
          this.restartSpawner();
          this.restartItemSpawner();
          this.restartVolleyTimer();
          this.updateEffectText();

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
            audio.startBgm();
          }
        }

        private triggerGameOver() {
          if (this.status !== "playing") return;
          this.status = "gameover";
          this.stopSpawner();
          this.stopItemSpawner();
          this.stopVolleyTimer();
          this.clearEffects();

          // Camera feedback
          this.cameras.main.shake(220, 0.012);
          this.cameras.main.flash(160, 251, 113, 133);

          // Best score
          const score = this.elapsed;
          if (score > this.best) {
            this.best = score;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.formatTime(this.best)}`);
          }

          this.player.setVisible(false);
          this.spawnPlayerExplosion();

          this.showOverlay(
            "GAME OVER",
            "PRESS R / SPACE / TAP TO RESTART",
            `TIME ${this.formatTime(score)}s   BEST ${this.formatTime(this.best)}s`,
          );
          this.updateEffectText();

          getAudioEngine()?.gameOver();

          try {
            onGameOverRef.current?.(Math.round(score * 1000));
          } catch (err) {
            console.error("[bullet-dodge] onGameOver callback error", err);
          }
        }

        private restartGame() {
          // Reset player visibility/position, clear state, then start a new run
          this.player.setVisible(true);
          this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
          // startGame() will call resetInputMode(); setting the targets here
          // keeps them coherent before the velocity is recomputed.
          this.pointerTargetX = GAME_WIDTH / 2;
          this.pointerTargetY = GAME_HEIGHT / 2;
          this.startGame();
        }

        private showOverlay(main: string, sub: string, score: string) {
          this.overlayText.setText(main).setVisible(true);
          this.overlaySubText.setText(sub).setVisible(true);
          this.overlayScoreText.setText(score).setVisible(score.length > 0);
        }

        private hideOverlay() {
          this.overlayText.setVisible(false);
          this.overlaySubText.setVisible(false);
          this.overlayScoreText.setVisible(false);
        }

        private currentSpawnInterval(): number {
          const t = Phaser.Math.Clamp(this.elapsed / DIFFICULTY_RAMP_SECONDS, 0, 1);
          // Ease out quad for smoother ramp
          const eased = 1 - Math.pow(1 - t, 2);
          const delay = Phaser.Math.Linear(
            SPAWN_INTERVAL_START,
            SPAWN_INTERVAL_MIN,
            eased,
          );
          return Math.max(SPAWN_INTERVAL_MIN, Math.round(delay));
        }

        private currentBulletSpeed(): number {
          const t = Phaser.Math.Clamp(this.elapsed / DIFFICULTY_RAMP_SECONDS, 0, 1);
          return Phaser.Math.Linear(BULLET_SPEED_START, BULLET_SPEED_MAX, t);
        }

        private currentBurstCount(): number {
          // Occasional multi-bullet bursts grow in frequency over time
          let count: number;
          if (this.elapsed < 8) {
            count = Phaser.Math.Between(1, 2);
          } else if (this.elapsed < 18) {
            count = Phaser.Math.Between(2, 3);
          } else if (this.elapsed < 30) {
            count = Phaser.Math.Between(2, 4);
          } else {
            count = Phaser.Math.Between(3, 5);
            // Occasional late-game spike: +1 extra bullet ~15% of the time
            if (Math.random() < 0.15) count += 1;
          }
          return count;
        }

        private restartSpawner() {
          this.stopSpawner();
          const schedule = () => {
            if (this.status !== "playing") return;
            this.spawnBulletBurst();
            const delay = this.currentSpawnInterval();
            this.spawnTimer = this.time.delayedCall(delay, schedule);
          };
          // Kick off after a short breather on each start
          this.spawnTimer = this.time.delayedCall(500, schedule);
        }

        private stopSpawner() {
          if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = undefined;
          }
        }

        private restartVolleyTimer() {
          this.stopVolleyTimer();
          const tick = () => {
            if (this.status !== "playing") return;
            if (
              this.elapsed >= VOLLEY_MIN_TIME &&
              Math.random() < VOLLEY_CHANCE
            ) {
              this.spawnVolley();
            }
            this.volleyTimer = this.time.delayedCall(VOLLEY_INTERVAL_MS, tick);
          };
          this.volleyTimer = this.time.delayedCall(VOLLEY_INTERVAL_MS, tick);
        }

        private stopVolleyTimer() {
          if (this.volleyTimer) {
            this.volleyTimer.remove(false);
            this.volleyTimer = undefined;
          }
        }

        private spawnBulletBurst() {
          const count = this.currentBurstCount();
          for (let i = 0; i < count; i++) {
            this.spawnBullet();
          }
        }

        // Volley pattern: 3-4 bullets travel as a stripe from one edge, evenly spaced.
        // Forces players into committing to a direction to escape — dramatic moments.
        private spawnVolley() {
          const edges: Edge[] = ["top", "bottom", "left", "right"];
          const edge = edges[Phaser.Math.Between(0, 3)];
          const count = Phaser.Math.Between(3, 4);
          const speed = this.currentBulletSpeed();
          const padding = 60;

          if (edge === "top" || edge === "bottom") {
            // Horizontal stripe across the top/bottom
            const spacing = (GAME_WIDTH - padding * 2) / (count - 1);
            const startX = padding;
            const y =
              edge === "top"
                ? -BULLET_RADIUS * 2
                : GAME_HEIGHT + BULLET_RADIUS * 2;
            const vy = edge === "top" ? speed : -speed;
            for (let i = 0; i < count; i++) {
              this.spawnBulletAt(startX + i * spacing, y, 0, vy);
            }
          } else {
            // Vertical stripe on the left/right
            const spacing = (GAME_HEIGHT - padding * 2) / (count - 1);
            const startY = padding;
            const x =
              edge === "left"
                ? -BULLET_RADIUS * 2
                : GAME_WIDTH + BULLET_RADIUS * 2;
            const vx = edge === "left" ? speed : -speed;
            for (let i = 0; i < count; i++) {
              this.spawnBulletAt(x, startY + i * spacing, vx, 0);
            }
          }
        }

        private spawnBullet() {
          const edges: Edge[] = ["top", "bottom", "left", "right"];
          const edge = edges[Phaser.Math.Between(0, 3)];
          const speed = this.currentBulletSpeed();

          let x = 0;
          let y = 0;
          let vx = 0;
          let vy = 0;
          const padding = 12;

          switch (edge) {
            case "top": {
              x = Phaser.Math.Between(padding, GAME_WIDTH - padding);
              y = -BULLET_RADIUS * 2;
              // aim roughly downward with wider horizontal variance for unpredictability
              const angle = Phaser.Math.FloatBetween(Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              break;
            }
            case "bottom": {
              x = Phaser.Math.Between(padding, GAME_WIDTH - padding);
              y = GAME_HEIGHT + BULLET_RADIUS * 2;
              const angle = Phaser.Math.FloatBetween(-Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              break;
            }
            case "left": {
              x = -BULLET_RADIUS * 2;
              y = Phaser.Math.Between(padding, GAME_HEIGHT - padding);
              const angle = Phaser.Math.FloatBetween(-0.5, 0.5);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              break;
            }
            case "right": {
              x = GAME_WIDTH + BULLET_RADIUS * 2;
              y = Phaser.Math.Between(padding, GAME_HEIGHT - padding);
              const angle = Phaser.Math.FloatBetween(Math.PI - 0.5, Math.PI + 0.5);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              break;
            }
          }

          this.spawnBulletAt(x, y, vx, vy);
        }

        private spawnBulletAt(x: number, y: number, vx: number, vy: number) {
          const bullet = this.bullets.get(x, y, "bullet-tex") as
            | BulletSprite
            | null;
          if (!bullet) return;

          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setDepth(3);
          bullet.enableBody(true, x, y, true, true);
          bullet.setCircle(BULLET_RADIUS);
          const body = bullet.body as Phaser.Physics.Arcade.Body;
          body.allowGravity = false;

          // Reset per-bullet flags from pool reuse
          bullet.__frozenVel = undefined;
          bullet.__slowed = false;

          // Apply active slow if any
          let fx = vx;
          let fy = vy;
          if (this.slowActive) {
            fx *= SLOW_MULT;
            fy *= SLOW_MULT;
            bullet.__slowed = true;
          }

          // If frozen, start at rest and stash target velocity for thaw
          if (this.frozen) {
            bullet.__frozenVel = { x: fx, y: fy };
            body.setVelocity(0, 0);
          } else {
            body.setVelocity(fx, fy);
          }
        }

        private clearBullets() {
          this.bullets.children.forEach((obj) => {
            const bullet = obj as BulletSprite;
            if (bullet) {
              bullet.__frozenVel = undefined;
              bullet.__slowed = false;
              bullet.disableBody(true, true);
            }
          });
        }

        // --- Items ---------------------------------------------------------
        private restartItemSpawner() {
          this.stopItemSpawner();
          const schedule = (delay: number) => {
            this.itemSpawnTimer = this.time.delayedCall(delay, () => {
              if (this.status !== "playing") return;
              this.trySpawnItem();
              const next = Phaser.Math.Between(
                ITEM_INTERVAL_MIN_MS,
                ITEM_INTERVAL_MAX_MS,
              );
              schedule(next);
            });
          };
          schedule(ITEM_FIRST_DELAY_MS);
        }

        private stopItemSpawner() {
          if (this.itemSpawnTimer) {
            this.itemSpawnTimer.remove(false);
            this.itemSpawnTimer = undefined;
          }
        }

        private trySpawnItem() {
          // Cap concurrent items
          const active = this.items
            .getChildren()
            .filter((o) => (o as ItemSprite).active).length;
          if (active >= ITEM_MAX_ACTIVE) return;
          const kind = this.pickItemKind();
          const x = Phaser.Math.Between(ITEM_SAFE_MARGIN, GAME_WIDTH - ITEM_SAFE_MARGIN);
          const y = Phaser.Math.Between(ITEM_SAFE_MARGIN, GAME_HEIGHT - ITEM_SAFE_MARGIN);
          this.spawnItem(x, y, kind);
        }

        private pickItemKind(): ItemKind {
          const total = ITEM_KINDS.reduce(
            (sum, k) => sum + ITEM_DEFS[k].weight,
            0,
          );
          let roll = Math.random() * total;
          for (const k of ITEM_KINDS) {
            roll -= ITEM_DEFS[k].weight;
            if (roll <= 0) return k;
          }
          return "bonus";
        }

        private spawnItem(x: number, y: number, kind: ItemKind) {
          const item = this.physics.add.image(x, y, `item-${kind}`) as ItemSprite;
          item.__kind = kind;
          item.setDepth(4);
          const body = item.body as Phaser.Physics.Arcade.Body;
          body.allowGravity = false;
          body.setVelocity(0, 0);
          // Slightly forgiving overlap box (matches sprite size)
          body.setSize(ITEM_SIZE, ITEM_SIZE);
          body.updateFromGameObject();

          const label = this.add
            .text(x, y, ITEM_DEFS[kind].letter, {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#09090b",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(5);
          item.__label = label;
          item.__expireAt = this.time.now + ITEM_LIFETIME_MS;
          this.items.add(item);

          // Subtle pulse so the pickup is visible but not overwhelming
          this.tweens.add({
            targets: [item, label],
            scale: { from: 0.9, to: 1.1 },
            alpha: { from: 0.8, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }

        private destroyItem(item: ItemSprite) {
          if (item.__label) {
            this.tweens.killTweensOf(item.__label);
            item.__label.destroy();
            item.__label = undefined;
          }
          this.tweens.killTweensOf(item);
          item.destroy();
        }

        private handlePlayerItem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
          _player,
          itemObj,
        ) => {
          if (this.status !== "playing") return;
          const item = itemObj as ItemSprite;
          if (!item.active) return;
          const kind = item.__kind;
          this.destroyItem(item);
          if (kind) this.applyItem(kind);
        };

        private applyItem(kind: ItemKind) {
          getAudioEngine()?.item(kind);
          switch (kind) {
            case "shield":
              this.activateShield();
              break;
            case "freeze":
              this.activateFreeze();
              break;
            case "clear":
              this.activateClear();
              break;
            case "slow":
              this.activateSlow();
              break;
            case "bonus":
              this.applyBonus();
              break;
          }
          this.updateEffectText();
        }

        // --- Effects -------------------------------------------------------
        private activateShield() {
          const now = this.time.now;
          this.shieldExpireAt = now + SHIELD_DURATION_MS;
          if (!this.shieldActive) {
            this.shieldActive = true;
            // Attach cyan pulsing ring to player
            this.shieldRing = this.add
              .circle(this.player.x, this.player.y, PLAYER_HITBOX_RADIUS + 10)
              .setStrokeStyle(2, ITEM_DEFS.shield.color, 0.9)
              .setDepth(6);
            this.shieldRingTween = this.tweens.add({
              targets: this.shieldRing,
              scale: { from: 0.9, to: 1.2 },
              alpha: { from: 0.9, to: 0.5 },
              duration: 500,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          if (this.shieldTimer) this.shieldTimer.remove(false);
          this.shieldTimer = this.time.delayedCall(SHIELD_DURATION_MS, () => {
            this.deactivateShield();
          });
        }

        private deactivateShield() {
          this.shieldActive = false;
          this.shieldExpireAt = 0;
          if (this.shieldTimer) {
            this.shieldTimer.remove(false);
            this.shieldTimer = undefined;
          }
          if (this.shieldRingTween) {
            this.shieldRingTween.stop();
            this.shieldRingTween = undefined;
          }
          if (this.shieldRing) {
            this.shieldRing.destroy();
            this.shieldRing = undefined;
          }
          this.updateEffectText();
        }

        private activateFreeze() {
          const now = this.time.now;
          this.freezeExpireAt = now + FREEZE_DURATION_MS;
          if (!this.frozen) {
            this.frozen = true;
            // Snapshot current velocity for every active bullet, then zero it
            this.bullets.getChildren().forEach((obj) => {
              const bullet = obj as BulletSprite;
              if (!bullet.active) return;
              const body = bullet.body as Phaser.Physics.Arcade.Body | null;
              if (!body) return;
              bullet.__frozenVel = { x: body.velocity.x, y: body.velocity.y };
              body.setVelocity(0, 0);
            });
          }
          if (this.freezeTimer) this.freezeTimer.remove(false);
          this.freezeTimer = this.time.delayedCall(FREEZE_DURATION_MS, () => {
            this.deactivateFreeze();
          });
        }

        private deactivateFreeze() {
          this.frozen = false;
          this.freezeExpireAt = 0;
          if (this.freezeTimer) {
            this.freezeTimer.remove(false);
            this.freezeTimer = undefined;
          }
          // Restore each bullet's stashed velocity
          this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as BulletSprite;
            if (!bullet.active) return;
            const body = bullet.body as Phaser.Physics.Arcade.Body | null;
            if (!body) return;
            const v = bullet.__frozenVel;
            if (v) {
              body.setVelocity(v.x, v.y);
              bullet.__frozenVel = undefined;
            }
          });
          this.updateEffectText();
        }

        private activateClear() {
          // Camera flash + expanding yellow ring from player
          this.cameras.main.flash(120, 253, 224, 71);
          const ring = this.add
            .circle(this.player.x, this.player.y, 40)
            .setStrokeStyle(3, ITEM_DEFS.clear.color, 1)
            .setDepth(7);
          this.tweens.add({
            targets: ring,
            scale: { from: 0.3, to: 3 },
            alpha: { from: 1, to: 0 },
            duration: 400,
            ease: "Cubic.easeOut",
            onComplete: () => ring.destroy(),
          });
          // Destroy all active bullets
          this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as BulletSprite;
            if (!bullet.active) return;
            bullet.__frozenVel = undefined;
            bullet.__slowed = false;
            bullet.disableBody(true, true);
          });
        }

        private activateSlow() {
          const now = this.time.now;
          this.slowExpireAt = now + SLOW_DURATION_MS;
          if (!this.slowActive) {
            this.slowActive = true;
            // Scale current bullet velocities (including stashed freeze velocities)
            this.bullets.getChildren().forEach((obj) => {
              const bullet = obj as BulletSprite;
              if (!bullet.active) return;
              const body = bullet.body as Phaser.Physics.Arcade.Body | null;
              if (!body) return;
              if (bullet.__slowed) return;
              if (this.frozen && bullet.__frozenVel) {
                bullet.__frozenVel = {
                  x: bullet.__frozenVel.x * SLOW_MULT,
                  y: bullet.__frozenVel.y * SLOW_MULT,
                };
              } else {
                body.setVelocity(
                  body.velocity.x * SLOW_MULT,
                  body.velocity.y * SLOW_MULT,
                );
              }
              bullet.__slowed = true;
            });
          }
          if (this.slowTimer) this.slowTimer.remove(false);
          this.slowTimer = this.time.delayedCall(SLOW_DURATION_MS, () => {
            this.deactivateSlow();
          });
        }

        private deactivateSlow() {
          if (!this.slowActive) return;
          // Restore bullets that are still flagged slowed
          this.bullets.getChildren().forEach((obj) => {
            const bullet = obj as BulletSprite;
            if (!bullet.active) return;
            if (!bullet.__slowed) return;
            const body = bullet.body as Phaser.Physics.Arcade.Body | null;
            if (!body) return;
            if (this.frozen && bullet.__frozenVel) {
              // Unscale the stashed velocity
              let nx = bullet.__frozenVel.x / SLOW_MULT;
              let ny = bullet.__frozenVel.y / SLOW_MULT;
              const mag = Math.hypot(nx, ny);
              if (mag > BULLET_SPEED_MAX) {
                const s = BULLET_SPEED_MAX / mag;
                nx *= s;
                ny *= s;
              }
              bullet.__frozenVel = { x: nx, y: ny };
            } else {
              let nx = body.velocity.x / SLOW_MULT;
              let ny = body.velocity.y / SLOW_MULT;
              const mag = Math.hypot(nx, ny);
              if (mag > BULLET_SPEED_MAX) {
                const s = BULLET_SPEED_MAX / mag;
                nx *= s;
                ny *= s;
              }
              body.setVelocity(nx, ny);
            }
            bullet.__slowed = false;
          });
          this.slowActive = false;
          this.slowExpireAt = 0;
          if (this.slowTimer) {
            this.slowTimer.remove(false);
            this.slowTimer = undefined;
          }
          this.updateEffectText();
        }

        private applyBonus() {
          // +5.0s instant score gain, and shift the start time so subsequent
          // elapsed calculations include the bonus.
          this.elapsed += BONUS_SECONDS;
          this.startedAt -= BONUS_SECONDS * 1000;
          this.updateTimeText();

          // Floating feedback text above the player
          const feedback = this.add
            .text(this.player.x, this.player.y - 22, `+${BONUS_SECONDS.toFixed(1)}s`, {
              fontFamily: "monospace",
              fontSize: "18px",
              color: ITEM_DEFS.bonus.hex,
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(45)
            .setShadow(0, 0, "#e11d48", 8, true, true);
          this.tweens.add({
            targets: feedback,
            y: feedback.y - 28,
            alpha: 0,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => feedback.destroy(),
          });
        }

        private clearEffects() {
          // Shield
          if (this.shieldTimer) {
            this.shieldTimer.remove(false);
            this.shieldTimer = undefined;
          }
          if (this.shieldRingTween) {
            this.shieldRingTween.stop();
            this.shieldRingTween = undefined;
          }
          if (this.shieldRing) {
            this.shieldRing.destroy();
            this.shieldRing = undefined;
          }
          this.shieldActive = false;
          this.shieldExpireAt = 0;

          // Freeze
          if (this.freezeTimer) {
            this.freezeTimer.remove(false);
            this.freezeTimer = undefined;
          }
          this.frozen = false;
          this.freezeExpireAt = 0;

          // Slow
          if (this.slowTimer) {
            this.slowTimer.remove(false);
            this.slowTimer = undefined;
          }
          this.slowActive = false;
          this.slowExpireAt = 0;
        }

        private clearItems() {
          this.items.getChildren().forEach((obj) => {
            this.destroyItem(obj as ItemSprite);
          });
        }

        private updateEffectText() {
          if (this.status !== "playing") {
            this.effectText.setText("");
            return;
          }
          const now = this.time.now;
          const parts: string[] = [];
          if (this.shieldActive) {
            const sec = Math.max(0, (this.shieldExpireAt - now) / 1000).toFixed(1);
            parts.push(`SHIELD ${sec}s`);
          }
          if (this.frozen) {
            const sec = Math.max(0, (this.freezeExpireAt - now) / 1000).toFixed(1);
            parts.push(`FREEZE ${sec}s`);
          }
          if (this.slowActive) {
            const sec = Math.max(0, (this.slowExpireAt - now) / 1000).toFixed(1);
            parts.push(`SLOW ${sec}s`);
          }
          this.effectText.setText(parts.join("  ·  "));
        }

        // --- Hit / trail / explosion --------------------------------------
        private handleHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
          _player,
          bulletObj,
        ) => {
          if (this.status !== "playing") return;
          const audio = getAudioEngine();
          if (this.shieldActive) {
            // shield absorbs the hit — consume the bullet so the same one doesn't
            // keep triggering callbacks while overlapping, and play a tick.
            const bullet = bulletObj as Phaser.Physics.Arcade.Image;
            if (bullet.active) bullet.disableBody(true, true);
            audio?.shieldBlock();
            return;
          }
          audio?.hit();
          this.triggerGameOver();
        };

        private spawnPlayerTrail() {
          if (this.status !== "playing") return;
          const body = this.player.body as Phaser.Physics.Arcade.Body | null;
          if (!body) return;
          if (body.velocity.x === 0 && body.velocity.y === 0) return;

          const trail = this.add
            .image(this.player.x, this.player.y, "player-trail")
            .setAlpha(0.45)
            .setDepth(2);
          this.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.3,
            duration: 300,
            onComplete: () => trail.destroy(),
          });
        }

        private spawnPlayerExplosion() {
          const count = 14;
          for (let i = 0; i < count; i++) {
            const p = this.add
              .rectangle(this.player.x, this.player.y, 4, 4, COLOR_PLAYER)
              .setDepth(6);
            const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.15, 0.15);
            const speed = Phaser.Math.Between(80, 200);
            this.tweens.add({
              targets: p,
              x: this.player.x + Math.cos(angle) * speed * 0.6,
              y: this.player.y + Math.sin(angle) * speed * 0.6,
              alpha: 0,
              scale: 0.2,
              duration: 520,
              onComplete: () => p.destroy(),
            });
          }
        }

        private updateTimeText() {
          this.timeText.setText(`TIME ${this.formatTime(this.elapsed)}`);
        }

        private handlePointerDown(pointer: Phaser.Input.Pointer) {
          // Explicit tap / click is always treated as intent to use the
          // pointer — this covers mobile touch and mouse-click drags.
          this.pointerActive = true;
          this.inputMode = "pointer";
          this.pointerTargetX = pointer.x;
          this.pointerTargetY = pointer.y;
          this.lastPointerX = pointer.x;
          this.lastPointerY = pointer.y;
          this.pointerBaselineSet = true;

          if (this.status === "ready") {
            this.startGame();
          } else if (this.status === "gameover") {
            this.restartGame();
          }
        }

        private handlePointerUp() {
          // On touch devices, releasing the finger should stop the ship
          // where it is rather than drift to the last touch point. Going
          // back to idle also means a future keyboard press can cleanly
          // switch modes without pointer residue.
          this.pointerActive = false;
          if (this.inputMode === "pointer") {
            this.inputMode = "idle";
          }
        }

        private handlePointerMove(pointer: Phaser.Input.Pointer) {
          // Seed the baseline on the very first pointermove event so that
          // merely entering the canvas doesn't get misread as a "real"
          // mouse movement.
          if (!this.pointerBaselineSet) {
            this.lastPointerX = pointer.x;
            this.lastPointerY = pointer.y;
            this.pointerBaselineSet = true;
            return;
          }
          const dx = pointer.x - this.lastPointerX;
          const dy = pointer.y - this.lastPointerY;
          const moved = Math.hypot(dx, dy);
          this.lastPointerX = pointer.x;
          this.lastPointerY = pointer.y;

          // Dragging (mouse button / finger held) is always pointer intent.
          if (pointer.isDown) {
            this.pointerActive = true;
            this.inputMode = "pointer";
            this.pointerTargetX = pointer.x;
            this.pointerTargetY = pointer.y;
            return;
          }

          // Plain hover only counts as pointer intent if the cursor moved a
          // meaningful amount this frame. A stationary mouse no longer
          // pulls the player while they're using the keyboard.
          if (moved > POINTER_MOVE_THRESHOLD) {
            this.inputMode = "pointer";
            this.pointerTargetX = pointer.x;
            this.pointerTargetY = pointer.y;
          }
        }

        update(time: number, delta: number) {
          // Keyboard input — read direction keys *and* detect a JustDown on
          // any of them so we can flip the input mode on the exact frame the
          // player starts using the keyboard.
          let kx = 0;
          let ky = 0;
          if (this.cursors.left?.isDown || this.keyA.isDown) kx -= 1;
          if (this.cursors.right?.isDown || this.keyD.isDown) kx += 1;
          if (this.cursors.up?.isDown || this.keyW.isDown) ky -= 1;
          if (this.cursors.down?.isDown || this.keyS.isDown) ky += 1;

          const keyboardJustDown =
            (this.cursors.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
            (this.cursors.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
            (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
            (this.cursors.down && Phaser.Input.Keyboard.JustDown(this.cursors.down)) ||
            Phaser.Input.Keyboard.JustDown(this.keyA) ||
            Phaser.Input.Keyboard.JustDown(this.keyD) ||
            Phaser.Input.Keyboard.JustDown(this.keyW) ||
            Phaser.Input.Keyboard.JustDown(this.keyS);

          if (keyboardJustDown) {
            this.inputMode = "keyboard";
          }

          if (this.status === "playing") {
            const body = this.player.body as Phaser.Physics.Arcade.Body;

            if (this.inputMode === "keyboard") {
              // Use *only* the keyboard vector. Hovering mouse is ignored
              // entirely. When every key is released we still stay in
              // keyboard mode (the player's intent is "stop") — a real
              // pointer move is required to switch back to pointer mode.
              if (kx === 0 && ky === 0) {
                body.setVelocity(0, 0);
              } else {
                const len = Math.hypot(kx, ky) || 1;
                body.setVelocity(
                  (kx / len) * PLAYER_SPEED,
                  (ky / len) * PLAYER_SPEED,
                );
              }
            } else if (this.inputMode === "pointer") {
              // Pointer follow (mouse hover on desktop, drag on mobile).
              const dx = this.pointerTargetX - this.player.x;
              const dy = this.pointerTargetY - this.player.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 2) {
                // ease toward pointer target with a capped speed
                const follow = 12; // higher = snappier
                const vx = Phaser.Math.Clamp(dx * follow, -PLAYER_SPEED * 1.2, PLAYER_SPEED * 1.2);
                const vy = Phaser.Math.Clamp(dy * follow, -PLAYER_SPEED * 1.2, PLAYER_SPEED * 1.2);
                body.setVelocity(vx, vy);
              } else {
                body.setVelocity(0, 0);
              }
            } else {
              // idle — waiting for the first input. Ship holds its spot.
              body.setVelocity(0, 0);
            }

            // Clamp to canvas (also enforced by collideWorldBounds, but keep inside tightly)
            const halfW = SHIP_TEX_W / 2;
            const halfH = SHIP_TEX_H / 2;
            this.player.x = Phaser.Math.Clamp(
              this.player.x,
              halfW,
              GAME_WIDTH - halfW,
            );
            this.player.y = Phaser.Math.Clamp(
              this.player.y,
              halfH,
              GAME_HEIGHT - halfH,
            );

            // Update elapsed
            const now = time;
            this.elapsed = (now - this.startedAt) / 1000;
            this.updateTimeText();

            // While frozen, keep bullets pinned at 0 velocity (handles
            // late physics ticks or collisions nudging them).
            if (this.frozen) {
              this.bullets.getChildren().forEach((obj) => {
                const b = obj as BulletSprite;
                if (!b.active) return;
                const body = b.body as Phaser.Physics.Arcade.Body | null;
                if (body) body.setVelocity(0, 0);
              });
            }

            // Keep shield ring glued to the player
            if (this.shieldActive && this.shieldRing) {
              this.shieldRing.setPosition(this.player.x, this.player.y);
            }

            // Refresh effect badge once per frame so countdowns tick visibly
            this.updateEffectText();

            // Expire items that have sat untaken for too long
            this.items.getChildren().forEach((obj) => {
              const item = obj as ItemSprite;
              if (!item.active) return;
              if (item.__expireAt !== undefined && time >= item.__expireAt) {
                this.destroyItem(item);
                return;
              }
              // Keep label glued to its sprite (tween scale moves both so label should track x/y only)
              if (item.__label) {
                item.__label.setPosition(item.x, item.y);
                item.__label.setScale(item.scaleX, item.scaleY);
                item.__label.setAlpha(item.alpha);
              }
            });
          } else {
            // Not playing: stop movement
            const body = this.player.body as Phaser.Physics.Arcade.Body | null;
            if (body) body.setVelocity(0, 0);
          }

          // Recycle offscreen bullets
          const margin = BULLET_RADIUS * 4;
          this.bullets.children.forEach((obj) => {
            const bullet = obj as BulletSprite;
            if (!bullet || !bullet.active) return;
            if (
              bullet.x < -margin ||
              bullet.x > GAME_WIDTH + margin ||
              bullet.y < -margin ||
              bullet.y > GAME_HEIGHT + margin
            ) {
              bullet.__frozenVel = undefined;
              bullet.__slowed = false;
              bullet.disableBody(true, true);
            }
          });

          // Keyboard: start / restart
          if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.status === "ready") this.startGame();
            else if (this.status === "gameover") this.restartGame();
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            if (this.status === "gameover" || this.status === "ready") {
              this.restartGame();
            }
          }

          // delta is unused for time-keeping but referenced to satisfy lints
          void delta;
        }

        private onShutdown() {
          this.stopSpawner();
          this.stopItemSpawner();
          this.stopVolleyTimer();
          this.clearEffects();
          this.clearItems();
          this.trailTimer?.remove(false);
          this.trailTimer = undefined;
          this.input.off("pointerdown", this.handlePointerDown, this);
          this.input.off("pointerup", this.handlePointerUp, this);
          this.input.off("pointermove", this.handlePointerMove, this);
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: "#09090b",
        parent: containerRef.current!,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
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

  // Reference PLAYER_SIZE so unused-var lint doesn't complain — used for sizing intent.
  void PLAYER_SIZE;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[800px] aspect-[4/3] border-2 border-rose-400/30 rounded-lg shadow-[0_0_30px_rgba(251,113,133,0.15)] overflow-hidden bg-black touch-none select-none"
      style={{ touchAction: "none" }}
    />
  );
}
