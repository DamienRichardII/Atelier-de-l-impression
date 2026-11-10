// Données de démonstration — à remplacer par la table `products` (Supabase) via l'admin.
// Prix affichés (priceFrom) validés par le client ; le prix payé est celui de la base (atelier_products).
export type Face = "front" | "back" | "left" | "right" | "side" | "three-quarter";

export interface PrintZone { x: number; y: number; w: number; h: number } // en % du canevas

export interface ColorOption {
  name: string;
  hex: string;
  /** Photos réelles par face (fond transparent, cadrage commun 500x560). Absent = silhouette schématique. */
  photos?: Partial<Record<Face, string>>;
}

export interface ProductConfig {
  id: string;
  /** Famille d'affichage : les familles à plusieurs modèles ouvrent un menu déroulant. */
  family: string;
  name: string;
  colors: ColorOption[];
  sizes: string[];
  /** Fiche tissu communiquée par le client (affichée sous le choix du produit). */
  description?: string;
  /** Zone imprimable par vue. `null` = vue de présentation (pas de placement de logo). */
  faces: Partial<Record<Face, PrintZone | null>>;
  /** Zoom max cohérent avec la résolution réelle des photos (au-delà : pixellisation). */
  maxZoom?: number;
  price: number | null;
  /** Prix « à partir de » (€ TTC indicatif) communiqué par le client. Le prix payé est celui de la base de données. */
  priceFrom?: number;
}

const ph = (dir: string, c: string, faces: Face[]) =>
  Object.fromEntries(faces.map((f) => [f, `/products/${dir}/${c}-${f}.webp`])) as Partial<Record<Face, string>>;

/** Photos « /products/<dir>/<vue>.webp » (jeu natif, 4 vues). */
const pv = (dir: string, faces: Face[]) =>
  Object.fromEntries(faces.map((f) => [f, `/products/${dir}/${f}.webp`])) as Partial<Record<Face, string>>;

export const formatPriceFrom = (n: number) =>
  `À partir de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)}`;

