import type { Face } from "@/config/products";

export interface LogoPlacement {
  dataUrl: string;
  fileName: string;
  // position du centre en % du canevas, échelle relative à la zone imprimable
  cx: number; cy: number; scale: number; rotation: number;
}

export interface Configuration {
  productId: string;
  color: string;
  faces: Partial<Record<Face, LogoPlacement>>;
  quantity: number;
  sizes: Record<string, number>;
  technique?: string;
  desiredDate?: string;
  comments?: string;
}
