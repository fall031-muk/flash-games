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
        {/* 스캔라인 효과 — 가로 줄 */}
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

        {/* 네온 글로우 배경 원 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)",
          }}
        />

        {/* INSERT COIN */}
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.4em",
            color: "#22d3ee",
            textTransform: "uppercase",
            marginBottom: 24,
            textShadow: "0 0 12px rgba(34,211,238,0.8)",
            display: "flex",
          }}
        >
          INSERT COIN
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#a3e635",
            letterSpacing: "0.08em",
            textShadow:
              "0 0 20px rgba(163,230,53,0.9), 0 0 40px rgba(163,230,53,0.5)",
            display: "flex",
            lineHeight: 1.1,
          }}
        >
          FLASH GAMES
        </div>

        {/* 서브 타이틀 */}
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 20,
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          옛날 플래시게임 감성 그대로, 브라우저에서 바로
        </div>

        {/* 게임 목록 */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
          }}
        >
          {[
            { emoji: "💥", name: "총알피하기", color: "#fb7185" },
            { emoji: "🐺", name: "늑대 러너", color: "#fde047" },
            { emoji: "🧱", name: "타워 스태커", color: "#c4b5fd" },
          ].map((game) => (
            <div
              key={game.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 24px",
                border: `1px solid ${game.color}40`,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ fontSize: 36, display: "flex" }}>{game.emoji}</div>
              <div
                style={{
                  fontSize: 16,
                  color: game.color,
                  letterSpacing: "0.05em",
                  display: "flex",
                }}
              >
                {game.name}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 URL */}
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
          flash-games-sand.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
