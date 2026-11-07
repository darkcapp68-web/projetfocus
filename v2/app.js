// projetfocus 2.0 : horloge, radio, onde, Paramètres (Musiques et sons, Sauvegarde).
import { STATIONS, SHOWN_STATIONS, CLIENT_ID } from './stations.js';
import { NOISES, createNoise } from './noise.js';
import { createSync } from './sync.js';
import { RHYTHMS, stepsFor, stepAt, createBreath } from './breath.js';

const APP_VERSION = '07/11/2026 · 08h56';

// Tout ce que la 2.0 garde sur l'appareil commence par « projetfocus2. » (séparé de la 1.0).
const store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem('projetfocus2.' + key)); return v ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('projetfocus2.' + key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
  },
};

const $ = (s) => document.querySelector(s);

/* ---------- Réglages ---------- */
// Réglages de la section « Musiques et sons » (le reste est gardé à part : temps du focus et
// de la pause, volume). Tout part dans la sauvegarde Drive et l'export.
const DEFAULTS = {
  radio: 'tlminimal', // musique par défaut
  radios: [...SHOWN_STATIONS], // radios proposées dans « Musiques du menu »
  noise: 'none', // bruit de fond lancé avec Démarrer
  noiseVol: 30,
  // Pause : réglages repris de la 1.0 (sans les messages).
  breathPattern: 'coherence', // rythme (voir breath.js) ; « aucun » = pas de respiration guidée
  breathSound: true, // trois sons : aigu = inspire, moyen = retiens, grave = expire
  breathVol: 60, // volume de ces sons (%)
  breathShow: 'none', // la respiration se voit par : none | word | colors | both | veil
  breathLabels: true, // écrire « inspire / retiens / expire » sous le temps
  breathInspireColor: '#8fd3ff', // bleu ciel
  breathHoldColor: '#ffd36e', // doré
  breathExpireColor: '#000000', // noir
  pulseIntensity: 30, // assombrissement du voile (%)
  autoChain: true, // le focus reprend tout seul à la fin de la pause
  autoChainDelay: 0, // … après N secondes
  breakMusic: 'radio', // musique de la pause : radio | silence | calme
  fullscreenOnBreak: false, // plein écran au début de la pause
  holdSeconds: 0, // « Reprendre le focus » : 0 = un toucher ; sinon, toucher maintenu N secondes
  notifyOn: true, // notification si la fenêtre est cachée
  syncClientId: CLIENT_ID,
};

function sanitize(raw0) {
  const raw = raw0 && typeof raw0 === 'object' ? { ...raw0 } : {};
  // Ancien réglage « rythme » (premier essai du 07/11) : repris sous le nom de la 1.0.
  if (raw.rhythm && !raw.breathPattern) {
    raw.breathPattern = raw.rhythm === 'aucune' ? 'coherence' : raw.rhythm;
    if (raw.rhythm === 'aucune') raw.breathSound = false;
  }
  delete raw.rhythm;
  // 07/11 : plus de « simple pulsation » ; la case « respiration guidée » devient le rythme « aucun ».
  if (raw.pulseOn === false) raw.breathPattern = 'aucun';
  else if (raw.breathPattern === 'simple') raw.breathPattern = DEFAULTS.breathPattern;
  delete raw.pulseOn;
  delete raw.pulseSeconds;
  const r = { ...DEFAULTS, ...raw };
  const known = new Set(STATIONS.map((x) => x.id));
  r.radios = (Array.isArray(r.radios) ? r.radios : DEFAULTS.radios).filter((id) => known.has(id));
  if (!known.has(r.radio)) r.radio = DEFAULTS.radio;
  if (!r.radios.includes(r.radio)) r.radios.push(r.radio); // la radio en cours reste dans le menu
  if (!NOISES.some((n) => n.id === r.noise)) r.noise = DEFAULTS.noise;
  r.noiseVol = Math.min(100, Math.max(0, Math.round(Number(r.noiseVol)) || 0));
  const num = (v, min, max, def, step = 1) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n / step) * step)) : def;
  };
  const pick = (v, list, def) => (list.includes(v) ? v : def);
  const color = (v, def) => (/^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : def);
  r.breathSound = !!r.breathSound;
  r.breathLabels = !!r.breathLabels;
  r.autoChain = !!r.autoChain;
  r.fullscreenOnBreak = !!r.fullscreenOnBreak;
  r.notifyOn = !!r.notifyOn;
  r.breathPattern = pick(r.breathPattern, RHYTHMS.map((x) => x.id), DEFAULTS.breathPattern);
  r.breathShow = pick(r.breathShow, ['none', 'word', 'colors', 'both', 'veil'], DEFAULTS.breathShow);
  r.breakMusic = pick(r.breakMusic, ['radio', 'silence', 'calme'], DEFAULTS.breakMusic);
  r.breathVol = num(r.breathVol, 0, 100, DEFAULTS.breathVol);
  r.pulseIntensity = num(r.pulseIntensity, 5, 70, DEFAULTS.pulseIntensity, 5);
  r.autoChainDelay = num(r.autoChainDelay, 0, 60, DEFAULTS.autoChainDelay);
  r.holdSeconds = num(r.holdSeconds, 0, 10, DEFAULTS.holdSeconds);
  r.breathInspireColor = color(r.breathInspireColor, DEFAULTS.breathInspireColor);
  r.breathHoldColor = color(r.breathHoldColor, DEFAULTS.breathHoldColor);
  r.breathExpireColor = color(r.breathExpireColor, DEFAULTS.breathExpireColor);
  // Coach et messages : mis de côté pour le moment (demande de l'utilisateur, 07/11).
  delete r.coachMode;
  delete r.coachActions;
  r.syncClientId = typeof r.syncClientId === 'string' && r.syncClientId.trim() ? r.syncClientId.trim() : DEFAULTS.syncClientId;
  return r;
}

let S = sanitize(store.get('settings', {}));
const saveS = () => store.set('settings', S);

