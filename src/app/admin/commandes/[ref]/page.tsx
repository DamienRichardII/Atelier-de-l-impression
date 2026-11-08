import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Badge, Notice, KIND_LABEL, mailLabel, mailTone, payLabel, payTone, eur, dt } from "@/components/admin/ui";
import { itemFiles } from "@/lib/admin/files";
import { ORDER_STATUSES } from "@/lib/admin/statuses";
import { resendEmail, resyncPayment, setOrderStatus } from "@/app/admin/actions";

type Line = { name: string; color: string; qty: number; line_cents: number; sizes: Record<string, number>; assetsId?: string | null };

async function Detail({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ msg?: string; mail?: string }> }) {
  await requireAdmin();
  const { ref } = await params; const { msg, mail } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const { data: o } = await db.from("atelier_orders").select("*").eq("reference", ref).maybeSingle();
  if (!o) notFound();
  const [ev, lg] = await Promise.all([
    db.from("atelier_order_events").select("status, note, actor, created_at").eq("order_id", o.id).order("created_at", { ascending: false }),
    db.from("atelier_email_log").select("kind, recipient, status, error, provider_id, created_at").eq("order_id", o.id).order("created_at", { ascending: false }),
  ]);
  const c = o.customer as { firstName: string; lastName: string; email: string; phone: string };
  const items = (o.items as Line[]) ?? [];
  const files = await Promise.all(items.map((l) => itemFiles(db, l.assetsId)));
  const paid = o.payment_status === "paid";
  const btn = "rounded-xl border border-line px-3 py-2 text-sm hover:border-black";
  return (
    <>
      <Notice msg={msg} mail={mail} />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">{o.reference}</h2>
        <Badge tone={payTone(o.payment_status)}>{payLabel(o.payment_status)}</Badge>
        <span className="text-sm text-muted">Statut : {o.status} · créée {dt(o.created_at)}{o.paid_at ? ` · payée ${dt(o.paid_at)}` : ""}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Client</h3>
          <p className="text-sm">{c.firstName} {c.lastName}<br /><a className="underline" href={`mailto:${c.email}`}>{c.email}</a><br /><a className="underline" href={`tel:${c.phone}`}>{c.phone}</a></p>
          <h3 className="mt-6 mb-3 font-semibold">Articles</h3>
          <ul className="space-y-2 text-sm">
            {items.map((l, i) => <li key={i}><strong>{l.name}</strong> — {l.color}<br /><span className="text-muted">{Object.entries(l.sizes ?? {}).map(([s, n]) => `${s} × ${n}`).join(", ")} · {l.qty} pièce(s) · {eur(l.line_cents)}</span>
              <span className="mt-2 flex flex-wrap gap-2">
                {files[i].map((f) => <a key={f.url} href={f.url} download className="rounded-xl border border-line px-3 py-1.5 text-xs hover:border-black">Télécharger : {f.label}</a>)}
                {!files[i].length && <span className="text-xs text-muted">Aucun fichier retrouvé pour cet article.</span>}
              </span></li>)}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-sm font-semibold">Total : {eur(o.total_cents)}</p>
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Suivi de la commande</h3>
            {paid ? (
              <form action={setOrderStatus} className="space-y-3">
                <input type="hidden" name="ref" value={o.reference} />
                <select name="status" defaultValue={o.status} className="w-full rounded-xl border border-line px-3 py-2 text-sm">{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <input name="note" maxLength={500} placeholder="Note interne (facultatif)" className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" /> Prévenir le client par e-mail si « prête pour le retrait »</label>
                <button className="btn btn-dark">Enregistrer</button>
              </form>
            ) : <p className="text-sm text-muted">Le suivi n'est disponible que pour les commandes payées.</p>}
            <form action={resyncPayment} className="mt-4"><input type="hidden" name="ref" value={o.reference} /><button className={btn}>Relire le paiement chez SumUp</button></form>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Renvoyer un e-mail</h3>
            {paid ? <div className="flex flex-wrap gap-2">
              {["confirmation_client", "notification_atelier", "retrait_pret"].map((k) => (
                <form key={k} action={resendEmail}><input type="hidden" name="ref" value={o.reference} /><input type="hidden" name="kind" value={k} /><button className={btn}>{KIND_LABEL[k]}</button></form>))}
            </div> : <p className="text-sm text-muted">Disponible après paiement.</p>}
            <ul className="mt-4 space-y-2 text-sm">
              {(lg.data ?? []).map((l, i) => <li key={i}><Badge tone={mailTone(l.status)}>{mailLabel(l.status)}</Badge> {KIND_LABEL[l.kind] ?? l.kind} → {l.recipient}<br /><span className="text-xs text-muted">{dt(l.created_at)}{l.provider_id ? ` · réf. ${l.provider_id}` : ""}{l.error ? ` · ${l.error}` : ""}</span></li>)}
              {!lg.data?.length && <li className="text-muted">Aucun e-mail enregistré pour cette commande.</li>}
            </ul>
          </div>
        </div>
      </div>
      <h3 className="mt-8 mb-3 font-semibold">Historique</h3>
      <ul className="space-y-2 text-sm">
        {(ev.data ?? []).map((e, i) => <li key={i} className="card px-4 py-3"><strong>{e.status}</strong>{e.note ? ` — ${e.note}` : ""}<span className="ml-2 text-xs text-muted">{dt(e.created_at)} · {e.actor}</span></li>)}
        {!ev.data?.length && <li className="text-muted">Aucun événement.</li>}
      </ul>
    </>
  );
}
export default function Page(props: { params: Promise<{ ref: string }>; searchParams: Promise<{ msg?: string; mail?: string }> }) {
  return <AdminShell title="Commande"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Detail {...props} /></Suspense></AdminShell>;
}
