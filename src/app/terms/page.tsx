import type { Metadata } from "next";
import Link from "next/link";
import SiteLegalFooter from "@/components/common/SiteLegalFooter";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app";

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
      name: "이용약관",
      item: `${BASE_URL}/terms`,
    },
  ],
};

export const metadata: Metadata = {
  title: "이용약관 — Flash Games",
  description:
    "Flash Games 이용약관입니다. 서비스 이용 조건, 리더보드 정책, 저작권 등을 확인하세요.",
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
              TERMS OF SERVICE
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              이용약관
            </p>
          </div>
          <span aria-hidden className="w-16" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
        <div className="font-[family-name:var(--font-retro)] text-lg text-zinc-300 space-y-10">

          <p className="text-zinc-500 text-base">
            최종 업데이트: 2026년 4월 23일
          </p>

          <p>
            Flash Games(이하 &quot;사이트&quot;)를 이용하시면 본 약관에 동의한 것으로 간주됩니다.
            사이트는 취미 목적으로 제작된 무료 미니게임 컬렉션입니다.
          </p>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 1. 서비스 제공
            </h2>
            <p>
              사이트가 제공하는 모든 게임 및 콘텐츠는 <strong>&quot;있는 그대로(as-is)&quot;</strong>{" "}
              무상으로 제공됩니다. 특정 목적 적합성, 무결성, 가용성 등에 대한
              명시적·묵시적 보증을 하지 않습니다.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 2. 책임 제한
            </h2>
            <p>
              게임 플레이 중 발생한 시간 낭비, 스트레스, 또는 키보드 과타격 등에 대해
              사이트는 책임을 지지 않습니다. 모든 플레이는 이용자의 자유 의지에 의한 것입니다.
            </p>
            <p className="text-zinc-500 text-base">
              (진짜로) 사이트 이용으로 인한 직접적·간접적 손해에 대해 법적 책임을 지지 않습니다.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 3. 리더보드 이용 규칙
            </h2>
            <p>리더보드를 이용할 때 다음 사항을 준수해야 합니다.</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>혐오 표현, 욕설, 타인 비방이 포함된 닉네임 제출 금지</li>
              <li>
                봇, 스크립트, 매크로 등 자동화 수단을 이용한 점수 조작 금지.
                적발 시 해당 기록 삭제 및 IP 차단 조치가 취해질 수 있습니다.
              </li>
              <li>
                부적절한 닉네임이 발견될 경우 사전 고지 없이 해당 기록을 삭제할 권한을
                사이트 운영자가 보유합니다.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 4. 서비스 변경 및 중단
            </h2>
            <p>
              사이트는 사전 고지 없이 서비스 내용을 변경하거나 일시적·영구적으로 중단할 수 있습니다.
              서비스 중단으로 인한 손해에 대해 별도의 보상은 제공되지 않습니다.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 5. 저작권
            </h2>
            <p>
              사이트의 게임 로직, 그래픽, 코드, 디자인은 Flash Games 운영자에게 저작권이 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>개인적·비상업적 목적의 플레이는 자유롭게 허용됩니다.</li>
              <li>
                콘텐츠를 상업적으로 복제·배포·2차 저작하는 행위는 운영자의 사전 서면 동의가 필요합니다.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 6. 준거법 및 분쟁 해결
            </h2>
            <p>
              본 약관은 <strong>대한민국 법률</strong>에 따라 해석됩니다.
              분쟁이 발생할 경우 대한민국 관할 법원에서 해결합니다.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 7. 약관 변경
            </h2>
            <p>
              약관은 사전 고지 없이 변경될 수 있으며, 변경 후 사이트를 계속 이용하면
              변경된 약관에 동의한 것으로 간주됩니다. 최신 약관은 이 페이지에서 항상 확인할 수 있습니다.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 8. 문의처
            </h2>
            <p>
              약관 관련 문의:{" "}
              <a
                href="mailto:fall900802@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                fall900802@gmail.com
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-5 text-center font-[family-name:var(--font-retro)] text-base text-zinc-500">
          규칙을 지키고 즐겨라 — PLAY FAIR
        </div>
        <SiteLegalFooter />
      </footer>
    </div>
  );
}
