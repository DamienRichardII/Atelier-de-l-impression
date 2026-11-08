"use client";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { prepareImage, uploadImage } from "@/lib/content/image";
import { addGalleryPhotos } from "@/app/admin/content-actions";

const box = "mt-1 w-full min-h-12 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-black";

/** Choix de plusieurs photos d'un coup (galerie du téléphone ou de l'ordinateur), envoyées puis publiées ensemble. */
export function GalleryUploader({ categories }: { categories: readonly string[] }) {
  const ref = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(categories[0]); const [alt, setAlt] = useState("");
  const [urls, setUrls] = useState<string[]>([]); const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [pending, start] = useTransition();

  async function pick(files: FileList | null) {
    if (!files?.length) return; setErr("");
    const list = [...files].slice(0, 20);
    for (let i = 0; i < list.length; i++) {
      setBusy(`Envoi ${i + 1} / ${list.length}…`);
      try { const u = await uploadImage(await prepareImage(list[i], "photo"), "galerie"); setUrls((x) => [...x, u]); }
      catch (e) { setErr((e as Error).message); }
    }
    setBusy(""); if (ref.current) ref.current.value = "";
  }
  function publish() {
    setErr("");
    start(async () => { const r = await addGalleryPhotos({ urls, category, alt }); if (r?.error) setErr(r.error); });
  }
  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <button type="button" onClick={() => ref.current?.click()} disabled={!!busy}
        className="grid min-h-32 w-full place-items-center rounded-2xl border-2 border-dashed border-line bg-mist px-4 text-center text-sm text-muted hover:border-black">
        <span className="flex flex-col items-center gap-2">{busy ? <Loader2 className="animate-spin" /> : <ImagePlus size={28} />}{busy || "Appuyer pour choisir une ou plusieurs photos"}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
      {urls.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {urls.map((u) => (
              <li key={u} className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setUrls((x) => x.filter((y) => y !== u))} aria-label="Retirer" className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white">×</button>
              </li>
            ))}
          </ul>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Catégorie
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={box}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <label className="block text-sm font-medium">Description <span className="font-normal text-muted">(facultatif)</span>
              <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={160} placeholder="Ex. : Polos brodés pour un club" className={box} />
            </label>
          </div>
          <button type="button" onClick={publish} disabled={pending || !!busy} className="btn btn-dark w-full sm:w-auto">{pending ? "Publication…" : `Publier ${urls.length} photo${urls.length > 1 ? "s" : ""}`}</button>
        </>
      )}
      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
    </div>
  );
}
