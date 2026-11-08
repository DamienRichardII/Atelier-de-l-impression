import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmailDetailed } from "./send";

export interface Mail { kind: string; to: string; subject: string; html: string; replyTo?: string }

/** Envoie un e-mail ET en garde la trace (atelier_email_log) : statut, identifiant Resend, erreur éventuelle. */
export async function deliver(db: SupabaseClient, orderId: string | null, m: Mail) {
  const r = await sendEmailDetailed({ to: m.to, subject: m.subject, html: m.html, replyTo: m.replyTo });
  try {
    await db.from("atelier_email_log").insert({
      order_id: orderId, kind: m.kind, recipient: m.to, subject: m.subject,
      status: r.ok ? "sent" : r.skipped ? "skipped" : "failed", provider_id: r.id ?? null, error: r.error ?? null,
    });
  } catch (e) { console.error(JSON.stringify({ scope: "email_log", message: (e as Error).message })); }
  return r;
}
