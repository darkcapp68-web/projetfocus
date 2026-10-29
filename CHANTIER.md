# projetfocus — point de chantier (29/10/2026)

Toutes les règles de fonctionnement et les décisions sont dans **REGLES.md** (à lire en
premier pour reprendre le travail).

## Fait (publié sur https://darkcapp68-web.github.io/projetfocus/)

**L'appli (site / PWA)**
- Un seul écran : fond qui suit l'heure en dégradé continu (OKLab), cadran à tourner,
  temps au centre, contrôles qui apparaissent au toucher. Démo « journée en accéléré ».
- Focus / pause / cycles / pause longue, préréglages 25/5 et 50/10.
- Pause : couleur au hasard, respiration guidée (cohérence cardiaque 5/5 par défaut ;
  apaisante, carrée, 4-7-8) avec une teinte par étape, une action du coach, maintenir pour reprendre,
  bouton Arrêter, compte à rebours en tic-tac dans les 10 dernières secondes, 3 dings,
  reprise automatique du focus après 5 s.
- Messages bienveillants (40), coach, notifications, plein écran (désactivé par défaut).
- Son : lecteur avec menu groupé, playlists CC0 embarquées (lofi, ambient) gardées hors
  ligne, radios testées (Technolovers Minimal, France Musique Opéra / Classique Plus /
  Baroque / Easy Classique, Radio Swiss Classic cochées ; les autres décochées), musique de
  pause au choix (musique douce générée par défaut), bruits générés (pluie, orage, vent,
  neige, café) avec bouton lecture / pause.
- Arrêter coupe tout ; Démarrer relance tout ; recharger la page repart de zéro.
- Paramètres en 8 sections repliables, export / import JSON.
- Synchronisation Google Drive des paramètres (codée et testée avec un faux Google).

**En service** : sur le PC et sur le téléphone (installé depuis Chrome), réglages partagés
par Google Drive.

**Appli Android**
- Projet Android Studio `android/` (mêmes versions que Frigo) : APK « coquille » qui ouvre
  le site publié. Guide : `android/README.md`.

- APK de test construit avec Gradle (`android/app/build/outputs/apk/debug/app-debug.apk`,
  4,9 Mo, paquet `fr.projetfocus.app`). Il pointe sur `darkcapp68-web.github.io/projetfocus/` : il
  ne sert à rien avant la publication du site (à reconstruire, l'adresse a changé).

## En cours

- Rien. L'APK est remis à plus tard (décision de l'utilisateur, 29/10).

## Ce dont j'ai besoin de toi

1. **Publication** : fait. Site en ligne sur https://darkcapp68-web.github.io/projetfocus/
   (dépôt `darkcapp68-web/projetfocus`, GitHub Pages sur `main` / root).
2. **Synchronisation Google** : fait. ID client dans le code, testé avec le vrai Google sur
   `localhost:8417` (fichier `projetfocus-parametres.json` créé dans le Drive). À faire une fois
   sur chaque appareil : Paramètres → Sauvegarde → Se connecter à Google Drive.
3. **APK** (après la publication) :
   - fait : l'adresse du site est réglée sur `darkcapp68-web.github.io` ;
   - créer la **clé de signature** dans Android Studio et la garder hors du dépôt ;
   - pour enlever la barre d'adresse : créer le dépôt **`darkcapp68-web.github.io`** avec
     `.well-known/assetlinks.json` (je prépare le fichier avec l'empreinte SHA-256).
4. **Tes retours d'écoute**, que je ne peux pas juger moi-même :
   - couleurs de la respiration, maintenant affichées telles quelles (bleu ciel / doré /
     noir) : à garder ? la retenue après l'expiration (carrée) repasse au doré : gênant ?
   - tic-tac du compte à rebours, sons de pluie / orage / vent / neige / café, musique
     douce de pause : trop fort ? pas assez naturel ?
   - radios classiques : lesquelles garder ;
   - couleurs : ajouter un moment « Nuit profonde » indigo vers 2 h (sinon le fond tire sur
     le brun-rouge vers 3 h du matin) ?
5. **Optionnel** : abonnement DI.FM Premium un jour → je peux ajouter la saisie de la clé
   d'écoute pour avoir toutes leurs chaînes électro sans pub.

## Limites connues

- Chrome bloque le son sans geste : après un rechargement, rien ne joue avant Démarrer
  (voulu).
- Onglet caché sans son : les notifications peuvent arriver jusqu'à une minute en retard.
- iPhone : pas de réglage de volume de la radio par la page (sans objet, tout est Android).
