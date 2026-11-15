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
| 0 | **Principe : l'agenda guide la journée (focus libre ou « rdv »)** | Moyen | à valider |
| 1.10 | Agenda : le focus passe de « libre » à « rdv » (couleur + message), sans jamais s'arrêter | Moyen | choisi (voir point 0) |
| 1.11 | Agenda : mes blocs de focus décrits précisément dans l'agenda | Moyen | à définir |
| 1.1 | Agenda : afficher le prochain rendez-vous | Moyen | à définir |
| 1.2 | Agenda : régler le focus sur le créneau libre | Moyen | à définir |
| 1.3 | Agenda : prévenir avant qu'une séance déborde | Moyen (page ouverte) / Difficile (écran éteint) | à définir |
| 1.4 | Agenda : écrire les séances dans un agenda dédié | Moyen | à définir |
| 1.5 | Agenda : lien « ajouter à l'agenda » (une séance à la fois) | Facile | à définir |
| 1.6 | Agenda : réserver des blocs de focus à l'avance | Difficile | à définir |
| 1.7 | Agenda : choisir plusieurs agendas | Moyen | écarté pour l'instant (pro seulement) |
| 1.8 | Agenda : mode réunion (musique coupée selon le type de rdv : visio, appel…, reprise ensuite) | Moyen | choisi (voir point 0) |
| 1.9 | **Agenda pro (Google) : me mettre « Absent » en un geste** (refus auto des invitations) | Moyen | à définir |
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
| 6.4 | « Mes musiques » (fichiers choisis sur l'appareil / Drive) | Moyen (fichiers) / Difficile (Drive) | à définir |
| 7.1 | Raccourci « Focus 25 min » sur l'écran d'accueil | Facile | à définir |
| 7.2 | Notification qui reste, avec Pause / Stop | Difficile | à définir |
| 7.3 | Ne pas déranger automatique | Difficile (APK) | à définir |
| 7.4 | Vibration sur la montre | Difficile | à définir |
| 8.1 | Focus à deux | Difficile | à définir |
| 8.2 | Coach qui s'appuie sur l'agenda et le journal (phrases à modèles, puis vraie IA) | Moyen (modèles) / Difficile (IA) | à définir |
| 8.3 | Fond lié à la météo / au soleil | Moyen | à définir |
| 8.4 | Fond coloré selon la charge de l'agenda | Moyen | à définir |
| 9.1 | Installer la 2.0 sur le poste pro | Facile (sauf blocage de l'entreprise) | à définir |
| 9.2 | Mêmes réglages sur les deux postes (Drive à la main) | Facile (déjà là) | à définir |
| 9.3 | Petite fenêtre toujours visible au-dessus du travail | Moyen | à définir |
| 11.1 | **Tablette de bureau** : écran-panneau toujours allumé (focus + disponibilité) | Facile | à définir |
| 11.2 | Tablette : agenda pro du jour | Moyen (même connexion que le point 1) | à définir |
| 11.3 | Tablette : derniers mails pro | Difficile (Gmail, autorisation de l'entreprise) | à définir |
| 11.4 | Tablette : le focus lancé ailleurs s'y affiche aussi | Difficile (synchro entre appareils) | à définir |
| 10.1 | **Indicateur de disponibilité à 3 états** (dérangeable / urgence seulement / pas dérangeable) | **Facile** | à définir |
| 10.2 | État qui suit le focus et la pause tout seul | Facile (après 10.1) | à définir |
| 10.3 | État qui suit l'agenda (réunion, temps de concentration) | Moyen (après le point 1) | à définir |
| 10.4 | Statut Teams / Slack / Google Chat mis à jour par l'appli | Difficile | à définir |
| 10.5 | Voyant physique (lampe, busylight USB) | Difficile | à définir |
| 10.6 | Lien que les collègues ouvrent pour voir mon état | Difficile | à définir |

---

## 0. Principe directeur : l'agenda guide la journée *(décidé dans l'esprit le 15/11, à valider)*

L'utilisateur le dit : **l'agenda doit déterminer le chantier**, et c'est lui qui décrit ses
temps de façon précise dans son agenda ; l'appli suit.

- **Journée sans évènement : le focus est libre.** Comme aujourd'hui : il règle son temps,
  démarre, l'appli ne dit rien de plus.
- **Journée avec un rendez-vous : le focus passe de « libre » à « rdv », sans s'arrêter.** Le
  minuteur continue ; l'écran se met à montrer le rendez-vous (heure, compte à rebours, titre)
  et la séance se **cale sur lui** (elle finit avant, avec une marge). Le but : **« je
  n'oublie rien »**, sans casser la concentration.
- **Les temps viennent de l'agenda.** Au lieu de régler à la main 25 min ou 50 min, l'utilisateur
  écrit dans son agenda des blocs précis (ex. « Focus 14h–15h10 », « Pause 15h10–15h25 »,
  « Réunion 16h ») ; l'appli les lit et propose / lance le bon temps.
- **L'appli ne remplace pas l'agenda** : les notifications de rendez-vous restent celles de
  Google Agenda (fiables, écran éteint). L'appli apporte l'**affichage** et le **calage** de la
  séance, pas une deuxième alarme.

### Décisions de l'utilisateur (15/11)
- **Seulement l'agenda pro** compte (le perso est laissé de côté ; le point 1.7 « plusieurs
  agendas » n'est plus nécessaire pour l'instant).
- **Le passage au rdv se voit** : l'écran **change de couleur** et un **message** s'écrit
  (« Rdv : … jusqu'à 15h »).
- **Le focus ne s'arrête jamais tout seul**, même quand le rdv se termine : le minuteur tourne
  toujours, c'est l'utilisateur qui l'arrête. Le rdv est un **état de l'écran**, pas une
  coupure.
- **La musique suit le type de rdv** : elle se **coupe** pour un rdv en visio ou au téléphone
  (Meet, Teams, appel…) et **reprend à la fin du rdv si elle jouait** avant.

### États de l'écran
| État | Quand | Ce qu'on voit | Le minuteur |
| --- | --- | --- | --- |
| **Libre** | aucun évènement proche | écran actuel | tourne |
| **Rdv proche** | un évènement approche (par ex. dans moins de 60 min, réglable) | en plus : « rdv 14h dans 38 min » | tourne |
| **Rdv en cours** | l'évènement a commencé | **fond d'une autre couleur** + message ; musique coupée si le type l'exige ; indicateur « pas dérangeable » (10.2) | **tourne toujours** |
| **Après le rdv** | l'heure de fin est passée | retour à la couleur normale ; musique relancée si elle jouait | tourne toujours |

### Règles selon le type de rdv *(musique, sons, couleur)*
Le type se **devine à partir de l'évènement Google** (champs lus : lien de visio, lieu, titre,
description) :

| Type | Comment le reconnaître | Musique | Signaux sonores (dings, bruit) |
| --- | --- | --- | --- |
| **Visio Google Meet** | l'évènement a un lien Meet (`conferenceData`) | coupée | coupés |
| **Visio Teams / Zoom** | lien `teams.microsoft.com`, `zoom.us` dans le lieu ou la description | coupée | coupés |
| **Appel téléphonique** | mot « tél », « appel », « call » ou un numéro dans le titre / lieu | coupée | coupés |
| **Présentiel** (lieu physique, sans lien) | lieu rempli, pas de lien | au choix (par défaut : coupée) | au choix |
| **Autre / sans détail** | aucun indice | au choix (par défaut : gardée) | gardés |

- Chaque ligne se règle dans **Paramètres → Agenda** (garder / couper), avec un mot-clé
  personnalisable (ex. « [appel] » au début du titre pour forcer le type).
- **Reprise** : à l'heure de fin du rdv, la radio repart **si elle jouait juste avant** (souvenir
  de la 1.0 / `radioWanted`), rechargée en direct. Si l'utilisateur a coupé la musique
  lui-même pendant le rdv, elle ne repart pas.
- **Les 3 dings de respiration** (pause) et les **bruits de fond** suivent la même règle :
  rien ne doit sonner dans une visio.
- À décider : avant le début, l'appli prévient-elle (« rdv Teams dans 2 min, musique coupée
  alors ») ou coupe-t-elle d'un coup à l'heure ?

