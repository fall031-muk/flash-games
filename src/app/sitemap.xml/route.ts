import { GAME_KEYS } from "@/lib/leaderboard-shared";

export const runtime = "nodejs";
// Route Handler에서 직접 XML 반환 — Next.js sitemap.ts 컨벤션이 RSC 렌더 파이프라인을 타면서
// 응답에 스크립트가 주입되는 이슈를 피하기 위함.

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://flash-games-sand.vercel.app"
).replace(/\/$/, "");

const LAST_MOD = "2026-04-23T00:00:00.000Z";

type Entry = {
  loc: string;
  lastmod: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
};

function buildEntries(): Entry[] {
  const gameEntries: Entry[] = GAME_KEYS.map((slug) => ({
    loc: `${BASE_URL}/games/${slug}`,
    lastmod: LAST_MOD,
    changefreq: "monthly" as const,
    priority: "0.9",
  }));
  return [
    {
      loc: BASE_URL,
      lastmod: LAST_MOD,
      changefreq: "weekly",
      priority: "1.0",
    },
    ...gameEntries,
    {
      loc: `${BASE_URL}/about`,
      lastmod: LAST_MOD,
      changefreq: "monthly",
      priority: "0.6",
    },
    {
      loc: `${BASE_URL}/privacy`,
      lastmod: LAST_MOD,
      changefreq: "yearly",
      priority: "0.3",
    },
    {
      loc: `${BASE_URL}/terms`,
      lastmod: LAST_MOD,
      changefreq: "yearly",
      priority: "0.3",
    },
  ];
}

function renderXml(entries: Entry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function GET() {
  const xml = renderXml(buildEntries());
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
