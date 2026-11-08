import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Notice } from "@/components/admin/ui";
import { CoverCard } from "@/components/admin/CoverCard";
import { services } from "@/config/prestations";

export const metadata = { title: "Couvertures des prestations" };

async function Covers({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin();
  const { data } = db ? await db.from("atelier_covers").select("key, src") : { data: [] };
  const covers = Object.fromEntries((data ?? []).map((r) => [r.key as string, r.src as string]));
  return (
    <>
      <Notice msg={msg} />
      <p className="mb-6 max-w-2xl text-sm text-muted">Une photo par section de la page « Nos prestations ». Choisissez la photo : elle est enregistrée et publiée tout de suite. Sans photo, une icône s'affiche.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3"><CoverCard id="banniere" label="Bannière du haut de page" hint="Format large (paysage). Elle s'affiche assombrie derrière le titre." current={covers.banniere} /></div>
        {services.map((s) => <CoverCard key={s.key} id={s.key} label={s.title} hint="Format paysage conseillé." current={covers[s.key]} />)}
      </div>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Couvertures des prestations"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Covers searchParams={searchParams} /></Suspense></AdminShell>;
}