/* ---------- Radio ---------- */
// Jouée par le lecteur du téléphone (balise audio), sans passer par le moteur audio de la
// page : c'est ce qui faisait craquer le son de la 1.0 quand le téléphone était occupé.
// La radio vient des Paramètres (Musiques et sons) ; Technolovers Minimal au départ.
const stationOf = (id) => STATIONS.find((x) => x.id === id) || STATIONS.find((x) => x.id === DEFAULTS.radio);
let RADIO = stationOf(S.radio);

const player = new Audio();
player.preload = 'none';
const btnRadio = $('#btn-radio');
const radioState = $('#radio-state');
const volume = $('#volume');
let wantOn = false; // ce que l'utilisateur a demandé (la radio peut être en train de se connecter)

function setState(text) { radioState.textContent = text; }

function renderRadio() {
  btnRadio.classList.toggle('on', wantOn);
  btnRadio.setAttribute('aria-label', wantOn ? 'Couper la radio' : 'Lancer la radio');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = wantOn ? 'playing' : 'paused';
}

// On se souvient si la radio a été lancée ou coupée par l'utilisateur (`radioWanted`) :
// Démarrer ne la lance que si elle était lancée la dernière fois (comme la 1.0).
function radioOn() {
  wantOn = true;
  radioHeld = false;
  store.set('radioWanted', true);
  // Une radio repart toujours en direct : on recharge le flux.
  player.crossOrigin = 'anonymous'; // permet d'analyser le son pour l'onde (la radio l'autorise)
  player.src = RADIO.url;
  player.volume = volume.value / 100;
  setState('Connexion…');
  player.play().catch(() => { if (wantOn) { wantOn = false; setState('Lecture refusée, touche encore ▶'); renderRadio(); } });
  renderRadio();
}

// `remember` faux : arrêt le temps de la pause (la radio reviendra), sans changer le souvenir.
function radioStop(remember = true) {
  wantOn = false;
  if (remember) store.set('radioWanted', false);
  player.pause();
  player.removeAttribute('src');
  player.load(); // coupe vraiment la connexion au flux
  setState(RADIO.desc);
  renderRadio();
  wave.settle();
}
const radioOff = () => radioStop(true);

btnRadio.addEventListener('click', () => (wantOn ? radioOff() : radioOn()));
player.addEventListener('playing', () => {
  if (wantOn) setState(RADIO.desc + ' · en direct');
  wave.listen();
});
player.addEventListener('waiting', () => { if (wantOn) setState('Connexion…'); });
player.addEventListener('error', () => {
  if (!wantOn) return;
  wantOn = false;
  setState('Radio injoignable (hors ligne ?)');
  renderRadio();
});
// Coupée par le téléphone (appel, autre appli qui prend le son…) : le bouton le montre.
player.addEventListener('pause', () => { if (wantOn && player.src) { wantOn = false; setState(RADIO.desc); renderRadio(); } });

function updateMeta() {
  if ('mediaSession' in navigator && window.MediaMetadata) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: RADIO.name, artist: RADIO.desc, album: 'projetfocus 2' });
  }
}
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', radioOn);
  navigator.mediaSession.setActionHandler('pause', radioOff);
  navigator.mediaSession.setActionHandler('stop', radioOff);
}

// Changer de radio (Paramètres) : si elle joue, la nouvelle prend sa place tout de suite.
function setRadio(id) {
  S.radio = id;
  RADIO = stationOf(id);
  saveS();
  updateMeta();
  syncRadioSelects();
  if (wantOn) radioOn(); else setState(RADIO.desc);
}
updateMeta();
if (!wantOn) setState(RADIO.desc);

/* ---------- Onde en ligne ---------- */
// Reprise de la vue « Rythme · Onde horizontale » de la 1.0 : des barres néon symétriques,
// des basses (cyan) aux aigus (violet), chacune avec sa propre sensibilité.
// L'analyse ÉCOUTE une copie du son (captureStream) : la radio continue de sortir par le
// lecteur du téléphone. Dans la 1.0, le son entier passait par le moteur audio de la page,
// ce qui le rendait fragile quand le téléphone était occupé.
const wave = (() => {
  const canvas = $('#wave');
  const g = canvas.getContext('2d');
  let ctx = null, src = null, an = null, freq = null, raf = 0;
  let peak = -60; // sensibilité automatique : le plus fort entendu récemment (dB)
  const hz = [], hzMax = [];

  // À chaque (re)connexion de la radio, la copie du son change : on la rebranche.
  function listen() {
    if (!player.captureStream) return draw(false); // navigateur sans copie : ligne calme
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const stream = player.captureStream();
      if (!stream.getAudioTracks().length) return;
      src?.disconnect();
      src = ctx.createMediaStreamSource(stream);
      if (!an) {
        an = ctx.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0.6;
        freq = new Float32Array(an.frequencyBinCount);
      }
      src.connect(an); // l'analyseur ne sort nulle part : on ne fait qu'écouter
      start();
    } catch { draw(false); }
  }

  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  function frame() {
    raf = 0;
    const live = wantOn && !player.paused && an && !document.hidden;
    draw(live);
    if (live) raf = requestAnimationFrame(frame);
  }

  function draw(live) {
    const k = devicePixelRatio || 1, W = Math.round(canvas.clientWidth * k), H = Math.round(canvas.clientHeight * k);
    if (!W || !H) return;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    let level = null;
    if (live) {
      an.getFloatFrequencyData(freq);
      let top = -200;
      for (let i = 1; i < 200; i++) top = Math.max(top, freq[i]);
      peak = Math.max(top, peak - 0.04); // redescend doucement : une musique calme bouge aussi
      level = (i) => Math.min(1, Math.max(0, (freq[i] - (peak - 42)) / 42));
    }
    const mid = H / 2, step = 7 * k, bw = 3.4 * k, n = Math.floor(W / step);
    g.clearRect(0, 0, W, H);
    // Hauteur de chaque barre (demi-hauteur), puis lissage entre voisines : la silhouette
    // devient une courbe douce au lieu de dents (07/11, demande de l'utilisateur : plus arrondie).
    let h = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const f = i / Math.max(1, n - 1);
      // Chaque barre a sa propre sensibilité (son maximum récent) : les aigus bougent aussi.
      const raw = level ? level(Math.floor(2 * Math.pow(95, f))) : 0;
      const top = hzMax[i] = Math.max(raw, (hzMax[i] || 0.2) * 0.997, 0.1);
      const s = hz[i] = Math.max(raw / top, (hz[i] || 0) * 0.9);
      const env = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, f * 1.15)); // plus haut vers le milieu
      h[i] = Math.max(bw / 2, (0.03 + 0.97 * s ** 1.3) * mid * 0.94 * env);
    }
    for (let pass = 0; pass < 3; pass++) {
      const o = new Float32Array(n);
      for (let i = 0; i < n; i++) o[i] = 0.25 * h[Math.max(0, i - 1)] + 0.5 * h[i] + 0.25 * h[Math.min(n - 1, i + 1)];
      h = o;
    }
    // Barres en gélule (bouts ronds), avec un halo rond autour.
    const pill = (x, y, w, hh) => { g.beginPath(); g.roundRect(x, y, w, hh, w / 2); g.fill(); };
    // Plus de couleur (07/11, demande de l'utilisateur) : tout l'arc-en-ciel froid et chaud,
    // du vert-cyan (basses, à gauche) au magenta-rose (aigus, à droite), qui glisse lentement
    // avec le temps ; les barres les plus hautes s'éclaircissent et virent un peu au chaud.
    const drift = Math.sin(performance.now() / 5000) * 35;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const f = i / Math.max(1, n - 1), a = h[i], loud = Math.min(1, a / (mid * 0.6));
      const x = i * step + (step - bw) / 2;
      const hue = (150 + f * 210 + drift - loud * 25 + 360) % 360;
      g.globalAlpha = 0.18;
      g.fillStyle = `hsl(${hue} 100% 58%)`;
      pill(x - bw * 0.8, mid - a - k, bw * 2.6, 2 * a + 2 * k); // halo
      g.globalAlpha = 0.92;
      g.fillStyle = `hsl(${hue} 100% ${66 + loud * 14}%)`;
      pill(x, mid - a, bw, 2 * a);
    }
    // Ligne du milieu
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 0.22;
    g.fillStyle = '#fff';
    g.fillRect(0, mid - 0.5 * k, W, k);
    g.globalAlpha = 1;
  }

  // Radio coupée : les barres retombent doucement jusqu'à la ligne calme.
  function settle() {
    let left = 40;
    const fall = () => { draw(false); if (--left > 0 && !wantOn) requestAnimationFrame(fall); };
    requestAnimationFrame(fall);
  }

  addEventListener('resize', () => { if (!raf) draw(false); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && wantOn) start(); });
  return { listen, draw, settle, start };
})();
wave.draw(false);

