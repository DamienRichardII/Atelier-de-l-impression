// Pop-up Black Friday : tout se règle ici (aucun montant n'est inventé : saisir l'offre réelle de l'atelier).
export const blackFriday = {
  enabled: true,
  // Fenêtre d'affichage (heure de Paris, incluses).
  from: "2026-11-23",
  to: "2026-11-30",
  title: "Nos offres Black Friday",
  // Texte sous l'image. Exemple à adapter : « -20 % sur toute la personnalisation jusqu'au 30 novembre ».
  message: "Profitez de nos offres exceptionnelles sur l'impression et la personnalisation de vos textiles. Du 23 au 30 novembre.",
  cta: { label: "Personnaliser un produit", href: "/personnalisation" },
  note: "Impression DTF haute qualité · Retrait à l'atelier à Aulnay-sous-Bois",
  // Version : changer cette valeur pour réafficher le pop-up à ceux qui l'ont déjà fermé.
  version: "bf-2026",
} as const;
