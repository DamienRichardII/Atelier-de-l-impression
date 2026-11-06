# L'Atelier de l'Impression — site + simulateur

Next.js 16 (App Router) · TypeScript · Tailwind 4 · Motion · Konva (react-konva) · Supabase · SumUp.

## État réel (honnête)
| Élément | État |
|---|---|
| Design N&B, logos officiels extraits (transparents), header/footer, hero | Fait, vérifié (captures 320→1440 px, 0 débordement) |
| Accueil (produits, étapes, simulateur, FAQ) | Fait ; photos = placeholders |
| Simulateur 2D (Konva) : produit, couleur, face, import logo (PNG/JPG/WEBP/SVG nettoyé), déplacer/zoomer/pivoter, presets, zones imprimables, fond clair/foncé, export PNG | Fait, testé (import + export Playwright) |
| Rotation 3D | NON : vues avant/arrière uniquement tant qu'aucun modèle 3D n'est fourni |
| Formulaire devis intégré (/personnalisation#devis) + API `/api/quotes` (zod, honeypot, rate limit, stockage privé) | Écrit, NON testé de bout en bout (clé service Supabase requise) |
| Migration Supabase `atelier_*` + RLS + bucket privé | Appliquée sur le projet Supabase fourni (tables préfixées, existant NOVRA intact) |
| SumUp (création + vérification serveur du checkout) | Module écrit, NON testé (clés sandbox requises) |
| Admin /admin, panier, catalogue dynamique, prestations, réalisations, pages légales | Squelettes seulement |
| Emails (Resend), PDF devis, Lighthouse | À faire |

## Démarrage
```
cp .env.example .env.local   # renseigner SUPABASE_SERVICE_ROLE_KEY, SUMUP_*, RESEND_API_KEY
npm i && npm run dev
```
Ne jamais committer `.env.local`. La clé service-role reste côté serveur.
