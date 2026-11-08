import { NextResponse, connection } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Produits payables en ligne (purchasable + prix défini). Aucun prix par défaut : liste vide si rien n'est validé.
 * `reason` indique POURQUOI l'achat est désactivé (jamais de valeur secrète, seulement le nom de ce qui manque).
 */
export async function GET() {
  await connection(); // jamais figé au build : les prix et l'état viennent de la base à chaque appel
  const headers = { "Cache-Control": "no-store" };
  const missing = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
    !process.env.SUMUP_API_KEY && "SUMUP_API_KEY",
    !process.env.SUMUP_MERCHANT_CODE && "SUMUP_MERCHANT_CODE",
    !process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL && "NEXT_PUBLIC_SITE_URL",
  ].filter(Boolean) as string[];
  if (missing.length) return NextResponse.json({ prices: {}, enabled: false, reason: "variables_manquantes", missing }, { headers });

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ prices: {}, enabled: false, reason: "supabase" }, { headers });
  const { data, error } = await db.from("atelier_products").select("id, price_cents, price_both_cents").eq("active", true).eq("purchasable", true).gt("price_cents", 0);
  if (error) { console.error(JSON.stringify({ scope: "prices", message: error.message })); return NextResponse.json({ prices: {}, enabled: false, reason: "base_de_donnees" }, { headers }); }
  const prices = Object.fromEntries((data ?? []).map((r) => [r.id, r.price_cents]));
  const pricesBoth = Object.fromEntries((data ?? []).filter((r) => (r.price_both_cents ?? 0) > 0).map((r) => [r.id, r.price_both_cents]));
  return NextResponse.json({ prices, pricesBoth, enabled: true, reason: Object.keys(prices).length ? "ok" : "aucun_produit_active" }, { headers });
}
