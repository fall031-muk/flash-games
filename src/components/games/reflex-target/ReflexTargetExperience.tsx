"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReflexTargetGame from "./ReflexTargetGame";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import ScoreSubmitModal from "@/components/leaderboard/ScoreSubmitModal";
import {
  GAME_CONFIGS,
  LEADERBOARD_SIZE,
  PERIOD_ORDER,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/lib/leaderboard-shared";
import { getAudioEngine } from "@/lib/audio";

type PeriodState = {
  entries: LeaderboardEntry[];
  resetsAt: number;
};

type BoardState = {
  configured: boolean;
  loading: boolean;
  error: string | null;
  data: Record<LeaderboardPeriod, PeriodState>;
};

const EMPTY_PERIOD: PeriodState = { entries: [], resetsAt: 0 };
const GAME_CONFIG = GAME_CONFIGS["reflex-target"];

export default function ReflexTargetExperience() {
  const [board, setBoard] = useState<BoardState>({
    configured: true,
    loading: true,
    error: null,
    data: { weekly: EMPTY_PERIOD, monthly: EMPTY_PERIOD },
  });
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const hasFetchedRef = useRef(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/leaderboard?game=${GAME_CONFIG.key}&period=all`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) {
        setBoard((s) => ({
          ...s,
          loading: false,
          error: data?.error ?? "리더보드 조회 실패",
        }));
        return;
      }
      if (!data.configured) {
        setBoard({
          configured: false,
          loading: false,
          error: null,
          data: { weekly: EMPTY_PERIOD, monthly: EMPTY_PERIOD },
        });
        return;
      }
      const incoming = data.data as Record<LeaderboardPeriod, PeriodState>;
      setBoard({
        configured: true,
        loading: false,
        error: null,
        data: {
          weekly: incoming.weekly ?? EMPTY_PERIOD,
          monthly: incoming.monthly ?? EMPTY_PERIOD,
        },
      });
    } catch {
      setBoard((s) => ({
        ...s,
        loading: false,
        error: "리더보드 조회 실패",
      }));
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadLeaderboard();
    const audio = getAudioEngine();
    if (audio) setMuted(audio.isMuted());
    return () => {
      getAudioEngine()?.stopReflexBgm();
    };
  }, [loadLeaderboard]);

  const toggleMute = useCallback(() => {
    const audio = getAudioEngine();
    if (!audio) return;
    const next = !audio.isMuted();
    audio.setMuted(next);
    setMuted(next);
    if (!next) audio.resume();
  }, []);

  const qualifies = useCallback(
    (score: number) => {
      if (!board.configured) return false;
      if (score <= 0) return false;
      return PERIOD_ORDER.some((p) => {
        const entries = board.data[p].entries;
        if (entries.length < LEADERBOARD_SIZE) return true;
        const worst = entries[entries.length - 1];
        return worst ? score > worst.score : true;
      });
    },
    [board],
  );

  const handleGameOver = useCallback(
    (score: number) => {
      if (!qualifies(score)) return;
      setPendingScore(score);
      setModalOpen(true);
    },
    [qualifies],
  );

  const handleSubmitted = useCallback(
    async ({ name, score }: { name: string; score: number; weeklyRank: number; monthlyRank: number }) => {
      setModalOpen(false);
      setHighlightId(name + score);
      await loadLeaderboard();
      setTimeout(() => setHighlightId(null), 6000);
    },
    [loadLeaderboard],
  );

  const currentPeriodData = board.data[period];

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6">
        <div className="relative w-full lg:w-[600px] lg:flex-shrink-0">
          <ReflexTargetGame onGameOver={handleGameOver} />
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
            aria-pressed={!muted}
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-md border border-zinc-700 bg-black/70 backdrop-blur-sm flex items-center justify-center hover:border-cyan-400 hover:text-cyan-300 text-zinc-300 transition-colors"
            title={muted ? "사운드 켜기" : "사운드 끄기"}
          >
            <span
              aria-hidden
              className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest"
            >
              {muted ? "OFF" : "ON"}
            </span>
          </button>
        </div>
        <aside
          aria-label="타겟 종류 및 랭킹"
          className="hidden lg:flex lg:sticky lg:top-6 w-[260px] flex-shrink-0 flex-col gap-4"
        >
          <TargetsLegend />
          <Leaderboard
            game={GAME_CONFIG.key}
            entries={currentPeriodData.entries}
            configured={board.configured}
            loading={board.loading}
            error={board.error}
            highlightId={highlightId}
            period={period}
            onChangePeriod={setPeriod}
            variant="desktop"
          />
        </aside>
      </div>

      <div className="w-full max-w-[600px] mx-auto lg:hidden mt-6">
        <Leaderboard
          game={GAME_CONFIG.key}
          entries={currentPeriodData.entries}
          configured={board.configured}
          loading={board.loading}
          error={board.error}
          highlightId={highlightId}
          period={period}
          onChangePeriod={setPeriod}
          variant="mobile"
        />
      </div>

      <ScoreSubmitModal
        game={GAME_CONFIG.key}
        open={modalOpen}
        score={pendingScore}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}

function TargetsLegend() {
  const items: Array<{ color: string; label: string; detail: string }> = [
    { color: "#22d3ee", label: "일반 타겟", detail: "+10점 · 1.5s" },
    { color: "#fbbf24", label: "금색 (희귀)", detail: "+50점 · 작고 짧음" },
    { color: "#fb7185", label: "빨강 (극희귀)", detail: "+100점 · 찰나" },
    { color: "#27272a", label: "폭탄", detail: "−100점 · 피해라" },
  ];
  return (
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="font-[family-name:var(--font-pixel)] text-[11px] text-cyan-400 tracking-widest mb-1">
        ▸ TARGETS
      </h3>
      <p className="font-[family-name:var(--font-retro)] text-sm text-zinc-500 mb-3">
        5콤보마다 ×1.5 배율 · 최대 ×2.5
      </p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: it.color, boxShadow: `0 0 8px ${it.color}80` }}
            />
            <div className="flex-1">
              <div className="font-[family-name:var(--font-pixel)] text-[10px] text-zinc-200 tracking-wider">
                {it.label}
              </div>
              <div className="font-[family-name:var(--font-retro)] text-base text-zinc-400 leading-tight">
                {it.detail}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
