import { currentAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { zipStream, type ZipEntry } from "@/lib/admin/zip";

export const maxDuration = 60;
const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "x";
const MAX_FILES = 150;

type Line = { name: string; color: string; assetsId?: string | null };

/** ?ref=CMD-… : tous les fichiers d'une commande ; ?scope=all : tous les logos des commandes payées (bibliothèque). */
export async function GET(req: Request) {
  if (!(await currentAdmin())) return new Response("Non autorisé", { status: 401 });
  const db = supabaseAdmin(); if (!db) return new Response("Service non configuré", { status: 503 });
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");
  const all = url.searchParams.get("scope") === "all";
  if (!ref && !all) return new Response("Paramètre manquant", { status: 400 });

  let q = db.from("atelier_orders").select("reference, items").eq("payment_status", "paid").order("paid_at", { ascending: false }).limit(ref ? 1 : 100);
  if (ref) q = q.eq("reference", ref);
  const { data: orders } = await q;
  if (!orders?.length) return new Response("Commande introuvable", { status: 404 });

  const bucket = db.storage.from("atelier-quote-files");
  async function* entries(): AsyncGenerator<ZipEntry> {
    let n = 0;
    for (const o of orders ?? []) {
      const items = (o.items as Line[]) ?? [];
      for (let i = 0; i < items.length; i++) {
        const l = items[i];
        if (!l.assetsId || !/^[0-9a-f-]{36}$/.test(l.assetsId)) continue;
        const dir = `cart/${l.assetsId}`;
        const { data: list } = await bucket.list(dir);
        for (const f of list ?? []) {
          const isLogo = f.name.startsWith("logo_");
          if (all && !isLogo) continue; // la bibliothèque ne contient que les logos
          if (n >= MAX_FILES) return;
          const { data: blob } = await bucket.download(`${dir}/${f.name}`);
          if (!blob) continue;
          const m = /^(preview|logo_[a-z-]+)-(.*)$/.exec(f.name);
          const kind = m ? m[1].replace("logo_", "logo-").replace("preview", "apercu") : "fichier";
          const original = safe(m?.[2] ?? f.name);
          n++;
          yield { name: `${o.reference}/${i + 1}-${safe(l.name)}-${safe(l.color)}/${kind}-${original}`, data: new Uint8Array(await blob.arrayBuffer()) };
        }
      }
    }
  }
  return new Response(zipStream(entries()), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${ref ? `logos-${safe(ref)}` : "bibliotheque-logos"}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
