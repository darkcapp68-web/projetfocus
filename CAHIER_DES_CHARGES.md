# projetfocus : cahier des charges

Rythmer mes journées de travail (maison et bureau) : rester concentré, et être poussé à
prendre de vraies pauses. Inspiré de la chaîne YouTube « Work with Paul » (musique + bruit de
fond + minuteur qui indique quand travailler et quand faire une pause), adapté à moi.

## Forme

- Application indépendante : page web installable (PWA), sans dépendance à Claude.
- Une seule base de code pour le PC (Chrome / Edge, « Installer l'application », fenêtre à part),
  le téléphone et la tablette (« Ajouter à l'écran d'accueil »).
- Fonctionne hors ligne une fois installée (sauf les radios en ligne).
- Hébergement : GitHub Pages, sur mon compte GitHub perso, dépôt `projetfocus`.
- Pas d'APK, pas d'émulateur. Un .exe éventuel plus tard seulement si la pause « forcée » de la
  page ne suffit pas sur le PC du bureau (le poste n'est pas verrouillé).
- Technique simple : HTML / CSS / JavaScript sans framework ni étape de build, pour pouvoir
  publier le dossier tel quel.

## Style : moderne et minimal (décision du 29/10/2026)

- À l'écran au repos : seulement la couleur de fond, le cadran et le temps. Rien d'autre.
- Cadran en trait fin (arc blanc de 2 px sur cercle translucide, un point au bout de l'arc),
  pas de secteur plein ni de graduations lourdes ; graduations visibles seulement pendant le réglage.
- Chiffres grands et légers (police système, graisse fine), une seule info secondaire discrète
  en bas (« focus · 2/4 »).
- Réglages, radio, volume : apparaissent quand on touche ou bouge la souris, puis s'effacent
  après quelques secondes.
- Pause : fond rouge qui pulse lentement (~3 s), le temps restant, UNE action du coach à la fois
  (pas une liste), et « maintenir pour reprendre » en petit.
- Pas d'ombres, pas de cartes, pas d'icônes superflues ; transitions douces.
- Les éléments des maquettes précédentes (lecteur, liste du coach) restent présents mais cachés
  dans le panneau qui apparaît au toucher.

## L'écran (un seul écran, fusion des concepts « Studio » et « Coach »)

### Couleur qui suit l'heure réelle
- Je n'ai pas d'heure de début ni de fin fixe : le fond suit l'heure de l'horloge, sur 24 h,
  en dégradé très lent : nuit indigo, aube orangée, matinée bleue, midi vert, après-midi ambre,
  soirée prune, retour à la nuit.
- Indication discrète du moment (« Matinée », « Après-midi »…).

### Le cadran (système du chronomètre / minuteur de cuisine)
- Cadran gradué de 0 à 60 minutes.
- Réglage en faisant TOURNER le cadran (glisser au doigt ou à la souris) : une fois pour le
  temps de travail, une fois pour le temps de pause (1 à 60 min chacun).
- Affichage : un secteur coloré qui se vide dans le sens des aiguilles d'une montre à mesure que
  le temps passe ; le temps restant écrit au centre (mm:ss). Violet = travail, rouge = pause.
- Nombre de cycles et préréglages rapides (25/5, 50/10) en plus du réglage au cadran.
- Les réglages sont mémorisés sur l'appareil.

### Messages bienveillants pendant le focus
- But : aider à rester concentré ET faire baisser le stress. Ton calme, jamais culpabilisant,
  pensé pour un développeur.
- Une seule phrase courte, en petit et en léger sous le cadran ; elle apparaît en fondu au début
  du focus, puis change rarement (réglable, par défaut toutes les 10-15 min) ; jamais d'animation
  qui attire l'œil pendant la concentration.
- Messages adaptés au moment : début de focus, milieu, 5 dernières minutes, reprise après pause,
  fin de journée tardive (selon l'heure : « il est tard, garde de l'énergie pour demain »).
- Exemples (liste de départ, en français, ~40 messages à écrire dans ce ton) :
  - « Une seule tâche à la fois. Le reste attendra. »
  - « Un bug n'est pas un échec, c'est une information. »
  - « Lis l'erreur en entier, la réponse y est souvent. »
  - « Petit commit, grand soulagement. »
  - « Tu n'as pas besoin de tout comprendre maintenant, juste la ligne suivante. »
  - « Bloqué ? Explique le problème à voix haute, comme à un canard. »
  - « Le code parfait n'existe pas. Le code qui marche, si. »
  - « Respire. Épaules basses, mâchoire détendue. »
  - « Ce que tu ne finis pas aujourd'hui sera plus simple demain. »
  - « Encore 5 minutes : termine ta phrase, pas tout le chapitre. »
- Dans les Paramètres : messages oui / non, fréquence, catégories (concentration, anti-stress,
  astuces de dev), et liste modifiable (ajouter mes propres messages, en retirer).

### La pause
- Écran plein qui pulse en rouge, lentement (une respiration toutes les 2 s environ), réglable.
- Le coach propose 3 actions tirées d'une liste modifiable (se lever et marcher, boire de l'eau,
  regarder au loin 20 s, s'étirer…).
- « Fait, je reprends » à la fin ; reprendre AVANT la fin demande un geste volontaire
  (maintenir le bouton 3 s).
- Son au changement de phase ; notification système si la fenêtre est cachée ;
  passage en plein écran au début de la pause.
- La musique baisse pendant la pause (ex. 40 % → 10 %) et remonte au travail.

## Bouton « Paramètres » (tout est paramétrable)

- Un bouton « Paramètres » discret, toujours accessible (il apparaît avec les autres contrôles
  au toucher ; jamais caché au point d'être introuvable).
- Il ouvre un panneau où l'on règle TOUT, avec des valeurs par défaut raisonnables :
  - Temps : durée de focus par défaut, durée de pause par défaut, nombre de cycles,
    pause longue après N cycles (oui / non, durée), enchaînement automatique ou non.
  - Couleurs : chaque couleur de la journée (nuit, aube, matinée, midi, après-midi, soirée)
    et l'heure de chacune ; couleur de la pause ; couleur du cadran et du texte ;
    possibilité de désactiver le dégradé sur 24 h et de choisir une couleur fixe.
  - Pause : vitesse et intensité de la pulsation (ou pas de pulsation), plein écran oui / non,
    durée d'appui pour reprendre avant la fin, notification oui / non.
  - Coach : liste des actions (ajouter, modifier, supprimer), une action ou aucune.
  - Son : signal de changement de phase (choix du son, volume, aucun), volume de la musique
    au travail et en pause, radio et bruit de fond par défaut, liens personnels.
  - Affichage : format du temps (minutes seules ou mm:ss), infos secondaires affichées ou non,
    délai avant que les contrôles s'effacent.
- Bouton « Revenir aux valeurs par défaut ».
- Exporter / importer les paramètres (fichier JSON) pour retrouver les mêmes réglages sur
  un autre appareil.
- Tous les paramètres sont enregistrés sur l'appareil (localStorage).

## Musique (bibliothèque « portable », la même partout)

- Pas de « mes fichiers MP3 » : bibliothèque intégrée à l'appli.
- Radios en ligne façon Work with Paul, lancées en un clic : SomaFM (gratuites, sans pub) —
  Groove Salad (électro chill / techno douce), Deep Space One (ambient), Fluid (hip-hop
  instrumental proche du lofi) ; éventuellement un live lofi YouTube intégré.
- Quelques morceaux lofi libres de droits embarqués pour le hors ligne : vérifier et noter la
  licence de chaque morceau (fichier CREDITS), n'embarquer que ce qui l'autorise.
- Bruits de fond intégrés (pluie, café, bruit blanc), mixables avec la musique.
- Possibilité d'ajouter ses propres liens (radio, playlist), mémorisés sur l'appareil.
- Lecteur discret en bas de l'écran : titre, volume, lecture / pause.

## Maquettes validées (conversation du 29/10/2026)

- Écran travail : fond coloré selon l'heure, cadran au centre, lecteur radio en bas.
- Écran pause : même écran, fond rouge pulsant, liste du coach, deux boutons.

## Idées pour plus tard (à ne PAS faire dans la première version)

- Fenêtre mini toujours au premier plan : bouton « mini » qui détache le cadran dans une petite
  fenêtre flottante (Document Picture-in-Picture de Chrome), visible au-dessus du code, avec la
  pulsation rouge en pause ; la fenêtre principale peut être réduite dans la barre des tâches.
- Affichage qui s'adapte à la taille de la fenêtre : petite = cadran + temps seulement,
  grande = vue complète avec le message bienveillant.
- (Une taille de fenêtre vraiment fixe n'est possible qu'avec un .exe : pas prévu.)
- Vraie baisse de luminosité des écrans en pause sur PC : petit pont local (localhost) qui
  lance ControlMyMonitor (DDC/CI, code VCP 10) ; réglable dans les Paramètres.

## Hors périmètre pour la première version

- Objets physiques, lampes connectées.
- Statistiques détaillées (un petit bilan du jour pourra venir plus tard).
- Synchronisation des réglages entre appareils.
