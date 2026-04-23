import type { Metadata } from "next";
import Link from "next/link";
import { games } from "@/data/games";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Flash Games",
  url: BASE_URL,
  description:
    "총알피하기, 늑대 러너, 타워 스태커 등 무료 온라인 브라우저 게임 모음. 다운로드 없이 바로 플레이하는 레트로 아케이드 미니게임 사이트.",
  inLanguage: "ko",
};

export const metadata: Metadata = {
  title: "Flash Games — 무료 온라인 브라우저 게임 모음 | 레트로 아케이드 미니게임",
  description:
    "총알피하기·늑대러너·타워스태커 등 무료 온라인 브라우저 게임 모음. 다운로드·설치 없이 바로 플레이하는 레트로 아케이드 미니게임. 쉬는 시간에 딱 맞는 옛날 플래시게임 감성.",
  openGraph: {
    title: "Flash Games — 무료 온라인 브라우저 게임 모음",
    description:
      "총알피하기·늑대러너·타워스태커 등 무료 온라인 브라우저 게임 모음. 다운로드 없이 바로 플레이.",
    url: BASE_URL,
    type: "website",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <header className="w-full border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-10 sm:py-16 text-center">
          <p className="font-[family-name:var(--font-pixel)] text-xs sm:text-sm text-cyan-400 text-glow-cyan mb-4 tracking-widest">
            INSERT COIN
          </p>
          <h1 className="font-[family-name:var(--font-pixel)] text-2xl sm:text-4xl md:text-5xl text-lime-400 text-glow-lime leading-relaxed">
            FLASH GAMES
          </h1>
          <p className="mt-6 font-[family-name:var(--font-retro)] text-xl sm:text-2xl text-zinc-300">
            옛날 플래시게임 감성 그대로, 브라우저에서 바로.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">

        {/* 소개 문단 */}
        <section className="mb-10">
          <p className="font-[family-name:var(--font-retro)] text-xl text-zinc-400 leading-relaxed mb-3">
            2000년대 플래시게임 시절의 그 감성, 기억하시나요? 설치도 로그인도 필요 없던 그 시절처럼,
            <strong className="text-zinc-200"> Flash Games</strong>는 다운로드 없이 브라우저에서 바로 플레이하는 무료 온라인 게임 모음입니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-500 leading-relaxed">
            단순하지만 중독성 있는 미니게임들로 쉬는 시간, 점심시간, 퇴근 후 짧은 여가를 채워드립니다.
            글로벌 랭킹 시스템으로 전 세계 플레이어와 실력을 겨뤄보세요.
          </p>
        </section>

        {/* "이런 분들에게" */}
        <section className="mb-10 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ 이런 분들에게 딱
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 space-y-2">
            <li>
              <span className="text-zinc-200">회사에서 잠깐 짬이 날 때</span> — 한 판이 1~2분이라 부담 없다
            </li>
            <li>
              <span className="text-zinc-200">옛날 플래시게임이 그리울 때</span> — 그 레트로 감성 그대로
            </li>
            <li>
              <span className="text-zinc-200">모바일로 무료 미니게임 찾을 때</span> — 앱 없이 브라우저에서 바로
            </li>
          </ul>
        </section>

        {/* 게임 카테고리 */}
        <section className="mb-10">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-zinc-500 tracking-widest mb-4">
            ▸ GAME CATEGORIES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-rose-400/20 bg-zinc-900/40 p-4">
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-rose-400 tracking-widest mb-2">회피형</p>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">날아오는 총알을 피해 최대한 오래 살아남는 반응속도 게임</p>
            </div>
            <div className="rounded-lg border border-amber-300/20 bg-zinc-900/40 p-4">
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-amber-300 tracking-widest mb-2">러너형</p>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">끝없이 달리며 장애물을 피하는 점프 게임. 얼마나 멀리 갈 수 있나</p>
            </div>
            <div className="rounded-lg border border-violet-300/20 bg-zinc-900/40 p-4">
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-violet-300 tracking-widest mb-2">타이밍형</p>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">정확한 타이밍에 블록을 멈춰 하늘까지 쌓는 집중력 게임</p>
            </div>
          </div>
        </section>

        {/* 게임 카드 그리드 */}
        <section>
          <h2 className="font-[family-name:var(--font-pixel)] text-sm sm:text-base text-zinc-400 mb-6 tracking-wider">
            ▸ SELECT GAME
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map((game) => {
              const isPlayable = game.status === "playable";
              const cardBase =
                "block h-full rounded-lg border-2 bg-zinc-900/60 p-6 transition-all duration-200";
              const cardState = isPlayable
                ? `${game.accent} hover:-translate-y-1 hover:shadow-lg cursor-pointer`
                : "border-zinc-800 opacity-60 cursor-not-allowed";

              const content = (
                <div className={`${cardBase} ${cardState}`}>
                  <div
                    className="text-5xl mb-4"
                    aria-hidden
                    role="img"
                  >
                    {game.emoji}
                  </div>
                  <h3 className="font-[family-name:var(--font-pixel)] text-sm mb-2 leading-relaxed">
                    {game.title}
                  </h3>
                  <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 mb-1">
                    {game.titleKo}
                  </p>
                  <p className="text-sm text-zinc-500 mb-4">
                    {game.description}
                  </p>
                  <span className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest">
                    {isPlayable ? "▸ PLAY" : "COMING SOON"}
                  </span>
                </div>
              );

              return (
                <li key={game.slug}>
                  {isPlayable ? (
                    <Link href={`/games/${game.slug}`} aria-label={`${game.titleKo} 플레이하기`}>{content}</Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 사이트 특징 */}
        <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ WHY FLASH GAMES?
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 space-y-2">
            <li>
              <span className="text-lime-400">무료</span> — 모든 게임 완전 무료, 광고도 없다
            </li>
            <li>
              <span className="text-lime-400">설치 불필요</span> — 다운로드·앱 설치·로그인 없이 브라우저에서 즉시 플레이
            </li>
            <li>
              <span className="text-lime-400">멀티 디바이스</span> — PC·모바일·태블릿 모두 지원
            </li>
            <li>
              <span className="text-lime-400">글로벌 랭킹</span> — 전 세계 플레이어와 점수 경쟁 가능
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center font-[family-name:var(--font-retro)] text-lg text-zinc-500">
          © {new Date().getFullYear()} Flash Games — Made with ♥
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-6 flex flex-wrap justify-center gap-4 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/about" className="hover:text-zinc-400 transition-colors">About</Link>
        </div>
      </footer>
    </div>
  );
}
