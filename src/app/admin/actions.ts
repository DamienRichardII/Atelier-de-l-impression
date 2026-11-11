"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { clearSession, requireAdmin, setSession } from "@/lib/admin/session";
import { rateLimit } from "@/lib/rate-limit";
import { syncOrderByReference } from "@/lib/payments/sync";
import { deliver } from "@/lib/email/log";
import { orderPaidMails, pickupMail, type OrderForMail } from "@/lib/email/messages";
import { confirmLink, readConfirmToken } from "@/lib/admin/confirm";
import { readResetToken, resetLink } from "@/lib/admin/reset";
import { esc, tpl } from "@/lib/email/send";
import { ORDER_STATUSES } from "@/lib/admin/statuses";
import { getProducts } from "@/lib/content/data";


export async function login(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`admin-login:${ip}`, 8)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = supabaseAdmin();
  if (!url || !key || !db) return { error: "Service non configuré." };
  const bad = { error: "Identifiants incorrects ou accès non autorisé." };
  if (!email || !password) return bad;
  const { data: allowed } = await db.from("atelier_admin_emails").select("email").eq("email", email).maybeSingle();
  if (!allowed) return bad;
  // Vérification du mot de passe par Supabase Auth ; la session Supabase obtenue est aussitôt abandonnée.
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await auth.auth.signInWithPassword({ email, password });
  if (error) return /confirm/i.test(error.message) ? { error: "Adresse e-mail non confirmée : ouvrez le lien reçu par e-mail." } : bad;
  await setSession(email);
  redirect("/admin");
}

/** Création d'un compte administrateur : réservée aux adresses de la liste d'accès ; confirmation par e-mail, lien vers le site (jamais vers Supabase). */
export async function signup(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`admin-signup:${ip}`, 5)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? ""); const again = String(fd.get("again") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (password.length < 10) return { error: "Le mot de passe doit contenir au moins 10 caractères." };
  if (password !== again) return { error: "Les deux mots de passe ne correspondent pas." };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = supabaseAdmin();
  if (!url || !key || !db) return { error: "Service non configuré." };
  // Réponse identique que l'adresse soit autorisée ou non : on ne révèle pas qui a accès.
  const { data: allowed } = await db.from("atelier_admin_emails").select("email").eq("email", email).maybeSingle();
  if (allowed) {
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    let send = false;
    const { error } = await auth.auth.admin.createUser({ email, password, email_confirm: false });
    if (!error) send = true;
    else {
      // Compte déjà existant : on renvoie le lien seulement s'il n'est pas encore confirmé, sans toucher au mot de passe.
      const { data: list } = await auth.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const u = list?.users.find((x) => x.email?.toLowerCase() === email);
      if (u && !u.email_confirmed_at) send = true;
    }
    if (send) {
      const link = confirmLink(email);
      await deliver(db, null, {
        kind: "admin_confirmation", to: email, subject: "Confirmez votre compte administrateur — L'Atelier de l'Impression",
        html: tpl.shell("Confirmez votre compte", `<p style="font-size:14px;line-height:1.6">Un compte administrateur a été demandé pour <strong>${esc(email)}</strong>. Pour l'activer, confirmez votre adresse e-mail :</p><p style="margin:20px 0"><a href="${link}" style="background:#000;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-size:14px">Confirmer mon compte</a></p><p style="font-size:12px;color:#737373">Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`),
      });
    }
  }
  redirect("/admin/connexion?msg=inscription-envoyee");
}

/** Mot de passe oublié : envoie un lien de réinitialisation (valable 1 h) aux adresses autorisées. Réponse identique dans tous les cas. */
export async function forgotPassword(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`admin-forgot:${ip}`, 5)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; const db = supabaseAdmin();
  if (!url || !key || !db) return { error: "Service non configuré." };
  const { data: allowed } = await db.from("atelier_admin_emails").select("email").eq("email", email).maybeSingle();
  if (allowed) {
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: list } = await auth.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const u = list?.users.find((x) => x.email?.toLowerCase() === email);
    if (u) {
      const link = resetLink(email, u.updated_at ?? "");
      await deliver(db, null, {
        kind: "admin_reset", to: email, subject: "Réinitialisation de votre mot de passe — L'Atelier de l'Impression",
        html: tpl.shell("Nouveau mot de passe", `<p style="font-size:14px;line-height:1.6">Vous avez demandé à réinitialiser le mot de passe de l'administration pour <strong>${esc(email)}</strong>.</p><p style="margin:20px 0"><a href="${link}" style="background:#000;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-size:14px">Choisir un nouveau mot de passe</a></p><p style="font-size:12px;color:#737373">Ce lien est valable 1 heure et ne peut servir qu'une fois. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste valable.</p>`),
      });
    }
  }
  redirect("/admin/connexion?msg=reset-envoye");
}

