import DOMPurify from "isomorphic-dompurify";

export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Nettoie un SVG : supprime scripts, foreignObject, handlers on*, liens externes. */
export function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject", "iframe", "object", "embed", "image", "use"],
    FORBID_ATTR: ["href", "xlink:href", "onload", "onclick", "onerror"],
  });
}

export type LogoLoadResult = { ok: true; dataUrl: string; file: File } | { ok: false; error: string };

export async function loadLogoFile(file: File): Promise<LogoLoadResult> {
  if (!ACCEPTED.includes(file.type)) return { ok: false, error: "Format non accepté (PNG, JPG, WEBP ou SVG)." };
  if (file.size > MAX_LOGO_BYTES) return { ok: false, error: "Fichier trop lourd (5 Mo maximum)." };
  if (file.type === "image/svg+xml") {
    const clean = sanitizeSvg(await file.text());
    if (!clean.includes("<svg")) return { ok: false, error: "SVG invalide ou non sécurisé." };
    const blob = new Blob([clean], { type: "image/svg+xml" });
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(blob);
    });
    return { ok: true, dataUrl, file: new File([blob], file.name, { type: "image/svg+xml" }) };
  }
  const dataUrl = await new Promise<string>((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(file);
  });
  return { ok: true, dataUrl, file };
}

/** Rend transparent le fond blanc/quasi blanc d'une image raster (option utilisateur). */
export function removeWhiteBackground(dataUrl: string, tolerance = 28): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i] > 255 - tolerance && d.data[i + 1] > 255 - tolerance && d.data[i + 2] > 255 - tolerance) d.data[i + 3] = 0;
      }
      ctx.putImageData(d, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
