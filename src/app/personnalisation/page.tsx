import { Suspense } from "react";
import type { Metadata } from "next";
import { Simulator } from "@/components/simulator/Simulator";
import { getProducts } from "@/lib/content/data";

export const metadata: Metadata = {
  alternates: { canonical: "/personnalisation" },
  title: "Personnalisation — simulateur de logo",
  description: "Visualisez votre logo sur t-shirt, sweat, polo, casquette ou gilet, puis commandez en ligne. Aulnay-sous-Bois.",
};

async function Loaded() { return <Simulator products={await getProducts()} />; }
export default function Page() {
  return <Suspense><Loaded /></Suspense>;
}
