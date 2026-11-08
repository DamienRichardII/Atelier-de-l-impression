import { getProducts } from "@/lib/content/data";
import { sidesOf } from "@/lib/cart/sides";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { checkoutSchema } from "@/lib/validation/checkout";
import { priceCart } from "@/lib/cart/pricing";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { createCheckout, sumupConfigured } from "@/lib/payments/sumup";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`checkout:${ip}`, 10)) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide. Vérifiez vos informations et l'acceptation des conditions." }, { status: 400 });
  const input = parsed.data;
  if (input.website) return NextResponse.json({ error: "Requête refusée." }, { status: 400 }); // bot

  const db = supabaseAdmin();
  if (!db || !sumupConfigured() || !siteUrl()) return NextResponse.json({ error: "Le paiement en ligne n'est pas encore disponible. Contactez l'atelier." }, { status: 503 });

  // Idempotence : un double clic ou un rechargement ne crée pas une 2e commande.
  const { data: existing } = await db.from("atelier_orders").select("id, reference, payment_status").eq("idempotency_key", input.idempotencyKey).maybeSingle();
  if (existing) {
    const { data: pay } = await db.from("atelier_payments").select("raw").eq("order_id", existing.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const url = (pay?.raw as { checkout_url?: string } | null)?.checkout_url;
    if (url && existing.payment_status === "pending") return NextResponse.json({ checkoutUrl: url, reference: existing.reference });
    return NextResponse.json({ error: "Cette commande a déjà été traitée." }, { status: 409 });
  }

  // Prix : lus en base, jamais fournis par le navigateur.
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const { data: rows, error: pErr } = await db.from("atelier_products").select("id, price_cents, price_both_cents").in("id", ids).eq("active", true).eq("purchasable", true).gt("price_cents", 0);
  if (pErr) return NextResponse.json({ error: "Service momentanément indisponible." }, { status: 500 });
  const withSides = await Promise.all(input.items.map(async (i) => ({ ...i, sides: await sidesOf(db, i.assetsId) })));
  const priced = priceCart(withSides, rows ?? [], await getProducts());
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });

  const reference = `CMD-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const { data: order, error: oErr } = await db.from("atelier_orders").insert({
    reference, customer: { ...input.customer, delivery: "retrait" }, items: priced.lines, total_cents: priced.total_cents,
    status: "en attente de paiement", payment_status: "pending", idempotency_key: input.idempotencyKey,
  }).select("id, access_token").single();
  if (oErr || !order) return NextResponse.json({ error: "Création de la commande impossible." }, { status: 500 });

  try {
    const checkout = await createCheckout({
      reference, amountCents: priced.total_cents, description: `Commande ${reference} — L'Atelier de l'Impression`,
      webhookUrl: `${siteUrl()}/api/sumup/webhook`,
      redirectUrl: `${siteUrl()}/commande/confirmation?ref=${reference}&t=${order.access_token}`,
      customerEmail: input.customer.email,
    });
    if (!checkout.hosted_checkout_url) throw new Error("URL de paiement absente");
    await db.from("atelier_payments").insert({
      order_id: order.id, sumup_checkout_id: checkout.id, amount_cents: priced.total_cents, currency: "EUR", status: "pending",
      raw: { checkout_url: checkout.hosted_checkout_url },
    });
    return NextResponse.json({ checkoutUrl: checkout.hosted_checkout_url, reference });
  } catch (e) {
    console.error(JSON.stringify({ scope: "checkout_create", reference, message: (e as Error).message }));
    await db.from("atelier_orders").update({ payment_status: "failed", status: "annulée" }).eq("id", order.id);
    return NextResponse.json({ error: "Le service de paiement ne répond pas. Aucun débit n'a été effectué. Réessayez ou contactez l'atelier." }, { status: 502 });
  }
}