/* ---------- Volume ---------- */
volume.value = store.get('volume', 70);
volume.addEventListener('input', () => {
  player.volume = volume.value / 100;
  calm.volume = volume.value / 100;
  store.set('volume', Number(volume.value));
});

/* ---------- Horloge ---------- */
// Cadran de la 1.0 (style « Normal ») : on le tourne pour régler, de 1 à 90 min (07/11,
// demande de l'utilisateur ; 60 dans la 1.0), comme un minuteur de cuisine. L'arc part de la
// position du temps et finit à midi ; le point est en tête. Graduations pendant le réglage.
// Comme la 1.0, deux boutons sous l'horloge choisissent ce qu'on règle : le temps du focus
// ou celui de la pause (07/11). Les deux temps sont gardés.
// Pendant un décompte, le cercle est COMPLET au départ, quel que soit le temps choisi, puis
// se vide jusqu'à 0 (le point recule jusqu'à midi) ; on ne règle plus l'horloge.
const clock = (() => {
  const dial = $('#dial'), arc = $('#arc'), knob = $('#knob'), time = $('#time'), sub = $('#sub');
  const R = 128, CIRC = 2 * Math.PI * R;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // Un tour d'horloge vaut 90 min pour le focus, 20 min pour la pause (07/11, demande de
  // l'utilisateur : pause limitée à 20 min, et plus facile à régler au doigt sur un tour entier).
  const TOP = { focus: 90, break: 20 };
  const top = () => TOP[editing];
  const read = (key, def, top) => clamp(Math.round(store.get(key, def)) || def, 1, top);
  const mins = { focus: read('focusMin', 25, TOP.focus), break: read('breakMin', 5, TOP.break) };
  let editing = 'focus'; // ce que règle l'horloge au repos
  let dragging = false, prev = 0, ticksTimer = 0, ticksFor = 0;

  // Graduations pour l'échelle en cours : un trait par minute, plus marqué toutes les 5 min ;
  // chiffres toutes les 10 min sur 90, toutes les 5 min sur 20.
  function buildTicks(max) {
    if (ticksFor === max) return;
    ticksFor = max;
    const g = $('#ticks'), ns = 'http://www.w3.org/2000/svg', deg = 360 / max, every = max > 30 ? 10 : 5;
    g.replaceChildren();
    for (let m = 0; m < max; m++) {
      // Comme un minuteur de cuisine : les minutes se lisent dans le sens inverse des aiguilles.
      const a = ((360 - m * deg) % 360) * Math.PI / 180;
      const major = m % 5 === 0;
      const r1 = major ? 112 : 117, r2 = 122;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', 150 + r1 * Math.sin(a)); l.setAttribute('y1', 150 - r1 * Math.cos(a));
      l.setAttribute('x2', 150 + r2 * Math.sin(a)); l.setAttribute('y2', 150 - r2 * Math.cos(a));
      if (major) l.classList.add('major');
      g.appendChild(l);
      if (m % every === 0) {
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', 150 + 99 * Math.sin(a)); t.setAttribute('y', 150 - 99 * Math.cos(a));
        t.textContent = m;
        g.appendChild(t);
      }
    }
  }

  // Arc et point pour un temps donné (en secondes). `total` : durée du décompte en cours ;
  // le cercle complet vaut alors ce total. Sans total (réglage), un tour vaut 90 min (focus)
  // ou 20 min (pause).
  function draw(sec, total = 0) {
    const f = clamp(total ? sec / total : sec / 60 / top(), 0, 1);
    const len = f * CIRC;
    arc.style.strokeDasharray = `${len} ${CIRC}`;
    arc.style.strokeDashoffset = `${len - CIRC}`;
    arc.style.opacity = len < 0.5 ? 0 : 1;
    const a = (360 - f * 360) * Math.PI / 180;
    knob.setAttribute('cx', 150 + R * Math.sin(a));
    knob.setAttribute('cy', 150 - R * Math.cos(a));
    knob.style.opacity = f <= 0 ? 0 : 1;
    const s = Math.max(0, Math.round(sec));
    const txt = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    if (time.textContent !== txt) time.textContent = txt;
  }

  function label(phase, text) { sub.textContent = text || (phase === 'break' ? 'pause' : 'focus'); }

  // Au repos : l'horloge montre ce qu'on règle, et les deux boutons leurs temps.
  function showSetup() {
    buildTicks(top());
    label(editing);
    dial.setAttribute('aria-valuenow', String(mins[editing]));
    dial.setAttribute('aria-label', editing === 'focus' ? 'Durée du focus en minutes' : 'Durée de la pause en minutes');
    $('#v-focus').textContent = mins.focus;
    $('#v-break').textContent = mins.break;
    $('#edit-focus').classList.toggle('on', editing === 'focus');
    $('#edit-break').classList.toggle('on', editing === 'break');
    draw(mins[editing] * 60);
    markPreset();
  }

  function set(m) {
    mins[editing] = clamp(Math.round(m), 1, top());
    showSetup();
  }

  function edit(what) { editing = what; showSetup(); showTicks(); }

  // Préréglages (07/11, demande de l'utilisateur) : 25/5, 50/10, 90/20 d'un toucher.
  // Celui qui correspond aux temps réglés est entouré.
  const presets = [...document.querySelectorAll('.preset')];
  function markPreset() {
    for (const b of presets) b.classList.toggle('on', +b.dataset.f === mins.focus && +b.dataset.b === mins.break);
  }
  for (const b of presets) {
    b.addEventListener('click', () => {
      mins.focus = +b.dataset.f;
      mins.break = +b.dataset.b;
      save();
      showSetup();
    });
  }
  $('#edit-focus').addEventListener('click', () => edit('focus'));
  $('#edit-break').addEventListener('click', () => edit('break'));

  // Graduations : affichées au toucher, effacées quelques secondes après.
  function showTicks() {
    document.body.classList.add('show-ticks');
    clearTimeout(ticksTimer);
    ticksTimer = setTimeout(() => document.body.classList.remove('show-ticks'), 4000);
  }

  function fromPointer(e) {
    const r = dial.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    let a = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (a < 0) a += 360;
    return { m: Math.round((360 - a) / (360 / top())), dist: Math.hypot(dx, dy) / (r.width / 2) };
  }

  const save = () => { store.set('focusMin', mins.focus); store.set('breakMin', mins.break); };
  const locked = () => document.body.classList.contains('running');

  dial.addEventListener('pointerdown', (e) => {
    if (locked()) return;
    showTicks();
    const { m, dist } = fromPointer(e);
    if (dist < 0.35) return; // le centre ne règle rien
    dragging = true;
    dial.setPointerCapture(e.pointerId);
    document.body.classList.add('adjusting');
    prev = clamp(m, 1, top());
    set(prev);
  });
  dial.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    let { m } = fromPointer(e);
    // Pas de saut du maximum à 0 en passant par midi : on bute comme un vrai minuteur.
    const max = top();
    if (Math.abs(m - prev) > max / 2) m = prev > max / 2 ? max : 1;
    m = clamp(m, 1, max);
    if (m !== prev) { prev = m; set(m); }
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('adjusting');
    showTicks();
    save();
  };
  dial.addEventListener('pointerup', end);
  dial.addEventListener('pointercancel', end);
  dial.addEventListener('keydown', (e) => {
    if (locked()) return;
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (!step) return;
    e.preventDefault();
    showTicks(); set(mins[editing] + step); save();
  });
  dial.addEventListener('wheel', (e) => {
    if (locked()) return;
    e.preventDefault();
    showTicks(); set(mins[editing] + (e.deltaY < 0 ? 1 : -1)); save();
  }, { passive: false });

  showSetup();
  // Temps repris d'une sauvegarde, d'un import ou des valeurs par défaut.
  function setTimes(f, b) {
    mins.focus = clamp(Math.round(Number(f)) || 25, 1, TOP.focus);
    mins.break = clamp(Math.round(Number(b)) || 5, 1, TOP.break);
    save();
    showSetup();
  }
  return { minutes: (phase) => mins[phase], draw, label, reset: showSetup, setTimes };
})();

