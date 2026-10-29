import { DEFAULTS, STATIONS, SHOWN_STATIONS, PLAYLISTS, BREATHS, NOISES, CHIMES, MESSAGE_POOLS, BREAK_COLORS } from './defaults.js';
import { AudioEngine } from './audio.js';
import { createSync } from './sync.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clone = (o) => JSON.parse(JSON.stringify(o));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const body = document.body;

// Version affichée en bas des Paramètres : à changer à chaque envoi sur GitHub, pour voir
// d'un coup d'œil si un appareil a la dernière.
const APP_VERSION = '29/10/2026 · 17h20';
const LS_SETTINGS = 'projetfocus.settings';
const LS_BEFORE_SYNC = 'projetfocus.settings.avant-drive'; // copie gardée avant chaque récupération

/* =========================================================
   Paramètres (localStorage)
   ========================================================= */

// Garde la forme des valeurs par défaut ; ignore ce qui est inconnu ou du mauvais type.
function merge(def, src) {
  if (Array.isArray(def)) return Array.isArray(src) ? clone(src) : clone(def);
  if (def && typeof def === 'object') {
    const out = {};
    const s = src && typeof src === 'object' ? src : {};
    for (const k of Object.keys(def)) out[k] = merge(def[k], s[k]);
    return out;
  }
  return typeof src === typeof def ? src : def;
}

function sanitize(s) {
  const okDay = Array.isArray(s.dayColors) && s.dayColors.length > 0 && s.dayColors.every(
    (p) => p && typeof p.name === 'string' && /^\d\d:\d\d$/.test(p.hour) && /^#[0-9a-f]{6}$/i.test(p.color));
  if (!okDay) s.dayColors = clone(DEFAULTS.dayColors);
  s.coachActions = s.coachActions.filter((x) => typeof x === 'string' && x.trim());
  s.customLinks = s.customLinks.filter((x) => typeof x === 'string' && x.trim());
  s.hiddenStations = s.hiddenStations.filter((x) => typeof x === 'string');
  for (const k of Object.keys(s.messages)) s.messages[k] = s.messages[k].filter((x) => typeof x === 'string' && x.trim());
  // Version 2 : la pause enchaîne toute seule sur le focus (3 « ding », puis 5 s).
  if (s.version < 2) { s.autoChain = true; s.version = 2; }
  // Version 3 : musique douce en pause, un peu plus audible que l'ancien 10 %.
  if (s.version < 3) { if (s.musicVolBreak === 10) s.musicVolBreak = 25; s.version = 3; }
  // Version 4 : les radios laut.fm (avec pub) sont décochées.
  if (s.version < 4) {
    for (const id of ['lautlofi', 'lautminimal', 'lautambient']) if (!s.hiddenStations.includes(id)) s.hiddenStations.push(id);
    s.version = 4;
  }
  // Version 5 : plus de plein écran automatique en pause (réactivable).
  if (s.version < 5) { s.fullscreenOnBreak = false; s.version = 5; }
  // Version 6 : nouvelles radios ; celles de Bollywood (pub probable) arrivent décochées.
  if (s.version < 6) {
    for (const id of ['bwmirchi', 'bw2010']) if (!s.hiddenStations.includes(id)) s.hiddenStations.push(id);
    s.version = 6;
  }
  // Version 7 : on ne garde que Technolovers Minimal et le classique (le reste est décoché).
  if (s.version < 7) {
    s.hiddenStations = [...STATIONS.map((st) => st.id), ...s.customLinks.map((_, i) => 'perso' + i)]
      .filter((id) => !SHOWN_STATIONS.includes(id));
    s.defaultRadio = 'tlminimal';
    s.version = 7;
  }
  // Version 8 : l'ID client Google est fourni par l'appli (plus rien à coller).
  if (s.version < 8) { if (!s.syncClientId) s.syncClientId = DEFAULTS.syncClientId; s.version = 8; }
  return s;
}

function loadSettings() {
  try { return sanitize(merge(DEFAULTS, JSON.parse(localStorage.getItem(LS_SETTINGS)))); }
  catch { return clone(DEFAULTS); }
}

// `touch` : un vrai changement (date notée).
function saveSettings(touch = true) {
  if (touch) S.updatedAt = Date.now();
  try { localStorage.setItem(LS_SETTINGS, JSON.stringify(S)); } catch { /* stockage indisponible */ }
}

let S = loadSettings();
const audio = new AudioEngine();

/* =========================================================
   Couleur qui suit l'heure
   ========================================================= */

const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbToHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return ((h * 60 + (m || 0)) % 1440 + 1440) % 1440; };

