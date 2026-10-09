"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { songs, type Song } from "@/lib/songs";
type ProviderIndicator = { name: string; status: "configured" | "not_configured" | "unavailable" | "success" | "failed" };
type ApiResponse = { mode?: string; songs?: Song[]; updatedAt?: string | null; providerStatus?: ProviderIndicator[]; message?: string; error?: string; providerFailures?: string[] };

const nav = [{ name: "Home", href: "/" }, { name: "Trending", href: "/trending" }, { name: "Search", href: "/search" }, { name: "Library", href: "/library" }];
const platformMarks: Record<string, string> = { YouTube: "▶", Spotify: "◉", "Apple Music": "♬", JioSaavn: "S", Instagram: "◎" };
function officialSearchUrl(platform: string, song: Song) {
  const officialLink = song.officialLinks?.find(link => link.platform === platform);
  if (officialLink) return officialLink.url;
  const query = encodeURIComponent(`${song.title} ${song.artist}`);
  const urls: Record<string, string> = {
    YouTube: `https://www.youtube.com/results?search_query=${query}`,
    Spotify: `https://open.spotify.com/search/${query}`,
    "Apple Music": `https://music.apple.com/in/search?term=${query}`,
    JioSaavn: `https://www.jiosaavn.com/search/${query}`,
    Instagram: `https://www.instagram.com/explore/search/keyword/?q=${query}`,
  };
  return urls[platform] ?? `https://www.google.com/search?q=${query}`;
}
function Artwork({ song, large = false }: { song: Song; large?: boolean }) { return <div className={`art ${song.color} ${large ? "largeArt" : ""}`}><span>{song.title.slice(0, 1)}</span><i>SONORA</i></div>; }
function PlatformDots({ list }: { list: string[] }) { return <div className="dots">{list.map(p => <span title={p} key={p}>{platformMarks[p] || "•"}</span>)}</div>; }

