import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";
import { site } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: "Contacter L'Atelier de l'Impression à Aulnay-sous-Bois : adresse, e-mail, WhatsApp et Instagram.",
};

function InstagramLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function WhatsAppLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
const iconLink = "inline-grid h-10 w-10 place-items-center rounded-full border border-line transition hover:border-black hover:bg-black hover:text-white";

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Parlons de votre projet</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Une question sur un produit, ou une personnalisation ? Écrivez-nous ou passez à l'atelier.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <MapPin size={20} aria-hidden />
          <p className="mt-6 text-sm text-muted">Adresse</p>
          <p className="mt-1 font-medium">{site.street}</p>
          <p className="font-medium">{site.postalCode} {site.city}</p>
        </div>
        <div className="card p-6">
          <Mail size={20} aria-hidden />
          <p className="mt-6 text-sm text-muted">E-mail</p>
          <p className="mt-1 break-all font-medium">
            <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:no-underline">{site.email}</a>
          </p>
        </div>
        <div className="card p-6">
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${site.instagram.handle}`} className={iconLink}><InstagramLogo /></a>
          <p className="mt-6 text-sm text-muted">Instagram</p>
          <p className="mt-1 font-medium">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">{site.instagram.handle}</a>
          </p>
        </div>
        <div className="card p-6">
          <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${site.whatsapp.label}`} className={iconLink}><WhatsAppLogo /></a>
          <p className="mt-6 text-sm text-muted">WhatsApp</p>
          <p className="mt-1 font-medium">
            <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">{site.whatsapp.label}</a>
          </p>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <Clock size={20} aria-hidden />
        <p className="mt-6 text-sm text-muted">Horaires d'ouverture</p>
        <dl className="mt-3 grid max-w-md grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
          {site.hours.map((h) => (<div key={h.day} className="contents"><dt className="text-muted">{h.day}</dt><dd className="font-medium">{h.time}</dd></div>))}
        </dl>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/personnalisation" className="btn btn-dark">Personnaliser un produit</Link>
      </div>
    </section>
  );
}
