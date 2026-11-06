import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { products } from "@/config/products";

const steps = [
  ["01", "Choisissez", "Sélectionnez votre support et sa couleur."],
  ["02", "Personnalisez", "Importez votre logo et placez-le sur le produit."],
  ["03", "Devis ou commande", "Envoyez votre demande ou commandez si le tarif est validé."],
];

const faq = [
  ["Le rendu du simulateur est-il définitif ?", "Non. C'est une simulation indicative, pas un bon à tirer. Le visuel est validé avec vous avant production."],
  ["Quels formats de logo acceptez-vous ?", "PNG, JPG, WEBP et SVG (nettoyé automatiquement)."],
  ["Comment obtenir un prix ?", "Via le devis intégré au simulateur. Un lien de paiement SumUp vous est envoyé après acceptation."],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="produits">
        <p className="eyebrow">Nos produits personnalisables</p>
        <h2 id="produits" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Un support pour chaque projet</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <Link key={p.id} href={`/personnalisation?produit=${p.id}`} className="card group p-4 transition hover:-translate-y-1 hover:border-black">
              {(() => {
                const src = p.colors[0].photos?.front ?? p.colors[0].photos?.back;
                return src ? (
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                    <Image src={src} alt={p.name} fill sizes="(max-width: 768px) 45vw, 25vw" className="object-contain p-2" />
                  </div>
                ) : (
                  <div className="grid aspect-square place-items-center rounded-xl bg-mist text-xs text-muted">Photo à fournir</div>
                );
              })()}
              <p className="mt-4 font-medium">{p.name}</p>
              <p className="text-sm text-muted">Personnaliser →</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="rule mx-auto max-w-7xl" />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="comment">
        <p className="eyebrow">Comment ça marche</p>
        <h2 id="comment" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Trois étapes</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <p className="text-sm text-muted">{n}</p>
              <p className="mt-6 text-xl font-semibold">{t}</p>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow !text-white/60">Simulateur interactif</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Visualisez votre logo avant de commander</h2>
          <Link href="/personnalisation" className="btn mt-8 border-white bg-white text-black hover:bg-black hover:text-white">
            Ouvrir le simulateur
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" aria-labelledby="faq">
        <p className="eyebrow">FAQ</p>
        <h2 id="faq" className="mt-3 text-3xl font-semibold tracking-tight">Questions fréquentes</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faq.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="cursor-pointer list-none font-medium">{q}</summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
