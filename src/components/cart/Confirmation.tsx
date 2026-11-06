"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cart } from "@/lib/cart/store";
import { eur } from "@/lib/cart/usePrices";

type S = { paymentStatus: string; reference: string; totalCents: number } | { error: string } | null;

export function Confirmation() {
  const sp = useSearchParams();
  const ref = sp.get("ref") ?? ""; const t = sp.get("t") ?? "";
  const [s, setS] = useState<S>(null);
  const tries = useRef(0);

  useEffect(() => {
    let alive = true; let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const r = await fetch(`/api/orders/status?ref=${encodeURIComponent(ref)}&t=${encodeURIComponent(t)}`, { cache: "no-store" });
        const d = await r.json();
        if (!alive) return;
        setS(r.ok ? d : { error: d.error ?? "Commande introuvable." });
        if (r.ok && d.paymentStatus === "paid") cart.clear();
        else if (r.ok && d.paymentStatus === "pending" && tries.current++ < 12) timer = setTimeout(poll, 3000);
      } catch { if (alive) setS({ error: "Impossible de vérifier la commande pour le moment." }); }
    }
    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, [ref, t]);

  if (!s) return <p className="flex items-center gap-2 text-muted"><Loader2 className="animate-spin" size={16} /> Vérification du paiement…</p>;
  if ("error" in s) return <div><h1 className="text-3xl font-semibold">Commande introuvable</h1><p className="mt-3 text-muted">{s.error}</p><Link href="/contact" className="btn btn-light mt-6">Nous contacter</Link></div>;

  if (s.paymentStatus === "paid") return (
    <div>
      <CheckCircle2 size={36} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Paiement confirmé</h1>
      <p className="mt-3 text-muted">Commande <strong className="text-black">{s.reference}</strong> — {eur(s.totalCents)}. Conservez cette référence : l'atelier vous contactera pour le retrait.</p>
      <Link href="/" className="btn btn-dark mt-6">Retour à l'accueil</Link>
    </div>
  );
  if (s.paymentStatus === "pending") return (
    <div>
      <Loader2 className="animate-spin" size={32} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Paiement en cours de vérification</h1>
      <p className="mt-3 text-muted">Commande <strong className="text-black">{s.reference}</strong>. Nous n'avons pas encore reçu la confirmation de SumUp. Ne payez pas une seconde fois : actualisez cette page dans un instant, ou contactez-nous avec votre référence.</p>
    </div>
  );
  return (
    <div>
      <XCircle size={36} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Paiement non abouti</h1>
      <p className="mt-3 text-muted">La commande {s.reference} n'a pas été payée. Aucun montant n'est dû. Votre panier est conservé.</p>
      <Link href="/panier" className="btn btn-dark mt-6">Retourner au panier</Link>
    </div>
  );
}
