export type Song = {
  id: string;
  rank?: number;
  title: string;
  artist: string;
  language: string;
  score?: number;
  movement?: number;
  platforms: string[];
  color: string;
  tag?: string;
  officialLinks?: Array<{ platform: string; url: string }>;
};
export type DemoSong = Song & { rank: number; score: number; movement: number };

export const songs: DemoSong[] = [
  { id: "aaj-ki-raat", rank: 1, title: "Aaj Ki Raat", artist: "Madhubanti Bagchi, Divya Kumar", language: "Hindi", score: 96, movement: 22, platforms: ["YouTube", "Spotify", "Apple Music", "JioSaavn", "Instagram"], color: "sunset", tag: "#1 in India" },
  { id: "fear-song", rank: 2, title: "Fear Song", artist: "Anirudh Ravichander", language: "Telugu", score: 93, movement: 18, platforms: ["YouTube", "Spotify", "Apple Music", "JioSaavn"], color: "violet", tag: "Rising fast" },
  { id: "tauba-tauba", rank: 3, title: "Tauba Tauba", artist: "Karan Aujla", language: "Punjabi", score: 91, movement: 14, platforms: ["YouTube", "Spotify", "Apple Music", "Instagram"], color: "lime" },
  { id: "manasilaayo", rank: 4, title: "Manasilaayo", artist: "Anirudh Ravichander", language: "Tamil", score: 88, movement: 11, platforms: ["YouTube", "Spotify", "JioSaavn"], color: "blue" },
  { id: "apt", rank: 5, title: "APT.", artist: "ROSÉ, Bruno Mars", language: "English", score: 86, movement: 9, platforms: ["YouTube", "Spotify", "Apple Music"], color: "pink", tag: "New this week" },
  { id: "angaaron", rank: 6, title: "Angaaron", artist: "Shreya Ghoshal", language: "Telugu", score: 84, movement: 6, platforms: ["YouTube", "Spotify", "JioSaavn", "Instagram"], color: "orange" }
];
