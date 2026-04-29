import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getTodayKey,
  getVisits,
  incrementVisits,
  nextMidnightKstUtc,
} from "@/lib/visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COUNT_COOKIE = "vc-d";

export async function GET() {
  const visits = await getVisits();
  return Response.json(visits);
}

export async function POST(request: NextRequest) {
  const todayKey = getTodayKey();
  const cookie = request.cookies.get(COUNT_COOKIE);
  const alreadyCounted = cookie?.value === todayKey;

  const visits = alreadyCounted ? await getVisits() : await incrementVisits();
  const response = NextResponse.json(visits);

  if (!alreadyCounted) {
    response.cookies.set({
      name: COUNT_COOKIE,
      value: todayKey,
      expires: nextMidnightKstUtc(),
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
