"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import type { Face, ProductConfig } from "@/config/products";
import type { LogoPlacement } from "@/lib/customization/types";
import { cart } from "@/lib/cart/store";
import { eur, unitPrice, usePrices } from "@/lib/cart/usePrices";

interface Props {
  product: ProductConfig;
  color: { name: string; hex: string };
  logos: Partial<Record<Face, LogoPlacement>>;
  originals: Partial<Record<Face, File>>;
  snapshot(): string | null;
}

async function thumb(dataUrl: string, size = 160): Promise<string | null> {
  try {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const r = size / Math.max(img.width, img.height);
    const c = document.createElement("canvas"); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/webp", 0.7);
  } catch { return null; }
}

/** Affiché uniquement si l'atelier a validé un prix pour ce produit (purchasable + price_cents côté base). */
export function AddToCart({ product, color, logos, originals, snapshot }: Props) {
  const pr = usePrices();
  const { ready, enabled, prices } = pr;
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [state, setState] = useState<"idle" | "busy" | "added" | "error">("idle");
  const [msg, setMsg] = useState("");
  const sides = Object.keys(logos).length >= 2 ? 2 : 1;
  const unit = unitPrice(pr, product.id, sides);
  const both = pr.pricesBoth[product.id];
  if (!ready || !enabled || !unit) return null;

  const qty = Object.values(sizes).reduce((a, b) => a + b, 0);
  const hasLogo = Object.keys(logos).length > 0;

  async function add() {
    if (!hasLogo) { setState("error"); setMsg("Ajoutez votre logo dans le simulateur avant d'ajouter au panier."); return; }
    if (qty < 1) { setState("error"); setMsg("Indiquez au moins une pièce."); return; }
    setState("busy"); setMsg("");
    try {
      const snap = snapshot();
      const form = new FormData();
      if (snap) form.set("preview", await (await fetch(snap)).blob(), "apercu.png");
      for (const [face, file] of Object.entries(originals)) if (file) form.append(`logo_${face}`, file, file.name);
      const res = await fetch("/api/cart/assets", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Envoi des fichiers impossible.");
      cart.add({ productId: product.id, productName: product.name, color: color.name, sizes: Object.fromEntries(Object.entries(sizes).filter(([, n]) => n > 0)), assetsId: data.assetsId, thumb: snap ? await thumb(snap) : null, hasLogo, sides });
      setSizes({}); setState("added");
    } catch (e) { setState("error"); setMsg((e as Error).message); }
  }

  return (
    <section id="panier" className="card mt-12 scroll-mt-24 p-5 sm:p-8">
      <p className="eyebrow">05 — Commander maintenant</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ajouter au panier</h2>
      <p className="mt-1 text-sm text-muted">{product.name} {color.name} — <strong>{eur(unit)}</strong> la pièce, impression {sides === 2 ? "recto-verso" : "recto"} incluse.{both && both !== prices[product.id] ? (sides === 2 ? ` (recto seul : ${eur(prices[product.id])})` : ` (recto-verso : ${eur(both)})`) : ""} Retrait à l'atelier.</p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {product.sizes.map((s) => (
          <label key={s} className="text-center text-sm">{s}
            <input type="number" min={0} inputMode="numeric" value={sizes[s] ?? ""} placeholder="0"
              onChange={(e) => setSizes({ ...sizes, [s]: Math.max(0, Math.min(1000, Number(e.target.value) || 0)) })}
              className="mt-1 h-12 w-full rounded-xl border border-line text-center outline-none focus:border-black" />
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{qty} pièce(s) · <strong className="text-black">{eur(unit * qty)}</strong></p>
      {state === "error" && <p role="alert" className="mt-3 text-sm font-medium underline">{msg}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn btn-dark" onClick={add} disabled={state === "busy"}>
          {state === "busy" ? <Loader2 className="animate-spin" size={16} /> : <ShoppingBag size={16} />} Ajouter au panier
        </button>
        {state === "added" && <Link href="/panier" className="btn btn-light"><Check size={16} /> Ajouté — voir le panier</Link>}
      </div>
      <p className="mt-3 text-xs text-muted">Pour une grande quantité ou un besoin particulier, <Link href="/contact" className="underline">contactez l'atelier</Link>.</p>
    </section>
  );
}
