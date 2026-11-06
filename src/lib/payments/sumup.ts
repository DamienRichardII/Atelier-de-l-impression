// Intégration SumUp — côté serveur uniquement. NON TESTÉE : nécessite SUMUP_API_KEY + SUMUP_MERCHANT_CODE (sandbox).
// Référence : https://developer.sumup.com/ (vérifier les champs avant mise en production).
const BASE = "https://api.sumup.com/v0.1";

function headers() {
  const key = process.env.SUMUP_API_KEY;
  if (!key) throw new Error("SUMUP_API_KEY manquante");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export type SumUpStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

/** Le montant vient TOUJOURS du serveur (commande en base), jamais du navigateur. */
export async function createCheckout(p: { reference: string; amountCents: number; description: string; returnUrl: string }) {
  const merchant = process.env.SUMUP_MERCHANT_CODE;
  if (!merchant) throw new Error("SUMUP_MERCHANT_CODE manquant");
  const res = await fetch(`${BASE}/checkouts`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({
      checkout_reference: p.reference, amount: p.amountCents / 100, currency: "EUR",
      merchant_code: merchant, description: p.description, return_url: p.returnUrl,
    }),
  });
  if (!res.ok) throw new Error(`SumUp create checkout: ${res.status}`);
  return (await res.json()) as { id: string; status: SumUpStatus };
}

/** Vérification serveur : seule source de vérité pour passer une commande en "payée". */
export async function getCheckoutStatus(id: string) {
  const res = await fetch(`${BASE}/checkouts/${encodeURIComponent(id)}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`SumUp get checkout: ${res.status}`);
  return (await res.json()) as { id: string; status: SumUpStatus; amount: number; currency: string; checkout_reference: string };
}
