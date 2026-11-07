# projetfocus 2.0

Nouvelle version, repartie d'une page blanche le 07/11/2026. La 1.0 reste à la racine du
dépôt, en ligne telle quelle (étiquette git `v1`).

- Adresse prévue : https://darkcapp68-web.github.io/projetfocus/v2/
- Réglages enregistrés sous des clés `projetfocus2.*` (séparés de la 1.0).
- Service worker propre à `v2/`.
- Serveur local : configuration `projetfocus-v2` de `.claude/launch.json`
  (http://127.0.0.1:8418, sert le dossier `v2/` seul ; la 1.0 reste sur le port 8417).
- Fichiers : `index.html`, `style.css`, `app.js` (version `APP_VERSION` à changer à chaque
  envoi avec la vraie heure du PC), `sw.js` (changer `CACHE` si la liste des fichiers change),
  `manifest.webmanifest`, `icons/` (copiées de la 1.0).
- Avancement : `CHANTIER.md`.

Le besoin de la 2.0 est à écrire ici avec l'utilisateur avant tout code. Leçons de la 1.0 :
voir « Chantier ouvert le 07/11 » dans `../CHANTIER.md` (son qui craque quand le téléphone
est occupé, ergonomie peu pratique sur le téléphone, réglages qui semblent mal pris en
compte, pauses avec exercice trop compliquées, série perdue quand Android ferme la page).
