import type { Metadata } from "next";
import Link from "next/link";
import TowerStackerExperience from "@/components/games/tower-stacker/TowerStackerExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Tower Stacker (타워 스태커)",
  url: `${BASE_URL}/games/tower-stacker`,
  description:
    "흔들리는 블록을 탭으로 멈춰 하늘까지 쌓아올리는 타이밍 중독 게임. 매주 월요일 초기화되는 글로벌 랭킹.",
  genre: "Arcade",
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
};

export const metadata: Metadata = {
  title: "Tower Stacker (타워 스태커) — Flash Games",
  description:
    "흔들리는 블록을 탭으로 멈춰 하늘까지 쌓아올리는 타이밍 중독 게임. 매주 월요일 초기화되는 글로벌 랭킹.",
};

export default function TowerStackerPage() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <header className="w-full border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-cyan-400 text-glow-cyan tracking-widest hover:text-cyan-300 transition-colors"
          >
            ← HOME
          </Link>
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-violet-300 leading-relaxed drop-shadow-[0_0_8px_rgba(196,181,253,0.45)]">
              TOWER STACKER
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              타워 스태커
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.03
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <TowerStackerExperience />

        <section className="w-full max-w-[600px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-violet-300">SPACE</span> / 클릭 / 탭으로 움직이는 블록을 정지
            </li>
            <li>
              이전 블록과 <span className="text-violet-300">겹치는 부분만 남고</span> 빗나간 부분은 떨어져나간다
            </li>
            <li>
              블록이 점점 작아지니 정확한 타이밍이 생명
            </li>
            <li>
              <span className="text-amber-300">PERFECT!</span> (95%+ 겹침) 시 블록 폭이 +5px 복원 — 오래 버티려면 필수
            </li>
            <li>
              블록 폭이 <span className="text-rose-400">2px 미만</span>이면 즉시 GAME OVER — 쌓은 층(층수)이 점수
            </li>
            <li>
              높이가 올라갈수록 블록이 더 빨라진다 · <span className="text-violet-300">50층</span> 넘기면 진짜 고수다
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          하늘까지 쌓아라 — REACH FOR THE SKY
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-5 flex flex-wrap justify-center gap-4 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/about" className="hover:text-zinc-400 transition-colors">About</Link>
          <span>© 2026 Flash Games</span>
        </div>
      </footer>
    </div>
  );
}