/** Enregistre le nouveau mot de passe depuis le lien reçu par e-mail. */
export async function resetPassword(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`admin-reset:${ip}`, 8)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const tok = readResetToken(String(fd.get("t") ?? ""));
  const password = String(fd.get("password") ?? ""); const again = String(fd.get("again") ?? "");
  if (password.length < 10) return { error: "Le mot de passe doit contenir au moins 10 caractères." };
  if (password !== again) return { error: "Les deux mots de passe ne correspondent pas." };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; const db = supabaseAdmin();
  if (!tok || !url || !key || !db) redirect("/admin/connexion?msg=lien-invalide");
  const { data: allowed } = await db.from("atelier_admin_emails").select("email").eq("email", tok.email).maybeSingle();
  if (!allowed) redirect("/admin/connexion?msg=lien-invalide");
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: list } = await auth.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const u = list?.users.find((x) => x.email?.toLowerCase() === tok.email);
  if (!u || (u.updated_at ?? "") !== tok.version) redirect("/admin/connexion?msg=lien-invalide"); // lien déjà utilisé
  const { error } = await auth.auth.admin.updateUserById(u.id, { password, email_confirm: true });
  if (error) return { error: "Mot de passe refusé : choisissez-en un plus solide." };
  redirect("/admin/connexion?msg=mdp-modifie");
}

/** Confirmation du compte depuis le lien reçu par e-mail (bouton, pour résister aux scanners de liens). */
export async function confirmAccount(fd: FormData) {
  const email = readConfirmToken(String(fd.get("t") ?? ""));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; const db = supabaseAdmin();
  if (!email || !url || !key || !db) redirect("/admin/connexion?msg=lien-invalide");
  const { data: allowed } = await db.from("atelier_admin_emails").select("email").eq("email", email).maybeSingle();
  if (!allowed) redirect("/admin/connexion?msg=lien-invalide");
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: list } = await auth.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const u = list?.users.find((x) => x.email?.toLowerCase() === email);
  if (!u) redirect("/admin/connexion?msg=lien-invalide");
  const { error } = await auth.auth.admin.updateUserById(u.id, { email_confirm: true });
  redirect(`/admin/connexion?msg=${error ? "lien-invalide" : "compte-confirme"}`);
}

export async function logout() { await clearSession(); redirect("/admin/connexion"); }

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", ".").trim());

export async function saveProduct(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const id = String(fd.get("id") ?? "");
  const raw = String(fd.get("price") ?? "").trim();
  const euros = raw === "" ? null : num(fd.get("price"));
  if (euros !== null && (!Number.isFinite(euros) || euros < 0 || euros > 100000)) redirect("/admin/produits?msg=prix-invalide");
  const price_cents = euros === null || euros === 0 ? null : Math.round(euros * 100);
  const rawBoth = String(fd.get("priceBoth") ?? "").trim();
  const eurosBoth = rawBoth === "" ? null : num(fd.get("priceBoth"));
  if (eurosBoth !== null && (!Number.isFinite(eurosBoth) || eurosBoth < 0 || eurosBoth > 100000)) redirect("/admin/produits?msg=prix-invalide");
  const price_both_cents = eurosBoth === null || eurosBoth === 0 ? null : Math.round(eurosBoth * 100); // vide = même prix que le recto
  const active = fd.get("active") === "on";
  const purchasable = fd.get("purchasable") === "on" && active && price_cents !== null; // pas d'achat sans prix
  const { error } = await db.from("atelier_products").update({ price_cents, price_both_cents, active, purchasable }).eq("id", id);
  revalidatePath("/admin/produits"); updateTag("site-content"); // le prix affiché sur le site suit la base
  redirect(`/admin/produits?msg=${error ? "erreur" : "ok"}`);
}

/** Applique un prix recto et/ou recto-verso à tous les produits d'une catégorie (champ vide = inchangé). */
export async function saveCategory(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const family = String(fd.get("family") ?? "");
  const catalog = await getProducts();
  const ids = catalog.filter((p) => p.family === family).map((p) => p.id);
  if (!ids.length) redirect("/admin/produits?msg=erreur");
  const patch: Record<string, number> = {};
  for (const [field, col] of [["price", "price_cents"], ["priceBoth", "price_both_cents"]] as const) {
    const raw = String(fd.get(field) ?? "").trim();
    if (raw === "") continue;
    const v = num(fd.get(field));
    if (!Number.isFinite(v) || v <= 0 || v > 100000) redirect("/admin/produits?msg=prix-invalide");
    patch[col] = Math.round(v * 100);
  }
  if (!Object.keys(patch).length) redirect("/admin/produits?msg=prix-invalide");
  const { error } = await db.from("atelier_products").update(patch).in("id", ids);
  if (!error && patch.price_cents) await db.from("atelier_products").update({ purchasable: true }).in("id", ids).eq("active", true);
  revalidatePath("/admin/produits"); updateTag("site-content"); // le prix affiché sur le site suit la base
  redirect(`/admin/produits?msg=${error ? "erreur" : "ok"}`);
}

export async function syncCatalog() {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const catalog = await getProducts();
  const { data } = await db.from("atelier_products").select("id");
  const have = new Set((data ?? []).map((r) => r.id as string));
  const missing = catalog.filter((p) => !have.has(p.id)).map((p) => ({ id: p.id, name: p.name, category: "textile", purchasable: false, active: true }));
  if (missing.length) await db.from("atelier_products").insert(missing);
  const known = new Set(catalog.map((p) => p.id));
  const stale = [...have].filter((id) => !known.has(id));
  if (stale.length) await db.from("atelier_products").update({ active: false, purchasable: false }).in("id", stale);
  revalidatePath("/admin/produits"); updateTag("site-content");
  redirect(`/admin/produits?msg=sync-${missing.length}-${stale.length}`);
}