export const products: ProductConfig[] = [
  {
    id: "t-shirt", family: "T-shirts", name: "T-shirt Unisex",
    description: "T-shirt col rond lycra, manches courtes, 190-200 g/m².",
    colors: [
      { name: "Noir", hex: "#111111", photos: ph("t-shirt", "noir", ["front", "back", "left", "right"]) },
      { name: "Naturel", hex: "#F8F5F0", photos: ph("t-shirt", "naturel", ["front"]) },
      { name: "Blanc chiné", hex: "#E5E6EB", photos: ph("t-shirt", "blanc-chine", ["front"]) },
      { name: "Rouge", hex: "#E73A37", photos: ph("t-shirt", "rouge", ["front"]) },
      { name: "Bleu", hex: "#4D64A7", photos: ph("t-shirt", "bleu", ["front"]) },
      { name: "Marine", hex: "#10172A", photos: ph("t-shirt", "marine", ["front"]) },
      { name: "Prune", hex: "#875262", photos: ph("t-shirt", "prune", ["front"]) },
      { name: "Rose pâle", hex: "#F4DBDE", photos: ph("t-shirt", "rose-pale", ["front"]) },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null, priceFrom: 15,
    faces: { front: { x: 34, y: 24, w: 32, h: 30 }, back: { x: 33, y: 20, w: 34, h: 38 }, left: { x: 34, y: 19, w: 18, h: 21 }, right: { x: 40, y: 19, w: 18, h: 21 } },
  },
  {
    id: "t-shirt-oversize", family: "T-shirts", name: "T-shirt ample 220 g",
    description: "T-shirt col rond, manches courtes, 220 g/m², coupe ample.",
    colors: [
      { name: "Blanc", hex: "#EAEAEA", photos: ph("t-shirt-oversize", "blanc", ["front"]) },
      { name: "Noir", hex: "#2A2526", photos: ph("t-shirt-oversize", "noir", ["front"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 15,
    faces: { front: { x: 34, y: 25, w: 32, h: 28 } },
  },
  {
    id: "t-shirt-chicago", family: "T-shirts", name: "T-shirt Chicago",
    description: "Chicago : t-shirt oversize col rond, coton, manches courtes, 240 g/m².",
    colors: [
      { name: "Naturel", hex: "#EEEDE9", photos: ph("t-shirt-chicago", "naturel", ["front"]) },
      { name: "Jaune pâle", hex: "#F0EAC8", photos: ph("t-shirt-chicago", "jaune-pale", ["front"]) },
      { name: "Camel", hex: "#B8854E", photos: ph("t-shirt-chicago", "camel", ["front"]) },
      { name: "Sable", hex: "#A19975", photos: ph("t-shirt-chicago", "sable", ["front"]) },
      { name: "Rose", hex: "#B8738F", photos: ph("t-shirt-chicago", "rose", ["front"]) },
      { name: "Bordeaux délavé", hex: "#6C243B", photos: ph("t-shirt-chicago", "bordeaux", ["front"]) },
      { name: "Ardoise délavé", hex: "#53526D", photos: ph("t-shirt-chicago", "ardoise", ["front"]) },
      { name: "Kaki délavé", hex: "#6F674A", photos: ph("t-shirt-chicago", "kaki", ["front"]) },
      { name: "Anthracite délavé", hex: "#4B4A4E", photos: ph("t-shirt-chicago", "anthracite", ["front"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 15,
    faces: { front: { x: 34, y: 27, w: 32, h: 26 } },
  },
  {
    id: "capuche-320", family: "Sweats à capuche", name: "Sweat à capuche 320 g",
    description: "Sweat à capuche manches longues, poche kangourou, capuche doublée, cordon de serrage ton sur ton finition métal. 70 % coton, 30 % polyester, molleton 320 g/m², sans étiquette.",
    colors: [
      { name: "Noir", hex: "#222222", photos: ph("capuche-320", "noir", ["front"]) },
      { name: "Marine", hex: "#1F1D28", photos: ph("capuche-320", "marine", ["front", "back"]) },
      { name: "Gris chiné", hex: "#B6B5B6", photos: ph("capuche-320", "gris-chine", ["front", "back"]) },
      { name: "Blanc", hex: "#F1F0F5", photos: ph("capuche-320", "blanc", ["front", "back"]) },
      { name: "Beige", hex: "#F5D7B1", photos: ph("capuche-320", "beige", ["front", "back"]) },
      { name: "Bleu ciel", hex: "#B2CDD8", photos: ph("capuche-320", "bleu-ciel", ["front", "back"]) },
      { name: "Bleu roi", hex: "#014B92", photos: ph("capuche-320", "bleu-roi", ["front", "back"]) },
      { name: "Rouge", hex: "#E81225", photos: ph("capuche-320", "rouge", ["front", "back"]) },
      { name: "Bordeaux", hex: "#71152A", photos: ph("capuche-320", "bordeaux", ["front"]) },
      { name: "Marron", hex: "#4F3834", photos: ph("capuche-320", "marron", ["front", "back"]) },
      { name: "Mauve", hex: "#BF85AE", photos: ph("capuche-320", "mauve", ["front", "back"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 25,
    // Vues de dos fournies pour tous les coloris sauf noir et bordeaux.
    faces: { front: { x: 32, y: 36, w: 34, h: 22 }, back: { x: 30, y: 38, w: 40, h: 36 } },
  },
  {
    id: "capuche-zip", family: "Sweats à capuche", name: "Sweat zippé à capuche 320 g",
    description: "Sweat à capuche zippé manches longues, 2 poches latérales, capuche doublée, cordon de serrage ton sur ton, fermeture éclair YKK. 70 % coton peigné, 30 % polyester, molleton 320 g/m², sans étiquette.",
    colors: [
      { name: "Noir", hex: "#1E1E1E", photos: ph("capuche-zip", "noir", ["front", "back"]) },
      { name: "Marine", hex: "#1F2640", photos: ph("capuche-zip", "marine", ["front", "back"]) },
      { name: "Gris chiné", hex: "#B9BBBF", photos: ph("capuche-zip", "gris-chine", ["front", "back"]) },
      { name: "Anthracite", hex: "#4A4A4C", photos: ph("capuche-zip", "anthracite", ["front", "back"]) },
      { name: "Bleu roi", hex: "#0B5FC4", photos: ph("capuche-zip", "bleu-roi", ["front", "back"]) },
      { name: "Bordeaux", hex: "#7A1426", photos: ph("capuche-zip", "bordeaux", ["front", "back"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 25,
    // Face : cœur de poitrine (le zip coupe la face en deux). Dos : grande zone.
    faces: { front: { x: 56, y: 24, w: 14, h: 10 }, back: { x: 26.5, y: 39.5, w: 46.5, h: 38 } },
  },
  {
    id: "sweat-320", family: "Sweats col rond", name: "Sweat col rond 320 g",
    description: "Sweat-shirt col rond avec bande de propreté, sans étiquette. 70 % coton, 30 % polyester, molleton 320 g/m². Tailles adultes XS à 2XL.",
    colors: [
      { name: "Noir", hex: "#1B1B1B", photos: ph("sweat-320", "noir", ["front", "back"]) },
      { name: "Marine", hex: "#222B44", photos: ph("sweat-320", "marine", ["front", "back"]) },
      { name: "Gris chiné", hex: "#B3B5B8", photos: ph("sweat-320", "gris-chine", ["front", "back"]) },
      { name: "Bordeaux", hex: "#6E1426", photos: ph("sweat-320", "bordeaux", ["front", "back"]) },
      { name: "Beige", hex: "#EBCFA8", photos: ph("sweat-320", "beige", ["front", "back"]) },
      { name: "Blanc", hex: "#F5F5F6", photos: ph("sweat-320", "blanc", ["front", "back"]) },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"], price: null, priceFrom: 25,
    faces: { front: { x: 35, y: 28, w: 30, h: 19 }, back: { x: 33, y: 30, w: 34, h: 34 } },
  },
  {
    id: "polo", family: "Polo", name: "Polo",
    description: "Polo manches courtes en maille piquée, deux rayures en relief au col, fentes latérales, bouton ton sur ton. 100 % coton, 210-220 g/m², sans étiquette.",
    colors: [
      { name: "Noir", hex: "#111111", photos: pv("polo", ["front", "back", "side", "three-quarter"]) },
      { name: "Blanc", hex: "#F4F4F4", photos: ph("polo", "blanc", ["front", "back"]) },
      { name: "Marine", hex: "#141A33", photos: ph("polo", "marine", ["front", "back"]) },
      { name: "Bleu azur", hex: "#3A78BE", photos: ph("polo", "azur", ["front", "back"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 17, maxZoom: 1.5,
    faces: { front: { x: 33, y: 40, w: 34, h: 22 }, side: { x: 51, y: 27, w: 13, h: 14 }, back: { x: 33, y: 35, w: 34, h: 32 }, "three-quarter": null },

  },
  {
    id: "casquette", family: "Casquettes & bonnets", name: "Casquette 5 pans",
    description: "Casquette 5 pans : panneau avant structuré, visière préformée en polyéthylène recyclé, fermeture ajustable par boucle métal, œillets de ventilation. Tour de tête 58 cm.",
    colors: [
      { name: "Noir", hex: "#1F1F21", photos: ph("casquette", "noir", ["front", "back"]) },
      { name: "Blanc", hex: "#E6E6E6", photos: ph("casquette", "blanc", ["front"]) },
      { name: "Gris graphite", hex: "#56565E", photos: ph("casquette", "graphite", ["front"]) },
      { name: "Rouge", hex: "#A91A2E", photos: ph("casquette", "rouge", ["front"]) },
      { name: "Bleu roi", hex: "#223B7E", photos: ph("casquette", "bleu-roi", ["front"]) },
      { name: "Marine", hex: "#1F2337", photos: ph("casquette", "marine", ["front"]) },
      { name: "Bordeaux", hex: "#4E2337", photos: ph("casquette", "bordeaux", ["front"]) },
      { name: "Vert bouteille", hex: "#133228", photos: ph("casquette", "vert-bouteille", ["front"]) },
      { name: "Vert militaire", hex: "#44473C", photos: ph("casquette", "vert-militaire", ["front"]) },
    ],
    sizes: ["Unique"], price: null, priceFrom: 15, maxZoom: 1.5,
    // Nouvelle série de photos (visière à droite) : la vue de côté d'origine n'est plus proposée.
    faces: { front: { x: 39, y: 46.5, w: 27.5, h: 17.5 }, back: { x: 38, y: 42, w: 23.5, h: 17.5 } },
  },

  {
    id: "casquette-patch", family: "Casquettes & bonnets", name: "Casquette à patch",
    description: "Casquette 5 pans avec patch amovible : visière pré-courbée, empiècement dos en Rip-Strip™, œillets cousus, ajustable par patte, étiquette détachable. Compatible patchs BF841 et BF600. Tour de tête 58 cm.",
    colors: [
      { name: "Noir", hex: "#1F1F1F", photos: ph("casquette-patch", "noir", ["front", "back"]) },
      { name: "Vert militaire", hex: "#494733", photos: ph("casquette-patch", "vert", ["front", "back"]) },
      { name: "Sable", hex: "#887D5F", photos: ph("casquette-patch", "sable", ["front"]) },
      { name: "Camouflage", hex: "#37372B", photos: ph("casquette-patch", "camo", ["front"]) },
    ],
    sizes: ["Unique"], price: null, priceFrom: 15, maxZoom: 1.25,
    faces: { front: { x: 47.5, y: 42, w: 28.5, h: 21 }, back: { x: 44, y: 43, w: 30, h: 14 } },
  },

  {
    id: "gilet", family: "Gilet softshell", name: "Gilet softshell",
    description: "Bodywarmer softshell 3 couches : tissu contrecollé avec membrane respirante et imperméable. 2 poches zippées latérales, 1 poche poitrine. Respirabilité jusqu'à 14 232 g/m²/24h, imperméabilité jusqu'à 8 173 mmH₂O.",
    colors: [
      { name: "Noir", hex: "#111111", photos: pv("gilet", ["front", "back"]) },
      { name: "Marine", hex: "#062247", photos: ph("gilet", "marine", ["front", "back"]) },
      { name: "Bleu roi", hex: "#0A35A0", photos: ph("gilet", "bleu-roi", ["front", "back"]) },
      { name: "Gris foncé", hex: "#3D3D3D", photos: ph("gilet", "gris-fonce", ["front", "back"]) },
      { name: "Gris chiné", hex: "#687170", photos: ph("gilet", "gris-chine", ["front", "back"]) },
      // Rouge : seule la vue dos a été fournie.
      { name: "Rouge", hex: "#E72C44", photos: ph("gilet", "rouge", ["back"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 10, maxZoom: 1.5,
    faces: { front: { x: 54, y: 31, w: 14, h: 12 }, back: { x: 33, y: 30, w: 34, h: 30 } },
  },
  {
    id: "veste-polaire", family: "Vestes polaires", name: "Veste polaire",
    description: "Veste polaire moderne à grand zip. 2 poches zippées sur les côtés. Zip principal et zips de poches contrastés. Polaire 300 g/m².",
    colors: [
      { name: "Noir", hex: "#1A1617", photos: ph("veste-polaire", "noir", ["front", "back"]) },
      { name: "Gris", hex: "#5A5A58", photos: ph("veste-polaire", "gris", ["front", "back"]) },
      { name: "Rouge", hex: "#9D041F", photos: ph("veste-polaire", "rouge", ["front", "back"]) },
      { name: "Bleu roi", hex: "#1C5A9A", photos: ph("veste-polaire", "bleu-roi", ["front", "back"]) },
      { name: "Orange", hex: "#FB6903", photos: ph("veste-polaire", "orange", ["front", "back"]) },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 27, maxZoom: 1.5,
    // Face : cœur de poitrine (le zip coupe la face en deux). Dos : grande zone.
    faces: { front: { x: 54.5, y: 29, w: 13, h: 9 }, back: { x: 29, y: 30, w: 42, h: 36 } },
  },
  {
    id: "bonnet", family: "Casquettes & bonnets", name: "Bonnet",
    description: "Bonnet Thinsulate™ avec patch amovible : tissu double épaisseur, empiècement coton sergé Rip-Strip™ interchangeable (compatible patchs BF600). 100 % acrylique Soft-Touch, doublure Thinsulate™ 65 % polypropylène, 35 % polyester.",
    colors: [
      { name: "Noir", hex: "#1C1C1C", photos: ph("bonnet", "noir", ["three-quarter"]) },
      { name: "Gris graphite", hex: "#464446", photos: ph("bonnet", "graphite", ["three-quarter"]) },
      { name: "Marine", hex: "#202533", photos: ph("bonnet", "marine", ["three-quarter"]) },
      { name: "Vert militaire", hex: "#444335", photos: ph("bonnet", "vert", ["three-quarter"]) },
    ],
    sizes: ["Unique"], price: null, priceFrom: 15, maxZoom: 1.25,
    faces: { "three-quarter": { x: 56.5, y: 44, w: 34.5, h: 25.5 } },
  },

  {
    id: "tablier", family: "Tablier", name: "Tablier à bavette",
    description: "Tablier à bavette avec poche, 100 % coton, encolure arrondie, boucle plastique pour ajuster la bretelle. Hauteur 90 cm, largeur 75 cm. Lavage à 60 °C.",
    colors: [
      { name: "Noir", hex: "#2E2E2E", photos: ph("tablier", "noir", ["front"]) },
      { name: "Anthracite", hex: "#373F47", photos: ph("tablier", "anthracite", ["front"]) },
      { name: "Marine", hex: "#32405B", photos: ph("tablier", "marine", ["front"]) },
      { name: "Gris", hex: "#9D9D9D", photos: ph("tablier", "gris", ["front"]) },
      { name: "Camel", hex: "#B09981", photos: ph("tablier", "camel", ["front"]) },
      { name: "Jaune", hex: "#EEA42E", photos: ph("tablier", "jaune", ["front"]) },
      { name: "Orange", hex: "#DF7237", photos: ph("tablier", "orange", ["front"]) },
      { name: "Rouge", hex: "#C42030", photos: ph("tablier", "rouge", ["front"]) },
    ],
    sizes: ["Taille unique"], price: null, priceFrom: 15, maxZoom: 1.5,
    // Zone sur la bavette (au-dessus de la poche).
    faces: { front: { x: 39.5, y: 25, w: 21, h: 22 } },
  },
  {
    id: "gilet-securite", family: "Gilet de sécurité", name: "Gilet de sécurité",
    description: "Gilet de sécurité à bandes réfléchissantes, certifié EN ISO 20471:2013 + A1:2016 (XL : classe 1 ; à partir de XXL : classe 2). 2 bandes horizontales cousues, fermeture Velcro®.",
    colors: [
      { name: "Jaune fluo", hex: "#E3E81F", photos: ph("gilet-securite", "jaune", ["front", "back"]) },
      { name: "Blanc", hex: "#F4F4F4", photos: ph("gilet-securite", "blanc", ["front", "back"]) },
      { name: "Bleu roi", hex: "#2E3D93", photos: ph("gilet-securite", "bleu-roi", ["front", "back"]) },
      { name: "Bleu clair", hex: "#3F78C8", photos: ph("gilet-securite", "bleu-clair", ["front"]) },
      { name: "Vert", hex: "#6ED05F", photos: ph("gilet-securite", "vert", ["front"]) },
    ],
    sizes: ["XL", "XXL", "3XL"], price: null, priceFrom: 10, maxZoom: 1.5,
    // Dos : panneau central entre les bandes. Face : poitrine gauche, entre bande et ouverture (zone étroite).
    faces: { front: { x: 33.5, y: 24, w: 11, h: 18 }, back: { x: 32, y: 23, w: 36, h: 30 } },
  },
  {
    id: "pantalon", family: "Pantalon", name: "Pantalon",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("pantalon", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 20, maxZoom: 1.5,
    faces: { front: { x: 35, y: 33, w: 12, h: 14 }, side: { x: 42, y: 24, w: 16, h: 18 }, back: { x: 36, y: 30, w: 28, h: 14 }, "three-quarter": null },

  },
];

/**
 * Produits retirés du site en attendant de meilleures photos (fichiers conservés dans /public/products).
 * Pour les remettre : déplacer l'objet voulu dans le tableau `products` ci-dessus.
 */
export const productsHidden: ProductConfig[] = [
  {
    id: "tote-bag", family: "Tote bag", name: "Tote bag",
    colors: [{ name: "Écru", hex: "#E6DCC8", photos: pv("tote-bag", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["Unique"], price: null, priceFrom: 10, maxZoom: 1.5,
    faces: { front: { x: 31, y: 52, w: 38, h: 30 }, back: { x: 31, y: 52, w: 38, h: 30 }, side: null, "three-quarter": null },

  },
  {
    id: "sac-a-dos", family: "Sac à dos", name: "Sac à dos",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("sac-a-dos", "base", ["front", "side", "back"]) }],
    sizes: ["Unique"], price: null, priceFrom: 20, maxZoom: 1.25,
    faces: { front: { x: 30, y: 33, w: 40, h: 18 }, side: { x: 38, y: 34, w: 22, h: 22 }, back: { x: 40, y: 34, w: 20, h: 24 } },
  },
];
