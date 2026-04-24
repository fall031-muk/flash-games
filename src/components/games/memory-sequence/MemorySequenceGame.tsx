"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// Canvas / layout
const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;
const BOARD_PADDING = 40;
const BTN_GAP = 12;

// Gameplay
const GAMEOVER_INPUT_LOCK_MS = 300;

// Sequence flash timing (eases faster on higher rounds).
function flashDurationMs(round: number): number {
  if (round <= 9) return 500;
  if (round <= 19) return 400;
  return 300;
}
function flashGapMs(round: number): number {
  if (round <= 9) return 200;
  if (round <= 19) return 150;
  return 100;
}
const INTER_ROUND_DELAY_MS = 600;

// Persistence
const BEST_KEY = "memory-sequence-best";

type ButtonIdx = 0 | 1 | 2 | 3;

// 색상: 좌상 red, 우상 blue, 좌하 yellow, 우하 green
const BUTTON_COLORS: { base: number; lit: number; hex: string }[] = [
  { base: 0x7f1d1d, lit: 0xfb7185, hex: "#fb7185" }, // rose
  { base: 0x1e3a8a, lit: 0x38bdf8, hex: "#38bdf8" }, // sky
  { base: 0x713f12, lit: 0xfde047, hex: "#fde047" }, // yellow
  { base: 0x14532d, lit: 0xa3e635, hex: "#a3e635" }, // lime
];

export type MemorySequenceGameProps = {
  onGameOver?: (rounds: number) => void;
};

