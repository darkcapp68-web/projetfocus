# projetfocus

Un minuteur pour rythmer tes journées de travail : un temps de focus, puis une vraie pause.
Un seul écran : la couleur de fond suit l'heure, un cadran qu'on fait tourner comme un
minuteur de cuisine, le temps restant au centre. Radio et bruits de fond en option.

![Écran de réglage sur téléphone](docs/capture-telephone-reglage.jpg)
![Écran de pause sur téléphone](docs/capture-telephone-pause.jpg)

La référence complète est dans [CAHIER_DES_CHARGES.md](CAHIER_DES_CHARGES.md).

---

## Utilisation en 30 secondes

1. **Tourne le cadran** (doigt ou souris) pour choisir la durée du focus. Touche « pause »
   sous le cadran pour régler la pause de la même façon. Les raccourcis 25/5 et 50/10, et le
   nombre de cycles, sont en haut à gauche.
2. **Démarrer**. Les boutons s'effacent après quelques secondes ; touche l'écran ou bouge la
   souris pour les faire revenir.
3. À la fin du focus, l'écran passe **en rouge et respire doucement**, avec une action à faire.
   La musique baisse. Pour reprendre avant la fin, **maintiens** le bouton 3 secondes.
4. À la fin de la pause : « Fait, je reprends ».

Tout se règle dans **Paramètres** (en haut à droite, visible quand les contrôles apparaissent).
Les réglages restent sur l'appareil. Pour avoir les mêmes ailleurs : Paramètres → Exporter,
puis Importer sur l'autre appareil.

Raccourcis clavier : `Espace` démarre ou met en pause le focus, les flèches règlent le cadran
quand il a le focus, `Échap` ferme les Paramètres.

---

## Comment vérifier (sur ton PC, en local)

Il faut seulement Python (déjà installé chez toi).

1. Ouvre un terminal dans `C:\projetfocus` et lance :

   ```bash
   python -m http.server 8417 --bind 127.0.0.1
   ```

2. Ouvre http://localhost:8417 dans Chrome ou Edge.
3. Vérifie, dans l'ordre :
   - Le fond a une couleur qui correspond au moment de la journée (le nom est écrit en bas).
   - Tourne le cadran : les graduations apparaissent, le temps change minute par minute.
   - Règle un focus de **1 minute** et une pause de **1 minute**, puis Démarrer.
   - Après 1 minute : petit son, fond rouge qui respire, une action du coach.
   - Maintiens « maintenir pour reprendre » : un appui court ne fait rien, 3 secondes relancent
     le focus (en bas : « focus · 2/4 »).
   - Ouvre Paramètres, change une couleur ou la pulsation : l'effet est immédiat.
   - Choisis « Pluie » dans le menu des bruits : tu dois entendre la pluie.
4. Pour voir la version téléphone sur le PC : touche `F12`, puis l'icône téléphone.

`Ctrl+C` dans le terminal arrête le serveur.

> Astuce : l'appli se met en cache pour marcher hors ligne. Après une modification du code,
> recharge la page deux fois pour voir la nouvelle version.

---

## Publier sur GitHub Pages (une seule fois)

Rien n'a été envoyé sur GitHub : c'est à toi de le faire, quand tu veux.

1. Sur https://github.com/new, crée un dépôt nommé **`projetfocus`** sur ton compte perso.
   Laisse-le **public** (GitHub Pages gratuit ne publie que les dépôts publics) et ne coche
   rien (pas de README, pas de licence).
2. Dans un terminal, dans `C:\projetfocus` (remplace `TON-COMPTE`) :

   ```bash
   git remote add origin https://github.com/TON-COMPTE/projetfocus.git
   ```

   ```bash
   git push -u origin main
   ```

3. Sur GitHub, dans le dépôt : **Settings → Pages**. Sous « Build and deployment », choisis
   **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
4. Une à deux minutes plus tard, l'appli est en ligne à
   `https://TON-COMPTE.github.io/projetfocus/`.

Pour publier une modification ensuite : `git add -A`, `git commit -m "…"`, `git push`.
Les appareils qui ont déjà l'appli prennent la nouvelle version au deuxième lancement.

À savoir : tout le contenu du dépôt devient public, y compris le cahier des charges.

---

## Installer l'appli

Une fois publiée, ouvre `https://TON-COMPTE.github.io/projetfocus/` puis :

