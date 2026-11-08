import { Suspense } from "react";
import type { Metadata } from "next";
import { getGallery } from "@/lib/content/data";
import { PageHero, CtaBand } from "@/components/PageHero";
import { Gallery } from "@/components/realisations/Gallery";
import { Clients } from "@/components/home/Clients";

export const metadata: Metadata = {
  alternates: { canonical: "/realisations" },
  title: "Nos réalisations",
  description: "Découvrez des exemples de projets réalisés par L'Atelier de l'Impression à Aulnay-sous-Bois.",
};

async function Photos() { return <Gallery realisations={await getGallery()} />; }

export default function Page() {
  return (
    <>
      <PageHero title="Nos réalisations" text="Découvrez quelques exemples de projets réalisés pour nos clients." />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-mist" />}><Photos /></Suspense></section>
      <Clients />
      <div className="pt-20"><CtaBand title="Lancez votre projet dès maintenant" text="Vous avez une idée ? Nous la transformons en réalité." /></div>
    </>
  );
}