// Mélange dans l'espace OKLab : les teintes intermédiaires restent vives (pas de gris boueux
// entre l'orange de l'aube et le bleu du matin).
const toLinear = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const fromLinear = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
function rgbToOklab([r8, g8, b8]) {
  const [r, g, b] = [r8, g8, b8].map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function oklabToRgb([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s].map((v) => clamp(fromLinear(v), 0, 255));
}

// Démo : la journée entière défile en 30 secondes (Paramètres → Couleurs).
const DEMO_MS = 30000;
let demo = null; // { t0, base } pendant la démo

const colorClock = () => (demo
  ? new Date(demo.base + ((performance.now() - demo.t0) / DEMO_MS) * 86400000)
  : new Date());

function startDayDemo() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  demo = { t0: performance.now(), base: base.getTime() };
  closeSettings();
  body.classList.add('demo');
  document.documentElement.classList.add('demo-on');
  const step = () => {
    if (!demo) return;
    if (performance.now() - demo.t0 >= DEMO_MS) { stopDayDemo(); return; }
    render(false);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function stopDayDemo() {
  demo = null;
  body.classList.remove('demo');
  document.documentElement.classList.remove('demo-on');
  render(true);
}

function dayAt(date = colorClock()) {
  const pts = S.dayColors.map((p) => ({ ...p, m: toMin(p.hour) })).sort((a, b) => a.m - b.m);
  const now = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  let i = pts.length - 1;
  pts.forEach((p, k) => { if (p.m <= now) i = k; });
  const cur = pts[i], next = pts[(i + 1) % pts.length];
  const len = (next.m - cur.m + 1440) % 1440 || 1440;
  const since = (now - cur.m + 1440) % 1440;
  // La couleur glisse en continu, minute par minute, d'un moment au suivant :
  // à l'heure réglée, la couleur du moment est « pure ».
  const t = (1 - Math.cos(Math.PI * since / len)) / 2;
  const a = rgbToOklab(hexToRgb(cur.color)), b = rgbToOklab(hexToRgb(next.color));
  // Le nom affiché est celui du moment le plus proche.
  return { color: rgbToHex(oklabToRgb(a.map((v, j) => v + (b[j] - v) * t))), name: t < 0.5 ? cur.name : next.name };
}

/* =========================================================
   État du minuteur
   ========================================================= */

const T = {
  phase: 'idle', // 'idle' | 'focus' | 'break' | 'done'
  cycle: 1,
  total: S.focusMin * 60, // durée de la phase en cours, en secondes
  endAt: 0, // horodatage de fin (ms)
  pausedRemaining: null, // secondes restantes si le focus est mis en pause
  breakEnded: false,
  resumeAt: 0, // reprise automatique du focus (ms), 0 = on attend « Fait, je reprends »
  breakColor: '', // couleur tirée pour cette pause
  isLong: false,
  afterBreak: false,
  coach: [], // actions proposées pour cette pause (la première est affichée)
  editing: 'focus', // ce que règle le cadran au repos
};

const remaining = () => {
  if (T.phase === 'idle') return (T.editing === 'focus' ? S.focusMin : S.breakMin) * 60;
  if (T.phase === 'done') return 0;
  if (T.pausedRemaining != null) return T.pausedRemaining;
  return Math.max(0, (T.endAt - Date.now()) / 1000);
};

/* =========================================================
   Cadran
   ========================================================= */

const dial = $('#dial'), arc = $('#arc'), knob = $('#knob');
const R = 128, CIRC = 2 * Math.PI * R;

(function buildTicks() {
  const g = $('#ticks');
  const ns = 'http://www.w3.org/2000/svg';
  for (let m = 0; m < 60; m++) {
    // Comme un minuteur de cuisine : les minutes se lisent dans le sens inverse des aiguilles.
    const a = ((360 - m * 6) % 360) * Math.PI / 180;
    const major = m % 5 === 0;
    const r1 = major ? 112 : 117, r2 = 122;
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', 150 + r1 * Math.sin(a)); l.setAttribute('y1', 150 - r1 * Math.cos(a));
    l.setAttribute('x2', 150 + r2 * Math.sin(a)); l.setAttribute('y2', 150 - r2 * Math.cos(a));
    if (major) l.classList.add('major');
    g.appendChild(l);
    if (major) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', 150 + 99 * Math.sin(a)); t.setAttribute('y', 150 - 99 * Math.cos(a));
      t.textContent = m;
      g.appendChild(t);
    }
  }
})();

// L'arc part de la position « temps restant » et finit à midi :
// il se vide dans le sens des aiguilles d'une montre, le point en tête.
function drawDial(sec) {
  const min = clamp(sec / 60, 0, 60);
  const len = (min / 60) * CIRC;
  arc.style.strokeDasharray = `${len} ${CIRC}`;
  arc.style.strokeDashoffset = `${len - CIRC}`;
  arc.style.opacity = len < 0.5 ? 0 : 1;
  const a = (360 - min * 6) * Math.PI / 180;
  knob.setAttribute('cx', 150 + R * Math.sin(a));
  knob.setAttribute('cy', 150 - R * Math.cos(a));
  knob.style.opacity = min <= 0 ? 0 : 1;
}

let dragging = false, dragPrev = 0;

function setEditedMinutes(m) {
  m = clamp(Math.round(m), 1, 60);
  if (T.editing === 'focus') S.focusMin = m; else S.breakMin = m;
  render();
}

function minutesFromPointer(e) {
  const r = dial.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  let a = Math.atan2(dx, -dy) * 180 / Math.PI;
  if (a < 0) a += 360;
  return { m: Math.round((360 - a) / 6), dist: Math.hypot(dx, dy) / (r.width / 2) };
}

dial.addEventListener('pointerdown', (e) => {
  if (T.phase !== 'idle') return;
  const { m, dist } = minutesFromPointer(e);
  if (dist < 0.35) return; // le centre ne règle rien
  dragging = true;
  dial.setPointerCapture(e.pointerId);
  body.classList.add('adjusting');
  dragPrev = clamp(m, 1, 60);
  setEditedMinutes(dragPrev);
});

dial.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  let { m } = minutesFromPointer(e);
  // Pas de saut de 60 à 0 en passant par midi : on bute comme un vrai minuteur.
  if (Math.abs(m - dragPrev) > 30) m = dragPrev > 30 ? 60 : 1;
  m = clamp(m, 1, 60);
  if (m !== dragPrev) { dragPrev = m; setEditedMinutes(m); }
});

const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  body.classList.remove('adjusting');
  saveSettings();
  syncForm();
};
dial.addEventListener('pointerup', endDrag);
dial.addEventListener('pointercancel', endDrag);

dial.addEventListener('keydown', (e) => {
  if (T.phase !== 'idle') return;
  const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
  if (!step) return;
  e.preventDefault();
  setEditedMinutes((T.editing === 'focus' ? S.focusMin : S.breakMin) + step);
  saveSettings(); syncForm();
});

dial.addEventListener('wheel', (e) => {
  if (T.phase !== 'idle') return;
  e.preventDefault();
  setEditedMinutes((T.editing === 'focus' ? S.focusMin : S.breakMin) + (e.deltaY < 0 ? 1 : -1));
  saveSettings(); syncForm();
}, { passive: false });

/* =========================================================
   Messages bienveillants
   ========================================================= */

const msgEl = $('#message');
const M = { text: '', changedAt: 0, finShown: false, timer: null };

const isLate = () => { const h = new Date().getHours(); return h >= S.lateHour || h < 5; };

function generalPool() {
  const out = [];
  for (const p of MESSAGE_POOLS) if (p.cat && S.msgCats[p.id]) out.push(...S.messages[p.id]);
  if (isLate()) out.push(...S.messages.tard);
  return out;
}

function pick(list, avoid) {
  const l = list.filter((x) => x !== avoid);
  const from = l.length ? l : list;
  return from.length ? from[Math.floor(Math.random() * from.length)] : '';
}

// Change le texte en fondu (jamais d'animation qui attire l'œil).
function showText(text, cls = '') {
  clearTimeout(M.timer);
  if (msgEl.textContent === text && msgEl.className === cls) { msgEl.classList.remove('fade'); return; }
  msgEl.classList.add('fade');
  M.timer = setTimeout(() => {
    msgEl.textContent = text;
    msgEl.className = cls;
    if (text) requestAnimationFrame(() => msgEl.classList.remove('fade'));
  }, msgEl.textContent ? 1200 : 0);
}

function showMessage(pool) {
  if (!S.messagesOn) { showText(''); return; }
  const text = pick(pool.length ? pool : generalPool(), M.text);
  M.text = text;
  M.changedAt = Date.now();
  showText(text);
}

function startMessages() {
  M.finShown = false;
  const pool = isLate() ? S.messages.tard : T.afterBreak ? S.messages.reprise : S.messages.debut;
  showMessage(pool);
}

function messagesTick() {
  if (T.phase !== 'focus' || T.pausedRemaining != null || !S.messagesOn) return;
  const rem = remaining();
  if (!M.finShown && rem <= 300 && T.total > 420) {
    M.finShown = true;
    showMessage(S.messages.fin);
  } else if (!M.finShown && Date.now() - M.changedAt >= S.messageEveryMin * 60000) {
    showMessage(generalPool());
  }
}

/* =========================================================
   Coach
   ========================================================= */

const coachList = $('#coach-list');

function pickCoach() {
  const a = [...S.coachActions];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  T.coach = a.slice(0, 3);
}

