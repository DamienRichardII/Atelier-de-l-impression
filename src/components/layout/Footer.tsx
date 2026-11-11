import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

const legal = [
  ["/mentions-legales", "Mentions légales"],
  ["/confidentialite", "Confidentialité"],
  ["/cgv", "CGV"],
  ["/cookies", "Cookies"],
  ["/livraison-retours", "Livraison et retours"],
];

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Image src="/brand/logo-blanc.png" alt="L'Atelier de l'Impression" width={955} height={186} className="h-10 w-auto" />
        <div className="my-8 h-px bg-white/20" />
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="eyebrow !text-white/60">Atelier</p>
            <p className="mt-3 text-sm text-white/80">
              {site.address || `${site.postalCode} ${site.city}`}
            </p>
            {site.phone && <p className="mt-1 text-sm"><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-white/80 hover:text-white">{site.phone}</a></p>}
            <p className="mt-1 text-sm"><a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">WhatsApp {site.whatsapp.label}</a></p>
            {site.email && <p className="mt-1 text-sm"><a href={`mailto:${site.email}`} className="text-white/80 hover:text-white">{site.email}</a></p>}
            <p className="mt-1 text-sm"><a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">Instagram {site.instagram.handle}</a></p>
            <ul className="mt-4 space-y-0.5 text-xs text-white/60">
              {site.hours.map((h) => (<li key={h.day}>{h.day} : {h.time}</li>))}
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-white/60">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[...site.nav, ...site.footerExtra].map((n) => (
                <li key={n.href}><Link href={n.href} className="text-white/80 hover:text-white">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-white/60">Informations</p>
            <ul className="mt-3 space-y-2 text-sm">
              {legal.map(([h, l]) => (
                <li key={h}><Link href={h} className="text-white/80 hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-white/50">© 2026 L'Atelier de l'Impression — Aulnay-sous-Bois</p>
      </div>
    </footer>
  );
}
