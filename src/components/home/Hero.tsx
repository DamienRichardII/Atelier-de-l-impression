"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Shirt, FileText } from "lucide-react";

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number, y = 16) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section className="bg-white" aria-label="Présentation">
      <h1 className="sr-only">L'Atelier de l'Impression — impression et personnalisation à Aulnay-sous-Bois</h1>
      <motion.div {...fade(0.05, 24)} className="mx-auto w-full max-w-[1672px]">
        <Image
          src="/hero/hero.webp" width={1672} height={812} priority sizes="100vw"
          alt="L'Atelier de l'Impression : vestes, sweats, T-shirts, polos, pantalons et casquettes personnalisés"
          className="h-auto w-full [mask-image:linear-gradient(to_bottom,#000_90%,transparent)]"
        />
      </motion.div>
      <div className="mx-auto -mt-2 flex w-full max-w-5xl flex-col items-stretch justify-center gap-3 px-4 pb-14 sm:-mt-4 sm:flex-row sm:gap-4 sm:pb-20">
        <motion.div {...fade(0.5)}>
          <Link href="/personnalisation" className="btn btn-dark w-full sm:w-auto">
            <Shirt size={18} /> Personnaliser un produit
          </Link>
        </motion.div>
        <motion.div {...fade(0.65)}>
          <Link href="/personnalisation#devis" className="btn btn-light w-full sm:w-auto">
            <FileText size={18} /> Demander un devis
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
