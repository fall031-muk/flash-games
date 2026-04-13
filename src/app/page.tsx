import Link from "next/link";
import { games } from "@/data/games";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 scanlines">
      <header className="w-full border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-10 sm:py-16 text-center">
          <p className="font-[family-name:var(--font-pixel)] text-xs sm:text-sm text-cyan-400 text-glow-cyan mb-4 tracking-widest">
            INSERT COIN
          </p>
          <h1 className="font-[family-name:var(--font-pixel)] text-2xl sm:text-4xl md:text-5xl text-lime-400 text-glow-lime leading-relaxed">
            FLASH GAMES
          </h1>
          <p className="mt-6 font-[family-name:var(--font-retro)] text-xl sm:text-2xl text-zinc-300">
            옛날 플래시게임 감성 그대로, 브라우저에서 바로.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-pixel)] text-sm sm:text-base text-zinc-400 mb-6 tracking-wider">
          ▸ SELECT GAME
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game) => {
            const isPlayable = game.status === "playable";
            const cardBase =
              "block h-full rounded-lg border-2 bg-zinc-900/60 p-6 transition-all duration-200";
            const cardState = isPlayable
              ? `${game.accent} hover:-translate-y-1 hover:shadow-lg cursor-pointer`
              : "border-zinc-800 opacity-60 cursor-not-allowed";

            const content = (
              <div className={`${cardBase} ${cardState}`}>
                <div className="text-5xl mb-4" aria-hidden>
                  {game.emoji}
                </div>
                <h3 className="font-[family-name:var(--font-pixel)] text-sm mb-2 leading-relaxed">
                  {game.title}
                </h3>
                <p className="font-[family-name:var(--font-retro)] text-lg text-zinc-400 mb-1">
                  {game.titleKo}
                </p>
                <p className="text-sm text-zinc-500 mb-4">
                  {game.description}
                </p>
                <span className="font-[family-name:var(--font-pixel)] text-[10px] tracking-widest">
                  {isPlayable ? "▸ PLAY" : "COMING SOON"}
                </span>
              </div>
            );

            return (
              <li key={game.slug}>
                {isPlayable ? (
                  <Link href={`/games/${game.slug}`}>{content}</Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center font-[family-name:var(--font-retro)] text-lg text-zinc-500">
          © {new Date().getFullYear()} Flash Games — Made with ♥
        </div>
      </footer>
    </div>
  );
}