- **PC (Chrome ou Edge)** : l'icône « Installer » dans la barre d'adresse (un écran avec une
  flèche), ou menu `⋮` → *Caster, enregistrer et partager* → *Installer projetfocus*
  (Edge : `…` → *Applications* → *Installer ce site en tant qu'application*).
  L'appli s'ouvre dans sa propre fenêtre et apparaît dans le menu Démarrer.
- **Téléphone ou tablette Android (Chrome)** : menu `⋮` → *Ajouter à l'écran d'accueil*
  → *Installer*.
- **iPhone ou iPad (Safari)** : bouton Partager → *Sur l'écran d'accueil*.

Ouvre l'appli une fois avec Internet : ensuite elle marche **hors ligne** (sauf les radios).

Au premier démarrage d'un focus, le navigateur demande l'autorisation d'afficher des
**notifications** : accepte-la si tu veux être prévenu quand la fenêtre est cachée.

---

## Ce qui est fait, et les écarts avec le cahier des charges

Fait : écran unique minimal, couleur sur 24 h (6 moments réglables), cadran à tourner
(1 à 60 min) qui se vide dans le sens des aiguilles d'une montre, préréglages 25/5 et 50/10,
cycles et pause longue, messages bienveillants (40 au départ, selon le moment, fréquence et
catégories réglables, liste modifiable), pause rouge qui respire, une action du coach à la
fois, maintenir pour reprendre, son, notification, plein écran, musique baissée en pause,
bruits de fond générés (pluie, café, bruit blanc, rose, brun), liens personnels, contrôles
qui s'effacent, Paramètres complets avec valeurs par défaut, export / import JSON,
enregistrement sur l'appareil, hors ligne, écran gardé allumé pendant une série.
Une série en cours survit à un rechargement de la page.

Écarts et limites :

- **Radios SomaFM** : SomaFM refuse ses flux quand ils sont lus depuis un autre site
  (testé : refus depuis `localhost` comme depuis une adresse `github.io`). L'appli ne contourne
  pas ce blocage : si la radio refuse, un lien « Écouter … sur somafm.com » apparaît sous le
  lecteur et ouvre leur lecteur officiel dans un onglet. Tes propres liens audio (Paramètres →
  Son → Mes liens) se lisent, eux, directement dans l'appli. *À décider* : demander
  l'autorisation à SomaFM, ou choisir d'autres radios qui autorisent la lecture depuis un site.
- **Morceaux lofi embarqués** : aucun, faute de licence vérifiée (voir [CREDITS.md](CREDITS.md)).
- **Live lofi YouTube** : pas intégré. Un lien YouTube ajouté dans « Mes liens » s'ouvre dans
  un onglet.
- **Cadran** : le style minimal (arc blanc fin) remplace le secteur violet / rouge du premier
  jet ; la pause reste reconnaissable à son fond rouge. Les couleurs du cadran et du texte
  sont réglables.
- **Coach** : une action affichée à la fois (décision de style) ; deux autres idées sont
  proposées au toucher, et on peut les choisir à la place.
- **Pulsation** : une respiration toutes les 3 s par défaut (décision de style), réglable de 1 à 8 s.
- **Plein écran** : les navigateurs ne l'autorisent qu'après un geste de l'utilisateur. Si la
  pause commence sans toi, le plein écran se fait au premier toucher ou clic.
- **Fenêtre cachée** : Chrome ralentit les pages cachées ; la notification peut arriver avec
  jusqu'à une minute de retard si aucun son ne joue. Le temps affiché reste juste.
- **iPhone / iPad** : iOS ne laisse pas une page régler le volume de la radio, donc la
  baisse en pause ne s'applique qu'aux bruits de fond. Les notifications n'y marchent que
  si l'appli est installée sur l'écran d'accueil (iOS 16.4 ou plus).
- Le petit bilan du jour et la synchronisation entre appareils sont hors périmètre (version 1).

---

## Pour modifier

Aucun outil à installer : HTML, CSS et JavaScript, sans étape de build.

| Fichier | Rôle |
| --- | --- |
| `index.html` | l'écran et le panneau Paramètres |
| `css/style.css` | le style |
| `js/app.js` | minuteur, cadran, messages, coach, Paramètres |
| `js/audio.js` | radio, bruits générés, signaux sonores |
| `js/defaults.js` | valeurs par défaut, messages, actions du coach, radios |
| `sw.js` | mode hors ligne |
| `tools/make-icons.mjs` | regénère les icônes : `node tools/make-icons.mjs` |
