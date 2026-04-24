"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { getAudioEngine } from "@/lib/audio";

// -----------------------------------------------------------------------------
// Canvas & layout
// -----------------------------------------------------------------------------

const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const EDGE_MARGIN = 60;

// Game length
const ROUND_DURATION_MS = 30_000;
const GAMEOVER_INPUT_LOCK_MS = 300;

// Spawn cadence (linear interpolation across the 30s round).
const SPAWN_DELAY_START_MS = 850;
const SPAWN_DELAY_END_MS = 500;
const FIRST_SPAWN_DELAY_MS = 500;
const MAX_ACTIVE_TARGETS = 3;
const PLACEMENT_MIN_SPACING = 80;
const PLACEMENT_MAX_TRIES = 8;

// Combo
const COMBO_STEP = 5; // every N hits adds 0.5 to multiplier
const COMBO_MULT_STEP = 0.5;
const COMBO_MULT_MAX = 2.5;

// Bomb penalty
const BOMB_POINTS = -100;

// Persistence
const BEST_KEY = "reflex-target-best";

// -----------------------------------------------------------------------------
// Targets
// -----------------------------------------------------------------------------

type TargetKind = "normal" | "gold" | "crit" | "bomb";

type TargetSpec = {
  color: number;
  radius: number;
  lifetimeMs: number;
  baseScore: number;
  weight: number;
};

const TARGET_SPECS: Record<TargetKind, TargetSpec> = {
  normal: { color: 0x22d3ee, radius: 30, lifetimeMs: 1500, baseScore: 10, weight: 60 },
  gold:   { color: 0xfbbf24, radius: 22, lifetimeMs: 1000, baseScore: 50, weight: 15 },
  crit:   { color: 0xfb7185, radius: 15, lifetimeMs: 700,  baseScore: 100, weight: 10 },
  bomb:   { color: 0x27272a, radius: 35, lifetimeMs: 2000, baseScore: BOMB_POINTS, weight: 15 },
};

const TARGET_KINDS: TargetKind[] = ["normal", "gold", "crit", "bomb"];
const TOTAL_WEIGHT = TARGET_KINDS.reduce((s, k) => s + TARGET_SPECS[k].weight, 0);

function pickKind(): TargetKind {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const k of TARGET_KINDS) {
    r -= TARGET_SPECS[k].weight;
    if (r <= 0) return k;
  }
  return "normal";
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export type ReflexTargetGameProps = {
  onGameOver?: (score: number) => void;
};

