/**
 * Contrôle serveur des SVG, SANS jsdom (isomorphic-dompurify plante sur Vercel : ERR_REQUIRE_ESM → erreur 500).
 * Stratégie prudente : au lieu de « réparer » un SVG par expressions régulières, on le REFUSE s'il contient
 * quoi que ce soit d'actif (script, gestionnaires on*, liens, éléments externes, entités/DOCTYPE).
 * Le fichier est de toute façon stocké dans un bucket privé, jamais servi publiquement.
 */
const FORBIDDEN = [
  /<\s*script/i, /<\s*foreignObject/i, /<\s*iframe/i, /<\s*object/i, /<\s*embed/i, /<\s*use[\s>/]/i, /<\s*image[\s>/]/i,
  /<\s*animate/i, /<\s*set[\s>/]/i, /<\s*link/i, /<\s*style[^>]*@import/i,
  /\son[a-z]+\s*=/i, /javascript\s*:/i, /data\s*:\s*text\/html/i, /(xlink:)?href\s*=/i,
  /<!\s*DOCTYPE/i, /<!\s*ENTITY/i, /url\s*\(\s*['"]?\s*(https?:|\/\/|data:)/i,
];

/** Renvoie le SVG tel quel s'il est sûr, sinon null (le fichier n'est alors pas stocké). */
export function sanitizeSvgServer(raw: string): string | null {
  if (raw.length > 5 * 1024 * 1024 || !/<svg[\s>]/i.test(raw)) return null;
  return FORBIDDEN.some((re) => re.test(raw)) ? null : raw;
}
