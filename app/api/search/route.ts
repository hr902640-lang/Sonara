import { dataMode } from "@/lib/config";
import { deduplicateTracks } from "@/lib/matching";
import { providers } from "@/lib/providers";
import { songs } from "@/lib/songs";

const colors = ["sunset", "violet", "lime", "blue", "pink", "orange"];

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length > 120) return Response.json({ error: "Search query must be 120 characters or fewer." }, { status: 400 });
  if (query.length < 2) return Response.json({ mode: dataMode, songs: [] });

  if (dataMode === "demo") {
    const normalizedQuery = query.toLocaleLowerCase();
    return Response.json({
      mode: "demo",
      songs: songs.filter(song => `${song.title} ${song.artist} ${song.language}`.toLocaleLowerCase().includes(normalizedQuery)),
    });
  }

  const searchableProviders = providers.filter(provider =>
    provider.searchSongs && provider.status().status === "configured",
  );
  const results = await Promise.allSettled(
    searchableProviders.map(provider => provider.searchSongs!(query)),
  );
  const tracks = deduplicateTracks(
    results.flatMap(result => result.status === "fulfilled" ? result.value : []),
  );
  const failedProviders = results.flatMap((result, index) =>
    result.status === "rejected" ? [searchableProviders[index].name] : [],
  );
  const searchSongs = tracks.map((track, index) => ({
    id: `${track.provider.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${track.externalId}`,
    title: track.title,
    artist: track.artists.join(", ") || "Unknown artist",
    language: track.language ?? "Unknown",
    platforms: [track.provider],
    color: colors[index % colors.length],
    officialLinks: [{ platform: track.provider, url: track.officialUrl }],
  }));

  return Response.json({
    mode: "live",
    songs: searchSongs,
    providerFailures: failedProviders,
    message: searchableProviders.length === 0
      ? "No live search provider is configured. Add Spotify credentials to enable catalog search."
      : undefined,
  });
}
