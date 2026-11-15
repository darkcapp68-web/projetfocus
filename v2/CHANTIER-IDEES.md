# projetfocus 2.0 : chantier (essentiel)

Le chantier n° 1 (toutes les idées, l'audit de la tablette, les décisions et ce qui a été fait le 15/11/2026) est gardé tel quel dans
`CHANTIER-1.md`. Ici, seulement ce qui reste vraiment à venir. Le cœur du projet reste `CAHIER_DES_CHARGES.md` et `CHANTIER.md`.

Statuts : `idée` · `à faire` · `en cours` · `fait` · `écarté`. Facilité : **Facile** (dans la page, une séance) · **Moyen**
(autorisation, stockage ou un peu de conception) · **Difficile** (serveur, APK, ou ce qu'Android permet écran éteint).

## À faire

| # | À faire | Facilité | Statut |
| --- | --- | --- | --- |
| 13.1 | **Mettre le dépôt Git à jour avec la note de version** (demande de l'utilisateur, 15/11) : écrire la note de version de la 2.0 (ce qui change depuis la 1.0, en quelques lignes lisibles), la ranger dans le dépôt (par exemple `CHANGELOG.md` et le `README.md` du site), et marquer la version dans Git (étiquette et page « Release » de GitHub). Le numéro affiché dans les Paramètres reste l'heure de publication ; la note de version porte le vrai numéro de la 2.0. | Facile | **à faire** |

## Idée retenue

### 8.5 La plage selon la météo *(idée de l'utilisateur, 15/11)*

Faire évoluer **légèrement** le « idle » de la plage (celle de l'onde, avec le petit personnage et son parasol) selon la météo de la
ville, avec la même source que l'ancienne idée 8.3 (fond lié à la météo et au soleil) : météo, lever et coucher du soleil.

Pistes, à choisir avec l'utilisateur :
- **Vent** : le parasol se balance davantage, la mer est plus agitée.
- **Pluie** : le personnage se met à l'abri, la mer est plus sombre.
- **Soleil** : ciel plus clair, ombre du parasol.
- **Nuit** (après le coucher du soleil) : ciel sombre, étoiles.

*Moyen* : une seule connexion à prévoir (la ville choisie ou la position), sans compte ni serveur ; la page actualise la météo de
temps en temps et garde la dernière valeur si elle est hors ligne. Statut : **idée**, rien n'est décidé.

## Autres idées gardées (détail dans `CHANTIER-1.md`)

### 6.4 Playlist « Mes musiques » *(idée en réserve de la 1.0)*

Une entrée « Mes musiques » dans le menu de la radio : les MP3 de l'utilisateur (achetés ou tirés de ses CD), jouée au hasard ou dans
l'ordre, en boucle, **hors ligne** une fois récupérée, sans publicité. Utilisable aussi comme musique de la pause. Trois façons d'y
mettre ses MP3, de la plus simple à la plus complète : **choisir des fichiers sur l'appareil** (bouton « Ajouter mes MP3 », aucun compte
Google, *Moyen*) ; **choisir dans le Drive** par le sélecteur Google, portée `drive.file` (*Difficile* : clé d'API publique en plus de
l'ID client) ; un dossier du Drive récupéré une fois. Les MP3 ne vont jamais dans le dépôt public. Statut : **idée**.

### Les sons attendus pour la pause *(en attente de l'utilisateur)*

- **La musique calme de la pause** : un fichier `v2/audio/pause/calme.mp3` (pistes à fabriquer avec Suno, voir `SUNO.md`). L'appli la
  détecte toute seule ; elle se choisit dans Paramètres → Pause → « Musique de la pause ».
- **Les trois sons de respiration** (inspire, retiens, expire), selon les rythmes de respiration (voir `SUNO.md` pour les noms de
  fichiers et le style). Tant que rien n'est fourni, l'appli joue de simples notes de cloche et la radio continue.

Statut : **en attente des fichiers** ; rien à coder de plus.

## Ce qui est déjà fait (en bref, détail dans `CHANTIER-1.md`)

Dock des modes et des durées, fonds en bleu pastel avec dégradés rouge et orange, focus concentré épuré, agenda et mails pro,
rdv avec coupure de la radio en visio, fin de focus avec la question « Une pause ? » puis enchaînement, compte à rebours sonore,
plage et vagues liées à la musique, menus au style clair, APK du téléphone.
