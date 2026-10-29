# projetfocus — appli Android (téléphone et tablette)

Ce dossier est un projet Android Studio, comme tes autres projets (Frigo, Bulles…).
L'appli est une **coquille** : elle ouvre le site publié sur GitHub Pages dans le moteur de
Chrome, en plein écran, avec son icône (« Trusted Web Activity », bibliothèque Google
`androidbrowserhelper`). **Toute la maintenance se fait sur le site** (dossier parent) :
une modification publiée arrive toute seule sur le téléphone et la tablette.

Versions : Gradle 9.6, plugin Android 9.4.1, SDK 36 (les mêmes que Frigo), Android 7 minimum.

## Ouvrir dans Android Studio

**File → Open** → choisis le dossier `C:\projetfocus\android` (pas `C:\projetfocus`).
Android Studio synchronise Gradle tout seul.

## Une seule chose à régler : l'adresse du site

Dans `app/build.gradle.kts`, en haut :

```kotlin
val siteHost = "TON-COMPTE.github.io"
val sitePath = "/projetfocus/"
```

Remplace `TON-COMPTE` par ton nom d'utilisateur GitHub une fois le site publié.

## Construire et installer

- **Pour essayer** : bouton ▶ (Run) avec le téléphone branché en USB (débogage USB activé),
  ou **Build → Build APK(s)** puis copie `app/build/outputs/apk/debug/app-debug.apk` sur le
  téléphone et ouvre-le (autorise l'installation depuis cette source).
- **Version définitive** : **Build → Generate Signed App Bundle / APK** → **APK** → crée une
  clé (« Create new… »). **Garde précieusement le fichier de clé et son mot de passe**, hors
  du dépôt : sans eux, impossible de mettre l'appli à jour sans la désinstaller. Le
  `.gitignore` empêche déjà les fichiers `.jks` / `.keystore` de partir sur GitHub.

L'APK n'a presque jamais besoin d'être refait : seulement si tu changes le nom, l'icône ou
l'adresse du site (pense alors à augmenter `versionCode` dans `app/build.gradle.kts`).

## Enlever la petite barre d'adresse (lien de confiance)

Sans vérification, l'appli marche mais Chrome affiche une fine barre avec l'adresse en haut.
Pour la faire disparaître, le site doit déclarer qu'il fait confiance à l'appli, avec un
fichier `assetlinks.json` placé **à la racine du domaine** :
`https://TON-COMPTE.github.io/.well-known/assetlinks.json`.

1. Récupère l'empreinte de ta clé : dans Android Studio, panneau **Gradle** →
   `app → Tasks → android → signingReport` (ou, pour la clé définitive :
   `keytool -list -v -keystore ta-cle.jks`). Copie la ligne **SHA-256**.
2. Sur GitHub, crée un dépôt nommé exactement **`TON-COMPTE.github.io`** (c'est le site
   « racine » de ton compte), avec un fichier `.well-known/assetlinks.json` :

   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "fr.projetfocus.app",
       "sha256_cert_fingerprints": ["AA:BB:…:FF"]
     }
   }]
   ```

   Mets l'empreinte de la clé de test **et** celle de la clé définitive si tu utilises les
   deux. Ajoute aussi un fichier vide `.nojekyll` à la racine de ce dépôt (sinon GitHub
   Pages ignore les dossiers qui commencent par un point), puis active GitHub Pages.
3. Désinstalle et réinstalle l'appli : la barre disparaît.

Un nom de domaine à toi (environ 10 €/an) ferait la même chose sans ce second dépôt.

## Ce que fait l'appli Android en plus du site

- Les notifications de fin de focus et de pause passent par l'appli (permission demandée
  au premier lancement sur Android 13 et plus).
- Si Chrome n'est pas installé, le site s'ouvre dans une vue web intégrée.
- Les réglages sont ceux de Chrome sur l'appareil ; pour les partager avec le PC, utilise la
  synchronisation Google Drive (voir le README du site).
