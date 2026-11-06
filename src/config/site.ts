// Informations à CONFIRMER par le client — aucune coordonnée n'est inventée.
export const site = {
  name: "L'Atelier de l'Impression",
  city: "Aulnay-sous-Bois",
  postalCode: "93600",
  // Coordonnées identiques à NOVRA (même gérant, mêmes locaux), reprises des mentions légales publiques de novra.paris.
  // À faire valider par le client. Téléphone : non communiqué, volontairement laissé vide.
  street: "26 ter rue Jules Princet",
  address: "26 ter rue Jules Princet, 93600 Aulnay-sous-Bois",
  email: "Atelierprint2.0@gmail.com",
  instagram: { handle: "@aulnayprint", url: "https://www.instagram.com/aulnayprint/" },
  phone: "",
  // Horaires repris de la fiche boutique NOVRA (table store_settings) — à confirmer par le client. Dimanche : non indiqué.
  hours: [
    { day: "Lundi", time: "Fermé" },
    { day: "Mardi", time: "11h – 18h" },
    { day: "Mercredi", time: "11h – 18h" },
    { day: "Jeudi", time: "11h – 18h" },
    { day: "Vendredi", time: "10h – 12h et 14h – 18h" },
    { day: "Samedi", time: "11h – 19h" },
  ],
  nav: [
    { href: "/", label: "Accueil" },
    { href: "/prestations", label: "Nos prestations" },
    { href: "/personnalisation", label: "Personnalisation" },
    { href: "/realisations", label: "Réalisations" },
    { href: "/contact", label: "Contact" },
  ],
  // Liens du pied de page uniquement (« À propos » n'est pas dans l'en-tête).
  footerExtra: [{ href: "/a-propos", label: "À propos" }],
} as const;
