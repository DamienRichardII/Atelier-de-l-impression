import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { syncOrderByReference } from "@/lib/payments/sync";
import { getCheckoutStatus } from "@/lib/payments/sumup";

/**
 * Le corps du webhook n'est JAMAIS cru : on s'en sert uniquement pour identifier le checkout,
 * puis on relit son état chez SumUp avant toute mise à jour (voir sync.ts / reconcile.ts).
 */
export async function POST(req: Request) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false }, { status: 503 });
  let id = "";
  try { const b = (await req.json()) as { id?: string; payload?: { checkout_id?: string } }; id = b.payload?.checkout_id ?? b.id ?? ""; } catch { /* corps vide */ }
  if (!id) return NextResponse.json({ ok: true });
  try {
    const checkout = await getCheckoutStatus(id);
    await syncOrderByReference(db, checkout.checkout_reference);
  } catch (e) {
    console.error(JSON.stringify({ scope: "webhook", message: (e as Error).message }));
    return NextResponse.json({ ok: false }, { status: 500 }); // SumUp réessaiera
  }
  return NextResponse.json({ ok: true });
}