async function loadOrder(db: NonNullable<ReturnType<typeof supabaseAdmin>>, ref: string) {
  const { data } = await db.from("atelier_orders").select("id, reference, total_cents, customer, items, payment_status, status").eq("reference", ref).maybeSingle();
  return data as (OrderForMail & { id: string; payment_status: string; status: string }) | null;
}

export async function setOrderStatus(fd: FormData) {
  const admin = await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const ref = String(fd.get("ref") ?? ""); const status = String(fd.get("status") ?? ""); const note = String(fd.get("note") ?? "").trim().slice(0, 500);
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) redirect(`/admin/commandes/${ref}?msg=statut-invalide`);
  const o = await loadOrder(db, ref); if (!o) redirect("/admin/commandes");
  if (o.payment_status !== "paid") redirect(`/admin/commandes/${ref}?msg=non-payee`); // on ne gère le suivi que des commandes payées
  await db.from("atelier_orders").update({ status }).eq("id", o.id);
  await db.from("atelier_order_events").insert({ order_id: o.id, status, note: note || null, actor: admin });
  let mailMsg = "";
  if (status === "prête pour le retrait" && fd.get("notify") === "on") {
    const r = await deliver(db, o.id, pickupMail(o));
    mailMsg = r.ok ? "&mail=ok" : "&mail=echec";
  }
  revalidatePath(`/admin/commandes/${ref}`);
  redirect(`/admin/commandes/${ref}?msg=statut-ok${mailMsg}`);
}

export async function resendEmail(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const ref = String(fd.get("ref") ?? ""); const kind = String(fd.get("kind") ?? "");
  const o = await loadOrder(db, ref); if (!o) redirect("/admin/commandes");
  if (o.payment_status !== "paid") redirect(`/admin/commandes/${ref}?msg=non-payee`);
  const mail = kind === "retrait_pret" ? pickupMail(o) : orderPaidMails(o).find((m) => m.kind === kind);
  if (!mail) redirect(`/admin/commandes/${ref}?msg=type-invalide`);
  const r = await deliver(db, o.id, mail);
  revalidatePath("/admin/emails");
  redirect(`/admin/commandes/${ref}?msg=mail-${r.ok ? "ok" : "echec"}`);
}

export async function resyncPayment(fd: FormData) {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const ref = String(fd.get("ref") ?? "");
  try { await syncOrderByReference(db, ref); } catch { redirect(`/admin/commandes/${ref}?msg=sync-echec`); }
  revalidatePath(`/admin/commandes/${ref}`);
  redirect(`/admin/commandes/${ref}?msg=sync-ok`);
}

/** Renvoie tous les e-mails en échec (dernier essai de chaque commande/type), un seul essai par e-mail. */
export async function retryFailedEmails() {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const { data: logs } = await db.from("atelier_email_log").select("order_id, kind, status, created_at").not("order_id", "is", null).order("created_at", { ascending: false }).limit(500);
  const last = new Map<string, string>();
  for (const l of logs ?? []) { const k = `${l.order_id}|${l.kind}`; if (!last.has(k)) last.set(k, l.status as string); }
  let ok = 0, ko = 0;
  for (const [k, st] of last) {
    if (st === "sent") continue;
    const [orderId, kind] = k.split("|");
    const { data: ord } = await db.from("atelier_orders").select("reference").eq("id", orderId).maybeSingle();
    if (!ord) continue;
    const o = await loadOrder(db, ord.reference as string); if (!o || o.payment_status !== "paid") continue;
    const mail = kind === "retrait_pret" ? pickupMail(o) : orderPaidMails(o).find((m) => m.kind === kind);
    if (!mail) continue;
    (await deliver(db, o.id, mail)).ok ? ok++ : ko++;
  }
  revalidatePath("/admin/emails");
  redirect(`/admin/emails?msg=retry-${ok}-${ko}`);
}

/** Passe en « annulée » les commandes jamais payées après 24 h (checkout SumUp abandonné). */
export async function closeStalePending() {
  await requireAdmin(); const db = supabaseAdmin(); if (!db) return;
  const limit = new Date(Date.now() - 24 * 3600_000).toISOString();
  // Avant de clore, on relit chez SumUp : un client qui a payé en retard ne doit pas être annulé.
  const { data: stale } = await db.from("atelier_orders").select("reference").eq("payment_status", "pending").lt("created_at", limit);
  for (const o of stale ?? []) { try { await syncOrderByReference(db, o.reference as string); } catch { /* SumUp injoignable : on laisse en attente */ } }
  const { data } = await db.from("atelier_orders").update({ status: "annulée", payment_status: "expired" }).eq("payment_status", "pending").lt("created_at", limit).select("id");
  revalidatePath("/admin");
  redirect(`/admin?msg=stale-${data?.length ?? 0}`);
}
