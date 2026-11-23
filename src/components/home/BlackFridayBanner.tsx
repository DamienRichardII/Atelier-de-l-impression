"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { blackFriday as bf } from "@/config/black-friday";

const parisDay = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date()); // AAAA-MM-JJ

/** Bannière Black Friday de l'accueil : visible dès le chargement, retirée automatiquement après la date de fin. */
export function BlackFridayBanner() {
  const [show, setShow] = useState<boolean>(bf.enabled);
  useEffect(() => {
    const day = parisDay();
    if (!bf.enabled || day < bf.from || day > bf.to) setShow(false);
  }, []);
  if (!show) return null;
  return (
    <section className="bg-white px-4 pb-14 sm:px-6 sm:pb-20" aria-label="Black Friday">
      <Link href={bf.cta.href} className="group relative mx-auto block max-w-7xl overflow-hidden rounded-3xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/promo/black-friday-banner.webp" width={1800} height={600}
          alt="Black Friday — Atelier Impression : sérigraphie aux encres cyan, magenta et jaune"
          className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]" />
        <span className="m-3 flex min-h-11 items-center justify-center rounded-xl bg-[#f6f1e6] px-4 text-xs font-semibold uppercase tracking-wider text-black transition group-hover:bg-white sm:absolute sm:bottom-6 sm:right-8 sm:m-0 sm:inline-flex sm:min-h-12 sm:px-7 sm:text-sm">
          {bf.cta.label}
        </span>
      </Link>
    </section>
  );
}
