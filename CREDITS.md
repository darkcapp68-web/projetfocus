# Crédits et licences

## Code, textes et icônes

Écrits pour projetfocus : le code (HTML, CSS, JavaScript), les messages bienveillants,
les actions du coach et les icônes (générées par `tools/make-icons.mjs`).

## Bruits de fond et signaux sonores

Aucun fichier audio. Pluie, café, bruit blanc, rose et brun, ainsi que les signaux de
changement de phase, sont **calculés dans le navigateur** (Web Audio) au moment où on les lance.
Il n'y a donc aucune licence tierce à respecter.

## Radios

Les radios ne sont pas embarquées : l'appli lit les flux publics de **SomaFM**
(Groove Salad, Deep Space One, Fluid), une radio indépendante, gratuite et sans pub,
financée par ses auditeurs. Pour la soutenir : https://somafm.com/support/

## Morceaux lofi embarqués

**Aucun pour l'instant.** Le cahier des charges demande de n'embarquer que des morceaux dont
la licence autorise la redistribution, licence vérifiée et notée ici. Je n'ai pas pu vérifier
de licence de façon fiable pendant cette première version, donc rien n'a été ajouté.

Pour en ajouter plus tard : choisir des morceaux sous licence explicite (par exemple CC0 ou
CC BY, en notant l'auteur, le titre, l'adresse de la source et la licence ici), les mettre
dans un dossier `music/`, et les ajouter au cache dans `sw.js`.