function renderCoach() {
  coachList.innerHTML = '';
  const on = T.phase === 'break' && S.coachMode === 'one' && T.coach.length;
  if (!on) return;
  // L'action affichée est la première ; les autres sont proposées en remplacement.
  T.coach.forEach((txt, i) => {
    if (i === 0) return;
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = txt;
    b.title = 'Plutôt ça';
    b.addEventListener('click', () => {
      T.coach.splice(i, 1);
      T.coach.unshift(txt); renderCoach(); showCoach();
    });
    li.appendChild(b);
    coachList.appendChild(li);
  });
}

function showCoach() {
  if (T.breakEnded) { showText(T.resumeAt ? 'Pause terminée. On reprend doucement.' : 'Pause terminée. Reviens quand tu veux.', 'coach'); return; }
  showText(S.coachMode === 'one' && T.coach[0] ? T.coach[0] : '', 'coach');
}

/* =========================================================
   Respiration guidée pendant la pause
   ========================================================= */

// Inspire : l'écran s'éclaircit ; retiens : rien ne bouge ; expire : il s'assombrit.
// Avec « une couleur par étape », l'écran prend vraiment la couleur choisie dans les Paramètres.
const pulseEl = $('#pulse'), breathEl = $('#breath');
let breathOn = false, breathTimer = 0, inkTimer = 0;

function breathSteps() {
  const b = BREATHS.find((x) => x.id === S.breathPattern) || BREATHS[0];
  if (b.steps) return b.steps;
  return [['', S.pulseSeconds / 2], ['', S.pulseSeconds / 2]]; // simple pulsation
}

// Voile posé sur le fond : sa couleur et son opacité glissent pendant toute l'étape.
function setPulse(opacity, seconds, color = '#000000') {
  pulseEl.style.transitionDuration = seconds + 's';
  pulseEl.style.backgroundColor = color;
  pulseEl.style.opacity = opacity;
}

// Sur une teinte claire (bleu ciel, doré…), le texte et le cadran passent en sombre.
function breathInk(color) {
  const st = document.documentElement.style;
  const light = color && rgbToOklab(hexToRgb(color))[0] > 0.75;
  st.setProperty('--fg', light ? '#1b1f24' : S.textColor);
  st.setProperty('--dial', light ? '#1b1f24' : S.dialColor);
  body.classList.toggle('ink-dark', !!light);
}

function breathStep(k) {
  if (!breathOn) return;
  const steps = breathSteps();
  const [kind, sec] = steps[k % steps.length];
  const dark = S.pulseIntensity / 100;
  if (kind && S.breathColors) {
    // Une teinte par étape : inspire, retiens, expire.
    const color = kind === 'inspire' ? S.breathInspireColor : kind === 'retiens' ? S.breathHoldColor : S.breathExpireColor;
    const glide = kind === 'retiens' ? Math.min(1.5, sec) : sec;
    setPulse(1, glide, color);
    // Le texte change de teinte à mi-chemin, quand le fond a assez changé.
    clearTimeout(inkTimer);
    inkTimer = setTimeout(() => breathInk(color), glide * 500);
  } else if (kind === 'inspire' || (!kind && k % 2 === 0)) setPulse(0, sec);
  else if (kind === 'expire' || !kind) setPulse(dark, sec);
  breathEl.textContent = kind;
  breathEl.classList.toggle('on', !!kind && S.breathLabels);
  breathTimer = setTimeout(() => breathStep(k + 1), sec * 1000);
}

function breathStart() {
  breathOn = true;
  // On part « poumons vides » : écran sombre ; en couleurs, la première inspiration
  // glisse de la couleur de pause vers la teinte d'inspiration.
  if (S.breathColors) setPulse(0, 0, S.breathInspireColor);
  else setPulse(S.pulseIntensity / 100, 0);
  void pulseEl.offsetWidth; // pose ce départ tout de suite, sans transition
  breathTimer = setTimeout(() => breathStep(0), 50); // laisse l'écran sombre s'afficher d'abord
}

function breathStop() {
  breathOn = false;
  clearTimeout(breathTimer);
  setPulse(0, 1);
  clearTimeout(inkTimer);
  breathInk(null);
  breathEl.classList.remove('on');
}

/* =========================================================
   Fenêtre : plein écran, notifications, écran allumé
   ========================================================= */

let weWentFullscreen = false, fullscreenPending = false;

