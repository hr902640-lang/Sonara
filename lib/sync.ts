import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { providers } from "@/lib/providers";
import { scoreFromTrack } from "@/lib/trend-engine";
import type { ProviderTrack } from "@/lib/music-types";

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function inferLanguage(title: string) {
  const scripts: Array<[RegExp, string]> = [
    [/[ऀ-ॿ]/, "Hindi"],
    [/[਀-੿]/, "Punjabi"],
    [/[ఀ-౿]/, "Telugu"],
    [/[஀-௿]/, "Tamil"],
    [/[ഀ-ൿ]/, "Malayalam"],
    [/[ಀ-೿]/, "Kannada"],
    [/[઀-૿]/, "Gujarati"],
    [/[଀-୿]/, "Odia"],
    [/[ঀ-৿]/, "Bengali"],
  ];
  return scripts.find(([pattern]) => pattern.test(title))?.[1] ?? "Other Indian / unknown";
}
async function saveTrack(db: Prisma.TransactionClient, track: ProviderTrack, all: ProviderTrack[]) {
  const languageName = track.language ?? inferLanguage(track.title);
  const language = await db.language.upsert({ where: { name: languageName }, create: { name: languageName }, update: {} });
  const slugBase = slugify(`${track.title}-${track.artists[0] || track.provider}`) || track.externalId;
  const song = await db.song.upsert({ where: { slug: slugBase }, create: { slug: slugBase, title: track.title, languageId: language.id, isDemo: false }, update: { title: track.title, languageId: language.id, isDemo: false } });
  const platform = await db.platform.upsert({ where: { name: track.provider }, create: { name: track.provider }, update: {} });
  for (const name of track.artists) { const artist = await db.artist.upsert({ where: { name }, create: { name }, update: {} }); await db.songArtist.upsert({ where: { songId_artistId: { songId: song.id, artistId: artist.id } }, create: { songId: song.id, artistId: artist.id }, update: {} }); }
  await db.songPlatform.upsert({ where: { songId_platformId: { songId: song.id, platformId: platform.id } }, create: { songId: song.id, platformId: platform.id, officialUrl: track.officialUrl, previewUrl: track.previewUrl }, update: { officialUrl: track.officialUrl, previewUrl: track.previewUrl } });
  await db.trendMetric.create({ data: { songId: song.id, platformId: platform.id, popularity: track.popularity, rank: track.rank, momentum: track.rank ? 100 - track.rank : null } });
  const score = scoreFromTrack(track, all);
  const previousSnapshot = await db.trendSnapshot.findFirst({
    where: { songId: song.id },
    orderBy: { capturedAt: "desc" },
    select: { score: true },
  });
  const momentum = previousSnapshot ? score - previousSnapshot.score : null;
  await db.trendScore.create({ data: { songId: song.id, score, momentum } });
  await db.trendSnapshot.create({ data: { songId: song.id, score, momentum, rank: track.rank } });
}
export async function syncTrends() {
  const configured = providers.filter(provider => provider.status().status === "configured" && provider.getTrending);
  const report: Array<{ provider: string; status: "success" | "failed"; count: number; error?: string }> = [];
  for (const provider of configured) { try { const tracks = await provider.getTrending!(); await prisma.$transaction(async transaction => { for (const track of tracks) await saveTrack(transaction, track, tracks); }, { timeout: 120_000 }); await prisma.providerSyncStatus.upsert({ where: { providerName: provider.name }, create: { providerName: provider.name, status: "success", lastSuccessAt: new Date(), itemCount: tracks.length }, update: { status: "success", lastSuccessAt: new Date(), itemCount: tracks.length, lastError: null } }); report.push({ provider: provider.name, status: "success", count: tracks.length }); } catch (error) { const message = error instanceof Error ? error.message : "Unknown provider error"; await prisma.providerSyncStatus.upsert({ where: { providerName: provider.name }, create: { providerName: provider.name, status: "failed", lastError: message, itemCount: 0 }, update: { status: "failed", lastError: message } }); report.push({ provider: provider.name, status: "failed", count: 0, error: message }); } }
  return report;
}
