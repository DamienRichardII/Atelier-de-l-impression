"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number, y = 16) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section className="grid min-h-[calc(100svh-72px)] place-items-center bg-white px-4">
      <div className="flex w-full max-w-5xl flex-col items-center">
        <motion.div {...fade(0.05, 24)} className="w-full">
          <Image src="/brand/logo-noir.png" alt="L'Atelier de l'Impression" width={956} height={187} priority
            sizes="(max-width: 1024px) 90vw, 1000px" className="mx-auto h-auto w-[90%] max-w-[900px]" />
        </motion.div>
        <div className="mt-12 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-14 sm:w-auto sm:flex-row sm:gap-4">
          <motion.div {...fade(0.5)}>
            <Link href="/personnalisation" className="btn btn-dark w-full sm:w-auto">Personnaliser un produit</Link>
          </motion.div>
          <motion.div {...fade(0.65)}>
            <Link href="/personnalisation#devis" className="btn btn-light w-full sm:w-auto">Demander un devis</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
