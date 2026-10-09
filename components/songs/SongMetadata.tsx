import type { SonoraSong } from "@/types/song";
export function SongMetadata({ song }: { song: SonoraSong }) { return <span>{song.title} · {song.artist}</span>; }
