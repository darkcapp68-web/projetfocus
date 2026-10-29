// Valeurs par défaut, bibliothèque audio et textes de départ.
// Tout ce qui est ici peut être modifié depuis le panneau « Paramètres ».

// Bibliothèque embarquée (CC0, voir CREDITS.md) : une playlist par ambiance.
// Les morceaux se gardent sur l'appareil à l'écoute, ou d'un coup (Paramètres → Bibliothèque).
export const PLAYLISTS = {
  lofi: {
    name: 'Lofi',
    size: 56,
    tracks: [
      { file: 'music/holiznacc0-2-hour-delay.mp3', title: '2 Hour Delay' },
      { file: 'music/holiznacc0-winter-blues.mp3', title: 'Winter Blues' },
      { file: 'music/holiznacc0-first-snow.mp3', title: 'First Snow' },
      { file: 'music/holiznacc0-snow-drift.mp3', title: 'Snow Drift' },
      { file: 'music/holiznacc0-fire-place.mp3', title: 'Fire Place' },
      { file: 'music/holiznacc0-kids.mp3', title: 'Kids' },
      { file: 'music/holiznacc0-spring-at-last.mp3', title: 'Spring At Last' },
      { file: 'music/holiznacc0-sense-of-purpose.mp3', title: 'Sense Of Purpose' },
      { file: 'music/holiznacc0-april-showers.mp3', title: 'April Showers' },
    ],
  },
  ambient: {
    name: 'Ambient électro',
    size: 51,
    tracks: [
      { file: 'music/holiznacc0-deja-vu.mp3', title: 'Deja Vu' },
      { file: 'music/holiznacc0-boredom.mp3', title: 'Boredom' },
      { file: 'music/holiznacc0-anxiety.mp3', title: 'Anxiety' },
      { file: 'music/holiznacc0-love.mp3', title: 'Love' },
      { file: 'music/holiznacc0-old-age.mp3', title: 'Old Age' },
      { file: 'music/holiznacc0-dreams.mp3', title: 'Dreams' },
      { file: 'music/holiznacc0-agoraphobia.mp3', title: 'Agoraphobia' },
    ],
  },
};

