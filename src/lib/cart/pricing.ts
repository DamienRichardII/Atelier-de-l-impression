import { products } from "@/config/products";

export interface PriceRow { id: string; price_cents: number }
export interface PricedLine {
  productId: string; name: string; color: string; sizes: Record<string, number>;
  qty: number; unit_cents: number; line_cents: number; assetsId: string | null;
}
export type PriceResult = { ok: true; lines: PricedLine[]; total_cents: number } | { ok: false; error: string };

/** Calcul serveur : prix lus en base (jamais envoyés par le navigateur), tailles/couleurs validées contre le catalogue. */
export function priceCart(
  items: { productId: string; color: string; sizes: Record<string, number>; assetsId: string | null }[],
  prices: PriceRow[],
): PriceResult {
  const lines: PricedLine[] = [];
  for (const it of items) {
    const cfg = products.find((p) => p.id === it.productId);
    const row = prices.find((p) => p.id === it.productId);
    if (!cfg || !row || !(row.price_cents > 0)) return { ok: false, error: `Le produit « ${cfg?.name ?? it.productId} » n'est pas disponible à l'achat en ligne.` };
    if (!cfg.colors.some((c) => c.name === it.color)) return { ok: false, error: "Couleur invalide." };
    const sizes: Record<string, number> = {};
    for (const [s, n] of Object.entries(it.sizes)) {
      if (n <= 0) continue;
      if (!cfg.sizes.includes(s)) return { ok: false, error: "Taille invalide." };
      sizes[s] = n;
    }
    const qty = Object.values(sizes).reduce((a, b) => a + b, 0);
    if (qty < 1 || qty > 1000) return { ok: false, error: "Quantité invalide." };
    lines.push({ productId: it.productId, name: cfg.name, color: it.color, sizes, qty, unit_cents: row.price_cents, line_cents: row.price_cents * qty, assetsId: it.assetsId });
  }
  const total_cents = lines.reduce((a, l) => a + l.line_cents, 0);
  if (total_cents < 100 || total_cents > 5_000_000) return { ok: false, error: "Montant de commande invalide." };
  return { ok: true, lines, total_cents };
}
