import type { SupabaseClient } from "@supabase/supabase-js";

export type FileLink = { kind: "logo" | "preview"; label: string; url: string; thumb: boolean };
const FACE: Record<string, string> = { front: "avant", back: "dos", side: "côté", "three-quarter": "trois-quarts", left: "gauche", right: "droite" };

/** Fichiers du client (logo(s) + aperçu) d'un article : stockage privé, liens signés valables 1 heure. */
export async function itemFiles(db: SupabaseClient, assetsId?: string | null): Promise<FileLink[]> {
  if (!assetsId || !/^[0-9a-f-]{36}$/.test(assetsId)) return [];
  const dir = `cart/${assetsId}`;
  const bucket = db.storage.from("atelier-quote-files");
  const { data: list } = await bucket.list(dir);
  const out: FileLink[] = [];
  for (const f of list ?? []) {
    const original = f.name.replace(/^(preview|logo_[a-z-]+)-/, "");
    const { data: s } = await bucket.createSignedUrl(`${dir}/${f.name}`, 3600, { download: original });
    if (!s?.signedUrl) continue;
    const m = /^logo_([a-z-]+)-/.exec(f.name);
    out.push({
      kind: m ? "logo" : "preview",
      label: m ? `Logo — face ${FACE[m[1]] ?? m[1]}` : "Aperçu du simulateur",
      url: s.signedUrl, thumb: /\.(png|jpe?g|webp|svg)$/i.test(f.name),
    });
  }
  return out.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "logo" ? -1 : 1));
}
