import type { Metadata } from "next";
import { songs } from "@/lib/songs";
import { SongDetails } from "@/components/SongDetails";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const song = songs.find(item => item.id === slug);
  return {
    title: song ? `${song.title} by ${song.artist} | SONORA` : "Song | SONORA",
    description: "Official platform links and SONORA trend data.",
  };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SongDetails slug={slug} />;
}
