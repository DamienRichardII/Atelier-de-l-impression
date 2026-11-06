// Limiteur en mémoire (par instance). Pour la production multi-instances : Upstash/Vercel KV.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  return arr.length <= max;
}
