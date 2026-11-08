"use client";
import { useEffect, useState } from "react";

type State = { ready: boolean; enabled: boolean; prices: Record<string, number>; pricesBoth: Record<string, number> };
/** Prix d'affichage uniquement : le serveur les relit en base au moment du paiement. */
export function usePrices() {
  const [state, setState] = useState<State>({ ready: false, enabled: false, prices: {}, pricesBoth: {} });
  useEffect(() => {
    let alive = true;
    fetch("/api/prices", { cache: "no-store" }).then((r) => r.json()).then((d) => alive && setState({ ready: true, enabled: Boolean(d.enabled), prices: d.prices ?? {}, pricesBoth: d.pricesBoth ?? {} }))
      .catch(() => alive && setState({ ready: true, enabled: false, prices: {}, pricesBoth: {} }));
    return () => { alive = false; };
  }, []);
  return state;
}
/** Prix à la pièce : « recto » (1 face personnalisée) ou « recto-verso » (2 faces ou plus). Sans tarif recto-verso, le prix recto s'applique. */
export function unitPrice(s: Pick<State, "prices" | "pricesBoth">, productId: string, sides: number) {
  const one = s.prices[productId] ?? 0;
  return sides >= 2 ? (s.pricesBoth[productId] || one) : one;
}
export const eur = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