export default function MemorySequenceGame({ onGameOver }: MemorySequenceGameProps = {}) {
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
        private status: "ready" | "showing" | "input" | "gameover" = "ready";
        private gameOverAt = 0;

        private sequence: ButtonIdx[] = [];
        private inputIndex = 0;
        private round = 0; // 완료한 라운드 수
        private best = 0;

        private buttons: Phaser.GameObjects.Rectangle[] = [];
        private buttonBounds: { x: number; y: number; w: number; h: number }[] = [];

        private roundText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;
        private statusText!: Phaser.GameObjects.Text;

        private overlayBg!: Phaser.GameObjects.Rectangle;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;

        private scheduledTimers: Phaser.Time.TimerEvent[] = [];

        constructor() {
          super("MemorySequence");
        }

        create() {
          this.cameras.main.setBackgroundColor(0x09090b);

          // Border
          const border = this.add.graphics();
          border.lineStyle(2, 0x27272a, 1);
          border.strokeRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2);

          // Scanlines
          const scan = this.add.graphics();
          scan.fillStyle(0xffffff, 0.03);
          for (let y = 0; y < GAME_HEIGHT; y += 3) {
            scan.fillRect(0, y, GAME_WIDTH, 1);
          }

          // Board layout (2x2 centered)
          const boardTop = 80;
          const boardSize = GAME_WIDTH - BOARD_PADDING * 2;
          const btnSize = (boardSize - BTN_GAP) / 2;
          const startX = BOARD_PADDING;
          const startY = boardTop;

          for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + col * (btnSize + BTN_GAP);
            const y = startY + row * (btnSize + BTN_GAP);
            const rect = this.add
              .rectangle(
                x + btnSize / 2,
                y + btnSize / 2,
                btnSize,
                btnSize,
                BUTTON_COLORS[i].base,
              )
              .setStrokeStyle(3, BUTTON_COLORS[i].lit, 0.4)
              .setDepth(5);
            this.buttons.push(rect);
            this.buttonBounds.push({ x, y, w: btnSize, h: btnSize });
          }

          // HUD
          this.roundText = this.add
            .text(20, 18, "ROUND 00", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#e879f9",
            })
            .setDepth(40)
            .setShadow(0, 0, "#e879f9", 8, true, true);

          this.bestText = this.add
            .text(GAME_WIDTH - 20, 18, "BEST 00", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#a1a1aa",
            })
            .setOrigin(1, 0)
            .setDepth(40);

          this.statusText = this.add
            .text(GAME_WIDTH / 2, 50, "", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#fde047",
            })
            .setOrigin(0.5, 0)
            .setDepth(40)
            .setShadow(0, 0, "#ca8a04", 6, true, true);

          // Overlay
          this.overlayBg = this.add
            .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
            .setOrigin(0, 0)
            .setDepth(50);

          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "MEMORY SEQUENCE", {
              fontFamily: "monospace",
              fontSize: "28px",
              color: "#e879f9",
            })
            .setOrigin(0.5)
            .setDepth(51)
            .setShadow(0, 0, "#e879f9", 12, true, true);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, "", {
              fontFamily: "monospace",
              fontSize: "22px",
              color: "#fde047",
            })
            .setOrigin(0.5)
            .setDepth(51);

          this.overlaySub = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "TAP OR PRESS SPACE TO START", {
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#a1a1aa",
            })
            .setOrigin(0.5)
            .setDepth(51);

          // Input
          this.keySpace = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
          );
          this.keyR = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.R,
          );
          this.input.on("pointerdown", this.handlePointerDown, this);

          this.best = this.loadBest();
          this.bestText.setText(`BEST ${this.formatRound(this.best)}`);

          this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
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
          if (this.status !== "input") return;

          // Hit test against buttons
          for (let i = 0; i < this.buttonBounds.length; i++) {
            const b = this.buttonBounds[i];
            if (
              pointer.x >= b.x &&
              pointer.x <= b.x + b.w &&
              pointer.y >= b.y &&
              pointer.y <= b.y + b.h
            ) {
              this.handleButtonTap(i as ButtonIdx);
              return;
            }
          }
        };

        // --- Game flow ----------------------------------------------------
        private startGame() {
          this.cancelScheduled();
          this.sequence = [];
          this.round = 0;
          this.roundText.setText("ROUND 00");
          this.hideOverlay();
          this.nextRound();

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
          }
        }

        private restartGame() {
          this.startGame();
        }

        private nextRound() {
          // Add one to sequence
          const next = Phaser.Math.Between(0, 3) as ButtonIdx;
          this.sequence.push(next);
          this.round = this.sequence.length;
          this.roundText.setText(`ROUND ${this.formatRound(this.round)}`);

          this.status = "showing";
          this.statusText.setText("WATCH");
          this.inputIndex = 0;
          this.playSequence();
        }

        private playSequence() {
          const flashDur = flashDurationMs(this.round);
          const gap = flashGapMs(this.round);
          const startDelay = 400; // after transitioning to showing
          let t = startDelay;
          for (let i = 0; i < this.sequence.length; i++) {
            const idx = this.sequence[i];
            this.scheduleAt(t, () => this.flashButton(idx, flashDur));
            t += flashDur + gap;
          }
          // End of show → switch to input
          this.scheduleAt(t, () => {
            if (this.status !== "showing") return;
            this.status = "input";
            this.statusText.setText("YOUR TURN");
          });
        }

        private flashButton(idx: ButtonIdx, durationMs: number) {
          const color = BUTTON_COLORS[idx];
          const btn = this.buttons[idx];
          this.tweens.killTweensOf(btn);
          btn.setFillStyle(color.lit);
          btn.setScale(1.05);
          getAudioEngine()?.memoryTone(idx);
          this.scheduleAt(durationMs, () => {
            btn.setFillStyle(color.base);
            btn.setScale(1.0);
          });
        }

        private handleButtonTap(idx: ButtonIdx) {
          // Visual feedback on tap
          const color = BUTTON_COLORS[idx];
          const btn = this.buttons[idx];
          btn.setFillStyle(color.lit);
          btn.setScale(1.05);
          getAudioEngine()?.memoryTone(idx);
          this.scheduleAt(180, () => {
            btn.setFillStyle(color.base);
            btn.setScale(1.0);
          });

          // Compare with expected
          const expected = this.sequence[this.inputIndex];
          if (idx !== expected) {
            this.triggerGameOver();
            return;
          }
          this.inputIndex++;
          if (this.inputIndex >= this.sequence.length) {
            // Round complete
            this.status = "showing"; // block further input
            this.statusText.setText("CORRECT!");
            getAudioEngine()?.memorySuccess();
            this.scheduleAt(INTER_ROUND_DELAY_MS, () => this.nextRound());
          }
        }

        private triggerGameOver() {
          if (this.status === "gameover") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;
          this.cancelScheduled();

          const reached = Math.max(0, this.round - 1); // 완료된 라운드 = 마지막 전
          const completed = reached; // score 기준: 성공한 라운드 수
          if (completed > this.best) {
            this.best = completed;
            this.saveBest(completed);
            this.bestText.setText(`BEST ${this.formatRound(this.best)}`);
          }

          // Red flash on board
          this.cameras.main.shake(220, 0.01);
          this.cameras.main.flash(180, 251, 113, 133);

          this.statusText.setText("");
          this.overlayTitle.setText("GAME OVER");
          this.overlayScore.setText(
            `ROUND ${this.formatRound(completed)}  BEST ${this.formatRound(this.best)}`,
          );
          this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
          this.showOverlay();

          getAudioEngine()?.memoryFail();

          try {
            onGameOverRef.current?.(completed);
          } catch (err) {
            console.error("[memory-sequence] onGameOver error", err);
          }
        }

        private onShutdown = () => {
          this.cancelScheduled();
          this.input.off("pointerdown", this.handlePointerDown, this);
        };

        // --- Utilities ----------------------------------------------------
        private scheduleAt(delayMs: number, cb: () => void) {
          const t = this.time.delayedCall(delayMs, cb);
          this.scheduledTimers.push(t);
        }

        private cancelScheduled() {
          for (const t of this.scheduledTimers) t.remove(false);
          this.scheduledTimers = [];
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

        private formatRound(n: number): string {
          return Math.max(0, Math.round(n)).toString().padStart(2, "0");
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
      className="w-full aspect-square max-w-[500px] bg-black rounded-lg overflow-hidden touch-none select-none mx-auto"
      style={{ touchAction: "none" }}
    />
  );
}
