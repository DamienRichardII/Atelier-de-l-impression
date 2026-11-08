import type { SupabaseClient } from "@supabase/supabase-js";

/** Nombre de faces personnalisées d'un article, lu dans les fichiers réellement déposés (jamais déclaré par le navigateur). 2 faces ou plus = recto-verso. */
export async function sidesOf(db: SupabaseClient, assetsId: string | null): Promise<1 | 2> {
  if (!assetsId) return 1;
  const { data } = await db.storage.from("atelier-quote-files").list(`cart/${assetsId}`);
  const faces = new Set((data ?? []).map((f) => /^logo_([a-z-]+)-/.exec(f.name)?.[1]).filter(Boolean));
  return faces.size >= 2 ? 2 : 1;
}
