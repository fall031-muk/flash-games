import type { NextRequest } from "next/server";
import {
  LeaderboardError,
  getTopScores,
  isLeaderboardConfigured,
  parseGameKey,
  submitScore,
} from "@/lib/leaderboard";
import {
  PERIOD_ORDER,
  getNextResetAt,
  type GameKey,
  type LeaderboardPeriod,
} from "@/lib/leaderboard-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function parsePeriod(value: string | null): LeaderboardPeriod {
  if (value === "monthly") return "monthly";
  return "weekly";
}

export async function GET(request: NextRequest) {
  const gameParam = request.nextUrl.searchParams.get("game");
  const game = parseGameKey(gameParam);
  if (!game) {
    return Response.json({ error: "invalid game" }, { status: 400 });
  }

  if (!isLeaderboardConfigured()) {
    return Response.json({
      configured: false,
      game,
      entries: [],
      period: "weekly" as LeaderboardPeriod,
      resetsAt: 0,
    });
  }

  const periodParam = request.nextUrl.searchParams.get("period");

  if (periodParam === "all") {
    try {
      const results = await Promise.all(
        PERIOD_ORDER.map(async (p) => {
          const entries = await getTopScores(game, p);
          return [p, { entries, resetsAt: getNextResetAt(p) }] as const;
        }),
      );
      const data = Object.fromEntries(results);
      return Response.json({ configured: true, game, data });
    } catch (error) {
      console.error("[leaderboard:get-all]", error);
      return Response.json({ error: "리더보드 조회 실패" }, { status: 500 });
    }
  }

  const period = parsePeriod(periodParam);
  try {
    const entries = await getTopScores(game, period);
    return Response.json({
      configured: true,
      game,
      period,
      entries,
      resetsAt: getNextResetAt(period),
    });
  } catch (error) {
    console.error("[leaderboard:get]", error);
    return Response.json({ error: "리더보드 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isLeaderboardConfigured()) {
    return Response.json({ error: "리더보드가 설정되지 않았습니다." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const raw = (body ?? {}) as {
    game?: unknown;
    name?: unknown;
    score?: unknown;
  };

  const game = parseGameKey(raw.game);
  if (!game) {
    return Response.json({ error: "invalid game" }, { status: 400 });
  }

  const ip = getClientIp(request);

  try {
    const result = await submitScore({
      game,
      name: raw.name,
      score: raw.score,
      ip,
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof LeaderboardError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("[leaderboard:post]", error);
    return Response.json({ error: "점수 저장 실패" }, { status: 500 });
  }
}
