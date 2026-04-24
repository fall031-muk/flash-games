import type { Metadata } from "next";
import Link from "next/link";
import PianoTilesExperience from "@/components/games/piano-tiles/PianoTilesExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Piano Tiles (피아노 타일)",
  url: `${BASE_URL}/games/piano-tiles`,
  description:
    "화면 상단에서 내려오는 검은 타일을 가장 아래쪽부터 순서대로 탭하는 리듬 타이밍 게임. 흰 공간 누르거나 타일 놓치면 즉시 게임오버. 다운로드 없이 브라우저에서 무료 플레이.",
  genre: ["Arcade", "Music"],
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
      name: "Piano Tiles",
      item: `${BASE_URL}/games/piano-tiles`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Piano Tiles는 어떻게 플레이하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "4개 세로 레인에 검은 타일들이 위에서 아래로 내려옵니다. 가장 아래에 있는 검은 타일을 탭하거나 해당 레인의 키보드 키(D/F/J/K)를 눌러 없애야 합니다. 타일이 화면 바닥에 닿거나 틀린 레인을 누르면 즉시 게임오버입니다.",
      },
    },
    {
      "@type": "Question",
      name: "키보드와 마우스/탭 중 어느 쪽이 유리한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "데스크톱에서는 D/F/J/K 키보드가 훨씬 정확하고 빠릅니다. 양손 집게손가락만 사용하면 충돌 없이 리듬감 있게 입력 가능. 모바일은 화면 탭으로, 양손 엄지를 번갈아 사용하면 최고 속도까지 따라잡을 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "속도는 어떻게 빨라지나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "성공한 탭마다 스크롤 속도가 조금씩 증가합니다. 시작 240 px/s부터 최대 820 px/s까지 가속. 100타일 정도 넘기면 화면 전환 속도가 뚜렷이 빨라지며 본격적인 반응속도 승부가 시작됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "왜 틀린 레인을 누르면 바로 게임오버인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Piano Tiles 장르의 핵심 룰입니다. 아래에서부터 순서대로 타일을 처리해야 하므로, 위쪽 타일을 먼저 누르거나 타일이 없는 레인을 누르면 실수로 취급합니다. 집중력과 정확도가 요구되는 이유입니다.",
      },
    },
    {
      "@type": "Question",
      name: "각 레인마다 다른 소리가 나는 이유는?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "4개 레인은 C 장조 펜타토닉 음정(C4, E4, G4, A4)으로 설정되어 있어 탭할 때마다 멜로디처럼 들립니다. 어떤 레인을 누르든 음악적으로 어울리도록 튜닝되어 있어요.",
      },
    },
    {
      "@type": "Question",
      name: "몇 타일이면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "50타일 이내는 입문, 100~200타일은 평균 실력자, 300타일 이상은 상위권, 500타일 넘기면 최상위권입니다. 단순 반응속도를 넘어선 지속 집중력이 관건.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서 인식 잘 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 레인 너비가 화면의 1/4로 넉넉해 탭 정확도가 높습니다. 양손 엄지로 교차 입력하면 키보드 사용자 못지않게 빠른 속도를 낼 수 있어요.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Piano Tiles — 피아노 타일 게임 무료 플레이 | Flash Games",
  description:
    "내려오는 검은 타일만 탭하는 리듬 타이밍 게임. 4개 레인 C장조 펜타토닉 사운드. 다운로드 없이 브라우저에서 바로 무료 플레이. 키보드 D/F/J/K 지원. 모바일 지원.",
  alternates: {
    canonical: `${BASE_URL}/games/piano-tiles`,
  },
};

