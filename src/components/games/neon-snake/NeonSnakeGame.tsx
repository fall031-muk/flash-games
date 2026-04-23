"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// -----------------------------------------------------------------------------
// Canvas & grid constants
// -----------------------------------------------------------------------------

const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;

const GRID_COLS = 25;
const GRID_ROWS = 25;
const CELL = 20; // pixels per cell

// Starting state.
const START_COL = 12;
const START_ROW = 12;
const START_LENGTH = 3;

// Tick (ms per grid step).
const TICK_START_MS = 150;
const TICK_MIN_MS = 70;
const TICK_STEP_MS = 10; // reduction per acceleration bracket
const ACCEL_EVERY_LEN = 5; // accelerate every N increases in length

// Swipe thresholds.
const SWIPE_THRESHOLD_PX = 20;

// Input lock after death so the same tap can't insta-restart.
const GAMEOVER_INPUT_LOCK_MS = 300;

// Colors.
const BG_COLOR = 0x09090b;
const GRID_LINE_COLOR = 0xffffff;
const GRID_LINE_ALPHA = 0.04;

const HEAD_COLOR = 0x22d3ee; // cyan
const BODY_HUE_START = 90; // lime (~#a3e635)
const BODY_HUE_END = 350; // rose (~#fb7185)

const FOOD_COLOR = 0xfbbf24; // amber

// Persistence.
const BEST_KEY = "neon-snake-best";

// -----------------------------------------------------------------------------
// Color helpers
// -----------------------------------------------------------------------------

function hslToHex(h: number, s: number, l: number): number {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r, g, b] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r, g, b] = [0, c, x];
  else if (3 <= hp && hp < 4) [r, g, b] = [0, x, c];
  else if (4 <= hp && hp < 5) [r, g, b] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  return (R << 16) | (G << 8) | B;
}

/** Body hue gradient from lime (near head) to rose (tail). */
function bodyColor(segIdx: number, segTotal: number): number {
  if (segTotal <= 1) return hslToHex(BODY_HUE_START, 0.7, 0.58);
  const t = segIdx / Math.max(segTotal - 1, 1);
  // Shortest-path hue interpolation across 360 degrees.
  let h = BODY_HUE_START + (BODY_HUE_END - BODY_HUE_START) * t;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;
  return hslToHex(h, 0.7, 0.58);
}

