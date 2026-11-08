import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Notice, th, td } from "@/components/admin/ui";
import { saveCategory, saveProduct, syncCatalog } from "@/app/admin/actions";
import { getProducts } from "@/lib/content/data";

export const metadata = { title: "Prix et catalogue" };
const field = "w-24 rounded-lg border border-line px-2 py-1.5 text-sm";
const btn = "rounded-xl border border-line px-3 py-1.5 text-sm hover:border-black";
const euros = (c: number | null) => (c ? String(c / 100) : "");

async function Products({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin(); if (!db) return <p>Base non configurée.</p>;
  const { data } = await db.from("atelier_products").select("id, name, price_cents, price_both_cents, active, purchasable");
  const catalog = await getProducts();
  const rows = new Map((data ?? []).map((r) => [r.id as string, r]));
  const families = [...new Set(catalog.map((p) => p.family))];
  return (
    <>
      <Notice msg={msg} />
      <p className="mb-6 max-w-3xl text-sm text-muted">
        Chaque produit a un <strong>prix recto</strong> (une seule face personnalisée) et un <strong>prix recto-verso</strong> (deux faces ou plus). Si le prix recto-verso est vide, le prix recto s'applique dans les deux cas.
        Un produit n'est achetable en ligne que s'il est actif, a un prix et que « Achat en ligne » est coché. Prix TTC par pièce, en euros.
      </p>
      <div className="space-y-8">
        {families.map((family) => {
          const items = catalog.filter((p) => p.family === family).map((p) => ({ cfg: p, row: rows.get(p.id) })).filter((x) => x.row);
          if (!items.length) return null;
          return (
            <section key={family} className="card p-5">
              <header className="mb-4 flex flex-wrap items-end gap-3">
                <h2 className="mr-auto text-lg font-semibold">{family}</h2>
                <form action={saveCategory} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="family" value={family} />
                  <label className="text-xs text-muted">Recto (€)<input name="price" inputMode="decimal" placeholder="inchangé" className={`${field} mt-1 block`} /></label>
                  <label className="text-xs text-muted">Recto-verso (€)<input name="priceBoth" inputMode="decimal" placeholder="inchangé" className={`${field} mt-1 block`} /></label>
                  <button className="btn btn-dark !min-h-9 text-sm">Appliquer à toute la catégorie</button>
                </form>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]"><thead><tr><th className={th}>Produit</th><th className={th}>Recto (€)</th><th className={th}>Recto-verso (€)</th><th className={th}>Actif</th><th className={th}>Achat en ligne</th><th className={th}></th></tr></thead>
                  <tbody>{items.map(({ cfg, row }) => { const f = `f-${cfg.id}`; return (
                    <tr key={cfg.id} className="border-t border-line">
                      <td className={td}><strong>{cfg.name}</strong></td>
                      <td className={td}><input form={f} name="price" inputMode="decimal" defaultValue={euros(row!.price_cents as number | null)} placeholder="—" className={field} /></td>
                      <td className={td}><input form={f} name="priceBoth" inputMode="decimal" defaultValue={euros(row!.price_both_cents as number | null)} placeholder="= recto" className={field} /></td>
                      <td className={td}><input form={f} type="checkbox" name="active" defaultChecked={row!.active as boolean} aria-label="Actif" /></td>
                      <td className={td}><input form={f} type="checkbox" name="purchasable" defaultChecked={row!.purchasable as boolean} aria-label="Achat en ligne" /></td>
                      <td className={td}><form id={f} action={saveProduct}><input type="hidden" name="id" value={cfg.id} /><button className={btn}>Enregistrer</button></form></td>
                    </tr>); })}</tbody></table>
              </div>
            </section>);
        })}
      </div>
      <form action={syncCatalog} className="mt-6"><button className="rounded-xl border border-line px-4 py-2 text-sm hover:border-black">Synchroniser avec le catalogue du site</button>
        <span className="ml-3 text-xs text-muted">Ajoute les nouveaux produits (sans prix) et retire ceux qui n'existent plus.</span></form>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Prix et catalogue"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Products searchParams={searchParams} /></Suspense></AdminShell>;
}
