"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { blackFriday as bf } from "@/config/black-friday";

const KEY = `popup-${bf.version}`;
const parisDay = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date()); // AAAA-MM-JJ

export function BlackFridayPopup() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const hidden = path.startsWith("/admin") || path.startsWith("/commande") || path.startsWith("/panier");

  useEffect(() => {
    if (!bf.enabled || hidden) return;
    const day = parisDay();
    if (day < bf.from || day > bf.to) return;
    try { if (localStorage.getItem(KEY)) return; } catch { /* stockage indisponible : on affiche quand même */ }
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, [hidden]);

  const close = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* ignoré */ }
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  if (!open || hidden) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="bf-title" onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-black text-white shadow-2xl [animation:bf-in_.45s_cubic-bezier(.22,1,.36,1)]">
        <button ref={closeBtn} onClick={close} aria-label="Fermer"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white hover:text-black">
          <X size={18} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/promo/black-friday.webp" alt="Black Friday — Atelier Impression : sérigraphie aux encres cyan, magenta et jaune" width={1400} height={467} className="block h-auto w-full" />
        <div className="px-6 pb-7 pt-6 text-center sm:px-10">
          <h2 id="bf-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{bf.title}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{bf.message}</p>
          <Link href={bf.cta.href} onClick={close}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f6f1e6] px-7 text-sm font-semibold uppercase tracking-wider text-black transition hover:bg-white">
            {bf.cta.label}
          </Link>
          <p className="mt-4 text-xs text-white/50">{bf.note}</p>
          <button onClick={close} className="mt-4 text-xs text-white/50 underline underline-offset-4 hover:text-white">Non merci</button>
        </div>
      </div>
    </div>
  );
}
