import type { Metadata } from "next";
import Link from "next/link";
import ReflexTargetExperience from "@/components/games/reflex-target/ReflexTargetExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Reflex Target (반응속도 타겟)",
  url: `${BASE_URL}/games/reflex-target`,
  description:
    "30초 안에 화면에 팝업되는 타겟을 최대한 많이 맞히는 에임·반응속도 게임. 폭탄은 누르지 말고 피해야 한다. 콤보 배율로 고득점 가능. 다운로드 없이 브라우저에서 무료 플레이.",
  genre: ["Arcade", "Action"],
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
      name: "Reflex Target",
      item: `${BASE_URL}/games/reflex-target`,
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
        text: "화면에 30초간 타겟이 랜덤 위치에 팝업됩니다. 타겟을 클릭 또는 탭하면 점수를 얻고, 놓치거나 폭탄을 누르면 콤보가 리셋됩니다. 가능한 많이 맞혀 최대 점수에 도전하세요.",
      },
    },
    {
      "@type": "Question",
      name: "타겟 종류가 다른가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "4종입니다. 일반(cyan, +10점, 1.5초), 금색(amber, +50점, 작고 짧음), 빨강(rose, +100점, 극희귀·찰나), 폭탄(검정, -100점, 피해야 함). 폭탄을 실수로 누르면 점수 차감 + 콤보 리셋입니다.",
      },
    },
    {
      "@type": "Question",
      name: "콤보 배율은 어떻게 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "5콤보마다 배율이 0.5씩 증가합니다. 0~4콤보 ×1.0, 5~9콤보 ×1.5, 10~14콤보 ×2.0, 15콤보 이상 ×2.5(상한). 놓치거나 폭탄 누르면 콤보 0 리셋.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서도 잘 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 탭 하나로 플레이 가능. 다만 작은 화면에서는 빨강 타겟(15px) 맞히기가 극도로 어려우니 태블릿이나 큰 폰 추천.",
      },
    },
    {
      "@type": "Question",
      name: "몇 점이면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "500점 이내는 입문, 1,000~2,000점 실력자, 3,000점 이상은 최상위권입니다. 금색·빨강을 연속으로 잡으며 콤보 배율을 유지하는 게 핵심.",
      },
    },
    {
      "@type": "Question",
      name: "폭탄을 피하는 팁이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "폭탄은 다른 타겟보다 크고(35px) 검정색 + X 표시라 색으로 구분이 가능합니다. 그래도 황급히 누르다 실수할 수 있으니, 색을 한 번 확인하는 '반 박자 늦추는 습관'이 중요합니다.",
      },
    },
    {
      "@type": "Question",
      name: "기록은 어떻게 저장되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "브라우저 로컬에 최고 점수가 자동 저장됩니다. Top 10에 들면 글로벌 랭킹(주간/월간)에 이름을 제출할 수 있어요. 주간 랭킹은 매주 월요일 0시에 초기화됩니다.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Reflex Target — 반응속도 타겟 게임 무료 플레이 | Flash Games",
  description:
    "30초 안에 팝업 타겟을 최대한 많이 맞히는 에임·반응속도 게임. 콤보 배율과 4종 타겟, 폭탄 회피. 다운로드 없이 브라우저에서 바로 무료 플레이. 모바일 지원.",
  alternates: {
    canonical: `${BASE_URL}/games/reflex-target`,
  },
};

