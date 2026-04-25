// Procedural retro chiptune engine using Web Audio API.
// Keeps the bundle tiny (no audio assets) and preserves the 8-bit flash-game feel.

const MUTE_STORAGE_KEY = "bullet-dodge-audio-muted";

type ToneParams = {
  freq: number;
  freqEnd?: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  releaseTo?: number;
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmInterval: number | undefined;
  private bgmStep = 0;
  private muted = false;
  private volume = 0.35;

  constructor() {
    try {
      const saved = localStorage.getItem(MUTE_STORAGE_KEY);
      if (saved === "1") this.muted = true;
    } catch {
      // ignore storage errors
    }
  }

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;
    type WithLegacy = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const w = window as WithLegacy;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  }

  /** Must be called from a user-gesture handler to unlock autoplay-blocked contexts. */
  resume(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.volume,
        this.ctx.currentTime,
      );
    }
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  private tone(params: ToneParams): void {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = params.type ?? "square";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(params.freq, now);
    if (params.freqEnd !== undefined && params.freqEnd !== params.freq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(params.freqEnd, 1),
        now + params.duration,
      );
    }
    const vol = params.volume ?? 0.35;
    const attack = params.attack ?? 0.005;
    const releaseTo = params.releaseTo ?? 0.001;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(
      Math.max(releaseTo, 0.0001),
      now + params.duration,
    );
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + params.duration + 0.02);
  }

  private noise(duration: number, volume = 0.3): void {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(g);
    g.connect(this.masterGain);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // --- SFX ------------------------------------------------------------
  startGame(): void {
    this.tone({ freq: 440, duration: 0.08, type: "square", volume: 0.25 });
    window.setTimeout(
      () => this.tone({ freq: 659, duration: 0.12, type: "square", volume: 0.3 }),
      90,
    );
  }

  hit(): void {
    this.tone({
      freq: 240,
      freqEnd: 60,
      duration: 0.28,
      type: "sawtooth",
      volume: 0.45,
    });
    this.noise(0.18, 0.25);
  }

  gameOver(): void {
    this.tone({
      freq: 440,
      freqEnd: 60,
      duration: 0.9,
      type: "sawtooth",
      volume: 0.4,
    });
    window.setTimeout(() => this.noise(0.5, 0.2), 200);
  }

  item(
    kind: "shield" | "freeze" | "clear" | "slow" | "bonus",
  ): void {
    switch (kind) {
      case "shield":
        this.tone({
          freq: 520,
          freqEnd: 880,
          duration: 0.22,
          type: "triangle",
          volume: 0.3,
        });
        window.setTimeout(
          () =>
            this.tone({
              freq: 880,
              duration: 0.14,
              type: "triangle",
              volume: 0.25,
            }),
          180,
        );
        break;
      case "freeze":
        this.tone({
          freq: 1200,
          freqEnd: 220,
          duration: 0.45,
          type: "sine",
          volume: 0.3,
        });
        break;
      case "clear":
        this.noise(0.45, 0.4);
        this.tone({
          freq: 160,
          freqEnd: 40,
          duration: 0.4,
          type: "sawtooth",
          volume: 0.35,
        });
        break;
      case "slow":
        this.tone({
          freq: 740,
          freqEnd: 320,
          duration: 0.32,
          type: "triangle",
          volume: 0.3,
        });
        break;
      case "bonus":
        // 삼음 상승 아르페지오
        this.tone({ freq: 660, duration: 0.08, type: "square", volume: 0.25 });
        window.setTimeout(
          () => this.tone({ freq: 880, duration: 0.08, type: "square", volume: 0.25 }),
          90,
        );
        window.setTimeout(
          () => this.tone({ freq: 1175, duration: 0.14, type: "square", volume: 0.28 }),
          180,
        );
        break;
    }
  }

  /** Shield absorbs a bullet — short tick distinct from a fatal hit. */
  shieldBlock(): void {
    this.tone({
      freq: 1400,
      freqEnd: 900,
      duration: 0.12,
      type: "square",
      volume: 0.18,
    });
  }

  // --- BGM ------------------------------------------------------------
  private readonly bassPattern: (number | null)[] = [
    110, null, null, null, 146.83, null, null, null,
    110, null, null, null, 98, null, null, null,
  ];
  private readonly leadPattern: (number | null)[] = [
    null, 440, null, 659, null, 587, null, 523,
    null, 440, null, 659, null, 784, null, 659,
  ];

  startBgm(): void {
    if (this.bgmInterval !== undefined) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const stepMs = 135; // ~111 bpm eighth-notes
    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.muted) return;
      const idx = this.bgmStep % 16;
      const bass = this.bassPattern[idx];
      const lead = this.leadPattern[idx];
      if (bass !== null) {
        this.tone({
          freq: bass,
          duration: 0.22,
          type: "square",
          volume: 0.09,
        });
      }
      if (lead !== null) {
        this.tone({
          freq: lead,
          duration: 0.16,
          type: "triangle",
          volume: 0.11,
        });
      }
      this.bgmStep++;
    }, stepMs);
  }

  stopBgm(): void {
    if (this.bgmInterval !== undefined) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = undefined;
    }
  }

  // --- Wolf Runner SFX -----------------------------------------------
  /**
   * Jump SFX with a distinct pitch per jump tier so the player can hear
   * how many air-jumps they've chained. Higher tiers = higher pitch.
   */
  wolfJump(tier: 1 | 2 | 3): void {
    const profiles = {
      1: { freq: 440, freqEnd: 660, duration: 0.08, volume: 0.26 },
      2: { freq: 520, freqEnd: 780, duration: 0.08, volume: 0.26 },
      3: { freq: 620, freqEnd: 900, duration: 0.1, volume: 0.28 },
    } as const;
    const p = profiles[tier];
    this.tone({
      freq: p.freq,
      freqEnd: p.freqEnd,
      duration: p.duration,
      type: "square",
      volume: p.volume,
    });
  }

  /** Paw landing on the ground. Low thud + whisper of dust. */
  wolfLand(): void {
    this.tone({
      freq: 140,
      freqEnd: 70,
      duration: 0.08,
      type: "sine",
      volume: 0.22,
    });
    this.noise(0.06, 0.12);
  }

  /** Shield pickup SFX — ascending triad. Reused look & feel of item('shield'). */
  wolfPickup(): void {
    this.tone({ freq: 660, duration: 0.08, type: "square", volume: 0.25 });
    window.setTimeout(
      () => this.tone({ freq: 880, duration: 0.08, type: "square", volume: 0.25 }),
      80,
    );
    window.setTimeout(
      () =>
        this.tone({
          freq: 1175,
          duration: 0.14,
          type: "triangle",
          volume: 0.28,
        }),
      160,
    );
  }

  /** Non-fatal hit absorbed by shield, or death impact fallback. */
  wolfHit(): void {
    this.tone({
      freq: 260,
      freqEnd: 70,
      duration: 0.26,
      type: "sawtooth",
      volume: 0.42,
    });
    this.noise(0.14, 0.24);
  }

  /** Game-over sting for the wolf runner. */
  wolfGameOver(): void {
    this.tone({
      freq: 420,
      freqEnd: 55,
      duration: 0.95,
      type: "sawtooth",
      volume: 0.4,
    });
    window.setTimeout(() => this.noise(0.5, 0.22), 220);
  }

  // --- Wolf Runner BGM -----------------------------------------------
  // 8-step loop, driving galloping pattern at ~120 BPM 16th-notes.
  private readonly wolfBassPattern: (number | null)[] = [
    82.41, null, 82.41, null, 110, null, 82.41, null,
    82.41, null, 82.41, null, 146.83, null, 123.47, null,
  ];
  private readonly wolfLeadPattern: (number | null)[] = [
    659, null, 784, null, 659, null, 523, 587,
    659, null, 784, null, 880, null, 784, 659,
  ];

  startWolfBgm(): void {
    // Only one BGM can play at a time — cancel any existing bullet-dodge loop
    // before kicking the wolf loop off.
    this.stopBgm();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const stepMs = 125; // ~120 BPM 16th-notes, galloping feel
    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.muted) return;
      const idx = this.bgmStep % 16;
      const bass = this.wolfBassPattern[idx];
      const lead = this.wolfLeadPattern[idx];
      if (bass !== null) {
        this.tone({
          freq: bass,
          duration: 0.18,
          type: "square",
          volume: 0.09,
        });
      }
      if (lead !== null) {
        this.tone({
          freq: lead,
          duration: 0.12,
          type: "triangle",
          volume: 0.1,
        });
      }
      this.bgmStep++;
    }, stepMs);
  }

  /** Alias to stopBgm() — wolf BGM shares the interval slot. */
  stopWolfBgm(): void {
    this.stopBgm();
  }

  // --- Wolf Runner Item SFX -------------------------------------------
  /** Slow item: descending slide, relaxed. */
  wolfItemSlow(): void {
    this.tone({
      freq: 740,
      freqEnd: 320,
      duration: 0.32,
      type: "triangle",
      volume: 0.3,
    });
  }

  /** 2x bonus item: ascending triad. */
  wolfItem2x(): void {
    this.tone({ freq: 660, duration: 0.08, type: "square", volume: 0.26 });
    window.setTimeout(
      () => this.tone({ freq: 880, duration: 0.08, type: "square", volume: 0.26 }),
      85,
    );
    window.setTimeout(
      () =>
        this.tone({
          freq: 1100,
          duration: 0.14,
          type: "square",
          volume: 0.3,
        }),
      170,
    );
  }

  /** Mega jump item: power-up sweep. */
  wolfItemMega(): void {
    this.tone({
      freq: 260,
      freqEnd: 1400,
      duration: 0.2,
      type: "square",
      volume: 0.3,
    });
  }

  /** Fire column hiss: short noise + sine base. Fired once per column spawn. */
  wolfFireHiss(): void {
    this.noise(0.18, 0.08);
    this.tone({
      freq: 300,
      freqEnd: 200,
      duration: 0.12,
      type: "sine",
      volume: 0.14,
    });
  }

  /** Meteor ground impact: low thud + heavy noise. */
  wolfMeteorImpact(): void {
    this.tone({
      freq: 80,
      freqEnd: 40,
      duration: 0.2,
      type: "sawtooth",
      volume: 0.4,
    });
    this.noise(0.3, 0.32);
  }

  /** Boulder rumble: short low sine + light noise. */
  wolfBoulderRumble(): void {
    this.tone({
      freq: 60,
      freqEnd: 50,
      duration: 0.4,
      type: "sine",
      volume: 0.22,
    });
    this.noise(0.2, 0.1);
  }

  // --- Tower Stacker SFX ---------------------------------------------
  /** Short 2-note ascending chirp that plays when a run starts. */
  towerStart(): void {
    this.tone({ freq: 440, duration: 0.08, type: "square", volume: 0.24 });
    window.setTimeout(
      () =>
        this.tone({ freq: 660, duration: 0.1, type: "square", volume: 0.26 }),
      90,
    );
  }

  /** "Tok" click when a block lands — square blip + tiny noise tick. */
  towerDrop(): void {
    this.tone({
      freq: 200,
      freqEnd: 180,
      duration: 0.06,
      type: "square",
      volume: 0.28,
    });
    this.noise(0.04, 0.12);
  }

  /** Perfect stop: sparkly 3-note triangle arpeggio. */
  towerPerfect(): void {
    this.tone({ freq: 880, duration: 0.09, type: "triangle", volume: 0.28 });
    window.setTimeout(
      () =>
        this.tone({
          freq: 1100,
          duration: 0.09,
          type: "triangle",
          volume: 0.28,
        }),
      80,
    );
    window.setTimeout(
      () =>
        this.tone({
          freq: 1320,
          duration: 0.14,
          type: "triangle",
          volume: 0.3,
        }),
      160,
    );
  }

  /** Very short chip/shave sound when the misaligned edge is trimmed off. */
  towerChip(): void {
    this.noise(0.08, 0.16);
    this.tone({
      freq: 100,
      freqEnd: 70,
      duration: 0.06,
      type: "sine",
      volume: 0.18,
    });
  }

  /** Falling-tower game-over sting: pitch slide + low rumble. */
  towerGameOver(): void {
    this.tone({
      freq: 600,
      freqEnd: 80,
      duration: 0.7,
      type: "sawtooth",
      volume: 0.36,
    });
    window.setTimeout(() => this.noise(0.45, 0.22), 180);
    window.setTimeout(
      () =>
        this.tone({
          freq: 55,
          freqEnd: 40,
          duration: 0.5,
          type: "sine",
          volume: 0.28,
        }),
      220,
    );
  }

  // --- Tower Stacker BGM ---------------------------------------------
  // Slow, relaxed Cmaj pentatonic loop — no tension, easy to listen to.
  // ~90 BPM 8th-notes. Tempo is intentionally soft and spacious.
  private readonly towerBassPattern: (number | null)[] = [
    130.81, null, null, null, 164.81, null, null, null,
    130.81, null, null, null, 196, null, 174.61, null,
  ];
  private readonly towerLeadPattern: (number | null)[] = [
    null, 523.25, null, 659.25, null, 783.99, null, 880,
    null, 783.99, null, 659.25, null, 587.33, null, 523.25,
  ];

  startTowerBgm(): void {
    // Only one BGM can play at a time — cancel any existing loop first.
    this.stopBgm();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const stepMs = 333; // ~90 BPM 8th-notes, spacious feel
    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.muted) return;
      const idx = this.bgmStep % 16;
      const bass = this.towerBassPattern[idx];
      const lead = this.towerLeadPattern[idx];
      if (bass !== null) {
        this.tone({
          freq: bass,
          duration: 0.3,
          type: "triangle",
          volume: 0.06,
        });
      }
      if (lead !== null) {
        this.tone({
          freq: lead,
          duration: 0.26,
          type: "sine",
          volume: 0.06,
        });
      }
      this.bgmStep++;
    }, stepMs);
  }

  /** Alias to stopBgm() — tower BGM shares the interval slot. */
  stopTowerBgm(): void {
    this.stopBgm();
  }

  // --- Neon Snake SFX ------------------------------------------------
  /** Two-note ascending chirp played on run start (330 -> 440 Hz square). */
  snakeStart(): void {
    this.tone({ freq: 330, duration: 0.08, type: "square", volume: 0.24 });
    window.setTimeout(
      () =>
        this.tone({ freq: 440, duration: 0.1, type: "square", volume: 0.26 }),
      90,
    );
  }

  /** Sweet pickup chirp when a food pellet is eaten (600 -> 800 Hz triangle). */
  snakeEat(): void {
    this.tone({
      freq: 600,
      freqEnd: 800,
      duration: 0.08,
      type: "triangle",
      volume: 0.26,
    });
  }

  /**
   * Soft click on turn. Intentionally subtle — plays on every direction
   * change so the volume is kept well below other SFX.
   */
  snakeTurn(): void {
    this.tone({
      freq: 440,
      duration: 0.03,
      type: "square",
      volume: 0.03,
    });
  }

  /** Descending sawtooth slide + noise burst on death. */
  snakeDeath(): void {
    this.tone({
      freq: 440,
      freqEnd: 80,
      duration: 0.5,
      type: "sawtooth",
      volume: 0.38,
    });
    window.setTimeout(() => this.noise(0.25, 0.2), 120);
  }

  // --- Neon Snake BGM ------------------------------------------------
  // Relaxed C-major pentatonic (C D E G A) walking loop. Distinct from
  // the tower loop by using a trotting bass and a higher, busier lead.
  private readonly snakeBassPattern: (number | null)[] = [
    130.81, null, 196, null, 164.81, null, 196, null,
    146.83, null, 220, null, 164.81, null, 196, null,
  ];
  private readonly snakeLeadPattern: (number | null)[] = [
    523.25, null, 659.25, 783.99, null, 880, 659.25, null,
    587.33, null, 783.99, 880, null, 1046.5, 783.99, null,
  ];

  startSnakeBgm(): void {
    // Only one BGM at a time — cancel any other loop before starting.
    this.stopBgm();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const stepMs = 150; // 100 BPM 16th-notes (slow walking groove)
    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.muted) return;
      const idx = this.bgmStep % 16;
      const bass = this.snakeBassPattern[idx];
      const lead = this.snakeLeadPattern[idx];
      if (bass !== null) {
        this.tone({
          freq: bass,
          duration: 0.14,
          type: "triangle",
          volume: 0.07,
        });
      }
      if (lead !== null) {
        this.tone({
          freq: lead,
          duration: 0.12,
          type: "square",
          volume: 0.05,
        });
      }
      this.bgmStep++;
    }, stepMs);
  }

  /** Alias to stopBgm() — snake BGM shares the interval slot. */
  stopSnakeBgm(): void {
    this.stopBgm();
  }

  // --- Reflex Target ---------------------------------------------------
  targetHit(): void {
    this.tone({
      freq: 800,
      duration: 0.06,
      type: "triangle",
      volume: 0.22,
    });
  }

  targetGold(): void {
    this.tone({ freq: 660, duration: 0.07, type: "triangle", volume: 0.24 });
    window.setTimeout(
      () =>
        this.tone({ freq: 990, duration: 0.07, type: "triangle", volume: 0.24 }),
      60,
    );
    window.setTimeout(
      () =>
        this.tone({ freq: 1320, duration: 0.1, type: "triangle", volume: 0.26 }),
      120,
    );
  }

  targetCrit(): void {
    this.tone({
      freq: 1500,
      duration: 0.08,
      type: "square",
      volume: 0.25,
    });
  }

  targetBomb(): void {
    this.tone({
      freq: 200,
      freqEnd: 80,
      duration: 0.3,
      type: "sawtooth",
      volume: 0.35,
    });
    this.noise(0.18, 0.2);
  }

  targetMiss(): void {
    this.tone({
      freq: 300,
      freqEnd: 120,
      duration: 0.18,
      type: "sine",
      volume: 0.15,
    });
  }

  targetCombo(): void {
    this.tone({ freq: 660, duration: 0.08, type: "square", volume: 0.22 });
    window.setTimeout(
      () => this.tone({ freq: 880, duration: 0.08, type: "square", volume: 0.22 }),
      70,
    );
    window.setTimeout(
      () =>
        this.tone({ freq: 1100, duration: 0.12, type: "square", volume: 0.26 }),
      140,
    );
  }

  private readonly reflexBassPattern: (number | null)[] = [
    110, null, 110, null, 146.83, null, 110, null,
    98, null, 98, null, 123.47, null, 98, null,
  ];
  private readonly reflexLeadPattern: (number | null)[] = [
    523, null, 659, null, 784, null, 659, 523,
    440, null, 587, null, 698, null, 587, 440,
  ];

  startReflexBgm(): void {
    this.stopBgm();
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const stepMs = 125; // ~120 BPM 16ths
    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.muted) return;
      const idx = this.bgmStep % 16;
      const bass = this.reflexBassPattern[idx];
      const lead = this.reflexLeadPattern[idx];
      if (bass !== null) {
        this.tone({
          freq: bass,
          duration: 0.2,
          type: "square",
          volume: 0.08,
        });
      }
      if (lead !== null) {
        this.tone({
          freq: lead,
          duration: 0.14,
          type: "triangle",
          volume: 0.09,
        });
      }
      this.bgmStep++;
    }, stepMs);
  }

  /** Alias to stopBgm() — reflex BGM shares the interval slot. */
  stopReflexBgm(): void {
    this.stopBgm();
  }

  // --- Memory Sequence -------------------------------------------------
  // 4 버튼 고유 음정 (C4, E4, G4, B4 — Cmaj 7th 분산)
  private readonly memoryTones: number[] = [261.63, 329.63, 392.0, 493.88];

  memoryTone(idx: 0 | 1 | 2 | 3): void {
    const f = this.memoryTones[idx] ?? 440;
    this.tone({
      freq: f,
      duration: 0.22,
      type: "triangle",
      volume: 0.22,
    });
  }

  memorySuccess(): void {
    this.tone({ freq: 523, duration: 0.08, type: "triangle", volume: 0.22 });
    window.setTimeout(
      () => this.tone({ freq: 784, duration: 0.12, type: "triangle", volume: 0.24 }),
      90,
    );
  }

  memoryFail(): void {
    this.tone({
      freq: 300,
      freqEnd: 80,
      duration: 0.6,
      type: "sawtooth",
      volume: 0.35,
    });
    this.noise(0.35, 0.18);
  }

  memoryPlayerTick(): void {
    // 플레이어 탭 시 아주 부드러운 클릭 피드백
    this.tone({ freq: 1100, duration: 0.03, type: "square", volume: 0.08 });
  }

  // --- Piano Tiles -----------------------------------------------------
  // 4 레인 각 C major 펜타토닉 음정 (C4, E4, G4, A4)
  private readonly pianoTones: number[] = [261.63, 329.63, 392.0, 440.0];

  pianoTap(idx: 0 | 1 | 2 | 3): void {
    const f = this.pianoTones[idx] ?? 440;
    this.tone({
      freq: f,
      duration: 0.18,
      type: "triangle",
      volume: 0.2,
    });
  }

  pianoFail(): void {
    this.tone({
      freq: 240,
      freqEnd: 80,
      duration: 0.55,
      type: "sawtooth",
      volume: 0.35,
    });
    this.noise(0.25, 0.18);
  }

  // --- Minesweeper Sprint ---------------------------------------------
  mineReveal(): void {
    this.tone({ freq: 1200, duration: 0.04, type: "square", volume: 0.1 });
  }

  mineFlag(): void {
    this.tone({ freq: 900, duration: 0.05, type: "triangle", volume: 0.14 });
    window.setTimeout(
      () => this.tone({ freq: 660, duration: 0.05, type: "triangle", volume: 0.12 }),
      50,
    );
  }

  mineExplode(): void {
    this.tone({
      freq: 180,
      freqEnd: 50,
      duration: 0.5,
      type: "sawtooth",
      volume: 0.38,
    });
    this.noise(0.4, 0.25);
  }

  mineClear(): void {
    this.tone({ freq: 660, duration: 0.08, type: "triangle", volume: 0.22 });
    window.setTimeout(
      () => this.tone({ freq: 880, duration: 0.08, type: "triangle", volume: 0.24 }),
      80,
    );
    window.setTimeout(
      () => this.tone({ freq: 1320, duration: 0.12, type: "triangle", volume: 0.26 }),
      160,
    );
  }
}

let singleton: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine | null {
  if (typeof window === "undefined") return null;
  if (!singleton) singleton = new AudioEngine();
  return singleton;
}

export type { AudioEngine };