function enterFullscreen() {
  if (!S.fullscreenOnBreak || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen()
    .then(() => { weWentFullscreen = true; fullscreenPending = false; })
    // Sans geste de l'utilisateur, le navigateur refuse : on réessaie au prochain toucher.
    .catch(() => { fullscreenPending = true; });
}

function leaveFullscreen() {
  fullscreenPending = false;
  if (weWentFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  weWentFullscreen = false;
}

function askNotifyPermission() {
  if (S.notifyOn && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

async function notify(title, text) {
  if (!S.notifyOn || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body: text, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'projetfocus', renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, opts); else new Notification(title, opts);
  } catch { /* notifications indisponibles */ }
}

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && S.keepAwake && 'wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch { /* refusé */ }
}

const chime = () => audio.chime(S.chime, S.chimeVol / 100);

/* =========================================================
   Son : radio + bruit de fond
   ========================================================= */

const selStation = $('#sel-station'), selNoise = $('#sel-noise');
const volMusic = $('#vol-music'), volNoise = $('#vol-noise');

function allStations() {
  const own = S.customLinks.map((line, i) => {
    const [name, url] = line.includes('|') ? line.split('|').map((x) => x.trim()) : ['Lien ' + (i + 1), line.trim()];
    return { id: 'perso' + i, group: 'Mes liens', name: name || 'Lien ' + (i + 1), url, desc: 'perso' };
  }).filter((s) => /^https?:\/\//i.test(s.url));
  return [...STATIONS.map((s) => (s.kind === 'tracks' ? { ...s, tracks: PLAYLISTS[s.id].tracks } : s)), ...own];
}

const isStreamable = (url) => !/youtube\.com|youtu\.be|spotify\.com|deezer\.com|soundcloud\.com|music\.apple\.com|somafm\.com\/[a-z]/i.test(url);
const kindOf = (st) => st.kind || (isStreamable(st.url) ? 'stream' : 'link');

function fillSelect(sel, items, value, none) {
  sel.innerHTML = '';
  if (none) sel.add(new Option(none, 'none'));
  const groups = {};
  for (const it of items) {
    let parent = sel;
    if (it.group) {
      parent = groups[it.group] ||= sel.appendChild(Object.assign(document.createElement('optgroup'), { label: it.group }));
    }
    parent.appendChild(new Option(it.name, it.id));
  }
  sel.value = [...sel.options].some((o) => o.value === value) ? value : sel.options[0]?.value;
}

function onBreak() { return T.phase === 'break'; }

function applyAudioLevels(fadeMs = 1500) {
  const brk = onBreak();
  if (brk && audio.breakMode === 'calme') audio.setLiftLevel(S.musicVolBreak / 100);
  else if (!(brk && audio.breakMode === 'silence')) audio.setMusicLevel((brk ? S.musicVolBreak : S.musicVolWork) / 100, fadeMs);
  let noise = S.noiseVol / 100;
  if (brk && S.duckNoise) noise *= S.musicVolWork > 0 ? Math.min(1, S.musicVolBreak / S.musicVolWork) : 0;
  audio.setNoiseLevel(noise);
  volMusic.value = brk ? S.musicVolBreak : S.musicVolWork;
  volMusic.setAttribute('aria-label', brk ? 'Volume de la musique de pause' : 'Volume de la musique');
  volMusic.title = brk ? 'Volume de la musique de pause' : 'Volume de la musique';
  volNoise.value = S.noiseVol;
}

function playSelectedStation(resume) {
  const st = allStations().find((s) => s.id === selStation.value);
  if (!st) return;
  if (kindOf(st) === 'link') {
    // SomaFM refuse ses flux lus depuis un autre site : on ouvre son lecteur officiel.
    window.open(st.url, '_blank', 'noopener');
    $('#now-playing').textContent = 'Ouvert dans un onglet.';
    return;
  }
  audio.playStation({ ...st, kind: kindOf(st) }, resume);
  applyAudioLevels(0);
}

// Musique de pause : 'calme', 'same', 'silence', ou l'identifiant d'une playlist / radio.
const PAUSE_MODES = [
  { id: 'calme', name: 'Musique douce (générée)', desc: 'générée par l’appli, sans Internet' },
  { id: 'same', name: 'Même musique que le focus', desc: 'ta musique du focus, plus bas' },
  { id: 'silence', name: 'Silence', desc: 'pas de musique pendant la pause' },
];
const pauseChoices = () => [
  ...PAUSE_MODES.map((m) => ({ ...m, group: 'Pendant la pause' })),
  ...shownStations().filter((st) => kindOf(st) !== 'link'),
];

function pauseAudio() {
  const v = S.breakMusic;
  const level = S.musicVolBreak / 100;
  if (PAUSE_MODES.some((m) => m.id === v)) { audio.enterBreak(v, level); return; }
  const st = allStations().find((x) => x.id === v && kindOf(x) !== 'link');
  if (st) audio.enterBreak('station', level, { ...st, kind: kindOf(st) });
  else audio.enterBreak('calme', level);
}

function renderPlayer() {
  const on = audio.musicOn;
  const brk = onBreak();
  if ($('#sel-pause').value !== S.breakMusic) $('#sel-pause').value = S.breakMusic;
  $('#btn-music').classList.toggle('playing', on);
  $('#btn-music').setAttribute('aria-label', on ? 'Couper la musique' : 'Lancer la musique');
  const st = audio.station;
  const np = $('#now-playing');
  np.innerHTML = '';
  const mode = brk ? audio.breakMode : null;
  if (mode === 'calme' || mode === 'silence' || (mode === 'same' && !audio.memo?.on)) {
    np.textContent = mode === 'calme' ? 'Musique douce, générée par l’appli · ta musique reprend après la pause'
      : mode === 'silence' ? 'Silence · ta musique reprend après la pause'
        : 'Rien ne jouait pendant le focus';
  } else if (audio.musicState === 'error') np.textContent = st?.kind === 'tracks' ? 'Morceaux indisponibles hors ligne.' : 'Radio injoignable (hors ligne ?)';
  else if (audio.musicState === 'loading') np.textContent = 'Connexion…';
  else if (on && audio.track) {
    np.append(`${audio.track.title} · HoliznaCC0 `);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'link';
    b.textContent = 'suivant';
    b.addEventListener('click', () => audio.nextTrack());
    np.appendChild(b);
  } else if (on && st) np.textContent = st.desc;
  if (on && 'mediaSession' in navigator && window.MediaMetadata) {
    const title = audio.track ? audio.track.title : st?.name || 'projetfocus';
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist: audio.track ? 'HoliznaCC0' : st?.desc || '', album: 'projetfocus' });
  }
  renderNoiseSwitch();
  saveAudio();
}
audio.onchange = renderPlayer;

// Dernière musique et dernier bruit choisis, et s'ils jouaient : retrouvés au prochain lancement.
const LS_AUDIO = 'projetfocus.audio';
const savedAudio = (() => { try { return JSON.parse(localStorage.getItem(LS_AUDIO)) || {}; } catch { return {}; } })();
let audioTouched = false; // tant que rien n'a été touché, on ne remplace pas le souvenir
// Interrupteur du bruit de fond : coupe le bruit sans perdre le bruit choisi.
let noiseOn = savedAudio.noiseOn ?? true;

// Même bouton lecture / pause que la musique : il montre si le bruit joue vraiment.
function renderNoiseSwitch() {
  const b = $('#btn-noise');
  const playing = audio.noiseId !== 'none';
  b.classList.toggle('playing', playing);
  b.setAttribute('aria-label', playing ? 'Couper le bruit de fond' : 'Lancer le bruit de fond');
}

function applyNoise() {
  applyAudioLevels(0);
  audio.setNoise(noiseOn ? selNoise.value : 'none');
  renderNoiseSwitch();
  saveAudio();
}

function saveAudio() {
  if (!audioTouched) return;
  try {
    localStorage.setItem(LS_AUDIO, JSON.stringify({
      station: selStation.value,
      noise: selNoise.value,
      noiseOn,
      // Morceau de la playlist et position, pour reprendre exactement au même endroit.
      // En pause, on garde la musique du focus, pas celle de la pause.
      ...(audio.focusTrack
        ? { playing: audio.focusTrack.on, track: audio.focusTrack.file, time: Math.floor(audio.focusTrack.time) }
        : { playing: audio.musicOn, track: audio.track?.file || null, time: audio.track ? Math.floor(audio.music.currentTime) : 0 }),
    }));
  } catch { /* stockage indisponible */ }
}

$('#btn-music').addEventListener('click', () => {
  audioTouched = true;
  audio.ensure();
  if (audio.musicOn) audio.stopMusic(); else playSelectedStation();
});

// Choisir une musique la lance tout de suite.
selStation.addEventListener('change', () => {
  audioTouched = true;
  audio.ensure();
  if (selStation.value === 'none') audio.stopMusic(); else playSelectedStation();
  renderPlayer();
});

// Menu du lecteur pendant la pause : choisit la musique de pause (retenue pour les suivantes).
$('#sel-pause').addEventListener('change', (e) => {
  audioTouched = true;
  audio.ensure();
  S.breakMusic = e.target.value;
  saveSettings(); syncForm();
  if (onBreak()) { pauseAudio(); applyAudioLevels(0); }
  renderPlayer();
});

selNoise.addEventListener('change', () => {
  audioTouched = true;
  if (selNoise.value !== 'none') noiseOn = true; // choisir un bruit le rallume
  applyNoise();
});

volMusic.addEventListener('input', () => {
  const v = Number(volMusic.value);
  if (onBreak()) S.musicVolBreak = v; else S.musicVolWork = v;
  applyAudioLevels(0);
  saveSettings(); syncForm();
});

volNoise.addEventListener('input', () => {
  S.noiseVol = Number(volNoise.value);
  applyAudioLevels(0);
  saveSettings(); syncForm();
});

// Même nom de cache que dans sw.js.
const MUSIC_CACHE = 'projetfocus-music-v1';
const trackUrl = (t) => new URL(t.file, location.href).href;

// Bibliothèque hors ligne : chaque playlist se télécharge ou se retire d'un coup.
async function libraryStatus() {
  const box = $('#library');
  if (!('caches' in window)) { box.textContent = 'Ce navigateur ne peut pas garder la musique hors ligne.'; return; }
  const cache = await caches.open(MUSIC_CACHE);
  for (const [id, pl] of Object.entries(PLAYLISTS)) {
    let n = 0;
    for (const t of pl.tracks) if (await cache.match(trackUrl(t))) n++;
    const row = box.querySelector(`[data-pl="${id}"]`);
    if (!row || row.classList.contains('busy')) continue;
    row.querySelector('small').textContent = `${n}/${pl.tracks.length} morceaux sur l'appareil · ${pl.size} Mo en tout`;
    row.querySelector('.dl').hidden = n === pl.tracks.length;
    row.querySelector('.rm').hidden = n === 0;
  }
}

function buildLibrary() {
  $('#library').innerHTML = Object.entries(PLAYLISTS).map(([id, pl]) => `
    <div class="lib-row" data-pl="${id}">
      <span>${pl.name}<small></small></span>
      <span class="pair"><button type="button" class="link dl">Télécharger</button><button type="button" class="link rm">Retirer</button></span>
    </div>`).join('');
}

$('#library').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  const row = e.target.closest('.lib-row');
  if (!btn || !row || !('caches' in window)) return;
  const pl = PLAYLISTS[row.dataset.pl];
  const cache = await caches.open(MUSIC_CACHE);
  if (btn.classList.contains('rm')) {
    for (const t of pl.tracks) await cache.delete(trackUrl(t));
    libraryStatus();
    return;
  }
  row.classList.add('busy');
  btn.disabled = true;
  const info = row.querySelector('small');
  try {
    let k = 0;
    for (const t of pl.tracks) {
      info.textContent = `Téléchargement… ${++k}/${pl.tracks.length}`;
      if (!(await cache.match(trackUrl(t)))) await cache.add(trackUrl(t));
    }
  } catch {
    info.textContent = 'Téléchargement interrompu (connexion ?)';
  }
  row.classList.remove('busy');
  btn.disabled = false;
  libraryStatus();
});

