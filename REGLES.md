# projetfocus — règles du programme

Référence pour reprendre le travail dans une nouvelle session. Elle complète
`CAHIER_DES_CHARGES.md` (le besoin d'origine) avec **toutes les décisions prises depuis**,
et prévaut sur lui quand ils diffèrent. État d'avancement et actions en attente :
`CHANTIER.md`.

---

## 1. Principes

- PWA en HTML / CSS / JavaScript **sans framework ni build** : le dossier se publie tel quel
  (GitHub Pages, dépôt `projetfocus`, compte perso de l'utilisateur).
- **Un seul site à maintenir.** PC : appli installée depuis Chrome / Edge (fenêtre à part).
  Téléphone et tablette (tout Android, pas d'Apple) : APK « coquille » (projet Android Studio
  `android/`, Trusted Web Activity) qui ouvre le site publié. L'APK n'a pas de maintenance.
- Style moderne et minimal : au repos, seulement le fond, le cadran, le temps (et le message
  ou l'action du coach). Contrôles visibles au toucher / mouvement de souris, puis effacés.
- Ton bienveillant, en français, pensé pour un développeur (Progress / ABL).
- Pas de publicité : les radios qui en passent sont décochées et marquées « avec pub » /
  « pub probable ». On ne contourne jamais un blocage volontaire (ex. SomaFM).

## 2. Écran et couleurs

- **Fond qui suit l'heure réelle** sur 24 h : 6 moments (Nuit 22:30 indigo, Aube 06:00
  orangé, Matinée 08:30 bleu, Midi 12:00 vert, Après-midi 14:30 ambre, Soirée 18:30 prune).
  À l'heure d'un moment, sa couleur est pure ; entre deux, la couleur **glisse en continu,
  minute par minute** (courbe douce, mélange OKLab). Le nom affiché est celui du moment le
  plus proche. Réglable : couleurs, heures, noms, ou couleur fixe.
- **Démo** : Paramètres → Couleurs → « Voir la journée en accéléré » (24 h en 30 s, heure
  affichée en bas, un toucher arrête).
- **Cadran** façon minuteur de cuisine : arc blanc de 5 px sur cercle translucide de 5 px, point
  en tête, graduations seulement pendant le réglage. On le tourne pour régler 1 à 60 min ;
  l'arc se vide dans le sens des aiguilles d'une montre. Sous le cadran : bascule
  « focus / pause » pour choisir ce que l'on règle. Préréglages 25/5 et 50/10, nombre de
  cycles (0 = sans fin).
- Info discrète en bas : « moment · phase · cycle » (ex. « Matinée · focus · 2/4 »).

## 3. Minuteur

- Phases : réglage (repos) → focus → pause → focus… → série terminée.
- **Démarrer** lance le minuteur, la musique et le bruit de fond choisis (si « Lancer le son
  en démarrant le focus » est coché, par défaut oui). En focus le bouton devient Pause /
  Reprendre. « Passer à la pause » existe en focus.
- **Arrêter** (en focus, et en pause au toucher) remet tout à zéro et **coupe tous les sons**
  (musique, musique de pause, bruit), en gardant les choix pour le prochain Démarrer.
- Pause longue après N cycles (par défaut après 4, 15 min).
- **Recharger ou rouvrir la page repart de zéro** comme une première ouverture : minuteur
  arrêté, aucun son ; seuls les réglages et les choix (musique, bruit, volumes…) sont relus.
  Pas de reprise du minuteur ni du son après rechargement (décision de l'utilisateur).
- Le temps est calculé sur des horodatages (pas de dérive). Écran gardé allumé pendant une
  série (Wake Lock, réglable).

## 4. Pause

- **Couleur de pause tirée au hasard** parmi 10 couleurs vives (ou couleur fixe).
- **Respiration guidée** (l'écran « respire »), par défaut **cohérence cardiaque 5 s / 5 s**
  (6 respirations par minute ; une pause de 5 min = une séance « 365 »). Autres rythmes :
  apaisante 4/6, carrée 4-4-4-4, 4-7-8, ou simple pulsation (sans consignes).
  Avec « une couleur par étape » (par défaut), l'écran prend **exactement les couleurs
  choisies** dans Paramètres → Pause (pas un voile mélangé à la couleur de pause) : inspire →
  **bleu ciel**, retiens → **doré** puis ne bouge plus, expire → **noir**. La première
  inspiration part de la couleur de pause. Sur une teinte claire, texte et cadran passent en
  sombre (à mi-chemin de l'étape). « inspire / retiens / expire » écrit sous le temps
  (réglable). Sans couleurs : voile sombre dont l'intensité est réglable. Le rythme choisi
  s'affiche sous le temps (« pause · cohérence cardiaque »).
  La respiration s'arrête quand la pause est finie.
- **Une action du coach** à la fois (liste modifiable), deux autres proposées au toucher.
- **Maintenir 3 s** pour reprendre avant la fin (geste volontaire). Bouton **Arrêter** au
  toucher.
- **Compte à rebours sonore** dans les 10 dernières secondes de la pause : à 10, 8, 6 s puis
  chaque seconde de 5 à 1, en **tic-tac** (par défaut) ou en ding. Option pour le focus aussi
  (décochée).
- **Fin de pause : 3 « ding »**, puis « reprise dans 5 s », puis le focus repart tout seul
  (réglable : reprise auto oui / non, délai, nombre de dings). « Fait, je reprends » pour ne
  pas attendre.
- Plein écran au début de la pause : **désactivé par défaut** (jugé brutal), réglable.
- Notification système si la fenêtre est cachée (fin de focus, fin de pause, fin de série).

## 5. Messages pendant le focus

- Une phrase courte sous le cadran, en fondu, jamais animée. 40 messages de départ en
  catégories (début, reprise après pause, 5 dernières minutes, tard le soir, concentration,
  anti-stress, astuces de dev, perso). Changement toutes les 12 min par défaut ; « tard » à
  partir de 21 h. Tout est modifiable.

## 6. Son

- **Lecteur** en bas : bouton ▶ / ❚❚, menu de musiques groupé, volume ; bruit de fond avec
  le **même bouton ▶ / ❚❚** (coupe sans perdre le choix), menu et volume.
- **Choisir une musique dans le menu la lance tout de suite.**
- **Musiques** (ids dans `js/defaults.js`) :
  - Playlists embarquées CC0 (HoliznaCC0) : « Playlist lofi » (9), « Playlist ambient
    électro » (7). Jouées au hasard, gardées sur l'appareil à l'écoute ; Paramètres →
    Musiques → Bibliothèque hors ligne pour télécharger / retirer une playlist entière.
  - Radios testées (lisibles depuis un autre site) : chill (I♥Chillhop, Chillsynth, Radio
    Paradise Mellow, laut.fm lofi), électro (Technolovers Minimal / Deep House, FIP Electro,
    Intergalactic FM, NTS 1 et 2, Ambient Sleeping Pill, laut.fm minimal / ambient),
    Bollywood (Mirchi Top 20, Bollywood 2010s, pub probable), classique et opéra (France
    Musique Opéra / Classique Plus / Baroque / Easy Classique, Radio Swiss Classic).
  - SomaFM (Groove Salad, Deep Space One, Fluid) : refuse la lecture depuis un autre site →
    s'ouvre dans un onglet (marqué ↗).
  - Noms : « Playlist … » pour l'embarqué, « Radio … » pour les radios (pas d'ambiguïté).
  - **Cases à cocher par musique** (Paramètres → Musiques → Musiques du menu) : seules les
    cochées apparaissent dans le lecteur. **Actuellement cochées : Technolovers Minimal
    (musique par défaut) et les 5 radios classiques.**
  - « Mes liens » : flux audio directs ajoutés par l'utilisateur (YouTube / Spotify →
    ouverts dans un onglet).
- **Musique de la pause** (choix retenu) : musique douce générée par l'appli (par défaut,
  façon « ascenseur », jouée même si rien ne jouait avant), même musique que le focus plus
  bas, silence, ou n'importe quelle playlist / radio cochée. En pause, le lecteur affiche la
  musique de pause et **son propre menu** ; le menu et le ▶ du focus sont masqués. Un seul
  curseur de volume (celui du lecteur), qui règle la musique de la phase en cours.
- La musique du focus est **notée au début de la pause** et **reprend après** : la playlist
  au même morceau et à la seconde près, une radio en direct.
- **Bruits de fond générés** (Web Audio, aucun fichier) : pluie, orage lointain (grondements
  à des moments imprévisibles), vent par rafales, neige feutrée, café. Pas de bruit blanc /
  rose / brun (retirés, pas aimés). Baissés aussi en pause (réglable).
- Signal de changement de phase : clochette (défaut), bol chantant, deux notes, tic-tac,
  aucun ; volume réglable.

## 7. Paramètres et sauvegarde

- Bouton « Paramètres » discret, visible avec les contrôles. Panneau en **8 sections
  repliables**, une seule ouverte à la fois (sa ligne est surlignée en bleu clair, ses réglages
  décalés à droite avec un trait bleu) : Temps, Pause, Volumes et sons, Musiques,
  Messages, Couleurs, Affichage, Sauvegarde. Les longues listes sont repliées dans leur
  section.
- Tout est enregistré sur l'appareil (localStorage, clé `projetfocus.settings`), avec un
  numéro de **version** : chaque changement de comportement par défaut passe par une
  **migration** dans `sanitize()` (`js/app.js`) pour s'appliquer aussi aux réglages déjà
  enregistrés (version actuelle : 7).
- « Revenir aux valeurs par défaut » (garde l'ID client Google), export / import JSON.
- **Synchronisation Google Drive** : fichier visible `projetfocus-parametres.json` dans
  « Mon Drive » (portée `drive.file`), lu au premier toucher et au retour sur l'appli,
  réécrit 3 s après chaque changement, la plus récente version gagne (`updatedAt`). Attend
  l'ID client Google de l'utilisateur (projet Google Cloud séparé, client **Application
  Web**). Non synchronisés : musique hors ligne, phase en cours.
- Les réglages sont propres à chaque navigateur **et à chaque adresse** (localhost,
  127.0.0.1, github.io sont des mémoires séparées).

## 8. Hors ligne et publication

- Service worker `sw.js` : site en « réseau d'abord, cache en secours » (cache si le réseau
  ne répond pas en 3 s ou hors ligne) : **un seul F5 suffit** pour voir une nouvelle version.
  Musique en cache séparé (`projetfocus-music-v1`, « cache d'abord »), lecture par morceaux
  (Range) depuis le cache. Augmenter `CACHE` dans `sw.js` quand la liste des fichiers change.
- Rien n'est publié. Publication sur GitHub Pages **uniquement avec l'accord explicite** de
  l'utilisateur (dépôt public : CAHIER_DES_CHARGES.md, REGLES.md, CHANTIER.md seront
  visibles).

## 9. Conventions de travail (pour Claude)

- Répondre en **français**, simplement. Ne rien toucher **en dehors de `C:\projetfocus`**
  (lire un autre projet pour s'aligner est permis, sans le modifier). Projet Solin
  (`C:\spro`) : interdit.
- Commits locaux, messages en français ; ne jamais pousser sans accord.
- Tester dans le navigateur intégré **sur `http://127.0.0.1:8417`** (mémoire séparée) pour
  ne pas perturber la session de l'utilisateur sur `localhost:8417`. Ne jamais recharger son
  onglet en pleine utilisation. Le navigateur intégré refuse tout service worker (« unknown
  error » à l'inscription) : tester `sw.js` à part, sous Node avec un faux cache. Serveur :
  `.claude/launch.json` (`python -m http.server 8417`).
- Les tests qui écrivent dans localStorage doivent le vider à la fin (attention : l'appli
  réenregistre ses réglages à `pagehide` et `visibilitychange`).
- Les sons générés ne peuvent pas être écoutés par Claude : demander un retour à
  l'utilisateur. Vérifier les licences de toute musique embarquée (CC0 / CC BY, noté dans
  `CREDITS.md`) et la présence de publicité avant d'ajouter une radio (tester le flux avec
  un en-tête `Referer` d'un autre site).
- Contrôle de syntaxe sans build :
  `node -e "new Function(require('fs').readFileSync('js/app.js','utf8').replace(/^import .*$/mg,''))"`.

## 10. Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | écran, lecteur, panneau Paramètres |
| `css/style.css` | style |
| `js/app.js` | minuteur, cadran, couleurs, respiration, messages, coach, lecteur, Paramètres, migrations |
| `js/audio.js` | radio / playlists, musique de pause générée, bruits générés, dings, tic-tac |
| `js/sync.js` | synchronisation Google Drive |
| `js/defaults.js` | valeurs par défaut, radios, playlists, respirations, messages |
| `sw.js` | hors ligne |
| `music/` | 16 MP3 CC0 (voir `CREDITS.md`) |
| `android/` | projet Android Studio de l'APK (voir `android/README.md`) |
| `tools/make-icons.mjs` | icônes du site et de l'APK |
