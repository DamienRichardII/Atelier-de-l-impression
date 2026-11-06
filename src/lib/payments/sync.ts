import type { SupabaseClient } from "@supabase/supabase-js";
import { getCheckoutStatus } from "./sumup";
import { decide } from "./reconcile";
import { emailOrderPaid } from "@/lib/email/messages";

/** Relit le checkout chez SumUp et met à jour la commande. Utilisé par le webhook ET la page de confirmation. */
export async function syncOrderByReference(db: SupabaseClient, reference: string) {
  const { data: order } = await db.from("atelier_orders").select("id, reference, total_cents, payment_status, status").eq("reference", reference).maybeSingle();
  if (!order) return null;
  if (order.payment_status === "paid") return order;
  const { data: pay } = await db.from("atelier_payments").select("id, sumup_checkout_id").eq("order_id", order.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!pay?.sumup_checkout_id) return order;

  const checkout = await getCheckoutStatus(pay.sumup_checkout_id);
  const d = decide(order, checkout);
  if (d.action === "set") {
    await db.from("atelier_payments").update({ status: d.status, raw: { sumup_status: checkout.status, amount: checkout.amount, currency: checkout.currency } }).eq("id", pay.id);
    // Mise à jour conditionnelle : si le webhook et la page de confirmation passent en même temps, un seul gagne (et envoie l'e-mail).
    const { data: changed } = await db.from("atelier_orders").update({
      payment_status: d.status, ...(d.status === "paid" ? { paid_at: new Date().toISOString(), status: "confirmée" } : {}),
    }).eq("id", order.id).neq("payment_status", "paid").select("reference, total_cents, customer, items");
    if (d.status === "paid" && changed?.[0]) await emailOrderPaid(changed[0] as never).catch(() => {});
    return { ...order, payment_status: d.status };
  }
  if (d.action === "alert") console.error(JSON.stringify({ scope: "payment_mismatch", reference, reason: d.reason }));
  return order;
}
