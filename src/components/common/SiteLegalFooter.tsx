import Link from "next/link";
import VisitorCounter from "./VisitorCounter";

export default function SiteLegalFooter() {
  return (
    <div className="max-w-6xl mx-auto px-6 pb-5 flex flex-wrap justify-center items-center gap-4 text-xs text-zinc-600">
      <Link
        href="/privacy"
        className="hover:text-zinc-400 transition-colors"
      >
        Privacy
      </Link>
      <Link
        href="/terms"
        className="hover:text-zinc-400 transition-colors"
      >
        Terms
      </Link>
      <Link
        href="/about"
        className="hover:text-zinc-400 transition-colors"
      >
        About
      </Link>
      <span>© 2026 Flash Games</span>
      <VisitorCounter />
    </div>
  );
}
