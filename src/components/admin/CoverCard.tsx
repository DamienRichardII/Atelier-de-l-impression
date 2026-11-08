"use client";
import { useState, useTransition } from "react";
import { PhotoField } from "./PhotoField";
import { removeCover, setCover } from "@/app/admin/content-actions";

/** Une couverture : choisir une photo l'enregistre aussitôt. */
export function CoverCard({ id, label, hint, current }: { id: string; label: string; hint: string; current?: string }) {
  const [url, setUrl] = useState(current ?? ""); const [err, setErr] = useState(""); const [saved, setSaved] = useState(false); const [pending, start] = useTransition();
  function onChange(u: string) {
    setUrl(u); setErr(""); setSaved(false);
    start(async () => { const r = await setCover({ key: id, url: u }); if (r?.error) setErr(r.error); else setSaved(true); });
  }
  return (
    <div className="card p-4">
      <p className="mb-2 font-semibold">{label}</p>
      <PhotoField label="" value={url} onChange={onChange} folder="couvertures" aspect={id === "banniere" ? "aspect-[21/9]" : "aspect-[4/3]"} hint={hint} />
      {pending && <p className="mt-2 text-sm text-muted">Enregistrement…</p>}
      {saved && !pending && <p className="mt-2 text-sm text-green-700">Enregistré : visible sur le site.</p>}
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
      {current && <form action={removeCover} className="mt-3"><input type="hidden" name="key" value={id} /><button className="text-sm underline">Retirer la photo</button></form>}
    </div>
  );
}
