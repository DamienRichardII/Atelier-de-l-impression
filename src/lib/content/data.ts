import { cacheLife, cacheTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { products, type ColorOption, type Face, type PrintZone, type ProductConfig } from "@/config/products";
import { realisations, type Realisation } from "@/config/realisations";

// Contenu modifiable depuis l'admin. Mis en cache puis invalidé (tag « site-content ») à chaque enregistrement.

export interface CustomProductRow {
  id: string; family: string; name: string; description: string | null; sizes: string[]; colors: ColorOption[];
  faces: Partial<Record<Face, PrintZone | null>>; max_zoom: number | null; price_from: number | null; active: boolean;
}
const toConfig = (r: CustomProductRow): ProductConfig => ({
  id: r.id, family: r.family, name: r.name, description: r.description ?? undefined, colors: r.colors, sizes: r.sizes,
  faces: r.faces, maxZoom: r.max_zoom ?? 1.5, price: null, priceFrom: r.price_from ?? undefined,
});

export async function getCustomProducts(): Promise<ProductConfig[]> {
  "use cache";
  cacheTag("site-content"); cacheLife("minutes");
  const db = supabaseAdmin(); if (!db) return [];
  const { data } = await db.from("atelier_custom_products").select("*").eq("active", true).order("created_at");
  return ((data ?? []) as CustomProductRow[]).map(toConfig);
}
/** Catalogue complet : produits du site + produits ajoutés par l'atelier. */
export async function getProducts(): Promise<ProductConfig[]> {
  const [custom, prices] = await Promise.all([getCustomProducts(), getCatalogPrices()]);
  // Le prix « à partir de » affiché sur le site suit toujours le prix recto saisi dans l'admin.
  return [...products, ...custom].map((p) => (prices[p.id] ? { ...p, priceFrom: prices[p.id] } : p));
}

/** Prix recto (€) saisis dans l'admin, pour les produits actifs. */
async function getCatalogPrices(): Promise<Record<string, number>> {
  "use cache";
  cacheTag("site-content"); cacheLife("minutes");
  const db = supabaseAdmin(); if (!db) return {};
  const { data } = await db.from("atelier_products").select("id, price_cents").eq("active", true).gt("price_cents", 0);
  return Object.fromEntries((data ?? []).map((r) => [r.id as string, (r.price_cents as number) / 100]));
}

export async function getGallery(): Promise<(Realisation & { id?: string })[]> {
  "use cache";
  cacheTag("site-content"); cacheLife("minutes");
  const db = supabaseAdmin(); if (!db) return [...realisations];
  const { data } = await db.from("atelier_gallery").select("id, src, alt, category").order("created_at", { ascending: false });
  const extra = (data ?? []).map((r) => ({ id: r.id as string, src: r.src as string, alt: (r.alt as string) || "Réalisation de L'Atelier de l'Impression", category: r.category as Realisation["category"] }));
  return [...extra, ...realisations];
}

export async function getCovers(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("site-content"); cacheLife("minutes");
  const db = supabaseAdmin(); if (!db) return {};
  const { data } = await db.from("atelier_covers").select("key, src");
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.src as string]));
}
