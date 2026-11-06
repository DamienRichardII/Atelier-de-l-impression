import { NextResponse, connection } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Produits payables en ligne (purchasable + prix défini). Aucun prix par défaut : liste vide si rien n'est validé. */
export async function GET() {
  await connection(); // jamais figé au build : les prix et l'état viennent de la base à chaque appel
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ prices: {}, enabled: false });
  const { data, error } = await db.from("atelier_products").select("id, price_cents").eq("active", true).eq("purchasable", true).gt("price_cents", 0);
  if (error) return NextResponse.json({ prices: {}, enabled: false });
  const enabled = Boolean(process.env.SUMUP_API_KEY && process.env.SUMUP_MERCHANT_CODE);
  return NextResponse.json({ prices: enabled ? Object.fromEntries((data ?? []).map((r) => [r.id, r.price_cents])) : {}, enabled }, { headers: { "Cache-Control": "no-store" } });
}
