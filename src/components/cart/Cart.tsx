"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Trash2 } from "lucide-react";
import { cart, itemQty, useCart } from "@/lib/cart/store";
import { eur, unitPrice, usePrices } from "@/lib/cart/usePrices";

const input = "mt-1 w-full min-h-12 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-black";

export function Cart() {
  const items = useCart();
  const pr = usePrices();
  const { ready, enabled, prices } = pr;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const keyRef = useRef<string | null>(null); // une clé par tentative de commande : un double clic ne crée pas deux commandes

  if (items.length === 0) {
    return (
      <div className="card mt-8 p-8 text-center">
        <p className="text-muted">Votre panier est vide.</p>
        <Link href="/personnalisation" className="btn btn-dark mt-4">Personnaliser un produit</Link>
      </div>
    );
  }
  const payable = items.every((i) => prices[i.productId] > 0);
  const unit = (i: (typeof items)[number]) => unitPrice(pr, i.productId, i.sides ?? 1);
  const total = items.reduce((a, i) => a + unit(i) * itemQty(i), 0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setErr("");
    keyRef.current ??= crypto.randomUUID();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, color: i.color, sizes: i.sizes, assetsId: i.assetsId })),
          customer: { firstName: f.get("firstName"), lastName: f.get("lastName"), email: f.get("email"), phone: f.get("phone") },
          consent: f.get("consent") === "on", website: f.get("website") ?? "", idempotencyKey: keyRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error ?? "Paiement impossible.");
      window.location.assign(data.checkoutUrl);
    } catch (e2) { keyRef.current = null; setErr((e2 as Error).message); setBusy(false); }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.id} className="card flex gap-4 p-4">
            {i.thumb ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.thumb} alt="" className="h-24 w-24 rounded-xl bg-mist object-contain" /> : <div className="h-24 w-24 rounded-xl bg-mist" />}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{i.productName} — {i.color}</p>
              <p className="mt-1 text-sm text-muted">{Object.entries(i.sizes).map(([s, n]) => `${s} × ${n}`).join(" · ")}</p>
              <p className="mt-1 text-sm">{itemQty(i)} pièce(s) · {(i.sides ?? 1) === 2 ? "recto-verso" : "recto"}{prices[i.productId] ? <> · {eur(unit(i))} la pièce · <strong>{eur(unit(i) * itemQty(i))}</strong></> : null}</p>
              {i.hasLogo && <p className="mt-1 text-xs text-muted">Logo et aperçu joints</p>}
            </div>
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line" aria-label="Retirer du panier" onClick={() => cart.remove(i.id)}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="card h-fit p-5 sm:p-6">
        <p className="flex justify-between text-lg font-semibold"><span>Total</span><span>{ready && payable ? eur(total) : "—"}</span></p>
        <p className="mt-1 text-xs text-muted">Retrait à l'atelier, Aulnay-sous-Bois.</p>
        {ready && (!enabled || !payable) ? (
          <div className="mt-5 rounded-2xl border border-line p-4 text-sm">
            Le paiement en ligne n'est pas disponible pour ces articles. <Link href="/contact" className="underline">Contactez l'atelier</Link>.
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">Prénom<input name="firstName" required className={input} autoComplete="given-name" /></label>
              <label className="text-sm">Nom<input name="lastName" required className={input} autoComplete="family-name" /></label>
              <label className="text-sm sm:col-span-2">Email<input name="email" type="email" required className={input} autoComplete="email" /></label>
              <label className="text-sm sm:col-span-2">Téléphone<input name="phone" type="tel" required className={input} autoComplete="tel" /></label>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 accent-black" />
              <span>J'ai lu et j'accepte les <Link href="/cgv" className="underline">conditions générales de vente</Link> et la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</span>
            </label>
            {err && <p role="alert" className="mt-4 text-sm font-medium underline">{err}</p>}
            <button className="btn btn-dark mt-5 w-full" disabled={busy || !ready}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />} Payer {ready ? eur(total) : ""}
            </button>
            <p className="mt-2 text-center text-xs text-muted">Paiement sécurisé par SumUp. Aucune donnée de carte ne transite par ce site.</p>
          </>
        )}
      </form>
    </div>
  );
}
