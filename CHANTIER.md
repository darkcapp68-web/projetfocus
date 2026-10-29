# projetfocus — point de chantier (29/10/2026)

## Fait (tout est commité en local, rien n'est publié)

**L'appli (site / PWA)**
- Un seul écran : fond qui suit l'heure en dégradé continu (OKLab), cadran à tourner,
  temps au centre, contrôles qui apparaissent au toucher. Démo « journée en accéléré ».
- Focus / pause / cycles / pause longue, préréglages 25/5 et 50/10.
- Pause : couleur au hasard, respiration, une action du coach, maintenir pour reprendre,
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

**Appli Android**
- Projet Android Studio `android/` (mêmes versions que Frigo) : APK « coquille » qui ouvre
  le site publié. Guide : `android/README.md`.

- APK de test construit avec Gradle (`android/app/build/outputs/apk/debug/app-debug.apk`,
  4,9 Mo, paquet `fr.projetfocus.app`). Il pointe encore sur `TON-COMPTE.github.io` : il ne
  sert à rien avant la publication du site.

## En cours

- Rien : tout attend les points ci-dessous.

## Ce dont j'ai besoin de toi

1. **Publier sur GitHub Pages** (tout en dépend : PC installé, APK, synchronisation).
   - Créer le dépôt **`projetfocus`** sur ton compte GitHub (public, vide).
   - Me donner ton **nom d'utilisateur GitHub** et ton **accord pour pousser** le code
     (environ 110 Mo, à cause de la musique).
   - Activer GitHub Pages : Settings → Pages → branche `main`, dossier `/ (root)`.
   - Savoir : tout le dépôt sera public, y compris CAHIER_DES_CHARGES.md et CHANTIER.md.
2. **ID client Google** pour la synchronisation Drive (guide : README, « Synchroniser avec
   Google Drive ») : un projet Google Cloud `projetfocus` à part, client de type
   **Application Web**, origines `http://localhost:8417` et `https://TON-COMPTE.github.io`,
   ton adresse en utilisateur test. Me donner l'ID (il n'est pas secret).
3. **APK** (après la publication) :
   - remplacer `TON-COMPTE` dans `android/app/build.gradle.kts` (je peux le faire) ;
   - créer la **clé de signature** dans Android Studio et la garder hors du dépôt ;
   - pour enlever la barre d'adresse : créer le dépôt **`TON-COMPTE.github.io`** avec
     `.well-known/assetlinks.json` (je prépare le fichier avec l'empreinte SHA-256).
4. **Tes retours d'écoute**, que je ne peux pas juger moi-même :
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
- La synchronisation Google n'a pas encore été testée avec le vrai Google (attend l'ID).
