"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Eraser, Move, RotateCcw, Trash2, Upload, ZoomIn, ZoomOut, Moon, Sun, Grid2x2 } from "lucide-react";
import { products, formatPriceFrom, type Face } from "@/config/products";
import type { LogoPlacement } from "@/lib/customization/types";
import { loadLogoFile, removeWhiteBackground } from "@/lib/customization/svg";
import type { PreviewHandle } from "./PreviewStage";
import { AddToCart } from "./AddToCart";
import { eur, usePrices } from "@/lib/cart/usePrices";

const PreviewStage = dynamic(() => import("./PreviewStage").then((m) => m.PreviewStage), {
  ssr: false,
  loading: () => <div className="aspect-[500/560] w-full animate-pulse rounded-3xl bg-mist" />,
});

const FACE_LABEL: Record<Face, string> = { front: "Avant", back: "Arrière", left: "Côté gauche", right: "Côté droit", side: "Côté", "three-quarter": "Trois quarts" };

const families = products.reduce<{ name: string; items: typeof products }[]>((acc, p) => {
  const f = acc.find((x) => x.name === p.family);
  if (f) f.items.push(p); else acc.push({ name: p.family, items: [p] });
  return acc;
}, []);

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-6">
      <p className="eyebrow">{n} — {title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Simulator() {
  const { enabled: payOn, prices, pricesBoth } = usePrices();
  const params = useSearchParams();
  const initial = products.find((p) => p.id === params.get("produit")) ?? products[0];
  const [productId, setProductId] = useState(initial.id);
  const product = products.find((p) => p.id === productId)!;
  const familyItems = products.filter((p) => p.family === product.family);
  const [color, setColor] = useState(product.colors[0]);
  const [face, setFace] = useState<Face>(
    (Object.keys(initial.faces).find((f) => !initial.colors[0].photos || initial.colors[0].photos[f as Face]) as Face) ?? "front",
  );
  const [logos, setLogos] = useState<Partial<Record<Face, LogoPlacement>>>({});
  const [dark, setDark] = useState(false);
  const [zones, setZones] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [originals, setOriginals] = useState<Partial<Record<Face, File>>>({});
  const stage = useRef<PreviewHandle>(null);
  const input = useRef<HTMLInputElement>(null);

  const zone = product.faces[face] ?? undefined;
  const maxZoom = product.maxZoom ?? 2.5;
  const logo = logos[face];
  const faces = useMemo(
    () => (Object.keys(product.faces) as Face[]).filter((f) => !color.photos || color.photos[f]),
    [product, color],
  );

  const pickProduct = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    setProductId(id); setColor(p.colors[0]); setFace((Object.keys(p.faces).find((f) => !p.colors[0].photos || p.colors[0].photos[f as Face]) as Face) ?? "front"); setLogos({}); setOriginals({}); setZoom(1);
  };

  const onFile = useCallback(async (f?: File) => {
    if (!f || !zone) return;
    setError(null);
    const r = await loadLogoFile(f);
    if (!r.ok) return setError(r.error);
    setLogos((l) => ({ ...l, [face]: { dataUrl: r.dataUrl, fileName: f.name, cx: zone.x + zone.w / 2, cy: zone.y + zone.h / 2, scale: 1, rotation: 0 } }));
    setOriginals((o) => ({ ...o, [face]: r.file }));
  }, [face, zone]);

  const patch = (p: Partial<LogoPlacement>) => logo && setLogos((l) => ({ ...l, [face]: { ...logo, ...p } }));
  const center = () => zone && patch({ cx: zone.x + zone.w / 2, cy: zone.y + zone.h / 2 });
  const reset = () => zone && patch({ cx: zone.x + zone.w / 2, cy: zone.y + zone.h / 2, scale: 1, rotation: 0 });
  const remove = () => { setLogos((l) => { const n = { ...l }; delete n[face]; return n; }); setOriginals((o) => { const n = { ...o }; delete n[face]; return n; }); };

  const presets = zone ? [
    ["Centre", zone.x + zone.w / 2, zone.y + zone.h / 2],
    ["Haut", zone.x + zone.w / 2, zone.y + zone.h * 0.2],
    ["Bas", zone.x + zone.w / 2, zone.y + zone.h * 0.8],
    ["Gauche", zone.x + zone.w * 0.2, zone.y + zone.h / 2],
    ["Droite", zone.x + zone.w * 0.8, zone.y + zone.h / 2],
  ] as const : [];

  const download = () => {
    const url = stage.current?.exportPng(3); if (!url) return;
    const a = document.createElement("a"); a.href = url; a.download = `apercu-${product.id}-${face}.png`; a.click();
  };
  const snapshot = () => { const url = stage.current?.exportPng(2) ?? null; setPreview(url); return url; };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Simulateur</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Personnalisez votre produit</h1>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Aperçu — en haut sur mobile, à gauche sur desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PreviewStage ref={stage} productId={productId} color={color.hex} photo={color.photos?.[face]} zone={zone} logo={logo}
            darkBg={dark} showZone={zones} zoom={zoom} onChange={(l) => setLogos((s) => ({ ...s, [face]: l }))} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {faces.map((f) => (
              <button key={f} onClick={() => setFace(f)} aria-pressed={face === f}
                className={`btn !min-h-11 !px-4 ${face === f ? "btn-dark" : "btn-light"}`}>{FACE_LABEL[f]}</button>
            ))}
            <span className="flex-1" />
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-line" aria-label="Zoom arrière" disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.25))}><ZoomOut size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-line" aria-label="Zoom avant" disabled={zoom >= maxZoom} onClick={() => setZoom((z) => Math.min(maxZoom, z + 0.25))}><ZoomIn size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-line" aria-label="Afficher les zones imprimables" aria-pressed={zones} onClick={() => setZones(!zones)}><Grid2x2 size={18} /></button>
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-line" aria-label="Fond clair ou foncé" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="btn btn-light !min-h-11 !px-4" onClick={download} disabled={!logo}><Download size={16} /> PNG</button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Simulation indicative et non contractuelle, sur photos produit (vues fixes avant, arrière et côtés ; pas de rotation 3D tant qu'aucun modèle 3D n'est fourni). Le visuel est validé avec vous avant production.
          </p>
        </div>

        {/* Contrôles */}
        <div>
          <Section n="01" title="Produit">
            <div className="grid grid-cols-3 gap-2">
              {families.map((fam) => {
                const on = fam.name === product.family;
                return (
                  <button key={fam.name} onClick={() => !on && pickProduct(fam.items[0].id)} aria-pressed={on}
                    className={`rounded-xl border px-2 py-3 text-sm transition ${on ? "border-black bg-black text-white" : "border-line hover:border-black"}`}>{fam.name}</button>
                );
              })}
            </div>
            {familyItems.length > 1 && (
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-widest text-muted">Modèle</span>
                <select value={productId} onChange={(e) => pickProduct(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none focus:border-black">
                  {familyItems.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            )}
            {product.description && <p className="mt-3 text-sm">{product.description}</p>}
            <p className="mt-3 text-sm text-muted">
              {payOn && prices[product.id] ? pricesBoth[product.id] && pricesBoth[product.id] !== prices[product.id] ? `${eur(prices[product.id])} la pièce en impression recto · ${eur(pricesBoth[product.id])} en recto-verso.` : `${eur(prices[product.id])} la pièce · achat en ligne.` : product.priceFrom ? `${formatPriceFrom(product.priceFrom)} la pièce.` : "Tarif : contactez l'atelier."}
            </p>
          </Section>
          <Section n="02" title={`Couleur — ${color.name}`}>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button key={c.hex} onClick={() => { setColor(c); if (c.photos && !c.photos[face]) setFace(faces[0]); }} aria-label={c.name} aria-pressed={c.hex === color.hex}
                  className={`h-11 w-11 rounded-full border transition ${c.hex === color.hex ? "ring-2 ring-black ring-offset-2" : "border-line"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </Section>
          <Section n="03" title="Votre logo">
            {!zone ? (
              <p className="rounded-2xl border border-line p-4 text-sm text-muted">
                Cette vue est une vue de présentation du produit. Pour placer votre logo, sélectionnez une vue Avant, Arrière ou Côté (celles qui affichent une zone d'impression pointillée).
              </p>
            ) : !logo ? (
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files[0]); }}
                className={`rounded-2xl border border-dashed p-8 text-center transition ${dragOver ? "border-black bg-mist" : "border-line"}`}>
                <Upload className="mx-auto" size={22} />
                <p className="mt-3 text-sm">Glissez votre logo ici ou</p>
                <button className="btn btn-dark mt-3" onClick={() => input.current?.click()}>Choisir un fichier</button>
                <p className="mt-3 text-xs text-muted">PNG · JPG · WEBP · SVG — 5 Mo max. Le fichier reste sur votre appareil jusqu'à l'ajout au panier.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-line p-3">
                <p className="truncate text-sm">{logo.fileName}</p>
                <div className="flex gap-2">
                  <button className="btn btn-light !min-h-11 !px-3" onClick={() => input.current?.click()}>Remplacer</button>
                  <button className="grid h-11 w-11 place-items-center rounded-xl border border-line" aria-label="Supprimer le logo" onClick={remove}><Trash2 size={16} /></button>
                </div>
              </div>
            )}
            <input ref={input} type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            {error && <p role="alert" className="mt-3 text-sm font-medium text-black underline">{error}</p>}
            {logo && !logo.fileName.toLowerCase().endsWith(".svg") && (
              <button className="mt-3 inline-flex items-center gap-2 text-sm text-muted underline"
                onClick={async () => patch({ dataUrl: await removeWhiteBackground(logo.dataUrl) })}><Eraser size={14} /> Supprimer le fond blanc</button>
            )}
          </Section>
          <Section n="04" title="Position">
            <label className="text-sm text-muted" htmlFor="size">Taille — {Math.round((logo?.scale ?? 1) * 100)} %</label>
            <input id="size" type="range" min={20} max={250} disabled={!logo} value={Math.round((logo?.scale ?? 1) * 100)}
              onChange={(e) => patch({ scale: Number(e.target.value) / 100 })} className="mt-2 w-full accent-black" />
            <label className="mt-4 block text-sm text-muted" htmlFor="rot">Rotation — {Math.round(logo?.rotation ?? 0)}°</label>
            <input id="rot" type="range" min={-180} max={180} disabled={!logo} value={Math.round(logo?.rotation ?? 0)}
              onChange={(e) => patch({ rotation: Number(e.target.value) })} className="mt-2 w-full accent-black" />
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map(([l, x, y]) => (
                <button key={l} disabled={!logo} className="btn btn-light !min-h-11 !px-3 !text-[11px]" onClick={() => patch({ cx: x, cy: y })}>{l}</button>
              ))}
              <button disabled={!logo} className="btn btn-light !min-h-11 !px-3 !text-[11px]" onClick={center}><Move size={14} /> Recentrer</button>
              <button disabled={!logo} className="btn btn-light !min-h-11 !px-3 !text-[11px]" onClick={reset}><RotateCcw size={14} /> Réinitialiser</button>
            </div>
            <p className="mt-3 text-xs text-muted">Faites glisser le logo directement sur le produit. Pour une autre face, sélectionnez-la sous l'aperçu puis importez un logo.</p>
          </Section>
        </div>
      </div>

      <AddToCart product={product} color={color} logos={logos} originals={originals} snapshot={snapshot} />
    </div>
  );
}