export default function Home() {
  const [query, setQuery] = useState(""), [language, setLanguage] = useState("All languages"), [selected, setSelected] = useState<Song | null>(null), [sourceSongs, setSourceSongs] = useState<Song[]>(songs), [searchResults, setSearchResults] = useState<Song[]>([]), [mode, setMode] = useState("DEMO"), [updated, setUpdated] = useState("sample fixture"), [notice, setNotice] = useState(""), [searchMessage, setSearchMessage] = useState(""), [providerStatus, setProviderStatus] = useState<ProviderIndicator[]>([]), [loading, setLoading] = useState(true), [searchLoading, setSearchLoading] = useState(false), [error, setError] = useState(""), [searchError, setSearchError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/trending", { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as ApiResponse;
        if (!response.ok) throw new Error(data.error ?? "Trend data is temporarily unavailable.");
        setMode(String(data.mode || "demo").toUpperCase());
        setSourceSongs(data.songs || []);
        setProviderStatus(data.providerStatus || []);
        setNotice(data.message || "");
        setUpdated(data.mode === "demo" ? "sample fixture" : data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "not yet synchronized");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Trend data is temporarily unavailable.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearchMessage("");
      setSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
        .then(async response => {
          const data = await response.json() as ApiResponse;
          if (!response.ok) throw new Error(data.error ?? "Search is temporarily unavailable.");
          setMode(String(data.mode || "demo").toUpperCase());
          setSearchResults(data.songs || []);
          setSearchMessage(data.message || (data.providerFailures?.length ? `Search failed for: ${data.providerFailures.join(", ")}.` : ""));
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) setSearchError(reason instanceof Error ? reason.message : "Search is temporarily unavailable.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);
  const list = useMemo(() => (query.trim() ? searchResults : sourceSongs).filter(s => (language === "All languages" || s.language === language) && `${s.title} ${s.artist} ${s.language}`.toLowerCase().includes(query.trim().toLowerCase())), [query, language, searchResults, sourceSongs]);
  return <main>
    <aside><Link href="/" className="logo"><b>◌</b> SONORA</Link><p className="sideLabel">DISCOVER</p>{nav.map(n => <Link key={n.href} href={n.href} className={`sideLink${n.href === "/" ? " active" : ""}`}><span>{n.name === "Home" ? "⌂" : n.name === "Trending" ? "⌁" : n.name === "Search" ? "⌕" : "♡"}</span>{n.name}</Link>)}<div className="sideFoot"><div className="avatar">A</div><div><strong>Guest listener</strong><small>Favorites unavailable</small></div></div></aside>
    <section className="content">
      <header><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search songs, artists, languages" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search songs, artists, languages..." /></label><Link className="signin" href="/library">Library <span>→</span></Link></header>
      <section className="hero"><div className="eyebrow"><i/> INDIA'S MUSIC PULSE</div><h1>Discover what’s<br/><em>trending in India.</em></h1><p>Explore the public music-chart signals currently available to SONORA, without hosting or streaming music.</p><div className="heroBtns"><button className="primary" onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}>Explore trending <span>↓</span></button><a className="ghost" href="#how-it-works">How SONORA works <span>↗</span></a></div><div className="heroGlow"/></section>
      <section className="pulse"><div><strong>{mode} TREND PULSE</strong><span><i/> Updated {updated}</span></div><p>{notice || (mode === "DEMO" ? "Sample rankings only—not current chart data." : "Live results use configured provider data.")}</p></section><div className="providerLine">Provider configuration: {providerStatus.map(provider => <span key={provider.name} className={provider.status === "configured" ? "ready" : "off"}>{provider.name} {provider.status === "configured" ? "configured" : "not configured"}</span>)}</div>
      <section id="trending" className="sectionHead"><div><span className="kicker">THE MOMENT</span><h2>{query.trim() ? "Search " : "Trending "}<em>{query.trim() ? "matches" : "now"}</em></h2></div><Link className="viewAll" href="/trending">View all <span>→</span></Link></section>
      <div className="filters">{["All languages", "Hindi", "Telugu", "Tamil", "Punjabi", "Malayalam"].map(l => <button onClick={() => setLanguage(l)} className={language === l ? "chosen" : ""} key={l}>{l}</button>)}</div>
      {searchMessage && query.trim() && <p className="inlineStatus" role="status">{searchMessage}</p>}
      {(loading || (query.trim().length >= 2 && searchLoading)) && <p className="inlineStatus" role="status">Loading {query.trim() ? "search results" : "trend data"}…</p>}
      {error && !query.trim() && <p className="inlineError" role="alert">{error}</p>}
      {searchError && query.trim() && <p className="inlineError" role="alert">{searchError}</p>}
      {query.trim().length === 1 && <p className="inlineStatus" role="status">Enter at least two characters to search.</p>}
      {!loading && !searchLoading && !error && !searchError && query.trim().length !== 1 && list.length === 0 && <p className="inlineStatus" role="status">{query.trim() ? "No matching songs found." : notice || "No trend data is available yet."}</p>}
      <div className="grid">{list.slice(0, 6).map(song => <article className="songCard" key={song.id} role="button" tabIndex={0} aria-label={`View ${song.title} by ${song.artist}`} onClick={() => setSelected(song)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(song); } }}><div className="cardTop"><span className="rank">{song.rank === undefined ? "—" : String(song.rank).padStart(2, "0")}</span><span className="more" aria-hidden="true">•••</span></div><Artwork song={song}/><div className="cardBody"><div className="songTitle"><div><h3>{song.title}</h3><p>{song.artist}</p></div><span className="lang">{song.language}</span></div><div className="metrics"><div><span>SONORA SCORE</span><strong>{song.score ?? "—"}{song.score !== undefined && <small>/100</small>}</strong></div><div><span>{mode === "LIVE" ? "SCORE CHANGE" : "MOMENTUM"}</span><strong className={(song.movement ?? 0) >= 0 ? "up" : "down"}>{song.movement === undefined ? "—" : mode === "LIVE" ? `${song.movement > 0 ? "+" : ""}${song.movement} pts` : `↑ ${song.movement}%`}</strong></div></div><div className="cardBottom"><PlatformDots list={song.platforms}/><span>{mode === "DEMO" ? `${song.platforms.length} sample platforms` : `${song.platforms.length} platform${song.platforms.length === 1 ? "" : "s"}`}</span></div></div></article>)}</div>
      <section id="how-it-works" className="stats"><div><span>▣</span><strong>Official signals</strong><p>Live ranking is currently based on the configured public YouTube chart source only.</p></div><div><span>↗</span><strong>Score change</strong><p>Movement compares a song’s latest score with its preceding stored snapshot.</p></div><div><span>⌁</span><strong>Transparent modes</strong><p>Demo fixtures are identified; live mode never falls back to sample data.</p></div></section>
    </section>
    {selected && <div className="modalBack" onClick={() => setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="selected-song-title" onClick={e => e.stopPropagation()}><button className="close" aria-label="Close song details" onClick={() => setSelected(null)}>×</button><Artwork song={selected} large/><div><span className="kicker">{selected.language}{selected.rank ? ` · #${selected.rank} IN INDIA` : ""}</span><h2 id="selected-song-title">{selected.title}</h2><p>{selected.artist}</p>{selected.score !== undefined && <div className="score"><b>{selected.score}</b><span>SONORA<br/>TREND SCORE</span><em>{selected.movement === undefined ? "—" : mode === "LIVE" ? `${selected.movement > 0 ? "+" : ""}${selected.movement} pts` : `↑ ${selected.movement}%`}</em></div>}<h4>{mode === "DEMO" ? "Platform searches (demo fixtures)" : "Official platform links"}</h4>{selected.platforms.map(p => <a key={p} href={officialSearchUrl(p, selected)} target="_blank" rel="noopener noreferrer" className="listen">{platformMarks[p] || "•"} {p}<span>{selected.officialLinks?.some(link => link.platform === p) ? "Open release ↗" : "Search platform ↗"}</span></a>)}<small className="legal">{mode === "DEMO" ? "Sample fixture. Platform search links are not verified release matches." : "SONORA ranks public platform signals. It never hosts or streams music."}</small></div></section></div>}
    <nav className="mobileNav">{nav.map(n => <Link href={n.href} key={n.href}>{n.name}</Link>)}</nav>
  </main>;
}
