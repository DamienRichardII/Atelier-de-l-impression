// Informations à CONFIRMER par le client — aucune coordonnée n'est inventée.
export const site = {
  name: "L'Atelier de l'Impression",
  city: "Aulnay-sous-Bois",
  postalCode: "93600",
  // À renseigner par le client (laisser vide tant que non validé)
  phone: "",
  email: "",
  address: "",
  hours: "",
  nav: [
    { href: "/", label: "Accueil" },
    { href: "/prestations", label: "Nos prestations" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/personnalisation", label: "Personnalisation" },
    { href: "/realisations", label: "Réalisations" },
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
