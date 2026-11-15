# projetfocus 2.0 : chantier « tout azimut »

**Ce fichier est un listing d'idées** (ouvert le 15/11/2026, l'utilisateur n'est pas satisfait
de la 2.0 recentrée) : savoir **ce qu'on pourrait faire** et **à quel point c'est facile**.
Rien n'est décidé ; chaque idée se définit avec l'utilisateur avant d'écrire du code. Le cœur
(`CAHIER_DES_CHARGES.md`, `CHANTIER.md`) reste la base.

## Légende de la facilité

- **Facile** : tout dans la page, sans autorisation ni serveur ; une séance de travail.
- **Moyen** : demande une autorisation (Google…), du stockage, ou un peu de conception ; ou
  porter du code de la 1.0.
- **Difficile** : serveur, appli Android (APK), ou dépend de ce qu'Android laisse faire à une
  page quand l'écran est éteint.

Statuts : `à définir` · `choisi` · `en cours` · `fait` · `écarté`.

Contraintes : PWA sans serveur ni build, dépôt public (aucun secret dedans), tout Android,
réglages `projetfocus2.*`, tout doit marcher écran éteint, pas de son fabriqué en continu par
la page.

---

## Vue d'ensemble (tout d'un coup d'œil)

| # | Idée | Facilité | Statut |
| --- | --- | --- | --- |
| 1.1 | Agenda : afficher le prochain rendez-vous | Moyen | à définir |
| 1.2 | Agenda : régler le focus sur le créneau libre | Moyen | à définir |
| 1.3 | Agenda : prévenir avant qu'une séance déborde | Moyen (page ouverte) / Difficile (écran éteint) | à définir |
| 1.4 | Agenda : écrire les séances dans un agenda dédié | Moyen | à définir |
| 1.5 | Agenda : lien « ajouter à l'agenda » (une séance à la fois) | Facile | à définir |
| 1.6 | Agenda : réserver des blocs de focus à l'avance | Difficile | à définir |
| 1.7 | Agenda : choisir plusieurs agendas | Moyen | à définir |
| 1.8 | Agenda : mode réunion (musique coupée) | Moyen | à définir |
| 2.1 | **Rappel d'heure fixe (9h, 14h) avec bouton « Démarrer »** | **Facile via l'agenda / Difficile seul** | à définir |
| 2.2 | « Juste 5 minutes » | Facile | à définir |
| 2.3 | Rituel d'une ligne avant de lancer | Facile | à définir |
| 2.4 | Parking à distractions | Facile | à définir |
| 3.1 | Journal des séances (jours, total, série) | Facile | à définir |
| 3.2 | Carte de chaleur de l'année | Moyen | à définir |
| 3.3 | Phrase de fin de séance | Facile | à définir |
| 3.4 | Résumé de la semaine | Facile | à définir |
| 4.1 | Petit héros qui avance avec le focus | Moyen | à définir |
| 4.2 | Un monde qui pousse (arbre par séance) | Moyen | à définir |
| 4.3 | Créature à élever | Moyen | à définir |
| 4.4 | Boss de la semaine | Moyen | à définir |
| 5.1 | Tâche / ticket liée à la séance | Facile | à définir |
| 5.2 | Canard en plastique en fin de focus | Facile | à définir |
| 5.3 | Rappels de santé dans les pauses | Facile | à définir |
| 5.4 | Pause adaptative | Facile | à définir |
| 5.5 | Chronomètre libre (sans durée) | Facile | à définir |
| 6.1 | Bruits de fond par fichier (fin du craquement Bluetooth) | Facile (si les fichiers sont fournis) | à définir |
| 6.2 | Mélange d'ambiances (pluie + café + musique) | Facile | à définir |
| 6.3 | Fin de focus en douceur (volume qui baisse) | Facile | à définir |
| 6.4 | « Mes musiques » depuis le Drive | Difficile | à définir |
| 7.1 | Raccourci « Focus 25 min » sur l'écran d'accueil | Facile | à définir |
| 7.2 | Notification qui reste, avec Pause / Stop | Difficile | à définir |
| 7.3 | Ne pas déranger automatique | Difficile (APK) | à définir |
| 7.4 | Vibration sur la montre | Difficile | à définir |
| 8.1 | Focus à deux | Difficile | à définir |
| 8.2 | Coach par IA | Difficile | à définir |
| 8.3 | Fond lié à la météo / au soleil | Moyen | à définir |
| 8.4 | Fond coloré selon la charge de l'agenda | Moyen | à définir |

---

## 1. Lien avec mes agendas Google (premier point voulu par l'utilisateur)

**But** : que le focus tienne compte de la vraie journée (réunions, rendez-vous), au lieu de
vivre à côté d'elle.

### Ce qu'on pourrait faire
1. **Lire l'agenda, rien d'autre** : « prochain rendez-vous dans 38 min » discret sur l'écran
   de réglage. *Moyen* (connexion Google).
