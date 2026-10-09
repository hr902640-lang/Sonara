export function parseDataMode(value = process.env.SONORA_DATA_MODE): "demo" | "live" {
  const mode = value?.trim().toLowerCase();
  if (mode && mode !== "demo" && mode !== "live") {
    throw new Error("SONORA_DATA_MODE must be either 'demo' or 'live'.");
  }
  return mode === "live" ? "live" : "demo";
}

export function parseRefreshMinutes(value = process.env.TREND_REFRESH_MINUTES): number {
  const configuredValue = value?.trim();
  const minutes = configuredValue ? Number(configuredValue) : 15;
  if (!Number.isInteger(minutes) || minutes < 1) {
    throw new Error("TREND_REFRESH_MINUTES must be a positive integer.");
  }
  return minutes;
}

export const dataMode = parseDataMode();
export const refreshMinutes = parseRefreshMinutes();

export function isDataStale(updatedAt: Date | null, now = new Date()) {
  return !updatedAt
    || !Number.isFinite(updatedAt.getTime())
    || now.getTime() - updatedAt.getTime() > refreshMinutes * 60_000 * 2;
}
