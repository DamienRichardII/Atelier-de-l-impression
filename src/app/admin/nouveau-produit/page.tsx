import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { AdminShell, Notice } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { products as base } from "@/config/products";
import { getCustomProducts, getProducts } from "@/lib/content/data";
import { removeProduct } from "@/app/admin/content-actions";

export const metadata = { title: "Ajouter un produit" };

async function Page_({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const all = await getProducts(); const mine = await getCustomProducts();
  const families = [...new Set(all.map((p) => p.family))];
  const templates = base.filter((p) => Object.values(p.faces).some(Boolean)).map((p) => ({ id: p.id, name: p.name }));
  return (
    <>
      <Notice msg={msg} />
      <ProductForm families={families} templates={templates} />
      <h2 className="mt-10 mb-3 text-lg font-semibold">Produits ajoutés par l'atelier ({mine.length})</h2>
      {!mine.length && <p className="text-sm text-muted">Aucun pour l'instant. Les prix se modifient ensuite dans « Prix et catalogue ».</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((p) => (
          <li key={p.id} className="card flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.colors[0]?.photos?.front ?? Object.values(p.colors[0]?.photos ?? {})[0]} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-mist object-contain" />
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name}</p><p className="truncate text-xs text-muted">{p.family} · {p.colors.length} couleur(s)</p></div>
            <form action={removeProduct}><input type="hidden" name="id" value={p.id} /><button className="min-h-10 rounded-lg border border-line px-3 text-sm text-red-700 hover:border-red-700">Retirer</button></form>
          </li>
        ))}
      </ul>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Ajouter un produit"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Page_ searchParams={searchParams} /></Suspense></AdminShell>;
}
