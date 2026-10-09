export type PlatformSignal = { normalizedPopularity: number; momentum: number; chartWeight: number };
/** Weighted, bounded aggregation: no provider's raw metric can dominate. */
export function calculateTrendScore(signals: PlatformSignal[]) {
  if (!signals.length) return 0;
  const signalScore = signals.reduce((total, signal) => {
    const popularity = bounded(signal.normalizedPopularity);
    const momentum = bounded(signal.momentum);
    const chartWeight = bounded(signal.chartWeight);
    return total + (popularity * .55 + momentum * .3 + chartWeight * .15);
  }, 0) / signals.length;
  const coverageBonus = Math.min(8, Math.max(0, signals.length - 1) * 2);
  return Math.round(Math.min(100, signalScore + coverageBonus));
}

function bounded(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

export function percentile(value: number, values: number[]) {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  let index = -1;
  for (let cursor = 0; cursor < sorted.length; cursor += 1) if (sorted[cursor] <= value) index = cursor;
  return sorted.length < 2 ? 50 : Math.round((Math.max(index, 0) / (sorted.length - 1)) * 100);
}

export function scoreFromTrack(track: { rank?: number; views?: number; popularity?: number }, all: { rank?: number; views?: number; popularity?: number }[]) { const ranks = all.map(t => t.rank ?? 999); const views = all.map(t => t.views ?? 0); const popularity = all.map(t => t.popularity ?? 0); return calculateTrendScore([{ normalizedPopularity: Math.max(percentile(track.views ?? 0, views), percentile(track.popularity ?? 0, popularity)), momentum: track.rank ? 100 - percentile(track.rank, ranks) : 50, chartWeight: track.rank ? 100 - percentile(track.rank, ranks) : 50 }]); }
