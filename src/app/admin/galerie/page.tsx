import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell, Notice } from "@/components/admin/ui";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { realisationCategories } from "@/config/realisations";
import { deleteGalleryPhoto, setGalleryCategory } from "@/app/admin/content-actions";

export const metadata = { title: "Galerie des réalisations" };

async function Gallery({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const db = supabaseAdmin();
  const { data } = db ? await db.from("atelier_gallery").select("id, src, alt, category").order("created_at", { ascending: false }) : { data: [] };
  return (
    <>
      <Notice msg={msg} />
      <h2 className="mb-3 text-lg font-semibold">Ajouter des photos</h2>
      <GalleryUploader categories={realisationCategories} />
      <h2 className="mt-10 mb-3 text-lg font-semibold">Photos publiées ({data?.length ?? 0})</h2>
      {!data?.length && <p className="text-sm text-muted">Aucune photo ajoutée pour l'instant. Elles apparaissent sur la page « Nos réalisations », les plus récentes en premier.</p>}
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(data ?? []).map((r) => (
          <li key={r.id as string} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.src as string} alt={r.alt as string} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="space-y-2 p-3">
              <form action={setGalleryCategory} className="flex gap-2">
                <input type="hidden" name="id" value={r.id as string} />
                <select name="category" defaultValue={r.category as string} className="min-h-10 min-w-0 flex-1 rounded-lg border border-line px-2 text-sm">{realisationCategories.map((c) => <option key={c}>{c}</option>)}</select>
                <button className="rounded-lg border border-line px-3 text-sm">OK</button>
              </form>
              <form action={deleteGalleryPhoto}><input type="hidden" name="id" value={r.id as string} /><button className="min-h-10 w-full rounded-lg border border-line text-sm text-red-700 hover:border-red-700">Retirer</button></form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return <AdminShell title="Galerie des réalisations"><Suspense fallback={<p className="text-muted">Chargement…</p>}><Gallery searchParams={searchParams} /></Suspense></AdminShell>;
}
