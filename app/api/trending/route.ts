import { dataMode } from "@/lib/config";
import { providers } from "@/lib/providers";
import { songs } from "@/lib/songs";

export const dynamic = "force-dynamic";

export async function GET() {
  const providerStatus = providers.map(provider => provider.status());
  if (dataMode === "demo") {
    return Response.json({ mode: "demo", updatedAt: null, providerStatus, songs });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const rows = await prisma.trendScore.findMany({
      where: { song: { isDemo: false, slug: { notIn: songs.map(song => song.id) } } },
      orderBy: { calculatedAt: "desc" },
      include: {
        song: {
          include: {
            language: true,
            artists: { include: { artist: true } },
            platforms: { include: { platform: true } },
          },
        },
      },
      take: 300,
    });
    const latestBySong = new Map<string, typeof rows[number]>();
    for (const row of rows) {
      if (!latestBySong.has(row.songId)) latestBySong.set(row.songId, row);
    }
    const liveSongs = [...latestBySong.values()]
      .sort((a, b) => b.score - a.score)
      .map((row, index) => ({
        id: row.song.slug,
        rank: index + 1,
        title: row.song.title,
        artist: row.song.artists.map(link => link.artist.name).join(", ") || "Unknown artist",
        language: row.song.language?.name ?? "Unknown",
        score: row.score,
        movement: row.momentum === null ? undefined : Math.round(row.momentum),
        platforms: row.song.platforms.map(link => link.platform.name),
        officialLinks: row.song.platforms.map(link => ({
          platform: link.platform.name,
          url: link.officialUrl,
        })),
        color: ["sunset", "violet", "lime", "blue", "pink", "orange"][index % 6],
      }));
    const statuses = await prisma.providerSyncStatus.findMany({
      select: { lastSuccessAt: true },
    });
    const latestUpdate = statuses.reduce<Date | null>((latest, status) =>
      status.lastSuccessAt && (!latest || status.lastSuccessAt > latest)
        ? status.lastSuccessAt
        : latest, null);

    return Response.json({
      mode: "live",
      updatedAt: latestUpdate?.toISOString() ?? null,
      providerStatus,
      songs: liveSongs,
      message: liveSongs.length
        ? undefined
        : "Live mode is active, but no provider data has been synchronized yet.",
    });
  } catch (error) {
    console.error("Failed to load persisted trend data.", error instanceof Error ? error.name : "Unknown error");
    return Response.json(
      { error: "Live trend data could not be loaded. Check DATABASE_URL and run Prisma migrations." },
      { status: 503 },
    );
  }
}