function autoStartAudio() {
  if (!S.autoStartAudio) return;
  if (!audio.musicOn && selStation.value && selStation.value !== 'none') {
    const st = allStations().find((s) => s.id === selStation.value);
    if (st && kindOf(st) !== 'link') playSelectedStation();
  }
  if (noiseOn && selNoise.value !== 'none' && audio.noiseId !== selNoise.value) audio.setNoise(selNoise.value);
}

$('#btn-noise').addEventListener('click', () => {
  audioTouched = true;
  audio.ensure();
  noiseOn = audio.noiseId === 'none'; // en lecture : on coupe ; coupé : on relance
  applyNoise();
});

/* =========================================================
   Phases
   ========================================================= */

function startFocus(afterBreak) {
  T.phase = 'focus';
  T.afterBreak = afterBreak;
  T.breakEnded = false;
  T.resumeAt = 0;
  T.isLong = false;
  T.total = S.focusMin * 60;
  T.endAt = Date.now() + T.total * 1000;
  T.pausedRemaining = null;
  leaveFullscreen();
  keepAwake(true);
  audio.leaveBreak(S.musicVolWork / 100);
  applyAudioLevels();
  startMessages();
  render(true);
}

function startBreak(fromTimer) {
  T.phase = 'break';
  T.breakEnded = false;
  T.isLong = S.longBreakOn && T.cycle % S.longBreakEvery === 0;
  T.total = (T.isLong ? S.longBreakMin : S.breakMin) * 60;
  T.endAt = Date.now() + T.total * 1000;
  T.pausedRemaining = null;
  T.resumeAt = 0;
  T.breakColor = S.breakColorRandom ? pick(BREAK_COLORS, T.breakColor) : S.breakColor;
  pickCoach();
  pauseAudio();
  applyAudioLevels();
  enterFullscreen();
  if (fromTimer) {
    chime();
    notify(T.isLong ? 'Pause longue' : 'C’est l’heure de la pause', T.coach[0] || 'Lève-toi un moment.');
  }
  renderCoach(); showCoach();
  render(true);
}

const lastCycle = () => S.cycles > 0 && T.cycle >= S.cycles;

function breakTimeUp() {
  audio.chime(S.chime, S.chimeVol / 100, S.endDings);
  if (lastCycle()) { finishSeries(); notify('Série terminée', 'Belle séance. Pense à t’arrêter pour de vrai.'); return; }
  T.breakEnded = true;
  // Reprise automatique : on laisse sonner les « ding », puis quelques secondes.
  T.resumeAt = S.autoChain ? Date.now() + S.autoChainDelay * 1000 : 0;
  if (S.autoChain) notify('On reprend', `Nouveau focus dans ${S.autoChainDelay} s.`);
  else notify('La pause est finie', 'Reviens quand tu veux.');
  showCoach();
  render(true);
}

function resumeFromBreak() {
  if (T.phase !== 'break') return;
  if (lastCycle()) { finishSeries(); return; }
  T.cycle++;
  startFocus(true);
}

function finishSeries() {
  T.phase = 'done';
  T.breakEnded = false;
  T.resumeAt = 0;
  leaveFullscreen();
  keepAwake(false);
  audio.leaveBreak(S.musicVolWork / 100);
  applyAudioLevels();
  showText('Belle série. Prends soin de toi.');
  render(true);
}

function resetAll() {
  T.phase = 'idle';
  T.cycle = 1;
  T.pausedRemaining = null;
  T.breakEnded = false;
  T.resumeAt = 0;
  T.afterBreak = false;
  leaveFullscreen();
  keepAwake(false);
  audio.stopAll(); // « Arrêter » coupe tout ; « Démarrer » relancera musique et bruit
  applyAudioLevels();
  showText('');
  render(true);
}

function togglePauseFocus() {
  if (T.phase !== 'focus') return;
  if (T.pausedRemaining == null) {
    T.pausedRemaining = remaining();
  } else {
    T.endAt = Date.now() + T.pausedRemaining * 1000;
    T.pausedRemaining = null;
  }
  render(true);
}

/* =========================================================
   Boutons
   ========================================================= */

$('#btn-start').addEventListener('click', () => {
  audio.ensure();
  if (T.phase === 'idle' || T.phase === 'done') {
    audioTouched = true;
    askNotifyPermission();
    T.cycle = 1;
    autoStartAudio();
    startFocus(false);
  } else if (T.phase === 'focus') {
    togglePauseFocus();
  }
});

$('#btn-skip').addEventListener('click', () => { if (T.phase === 'focus') startBreak(false); });
$('#btn-stop').addEventListener('click', resetAll);
$('#btn-stop-break').addEventListener('click', resetAll);
$('#btn-done').addEventListener('click', resumeFromBreak);

$('#edit-focus').addEventListener('click', () => { T.editing = 'focus'; render(true); });
$('#edit-break').addEventListener('click', () => { T.editing = 'break'; render(true); });

