"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { site } from "@/config/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur transition-all duration-300 ${
        scrolled ? "border-b border-line py-2" : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="L'Atelier de l'Impression — accueil" className="shrink-0">
          <Image src="/brand/logo-noir.png" alt="L'Atelier de l'Impression" width={956} height={187} priority
            className={`w-auto transition-all duration-300 ${scrolled ? "h-7" : "h-9"}`} />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {site.nav.filter((n) => n.href !== "/").map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-muted transition-colors hover:text-black">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/panier" aria-label="Panier" className="grid h-11 w-11 place-items-center rounded-xl border border-line">
            <ShoppingBag size={18} />
          </Link>
          <Link href="/personnalisation#devis" className="btn btn-dark hidden whitespace-nowrap md:inline-flex !min-h-11">
            Demander un devis
          </Link>
          <button className="grid h-11 w-11 place-items-center rounded-xl border border-line lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-white px-4 py-4 lg:hidden" aria-label="Navigation mobile">
          {site.nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block border-b border-line py-3 text-base">{n.label}</Link>
          ))}
          <Link href="/personnalisation#devis" onClick={() => setOpen(false)} className="btn btn-dark mt-4 w-full">
            Demander un devis
          </Link>
        </nav>
      )}
    </header>
  );
}
