import type { Metadata } from "next";
import Link from "next/link";
import BulletDodgeExperience from "@/components/games/bullet-dodge/BulletDodgeExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Bullet Dodge (총알피하기)",
  url: `${BASE_URL}/games/bullet-dodge`,
  description:
    "사방에서 쏟아지는 총알을 피해 최대한 오래 살아남는 회피 생존 미니게임. 전역 랭킹으로 누가 제일 오래 버티는지 겨뤄봐라.",
  genre: "Arcade",
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
};

export const metadata: Metadata = {
  title: "Bullet Dodge (총알피하기) — Flash Games",
  description:
    "사방에서 쏟아지는 총알을 피해 최대한 오래 살아남는 회피 생존 미니게임. 전역 랭킹으로 누가 제일 오래 버티는지 겨뤄봐라.",
};

export default function BulletDodgePage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-rose-400 text-glow-rose leading-relaxed">
              BULLET DODGE
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              총알피하기
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.01
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <BulletDodgeExperience />

        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-rose-400">← → ↑ ↓</span> 또는{" "}
              <span className="text-rose-400">W A S D</span> 키로 4방향 이동 (대각선 가능)
            </li>
            <li>
              <span className="text-rose-400">마우스</span>로 캔버스 위를 움직이면 플레이어가 따라옴 (키보드 사용 중에는 자동 무시)
            </li>
            <li>
              모바일: 캔버스 위에서 <span className="text-rose-400">드래그</span>로 이동,{" "}
              <span className="text-rose-400">탭</span>으로 시작 / 재시작
            </li>
            <li>
              <span className="text-rose-400">SPACE</span> / 탭으로 시작,{" "}
              <span className="text-rose-400">R</span> / SPACE / 탭으로 재시작
            </li>
            <li>총알에 닿으면 즉시 GAME OVER — 생존 시간(초)이 점수가 된다</li>
            <li>
              <span className="text-amber-300">TOP 10</span>에 들면 이름을 남길 수 있다 · 30초 넘기면 진짜 잘하는 거다
            </li>
          </ul>

          <h3 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mt-5 mb-3 lg:hidden">
            ▸ ITEMS
          </h3>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5 lg:hidden">
            <li>
              <span className="text-[#38bdf8] font-bold">S</span> 방어막 3s ·{" "}
              <span className="text-[#e879f9] font-bold">F</span> 총알정지 3s ·{" "}
              <span className="text-[#fde047] font-bold">B</span> 화면정리
            </li>
            <li>
              <span className="text-[#a3e635] font-bold">L</span> 슬로우 3s ·{" "}
              <span className="text-[#fb7185] font-bold">+</span> 시간 +5s
            </li>
            <li className="text-zinc-500 text-base">
              시작 7초 후부터 캔버스 안에 랜덤 등장 · 6초 안에 플레이어로 가서 접촉하면 발동
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          피하고 또 피해라 — DODGE OR DIE
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
