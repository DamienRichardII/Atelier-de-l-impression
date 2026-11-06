# Prompts pour générer les photos produits (mug, tote bag, sac à dos, pantalon)

Objectif : 4 vues par produit (face, arrière, côté, trois quarts), natives >= 2048 px, même modèle sur les 4 vues.
Outils conseillés : ChatGPT (génération d'images), Gemini, Midjourney. Les prompts sont en anglais (meilleurs résultats).

## Méthode (important pour la cohérence)
1. Un produit = UNE seule conversation. Générer la vue « face » d'abord, la valider.
2. Pour les autres vues, joindre l'image « face » validée comme référence et utiliser la formule :
   « Same exact product as the reference image, same shape, color, material, stitching and lighting, now shown from the <VUE>. »
3. Demander le format carré, la plus haute résolution possible (2048 px minimum). Refuser toute image plus petite.
4. Contrôle qualité avant envoi : aucun texte, aucun logo, aucun filigrane, produit entier dans le cadre, contours nets, fond uni.
5. Nommer les fichiers : front.png, back.png, side.png, three-quarter.png (un dossier par produit).

## Bloc de style (à ajouter à chaque prompt)
> Professional e-commerce studio product photograph, ultra sharp focus, photorealistic, visible fabric/material texture and stitching, soft diffused studio lighting from the upper left, very light uniform neutral grey background (#F2F2F2), soft contact shadow only, product centered with generous margin, full product visible and not cropped, no text, no logo, no brand label, no watermark, no model, no mannequin, no props, no artistic blur, shot with an 85mm lens, high resolution 2048x2048.

## MUG
Produit : plain white glossy ceramic mug, classic cylindrical shape, classic C-shaped handle, smooth blank surface, no print.
- front : « Front view, handle on the right, straight-on at eye level (slightly above the rim to see a thin ellipse of the opening). »
- back : « Back view, handle on the left, straight-on, same height. »
- side : « Side view with the handle pointing directly toward the camera, centered. »
- three-quarter : « Three-quarter view, rotated 35 degrees, handle on the right, slightly raised camera. »

## TOTE BAG
Produit : natural off-white (ecru) heavy cotton canvas tote bag, long flat shoulder straps stitched at the top with a reinforced square, visible canvas weave, blank surface, no print.
- front : « Front view, perfectly flat, straps standing upright. »
- back : « Back view, same position. »
- side : « Exact side profile showing the bag's thin gusset and both straps. »
- three-quarter : « Three-quarter view, rotated 35 degrees, slightly raised camera. »

## SAC À DOS
Produit : plain solid black polyester backpack, one large zippered front pocket, two padded shoulder straps, top carry handle, double zipper on the main compartment, no logo, no label.
- front : « Front view, straight-on, standing upright. »
- back : « Back view showing padded shoulder straps and back panel. »
- side : « Exact side profile showing the side pocket, strap and thickness. »
- three-quarter : « Three-quarter front view, rotated 35 degrees. »

## PANTALON
Produit : plain black cotton jogger sweatpants, elastic waistband with white-less black drawstrings, side pockets, tapered legs with ribbed elastic cuffs, visible seams and fleece texture, no logo, no label. Shown as an invisible-mannequin (ghost mannequin) product shot, legs slightly apart.
- front : « Front view, straight-on. »
- back : « Back view, straight-on. »
- side : « Exact side profile view. »
- three-quarter : « Three-quarter front view, rotated 35 degrees. »

## Ensuite
Envoyez-moi les images : je vérifie la résolution réelle (`python scripts/product-images.py check`), je détoure, je recale les zones d'impression, je teste et je livre.
