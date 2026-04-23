import type { Metadata } from "next";
import Link from "next/link";
import NeonSnakeExperience from "@/components/games/neon-snake/NeonSnakeExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Neon Snake (네온 스네이크)",
  url: `${BASE_URL}/games/neon-snake`,
  description:
    "레트로 네온 감성으로 재해석한 고전 스네이크 게임. 방향키·스와이프로 뱀을 조종하며 먹이를 먹고 길어진다. 벽이나 자기 몸에 닿으면 GAME OVER. 글로벌 주간/월간 랭킹으로 가장 긴 뱀을 겨뤄라.",
  genre: "Arcade",
  playMode: "SinglePlayer",
  applicationCategory: "Game",
  inLanguage: "ko",
  operatingSystem: "Web Browser",
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
      name: "Neon Snake",
      item: `${BASE_URL}/games/neon-snake`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "어떻게 플레이하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "방향키(← ↑ → ↓) 또는 WASD로 뱀을 조종하세요. 모바일에서는 화면 위에서 방향을 스와이프하면 됩니다. 먹이(노란 점)를 먹으면 길이가 +1 늘어나고 점수가 올라갑니다.",
      },
    },
    {
      "@type": "Question",
      name: "반대 방향으로 바로 돌릴 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "불가능합니다. 오른쪽으로 이동 중 왼쪽 키는 무시됩니다. 즉시 반대 방향 전환은 자기 몸에 박는 자살이 되기 때문에 의도적으로 막혀 있어요.",
      },
    },
    {
      "@type": "Question",
      name: "속도는 어떻게 빨라지나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "길이가 5 늘어날 때마다 이동 주기가 10ms씩 빨라집니다. 시작 150ms에서 최종 70ms까지 가속. 길이 40 이상이면 반응속도가 필수입니다.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서도 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 화면 위에서 원하는 방향으로 스와이프하면 뱀이 회전합니다. 20px 이상 드래그하면 해당 방향으로 전환됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "기록은 어떻게 저장되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "브라우저에 최고 기록이 자동 저장됩니다. Top 10에 들면 글로벌 랭킹(주간/월간)에 이름을 제출할 수 있습니다. 주간 랭킹은 매주 월요일 0시에 초기화됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "몇 개 먹으면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "처음엔 10개도 어렵습니다. 20개 넘기면 중수, 30개 넘기면 고수, 50개 이상은 거의 이론적 한계에 도전하는 실력입니다.",
      },
    },
    {
      "@type": "Question",
      name: "무료인가요? 다운로드 필요한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "완전 무료입니다. 브라우저에서 바로 플레이 가능하며 다운로드나 설치가 필요 없습니다. 크롬, 사파리, 파이어폭스 모두 지원합니다.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Neon Snake (네온 스네이크) — Flash Games",
  description:
    "레트로 네온 감성의 고전 스네이크 게임. 방향키와 스와이프로 뱀을 조종해 먹이를 먹고 길어진다. 다운로드 없이 브라우저에서 무료 플레이. 글로벌 랭킹 도전. 모바일 지원.",
  alternates: {
    canonical: `${BASE_URL}/games/neon-snake`,
  },
};