$$('[data-preset]').forEach((b) => b.addEventListener('click', () => {
  const [f, p] = b.dataset.preset.split('/').map(Number);
  S.focusMin = f; S.breakMin = p;
  saveSettings(); syncForm(); render(true);
}));

$('#cyc-minus').addEventListener('click', () => { S.cycles = clamp(S.cycles - 1, 0, 20); saveSettings(); syncForm(); render(true); });
$('#cyc-plus').addEventListener('click', () => { S.cycles = clamp(S.cycles + 1, 0, 20); saveSettings(); syncForm(); render(true); });

// Maintenir pour reprendre avant la fin : un geste volontaire.
const btnHold = $('#btn-hold');
let holdT0 = 0, holdRaf = 0, holdTimer = 0;

function holdBegin() {
  if (T.phase !== 'break' || holdT0) return;
  holdT0 = performance.now();
  btnHold.classList.add('holding');
  // Le minuteur décide ; l'animation ne fait qu'afficher la progression.
  holdTimer = setTimeout(() => { holdEnd(); resumeFromBreak(); }, S.holdSeconds * 1000);
  const step = () => {
    btnHold.style.setProperty('--p', Math.min(1, (performance.now() - holdT0) / (S.holdSeconds * 1000)));
    holdRaf = requestAnimationFrame(step);
  };
  holdRaf = requestAnimationFrame(step);
}

function holdEnd() {
  clearTimeout(holdTimer);
  cancelAnimationFrame(holdRaf);
  holdT0 = 0;
  btnHold.classList.remove('holding');
  btnHold.style.setProperty('--p', 0);
}

btnHold.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try { btnHold.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
  holdBegin();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => btnHold.addEventListener(ev, holdEnd));
btnHold.addEventListener('contextmenu', (e) => e.preventDefault());
btnHold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holdBegin(); } });
btnHold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') holdEnd(); });
btnHold.addEventListener('click', (e) => e.preventDefault());

/* =========================================================
   Contrôles qui apparaissent puis s'effacent
   ========================================================= */

let uiTimer = 0;
const canHover = matchMedia('(hover: hover)').matches;

function poke() {
  body.classList.add('ui');
  clearTimeout(uiTimer);
  uiTimer = setTimeout(hideUi, S.controlsDelay * 1000);
}

function hideUi() {
  const busy = settingsOpen || dragging ||
    (document.activeElement?.closest('.ctl') && /^(SELECT|INPUT)$/.test(document.activeElement.tagName)) ||
    (canHover && $$('.ctl').some((el) => el.matches(':hover')));
  if (busy) { poke(); return; }
  body.classList.remove('ui');
}

let lastMove = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  if (Math.abs(e.clientX - lastMove.x) + Math.abs(e.clientY - lastMove.y) < 4) return;
  lastMove = { x: e.clientX, y: e.clientY };
  poke();
});
window.addEventListener('pointerdown', (e) => {
  poke();
  if (fullscreenPending && T.phase === 'break') enterFullscreen();
}, true);
window.addEventListener('keydown', (e) => {
  poke();
  if (settingsOpen) { if (e.key === 'Escape') closeSettings(); return; }
  const free = e.target === body || e.target === dial;
  if (e.key === ' ' && free && (T.phase === 'idle' || T.phase === 'focus' || T.phase === 'done')) {
    e.preventDefault();
    $('#btn-start').click();
  }
});

/* =========================================================
   Panneau Paramètres
   ========================================================= */

const sheet = $('#settings');
let settingsOpen = false;

function openSettings() {
  settingsOpen = true;
  syncForm();
  libraryStatus();
  sheet.inert = false;
  sheet.classList.add('open');
  body.classList.add('ui');
  $('#btn-close').focus();
}

function closeSettings() {
  settingsOpen = false;
  sheet.classList.remove('open');
  sheet.inert = true;
  $('#btn-settings').focus();
  poke();
}

$('#btn-settings').addEventListener('click', openSettings);

// Une seule section ouverte à la fois : le panneau reste court.
sheet.addEventListener('toggle', (e) => {
  const d = e.target;
  if (!d.classList?.contains('sec') || !d.open) return;
  for (const other of $$('details.sec', sheet)) if (other !== d) other.open = false;
}, true);
$('#btn-close').addEventListener('click', closeSettings);

function getPath(path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), S); }
function setPath(path, v) {
  const keys = path.split('.');
  const last = keys.pop();
  const o = keys.reduce((acc, k) => acc[k], S);
  o[last] = v;
}

function buildForm() {
  $('#day-colors').innerHTML = S.dayColors.map((p, i) => `
    <div class="day-row">
      <input type="text" data-k="dayColors.${i}.name" aria-label="Nom du moment">
      <input type="time" data-k="dayColors.${i}.hour" aria-label="Heure de début">
      <input type="color" data-k="dayColors.${i}.color" aria-label="Couleur">
    </div>`).join('');

  $('#msg-cats').innerHTML = MESSAGE_POOLS.filter((p) => p.cat).map((p) =>
    `<label>Catégorie « ${p.name} »<input type="checkbox" data-k="msgCats.${p.id}"></label>`).join('');

  $('#msg-pools').innerHTML = MESSAGE_POOLS.map((p) =>
    `<label class="block">${p.name} <small>un message par ligne</small><textarea data-k="messages.${p.id}" data-list rows="5"></textarea></label>`).join('');

  fillSelect($('#sel-chime'), CHIMES, S.chime);
  fillSelect($('#sel-breath'), BREATHS, S.breathPattern);
  fillSelect($('#sel-default-noise'), NOISES, S.defaultNoise);
  fillStationSelects();
}

// Seules les musiques cochées dans Paramètres apparaissent dans les menus.
const shownStations = () => allStations().filter((st) => !S.hiddenStations.includes(st.id));

function fillStationSelects() {
  fillSelect($('#sel-default-radio'), shownStations(), S.defaultRadio, 'Aucune');
  const cur = selStation.value || S.defaultRadio;
  fillSelect(selStation, shownStations(), cur, 'Pas de radio');
  fillSelect($('#sel-pause'), pauseChoices(), S.breakMusic);
  fillSelect($('#sel-pause-default'), pauseChoices(), S.breakMusic);
  buildStationPicks();
}

function buildStationPicks() {
  const box = $('#station-picks');
  let html = '', group = null;
  for (const st of allStations()) {
    if (st.group !== group) { group = st.group; html += `<p class="pick-group">${group || ''}</p>`; }
    const name = st.name.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    html += `<label class="pick">${name}<small>${st.desc || ''}</small><input type="checkbox" data-station="${st.id}"${S.hiddenStations.includes(st.id) ? '' : ' checked'}></label>`;
  }
  box.innerHTML = html;
}

