"use client";
// Préparation des photos dans le navigateur : redimensionnement, WebP, et (produits) détourage du fond blanc.
export type ImageMode = "product" | "photo";

async function load(file: File): Promise<ImageBitmap> {
  try { return await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { throw new Error("Cette image ne peut pas être lue. Utilisez une photo JPG, PNG ou WEBP."); }
}
const toBlob = (c: HTMLCanvasElement, q: number) => new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Conversion impossible."))), "image/webp", q));

/** Retire le fond clair relié aux bords (photo produit sur fond blanc). Renvoie false si le fond n'est pas clair. */
function cutout(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const img = ctx.getImageData(0, 0, w, h); const d = img.data;
  const near = (i: number) => d[i] >= 236 && d[i + 1] >= 236 && d[i + 2] >= 236;
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
  if (!corners.every(near)) return false;
  const seen = new Uint8Array(w * h); const stack: number[] = [];
  const push = (x: number, y: number) => { const p = y * w + x; if (!seen[p] && near(p * 4)) { seen[p] = 1; stack.push(p); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop() as number; const x = p % w, y = (p - x) / w;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1);
  }
  for (let p = 0; p < seen.length; p++) if (seen[p]) d[p * 4 + 3] = 0;
  // Bord adouci : les pixels du fond voisins de l'objet deviennent semi-transparents pour éviter le liseré blanc.
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x; if (seen[p]) continue;
    if (seen[p - 1] || seen[p + 1] || seen[p - w] || seen[p + w]) { const i = p * 4; if (near(i)) d[i + 3] = 90; }
  }
  ctx.putImageData(img, 0, 0); return true;
}

export async function prepareImage(file: File, mode: ImageMode): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Choisissez une image.");
  const bmp = await load(file);
  const max = mode === "product" ? 1400 : 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: mode === "product" }); if (!ctx) throw new Error("Navigateur non compatible.");
  ctx.drawImage(bmp, 0, 0, w, h); bmp.close();
  if (mode === "photo") return toBlob(c, 0.82);
  cutout(ctx, w, h);
  // Cadrage commun à tous les produits du simulateur : 1000 × 1120, produit centré avec marge.
  const img = ctx.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (img[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0 || y1 <= y0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const out = document.createElement("canvas"); out.width = 1000; out.height = 1120;
  const octx = out.getContext("2d") as CanvasRenderingContext2D;
  const s = Math.min((1000 * 0.9) / cw, (1120 * 0.9) / ch);
  octx.drawImage(c, x0, y0, cw, ch, (1000 - cw * s) / 2, (1120 - ch * s) / 2, cw * s, ch * s);
  return toBlob(out, 0.85);
}

export async function uploadImage(blob: Blob, folder: "produits" | "galerie" | "couvertures"): Promise<string> {
  const f = new FormData(); f.set("file", new File([blob], "image.webp", { type: "image/webp" })); f.set("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: f });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Envoi impossible. Réessayez.");
  return data.url as string;
}
