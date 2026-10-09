export function bounded(value: number, minimum = 0, maximum = 100) { return Math.min(maximum, Math.max(minimum, value)); }
export function normalizeRank(rank: number | undefined, entries: number) { return rank ? bounded(100 - ((rank - 1) / Math.max(1, entries - 1)) * 100) : 50; }
