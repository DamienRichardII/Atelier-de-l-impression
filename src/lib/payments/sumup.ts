// Intégration SumUp — côté serveur uniquement (SUMUP_API_KEY et SUMUP_MERCHANT_CODE ne sortent jamais d'ici).
// ⚠ NON TESTÉE de bout en bout : à valider avec un vrai paiement de 1 € (puis remboursement) avant l'ouverture au public.
// Forme des appels alignée sur l'intégration SumUp déjà en production pour NOVRA (hosted checkout).
const BASE = "https://api.sumup.com/v0.1";
const TIMEOUT_MS = 15_000;

export type SumUpStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export interface SumUpCheckout {
  id: string; status: SumUpStatus; amount: number; currency: string; checkout_reference: string;
  hosted_checkout_url?: string;
}
export class SumUpError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "SumUpError"; }
}

export const sumupConfigured = () => Boolean(process.env.SUMUP_API_KEY && process.env.SUMUP_MERCHANT_CODE);

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.SUMUP_API_KEY;
  if (!key) throw new SumUpError("SUMUP_API_KEY manquante", 500);
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, {
      ...init, signal: ctrl.signal, cache: "no-store",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    });
    if (!res.ok) throw new SumUpError(`SumUp ${path} : HTTP ${res.status}`, res.status);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof SumUpError) throw e;
    throw new SumUpError((e as Error).name === "AbortError" ? "SumUp n'a pas répondu à temps" : "SumUp injoignable", 504);
  } finally { clearTimeout(timer); }
}

/** Le montant vient TOUJOURS de la base (commande recalculée serveur), jamais du navigateur. */
export async function createCheckout(p: {
  reference: string; amountCents: number; description: string; webhookUrl: string; redirectUrl: string; customerEmail?: string;
}) {
  const merchant = process.env.SUMUP_MERCHANT_CODE;
  if (!merchant) throw new SumUpError("SUMUP_MERCHANT_CODE manquant", 500);
  return call<SumUpCheckout>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      checkout_reference: p.reference.slice(0, 64), amount: p.amountCents / 100, currency: "EUR",
      merchant_code: merchant, description: p.description.slice(0, 100),
      return_url: p.webhookUrl, redirect_url: p.redirectUrl, hosted_checkout: { enabled: true },
    }),
  });
}

/** Vérification serveur : seule source de vérité pour passer une commande en « payée ». */
export async function getCheckoutStatus(id: string) {
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(id)) throw new SumUpError("Identifiant de checkout invalide", 400);
  return call<SumUpCheckout>(`/checkouts/${encodeURIComponent(id)}`);
}
