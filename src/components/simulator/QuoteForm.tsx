"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Face, ProductConfig } from "@/config/products";
import type { LogoPlacement } from "@/lib/customization/types";

interface Props {
  product: ProductConfig;
  color: { name: string; hex: string };
  logos: Partial<Record<Face, LogoPlacement>>;
  originals: Partial<Record<Face, File>>;
  snapshot(): string | null;
  preview: string | null;
}

const input = "mt-1 w-full min-h-12 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-black";

export function QuoteForm({ product, color, logos, originals, snapshot }: Props) {
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [ref, setRef] = useState("");
  const total = Object.values(sizes).reduce((a, b) => a + b, 0);
  const hasLogo = Object.keys(logos).length > 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!hasLogo) { setState("error"); setMsg("Ajoutez votre logo dans le simulateur avant d'envoyer la demande."); return; }
    setState("sending"); setMsg("");
    const config = {
      productId: product.id, color: color.name, sizes, quantity: total || Number(form.get("quantity")) || 0,
      faces: Object.fromEntries(Object.entries(logos).map(([f, l]) => [f, { fileName: l!.fileName, cx: l!.cx, cy: l!.cy, scale: l!.scale, rotation: l!.rotation }])),
    };
    form.set("config", JSON.stringify(config));
    const snap = snapshot();
    if (snap) form.set("preview", await (await fetch(snap)).blob(), "apercu.png");
    for (const [face, file] of Object.entries(originals)) if (file) form.append(`logo_${face}`, file, file.name);
    try {
      const res = await fetch("/api/quotes", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'envoi.");
      setRef(data.reference); setState("done");
    } catch (err) { setState("error"); setMsg((err as Error).message); }
  }

  if (state === "done") {
    return (
      <section id="devis" className="card mt-12 p-8 text-center">
        <CheckCircle2 className="mx-auto" size={32} />
        <h2 className="mt-4 text-2xl font-semibold">Demande envoyée</h2>
        <p className="mt-2 text-muted">Votre référence : <strong className="text-black">{ref}</strong>. Un email de confirmation vous est adressé.</p>
      </section>
    );
  }

  return (
    <section id="devis" className="mt-12 scroll-mt-24">
      <p className="eyebrow">06 — Quantités et devis</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Demander un devis</h2>
      <p className="mt-1 text-sm text-muted">Votre configuration (produit, couleur, logo, position, aperçu) est jointe automatiquement.</p>
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="font-medium">Répartition des tailles — {product.name} {color.name}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3">
            {product.sizes.map((s) => (
              <label key={s} className="text-center text-sm">{s}
                <input type="number" min={0} inputMode="numeric" value={sizes[s] ?? ""} placeholder="0"
                  onChange={(e) => setSizes({ ...sizes, [s]: Math.max(0, Number(e.target.value) || 0) })}
                  className="mt-1 h-12 w-full rounded-xl border border-line text-center outline-none focus:border-black" />
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Total : <strong className="text-black">{total}</strong> pièce(s)</p>
          <label className="mt-4 block text-sm">Délai souhaité<input name="desiredDate" type="date" className={input} /></label>
          <label className="mt-4 block text-sm">Commentaires<textarea name="comments" rows={4} className={`${input} py-3`} /></label>
        </div>
        <div className="card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Prénom<input name="firstName" required className={input} autoComplete="given-name" /></label>
            <label className="text-sm">Nom<input name="lastName" required className={input} autoComplete="family-name" /></label>
            <label className="text-sm">Email<input name="email" type="email" required className={input} autoComplete="email" /></label>
            <label className="text-sm">Téléphone<input name="phone" type="tel" required className={input} autoComplete="tel" /></label>
            <label className="text-sm">Entreprise (facultatif)<input name="company" className={input} /></label>
            <label className="text-sm">Type de client
              <select name="customerType" className={input}><option value="particulier">Particulier</option><option value="professionnel">Professionnel</option></select>
            </label>
            <p className="text-sm sm:col-span-2">Remise de la commande<span className="mt-1 block min-h-12 rounded-xl border border-line bg-mist px-4 py-3 text-base">Retrait à l'atelier, Aulnay-sous-Bois</span></p>
            <input type="hidden" name="delivery" value="retrait" />
          </div>
          <label className="mt-4 block text-sm">Fichiers complémentaires (facultatif)<input name="extra" type="file" multiple className="mt-1 block w-full text-sm" /></label>
          {/* Anti-spam : champ piège invisible */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 accent-black" />
            J'accepte que mes données et fichiers soient traités pour répondre à ma demande (politique de confidentialité).
          </label>
          {state === "error" && <p role="alert" className="mt-4 text-sm font-medium underline">{msg}</p>}
          <button className="btn btn-dark mt-6 w-full" disabled={state === "sending"}>
            {state === "sending" ? <Loader2 className="animate-spin" size={16} /> : null} Envoyer ma demande de devis
          </button>
          {!hasLogo && <p className="mt-2 text-center text-xs text-muted">Ajoutez votre logo pour continuer.</p>}
        </div>
      </form>
    </section>
  );
}
