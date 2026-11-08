import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { itemFiles } from "@/lib/admin/files";
import { AdminShell, dt } from "@/components/admin/ui";

export const metadata = { title: "Logos des commandes" };
type Line = { name: string; color: string; qty: number; assetsId?: string | null };

async function Logos({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const term = q.trim().replace(/[%,()]/g, "").slice(0, 60);
  let query = db.from("atelier_orders").select("reference, status, paid_at, customer, items").eq("payment_status", "paid").order("paid_at", { ascending: false }).limit(25);
  if (term) query = query.or(`reference.ilike.%${term}%,customer->>lastName.ilike.%${term}%,customer->>email.ilike.%${term}%`);
  const { data } = await query;
  const orders = await Promise.all((data ?? []).map(async (o) => {
    const items = (o.items as Line[]) ?? [];
    return { o, items: await Promise.all(items.map(async (l) => ({ l, files: await itemFiles(db, l.assetsId) }))) };
  }));
  return (
    <>
      <p className="mb-4 max-w-2xl text-sm text-muted">Les logos envoyés par les clients, commande par commande (25 dernières commandes payées). Téléchargez le fichier d'origine pour l'impression : l'aperçu n'est qu'une simulation. Les liens sont valables 1 heure.</p>
      <form className="mb-6 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Référence, nom ou e-mail" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm" />
        <button className="btn btn-dark">Rechercher</button>
      </form>
      <div className="space-y-6">
        {orders.map(({ o, items }) => { const c = o.customer as { firstName?: string; lastName?: string }; return (
          <article key={o.reference as string} className="card p-5">
            <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <Link className="font-semibold underline" href={`/admin/commandes/${o.reference}`}>{o.reference as string}</Link>
              <span className="text-sm">{c?.firstName} {c?.lastName}</span>
              <span className="text-xs text-muted">payée {dt(o.paid_at as string)} · {o.status as string}</span>
              {items.some((x) => x.files.length) && <a href={`/admin/logos/zip?ref=${encodeURIComponent(o.reference as string)}`} className="btn btn-light ml-auto !min-h-9 text-sm">Tout télécharger (.zip)</a>}
            </header>
            <div className="space-y-5">
              {items.map(({ l, files }, i) => (
                <div key={i}>
                  <p className="mb-2 text-sm"><strong>{l.name}</strong> — {l.color} · {l.qty} pièce(s)</p>
                  {files.length ? (
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {files.map((f) => (
                        <li key={f.url} className="rounded-2xl border border-line p-3">
                          {f.thumb && f.kind === "logo" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.url} alt={f.label} className="mb-3 h-28 w-full rounded-xl bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] object-contain" />
                          ) : <div className="mb-3 grid h-28 place-items-center rounded-xl bg-mist text-xs text-muted">{f.kind === "logo" ? "Fichier" : "Aperçu"}</div>}
                          <p className="mb-2 text-xs">{f.label}</p>
                          <a href={f.url} download className={f.kind === "logo" ? "btn btn-dark w-full !min-h-10 text-sm" : "btn btn-light w-full !min-h-10 text-sm"}>Télécharger</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-muted">Aucun fichier retrouvé pour cet article.</p>}
                </div>
              ))}
            </div>
          </article>); })}
        {!orders.length && <p className="text-sm text-muted">Aucune commande payée.</p>}
      </div>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <AdminShell title="Logos des commandes"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Logos searchParams={searchParams} /></Suspense></AdminShell>;
}
