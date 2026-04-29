import type { Metadata } from "next";
import Link from "next/link";
import SiteLegalFooter from "@/components/common/SiteLegalFooter";
import WolfRunnerExperience from "@/components/games/wolf-runner/WolfRunnerExperience";
import { games } from "@/data/games";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Wolf Runner (늑대 러너)",
  url: `${BASE_URL}/games/wolf-runner`,
  description:
    "3단 점프로 장애물을 피하며 얼마나 멀리 달릴 수 있나. 7종 장애물과 4종 아이템, 1000m 돌파 시 익스트림 모드. 다운로드 없이 브라우저에서 바로 무료 플레이.",
  genre: ["Arcade", "Runner"],
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
      name: "Wolf Runner의 3단 점프란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "지면에서 점프한 후 공중에서 추가로 2번 더 점프할 수 있는 시스템입니다. 총 3번 점프가 가능하지만, 2단·3단으로 갈수록 점프력이 약해집니다. 지면에 닿으면 점프 횟수가 즉시 초기화됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "장애물은 몇 종류인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "총 7종입니다: 돌, 기둥, 까마귀, 구덩이, 불기둥(주기적 타이밍), 유성(섀도우 예고 후 낙하), 굴러오는 바위. 장애물에 하나라도 부딪히면 즉시 게임오버입니다.",
      },
    },
    {
      "@type": "Question",
      name: "익스트림 모드는 언제 시작되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1000m를 돌파하면 익스트림 모드가 시작됩니다. 장애물 사이 간격이 좁아지고 유성, 불기둥 등 위험 장애물의 비중이 크게 높아집니다.",
      },
    },
    {
      "@type": "Question",
      name: "아이템은 언제, 어떻게 등장하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "매 250m마다 아이템이 자동으로 발동됩니다. S(방어막 1회 무시), L(슬로우 4초), ×2(점수 2배 5초), ↑(초점프 1회) 4종 중 하나가 랜덤으로 적용됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "방어막(S 아이템)은 몇 초 지속되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "방어막은 시간 기반이 아닌 횟수 기반입니다. 장애물 1회 충돌을 무시한 후 사라집니다. 방어막이 있을 때 충돌이 발생하면 피해 없이 통과됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "구덩이는 어떻게 넘나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "구덩이 직전에 점프하거나, 3단 점프를 활용해 공중에서 구덩이를 가로질러 건너편에 착지합니다. 구덩이의 너비는 다양하므로 점프 타이밍을 잘 조절해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "이 게임은 무료인가요? 다운로드가 필요한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "완전 무료이며, 다운로드나 설치 없이 브라우저에서 바로 플레이할 수 있습니다. 모바일 브라우저에서도 클릭/탭으로 즐길 수 있습니다.",
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
      name: "Wolf Runner (늑대 러너)",
      item: `${BASE_URL}/games/wolf-runner`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Wolf Runner — 늑대 러너 게임 무료 플레이 | Flash Games",
  description:
    "3단 점프로 장애물을 피하며 끝없이 달리는 러너 게임. 7종 장애물, 4종 아이템, 1000m 익스트림 모드. 다운로드 없이 브라우저에서 바로 무료 플레이.",
  openGraph: {
    title: "Wolf Runner — 늑대 러너 게임",
    description:
      "3단 점프로 장애물을 피하며 끝없이 달리는 러너 게임. 브라우저에서 바로 무료 플레이.",
    url: `${BASE_URL}/games/wolf-runner`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/games/wolf-runner`,
  },
};

const otherGames = games.filter((g) => g.slug !== "wolf-runner");

export default function WolfRunnerPage() {
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

        {/* HOW TO PLAY */}
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

        {/* 게임 소개 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            Wolf Runner는 끝없는 횡스크롤 필드를 달리는 늑대를 조종해 장애물을 피하고 최대한 멀리 달리는
            <strong className="text-amber-300"> 러너 점프 게임</strong>입니다.
            공중에서 3번까지 점프할 수 있는 독특한 3단 점프 시스템이 핵심이며,
            점프 타이밍과 높이 조절이 생존을 결정합니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            7종의 다양한 장애물이 등장해 지루할 틈이 없으며, 매 250m마다 자동 발동되는 아이템 시스템이
            게임에 전략적 재미를 더합니다. 1000m 돌파 시 장애물 간격이 좁아지는 익스트림 모드로 전환되어
            실력자들을 위한 진짜 도전이 시작됩니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            다운로드 없이 브라우저에서 바로 무료로 즐길 수 있으며, 글로벌 랭킹으로 전 세계 플레이어와
            달리기 거리를 겨룰 수 있습니다. 짧은 한 판으로도 충분히 재미있어 쉬는 시간에 딱 맞는 게임입니다.
          </p>
        </section>

        {/* 고득점 전략 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mb-4">
            ▸ PRO TIPS — 고득점 전략
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 list-decimal list-inside pl-1">
            <li>
              <span className="text-amber-300">3단 점프는 아껴라</span> — 1단 점프만으로 넘을 수 있는
              장애물에 2·3단을 낭비하면 구덩이나 연속 장애물에서 대응이 불가능해진다.
              3단은 진짜 필요한 상황을 위해 남겨두자.
            </li>
            <li>
              <span className="text-amber-300">유성 섀도우를 반드시 확인</span> — 유성이 떨어지기 전
              바닥에 그림자(섀도우)가 생긴다. 그림자를 보자마자 이동 방향을 바꿔라.
              그림자 없이 반응하면 이미 늦다.
            </li>
            <li>
              <span className="text-amber-300">불기둥 리듬을 외워라</span> — 불기둥은 주기적으로
              뿜어져 나온다. 처음에는 낯설지만 2~3번 보면 패턴이 보인다.
              불기둥 직후에 타이밍에 맞춰 통과하면 안전하다.
            </li>
            <li>
              <span className="text-amber-300">×2 아이템 구간을 전략적으로 활용</span> — 점수 2배가
              발동된 5초 동안 최대한 빠르게 달릴 수 있다면 랭킹에 큰 도움이 된다.
              이 구간에서는 리스크를 감수하고 최대 속도로 달려라.
            </li>
            <li>
              <span className="text-amber-300">30초 이후 속도 변화에 대비</span> — 30초가 지나면
              스크롤 속도가 빨라지기 시작한다. 이 시점에 집중력을 높이고
              점프 타이밍을 더 빠르게 잡는 습관을 들여라.
            </li>
            <li>
              <span className="text-amber-300">구덩이 너비를 파악하고 점프 타이밍 조절</span> — 구덩이
              너비가 다양하므로 좁은 구덩이는 1단 점프로, 넓은 구덩이는 빠른 타이밍에 점프해야 한다.
              늦게 점프하면 구덩이 중간에서 추락한다.
            </li>
          </ol>
        </section>

        {/* 난이도 진행 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mb-4">
            ▸ DIFFICULTY CURVE — 난이도 진행
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2">
            <li>
              <span className="text-amber-300">0~250m</span> — 기본 장애물만 등장. 속도가 느려
              패턴 파악과 3단 점프 연습에 집중하기 좋다.
            </li>
            <li>
              <span className="text-amber-300">250~500m</span> — 첫 아이템 발동 구간.
              스크롤 속도가 조금씩 빨라지고 유성, 불기둥이 처음 등장한다.
            </li>
            <li>
              <span className="text-rose-400">500~1000m</span> — 본격적인 위기 구간.
              90초 이상 진행 시 풀 스피드에 도달하며 모든 장애물이 등장한다.
              연속 장애물 조합이 나타나기 시작한다.
            </li>
            <li>
              <span className="text-rose-400">1000m 이후 (익스트림 모드)</span> — 장애물 간격이
              극도로 좁아지며 위험 장애물 비중이 급증한다. 1000m를 돌파하면 진짜 고수다.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-amber-400 tracking-widest mb-5">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg space-y-5">
            <div>
              <dt className="text-zinc-100 font-bold mb-1">3단 점프란?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                지면에서 1번, 공중에서 2번 더, 총 3번 점프할 수 있는 시스템입니다.
                2단·3단은 1단보다 높이가 낮아지므로 조합해서 사용해야 합니다. 지면에 닿으면 즉시 초기화됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">장애물 몇 종인가요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                총 7종입니다. 돌, 기둥, 까마귀, 구덩이 4가지 기본 장애물에 더해
                불기둥(타이밍형), 유성(섀도우 예고), 굴러오는 바위가 추가됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">익스트림 모드는 언제 시작?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                1000m를 돌파하면 익스트림 모드가 시작됩니다. 장애물 간격이 좁아지고
                불기둥, 유성, 굴러오는 바위 같은 위험 장애물의 빈도가 크게 높아집니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">아이템 등장 주기?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                매 250m마다 아이템이 자동으로 발동됩니다. 4종 중 하나가 랜덤으로 선택되며,
                별도로 아이템을 획득할 필요 없이 자동 적용됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">방어막은 몇 초 지속?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                방어막은 시간이 아닌 횟수 기반입니다. 장애물 1회 충돌을 무시하면 사라집니다.
                방어막 상태에서 충돌하면 피해 없이 통과합니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">구덩이는 어떻게 넘어요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                구덩이 직전에 점프해 건너편에 착지합니다. 구덩이가 넓으면 빠른 타이밍에 점프해야 하고,
                3단 점프로 체공 시간을 늘리는 것도 방법입니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">무료인가요? 설치가 필요한가요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                완전 무료이며 설치가 필요하지 않습니다. 브라우저에서 바로 플레이할 수 있고,
                모바일에서도 클릭/탭으로 동일하게 즐길 수 있습니다.
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
          달려라, 멀리 — RUN WILD
        </div>
        <SiteLegalFooter />
      </footer>
    </div>
  );
}