export default function PianoTilesPage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-emerald-400 leading-relaxed drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              PIANO TILES
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              피아노 타일
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.07
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <PianoTilesExperience />

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-emerald-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-emerald-300">SPACE</span> / 클릭 / 탭으로 시작
            </li>
            <li>
              4개 세로 레인에 <span className="text-emerald-300">검은 타일</span>이 위에서 아래로 내려온다
            </li>
            <li>
              <span className="text-emerald-300">가장 아래</span> 타일을 탭하거나 해당 레인의 키보드(<span className="text-emerald-300">D F J K</span>) 누르기
            </li>
            <li>
              <span className="text-rose-400">타일이 바닥에 닿거나 빈 레인을 누르면</span> 즉시 GAME OVER
            </li>
            <li>
              맞출 때마다 <span className="text-emerald-300">점점 빨라진다</span> (240 → 820 px/s)
            </li>
            <li>
              4레인은 <span className="text-emerald-300">C장조 펜타토닉</span>으로 튜닝 — 탭하면 작은 멜로디 · <span className="text-emerald-300">200타일</span> 넘기면 실력자
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-emerald-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 leading-relaxed">
            <p>
              Piano Tiles는 모바일 게임계 대히트작의 룰을 레트로 네온 감성으로 재해석한 리듬 타이밍 게임.
              조작은 단 하나 — <strong className="text-emerald-300">검은 타일을 탭</strong>. 하지만 속도가
              점점 빨라지면서 단순함 속에 숨은 난이도가 드러난다.
            </p>
            <p>
              핵심은 <strong className="text-emerald-300">레인 순서 규칙</strong>. 4개 레인 중 가장 아래에
              있는 타일을 먼저 처리해야 하며, 위쪽 타일을 먼저 누르거나 빈 레인을 누르면 즉시 실패.
              한순간의 실수로 수백 타일 기록이 날아간다.
            </p>
            <p>
              각 레인은 C장조 펜타토닉으로 튜닝되어 탭하는 대로 <strong className="text-emerald-300">음악이 생성</strong>된다.
              점수가 올라갈수록 템포는 빨라지고 자신의 손놀림이 연주하는 멜로디가 가속화되는 쾌감.
              <strong className="text-emerald-300">다운로드 없이 브라우저에서 바로</strong> 피아노 리듬을 즐길 수 있다.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-emerald-400 tracking-widest mb-4">
            ▸ PRO TIPS
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-emerald-300">키보드 사용 강력 추천</strong> — D/F/J/K는 양손 집게손가락만으로
              커버 가능. 마우스는 순간 정확도는 있지만 연속 속도에서 밀린다
            </li>
            <li>
              <strong className="text-emerald-300">시선은 중간 줄에</strong> — 맨 아래 타일만 보면 다음 타일 위치를
              놓친다. 화면 중간을 보며 다음 2-3개 타일의 레인을 미리 파악
            </li>
            <li>
              <strong className="text-emerald-300">리듬감 유지</strong> — 타일 간격이 일정하므로 음악처럼 박자를
              타면 연타 실수가 준다. 손으로 박자 치듯 누르는 감각
            </li>
            <li>
              <strong className="text-emerald-300">빠른 구간 심호흡</strong> — 속도가 최고조로 가면 패닉이 온다.
              200타일 근처에서 한 번 호흡 정리하고 집중력 재부팅
            </li>
            <li>
              <strong className="text-emerald-300">레인 이동 연습</strong> — 같은 레인 연속은 쉽지만 좌우 교차가
              연타 어렵다. 시작 50타일 구간은 레인 전환 훈련 시간
            </li>
            <li>
              <strong className="text-emerald-300">오판 금지</strong> — 잠깐 "이거 저 레인인가?" 하는 순간 이미 늦음.
              첫 판단 그대로 가라. 자기 의심이 가장 큰 적
            </li>
          </ol>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-emerald-400 tracking-widest mb-4">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-4 leading-relaxed">
            {faqJsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <dt className="text-emerald-300 mb-1">
                  <span className="text-emerald-500 mr-2">Q.</span>
                  {q.name}
                </dt>
                <dd className="text-zinc-400 pl-6">
                  <span className="text-emerald-500/60 mr-2">A.</span>
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-emerald-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <Link
              href="/games/bullet-dodge"
              className="block rounded-lg border-2 border-rose-400/30 bg-zinc-900/60 p-2 hover:border-rose-400/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>💥</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-rose-400">Bullet Dodge</h3>
            </Link>
            <Link
              href="/games/wolf-runner"
              className="block rounded-lg border-2 border-amber-300/30 bg-zinc-900/60 p-2 hover:border-amber-300/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>🐺</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-amber-300">Wolf Runner</h3>
            </Link>
            <Link
              href="/games/tower-stacker"
              className="block rounded-lg border-2 border-violet-300/30 bg-zinc-900/60 p-2 hover:border-violet-300/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>🧱</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-violet-300">Tower Stacker</h3>
            </Link>
            <Link
              href="/games/neon-snake"
              className="block rounded-lg border-2 border-lime-400/30 bg-zinc-900/60 p-2 hover:border-lime-400/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>🐍</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-lime-400">Neon Snake</h3>
            </Link>
            <Link
              href="/games/reflex-target"
              className="block rounded-lg border-2 border-cyan-400/30 bg-zinc-900/60 p-2 hover:border-cyan-400/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>🎯</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-cyan-400">Reflex Target</h3>
            </Link>
            <Link
              href="/games/memory-sequence"
              className="block rounded-lg border-2 border-fuchsia-400/30 bg-zinc-900/60 p-2 hover:border-fuchsia-400/60 transition-colors text-center"
            >
              <div className="text-2xl mb-1" aria-hidden>🧠</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-fuchsia-400">Memory</h3>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          탭하고 듣고 달려라 — TAP THE RHYTHM
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
