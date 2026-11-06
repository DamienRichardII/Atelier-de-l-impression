// Données de démonstration — à remplacer par la table `products` (Supabase) via l'admin.
// Aucun prix inventé : price = null → devis obligatoire.
export type Face = "front" | "back" | "left" | "right";

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

const shirtZones = {
  front: { x: 32, y: 26, w: 36, h: 38 },
  back: { x: 30, y: 22, w: 40, h: 46 },
};
const colors = [
  { name: "Blanc", hex: "#FFFFFF" },
  { name: "Noir", hex: "#111111" },
  { name: "Gris", hex: "#9CA3AF" },
];

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
  { id: "polo", name: "Polo", colors, sizes: ["S", "M", "L", "XL", "XXL"], faces: { front: { x: 56, y: 26, w: 16, h: 14 }, back: shirtZones.back }, price: null },
  { id: "casquette", name: "Casquette", colors, sizes: ["Unique"], faces: { front: { x: 33, y: 30, w: 34, h: 24 } }, price: null },
  { id: "tote-bag", name: "Tote bag", colors, sizes: ["Unique"], faces: { front: { x: 25, y: 38, w: 50, h: 40 }, back: { x: 25, y: 38, w: 50, h: 40 } }, price: null },
  { id: "mug", name: "Mug", colors: [colors[0], colors[1]], sizes: ["Unique"], faces: { front: { x: 28, y: 30, w: 44, h: 36 } }, price: null },
];