2. **Adapter le focus au créneau libre** : « 52 min avant ta réunion de 14h », un bouton règle
   le focus à ce temps. *Moyen* (facile une fois le 1 fait).
3. **Ne jamais empiéter** : notification quand une séance déborderait sur un rendez-vous.
   *Moyen* page ouverte ; *Difficile* écran éteint.
4. **Écrire les séances dans l'agenda** : chaque focus terminé devient « Focus : … » dans un
   **agenda dédié** « projetfocus » (les autres agendas restent propres). *Moyen* (portée
   d'écriture).
5. **Lien « ajouter à l'agenda »** (`calendar.google.com/calendar/render?action=TEMPLATE…`) : zéro
   autorisation, une séance à la fois, validée à la main. *Facile*.
6. **Réserver des blocs à l'avance** (« 2 focus de 50 min demain matin » : l'appli cherche les
   trous et crée les évènements). *Difficile*.
7. **Plusieurs agendas** (perso, travail, famille) : choisir lesquels comptent comme « occupé ».
   *Moyen*.
8. **Mode réunion** : pendant un évènement, la musique se coupe et l'appli ne propose rien.
   *Moyen*.

### Façons techniques de s'y prendre
| Piste | Avantages | Limites |
| --- | --- | --- |
| **API Google Agenda** par connexion Google (comme la sauvegarde Drive, à la main) | lecture et écriture, plusieurs agendas, à jour | portée `calendar.readonly` ou `calendar.events`, « sensibles » : en mode **test** du projet Google Cloud ça marche pour l'utilisateur sans validation Google ; jeton d'environ 1 h, reconnexion de temps en temps ; pas de lecture en arrière-plan écran éteint |
| **Adresse secrète iCal (.ics)** de chaque agenda | pas de connexion Google | lecture seule ; l'adresse est un secret (sur l'appareil, **jamais dans le dépôt**) ; Google bloque peut-être la lecture depuis un autre site (CORS), à tester ; mise à jour lente |
| **Lien « ajouter à l'agenda »** | aucune autorisation | un évènement à la fois |
| **APK / appli native** (projet `android/` en réserve) | lit le calendrier du téléphone, marche écran éteint, alarmes exactes | rouvre le chantier APK mis de côté le 30/10 |

### À décider avec l'utilisateur
- Lire seulement, ou aussi écrire dans l'agenda ?
- Quels agendas ? L'agenda du travail peut-il passer par ce projet (règles de l'employeur) ?
- Se reconnecter à Google de temps en temps, c'est acceptable ? Sinon : iCal ou APK.
- Gain n°1 voulu : ne pas rater une réunion, profiter des trous, ou garder une trace de ses
  séances dans l'agenda ?

### Proposition de départ (à valider)
Commencer par **1.1 + 1.2** (lecture seule, connexion à la main, sur le modèle de `sync.js`),
puis **1.4** si l'envie est là.

---

## 2. Se lancer plus facilement (pour qui se dit « pas discipliné »)

### 2.1 Rappel d'heure fixe : « On s'y met ? » à 9h et à 14h, avec un bouton qui lance le focus
*(ajouté le 15/11, demande de l'utilisateur)*

Le piège : une page web ne peut pas se réveiller toute seule à 9h quand elle est fermée ou
que l'écran est éteint (Android l'endort). Les façons de faire, de la plus facile à la plus
dure :

| Façon | Facilité | Ce que ça donne |
| --- | --- | --- |
| **Évènement répété dans Google Agenda** (tous les jours 9h et 14h, avec rappel) dont la description contient le lien de l'appli, par exemple `…/projetfocus/v2/?demarrer=1` | **Facile** | la notification vient de l'agenda (fiable, écran éteint, aucune dépendance à la page) ; un toucher ouvre l'appli et le focus démarre tout de suite. Ce n'est pas un bouton *dans* la notification, mais un toucher suffit. **Côté appli** : seulement lire `?demarrer=1` et lancer le focus (+ proposer, dans Paramètres, un bouton qui crée les deux évènements via le lien « ajouter à l'agenda », point 1.5). Se rattache au point 1 |
| **Notification locale programmée par la page** | Difficile | pas fiable : la fonction de notifications programmées (« Notification Triggers ») n'a pas été retenue par Chrome (à revérifier avant de s'y fier) ; sinon la page doit être ouverte |
| **Notification push** (Web Push) | Difficile | marche écran éteint et accepte un bouton d'action, mais il faut un envoi planifié côté serveur (ou une tâche GitHub Actions avec clé secrète, retard possible de plusieurs minutes) |
| **APK** (alarme exacte Android, `AlarmManager`) | Difficile | la vraie solution, avec bouton « Démarrer » dans la notification ; rouvre le chantier APK |

**Proposition** : passer par l'agenda (ligne 1). Heures réglables, jours de la semaine
seulement si l'utilisateur le veut (évènement « du lundi au vendredi »). Si plus tard
l'APK est repris, le bouton dans la notification s'ajoute.

### Autres idées de ce point
- **2.2 « Juste 5 minutes »** : un bouton de démarrage minimal ; on continue ou non ensuite.
  *Facile*.
