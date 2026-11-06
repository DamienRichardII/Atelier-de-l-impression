import type { MetadataRoute } from "next";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
// Seules les pages publiques au contenu validé. Ajouter les pages légales dès qu'elles sont rédigées.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/prestations", "/personnalisation", "/realisations", "/contact"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
