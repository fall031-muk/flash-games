"use client";

import {
  GAME_CONFIGS,
  PERIOD_LABEL,
  PERIOD_LABEL_EN,
  PERIOD_ORDER,
  PERIOD_RESET_NOTE,
  type GameKey,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/lib/leaderboard-shared";

type Props = {
  game: GameKey;
  entries: LeaderboardEntry[];
  configured: boolean;
  loading: boolean;
  error: string | null;
  highlightId: string | null;
  period: LeaderboardPeriod;
  onChangePeriod: (period: LeaderboardPeriod) => void;
  variant?: "desktop" | "mobile";
};

export default function Leaderboard({
  game,
  entries,
  configured,
  loading,
  error,
  highlightId,
  period,
  onChangePeriod,
  variant = "desktop",
}: Props) {
  const format = GAME_CONFIGS[game].formatScore;

  return (
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="font-[family-name:var(--font-pixel)] text-[11px] text-rose-400 tracking-widest">
          ▸ TOP 10
        </h3>
        {variant === "mobile" && (
          <span className="font-[family-name:var(--font-retro)] text-xs text-zinc-500">
            {PERIOD_RESET_NOTE[period]}
          </span>
        )}
      </div>

      <div
        role="tablist"
        aria-label="리더보드 기간"
        className="flex gap-1 p-1 rounded border border-zinc-800 bg-black/40 mb-3"
      >
        {PERIOD_ORDER.map((p) => {
          const active = p === period;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChangePeriod(p)}
              className={
                "flex-1 rounded py-1.5 font-[family-name:var(--font-pixel)] text-[10px] tracking-widest transition-colors " +
                (active
                  ? "bg-rose-500/20 text-rose-300 border border-rose-400/50"
                  : "text-zinc-500 hover:text-zinc-200 border border-transparent")
              }
            >
              {PERIOD_LABEL_EN[p]}
            </button>
          );
        })}
      </div>

      {variant === "desktop" && (
        <p className="font-[family-name:var(--font-retro)] text-sm text-zinc-500 mb-3">
          {PERIOD_RESET_NOTE[period]}
        </p>
      )}

      {!configured && !loading && (
        <p className="font-[family-name:var(--font-retro)] text-base text-zinc-500 py-4">
          리더보드 준비 중입니다.
        </p>
      )}

      {configured && error && (
        <p className="font-[family-name:var(--font-retro)] text-base text-rose-400 py-4">
          {error}
        </p>
      )}

      {configured && !error && (
        <ol className="space-y-1.5">
          {loading && entries.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={`skeleton-${i}`}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 rounded bg-zinc-800/30 animate-pulse"
                >
                  <span className="block h-3 w-8 bg-zinc-700 rounded" />
                  <span className="block h-3 w-16 bg-zinc-700 rounded" />
                  <span className="block h-3 w-10 bg-zinc-700 rounded" />
                </li>
              ))
            : entries.length === 0
              ? [
                  <li
                    key="empty"
                    className="font-[family-name:var(--font-retro)] text-base text-zinc-500 py-4 text-center"
                  >
                    아직 {PERIOD_LABEL[period]} 기록이 없습니다.
                    <br />
                    첫 번째 기록자가 되세요!
                  </li>,
                ]
              : entries.map((entry) => {
                  const isTop = entry.rank <= 3;
                  const rankColor =
                    entry.rank === 1
                      ? "text-amber-300"
                      : entry.rank === 2
                        ? "text-zinc-300"
                        : entry.rank === 3
                          ? "text-orange-400"
                          : "text-zinc-500";
                  const entryKey = entry.name + entry.score;
                  const isHighlight = highlightId === entryKey;
                  return (
                    <li
                      key={`${entry.rank}-${entry.name}-${entry.score}`}
                      className={
                        "flex items-center justify-between gap-3 px-2 py-1.5 rounded text-sm " +
                        (isHighlight
                          ? "bg-rose-500/20 border border-rose-400/50"
                          : isTop
                            ? "bg-zinc-800/50"
                            : "bg-transparent")
                      }
                    >
                      <span
                        className={`font-[family-name:var(--font-pixel)] text-[10px] w-6 ${rankColor}`}
                      >
                        {entry.rank.toString().padStart(2, "0")}
                      </span>
                      <span className="font-[family-name:var(--font-pixel)] text-[11px] text-zinc-100 tracking-wide flex-1 truncate">
                        {entry.name}
                      </span>
                      <span className="font-[family-name:var(--font-retro)] text-lg text-rose-300 tabular-nums">
                        {format(entry.score)}
                      </span>
                    </li>
                  );
                })}
        </ol>
      )}
    </div>
  );
}
