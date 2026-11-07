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
