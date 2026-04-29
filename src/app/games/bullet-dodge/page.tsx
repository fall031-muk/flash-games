import type { Metadata } from "next";
import Link from "next/link";
import SiteLegalFooter from "@/components/common/SiteLegalFooter";
import BulletDodgeExperience from "@/components/games/bullet-dodge/BulletDodgeExperience";
import { games } from "@/data/games";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Bullet Dodge (총알피하기)",
  url: `${BASE_URL}/games/bullet-dodge`,
  description:
    "사방에서 쏟아지는 총알을 피해 최대한 오래 살아남는 회피 생존 미니게임. 아이템을 활용해 전역 랭킹 TOP10에 도전하라. 다운로드 없이 브라우저에서 바로 무료 플레이.",
  genre: ["Arcade", "Action"],
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
      name: "Bullet Dodge는 어떻게 플레이하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "화살표 키 또는 WASD로 캐릭터를 이동시켜 사방에서 날아오는 총알을 피합니다. 마우스나 모바일 드래그로도 조작 가능합니다. 총알에 닿으면 즉시 게임오버이며, 살아남은 시간(초)이 점수가 됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "모바일에서도 플레이할 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네, 가능합니다. 캔버스 위에서 손가락으로 드래그하면 캐릭터가 따라오며, 탭으로 시작과 재시작을 할 수 있습니다. 별도 앱 설치 없이 모바일 브라우저에서 바로 플레이됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "내 점수는 어디에 저장되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "개인 최고 점수는 브라우저의 localStorage에 자동 저장됩니다. 서버에는 전송되지 않으며, 브라우저를 청소하면 사라집니다. TOP 10 진입 시 닉네임을 입력하면 전역 랭킹 서버에 등록됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "랭킹에 이름을 올리려면 몇 초를 넘겨야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "전역 TOP 10에 진입하면 닉네임 입력 창이 뜹니다. 현재 랭킹 상황에 따라 기준이 달라지지만, 일반적으로 30초를 넘기면 충분히 경쟁권에 들어올 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "아이템에는 어떤 것들이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "S(방어막 3초), F(총알 정지 3초), B(화면 정리), L(슬로우 3초), +(시간 +5초) 5가지 아이템이 있습니다. 게임 시작 7초 후부터 캔버스 안에 랜덤으로 등장하며, 6초 안에 캐릭터로 접촉하면 발동됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "몇 초를 넘기면 잘하는 건가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "10초 이내는 입문, 30초 이상이면 실력자, 1분을 넘기면 최상위권입니다. 총알 속도가 시간에 따라 빨라지므로 초반 30초를 넘기는 것이 핵심 관문입니다.",
      },
    },
    {
      "@type": "Question",
      name: "가장 피하기 어려운 구간은 언제인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "30~45초 구간이 가장 위험합니다. 총알 속도가 급격히 빨라지면서 동시에 총알 수도 늘어납니다. 이 구간을 버티면 이후는 속도가 안정되므로 이 고비를 넘기는 게 핵심입니다.",
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
      name: "Bullet Dodge (총알피하기)",
      item: `${BASE_URL}/games/bullet-dodge`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Bullet Dodge — 총알 피하기 게임 무료 플레이 | Flash Games",
  description:
    "사방에서 쏟아지는 총알을 피해 오래 살아남는 회피 반응속도 게임. 다운로드 없이 브라우저에서 바로 무료 플레이. 글로벌 랭킹 도전 가능. 모바일 지원.",
  openGraph: {
    title: "Bullet Dodge — 총알 피하기 게임",
    description:
      "사방에서 쏟아지는 총알을 피해 오래 살아남는 회피 반응속도 게임. 브라우저에서 바로 무료 플레이.",
    url: `${BASE_URL}/games/bullet-dodge`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/games/bullet-dodge`,
  },
};

const otherGames = games.filter((g) => g.slug !== "bullet-dodge");

export default function BulletDodgePage() {
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

        {/* HOW TO PLAY */}
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

        {/* 게임 소개 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mb-4">
            ▸ ABOUT THIS GAME
          </h2>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            Bullet Dodge는 사방에서 끊임없이 쏟아지는 총알을 피해 얼마나 오래 살아남을 수 있는지 겨루는
            <strong className="text-rose-400"> 반응속도 회피 게임</strong>입니다.
            조작법은 단순하지만, 시간이 지날수록 총알이 빨라지고 밀도가 높아져 진짜 실력이 드러납니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            다운로드나 로그인 없이 브라우저에서 바로 무료로 플레이할 수 있으며,
            전역 랭킹 시스템으로 전 세계 플레이어와 생존 시간을 경쟁할 수 있습니다.
            키보드, 마우스, 모바일 터치 모두 지원해 어떤 기기에서든 쉬는 시간에 바로 즐길 수 있습니다.
          </p>
          <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 leading-relaxed">
            2000년대 플래시게임 시절의 아케이드 감성을 그대로 담았으면서도,
            아이템 시스템과 점진적 난이도 상승으로 지루할 틈이 없습니다.
            한 판에 1~2분이면 충분해 짬이 나는 언제든 부담 없이 플레이할 수 있는 게임입니다.
          </p>
        </section>

        {/* 고득점 전략 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mb-4">
            ▸ PRO TIPS — 고득점 전략
          </h2>
          <ol className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-3 list-decimal list-inside pl-1">
            <li>
              <span className="text-rose-400">화면 중앙을 기본 포지션으로</span> — 가장자리에 몰리면
              도망칠 방향이 사라진다. 항상 중앙을 향해 위치를 복원하는 습관을 들여라.
            </li>
            <li>
              <span className="text-rose-400">총알 속도가 아닌 밀도를 읽어라</span> — 총알이 빠를수록
              "빈 공간"이 중요하다. 개별 총알을 쫓지 말고 빈 통로를 먼저 찾아 그쪽으로 이동해라.
            </li>
            <li>
              <span className="text-rose-400">아이템 S(방어막)는 위기 탈출용</span> — 포위될 것 같을 때
              방어막을 먹어두면 3초간 무적이 된다. 미리 먹기보다 최대한 버티다가 진짜 위기 때 활용하라.
            </li>
            <li>
              <span className="text-rose-400">대각선 이동을 적극 활용</span> — 4방향보다 8방향으로
              움직이면 더 자연스럽게 총알 사이를 빠져나올 수 있다. W+D, W+A 같은 조합을 연습해라.
            </li>
            <li>
              <span className="text-rose-400">30초 이후 집중력을 두 배로</span> — 이 구간부터 총알이
              급격히 빨라진다. 30초 고비만 넘기면 이후 속도가 어느 정도 안정되므로 이 시점에 집중을 극대화해라.
            </li>
            <li>
              <span className="text-rose-400">+(시간) 아이템은 최우선 획득</span> — 5초가 추가된다.
              타이트한 점수 경쟁에서 +5초는 랭킹 순위를 크게 바꿀 수 있다.
            </li>
          </ol>
        </section>

        {/* 난이도 진행 */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mb-4">
            ▸ DIFFICULTY CURVE — 난이도 진행
          </h2>
          <ul className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-2">
            <li>
              <span className="text-amber-300">0~10초</span> — 총알 수와 속도가 낮아 여유 있다.
              이 구간에서 포지션 감각과 이동 패턴을 익혀두자.
            </li>
            <li>
              <span className="text-amber-300">10~30초</span> — 총알 밀도가 서서히 높아진다.
              아이템이 등장하기 시작하며, 획득 타이밍을 잡는 연습이 필요하다.
            </li>
            <li>
              <span className="text-rose-400">30~60초</span> — 총알 속도가 급증하는 핵심 고비.
              대부분의 플레이어가 이 구간에서 탈락한다. 대각선 이동과 빈 공간 읽기가 필수.
            </li>
            <li>
              <span className="text-rose-400">60초 이후</span> — 풀 스피드에 도달해 속도는 고정되지만
              총알 패턴이 더 촘촘해진다. 여기까지 살아남으면 진짜 고수다.
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="w-full max-w-[800px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-[family-name:var(--font-pixel)] text-xs text-rose-400 tracking-widest mb-5">
            ▸ FAQ
          </h2>
          <dl className="font-[family-name:var(--font-retro)] text-lg space-y-5">
            <div>
              <dt className="text-zinc-100 font-bold mb-1">어떻게 플레이하나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                화살표 키 또는 WASD로 캐릭터를 움직여 총알을 피합니다. 마우스를 캔버스 위에서 움직여도 되고,
                모바일에서는 드래그로 조작합니다. SPACE 또는 탭으로 시작 및 재시작할 수 있습니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">모바일에서도 돼요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                네, 됩니다. 캔버스 위에서 손가락으로 드래그하면 캐릭터가 따라오고,
                탭으로 게임을 시작하거나 재시작할 수 있습니다. 앱 설치 없이 브라우저에서 바로 플레이됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">내 점수는 어떻게 저장되나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                개인 최고 점수는 브라우저 localStorage에 자동 저장됩니다. 브라우저 데이터를 삭제하지 않는 한
                유지됩니다. TOP 10 진입 시 전역 랭킹 서버에 닉네임과 점수가 등록됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">랭킹에 이름 올리려면?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                현재 TOP 10 점수를 초과하면 게임오버 후 닉네임 입력창이 나타납니다.
                최대 5자 닉네임을 입력하면 전역 랭킹에 등록됩니다. 랭킹은 매주 월요일 초기화됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">아이템은 뭐가 있나요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                S(방어막 3초), F(총알 정지 3초), B(화면 정리), L(슬로우 3초), +(시간 +5초) 5종류입니다.
                게임 시작 7초 후부터 랜덤으로 등장하며, 6초 안에 캐릭터로 접촉해야 발동됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">몇 초 넘기면 잘하는 건가요?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                10초 이내는 입문 단계, 30초 이상이면 실력자 반열, 1분을 넘기면 최상위권입니다.
                랭킹 경쟁은 보통 30~60초 사이에서 결정됩니다.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-100 font-bold mb-1">가장 어려운 구간은?</dt>
              <dd className="text-zinc-400 leading-relaxed">
                30~45초 구간이 가장 위험합니다. 총알 속도와 밀도가 동시에 급격히 상승합니다.
                이 고비를 넘기면 이후 속도는 어느 정도 안정됩니다.
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
          피하고 또 피해라 — DODGE OR DIE
        </div>
        <SiteLegalFooter />
      </footer>
    </div>
  );
}
