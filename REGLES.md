# projetfocus â€” rÃ¨gles du programme

RÃ©fÃ©rence pour reprendre le travail dans une nouvelle session. Elle complÃ¨te
`CAHIER_DES_CHARGES.md` (le besoin d'origine) avec **toutes les dÃ©cisions prises depuis**,
et prÃ©vaut sur lui quand ils diffÃ¨rent. Ã‰tat d'avancement et actions en attente :
`CHANTIER.md`.

---

## 1. Principes

- PWA en HTML / CSS / JavaScript **sans framework ni build** : le dossier se publie tel quel
  (GitHub Pages, dÃ©pÃ´t public `darkcapp68-web/projetfocus`, branche `main` / racine).
  Site : https://darkcapp68-web.github.io/projetfocus/
- **Un seul site Ã  maintenir.** PC : appli installÃ©e depuis Chrome / Edge (fenÃªtre Ã  part).
  TÃ©lÃ©phone et tablette (tout Android, pas d'Apple) : site **installÃ© par Chrome** (icÃ´ne sur
  l'Ã©cran d'accueil). **APK mis de cÃ´tÃ©** (30/10, dÃ©cision de l'utilisateur : l'appli
  installÃ©e par Chrome suffit pour l'instant) ; le projet `android/` est gardÃ© pour plus tard.
- Style moderne et minimal : au repos, seulement le fond, le cadran, le temps (et le message
  ou l'action du coach). ContrÃ´les visibles au toucher / mouvement de souris, puis effacÃ©s.
- Ton bienveillant, en franÃ§ais, pensÃ© pour un dÃ©veloppeur (Progress / ABL).
- Pas de publicitÃ© : les radios qui en passent sont dÃ©cochÃ©es et marquÃ©es Â« avec pub Â» /
  Â« pub probable Â». On ne contourne jamais un blocage volontaire (ex. SomaFM).

## 2. Ã‰cran et couleurs

- **Fond qui suit l'heure rÃ©elle** sur 24 h : 6 moments (Nuit 22:30 indigo, Aube 06:00
  orangÃ©, MatinÃ©e 08:30 bleu, Midi 12:00 vert, AprÃ¨s-midi 14:30 ambre, SoirÃ©e 18:30 prune).
  Ã€ l'heure d'un moment, sa couleur est pure ; entre deux, la couleur **glisse en continu,
  minute par minute** (courbe douce, mÃ©lange OKLab). Le nom affichÃ© est celui du moment le
  plus proche. RÃ©glable : couleurs, heures, noms, ou couleur fixe.
- **DÃ©mo** : ParamÃ¨tres â†’ Apparence â†’ Â« Voir la journÃ©e en accÃ©lÃ©rÃ© Â» (24 h en 30 s, heure
  affichÃ©e en bas, un toucher arrÃªte).
- **Cadran** faÃ§on minuteur de cuisine : arc blanc de 5 px sur cercle translucide de 5 px, point
  en tÃªte, graduations seulement pendant le rÃ©glage. On le tourne pour rÃ©gler 1 Ã  60 min ;
  l'arc se vide dans le sens des aiguilles d'une montre. **Style du cadran** (ParamÃ¨tres â†’ Apparence,
  et aussi le menu **Â« Affichage Â»** en haut Ã  gauche de l'Ã©cran principal, 31/10, demande de
  l'utilisateur : style et forme du mode Rythme dans une seule liste, Â« Rythme Â· Jauge
  arc-en-ciel Â»â€¦, en dragÃ©e comme le lecteur, visible avec les autres contrÃ´les mÃªme pendant
  le focus ; sur le tÃ©lÃ©phone, menu et Â« ParamÃ¨tres Â» en premiÃ¨re ligne, prÃ©rÃ©glages et
  cycles en seconde ; **cases Ã  cocher** dans Apparence â†’ Â« Affichages du menu Â» pour n'y
  garder que quelques affichages, tous cochÃ©s par dÃ©faut, l'affichage en cours y reste
  toujours ; rÃ©glage `hiddenLooks`) :
  Â« **Normal** Â» (par dÃ©faut, l'arc et les chiffres ; pendant le focus, **fondu lent** : le
  cadran s'efface presque (12 %) puis revient, 16 s aller-retour, et redevient entiÃ¨rement
  visible dÃ¨s que les contrÃ´les s'affichent ; rÃ©glable) ou Â« **RÃªveur** Â» : le cadran est posÃ©
  dans un **cadre en engrenages** (`img/cadre-reveur.webp`, image gÃ©nÃ©rÃ©e sans personnage,
  fausse transparence retirÃ©e avec `tools/detourer-damier.py`) ; son centre est un voile
  sombre transparent qui garde la couleur du fond. Pendant le focus, un **atome** : soleil au
  centre, 8 planÃ¨tes aux couleurs proches des vraies, chacune sur une orbite dans son propre
  plan (inclinÃ©es de 68Â°, rÃ©parties sur 180Â°), l'ensemble tournant lentement en 3D (un tour
  en 2 min), les planÃ¨tes passant devant ou derriÃ¨re le soleil ; **une seule trajectoire
  tracÃ©e, qui change chaque minute** ; une **comÃ¨te** part du bord et atteint le soleil Ã  la
  fin du focus. Pendant la pause, la **vague** (le cadran se vide comme un verre, couleur
  inverse du fond). En rÃªveur, ni temps
  ni nom de phase pendant que le temps passe ; **au repos, le cadran normal** (arc, point,
  graduations, chiffres) pour bien voir ce qu'on rÃ¨gle : le cadre et la scÃ¨ne n'apparaissent
  qu'au dÃ©marrage.
  Â« **Rythme** Â» : le cadran normal, mais le cercle **rÃ©agit Ã  la musique** qui joue :
  il bat sur les temps forts (lÃ©ger grossissement et lueur), le **BPM** s'affiche sous le
  temps (Â« focus Â· 124 BPM Â», estimÃ© en ~10 s, fiable sur l'Ã©lectro, absent sur le classique
  sans battement), et une forme au choix (ParamÃ¨tres â†’ Apparence â†’ Forme du mode Rythme) :
  barres, onde, **goutte** (par dÃ©faut), sonar ou Ã©tincelles, toutes en **nÃ©on** (cÅ“ur clair
  et halo, magenta â†’ violet â†’ bleu â†’ cyan : selon la frÃ©quence pour les barres, autour du
  cercle pour l'onde et la goutte, avec l'Ã¢ge pour le sonar, au hasard pour les Ã©tincelles).
  Deux formes **arc-en-ciel de puissance** (31/10, idÃ©e de l'utilisateur) : 7 anneaux
  concentriques, des basses (rouge, dedans) aux aigus (violet, dehors), chacun selon la
  puissance de sa bande (sensibilitÃ© propre Ã  chaque anneau) ; sur chaque temps fort, une
  vague les traverse du centre vers l'extÃ©rieur (au rythme du BPM). Â« **Anneaux** Â» : les
  cercles entiers s'allument et s'Ã©paississent ; Â« **Jauge arc-en-ciel** Â» : chaque anneau
  part du bas et remonte des deux cÃ´tÃ©s selon la puissance (le tour complet quand Ã§a cogne),
  puis redescend doucement comme un vumÃ¨tre.
  Le **temps** aussi est en nÃ©on (cÅ“ur blanc, halo magenta â†’ violet â†’ cyan) et s'illumine sur
  chaque temps fort. L'analyse (`audio.analyser`,
  `enableAnalysis()` dans `js/audio.js`) fait passer la musique par le moteur audio, en mode
  CORS (toutes les radios du menu l'acceptent ; testÃ©) ; elle ne s'active qu'en mode Rythme,
  puis reste jusqu'au rechargement. Le spectre est compensÃ© du volume du lecteur et ramenÃ© Ã 
  l'Ã©chelle des derniÃ¨res secondes : une musique calme ou jouÃ©e bas bouge autant qu'une
  forte.
  Â« **Brisure** Â» â€” **mis de cÃ´tÃ© le 31/10** (dÃ©cision de l'utilisateur : Â« pas top Â», sans
  savoir dire pourquoi ; retirÃ© du choix du cadran, rÃ©glages dÃ©jÃ  enregistrÃ©s repassÃ©s en
  Normal, code et rÃ©glages gardÃ©s dans `js/app.js` pour plus tard). Ce qu'il faisait (idÃ©e de
  l'utilisateur, 30/10) : pendant le focus, un **Ã©clair** ou une
  **fissure** (rÃ©glage Â« Aspect Â», Ã©clair par dÃ©faut) part du centre du cadran sur tout l'Ã©cran
  (canevas `#crack-fx`) en 6 Ã  9 branches qui se **ramifient au hasard en chemin** et
  **poussent en continu**, Ã  vitesse constante le long des branches ; les derniers bouts
  arrivent Ã  la fin du focus. C'est la **version 1**, retenue par l'utilisateur (30/10) pour
  sa fluiditÃ©, aprÃ¨s des essais Â« 2 traits qui se divisent en 2 toutes les N secondes, directions
  sur 360Â°, traits droits Â» jugÃ©s saccadÃ©s. Un trait qui touche le **bord de l'Ã©cran rebondit**
  (angle rÃ©flÃ©chi). **Ã‰clair** : dents de scie autour de la direction de chaque branche, nÃ©on
  (halo bleu-violet, cÅ“ur blanc). **Fissure** : courbe douce, couleur du cadran. Branches
  principales Ã©paisses et lumineuses, les suivantes de plus en plus fines. Remplir l'Ã©cran
  n'est pas un but. AllÃ©gÃ© pour le tÃ©lÃ©phone : segments finis dessinÃ©s une fois, un tracÃ© par
  profondeur, canevas plafonnÃ© Ã  2 pixels par point, 10 images par seconde, ni filtre ni flash.
  Pendant le focus, le cadran s'efface : seul un **petit temps** discret reste, au-dessus du
  message de soutien ; un toucher (contrÃ´les affichÃ©s) ramÃ¨ne le grand temps. En pause, le
  tracÃ© **s'efface** (fondu 3 s) ; au focus suivant, un **nouveau tracÃ© tirÃ© au hasard**. Au
  repos, le cadran normal. **Vitesse** (rÃ©glage, visible en mode Brisure) : Â« Normale Â» (au
  bout des branches Ã  la fin du focus), Â« **Lente** Â» (la moitiÃ©, par dÃ©faut) ou Â« TrÃ¨s lente Â»
  (30 %) ; demande de l'utilisateur, 30/10 : ralentir la progression. **Teinte du tracÃ©**
  (rÃ©glage) : Â« **Noire** Â» par dÃ©faut (30/10, demande de l'utilisateur : le tracÃ© blanc se
  confondait avec le temps et le message en blanc ; l'Ã©clair garde un mince halo bleutÃ©) ou
  Â« Claire Â» (le nÃ©on blanc et la fissure couleur du cadran d'avant) ou Â« **Faille** Â» (31/10,
  idÃ©e de l'utilisateur : Â« une ouverture sur une autre dimension Â») : les traits
  **s'Ã©largissent** pendant tout le focus (jusqu'Ã  4 fois, surtout les grosses branches) et
  laissent voir un **ciel Ã©toilÃ©** (nÃ©buleuses violettes et bleues, deux couches d'Ã©toiles
  qui glissent lentement Ã  des vitesses diffÃ©rentes), bordÃ© de violet ; Ã  la fin, l'autre
  dimension couvre environ la moitiÃ© de l'Ã©cran. **Ã‰paisseur des traits**
  (rÃ©glage, idÃ©e de l'utilisateur : aspect d'Â« envahissement spatial Â») : Fine (Ã— 0,6),
  Normale (par dÃ©faut), Ã‰paisse (Ã— 1,8), TrÃ¨s Ã©paisse (Ã— 3).
  Animations mÃªme si l'appareil demande de les rÃ©duire (souhait de l'utilisateur). Sous le cadran : bascule
  Â« focus / pause Â» pour choisir ce que l'on rÃ¨gle. PrÃ©rÃ©glages 25/5 et 50/10, nombre de
  cycles (0 = sans fin).
- **TÃ©lÃ©phone Ã  la verticale** : tout remonte sous la barre du haut (Â« ParamÃ¨tres Â»), le
  cadran prend la hauteur qui reste au-dessus du lecteur (environ 230 px) ; rien ne se
  chevauche, la page dÃ©file seulement sur un trÃ¨s petit Ã©cran.
- **TÃ©lÃ©phone couchÃ© (paysage**, Ã©cran plus large que haut et moins de 560 px de haut ; 31/10,
  demande de l'utilisateur : tout s'Ã©crasait ; classe `land` posÃ©e en JS) : l'**horloge
  collÃ©e Ã  gauche** (le cadran, dans son style, qui prend la hauteur restant vraiment entre la
  barre du haut et le lecteur, sans jamais faire dÃ©border le bas), Ã  droite une **barre du temps** qui avance vers la droite (trait blanc de la couleur
  du cadran, point lumineux en tÃªte, minutes restantes au bout ; vide au repos), sous elle le
  message et les boutons du moment ; le **lecteur sur une seule ligne** en bas, la musique
  Ã©largie vers la gauche pour lire son nom en entier (la ligne Â« ce qui joue Â» dessous) ; barre du haut plus fine. Le bloc de droite (`#side`) ne change
  rien en portrait ni sur PC. Sobre : pas d'effet de plus.
  **Vue Â« Rythme Â· Onde horizontale Â»** (31/10, d'aprÃ¨s une image de l'utilisateur) : des
  barres nÃ©on symÃ©triques partent du bord de l'horloge vers la droite, des basses (cyan) aux
  aigus (violet), chacune avec sa propre sensibilitÃ© ; la partie dÃ©jÃ  Ã©coulÃ©e de la phase est
  plus vive, un trait blanc marque l'avancÃ©e (elle remplace la barre du temps) ; message
  au-dessus, boutons dessous. Choisir cette vue **met en paysage** : disposition paysage dÃ¨s
  que l'Ã©cran est plus large que haut (PC compris), et demande Ã  Android de rester couchÃ©
  (`screen.orientation.lock`, acceptÃ© seulement pour l'appli installÃ©e ou en plein Ã©cran ;
  libÃ©rÃ© en changeant de vue). En portrait, l'onde passe sous l'horloge.
- **Vue Â« Rythme Â· Petit hÃ©ros Â»** (31/10, idÃ©e de l'utilisateur : Â« comme sur les jeux idle, un
  petit perso qui avance et fait des choses sans s'arrÃªter Â») : une bande de pixels (canevas
  `#wave-fx`, sous l'horloge en portrait, Ã  droite en paysage ; la vue ne force pas le paysage)
  oÃ¹ un petit chevalier court sans fin dans un dÃ©cor qui dÃ©file (Ã©toiles, deux rangÃ©es de
  collines, arbres, buissons, fleurs). **Deux pas par temps du BPM** (allure de 80 BPM sans
  musique), **un saut sur chaque temps fort**, le dÃ©cor accÃ©lÃ¨re un peu sur le temps. Il
  **ramasse des piÃ¨ces** (+1), **bat des slimes** (+3, coup d'Ã©pÃ©e) et **ouvre des coffres**
  (+10) ; les piÃ¨ces s'additionnent en haut Ã  gauche avec le **niveau** (niveau = 1 + âˆš(piÃ¨ces / 15),
  barre de progression ; le casque et l'Ã©charpe changent de couleur Ã  chaque niveau, Â« NIVEAU n ! Â»
  avec des Ã©tincelles). PiÃ¨ces et slimes battus sont gardÃ©s sur l'appareil
  (`localStorage` `projetfocus.heros`, pas dans les rÃ©glages ni sur Drive). **Focus** : il
  avance vers le **drapeau d'arrivÃ©e** au fil du temps (l'avancÃ©e remplace la barre du temps) ;
  en fin de focus il saute de joie. **Pause** : il s'assoit au **feu de camp** et dort (Â« z Â»), le
  dÃ©cor s'arrÃªte, le feu bat au rythme. MÃªme sans musique il court. Code : `drawHero()` dans
  `js/app.js`.
- **Pas de zoom** de la page (31/10 : sur le tÃ©lÃ©phone, une page zoomÃ©e Ã  104,6 % par accident
  coupait la droite et le bas ; vu en mesurant l'appli Ã  distance par USB) : viewport
  `maximum-scale=1, user-scalable=no` et `touch-action: manipulation`.
- Info discrÃ¨te en bas : Â« moment Â· phase Â· cycle Â» (ex. Â« MatinÃ©e Â· focus Â· 2/4 Â»).

## 3. Minuteur

- Phases : rÃ©glage (repos) â†’ focus â†’ pause â†’ focusâ€¦ â†’ sÃ©rie terminÃ©e.
- **DÃ©marrer** lance le minuteur, la musique et le bruit de fond choisis (si Â« Lancer le son
  en dÃ©marrant le focus Â» est cochÃ©, par dÃ©faut oui). En focus le bouton devient Pause /
  Reprendre. Â« Passer Ã  la pause Â» existe en focus.
- **ArrÃªter** (en focus, et en pause au toucher) remet tout Ã  zÃ©ro et **coupe tous les sons**
  (musique, musique de pause, bruit), en gardant les choix pour le prochain DÃ©marrer.
- Pause longue aprÃ¨s N cycles (par dÃ©faut aprÃ¨s 4, 15 min).
- **Recharger ou rouvrir la page repart de zÃ©ro** comme une premiÃ¨re ouverture : minuteur
  arrÃªtÃ©, aucun son ; seuls les rÃ©glages et les choix (musique, bruit, volumesâ€¦) sont relus.
  Pas de reprise du minuteur ni du son aprÃ¨s rechargement (dÃ©cision de l'utilisateur).
- Le temps est calculÃ© sur des horodatages (pas de dÃ©rive). Ã‰cran gardÃ© allumÃ© pendant une
  sÃ©rie (Wake Lock, rÃ©glable).

## 4. Pause

- **Couleur de pause tirÃ©e au hasard** parmi 10 couleurs vives (ou couleur fixe).
- **Respiration guidÃ©e** (l'Ã©cran Â« respire Â»), par dÃ©faut **cohÃ©rence cardiaque 5 s / 5 s**
  (6 respirations par minute ; une pause de 5 min = une sÃ©ance Â« 365 Â»). Autres rythmes :
  apaisante 4/6, carrÃ©e 4-4-4-4, 4-7-8, ou simple pulsation (sans consignes).
  **La respiration se voit par** (rÃ©glage, 31/10, demande de l'utilisateur : soit les
  couleurs avec un mot de taille fixe, soit un mot qui exprime vraiment le mouvement sur un
  Ã©cran immobile) : Â« **le mot** Â» (par dÃ©faut : le mot grandit jusqu'Ã  3 fois et rÃ©trÃ©cit,
  bien lisible, toujours affichÃ© ; l'Ã©cran ne bouge pas), Â« les couleurs Â» (le mot garde sa
  taille), Â« le mot et les couleurs Â» (l'ancien comportement, mot jusqu'Ã  2,4 fois) ou Â« un
  voile sombre Â». Avec les couleurs, l'Ã©cran prend **exactement les couleurs
  choisies** dans ParamÃ¨tres â†’ Pause (pas un voile mÃ©langÃ© Ã  la couleur de pause) : inspire â†’
  **bleu ciel**, retiens â†’ **dorÃ©** puis ne bouge plus, expire â†’ **noir**. La premiÃ¨re
  inspiration part de la couleur de pause. Sur une teinte claire, texte et cadran passent en
  sombre (Ã  mi-chemin de l'Ã©tape). Â« inspire / retiens / expire Â» Ã©crit sous le temps
  (rÃ©glable) ; quand le mot bouge, **il grandit pendant l'inspiration** (sur toute la durÃ©e
  de l'Ã©tape), **rÃ©trÃ©cit pendant l'expiration** et garde sa taille quand on retient.
  Voile sombre : son intensitÃ© est rÃ©glable. Le rythme choisi
  s'affiche sous le temps (Â« pause Â· cohÃ©rence cardiaque Â»).
  La respiration s'arrÃªte quand la pause est finie.
- **Une action du coach** Ã  la fois (liste modifiable), deux autres proposÃ©es au toucher.
- **Maintenir 3 s** pour reprendre avant la fin (geste volontaire). Bouton **ArrÃªter** au
  toucher. Ces boutons (et Â« Fait, je reprends Â») s'effacent avec les autres contrÃ´les ;
  appuyer Ã  la place de Â« maintenir Â», mÃªme effacÃ©, le rÃ©affiche et lance le maintien.
- **Compte Ã  rebours sonore** dans les 10 derniÃ¨res secondes de la pause : Ã  10, 8, 6 s puis
  chaque seconde de 5 Ã  1, en **tic-tac** (par dÃ©faut) ou en ding. Option pour le focus aussi
  (dÃ©cochÃ©e).
- **Fin de pause : 3 Â« ding Â»**, puis Â« reprise dans 5 s Â», puis le focus repart tout seul
  (rÃ©glable : reprise auto oui / non, dÃ©lai, nombre de dings). Â« Fait, je reprends Â» pour ne
  pas attendre.
- Plein Ã©cran au dÃ©but de la pause : **dÃ©sactivÃ© par dÃ©faut** (jugÃ© brutal), rÃ©glable.
- Notification systÃ¨me si la fenÃªtre est cachÃ©e (fin de focus, fin de pause, fin de sÃ©rie).

## 5. Messages pendant le focus

- Une phrase courte sous le cadran, en fondu, jamais animÃ©e. 40 messages de dÃ©part en
  catÃ©gories (dÃ©but, reprise aprÃ¨s pause, 5 derniÃ¨res minutes, tard le soir, concentration,
  anti-stress, astuces de dev, perso). Changement toutes les 12 min par dÃ©faut ; Â« tard Â» Ã 
  partir de 21 h. Tout est modifiable.

## 6. Son

- **Lecteur** en bas, **gros pour le doigt et la souris** (boutons 46 px, menus et curseurs
  d'au moins 44 px de haut ; partout, chaque curseur de volume sous son
  bouton et son menu) : bouton â–¶ / âšâš, menu de musiques groupÃ©, volume ; bruit de fond avec
  le **mÃªme bouton â–¶ / âšâš** (coupe sans perdre le choix), menu et volume. Les menus du
  lecteur sont des **dragÃ©es pleines** (capsule au fond translucide, flÃ¨che dessinÃ©e ; 30/10,
  demande de l'utilisateur), sombres sur une teinte claire.
- **Choisir une musique dans le menu la lance tout de suite.**
- **Musiques** (ids dans `js/defaults.js`) :
  - Playlists embarquÃ©es CC0 (HoliznaCC0) : Â« Playlist lofi Â» (9), Â« Playlist ambient
    Ã©lectro Â» (7). JouÃ©es au hasard, gardÃ©es sur l'appareil Ã  l'Ã©coute ; ParamÃ¨tres â†’
    Musiques et sons â†’ RÃ©glages avancÃ©s â†’ BibliothÃ¨que hors ligne pour tÃ©lÃ©charger / retirer une playlist entiÃ¨re.
  - Radios testÃ©es (lisibles depuis un autre site) : chill (Iâ™¥Chillhop, Chillsynth, Radio
    Paradise Mellow, laut.fm lofi), Ã©lectro (Technolovers Minimal / Deep House, FIP Electro,
    Intergalactic FM, NTS 1 et 2, Ambient Sleeping Pill, laut.fm minimal / ambient ;
    ajoutÃ©es le 31/10 pour avoir du choix, sans pub et cochÃ©es : Technolovers Techno,
    Hirschmilch Techno / Progressive / Electronic / Chillout, a.m. ambient, Ambient Modern ;
    Radio Record Techno / Minimal / Ambient, jingles en russe, pub probable, dÃ©cochÃ©es),
    Bollywood (Mirchi Top 20, Bollywood 2010s, pub probable), classique et opÃ©ra (France
    Musique OpÃ©ra / Classique Plus / Baroque / Easy Classique, Radio Swiss Classic).
  - SomaFM (Groove Salad, Deep Space One, Fluid) : refuse la lecture depuis un autre site â†’
    s'ouvre dans un onglet (marquÃ© â†—).
  - Noms : Â« Playlist â€¦ Â» pour l'embarquÃ©, Â« Radio â€¦ Â» pour les radios (pas d'ambiguÃ¯tÃ©).
  - **Cases Ã  cocher par musique** (ParamÃ¨tres â†’ Musiques et sons â†’ Musiques du menu) : seules les
    cochÃ©es apparaissent dans le lecteur. **Actuellement cochÃ©es : Technolovers Minimal
    (musique par dÃ©faut), les 7 radios techno / ambient ajoutÃ©es le 31/10 et les 5 radios
    classiques.**
  - **Plus de Â« Mes liens Â»** (retirÃ© le 31/10, dÃ©cision de l'utilisateur : YouTube jouÃ© dans
    l'appli a Ã©tÃ© essayÃ© puis retirÃ©, et ouvrir YouTube / Spotify dans un onglet ne sert Ã 
    rien, il a leurs applis). **Une nouvelle radio s'ajoute avec Claude**, dans
    `js/defaults.js`, aprÃ¨s les tests habituels (lecture depuis un autre site, publicitÃ©).
- **Musique de la pause** (choix retenu) : musique douce gÃ©nÃ©rÃ©e par l'appli (par dÃ©faut,
  faÃ§on Â« ascenseur Â», jouÃ©e mÃªme si rien ne jouait avant), mÃªme musique que le focus plus
  bas, silence, ou n'importe quelle playlist / radio cochÃ©e. En pause, le lecteur affiche la
  musique de pause et **son propre menu** ; le menu et le â–¶ du focus sont masquÃ©s. Un seul
  curseur de volume (celui du lecteur), qui rÃ¨gle la musique de la phase en cours.
- La musique du focus est **notÃ©e au dÃ©but de la pause** et **reprend aprÃ¨s** : la playlist
  au mÃªme morceau et Ã  la seconde prÃ¨s, une radio en direct. Toute radio reprise aprÃ¨s plus de 5 s de pause
  (notification Android, Ã©cran verrouillÃ©, pause) est **rechargÃ©e en direct** par dÃ©faut ;
  rÃ©glage Â« Reprise d'une radio aprÃ¨s une pause Â» (Musiques et sons, avancÃ©s) : Â« lÃ  oÃ¹ elle s'Ã©tait
  arrÃªtÃ©e Â» pour finir un morceau (classiqueâ€¦), dans la limite de ce que le navigateur garde.
- **Bruits de fond gÃ©nÃ©rÃ©s** (Web Audio, aucun fichier) : pluie, orage lointain (grondements
  Ã  des moments imprÃ©visibles), vent par rafales, neige feutrÃ©e, cafÃ©. Pas de bruit blanc /
  rose / brun (retirÃ©s, pas aimÃ©s). BaissÃ©s aussi en pause (rÃ©glable).
- Signal de changement de phase : clochette (dÃ©faut), bol chantant, deux notes, tic-tac,
  aucun ; volume rÃ©glable.

## 7. ParamÃ¨tres et sauvegarde

- Bouton Â« ParamÃ¨tres Â» discret, visible avec les contrÃ´les. Panneau en **6 sections
  repliables**, une seule ouverte Ã  la fois (sa ligne est surlignÃ©e en bleu clair, ses rÃ©glages
  dÃ©calÃ©s Ã  droite avec un trait bleu) : Temps, Pause, Musiques et sons, Messages,
  Apparence, Sauvegarde. **AllÃ©gÃ© le 30/10** (demande de l'utilisateur : trop de rÃ©glages) :
  chaque section ne montre que l'essentiel (30 rÃ©glages visibles au lieu de 65), le reste est
  repliÃ© dans Â« **RÃ©glages avancÃ©s** Â» ; et **un rÃ©glage n'apparaÃ®t que s'il sert**
  (attribut `data-if` dans `index.html`, lu par `showRelevant()` : Â« Forme Â» seulement en
  mode Rythme, Â« Fondu lent Â» seulement en Normal, couleurs de respiration seulement quand
  les couleurs montrent la respiration, couleur fixe seulement sans dÃ©gradÃ©â€¦). Aucun rÃ©glage n'a Ã©tÃ©
  supprimÃ©.
- Tout est enregistrÃ© sur l'appareil (localStorage, clÃ© `projetfocus.settings`), avec un
  numÃ©ro de **version** : chaque changement de comportement par dÃ©faut passe par une
  **migration** dans `sanitize()` (`js/app.js`) pour s'appliquer aussi aux rÃ©glages dÃ©jÃ 
  enregistrÃ©s (version actuelle : 13).
- Â« Revenir aux valeurs par dÃ©faut Â» (garde l'ID client Google), export / import JSON.
- **Sauvegarde Google Drive, Ã  la main** (dÃ©cision de l'utilisateur : rester simple, aprÃ¨s
  des conflits avec la synchronisation automatique, abandonnÃ©e) : deux boutons dans
  Sauvegarde. Â« **Sauvegarder mes paramÃ¨tres** Â» Ã©crit ceux de l'appareil dans le fichier
  visible `projetfocus-parametres.json` de Â« Mon Drive Â» (portÃ©e `drive.file`, champ
  `savedAt`) ; Â« **Reprendre mes paramÃ¨tres** Â» (avec confirmation) les ramÃ¨ne sur l'appareil.
  **Rien d'automatique** : aucune lecture ni Ã©criture du Drive sans clic, jamais de fenÃªtre
  Google d'office. Avant chaque reprise, les rÃ©glages de l'appareil sont gardÃ©s
  (`projetfocus.settings.avant-drive`) : Â« Remettre mes rÃ©glages d'avant Â». ID client
  Google dans `js/defaults.js` (projet Google Cloud `projetfocus`, client **Application Web**,
  origines `http://localhost:8417` et `https://darkcapp68-web.github.io`, en test). Le code
  secret du client n'est **jamais** utilisÃ© ni Ã©crit dans le dÃ©pÃ´t. Non sauvegardÃ©s : musique hors ligne, phase en cours.
- Les rÃ©glages sont propres Ã  chaque navigateur **et Ã  chaque adresse** (localhost,
  127.0.0.1, github.io sont des mÃ©moires sÃ©parÃ©es).

## 8. Hors ligne et publication

- Service worker `sw.js` : site en Â« rÃ©seau d'abord, cache en secours Â» (cache si le rÃ©seau
  ne rÃ©pond pas en 3 s ou hors ligne) : **un seul F5 suffit** pour voir une nouvelle version.
  Musique en cache sÃ©parÃ© (`projetfocus-music-v1`, Â« cache d'abord Â»), lecture par morceaux
  (Range) depuis le cache. Augmenter `CACHE` dans `sw.js` quand la liste des fichiers change.
- **PubliÃ©** sur GitHub Pages (remote `origin`). Chaque `git push` met le site en ligne en
  une Ã  deux minutes, sur le PC et le tÃ©lÃ©phone : on pousse aprÃ¨s chaque modification
  (voir section 9).
- **Version** affichÃ©e en bas des ParamÃ¨tres (`APP_VERSION` dans `js/app.js`) : la changer
  Ã  chaque envoi avec la **vraie** date et heure du PC (`date "+%d/%m/%Y Â· %Hh%M"`), jamais
  une heure inventÃ©e. Bouton Â« Mettre Ã  jour l'appli Â» Ã  cÃ´tÃ© : vide le cache du
  site (pas la musique), **retÃ©lÃ©charge chaque fichier du site** (`cache: 'reload'` : GitHub
  Pages laisse le navigateur garder un fichier 10 min, un simple rechargement reprenait
  l'ancien `app.js`) et recharge, pour un appareil restÃ© sur une ancienne version.
  **Avis de mise Ã  jour** (30/10) : l'appli relit `APP_VERSION` dans le `js/app.js` publiÃ©
  (`?verif-version`, revalidÃ© auprÃ¨s du site) Ã  l'ouverture, au retour au premier plan, quand
  la fenÃªtre reprend la main (PC), Ã  l'ouverture des ParamÃ¨tres (au plus une fois par minute)
  et toutes les 10 min ; si elle diffÃ¨re, un **point bleu** s'allume sur
  Â« ParamÃ¨tres Â», la ligne de version annonce la nouvelle et Â« Mettre Ã  jour l'appli Â» est
  mis en avant. **Jamais de rechargement tout seul** (ne pas couper un focus). Le dÃ©pÃ´t est public (CAHIER_DES_CHARGES.md, REGLES.md,
  CHANTIER.md visibles) : jamais de secret dedans (ni code secret Google, ni clÃ© APK).

## 9. Conventions de travail (pour Claude)

- RÃ©pondre en **franÃ§ais**, simplement. Ne rien toucher **en dehors de `C:\projetfocus`**
  (lire un autre projet pour s'aligner est permis, sans le modifier). Projet Solin
  (`C:\spro`) : interdit.
- Commits en franÃ§ais. **Pousser sur GitHub aprÃ¨s chaque modification** (accord durable de
  l'utilisateur, 29/10/2026, pour ce projet : il teste sur PC et tÃ©lÃ©phone). Exception : tout
  ce qui touche aux secrets ou au dÃ©pÃ´t `darkcapp68-web.github.io` se demande avant.
  AprÃ¨s l'envoi, ne pas attendre la mise en ligne (environ 1 min) pour rÃ©pondre : la vÃ©rifier
  en arriÃ¨re-plan et ne prÃ©venir l'utilisateur qu'en cas d'Ã©chec.
- Tester dans le navigateur intÃ©grÃ© **sur `http://127.0.0.1:8417`** (mÃ©moire sÃ©parÃ©e) pour
  ne pas perturber la session de l'utilisateur sur `localhost:8417`. Ne jamais recharger son
  onglet en pleine utilisation. Le navigateur intÃ©grÃ© refuse tout service worker (Â« unknown
  error Â» Ã  l'inscription) : tester `sw.js` Ã  part, sous Node avec un faux cache. Serveur :
  `.claude/launch.json` (`python -m http.server 8417`).
- Les tests qui Ã©crivent dans localStorage doivent le vider Ã  la fin (attention : l'appli
  rÃ©enregistre ses rÃ©glages Ã  `pagehide` et `visibilitychange`).
- Les sons gÃ©nÃ©rÃ©s ne peuvent pas Ãªtre Ã©coutÃ©s par Claude : demander un retour Ã 
  l'utilisateur. VÃ©rifier les licences de toute musique embarquÃ©e (CC0 / CC BY, notÃ© dans
  `CREDITS.md`) et la prÃ©sence de publicitÃ© avant d'ajouter une radio (tester le flux avec
  un en-tÃªte `Referer` d'un autre site).
- Le navigateur intÃ©grÃ©, quand son volet est en arriÃ¨re-plan, fige les animations, les
  transitions et le dessin : mesurer ce qui est commandÃ© (styles posÃ©s, pixels allumÃ©s aprÃ¨s
  une capture d'Ã©cran qui force l'affichage) plutÃ´t que de se fier Ã  l'image. Tests longs :
  avancer l'horloge de la page (`Date.now = () => vrai + dÃ©calage`). Pour vider les rÃ©glages
  de test : `Storage.prototype.setItem = () => {}` puis `localStorage.clear()` puis recharger
  (l'appli rÃ©enregistre ses rÃ©glages en quittant la page).
- Mise Ã  jour et service worker : le navigateur intÃ©grÃ© refuse les service workers ; les
  tester dans un Chrome sans fenÃªtre (`--headless=new --remote-debugging-port`, profil
  temporaire) avec un petit serveur qui imite GitHub Pages (`Cache-Control: max-age=600`,
  ETag). ArrÃªter Chrome et le serveur Ã  la fin.
- ContrÃ´le de syntaxe sans build :
  `node -e "new Function(require('fs').readFileSync('js/app.js','utf8').replace(/^import .*$/mg,''))"`.

## 10. Fichiers

| Fichier | RÃ´le |
| --- | --- |
| `index.html` | Ã©cran, lecteur, panneau ParamÃ¨tres |
| `css/style.css` | style |
| `js/app.js` | minuteur, cadran, couleurs, respiration, messages, coach, lecteur, ParamÃ¨tres, migrations |
| `js/audio.js` | radio / playlists, musique de pause gÃ©nÃ©rÃ©e, bruits gÃ©nÃ©rÃ©s, dings, tic-tac |
| `js/sync.js` | sauvegarde / reprise sur Google Drive (Ã  la main) |
| `js/defaults.js` | valeurs par dÃ©faut, radios, playlists, respirations, messages |
| `sw.js` | hors ligne |
| `music/` | 16 MP3 CC0 (voir `CREDITS.md`) |
| `android/` | projet Android Studio de l'APK, mis de cÃ´tÃ© le 30/10 (voir `android/README.md`) |
| `tools/make-icons.mjs` | icÃ´nes du site et de l'APK |
| `tools/qrcode.py` | QR code de n'importe quel texte ou adresse : `python tools/qrcode.py "texte" [fichier.png\|.svg]` (segno installÃ© tout seul dans `tools/.pylib`, ignorÃ© par git) |
| `tools/detourer-damier.py` | retire le faux fond en damier qu'une IA dessine parfois Ã  la place de la transparence : `python tools/detourer-damier.py image [sortie.webp]` (garde les lueurs en semi-transparence) |
| `tools/projetfocus.ico` | icÃ´ne du raccourci Â« projetfocus Â» du bureau de l'utilisateur, qui ouvre le **site publiÃ©** dans une fenÃªtre Chrome Ã  part (`chrome --app=https://darkcapp68-web.github.io/projetfocus/`) : une seule source pour le PC, le tÃ©lÃ©phone et les autres ordinateurs |
