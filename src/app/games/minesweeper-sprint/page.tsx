import type { Metadata } from "next";
import Link from "next/link";
import MinesweeperSprintExperience from "@/components/games/minesweeper-sprint/MinesweeperSprintExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Minesweeper Sprint (지뢰찾기 스프린트)",
  url: `${BASE_URL}/games/minesweeper-sprint`,
  description:
    "60초 안에 9×9 지뢰찾기 맵을 최대한 많이 클리어하는 타임어택 퍼즐 게임. 고전 지뢰찾기 룰 그대로, 클리어할수록 점수 +1. 지뢰 클릭 시 -3초 페널티 후 새 맵. 무료 브라우저 플레이.",
  genre: ["Puzzle", "Strategy"],
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
  isAccessibleForFree: true,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Minesweeper Sprint",
      item: `${BASE_URL}/games/minesweeper-sprint`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Minesweeper Sprint는 어떻게 플레이하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "60초 타임어택입니다. 9×9 그리드에 숨겨진 10개의 지뢰를 피해 나머지 모든 셀을 공개하면 맵 클리어(+1점), 새 맵이 자동 생성됩니다. 지뢰를 누르면 −3초 페널티 + 새 맵. 60초 안에 몇 개의 맵을 클리어했는지가 점수.",
      },
    },
    {
      "@type": "Question",
      name: "숫자는 무엇을 의미하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "숫자는 해당 셀의 주변 8개 셀 중 지뢰가 몇 개 있는지를 나타냅니다. 1이 써 있으면 주변 8칸 중 1개에 지뢰가 있다는 뜻. 숫자들을 조합해 논리적으로 지뢰 위치를 추론하는 게 핵심입니다.",
      },
    },
    {
      "@type": "Question",
      name: "첫 클릭도 지뢰일 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "아닙니다. 첫 클릭은 항상 안전하게 설계되어 있고, 첫 클릭한 셀과 주변 8개 셀에는 지뢰가 배치되지 않습니다. 따라서 아무 셀이나 시작하면 되고, 보통 중앙을 클릭하면 대규모 캐스케이드 공개가 일어나서 더 유리합니다.",
      },
    },
    {
      "@type": "Question",
      name: "깃발은 어떻게 놓나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "데스크톱에서는 우클릭, 또는 F 키로 깃발 모드 토글 후 탭. 모바일에서는 F 키가 없으니 화면 내 깃발 모드 토글을 누른 뒤 탭하여 깃발 설치. 깃발은 단순히 '여기에 지뢰가 있을 것'이라는 본인 표시용이며, 승리 조건에는 영향 없습니다.",
      },
    },
    {
      "@type": "Question",
      name: "Sprint는 왜 60초인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "클래식 지뢰찾기는 한 판에 10분도 걸릴 수 있는데, Sprint는 의도적으로 60초로 제한해 '빠른 판단'을 요구합니다. 신중하게 모든 셀을 계산하기보다는 패턴 인식과 확률 판단으로 속도 있게 풀어야 고득점.",
      },
    },
    {
      "@type": "Question",
      name: "몇 개 맵이면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "2~3맵은 입문, 5~7맵이면 실력자, 10맵 이상이면 최상위권입니다. 60초에 맵 평균 10~20초에 클리어해야 가능한 페이스. 순간 판단력과 함께 9×9 패턴 경험이 누적되면 한 맵당 시간이 짧아집니다.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 55px 셀 크기로 모바일에서도 누르기 편합니다. 깃발 모드 토글 버튼이 화면 상단에 있어 손가락만으로 공개/깃발 전환 가능. 단 빠른 스크롤이 필요 없어 작은 화면에서도 플레이 쾌적합니다.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Minesweeper Sprint — 지뢰찾기 타임어택 무료 플레이 | Flash Games",
  description:
    "60초 안에 9×9 지뢰찾기 맵을 최대한 많이 클리어하는 고전 퍼즐 타임어택. 첫 클릭 안전, 주변 숫자 논리 추론. 다운로드 없이 브라우저에서 바로 무료 플레이. 모바일 지원.",
  alternates: {
    canonical: `${BASE_URL}/games/minesweeper-sprint`,
  },
};

