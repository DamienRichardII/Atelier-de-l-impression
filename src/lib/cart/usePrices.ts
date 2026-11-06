"use client";
import { useEffect, useState } from "react";

/** Prix d'affichage uniquement : le serveur les relit en base au moment du paiement. */
export function usePrices() {
  const [state, setState] = useState<{ ready: boolean; enabled: boolean; prices: Record<string, number> }>({ ready: false, enabled: false, prices: {} });
  useEffect(() => {
    let alive = true;
    fetch("/api/prices", { cache: "no-store" }).then((r) => r.json()).then((d) => alive && setState({ ready: true, enabled: Boolean(d.enabled), prices: d.prices ?? {} }))
      .catch(() => alive && setState({ ready: true, enabled: false, prices: {} }));
    return () => { alive = false; };
  }, []);
  return state;
}
export const eur = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
