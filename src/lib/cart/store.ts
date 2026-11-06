"use client";
import { useSyncExternalStore } from "react";

export interface CartItem {
  id: string; productId: string; productName: string; color: string;
  sizes: Record<string, number>; assetsId: string | null; thumb: string | null; hasLogo: boolean;
}
const KEY = "atelier-cart-v1";
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[]; } catch { cache = []; }
  return cache;
}
function write(items: CartItem[]) {
  cache = items;
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage indisponible : le panier reste en mémoire */ }
  listeners.forEach((l) => l());
}
export const cart = {
  add(item: Omit<CartItem, "id">) { write([...read(), { ...item, id: crypto.randomUUID() }]); },
  remove(id: string) { write(read().filter((i) => i.id !== id)); },
  setSizes(id: string, sizes: Record<string, number>) { write(read().map((i) => (i.id === id ? { ...i, sizes } : i))); },
  clear() { write([]); },
};
export const itemQty = (i: CartItem) => Object.values(i.sizes).reduce((a, b) => a + b, 0);

const EMPTY: CartItem[] = [];
export function useCart() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read, () => EMPTY,
  );
}
