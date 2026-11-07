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
