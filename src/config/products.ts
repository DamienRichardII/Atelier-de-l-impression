// Données de démonstration — à remplacer par la table `products` (Supabase) via l'admin.
// Aucun prix inventé : price = null → devis obligatoire.
export type Face = "front" | "back" | "left" | "right";

export interface PrintZone { x: number; y: number; w: number; h: number } // en % du canevas

export interface ProductConfig {
  id: string;
  name: string;
  colors: { name: string; hex: string }[];
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

export const products: ProductConfig[] = [
  { id: "t-shirt", name: "T-shirt", colors, sizes: ["XS", "S", "M", "L", "XL", "XXL"], faces: shirtZones, price: null },
  { id: "sweat", name: "Sweat", colors, sizes: ["S", "M", "L", "XL", "XXL"], faces: shirtZones, price: null },
  { id: "polo", name: "Polo", colors, sizes: ["S", "M", "L", "XL", "XXL"], faces: { front: { x: 56, y: 26, w: 16, h: 14 }, back: shirtZones.back }, price: null },
  { id: "casquette", name: "Casquette", colors, sizes: ["Unique"], faces: { front: { x: 33, y: 30, w: 34, h: 24 } }, price: null },
  { id: "tote-bag", name: "Tote bag", colors, sizes: ["Unique"], faces: { front: { x: 25, y: 38, w: 50, h: 40 }, back: { x: 25, y: 38, w: 50, h: 40 } }, price: null },
  { id: "mug", name: "Mug", colors: [colors[0], colors[1]], sizes: ["Unique"], faces: { front: { x: 28, y: 30, w: 44, h: 36 } }, price: null },
];
