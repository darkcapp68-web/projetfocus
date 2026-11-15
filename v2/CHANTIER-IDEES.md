# projetfocus 2.0 : chantier « tout azimut »

Idées ouvertes le 15/11/2026 (demande de l'utilisateur : il n'est pas satisfait de la 2.0
recentrée, il veut explorer large). **Rien n'est décidé** : chaque point se définit avec
l'utilisateur avant d'écrire du code. Le cœur (`CAHIER_DES_CHARGES.md`, `CHANTIER.md`) reste
la base ; ce fichier dit où l'on peut aller ensuite.

Contraintes à garder en tête : PWA sans serveur ni build, dépôt public (aucun secret dedans),
tout Android, réglages `projetfocus2.*`, tout doit marcher écran éteint, pas de son fabriqué
en continu par la page.

Statut des points : `à définir` · `choisi` · `en cours` · `fait` · `écarté`.

---

## 1. Lien avec mes agendas Google (premier point voulu par l'utilisateur) : à définir

**But** : que le focus tienne compte de la vraie journée (réunions, rendez-vous), au lieu de
vivre à côté d'elle.

### Ce qu'on pourrait faire (du plus simple au plus ambitieux)
1. **Lire l'agenda, rien d'autre** : afficher « prochain rendez-vous dans 38 min » discrètement
   sur l'écran de réglage.
2. **Adapter le focus au créneau libre** : proposer « tu as 52 min avant ta réunion de 14h »,
   avec un bouton qui règle le focus à ce temps (ou au préréglage le plus proche).
3. **Ne jamais empiéter** : prévenir (notification) quand un focus ou une pause débordera sur un
   rendez-vous, et couper proprement la séance avant.
4. **Écrire les séances dans l'agenda** : chaque focus terminé devient un évènement
   « Focus : <ce que j'ai fait> » dans un **agenda dédié** « projetfocus » (pour ne pas polluer
   les autres), donc visible sur le téléphone et le PC avec le reste.
5. **Réserver des blocs de focus à l'avance** : « 2 focus de 50 min demain matin » → l'appli
   cherche les trous de l'agenda et crée les évènements ; rappel à l'heure avec un bouton
   « Démarrer ».
6. **Plusieurs agendas** (perso, travail, famille) : choisir lesquels compter comme
   « occupé » ; ceux qui ne comptent pas sont ignorés.
7. **Mode réunion** : pendant un évènement, la musique se coupe et l'appli ne propose rien.

