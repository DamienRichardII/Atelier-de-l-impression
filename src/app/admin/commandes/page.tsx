import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Badge, payLabel, payTone, eur, dt, th, td } from "@/components/admin/ui";
import { ORDER_STATUSES } from "@/lib/admin/statuses";

export const metadata = { title: "Commandes" };
const FILTERS = [["", "Toutes"], ["paid", "Payées"], ["pending", "En attente"], ["failed", "Échec"], ["expired", "Expirées"]] as const;

async function List({ searchParams }: { searchParams: Promise<{ p?: string; s?: string; q?: string }> }) {
  await requireAdmin();
  const { p = "", s = "", q = "" } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  let query = db.from("atelier_orders").select("reference, status, payment_status, total_cents, created_at, customer").order("created_at", { ascending: false }).limit(200);
  if (["paid", "pending", "failed", "expired"].includes(p)) query = query.eq("payment_status", p);
  if ((ORDER_STATUSES as readonly string[]).includes(s)) query = query.eq("status", s);
  const term = q.trim().replace(/[%,()]/g, "").slice(0, 60);
  if (term) query = query.or(`reference.ilike.%${term}%,customer->>email.ilike.%${term}%,customer->>lastName.ilike.%${term}%`);
  const { data } = await query;
  return (
    <>
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Référence, e-mail ou nom" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm" />
        <select name="p" defaultValue={p} className="rounded-xl border border-line px-3 py-2 text-sm">{FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select name="s" defaultValue={s} className="rounded-xl border border-line px-3 py-2 text-sm"><option value="">Tous statuts</option>{ORDER_STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
        <button className="btn btn-dark">Filtrer</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px]"><thead><tr><th className={th}>Référence</th><th className={th}>Client</th><th className={th}>Total</th><th className={th}>Paiement</th><th className={th}>Statut</th><th className={th}>Date</th></tr></thead>
          <tbody>{(data ?? []).map((o) => { const c = o.customer as { firstName?: string; lastName?: string; email?: string }; return (
            <tr key={o.reference as string} className="border-t border-line">
              <td className={td}><Link className="font-medium underline" href={`/admin/commandes/${o.reference}`}>{o.reference as string}</Link></td>
              <td className={td}>{c?.firstName} {c?.lastName}<br /><span className="text-xs text-muted">{c?.email}</span></td>
              <td className={td}>{eur(o.total_cents as number)}</td>
              <td className={td}><Badge tone={payTone(o.payment_status as string)}>{payLabel(o.payment_status as string)}</Badge></td>
              <td className={td}>{o.status as string}</td>
              <td className={`${td} text-muted`}>{dt(o.created_at as string)}</td>
            </tr>); })}
            {!data?.length && <tr><td className={`${td} text-muted`} colSpan={6}>Aucune commande.</td></tr>}</tbody></table>
      </div>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ p?: string; s?: string; q?: string }> }) {
  return <AdminShell title="Commandes"><Suspense fallback={<p className="text-muted">Chargement…</p>}><List searchParams={searchParams} /></Suspense></AdminShell>;
}