/* ---------- Bruit de fond ---------- */
// Généré par la page (Web Audio), repris de la 1.0 ; à revoir plus tard. Il démarre avec
// « Démarrer » et s'arrête avec « Arrêter » (ou à la fin du focus).
const noise = createNoise();
noise.setLevel(S.noiseVol / 100);

/* ---------- Pause : respiration (son et écran), musique ---------- */
// Pendant la pause, trois sons guident la respiration sans qu'on regarde l'écran :
// aigu = inspire, moyen = retiens, grave = expire (breath.js). Comme la 1.0, la respiration
// peut aussi se voir (le mot qui grandit, les couleurs, un voile sombre), au choix dans
// Paramètres → Pause. Le son et l'écran suivent la même horloge (`guide`).
const breath = createBreath();
const pulseEl = $('#pulse'), subEl = $('#sub');
let guide = null; // { steps, t0 } : la respiration en cours (t0 = heure du premier son, en ms)

function startGuide() {
  stopGuide();
  const steps = stepsFor(S.breathPattern);
  if (!steps) return; // « aucun » : rien n'est guidé
  const g = { steps, t0: Date.now() + 150 };
  guide = g;
  if (S.breathSound) {
    breath.start(S.breathPattern, S.breathVol / 100).then((t0) => { if (guide === g && t0) g.t0 = t0; });
  }
}
function stopGuide() {
  guide = null;
  breath.stop();
  resetVisual();
}

const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixRgb = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
const lerp = (a, b, p) => a + (b - a) * p;
const colorOf = (kind) => hexToRgb(kind === 'inspire' ? S.breathInspireColor : kind === 'retiens' ? S.breathHoldColor : S.breathExpireColor);

