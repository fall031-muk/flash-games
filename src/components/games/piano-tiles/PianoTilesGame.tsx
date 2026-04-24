"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// Canvas / lanes
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const LANES = 4;
const LANE_WIDTH = GAME_WIDTH / LANES;

// Tile
const TILE_HEIGHT = 120;
const TILE_MARGIN = 4; // vertical padding inside each tile spawn

// Scroll speed curve
const SCROLL_START = 240; // px/s
const SCROLL_PER_HIT = 4; // +px/s per successful tap
const SCROLL_MAX = 820;

// Tile spacing in pixels — 하나의 타일이 스폰될 때마다 이전 타일에서 떨어진 간격
// 낮은 값 = 더 빡빡 (현재 타일 높이랑 같게 하면 연속 붙음)
const TILE_SPAWN_GAP = TILE_HEIGHT; // 붙여서 계속 떨어지도록

// Input lock
const GAMEOVER_INPUT_LOCK_MS = 300;

// Persistence
const BEST_KEY = "piano-tiles-best";

type LaneIdx = 0 | 1 | 2 | 3;

type TileSprite = Phaser.GameObjects.Rectangle & {
  __lane?: LaneIdx;
  __spawnedAtY?: number;
  __spawnedAt?: number;
};

export type PianoTilesGameProps = {
  onGameOver?: (tilesHit: number) => void;
};

