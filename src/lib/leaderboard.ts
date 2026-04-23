import "server-only";
import { Redis } from "@upstash/redis";
import {
  GAME_CONFIGS,
  LEADERBOARD_SIZE,
  NAME_PATTERN,
  isGameKey,
  type GameKey,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type SubmitResult,
  getPeriodKey,
  getNextResetAt,
} from "./leaderboard-shared";

export const MAX_KEEP_ENTRIES = 100;
export const RATE_LIMIT_WINDOW_SEC = 60;
export const RATE_LIMIT_MAX = 10;

const ENTRY_TTL_SEC = 90 * 24 * 60 * 60;
const WEEKLY_TTL_SEC = 60 * 24 * 60 * 60;
const MONTHLY_TTL_SEC = 120 * 24 * 60 * 60;

export class LeaderboardError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const zsetKey = (
  gameKey: GameKey,
  period: LeaderboardPeriod,
  periodKey: string,
) => `lb:${gameKey}:${period}:${periodKey}:scores`;
const entryKey = (gameKey: GameKey, id: string) =>
  `lb:${gameKey}:entry:${id}`;
const rateLimitKey = (gameKey: GameKey, ip: string) =>
  `lb:${gameKey}:rl:${ip}`;

let cachedClient: Redis | null = null;
function getRedis(): Redis | null {
  if (cachedClient) return cachedClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedClient = new Redis({ url, token });
  return cachedClient;
}

export function isLeaderboardConfigured(): boolean {
  return getRedis() !== null;
}

export function normalizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toUpperCase();
  if (!NAME_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function parseGameKey(value: unknown): GameKey | null {
  return isGameKey(value) ? value : null;
}

function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36).slice(-4);
  return `${rand}${ts}`;
}

export async function getTopScores(
  gameKey: GameKey,
  period: LeaderboardPeriod,
): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (!redis) return [];

  const key = zsetKey(gameKey, period, getPeriodKey(period));
  const raw = (await redis.zrange(key, 0, LEADERBOARD_SIZE - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];

  if (raw.length === 0) return [];

  const ids: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    ids.push(raw[i] as string);
    scores.push(Number(raw[i + 1]));
  }

  const pipe = redis.pipeline();
  for (const id of ids) pipe.hmget(entryKey(gameKey, id), "name", "submittedAt");
  const hashes = (await pipe.exec()) as Array<Record<string, string | null> | null>;

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < ids.length; i++) {
    const hash = hashes[i];
    const name = hash?.name ?? null;
    if (!name) continue;
    entries.push({
      rank: entries.length + 1,
      name,
      score: scores[i],
      submittedAt: Number(hash?.submittedAt ?? 0),
    });
  }
  return entries;
}

export function getResetInfo(period: LeaderboardPeriod): number {
  return getNextResetAt(period);
}

async function enforceRateLimit(
  redis: Redis,
  gameKey: GameKey,
  ip: string,
): Promise<void> {
  const key = rateLimitKey(gameKey, ip);
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
  if (count > RATE_LIMIT_MAX) {
    throw new LeaderboardError("요청이 너무 많습니다. 잠시 후 다시 시도하세요.", 429);
  }
}

export async function submitScore(args: {
  game: GameKey;
  name: unknown;
  score: unknown;
  ip: string;
}): Promise<SubmitResult> {
  const redis = getRedis();
  if (!redis) throw new LeaderboardError("리더보드가 설정되지 않았습니다.", 503);

  await enforceRateLimit(redis, args.game, args.ip);

  const cleanName = normalizeName(args.name);
  if (!cleanName) {
    throw new LeaderboardError(
      "이름은 영문·숫자·한글 1~5자만 사용 가능합니다.",
      400,
    );
  }

  const score = Number(args.score);
  const maxScore = GAME_CONFIGS[args.game].maxScore;
  if (!Number.isFinite(score) || score <= 0 || score > maxScore) {
    throw new LeaderboardError("점수가 유효하지 않습니다.", 400);
  }

  const id = generateId();
  const submittedAt = Date.now();
  const now = new Date(submittedAt);

  const weeklyZset = zsetKey(args.game, "weekly", getPeriodKey("weekly", now));
  const monthlyZset = zsetKey(args.game, "monthly", getPeriodKey("monthly", now));
  const entry = entryKey(args.game, id);

  const pipe = redis.pipeline();
  pipe.zadd(weeklyZset, { score, member: id });
  pipe.zadd(monthlyZset, { score, member: id });
  pipe.hset(entry, { name: cleanName, submittedAt });
  pipe.expire(entry, ENTRY_TTL_SEC);
  pipe.expire(weeklyZset, WEEKLY_TTL_SEC);
  pipe.expire(monthlyZset, MONTHLY_TTL_SEC);
  pipe.zremrangebyrank(weeklyZset, 0, -(MAX_KEEP_ENTRIES + 1));
  pipe.zremrangebyrank(monthlyZset, 0, -(MAX_KEEP_ENTRIES + 1));
  await pipe.exec();

  const [weeklyRawRank, monthlyRawRank] = await Promise.all([
    redis.zrevrank(weeklyZset, id),
    redis.zrevrank(monthlyZset, id),
  ]);
  const weeklyRank = weeklyRawRank == null ? -1 : weeklyRawRank + 1;
  const monthlyRank = monthlyRawRank == null ? -1 : monthlyRawRank + 1;

  return { id, name: cleanName, score, weeklyRank, monthlyRank };
}
