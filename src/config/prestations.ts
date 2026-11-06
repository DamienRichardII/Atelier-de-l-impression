// Contenu inspiré de la maquette fournie par le client — À VALIDER par L'Atelier de l'Impression avant publication.
// Aucun chiffre ni délai promis ici : les engagements (délais, gratuité des devis…) ne sont publiés qu'après accord.
import { Coffee, Droplet, FileText, Gift, Layers, Printer, Scissors, Shirt, ShoppingBag, Sun, Tag, type LucideIcon } from "lucide-react";

export interface Service { title: string; text: string; icon: LucideIcon; href: string }
export const services: Service[] = [
  { title: "Textile personnalisé", text: "T-shirt, polo, sweat, hoodie, jogger… à votre image.", icon: Shirt, href: "/personnalisation" },
  { title: "Objets publicitaires", text: "Mug, gourde, stylo, clé USB, accessoires personnalisés.", icon: Coffee, href: "/contact" },
  { title: "Bagagerie", text: "Tote bag, sac à dos, sac de sport, trousse…", icon: ShoppingBag, href: "/contact" },
  { title: "Supports de communication", text: "Flyer, carte de visite, affiche, brochure, roll-up…", icon: FileText, href: "/contact" },
  { title: "Cadeaux d'entreprise", text: "Coffrets personnalisés, packs événementiels, welcome pack…", icon: Gift, href: "/contact" },
  { title: "Marquage spécifique", text: "Sérigraphie, flocage, broderie, DTF, sublimation…", icon: Tag, href: "/contact" },
];

export const techniques: { label: string; icon: LucideIcon }[] = [
  { label: "Sérigraphie", icon: Layers },
  { label: "Flocage", icon: Shirt },
  { label: "Broderie", icon: Scissors },
  { label: "DTF", icon: Printer },
  { label: "Sublimation", icon: Droplet },
  { label: "Impression UV", icon: Sun },
];
