import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Notice, eur, dt } from "@/components/admin/ui";
import { closeStalePending } from "@/app/admin/actions";

export const metadata = { title: "Administration" };

async function Dashboard({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin();
  if (!db) return <p>Base de données non configurée.</p>;
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const [paid, pending, stale, failed, orders, toPrep, noPrice] = await Promise.all([
    db.from("atelier_orders").select("total_cents", { count: "exact" }).eq("payment_status", "paid"),
    db.from("atelier_orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
    db.from("atelier_orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending").lt("created_at", since),
    db.from("atelier_email_log").select("order_id, kind, status, created_at").order("created_at", { ascending: false }).limit(500),
    db.from("atelier_orders").select("id, reference, status, total_cents, paid_at, customer").eq("payment_status", "paid").order("paid_at", { ascending: false }).limit(200),
    db.from("atelier_orders").select("id", { count: "exact", head: true }).eq("status", "confirmée").eq("payment_status", "paid"),
    db.from("atelier_products").select("id", { count: "exact", head: true }).eq("active", true).is("price_cents", null),
  ]);
  const revenue = (paid.data ?? []).reduce((s, o) => s + (o.total_cents as number), 0);
  // Commandes payées sans confirmation client envoyée
  const sentConf = new Set((failed.data ?? []).filter((l) => l.kind === "confirmation_client" && l.status === "sent").map((l) => l.order_id));
  const missing = (orders.data ?? []).filter((o) => !sentConf.has(o.id));
  // E-mails dont le dernier essai a échoué
  const last = new Map<string, string>();
  for (const l of failed.data ?? []) { const k = `${l.order_id}|${l.kind}`; if (!last.has(k)) last.set(k, l.status as string); }
  const failedMails = [...last.values()].filter((s) => s !== "sent").length;
  const env: [string, boolean][] = [
    ["RESEND_API_KEY", !!process.env.RESEND_API_KEY], ["RESEND_FROM", !!process.env.RESEND_FROM], ["SUMUP_API_KEY", !!process.env.SUMUP_API_KEY],
    ["SUMUP_MERCHANT_CODE", !!process.env.SUMUP_MERCHANT_CODE], ["SUPABASE_SERVICE_ROLE_KEY", !!process.env.SUPABASE_SERVICE_ROLE_KEY], ["NEXT_PUBLIC_SITE_URL", !!process.env.NEXT_PUBLIC_SITE_URL],
  ];
  const kpi: [string, string][] = [["Commandes payées", String(paid.count ?? 0)], ["Chiffre d'affaires", eur(revenue)], ["À préparer", String(toPrep.count ?? 0)], ["Paiements en attente", String(pending.count ?? 0)]];
  return (
    <>
      <Notice msg={msg} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi.map(([l, v]) => <div key={l} className="card p-5"><p className="text-xs uppercase tracking-wider text-muted">{l}</p><p className="mt-2 text-2xl font-semibold">{v}</p></div>)}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Alertes</h2>
      <ul className="space-y-2 text-sm">
        {missing.length > 0 && <li className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{missing.length} commande(s) payée(s) sans e-mail de confirmation client enregistré comme envoyé. <Link className="underline" href="/admin/emails">Voir le journal</Link>{missing.slice(0, 3).map((o) => <span key={o.id}> · <Link className="underline" href={`/admin/commandes/${o.reference}`}>{o.reference as string}</Link></span>)}</li>}
        {failedMails > 0 && <li className="rounded-xl bg-red-50 px-4 py-3 text-red-800">{failedMails} e-mail(s) en échec. <Link className="underline" href="/admin/emails">Relancer</Link></li>}
        {(stale.count ?? 0) > 0 && <li className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-900">{stale.count} paiement(s) abandonné(s) depuis plus de 24 h.
          <form action={closeStalePending}><button className="underline">Clôturer (après vérification SumUp)</button></form></li>}
        {(noPrice.count ?? 0) > 0 && <li className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">{noPrice.count} produit(s) actif(s) sans prix (non achetables en ligne). <Link className="underline" href="/admin/produits">Fixer les prix</Link></li>}
        {env.some(([, ok]) => !ok) && <li className="rounded-xl bg-red-50 px-4 py-3 text-red-800">Configuration manquante : {env.filter(([, ok]) => !ok).map(([n]) => n).join(", ")}.</li>}
        {!missing.length && !failedMails && !(stale.count ?? 0) && !(noPrice.count ?? 0) && env.every(([, ok]) => ok) && <li className="rounded-xl bg-green-50 px-4 py-3 text-green-800">Aucune alerte.</li>}
      </ul>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Dernières commandes payées</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px]"><tbody>
          {(orders.data ?? []).slice(0, 8).map((o) => { const c = o.customer as { firstName?: string; lastName?: string }; return (
            <tr key={o.id} className="border-t border-line first:border-0">
              <td className="px-3 py-3 text-sm"><Link className="font-medium underline" href={`/admin/commandes/${o.reference}`}>{o.reference as string}</Link></td>
              <td className="px-3 py-3 text-sm">{c?.firstName} {c?.lastName}</td>
              <td className="px-3 py-3 text-sm">{eur(o.total_cents as number)}</td>
              <td className="px-3 py-3 text-sm">{o.status as string}</td>
              <td className="px-3 py-3 text-sm text-muted">{dt(o.paid_at as string)}</td>
            </tr>); })}
          {!orders.data?.length && <tr><td className="px-3 py-6 text-sm text-muted">Aucune commande payée.</td></tr>}
        </tbody></table>
      </div>
      <p className="mt-6 text-xs text-muted">Variables de configuration vérifiées côté serveur (présence uniquement, jamais les valeurs).</p>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Tableau de bord"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Dashboard searchParams={searchParams} /></Suspense></AdminShell>;
}
