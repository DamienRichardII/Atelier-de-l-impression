import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "@/components/cart/Confirmation";
export const metadata: Metadata = { title: "Confirmation de commande", robots: { index: false } };
export default function Page() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <Suspense fallback={<p className="text-muted">Chargement…</p>}><Confirmation /></Suspense>
    </section>
  );
}
