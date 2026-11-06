// Informations à CONFIRMER par le client — aucune coordonnée n'est inventée.
export const site = {
  name: "L'Atelier de l'Impression",
  city: "Aulnay-sous-Bois",
  postalCode: "93600",
  // Coordonnées identiques à NOVRA (même gérant, mêmes locaux), reprises des mentions légales publiques de novra.paris.
  // À faire valider par le client. Téléphone et horaires : non communiqués, volontairement laissés vides.
  street: "26 ter rue Jules Princet",
  address: "26 ter rue Jules Princet, 93600 Aulnay-sous-Bois",
  email: "Novraurban@gmail.com",
  instagram: { handle: "@novra_officiel", url: "https://www.instagram.com/novra_officiel/" },
  phone: "",
  hours: "",
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
