import Image from "next/image";

// Logos clients fournis par l'Atelier — à ne publier qu'avec l'accord de chaque client.
const clients = [
  { src: "/clients/novra.png", alt: "NOVRA", w: 322, h: 160, cls: "h-8 sm:h-10" },
  { src: "/clients/9mm.png", alt: "9MM Beyond Energy", w: 394, h: 160, cls: "h-10 sm:h-12" },
  { src: "/clients/bkagency.png", alt: "Bkagency, agence de communication", w: 721, h: 501, cls: "h-12 sm:h-14" },
  { src: "/clients/merchoff.png", alt: "MERCHOFF", w: 1478, h: 235, cls: "h-7 sm:h-9" },
  { src: "/clients/piraterie.png", alt: "La Piraterie", w: 724, h: 471, cls: "h-12 sm:h-14" },
  { src: "/clients/destock.jpg", alt: "Destock Pièces Auto", w: 447, h: 447, cls: "h-20 rounded-2xl sm:h-24" },
  { src: "/clients/csl-aulnay.png", alt: "CSL Aulnay", w: 272, h: 311, cls: "h-16 sm:h-20" },
  { src: "/clients/montreuil-fc.png", alt: "Montreuil Football Club", w: 415, h: 414, cls: "h-16 sm:h-20" },
  { src: "/clients/esperance-aulnaysienne.png", alt: "Espérance Aulnaysienne", w: 108, h: 194, cls: "h-16 sm:h-20" },
  { src: "/clients/fca.png", alt: "Football Club Aulnaysien (F.C.A)", w: 418, h: 506, cls: "h-16 sm:h-20" },
  { src: "/clients/micro3ks.png", alt: "Micro 3KS", w: 297, h: 297, cls: "h-16 sm:h-20" },
  { src: "/clients/faucon-training.png", alt: "Faucon Training", w: 1266, h: 734, cls: "h-14 sm:h-16" },
  { src: "/clients/afrique.png", alt: "Logo client (carte de l'Afrique)", w: 450, h: 450, cls: "h-12 sm:h-14" },
];

function Row({ dup = false }: { dup?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-14 pr-14 sm:gap-20 sm:pr-20" aria-hidden={dup || undefined} data-dup={dup || undefined}>
      {clients.map((c) => (
        <li key={c.src} className="flex shrink-0 items-center">
          <Image src={c.src} alt={dup ? "" : c.alt} width={c.w} height={c.h} className={`${c.cls} w-auto opacity-90`} />
        </li>
      ))}
    </ul>
  );
}

export function Clients() {
  return (
    <section className="bg-black py-16 text-white sm:py-20" aria-labelledby="confiance">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="eyebrow !text-white/60">Références</p>
        <h2 id="confiance" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Ils nous ont fait confiance</h2>
      </div>
      <div className="marquee mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track">
          <Row />
          <Row dup />
        </div>
      </div>
    </section>
  );
}
