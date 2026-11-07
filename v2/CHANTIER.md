# projetfocus 2.0 — chantier

Besoin : `CAHIER_DES_CHARGES.md`. La 1.0 reste à la racine du dépôt (étiquette git `v1`).

## Fait

- 07/11 : socle — serveur local, appli installable (séparée de la 1.0), bouton
  « Paramètres » (version et mise à jour), bouton radio (Technolovers Minimal) et volume.
  Rien de plus, à la demande de l'utilisateur.
- 07/11 : **onde en ligne** au-dessus de la radio (reprise de la vue « Rythme · Onde
  horizontale » de la 1.0) : barres néon symétriques, basses cyan à gauche, aigus violets à
  droite, chacune avec sa propre sensibilité ; ligne calme quand la radio est coupée. Le son
  est analysé sur une **copie** (`captureStream`) : la radio sort toujours par le lecteur du
  téléphone (dans la 1.0, le son entier passait par le moteur audio de la page). Pas encore
  de trait d'avancée du temps (pas de minuteur pour l'instant).
- 07/11 : **horloge** comme la 1.0 (cadran « Normal ») : arc blanc sur cercle translucide,
  point en tête, temps au centre, « focus » dessous ; on la tourne pour régler de 1 à
  **90 min** (07/11 : un tour = 90 min au lieu de 60, chiffres toutes les 10 min)
  (graduations pendant le réglage, effacées 4 s après) ; temps gardé
  (`projetfocus2.focusMin`, 25 par défaut). Elle ne fait que régler pour l'instant : son
  comportement changera ensuite (demande de l'utilisateur).

- 07/11 : **Démarrer** sous l'horloge (demande de l'utilisateur : dans la 1.0, l'arc gardait
  l'échelle du réglage, perturbant). Au démarrage, le **cercle devient complet** quel que soit
  le temps choisi (20 min = un tour) et se vide jusqu'à 0, le point reculant jusqu'à midi ;
  graduations cachées et horloge non réglable pendant le décompte. Démarrer ne lance la
  radio que si elle était lancée la dernière fois (07/11, comme la 1.0 : souvenir
  `projetfocus2.radioWanted`, mis à jour au bouton radio ; coupée la première fois). Le bouton devient **Arrêter** (retour au réglage, la radio
  continue). Décompte gardé sur l'appareil (`projetfocus2.run`) : rechargée ou fermée par
  Android, la page reprend le décompte (le son revient au bouton radio). À 0 : retour au
  réglage pour l'instant (signal et question de la pause : à venir).

- 07/11 : après Démarrer, **l'heure s'efface** (temps et « focus ») : fondu jusqu'à
  l'invisible en 10 s, invisible 10 s, retour en 10 s, puis ça repart (fondus ralentis de 4 à 10 s) (demande de
  l'utilisateur, d'abord essayé comme le fondu lent de la 1.0 : 12 %, 16 s aller-retour) ; le **cercle et l'arc
  restent toujours visibles** pour le décompte ; un toucher rend l'heure visible 5 s.

- 07/11 : comme la 1.0, **choix du temps du focus et de la pause** avant Démarrer : deux
  boutons sous l'horloge (« focus 25 min » / « pause 5 min ») choisissent ce que règle
  l'horloge ; les deux temps sont gardés (`projetfocus2.focusMin`, `projetfocus2.breakMin`).
  La **pause est limitée à 20 min** (07/11) et, quand on la règle, **un tour d'horloge = 20 min**
  (graduations à la minute, chiffres 0, 5, 10, 15) ; pour le focus, un tour = 90 min.
- 07/11 : bouton **« Pause maintenant »** pendant le focus : lance tout de suite le décompte
  de la pause (cercle complet qui se vide, « pause » sous le temps). À la fin de la pause :
  retour au réglage pour l'instant.

- 07/11 : **préréglages** à gauche de l'horloge avant Démarrer : 25/5, 50/10, 90/20 (focus en
  gros, pause dessous) ; celui qui correspond aux temps réglés est entouré. Au démarrage, ils
  se replient et l'horloge glisse au centre ; ils reviennent à l'arrêt.

- 07/11 : **fond qui suit le décompte** : pendant le focus, il glisse de la couleur d'origine
  (indigo `#1c1a4d`) au noir sur toute la durée ; pendant la pause, il revient du noir à la
  couleur d'origine. La barre du téléphone suit (`theme-color`). Transition de 2 s pour adoucir
  les sauts (« Pause maintenant » en plein focus, Arrêter).

- 07/11 : **reprise du focus après la pause** : à la fin de la pause, le focus reprend tout
  seul (même temps de focus) ; pendant la pause, un bouton « Reprendre le focus » le relance
  tout de suite. À la fin du focus : retour au réglage pour l'instant. Si la page était
  fermée quand la pause s'est terminée, retour au réglage (pas de focus lancé dans le dos).

