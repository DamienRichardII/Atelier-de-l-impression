import { sanitizeSvg } from "./svg";

/** Même nettoyage côté serveur : on ne fait jamais confiance au client. */
export function sanitizeSvgServer(raw: string) {
  return sanitizeSvg(raw);
}
