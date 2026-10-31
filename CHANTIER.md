# projetfocus — point de chantier (30/10/2026)

Toutes les règles de fonctionnement et les décisions sont dans **REGLES.md** (à lire en
premier pour reprendre le travail).

## Fait (publié sur https://darkcapp68-web.github.io/projetfocus/)

**L'appli (site / PWA)**
- Un seul écran : fond qui suit l'heure en dégradé continu (OKLab), cadran à tourner,
  temps au centre, contrôles qui apparaissent au toucher. Démo « journée en accéléré ».
- Focus / pause / cycles / pause longue, préréglages 25/5 et 50/10.
- 4 styles de cadran (Apparence) : Normal (fondu lent), Rêveur (engrenages, atome, vague),
  Rythme (réagit à la musique), Brisure (30/10 : un éclair ou une fissure se ramifie et
  pousse en continu depuis le centre, rebondit sur les bords, vitesse réglable, s'efface en
  pause ; version 1 retenue après des essais saccadés ; fluidité sur téléphone à confirmer ;
  tracé noir par défaut pour trancher sur le texte blanc, « Claire » en réglage ; épaisseur
  des traits réglable, de Fine à Très épaisse).
- Pause : couleur au hasard, respiration guidée (cohérence cardiaque 5/5 par défaut ;
  apaisante, carrée, 4-7-8) avec une teinte par étape, une action du coach, maintenir pour reprendre,
  bouton Arrêter, compte à rebours en tic-tac dans les 10 dernières secondes, 3 dings,
  reprise automatique du focus après 5 s. Le mot « inspire » grandit pendant l'inspiration
  et rétrécit à l'expiration (30/10).
- Messages bienveillants (40), coach, notifications, plein écran (désactivé par défaut).
- Son : lecteur avec menu groupé, playlists CC0 embarquées (lofi, ambient) gardées hors
  ligne, radios testées (Technolovers Minimal, France Musique Opéra / Classique Plus /
  Baroque / Easy Classique, Radio Swiss Classic cochées ; les autres décochées), musique de
  pause au choix (musique douce générée par défaut), bruits générés (pluie, orage, vent,
  neige, café) avec bouton lecture / pause.
- Arrêter coupe tout ; Démarrer relance tout ; recharger la page repart de zéro.
- Paramètres en 6 sections repliables, l'essentiel visible et le reste dans « Réglages
  avancés », export / import JSON.
- Sauvegarde Google Drive des paramètres, à la main (« Sauvegarder » / « Reprendre »).
- Avis de mise à jour (30/10) : point bleu sur « Paramètres » quand une version plus récente
  est en ligne ; « Mettre à jour l'appli » retélécharge chaque fichier (le bouton d'avant
  17h09 reprenait parfois l'ancien `app.js`, reproduit et corrigé).
- Téléphone (30/10) : la page ne déborde plus et ne glisse plus à gauche à l'ouverture des
  Paramètres ; tous les contrôles s'effacent ensemble (« Paramètres » et boutons de pause
  compris) ; menus du lecteur en dragée pleine.

**En service** : sur le PC et sur le téléphone (installé depuis Chrome), réglages partagés
par Google Drive.

**Appli Android** : **APK mis de côté** (décision de l'utilisateur, 30/10), à reprendre peut-être plus tard. Chrome a installé
le site sur le téléphone comme une appli (icône sur l'écran d'accueil), ce qui suffit. Le
projet Android Studio `android/` reste dans le dépôt pour plus tard (il resterait : clé de
signature hors dépôt, dépôt `darkcapp68-web.github.io` avec `assetlinks.json`, voir
`android/README.md`).

## En cours

- Rien.

## Ce dont j'ai besoin de toi

1. **Publication** : fait. Site en ligne sur https://darkcapp68-web.github.io/projetfocus/
   (dépôt `darkcapp68-web/projetfocus`, GitHub Pages sur `main` / root).
2. **Sauvegarde Google Drive** : à la main (« Sauvegarder » / « Reprendre mes paramètres »),
   la synchronisation automatique a été abandonnée (conflits PC / téléphone). À essayer :
   sauvegarder depuis le PC, reprendre sur le téléphone.
3. **Tes retours d'écoute**, que je ne peux pas juger moi-même :
   - **couleurs de la cohérence cardiaque : à revoir** (30/10, l'utilisateur les trouve à
     retravailler ; aujourd'hui bleu ciel à l'inspiration, noir à l'expiration) : lui demander
     ce qui ne va pas avant de changer quoi que ce soit ;
   - mot qui grandit à l'inspiration, Brisure (fluidité, vitesse, tracé noir) : à juger sur le téléphone ;
   - tic-tac du compte à rebours, sons de pluie / orage / vent / neige / café, musique
     douce de pause : trop fort ? pas assez naturel ?
   - radios classiques : lesquelles garder ;
   - couleurs : ajouter un moment « Nuit profonde » indigo vers 2 h (sinon le fond tire sur
     le brun-rouge vers 3 h du matin) ?
4. **Optionnel** : abonnement DI.FM Premium un jour → je peux ajouter la saisie de la clé
   d'écoute pour avoir toutes leurs chaînes électro sans pub.

## À faire

- **Paramètres allégés** (30/10) : 6 sections au lieu de 8 (Couleurs + Affichage →
  Apparence, Volumes et sons + Musiques → Musiques et sons), 30 réglages visibles au lieu
  de 65, le reste dans « Réglages avancés », réglages sans objet masqués. Rien supprimé,
  et on garde ainsi (décision de l'utilisateur, 30/10 : pas de retrait définitif).

## Idées en réserve


- **Cadres du mode Rêveur** : le cadre en engrenages est intégré (29/10). D'autres images
  de cadre (méditation, anneau) ont été essayées dans `perso/cadres.html` (dossier `perso/`
  exclu de GitHub) ; celle « méditation » montre un personnage protégé (Shaka, Saint Seiya)
  et ne doit pas être publiée. Piste : laisser choisir le cadre dans les Paramètres.

## Limites connues

- Chrome bloque le son sans geste : après un rechargement, rien ne joue avant Démarrer
  (voulu).
- Onglet caché sans son : les notifications peuvent arriver jusqu'à une minute en retard.
- iPhone : pas de réglage de volume de la radio par la page (sans objet, tout est Android).
