import { createHmac, timingSafeEqual } from "node:crypto";

// Lien de confirmation de compte : signé (HMAC) avec la clé serveur, valable 24 h, pointe toujours vers le site public.
const TTL = 24 * 3600;
const secret = () => `confirm:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-impression.com").replace(/\/$/, "");

export function makeConfirmToken(email: string) {
  const p = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${p}.${sign(p)}`;
}
export function readConfirmToken(t?: string): string | null {
  if (!t || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const [p, sig] = t.split(".");
  if (!p || !sig) return null;
  const a = Buffer.from(sig); const b = Buffer.from(sign(p));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const { e, x } = JSON.parse(Buffer.from(p, "base64url").toString()) as { e: string; x: number }; return x > Date.now() / 1000 ? e : null; } catch { return null; }
}
export const confirmLink = (email: string) => `${siteUrl()}/admin/confirmation?t=${encodeURIComponent(makeConfirmToken(email))}`;
