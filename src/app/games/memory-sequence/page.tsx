import type { Metadata } from "next";
import Link from "next/link";
import MemorySequenceExperience from "@/components/games/memory-sequence/MemorySequenceExperience";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Memory Sequence (기억력 시퀀스)",
  url: `${BASE_URL}/games/memory-sequence`,
  description:
    "4색 버튼의 점멸 순서를 외워 그대로 따라 누르는 고전 사이먼 세이즈 스타일 기억력 게임. 라운드마다 시퀀스가 1씩 길어진다. 다운로드 없이 브라우저에서 무료 플레이.",
  genre: ["Puzzle", "Casual"],
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
      name: "Memory Sequence",
      item: `${BASE_URL}/games/memory-sequence`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "이 게임은 어떻게 플레이하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "4색 버튼이 일정 순서로 점멸합니다. 점멸이 끝나면 'YOUR TURN'이 뜨고, 본 순서대로 버튼을 누릅니다. 맞으면 시퀀스가 1개 더 길어져 다음 라운드로 진행하고, 한 번이라도 틀리면 게임이 끝납니다.",
      },
    },
    {
      "@type": "Question",
      name: "사이먼 세이즈와 같은 게임인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네, 1978년 출시된 클래식 전자 장난감 Simon과 동일한 룰입니다. 다만 본 게임은 브라우저에서 무료로 플레이 가능하며, 라운드가 높아질수록 점멸 속도가 빨라지고 주간/월간 글로벌 랭킹 시스템이 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "버튼마다 소리가 다르게 나나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 4개 버튼은 각각 다른 음정(C4, E4, G4, B4)으로 설정되어 있습니다. 시각만이 아닌 청각 기억도 활용할 수 있어 숙련되면 소리만으로도 순서를 외울 수 있게 됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "속도는 어떻게 변하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1~9라운드는 500ms 점멸 + 200ms 간격(여유), 10~19라운드는 400ms + 150ms(빨라짐), 20라운드 이상은 300ms + 100ms(꽤 빠름)로 가속됩니다. 후반으로 갈수록 반응 속도도 함께 요구됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "몇 라운드까지 가면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "10라운드 이내는 입문, 15~20라운드는 평균 실력자, 25라운드 이상은 최상위권입니다. 30라운드 넘기는 건 극소수. 단순 기억력뿐 아니라 집중력과 침착함이 모두 필요합니다.",
      },
    },
    {
      "@type": "Question",
      name: "기억 팁이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "여러 방법이 있습니다. 1) 청크: 3-4개씩 묶어서 외우기, 2) 리듬화: 음정으로 멜로디처럼 외우기, 3) 시각화: 색 대신 위치(좌상/우상/좌하/우하)로 외우기. 사람마다 효과가 다르니 본인에게 맞는 방법을 찾으세요.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. 탭만으로 플레이 가능합니다. 4개 큰 버튼이라 작은 화면에서도 불편 없이 누를 수 있습니다.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Memory Sequence — 기억력 시퀀스 게임 무료 플레이 | Flash Games",
  description:
    "4색 버튼의 점멸 순서를 외워 따라 누르는 고전 사이먼 세이즈 스타일 기억력 게임. 라운드마다 1개씩 길어지는 시퀀스. 다운로드 없이 브라우저에서 바로 무료 플레이. 모바일 지원.",
  alternates: {
    canonical: `${BASE_URL}/games/memory-sequence`,
  },
};

