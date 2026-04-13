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
    slug: "ball-bounce",
    title: "Ball Bounce",
    titleKo: "공튀기기",
    description: "떨어지는 공을 패들로 튕겨내는 클래식 게임.",
    emoji: "🏀",
    accent: "text-lime-400 border-lime-400/40 shadow-lime-400/20",
    status: "coming-soon",
  },
  {
    slug: "bullet-dodge",
    title: "Bullet Dodge",
    titleKo: "총알피하기",
    description: "쏟아지는 총알 속에서 살아남아라.",
    emoji: "💥",
    accent: "text-rose-400 border-rose-400/40 shadow-rose-400/20",
    status: "coming-soon",
  },
];
