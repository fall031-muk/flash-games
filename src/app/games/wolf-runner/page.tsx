import type { Metadata } from "next";
import Link from "next/link";
import WolfRunnerExperience from "@/components/games/wolf-runner/WolfRunnerExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Wolf Runner (늑대 러너)",
  url: `${BASE_URL}/games/wolf-runner`,
  description:
    "3단 점프로 장애물을 피하며 얼마나 멀리 달릴 수 있나. 매주 월요일 초기화되는 글로벌 랭킹으로 달리기 실력을 증명하라.",
  genre: "Arcade",
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
};

export const metadata: Metadata = {
  title: "Wolf Runner (늑대 러너) — Flash Games",
  description:
    "3단 점프로 장애물을 피하며 얼마나 멀리 달릴 수 있나. 매주 월요일 초기화되는 글로벌 랭킹으로 달리기 실력을 증명하라.",
};

export default function WolfRunnerPage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-amber-300 leading-relaxed drop-shadow-[0_0_8px_rgba(253,224,71,0.45)]">
              WOLF RUNNER
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              늑대 러너
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.02
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <WolfRunnerExperience />

        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-amber-300">SPACE</span> /{" "}
              <span className="text-amber-300">↑</span> /{" "}
              <span className="text-amber-300">W</span> / 클릭 / 탭으로 점프
            </li>
            <li>
              공중에서 <span className="text-amber-300">최대 3단 점프</span> — 지면 닿으면 리셋,
              각 단마다 점프력이 약해진다
            </li>
            <li>
              장애물 7종 — <span className="text-zinc-100">돌·기둥·까마귀·구덩이</span>{" "}
              + <span className="text-orange-300">불기둥</span>(주기적 타이밍){" "}
              · <span className="text-zinc-100">유성</span>(섀도우 예고 후 낙하){" "}
              · <span className="text-zinc-100">굴러오는 바위</span>
            </li>
            <li>
              아이템 4종 — <span className="text-[#38bdf8] font-bold">S</span>방어막 10s{" "}
              · <span className="text-[#a3e635] font-bold">L</span>슬로우{" "}
              · <span className="text-[#fb7185] font-bold">×2</span>점수 2배{" "}
              · <span className="text-[#fbbf24] font-bold">↑</span>초점프 (<span className="text-amber-300">매 250m마다 랜덤 자동 발동</span>)
            </li>
            <li>
              하나라도 부딪히면 즉시 GAME OVER — 거리(m)가 점수가 된다
            </li>
            <li>
              30초 지나면 스크롤이 빨라지고 새 장애물이 등장, 90초 이후엔 풀 스피드 · <span className="text-amber-300">1000m</span> 넘으면 <span className="text-rose-400">익스트림 모드</span> (장애물 간격 ↓, 위험 장애물 비중 ↑)
            </li>
          </ul>

          <h3 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mt-5 mb-3 lg:hidden">
            ▸ ITEMS
          </h3>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5 lg:hidden">
            <li>
              <span className="text-[#38bdf8] font-bold">S</span> 방어막 (1회 무시) ·{" "}
              <span className="text-[#a3e635] font-bold">L</span> 슬로우 4s
            </li>
            <li>
              <span className="text-[#fb7185] font-bold">×2</span> 점수 2배 5s ·{" "}
              <span className="text-[#fbbf24] font-bold">↑</span> 초점프 1회
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          달려라, 멀리 — RUN WILD
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