function resetVisual() {
  pulseEl.style.opacity = 0;
  subEl.style.transform = '';
  document.body.classList.remove('ink-dark');
}

// Le mot de l'étape en cours, s'il doit s'afficher.
function guideWord() {
  if (!guide) return '';
  if (!(S.breathLabels || S.breathShow === 'word')) return '';
  const e = (Date.now() - guide.t0) / 1000;
  return e < 0 ? '' : stepAt(guide.steps, e).kind;
}

// Respiration à l'écran, calculée à chaque image : inspire = le mot grandit / l'écran
// s'éclaircit ; retiens = rien ne bouge ; expire = le mot rétrécit / l'écran s'assombrit.
function applyGuide() {
  if (!guide) return resetVisual();
  const e = (Date.now() - guide.t0) / 1000;
  if (e < 0) return;
  const show = S.breathShow;
  const st = stepAt(guide.steps, e);
  const prev = guide.steps[(st.i - 1 + guide.steps.length) % guide.steps.length][0] || 'expire';
  const dark = S.pulseIntensity / 100;
  const endOf = (kind) => (kind === 'inspire' ? 1 : 0); // 1 = poumons pleins
  // Poumons pleins (1) ou vides (0) à l'instant : sert au mot qui grandit et au voile.
  const fill = st.kind === 'inspire' ? st.p : st.kind === 'expire' ? 1 - st.p : endOf(prev);
  if (show === 'word' || show === 'both') {
    subEl.style.transform = `scale(${lerp(1, show === 'word' ? 3 : 2.4, fill).toFixed(3)})`;
  } else subEl.style.transform = '';
  if (show === 'colors' || show === 'both') {
    const glide = st.kind === 'retiens' ? Math.min(1.5, st.secs) : st.secs;
    const c = mixRgb(colorOf(prev), colorOf(st.kind), Math.min(1, (st.p * st.secs) / glide)); // la couleur glisse d'une étape à l'autre
    pulseEl.style.backgroundColor = `rgb(${c})`;
    pulseEl.style.opacity = st.cycle === 0 && st.i === 0 ? st.p : 1; // la première inspiration s'allume doucement
    document.body.classList.toggle('ink-dark', (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 > 0.6);
  } else if (show === 'veil') {
    pulseEl.style.backgroundColor = '#000';
    pulseEl.style.opacity = (dark * (1 - fill)).toFixed(3); // inspire : s'éclaircit ; expire : s'assombrit
    document.body.classList.remove('ink-dark');
  } else {
    pulseEl.style.opacity = 0;
    document.body.classList.remove('ink-dark');
  }
}

/* ---------- Pause : plein écran, notifications ---------- */
let weWentFullscreen = false;
function enterFullscreen() {
  if (!S.fullscreenOnBreak || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen().then(() => { weWentFullscreen = true; }).catch(() => { /* sans geste, refusé */ });
}
function leaveFullscreen() {
  if (weWentFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  weWentFullscreen = false;
}
function askNotifyPermission() {
  if (S.notifyOn && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
}
async function notify(title, text) {
  if (!S.notifyOn || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body: text, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'projetfocus2', renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, opts); else new Notification(title, opts);
  } catch { /* notifications indisponibles */ }
}

/* ---------- Pause : musique ---------- */
// « radio » : la radio continue ; « silence » : elle se coupe le temps de la pause et revient
// après ; « calme » : une musique calme fournie en fichier (audio/pause/calme.mp3, voir
// SUNO.md) joue à la place, en boucle. Sans fichier, « calme » se comporte comme « silence ».
const CALM_URL = 'audio/pause/calme.mp3';
const calm = new Audio();
calm.loop = true;
calm.preload = 'none';
let calmAvailable = false;
let radioHeld = false; // la radio était lancée : on la rend à la fin de la pause
fetch(CALM_URL, { method: 'HEAD' }).then((r) => { calmAvailable = r.ok; refreshPauseUi(); }).catch(() => {});

function pauseMusicOn() {
  if (S.breakMusic === 'radio') return;
  if (wantOn) { radioHeld = true; radioStop(false); }
  if (S.breakMusic === 'calme' && calmAvailable) {
    calm.src = CALM_URL;
    calm.volume = volume.value / 100;
    calm.play().catch(() => {});
  }
}
function pauseMusicOff() {
  calm.pause();
  calm.removeAttribute('src');
  if (radioHeld) { radioHeld = false; radioOn(); }
}

/* ---------- Démarrer / Pause maintenant / Arrêter ---------- */
// Démarrer lance le focus, et la radio seulement si elle était lancée la dernière fois
// (07/11, demande de l'utilisateur ; souvenir `radioWanted`, coupée par défaut).
// « Pause maintenant » (pendant le focus) lance tout de suite le décompte de la pause.
// À la fin de la pause, le focus reprend tout seul (réglable) ou avec « Reprendre le focus »
// (qu'on peut faire « maintenir »). Arrêter ramène au réglage. Le temps est calculé sur
// l'heure de fin (pas de dérive), et gardé sur l'appareil : si Android ferme ou recharge la
// page, le décompte reprend là où il en était (leçon de la 1.0). À la fin du focus : retour
// au réglage pour l'instant (la question « On fait une pause ? » reste à faire).
const timer = (() => {
  const btn = $('#btn-start'), btnBreak = $('#btn-break'), btnResume = $('#btn-resume');
  let run = store.get('run', null); // { phase: 'focus' | 'break', endAt, total, ended?, resumeAt? } en cours, sinon null
  if (run && !(run.endAt > Date.now())) run = null; // fini pendant que la page était fermée
  if (run && run.phase !== 'break') run.phase = 'focus'; // décompte enregistré avant la pause

  let resumeLabel = '';
  function render() {
    const b = document.body;
    const ph = run?.phase;
    b.classList.toggle('running', !!run);
    b.classList.toggle('phase-focus', ph === 'focus');
    b.classList.toggle('phase-break', ph === 'break');
    b.classList.toggle('break-ended', !!run?.ended);
    btn.textContent = run ? 'Arrêter' : 'Démarrer';
    btn.classList.toggle('primary', !run);
    const rl = S.holdSeconds > 0 ? `Maintenir pour reprendre (${S.holdSeconds} s)` : 'Reprendre le focus';
    if (rl !== resumeLabel) { resumeLabel = rl; btnResume.textContent = rl; }
    if (run) {
      const left = run.ended ? 0 : Math.max(0, (run.endAt - Date.now()) / 1000);
      // Sous le temps : « focus », « pause », ou l'action de respiration en cours.
      clock.label(ph, run.ended ? 'pause terminée' : ph === 'break' ? guideWord() : '');
      clock.draw(left, run.total);
      // Fond (07/11, demande de l'utilisateur) : pendant le focus, il glisse de la couleur
      // d'origine au noir sur toute la durée ; pendant la pause, il revient du noir à la
      // couleur d'origine.
      const done = 1 - left / run.total;
      paintBg(ph === 'focus' ? done : 1 - done);
      if (ph === 'break') applyGuide(); else resetVisual();
    } else {
      clock.reset();
      paintBg(0);
      resetVisual();
    }
  }

  // `dark` : 0 = couleur d'origine, 1 = noir.
  const BG = [0x1c, 0x1a, 0x4d];
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let lastBg = '';
  function paintBg(dark) {
    const k = 1 - Math.min(1, Math.max(0, dark));
    const c = '#' + BG.map((v) => Math.round(v * k).toString(16).padStart(2, '0')).join('');
    if (c === lastBg) return;
    lastBg = c;
    document.body.style.backgroundColor = c;
    themeMeta?.setAttribute('content', c); // barre du téléphone de la même couleur
  }

  function begin(phase) {
    holdEnd();
    const total = clock.minutes(phase) * 60;
    run = { phase, endAt: Date.now() + total * 1000, total };
    store.set('run', run);
    if (phase === 'break') {
      startGuide(); // respiration : son et écran
      pauseMusicOn();
      enterFullscreen();
    } else {
      stopGuide();
      pauseMusicOff();
      leaveFullscreen();
    }
    render();
    loop();
  }

  function start() {
    askNotifyPermission();
    if (!wantOn && store.get('radioWanted', false)) radioOn();
    noise.set(S.noise); // bruit de fond choisi dans les Paramètres (rien si « Aucun bruit »)
    begin('focus');
  }

  function stop() {
    holdEnd();
    run = null;
    store.set('run', null);
    noise.set('none');
    stopGuide();
    radioHeld = false; // Arrêter coupe aussi la radio : on ne la rend pas
    pauseMusicOff();
    // La radio s'arrête, mais le souvenir (`radioWanted`) reste : Démarrer la relancera si elle
    // jouait (07/11, demande de l'utilisateur).
    if (wantOn) radioStop(false);
    leaveFullscreen();
    render();
  }

  // Un décompte est-il arrivé au bout ? (la pause finie attend ensuite l'heure de reprise)
  function due() {
    if (!run) return false;
    const now = Date.now();
    if (run.ended) return run.resumeAt > 0 && now >= run.resumeAt;
    return now >= run.endAt;
  }

  // Fin d'un décompte. Pause finie : le focus reprend tout seul après le délai réglé
  // (Paramètres → Pause), ou on attend « Reprendre le focus ». Focus fini : retour au réglage.
  function finish() {
    if (!run) return;
    if (run.phase === 'break') {
      if (!run.ended) {
        run.ended = true;
        run.resumeAt = S.autoChain ? Date.now() + S.autoChainDelay * 1000 : 0;
        store.set('run', run);
        stopGuide(); // plus de sons de respiration
        notify(S.autoChain ? 'On reprend' : 'La pause est finie', S.autoChain ? 'Le focus repart.' : 'Reviens quand tu veux.');
      }
      if (run.resumeAt && Date.now() >= run.resumeAt) begin('focus');
      return;
    }
    notify('Focus terminé', 'Prends une vraie pause.');
    stop();
  }

  // Arc fluide tant que l'écran est visible ; le contrôle de fin tourne aussi en arrière-plan.
  function loop() {
    if (!run) return;
    if (due()) finish();
    if (!run) return;
    render();
    if (!document.hidden) requestAnimationFrame(loop);
  }
  // Une fois par seconde : fin de décompte, et affichage à jour même quand le navigateur ne dessine plus
  // d'images (onglet en arrière-plan).
  setInterval(() => { if (due()) finish(); else if (run) render(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  btn.addEventListener('click', () => (run ? stop() : start()));
  btnBreak.addEventListener('click', () => { if (run?.phase === 'focus') begin('break'); });

  // « Reprendre le focus » : un simple toucher ou, si réglé, un toucher MAINTENU (geste
  // volontaire pour ne pas écourter la pause sans y penser, comme la 1.0).
  let holdTimer = 0, holdRaf = 0, holdT0 = 0;
  function holdEnd() {
    clearTimeout(holdTimer);
    cancelAnimationFrame(holdRaf);
    btnResume.classList.remove('holding');
    btnResume.style.setProperty('--p', 0);
  }
  function holdBegin() {
    if (S.holdSeconds <= 0 || run?.phase !== 'break') return;
    holdEnd();
    holdT0 = performance.now();
    btnResume.classList.add('holding');
    holdTimer = setTimeout(() => { holdEnd(); begin('focus'); }, S.holdSeconds * 1000);
    const tick = () => {
      btnResume.style.setProperty('--p', Math.min(1, (performance.now() - holdT0) / (S.holdSeconds * 1000)));
      holdRaf = requestAnimationFrame(tick);
    };
    tick();
  }
  btnResume.addEventListener('pointerdown', (e) => {
    if (S.holdSeconds <= 0) return;
    try { btnResume.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
    holdBegin();
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btnResume.addEventListener(ev, holdEnd);
  btnResume.addEventListener('contextmenu', (e) => e.preventDefault());
  btnResume.addEventListener('click', (e) => {
    if (S.holdSeconds > 0) { e.preventDefault(); return; } // en mode « maintenir », un simple toucher ne fait rien
    if (run?.phase === 'break') begin('focus');
  });

  render();
  loop();
  return {
    get running() { return !!run; },
    get onBreak() { return run?.phase === 'break' && !run.ended; },
    render,
  };
})();

/* ---------- Heure bien visible au toucher ---------- */
// Pendant le décompte, l'heure s'efface lentement (voir style.css) ; un toucher la rend
// entièrement visible pendant 5 s.
let awakeTimer = 0;
addEventListener('pointerdown', () => {
  document.body.classList.add('awake');
  clearTimeout(awakeTimer);
  awakeTimer = setTimeout(() => document.body.classList.remove('awake'), 5000);
}, true);

/* ---------- Paramètres ---------- */
const dlg = $('#settings');
$('#version').textContent = APP_VERSION;
$('#btn-settings').addEventListener('click', () => { dlg.showModal(); checkUpdate(); });
$('#btn-close').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // toucher à côté ferme

// Une seule section ouverte à la fois, comme la 1.0.
const secs = [...dlg.querySelectorAll('details.sec')];
for (const d of secs) d.addEventListener('toggle', () => { if (d.open) for (const o of secs) if (o !== d) o.open = false; });

const note = (text) => { $('#save-note').textContent = text; };

/* ---------- Paramètres : Musiques et sons ---------- */
function groupedOptions(list, select, value) {
  select.replaceChildren();
  const groups = new Map();
  for (const x of list) {
    if (!groups.has(x.group)) {
      const g = document.createElement('optgroup');
      g.label = x.group;
      groups.set(x.group, g);
      select.appendChild(g);
    }
    groups.get(x.group).appendChild(new Option(x.name, x.id));
  }
  select.value = value;
}

// Les radios cochées dans « Musiques du menu » : même liste dans les Paramètres et dans le lecteur.
function fillRadioSelects() {
  const shown = STATIONS.filter((x) => S.radios.includes(x.id));
  groupedOptions(shown, $('#sel-radio'), S.radio);
  groupedOptions(shown, $('#sel-player-radio'), S.radio);
}
function syncRadioSelects() {
  for (const sel of [$('#sel-radio'), $('#sel-player-radio')]) if (sel.value !== S.radio) sel.value = S.radio;
}

function buildSounds() {
  fillRadioSelects();
  const sn = $('#sel-noise');
  sn.replaceChildren(...NOISES.map((n) => new Option(n.name, n.id)));
  sn.value = S.noise;
  $('#rng-noise').value = S.noiseVol;
  $('#out-noise').textContent = S.noiseVol;
  // « Musiques du menu » : une case par radio ; la radio en cours reste toujours cochée.
  const picks = $('#station-picks');
  picks.replaceChildren();
  let group = null;
  for (const x of STATIONS) {
    if (x.group !== group) {
      group = x.group;
      const h = document.createElement('p');
      h.className = 'pick-group';
      h.textContent = group;
      picks.appendChild(h);
    }
    const l = document.createElement('label');
    l.className = 'pick';
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = S.radios.includes(x.id);
    c.addEventListener('change', () => {
      if (!c.checked && x.id === S.radio) { c.checked = true; return; }
      S.radios = STATIONS.filter((y) => (y.id === x.id ? c.checked : S.radios.includes(y.id))).map((y) => y.id);
      saveS();
      fillRadioSelects();
    });
    l.append(c, document.createTextNode(x.name));
    picks.appendChild(l);
  }
}

$('#sel-radio').addEventListener('change', (e) => setRadio(e.target.value));

/* ---------- Paramètres : Pause ---------- */
// Les réglages de pause de la 1.0 (sans les messages). Chaque champ porte `data-k` (le nom du
// réglage) ; `data-if` cache un réglage qui ne sert pas (« k », « k=a|k=b », « k!=v », tous
// à satisfaire quand ils sont séparés par un espace).
const pauseFields = [...dlg.querySelectorAll('[data-k]')];

function readField(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'range' || el.type === 'number') return Number(el.value);
  if ('list' in el.dataset) return el.value.split('\n').map((x) => x.trim()).filter(Boolean);
  return el.value;
}
function writeField(el, v) {
  if (el.type === 'checkbox') el.checked = !!v;
  else if ('list' in el.dataset) el.value = v.join('\n');
  else el.value = v;
  const out = el.closest('.rng')?.querySelector('output');
  if (out) out.textContent = v;
}
function condOk(c) {
  return c.split('|').some((part) => {
    const m = part.match(/^(\w+)(!?=)?(.*)$/);
    const val = S[m[1]];
    if (!m[2]) return !!val;
    return m[2] === '=' ? String(val) === m[3] : String(val) !== m[3];
  });
}
function refreshVisibility() {
  for (const el of dlg.querySelectorAll('[data-if]')) el.hidden = !el.dataset.if.split(/\s+/).every(condOk);
}
// La musique « calme » n'est proposée que si son fichier existe (audio/pause/calme.mp3).
function refreshPauseUi() {
  const sel = $('#sel-break-music');
  sel.replaceChildren(
    new Option('La radio continue', 'radio'),
    new Option('Silence (la radio revient après)', 'silence'),
    new Option(calmAvailable ? 'Musique calme (fichier de la pause)' : 'Musique calme (pas encore de fichier)', 'calme'),
  );
  sel.value = S.breakMusic;
}
function syncFields() {
  for (const el of pauseFields) writeField(el, S[el.dataset.k]);
  refreshVisibility();
}
function onSettingChanged(k) {
  if (['breathPattern', 'breathSound'].includes(k) && timer.onBreak) startGuide();
  if (k === 'breathVol') breath.setLevel(S.breathVol / 100);
  if (k === 'breakMusic' && timer.onBreak) { pauseMusicOff(); pauseMusicOn(); }
  if (k === 'notifyOn') askNotifyPermission();
  refreshVisibility();
  timer.render();
}

$('#sel-breath').replaceChildren(...RHYTHMS.map((x) => new Option(x.name, x.id)));
refreshPauseUi();
for (const el of pauseFields) {
  el.addEventListener(el.type === 'range' || el.tagName === 'TEXTAREA' ? 'input' : el.type === 'color' ? 'input' : 'change', () => {
    const k = el.dataset.k;
    S = sanitize({ ...S, [k]: readField(el) });
    saveS();
    if (el.tagName !== 'TEXTAREA') writeField(el, S[k]); // montre la valeur corrigée (limites)
    onSettingChanged(k);
  });
}
$('#btn-test-breath').addEventListener('click', () => breath.preview(S.breathVol / 100, S.breathPattern));
syncFields();

// Dans le lecteur, choisir une radio la lance tout de suite (comme la 1.0).
$('#sel-player-radio').addEventListener('change', (e) => {
  setRadio(e.target.value);
  if (!wantOn) radioOn();
});
$('#sel-noise').addEventListener('change', (e) => {
  S.noise = e.target.value;
  saveS();
  if (timer.running) noise.set(S.noise); // pendant un décompte, le changement s'entend tout de suite
});
$('#rng-noise').addEventListener('input', (e) => {
  S.noiseVol = Number(e.target.value);
  $('#out-noise').textContent = S.noiseVol;
  noise.setLevel(S.noiseVol / 100);
  saveS();
});
buildSounds();

/* ---------- Paramètres : Sauvegarde ---------- */
// Tout ce qui se sauvegarde : les réglages, les temps du focus et de la pause, le volume.
function collect() {
  return { version: 2, settings: S, focusMin: clock.minutes('focus'), breakMin: clock.minutes('break'), volume: Number(volume.value) };
}

// Remplace les réglages de cet appareil (reprise du Drive, import, valeurs par défaut).
function applyAll(data) {
  const keepId = S.syncClientId;
  S = sanitize(data?.settings);
  if (!data?.settings?.syncClientId) S.syncClientId = keepId;
  saveS();
  clock.setTimes(data?.focusMin, data?.breakMin);
  const v = Number(data?.volume);
  volume.value = Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 70;
  player.volume = volume.value / 100;
  store.set('volume', Number(volume.value));
  noise.setLevel(S.noiseVol / 100);
  RADIO = stationOf(S.radio);
  updateMeta();
  if (wantOn) radioOn(); else setState(RADIO.desc);
  if (timer.running) noise.set(S.noise);
  buildSounds();
  refreshPauseUi();
  syncFields();
  if (timer.onBreak) startGuide();
  timer.render();
  $('#inp-client').value = S.syncClientId;
}

const undoBtn = $('#btn-undo-sync');
undoBtn.hidden = !store.get('beforeDrive', null);

const sync = createSync({
  getSettings: collect,
  getClientId: () => S.syncClientId,
  // « Reprendre » : les paramètres du Drive remplacent ceux de cet appareil (copie gardée).
  applyRemote: (remote) => {
    store.set('beforeDrive', collect());
    undoBtn.hidden = false;
    applyAll(remote);
    note('Paramètres repris depuis Google Drive.');
  },
  onStatus: ({ text, kind, connected }) => {
    $('#sync-status').textContent = text;
    $('#sync-status').dataset.kind = kind;
    $('#btn-sync-out').hidden = !connected;
  },
});

$('#btn-sync-save').addEventListener('click', () => sync.save());
$('#btn-sync-load').addEventListener('click', () => {
  if (confirm('Reprendre les paramètres sauvegardés sur Google Drive ? Ceux de cet appareil seront remplacés (tu pourras revenir en arrière).')) sync.load();
});
$('#btn-sync-out').addEventListener('click', () => sync.disconnect());
undoBtn.addEventListener('click', () => {
  const before = store.get('beforeDrive', null);
  if (!before) return;
  if (!confirm('Remettre les réglages de cet appareil d’avant la dernière reprise depuis Google Drive ?')) return;
  applyAll(before);
  store.set('beforeDrive', null);
  undoBtn.hidden = true;
  note('Réglages d’avant remis sur cet appareil.');
});

// Fichier : exporter / importer en JSON, ou revenir aux valeurs par défaut.
$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ ...collect(), savedAt: Date.now() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'projetfocus2-parametres.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  note('Réglages exportés.');
});
$('#btn-import').addEventListener('click', () => $('#file-import').click());
$('#file-import').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || typeof data !== 'object' || !(data.settings || data.focusMin)) throw new Error('fichier inconnu');
    if (!confirm('Importer ce fichier ? Les réglages de cet appareil seront remplacés.')) return;
    applyAll(data);
    note('Réglages importés.');
  } catch {
    note('Ce fichier n’est pas un export de projetfocus 2.');
  }
});
$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Revenir aux valeurs par défaut ? (L’ID client Google est gardé.)')) return;
  applyAll({ focusMin: 25, breakMin: 5, volume: 70 });
  note('Valeurs par défaut remises.');
});
$('#inp-client').value = S.syncClientId;
$('#inp-client').addEventListener('change', (e) => {
  S.syncClientId = e.target.value.trim() || DEFAULTS.syncClientId;
  e.target.value = S.syncClientId;
  saveS();
});
sync.start();

