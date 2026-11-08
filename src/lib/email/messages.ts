import type { SupabaseClient } from "@supabase/supabase-js";
import { esc, eur, notifyAddress, sendEmail, tpl } from "./send";
import { deliver, type Mail } from "./log";
import { siteUrl } from "@/lib/admin/confirm";

const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#737373;font-size:13px;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;font-size:14px">${v}</td></tr>`;
const table = (rows: string) => `<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>`;

interface Line { name: string; color: string; sizes: Record<string, number>; qty: number; unit_cents: number; line_cents: number; sides?: number }
export interface OrderForMail { reference: string; total_cents: number; customer: { firstName: string; lastName: string; email: string; phone: string }; items: Line[] }

const orderBody = (o: OrderForMail) => {
  const lines = o.items.map((l) => row(`${l.name} — ${l.color}${l.sides ? (l.sides === 2 ? " (recto-verso)" : " (recto)") : ""}`, `${esc(Object.entries(l.sizes).map(([s, n]) => `${s} × ${n}`).join(", "))} · ${l.qty} pièce(s) · ${eur(l.line_cents)}`)).join("");
  return table(row("Référence", `<strong>${esc(o.reference)}</strong>`) + lines + row("Total payé", `<strong>${eur(o.total_cents)}</strong>`));
};

/** Les deux e-mails d'une commande payée : notification atelier + confirmation client. */
export function orderPaidMails(o: OrderForMail): Mail[] {
  const body = orderBody(o);
  return [
    {
      kind: "notification_atelier", to: notifyAddress(), replyTo: o.customer.email, subject: `Commande payée ${o.reference} — ${eur(o.total_cents)}`,
      html: tpl.shell("Nouvelle commande payée", body + `<p style="margin:16px 0 4px;font-size:13px;color:#737373">Client</p>` + table(
        row("Nom", esc(`${o.customer.firstName} ${o.customer.lastName}`)) + row("E-mail", esc(o.customer.email)) + row("Téléphone", esc(o.customer.phone)) + row("Remise", "Retrait à l'atelier"))
        + `<p style="font-size:13px;margin-top:16px">Logo du client et aperçu à télécharger : <a href="${siteUrl()}/admin/commandes/${encodeURIComponent(o.reference)}">ouvrir la commande dans l'administration</a>.</p>`),
    },
    {
      kind: "confirmation_client", to: o.customer.email, subject: `Paiement confirmé — commande ${o.reference}`,
      html: tpl.shell("Paiement confirmé", `<p style="font-size:14px;line-height:1.6">Bonjour ${esc(o.customer.firstName)}, merci pour votre commande. L'atelier vous contactera pour le retrait.</p>${body}`),
    },
  ];
}

/** E-mail « votre commande est prête » (retrait à l'atelier). */
export function pickupMail(o: OrderForMail): Mail {
  return {
    kind: "retrait_pret", to: o.customer.email, subject: `Votre commande ${o.reference} est prête`,
    html: tpl.shell("Votre commande est prête", `<p style="font-size:14px;line-height:1.6">Bonjour ${esc(o.customer.firstName)}, votre commande est prête. Vous pouvez venir la retirer à l'atelier : 26 ter rue Jules Princet, 93600 Aulnay-sous-Bois. Pensez à indiquer votre référence.</p>${orderBody(o)}`),
  };
}

export async function emailOrderPaid(o: OrderForMail, db: SupabaseClient, orderId: string) {
  await Promise.all(orderPaidMails(o).map((m) => deliver(db, orderId, m)));
}
