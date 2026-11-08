import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Session d'administration : cookie signé (HMAC) avec la clé serveur, httpOnly, 12 h.
// L'identité est vérifiée par Supabase Auth (e-mail + mot de passe) puis par la liste atelier_admin_emails.
const COOKIE = "atl_admin";
const TTL = 12 * 3600;
const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");

export function makeToken(email: string) {
  const p = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${p}.${sign(p)}`;
}

function readToken(t?: string): string | null {
  if (!t || !secret()) return null;
  const [p, sig] = t.split(".");
  if (!p || !sig) return null;
  const a = Buffer.from(sig); const b = Buffer.from(sign(p));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const { e, x } = JSON.parse(Buffer.from(p, "base64url").toString()) as { e: string; x: number }; return x > Date.now() / 1000 ? e : null; } catch { return null; }
}

export async function setSession(email: string) {
  (await cookies()).set(COOKIE, makeToken(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }

/** E-mail de l'administrateur connecté, ou null. Revérifie la liste d'accès à chaque requête. */
export async function currentAdmin(): Promise<string | null> {
  const email = readToken((await cookies()).get(COOKIE)?.value);
  if (!email) return null;
  const db = supabaseAdmin(); if (!db) return null;
  const { data } = await db.from("atelier_admin_emails").select("email").eq("email", email).maybeSingle();
  return data ? email : null;
}

export async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) redirect("/admin/connexion");
  return email;
}
