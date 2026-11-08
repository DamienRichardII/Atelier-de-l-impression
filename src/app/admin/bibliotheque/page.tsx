import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { itemFiles } from "@/lib/admin/files";
import { AdminShell } from "@/components/admin/ui";

export const metadata = { title: "Bibliothèque de logos" };
type Line = { name: string; color: string; assetsId?: string | null };

async function Library({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const term = q.trim().replace(/[%,()]/g, "").slice(0, 60);
  let query = db.from("atelier_orders").select("reference, paid_at, customer, items").eq("payment_status", "paid").order("paid_at", { ascending: false }).limit(40);
  if (term) query = query.or(`reference.ilike.%${term}%,customer->>lastName.ilike.%${term}%,customer->>firstName.ilike.%${term}%,customer->>email.ilike.%${term}%`);
  const { data } = await query;
  const logos = (await Promise.all((data ?? []).map(async (o) => {
    const c = o.customer as { firstName?: string; lastName?: string };
    const items = (o.items as Line[]) ?? [];
    const per = await Promise.all(items.map(async (l) => (await itemFiles(db, l.assetsId)).filter((f) => f.kind === "logo").map((f) => ({ f, ref: o.reference as string, who: `${c?.firstName ?? ""} ${c?.lastName ?? ""}`.trim(), product: `${l.name} — ${l.color}` }))));
    return per.flat();
  }))).flat();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form className="flex min-w-0 flex-1 gap-2" role="search">
          <input name="q" defaultValue={q} placeholder="Client, référence ou e-mail" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm" />
          <button className="btn btn-dark">Rechercher</button>
        </form>
        {logos.length > 0 && <a href="/admin/logos/zip?scope=all" className="btn btn-light">Tout télécharger (.zip)</a>}
      </div>
      <p className="mb-4 max-w-2xl text-sm text-muted">Tous les logos envoyés par les clients (40 dernières commandes payées), du plus récent au plus ancien. L'archive contient les fichiers d'origine, classés par commande. Liens valables 1 heure.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {logos.map(({ f, ref, who, product }) => (
          <li key={f.url} className="card p-3">
            {f.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.label} className="mb-3 h-36 w-full rounded-xl bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] object-contain" />
            ) : <div className="mb-3 grid h-36 place-items-center rounded-xl bg-mist text-xs text-muted">Fichier</div>}
            <p className="truncate text-sm font-medium">{who || "Client"}</p>
            <p className="truncate text-xs text-muted">{product} · {f.label.replace("Logo — ", "")}</p>
            <Link href={`/admin/commandes/${ref}`} className="text-xs underline">{ref}</Link>
            <a href={f.url} download className="btn btn-dark mt-3 w-full !min-h-10 text-sm">Télécharger</a>
          </li>
        ))}
      </ul>
      {!logos.length && <p className="text-sm text-muted">Aucun logo trouvé.</p>}
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <AdminShell title="Bibliothèque de logos"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Library searchParams={searchParams} /></Suspense></AdminShell>;
}
