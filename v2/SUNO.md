# Musique et sons de la pause : quoi fabriquer, où les mettre

Chantier 2.0 du 07/11/2026. Deux choses à fournir à l'appli : **une musique calme** pour la
pause, et **trois sons** (inspire, retiens, expire) selon les rythmes de respiration. Tant
que rien n'est fourni, l'appli joue de simples notes de cloche et la radio continue.

---

## 1. Musique calme de la pause (Suno)

**Où la mettre** : `v2/audio/pause/calme.mp3`. L'appli la détecte toute seule ; elle se choisit
dans Paramètres → Pause → « Musique de la pause » → « Musique calme ». Elle joue en boucle
pendant la pause, à la place de la radio, qui revient à la reprise du focus.

**Réglages Suno** : mode « Custom », **Instrumental** coché.

**Style (à copier)** :

```
calm ambient, soft warm pads, slow evolving drones, gentle felt piano, very slow tempo 50 bpm,
no drums, no percussion, no vocals, spacious reverb, relaxing, meditative, smooth, warm low
frequencies, no sudden changes
```

**À exclure (champ « Exclude styles »)** :

```
drums, percussion, vocals, bright bells, sharp high pitches, harsh synth, sudden loud changes,
EDM, trap
```

**Paroles** : laisser vide (ou `[Instrumental]`).

**Conseils**
- Génère plusieurs versions et garde celle **sans surprise** (pas de montée, pas de note
  aiguë qui surgit) : on l'écoute les yeux fermés.
- 3 à 4 minutes suffisent, elle tourne en boucle. Une version qui **commence et finit
  doucement** se boucle mieux (si besoin : « Extend » pour rallonger).
- Exporte en **MP3** (environ 4 Mo pour 4 minutes à 128 kb/s).
- Vérifie les conditions de ton abonnement Suno pour l'usage que tu en fais ; on note la
  source dans `CREDITS.md` (« Musique générée avec Suno »).

---

## 2. Trois sons : inspire, retiens, expire

**Idée de départ** : un son par action, faciles à retenir, **aigu = inspire, moyen = retiens,
grave = expire** (à toi de les choisir autrement : ce sont tes fichiers).

Suno fabrique de la musique, pas des sons courts : il est plus simple de les faire avec
- un **générateur de bruitages** (texte → son),
- une **banque de sons libres** (de préférence en CC0),
- ou ta **voix** (un « haaa » doux), ou une note de bol chantant, de flûte, de koto…
- ou en **découpant** une note tenue d'un morceau Suno.

**Texte à donner à un générateur de bruitages (en anglais)**

| Action | Texte |
| --- | --- |
| inspire | `single soft rising tone, warm pad slowly swelling upward over 4 seconds, very gentle, no attack, calm` |
| retiens | `single soft sustained mid tone, round and warm, steady, gentle fade out after 2 seconds, calm` |
| expire | `single soft falling tone, warm low pad slowly sinking downward over 5 seconds, very gentle, no attack, calm` |

**Ce qu'il faut pour chaque fichier**
- MP3, OGG ou WAV, mono ou stéréo.
- **Début doux** (pas de claquement), pas de silence au début.
- Même volume pour les trois.
- Pas plus long que l'étape + 1,5 s (la suite est coupée) :

| Rythme | inspire | retiens | expire |
| --- | --- | --- | --- |
| Cohérence cardiaque (par défaut) | 5 s | — | 5 s |
| Apaisante | 4 s | — | 6 s |
| Carrée | 4 s | 4 s | 4 s (et 4 s de retenue) |
| 4-7-8 | 4 s | 7 s | 8 s |
| Simple pulsation | la moitié de la durée réglée | — | l'autre moitié |

**« Selon les modes »** : on peut fournir **un jeu pour tous les rythmes** (`default`) et/ou
**un jeu par rythme** (`coherence`, `apaisante`, `carree`, `478`, `simple`). Un son absent
est remplacé par la note de cloche.

**Où les mettre** : dans `v2/audio/respiration/`, avec un fichier `manifest.json` qui dit
lesquels existent (je l'écris pour toi quand tu me donnes les fichiers) :

```json
{
  "default":   { "inspire": "default/inspire.mp3", "retiens": "default/retiens.mp3", "expire": "default/expire.mp3" },
  "coherence": { "inspire": "coherence/inspire.mp3", "expire": "coherence/expire.mp3" }
}
```

**Pour me les donner** : dépose-les dans `C:\projetfocus\v2\audio\respiration\` (un dossier par
rythme, ou `default`) et dis-le-moi : j'écris le manifeste, je règle le volume et je vérifie
que la boucle tient. Je ne peux pas les écouter : c'est ton oreille qui juge.
