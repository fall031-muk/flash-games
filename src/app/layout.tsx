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

export const metadata: Metadata = {
  title: "Flash Games — 옛날 플래시게임 모음",
  description:
    "총알피하기, 공튀기기 같은 단순하고 중독성 있는 옛날 플래시게임 스타일 미니게임을 한 곳에서 즐기세요.",
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