export default function PianoTilesGame({ onGameOver }: PianoTilesGameProps = {}) {
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

      class MainScene extends Phaser.Scene {
        private status: "ready" | "playing" | "gameover" = "ready";
        private gameOverAt = 0;

        private tiles: TileSprite[] = [];
        private score = 0;
        private best = 0;
        private speed = SCROLL_START;
        private nextSpawnY = 0; // where in world we're about to spawn the next tile
        private lastSpawnLane: LaneIdx | null = null;

        private scoreText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private speedText!: Phaser.GameObjects.Text;

        private hitLine!: Phaser.GameObjects.Rectangle;
        private laneDividers: Phaser.GameObjects.Rectangle[] = [];

        private overlayBg!: Phaser.GameObjects.Rectangle;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;
        private keyD!: Phaser.Input.Keyboard.Key;
        private keyF!: Phaser.Input.Keyboard.Key;
        private keyJ!: Phaser.Input.Keyboard.Key;
        private keyK!: Phaser.Input.Keyboard.Key;

        constructor() {
          super("PianoTiles");
        }

        create() {
          this.cameras.main.setBackgroundColor(0x0a0a0a);

          // Lane dividers
          for (let i = 1; i < LANES; i++) {
            const x = i * LANE_WIDTH;
            const rect = this.add
              .rectangle(x, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0x27272a, 0.6)
              .setOrigin(0.5, 0.5)
              .setDepth(1);
            this.laneDividers.push(rect);
          }

          // Hit line (bottom reference)
          this.hitLine = this.add
            .rectangle(
              GAME_WIDTH / 2,
              GAME_HEIGHT - 10,
              GAME_WIDTH,
              2,
              0x34d399,
              0.4,
            )
            .setOrigin(0.5, 0.5)
            .setDepth(5);

          // HUD
          this.scoreText = this.add
            .text(12, 10, "SCORE 0000", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#34d399",
            })
            .setDepth(40)
            .setShadow(0, 0, "#34d399", 8, true, true);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH - 12, 10, `BEST ${this.formatScore(this.best)}`, {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#a1a1aa",
            })
            .setOrigin(1, 0)
            .setDepth(40);

          this.speedText = this.add
            .text(GAME_WIDTH / 2, 10, "", {
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#71717a",
            })
            .setOrigin(0.5, 0)
            .setDepth(40);

          // Overlay
          this.overlayBg = this.add
            .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(50);

          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, "PIANO TILES", {
              fontFamily: "monospace",
              fontSize: "26px",
              color: "#34d399",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(51)
            .setShadow(0, 0, "#34d399", 12, true, true);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, "", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#fde047",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(51);

          this.overlaySub = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 + 24,
              "TAP BLACK TILES\n\nSPACE OR TAP TO START",
              {
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#a1a1aa",
                align: "center",
              },
            )
            .setOrigin(0.5)
            .setDepth(51);

          // Inputs
          this.keySpace = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
          );
          this.keyR = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.R,
          );
          this.keyD = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.D,
          );
          this.keyF = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.F,
          );
          this.keyJ = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.J,
          );
          this.keyK = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.K,
          );
          this.input.on("pointerdown", this.handlePointerDown, this);

          this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
        }

        update(_time: number, delta: number) {
          if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.status === "ready") this.startGame();
            else if (this.status === "gameover") {
              if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            }
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            if (this.status === "gameover" || this.status === "ready") {
              if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            }
          }

          if (this.status === "playing") {
            // Keyboard lane inputs — D F J K
            if (Phaser.Input.Keyboard.JustDown(this.keyD))
              this.attemptLaneTap(0);
            if (Phaser.Input.Keyboard.JustDown(this.keyF))
              this.attemptLaneTap(1);
            if (Phaser.Input.Keyboard.JustDown(this.keyJ))
              this.attemptLaneTap(2);
            if (Phaser.Input.Keyboard.JustDown(this.keyK))
              this.attemptLaneTap(3);

            // Move all tiles down
            const dt = delta / 1000;
            const dy = this.speed * dt;
            for (const t of this.tiles) {
              t.y += dy;
            }
            // Spawn new tile when the last one is far enough below the top
            const topMost = this.topmostTileY();
            if (topMost >= 0) {
              // spawn when topmost tile has moved down past the gap
              while (topMost - (this.getHighestSpawnY() ?? topMost) >= 0) {
                if (!this.maybeSpawnTile()) break;
              }
            } else {
              // no tiles yet (edge case) — spawn one
              this.maybeSpawnTile();
            }
            // Ensure there is always enough tile coverage
            while (this.needsMoreTiles()) {
              if (!this.maybeSpawnTile()) break;
            }

            // Check for missed tiles (reached bottom)
            for (const t of this.tiles) {
              if (!t.active) continue;
              if (t.y - TILE_HEIGHT / 2 >= GAME_HEIGHT) {
                this.triggerGameOver("missed");
                return;
              }
            }

            // Update speed HUD
            this.speedText.setText(`SPD ${Math.round(this.speed)}`);
          }
        }

        private handlePointerDown = (pointer: Phaser.Input.Pointer) => {
          if (this.status === "ready") {
            this.startGame();
            return;
          }
          if (this.status === "gameover") {
            if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
              this.restartGame();
            }
            return;
          }
          // Map pointer.x to lane
          const lane = Math.min(
            LANES - 1,
            Math.max(0, Math.floor(pointer.x / LANE_WIDTH)),
          ) as LaneIdx;
          this.attemptLaneTap(lane);
        };

        // --- Gameplay ------------------------------------------------------
        private startGame() {
          this.clearTiles();
          this.score = 0;
          this.speed = SCROLL_START;
          this.lastSpawnLane = null;
          this.updateScore();
          this.hideOverlay();
          this.status = "playing";

          // Seed starting field: spawn a column of tiles so there's always one
          // approaching the hit line. We start with nothing at the very top
          // so the player has a moment to react.
          this.nextSpawnY = -TILE_HEIGHT / 2;
          for (let i = 0; i < 4; i++) {
            this.maybeSpawnTile();
          }

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
          }
        }

        private restartGame() {
          this.startGame();
        }

        private triggerGameOver(_reason: "wrong" | "missed") {
          if (this.status === "gameover") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;

          if (this.score > this.best) {
            this.best = this.score;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.formatScore(this.best)}`);
          }

          this.cameras.main.shake(220, 0.012);
          this.cameras.main.flash(160, 251, 113, 133);

          this.overlayTitle.setText("GAME OVER");
          this.overlayScore.setText(
            `${this.formatScore(this.score)}타일  BEST ${this.formatScore(this.best)}`,
          );
          this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
          this.showOverlay();

          getAudioEngine()?.pianoFail();

          try {
            onGameOverRef.current?.(this.score);
          } catch (err) {
            console.error("[piano-tiles] onGameOver error", err);
          }
        }

        private onShutdown = () => {
          for (const t of this.tiles) t.destroy();
          this.tiles = [];
          this.input.off("pointerdown", this.handlePointerDown, this);
        };

        // --- Tile spawning -------------------------------------------------
        private maybeSpawnTile(): boolean {
          // Prefer a different lane than the last for visual variety
          let lane: LaneIdx;
          if (this.lastSpawnLane === null) {
            lane = Phaser.Math.Between(0, LANES - 1) as LaneIdx;
          } else {
            const candidates: LaneIdx[] = [0, 1, 2, 3].filter(
              (i) => i !== this.lastSpawnLane,
            ) as LaneIdx[];
            lane = candidates[
              Phaser.Math.Between(0, candidates.length - 1)
            ];
          }
          this.lastSpawnLane = lane;
          const x = lane * LANE_WIDTH + LANE_WIDTH / 2;
          const y = this.nextSpawnY;
          const w = LANE_WIDTH - 2;
          const h = TILE_HEIGHT - TILE_MARGIN * 2;
          const tile = this.add
            .rectangle(x, y, w, h, 0x18181b)
            .setStrokeStyle(2, 0x34d399, 0.45)
            .setDepth(10) as TileSprite;
          tile.__lane = lane;
          tile.__spawnedAtY = y;
          tile.__spawnedAt = this.time.now;
          this.tiles.push(tile);
          // Move next spawn up by one tile height (tiles are stacked continuously)
          this.nextSpawnY -= TILE_SPAWN_GAP;
          return true;
        }

        private topmostTileY(): number {
          if (this.tiles.length === 0) return -1;
          return Math.min(...this.tiles.filter((t) => t.active).map((t) => t.y));
        }

        private getHighestSpawnY(): number | null {
          return this.nextSpawnY + TILE_SPAWN_GAP;
        }

        private needsMoreTiles(): boolean {
          // Keep at least 6 tiles on field
          const alive = this.tiles.filter((t) => t.active).length;
          return alive < 6;
        }

        // --- Tap logic -----------------------------------------------------
        private attemptLaneTap(lane: LaneIdx) {
          // Find the lowest (largest y) ACTIVE tile in this lane
          let target: TileSprite | null = null;
          let targetY = -Infinity;
          for (const t of this.tiles) {
            if (!t.active) continue;
            if (t.__lane !== lane) continue;
            if (t.y > targetY) {
              targetY = t.y;
              target = t;
            }
          }
          // Check if there's ANY tile in any lane with y bigger than target — that means
          // user tapped out of order. But Piano Tiles typically allows lane-only tapping.
          // We'll enforce "the lowest tile across all lanes must be in this lane" rule.
          let lowestAny: TileSprite | null = null;
          let lowestAnyY = -Infinity;
          for (const t of this.tiles) {
            if (!t.active) continue;
            if (t.y > lowestAnyY) {
              lowestAnyY = t.y;
              lowestAny = t;
            }
          }

          if (!target || !lowestAny) {
            // No tile to tap — this is a wrong tap on empty lane
            this.triggerGameOver("wrong");
            return;
          }

          if (lowestAny.__lane !== lane) {
            // Tapped wrong lane (there's a lower tile in another lane)
            this.triggerGameOver("wrong");
            return;
          }

          // Hit the target
          this.score++;
          this.speed = Math.min(SCROLL_MAX, this.speed + SCROLL_PER_HIT);
          this.updateScore();

          const x = target.x;
          const y = target.y;

          // Visual feedback: brief flash + shrink
          this.tweens.killTweensOf(target);
          const flash = this.add
            .rectangle(x, y, LANE_WIDTH - 2, TILE_HEIGHT - 4, 0x34d399, 0.5)
            .setDepth(11);
          this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy(),
          });
          this.tweens.add({
            targets: target,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 120,
            onComplete: () => {
              target.destroy();
              this.tiles = this.tiles.filter((t) => t !== target);
            },
          });

          // Score popup
          this.spawnScorePopup(x, y - 30, `+1`);

          getAudioEngine()?.pianoTap(lane);
        }

        private spawnScorePopup(x: number, y: number, text: string) {
          const t = this.add
            .text(x, y, text, {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#34d399",
            })
            .setOrigin(0.5)
            .setDepth(15);
          this.tweens.add({
            targets: t,
            y: y - 30,
            alpha: { from: 1, to: 0 },
            duration: 400,
            onComplete: () => t.destroy(),
          });
        }

        // --- Helpers -------------------------------------------------------
        private updateScore() {
          this.scoreText.setText(`SCORE ${this.formatScore(this.score)}`);
        }

        private formatScore(v: number): string {
          return Math.round(v).toString().padStart(4, "0");
        }

        private clearTiles() {
          for (const t of this.tiles) t.destroy();
          this.tiles = [];
          this.nextSpawnY = -TILE_HEIGHT / 2;
          this.lastSpawnLane = null;
        }

        private showOverlay() {
          this.overlayBg.setVisible(true);
          this.overlayTitle.setVisible(true);
          this.overlaySub.setVisible(true);
          this.overlayScore.setVisible(true);
        }

        private hideOverlay() {
          this.overlayBg.setVisible(false);
          this.overlayTitle.setVisible(false);
          this.overlaySub.setVisible(false);
          this.overlayScore.setVisible(false);
        }

        private loadBest(): number {
          try {
            const v = localStorage.getItem(BEST_KEY);
            return v ? Math.max(0, parseInt(v, 10) || 0) : 0;
          } catch {
            return 0;
          }
        }

        private saveBest(v: number) {
          try {
            localStorage.setItem(BEST_KEY, Math.round(v).toString());
          } catch {
            // ignore
          }
        }
      }

      const Phaser_ = Phaser;
      const game = new Phaser_.Game({
        type: Phaser_.AUTO,
        parent: containerRef.current!,
        backgroundColor: "#0a0a0a",
        scale: {
          mode: Phaser_.Scale.FIT,
          autoCenter: Phaser_.Scale.CENTER_BOTH,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        },
        scene: MainScene,
      });
      gameRef.current = game;
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
      className="w-full aspect-[2/3] max-w-[400px] bg-black rounded-lg overflow-hidden touch-none select-none mx-auto"
      style={{ touchAction: "none" }}
    />
  );
}
