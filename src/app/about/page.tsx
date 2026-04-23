import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Flash Games",
  description:
    "Flash Games는 옛날 플래시게임 감성을 현대 브라우저로 되살린 미니게임 컬렉션입니다. 사이트 소개, 게임 목록, 제작자 정보를 확인하세요.",
};

const games = [
  {
    slug: "bullet-dodge",
    title: "Bullet Dodge",
    titleKo: "총알피하기",
    color: "text-rose-400",
    border: "border-rose-400/30",
    description:
      "사방에서 쏟아지는 총알을 피해 최대한 오래 살아남는 회피 생존 게임. 아이템을 활용하고 전역 랭킹에 도전하라.",
  },
  {
    slug: "wolf-runner",
    title: "Wolf Runner",
    titleKo: "늑대 러너",
    color: "text-amber-300",
    border: "border-amber-300/30",
    description:
      "끝없이 달리는 늑대를 3단 점프로 조종해 장애물을 피하는 러닝 게임. 1000m를 넘기면 익스트림 모드가 기다린다.",
  },
  {
    slug: "tower-stacker",
    title: "Tower Stacker",
    titleKo: "타워 스태커",
    color: "text-violet-300",
    border: "border-violet-300/30",
    description:
      "흔들리는 블록을 정확한 타이밍에 멈춰 하늘까지 쌓는 타이밍 게임. PERFECT 판정으로 블록 폭을 유지하는 게 핵심이다.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <header className="w-full border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-cyan-400 text-glow-cyan tracking-widest hover:text-cyan-300 transition-colors"
          >
            ← HOME
          </Link>
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-base text-lime-400 text-glow-lime leading-relaxed">
              ABOUT
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              사이트 소개
            </p>
          </div>
          <span aria-hidden className="w-16" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* 소개 */}
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ ABOUT THIS SITE
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-xl text-zinc-300 leading-relaxed">
            Flash Games는 2000년대 플래시 게임 시절의 감성을 현대 브라우저에서 그대로 즐길 수 있는
            미니게임 컬렉션입니다. 설치 없이, 로그인 없이, 지금 바로 플레이할 수 있습니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 leading-relaxed">
            복잡한 게임이 아닙니다. 단순하지만 중독성 있는 게임들로, 잠깐의 여유 시간을 채워드립니다.
          </p>
        </section>

        {/* 기술 스택 */}
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ TECH STACK
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 space-y-2 pl-2">
            <li>
              <span className="text-cyan-400">Next.js</span> — App Router 기반 React 프레임워크
            </li>
            <li>
              <span className="text-cyan-400">Phaser 3</span> — 브라우저용 게임 엔진
            </li>
            <li>
              <span className="text-cyan-400">TypeScript</span> — 타입 안전 코드
            </li>
            <li>
              <span className="text-cyan-400">Tailwind CSS</span> — 유틸리티 퍼스트 스타일링
            </li>
            <li>
              <span className="text-cyan-400">Upstash Redis</span> — 리더보드 데이터 저장
            </li>
          </ul>
        </section>

        {/* 게임 목록 */}
        <section className="space-y-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ GAMES ({games.length})
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {games.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/games/${game.slug}`}
                  className={`block rounded-lg border-2 ${game.border} bg-zinc-900/60 p-5 hover:-translate-y-1 transition-transform duration-200`}
                >
                  <h3 className={`font-[family-name:var(--font-pixel)] text-xs ${game.color} mb-1 leading-relaxed`}>
                    {game.title}
                  </h3>
                  <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400 mb-3">
                    {game.titleKo}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {game.description}
                  </p>
                  <span className={`font-[family-name:var(--font-pixel)] text-[10px] ${game.color} tracking-widest mt-4 block`}>
                    ▸ PLAY
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 제작자 */}
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ MAKER
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 leading-relaxed">
            개발자의 취미 프로젝트입니다. 옛날 플래시 게임들을 좋아했던 기억으로 만들었습니다.
          </p>
        </section>

        {/* 향후 계획 */}
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ WHAT&apos;S NEXT
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 space-y-2 pl-2 list-disc list-inside">
            <li>새로운 미니게임 지속 추가 예정</li>
            <li>피드백은 언제나 환영합니다</li>
          </ul>
        </section>

        {/* 연락처 */}
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
            ▸ CONTACT
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-400">
            문의 및 피드백:{" "}
            <a
              href="mailto:yesjiwon5304@gmail.com"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              yesjiwon5304@gmail.com
            </a>
          </p>
        </section>

      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          플래시는 사라졌지만 게임은 계속된다 — THE GAME GOES ON
        </div>
        <div className="max-w-4xl mx-auto px-6 pb-5 flex flex-wrap justify-center gap-4 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/about" className="hover:text-zinc-400 transition-colors">About</Link>
          <span>© 2026 Flash Games</span>
        </div>
      </footer>
    </div>
  );
}