export default function MinesweeperSprintPage() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-indigo-400 leading-relaxed drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">
              MINESWEEPER SPRINT
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              지뢰찾기 스프린트
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.08
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <MinesweeperSprintExperience />

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-indigo-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-indigo-300">SPACE</span> / 클릭 / 탭으로 시작
            </li>
            <li>
              <span className="text-indigo-300">좌클릭 / 탭</span>: 셀 공개 (첫 클릭은 항상 안전)
            </li>
            <li>
              <span className="text-indigo-300">우클릭</span> 또는 <span className="text-indigo-300">F 키</span>: 깃발 모드 토글 (모바일도 F 자리의 화면 뱃지)
            </li>
            <li>
              공개된 숫자는 <span className="text-indigo-300">주변 8칸 중 지뢰 개수</span> — 논리적으로 지뢰 위치 추론
            </li>
            <li>
              모든 비지뢰 셀 공개 = 맵 클리어, <span className="text-indigo-300">+1맵</span>, 새 맵 자동 시작
            </li>
            <li>
              지뢰 클릭 = <span className="text-rose-400">−3초 페널티</span> + 새 맵. 60초 안에 <span className="text-indigo-300">5맵</span> 넘기면 실력자
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-indigo-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 leading-relaxed">
            <p>
              Minesweeper Sprint는 Windows 95 시절부터 이어진 <strong className="text-indigo-300">고전 지뢰찾기</strong>를
              60초 타임어택으로 재해석한 퍼즐 게임. 1989년 Windows 3.1에 수록되어 수억 명이 플레이한 룰은 그대로,
              템포만 빠르게 바꿨다.
            </p>
            <p>
              <strong className="text-indigo-300">9×9 그리드 / 10지뢰</strong> (클래식 Beginner 난이도). 첫 클릭은 반드시
              안전하도록 설계되어 있어 즉사 걱정 없이 시작 가능. 숫자를 읽고 주변에 지뢰가 있을 확률을 빠르게
              판단하는 게 승리 열쇠.
            </p>
            <p>
              신중하게 30분 걸려 한 판 끝내던 클래식과 달리, Sprint는 <strong className="text-indigo-300">직관과 속도</strong>를
              요구한다. 패턴 인식이 쌓이면 1-2-1 같은 전형은 즉시 풀리고, 60초에 여러 맵을 거뜬히 소화할 수 있게 된다.
              무료 브라우저 플레이, 다운로드 불필요.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-indigo-400 tracking-widest mb-4">
            ▸ PRO TIPS
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-indigo-300">중앙 시작</strong> — 첫 클릭은 중앙(4,4) 근처를 누르면 숫자 0 지역이
              크게 공개돼 1초에 50% 클리어 가능
            </li>
            <li>
              <strong className="text-indigo-300">1-2-1 패턴</strong> — 가장자리에서 "1 2 1" 연속 숫자가 보이면 가운데는
              항상 안전 + 양쪽 끝 직전 셀이 지뢰. 즉시 공개
            </li>
            <li>
              <strong className="text-indigo-300">1-1 가장자리</strong> — 가장자리 "1 1" 패턴은 두 번째 1의 바깥이 지뢰
            </li>
            <li>
              <strong className="text-indigo-300">깃발은 생략</strong> — Sprint에서 깃발은 시간 낭비. 머릿속에서만
              지뢰 위치 기억하고 숫자 읽기에만 집중하면 시간 절약
            </li>
            <li>
              <strong className="text-indigo-300">코너 조심</strong> — 모서리 셀은 주변이 3개뿐이라 확률 계산이 빡빡.
              불확실하면 찍지 말고 다른 쪽부터 풀기
            </li>
            <li>
              <strong className="text-indigo-300">40초 남았으면 포기</strong> — 맵이 애매해서 확률 50/50 상황이면
              차라리 의도적으로 찍고 다음 맵으로 넘어가라. 시간 페널티 3초 &lt; 막힌 맵에서 낭비 10초+
            </li>
          </ol>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-indigo-400 tracking-widest mb-4">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-4 leading-relaxed">
            {faqJsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <dt className="text-indigo-300 mb-1">
                  <span className="text-indigo-500 mr-2">Q.</span>
                  {q.name}
                </dt>
                <dd className="text-zinc-400 pl-6">
                  <span className="text-indigo-500/60 mr-2">A.</span>
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-indigo-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            <Link href="/games/bullet-dodge" className="block rounded-lg border-2 border-rose-400/30 bg-zinc-900/60 p-2 hover:border-rose-400/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>💥</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-rose-400">Bullet</h3>
            </Link>
            <Link href="/games/wolf-runner" className="block rounded-lg border-2 border-amber-300/30 bg-zinc-900/60 p-2 hover:border-amber-300/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🐺</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-amber-300">Wolf</h3>
            </Link>
            <Link href="/games/tower-stacker" className="block rounded-lg border-2 border-violet-300/30 bg-zinc-900/60 p-2 hover:border-violet-300/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🧱</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-violet-300">Tower</h3>
            </Link>
            <Link href="/games/neon-snake" className="block rounded-lg border-2 border-lime-400/30 bg-zinc-900/60 p-2 hover:border-lime-400/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🐍</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-lime-400">Snake</h3>
            </Link>
            <Link href="/games/reflex-target" className="block rounded-lg border-2 border-cyan-400/30 bg-zinc-900/60 p-2 hover:border-cyan-400/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🎯</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-cyan-400">Reflex</h3>
            </Link>
            <Link href="/games/memory-sequence" className="block rounded-lg border-2 border-fuchsia-400/30 bg-zinc-900/60 p-2 hover:border-fuchsia-400/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🧠</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-fuchsia-400">Memory</h3>
            </Link>
            <Link href="/games/piano-tiles" className="block rounded-lg border-2 border-emerald-400/30 bg-zinc-900/60 p-2 hover:border-emerald-400/60 transition-colors text-center">
              <div className="text-2xl mb-1" aria-hidden>🎹</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[8px] text-emerald-400">Piano</h3>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          빠르게 읽고 과감하게 풀어라 — READ AND RUN
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