export default function ReflexTargetPage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-cyan-400 text-glow-cyan leading-relaxed">
              REFLEX TARGET
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              반응속도 타겟
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.05
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <ReflexTargetExperience />

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-cyan-300">SPACE</span> / 클릭 / 탭으로 시작
            </li>
            <li>
              30초 안에 화면에 팝업되는 <span className="text-cyan-300">타겟</span>을 최대한 많이 맞혀라
            </li>
            <li>
              <span className="text-[#22d3ee] font-bold">○</span> 일반 +10점 ·{" "}
              <span className="text-[#fbbf24] font-bold">○</span> 금색 +50점 ·{" "}
              <span className="text-[#fb7185] font-bold">○</span> 빨강 +100점
            </li>
            <li>
              <span className="text-rose-400">폭탄(검은 X)</span>은 누르면 −100점 + 콤보 리셋 — 피해라
            </li>
            <li>
              <span className="text-amber-300">5콤보마다 ×0.5 배율</span> 증가 (최대 ×2.5). 놓치면 콤보 0
            </li>
            <li>
              30초가 끝나면 점수 집계 — <span className="text-cyan-300">1,000점</span> 넘기면 실력자, <span className="text-cyan-300">3,000점</span> 이상 최상위권
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 leading-relaxed">
            <p>
              Reflex Target은 순수 <strong className="text-cyan-300">에임(조준) + 반응속도</strong>만으로 승부하는
              30초 타임어택 게임. 복잡한 조작도, 장황한 룰도 없다. 보이면 누르고, 폭탄이면 참는다. 그게 전부.
            </p>
            <p>
              하지만 30초는 생각보다 길다. <strong className="text-cyan-300">콤보 배율</strong>을 유지하려면
              놓치지 말아야 하고, <strong className="text-rose-400">빨강 타겟(0.7초)</strong>은 뜨자마자 사라진다.
              욕심내다 폭탄을 누르면 그동안 쌓은 콤보가 날아간다. 결국 속도와 인내의 줄타기.
            </p>
            <p>
              가장 짧은 세션, 가장 직관적인 조작. <strong className="text-cyan-300">쉬는 시간 30초</strong>만 있으면
              한 판 돌릴 수 있다. 고득점은 순전히 본인 반응속도와 침착함에 달려있다.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ PRO TIPS
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-cyan-300">색부터 확인</strong> — 튀어나오자마자 누르지 말고, 한 박자 늦춰서
              색을 확인하고 누르는 습관이 폭탄 오인 클릭을 막는다
            </li>
            <li>
              <strong className="text-cyan-300">빨강 우선</strong> — 빨강 타겟은 0.7초 안에 사라지고 +100점. 보이면
              무조건 먼저 맞춰라. 놓치면 평균 10개 놓친 것과 같음
            </li>
            <li>
              <strong className="text-cyan-300">콤보 유지가 핵심</strong> — 15콤보부터 ×2.5 배율. 놓침 1번이 점수
              2배 손해. 작은 타겟이라도 차라리 천천히 정확히
            </li>
            <li>
              <strong className="text-cyan-300">금색은 겉보기보다 중요</strong> — 일반 타겟 5개 맞힐 시간에 금색 하나가
              같은 점수. 등장 빈도 낮지만 콤보 유지 겸 절대 놓치지 마라
            </li>
            <li>
              <strong className="text-cyan-300">폭탄 무시 연습</strong> — 폭탄이 눈에 들어와도 "누르지 않기"가
              오히려 의식적인 노력이 필요하다. 폭탄이 보이면 손을 살짝 떼는 습관 들이기
            </li>
            <li>
              <strong className="text-cyan-300">마지막 10초 러시</strong> — 30초 후반 스폰 간격이 짧아진다.
              남은 시간 보면서 안전한 타겟만 잡을지, 빨강 노릴지 순간 판단
            </li>
          </ol>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-4 leading-relaxed">
            {faqJsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <dt className="text-cyan-300 mb-1">
                  <span className="text-cyan-500 mr-2">Q.</span>
                  {q.name}
                </dt>
                <dd className="text-zinc-400 pl-6">
                  <span className="text-cyan-500/60 mr-2">A.</span>
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-cyan-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/games/bullet-dodge"
              className="block rounded-lg border-2 border-rose-400/30 bg-zinc-900/60 p-4 hover:border-rose-400/60 transition-colors"
            >
              <div className="text-3xl mb-2" aria-hidden>💥</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 mb-1">
                Bullet Dodge
              </h3>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">
                총알 피하기
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
                3단 점프 러너
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
                블록 쌓기
              </p>
            </Link>
            <Link
              href="/games/neon-snake"
              className="block rounded-lg border-2 border-lime-400/30 bg-zinc-900/60 p-4 hover:border-lime-400/60 transition-colors"
            >
              <div className="text-3xl mb-2" aria-hidden>🐍</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 mb-1">
                Neon Snake
              </h3>
              <p className="font-[family-name:var(--font-retro)] text-base text-zinc-400">
                고전 스네이크
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          조준하고, 쏴라 — AIM AND CLICK
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
