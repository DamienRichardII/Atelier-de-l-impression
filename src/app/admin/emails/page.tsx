import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Badge, Notice, KIND_LABEL, mailLabel, mailTone, dt, th, td } from "@/components/admin/ui";
import { retryFailedEmails } from "@/app/admin/actions";

export const metadata = { title: "E-mails et alertes" };

async function Emails({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const { data } = await db.from("atelier_email_log").select("order_id, kind, recipient, status, error, provider_id, created_at, atelier_orders(reference)").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];
  const last = new Map<string, string>();
  for (const l of rows) { const k = `${l.order_id}|${l.kind}`; if (!last.has(k)) last.set(k, l.status as string); }
  const bad = [...last.values()].filter((s) => s !== "sent").length;
  return (
    <>
      <Notice msg={msg} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm">{bad ? <span className="text-red-700">{bad} e-mail(s) dont le dernier essai a échoué.</span> : <span className="text-green-700">Tous les e-mails suivis sont partis.</span>}</p>
        {bad > 0 && <form action={retryFailedEmails}><button className="btn btn-dark">Relancer les e-mails en échec</button></form>}
      </div>
      <p className="mb-4 max-w-2xl text-xs text-muted">« Envoyé » signifie accepté par le service d'envoi. La réception réelle (boîte du client, courrier indésirable) se vérifie auprès du service d'envoi avec l'identifiant indiqué.</p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]"><thead><tr><th className={th}>Date</th><th className={th}>Type</th><th className={th}>Destinataire</th><th className={th}>Commande</th><th className={th}>Statut</th><th className={th}>Détail</th></tr></thead>
          <tbody>{rows.map((l, i) => { const ref = (l.atelier_orders as unknown as { reference?: string } | null)?.reference; return (
            <tr key={i} className="border-t border-line">
              <td className={`${td} text-muted`}>{dt(l.created_at as string)}</td>
              <td className={td}>{KIND_LABEL[l.kind as string] ?? (l.kind as string)}</td>
              <td className={td}>{l.recipient as string}</td>
              <td className={td}>{ref ? <Link className="underline" href={`/admin/commandes/${ref}`}>{ref}</Link> : "—"}</td>
              <td className={td}><Badge tone={mailTone(l.status as string)}>{mailLabel(l.status as string)}</Badge></td>
              <td className={`${td} text-xs text-muted`}>{(l.error as string) || (l.provider_id as string) || ""}</td>
            </tr>); })}
            {!rows.length && <tr><td className={`${td} text-muted`} colSpan={6}>Aucun e-mail enregistré pour l'instant.</td></tr>}</tbody></table>
      </div>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="E-mails et alertes"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Emails searchParams={searchParams} /></Suspense></AdminShell>;
}
