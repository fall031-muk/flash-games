import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 스캔라인 */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 21,
              left: 0,
              width: "100%",
              height: 1,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          />
        ))}

        {/* 네온 글로우 배경 — 라임 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(163,230,53,0.07) 0%, transparent 70%)",
          }}
        />

        {/* 이모지 */}
        <div style={{ fontSize: 80, marginBottom: 16, display: "flex" }}>🐍</div>

        {/* 게임 타이틀 */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#a3e635",
            letterSpacing: "0.08em",
            textShadow:
              "0 0 20px rgba(163,230,53,0.9), 0 0 40px rgba(163,230,53,0.5)",
            display: "flex",
            lineHeight: 1.1,
          }}
        >
          NEON SNAKE
        </div>

        {/* 한국어 타이틀 */}
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 12,
            letterSpacing: "0.08em",
            display: "flex",
          }}
        >
          네온 스네이크
        </div>

        {/* 태그라인 */}
        <div
          style={{
            fontSize: 22,
            color: "#71717a",
            marginTop: 24,
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          먹이를 먹고 자라라 · 벽과 자기 몸에 닿지 마라
        </div>

        {/* 키워드 태그 */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {["스네이크", "경로 계획", "레트로 아케이드", "무료 플레이"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 15,
                color: "#a3e63580",
                border: "1px solid #a3e63530",
                borderRadius: 4,
                padding: "6px 14px",
                letterSpacing: "0.05em",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 사이트명 */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#3f3f46",
            letterSpacing: "0.1em",
            display: "flex",
          }}
        >
          Flash Games — flash-games-sand.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
