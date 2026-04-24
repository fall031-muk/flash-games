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
              "radial-gradient(circle, rgba(232,121,249,0.08) 0%, transparent 70%)",
          }}
        />

        <div style={{ fontSize: 80, marginBottom: 16, display: "flex" }}>🧠</div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: "#e879f9",
            letterSpacing: "0.08em",
            textShadow:
              "0 0 20px rgba(232,121,249,0.9), 0 0 40px rgba(232,121,249,0.5)",
            display: "flex",
            lineHeight: 1.1,
          }}
        >
          MEMORY SEQUENCE
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 12,
            letterSpacing: "0.08em",
            display: "flex",
          }}
        >
          기억력 시퀀스
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#71717a",
            marginTop: 24,
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          4색 버튼의 점멸 순서를 외워 그대로 따라 눌러라
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {["기억력 게임", "사이먼 세이즈", "집중력 훈련", "무료 플레이"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 15,
                color: "#e879f980",
                border: "1px solid #e879f930",
                borderRadius: 4,
                padding: "6px 14px",
                letterSpacing: "0.05em",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

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
    },
  );
}
