"use server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isMediaUrl } from "@/lib/content/media";
import { products as base, type Face, type PrintZone } from "@/config/products";
import { realisationCategories } from "@/config/realisations";
import { getProducts } from "@/lib/content/data";

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
const done = (to: string, msg: string): never => { updateTag("site-content"); redirect(`${to}?msg=${msg}`); };

export interface NewProductInput {
  name: string; family: string; description: string; sizes: string[]; templateId: string;
  priceRecto: string; priceBoth: string; colors: { name: string; hex: string; front: string; back: string }[];
}
const toCents = (v: string) => { const n = Number(String(v).replace(",", ".").trim()); return Number.isFinite(n) && n > 0 && n <= 100000 ? Math.round(n * 100) : null; };

export async function createProduct(input: NewProductInput): Promise<{ error: string }> {
  await requireAdmin(); const db = supabaseAdmin();
  if (!db) return { error: "Service non configuré." };
  const name = input.name.trim().slice(0, 60); const family = input.family.trim().slice(0, 40);
  if (name.length < 2) return { error: "Indiquez le nom du produit." };
  if (family.length < 2) return { error: "Choisissez ou saisissez une catégorie." };
  const sizes = [...new Set(input.sizes.map((s) => s.trim().slice(0, 12)).filter(Boolean))].slice(0, 14);
  if (!sizes.length) return { error: "Indiquez au moins une taille (ou « Taille unique »)." };
  const colors = (input.colors ?? []).slice(0, 14);
  if (!colors.length) return { error: "Ajoutez au moins une couleur avec sa photo." };
  for (const c of colors) {
    if (!c.name.trim() || !/^#[0-9a-fA-F]{6}$/.test(c.hex)) return { error: "Chaque couleur a besoin d'un nom et d'une teinte." };
    if (!isMediaUrl(c.front)) return { error: `Ajoutez la photo de face pour la couleur « ${c.name || "?"} ».` };
    if (c.back && !isMediaUrl(c.back)) return { error: "Photo de dos invalide." };
  }
  const tpl = base.find((p) => p.id === input.templateId);
  if (!tpl) return { error: "Choisissez le modèle de zone d'impression." };
  const front: PrintZone | null = tpl.faces.front ?? (Object.values(tpl.faces).find(Boolean) as PrintZone | undefined) ?? null;
  if (!front) return { error: "Ce modèle n'a pas de zone d'impression : choisissez-en un autre." };
  const hasBack = colors.some((c) => c.back);
  const faces: Partial<Record<Face, PrintZone>> = { front };
  if (hasBack) faces.back = (tpl.faces.back as PrintZone | null | undefined) ?? front;

  const existing = new Set((await getProducts()).map((p) => p.id));
  let id = slug(name) || "produit"; for (let i = 2; existing.has(id); i++) id = `${slug(name)}-${i}`;
  const cents = toCents(input.priceRecto); const centsBoth = toCents(input.priceBoth);
  const { error } = await db.from("atelier_custom_products").insert({
    id, family, name, description: input.description.trim().slice(0, 400) || null, sizes,
    colors: colors.map((c) => ({ name: c.name.trim().slice(0, 30), hex: c.hex, photos: { front: c.front, ...(c.back ? { back: c.back } : {}) } })),
    faces, max_zoom: tpl.maxZoom ?? 1.5, price_from: cents ? Math.round(cents / 100) : null,
  });
  if (error) return { error: "Enregistrement impossible. Réessayez." };
  await db.from("atelier_products").upsert({ id, name, category: "textile", price_cents: cents, price_both_cents: centsBoth, active: true, purchasable: cents !== null });
  done("/admin/nouveau-produit", "produit-ajoute");
  return { error: "" };
}

export async function removeProduct(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const id = String(fd.get("id") ?? "");
  await db.from("atelier_custom_products").delete().eq("id", id);
  await db.from("atelier_products").update({ active: false, purchasable: false }).eq("id", id);
  done("/admin/nouveau-produit", "produit-retire");
}

export async function addGalleryPhotos(input: { urls: string[]; category: string; alt: string }): Promise<{ error: string }> {
  await requireAdmin(); const db = supabaseAdmin();
  if (!db) return { error: "Service non configuré." };
  const urls = input.urls.filter(isMediaUrl).slice(0, 30);
  if (!urls.length) return { error: "Aucune photo à ajouter." };
  const category = (realisationCategories as readonly string[]).includes(input.category) ? input.category : "Textile";
  const { error } = await db.from("atelier_gallery").insert(urls.map((src) => ({ src, category, alt: input.alt.trim().slice(0, 160) })));
  if (error) return { error: "Enregistrement impossible. Réessayez." };
  done("/admin/galerie", "galerie-ok");
  return { error: "" };
}
export async function deleteGalleryPhoto(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  await db.from("atelier_gallery").delete().eq("id", String(fd.get("id") ?? ""));
  done("/admin/galerie", "photo-retiree");
}
export async function setGalleryCategory(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const category = String(fd.get("category") ?? "");
  if ((realisationCategories as readonly string[]).includes(category)) await db.from("atelier_gallery").update({ category }).eq("id", String(fd.get("id") ?? ""));
  done("/admin/galerie", "ok");
}

const COVER_KEYS = ["banniere", "textile", "objets", "bagagerie", "communication", "cadeaux", "marquage"];
export async function setCover(input: { key: string; url: string }): Promise<{ error: string }> {
  await requireAdmin(); const db = supabaseAdmin();
  if (!db) return { error: "Service non configuré." };
  if (!COVER_KEYS.includes(input.key) || !isMediaUrl(input.url)) return { error: "Photo invalide." };
  const { error } = await db.from("atelier_covers").upsert({ key: input.key, src: input.url, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  updateTag("site-content");
  return { error: "" };
}
export async function removeCover(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const key = String(fd.get("key") ?? "");
  if (COVER_KEYS.includes(key)) await db.from("atelier_covers").delete().eq("key", key);
  done("/admin/couvertures", "cover-retiree");
}
