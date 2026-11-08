"use client";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { prepareImage, uploadImage, type ImageMode } from "@/lib/content/image";

/** Bouton « choisir une photo » : redimensionne, envoie, et renvoie l'URL. Sur téléphone, ouvre l'appareil photo ou la galerie. */
export function PhotoField({ label, value, onChange, folder, mode = "photo", hint, aspect = "aspect-[4/3]" }: {
  label: string; value: string; onChange: (url: string) => void; folder: "produits" | "galerie" | "couvertures"; mode?: ImageMode; hint?: string; aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function pick(f?: File) {
    if (!f) return; setErr(""); setBusy(true);
    try { onChange(await uploadImage(await prepareImage(f, mode), folder)); } catch (e) { setErr((e as Error).message); }
    setBusy(false); if (ref.current) ref.current.value = "";
  }
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className={`relative grid w-full ${aspect} place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-mist text-sm text-muted transition hover:border-black`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className={`h-full w-full ${mode === "product" ? "object-contain bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]" : "object-cover"}`} />
        ) : <span className="flex flex-col items-center gap-2 px-3 text-center"><Camera size={26} />Appuyer pour choisir une photo</span>}
        {busy && <span className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="animate-spin" /></span>}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {value && !busy && <button type="button" onClick={() => ref.current?.click()} className="mt-2 text-sm underline">Changer la photo</button>}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {err && <p role="alert" className="mt-1 text-sm text-red-700">{err}</p>}
    </div>
  );
}
