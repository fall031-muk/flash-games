"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// Canvas
const GAME_WIDTH = 500;
const GAME_HEIGHT = 560;
const HUD_HEIGHT = 60;

// Board
const COLS = 9;
const ROWS = 9;
const MINES = 10;
const CELL = Math.floor((GAME_WIDTH - 2) / COLS); // 55px

// Round
const ROUND_MS = 60_000;
const BOMB_PENALTY_MS = 3_000;
const GAMEOVER_INPUT_LOCK_MS = 300;

// Persistence
const BEST_KEY = "minesweeper-sprint-best";

// Number colors (Minesweeper classic w/ neon twist)
const NUMBER_COLORS: Record<number, string> = {
  1: "#22d3ee", // cyan
  2: "#a3e635", // lime
  3: "#fde047", // yellow
  4: "#fbbf24", // amber
  5: "#fb923c", // orange
  6: "#fb7185", // rose
  7: "#e879f9", // fuchsia
  8: "#f87171", // red-400
};

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  number: number;
  revealed: boolean;
  flagged: boolean;
  rect: Phaser.GameObjects.Rectangle;
  text?: Phaser.GameObjects.Text;
  flag?: Phaser.GameObjects.Text;
};

export type MinesweeperSprintGameProps = {
  onGameOver?: (mapsCleared: number) => void;
};