$('#station-picks').addEventListener('change', (e) => {
  const id = e.target.dataset.station;
  if (!id) return;
  S.hiddenStations = S.hiddenStations.filter((x) => x !== id);
  if (!e.target.checked) S.hiddenStations.push(id);
  saveSettings();
  const cur = selStation.value;
  fillSelect($('#sel-default-radio'), shownStations(), S.defaultRadio, 'Aucune');
  fillSelect(selStation, shownStations(), cur, 'Pas de radio');
  fillSelect($('#sel-pause'), pauseChoices(), S.breakMusic);
  fillSelect($('#sel-pause-default'), pauseChoices(), S.breakMusic);
  // Une musique décochée qui jouait continue jusqu'au prochain choix.
  if (audio.musicOn && audio.station && !e.target.checked && audio.station.id === id) {
    selStation.add(new Option(audio.station.name, id), 1);
    selStation.value = id;
  }
});

function syncForm() {
  for (const el of $$('[data-k]', sheet)) {
    const v = getPath(el.dataset.k);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.hasAttribute('data-list')) { if (document.activeElement !== el) el.value = (v || []).join('\n'); }
    else el.value = v;
    const out = el.parentElement.querySelector('output');
    if (out) out.textContent = el.value;
  }
}

function readInput(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.hasAttribute('data-list')) return el.value.split('\n').map((x) => x.trim()).filter(Boolean);
  if (el.type === 'number' || el.type === 'range') {
    const n = Number(el.value);
    if (el.value === '' || Number.isNaN(n)) return undefined;
    return clamp(n, Number(el.min || -Infinity), Number(el.max || Infinity));
  }
  return el.value;
}

sheet.addEventListener('input', (e) => onField(e.target, false));
sheet.addEventListener('change', (e) => onField(e.target, true));

function onField(el, committed) {
  if (!el.dataset?.k) return;
  const v = readInput(el);
  if (v === undefined) return;
  if (el.type === 'time' && !v) return;
  setPath(el.dataset.k, v);
  const out = el.parentElement.querySelector('output');
  if (out) out.textContent = el.value;
  if (committed && el.type === 'number') el.value = v;
  saveSettings();
  if (el.dataset.k === 'customLinks') fillStationSelects();
  if (el.dataset.k === 'notifyOn' && v) askNotifyPermission();
  if (el.dataset.k === 'breakMusic' && onBreak()) pauseAudio();
  applySettings();
}

$('#btn-test-chime').addEventListener('click', () => { audio.ensure(); chime(); });

$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'projetfocus-parametres.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  note('Fichier exporté : projetfocus-parametres.json');
});

$('#btn-import').addEventListener('click', () => $('#file-import').click());
$('#file-import').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const keepId = S.syncClientId;
    S = sanitize(merge(DEFAULTS, JSON.parse(await f.text())));
    S.syncClientId ||= keepId;
    saveSettings(); buildForm(); syncForm(); applySettings();
    note('Paramètres importés.');
  } catch {
    note('Ce fichier n’est pas un export de projetfocus.');
  }
});

$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Revenir aux valeurs par défaut ? Tes réglages actuels seront remplacés.')) return;
  S = { ...clone(DEFAULTS), syncClientId: S.syncClientId }; // la connexion Google reste
  saveSettings(); buildForm(); syncForm(); applySettings();
  note('Valeurs par défaut rétablies.');
});

function note(text) { $('#save-note').textContent = text; }

/* =========================================================
   Synchronisation avec Google Drive
   ========================================================= */

var sync = createSync({
  getSettings: () => S,
  // « Reprendre » : les paramètres du Drive remplacent ceux de cet appareil (copie gardée).
  applyRemote: (remote) => {
    try { localStorage.setItem(LS_BEFORE_SYNC, JSON.stringify(S)); } catch { /* stockage indisponible */ }
    if (undoBtn) undoBtn.hidden = false;
    const keepId = S.syncClientId;
    delete remote.savedAt;
    S = sanitize(merge(DEFAULTS, remote));
    S.syncClientId ||= keepId;
    saveSettings();
    buildForm(); syncForm(); applySettings();
    note('Paramètres repris depuis Google Drive.');
  },
  onStatus: ({ text, kind, connected }) => {
    $('#sync-status').textContent = text;
    $('#sync-status').dataset.kind = kind;
    const out = $('#btn-sync-out');
    if (out) out.hidden = !connected;
  },
});

$('#btn-sync-save')?.addEventListener('click', () => sync.save());
$('#btn-sync-load')?.addEventListener('click', () => {
  if (confirm('Reprendre les paramètres sauvegardés sur Google Drive ? Ceux de cet appareil seront remplacés (tu pourras revenir en arrière).')) sync.load();
});
$('#btn-sync-out')?.addEventListener('click', () => sync.disconnect());

// Revenir aux réglages de cet appareil d'avant la dernière reprise depuis le Drive.
// (Absent d'une ancienne page encore en cache : on s'en passe.)
const undoBtn = $('#btn-undo-sync');
if (undoBtn) undoBtn.hidden = !localStorage.getItem(LS_BEFORE_SYNC);
undoBtn?.addEventListener('click', () => {
  let before;
  try { before = JSON.parse(localStorage.getItem(LS_BEFORE_SYNC)); } catch { /* copie illisible */ }
  if (!before) return;
  if (!confirm('Remettre les réglages de cet appareil d’avant la dernière reprise depuis Google Drive ?')) return;
  const keepId = S.syncClientId;
  S = sanitize(merge(DEFAULTS, before));
  S.syncClientId ||= keepId;
  localStorage.removeItem(LS_BEFORE_SYNC);
  undoBtn.hidden = true;
  saveSettings(); buildForm(); syncForm(); applySettings();
  note('Réglages d’avant remis sur cet appareil.');
});

// Version de l'appli, et mise à jour forcée : on vide le cache du site (la musique gardée
// hors ligne reste) puis on recharge depuis le réseau.
const versionEl = $('#app-version');
if (versionEl) versionEl.textContent = 'Version du ' + APP_VERSION;
$('#btn-update')?.addEventListener('click', async () => {
  if (!navigator.onLine) { note('Pas de réseau : mise à jour impossible pour l’instant.'); return; }
  $('#btn-update').textContent = 'Mise à jour…';
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    await reg?.update();
  } catch { /* pas de service worker : le rechargement suffit */ }
  try {
    for (const k of await caches.keys()) if (!k.includes('music')) await caches.delete(k);
  } catch { /* cache indisponible */ }
  saveEverything();
  location.reload();
});

$('#btn-day-demo').addEventListener('click', startDayDemo);
// Un toucher pendant la démo l'arrête (sauf dans la première demi-seconde).
window.addEventListener('pointerdown', () => { if (demo && performance.now() - demo.t0 > 500) stopDayDemo(); });

/* =========================================================
   Affichage
   ========================================================= */

const els = {
  time: $('#time'), sub: $('#sub'), info: $('#info'), start: $('#btn-start'),
  vFocus: $('#v-focus'), vBreak: $('#v-break'), cyc: $('#cyc-val'),
};
let lastBg = '', lastTitle = '';

