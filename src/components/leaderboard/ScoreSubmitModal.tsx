"use client";

import { useEffect, useRef, useState } from "react";
import {
  GAME_CONFIGS,
  NAME_MAX_LEN,
  NAME_PATTERN,
  VALID_NAME_INPUT_PATTERN,
  type GameKey,
} from "@/lib/leaderboard-shared";

type SubmitSuccess = {
  name: string;
  score: number;
  weeklyRank: number;
  monthlyRank: number;
};

type Props = {
  game: GameKey;
  open: boolean;
  score: number;
  onClose: () => void;
  onSubmitted: (result: SubmitSuccess) => void;
};

export default function ScoreSubmitModal({
  game,
  open,
  score,
  onClose,
  onSubmitted,
}: Props) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
      setSubmitting(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const canSubmit = NAME_PATTERN.test(name) && !submitting;
  const formatScore = GAME_CONFIGS[game].formatScore;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, name, score }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      onSubmitted({
        name: data.name,
        score: data.score,
        weeklyRank: data.weeklyRank,
        monthlyRank: data.monthlyRank,
      });
    } catch {
      setError("네트워크 오류. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border-2 border-rose-400/60 bg-zinc-950 p-6 shadow-[0_0_30px_rgba(251,113,133,0.35)]">
        <p className="font-[family-name:var(--font-pixel)] text-[10px] text-cyan-400 text-glow-cyan tracking-widest">
          NEW RECORD
        </p>
        <h2
          id="score-modal-title"
          className="mt-2 font-[family-name:var(--font-pixel)] text-lg sm:text-xl text-rose-400 text-glow-rose tracking-wider"
        >
          TOP 10 진입!
        </h2>
        <p className="mt-2 font-[family-name:var(--font-retro)] text-lg text-zinc-300">
          기록{" "}
          <span className="text-rose-300 tabular-nums">{formatScore(score)}</span>
        </p>

        <div className="mt-5">
          <label
            htmlFor="score-name-input"
            className="block font-[family-name:var(--font-pixel)] text-[10px] text-zinc-400 tracking-widest mb-2"
          >
            ENTER YOUR NAME · 1~5자
          </label>
          <input
            ref={inputRef}
            id="score-name-input"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={NAME_MAX_LEN * 2}
            value={name}
            onChange={(e) => {
              const next = e.target.value.toUpperCase();
              if (!VALID_NAME_INPUT_PATTERN.test(next)) return;
              const trimmed = next.length > NAME_MAX_LEN ? next.slice(0, NAME_MAX_LEN) : next;
              setName(trimmed);
              setError(null);
            }}
            onCompositionEnd={(e) => {
              const next = (e.target as HTMLInputElement).value.toUpperCase();
              if (!VALID_NAME_INPUT_PATTERN.test(next)) return;
              setName(next.length > NAME_MAX_LEN ? next.slice(0, NAME_MAX_LEN) : next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className="w-full rounded border-2 border-zinc-700 bg-black px-3 py-2 font-[family-name:var(--font-pixel)] text-lg text-lime-400 text-glow-lime text-center tracking-[0.3em] focus:outline-none focus:border-rose-400"
            placeholder="예: ACE / 홍길동"
          />
          <p className="mt-2 font-[family-name:var(--font-retro)] text-sm text-zinc-500">
            영어 (대/소문자) · 숫자 · 한글 사용 가능 · 소문자는 자동으로 대문자
          </p>
        </div>

        {error && (
          <p className="mt-3 font-[family-name:var(--font-retro)] text-base text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest px-4 py-2 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-40 transition-colors"
          >
            SKIP
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest px-4 py-2 rounded border-2 border-rose-400 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            {submitting ? "SAVING..." : "SUBMIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
