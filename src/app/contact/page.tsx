import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Clock, Mail, MapPin } from "lucide-react";
import { site } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: "Contacter L'Atelier de l'Impression à Aulnay-sous-Bois : adresse, e-mail et Instagram.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Parlons de votre projet</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Une question sur un produit, ou une personnalisation ? Écrivez-nous ou passez à l'atelier.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
          <AtSign size={20} aria-hidden />
          <p className="mt-6 text-sm text-muted">Instagram</p>
          <p className="mt-1 font-medium">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">{site.instagram.handle}</a>
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