### Façons techniques de s'y prendre
| Piste | Avantages | Limites |
| --- | --- | --- |
| **API Google Agenda** par connexion Google (comme la sauvegarde Drive, à la main au début) | lecture et écriture, plusieurs agendas, évènements à jour | portée `calendar.readonly` (lecture) ou `calendar.events` (écriture) : portées « sensibles » ; en mode **test** du projet Google Cloud ça marche pour l'utilisateur (jusqu'à 100 testeurs), sans validation Google ; le jeton dure ~1 h, il faut redemander la connexion ; pas de lecture en arrière-plan écran éteint |
| **Adresse secrète iCal (.ics)** de chaque agenda (Paramètres de l'agenda Google → « Adresse secrète au format iCal ») | pas de connexion Google, pas de portée sensible, marche partout | lecture seule ; l'adresse est un secret (à garder sur l'appareil, **jamais dans le dépôt**) ; Google bloque parfois le CORS : à tester, sinon petit relais nécessaire ; mise à jour lente (quelques heures) |
| **Intention Android / lien « ajouter à l'agenda »** (`calendar.google.com/calendar/render?action=TEMPLATE…`) | zéro autorisation, pour **écrire** un évènement ou une séance planifiée | un évènement à la fois, validé à la main |
| **APK / appli native** (projet `android/` en réserve) | accès direct au calendrier du téléphone (`CalendarContract`), marche écran éteint, alarmes exactes | on rouvre le chantier APK, mis de côté le 30/10 |

### À décider avec l'utilisateur
- Lire seulement, ou aussi écrire dans l'agenda ?
- Combien d'agendas et lesquels (perso, travail) ? Les données de travail doivent-elles
  transiter par ce projet ? (l'agenda pro peut avoir des règles de sécurité de l'employeur)
- Est-ce acceptable de se reconnecter à Google de temps en temps (jeton court), ou faut-il
  que ça marche sans rien refaire (→ iCal ou APK) ?
- Quel est le gain n°1 voulu : « ne pas rater une réunion », « profiter des trous », ou « garder
  une trace de mes séances dans mon agenda » ?

### Proposition de départ (à valider)
Commencer par **1 + 2** (lecture, prochain rendez-vous, focus réglé au créneau libre) avec
l'API Agenda en lecture seule et connexion à la main, sur le modèle de `sync.js`. Puis **4**
(écrire les séances dans un agenda dédié) si l'envie est là. Écran éteint (point 3) : à
étudier avec le point « notifications » plus bas.

---

## 2. Se lancer plus facilement (pour qui se dit « pas discipliné ») : à définir

- **« Juste 5 minutes »** : un bouton de démarrage minimal ; on continue ou non ensuite.
- **Rituel d'une ligne** avant de lancer : « Qu'est-ce que je fais pendant cette séance ? »
  (la phrase reste affichée discrètement).
- **Rappel à heure fixe** (9h, 14h) : notification « on s'y met ? » avec un bouton qui lance le
  focus directement.
- **Parking à distractions** : en un toucher, noter une idée qui traverse l'esprit pendant le
  focus, sans quitter l'écran ; relue à la pause.

## 3. Garder une trace : à définir

- **Journal** : séances par jour, temps total, série de jours d'affilée (une seule page).
- **Carte de chaleur** façon GitHub : un carré par jour sur l'année.
- **Phrase de fin de séance** : « qu'ai-je fait ? », historique consultable.
- **Résumé de la semaine** : « 11 h de focus, meilleur jour : mardi ».
- Lien avec le point 1 : le journal peut aussi se lire dans l'agenda.
- Stockage : sur l'appareil, et sauvegarde Drive à la main comme les réglages.

## 4. Le côté jeu (ce que la 1.0 avait de plus vivant) : à définir

- **Petit héros** qui avance pendant le focus et dort au camp en pause (code existant en 1.0,
  `drawHero()`), sans dépendre de la musique.
- **Un monde qui pousse** : un arbre par séance, une forêt, une ville en pixels.
- **Créature à élever** (principe de Forest) : elle souffre si on abandonne.
- **Boss de la semaine** : une grosse séance de 90 min pour le battre.
- Niveaux, pièces et progression gardés sur l'appareil (`localStorage`), pas sur le Drive.

## 5. Lié au métier de développeur (Progress / ABL) : à définir

- **Tâche liée** : un champ « ticket / dossier » par séance ; temps passé par tâche
  (estimer, facturer).
- **Canard en plastique** : en fin de focus, reformuler le problème en une phrase.
- **Rappels de santé** dans les pauses : regarder au loin (20 s toutes les 20 min), nuque,
  poignets, eau.
- **Pause adaptative** : plus on enchaîne sans pause, plus la suivante est longue.
- **Chronomètre libre** (sans durée imposée) pour mesurer ce que prend vraiment une tâche.

## 6. Son et ambiance : à définir

- **Bruits par fichier** plutôt que fabriqués : règle durablement le craquement au casque
  Bluetooth (chantier n°1 du 07/11) ; besoin de fichiers libres de droits.
- **Mélange d'ambiances** : pluie + café + musique, trois curseurs.
- **« Mes musiques »** depuis le Drive (idée en réserve de la 1.0, MP3 de l'utilisateur).
- **Fin de focus en douceur** : le volume baisse petit à petit avant la question.
- Musique calme de pause et sons de respiration : en attente de l'utilisateur (`SUNO.md`).

## 7. Confort sur Android : à définir

- **Raccourci / widget** « Focus 25 min » sur l'écran d'accueil (raccourcis de la PWA dans le
  `manifest.webmanifest`, faisable sans APK).
- **Notification qui reste** avec le temps restant et Pause / Stop (écran éteint) ; la question
  de fin de focus en notification avec un bouton.
- **Ne pas déranger** automatique pendant le focus : seulement possible avec un APK.
- **Montre connectée** : vibration de fin de focus (via la notification).

## 8. Idées plus originales : à définir

- **Focus à deux** (« body doubling ») : un lien à partager, chacun voit que l'autre travaille,
  sans messagerie. Demande un petit serveur ou un service tiers.
- **Coach par IA** : une phrase écrite d'après le journal (« 3 jours de suite, bravo »), à la
  place de messages fixes. Demande une clé d'API et un relais : à peser (coût, secret).
- **Fond lié au réel** : météo de la ville, lever et coucher du soleil.
- **Thème de la journée** : l'agenda (point 1) colore l'écran selon la charge de la journée.

---

## Ordre de travail proposé

1. Point 1 (agenda), étape lecture seule.
2. Point 2 (« juste 5 minutes », rappel à heure fixe) et point 3 (journal, carte de chaleur).
3. Point 4 (petit héros) pour le plaisir.
4. Le reste selon l'envie.

À chaque étape : définir avec l'utilisateur, tester sur 127.0.0.1:8418, téléphone à la fin,
noter ici ce qui est fait.
