"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BulletDodgeGame from "./BulletDodgeGame";
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
const GAME_CONFIG = GAME_CONFIGS["bullet-dodge"];

export default function BulletDodgeExperience() {
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
      getAudioEngine()?.stopBgm();
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
    (scoreMs: number) => {
      if (!qualifies(scoreMs)) return;
      setPendingScore(scoreMs);
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
        <div className="relative w-full lg:flex-1 lg:max-w-[800px]">
          <BulletDodgeGame onGameOver={handleGameOver} />
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
            aria-pressed={!muted}
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-md border border-zinc-700 bg-black/70 backdrop-blur-sm flex items-center justify-center hover:border-rose-400 hover:text-rose-300 text-zinc-300 transition-colors"
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
          aria-label="Items and ranking"
          className="hidden lg:flex lg:sticky lg:top-6 w-[260px] flex-shrink-0 flex-col gap-4"
        >
          <ItemsLegend />
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

      <div className="w-full max-w-[800px] mx-auto lg:hidden mt-6">
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

function ItemsLegend() {
  const items: Array<{ letter: string; color: string; label: string; detail: string }> = [
    { letter: "S", color: "#38bdf8", label: "방어막", detail: "3s 무적" },
    { letter: "F", color: "#e879f9", label: "총알정지", detail: "3s" },
    { letter: "B", color: "#fde047", label: "화면정리", detail: "즉시" },
    { letter: "L", color: "#a3e635", label: "슬로우", detail: "3s" },
    { letter: "+", color: "#fb7185", label: "시간+5s", detail: "즉시" },
  ];
  return (
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="font-[family-name:var(--font-pixel)] text-[11px] text-rose-400 tracking-widest mb-1">
        ▸ ITEMS
      </h3>
      <p className="font-[family-name:var(--font-retro)] text-sm text-zinc-500 mb-3">
        플레이 중 참고 · 획득 시 발동
      </p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.letter} className="flex items-baseline gap-3">
            <span
              className="font-[family-name:var(--font-pixel)] text-sm font-bold w-5 text-center"
              style={{ color: it.color }}
            >
              {it.letter}
            </span>
            <span className="font-[family-name:var(--font-retro)] text-base text-zinc-300 leading-snug flex-1">
              {it.label}{" "}
              <span className="text-zinc-500 text-sm">({it.detail})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