- **2.3 Rituel d'une ligne** avant de lancer : « Qu'est-ce que je fais pendant cette séance ? »
  (la phrase reste affichée discrètement). *Facile*.
- **2.4 Parking à distractions** : noter en un toucher une idée qui traverse l'esprit pendant le
  focus ; relue à la pause. *Facile*.

## 3. Garder une trace

- **3.1 Journal** : séances par jour, temps total, série de jours d'affilée (une seule page).
  *Facile* (stockage sur l'appareil, sauvegarde Drive à la main comme les réglages).
- **3.2 Carte de chaleur** façon GitHub : un carré par jour sur l'année. *Moyen* (dessin).
- **3.3 Phrase de fin de séance** : « qu'ai-je fait ? », historique consultable. *Facile*.
- **3.4 Résumé de la semaine** : « 11 h de focus, meilleur jour : mardi ». *Facile* (après 3.1).
- Lien avec le point 1 : le journal peut aussi se lire dans l'agenda (1.4).

## 4. Le côté jeu (ce que la 1.0 avait de plus vivant)

- **4.1 Petit héros** qui avance pendant le focus et dort au camp en pause (code existant en 1.0,
  `drawHero()`), sans dépendre de la musique. *Moyen* (porter et alléger le code de la 1.0).
- **4.2 Un monde qui pousse** : un arbre par séance, une forêt, une ville en pixels. *Moyen*.
- **4.3 Créature à élever** (principe de Forest) : elle souffre si on abandonne. *Moyen*.
- **4.4 Boss de la semaine** : une grosse séance de 90 min pour le battre. *Moyen*.
- Niveaux, pièces et progression gardés sur l'appareil, pas sur le Drive.

## 5. Lié au métier de développeur (Progress / ABL)

- **5.1 Tâche liée** : un champ « ticket / dossier » par séance ; temps passé par tâche
  (estimer, facturer). *Facile*.
- **5.2 Canard en plastique** : en fin de focus, reformuler le problème en une phrase. *Facile*.
- **5.3 Rappels de santé** dans les pauses : regarder au loin (20 s toutes les 20 min), nuque,
  poignets, eau. *Facile*.
- **5.4 Pause adaptative** : plus on enchaîne sans pause, plus la suivante est longue. *Facile*.
- **5.5 Chronomètre libre** (sans durée imposée) pour mesurer ce que prend vraiment une tâche.
  *Facile*.

## 6. Son et ambiance

- **6.1 Bruits par fichier** plutôt que fabriqués : règle durablement le craquement au casque
  Bluetooth (chantier n°1 du 07/11). *Facile* une fois les fichiers libres de droits trouvés.
- **6.2 Mélange d'ambiances** : pluie + café + musique, trois curseurs. *Facile*.
- **6.3 Fin de focus en douceur** : le volume baisse petit à petit avant la question. *Facile*.
- **6.4 « Mes musiques »** depuis le Drive (idée en réserve de la 1.0, MP3 de l'utilisateur).
  *Difficile*.
- Musique calme de pause et sons de respiration : en attente de l'utilisateur (`SUNO.md`).

## 7. Confort sur Android

- **7.1 Raccourci** « Focus 25 min » sur l'écran d'accueil (raccourcis du `manifest.webmanifest`,
  sans APK). *Facile*. Même mécanique que le lien `?demarrer=1` du point 2.1.
- **7.2 Notification qui reste** avec le temps restant et Pause / Stop (écran éteint) ; la
  question de fin de focus en notification avec un bouton. *Difficile* (limité pour une page).
- **7.3 Ne pas déranger** automatique pendant le focus. *Difficile* : seulement avec un APK.
- **7.4 Montre connectée** : vibration de fin de focus (via la notification). *Difficile*.

## 8. Idées plus originales

- **8.1 Focus à deux** (« body doubling ») : un lien à partager, chacun voit que l'autre
  travaille, sans messagerie. *Difficile* (petit serveur ou service tiers).
- **8.2 Coach par IA** : une phrase écrite d'après le journal, à la place de messages fixes.
  *Difficile* (clé d'API et relais : coût, secret).
- **8.3 Fond lié au réel** : météo de la ville, lever et coucher du soleil. *Moyen*.
- **8.4 Fond coloré selon la charge de l'agenda** (point 1). *Moyen*.

---

## Ordre de travail proposé (à valider)

1. Les **faciles qui aident à se lancer** : 2.1 (rappel par l'agenda), 2.2 (« juste 5 minutes »),
   7.1 (raccourci) : ils partagent le même lien `?demarrer=1`.
2. Le **journal** (3.1, 3.3) puis la carte de chaleur (3.2).
3. Point 1 (agenda), étape lecture seule (1.1, 1.2).
4. Le **petit héros** (4.1) pour le plaisir.
5. Le reste selon l'envie.

À chaque étape : définir avec l'utilisateur, tester sur 127.0.0.1:8418, téléphone à la fin,
noter ici ce qui est fait.
