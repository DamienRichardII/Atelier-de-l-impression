import { randomUUID } from "node:crypto";
import { currentAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { BUCKET, mediaBase } from "@/lib/content/media";

const FOLDERS = ["produits", "galerie", "couvertures"];
const TYPES: Record<string, string> = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" };

/** Dépose une image (déjà redimensionnée par le navigateur) dans l'espace média public. Réservé aux administrateurs. */
export async function POST(req: Request) {
  const admin = await currentAdmin();
  if (!admin) return Response.json({ error: "Non autorisé." }, { status: 401 });
  if (!rateLimit(`upload:${admin}`, 120)) return Response.json({ error: "Trop d'envois. Réessayez dans quelques minutes." }, { status: 429 });
  const db = supabaseAdmin(); if (!db) return Response.json({ error: "Service non configuré." }, { status: 503 });
  const form = await req.formData();
  const file = form.get("file"); const folder = String(form.get("folder") ?? "");
  if (!(file instanceof File) || !FOLDERS.includes(folder)) return Response.json({ error: "Requête invalide." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Format non accepté (JPG, PNG ou WEBP)." }, { status: 400 });
  if (file.size === 0 || file.size > 3 * 1024 * 1024) return Response.json({ error: "Image trop lourde (3 Mo maximum)." }, { status: 400 });
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return Response.json({ error: "Envoi impossible. Réessayez." }, { status: 500 });
  return Response.json({ url: mediaBase() + path });
}
