import Link from "next/link";
import { Wand2 } from "lucide-react";

/** Bandeau noir de tête de page (maquette « Nos prestations / Nos réalisations »). */
export function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.07]"
        style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0 1px, transparent 1px 38px)" }} />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">{text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/personnalisation#devis" className="btn bg-white !text-black hover:!bg-white/90">Demander un devis</Link>
          <Link href="/personnalisation" className="btn border-white/60 bg-transparent text-white hover:bg-white hover:text-black"><Wand2 size={16} /> Utiliser le simulateur</Link>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-black p-8 text-white sm:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0 1px, transparent 1px 38px)" }} />
        <div className="relative">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-lg text-white/70">{text}</p>
          <Link href="/personnalisation#devis" className="btn mt-6 bg-white !text-black hover:!bg-white/90">Demander un devis</Link>
        </div>
      </div>
    </section>
  );
}
