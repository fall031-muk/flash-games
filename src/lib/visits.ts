import "server-only";
import { Redis } from "@upstash/redis";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const VISIT_DAILY_PREFIX = "visits:daily:";
const VISIT_TOTAL_KEY = "visits:total";
const DAILY_TTL_SEC = 90 * 24 * 60 * 60; // 90일

let cachedClient: Redis | null = null;
function getRedis(): Redis | null {
  if (cachedClient) return cachedClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedClient = new Redis({ url, token });
  return cachedClient;
}

export function getTodayKey(): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = `${kst.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${kst.getUTCDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 다음 KST 자정의 UTC Date 객체. 쿠키 만료 시각 용도. */
export function nextMidnightKstUtc(): Date {
  const now = new Date();
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const nextDayKst = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate() + 1,
  );
  return new Date(nextDayKst - KST_OFFSET_MS);
}

export type VisitsState = {
  today: number;
  total: number;
  configured: boolean;
};

export async function getVisits(): Promise<VisitsState> {
  const redis = getRedis();
  if (!redis) return { today: 0, total: 0, configured: false };
  const todayKey = `${VISIT_DAILY_PREFIX}${getTodayKey()}`;
  const [today, total] = await Promise.all([
    redis.get<number>(todayKey),
    redis.get<number>(VISIT_TOTAL_KEY),
  ]);
  return {
    today: Number(today ?? 0),
    total: Number(total ?? 0),
    configured: true,
  };
}

export async function incrementVisits(): Promise<VisitsState> {
  const redis = getRedis();
  if (!redis) return { today: 0, total: 0, configured: false };
  const todayKey = `${VISIT_DAILY_PREFIX}${getTodayKey()}`;
  const pipe = redis.pipeline();
  pipe.incr(todayKey);
  pipe.incr(VISIT_TOTAL_KEY);
  pipe.expire(todayKey, DAILY_TTL_SEC);
  const results = (await pipe.exec()) as [number, number, number];
  return {
    today: Number(results[0]) || 0,
    total: Number(results[1]) || 0,
    configured: true,
  };
}
