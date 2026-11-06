"use client";
import { useState } from "react";
import Image from "next/image";
import { realisationCategories, realisations, type RealisationCategory } from "@/config/realisations";

export function Gallery() {
  const [cat, setCat] = useState<RealisationCategory | "Tous">("Tous");
  const shown = cat === "Tous" ? realisations : realisations.filter((r) => r.category === cat);
  const chips = ["Tous", ...realisationCategories] as const;

  if (realisations.length === 0) {
    return (
      <div className="card mx-auto max-w-2xl p-10 text-center">
        <p className="eyebrow">Galerie</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Nos réalisations arrivent bientôt</h2>
        <p className="mt-3 text-sm text-muted">Nous préparons la galerie de nos travaux. En attendant, découvrez les entreprises et associations qui nous ont fait confiance ci-dessous, ou testez vous-même le rendu de votre logo.</p>
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filtrer les réalisations">
        {chips.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`min-h-11 rounded-full border px-5 text-sm font-medium transition ${cat === c ? "border-black bg-black text-white" : "border-line hover:border-black"}`}>{c}</button>
        ))}
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {shown.map((r) => (
          <li key={r.src} className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
            <Image src={r.src} alt={r.alt} fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </>
  );
}