export default function ReflexTargetGame({ onGameOver }: ReflexTargetGameProps = {}) {
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

      type TargetSprite = Phaser.GameObjects.Arc & {
        __kind?: TargetKind;
        __spawnAt?: number;
        __isBomb?: boolean;
      };

      class MainScene extends Phaser.Scene {
        private status: "ready" | "playing" | "gameover" = "ready";
        private startedAt = 0;
        private gameOverAt = 0;

        private score = 0;
        private combo = 0;
        private best = 0;

        private targets: TargetSprite[] = [];
        private bombXs: Map<TargetSprite, Phaser.GameObjects.Graphics> = new Map();

        private scoreText!: Phaser.GameObjects.Text;
        private timeText!: Phaser.GameObjects.Text;
        private comboText!: Phaser.GameObjects.Text;
        private bestText!: Phaser.GameObjects.Text;

        private overlayBg!: Phaser.GameObjects.Rectangle;
        private overlayTitle!: Phaser.GameObjects.Text;
        private overlaySub!: Phaser.GameObjects.Text;
        private overlayScore!: Phaser.GameObjects.Text;

        private keySpace!: Phaser.Input.Keyboard.Key;
        private keyR!: Phaser.Input.Keyboard.Key;

        private spawnTimer?: Phaser.Time.TimerEvent;
        private roundTimer?: Phaser.Time.TimerEvent;

        constructor() {
          super("ReflexTarget");
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
          scan.setDepth(-1);

          // HUD
          this.scoreText = this.add
            .text(20, 18, "SCORE 0000", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#22d3ee",
            })
            .setDepth(40)
            .setShadow(0, 0, "#22d3ee", 8, true, true);

          this.timeText = this.add
            .text(GAME_WIDTH - 20, 18, "TIME 30.0", {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#facc15",
            })
            .setOrigin(1, 0)
            .setDepth(40)
            .setShadow(0, 0, "#ca8a04", 8, true, true);

          this.comboText = this.add
            .text(GAME_WIDTH / 2, 18, "", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#fde047",
            })
            .setOrigin(0.5, 0)
            .setDepth(40)
            .setShadow(0, 0, "#ca8a04", 6, true, true);

          this.best = this.loadBest();
          this.bestText = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 24, `BEST ${this.formatScore(this.best)}`, {
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#71717a",
            })
            .setOrigin(0.5, 0.5)
            .setDepth(40);

          // Overlay
          this.overlayBg = this.add
            .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
            .setOrigin(0, 0)
            .setDepth(50);

          this.overlayTitle = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "REFLEX TARGET", {
              fontFamily: "monospace",
              fontSize: "32px",
              color: "#22d3ee",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(51)
            .setShadow(0, 0, "#22d3ee", 12, true, true);

          this.overlaySub = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, "TAP OR PRESS SPACE TO START", {
              fontFamily: "monospace",
              fontSize: "18px",
              color: "#a1a1aa",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(51);

          this.overlayScore = this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, "", {
              fontFamily: "monospace",
              fontSize: "22px",
              color: "#fde047",
              align: "center",
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

          this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.onShutdown,
            this,
          );
        }

        // --- Input --------------------------------------------------------
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
          // playing — check target hits
          for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            if (!t.active) continue;
            const dx = pointer.x - t.x;
            const dy = pointer.y - t.y;
            const r = TARGET_SPECS[t.__kind ?? "normal"].radius;
            if (dx * dx + dy * dy <= r * r) {
              this.handleHit(t);
              return;
            }
          }
          // Missed click (no target) — intentionally no penalty
        };

        update() {
          if (this.status === "playing") {
            // Update time
            const elapsed = this.time.now - this.startedAt;
            const remaining = Math.max(0, ROUND_DURATION_MS - elapsed);
            this.timeText.setText(`TIME ${(remaining / 1000).toFixed(1)}`);
            if (remaining <= 0) {
              this.triggerGameOver();
              return;
            }
            // Expire old targets
            for (let i = this.targets.length - 1; i >= 0; i--) {
              const t = this.targets[i];
              if (!t.active) continue;
              const spec = TARGET_SPECS[t.__kind ?? "normal"];
              if (this.time.now - (t.__spawnAt ?? 0) >= spec.lifetimeMs) {
                this.handleMiss(t);
              }
            }
          }

          if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.status === "ready") this.startGame();
            else if (this.status === "gameover") {
              if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            }
          }
          if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
            if (this.status === "ready" || this.status === "gameover") {
              if (this.time.now - this.gameOverAt >= GAMEOVER_INPUT_LOCK_MS) {
                this.restartGame();
              }
            }
          }
        }

        // --- Lifecycle ----------------------------------------------------
        private startGame() {
          this.status = "playing";
          this.startedAt = this.time.now;
          this.score = 0;
          this.combo = 0;
          this.updateScore();
          this.updateCombo();
          this.hideOverlay();
          this.clearTargets();
          this.scheduleNextSpawn(FIRST_SPAWN_DELAY_MS);

          const audio = getAudioEngine();
          if (audio) {
            audio.resume();
            audio.startGame();
            audio.startReflexBgm();
          }
        }

        private triggerGameOver() {
          if (this.status !== "playing") return;
          this.status = "gameover";
          this.gameOverAt = this.time.now;
          this.stopSpawnTimer();
          this.clearTargets();

          if (this.score > this.best) {
            this.best = this.score;
            this.saveBest(this.best);
            this.bestText.setText(`BEST ${this.formatScore(this.best)}`);
          }

          this.overlayTitle.setText("TIME UP");
          this.overlayScore.setText(
            `SCORE ${this.formatScore(this.score)}  BEST ${this.formatScore(this.best)}`,
          );
          this.overlaySub.setText("PRESS R / SPACE / TAP TO RESTART");
          this.showOverlay();

          getAudioEngine()?.gameOver();
          getAudioEngine()?.stopReflexBgm();

          try {
            onGameOverRef.current?.(this.score);
          } catch (err) {
            console.error("[reflex-target] onGameOver error", err);
          }
        }

        private restartGame() {
          this.startGame();
        }

        private onShutdown = () => {
          this.stopSpawnTimer();
          for (const [, g] of this.bombXs) g.destroy();
          this.bombXs.clear();
          for (const t of this.targets) t.destroy();
          this.targets = [];
          this.input.off("pointerdown", this.handlePointerDown, this);
          getAudioEngine()?.stopReflexBgm();
        };

        // --- Spawn --------------------------------------------------------
        private scheduleNextSpawn(delayMs?: number) {
          if (this.spawnTimer) this.spawnTimer.remove(false);
          const delay = delayMs ?? this.currentSpawnDelayMs();
          this.spawnTimer = this.time.delayedCall(delay, () => {
            if (this.status !== "playing") return;
            this.trySpawnTarget();
            this.scheduleNextSpawn();
          });
        }

        private stopSpawnTimer() {
          if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = undefined;
          }
        }

        private currentSpawnDelayMs(): number {
          const elapsed = this.time.now - this.startedAt;
          const t = Phaser.Math.Clamp(elapsed / ROUND_DURATION_MS, 0, 1);
          return Phaser.Math.Linear(SPAWN_DELAY_START_MS, SPAWN_DELAY_END_MS, t);
        }

        private trySpawnTarget() {
          if (this.targets.filter((t) => t.active).length >= MAX_ACTIVE_TARGETS) return;
          const kind = pickKind();
          const spec = TARGET_SPECS[kind];
          // Find a position not overlapping existing targets
          let x = 0;
          let y = 0;
          let placed = false;
          for (let i = 0; i < PLACEMENT_MAX_TRIES; i++) {
            x = Phaser.Math.Between(EDGE_MARGIN, GAME_WIDTH - EDGE_MARGIN);
            y = Phaser.Math.Between(EDGE_MARGIN, GAME_HEIGHT - EDGE_MARGIN);
            let ok = true;
            for (const other of this.targets) {
              if (!other.active) continue;
              const dx = other.x - x;
              const dy = other.y - y;
              if (Math.sqrt(dx * dx + dy * dy) < PLACEMENT_MIN_SPACING) {
                ok = false;
                break;
              }
            }
            if (ok) {
              placed = true;
              break;
            }
          }
          if (!placed) return;

          const target = this.add.circle(x, y, spec.radius, spec.color) as TargetSprite;
          target.setDepth(10);
          target.__kind = kind;
          target.__spawnAt = this.time.now;
          target.__isBomb = kind === "bomb";

          // Glow stroke
          const strokeColor = kind === "bomb" ? 0xf4f4f5 : spec.color;
          target.setStrokeStyle(2, strokeColor, kind === "bomb" ? 0.9 : 0.6);

          // Pulse
          const pulseDur = kind === "crit" ? 200 : 400;
          this.tweens.add({
            targets: target,
            scale: { from: 0.9, to: 1.15 },
            duration: pulseDur,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });

          // Bomb X overlay
          if (kind === "bomb") {
            const g = this.add.graphics();
            g.lineStyle(4, 0xf4f4f5, 1);
            const r = spec.radius * 0.5;
            g.beginPath();
            g.moveTo(x - r, y - r);
            g.lineTo(x + r, y + r);
            g.moveTo(x + r, y - r);
            g.lineTo(x - r, y + r);
            g.strokePath();
            g.setDepth(11);
            this.bombXs.set(target, g);
          }

          this.targets.push(target);
        }

        // --- Hit / Miss ---------------------------------------------------
        private handleHit(t: TargetSprite) {
          const kind = t.__kind ?? "normal";
          const spec = TARGET_SPECS[kind];
          const audio = getAudioEngine();

          if (kind === "bomb") {
            // Bomb penalty
            this.score = Math.max(0, this.score + BOMB_POINTS);
            this.combo = 0;
            this.updateScore();
            this.updateCombo();
            this.cameras.main.shake(180, 0.012);
            this.cameras.main.flash(150, 251, 113, 133);
            this.spawnScorePopup(t.x, t.y, `${BOMB_POINTS}`, "#fb7185");
            audio?.targetBomb();
            this.destroyTarget(t);
            return;
          }

          // Regular hit
          const mult = this.currentMultiplier();
          const gained = Math.round(spec.baseScore * mult);
          this.score += gained;
          this.combo += 1;
          this.updateScore();
          const milestoneHit = this.combo > 0 && this.combo % COMBO_STEP === 0;
          this.updateCombo();

          // FX
          this.spawnHitParticles(t.x, t.y, spec.color);
          this.spawnScorePopup(t.x, t.y, `+${gained}`, this.hexColor(spec.color));

          if (kind === "gold") audio?.targetGold();
          else if (kind === "crit") audio?.targetCrit();
          else audio?.targetHit();

          if (milestoneHit) {
            this.showComboBanner(mult);
            audio?.targetCombo();
          }

          this.destroyTarget(t);
        }

        private handleMiss(t: TargetSprite) {
          const kind = t.__kind ?? "normal";
          if (kind !== "bomb") {
            // Missing a bomb is good. Others reset combo.
            this.combo = 0;
            this.updateCombo();
            getAudioEngine()?.targetMiss();
            // small rose ring flash at position
            const ring = this.add
              .circle(t.x, t.y, 40)
              .setStrokeStyle(2, 0xfb7185, 0.9)
              .setDepth(9);
            this.tweens.add({
              targets: ring,
              scale: { from: 0.3, to: 1.2 },
              alpha: { from: 0.9, to: 0 },
              duration: 350,
              onComplete: () => ring.destroy(),
            });
          }
          this.destroyTarget(t);
        }

        private destroyTarget(t: TargetSprite) {
          const x = this.bombXs.get(t);
          if (x) {
            x.destroy();
            this.bombXs.delete(t);
          }
          this.tweens.killTweensOf(t);
          t.destroy();
          this.targets = this.targets.filter((o) => o !== t);
        }

        private clearTargets() {
          for (const t of [...this.targets]) this.destroyTarget(t);
        }

        // --- Combo / Score helpers ----------------------------------------
        private currentMultiplier(): number {
          const m = 1.0 + Math.floor(this.combo / COMBO_STEP) * COMBO_MULT_STEP;
          return Math.min(m, COMBO_MULT_MAX);
        }

        private updateScore() {
          this.scoreText.setText(`SCORE ${this.formatScore(this.score)}`);
        }

        private updateCombo() {
          if (this.combo >= 2) {
            const mult = this.currentMultiplier();
            this.comboText.setText(
              `COMBO ${this.combo.toString().padStart(2, "0")} (x${mult.toFixed(1)})`,
            );
          } else {
            this.comboText.setText("");
          }
        }

        private formatScore(v: number): string {
          return Math.round(v).toString().padStart(4, "0");
        }

        private spawnHitParticles(x: number, y: number, color: number) {
          const count = 8;
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const p = this.add.rectangle(x, y, 6, 6, color).setDepth(12);
            this.tweens.add({
              targets: p,
              x: x + Math.cos(angle) * 40,
              y: y + Math.sin(angle) * 40,
              alpha: { from: 1, to: 0 },
              scale: { from: 1, to: 0.2 },
              duration: 300,
              onComplete: () => p.destroy(),
            });
          }
        }

        private spawnScorePopup(
          x: number,
          y: number,
          text: string,
          colorHex: string,
        ) {
          const t = this.add
            .text(x, y - 14, text, {
              fontFamily: "monospace",
              fontSize: "20px",
              color: colorHex,
            })
            .setOrigin(0.5)
            .setDepth(15)
            .setShadow(0, 0, colorHex, 6, true, true);
          this.tweens.add({
            targets: t,
            y: y - 54,
            alpha: { from: 1, to: 0 },
            duration: 600,
            onComplete: () => t.destroy(),
          });
        }

        private showComboBanner(mult: number) {
          const banner = this.add
            .text(
              GAME_WIDTH / 2,
              GAME_HEIGHT / 2 - 40,
              `COMBO x${mult.toFixed(1)}!`,
              {
                fontFamily: "monospace",
                fontSize: "36px",
                color: "#fde047",
              },
            )
            .setOrigin(0.5)
            .setDepth(45)
            .setAlpha(0)
            .setShadow(0, 0, "#ca8a04", 12, true, true);
          this.tweens.add({
            targets: banner,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.7, to: 1.2 },
            duration: 180,
            yoyo: true,
            hold: 500,
            onComplete: () => banner.destroy(),
          });
        }

        // --- Overlay ------------------------------------------------------
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

        // --- Persistence --------------------------------------------------
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

        // --- Color --------------------------------------------------------
        private hexColor(num: number): string {
          return `#${num.toString(16).padStart(6, "0")}`;
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
      className="w-full aspect-square max-w-[600px] bg-black rounded-lg overflow-hidden touch-none select-none mx-auto"
      style={{ touchAction: "none" }}
    />
  );
}