/** Speed tier: how many "+5 length" bumps have we hit. */
function tickDelayForLength(length: number): number {
  const bumps = Math.max(0, Math.floor((length - START_LENGTH) / ACCEL_EVERY_LEN));
  return Math.max(TICK_MIN_MS, TICK_START_MS - bumps * TICK_STEP_MS);
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type GameStatus = "ready" | "playing" | "gameover";

type Dir = "up" | "down" | "left" | "right";

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIR_DX: Record<Dir, number> = { up: 0, down: 0, left: -1, right: 1 };
const DIR_DY: Record<Dir, number> = { up: -1, down: 1, left: 0, right: 0 };

export type NeonSnakeGameProps = {
  onGameOver?: (length: number) => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function NeonSnakeGame({
  onGameOver,
}: NeonSnakeGameProps = {}) {
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

      // A snake cell on the grid.
      type Segment = {
        col: number;
        row: number;
        rect: Phaser.GameObjects.Rectangle;
      };

      class MainScene extends Phaser.Scene {
        // --- State ----------------------------------------------------
        private status: GameStatus = "ready";
        private snake: Segment[] = []; // index 0 = head, last = tail
        private dir: Dir = "right";
        private dirQueue: Dir[] = [];
        private food: { col: number; row: number; rect: Phaser.GameObjects.Rectangle } | null = null;
        private eatenCount = 0;
        private best = 0;

        // --- Visual layers -------------------------------------------
        private gridLayer!: Phaser.GameObjects.Graphics;
        private snakeLayer!: Phaser.GameObjects.Container;
        private foodLayer!: Phaser.GameObjects.Container;
        private fxLayer!: Phaser.GameObjects.Container;
        private hudLayer!: Phaser.GameObjects.Container;

        // Head-eye graphics (so we can rotate them with direction).
        private eyeL!: Phaser.GameObjects.Rectangle;
        private eyeR!: Phaser.GameObjects.Rectangle;

        // Food pulse tween handle so we can stop it on destroy.
        private foodPulse?: Phaser.Tweens.Tween;

        // --- HUD ------------------------------------------------------
        private lengthText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        // --- Input ----------------------------------------------------
        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;
        private keyUp!: Phaser.Input.Keyboard.Key;
        private keyDown!: Phaser.Input.Keyboard.Key;
        private keyLeft!: Phaser.Input.Keyboard.Key;
        private keyRight!: Phaser.Input.Keyboard.Key;
        private keyW!: Phaser.Input.Keyboard.Key;
        private keyA!: Phaser.Input.Keyboard.Key;
        private keyS!: Phaser.Input.Keyboard.Key;
        private keyD!: Phaser.Input.Keyboard.Key;

        // Pointer/swipe tracking.
        private pointerStartX = 0;
        private pointerStartY = 0;
        private pointerDown = false;
        private pointerMoved = false;

        // --- Timers ---------------------------------------------------
        private tickTimer?: Phaser.Time.TimerEvent;
        private gameOverAt = 0;

        constructor() {
          super("NeonSnake");
        }

        // --------------------------------------------------------------
        // Lifecycle
        // --------------------------------------------------------------
        create() {
          this.cameras.main.setBackgroundColor("#09090b");

          // Grid backdrop.
          this.gridLayer = this.add.graphics().setDepth(0);
          this.drawGrid();

          // Gameplay layers.
          this.fxLayer = this.add.container(0, 0).setDepth(5);
          this.snakeLayer = this.add.container(0, 0).setDepth(10);
          this.foodLayer = this.add.container(0, 0).setDepth(8);

          // Head eyes live on the snake layer, but are built once and
          // repositioned every tick so we can keep their reference.
          this.eyeL = this.add
            .rectangle(-100, -100, 3, 3, 0x09090b, 1)
            .setDepth(11);
          this.eyeR = this.add
            .rectangle(-100, -100, 3, 3, 0x09090b, 1)
            .setDepth(11);

          // HUD pinned to viewport.
          this.hudLayer = this.add.container(0, 0).setDepth(50);
          this.hudLayer.setScrollFactor(0);

          this.lengthText = this.add
            .text(14, 12, "LENGTH 000", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#e4e4e7",
            })
            .setOrigin(0, 0)
            .setShadow(0, 0, "#22d3ee", 6, true, true);
          this.hudLayer.add(this.lengthText);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH - 14, 12, `BEST ${this.format3(this.best)}`, {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#a1a1aa",
            })
            .setOrigin(1, 0);
          this.hudLayer.add(this.bestText);

          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 52, "NEON SNAKE", {
              fontFamily: "monospace",
              fontSize: "28px",
              color: "#e4e4e7",
              align: "center",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#22d3ee", 10, true, true);
          this.hudLayer.add(this.overlayTitle);

          this.overlaySub = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 - 4,
              "PRESS SPACE OR TAP TO START\n\n<- ^ -> v / SWIPE",
              {
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#e4e4e7",
                align: "center",
              },
            )
            .setOrigin(0.5);
          this.hudLayer.add(this.overlaySub);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 52, "", {
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#a1a1aa",
              align: "center",
            })
            .setOrigin(0.5);
          this.hudLayer.add(this.overlayScore);

          // --- Input ---------------------------------------------------
          const kb = this.input.keyboard!;
          this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          this.keyR = kb.addKey(Phaser.Input.Keyboard.KeyCodes.R);
          this.keyUp = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
          this.keyDown = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
          this.keyLeft = kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
          this.keyRight = kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
          this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
          this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
          this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
          this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);

          this.input.on("pointerdown", this.onPointerDown, this);
          this.input.on("pointermove", this.onPointerMove, this);
          this.input.on("pointerup", this.onPointerUp, this);

          this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.onShutdown,
            this,
          );

          this.enterReadyState();
        }

        update() {
          // Edge-detect keys: direction changes + start/restart.
          if (Phaser.Input.Keyboard.JustDown(this.keyUp) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.queueDir("up");
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyDown) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.queueDir("down");
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyLeft) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.queueDir("left");
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyRight) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
            this.queueDir("right");
          }

          const spacePressed = Phaser.Input.Keyboard.JustDown(this.keySpace);
          const rPressed = Phaser.Input.Keyboard.JustDown(this.keyR);
          if (spacePressed) {
            if (this.status === "ready") {
              this.startGame();
            } else if (this.status === "gameover") {
              if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            }
          }
          if (rPressed && this.status !== "playing") {
            const past = this.status === "gameover"
              ? this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS
              : true;
            if (past) this.restartGame();
          }
        }

        // --------------------------------------------------------------
        // State transitions
        // --------------------------------------------------------------
        private enterReadyState() {
          this.status = "ready";
          this.eatenCount = 0;
          this.dir = "right";
          this.dirQueue = [];

          // Stop any running tick timer.
          this.tickTimer?.remove(false);
          this.tickTimer = undefined;

          this.clearSnake();
          this.clearFood();
          this.clearFx();

          // Lay down starting snake (length 3) going right, head at center.
          for (let i = 0; i < START_LENGTH; i++) {
            const col = START_COL - i;
            const row = START_ROW;
            this.snake.push({
              col,
              row,
              rect: this.makeSegmentRect(col, row),
            });
          }
          this.positionHeadEyes();

          // Initial food somewhere not on the snake.
          this.spawnFood();

          this.updateLengthText();
          this.overlayTitle.setText("NEON SNAKE");
          this.overlaySub.setText("PRESS SPACE OR TAP TO START\n\n<- ^ -> v / SWIPE");
          this.overlayScore.setText(
            this.best > 0 ? `BEST ${this.format3(this.best)}` : "",
          );
          this.setOverlayVisible(true);
        }

        private startGame() {
          if (this.status === "playing") return;
          this.status = "playing";
          this.setOverlayVisible(false);

          // Kick off ticker at starting delay.
          this.tickTimer = this.time.addEvent({
            delay: tickDelayForLength(this.snake.length),
            callback: this.tick,
            callbackScope: this,
            loop: true,
          });

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.snakeStart();
            audio.startSnakeBgm();
          }
        }

        private triggerGameOver() {
          if (this.status !== "playing") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;

          this.tickTimer?.remove(false);
          this.tickTimer = undefined;

          this.cameras.main.flash(100, 251, 113, 133);
          this.cameras.main.shake(200, 0.01);

          const len = this.eatenCount;
          if (len > this.best) {
            this.best = len;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.format3(this.best)}`);
          }

          this.time.delayedCall(280, () => {
            if (this.status !== "gameover") return;
            this.setOverlayVisible(true);
            this.overlayTitle.setText("GAME OVER");
            this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
            this.overlayScore.setText(
              `LENGTH ${this.format3(len)}   BEST ${this.format3(this.best)}`,
            );
          });

          const audio = getAudioEngine();
          audio?.snakeDeath();
          audio?.stopSnakeBgm();

          try {
            onGameOverRef.current?.(len);
          } catch (err) {
            console.error("[neon-snake] onGameOver callback error", err);
          }
        }

        private restartGame() {
          this.enterReadyState();
          this.startGame();
        }

        private setOverlayVisible(visible: boolean) {
          this.overlayTitle.setVisible(visible);
          this.overlaySub.setVisible(visible);
          this.overlayScore.setVisible(visible);
        }

        // --------------------------------------------------------------
        // Input
        // --------------------------------------------------------------
        private queueDir(next: Dir) {
          if (this.status !== "playing") return;
          // The queue simulates "what direction we want after subsequent ticks".
          // The last committed direction we compare against is the tail of the
          // queue (or, if empty, the current dir). This makes a fast
          // right->up->left tap chain legal (each turn 90deg).
          const prev = this.dirQueue.length > 0 ? this.dirQueue[this.dirQueue.length - 1] : this.dir;
          if (next === prev) return; // no-op
          if (next === OPPOSITE[prev]) return; // reject suicide U-turn
          // Cap queue length so spamming keys doesn't queue infinitely.
          if (this.dirQueue.length >= 3) return;
          this.dirQueue.push(next);
          getAudioEngine()?.snakeTurn();
        }

        private onPointerDown(p: Phaser.Input.Pointer) {
          this.pointerStartX = p.x;
          this.pointerStartY = p.y;
          this.pointerDown = true;
          this.pointerMoved = false;
        }

        private onPointerMove(p: Phaser.Input.Pointer) {
          if (!this.pointerDown) return;
          const dx = p.x - this.pointerStartX;
          const dy = p.y - this.pointerStartY;
          const adx = Math.abs(dx);
          const ady = Math.abs(dy);
          if (adx < SWIPE_THRESHOLD_PX && ady < SWIPE_THRESHOLD_PX) return;

          this.pointerMoved = true;
          // Pick dominant axis and fire the swipe.
          if (adx >= ady) {
            this.queueDir(dx > 0 ? "right" : "left");
          } else {
            this.queueDir(dy > 0 ? "down" : "up");
          }
          // Reset start so continued movement can swipe again.
          this.pointerStartX = p.x;
          this.pointerStartY = p.y;
        }

        private onPointerUp() {
          const wasTap = this.pointerDown && !this.pointerMoved;
          this.pointerDown = false;
          if (!wasTap) return;

          // Tap semantics: start or restart, never mid-play.
          if (this.status === "ready") {
            this.startGame();
          } else if (this.status === "gameover") {
            if (this.time.now - this.gameOverAt < GAMEOVER_INPUT_LOCK_MS) return;
            this.restartGame();
          }
        }

        // --------------------------------------------------------------
        // Simulation tick
        // --------------------------------------------------------------
        private tick() {
          if (this.status !== "playing") return;

          // Pop one queued direction, if any.
          if (this.dirQueue.length > 0) {
            const next = this.dirQueue.shift()!;
            // Still guard against opposite just in case.
            if (next !== OPPOSITE[this.dir]) {
              this.dir = next;
            }
          }

          const head = this.snake[0];
          const newCol = head.col + DIR_DX[this.dir];
          const newRow = head.row + DIR_DY[this.dir];

          // Wall check.
          if (
            newCol < 0 ||
            newCol >= GRID_COLS ||
            newRow < 0 ||
            newRow >= GRID_ROWS
          ) {
            this.triggerGameOver();
            return;
          }

          // Check if we're about to eat food (determines whether the tail
          // stays or moves).
          const willEat =
            this.food !== null &&
            this.food.col === newCol &&
            this.food.row === newRow;

          // Self-collision: compare against every body segment except the tail,
          // because the tail is about to vacate this cell (unless we eat).
          const bodyEnd = willEat ? this.snake.length : this.snake.length - 1;
          for (let i = 0; i < bodyEnd; i++) {
            const s = this.snake[i];
            if (s.col === newCol && s.row === newRow) {
              this.triggerGameOver();
              return;
            }
          }

          // Leave a short-lived trail ghost where the head was.
          this.spawnTrail(head.col, head.row);

          // Move: push a new head segment; pop tail if not eating.
          if (willEat) {
            // Grow — keep tail.
            const newHead: Segment = {
              col: newCol,
              row: newRow,
              rect: this.makeSegmentRect(newCol, newRow),
            };
            this.snake.unshift(newHead);
            this.eatenCount += 1;
            this.updateLengthText();
            this.consumeFood(newCol, newRow);
            getAudioEngine()?.snakeEat();

            // Possibly adjust tick delay (acceleration) when length hit bump.
            const newDelay = tickDelayForLength(this.snake.length);
            if (this.tickTimer && this.tickTimer.delay !== newDelay) {
              this.tickTimer.reset({
                delay: newDelay,
                callback: this.tick,
                callbackScope: this,
                loop: true,
              });
            }

            // Board fully filled? Treat as a (very theoretical) win.
            if (this.snake.length >= GRID_COLS * GRID_ROWS) {
              this.triggerGameOver();
              return;
            }

            this.spawnFood();
          } else {
            // Shift segments forward: reuse the tail's rect as the new head.
            const tail = this.snake.pop()!;
            tail.col = newCol;
            tail.row = newRow;
            this.snake.unshift(tail);
          }

          // Re-skin the entire snake (head color vs body gradient).
          this.restyleSnake();
          this.positionHeadEyes();
        }

        // --------------------------------------------------------------
        // Snake rendering
        // --------------------------------------------------------------
        private makeSegmentRect(
          col: number,
          row: number,
        ): Phaser.GameObjects.Rectangle {
          // Draw a rect inset by 1px on each side (body gap ~2px).
          const pad = 1;
          const rect = this.add
            .rectangle(
              col * CELL + CELL / 2,
              row * CELL + CELL / 2,
              CELL - pad * 2,
              CELL - pad * 2,
              HEAD_COLOR,
              1,
            )
            .setStrokeStyle(1, 0x09090b, 0.6);
          this.snakeLayer.add(rect);
          return rect;
        }

        private restyleSnake() {
          const total = this.snake.length;
          for (let i = 0; i < total; i++) {
            const s = this.snake[i];
            s.rect.x = s.col * CELL + CELL / 2;
            s.rect.y = s.row * CELL + CELL / 2;
            if (i === 0) {
              s.rect.fillColor = HEAD_COLOR;
              s.rect.setStrokeStyle(1, 0x09090b, 0.4);
            } else {
              s.rect.fillColor = bodyColor(i - 1, Math.max(total - 1, 1));
              s.rect.setStrokeStyle(1, 0x09090b, 0.6);
            }
          }
        }

        private positionHeadEyes() {
          if (this.snake.length === 0) {
            this.eyeL.setPosition(-100, -100);
            this.eyeR.setPosition(-100, -100);
            return;
          }
          const head = this.snake[0];
          const cx = head.col * CELL + CELL / 2;
          const cy = head.row * CELL + CELL / 2;
          // Two eyes offset in the direction of travel, with a small
          // perpendicular spread.
          const fx = DIR_DX[this.dir];
          const fy = DIR_DY[this.dir];
          // Perpendicular axis.
          const px = -fy;
          const py = fx;
          const fwd = 4; // forward offset from center
          const side = 3; // perpendicular half-spread
          this.eyeL.setPosition(cx + fx * fwd + px * side, cy + fy * fwd + py * side);
          this.eyeR.setPosition(cx + fx * fwd - px * side, cy + fy * fwd - py * side);
        }

        private clearSnake() {
          for (const s of this.snake) s.rect.destroy();
          this.snake = [];
          this.eyeL.setPosition(-100, -100);
          this.eyeR.setPosition(-100, -100);
        }

        // --------------------------------------------------------------
        // Food
        // --------------------------------------------------------------
        private spawnFood() {
          // Find a random empty cell.
          const occupied = new Set<number>();
          for (const s of this.snake) {
            occupied.add(s.row * GRID_COLS + s.col);
          }
          const empties: number[] = [];
          for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
            if (!occupied.has(i)) empties.push(i);
          }
          if (empties.length === 0) {
            // Board full — no food to place.
            return;
          }
          const pick = empties[Math.floor(Math.random() * empties.length)];
          const col = pick % GRID_COLS;
          const row = Math.floor(pick / GRID_COLS);

          const rect = this.add
            .rectangle(
              col * CELL + CELL / 2,
              row * CELL + CELL / 2,
              CELL - 4,
              CELL - 4,
              FOOD_COLOR,
              1,
            )
            .setStrokeStyle(1, 0x09090b, 0.5);
          this.foodLayer.add(rect);

          this.food = { col, row, rect };

          // Pulse animation.
          this.foodPulse?.stop();
          this.foodPulse = this.tweens.add({
            targets: rect,
            scale: { from: 1, to: 1.15 },
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });

          // Spawn glint: brief expanding ring.
          const glint = this.add
            .rectangle(
              col * CELL + CELL / 2,
              row * CELL + CELL / 2,
              CELL,
              CELL,
              FOOD_COLOR,
              0.45,
            )
            .setStrokeStyle(1, FOOD_COLOR, 0.9);
          this.fxLayer.add(glint);
          this.tweens.add({
            targets: glint,
            scale: 1.8,
            alpha: 0,
            duration: 280,
            ease: "Sine.easeOut",
            onComplete: () => glint.destroy(),
          });
        }

        private consumeFood(col: number, row: number) {
          if (!this.food) return;
          const cx = col * CELL + CELL / 2;
          const cy = row * CELL + CELL / 2;

          this.foodPulse?.stop();
          this.foodPulse = undefined;
          this.food.rect.destroy();
          this.food = null;

          // Eat particles — 8 tiny amber rects radiating out.
          const N = 8;
          for (let i = 0; i < N; i++) {
            const ang = (i / N) * Math.PI * 2;
            const dist = 24;
            const p = this.add
              .rectangle(cx, cy, 4, 4, FOOD_COLOR, 1)
              .setStrokeStyle(1, 0x09090b, 0.4);
            this.fxLayer.add(p);
            this.tweens.add({
              targets: p,
              x: cx + Math.cos(ang) * dist,
              y: cy + Math.sin(ang) * dist,
              alpha: 0,
              scale: 0.2,
              duration: 320,
              ease: "Sine.easeOut",
              onComplete: () => p.destroy(),
            });
          }
        }

        private clearFood() {
          this.foodPulse?.stop();
          this.foodPulse = undefined;
          if (this.food) {
            this.food.rect.destroy();
            this.food = null;
          }
        }

        // --------------------------------------------------------------
        // FX / trail
        // --------------------------------------------------------------
        private spawnTrail(col: number, row: number) {
          const ghost = this.add
            .rectangle(
              col * CELL + CELL / 2,
              row * CELL + CELL / 2,
              CELL - 2,
              CELL - 2,
              HEAD_COLOR,
              0.35,
            )
            .setStrokeStyle(0);
          this.fxLayer.add(ghost);
          this.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 200,
            ease: "Sine.easeOut",
            onComplete: () => ghost.destroy(),
          });
        }

        private clearFx() {
          // Destroy any fx children, stopping their tweens.
          const children = this.fxLayer.list.slice();
          for (const c of children) {
            this.tweens.killTweensOf(c);
            c.destroy();
          }
        }

        // --------------------------------------------------------------
        // Background grid
        // --------------------------------------------------------------
        private drawGrid() {
          this.gridLayer.clear();
          this.gridLayer.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
          // Vertical lines.
          for (let c = 0; c <= GRID_COLS; c++) {
            const x = c * CELL + 0.5;
            this.gridLayer.beginPath();
            this.gridLayer.moveTo(x, 0);
            this.gridLayer.lineTo(x, GAME_HEIGHT);
            this.gridLayer.strokePath();
          }
          // Horizontal lines.
          for (let r = 0; r <= GRID_ROWS; r++) {
            const y = r * CELL + 0.5;
            this.gridLayer.beginPath();
            this.gridLayer.moveTo(0, y);
            this.gridLayer.lineTo(GAME_WIDTH, y);
            this.gridLayer.strokePath();
          }
        }

        // --------------------------------------------------------------
        // HUD helpers
        // --------------------------------------------------------------
        private updateLengthText() {
          this.lengthText.setText(`LENGTH ${this.format3(this.eatenCount)}`);
        }

        private format3(v: number): string {
          const n = Math.max(0, Math.round(v));
          return String(n).padStart(3, "0");
        }

        // --------------------------------------------------------------
        // Best-score persistence
        // --------------------------------------------------------------
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

        // --------------------------------------------------------------
        // Teardown
        // --------------------------------------------------------------
        private onShutdown() {
          this.tickTimer?.remove(false);
          this.tickTimer = undefined;
          this.foodPulse?.stop();
          this.foodPulse = undefined;
          this.input.off("pointerdown", this.onPointerDown, this);
          this.input.off("pointermove", this.onPointerMove, this);
          this.input.off("pointerup", this.onPointerUp, this);
          this.clearSnake();
          this.clearFood();
          this.clearFx();
          getAudioEngine()?.stopSnakeBgm();
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
      className="w-full max-w-[500px] aspect-square border-2 border-zinc-400/30 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden bg-black touch-none select-none"
      style={{ touchAction: "none" }}
    />
  );
}