### Limite à connaître (à tester sur le téléphone)
Couper la musique à l'heure exacte du rdv demande que la page soit réveillée. **Écran allumé,
page ouverte : ça marche.** **Écran éteint :** Android peut retarder la page (jusqu'à une minute
ou plus) et la musique continuerait au début d'une visio. Pistes : couper la musique un peu
**avant** (marge réglable), ou compter sur la notification Google Agenda pour que
l'utilisateur agisse ; la solution fiable serait l'APK (7.2 / 2.1). Leçon de la 1.0 : « tout
doit marcher écran éteint » reste le test d'acceptation.

### Questions encore ouvertes
- **Comment reconnaître un bloc de focus** dans l'agenda ? Un mot au début du titre
  (« Focus … ») reste le plus simple ; sinon un agenda dédié ou le type « Temps de
  concentration » de Google.
- **Couleur du rdv** : une couleur fixe (ex. rouge sourd), ou celle de l'évènement dans
  Google Agenda ?
- **Données du travail** : titres de réunions affichés **seulement à l'écran**, jamais envoyés
  ailleurs (voir le coach 8.2).

### Ce que ça change dans le reste du chantier
- Le **point 1 (agenda)** passe **en premier** : 1.1 (lecture), 1.10 (libre → rdv), 1.11 (blocs
  décrits dans l'agenda).
- **10.2 / 10.3** (indicateur de disponibilité), **8.2** (coach), **2.1** (rappel d'heure fixe : les
  blocs de l'agenda *sont* les rappels) et **1.9** (« Absent ») s'appuient dessus.

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

9. **Agenda pro en « Absent », facilement** *(ajouté le 15/11, demande de l'utilisateur)* : un
   bouton (ou un état de l'indicateur 10.1, « pas dérangeable ») qui crée dans l'agenda pro un
   évènement « Absent » pour la durée du focus ou de la journée, pour que les collègues le
   voient et que les invitations soient refusées toutes seules. Selon l'outil de l'entreprise :
   - **Google Agenda** : l'API sait créer un évènement de type **« Absent du bureau »**
     (`eventType: outOfOffice`, avec refus automatique des invitations) ou **« Temps de
     concentration »** (`focusTime`, selon l'offre Google Workspace de l'entreprise) ; ces
     types ne s'écrivent que dans l'agenda **principal** du compte. Portée d'écriture
     `calendar.events`. *Moyen*. Un compte pro peut interdire l'accès aux applis tierces : à
     vérifier.
   - **Sans autorisation** : un lien qui ouvre la création d'évènement dans l'agenda pro, à
     finir à la main (le type « Absent » se choisit alors à la main). *Facile*, mais pas
     « en un geste ».
   - **Précisé le 15/11 : l'agenda pro est Google** (Outlook écarté). Reste à vérifier : l'offre
     Workspace de l'entreprise (« Absent du bureau » et « Temps de concentration » en dépendent)
     et si le compte pro accepte une appli tierce (administrateur Google Workspace).
   - À décider : refuser les invitations pendant un focus,
     ou seulement afficher « occupé » ? Annuler l'évènement quand on arrête le focus avant la
     fin (l'appli le raccourcit ou le supprime) ?

10. **Libre → rdv sans s'arrêter** *(15/11, voir le point 0)* : le focus en cours continue, mais
    se cale sur le prochain évènement et l'affiche. *Moyen* (après 1.1).
11. **Blocs de focus décrits dans l'agenda** *(15/11, voir le point 0)* : les évènements
    « Focus … » donnent le temps de focus et de pause à lancer ; l'utilisateur planifie
    précisément ses temps dans l'agenda, l'appli les suit. *Moyen* (après 1.1 ; lecture du
    titre et des heures seulement).

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
- **4.2 Un monde qui pousse** *(précisé le 15/11, idée retenue pour approfondir)* : chaque
  séance de focus terminée fait pousser quelque chose dans un monde en pixels qui reste d'une
  séance à l'autre. *Moyen*.
  - **Version « forêt »** : un arbre par séance terminée ; 100 séances = une forêt. Les arbres
    se placent un à un sur un petit paysage (collines, ciel du moment), de variétés différentes
    (sapin, chêne, bouleau comme dans la 1.0).
  - **Version « ville »** : une maison, un pont, une tour par séance ; un quartier après 100.
  - **Choix possible** : forêt, ville, ou les deux au fil des niveaux (la forêt pousse, puis un
    village s'installe au milieu).
  - **Ce qui compte comme une séance** : un focus **mené à son terme** (pas un « Arrêter »),
    pour que l'arbre se mérite. Un focus coupé court donne une **pousse** qui ne grandit pas.
    À décider : la taille de l'arbre suit-elle la durée (25 min = petit, 90 min = grand) ?
  - **Où ça se voit** : un petit écran « Mon monde » ouvert depuis l'écran de réglage (pas
    pendant le focus, pour garder l'écran sobre), ou une bande en bas qui s'agrandit. Le nouvel
    arbre apparaît à la fin du focus, avec un petit mouvement.
  - **Stockage** : la liste des séances (date, durée, sorte d'arbre, place) sur l'appareil ;
    sauvegarde Drive à la main comme les réglages, pour retrouver sa forêt sur le téléphone et
    le poste pro. Même base que le journal (3.1) : faire d'abord le journal, la forêt s'en
    déduit.
  - **Points d'attention** : les arbres s'accumulent (100, 500…) : prévoir de dessiner
    seulement la partie visible et de faire défiler le paysage ; garder un dessin léger sur le
    téléphone (canevas, pas d'animation continue, comme la leçon de la 1.0).
  - **Variantes pour entretenir l'envie** : saisons (neige l'hiver, feuilles d'automne selon la
    vraie date), animaux qui s'installent (oiseaux au bout de 20 arbres, biche au bout de 50,
    clin d'œil à la 1.0), un arbre qui meurt si l'on abandonne trop de séances (optionnel,
    risque de décourager : à n'ajouter que si l'utilisateur le veut).
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
- **6.4 Playlist « Mes musiques »** depuis le Drive *(précisé le 15/11, idée en réserve de la
  1.0 : les MP3 de l'utilisateur, achetés ou tirés de ses CD)*. *Moyen* par fichiers choisis sur
  l'appareil, *Difficile* par le Drive.
  - **Ce que ça donne** : une entrée « Mes musiques » dans le menu de la radio, jouée au hasard
    ou dans l'ordre, en boucle, **hors ligne** une fois récupérée, sans publicité ni dépendance
    à un flux en direct. Aussi utilisable comme « musique de la pause ».
  - **Trois façons d'y mettre ses MP3**, de la plus simple à la plus complète :
    1. **Choisir des fichiers sur l'appareil** (bouton « Ajouter mes MP3 », sélection multiple) :
       copiés dans le stockage de l'appli, aucun compte Google. *Moyen*. Marche aussi sur le
       poste pro si Google y est bloqué (9.2).
    2. **Choisir dans mon Drive** par le sélecteur Google (Google Picker) : l'appli ne voit que
       les fichiers choisis (portée `drive.file`, comme la sauvegarde des réglages). *Difficile* :
       demande une clé d'API (publique, à restreindre à l'adresse du site) en plus de l'ID client
       Google ; connexion à la main, jeton d'environ 1 h.
    3. **Dossier « projetfocus-musique » du Drive**, lu en entier : exigerait une portée de
       lecture plus large (`drive.readonly`, « restreinte » chez Google) : *à éviter* tant que
       les deux premières suffisent.
  - **Récupérer sur chaque appareil** : bouton « Récupérer mes musiques » à la main (téléphone,
    PC perso, poste pro), gardées hors ligne comme les playlists embarquées de la 1.0 (cache
    séparé, lecture par morceaux depuis le cache).
  - **Place** : environ 5 à 10 Mo par morceau, donc 50 morceaux ≈ 250 à 500 Mo. Demander au
    navigateur de garder le stockage (`navigator.storage.persist()`) et afficher l'espace pris,
    avec « Retirer de cet appareil ».
  - **Avantages** : le fichier vient de l'appli elle-même, donc l'**onde** du lecteur marche
    sans souci de droits d'accès (CORS), et la lecture écran éteint est celle du lecteur du
    téléphone (pas de craquement, leçon de la 1.0). Les touches de l'écran verrouillé (suivant,
    pause) sont possibles via la « Media Session ».
  - **Titres** : nom du fichier au départ ; lecture des balises ID3 (titre, artiste) en option.
  - **Jamais de MP3 dans le dépôt public** (droits d'auteur) ; seul l'utilisateur envoie les
    siens. Son Drive n'est lu que sur clic, jamais en arrière-plan.
  - **À décider** : où sont aujourd'hui ses MP3 (disque du PC, Drive, CD à numériser) ? Une
    seule playlist ou plusieurs (« focus », « pause ») ? Veut-il passer d'abord par le choix de
    fichiers (plus simple) avant le Drive ?
- Musique calme de pause et sons de respiration : en attente de l'utilisateur (`SUNO.md`).
- **Suno et les droits** (15/11, l'utilisateur envisage un compte payant) : l'appli ne lit pas Suno
  directement, elle lit les **fichiers MP3 téléchargés**. Un abonnement payant (Pro ou Premier,
  à vérifier sur la page de Suno, les conditions changent) donne en principe le droit d'usage
  commercial des titres créés pendant l'abonnement ; ceux du compte gratuit restent à usage
  personnel. Pour écouter chez soi, rien ne change ; la question ne se pose que pour **publier**
  un titre dans le dépôt public (à éviter, sauf `audio/pause/calme.mp3`).

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
- **8.2 Coach qui s'adapte à l'agenda** *(précisé le 15/11, demande de l'utilisateur : « à
  adapter par rapport à l'agenda, ce serait mieux »)* : une phrase courte, écrite d'après
  **l'agenda (point 1) et le journal (3.1)**, à la place des 40 messages fixes de la 1.0 (laissés
  de côté dans la 2.0). *Moyen* avec des phrases à modèles, *Difficile* avec une vraie IA.
  - **Exemples tirés de l'agenda** : « Réunion à 14h, tu as 45 min : un focus de 40 ? » · « Grosse
    journée (5 h de réunions) : vise une seule séance, et protège-la. » · « Journée libre :
    c'est le moment du travail de fond. » · « Réunion dans 10 min : termine ce que tu fais, pas
    de nouvelle tâche. » · « Après la réunion, une vraie pause avant de reprendre. »
  - **Exemples tirés du journal** : « 3 jours de suite, bravo. » · « Plus calme que d'habitude
    cette semaine : une petite séance pour relancer ? » · « C'est ta 100ᵉ séance. »
  - **Quand elle parle** : à l'ouverture (écran de réglage), à la question de fin de focus et
    pendant la pause ; **jamais pendant le focus** (l'écran reste sobre).
  - **Deux niveaux** :
    1. **Phrases à modèles**, fabriquées par l'appli avec des règles (créneau libre, nombre de
       réunions, série de jours…). Aucun coût, aucun secret, marche hors ligne, **rien ne quitte
       l'appareil**. *Moyen*. Suffit sans doute pour la plupart des cas.
    2. **Vraie IA** (modèle de langage) pour des phrases plus variées et plus justes. *Difficile* :
       il faut une clé d'API, qui ne peut **jamais** être dans le dépôt public ; solution
       possible : l'utilisateur colle sa propre clé dans les Paramètres (gardée sur l'appareil,
       appels depuis la page), avec un coût par phrase très faible. Sinon un petit relais en
       ligne (serveur à maintenir).
  - **Vie privée (important pour l'agenda pro)** : envoyer à un service d'IA ce qu'il y a dans
    l'agenda du travail est sensible. Règle proposée : ne jamais envoyer les **titres, lieux ni
    participants**, seulement des chiffres (« réunion dans 40 min, 3 h de réunions
    aujourd'hui »). Avec les modèles de phrases, la question ne se pose pas. À vérifier aussi : le
    règlement de l'entreprise sur les outils d'IA.
  - **Dépend de** : le point 1 (lecture de l'agenda, 1.1) et le journal (3.1). Sans eux, le coach
    n'a rien à dire de plus qu'avant.
  - **À décider** : modèles d'abord, IA ensuite (recommandé) ? Quel ton (bienveillant comme
    dans la 1.0, plus direct) ? Peut-il proposer une action (« lance un focus de 40 min »)
    avec un bouton, ou seulement parler ?
- **8.3 Fond lié au réel** : météo de la ville, lever et coucher du soleil. *Moyen*.
- **8.4 Fond coloré selon la charge de l'agenda** (point 1). *Moyen*.

## 9. Sur le poste pro (demande de l'utilisateur, 15/11)

But : utiliser la 2.0 aussi au travail, pas seulement sur le téléphone et le PC perso.

- **9.1 Installer la 2.0 sur le poste pro** : ouvrir `…/projetfocus/v2/` dans Chrome ou Edge
  puis « Installer » (fenêtre à part, icône dans le menu Démarrer, comme la 1.0 sur le PC perso).
  *Facile*, sauf si l'entreprise bloque l'installation d'applis web, l'accès à GitHub Pages,
  ou les flux radio (le son en direct passe par Internet). **À vérifier sur place** avant de
  prévoir quoi que ce soit.
- **9.2 Mêmes réglages sur les deux postes** : sauvegarde Google Drive à la main (déjà dans la
  2.0). *Facile*, mais un compte Google **perso** sur un poste pro peut être refusé par la
  politique de l'entreprise : sinon, export / import JSON par fichier.
- **9.3 Petite fenêtre toujours au-dessus** du travail (minuteur et état en coin d'écran) :
  possible avec la fenêtre « image dans l'image » des navigateurs récents (Document
  Picture-in-Picture), pas avec une simple page. *Moyen*.
- Question : le poste pro peut-il recevoir des notifications du navigateur (pour le rappel 2.1
  et la fin de focus) ?

## 10. Disponibilité : « suis-je dérangeable ? » (demande de l'utilisateur, 15/11)

**But** : un indicateur à trois états, visible d'un coup d'œil, pour dire aux autres (et à
soi-même) quand on peut être interrompu :
- **Dérangeable** (vert),
- **Dérangeable pour une urgence** (orange),
- **Pas dérangeable** (rouge).

Un focus protégé est aussi une réponse à « je ne suis pas discipliné » : l'appli défend le
temps de concentration.

- **10.1 Indicateur à l'écran** : trois états choisis d'un toucher, une couleur franche et un
  mot, lisibles de loin (écran ou petite fenêtre, voir 9.3). État gardé sur l'appareil.
  *Facile*. À décider : tient-il dans l'écran principal, ou est-ce un écran à part ?
- **10.2 L'état suit la séance** : focus → « pas dérangeable » (ou « urgence seulement »,
  au choix), pause → « dérangeable », fin de séance → retour à l'état d'avant. Réglable pour
  chacun. *Facile* (après 10.1).
- **10.3 L'état suit l'agenda** : réunion en cours → « pas dérangeable » ; évènement
  « Temps de concentration » → « urgence seulement ». *Moyen* (dépend du point 1).
- **10.3 bis** : « pas dérangeable » peut aussi mettre l'agenda pro en « Absent » (point 1.9).
- **10.4 Statut de la messagerie** (Teams, Slack, Google Chat) changé par l'appli : les
  collègues le voient sans rien regarder d'autre. *Difficile* : connexion à l'API de la
  messagerie, autorisation de l'entreprise souvent nécessaire, secrets à garder hors du dépôt
  public. Piste plus simple : un raccourci qui ouvre la messagerie pour le changer à la main.
- **10.5 Voyant physique** (lampe connectée, « busylight » USB posé sur le bureau) : *Difficile*
  (matériel à acheter, pilote ou service web), mais visible par tous sans écran.
- **10.6 Lien à partager** que les collègues ouvrent pour voir mon état en direct.
  *Difficile* (il faut un serveur ou un service qui garde l'état hors de mon appareil).

À décider avec l'utilisateur :
- Qui doit voir l'état : seulement lui, les collègues dans la même pièce (écran visible), ou
  les collègues à distance (messagerie) ?
- Les états se choisissent à la main, ou suivent seuls le focus et l'agenda ?
- Qu'est-ce qu'une « urgence » au travail (appel, message d'une personne précise) ?

---

## 11. La tablette de bureau *(idée de l'utilisateur, 15/11 : une vieille Samsung récupérée)*

**Idée** : une vieille tablette Android posée sur le bureau devient un **tableau de bord du
poste** : le focus et la disponibilité en grand (point 10), l'agenda pro du jour, les derniers
mails pro. C'est le « bon outil pour montrer mon focus » aux collègues à côté, et aussi pour
soi-même.

- **11.1 Écran-panneau** (*Facile*) : l'appli installée depuis Chrome, en plein écran, écran
  toujours allumé (Wake Lock), tablette sur le chargeur. Couleur franche et mot lisible de
  loin (« Focus jusqu'à 15h10 », « Dérangeable », « Urgence seulement »). Mode « bureau » avec
  grosse horloge quand rien ne tourne.
- **11.2 Agenda pro du jour** (*Moyen*) : la liste de la journée (intitulés, jours, heures :
  c'est tout ce qu'il faut, précisé le 15/11) avec le rdv en cours et les suivants. Portée
  `calendar.readonly` (même connexion Google que le point 1) ; le type (visio, appel) se devine
  du lien et du lieu.
- **11.3 Derniers mails pro : seulement les expéditeurs et les objets** (*Moyen à Difficile*,
  précisé le 15/11 : pas besoin du contenu). Lecture des **en-têtes** par l'API Gmail (portée
  `gmail.metadata` : expéditeur, objet, date, jamais le texte des mails ; Google la classe
  « restreinte », mais pour un usage personnel en mode test ça marche). **Le vrai risque** : la
  connexion d'un compte **pro** à une appli extérieure peut être refusée par l'administrateur
  Google de l'entreprise. Le seul moyen sûr de le savoir : **essayer** une connexion avec le
  compte pro (test à faire avec l'utilisateur). Sans cette autorisation, retour à la solution
  sans code : le widget Gmail de la tablette.
  **Essai fait le 15/11 sur la tablette : ça marche.** Paramètres → Mails affiche les 10 derniers
  mails de la boîte de réception (expéditeur et objet, texte seulement, point pour les non lus),
  avec la portée `gmail.metadata` et le compte perso de l'utilisateur ; l'API Gmail est activée
  dans le projet Google Cloud « projetfocus ». Piège sur la tablette (Chrome 101) : si on passe
  par « Continuer en tant que… » (connexion à Chrome) pendant l'autorisation, l'onglet se
  recharge et Google répond « 400 » sur `gis_transform` ; il faut recommencer et choisir le
  compte directement. Reste à essayer avec le **compte pro** (l'administrateur peut refuser).
  **Décision du 15/11 : les objets des mails se voient sur l'écran principal, aussi pendant le
  focus** (l'utilisateur lit ses mails avec ses propres outils quand il veut ; la tablette n'est
  qu'un coup d'œil). Fait : liste de 10 lignes (expéditeur en gras, objet, point bleu si non lu)
  à droite de l'horloge, en paysage ; bouton ↻ pour actualiser (l'accord Google dure environ une
  heure, son renouvellement demande un geste, donc pas de mise à jour toute seule). Vu sur la
  tablette avec le compte perso. Pas encore : compte pro, agenda.
- **11.4 Le focus lancé ailleurs s'affiche sur la tablette** (*Difficile*) : si le focus tourne
  sur le téléphone ou le poste pro, la tablette doit le savoir. Pistes : **la tablette est
  elle-même l'appareil du focus** (on démarre depuis elle : le plus simple) ; ou l'appareil
  écrit la séance dans l'**agenda** (point 1.4) et la tablette la lit (l'agenda sert de
  messager, sans serveur à nous, mais avec un petit retard) ; ou un petit serveur (à éviter).

### Constats sur la tablette (15/11, mesurés par adb)
- Samsung SM-T550, Android 7.1.1, 1,4 Go de RAM, remise à zéro. **Chrome mis à jour de 64 à 101**
  (maximum du Play Store pour cet Android) : **la 2.0 démarre et marche** (radio, onde,
  décompte, « Arrêter » coupe la radio, installation proposée).
- Fluidité : 60 images/s au repos, 46 avec la radio et l'onde, environ 30 pendant un focus
  (mesure faussée par une fenêtre de notification) : un peu juste, onde à alléger pour un panneau.
- Pas de `100dvh` ni `:has()` dans Chrome 101 : prévoir des valeurs de secours dans le CSS.
- **Tablette forcée en paysage** par le réglage Android (rotation verrouillée, 1024×768),
  réversible dans Paramètres → Affichage ; pas dans le manifeste de l'appli, qui servirait
  aussi au téléphone. **La mise en page de la 2.0 n'est pas pensée pour le paysage** : le
  bouton Démarrer chevauche la ligne d'onde. À refaire pour le panneau.
- Écran de veille réglé à 10 min pour les tests ; l'écran toujours allumé du panneau viendra
  du Wake Lock (disponible dans Chrome 101).

### Points d'attention
- **Vie privée devant les collègues** (le plus important) : une tablette visible par les voisins
  ne doit pas montrer des **titres de mails ni de réunions** à tout le monde. Proposition :
  trois niveaux, au choix : *discret* (compteurs : « 3 mails », « rdv 14h »), *normal*
  (expéditeur ou titre court), *complet* (sur toucher, puis se referme seul).
- **L'âge de la tablette** : une très vieille version d'Android a un Chrome qui ne se met plus à
  jour, donc des fonctions manquantes (installation de l'appli, plein écran). À vérifier : version
  d'Android et de Chrome (Paramètres → À propos). Au pire, un navigateur récent installable.
- **Écran allumé en permanence** : sur une tablette LCD, pas de souci de marquage ; réduire la
  luminosité la nuit (le fond de la 2.0 devient noir pendant le focus, ce qui aide).
- **Brouillage de l'attention** : une tablette qui affiche des mails dans son champ de vision
  pendant le focus peut donner l'envie de les lire. À essayer : mails visibles **seulement
  hors focus** (en pause, ou en mode « dérangeable »).
- **Règles de l'entreprise** : un appareil perso branché au Wi-Fi du travail, affichant des
  données pro (mails, agenda), est à vérifier avec la politique de sécurité.

### À décider
- Ce que la tablette doit montrer **en premier** (le focus ? l'agenda ? les mails ?).
- La tablette sert **à lancer** le focus (tactile, à portée de main), ou seulement à
  **afficher** ?
- Version d'Android de la tablette.

---

## Ordre de travail proposé (à valider)

L'agenda détermine le chantier (point 0) : on commence par lui.

0. **Tablette de bureau, écran-panneau** (11.1 + 10.1) : l'outil qui montre le focus, simple,
   pour savoir si le principe plaît. Elle est déjà sur le bureau.
1. **Agenda, lecture seule** (1.1), puis **libre → rdv** (1.10) et **blocs de focus dans
   l'agenda** (1.11). Avant : vérifier avec l'utilisateur que le compte pro accepte la
   connexion (voir 1.9).
2. **Lancer plus facilement** : 2.1 (rappel d'heure fixe, qui devient les blocs de l'agenda),
   2.2 (« juste 5 minutes »), 7.1 (raccourci), qui partagent le lien `?demarrer=1`.
3. **Poste pro** (9.1), puis l'**indicateur de disponibilité** (10.1, 10.2, 10.3).
4. Le **journal** (3.1, 3.3), la carte de chaleur (3.2), puis le coach (8.2) qui s'appuie sur
   l'agenda et le journal.
5. Le **monde qui pousse** (4.2) et le petit héros (4.1) pour le plaisir.
6. Le reste selon l'envie.

À chaque étape : définir avec l'utilisateur, tester sur 127.0.0.1:8418, téléphone à la fin,
noter ici ce qui est fait.