export default function NeonSnakePage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-lime-400 text-glow-lime leading-relaxed">
              NEON SNAKE
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              네온 스네이크
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.04
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <NeonSnakeExperience />

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-lime-400">← ↑ → ↓</span> 또는{" "}
              <span className="text-lime-400">WASD</span>로 뱀 조종
            </li>
            <li>
              모바일: 화면 위에서 <span className="text-lime-400">스와이프</span>하면 그 방향으로 회전
            </li>
            <li>
              <span className="text-amber-300">노란 먹이</span>를 먹으면 길이 +1, 점수 +1
            </li>
            <li>
              <span className="text-rose-400">반대 방향 즉시 전환 불가</span> — 자살 방지를 위해 의도적으로 막힘
            </li>
            <li>
              벽이나 자기 몸에 부딪히면 즉시 GAME OVER — 먹은 먹이 개수가 점수
            </li>
            <li>
              길이가 5 늘어날 때마다 가속 (150ms → 70ms) · <span className="text-lime-400">30개</span> 넘기면 진짜 고수
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 leading-relaxed">
            <p>
              노키아 휴대폰 시절부터 전해 내려온 <strong className="text-lime-400">고전 중의 고전</strong>을
              레트로 네온 감성으로 재해석한 버전. 뱀이 먹이를 먹을수록 길이가 늘어나고,
              길이가 길어질수록 움직이는 속도도 빨라진다. 결국 최대 적수는 본인 꼬리.
            </p>
            <p>
              조작은 극단적으로 단순하지만, 장기 플레이에서 요구되는 건
              <strong className="text-lime-300"> 공간 판단력</strong>과{" "}
              <strong className="text-lime-300">경로 계획력</strong>.
              길이 30을 넘어서면 "지금 가면 막히는 경로"가 보이기 시작하고,
              그때부터가 진짜 게임이다.
            </p>
            <p>
              단순해서 누구나 즉시 이해하지만, 깊이 들어가면 한없이 어려운 고전의 정석.
              브라우저만 열면 바로 할 수 있는 <strong className="text-lime-400">쉬는 시간용 미니게임</strong>으로 최적.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ PRO TIPS
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-lime-300">벽을 따라 달려라</strong> — 초반에는 중앙을 피하고
              벽 가장자리를 따라 U자로 돌면서 먹이를 쓸어담는 게 안전하다
            </li>
            <li>
              <strong className="text-lime-300">지그재그 패턴</strong> — 중앙에 먹이가 뜨면
              직선으로 가기보단 지그재그로 가서 회전 여유를 남겨라
            </li>
            <li>
              <strong className="text-lime-300">꼬리 쪽은 한 칸 비워진다</strong> — 이번 tick에서 꼬리가 지나간 자리는
              안전하다. 길이가 길어져도 꼬리를 따라가면 영원히 살 수 있다 (단, 먹이 못 먹음)
            </li>
            <li>
              <strong className="text-lime-300">길이 30+부터는 미리 2수 앞</strong> — 지금 가는 곳이 아니라
              그 다음에 어디로 갈 수 있는지 생각하면서 움직여라
            </li>
            <li>
              <strong className="text-lime-300">반대 방향 입력 주의</strong> — 빠른 속도에서 실수로 반대 키 누르면
              무시되니, 방향 전환은 90도 단위로 단계적으로
            </li>
            <li>
              <strong className="text-lime-300">먹이 위치 예측</strong> — 먹이는 뱀 몸이 없는 빈 셀에 랜덤 등장.
              길이가 길어지면 먹이가 나타날 수 있는 빈 공간이 줄어들기 때문에 먹이 위치를 미리 예측할 수 있다
            </li>
          </ol>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-4 leading-relaxed">
            {faqJsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <dt className="text-lime-300 mb-1">
                  <span className="text-lime-500 mr-2">Q.</span>
                  {q.name}
                </dt>
                <dd className="text-zinc-400 pl-6">
                  <span className="text-lime-500/60 mr-2">A.</span>
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/games/bullet-dodge"
              className="block rounded-lg border-2 border-rose-400/30 bg-zinc-900/60 p-4 hover:border-rose-400/60 transition-colors"
            >
              <div className="text-3xl mb-2" aria-hidden>💥</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 mb-1">
                Bullet Dodge
              </h3>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">
                총알을 피해 최대한 오래 버티기
              </p>
            </Link>
            <Link
              href="/games/wolf-runner"
              className="block rounded-lg border-2 border-amber-300/30 bg-zinc-900/60 p-4 hover:border-amber-300/60 transition-colors"
            >
              <div className="text-3xl mb-2" aria-hidden>🐺</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-xs text-amber-300 mb-1">
                Wolf Runner
              </h3>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">
                3단 점프로 장애물 피하기
              </p>
            </Link>
            <Link
              href="/games/tower-stacker"
              className="block rounded-lg border-2 border-violet-300/30 bg-zinc-900/60 p-4 hover:border-violet-300/60 transition-colors"
            >
              <div className="text-3xl mb-2" aria-hidden>🧱</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-xs text-violet-300 mb-1">
                Tower Stacker
              </h3>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">
                블록 쌓아 하늘까지 닿기
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          물고, 자라고, 살아남아라 — EAT AND GROW
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
