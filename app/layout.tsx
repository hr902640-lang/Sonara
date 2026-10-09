import type { Metadata } from "next";
import "./styles.css";
import "./interaction.css";

export const metadata: Metadata = {
  title: "SONORA — Discover what's trending in India",
  description: "India-first music discovery using available public trend signals and official platform links.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
