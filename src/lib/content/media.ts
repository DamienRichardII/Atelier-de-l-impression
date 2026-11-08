export const BUCKET = "atelier-site-media";
export const mediaBase = () => `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;
/** Une URL d'image n'est acceptée que si elle pointe vers notre espace média public. */
export const isMediaUrl = (u: unknown): u is string => typeof u === "string" && u.length < 400 && mediaBase().length > 40 && u.startsWith(mediaBase());
