"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// -----------------------------------------------------------------------------
// Canvas & world constants
// -----------------------------------------------------------------------------

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const BLOCK_HEIGHT = 20;
const BASE_BLOCK_WIDTH = 160; // initial footprint at the bottom
const MAX_BLOCK_WIDTH = BASE_BLOCK_WIDTH; // upper cap for perfect-bonus recovery

// Y of the base block (center). Sits near the bottom of the canvas.
const BASE_BLOCK_CENTER_Y = GAME_HEIGHT - 60;

// Moving block spawns this far above the tower top (world coords, negative).
const SPAWN_OFFSET_ABOVE = 140;

// Horizontal travel is clamped to an interior padding so very wide blocks
// don't shoot off-canvas. In practice we re-center the span around the
// canvas, letting the block half slide past either side depending on width.
const TRAVEL_PAD = 20;

// Camera panning. If the stack top gets within this many pixels of the
// scene-relative top edge, we scroll the camera up so the new block has
// breathing room at the top of the viewport.
const CAMERA_TOP_MARGIN = GAME_HEIGHT / 3;

// Game-over trim threshold. If the intersection shrinks below this, die.
const MIN_BLOCK_WIDTH = 2;

// Perfect-stop tolerance in pixels — if the offset between centers is less
// than or equal to this AND the widths match, it's a perfect.
const PERFECT_OFFSET_PX = 1.5;

// Legacy "95% overlap" rule is also honoured for perfect detection.
const PERFECT_OVERLAP_RATIO = 0.95;
const PERFECT_WIDTH_BONUS = 5;

// Chip / cut-off block physics (falling debris).
const CHIP_GRAVITY = 900; // px/s^2
const CHIP_LIFETIME_MS = 1400;

// Delay between a drop and the next block spawning.
const NEXT_BLOCK_DELAY_MS = 160;

// After a game-over we briefly lock input so the same tap can't auto-restart.
const GAMEOVER_INPUT_LOCK_MS = 300;

// -----------------------------------------------------------------------------
// Moving-block speed curve — full yoyo period (ms) as a function of height.
// Lower value = faster movement = harder.
// -----------------------------------------------------------------------------
function movePeriodMsForHeight(height: number): number {
  if (height <= 5) return 3000;
  if (height <= 15) return 2400;
  if (height <= 30) return 1800;
  if (height <= 50) return 1400;
  return 1000;
}

// -----------------------------------------------------------------------------
// Visual palette
// -----------------------------------------------------------------------------

// HSL hue rotation. Each new block picks the next hue in the cycle.
// Matches the rose → amber → lime → cyan → violet vibe.
const HUE_CYCLE: number[] = [
  350, // rose
  40, // amber
  100, // lime
  180, // cyan
  270, // violet
];

