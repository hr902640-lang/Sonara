import { dataMode } from "@/lib/config";
import { songs } from "@/lib/songs";
import { officialSearchLink } from "@/lib/utils/official-links";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (dataMode === "demo") {
    const song = songs.find(item => item.id === slug);
    return song
      ? Response.json({
        mode: "demo",
        song: {
          ...song,
          officialLinks: song.platforms.map(platform => ({
            platform,
            url: officialSearchLink(platform, song.title, song.artist),
          })),
        },
      })
      : Response.json({ error: "Song not found" }, { status: 404 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const row = await prisma.song.findFirst({
      where: { slug, isDemo: false, NOT: { slug: { in: songs.map(song => song.id) } } },
      include: {
        language: true,
        artists: { include: { artist: true } },
        platforms: { include: { platform: true } },
        scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      },
    });
    if (!row) return Response.json({ error: "Song not found" }, { status: 404 });

    const latestScore = row.scores[0];
    return Response.json({
      mode: "live",
      song: {
        id: row.slug,
        title: row.title,
        artist: row.artists.map(({ artist }) => artist.name).join(", ") || "Unknown artist",
        language: row.language?.name ?? "Unknown",
        score: latestScore?.score,
        movement: latestScore?.momentum ?? undefined,
        platforms: row.platforms.map(({ platform }) => platform.name),
        officialLinks: row.platforms.map(({ platform, officialUrl }) => ({
          platform: platform.name,
          url: officialUrl,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to load persisted song data.", error instanceof Error ? error.name : "Unknown error");
    return Response.json(
      { error: "Live song data could not be loaded. Check DATABASE_URL and run Prisma migrations." },
      { status: 503 },
    );
  }
}
