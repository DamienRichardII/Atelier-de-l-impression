// Galerie des réalisations. Aucune photo n'est inventée : la liste reste vide tant que l'atelier n'a pas fourni
// de vraies photos de ses travaux (et l'accord des clients concernés).
// Pour ajouter une réalisation : déposer l'image dans /public/realisations/ puis ajouter une entrée ci-dessous.
export const realisationCategories = ["Textile", "Objets", "Bagagerie", "Événementiel", "Entreprise"] as const;
export type RealisationCategory = (typeof realisationCategories)[number];

export interface Realisation { src: string; alt: string; category: RealisationCategory }
export const realisations: Realisation[] = [
  // { src: "/realisations/exemple.webp", alt: "Polo brodé pour ...", category: "Textile" },
];
