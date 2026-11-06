import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeSvgServer } from "@/lib/customization/svg-server";

const MAX_FILE = 10 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Dépose l'aperçu et le(s) logo(s) d'un article du panier dans le bucket PRIVÉ ; renvoie un identifiant opaque. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`cart-assets:${ip}`, 30)) return NextResponse.json({ error: "Trop de demandes." }, { status: 429 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Service non configuré." }, { status: 503 });

  const form = await req.formData();
  const id = randomUUID();
  let count = 0;
  for (const [key, value] of form.entries()) {
    if (!(value instanceof File) || value.size === 0 || value.size > MAX_FILE || !OK_TYPES.includes(value.type)) continue;
    if (!/^(preview|logo_[a-z-]{1,15})$/.test(key) || count >= 6) continue;
    let body: Buffer | string = Buffer.from(await value.arrayBuffer());
    if (value.type === "image/svg+xml") {
      const clean = sanitizeSvgServer(body.toString("utf8"));
      if (clean === null) continue; // SVG non sûr : ignoré, jamais stocké
      body = clean;
    }
    const safe = value.name.replace(/[^\w.-]/g, "_").slice(0, 80);
    const { error } = await db.storage.from("atelier-quote-files").upload(`cart/${id}/${key}-${safe}`, body, { contentType: value.type, upsert: false });
    if (!error) count++;
  }
  if (count === 0) return NextResponse.json({ error: "Aucun fichier valide." }, { status: 400 });
  return NextResponse.json({ assetsId: id });
}
