import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Notice, th, td } from "@/components/admin/ui";
import { saveProduct, syncCatalog } from "@/app/admin/actions";

export const metadata = { title: "Prix et catalogue" };

async function Products({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const { data } = await db.from("atelier_products").select("id, name, price_cents, active, purchasable").order("name");
  return (
    <>
      <Notice msg={msg} />
      <p className="mb-4 max-w-2xl text-sm text-muted">Un produit n'est achetable en ligne que s'il est actif, a un prix et que « Achat en ligne » est coché. Sinon le client demande un devis. Prix TTC par pièce, en euros.</p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]"><thead><tr><th className={th}>Produit</th><th className={th}>Prix (€)</th><th className={th}>Actif</th><th className={th}>Achat en ligne</th><th className={th}></th></tr></thead>
          <tbody>{(data ?? []).map((p) => { const f = `f-${p.id}`; return (
            <tr key={p.id as string} className="border-t border-line">
              <td className={td}><strong>{p.name as string}</strong><br /><span className="text-xs text-muted">{p.id as string}</span></td>
              <td className={td}><input form={f} name="price" inputMode="decimal" defaultValue={p.price_cents ? String((p.price_cents as number) / 100) : ""} placeholder="—" className="w-24 rounded-lg border border-line px-2 py-1.5 text-sm" /></td>
              <td className={td}><input form={f} type="checkbox" name="active" defaultChecked={p.active as boolean} aria-label="Actif" /></td>
              <td className={td}><input form={f} type="checkbox" name="purchasable" defaultChecked={p.purchasable as boolean} aria-label="Achat en ligne" /></td>
              <td className={td}><form id={f} action={saveProduct}><input type="hidden" name="id" value={p.id as string} /><button className="rounded-xl border border-line px-3 py-1.5 text-sm hover:border-black">Enregistrer</button></form></td>
            </tr>); })}</tbody></table>
      </div>
      <form action={syncCatalog} className="mt-6"><button className="rounded-xl border border-line px-4 py-2 text-sm hover:border-black">Synchroniser avec le catalogue du site</button>
        <span className="ml-3 text-xs text-muted">Ajoute les nouveaux produits (sans prix) et retire ceux qui n'existent plus.</span></form>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Prix et catalogue"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Products searchParams={searchParams} /></Suspense></AdminShell>;
}
