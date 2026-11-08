import Link from "next/link";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin/session";
import { logout } from "@/app/admin/actions";

export const eur = (cents: number | null | undefined) => cents == null ? "—" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
export const dt = (d: string | null | undefined) => d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(d)) : "—";

const TONE: Record<string, string> = {
  ok: "bg-green-100 text-green-800", warn: "bg-amber-100 text-amber-800", bad: "bg-red-100 text-red-800", neutral: "bg-mist text-ink",
};
export function Badge({ tone = "neutral", children }: { tone?: keyof typeof TONE; children: React.ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONE[tone]}`}>{children}</span>;
}
export const payTone = (s: string) => (s === "paid" ? "ok" : s === "pending" ? "warn" : "bad") as "ok" | "warn" | "bad";
export const payLabel = (s: string) => ({ paid: "Payée", pending: "En attente", failed: "Échec", expired: "Expirée" } as Record<string, string>)[s] ?? s;
export const mailTone = (s: string) => (s === "sent" ? "ok" : s === "failed" ? "bad" : "warn") as "ok" | "warn" | "bad";
export const mailLabel = (s: string) => ({ sent: "Envoyé", failed: "Échec", skipped: "Non envoyé" } as Record<string, string>)[s] ?? s;
export const KIND_LABEL: Record<string, string> = { confirmation_client: "Confirmation au client", notification_atelier: "Notification à l'atelier", retrait_pret: "Commande prête (client)" };

const MESSAGES: Record<string, [string, "ok" | "bad"]> = {
  ok: ["Enregistré.", "ok"], erreur: ["L'enregistrement a échoué.", "bad"], "prix-invalide": ["Prix invalide.", "bad"],
  "statut-ok": ["Statut mis à jour.", "ok"], "statut-invalide": ["Statut invalide.", "bad"], "non-payee": ["Cette commande n'est pas payée : action impossible.", "bad"],
  "mail-ok": ["E-mail envoyé.", "ok"], "mail-echec": ["L'envoi de l'e-mail a échoué : voir le journal.", "bad"], "type-invalide": ["Type d'e-mail inconnu.", "bad"],
  "inscription-envoyee": ["Si cette adresse est autorisée, un e-mail de confirmation vient d'être envoyé. Ouvrez le lien qu'il contient, puis connectez-vous.", "ok"],
  "compte-confirme": ["Compte confirmé. Vous pouvez vous connecter.", "ok"], "lien-invalide": ["Ce lien est invalide ou expiré. Refaites une demande de création de compte.", "bad"],
  "sync-ok": ["Paiement relu chez SumUp.", "ok"], "sync-echec": ["SumUp n'a pas répondu.", "bad"],
};
export function Notice({ msg, mail }: { msg?: string; mail?: string }) {
  if (!msg) return null;
  let m = MESSAGES[msg];
  const sync = /^sync-(\d+)-(\d+)$/.exec(msg); const retry = /^retry-(\d+)-(\d+)$/.exec(msg); const stale = /^stale-(\d+)$/.exec(msg);
  if (sync) m = [`Catalogue synchronisé : ${sync[1]} produit(s) ajouté(s), ${sync[2]} retiré(s).`, "ok"];
  if (retry) m = [`Relance terminée : ${retry[1]} envoyé(s), ${retry[2]} encore en échec.`, Number(retry[2]) ? "bad" : "ok"];
  if (stale) m = [`${stale[1]} commande(s) abandonnée(s) clôturée(s).`, "ok"];
  if (!m) return null;
  return (
    <p role="status" className={`mb-6 rounded-xl px-4 py-3 text-sm ${m[1] === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
      {m[0]}{mail === "echec" ? " Mais l'e-mail au client n'est pas parti : voir le journal." : mail === "ok" ? " E-mail envoyé au client." : ""}
    </p>
  );
}

const LINKS = [["/admin", "Tableau de bord"], ["/admin/commandes", "Commandes"], ["/admin/logos", "Logos commandes"], ["/admin/produits", "Prix et catalogue"], ["/admin/emails", "E-mails et alertes"]] as const;

async function Nav() {
  const email = await currentAdmin();
  if (!email) return null;
  return (
    <nav aria-label="Administration" className="mb-8 flex flex-wrap items-center gap-2 border-b border-line pb-4">
      {LINKS.map(([href, label]) => <Link key={href} href={href} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-black">{label}</Link>)}
      <span className="ml-auto text-xs text-muted">{email}</span>
      <form action={logout}><button className="rounded-xl border border-line px-4 py-2 text-sm hover:border-black">Déconnexion</button></form>
    </nav>
  );
}
export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Administration</p>
      <h1 className="mt-2 mb-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <Suspense fallback={null}><Nav /></Suspense>
      {children}
    </section>
  );
}
export const th = "px-3 py-2 text-left text-xs uppercase tracking-wider text-muted font-medium";
export const td = "px-3 py-3 text-sm align-top";
