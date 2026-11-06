import { createClient } from "@supabase/supabase-js";

/** Client service-role : UNIQUEMENT côté serveur. Ne jamais importer dans un composant client. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