- 07/11 : **Paramètres** repris de la 1.0 (demande de l'utilisateur) : deux sections
  repliables, une seule ouverte à la fois, **bruits de fond gardés** (« on verra plus tard
  ce qu'on en fait »).
  - **Musiques et sons** : musique par défaut (31 radios de la 1.0 en direct, `stations.js` ;
    pas encore les playlists MP3 embarquées ni les liens SomaFM), bruit de fond (pluie,
    orage, vent, neige, café, `noise.js` copié de la 1.0) avec son volume, « Musiques du menu »
    (cases à cocher, la radio en cours reste cochée). Le bruit démarre avec Démarrer et
    s'arrête avec Arrêter ; contexte audio en mode `playback` (moins de craquements). Reste
    à juger : ce bruit est généré par la page, donc sensible comme dans la 1.0.
  - **Sauvegarde** : Google Drive à la main (Sauvegarder / Reprendre / Remettre mes réglages
    d'avant / Se déconnecter, `sync.js` copié de la 1.0 mais **fichier à part**
    `projetfocus2-parametres.json`), Exporter / Importer (JSON), valeurs par défaut, ID client
    Google (celui de la 1.0 ; origines autorisées : localhost:8417 et github.io, donc le
    Drive ne marchera pas sur localhost:8418). **Drive non testé** (connexion Google).
  - `app.js` est maintenant un module (`stations.js`, `noise.js`, `sync.js`) ; service worker
    en `projetfocus2-v2`.

- 07/11 : **choix de la radio dans la fenêtre principale** : le nom de la radio du lecteur est
  un menu en dragée (comme la 1.0) avec les radios cochées dans « Musiques du menu » ; choisir
  une radio la lance tout de suite ; même liste et même choix que « Musique par défaut » des
  Paramètres.

- 07/11 : **pause guidée par le son** (idée de l'utilisateur : le but est de ne pas regarder
  l'écran ; la 1.0 avait de beaux modes visuels mais trop compliqués). **Trois dings**, un par
  action, faciles à retenir : **aigu = inspire, moyen = retiens, grave = expire** (do aigu,
  mi, sol grave, même volume ; « intensité » comprise comme hauteur du son). Un tour de
  respiration est fabriqué en mémoire (`breath.js`) puis **joué en boucle** par le moteur
  audio (contexte « playback ») : le rythme est tenu par l'horloge audio, pas par des
  minuteurs de la page, donc ça ne dérive pas et ça doit continuer écran éteint (à vérifier
  sur le téléphone). Démarre avec la pause (« Pause maintenant »), s'arrête à la reprise du
  focus ou à Arrêter ; l'action en cours s'écrit sous le temps (« inspire »…) à titre
  d'indication. Paramètres → **Pause** : rythme (cohérence cardiaque 5/5 par défaut,
  apaisante 4/6, carrée 4-4-4-4, 4-7-8, aucun), volume des sons, bouton « Écouter les trois
  sons ». **Je ne peux pas écouter : à juger par l'utilisateur** (hauteurs, durée, volume).
  Pas encore : cloche de début / fin de pause, signal des 10 dernières secondes, question de
  fin de focus.

## Chantier du 07/11 (demande de l'utilisateur)

1. **Musique calme pour la pause, via Suno** : à créer par l'utilisateur, prompts prêts dans
   `SUNO.md`. Le support est en place : fichier `audio/pause/calme.mp3`, choix « Musique de
   la pause » (la radio continue / silence / musique calme). **En attente du fichier.**
2. **Sons pour inspire / retiens / expire selon les modes** : à trouver ou fabriquer par
   l'utilisateur (Suno ne fait pas de sons courts : voir `SUNO.md`), à donner à Claude. Le
   support est en place : `audio/respiration/` + `manifest.json`, un jeu par rythme ou
   `default`, sinon notes de cloche. **En attente des fichiers.**
3. **Réglages de pause de la 1.0, sans les messages** : repris (Paramètres → Pause, voir
   ci-dessous). **Ni les messages bienveillants du focus, ni le coach** (les actions proposées
   pendant la pause) ne sont repris : mis de côté « pour le moment » (précisé par l'utilisateur
   le 07/11 ; un premier envoi avait repris le coach par erreur, retiré aussitôt).

- 07/11 : **Paramètres → Pause** repris de la 1.0 : respiration guidée (rythmes cohérence
  cardiaque, apaisante, carrée, 4-7-8, simple pulsation avec « une respiration toutes les N s »),
  **sons de respiration** (réglage de la 2.0 : aigu / moyen / grave), « la respiration se voit
  par » (rien par défaut, le mot qui grandit, les couleurs, les deux, un voile sombre ;
  couleurs d'inspire / retenue / expire ; « écrire inspire / retiens / expire » ; voile réglable),
  **reprise du focus** tout seul à la fin de la pause avec un délai réglable (0 par défaut) ou
  avec le bouton, **« maintenir pour reprendre »** (0 = un toucher ; réglable jusqu'à 10 s),
  plein écran au début de la pause (non par défaut), notification si la fenêtre est cachée
  (la permission est demandée à Démarrer), musique de la pause. Le son et l'écran suivent la
  même horloge. Fin de pause sans reprise automatique : « pause terminée » et le bouton attend.
  **Pas encore repris** de la 1.0 : pause longue après N cycles, nombre de cycles, « ding » de
  fin de pause, compte à rebours sonore (le son reste à décider avec l'oreille de l'utilisateur).
  Testé sur 127.0.0.1 (réglages, mot / couleurs / voile, maintenir, reprise auto ou à la
  main, radio coupée pendant la pause et rendue) ; plein écran et notifications non testés.

## Test sur le téléphone

- À la fin seulement (décision de l'utilisateur, 07/11) : d'ici là, tests sur le PC
  (http://127.0.0.1:8418, format téléphone dans le navigateur intégré).

## Questions gardées pour plus tard (l'utilisateur avancera point par point)

- Écran éteint : signaux préparés à l'avance avec la musique, question en notification
  avec un bouton « Pause ».
- La pause elle-même : que se passe-t-il pendant (écran, musique) et à la fin (le focus
  repart tout seul ? un signal ?) ?
- La musique : laquelle par défaut, et comment la choisir ?
- Le signal des 10 dernières secondes : bip, tic-tac, clochette ?
