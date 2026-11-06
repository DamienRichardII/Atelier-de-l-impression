import type { SumUpCheckout } from "./sumup";

export interface OrderForCheck { reference: string; total_cents: number; payment_status: string }
export type Decision =
  | { action: "none"; reason: string }
  | { action: "set"; status: "paid" | "failed" | "expired" }
  | { action: "alert"; reason: string };

/**
 * Décide du nouvel état d'une commande à partir de la réponse SumUp (relue côté serveur).
 * Une commande n'est « payée » que si statut PAID ET montant ET devise ET référence correspondent à la base.
 * Un écart sur un paiement « PAID » ne fait JAMAIS passer la commande en payée : alerte à traiter à la main.
 */
export function decide(order: OrderForCheck, checkout: SumUpCheckout): Decision {
  if (order.payment_status === "paid") return { action: "none", reason: "déjà payée" };
  if (checkout.checkout_reference !== order.reference) return { action: "alert", reason: "référence différente" };
  if (checkout.status === "PAID") {
    const cents = Math.round(Number(checkout.amount) * 100);
    if (cents !== order.total_cents || checkout.currency !== "EUR") return { action: "alert", reason: `montant ou devise inattendu (${cents} ${checkout.currency})` };
    return { action: "set", status: "paid" };
  }
  if (checkout.status === "FAILED") return { action: "set", status: "failed" };
  if (checkout.status === "EXPIRED") return { action: "set", status: "expired" };
  return { action: "none", reason: "en attente" };
}
