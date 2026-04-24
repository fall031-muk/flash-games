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
  {
    slug: "reflex-target",
    title: "Reflex Target",
    titleKo: "반응속도 타겟",
    description: "30초 안에 팝업 타겟을 최대한 많이 맞혀라. 폭탄은 피할 것.",
    emoji: "🎯",
    accent: "text-cyan-400 border-cyan-400/40 shadow-cyan-400/20",
    status: "playable",
  },
  {
    slug: "memory-sequence",
    title: "Memory Sequence",
    titleKo: "기억력 시퀀스",
    description: "4색 버튼의 점멸 순서를 외워 그대로 따라 눌러라. 몇 라운드까지?",
    emoji: "🧠",
    accent: "text-fuchsia-400 border-fuchsia-400/40 shadow-fuchsia-400/20",
    status: "playable",
  },
  {
    slug: "piano-tiles",
    title: "Piano Tiles",
    titleKo: "피아노 타일",
    description: "내려오는 검은 타일만 탭. 흰 공간 누르거나 놓치면 끝.",
    emoji: "🎹",
    accent: "text-emerald-400 border-emerald-400/40 shadow-emerald-400/20",
    status: "playable",
  },
];
