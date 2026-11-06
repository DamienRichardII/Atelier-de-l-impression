import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Headset, Store } from "lucide-react";
import { PageHero, CtaBand } from "@/components/PageHero";
import { services, techniques } from "@/config/prestations";

export const metadata: Metadata = {
  title: "Nos prestations",
  description: "Impression et personnalisation à Aulnay-sous-Bois : textile, objets publicitaires, bagagerie, supports de communication, cadeaux d'entreprise.",
};

const promises = [
  { icon: BadgeCheck, title: "Qualité professionnelle", text: "Un rendu soigné, en atelier" },
  { icon: Headset, title: "Accompagnement personnalisé", text: "De la création au retrait" },
  { icon: Store, title: "Retrait à l'atelier", text: "Aulnay-sous-Bois" },
  { icon: FileText, title: "Devis sur demande", text: "Adapté à votre projet" },
];

export default function Page() {
  return (
    <>
      <PageHero title="Nos prestations" text="Des solutions d'impression, de personnalisation et de marquage adaptées à tous vos besoins." />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="text-center">
              <Icon className="mx-auto" size={26} strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rule mx-auto max-w-7xl" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="services">
        <div className="text-center">
          <p className="eyebrow">Nos services</p>
          <h2 id="services" className="mt-3 text-3xl font-semibold tracking-tight">Nos solutions de personnalisation</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">Une large gamme de supports à personnaliser pour les particuliers, les associations et les entreprises.</p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, text, icon: Icon, href }) => (
            <li key={title}>
              <Link href={href} className="card group flex h-full flex-col overflow-hidden transition hover:border-black">
                <div className="grid h-36 place-items-center bg-mist"><Icon size={44} strokeWidth={1.25} /></div>
                <div className="flex flex-1 items-end justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted">{text}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition group-hover:bg-black group-hover:text-white"><ArrowRight size={15} /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand title="Besoin d'un projet sur mesure ?" text="Décrivez-nous votre besoin, notre équipe vous accompagne de A à Z." />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6" aria-labelledby="techniques">
        <div className="text-center">
          <p className="eyebrow">Nos techniques</p>
          <h2 id="techniques" className="mt-3 text-3xl font-semibold tracking-tight">Des techniques d'impression adaptées</h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {techniques.map(({ label, icon: Icon }) => (
            <li key={label} className="grid place-items-center gap-3 rounded-2xl bg-mist px-4 py-6 text-center">
              <Icon size={28} strokeWidth={1.4} />
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
