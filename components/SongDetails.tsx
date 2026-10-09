"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Song } from "@/lib/songs";

type SongResponse = { mode?: string; song?: Song; error?: string };

export function SongDetails({ slug }: { slug: string }) {
  const [song, setSong] = useState<Song | null>(null);
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/songs/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as SongResponse;
        if (!response.ok) throw new Error(data.error ?? "Song details are unavailable.");
        setSong(data.song ?? null);
        setMode(data.mode ?? "");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Song details are unavailable.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  return (
    <main className="simplePage">
      <p className="kicker">SONORA SONG PAGE</p>
      {loading && <p role="status">Loading song details…</p>}
      {error && <p role="alert">{error}</p>}
      {song && (
        <>
          <h1>{song.title}</h1>
          <p>{song.artist} · {song.language}</p>
          {song.score !== undefined && (
            <p>
              SONORA trend score: {song.score}/100
              {song.movement === undefined ? " · movement not yet available" : ` · score change: ${song.movement > 0 ? "+" : ""}${song.movement} pts`}
            </p>
          )}
          {mode === "demo" && <p>This is sample data, not a current chart result.</p>}
          <h2>{mode === "demo" ? "Platform searches (demo fixtures)" : "Official platform links"}</h2>
          {song.officialLinks?.length ? (
            <ul className="songOfficialLinks">
              {song.officialLinks.map(link => (
                <li key={`${link.platform}-${link.url}`}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.platform} {mode === "demo" ? "search ↗" : "release ↗"}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No platform links are available for this song.</p>
          )}
        </>
      )}
      {!loading && !error && !song && <p>Song not found.</p>}
      <Link href="/trending" className="primary">Back to trending →</Link>
    </main>
  );
}
