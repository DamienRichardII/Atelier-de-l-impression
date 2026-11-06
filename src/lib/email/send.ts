// Envoi d'e-mails transactionnels via l'API Resend (fetch, sans SDK). Ne lève jamais d'erreur : un échec d'e-mail
// ne doit pas bloquer une demande de devis ni une commande payée (il est journalisé).
// ⚠ NON TESTÉ en conditions réelles : nécessite RESEND_API_KEY + un expéditeur d'un domaine vérifié dans Resend (RESEND_FROM).
// Sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte Resend (expéditeur de test onboarding@resend.dev).
const FROM_DEFAULT = "L'Atelier de l'Impression <onboarding@resend.dev>";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendEmail(p: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn(JSON.stringify({ scope: "email", skipped: "RESEND_API_KEY manquante" })); return false; }
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM || FROM_DEFAULT, to: p.to, subject: p.subject, html: p.html, ...(p.replyTo ? { reply_to: p.replyTo } : {}) }),
    });
    if (!res.ok) { console.error(JSON.stringify({ scope: "email", status: res.status, body: (await res.text()).slice(0, 300) })); return false; }
    return true;
  } catch (e) { console.error(JSON.stringify({ scope: "email", error: (e as Error).message })); return false; }
  finally { clearTimeout(t); }
}

export const notifyAddress = () => process.env.QUOTE_NOTIFY_EMAIL || "Atelierprint2.0@gmail.com";

const shell = (title: string, body: string) => `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#000;color:#fff;padding:20px 28px;font-size:13px;letter-spacing:.18em;text-transform:uppercase">L'Atelier de l'Impression</td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 16px;font-size:20px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f5f5f5;font-size:12px;color:#737373">26 ter rue Jules Princet, 93600 Aulnay-sous-Bois</td></tr>
</table></td></tr></table></body></html>`;

export const tpl = { shell };
export const eur = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
