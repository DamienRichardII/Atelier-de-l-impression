import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { syncOrderByReference } from "@/lib/payments/sync";
import { rateLimit } from "@/lib/rate-limit";

const REF = /^CMD-\d{4}-[A-F0-9]{6}$/;
const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`order-status:${ip}`, 60)) return NextResponse.json({ error: "Trop de demandes." }, { status: 429 });
  const u = new URL(req.url);
  const ref = u.searchParams.get("ref") ?? ""; const t = u.searchParams.get("t") ?? "";
  if (!REF.test(ref) || !UUID.test(t)) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Service non configuré." }, { status: 503 });

  const { data: o } = await db.from("atelier_orders").select("reference, payment_status, total_cents").eq("reference", ref).eq("access_token", t).maybeSingle();
  if (!o) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (o.payment_status === "pending") {
    try { const s = await syncOrderByReference(db, ref); if (s) o.payment_status = s.payment_status; } catch { /* on renvoie l'état connu */ }
  }
  return NextResponse.json({ reference: o.reference, paymentStatus: o.payment_status, totalCents: o.total_cents }, { headers: { "Cache-Control": "no-store" } });
}
