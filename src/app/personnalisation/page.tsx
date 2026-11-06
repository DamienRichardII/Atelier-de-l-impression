import { Suspense } from "react";
import type { Metadata } from "next";
import { Simulator } from "@/components/simulator/Simulator";

export const metadata: Metadata = {
  title: "Personnalisation — simulateur de logo",
  description: "Visualisez votre logo sur t-shirt, sweat, polo, casquette, tote bag ou mug, puis demandez votre devis. Aulnay-sous-Bois.",
};

export default function Page() {
  return <Suspense><Simulator /></Suspense>;
}