function hslToHex(h: number, s: number, l: number): number {
  // h in [0,360], s/l in [0,1].
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

function colorForHeight(height: number): number {
  const idx = height % HUE_CYCLE.length;
  const hue = HUE_CYCLE[idx];
  // Slight lightness wave so neighbouring floors aren't identical saturation.
  const l = 0.58 + ((height % 2) === 0 ? 0 : 0.04);
  return hslToHex(hue, 0.7, l);
}

// -----------------------------------------------------------------------------
// Persistence
// -----------------------------------------------------------------------------

const BEST_KEY = "tower-stacker-best";

// -----------------------------------------------------------------------------
// Component props
// -----------------------------------------------------------------------------

type GameStatus = "ready" | "playing" | "gameover";

export type TowerStackerGameProps = {
  onGameOver?: (height: number) => void;
};

export default function TowerStackerGame({
  onGameOver,
}: TowerStackerGameProps = {}) {
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

      // A static block in the tower.
      type TowerBlock = {
        rect: Phaser.GameObjects.Rectangle;
        // Logical footprint (world space, not screen space).
        // x is the block's CENTER x, y its CENTER y.
        x: number;
        y: number;
        width: number;
        color: number;
      };

      // A falling chip shown after a trim.
      type Chip = {
        rect: Phaser.GameObjects.Rectangle;
        vy: number;
        vx: number;
        spin: number;
        bornAt: number;
      };

      // A twinkling background star.
      type Star = {
        gfx: Phaser.GameObjects.Arc;
        baseAlpha: number;
        twinkleSpeed: number;
        phase: number;
      };

      class MainScene extends Phaser.Scene {
        // --- State ------------------------------------------------------
        private status: GameStatus = "ready";
        private height = 0; // completed floors (excluding base)
        private best = 0;

        // The tower (bottom-most first, top-most last). Index 0 = base.
        private tower: TowerBlock[] = [];

        // Currently moving block (before drop). null when no block is live.
        private activeBlock: Phaser.GameObjects.Rectangle | null = null;
        private activeWidth = 0;
        private activeColor = 0;
        private activeTween?: Phaser.Tweens.Tween;

        // Falling chips.
        private chips: Chip[] = [];

        // Perfect-stop combo tracking.
        private perfectCombo = 0;

        // Input lock timer after game-over.
        private gameOverAt = 0;

        // Camera target scroll Y (scene world y of what should appear at
        // viewport y=0). Tween-driven.
        private targetScrollY = 0;
        // Tween for camera scroll.
        private cameraTween?: Phaser.Tweens.Tween;

        // Background stars.
        private stars: Star[] = [];
        private starsLayer!: Phaser.GameObjects.Container;

        // Depth fade gradient drawn under the abyss (shown as we scroll up).
        private abyssGfx!: Phaser.GameObjects.Graphics;

        // --- HUD --------------------------------------------------------
        private heightText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private perfectText!: Phaser.GameObjects.Text;
        private comboText!: Phaser.GameObjects.Text;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        // HUD container pinned to the camera viewport.
        private hudLayer!: Phaser.GameObjects.Container;

        // Flash rectangle for perfect hits.
        private flashRect!: Phaser.GameObjects.Rectangle;

        // --- Input ------------------------------------------------------
        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;

        // --- Timers -----------------------------------------------------
        private nextBlockTimer?: Phaser.Time.TimerEvent;

        constructor() {
          super("TowerStacker");
        }

        // -----------------------------------------------------------------
        // Lifecycle
        // -----------------------------------------------------------------
        create() {
          this.cameras.main.setBackgroundColor("#09090b");

          // Abyss gradient (depth 0) — starts invisible and becomes visible
          // as the camera pans up, revealing the dark pit below.
          this.abyssGfx = this.add.graphics().setDepth(0);

          // Stars live in a container, depth 1. They're sprinkled across the
          // world above the start area and follow the camera naturally.
          this.starsLayer = this.add.container(0, 0).setDepth(1);

          // --- HUD (pinned to viewport) --------------------------------
          this.hudLayer = this.add.container(0, 0).setDepth(50);
          this.hudLayer.setScrollFactor(0);

          this.heightText = this.add
            .text(GAME_WIDTH / 2, 18, "HEIGHT 000", {
              fontFamily: "monospace",
              fontSize: "22px",
              color: "#e4e4e7",
              align: "center",
            })
            .setOrigin(0.5, 0)
            .setShadow(0, 0, "#fde047", 6, true, true);
          this.hudLayer.add(this.heightText);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH - 16, 18, `BEST ${this.formatH(this.best)}`, {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#a1a1aa",
            })
            .setOrigin(1, 0);
          this.hudLayer.add(this.bestText);

          this.perfectText = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "PERFECT!", {
              fontFamily: "monospace",
              fontSize: "32px",
              color: "#fde047",
              align: "center",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#fde047", 10, true, true)
            .setVisible(false);
          this.hudLayer.add(this.perfectText);

          this.comboText = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#fde047",
              align: "center",
            })
            .setOrigin(0.5)
            .setVisible(false);
          this.hudLayer.add(this.comboText);

          // Overlay (ready / game-over). Also pinned to viewport.
          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "TOWER STACKER", {
              fontFamily: "monospace",
              fontSize: "28px",
              color: "#e4e4e7",
              align: "center",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#fde047", 10, true, true);
          this.hudLayer.add(this.overlayTitle);

          this.overlaySub = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 - 10,
              "TAP OR PRESS SPACE TO START",
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
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, "", {
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#a1a1aa",
              align: "center",
            })
            .setOrigin(0.5);
          this.hudLayer.add(this.overlayScore);

          // Full-screen flash used on PERFECT. Pinned to viewport.
          this.flashRect = this.add
            .rectangle(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2,
              GAME_WIDTH,
              GAME_HEIGHT,
              0xfde047,
              0,
            )
            .setScrollFactor(0)
            .setDepth(45);

          // --- Input ---------------------------------------------------
          this.keySpace = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
          );
          this.keyR = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.R,
          );
          this.input.on("pointerdown", this.handlePointerDown, this);

          this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.onShutdown,
            this,
          );

          // Seed stars across a tall strip so there's always something to
          // reveal when the camera pans upward.
          this.spawnStars();

          this.enterReadyState();
        }

        // -----------------------------------------------------------------
        // State transitions
        // -----------------------------------------------------------------
        private enterReadyState() {
          this.status = "ready";
          this.height = 0;
          this.perfectCombo = 0;
          this.targetScrollY = 0;
          this.cameras.main.scrollY = 0;

          this.clearActiveBlock();
          this.clearTower();
          this.clearChips();
          this.cameraTween?.stop();
          this.cameraTween = undefined;

          // Build the initial base block centered at the bottom.
          this.addBaseBlock();

          this.updateHudOverlayVisible(true);
          this.overlayTitle.setText("TOWER STACKER");
          this.overlaySub.setText("TAP OR PRESS SPACE TO START");
          this.overlayScore.setText(
            this.best > 0 ? `BEST ${this.formatH(this.best)}` : "",
          );
          this.updateHeightText();
        }

        private startGame() {
          if (this.status === "playing") return;
          this.status = "playing";
          this.perfectCombo = 0;
          this.updateHudOverlayVisible(false);
          this.hidePerfect();
          this.spawnActiveBlock();

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.towerStart();
            audio.startTowerBgm();
          }
        }

        private triggerGameOver() {
          if (this.status !== "playing") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;

          // Stop any active moving block and pending timers.
          if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = undefined;
          }
          this.nextBlockTimer?.remove(false);
          this.nextBlockTimer = undefined;

          // Short camera shake + red flash.
          this.cameras.main.shake(260, 0.008);
          this.cameras.main.flash(240, 251, 113, 133);

          // Save best.
          const h = this.height;
          if (h > this.best) {
            this.best = h;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.formatH(this.best)}`);
          }

          // Reveal game-over overlay after a short beat so the shake reads.
          this.time.delayedCall(420, () => {
            if (this.status !== "gameover") return;
            this.updateHudOverlayVisible(true);
            this.overlayTitle.setText("GAME OVER");
            this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
            this.overlayScore.setText(
              `HEIGHT ${this.formatH(h)}   BEST ${this.formatH(this.best)}`,
            );
          });

          const audio = getAudioEngine();
          audio?.towerGameOver();
          audio?.stopTowerBgm();

          try {
            onGameOverRef.current?.(h);
          } catch (err) {
            console.error("[tower-stacker] onGameOver callback error", err);
          }
        }

        private restartGame() {
          this.enterReadyState();
          this.startGame();
        }

        private updateHudOverlayVisible(visible: boolean) {
          this.overlayTitle.setVisible(visible);
          this.overlaySub.setVisible(visible);
          this.overlayScore.setVisible(visible);
        }

        // -----------------------------------------------------------------
        // Input
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
            this.dropActiveBlock();
          }
        }

        update(time: number, _delta: number) {
          const dt = _delta / 1000;

          // --- Keyboard handling (edge-detected) --------------------------
          const spacePressed = Phaser.Input.Keyboard.JustDown(this.keySpace);
          if (spacePressed) {
            if (this.status === "ready") {
              this.startGame();
            } else if (this.status === "gameover") {
              if (time - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            } else if (this.status === "playing") {
              this.dropActiveBlock();
            }
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            if (this.status !== "playing") {
              this.restartGame();
            }
          }

          // --- Update chips (fall off-screen) -----------------------------
          this.updateChips(dt, time);

          // --- Twinkling stars ------------------------------------------
          for (const s of this.stars) {
            const a =
              s.baseAlpha +
              Math.sin(time / 1000 * s.twinkleSpeed + s.phase) * 0.15;
            s.gfx.setAlpha(Phaser.Math.Clamp(a, 0.05, 1));
          }

          // --- Redraw abyss gradient (based on current camera scrollY) --
          this.redrawAbyss();
        }

        // -----------------------------------------------------------------
        // Tower / blocks
        // -----------------------------------------------------------------
        private clearTower() {
          for (const b of this.tower) b.rect.destroy();
          this.tower = [];
        }

        private clearActiveBlock() {
          if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = undefined;
          }
          if (this.activeBlock) {
            this.activeBlock.destroy();
            this.activeBlock = null;
          }
        }

        private clearChips() {
          for (const c of this.chips) c.rect.destroy();
          this.chips = [];
        }

        private addBaseBlock() {
          const color = colorForHeight(0);
          const rect = this.add
            .rectangle(
              GAME_WIDTH / 2,
              BASE_BLOCK_CENTER_Y,
              BASE_BLOCK_WIDTH,
              BLOCK_HEIGHT,
              color,
              1,
            )
            .setStrokeStyle(1, 0x09090b, 0.5)
            .setDepth(10);
          this.tower.push({
            rect,
            x: GAME_WIDTH / 2,
            y: BASE_BLOCK_CENTER_Y,
            width: BASE_BLOCK_WIDTH,
            color,
          });
        }

        private topBlock(): TowerBlock {
          return this.tower[this.tower.length - 1];
        }

        private spawnActiveBlock() {
          const prev = this.topBlock();
          // Width equals the width of the block directly below us.
          const width = prev.width;

          // Alternate direction every floor so it feels varied: even floors
          // enter from the left, odd floors from the right.
          const fromLeft = this.tower.length % 2 === 1;

          // Travel endpoints (center x) — keep within canvas minus pad.
          // Block centers reach from TRAVEL_PAD to GAME_WIDTH - TRAVEL_PAD.
          const minCx = TRAVEL_PAD + width / 2;
          const maxCx = GAME_WIDTH - TRAVEL_PAD - width / 2;

          const startX = fromLeft ? minCx : maxCx;
          const endX = fromLeft ? maxCx : minCx;

          // World y for the new moving block sits one step above previous top.
          const y = prev.y - BLOCK_HEIGHT;

          // Next color in the cycle. We use tower.length as floor index (0=base).
          const color = colorForHeight(this.tower.length);

          const rect = this.add
            .rectangle(startX, y, width, BLOCK_HEIGHT, color, 1)
            .setStrokeStyle(1, 0x09090b, 0.5)
            .setDepth(10);

          this.activeBlock = rect;
          this.activeWidth = width;
          this.activeColor = color;

          // Speed scales with current height.
          const fullPeriod = movePeriodMsForHeight(this.height);
          // Yoyo covers one-way; a full cycle is out-and-back = 2 * half.
          const halfPeriod = fullPeriod / 2;

          this.activeTween = this.tweens.add({
            targets: rect,
            x: endX,
            duration: halfPeriod,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });

          // Ensure the camera follows the new top if needed.
          this.maybePanCameraUp(y);
        }

        private dropActiveBlock() {
          if (!this.activeBlock) return;
          // Stop movement; freeze current x.
          if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = undefined;
          }
          const movingX = this.activeBlock.x;
          const movingY = this.activeBlock.y;
          const movingWidth = this.activeWidth;
          const color = this.activeColor;

          const prev = this.topBlock();

          // Compute horizontal overlap (in block-coord space).
          const movingLeft = movingX - movingWidth / 2;
          const movingRight = movingX + movingWidth / 2;
          const prevLeft = prev.x - prev.width / 2;
          const prevRight = prev.x + prev.width / 2;

          const overlapLeft = Math.max(movingLeft, prevLeft);
          const overlapRight = Math.min(movingRight, prevRight);
          const overlap = overlapRight - overlapLeft;

          // Snapshot the moving rectangle's transform before we destroy it.
          this.activeBlock.destroy();
          this.activeBlock = null;

          if (overlap < MIN_BLOCK_WIDTH) {
            // No (or almost no) overlap — the block is pure miss. Drop the
            // *entire* misplaced block as a chip and end the run.
            this.spawnFullMissChip(
              movingX,
              movingY,
              movingWidth,
              BLOCK_HEIGHT,
              color,
            );
            getAudioEngine()?.towerDrop();
            getAudioEngine()?.towerChip();
            this.triggerGameOver();
            return;
          }

          // Perfect-stop check. Two ways to qualify:
          //   1) centers essentially aligned (within PERFECT_OFFSET_PX), or
          //   2) overlap / moving width >= 95%.
          const centerDelta = Math.abs(movingX - prev.x);
          const overlapRatio = overlap / Math.max(movingWidth, 1);
          const perfect =
            centerDelta <= PERFECT_OFFSET_PX ||
            overlapRatio >= PERFECT_OVERLAP_RATIO;

          let finalWidth: number;
          let finalCx: number;

          if (perfect) {
            // Snap centered on prev block. Grow width a little (capped).
            finalWidth = Math.min(movingWidth + PERFECT_WIDTH_BONUS, MAX_BLOCK_WIDTH);
            finalCx = prev.x;
            this.perfectCombo += 1;
            this.showPerfect(this.perfectCombo);
            getAudioEngine()?.towerPerfect();
          } else {
            // Trim to overlap span. Chip off the sliver that missed.
            finalWidth = overlap;
            finalCx = (overlapLeft + overlapRight) / 2;
            this.perfectCombo = 0;
            this.hidePerfect();
            this.spawnTrimChip(
              movingX,
              movingY,
              movingWidth,
              overlapLeft,
              overlapRight,
              color,
            );
            getAudioEngine()?.towerDrop();
            getAudioEngine()?.towerChip();
          }

          // Create the resting block.
          const landed = this.add
            .rectangle(finalCx, movingY, finalWidth, BLOCK_HEIGHT, color, 1)
            .setStrokeStyle(1, 0x09090b, 0.5)
            .setDepth(10);

          // Micro squash/stretch on landing for juice.
          landed.setScale(1, 0.7);
          this.tweens.add({
            targets: landed,
            scaleY: 1,
            duration: 120,
            ease: "Back.easeOut",
          });

          this.tower.push({
            rect: landed,
            x: finalCx,
            y: movingY,
            width: finalWidth,
            color,
          });
          this.height += 1;
          this.updateHeightText();

          if (!perfect) {
            getAudioEngine()?.towerDrop();
          }

          // Another game-over path: if the surviving block is too narrow to
          // meaningfully stack on, end the run.
          if (finalWidth < MIN_BLOCK_WIDTH) {
            this.triggerGameOver();
            return;
          }

          // Spawn the next block after a brief pause so the landing reads.
          this.nextBlockTimer?.remove(false);
          this.nextBlockTimer = this.time.delayedCall(
            NEXT_BLOCK_DELAY_MS,
            () => {
              if (this.status === "playing") this.spawnActiveBlock();
            },
          );
        }

        private showPerfect(combo: number) {
          this.perfectText.setVisible(true).setAlpha(1);
          if (combo >= 2) {
            this.comboText.setText(`COMBO x${combo}`).setVisible(true).setAlpha(1);
          } else {
            this.comboText.setVisible(false);
          }
          this.flashRect.setAlpha(0.35);
          this.tweens.add({
            targets: this.flashRect,
            alpha: 0,
            duration: 220,
            ease: "Sine.easeOut",
          });

          // Auto-hide after 2s unless replaced by a new perfect.
          this.time.delayedCall(2000, () => {
            if (this.perfectText.alpha > 0) {
              this.tweens.add({
                targets: [this.perfectText, this.comboText],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                  this.perfectText.setVisible(false);
                  this.comboText.setVisible(false);
                },
              });
            }
          });
        }

        private hidePerfect() {
          this.perfectText.setVisible(false);
          this.comboText.setVisible(false);
        }

        // -----------------------------------------------------------------
        // Chips (debris)
        // -----------------------------------------------------------------
        private spawnTrimChip(
          movingX: number,
          y: number,
          movingWidth: number,
          overlapLeft: number,
          overlapRight: number,
          color: number,
        ) {
          const left = movingX - movingWidth / 2;
          const right = movingX + movingWidth / 2;

          // Left chip (the portion of the moving block left of overlapLeft).
          if (left < overlapLeft) {
            const w = overlapLeft - left;
            const cx = left + w / 2;
            this.addChip(cx, y, w, BLOCK_HEIGHT, color, -60);
          }
          // Right chip.
          if (right > overlapRight) {
            const w = right - overlapRight;
            const cx = overlapRight + w / 2;
            this.addChip(cx, y, w, BLOCK_HEIGHT, color, 60);
          }
        }

        private spawnFullMissChip(
          cx: number,
          y: number,
          width: number,
          _height: number,
          color: number,
        ) {
          // Whole block falls straight down.
          this.addChip(cx, y, width, BLOCK_HEIGHT, color, 0);
        }

        private addChip(
          cx: number,
          cy: number,
          w: number,
          h: number,
          color: number,
          vx: number,
        ) {
          const rect = this.add
            .rectangle(cx, cy, w, h, color, 1)
            .setStrokeStyle(1, 0x09090b, 0.5)
            .setDepth(9);
          const spin = Phaser.Math.FloatBetween(-3.5, 3.5);
          this.chips.push({
            rect,
            vy: -120, // small upward kick for juice
            vx,
            spin,
            bornAt: this.time.now,
          });
        }

        private updateChips(dt: number, time: number) {
          if (this.chips.length === 0) return;
          const survivors: Chip[] = [];
          // Use camera scrollY to decide if a chip fell off-screen.
          const cullY = this.cameras.main.scrollY + GAME_HEIGHT + 80;
          for (const c of this.chips) {
            c.vy += CHIP_GRAVITY * dt;
            c.rect.x += c.vx * dt;
            c.rect.y += c.vy * dt;
            c.rect.rotation += c.spin * dt;
            if (
              time - c.bornAt < CHIP_LIFETIME_MS &&
              c.rect.y < cullY &&
              c.rect.x > -200 &&
              c.rect.x < GAME_WIDTH + 200
            ) {
              survivors.push(c);
            } else {
              c.rect.destroy();
            }
          }
          this.chips = survivors;
        }

        // -----------------------------------------------------------------
        // Camera panning
        // -----------------------------------------------------------------
        private maybePanCameraUp(newBlockY: number) {
          // newBlockY is in world space (negative y = higher up).
          // We want the new block to sit roughly at CAMERA_TOP_MARGIN below
          // the viewport's top edge. Viewport y = 0 corresponds to
          // camera.scrollY, so the viewport range is [scrollY, scrollY + GAME_HEIGHT).
          // For the new block to appear at viewport y = CAMERA_TOP_MARGIN, we
          // need scrollY = newBlockY - CAMERA_TOP_MARGIN.
          const desired = newBlockY - CAMERA_TOP_MARGIN;
          // Camera should only scroll up (towards more-negative y) as tower grows.
          if (desired >= this.targetScrollY) return;
          this.targetScrollY = desired;

          // Tween scrollY smoothly.
          this.cameraTween?.stop();
          this.cameraTween = this.tweens.addCounter({
            from: this.cameras.main.scrollY,
            to: desired,
            duration: 350,
            ease: "Sine.easeInOut",
            onUpdate: (tw) => {
              this.cameras.main.scrollY = tw.getValue() ?? desired;
            },
            onComplete: () => {
              this.cameras.main.scrollY = desired;
            },
          });
        }

        // -----------------------------------------------------------------
        // Stars / background
        // -----------------------------------------------------------------
        private spawnStars() {
          // Sprinkle stars in a tall strip from ~200 px below start up to
          // a long way above. 120 stars is light-weight and plenty dense.
          const STAR_COUNT = 120;
          const TOP = -3000;
          const BOTTOM = GAME_HEIGHT + 100;
          for (let i = 0; i < STAR_COUNT; i++) {
            const x = Phaser.Math.Between(0, GAME_WIDTH);
            const y = Phaser.Math.Between(TOP, BOTTOM);
            const r = Phaser.Math.FloatBetween(0.5, 1.6);
            const baseAlpha = Phaser.Math.FloatBetween(0.2, 0.7);
            const gfx = this.add
              .circle(x, y, r, 0xffffff, baseAlpha)
              .setDepth(1);
            this.starsLayer.add(gfx);
            this.stars.push({
              gfx,
              baseAlpha,
              twinkleSpeed: Phaser.Math.FloatBetween(0.4, 1.6),
              phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
            });
          }
        }

        private redrawAbyss() {
          // Re-draw a soft vertical fade below the bottom of the tower, so
          // deep drops feel bottomless. This is all in world coords under
          // depth 0, with the camera scrolled up as needed.
          this.abyssGfx.clear();
          // World-y where the abyss begins: just below the base block.
          const topY = BASE_BLOCK_CENTER_Y + BLOCK_HEIGHT / 2;
          const camTop = this.cameras.main.scrollY;
          const camBottom = camTop + GAME_HEIGHT;
          if (camBottom < topY) return; // base isn't in view

          // Strips of darkening color.
          const strips = 14;
          for (let i = 0; i < strips; i++) {
            const t = i / (strips - 1);
            const y = topY + i * 24;
            // Fade from #111 down to pure black.
            const shade = Math.round(17 * (1 - t));
            const rgb = (shade << 16) | (shade << 8) | shade;
            this.abyssGfx.fillStyle(rgb, 1);
            this.abyssGfx.fillRect(0, y, GAME_WIDTH, 24 + 1);
          }
        }

        // -----------------------------------------------------------------
        // HUD helpers
        // -----------------------------------------------------------------
        private updateHeightText() {
          this.heightText.setText(`HEIGHT ${this.formatH(this.height)}`);
        }

        private formatH(v: number): string {
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
          if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = undefined;
          }
          if (this.cameraTween) {
            this.cameraTween.stop();
            this.cameraTween = undefined;
          }
          if (this.nextBlockTimer) {
            this.nextBlockTimer.remove(false);
            this.nextBlockTimer = undefined;
          }
          this.clearActiveBlock();
          this.clearTower();
          this.clearChips();
          this.input.off("pointerdown", this.handlePointerDown, this);
          getAudioEngine()?.stopTowerBgm();
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
        // Tower Stacker does its own physics for chips; no arcade/Matter world.
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
      className="w-full max-w-[400px] aspect-[2/3] border-2 border-zinc-400/30 rounded-lg shadow-[0_0_30px_rgba(253,224,71,0.12)] overflow-hidden bg-black touch-none select-none"
      style={{ touchAction: "none" }}
    />
  );
}
