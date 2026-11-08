"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PhotoField } from "./PhotoField";
import { createProduct } from "@/app/admin/content-actions";

const box = "mt-1 w-full min-h-12 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-black";
const PRESETS: [string, string][] = [["Vêtement (XS à XXL)", "XS, S, M, L, XL, XXL"], ["Vêtement (S à XXL)", "S, M, L, XL, XXL"], ["Taille unique", "Taille unique"]];
type Color = { name: string; hex: string; front: string; back: string };
const blank = (): Color => ({ name: "", hex: "#111111", front: "", back: "" });

export function ProductForm({ families, templates }: { families: string[]; templates: { id: string; name: string }[] }) {
  const [name, setName] = useState(""); const [family, setFamily] = useState(families[0] ?? ""); const [newFamily, setNewFamily] = useState("");
  const [description, setDescription] = useState(""); const [sizes, setSizes] = useState("S, M, L, XL, XXL");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? ""); const [priceRecto, setPriceRecto] = useState(""); const [priceBoth, setPriceBoth] = useState("");
  const [colors, setColors] = useState<Color[]>([blank()]); const [err, setErr] = useState(""); const [pending, start] = useTransition();
  const setColor = (i: number, patch: Partial<Color>) => setColors((cs) => cs.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    start(async () => {
      const r = await createProduct({ name, family: family === "__new" ? newFamily : family, description, sizes: sizes.split(","), templateId, priceRecto, priceBoth, colors });
      if (r?.error) setErr(r.error);
    });
  }
  return (
    <form onSubmit={submit} className="card space-y-8 p-5 sm:p-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium sm:col-span-2">Nom du produit
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="Ex. : Sweat zippé premium" className={box} />
        </label>
        <label className="block text-sm font-medium">Catégorie
          <select value={family} onChange={(e) => setFamily(e.target.value)} className={box}>
            {families.map((f) => <option key={f}>{f}</option>)}<option value="__new">+ Nouvelle catégorie…</option>
          </select>
        </label>
        {family === "__new" && <label className="block text-sm font-medium">Nom de la nouvelle catégorie
          <input value={newFamily} onChange={(e) => setNewFamily(e.target.value)} maxLength={40} className={box} />
        </label>}
        <label className="block text-sm font-medium sm:col-span-2">Description <span className="font-normal text-muted">(facultatif : tissu, grammage…)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={400} rows={2} className={`${box} py-3`} />
        </label>
      </section>

      <section>
        <p className="text-sm font-medium">Tailles</p>
        <div className="mt-2 flex flex-wrap gap-2">{PRESETS.map(([l, v]) => <button key={l} type="button" onClick={() => setSizes(v)} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-black">{l}</button>)}</div>
        <input value={sizes} onChange={(e) => setSizes(e.target.value)} className={box} aria-label="Tailles séparées par des virgules" />
        <p className="mt-1 text-xs text-muted">Séparées par des virgules.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">Prix recto (€)
          <input value={priceRecto} onChange={(e) => setPriceRecto(e.target.value)} inputMode="decimal" placeholder="15" className={box} />
        </label>
        <label className="block text-sm font-medium">Prix recto-verso (€)
          <input value={priceBoth} onChange={(e) => setPriceBoth(e.target.value)} inputMode="decimal" placeholder="= recto" className={box} />
        </label>
        <label className="block text-sm font-medium">Zone du logo, comme…
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={box}>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </label>
        <p className="text-xs text-muted sm:col-span-3">Sans prix, le produit reste visible mais n'est pas achetable en ligne. Vous pourrez le fixer plus tard dans « Prix et catalogue ».</p>
      </section>

      <section>
        <p className="text-sm font-medium">Couleurs et photos</p>
        <p className="mt-1 text-xs text-muted">Photo sur fond blanc de préférence : le fond est retiré automatiquement. La photo de dos est facultative.</p>
        <div className="mt-4 space-y-5">
          {colors.map((c, i) => (
            <div key={i} className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-end gap-3">
                <label className="block min-w-0 flex-1 text-sm">Nom de la couleur
                  <input value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} maxLength={30} placeholder="Ex. : Noir" className={box} />
                </label>
                <label className="block text-sm">Teinte
                  <input type="color" value={c.hex} onChange={(e) => setColor(i, { hex: e.target.value })} className="mt-1 block h-12 w-16 cursor-pointer rounded-xl border border-line bg-white p-1" />
                </label>
                {colors.length > 1 && <button type="button" onClick={() => setColors((cs) => cs.filter((_, k) => k !== i))} aria-label="Retirer cette couleur" className="grid h-12 w-12 place-items-center rounded-xl border border-line"><Trash2 size={16} /></button>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <PhotoField label="Face avant *" value={c.front} onChange={(u) => setColor(i, { front: u })} folder="produits" mode="product" aspect="aspect-[1000/1120]" />
                <PhotoField label="Dos" value={c.back} onChange={(u) => setColor(i, { back: u })} folder="produits" mode="product" aspect="aspect-[1000/1120]" />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setColors((cs) => [...cs, blank()])} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border border-line px-4 text-sm hover:border-black"><Plus size={16} /> Ajouter une couleur</button>
      </section>

      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
      <button className="btn btn-dark w-full sm:w-auto" disabled={pending}>{pending ? "Enregistrement…" : "Publier le produit"}</button>
    </form>
  );
}
