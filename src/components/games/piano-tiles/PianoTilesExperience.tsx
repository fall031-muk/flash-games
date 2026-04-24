"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PianoTilesGame from "./PianoTilesGame";
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
const GAME_CONFIG = GAME_CONFIGS["piano-tiles"];

export default function PianoTilesExperience() {
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
    (tiles: number) => {
      if (!qualifies(tiles)) return;
      setPendingScore(tiles);
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
        <div className="relative w-full lg:w-[400px] lg:flex-shrink-0">
          <PianoTilesGame onGameOver={handleGameOver} />
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
            aria-pressed={!muted}
            className="absolute top-2 right-2 z-10 w-9 h-9 rounded-md border border-zinc-700 bg-black/70 backdrop-blur-sm flex items-center justify-center hover:border-emerald-400 hover:text-emerald-300 text-zinc-300 transition-colors"
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
          aria-label="조작법 및 랭킹"
          className="hidden lg:flex lg:sticky lg:top-6 w-[260px] flex-shrink-0 flex-col gap-4"
        >
          <HowToPlayCard />
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

      <div className="w-full max-w-[400px] mx-auto lg:hidden mt-6">
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

function HowToPlayCard() {
  const rows: Array<{ label: string; detail: string }> = [
    { label: "탭 / 키보드", detail: "레인 위 검은 타일을 탭" },
    { label: "D F J K", detail: "각각 1·2·3·4 레인" },
    { label: "가속", detail: "맞출수록 빨라진다" },
    { label: "GAME OVER", detail: "빗나가거나 놓치면 끝" },
  ];
  return (
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="font-[family-name:var(--font-pixel)] text-[11px] text-emerald-400 tracking-widest mb-1">
        ▸ HOW IT WORKS
      </h3>
      <p className="font-[family-name:var(--font-retro)] text-sm text-zinc-500 mb-3">
        가장 아래쪽 타일을 순서대로
      </p>
      <ul className="space-y-1.5">
        {rows.map((it) => (
          <li key={it.label} className="flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-pixel)] text-[10px] text-emerald-300 tracking-wider w-20 shrink-0">
              {it.label}
            </span>
            <span className="font-[family-name:var(--font-retro)] text-base text-zinc-300 leading-snug flex-1">
              {it.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
