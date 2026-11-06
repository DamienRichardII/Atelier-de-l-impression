import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, AtSign } from "lucide-react";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter L'Atelier de l'Impression à Aulnay-sous-Bois : adresse, e-mail et Instagram.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Parlons de votre projet</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Une question sur un produit, une personnalisation ou un devis ? Écrivez-nous ou passez à l'atelier.
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

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/personnalisation#devis" className="btn btn-dark">Demander un devis</Link>
        <Link href="/personnalisation" className="btn btn-light">Personnaliser un produit</Link>
      </div>
    </section>
  );
}
