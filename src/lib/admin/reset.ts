import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/lib/admin/confirm";

// Lien de réinitialisation : signé, valable 1 heure, à usage unique (lié à la date de dernière modification du compte).
const TTL = 3600;
const secret = () => `reset:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");

export function makeResetToken(email: string, version: string) {
  const p = Buffer.from(JSON.stringify({ e: email, v: version, x: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${p}.${sign(p)}`;
}
export function readResetToken(t?: string): { email: string; version: string } | null {
  if (!t || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const [p, sig] = t.split(".");
  if (!p || !sig) return null;
  const a = Buffer.from(sig); const b = Buffer.from(sign(p));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const { e, v, x } = JSON.parse(Buffer.from(p, "base64url").toString()) as { e: string; v: string; x: number }; return x > Date.now() / 1000 ? { email: e, version: v } : null; } catch { return null; }
}
export const resetLink = (email: string, version: string) => `${siteUrl()}/admin/reinitialisation?t=${encodeURIComponent(makeResetToken(email, version))}`;