// kind 'tracks' : une playlist embarquée ; 'stream' : radio lue dans l'appli ;
// 'link' : radio qui refuse d'être lue depuis un autre site, ouverte dans un onglet.
export const STATIONS = [
  { id: 'lofi', kind: 'tracks', group: 'Hors ligne', name: 'Lofi', desc: 'HoliznaCC0 · domaine public' },
  { id: 'ambient', kind: 'tracks', group: 'Hors ligne', name: 'Ambient électro', desc: 'HoliznaCC0 · domaine public' },
  { id: 'chillhop', kind: 'stream', group: 'Radios chill', name: 'I♥Chillhop', desc: 'ilovemusic.de · chillhop', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'lautlofi', kind: 'stream', group: 'Radios chill', name: 'Lofi (laut.fm)', desc: 'laut.fm · lofi', url: 'https://stream.laut.fm/lofi' },
  { id: 'chillsynth', kind: 'stream', group: 'Radios chill', name: 'Chillsynth', desc: 'Nightride FM · synthwave calme', url: 'https://stream.nightride.fm/chillsynth.mp3' },
  { id: 'rpmellow', kind: 'stream', group: 'Radios chill', name: 'Radio Paradise Mellow', desc: 'Radio Paradise · mélange doux', url: 'https://stream.radioparadise.com/mellow-128' },
  { id: 'lautminimal', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Minimal (laut.fm)', desc: 'laut.fm · minimal techno, microhouse', url: 'https://stream.laut.fm/minimal' },
  { id: 'sleepingpill', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Ambient Sleeping Pill', desc: 'stereoscenic.com · ambient sans rythme', url: 'https://radio.stereoscenic.com/asp-h' },
  { id: 'lautambient', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Ambient Radio (laut.fm)', desc: 'laut.fm · ambient, chillout', url: 'https://stream.laut.fm/ambient' },
  { id: 'groovesalad', kind: 'link', group: 'SomaFM (ouvre un onglet)', name: 'Groove Salad ↗', desc: 'SomaFM · électro chill', url: 'https://somafm.com/groovesalad/' },
  { id: 'deepspaceone', kind: 'link', group: 'SomaFM (ouvre un onglet)', name: 'Deep Space One ↗', desc: 'SomaFM · ambient', url: 'https://somafm.com/deepspaceone/' },
  { id: 'fluid', kind: 'link', group: 'SomaFM (ouvre un onglet)', name: 'Fluid ↗', desc: 'SomaFM · hip-hop instrumental', url: 'https://somafm.com/fluid/' },
];

export const NOISES = [
  { id: 'none', name: 'Aucun bruit' },
  { id: 'pluie', name: 'Pluie' },
  { id: 'orage', name: 'Orage lointain' },
  { id: 'vent', name: 'Vent' },
  { id: 'neige', name: 'Neige' },
  { id: 'cafe', name: 'Café' },
];

// Couleurs tirées au hasard pour la pause : vives, mais assez sombres pour le texte blanc.
export const BREAK_COLORS = [
  '#b3261e', // rouge
  '#c2410c', // orange brûlé
  '#be185d', // framboise
  '#9f1239', // grenat
  '#7e22ce', // violet
  '#4338ca', // indigo
  '#1d4ed8', // bleu vif
  '#0f766e', // sarcelle
  '#15803d', // vert
  '#a16207', // moutarde
];

export const CHIMES = [
  { id: 'cloche', name: 'Clochette' },
  { id: 'bol', name: 'Bol chantant' },
  { id: 'douce', name: 'Deux notes' },
  { id: 'aucun', name: 'Aucun son' },
];

export const MESSAGE_POOLS = [
  { id: 'debut', name: 'Début de focus' },
  { id: 'reprise', name: 'Reprise après une pause' },
  { id: 'fin', name: '5 dernières minutes' },
  { id: 'tard', name: 'Tard le soir' },
  { id: 'concentration', name: 'Concentration', cat: true },
  { id: 'antistress', name: 'Anti-stress', cat: true },
  { id: 'dev', name: 'Astuces de dev', cat: true },
  { id: 'perso', name: 'Mes messages', cat: true },
];

export const DEFAULTS = {
  version: 3,

  // Temps
  focusMin: 25,
  breakMin: 5,
  cycles: 4, // 0 = sans fin
  longBreakOn: true,
  longBreakEvery: 4,
  longBreakMin: 15,
  autoChain: true,
  autoChainDelay: 5, // secondes entre la fin de la pause et la reprise du focus
  endDings: 3, // nombre de « ding » à la fin de la pause

  // Couleurs
  dayGradient: true,
  fixedColor: '#26305e',
  dayColors: [
    { name: 'Nuit', hour: '22:30', color: '#1c1a4d' },
    { name: 'Aube', hour: '06:00', color: '#a8502c' },
    { name: 'Matinée', hour: '08:30', color: '#2b5ca6' },
    { name: 'Midi', hour: '12:00', color: '#2e7356' },
    { name: 'Après-midi', hour: '14:30', color: '#a2671c' },
    { name: 'Soirée', hour: '18:30', color: '#6a2b5d' },
  ],
  breakColorRandom: true,
  breakColor: '#b3261e', // utilisée si la couleur au hasard est coupée
  dialColor: '#ffffff',
  textColor: '#ffffff',

  // Pause
  pulseOn: true,
  pulseSeconds: 3,
  pulseIntensity: 30,
  fullscreenOnBreak: true,
  holdSeconds: 3,
  notifyOn: true,

  // Coach
  coachMode: 'one', // 'one' | 'none'
  coachActions: [
    'Lève-toi et marche un peu.',
    'Bois un grand verre d’eau.',
    'Regarde au loin pendant 20 secondes.',
    'Étire le dos et les épaules.',
    'Ouvre la fenêtre et respire l’air frais.',
    'Fais rouler tes épaules, cinq fois dans chaque sens.',
    'Ferme les yeux et respire lentement une minute.',
    'Détends tes mains : ouvre, ferme, secoue.',
    'Range une seule chose autour de toi.',
    'Va jusqu’à la fenêtre et regarde le ciel.',
  ],

  // Messages bienveillants
  messagesOn: true,
  messageEveryMin: 12,
  lateHour: 21,
  msgCats: { concentration: true, antistress: true, dev: true, perso: true },
  messages: {
    debut: [
      'Une seule tâche à la fois. Le reste attendra.',
      'Choisis la prochaine petite étape, et seulement celle-là.',
      'Ferme ce qui ne sert pas cette tâche. Tu y reviendras après.',
      'On commence doucement. La concentration vient en avançant.',
    ],
    reprise: [
      'Te revoilà. Relis tes dernières lignes, le fil va revenir.',
      'Pause faite, tête plus claire. On reprend tranquillement.',
      'Où en étais-tu ? Une phrase en commentaire suffit pour repartir.',
    ],
    fin: [
      'Encore 5 minutes : termine ta phrase, pas tout le chapitre.',
      'Bientôt la pause. Note où tu t’arrêtes, tu te remercieras tout à l’heure.',
      'Dernières minutes. Pas besoin de tout boucler, juste un point d’arrêt propre.',
    ],
    tard: [
      'Il est tard, garde de l’énergie pour demain.',
      'La soirée avance. Une dernière petite chose, puis on s’arrête ?',
      'Ce que tu ne finis pas aujourd’hui sera plus simple demain.',
    ],
    concentration: [
      'Tu n’as pas besoin de tout comprendre maintenant, juste la ligne suivante.',
      'Une idée qui passe ? Note-la et reviens ici.',
      'Les notifications peuvent attendre la pause.',
      'Avance par petits pas. Chaque pas compte.',
      'Perdu le fil ? Ce n’est pas grave. Reviens simplement à la tâche.',
      'Une chose finie vaut mieux que trois commencées.',
    ],
    antistress: [
      'Respire. Épaules basses, mâchoire détendue.',
      'Personne ne code parfaitement du premier coup. C’est normal.',
      'Tu fais de ton mieux avec ce que tu sais aujourd’hui. C’est suffisant.',
      'Lent, c’est aussi avancer.',
      'Inspire sur quatre temps, expire sur six. Puis reprends.',
      'Le délai n’écrit pas le code. Toi, si, calmement.',
      'Tout n’est pas urgent, même si tout en a l’air.',
      'Une gorgée d’eau. Ton cerveau aussi en a besoin.',
    ],
    dev: [
      'Un bug n’est pas un échec, c’est une information.',
      'Lis l’erreur en entier, la réponse y est souvent.',
      'Petit commit, grand soulagement.',
      'Bloqué ? Explique le problème à voix haute, comme à un canard.',
      'Le code parfait n’existe pas. Le code qui marche, si.',
      'Reproduis le bug avant de le corriger. Le reste suit.',
      'Un nom clair vaut mieux qu’un long commentaire.',
      'Teste d’abord avec un petit cas. Les gros viendront après.',
      'Si ça marchait hier, regarde ce qui a changé depuis.',
      'Un MESSAGE ou un log bien placé évite une heure de devinettes.',
      'Simplifie d’abord. Optimise ensuite, si besoin.',
      'Découpe le problème jusqu’à ce que le morceau paraisse facile.',
      'Ce n’est pas toi contre le code. Vous êtes du même côté.',
    ],
    perso: [],
  },

  // Son
  chime: 'cloche',
  chimeVol: 60,
  musicVolWork: 40,
  musicVolBreak: 25,
  breakMusic: 'calme', // en pause : 'calme' (musique douce), 'same' (même musique plus bas), 'silence'
  noiseVol: 30,
  duckNoise: true,
  defaultRadio: 'lofi',
  defaultNoise: 'none',
  autoStartAudio: true,
  customLinks: [], // une ligne par lien : « Nom | https://… »

  // Affichage
  timeFormat: 'mmss', // 'mmss' | 'min'
  showInfo: true,
  controlsDelay: 4,
  keepAwake: true,
};
