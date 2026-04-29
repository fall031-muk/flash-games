import type { Metadata } from "next";
import Link from "next/link";
import SiteLegalFooter from "@/components/common/SiteLegalFooter";
import TowerStackerExperience from "@/components/games/tower-stacker/TowerStackerExperience";
import { games } from "@/data/games";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Tower Stacker (타워 스태커)",
  url: `${BASE_URL}/games/tower-stacker`,
  description:
    "흔들리는 블록을 정확한 타이밍에 멈춰 하늘까지 쌓는 타이밍 집중력 게임. PERFECT 판정으로 블록 폭을 유지하는 것이 핵심. 다운로드 없이 브라우저에서 바로 무료 플레이.",
  genre: ["Arcade", "Puzzle"],
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
  isAccessibleForFree: true,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "PERFECT 판정이란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "직전 블록과 95% 이상 겹치도록 정확하게 쌓을 때 PERFECT 판정을 받습니다. PERFECT 시 블록 폭이 +5px 복원되어 작아진 블록을 다시 키울 수 있습니다. 오래 살아남으려면 PERFECT를 연속으로 내는 것이 필수입니다.",
      },
    },
    {
      "@type": "Question",
      name: "몇 층까지 쌓을 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "이론적으로는 무한하지만, 블록 폭이 2px 미만이 되면 게임오버입니다. PERFECT를 연속으로 내서 블록 폭을 유지하면 이론상 무한히 쌓을 수 있습니다. 50층 이상이면 상위권 실력자입니다.",
      },
    },
    {
      "@type": "Question",
      name: "블록 속도는 어떻게 변하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "층이 높아질수록 블록의 이동 속도가 점점 빨라집니다. 초반에는 여유 있는 속도이지만 20층을 넘어가면 눈에 띄게 빨라지고, 30층 이상에서는 반응 속도를 최대한 빠르게 유지해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "블록이 왜 점점 작아지나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "이전 블록과 정확히 겹치지 않으면 빗나간 부분이 잘려나가 블록이 작아집니다. 정확하게 쌓을수록 블록이 유지되고, PERFECT 판정 시에는 오히려 블록이 커집니다.",
      },
    },
    {
      "@type": "Question",
      name: "랭킹은 어떻게 올릴 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PERFECT 판정을 연속으로 내서 블록 폭을 최대한 유지하는 것이 핵심입니다. 블록이 커야 여유가 생기고, 여유가 있어야 높은 층수까지 올라갈 수 있습니다. 50층 이상이면 글로벌 TOP 10 경쟁권입니다.",
      },
    },
    {
      "@type": "Question",
      name: "이 게임은 무료인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "완전 무료이며 다운로드나 설치가 필요하지 않습니다. 브라우저에서 바로 플레이할 수 있고, 모바일에서도 탭으로 즐길 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "글로벌 랭킹은 언제 초기화되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "매주 월요일 자정에 자동으로 초기화됩니다. 주간 랭킹 방식이므로 매주 새롭게 TOP 10에 도전할 수 있습니다.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Games",
      item: `${BASE_URL}/games`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Tower Stacker (타워 스태커)",
      item: `${BASE_URL}/games/tower-stacker`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Tower Stacker — 블록 쌓기 타이밍 게임 무료 플레이 | Flash Games",
  description:
    "흔들리는 블록을 정확한 타이밍에 멈춰 하늘까지 쌓는 집중력 타이밍 게임. PERFECT 판정 시 블록 복원. 다운로드 없이 브라우저에서 바로 무료 플레이.",
  openGraph: {
    title: "Tower Stacker — 블록 쌓기 타이밍 게임",
    description:
      "흔들리는 블록을 정확한 타이밍에 멈춰 하늘까지 쌓는 집중력 타이밍 게임. 브라우저에서 바로 무료 플레이.",
    url: `${BASE_URL}/games/tower-stacker`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/games/tower-stacker`,
  },
};

const otherGames = games.filter((g) => g.slug !== "tower-stacker");

export default function TowerStackerPage() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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

        {/* HOW TO PLAY */}
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

        {/* 게임 소개 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            Tower Stacker는 좌우로 흔들리는 블록을 정확한 순간에 멈춰 하늘을 향해 쌓아올리는
            <strong className="text-violet-300"> 타이밍 집중력 게임</strong>입니다.
            단 하나의 버튼만 사용하지만, 점점 빨라지는 속도와 좁아지는 블록 때문에 단순하지만 절대 만만하지 않습니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            PERFECT 판정 시스템이 핵심입니다. 직전 블록과 95% 이상 겹치면 PERFECT 판정을 받아 블록 폭이
            +5px 복원됩니다. 반대로 조금씩 빗나갈 때마다 블록이 줄어들어 결국 2px 미만이 되면 게임오버입니다.
            PERFECT를 얼마나 연속으로 유지하느냐가 성적을 결정합니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            다운로드 없이 브라우저에서 무료로 즐길 수 있으며, SPACE 키 하나 또는 모바일 탭 한 번으로
            바로 플레이할 수 있습니다. 짧고 중독성 있어 쉬는 시간에 하기 좋은 미니게임입니다.
          </p>
        </section>

        {/* 고득점 전략 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 tracking-widest mb-4">
            ▸ PRO TIPS — 고득점 전략
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 list-decimal list-inside pl-1">
            <li>
              <span className="text-violet-300">PERFECT를 목표로 눌러라</span> — 그냥 맞추는 것과
              PERFECT를 노리는 것은 다르다. 블록이 중앙 위치를 지날 때를 기다려 눌러라.
              처음에는 실패하더라도 PERFECT 타이밍을 체감하는 것이 최우선이다.
            </li>
            <li>
              <span className="text-violet-300">블록의 속도가 아닌 패턴에 집중</span> — 블록은 항상
              같은 방향으로 왕복한다. 빠르다고 패닉하지 말고, 블록이 돌아오는 리듬을 머릿속으로
              카운트하며 타이밍을 잡아라.
            </li>
            <li>
              <span className="text-violet-300">초반 블록을 최대한 크게 유지</span> — 10층 이전에
              블록을 최대한 크게 유지하면 이후 여유가 생긴다. 초반에 PERFECT를 연속으로 내는 연습이
              장기 생존의 기반이 된다.
            </li>
            <li>
              <span className="text-violet-300">20층 이후 속도 변화를 예상</span> — 20층을 넘으면
              블록 속도가 눈에 띄게 빨라진다. 이 시점에 대비해 눈과 손 반응을 더 빠르게 준비해라.
            </li>
            <li>
              <span className="text-violet-300">한 쪽 방향을 기준으로 눌러라</span> — 블록이 왼쪽에서
              오른쪽으로 이동할 때만 누르거나, 항상 중앙을 통과할 때만 누르는 등 일관된 기준을 정해두면
              판단이 빨라진다.
            </li>
            <li>
              <span className="text-violet-300">눈을 깜빡이지 마라</span> — 농담처럼 들리지만 진짜다.
              고층에서는 블록 속도가 워낙 빠르기 때문에 눈을 깜빡이는 0.1초도 치명적일 수 있다.
            </li>
          </ol>
        </section>

        {/* 난이도 진행 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 tracking-widest mb-4">
            ▸ DIFFICULTY CURVE — 난이도 진행
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2">
            <li>
              <span className="text-violet-300">1~10층</span> — 느린 속도로 게임 감각을 익히기에 좋다.
              PERFECT 타이밍을 체감하고 연속 판정에 도전해보자.
            </li>
            <li>
              <span className="text-violet-300">10~20층</span> — 속도가 조금 빨라진다. 블록 폭이
              줄어들기 시작하는 구간으로, PERFECT 연속 유지가 중요해진다.
            </li>
            <li>
              <span className="text-rose-400">20~30층</span> — 속도가 눈에 띄게 빠르다.
              반응 속도를 최대로 끌어올려야 하며, 집중력을 1초도 잃으면 안 된다.
            </li>
            <li>
              <span className="text-rose-400">30층 이상</span> — 풀 스피드에 가까운 속도.
              블록 폭을 유지하지 못하면 급격히 게임오버가 된다. 30층 이상은 진짜 실력자 구간이다.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 tracking-widest mb-5">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg space-y-5">
            <div>
              <dt className="text-zinc-100 font-bold mb-1">PERFECT이 뭐예요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                직전 블록과 95% 이상 겹치도록 정확하게 쌓을 때 나오는 판정입니다.
                PERFECT 시 블록 폭이 +5px 복원됩니다. 게임을 오래 이어가려면 PERFECT를 자주 내는 게 핵심입니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">몇 층까지 쌓을 수 있어요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                블록 폭이 2px 미만이 되면 게임오버입니다. PERFECT를 연속으로 내서 블록 폭을 유지하면
                이론상 무한히 쌓을 수 있습니다. 50층 이상이면 실력자, 100층은 최상위권입니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">속도는 어떻게 바뀌나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                층이 높아질수록 블록의 이동 속도가 점진적으로 빨라집니다.
                20층 이후부터 눈에 띄게 빨라지며, 30층 이상에서는 최대 속도에 가까워집니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">블록이 왜 점점 작아지나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                직전 블록과 정확히 겹치지 않은 부분이 잘려나가 블록이 좁아집니다.
                PERFECT 판정을 받으면 블록 폭이 복원되므로, 정확한 타이밍에 누르는 연습이 중요합니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">랭킹은 어떻게 올려요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                PERFECT 연속으로 블록 폭을 최대한 유지하면서 높은 층수에 도달하는 것이 핵심입니다.
                50층 이상이면 TOP 10 경쟁권입니다. 랭킹은 매주 월요일에 초기화됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">모바일에서도 되나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                됩니다. 화면을 탭하면 블록이 멈추므로 모바일에서도 동일하게 즐길 수 있습니다.
                앱 설치 없이 모바일 브라우저에서 바로 플레이됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">무료인가요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                완전 무료입니다. 다운로드, 설치, 로그인 모두 필요 없습니다.
                브라우저에서 즉시 플레이할 수 있습니다.
              </dd>
            </div>
          </dl>
        </section>

        {/* 다른 게임 */}
        <section className="w-full max-w-[800px]">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-zinc-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherGames.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/games/${game.slug}`}
                  className={`block rounded-lg border-2 bg-zinc-900/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${game.accent}`}
                >
                  <div className="text-4xl mb-3" aria-hidden>{game.emoji}</div>
                  <h3 className="font-[family-name:var(--font-pixel)] text-xs mb-1 leading-relaxed">
                    {game.title}
                  </h3>
                  <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400 mb-2">
                    {game.titleKo}
                  </p>
                  <p className="text-sm text-zinc-500 mb-3">{game.description}</p>
                  <span className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest">
                    ▸ PLAY
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          하늘까지 쌓아라 — REACH FOR THE SKY
        </div>
        <SiteLegalFooter />
      </footer>
    </div>
  );
}