/* ---------- Mise à jour ---------- */
// L'appli relit la version publiée ; si elle a changé, un point bleu s'allume sur
// « Paramètres ». Jamais de rechargement tout seul.
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'stations.js', 'noise.js', 'breath.js', 'sync.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
let lastCheck = 0;

async function checkUpdate() {
  if (Date.now() - lastCheck < 60000) return;
  lastCheck = Date.now();
  try {
    const res = await fetch('app.js?verif-version', { cache: 'no-cache' });
    const online = res.ok && /APP_VERSION = '([^']+)'/.exec(await res.text())?.[1];
    const newer = online && online !== APP_VERSION;
    $('#update-dot').hidden = !newer;
    $('#update-info').textContent = newer ? `Nouvelle version en ligne : ${online}` : '';
    $('#btn-update').classList.toggle('hot', !!newer);
  } catch { /* hors ligne */ }
}

$('#btn-update').addEventListener('click', async () => {
  $('#update-info').textContent = 'Mise à jour…';
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('projetfocus2-')).map((k) => caches.delete(k)));
    // GitHub Pages laisse le navigateur garder un fichier 10 min : on force le téléchargement.
    await Promise.all(FILES.map((f) => fetch(f, { cache: 'reload' }).catch(() => {})));
  } catch { /* on recharge quand même */ }
  location.reload();
});

checkUpdate();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });
setInterval(checkUpdate, 10 * 60000);

renderRadio();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
