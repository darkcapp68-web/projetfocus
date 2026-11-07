# projetfocus 2.0 : cahier des charges

Point de départ décidé avec l'utilisateur le 07/11/2026. On se concentre sur ce cœur, puis
on ajoute au fur et à mesure, à partir de ce qui n'a pas marché dans la 1.0 (voir « Chantier
ouvert le 07/11 » dans `../CHANTIER.md`).

## Le déroulé d'une séance

1. **J'ouvre l'appli, je choisis les temps, je lance.**
   - Les temps proposés sont les valeurs par défaut la première fois, puis **les dernières
     utilisées** (gardées sur l'appareil).
   - Un seul geste lance tout : le minuteur et la musique.
2. **Pendant le focus, je laisse faire.**
   - L'écran peut rester **allumé ou éteint** : le minuteur, la musique et les signaux
     sonores doivent continuer dans les deux cas.
   - La musique joue sans que j'aie à m'en occuper.
3. **Fin du focus.**
   - Un **signal sonore** se répète pendant les **10 dernières secondes**.
   - Puis une **question** : « On fait une pause ? ».
     - **Je réponds** : la pause démarre.
     - **Je ne réponds pas en 15 secondes** : le **focus reprend** (pour un nouveau tour).
   - Raison : l'utilisateur se dit « pas discipliné » ; la pause se propose, ne s'impose pas.

## Principes techniques retenus (leçons de la 1.0)

- Tout doit marcher **écran éteint** : les signaux de fin et la question ne peuvent pas
  dépendre d'un minuteur de la page (Android l'endort). À l'écran éteint, la question
  arrive en **notification** avec un bouton pour lancer la pause.
- **Son** : aucun son fabriqué en continu par la page (cause des craquements quand le
  téléphone est occupé) ; musique jouée par le lecteur du téléphone.
- **Série gardée** : si Android ferme la page, la séance reprend là où elle en était.
- Pensé **d'abord pour le téléphone**, gros boutons, peu de choses à l'écran.
- Réglages enregistrés sous `projetfocus2.*`, séparés de la 1.0.

## Questions ouvertes

- La pause elle-même : que se passe-t-il pendant (écran, musique) et à la fin (le focus
  repart tout seul ? un signal ?) ?
- La musique : laquelle par défaut, et comment la choisir ?
- Le signal des 10 dernières secondes : un bip, un tic-tac, une clochette ?
