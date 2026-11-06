import type { Metadata } from "next";
import { Cart } from "@/components/cart/Cart";
export const metadata: Metadata = { title: "Panier", robots: { index: false } };
export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Commande</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panier</h1>
      <Cart />
    </section>
  );
}
