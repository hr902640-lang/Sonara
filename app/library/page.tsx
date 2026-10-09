import Link from "next/link";

export const metadata = { title: "Library | SONORA" };

export default function LibraryPage() {
  return (
    <main className="simplePage">
      <p className="kicker">YOUR COLLECTION</p>
      <h1>Library</h1>
      <p>
        Saved songs and personal activity are not enabled yet. SONORA currently has no
        authentication service, so this page does not claim to save favorites.
      </p>
      <Link href="/trending" className="primary">Discover songs →</Link>
    </main>
  );
}
