import type { Metadata } from "next";
export const metadata: Metadata = { title: "À propos", description: "À propos — L'Atelier de l'Impression, Aulnay-sous-Bois.", robots: { index: false } }; // noindex tant que le contenu n'est pas validé
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="eyebrow">À compléter</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">À propos</h1>
      <p className="mt-4 text-muted">Structure prête. Contenu à fournir et à valider par L'Atelier de l'Impression avant publication.</p>
    </section>
  );
}