export default function MemorySequencePage() {
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
            <h1 className="font-[family-name:var(--font-pixel)] text-sm sm:text-lg text-fuchsia-400 leading-relaxed drop-shadow-[0_0_8px_rgba(232,121,249,0.45)]">
              MEMORY SEQUENCE
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              기억력 시퀀스
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family-name:var(--font-pixel)] text-[10px] sm:text-xs text-zinc-700 tracking-widest"
          >
            LV.06
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <MemorySequenceExperience />

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-fuchsia-400 tracking-widest mb-4">
            ▸ HOW TO PLAY
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-1.5">
            <li>
              <span className="text-fuchsia-300">SPACE</span> / 클릭 / 탭으로 시작
            </li>
            <li>
              화면의 4색 버튼이 <span className="text-fuchsia-300">일정 순서로 점멸</span>한다 (WATCH 상태)
            </li>
            <li>
              점멸이 끝나고 <span className="text-fuchsia-300">YOUR TURN</span>이 뜨면 본 순서대로 버튼 누르기
            </li>
            <li>
              맞추면 다음 라운드 — 시퀀스가 <span className="text-fuchsia-300">1개씩 길어진다</span>
            </li>
            <li>
              한 번이라도 틀리면 즉시 GAME OVER — 성공한 라운드 수가 점수
            </li>
            <li>
              10/20라운드부터 <span className="text-rose-400">점멸 속도가 빨라지니</span> 집중! <span className="text-fuchsia-300">20라운드</span> 넘기면 고수
            </li>
          </ul>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-fuchsia-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 leading-relaxed">
            <p>
              1978년 출시된 전자 장난감 <strong className="text-fuchsia-300">Simon</strong>의 룰을 레트로 네온 감성으로
              재해석한 <strong className="text-fuchsia-300">기억력 시퀀스 게임</strong>. 4색 버튼이 보여주는
              순서를 그대로 따라 누르면 된다. 단순하지만 라운드가 쌓일수록 시퀀스가 길어져 뇌가 부담을 느낀다.
            </p>
            <p>
              기억력 + 집중력이 전부. 각 버튼은 <strong className="text-fuchsia-300">고유 음정</strong>을 내서
              시각만 아니라 청각으로도 외울 수 있다. 숙련자는 멜로디처럼 소리로 순서를 기억한다.
            </p>
            <p>
              짧은 세션에 뇌를 말끔하게 쓰고 싶을 때 딱. <strong className="text-fuchsia-300">다운로드 없이</strong>
              브라우저에서 즉시 플레이. 버튼 탭만으로 조작 완결이라 모바일에서도 같은 난이도.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-fuchsia-400 tracking-widest mb-4">
            ▸ PRO TIPS
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-fuchsia-300">청크(묶어 외우기)</strong> — 3~4개씩 그룹으로 묶어 외우면
              7개 시퀀스가 "2개 그룹"으로 단순해진다
            </li>
            <li>
              <strong className="text-fuchsia-300">음정 활용</strong> — 각 버튼은 C/E/G/B 음정. 음악적으로 외우면
              10라운드 이상 가기 쉽다 (노래처럼 부르기)
            </li>
            <li>
              <strong className="text-fuchsia-300">위치 코드화</strong> — 색 대신 좌상/우상/좌하/우하 번호로
              외우면 색맹이거나 순간 판단이 어려울 때 유리
            </li>
            <li>
              <strong className="text-fuchsia-300">리듬감 유지</strong> — WATCH 중 일정 리듬으로 고개나 손가락을
              따라 움직이면 몸의 기억이 시각 기억을 보완한다
            </li>
            <li>
              <strong className="text-fuchsia-300">후반은 침착하게</strong> — 20라운드+에서 점멸 속도는 빨라져도
              YOUR TURN은 시간 무제한. 빠르게 누르려 하지 말고 한 박자 쉬어가며 정확히
            </li>
            <li>
              <strong className="text-fuchsia-300">틀린 기억 무시</strong> — 중간에 "앗 이거 아닌 것 같은데"하면
              이미 끝. 자신을 의심하지 말고 처음 떠오른 순서대로 눌러라
            </li>
          </ol>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-fuchsia-400 tracking-widest mb-4">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-4 leading-relaxed">
            {faqJsonLd.mainEntity.map((q) => (
              <div key={q.name}>
                <dt className="text-fuchsia-300 mb-1">
                  <span className="text-fuchsia-500 mr-2">Q.</span>
                  {q.name}
                </dt>
                <dd className="text-zinc-400 pl-6">
                  <span className="text-fuchsia-500/60 mr-2">A.</span>
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-[700px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-fuchsia-400 tracking-widest mb-4">
            ▸ TRY ANOTHER GAME
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              href="/games/bullet-dodge"
              className="block rounded-lg border-2 border-rose-400/30 bg-zinc-900/60 p-3 hover:border-rose-400/60 transition-colors"
            >
              <div className="text-2xl mb-1" aria-hidden>💥</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-rose-400">Bullet Dodge</h3>
            </Link>
            <Link
              href="/games/wolf-runner"
              className="block rounded-lg border-2 border-amber-300/30 bg-zinc-900/60 p-3 hover:border-amber-300/60 transition-colors"
            >
              <div className="text-2xl mb-1" aria-hidden>🐺</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-amber-300">Wolf Runner</h3>
            </Link>
            <Link
              href="/games/tower-stacker"
              className="block rounded-lg border-2 border-violet-300/30 bg-zinc-900/60 p-3 hover:border-violet-300/60 transition-colors"
            >
              <div className="text-2xl mb-1" aria-hidden>🧱</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-violet-300">Tower Stacker</h3>
            </Link>
            <Link
              href="/games/neon-snake"
              className="block rounded-lg border-2 border-lime-400/30 bg-zinc-900/60 p-3 hover:border-lime-400/60 transition-colors"
            >
              <div className="text-2xl mb-1" aria-hidden>🐍</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-lime-400">Neon Snake</h3>
            </Link>
            <Link
              href="/games/reflex-target"
              className="block rounded-lg border-2 border-cyan-400/30 bg-zinc-900/60 p-3 hover:border-cyan-400/60 transition-colors"
            >
              <div className="text-2xl mb-1" aria-hidden>🎯</div>
              <h3 className="font-[family-name:var(--font-pixel)] text-[10px] text-cyan-400">Reflex Target</h3>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          기억해라, 그리고 따라해라 — WATCH AND REPEAT
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
