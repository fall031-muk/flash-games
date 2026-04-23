import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-retro",
  subsets: ["latin"],
  weight: "400",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Flash Games — 무료 온라인 브라우저 게임 모음 | 레트로 아케이드 미니게임",
    template: "%s | Flash Games",
  },
  description:
    "총알피하기·늑대러너·타워스태커 등 무료 온라인 브라우저 게임 모음. 다운로드·설치 없이 바로 플레이하는 레트로 아케이드 미니게임. 쉬는 시간에 딱 맞는 옛날 플래시게임 감성.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "Flash Games",
    title: "Flash Games — 무료 온라인 브라우저 게임 모음",
    description:
      "총알피하기·늑대러너·타워스태커 등 무료 온라인 브라우저 게임 모음. 다운로드 없이 바로 플레이하는 레트로 아케이드 미니게임.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flash Games — 무료 온라인 브라우저 게임 모음",
    description:
      "총알피하기·늑대러너·타워스태커 등 무료 온라인 브라우저 게임 모음. 다운로드 없이 바로 플레이하는 레트로 아케이드 미니게임.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "1OidjJAqR96Fx60IkW3yNjZNQM1_YMgxlq7Gqb5Ko0w",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pressStart.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
