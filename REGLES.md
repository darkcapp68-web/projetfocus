# projetfocus — règles du programme

Référence pour reprendre le travail dans une nouvelle session. Elle complète
`CAHIER_DES_CHARGES.md` (le besoin d'origine) avec **toutes les décisions prises depuis**,
et prévaut sur lui quand ils diffèrent. État d'avancement et actions en attente :
`CHANTIER.md`.

---

## 1. Principes

- PWA en HTML / CSS / JavaScript **sans framework ni build** : le dossier se publie tel quel
  (GitHub Pages, dépôt public `darkcapp68-web/projetfocus`, branche `main` / racine).
  Site : https://darkcapp68-web.github.io/projetfocus/
- **Un seul site à maintenir.** PC : appli installée depuis Chrome / Edge (fenêtre à part).
  Téléphone et tablette (tout Android, pas d'Apple) : site **installé par Chrome** (icône sur
  l'écran d'accueil). **APK mis de côté** (30/10, décision de l'utilisateur : l'appli
  installée par Chrome suffit pour l'instant) ; le projet `android/` est gardé pour plus tard.
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
- **Démo** : Paramètres → Apparence → « Voir la journée en accéléré » (24 h en 30 s, heure
  affichée en bas, un toucher arrête).
- **Cadran** façon minuteur de cuisine : arc blanc de 5 px sur cercle translucide de 5 px, point
  en tête, graduations seulement pendant le réglage. On le tourne pour régler 1 à 60 min ;
  l'arc se vide dans le sens des aiguilles d'une montre. **Style du cadran** (Paramètres → Apparence) :
  « **Normal** » (par défaut, l'arc et les chiffres ; pendant le focus, **fondu lent** : le
  cadran s'efface presque (12 %) puis revient, 16 s aller-retour, et redevient entièrement
  visible dès que les contrôles s'affichent ; réglable) ou « **Rêveur** » : le cadran est posé
  dans un **cadre en engrenages** (`img/cadre-reveur.webp`, image générée sans personnage,
  fausse transparence retirée avec `tools/detourer-damier.py`) ; son centre est un voile
  sombre transparent qui garde la couleur du fond. Pendant le focus, un **atome** : soleil au
  centre, 8 planètes aux couleurs proches des vraies, chacune sur une orbite dans son propre
  plan (inclinées de 68°, réparties sur 180°), l'ensemble tournant lentement en 3D (un tour
  en 2 min), les planètes passant devant ou derrière le soleil ; **une seule trajectoire
  tracée, qui change chaque minute** ; une **comète** part du bord et atteint le soleil à la
  fin du focus. Pendant la pause, la **vague** (le cadran se vide comme un verre, couleur
  inverse du fond). En rêveur, ni temps
  ni nom de phase pendant que le temps passe ; **au repos, le cadran normal** (arc, point,
  graduations, chiffres) pour bien voir ce qu'on règle : le cadre et la scène n'apparaissent
  qu'au démarrage.
  « **Rythme** » : le cadran normal, mais le cercle **réagit à la musique** qui joue :
  il bat sur les temps forts (léger grossissement et lueur), le **BPM** s'affiche sous le
  temps (« focus · 124 BPM », estimé en ~10 s, fiable sur l'électro, absent sur le classique
  sans battement), et une forme au choix (Paramètres → Apparence → Forme du mode Rythme) :
  barres, onde, **goutte** (par défaut), sonar ou étincelles, toutes en **néon** (cœur clair
  et halo, magenta → violet → bleu → cyan : selon la fréquence pour les barres, autour du
  cercle pour l'onde et la goutte, avec l'âge pour le sonar, au hasard pour les étincelles).
  Le **temps** aussi est en néon (cœur blanc, halo magenta → violet → cyan) et s'illumine sur
  chaque temps fort. L'analyse (`audio.analyser`,
  `enableAnalysis()` dans `js/audio.js`) fait passer la musique par le moteur audio, en mode
  CORS (toutes les radios du menu l'acceptent ; testé) ; elle ne s'active qu'en mode Rythme,
  puis reste jusqu'au rechargement. Le spectre est compensé du volume du lecteur et ramené à
  l'échelle des dernières secondes : une musique calme ou jouée bas bouge autant qu'une
  forte.
  « **Brisure** » (idée de l'utilisateur, 30/10) : pendant le focus, un **éclair** ou une
  **fissure** (réglage « Aspect », éclair par défaut) part du centre du cadran sur tout l'écran
  (canevas `#crack-fx`) en 6 à 9 branches qui se **ramifient au hasard en chemin** et
  **poussent en continu**, à vitesse constante le long des branches ; les derniers bouts
  arrivent à la fin du focus. C'est la **version 1**, retenue par l'utilisateur (30/10) pour
  sa fluidité, après des essais « 2 traits qui se divisent en 2 toutes les N secondes, directions
  sur 360°, traits droits » jugés saccadés. Un trait qui touche le **bord de l'écran rebondit**
  (angle réfléchi). **Éclair** : dents de scie autour de la direction de chaque branche, néon
  (halo bleu-violet, cœur blanc). **Fissure** : courbe douce, couleur du cadran. Branches
  principales épaisses et lumineuses, les suivantes de plus en plus fines. Remplir l'écran
  n'est pas un but. Allégé pour le téléphone : segments finis dessinés une fois, un tracé par
  profondeur, canevas plafonné à 2 pixels par point, 10 images par seconde, ni filtre ni flash.
  Pendant le focus, le cadran s'efface : seul un **petit temps** discret reste, au-dessus du
  message de soutien ; un toucher (contrôles affichés) ramène le grand temps. En pause, le
  tracé **s'efface** (fondu 3 s) ; au focus suivant, un **nouveau tracé tiré au hasard**. Au
  repos, le cadran normal. **Vitesse** (réglage, visible en mode Brisure) : « Normale » (au
  bout des branches à la fin du focus), « **Lente** » (la moitié, par défaut) ou « Très lente »
  (30 %) ; demande de l'utilisateur, 30/10 : ralentir la progression. **Teinte du tracé**
  (réglage) : « **Noire** » par défaut (30/10, demande de l'utilisateur : le tracé blanc se
  confondait avec le temps et le message en blanc ; l'éclair garde un mince halo bleuté) ou
  « Claire » (le néon blanc et la fissure couleur du cadran d'avant) ou « **Faille** » (31/10,
  idée de l'utilisateur : « une ouverture sur une autre dimension ») : les traits
  **s'élargissent** pendant tout le focus (jusqu'à 4 fois, surtout les grosses branches) et
  laissent voir un **ciel étoilé** (nébuleuses violettes et bleues, deux couches d'étoiles
  qui glissent lentement à des vitesses différentes), bordé de violet ; à la fin, l'autre
  dimension couvre environ la moitié de l'écran. **Épaisseur des traits**
  (réglage, idée de l'utilisateur : aspect d'« envahissement spatial ») : Fine (× 0,6),
  Normale (par défaut), Épaisse (× 1,8), Très épaisse (× 3).
  Animations même si l'appareil demande de les réduire (souhait de l'utilisateur). Sous le cadran : bascule
  « focus / pause » pour choisir ce que l'on règle. Préréglages 25/5 et 50/10, nombre de
  cycles (0 = sans fin).
- **Téléphone à la verticale** : tout remonte sous la barre du haut (« Paramètres »), le
  cadran prend la hauteur qui reste au-dessus du lecteur (environ 230 px) ; rien ne se
  chevauche, la page défile seulement sur un très petit écran.
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
  **La respiration se voit par** (réglage, 31/10, demande de l'utilisateur : soit les
  couleurs avec un mot de taille fixe, soit un mot qui exprime vraiment le mouvement sur un
  écran immobile) : « **le mot** » (par défaut : le mot grandit jusqu'à 3 fois et rétrécit,
  bien lisible, toujours affiché ; l'écran ne bouge pas), « les couleurs » (le mot garde sa
  taille), « le mot et les couleurs » (l'ancien comportement, mot jusqu'à 2,4 fois) ou « un
  voile sombre ». Avec les couleurs, l'écran prend **exactement les couleurs
  choisies** dans Paramètres → Pause (pas un voile mélangé à la couleur de pause) : inspire →
  **bleu ciel**, retiens → **doré** puis ne bouge plus, expire → **noir**. La première
  inspiration part de la couleur de pause. Sur une teinte claire, texte et cadran passent en
  sombre (à mi-chemin de l'étape). « inspire / retiens / expire » écrit sous le temps
  (réglable) ; quand le mot bouge, **il grandit pendant l'inspiration** (sur toute la durée
  de l'étape), **rétrécit pendant l'expiration** et garde sa taille quand on retient.
  Voile sombre : son intensité est réglable. Le rythme choisi
  s'affiche sous le temps (« pause · cohérence cardiaque »).
  La respiration s'arrête quand la pause est finie.
- **Une action du coach** à la fois (liste modifiable), deux autres proposées au toucher.
- **Maintenir 3 s** pour reprendre avant la fin (geste volontaire). Bouton **Arrêter** au
  toucher. Ces boutons (et « Fait, je reprends ») s'effacent avec les autres contrôles ;
  appuyer à la place de « maintenir », même effacé, le réaffiche et lance le maintien.
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

- **Lecteur** en bas, **gros pour le doigt et la souris** (boutons 46 px, menus et curseurs
  d'au moins 44 px de haut ; partout, chaque curseur de volume sous son
  bouton et son menu) : bouton ▶ / ❚❚, menu de musiques groupé, volume ; bruit de fond avec
  le **même bouton ▶ / ❚❚** (coupe sans perdre le choix), menu et volume. Les menus du
  lecteur sont des **dragées pleines** (capsule au fond translucide, flèche dessinée ; 30/10,
  demande de l'utilisateur), sombres sur une teinte claire.
- **Choisir une musique dans le menu la lance tout de suite.**
- **Musiques** (ids dans `js/defaults.js`) :
  - Playlists embarquées CC0 (HoliznaCC0) : « Playlist lofi » (9), « Playlist ambient
    électro » (7). Jouées au hasard, gardées sur l'appareil à l'écoute ; Paramètres →
    Musiques et sons → Réglages avancés → Bibliothèque hors ligne pour télécharger / retirer une playlist entière.
  - Radios testées (lisibles depuis un autre site) : chill (I♥Chillhop, Chillsynth, Radio
    Paradise Mellow, laut.fm lofi), électro (Technolovers Minimal / Deep House, FIP Electro,
    Intergalactic FM, NTS 1 et 2, Ambient Sleeping Pill, laut.fm minimal / ambient),
    Bollywood (Mirchi Top 20, Bollywood 2010s, pub probable), classique et opéra (France
    Musique Opéra / Classique Plus / Baroque / Easy Classique, Radio Swiss Classic).
  - SomaFM (Groove Salad, Deep Space One, Fluid) : refuse la lecture depuis un autre site →
    s'ouvre dans un onglet (marqué ↗).
  - Noms : « Playlist … » pour l'embarqué, « Radio … » pour les radios (pas d'ambiguïté).
  - **Cases à cocher par musique** (Paramètres → Musiques et sons → Musiques du menu) : seules les
    cochées apparaissent dans le lecteur. **Actuellement cochées : Technolovers Minimal
    (musique par défaut) et les 5 radios classiques.**
  - **Plus de « Mes liens »** (retiré le 31/10, décision de l'utilisateur : YouTube joué dans
    l'appli a été essayé puis retiré, et ouvrir YouTube / Spotify dans un onglet ne sert à
    rien, il a leurs applis). **Une nouvelle radio s'ajoute avec Claude**, dans
    `js/defaults.js`, après les tests habituels (lecture depuis un autre site, publicité).
- **Musique de la pause** (choix retenu) : musique douce générée par l'appli (par défaut,
  façon « ascenseur », jouée même si rien ne jouait avant), même musique que le focus plus
  bas, silence, ou n'importe quelle playlist / radio cochée. En pause, le lecteur affiche la
  musique de pause et **son propre menu** ; le menu et le ▶ du focus sont masqués. Un seul
  curseur de volume (celui du lecteur), qui règle la musique de la phase en cours.
- La musique du focus est **notée au début de la pause** et **reprend après** : la playlist
  au même morceau et à la seconde près, une radio en direct. Toute radio reprise après plus de 5 s de pause
  (notification Android, écran verrouillé, pause) est **rechargée en direct** par défaut ;
  réglage « Reprise d'une radio après une pause » (Musiques et sons, avancés) : « là où elle s'était
  arrêtée » pour finir un morceau (classique…), dans la limite de ce que le navigateur garde.
- **Bruits de fond générés** (Web Audio, aucun fichier) : pluie, orage lointain (grondements
  à des moments imprévisibles), vent par rafales, neige feutrée, café. Pas de bruit blanc /
  rose / brun (retirés, pas aimés). Baissés aussi en pause (réglable).
- Signal de changement de phase : clochette (défaut), bol chantant, deux notes, tic-tac,
  aucun ; volume réglable.

## 7. Paramètres et sauvegarde

- Bouton « Paramètres » discret, visible avec les contrôles. Panneau en **6 sections
  repliables**, une seule ouverte à la fois (sa ligne est surlignée en bleu clair, ses réglages
  décalés à droite avec un trait bleu) : Temps, Pause, Musiques et sons, Messages,
  Apparence, Sauvegarde. **Allégé le 30/10** (demande de l'utilisateur : trop de réglages) :
  chaque section ne montre que l'essentiel (30 réglages visibles au lieu de 65), le reste est
  replié dans « **Réglages avancés** » ; et **un réglage n'apparaît que s'il sert**
  (attribut `data-if` dans `index.html`, lu par `showRelevant()` : « Forme » seulement en
  mode Rythme, « Fondu lent » seulement en Normal, couleurs de respiration seulement quand
  les couleurs montrent la respiration, couleur fixe seulement sans dégradé…). Aucun réglage n'a été
  supprimé.
- Tout est enregistré sur l'appareil (localStorage, clé `projetfocus.settings`), avec un
  numéro de **version** : chaque changement de comportement par défaut passe par une
  **migration** dans `sanitize()` (`js/app.js`) pour s'appliquer aussi aux réglages déjà
  enregistrés (version actuelle : 11).
- « Revenir aux valeurs par défaut » (garde l'ID client Google), export / import JSON.
- **Sauvegarde Google Drive, à la main** (décision de l'utilisateur : rester simple, après
  des conflits avec la synchronisation automatique, abandonnée) : deux boutons dans
  Sauvegarde. « **Sauvegarder mes paramètres** » écrit ceux de l'appareil dans le fichier
  visible `projetfocus-parametres.json` de « Mon Drive » (portée `drive.file`, champ
  `savedAt`) ; « **Reprendre mes paramètres** » (avec confirmation) les ramène sur l'appareil.
  **Rien d'automatique** : aucune lecture ni écriture du Drive sans clic, jamais de fenêtre
  Google d'office. Avant chaque reprise, les réglages de l'appareil sont gardés
  (`projetfocus.settings.avant-drive`) : « Remettre mes réglages d'avant ». ID client
  Google dans `js/defaults.js` (projet Google Cloud `projetfocus`, client **Application Web**,
  origines `http://localhost:8417` et `https://darkcapp68-web.github.io`, en test). Le code
  secret du client n'est **jamais** utilisé ni écrit dans le dépôt. Non sauvegardés : musique hors ligne, phase en cours.
- Les réglages sont propres à chaque navigateur **et à chaque adresse** (localhost,
  127.0.0.1, github.io sont des mémoires séparées).

## 8. Hors ligne et publication

- Service worker `sw.js` : site en « réseau d'abord, cache en secours » (cache si le réseau
  ne répond pas en 3 s ou hors ligne) : **un seul F5 suffit** pour voir une nouvelle version.
  Musique en cache séparé (`projetfocus-music-v1`, « cache d'abord »), lecture par morceaux
  (Range) depuis le cache. Augmenter `CACHE` dans `sw.js` quand la liste des fichiers change.
- **Publié** sur GitHub Pages (remote `origin`). Chaque `git push` met le site en ligne en
  une à deux minutes, sur le PC et le téléphone : on pousse après chaque modification
  (voir section 9).
- **Version** affichée en bas des Paramètres (`APP_VERSION` dans `js/app.js`) : la changer
  à chaque envoi avec la **vraie** date et heure du PC (`date "+%d/%m/%Y · %Hh%M"`), jamais
  une heure inventée. Bouton « Mettre à jour l'appli » à côté : vide le cache du
  site (pas la musique), **retélécharge chaque fichier du site** (`cache: 'reload'` : GitHub
  Pages laisse le navigateur garder un fichier 10 min, un simple rechargement reprenait
  l'ancien `app.js`) et recharge, pour un appareil resté sur une ancienne version.
  **Avis de mise à jour** (30/10) : l'appli relit `APP_VERSION` dans le `js/app.js` publié
  (`?verif-version`, revalidé auprès du site) à l'ouverture, au retour au premier plan, quand
  la fenêtre reprend la main (PC), à l'ouverture des Paramètres (au plus une fois par minute)
  et toutes les 10 min ; si elle diffère, un **point bleu** s'allume sur
  « Paramètres », la ligne de version annonce la nouvelle et « Mettre à jour l'appli » est
  mis en avant. **Jamais de rechargement tout seul** (ne pas couper un focus). Le dépôt est public (CAHIER_DES_CHARGES.md, REGLES.md,
  CHANTIER.md visibles) : jamais de secret dedans (ni code secret Google, ni clé APK).

## 9. Conventions de travail (pour Claude)

- Répondre en **français**, simplement. Ne rien toucher **en dehors de `C:\projetfocus`**
  (lire un autre projet pour s'aligner est permis, sans le modifier). Projet Solin
  (`C:\spro`) : interdit.
- Commits en français. **Pousser sur GitHub après chaque modification** (accord durable de
  l'utilisateur, 29/10/2026, pour ce projet : il teste sur PC et téléphone). Exception : tout
  ce qui touche aux secrets ou au dépôt `darkcapp68-web.github.io` se demande avant.
  Après l'envoi, ne pas attendre la mise en ligne (environ 1 min) pour répondre : la vérifier
  en arrière-plan et ne prévenir l'utilisateur qu'en cas d'échec.
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
- Le navigateur intégré, quand son volet est en arrière-plan, fige les animations, les
  transitions et le dessin : mesurer ce qui est commandé (styles posés, pixels allumés après
  une capture d'écran qui force l'affichage) plutôt que de se fier à l'image. Tests longs :
  avancer l'horloge de la page (`Date.now = () => vrai + décalage`). Pour vider les réglages
  de test : `Storage.prototype.setItem = () => {}` puis `localStorage.clear()` puis recharger
  (l'appli réenregistre ses réglages en quittant la page).
- Mise à jour et service worker : le navigateur intégré refuse les service workers ; les
  tester dans un Chrome sans fenêtre (`--headless=new --remote-debugging-port`, profil
  temporaire) avec un petit serveur qui imite GitHub Pages (`Cache-Control: max-age=600`,
  ETag). Arrêter Chrome et le serveur à la fin.
- Contrôle de syntaxe sans build :
  `node -e "new Function(require('fs').readFileSync('js/app.js','utf8').replace(/^import .*$/mg,''))"`.

## 10. Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | écran, lecteur, panneau Paramètres |
| `css/style.css` | style |
| `js/app.js` | minuteur, cadran, couleurs, respiration, messages, coach, lecteur, Paramètres, migrations |
| `js/audio.js` | radio / playlists, musique de pause générée, bruits générés, dings, tic-tac |
| `js/sync.js` | sauvegarde / reprise sur Google Drive (à la main) |
| `js/defaults.js` | valeurs par défaut, radios, playlists, respirations, messages |
| `sw.js` | hors ligne |
| `music/` | 16 MP3 CC0 (voir `CREDITS.md`) |
| `android/` | projet Android Studio de l'APK, mis de côté le 30/10 (voir `android/README.md`) |
| `tools/make-icons.mjs` | icônes du site et de l'APK |
| `tools/qrcode.py` | QR code de n'importe quel texte ou adresse : `python tools/qrcode.py "texte" [fichier.png\|.svg]` (segno installé tout seul dans `tools/.pylib`, ignoré par git) |
| `tools/detourer-damier.py` | retire le faux fond en damier qu'une IA dessine parfois à la place de la transparence : `python tools/detourer-damier.py image [sortie.webp]` (garde les lueurs en semi-transparence) |
| `tools/projetfocus.ico` | icône du raccourci « projetfocus » du bureau de l'utilisateur, qui ouvre le **site publié** dans une fenêtre Chrome à part (`chrome --app=https://darkcapp68-web.github.io/projetfocus/`) : une seule source pour le PC, le téléphone et les autres ordinateurs |
