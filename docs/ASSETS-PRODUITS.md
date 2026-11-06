# Photos produits du simulateur — cahier des charges

## État au 6 novembre 2026
| Produit | Vues en place | Source | Résolution réelle |
|---|---|---|---|
| Polo, Pantalon, Mug, Tote bag | face, arrière, côté, trois quarts | fichiers « 4K » 2160 px fournis | **≈ 1 000 px de détail** (image agrandie ~2x) |
| Casquette, Sac à dos | face, côté, arrière | découpes d'une planche de 968 px + agrandissement IA | **faible (≈ 250 px par vue, reconstruit)** |
| T-shirt, Sweat à capuche, Sweat col rond | 2 à 4 vues | planches d'origine | faible |

Les fichiers « 4K » mesurent bien 2160 × 2160 px mais le détail réel est de ~1 000 px : ce sont des agrandissements.
`python scripts/product-images.py check <dossier>` le mesure (pic de PSNR au facteur d'agrandissement).

## Ce qu'il faut pour une qualité « configurateur premium »
24 images indépendantes (6 produits × face, arrière, côté, trois quarts), **natives ≥ 2048 px** sur la plus grande dimension (idéalement 3000+), un fichier par vue (pas de planche), même modèle / couleur / matière / éclairage / cadrage pour les 4 vues, fond clair uni, aucun logo, texte ni filigrane.

Modèles : polo noir piqué manches courtes, col classique 3 boutons ; casquette noire 6 panneaux visière courbée sans broderie ; tote bag toile de coton écru anses longues ; mug blanc céramique cylindrique anse classique ; pantalon de jogging noir taille élastique, cordons, bas resserrés ; sac à dos noir uni, poche avant zippée, bretelles rembourrées.

## Intégration
1. Déposer `front.png`, `back.png`, `side.png`, `three-quarter.png` dans un dossier temporaire.
2. `python scripts/product-images.py check <dossier>` — vérifier que le détail réel dépasse 1500 px.
3. `python scripts/product-images.py build <produit> <dossier> [--light]` (`--light` pour mug / tote bag).
4. Adapter `src/config/products.ts` (`pv(...)`, zones d'impression, `maxZoom`) puis `npm run build`.
Les masters détourés (pleine résolution) sont conservés dans `assets-master/`, hors `public/` (non servis).
