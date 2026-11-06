// Données de démonstration — à remplacer par la table `products` (Supabase) via l'admin.
// Aucun prix inventé : price = null → devis obligatoire.
export type Face = "front" | "back" | "left" | "right" | "side";

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
  faces: Partial<Record<Face, PrintZone>>;
  price: number | null;
}

const ph = (dir: string, c: string, faces: Face[]) =>
  Object.fromEntries(faces.map((f) => [f, `/products/${dir}/${c}-${f}.webp`])) as Partial<Record<Face, string>>;

export const products: ProductConfig[] = [
  {
    id: "t-shirt", name: "T-shirt",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("t-shirt", "noir", ["front", "back", "left", "right"]) }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], price: null,
    faces: { front: { x: 34, y: 24, w: 32, h: 30 }, back: { x: 33, y: 20, w: 34, h: 38 }, left: { x: 34, y: 19, w: 18, h: 21 }, right: { x: 40, y: 19, w: 18, h: 21 } },
  },
  {
    id: "capuche", name: "Sweat à capuche",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("capuche", "noir", ["front", "back", "left", "right"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null,
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
    colors: [{ name: "Noir", hex: "#111111", photos: ph("polo", "base", ["front", "side", "back"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null,
    faces: { front: { x: 33, y: 40, w: 34, h: 22 }, side: { x: 51, y: 27, w: 13, h: 14 }, back: { x: 33, y: 35, w: 34, h: 32 } },
  },
  {
    id: "casquette", name: "Casquette",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("casquette", "base", ["front", "side", "back"]) }],
    sizes: ["Unique"], price: null,
    faces: { front: { x: 34, y: 34, w: 32, h: 18 }, side: { x: 52, y: 39, w: 22, h: 17 }, back: { x: 36, y: 36, w: 28, h: 14 } },
  },
  {
    id: "tote-bag", name: "Tote bag",
    colors: [{ name: "Écru", hex: "#E6DCC8", photos: ph("tote-bag", "base", ["front", "back"]) }],
    sizes: ["Unique"], price: null,
    faces: { front: { x: 31, y: 52, w: 38, h: 30 }, back: { x: 31, y: 52, w: 38, h: 30 } },
  },
  {
    id: "mug", name: "Mug",
    colors: [{ name: "Blanc", hex: "#FFFFFF", photos: ph("mug", "base", ["front", "back"]) }],
    sizes: ["Unique"], price: null,
    faces: { front: { x: 20, y: 32, w: 36, h: 34 }, back: { x: 31, y: 31, w: 38, h: 36 } },
  },
  {
    id: "pantalon", name: "Pantalon",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("pantalon", "base", ["front", "side", "back"]) }],
    sizes: ["S", "M", "L", "XL", "XXL"], price: null,
    faces: { front: { x: 35, y: 33, w: 12, h: 14 }, side: { x: 42, y: 24, w: 16, h: 18 }, back: { x: 36, y: 30, w: 28, h: 14 } },
  },
  {
    id: "sac-a-dos", name: "Sac à dos",
    colors: [{ name: "Noir", hex: "#111111", photos: ph("sac-a-dos", "base", ["front", "side", "back"]) }],
    sizes: ["Unique"], price: null,
    faces: { front: { x: 30, y: 33, w: 40, h: 18 }, side: { x: 38, y: 34, w: 22, h: 22 }, back: { x: 40, y: 34, w: 20, h: 24 } },
  },
];
