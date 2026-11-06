#!/usr/bin/env python3
"""Outils pour les photos produits du simulateur.

  python scripts/product-images.py check  <dossier_sources>      # résolution RÉELLE (pas la taille du fichier)
  python scripts/product-images.py build  <produit> <dossier_sources> [--dark|--light]

Sources attendues : front.png, back.png, side.png, three-quarter.png (fond clair uni, >= 2048 px).
Sortie : assets-master/<produit>/<vue>.png (détourés, pleine résolution)
         public/products/<produit>/<vue>.webp (1500x1680, cadrage commun aux 4 vues)
Dépendances : pip install pillow numpy opencv-python-headless scipy
"""
import sys, os, numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi

VIEWS = ["front", "back", "side", "three-quarter"]
W, H = 1500, 1680

def effective_resolution(path):
    """Estime la résolution native : PSNR après réduction/ré-agrandissement. Un pic net à k=2 ou 3
    signale une image agrandie 2x/3x (la 'vraie' largeur est largeur/k)."""
    g = cv2.imread(path, 0).astype(np.float32)
    out = []
    for k in (1.5, 2, 3, 4, 6):
        s = cv2.resize(g, None, fx=1 / k, fy=1 / k, interpolation=cv2.INTER_AREA)
        b = cv2.resize(s, (g.shape[1], g.shape[0]), interpolation=cv2.INTER_CUBIC)
        out.append((k, 10 * np.log10(255 ** 2 / max(((g - b) ** 2).mean(), 1e-6))))
    return out

def check(folder):
    for v in VIEWS:
        p = os.path.join(folder, f"{v}.png")
        if not os.path.exists(p): print(v, "absent"); continue
        w, h = Image.open(p).size
        res = effective_resolution(p)
        best = max(res, key=lambda r: r[1])
        print(f"{v:14} {w}x{h}  PSNR par facteur: " + " ".join(f"x{k}:{db:.0f}dB" for k, db in res)
              + f"  -> détail réel probable ≈ {int(w / best[0])} px de large")

def cut(img, dark):
    a = np.asarray(img.convert("RGB")); g = cv2.GaussianBlur(cv2.cvtColor(a, cv2.COLOR_RGB2GRAY), (0, 0), 2)
    bg = np.median(np.concatenate([g[:8].ravel(), g[:, :8].ravel(), g[:, -8:].ravel()]))
    m = (g < 110) if dark else ((bg - g) > 6)
    m = m.astype(np.uint8); m[:5] = 0; m[:, :5] = 0; m[:, -5:] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    lab, n = ndi.label(m)
    if n > 1:
        sz = ndi.sum(m, lab, range(1, n + 1)); m = (lab == 1 + int(np.argmax(sz))).astype(np.uint8)
    al = cv2.GaussianBlur(m.astype(np.float32) * 255, (0, 0), 2.0)
    al = np.clip((al - 70) * 255 / 185, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([a, al]), "RGBA")

def build(product, folder, dark):
    crops = {}
    for v in VIEWS:
        im = cut(Image.open(os.path.join(folder, f"{v}.png")), dark)
        crops[v] = im.crop(im.getchannel("A").point(lambda x: 255 if x > 40 else 0).getbbox())
    ref = [crops[v] for v in ("front", "back", "side")]
    s = min(0.78 * H / max(c.height for c in ref), 0.86 * W / max(c.width for c in ref))
    os.makedirs(f"assets-master/{product}", exist_ok=True); os.makedirs(f"public/products/{product}", exist_ok=True)
    for v, c in crops.items():
        c.save(f"assets-master/{product}/{v}.png", optimize=True)
        c2 = c.resize((int(c.width * s), int(c.height * s)), Image.LANCZOS)
        out = Image.new("RGBA", (W, H), (0, 0, 0, 0)); out.paste(c2, ((W - c2.width) // 2, int(H * 0.90) - c2.height), c2)
        out.save(f"public/products/{product}/{v}.webp", "WEBP", quality=92, method=6)
        print("écrit", product, v)
    print("Vérifier ensuite les zones d'impression dans src/config/products.ts (le cadrage a pu changer).")

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "check": check(sys.argv[2])
    elif len(sys.argv) >= 4 and sys.argv[1] == "build": build(sys.argv[2], sys.argv[3], "--light" not in sys.argv)
    else: print(__doc__)
