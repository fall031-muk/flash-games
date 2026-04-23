export type GameStatus = "playable" | "coming-soon";

export type Game = {
  slug: string;
  title: string;
  titleKo: string;
  description: string;
  emoji: string;
  accent: string;
  status: GameStatus;
};

export const games: Game[] = [
  {
    slug: "bullet-dodge",
    title: "Bullet Dodge",
    titleKo: "총알피하기",
    description: "쏟아지는 총알 속에서 살아남아라.",
    emoji: "💥",
    accent: "text-rose-400 border-rose-400/40 shadow-rose-400/20",
    status: "playable",
  },
  {
    slug: "wolf-runner",
    title: "Wolf Runner",
    titleKo: "늑대 러너",
    description: "3단 점프로 장애물을 피해 끝없이 달려라.",
    emoji: "🐺",
    accent: "text-amber-300 border-amber-300/40 shadow-amber-300/20",
    status: "playable",
  },
  {
    slug: "tower-stacker",
    title: "Tower Stacker",
    titleKo: "타워 스태커",
    description: "흔들리는 블록을 탭으로 멈춰 하늘까지 쌓아올려라.",
    emoji: "🧱",
    accent: "text-violet-300 border-violet-300/40 shadow-violet-300/20",
    status: "playable",
  },
  {
    slug: "neon-snake",
    title: "Neon Snake",
    titleKo: "네온 스네이크",
    description: "먹이를 먹고 길어지는 뱀, 자기 몸이나 벽에 닿지 마라.",
    emoji: "🐍",
    accent: "text-lime-400 border-lime-400/40 shadow-lime-400/20",
    status: "playable",
  },
];
