export const LEADERBOARD_SIZE = 10;
export const NAME_MAX_LEN = 5;
// 최종 제출 시 허용하는 문자: 영문 대문자 + 숫자 + 완성된 한글 음절
export const NAME_PATTERN = /^[A-Z0-9가-힣]{1,5}$/;
// 입력 중(IME 조합 단계) 허용할 문자: 영문 대소문자 + 숫자 + 완성 한글 + 한글 자모
export const VALID_NAME_INPUT_PATTERN = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]*$/;

export type GameKey =
  | "bullet-dodge"
  | "wolf-runner"
  | "tower-stacker"
  | "neon-snake";

export const GAME_KEYS: GameKey[] = [
  "bullet-dodge",
  "wolf-runner",
  "tower-stacker",
  "neon-snake",
];

export type GameConfig = {
  key: GameKey;
  title: string;
  maxScore: number;
  /** 표시용 점수 포매터. 숫자 원값 → 사람 읽을 문자열 (단위 포함). */
  formatScore: (score: number) => string;
  /** 정렬·보드에서 사용하는 단위 라벨. e.g. "s", "m" */
  unit: string;
};

export const GAME_CONFIGS: Record<GameKey, GameConfig> = {
  "bullet-dodge": {
    key: "bullet-dodge",
    title: "Bullet Dodge",
    maxScore: 600_000, // 최대 10분 (ms 단위 저장)
    formatScore: (s) => `${(s / 1000).toFixed(1)}s`,
    unit: "s",
  },
  "wolf-runner": {
    key: "wolf-runner",
    title: "Wolf Runner",
    maxScore: 100_000, // 최대 100,000m
    formatScore: (s) => `${Math.round(s).toLocaleString()}m`,
    unit: "m",
  },
  "tower-stacker": {
    key: "tower-stacker",
    title: "Tower Stacker",
    maxScore: 9999, // 9999층까지 허용 (현실적으로 도달 불가능한 상한)
    formatScore: (s) => `${Math.round(s).toLocaleString()}층`,
    unit: "층",
  },
  "neon-snake": {
    key: "neon-snake",
    title: "Neon Snake",
    maxScore: 625, // 25x25 그리드 가득 채우면 최대 625개 - 3 시작 = 622개, 여유있게 625
    formatScore: (s) => `${Math.round(s).toLocaleString()}개`,
    unit: "개",
  },
};

export function isGameKey(value: unknown): value is GameKey {
  return (
    value === "bullet-dodge" ||
    value === "wolf-runner" ||
    value === "tower-stacker" ||
    value === "neon-snake"
  );
}

export type LeaderboardPeriod = "weekly" | "monthly";

export const PERIOD_ORDER: LeaderboardPeriod[] = ["weekly", "monthly"];

export const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  weekly: "주간",
  monthly: "월간",
};

export const PERIOD_LABEL_EN: Record<LeaderboardPeriod, string> = {
  weekly: "WEEKLY",
  monthly: "MONTHLY",
};

export const PERIOD_RESET_NOTE: Record<LeaderboardPeriod, string> = {
  weekly: "매주 월요일 0시 KST 초기화",
  monthly: "매월 1일 0시 KST 초기화",
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  submittedAt: number;
};

export type SubmitResult = {
  id: string;
  name: string;
  score: number;
  weeklyRank: number;
  monthlyRank: number;
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKst(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS);
}

/** 주간 키는 그 주의 월요일 날짜(YYYYMMDD, KST)로 식별한다. */
export function getWeeklyKey(date: Date = new Date()): string {
  const kst = toKst(date);
  const dayOfWeek = kst.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(kst.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const y = monday.getUTCFullYear();
  const m = `${monday.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${monday.getUTCDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 월간 키는 해당 월(YYYYMM, KST). */
export function getMonthlyKey(date: Date = new Date()): string {
  const kst = toKst(date);
  const y = kst.getUTCFullYear();
  const m = `${kst.getUTCMonth() + 1}`.padStart(2, "0");
  return `${y}${m}`;
}

export function getPeriodKey(
  period: LeaderboardPeriod,
  date: Date = new Date(),
): string {
  return period === "weekly" ? getWeeklyKey(date) : getMonthlyKey(date);
}

export function getNextResetAt(
  period: LeaderboardPeriod,
  date: Date = new Date(),
): number {
  const kst = toKst(date);
  if (period === "weekly") {
    const dayOfWeek = kst.getUTCDay();
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (1 - dayOfWeek + 7) % 7 || 7;
    const nextMondayKst = Date.UTC(
      kst.getUTCFullYear(),
      kst.getUTCMonth(),
      kst.getUTCDate() + daysUntilMonday,
    );
    return nextMondayKst - KST_OFFSET_MS;
  }
  const nextMonthKst = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth() + 1, 1);
  return nextMonthKst - KST_OFFSET_MS;
}
