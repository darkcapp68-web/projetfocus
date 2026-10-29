# Fabrique un QR code (adresse, texte, Wi-Fi…) à scanner avec le téléphone.
#
#   python tools/qrcode.py "https://darkcapp68-web.github.io/projetfocus/"
#   python tools/qrcode.py "texte ou adresse" mon-qr.png
#   python tools/qrcode.py "texte ou adresse" mon-qr.svg
#
# Sans nom de fichier : qr.png dans le dossier courant. Le QR s'affiche aussi dans le
# terminal. Bibliothèque utilisée : segno (pure Python, licence BSD), installée toute
# seule au premier lancement dans tools/.pylib (ignoré par git).

import importlib
import os
import subprocess
import sys

# Accents et carrés du QR lisibles dans le terminal Windows.
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, '.pylib')
sys.path.insert(0, LIB)

try:
    import segno
except ImportError:
    print('Première utilisation : installation de segno dans tools/.pylib…')
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', '--disable-pip-version-check',
                           '--target', LIB, 'segno'])
    importlib.invalidate_caches()  # le dossier vient d'être créé
    import segno


def main():
    if len(sys.argv) < 2:
        print('Usage : python tools/qrcode.py "texte ou adresse" [fichier.png|.svg]')
        return 1
    text = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else 'qr.png'
    # Correction d'erreur « M » : reste lisible même un peu abîmé ou mal éclairé.
    qr = segno.make(text, error='m')
    if out.lower().endswith('.svg'):
        qr.save(out, scale=10, border=3)
    else:
        qr.save(out, scale=12, border=3)
    try:
        qr.terminal(compact=True)
    except Exception:
        pass  # terminal sans les caractères nécessaires : le fichier suffit
    print(f'QR code enregistré : {os.path.abspath(out)}')
    print(f'Contenu : {text}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
