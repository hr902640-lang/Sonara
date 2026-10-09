type Entry<T> = { value: T; expiresAt: number };
const memory = new Map<string, Entry<unknown>>();
export function cacheGet<T>(key: string): T | null { const entry = memory.get(key); if (!entry || entry.expiresAt < Date.now()) { memory.delete(key); return null; } return entry.value as T; }
export function cacheSet<T>(key: string, value: T, ttlMs: number) { memory.set(key, { value, expiresAt: Date.now() + ttlMs }); return value; }
