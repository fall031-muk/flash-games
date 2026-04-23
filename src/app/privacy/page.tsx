import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 — Flash Games",
  description:
    "Flash Games의 개인정보처리방침입니다. 수집 데이터, localStorage 사용, 리더보드 정책 등을 안내합니다.",
};

export default function PrivacyPage() {
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
              PRIVACY POLICY
            </h1>
            <p className="font-[family-name:var(--font-retro)] text-base sm:text-xl text-zinc-400 mt-1">
              개인정보처리방침
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
            Flash Games(이하 &quot;사이트&quot;)는 이용자의 개인정보를 소중히 여깁니다.
            본 방침은 사이트를 이용할 때 어떤 데이터가 어떻게 처리되는지 투명하게 안내합니다.
          </p>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 1. 수집하는 정보
            </h2>
            <p>
              사이트는 <strong>회원 가입, 결제, 개인 식별 정보를 수집하지 않습니다.</strong>
              이용자가 자발적으로 제출하거나 기기에 저장되는 데이터만 처리됩니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>
                <strong className="text-zinc-200">리더보드 닉네임 및 점수</strong> —
                상위 랭킹에 진입 시 이용자가 직접 입력한 최대 5자 닉네임과 점수가
                서버에 저장됩니다. 이름·이메일·전화번호 등 실제 개인정보와는
                무관하며, 닉네임과 점수만 기록됩니다.
              </li>
              <li>
                <strong className="text-zinc-200">IP 주소 (일시 사용)</strong> —
                리더보드 스팸/도배 방지를 위한 속도 제한(Rate Limit) 목적으로만
                사용됩니다. IP는 60초 TTL(자동 만료)로 임시 처리되며, 별도로 저장하거나
                기록하지 않습니다.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 2. 브라우저 로컬 저장소 (localStorage)
            </h2>
            <p>
              사이트는 쿠키를 사용하지 않습니다. 대신 브라우저의{" "}
              <strong>localStorage</strong>에 다음 항목을 저장합니다.
              이 데이터는 이용자 기기에만 보관되며, 서버로 전송되지 않습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>
                <code className="text-cyan-400 text-base">bullet-dodge-best</code> — 총알피하기 개인 최고 점수(초)
              </li>
              <li>
                <code className="text-cyan-400 text-base">wolf-runner-best</code> — 늑대 러너 개인 최고 점수(m)
              </li>
              <li>
                <code className="text-cyan-400 text-base">tower-stacker-best</code> — 타워 스태커 개인 최고 점수(층)
              </li>
              <li>
                <code className="text-cyan-400 text-base">bullet-dodge-audio-muted</code> — 오디오 음소거 설정 여부
              </li>
            </ul>
            <p className="text-zinc-500 text-base">
              브라우저 설정에서 localStorage를 초기화하면 언제든지 삭제할 수 있습니다.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 3. 데이터 저장 — Upstash Redis
            </h2>
            <p>
              리더보드 데이터(닉네임, 점수)는{" "}
              <strong>Upstash Redis</strong> 클라우드 서비스에 저장됩니다.
              Upstash의 개인정보처리방침은{" "}
              <a
                href="https://upstash.com/trust/privacy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                upstash.com
              </a>
              에서 확인할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>저장 항목: 닉네임(최대 5자), 점수(숫자)</li>
              <li>일부 게임의 리더보드는 매주 월요일 자동 초기화됩니다.</li>
              <li>이름·이메일·기기 정보 등 추가 개인정보는 수집되지 않습니다.</li>
            </ul>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 4. Google Fonts
            </h2>
            <p>
              사이트는 <strong>Google Fonts</strong>를 통해 Press Start 2P 및 VT323 폰트를
              로드합니다. 폰트 로드 시 Google 서버에 요청이 전송되며,
              이 과정에서 Google이 이용자의 IP 주소를 수집할 수 있습니다.
              Google의 개인정보처리방침은{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                policies.google.com/privacy
              </a>
              에서 확인하세요.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 5. 쿠키 사용 여부
            </h2>
            <p>
              <strong>사이트는 쿠키를 사용하지 않습니다.</strong>{" "}
              추적 쿠키, 세션 쿠키, 서드파티 쿠키 모두 설정되지 않습니다.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 6. 향후 광고 연동 예고
            </h2>
            <p>
              추후 Google AdSense 등 광고 서비스가 연동될 경우, Google을 포함한
              광고 파트너가 쿠키 및 광고 식별자를 사용하여 이용자의 관심사 기반
              광고를 제공할 수 있습니다. 해당 시점에 본 방침은 업데이트되며,
              이용자에게 사전 고지됩니다.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 7. 이용자 권리
            </h2>
            <p>
              리더보드에 등록된 닉네임 삭제를 원하시면 아래 이메일로 문의해 주세요.
              닉네임과 게임 종류를 알려주시면 확인 후 처리해 드립니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>localStorage 데이터: 브라우저 설정에서 직접 삭제 가능</li>
              <li>리더보드 닉네임: 이메일 요청 시 수동 삭제 처리</li>
            </ul>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-pixel)] text-xs text-lime-400 tracking-widest">
              ▸ 8. 문의처
            </h2>
            <p>
              개인정보 관련 문의:{" "}
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
          당신의 데이터는 소중합니다 — YOUR DATA MATTERS
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