function fmt(sec) {
  const s = Math.ceil(sec - 0.001);
  if (S.timeFormat === 'min') return String(Math.ceil(s / 60));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function setText(el, t) { if (el.textContent !== t) el.textContent = t; }

function applySettings() {
  const st = document.documentElement.style;
  st.setProperty('--fg', S.textColor);
  st.setProperty('--dial', S.dialColor);
  if (breathOn) breathStop(); // nouveau rythme : render() la relance
  applyAudioLevels(300);
  if (T.phase === 'break') { renderCoach(); showCoach(); }
  if (T.phase === 'focus' && !S.messagesOn) showText('');
  if (T.phase === 'focus' && S.messagesOn && !msgEl.textContent) startMessages();
  render(true);
}

function render(force) {
  const rem = remaining();
  const p = T.phase;
  const day = dayAt();

  const classes = {
    'phase-idle': p === 'idle', 'phase-focus': p === 'focus', 'phase-break': p === 'break', 'phase-done': p === 'done',
    paused: T.pausedRemaining != null, 'break-ended': T.breakEnded,
    'edit-break': T.editing === 'break', 'fmt-min': S.timeFormat === 'min', 'no-info': !S.showInfo,
  };
  for (const [c, on] of Object.entries(classes)) body.classList.toggle(c, on);

  const wantBreath = p === 'break' && S.pulseOn && !T.breakEnded && !demo;
  if (wantBreath !== breathOn) { if (wantBreath) breathStart(); else breathStop(); }

  const bg = demo ? day.color : p === 'break' ? T.breakColor || S.breakColor : S.dayGradient ? day.color : S.fixedColor;
  if (bg !== lastBg) {
    lastBg = bg;
    document.documentElement.style.setProperty('--bg', bg);
    $('meta[name="theme-color"]').setAttribute('content', bg);
  }

  drawDial(p === 'idle' ? rem : p === 'done' ? 0 : rem);
  setText(els.time, p === 'done' ? 'terminé' : fmt(rem));

  let sub = '';
  if (p === 'idle') sub = T.editing === 'focus' ? 'focus' : 'pause';
  else if (p === 'focus') sub = T.pausedRemaining != null ? 'en pause' : 'focus';
  else if (p === 'break' && T.resumeAt) sub = `reprise dans ${Math.max(0, Math.ceil((T.resumeAt - Date.now()) / 1000))} s`;
  else if (p === 'break') sub = T.isLong ? 'pause longue' : 'pause';
  if (p === 'break' && breathOn && !T.resumeAt) {
    // Le rythme choisi, en court : « pause · cohérence cardiaque », « pause · 4-7-8 »…
    const b = BREATHS.find((x) => x.id === S.breathPattern) || BREATHS[0];
    sub += ' · ' + b.name.split(' (')[0].toLowerCase();
  }
  setText(els.sub, sub);

  if (force || p === 'idle') {
    setText(els.vFocus, String(S.focusMin));
    setText(els.vBreak, String(S.breakMin));
    setText(els.cyc, S.cycles === 0 ? 'sans fin' : `${S.cycles} cycle${S.cycles > 1 ? 's' : ''}`);
    $('#edit-focus').classList.toggle('on', T.editing === 'focus');
    $('#edit-break').classList.toggle('on', T.editing === 'break');
    setText(els.start, p === 'focus' ? (T.pausedRemaining != null ? 'Reprendre' : 'Pause') : p === 'done' ? 'Nouvelle série' : 'Démarrer');
    dial.setAttribute('aria-valuenow', String(T.editing === 'focus' ? S.focusMin : S.breakMin));
    dial.setAttribute('aria-label', p === 'idle' ? `Durée ${T.editing === 'focus' ? 'du focus' : 'de la pause'} en minutes` : 'Temps restant');
  }

  const count = S.cycles > 0 ? `${T.cycle}/${S.cycles}` : `${T.cycle}`;
  let info = day.name;
  if (p === 'idle') info += ` · focus ${S.focusMin} · pause ${S.breakMin}`;
  else if (p === 'focus') info += ` · focus · ${count}`;
  else if (p === 'break') info += ` · ${T.isLong ? 'pause longue' : 'pause'} · ${count}`;
  else info += ' · série terminée';
  if (demo) {
    const d = colorClock();
    info = `démo · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${day.name} · touche pour arrêter`;
  }
  setText(els.info, info);

  const title = p === 'idle' ? 'projetfocus' : p === 'done' ? 'Série terminée · projetfocus' : `${fmt(rem)} · ${sub} · projetfocus`;
  if (title !== lastTitle) { lastTitle = title; document.title = title; }
}

// Tout est gardé avant que la page se ferme, passe en arrière-plan ou s'endorme.
function saveEverything() {
  saveSettings(false);
  saveAudio();
}
window.addEventListener('pagehide', saveEverything);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveEverything(); });
setInterval(saveAudio, 5000); // la position dans le morceau, au cas où la page serait tuée

// Compte à rebours sonore : un ding toutes les 2 s à partir de 10 s, puis chaque seconde.
const COUNTDOWN_AT = [10, 8, 6, 5, 4, 3, 2, 1];
let lastCountdown = null;

function countdownTick() {
  const on = (T.phase === 'break' && !T.breakEnded && S.countdownBreak) ||
    (T.phase === 'focus' && T.pausedRemaining == null && S.countdownFocus);
  if (!on) { lastCountdown = null; return; }
  const left = Math.ceil(remaining());
  if (left === lastCountdown || !COUNTDOWN_AT.includes(left)) return;
  // On ne rattrape pas un ding manqué (onglet endormi) : seulement si on est pile dans la seconde.
  if (remaining() < left - 0.6) return;
  lastCountdown = left;
  if (S.countdownSound === 'ding') audio.countdownDing(S.chimeVol / 100, (10 - left) / 9);
  else audio.tick(S.chimeVol / 100, COUNTDOWN_AT.indexOf(left) % 2 === 0); // tic, tac, tic…
}

function tick() {
  countdownTick();
  if (T.phase === 'focus' && T.pausedRemaining == null && remaining() <= 0) startBreak(true);
  else if (T.phase === 'break' && !T.breakEnded && remaining() <= 0) breakTimeUp();
  else if (T.phase === 'break' && T.resumeAt && Date.now() >= T.resumeAt) resumeFromBreak();
  messagesTick();
  render(false);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    tick();
    if (T.phase === 'focus' || T.phase === 'break') keepAwake(true);
  }
});

/* =========================================================
   Démarrage
   ========================================================= */

buildForm();
buildLibrary();
syncForm();
fillSelect(selNoise, NOISES, savedAudio.noise ?? S.defaultNoise);
renderNoiseSwitch();
const firstStation = savedAudio.station ?? S.defaultRadio;
selStation.value = [...selStation.options].some((o) => o.value === firstStation) ? firstStation : 'none';
// Recharger la page repart de zéro : minuteur arrêté, aucun son ; seuls les réglages
// (et les choix de musique / bruit) sont relus. L'ancienne sauvegarde du minuteur est effacée.
try { localStorage.removeItem('projetfocus.state'); } catch { /* rien */ }
applySettings();
sync.start();
if (T.phase === 'focus') startMessages();
if (T.phase === 'break') { renderCoach(); showCoach(); }
renderPlayer();
render(true);
poke();
setInterval(tick, 250);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Petit accès pour les tests manuels depuis la console du navigateur.
window.projetfocus = { T, get S() { return S; }, audio, dayAt, startBreak, breakTimeUp, startFocus, render };