export default function MinesweeperSprintGame({ onGameOver }: MinesweeperSprintGameProps = {}) {
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

        private startedAt = 0;
        private roundEndAt = 0; // absolute time at which round ends

        private grid: Cell[][] = [];
        private minesPlaced = false;
        private revealedCount = 0;
        private flagMode = false;

        private mapsCleared = 0;
        private best = 0;

        private boardRoot!: Phaser.GameObjects.Container;

        private scoreText!: Phaser.GameObjects.Text;
        private timeText!: Phaser.GameObjects.Text;
        private flagModeText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;

        private overlayBg!: Phaser.GameObjects.Rectangle;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;
        private keyF!: Phaser.Input.Keyboard.Key;

        constructor() {
          super("MinesweeperSprint");
        }

        create() {
          this.cameras.main.setBackgroundColor(0x09090b);

          // HUD
          this.scoreText = this.add
            .text(12, 10, "MAPS 000", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#818cf8",
            })
            .setDepth(40)
            .setShadow(0, 0, "#818cf8", 8, true, true);

          this.timeText = this.add
            .text(GAME_WIDTH - 12, 10, "TIME 60.0", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#facc15",
            })
            .setOrigin(1, 0)
            .setDepth(40);

          this.flagModeText = this.add
            .text(GAME_WIDTH / 2, 10, "", {
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#fb923c",
            })
            .setOrigin(0.5, 0)
            .setDepth(40);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH / 2, 36, `BEST ${this.best}`, {
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#71717a",
            })
            .setOrigin(0.5, 0)
            .setDepth(40);

          // Board root container (offset below HUD)
          this.boardRoot = this.add.container(
            (GAME_WIDTH - COLS * CELL) / 2,
            HUD_HEIGHT + 6,
          );

          // Overlay
          this.overlayBg = this.add
            .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(50);

          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "MINESWEEPER SPRINT", {
              fontFamily: "monospace",
              fontSize: "22px",
              color: "#818cf8",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(51)
            .setShadow(0, 0, "#818cf8", 12, true, true);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, "", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#fde047",
            })
            .setOrigin(0.5)
            .setDepth(51);

          this.overlaySub = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 + 20,
              "60초 스프린트\n탭: 공개 · 우클릭/F: 깃발\n\nSPACE / TAP TO START",
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
          this.keyF = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.F,
          );
          // Right-click for flag
          this.input.mouse?.disableContextMenu();

          this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.onShutdown,
            this,
          );
        }

        update() {
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
          if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
            if (this.status === "playing") this.toggleFlagMode();
          }

          if (this.status === "playing") {
            const remaining = Math.max(0, this.roundEndAt - this.time.now);
            this.timeText.setText(`TIME ${(remaining / 1000).toFixed(1)}`);
            if (remaining <= 0) {
              this.triggerGameOver();
            }
          }
        }

        // --- Flag mode (mobile) --------------------------------------------
        private toggleFlagMode() {
          this.flagMode = !this.flagMode;
          this.flagModeText.setText(this.flagMode ? "🚩 FLAG MODE (F to toggle)" : "");
        }

        // --- Lifecycle ----------------------------------------------------
        private startGame() {
          this.status = "playing";
          this.mapsCleared = 0;
          this.updateScore();
          this.flagMode = false;
          this.flagModeText.setText("");
          this.hideOverlay();
          this.startedAt = this.time.now;
          this.roundEndAt = this.startedAt + ROUND_MS;
          this.buildNewBoard();

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
          }
        }

        private restartGame() {
          this.startGame();
        }

        private triggerGameOver() {
          if (this.status === "gameover") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;

          // Reveal all mines visually
          for (const row of this.grid) {
            for (const c of row) {
              if (c.isMine && !c.revealed) this.revealCellVisuals(c, true);
            }
          }

          if (this.mapsCleared > this.best) {
            this.best = this.mapsCleared;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.best}`);
          }

          this.overlayTitle.setText("TIME UP");
          this.overlayScore.setText(
            `${this.mapsCleared}맵 클리어  BEST ${this.best}맵`,
          );
          this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
          this.showOverlay();

          getAudioEngine()?.gameOver();

          try {
            onGameOverRef.current?.(this.mapsCleared);
          } catch (err) {
            console.error("[minesweeper-sprint] onGameOver error", err);
          }
        }

        private onShutdown = () => {
          this.clearBoard();
        };

        // --- Board --------------------------------------------------------
        private clearBoard() {
          this.boardRoot.removeAll(true);
          this.grid = [];
          this.minesPlaced = false;
          this.revealedCount = 0;
        }

        private buildNewBoard() {
          this.clearBoard();
          // Create cells (empty — mines placed on first reveal)
          this.grid = [];
          for (let r = 0; r < ROWS; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < COLS; c++) {
              const cell: Cell = {
                row: r,
                col: c,
                isMine: false,
                number: 0,
                revealed: false,
                flagged: false,
                rect: this.add
                  .rectangle(
                    c * CELL + CELL / 2,
                    r * CELL + CELL / 2,
                    CELL - 2,
                    CELL - 2,
                    0x27272a,
                  )
                  .setStrokeStyle(1, 0x52525b, 0.8)
                  .setInteractive({ cursor: "pointer" }),
              };
              cell.rect.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                this.handleCellPointerDown(cell, pointer);
              });
              this.boardRoot.add(cell.rect);
              row.push(cell);
            }
            this.grid.push(row);
          }
        }

        private placeMinesExcluding(excludeR: number, excludeC: number) {
          // 3x3 around the first click is safe.
          const isSafe = (r: number, c: number) =>
            Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1;

          const candidates: [number, number][] = [];
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (!isSafe(r, c)) candidates.push([r, c]);
            }
          }
          // Shuffle & take first MINES
          for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
          }
          const mineSet = candidates.slice(0, MINES);
          for (const [r, c] of mineSet) {
            this.grid[r][c].isMine = true;
          }
          // Compute numbers
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (this.grid[r][c].isMine) continue;
              let n = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  const nr = r + dr,
                    nc = c + dc;
                  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
                  if (this.grid[nr][nc].isMine) n++;
                }
              }
              this.grid[r][c].number = n;
            }
          }
          this.minesPlaced = true;
        }

        // --- Input handling -----------------------------------------------
        private handleCellPointerDown(
          cell: Cell,
          pointer: Phaser.Input.Pointer,
        ) {
          if (this.status !== "playing") return;
          const isRight = pointer.rightButtonDown();
          // Mobile flag mode OR right click = flag
          if (isRight || this.flagMode) {
            this.toggleFlag(cell);
            return;
          }
          this.revealCell(cell);
        }

        private toggleFlag(cell: Cell) {
          if (cell.revealed) return;
          cell.flagged = !cell.flagged;
          if (cell.flagged) {
            if (!cell.flag) {
              cell.flag = this.add
                .text(cell.rect.x, cell.rect.y, "🚩", {
                  fontSize: "22px",
                })
                .setOrigin(0.5);
              this.boardRoot.add(cell.flag);
            }
            cell.flag.setVisible(true);
          } else if (cell.flag) {
            cell.flag.setVisible(false);
          }
          getAudioEngine()?.mineFlag();
        }

        private revealCell(cell: Cell) {
          if (cell.revealed || cell.flagged) return;

          if (!this.minesPlaced) {
            this.placeMinesExcluding(cell.row, cell.col);
          }

          if (cell.isMine) {
            // Bomb! Penalty: -3s, new board
            this.cameras.main.shake(180, 0.012);
            this.cameras.main.flash(160, 251, 113, 133);
            getAudioEngine()?.mineExplode();
            this.roundEndAt -= BOMB_PENALTY_MS;
            // Brief reveal of mine for visual feedback, then rebuild
            this.revealCellVisuals(cell, true);
            this.time.delayedCall(400, () => {
              if (this.status === "playing") {
                this.buildNewBoard();
              }
            });
            return;
          }

          // Cascade reveal
          this.cascadeReveal(cell);
          getAudioEngine()?.mineReveal();

          // Check win
          const totalNonMine = ROWS * COLS - MINES;
          if (this.revealedCount >= totalNonMine) {
            this.handleMapCleared();
          }
        }

        private cascadeReveal(cell: Cell) {
          if (cell.revealed || cell.flagged || cell.isMine) return;
          cell.revealed = true;
          this.revealedCount++;
          this.revealCellVisuals(cell, false);
          if (cell.number !== 0) return;
          // Flood fill 0-cells
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = cell.row + dr,
                nc = cell.col + dc;
              if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
              const next = this.grid[nr][nc];
              if (!next.revealed && !next.flagged && !next.isMine) {
                this.cascadeReveal(next);
              }
            }
          }
        }

        private revealCellVisuals(cell: Cell, isMine: boolean) {
          if (isMine) {
            cell.rect.setFillStyle(0x7f1d1d);
            const x = this.add
              .text(cell.rect.x, cell.rect.y, "💣", {
                fontSize: "22px",
              })
              .setOrigin(0.5);
            this.boardRoot.add(x);
            return;
          }
          cell.rect.setFillStyle(0x09090b);
          cell.rect.setStrokeStyle(1, 0x3f3f46, 0.6);
          if (cell.flag) {
            cell.flag.setVisible(false);
          }
          if (cell.number > 0) {
            cell.text = this.add
              .text(cell.rect.x, cell.rect.y, String(cell.number), {
                fontFamily: "monospace",
                fontSize: "22px",
                color: NUMBER_COLORS[cell.number] ?? "#ffffff",
                fontStyle: "bold",
              })
              .setOrigin(0.5)
              .setShadow(0, 0, NUMBER_COLORS[cell.number] ?? "#ffffff", 6, true, true);
            this.boardRoot.add(cell.text);
          }
        }

        private handleMapCleared() {
          this.mapsCleared++;
          this.updateScore();
          getAudioEngine()?.mineClear();
          // Quick visual celebration: flash indigo
          this.cameras.main.flash(220, 129, 140, 248);
          // Rebuild new board after a short delay
          this.time.delayedCall(300, () => {
            if (this.status === "playing") this.buildNewBoard();
          });
        }

        // --- Helpers ------------------------------------------------------
        private updateScore() {
          this.scoreText.setText(`MAPS ${this.mapsCleared.toString().padStart(3, "0")}`);
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
        backgroundColor: "#09090b",
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
      className="w-full aspect-[500/560] max-w-[500px] bg-black rounded-lg overflow-hidden touch-none select-none mx-auto"
      style={{ touchAction: "none" }}
    />
  );
}
