export type Capability = "search" | "trending" | "metadata" | "popularity" | "preview" | "officialLink";
export type ProviderStatus = "configured" | "not_configured" | "unavailable" | "success" | "failed";
export type ProviderTrack = { provider: string; externalId: string; title: string; artists: string[]; album?: string; durationMs?: number; isrc?: string; language?: string; artworkUrl?: string; officialUrl: string; previewUrl?: string; rank?: number; popularity?: number; views?: number; publishedAt?: string };
export type ProviderReport = { name: string; capabilities: Capability[]; status: ProviderStatus; message?: string };
