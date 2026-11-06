import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { quoteSchema, configSchema } from "@/lib/validation/quote";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { emailQuote } from "@/lib/email/messages";
import { sanitizeSvgServer } from "@/lib/customization/svg-server";

const MAX_FILE = 10 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`quote:${ip}`)) return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });

  const form = await req.formData();
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide.", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ reference: "OK" }); // bot : réponse silencieuse

  let config;
  try { config = configSchema.parse(JSON.parse(String(raw.config))); }
  catch { return NextResponse.json({ error: "Configuration invalide." }, { status: 400 }); }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Service d'enregistrement non configuré (Supabase)." }, { status: 503 });

  const reference = `DEV-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const stored: { kind: string; path: string; name: string }[] = [];

  for (const [key, value] of form.entries()) {
    if (typeof value === "string" || !(value instanceof File) || value.size === 0) continue;
    if (value.size > MAX_FILE || !OK_TYPES.includes(value.type)) continue;
    let body: Buffer | string = Buffer.from(await value.arrayBuffer());
    if (value.type === "image/svg+xml") body = sanitizeSvgServer(body.toString("utf8"));
    const safe = value.name.replace(/[^\w.-]/g, "_").slice(0, 80);
    const path = `${reference}/${key}-${safe}`;
    const { error } = await db.storage.from("atelier-quote-files").upload(path, body, { contentType: value.type, upsert: false });
    if (!error) stored.push({ kind: key, path, name: value.name });
  }

  const { firstName, lastName, email, phone, company, customerType, delivery, address, desiredDate, comments } = parsed.data;
  const { error } = await db.from("atelier_quotes").insert({
    reference, first_name: firstName, last_name: lastName, email, phone, company, customer_type: customerType,
    delivery, address, desired_date: desiredDate || null, comments, configuration: config, files: stored, status: "nouvelle",
  });
  if (error) return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });

  // E-mails (atelier + client) : jamais bloquant, journalisé en cas d'échec.
  await emailQuote({ reference, firstName, lastName, email, phone, company, delivery, address, comments, product: config.productId, color: config.color, sizes: config.sizes, filesCount: stored.length }).catch(() => {});
  return NextResponse.json({ reference });
}
