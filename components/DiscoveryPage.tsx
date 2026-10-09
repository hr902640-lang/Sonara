"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Song } from "@/lib/songs";

type PageMode = "trending" | "search";
type ApiResponse = {
  mode?: string;
  songs?: Song[];
  updatedAt?: string | null;
  message?: string;
  error?: string;
  providerFailures?: string[];
};

export function DiscoveryPage({ pageMode }: { pageMode: PageMode }) {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [mode, setMode] = useState("demo");
  const [loading, setLoading] = useState(pageMode === "trending");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (pageMode !== "search") return;
    const controller = new AbortController();
    fetch("/api/search", { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as ApiResponse;
        if (!response.ok) throw new Error(data.error ?? "Search is unavailable.");
        setMode(data.mode ?? "demo");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Search is unavailable.");
        }
      });
    return () => controller.abort();
  }, [pageMode]);

  useEffect(() => {
    if (pageMode !== "trending") return;
    const controller = new AbortController();
    fetch("/api/trending", { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as ApiResponse;
        if (!response.ok) throw new Error(data.error ?? "Trend data is unavailable.");
        setMode(data.mode ?? "demo");
        setSongs(data.songs ?? []);
        setMessage(data.message ?? "");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Trend data is unavailable.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [pageMode]);

  useEffect(() => {
    if (pageMode !== "search") return;
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSongs([]);
      setError("");
      setMessage("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
        .then(async response => {
          const data = await response.json() as ApiResponse;
          if (!response.ok) throw new Error(data.error ?? "Search is unavailable.");
          setMode(data.mode ?? "demo");
          setSongs(data.songs ?? []);
          setMessage(data.message ?? (data.providerFailures?.length
            ? `Search failed for: ${data.providerFailures.join(", ")}.`
            : ""));
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) {
            setError(reason instanceof Error ? reason.message : "Search is unavailable.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [pageMode, query]);

  const isSearch = pageMode === "search";
  return (
    <main className="discoveryPage">
      <Link href="/" className="discoveryLogo">◌ SONORA</Link>
      <p className="kicker">{isSearch ? "UNIVERSAL SEARCH" : "INDIA MUSIC PULSE"}</p>
      <h1>{isSearch ? <>Find a <em>song</em></> : <>Trending <em>now</em></>}</h1>
      {isSearch ? (
        <label className="discoverySearch">
          <span>Search songs, artists, languages</span>
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            maxLength={120}
            placeholder="Try a song title or artist"
          />
        </label>
      ) : (
        <p className="discoveryIntro">
          {mode === "demo"
            ? "Demo rankings are sample data and do not represent current platform charts."
            : "Rankings use only configured, successfully synchronized trend signals."}
        </p>
      )}
      <p className="discoveryMode" role="status">
        {mode.toUpperCase()} MODE
        {!isSearch && mode === "demo" ? " · Sample data only" : ""}
        {!isSearch && mode === "live" ? " · YouTube public chart signal" : ""}
      </p>
      {message && <p className="discoveryNotice" role="status">{message}</p>}
      {error && <p className="discoveryError" role="alert">{error}</p>}
      {loading && <p className="discoveryStatus" role="status">Loading…</p>}
      {!loading && !error && isSearch && query.trim().length < 2 && (
        <p className="discoveryStatus">Enter at least two characters to search.</p>
      )}
      {!loading && !error && isSearch && query.trim().length >= 2 && songs.length === 0 && (
        <p className="discoveryStatus">No matches found for “{query.trim()}”.</p>
      )}
      {!loading && !error && !isSearch && songs.length === 0 && (
        <p className="discoveryStatus">No synchronized trend results yet.</p>
      )}
      <ol className="discoveryList">
        {songs.map((song, index) => {
          const content = (
            <>
              <span className="discoveryRank">{song.rank ?? index + 1}</span>
              <span className="discoverySong">
                <strong>{song.title}</strong>
                <small>{song.artist} · {song.language}</small>
              </span>
              <span className="discoveryScore">
                {song.score === undefined ? song.platforms.join(", ") : `${song.score}/100`}
              </span>
              <span className="discoveryArrow" aria-hidden="true">↗</span>
            </>
          );
          return (
            <li key={song.id}>
              {song.officialLinks?.[0] ? (
                <a href={song.officialLinks[0].url} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <Link href={`/song/${encodeURIComponent(song.id)}`}>{content}</Link>
              )}
            </li>
          );
        })}
      </ol>
      <Link href="/" className="discoveryBack">← Back to SONORA dashboard</Link>
    </main>
  );
}
