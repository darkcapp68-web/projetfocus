# Retire le faux fond en damier (gris et blanc) qu'une IA dessine parfois à la place d'une
# vraie transparence, et enregistre l'image avec un vrai fond transparent.
#
#   python tools/detourer-damier.py image.png
#   python tools/detourer-damier.py image.webp sortie.webp
#
# Principe : on part des bords, du centre et de chaque case de damier pure, et on efface de
# proche en proche les pixels clairs, gris ou teintés de bleu (le damier, et les lueurs posées
# dessus). Les pixels foncés ou colorés du dessin arrêtent l'effacement. Dans la zone effacée,
# on retire la couleur du damier : une lueur devient semi-transparente au lieu de disparaître.
# Bibliothèque : Pillow, installée toute seule au premier lancement dans tools/.pylib.

import importlib
import os
import subprocess
import sys
from collections import deque

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, '.pylib')
sys.path.insert(0, LIB)

try:
    from PIL import Image
except ImportError:
    print('Première utilisation : installation de Pillow dans tools/.pylib…')
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', '--disable-pip-version-check',
                           '--target', LIB, 'pillow'])
    importlib.invalidate_caches()
    from PIL import Image

GRIS_MAX = 22    # écart max entre R, G et B pour un pixel « sans couleur »
CLAIR_MIN = 150  # luminosité min (la plus faible des trois couleurs) d'une zone à effacer
PUR = 7          # tolérance d'une case de damier « pure » (sert de point de départ partout)


def cases(px, w, h):
    """Les deux teintes du damier, lues dans le coin haut gauche (souvent 253 et 192)."""
    vals = sorted(sum(px[x, y][:3]) // 3 for x in range(min(60, w)) for y in range(min(60, h)))
    return vals[len(vals) // 10], vals[len(vals) * 9 // 10]


def clair(r, g, b):
    """Pixel du fond : clair, et soit gris, soit teinté de bleu (lueur posée sur le damier)."""
    lo = min(r, g, b)
    return lo >= CLAIR_MIN and (max(r, g, b) - lo <= GRIS_MAX or b >= max(r, g))


def vers_transparent(c, fond):
    """Retire la couleur du fond (comme « couleur vers alpha ») : renvoie (r, g, b, alpha)."""
    a = 0.0
    for v in c:
        if v > fond:
            a = max(a, (v - fond) / (255 - fond) if fond < 255 else 0)
        elif v < fond:
            a = max(a, (fond - v) / fond)
    if a < 0.04:
        return (0, 0, 0, 0)
    rgb = tuple(max(0, min(255, round((v - (1 - a) * fond) / a))) for v in c)
    return rgb + (round(a * 255),)


def main():
    if len(sys.argv) < 2:
        print('Usage : python tools/detourer-damier.py image [sortie.webp|.png]')
        return 1
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + '-transparent.webp'
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    px = im.load()

    fonce, blanc = cases(px, w, h)

    # Effacement de proche en proche : depuis le tour de l'image, son centre, et toute case
    # de damier « pure » (pour atteindre les poches fermées entre les éléments du dessin).
    vu = bytearray(w * h)
    file = deque()
    graines = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    graines += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)] + [(w // 2, h // 2)]
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            if max(r, g, b) - min(r, g, b) <= 3 and (abs(r - fonce) <= PUR or abs(r - blanc) <= PUR):
                graines.append((x, y))
    for x, y in graines:
        if not vu[y * w + x] and clair(*px[x, y][:3]):
            vu[y * w + x] = 1
            file.append((x, y))
    while file:
        x, y = file.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not vu[ny * w + nx] and clair(*px[nx, ny][:3]):
                vu[ny * w + nx] = 1
                file.append((nx, ny))

    # Dans la zone du fond, on retire la couleur du damier (la case la plus proche) :
    # le damier pur devient transparent, une lueur bleue devient du bleu semi-transparent.
    for y in range(h):
        for x in range(w):
            if vu[y * w + x]:
                c = px[x, y][:3]
                if max(c) - min(c) <= GRIS_MAX:
                    px[x, y] = (0, 0, 0, 0)  # case ou bord de case du damier
                    continue
                fond = blanc if sum(c) / 3 >= (fonce + blanc) / 2 else fonce
                px[x, y] = vers_transparent(c, fond)
    im.save(out, quality=90) if out.lower().endswith('.webp') else im.save(out)
    efface = sum(vu) * 100 // (w * h)
    print(f'Image enregistrée : {os.path.abspath(out)} ({w}×{h}, {efface} % du fond retiré)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
