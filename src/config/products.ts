// Données de démonstration — à remplacer par la table `products` (Supabase) via l'admin.
// Aucun prix inventé : price = null → devis obligatoire.
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
  name: string;
  colors: ColorOption[];
  sizes: string[];
  /** Zone imprimable par vue. `null` = vue de présentation (pas de placement de logo). */
  faces: Partial<Record<Face, PrintZone | null>>;
  /** Zoom max cohérent avec la résolution réelle des photos (au-delà : pixellisation). */
  maxZoom?: number;
  price: number | null;
  /** Prix « à partir de » (€ TTC indicatif) communiqué par le client. Le prix final est confirmé par devis. */
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
    id: "t-shirt", name: "T-shirt",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("t-shirt", "noir", ["front", "back", "left", "right"]) }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null, priceFrom: 15,
    faces: { front: { x: 34, y: 24, w: 32, h: 30 }, back: { x: 33, y: 20, w: 34, h: 38 }, left: { x: 34, y: 19, w: 18, h: 21 }, right: { x: 40, y: 19, w: 18, h: 21 } },
  },
  {
    id: "capuche", name: "Sweat à capuche",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("capuche", "noir", ["front", "back", "left", "right"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 22,
    faces: { front: { x: 34, y: 34, w: 32, h: 19 }, back: { x: 33, y: 38, w: 34, h: 36 }, left: { x: 38, y: 26, w: 22, h: 28 }, right: { x: 37, y: 26, w: 22, h: 28 } },
  },
  {
    id: "sweat", name: "Sweat col rond",
    // Pas de photo de face fournie pour ce modèle : seules les vues dos et côté gauche sont proposées.
    colors: [{ name: "Gris perle", hex: "#CFCDCA", photos: ph("sweat", "gris", ["back", "left"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null,
    faces: { back: { x: 34, y: 17, w: 32, h: 42 }, left: { x: 41, y: 20, w: 22, h: 34 } },
  },
  {
    id: "polo", name: "Polo",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("polo", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, priceFrom: 17, maxZoom: 1.5,
    faces: { front: { x: 33, y: 40, w: 34, h: 22 }, side: { x: 51, y: 27, w: 13, h: 14 }, back: { x: 33, y: 35, w: 34, h: 32 }, "three-quarter": null },

  },
  {
    id: "casquette", name: "Casquette",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("casquette", ["front", "side", "back"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.5,
    faces: { front: { x: 40, y: 52, w: 30, h: 16 }, side: { x: 40, y: 50, w: 28, h: 16 }, back: { x: 28, y: 58, w: 30, h: 14 } },
  },
  {
    id: "casquette-patch", name: "Casquette à patch",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("casquette-patch", ["front"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.25,
    faces: { front: { x: 48, y: 43, w: 26, h: 22 } },
  },
  {
    id: "gilet", name: "Gilet softshell",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("gilet", ["front", "back"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, maxZoom: 1.5,
    faces: { front: { x: 54, y: 31, w: 14, h: 12 }, back: { x: 33, y: 30, w: 34, h: 30 } },
  },
  {
    id: "bonnet", name: "Bonnet",
    colors: [{ name: "Noir", hex: "#333333", photos: pv("bonnet", ["three-quarter"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.25,
    faces: { "three-quarter": { x: 54, y: 62, w: 28, h: 16 } },
  },
  {
    id: "pantalon", name: "Pantalon",
    colors: [{ name: "Noir", hex: "#111111", photos: pv("pantalon", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null, maxZoom: 1.5,
    faces: { front: { x: 35, y: 33, w: 12, h: 14 }, side: { x: 42, y: 24, w: 16, h: 18 }, back: { x: 36, y: 30, w: 28, h: 14 }, "three-quarter": null },

  },
];

/**
 * Produits retirés du site en attendant de meilleures photos (fichiers conservés dans /public/products).
 * Pour les remettre : déplacer l'objet voulu dans le tableau `products` ci-dessus.
 */
export const productsHidden: ProductConfig[] = [
  {
    id: "tote-bag", name: "Tote bag",
    colors: [{ name: "Écru", hex: "#E6DCC8", photos: pv("tote-bag", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.5,
    faces: { front: { x: 31, y: 52, w: 38, h: 30 }, back: { x: 31, y: 52, w: 38, h: 30 }, side: null, "three-quarter": null },

  },
  {
    id: "mug", name: "Mug",
    colors: [{ name: "Blanc", hex: "#FFFFFF", photos: pv("mug", ["front", "back", "side", "three-quarter"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.5,
    faces: { front: { x: 20, y: 32, w: 36, h: 34 }, back: { x: 31, y: 31, w: 38, h: 36 }, side: null, "three-quarter": null },

  },
  {
    id: "sac-a-dos", name: "Sac à dos",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("sac-a-dos", "base", ["front", "side", "back"]) }],
    sizes: ["Unique"], price: null, maxZoom: 1.25,
    faces: { front: { x: 30, y: 33, w: 40, h: 18 }, side: { x: 38, y: 34, w: 22, h: 22 }, back: { x: 40, y: 34, w: 20, h: 24 } },
  },
];
