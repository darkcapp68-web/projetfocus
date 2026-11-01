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
const APP_VERSION = '01/11/2026 · 14h26';
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
  s.hiddenStations = s.hiddenStations.filter((x) => typeof x === 'string');
  s.hiddenLooks = s.hiddenLooks.filter((x) => typeof x === 'string');
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
    s.hiddenStations = STATIONS.map((st) => st.id)
      .filter((id) => !SHOWN_STATIONS.includes(id));
    s.defaultRadio = 'tlminimal';
    s.version = 7;
  }
  // Version 8 : l'ID client Google est fourni par l'appli (plus rien à coller).
  if (s.version < 8) { if (!s.syncClientId) s.syncClientId = DEFAULTS.syncClientId; s.version = 8; }
  // Version 9 : les contrôles restent 10 s au lieu de 4 (trop court au doigt).
  if (s.version < 9) { if (s.controlsDelay === 4) s.controlsDelay = 10; s.version = 9; }
  // Version 10 : les styles « liquide » et « orbites » deviennent le mode « rêveur ».
  if (s.version < 10) { if (s.dialStyle !== 'standard') s.dialStyle = 'reveur'; s.version = 10; }
  // Version 11 : la respiration se voit par le mot qui grandit, l'écran ne bouge plus
  // (au choix : les couleurs, les deux, ou un voile sombre).
  if (s.version < 11) { s.breathShow = 'word'; s.version = 11; }
  // Version 12 : le mode « Brisure » est mis de côté ; ceux qui l'avaient (même par un import
  // ou le Drive) repassent en Normal.
  if (s.dialStyle === 'brisure') s.dialStyle = 'standard';
  if (s.version < 12) s.version = 12;
  // Version 13 : nouvelles radios techno / ambient (cochées, rien à faire : seules les
  // radios listées dans hiddenStations sont masquées) ; celles de Radio Record arrivent décochées.
  if (s.version < 13) {
    for (const id of ['rectechno', 'recminimal', 'recambient']) if (!s.hiddenStations.includes(id)) s.hiddenStations.push(id);
    s.version = 13;
  }
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

const dial = $('#dial'), arc = $('#arc'), knob = $('#knob'), liquidLevel = $('#liquid-level');
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
  // Niveau liquide : plein à 60 min, vide à 0 (le cercle va de y = 25 à y = 275).
  if (liquidLevel) liquidLevel.style.transform = `translateY(${275 - (min / 60) * 250}px)`;
  drawTimebar(sec);
}

// Paysage : la barre du temps avance vers la droite (vide au repos, pleine à la fin de la
// phase), avec les minutes qui restent au bout.
const timebar = $('#timebar'), timebarLeft = $('#timebar .left');
function drawTimebar(sec) {
  const running = T.phase === 'focus' || T.phase === 'break';
  const p = running ? clamp(1 - sec / (T.total || 1), 0, 1) : T.phase === 'done' ? 1 : 0;
  timebar.style.setProperty('--tp', p.toFixed(4));
  const left = `${Math.ceil(Math.max(0, sec) / 60)} min`;
  if (timebarLeft.textContent !== left) timebarLeft.textContent = left;
}

/* ---------- Mode rêveur : système solaire (focus) et vague (pause) ---------- */

// Forme « atome » : chaque planète a son orbite dans un plan différent (inclinées de 68°,
// réparties sur 180°), vue un peu d'en haut ; l'ensemble tourne lentement sur lui-même
// (un tour en 2 min). Une planète passe devant le soleil quand elle vient vers nous (plus
// grosse), derrière sinon. Une seule trajectoire est tracée : elle change chaque minute.
// Couleurs approchant les vraies ; périodes ralenties pour rester calme.
const PLANETS = [
  { r: 28, size: 1.8, color: '#a8a39d', period: 14 },  // Mercure
  { r: 40, size: 2.6, color: '#e8cf9c', period: 24 },  // Vénus
  { r: 52, size: 2.8, color: '#4a8fd8', period: 36 },  // Terre
  { r: 63, size: 2.2, color: '#c8532a', period: 60 },  // Mars
  { r: 79, size: 5.6, color: '#d9b38c', period: 140 }, // Jupiter
  { r: 94, size: 4.8, color: '#e6c97f', period: 230, ring: true }, // Saturne
  { r: 106, size: 3.4, color: '#9fe0e6', period: 420 }, // Uranus
  { r: 117, size: 3.3, color: '#4466d8', period: 700 }, // Neptune
];
const INC = 68 * Math.PI / 180, PITCH = 18 * Math.PI / 180, SPIN = 120; // s par tour
const solarBack = $('#solar-back'), solarFront = $('#solar-front');
let solarOn = false;

(function buildSolar() {
  if (!solarBack) return;
  const ns = 'http://www.w3.org/2000/svg';
  PLANETS.forEach((pl, i) => {
    pl.node = (i * 180 / PLANETS.length) * Math.PI / 180;
    pl.phase = i * 1.7; // départs étalés
    pl.path = document.createElementNS(ns, 'path');
    $('#solar-orbits').appendChild(pl.path);
    const g = document.createElementNS(ns, 'g');
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('r', pl.size); c.setAttribute('fill', pl.color);
    g.appendChild(c);
    if (pl.ring) {
      const ring = document.createElementNS(ns, 'ellipse');
      ring.setAttribute('rx', pl.size * 2.2); ring.setAttribute('ry', pl.size * 0.7);
      ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', pl.color);
      ring.setAttribute('stroke-width', 1.1); ring.setAttribute('opacity', 0.85);
      ring.setAttribute('transform', 'rotate(-14)');
      g.appendChild(ring);
    }
    pl.el = g;
    solarBack.appendChild(g);
  });
})();

// Point de l'orbite (angle a) projeté à l'écran, avec sa profondeur (z > 0 : vers nous).
function atomPoint(pl, a, yaw) {
  const ox = pl.r * Math.cos(a), oy = pl.r * Math.sin(a);
  const y0 = oy * Math.cos(INC), z0 = oy * Math.sin(INC);
  const x1 = ox * Math.cos(pl.node) - y0 * Math.sin(pl.node), y1 = ox * Math.sin(pl.node) + y0 * Math.cos(pl.node);
  const x2 = x1 * Math.cos(yaw) + z0 * Math.sin(yaw), z2 = -x1 * Math.sin(yaw) + z0 * Math.cos(yaw);
  return { x: 150 + x2, y: 150 + y1 * Math.cos(PITCH) - z2 * Math.sin(PITCH), z: y1 * Math.sin(PITCH) + z2 * Math.cos(PITCH) };
}

let litOrbit = -1;
function drawSolar() {
  if (!solarOn) return;
  const t = Date.now() / 1000;
  const yaw = (t / SPIN) * 2 * Math.PI;
  const lit = Math.floor(Date.now() / 60000) % PLANETS.length; // une trajectoire par minute
  PLANETS.forEach((pl, i) => {
    const q = atomPoint(pl, pl.phase + (t / pl.period) * 2 * Math.PI, yaw);
    pl.el.setAttribute('transform', `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)}) scale(${(1 + 0.25 * q.z / 120).toFixed(3)})`);
    const want = q.z > 0 ? solarFront : solarBack;
    if (pl.el.parentNode !== want) want.appendChild(pl.el);
    if (i === lit) {
      let d = '';
      for (let k = 0; k <= 72; k++) {
        const p = atomPoint(pl, (k / 72) * 2 * Math.PI, yaw);
        d += (k ? ' L ' : 'M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
      }
      pl.path.setAttribute('d', d);
    }
    if (i === lit && litOrbit !== lit) pl.path.classList.add('lit');
    else if (i !== lit) pl.path.classList.remove('lit');
  });
  litOrbit = lit;
  // Comète : part du bord au début du focus et atteint le soleil à la fin.
  const p = T.phase === 'focus' && T.total ? clamp(1 - remaining() / T.total, 0, 1) : 0;
  const d = 124 - p * 112, ang = (-40 + p * 70) * Math.PI / 180;
  const hx = 150 + d * Math.cos(ang), hy = 150 + d * Math.sin(ang);
  const ux = (hx - 150) / d, uy = (hy - 150) / d; // la queue pointe à l'opposé du soleil
  const len = 14 + 20 * p, w = 2;
  $('#comet-head').setAttribute('cx', hx.toFixed(2)); $('#comet-head').setAttribute('cy', hy.toFixed(2));
  $('#comet-tail').setAttribute('d', `M ${hx - uy * w} ${hy + ux * w} L ${hx + ux * len} ${hy + uy * len} L ${hx + uy * w} ${hy - ux * w} Z`);
  requestAnimationFrame(drawSolar);
}

/* ---------- Mode « Brisure » : un éclair ou une fissure se ramifie depuis le centre ---------- */

// À chaque focus, un nouveau tracé tiré au hasard (graine) part du centre du cadran en 6 à 9
// branches, qui se ramifient au hasard en chemin et poussent en continu, à vitesse constante
// (version 1, la plus fluide : les essais « 2 traits qui se divisent à chaque minute » étaient
// saccadés). Un trait qui touche le bord de l'écran rebondit (angle réfléchi). Aspect
// « éclair » (zigzag) ou « fissure » (courbe douce) ; teinte noire par défaut, ou claire (néon, couleur du
// cadran). En pause, le tracé s'efface (fondu CSS). La graine permet de redessiner le même
// après un changement de taille.
const crackCanvas = $('#crack-fx');
const crackFx = crackCanvas?.getContext('2d');
const crack = { on: false, seed: 0, segs: [], maxDur: 0, done: 0, last: 0, zap: false, w: 0, h: 0 };
// Les segments finis sont dessinés une seule fois ici ; seuls ceux qui poussent sont redessinés.
const crackDone = document.createElement('canvas');
// Teinte « Faille » : les traits s'élargissent pendant le focus et laissent voir un ciel étoilé
// (deux couches qui glissent lentement, à des vitesses différentes) bordé de violet.
// crackDone sert alors de masque, crackRim garde le bord, crackTmp compose le ciel dans le masque.
const crackRim = document.createElement('canvas'), crackTmp = document.createElement('canvas');
let crackSky = null;
// Au-delà de 2 pixels par point, la différence ne se voit pas et le dessin coûte bien plus cher.
const crackScale = () => Math.min(2, devicePixelRatio || 1);

function prng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Segments [x0, y0, x1, y1, t0, t1, profondeur] ; t = moment du focus (0 → 1) où le
// segment pousse : le tracé avance à vitesse constante le long de ses branches, et ses
// derniers bouts arrivent à la fin du focus.
function crackBuild() {
  const W = innerWidth, H = innerHeight, rnd = prng(crack.seed);
  const zap = crack.zap = S.crackLook !== 'fissure';
  const r = dial.getBoundingClientRect();
  const cx = r.width ? r.left + r.width / 2 : W / 2, cy = r.width ? r.top + r.height / 2 : H / 2;
  const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
  const step = Math.max(6, R / 60);
  const segs = [], todo = [];
  const n = 6 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI + (rnd() - 0.5) * 0.9;
    todo.push({ x: cx, y: cy, a, h: a, d: 0, depth: 0, life: Math.ceil((R / step) * 2) });
  }
  // Les branches dans l'ordre de leur naissance : si la limite est atteinte, seules des
  // brindilles manquent.
  while (todo.length && segs.length < 10000) {
    const b = todo.shift();
    let { x, y, a, h, d } = b, bounced = false;
    for (let k = 0; k < b.life; k++) {
      // Fissure : courbe douce ; éclair : dents de scie autour de sa direction. Une légère
      // attirance vers l'extérieur fait rayonner le tracé (jusqu'au premier rebond).
      if (zap) a = h + (rnd() - 0.5) * 1.1;
      else a += (rnd() - 0.5) * 0.55;
      if (d > 0 && !bounced) {
        const out = Math.atan2(y - cy, x - cx);
        const pull = Math.atan2(Math.sin(out - (zap ? h : a)), Math.cos(out - (zap ? h : a))) * (b.depth ? 0.02 : 0.1);
        if (zap) h += pull; else a += pull;
      }
      const L = step * (0.6 + rnd() * 0.8);
      let nx = x + Math.cos(a) * L, ny = y + Math.sin(a) * L;
      // Bord de l'écran : le trait s'arrête au bord et rebondit (angle réfléchi).
      if (nx < 1 || nx > W - 1) {
        const bx = nx < 1 ? 1 : W - 1, f = (bx - x) / (nx - x || 1);
        nx = bx; ny = y + (ny - y) * f; a = Math.PI - a; h = Math.PI - h; bounced = true;
      }
      if (ny < 1 || ny > H - 1) {
        const by = ny < 1 ? 1 : H - 1, f = (by - y) / (ny - y || 1);
        ny = by; nx = x + (nx - x) * f; a = -a; h = -h; bounced = true;
      }
      const len = Math.hypot(nx - x, ny - y);
      segs.push([x, y, nx, ny, d, d + len, b.depth]);
      x = nx; y = ny; d += len;
      if (b.depth < 6 && rnd() < 0.12 - b.depth * 0.015) {
        const ca = a + (rnd() < 0.5 ? -1 : 1) * (0.45 + rnd() * 0.9);
        todo.push({ x, y, a: ca, h: ca, d, depth: b.depth + 1, life: Math.ceil((b.life - k) * (0.35 + rnd() * 0.5)) });
      }
    }
  }
  // Distances → moments du focus.
  const maxD = segs.reduce((m, s) => Math.max(m, s[5]), 1);
  let maxDur = 0;
  for (const s of segs) { s[4] /= maxD; s[5] /= maxD; maxDur = Math.max(maxDur, s[5] - s[4]); }
  segs.sort((p, q) => p[5] - q[5]); // par moment où le segment a fini de pousser
  crack.segs = segs;
  crack.maxDur = maxDur;
  crack.w = W; crack.h = H; crack.dpr = devicePixelRatio;
  crackCanvas.width = crackDone.width = crackRim.width = crackTmp.width = Math.round(W * crackScale());
  crackCanvas.height = crackDone.height = crackRim.height = crackTmp.height = Math.round(H * crackScale());
  crackDone.getContext('2d').clearRect(0, 0, crackDone.width, crackDone.height);
  crackRim.getContext('2d').clearRect(0, 0, crackRim.width, crackRim.height);
  crack.done = 0;
  crack.grow = 0;
  crackSky = S.crackShade === 'faille' ? crackSkyBuild(cx, cy) : null;
}

// Ciel de la faille, en pixels du canevas, avec une marge pour glisser : un fond de nébuleuses
// et de petites étoiles, et une couche de grosses étoiles qui glisse plus vite (profondeur).
function crackSkyBuild(cx, cy) {
  const k = crackScale(), rnd = prng(crack.seed ^ 0x5bd1e995);
  const M = Math.round(60 * k), w = crackCanvas.width + 2 * M, h = crackCanvas.height + 2 * M;
  const layer = () => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const back = layer(), front = layer();
  const b = back.getContext('2d'), f = front.getContext('2d');
  const R = Math.max(w, h);
  let g = b.createRadialGradient(cx * k + M, cy * k + M, 0, cx * k + M, cy * k + M, R * 0.7);
  g.addColorStop(0, '#2a0f4f'); g.addColorStop(1, '#07040f');
  b.fillStyle = g; b.fillRect(0, 0, w, h);
  const neb = ['#6a2fa0', '#1f3f9a', '#8a1f66', '#127080'];
  for (let i = 0; i < 7; i++) {
    const x = rnd() * w, y = rnd() * h, r = R * (0.15 + rnd() * 0.3);
    g = b.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, neb[i % neb.length] + '66'); g.addColorStop(1, neb[i % neb.length] + '00');
    b.fillStyle = g; b.fillRect(0, 0, w, h);
  }
  const star = (c, x, y, r, a, color) => { c.globalAlpha = a; c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill(); };
  for (let i = 0, n = (w * h) / (1600 * k * k); i < n; i++) {
    star(b, rnd() * w, rnd() * h, (0.3 + rnd() * 0.8) * k, 0.35 + rnd() * 0.65, rnd() < 0.15 ? '#bcd0ff' : '#fff');
  }
  for (let i = 0, n = (w * h) / (14000 * k * k); i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = (0.9 + rnd() * 1.3) * k;
    star(f, x, y, r * 3.5, 0.12, '#cdb8ff'); // petit halo
    star(f, x, y, r, 0.9, rnd() < 0.3 ? '#ffe9c4' : '#fff');
  }
  return { back, front, M };
}

// Trace d'un coup un ensemble de segments de la même profondeur : les branches principales
// épaisses et lumineuses, les suivantes de plus en plus fines. Éclair : néon, halo bleu-violet et cœur blanc.
function crackStroke(ctx, path, lv, rim) {
  let passes;
  if (S.crackShade === 'faille') {
    // Masque blanc (le ciel s'y dessinera) ou bord violet, plus large, dessous.
    // Les grosses branches s'ouvrent le plus, les brindilles restent fines.
    const w = Math.max(1.2, 3 - lv * 0.35) * (1 + (crack.grow - 1) * Math.max(0.2, 1 - lv * 0.15));
    passes = rim ? [[w * 1.6 + 3, 0.35, '#a98bff'], [w * 1.15 + 1, 0.6, '#d9c8ff']] : [[w, 1, '#fff']];
  } else if (S.crackShade !== 'clair') {
    // Teinte « sombre » (par défaut) : trait noir, qui tranche sur le temps et le message en blanc ;
    // l'éclair garde un mince halo bleuté pour rester visible sur un fond de nuit.
    const w = crack.zap ? Math.max(0.6, 2.2 - lv * 0.25) : Math.max(0.7, 2.6 - lv * 0.3);
    const al = Math.max(0.45, 0.9 - lv * 0.06);
    passes = crack.zap
      ? [[w * 4, 0.12, '#8fb8ff'], [w * 1.2, al, '#000']]
      : lv < 2 ? [[w * 3, 0.12, '#000'], [w, al, '#000']] : [[w, al, '#000']];
  } else if (crack.zap) {
    const w = Math.max(0.6, 2.2 - lv * 0.25);
    passes = [[w * 6, 0.07, '#7f6bff'], [w * 2.4, 0.22, '#8fb8ff'], [w * 0.9, Math.max(0.5, 0.95 - lv * 0.04), '#fff']];
    ctx.globalCompositeOperation = 'lighter';
  } else {
    const w = Math.max(0.7, 2.6 - lv * 0.3), al = Math.max(0.4, 0.95 - lv * 0.06);
    passes = lv < 2 ? [[w * 3, 0.1, S.dialColor], [w, al, S.dialColor]] : [[w, al, S.dialColor]];
  }
  const thick = Number(S.crackWidth) || 1; // épaisseur des traits (réglage)
  for (const [lw, alpha, color] of passes) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lw * thick;
    ctx.strokeStyle = color;
    ctx.stroke(path);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// Ajoute les segments [from, to) au dessin, un tracé par profondeur ; `frac(seg)` donne la
// part déjà poussée (1 = entier).
function crackBatch(ctx, from, to, frac, rim) {
  const segs = crack.segs, paths = [];
  for (let i = from; i < to; i++) {
    const [x0, y0, x1, y1, , , lv] = segs[i];
    const f = frac(segs[i]);
    if (f <= 0) continue; // pas encore commencé (sinon un point rond s'afficherait)
    const path = paths[lv] ||= new Path2D();
    path.moveTo(x0, y0);
    path.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
  }
  paths.forEach((path, lv) => path && crackStroke(ctx, path, lv, rim));
}

// p : part des branches parcourue ; q : part du focus écoulée (la faille s'élargit avec).
function crackDraw(p, q, now) {
  const k = crackCanvas.width / crack.w, segs = crack.segs;
  const done = crackDone.getContext('2d'), rim = crackRim.getContext('2d'), tmp = crackTmp.getContext('2d'), ctx = crackFx;
  const faille = !!crackSky;
  if (faille) {
    // Les traits s'élargissent (jusqu'à 4 fois à la fin) : les segments finis sont redessinés
    // à chaque palier de 4 %.
    const g = 1 + 3 * q ** 1.3;
    if (!crack.grow || g > crack.grow * 1.04) {
      crack.grow = g;
      for (const c of [done, rim]) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, crackDone.width, crackDone.height); }
      crack.done = 0;
    }
  }
  for (const c of [done, rim, tmp, ctx]) { c.setTransform(k, 0, 0, k, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round'; }
  const from = crack.done;
  while (crack.done < segs.length && segs[crack.done][5] <= p) crack.done++;
  crackBatch(done, from, crack.done, () => 1);
  if (faille) crackBatch(rim, from, crack.done, () => 1, true);
  // Ceux qui poussent encore (rangés par fin de pousse : tous ceux qui ont commencé finissent
  // avant p + la durée du plus long segment).
  let end = crack.done;
  while (end < segs.length && segs[end][5] <= p + crack.maxDur) end++;
  const growing = ([, , , , t0, t1]) => clamp((p - t0) / (t1 - t0), 0, 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, crackCanvas.width, crackCanvas.height);
  if (!faille) {
    ctx.drawImage(crackDone, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    crackBatch(ctx, crack.done, end, growing);
    return;
  }
  // Faille : le bord violet, puis le ciel découpé dans le masque des traits.
  ctx.drawImage(crackRim, 0, 0);
  ctx.setTransform(k, 0, 0, k, 0, 0);
  crackBatch(ctx, crack.done, end, growing, true);
  tmp.setTransform(1, 0, 0, 1, 0, 0);
  tmp.globalAlpha = 1;
  tmp.clearRect(0, 0, crackTmp.width, crackTmp.height);
  tmp.drawImage(crackDone, 0, 0);
  tmp.setTransform(k, 0, 0, k, 0, 0);
  crackBatch(tmp, crack.done, end, growing);
  tmp.setTransform(1, 0, 0, 1, 0, 0);
  tmp.globalAlpha = 1;
  tmp.globalCompositeOperation = 'source-in';
  const { back, front, M } = crackSky, s = now / 1000;
  tmp.drawImage(back, -M + Math.sin(s / 41) * M * 0.35, -M + Math.cos(s / 53) * M * 0.35);
  tmp.globalCompositeOperation = 'source-atop';
  tmp.drawImage(front, -M + Math.sin(s / 23) * M * 0.9, -M + Math.cos(s / 29) * M * 0.9);
  tmp.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(crackTmp, 0, 0);
}

function crackFrame(now) {
  if (!crack.on) return;
  requestAnimationFrame(crackFrame);
  if (now - crack.last < 100) return; // ça pousse lentement : 10 images par seconde suffisent
  crack.last = now;
  if (crack.w !== innerWidth || crack.h !== innerHeight || crack.dpr !== devicePixelRatio
    || (S.crackShade === 'faille') !== !!crackSky) crackBuild(); // taille ou teinte changée
  // Vitesse (réglage) : « lente », le tracé n'a parcouru que la moitié de ses branches à la fin.
  const speed = Number(S.crackSpeed) || 1;
  const q = T.total ? clamp(1 - remaining() / T.total, 0, 1) : 0;
  crackDraw(q * speed, q, now);
}

function crackStart() {
  crack.seed = (Math.random() * 2 ** 31) | 0;
  crackBuild();
  crackFx.clearRect(0, 0, crackCanvas.width, crackCanvas.height);
  crack.on = true;
  crack.last = 0;
  requestAnimationFrame(crackFrame);
}

// Scène du cadran selon le mode et la phase. Au repos, le cadran normal (arc, point,
// graduations) pour bien voir ce qu'on règle ; la scène et son cadre arrivent au démarrage.
function setScene() {
  const dream = S.dialStyle === 'reveur' && !demo;
  const p = T.phase;
  const solar = dream && p === 'focus';
  const liquid = dream && p === 'break';
  body.classList.toggle('scene-solar', solar);
  body.classList.toggle('scene-liquid', liquid);
  if (solar && !solarOn) { solarOn = true; requestAnimationFrame(drawSolar); }
  else if (!solar) solarOn = false;
  // Brisure : une nouvelle fissure à chaque focus ; elle s'efface en pause (fondu CSS).
  const cracking = S.dialStyle === 'brisure' && !demo && p === 'focus' && !!crackFx;
  if (cracking && !crack.on) crackStart();
  else if (!cracking) crack.on = false;
  body.classList.toggle('scene-crack', cracking);
}

/* ---------- Mode « Rythme » : le cercle réagit à la musique ---------- */

// Analyse : spectre en dB, compensé du volume du lecteur, puis ramené à l'échelle des
// dernières secondes (sensibilité automatique) : une musique calme ou jouée bas bouge
// autant qu'une forte. Les temps forts sont des pics de basses nettement au-dessus de la
// moyenne récente ; le BPM vient de l'écart régulier entre ces pics (autocorrélation sur 8 s).
const rhythmCanvas = $('#rhythm-fx');
const rhythmFx = rhythmCanvas?.getContext('2d');
const rhythm = { on: false, bpm: 0, samples: [], prevLow: 0, fluxAvg: 0.02, lastBeat: 0, peak: -60, ampPeak: 0.05, rings: [], sparks: [] };

function rhythmStart() {
  const want = S.dialStyle === 'rythme' && !!rhythmFx;
  if (!want) {
    rhythm.on = false;
    rhythm.bpm = 0;
    if (rhythmFx) rhythmFx.clearRect(0, 0, rhythmCanvas.width, rhythmCanvas.height);
    dial.style.transform = '';
    els.time.style.removeProperty('--neon');
    return;
  }
  if (!rhythm.on) { rhythm.on = true; requestAnimationFrame(rhythmFrame); }
}

function rhythmBpm() {
  const now = performance.now(), span = 8000, step = 10, n = span / step;
  const g = new Float32Array(n);
  for (const [tt, v] of rhythm.samples) {
    const k = Math.floor((tt - (now - span)) / step);
    if (k >= 0 && k < n) g[k] = Math.max(g[k], v);
  }
  const mean = g.reduce((s, v) => s + v, 0) / n;
  let energy = 0;
  for (let i = 0; i < n; i++) { g[i] -= mean; energy += g[i] * g[i]; }
  let best = 0, bestLag = 0;
  for (let lag = Math.round(60000 / 180 / step); lag <= Math.round(60000 / 70 / step); lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += g[i] * g[i + lag];
    if (s > best) { best = s; bestLag = lag; }
  }
  return energy && best / energy > 0.12 ? Math.round(60000 / (bestLag * step)) : 0;
}

setInterval(() => {
  if (!rhythm.on) return;
  const cut = performance.now() - 9000;
  while (rhythm.samples.length && rhythm.samples[0][0] < cut) rhythm.samples.shift();
  const b = audio.musicOn ? rhythmBpm() : 0;
  rhythm.bpm = b ? (rhythm.bpm ? Math.round(rhythm.bpm * 0.6 + b * 0.4) : b) : (audio.musicOn ? rhythm.bpm : 0);
}, 1000);

// Néon : le même tracé trois fois, du halo large et transparent au cœur fin et clair.
// `paint(light)` renvoie la couleur (dégradé ou teinte) pour une luminosité donnée.
function neon(ctx, u, path, paint, strength = 1) {
  ctx.globalCompositeOperation = 'lighter';
  for (const [lw, al, light] of [[7, 0.14, 60], [3.6, 0.32, 66], [1.3, 0.95, 88]]) {
    ctx.strokeStyle = paint(light);
    ctx.globalAlpha = Math.min(1, al * strength);
    ctx.lineWidth = lw * u;
    path();
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

// Dégradé qui fait le tour du cercle : magenta → violet → bleu → cyan → … → magenta.
function neonRing(ctx, C, light) {
  const g = ctx.createConicGradient(-Math.PI / 2, C, C);
  [[0, 300], [0.25, 255], [0.5, 190], [0.75, 255], [1, 300]].forEach(([o, h]) => g.addColorStop(o, `hsl(${h} 100% ${light}%)`));
  return g;
}

function rhythmFrame(t) {
  if (!rhythm.on) return;
  requestAnimationFrame(rhythmFrame);
  const an = audio.analyser;
  const w = Math.round(rhythmCanvas.clientWidth * devicePixelRatio);
  if (!w) return;
  if (rhythmCanvas.width !== w) { rhythmCanvas.width = w; rhythmCanvas.height = w; }
  const ctx = rhythmFx, C = w / 2, u = w / 420, R = 128 * u; // 1 unité du cadran = u px
  ctx.clearRect(0, 0, w, w);
  if (!an || !audio.musicOn || document.hidden) {
    dial.style.transform = '';
    if (!document.hidden) {
      if (S.rhythmForm === 'horizon') drawHorizon(t, null, 0); // ligne calme et avancée du temps
      else if (S.rhythmForm === 'heros') drawHero(t, false, 0); // le héros court aussi sans musique
    }
    return;
  }
  const color = getComputedStyle(document.documentElement).getPropertyValue('--dial').trim() || '#fff';
  rhythm.freq ||= new Float32Array(an.frequencyBinCount);
  rhythm.wave ||= new Float32Array(an.fftSize);
  an.getFloatFrequencyData(rhythm.freq);
  const comp = -20 * Math.log10(Math.max(audio.music.volume, 0.02)); // compense le volume
  let top = -200;
  for (let i = 1; i < 200; i++) top = Math.max(top, rhythm.freq[i] + comp);
  rhythm.peak = Math.max(top, rhythm.peak - 0.04); // sensibilité automatique (redescend doucement)
  const level = (i) => clamp((rhythm.freq[i] + comp - (rhythm.peak - 42)) / 42, 0, 1);
  const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += level(i); return s / (b - a); };
  const low = band(1, 8);
  const flux = Math.max(0, low - rhythm.prevLow);
  rhythm.prevLow = low;
  rhythm.samples.push([performance.now(), flux]);
  rhythm.fluxAvg = rhythm.fluxAvg * 0.97 + flux * 0.03;
  const beat = flux > Math.max(0.04, rhythm.fluxAvg * 3) && t - rhythm.lastBeat > 250;
  if (beat) rhythm.lastBeat = t;
  const pulse = Math.max(0, 1 - (t - rhythm.lastBeat) / 350); // 1 sur le temps, puis s'éteint
  dial.style.transform = `scale(${(1 + pulse * 0.025).toFixed(4)})`;
  els.time.style.setProperty('--neon', (0.35 + pulse * 0.65 + low * 0.2).toFixed(3)); // le temps s'illumine sur le temps fort
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Lueur sur le temps
  if (pulse > 0) {
    ctx.globalAlpha = pulse * 0.25;
    ctx.lineWidth = 10 * u;
    ctx.beginPath(); ctx.arc(C, C, R + 6 * u * pulse, 0, 2 * Math.PI); ctx.stroke();
  }
  const form = S.rhythmForm;
  if (form === 'horizon') drawHorizon(t, level, pulse);
  else if (form === 'heros') drawHero(t, beat, pulse);
  else if (form === 'barres') {
    // Néon : halo coloré (deux couches larges et transparentes) puis cœur fin presque blanc ;
    // la teinte suit la fréquence (basses magenta → aigus cyan). Pas de flou : reste fluide.
    const N = 64;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N / 2; i++) {
      const v = level(Math.floor(2 * Math.pow(100, i / (N / 2))));
      const len = (1 + v * v * 18) * u;
      const hue = 300 - (i / (N / 2)) * 120;
      for (const s of [1, -1]) {
        const a = s * ((i + 0.5) / N) * 2 * Math.PI;
        const x0 = C + (R + 8 * u) * Math.sin(a), y0 = C - (R + 8 * u) * Math.cos(a);
        const x1 = C + (R + 8 * u + len) * Math.sin(a), y1 = C - (R + 8 * u + len) * Math.cos(a);
        for (const [lw, al, light] of [[7, 0.12 + v * 0.1, 60], [3.6, 0.3 + v * 0.2, 65], [1.3, 0.95, 88]]) {
          ctx.strokeStyle = `hsl(${hue} 100% ${light}%)`;
          ctx.globalAlpha = al;
          ctx.lineWidth = lw * u;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  } else if (form === 'onde') {
    an.getFloatTimeDomainData(rhythm.wave);
    let amp = 0;
    for (const v of rhythm.wave) amp = Math.max(amp, Math.abs(v));
    rhythm.ampPeak = Math.max(amp, rhythm.ampPeak * 0.995, 0.01);
    neon(ctx, u, () => {
      ctx.beginPath();
      for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * 2 * Math.PI - Math.PI / 2;
        const v = rhythm.wave[Math.floor((i % 256) * rhythm.wave.length / 256)] / rhythm.ampPeak;
        const r = R + 9 * u + v * 22 * u;
        if (i) ctx.lineTo(C + r * Math.cos(a), C + r * Math.sin(a)); else ctx.moveTo(C + r * Math.cos(a), C + r * Math.sin(a));
      }
    }, (light) => neonRing(ctx, C, light), 0.9);
  } else if (form === 'goutte') {
    const mid = band(8, 40), high = band(40, 160), tt = t / 1000;
    const blob = () => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * 2 * Math.PI;
        const r = R * 0.86 + (low * 13 + pulse * 5 + Math.sin(a * 3 + tt * 0.9) * (4 + mid * 13)
          + Math.sin(a * 5 - tt * 1.3) * (2 + high * 11) + Math.sin(a * 2 + tt * 0.4) * 3) * u;
        if (i) ctx.lineTo(C + r * Math.cos(a), C + r * Math.sin(a)); else ctx.moveTo(C + r * Math.cos(a), C + r * Math.sin(a));
      }
      ctx.closePath();
    };
    // Intérieur légèrement teinté (magenta en haut, cyan en bas), puis contour néon.
    const fill = ctx.createLinearGradient(C, C - R, C, C + R);
    fill.addColorStop(0, 'hsl(300 100% 65%)'); fill.addColorStop(1, 'hsl(190 100% 60%)');
    blob();
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.1 + low * 0.14;
    ctx.fill();
    neon(ctx, u, blob, (light) => neonRing(ctx, C, light), 0.7);
  } else if (form === 'sonar') {
    if (beat) rhythm.rings.push(t);
    rhythm.rings = rhythm.rings.filter((r0) => t - r0 < 1600);
    for (const r0 of rhythm.rings) {
      const age = (t - r0) / 1600;
      const hue = 300 - age * 110; // naît magenta, finit cyan
      neon(ctx, u * (1 - age * 0.6), () => { ctx.beginPath(); ctx.arc(C, C, R + (4 + age * 75) * u, 0, 2 * Math.PI); },
        (light) => `hsl(${hue} 100% ${light}%)`, (1 - age) * 0.8);
    }
  } else if (form === 'anneaux' || form === 'jauge') {
    // Arc-en-ciel de puissance : 7 anneaux, des basses (rouge, dedans) aux aigus (violet,
    // dehors), chacun allumé selon la puissance de sa bande ; sur chaque temps fort, une vague
    // traverse les anneaux du centre vers l'extérieur (ils battent au rythme du BPM).
    const edges = [1, 3, 6, 12, 24, 48, 96, 190], hues = [0, 28, 52, 120, 190, 228, 275];
    if (beat) rhythm.rings.push(t);
    rhythm.rings = rhythm.rings.filter((r0) => t - r0 < 700);
    rhythm.ringMax ||= new Array(7).fill(0.2);
    for (let i = 0; i < 7; i++) {
      // Chaque anneau a sa propre sensibilité (son maximum récent) : les aigus, plus faibles,
      // s'allument aussi.
      const raw = band(edges[i], edges[i + 1]);
      rhythm.ringMax[i] = Math.max(raw, rhythm.ringMax[i] * 0.997, 0.08);
      const v = raw / rhythm.ringMax[i];
      let wave = 0;
      for (const r0 of rhythm.rings) {
        const age = (t - r0) / 700, at = age * 8 - 0.5; // l'anneau que la vague traverse
        wave = Math.max(wave, Math.max(0, 1 - Math.abs(i - at)) * (1 - age));
      }
      const power = Math.min(1, v * v * 1.2 + wave * 0.7);
      const r = R + (9 + i * 10) * u, paint = (light) => `hsl(${hues[i]} 100% ${light}%)`;
      if (form === 'anneaux') {
        neon(ctx, u * (0.45 + power * 0.9), () => { ctx.beginPath(); ctx.arc(C, C, r, 0, 2 * Math.PI); }, paint, 0.12 + power * 0.88);
        continue;
      }
      // Jauge : l'anneau part du bas et remonte des deux côtés selon la puissance (le tour
      // complet quand ça cogne), puis redescend doucement, comme un vumètre. Un trait discret
      // montre l'anneau entier.
      rhythm.ringLvl ||= new Array(7).fill(0);
      const lvl = rhythm.ringLvl[i] = Math.max(power, rhythm.ringLvl[i] - 0.025);
      ctx.globalAlpha = 0.08; ctx.lineWidth = u; ctx.strokeStyle = paint(70);
      ctx.beginPath(); ctx.arc(C, C, r, 0, 2 * Math.PI); ctx.stroke();
      const span = Math.max(0.02, lvl) * Math.PI;
      neon(ctx, u * (0.7 + lvl * 0.6), () => { ctx.beginPath(); ctx.arc(C, C, r, Math.PI / 2 - span, Math.PI / 2 + span); }, paint, 0.35 + lvl * 0.65);
    }
  } else if (form === 'etincelles') {
    if (beat) {
      for (let k = 0; k < 16; k++) {
        const a = Math.random() * 2 * Math.PI, sp = (30 + Math.random() * 45) * u;
        rhythm.sparks.push({ x: C + (R + 3 * u) * Math.cos(a), y: C + (R + 3 * u) * Math.sin(a), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t0: t, s: (0.8 + Math.random() * 1.2) * u, hue: 190 + Math.random() * 110 });
      }
    }
    rhythm.sparks = rhythm.sparks.filter((p) => t - p.t0 < 1800);
    for (const p of rhythm.sparks) {
      const age = (t - p.t0) / 1000;
      const fade = Math.max(0, 1 - age / 1.8);
      const x = p.x + p.vx * age, y = p.y + p.vy * age + 15 * u * age * age;
      ctx.globalCompositeOperation = 'lighter';
      for (const [k, al, light] of [[3.2, 0.18, 60], [1.8, 0.35, 68], [1, 0.95, 90]]) {
        ctx.fillStyle = `hsl(${p.hue} 100% ${light}%)`;
        ctx.globalAlpha = al * fade;
        ctx.beginPath(); ctx.arc(x, y, p.s * k, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.globalAlpha = 1;
}

// Vue « onde horizontale » : barres néon symétriques, du bord de l'horloge vers la droite ;
// des basses (cyan, près de l'horloge) aux aigus (violet, à droite). Chaque barre retombe
// doucement. La partie déjà écoulée de la phase est plus vive, avec un trait à l'avancée.
const waveCanvas = $('#wave-fx'), waveFx = waveCanvas?.getContext('2d');
function drawHorizon(t, level, pulse) {
  const k = devicePixelRatio || 1, W = Math.round(waveCanvas.clientWidth * k), H = Math.round(waveCanvas.clientHeight * k);
  if (!W || !H) return;
  if (waveCanvas.width !== W || waveCanvas.height !== H) { waveCanvas.width = W; waveCanvas.height = H; }
  const ctx = waveFx, mid = H / 2, step = 7 * k, bw = 2.6 * k, n = Math.floor(W / step);
  ctx.clearRect(0, 0, W, H);
  const running = T.phase === 'focus' || T.phase === 'break';
  const p = running && T.total ? clamp(1 - remaining() / T.total, 0, 1) : T.phase === 'done' ? 1 : 0;
  rhythm.hz ||= [];
  rhythm.hzMax ||= [];
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const f = i / Math.max(1, n - 1);
    // Chaque barre a sa propre sensibilité (son maximum récent) : les aigus bougent aussi.
    const raw = level ? level(Math.floor(2 * Math.pow(95, f))) : 0;
    const top = rhythm.hzMax[i] = Math.max(raw, (rhythm.hzMax[i] || 0.2) * 0.997, 0.1);
    const v = raw / top;
    const s = rhythm.hz[i] = Math.max(v, (rhythm.hz[i] || 0) * 0.9);
    const env = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, f * 1.15)); // plus haut vers le milieu
    const a = Math.max(1.5 * k, (0.03 + 0.97 * s ** 1.3) * mid * 0.94 * env * (1 + pulse * 0.12));
    const x = i * step + (step - bw) / 2, hue = 188 + f * 87;
    const done = x / W <= p;
    ctx.globalAlpha = done ? 0.2 : 0.07;
    ctx.fillStyle = `hsl(${hue} 100% 60%)`;
    ctx.fillRect(x - bw * 0.8, mid - a - k, bw * 2.6, 2 * a + 2 * k); // halo
    ctx.globalAlpha = done ? 0.95 : 0.4;
    ctx.fillStyle = `hsl(${hue} 100% ${done ? 74 : 66}%)`;
    ctx.fillRect(x, mid - a, bw, 2 * a);
  }
  // Ligne du milieu et trait à l'avancée du temps.
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.22; ctx.fillStyle = '#fff';
  ctx.fillRect(0, mid - 0.5 * k, W, k);
  if (running) {
    ctx.globalAlpha = 0.85;
    ctx.fillRect(p * W - k, mid - H * 0.42, 2 * k, H * 0.84);
  }
  ctx.globalAlpha = 1;
}

/* ---------- Vue « Petit héros » (mode Rythme, façon jeu idle) ---------- */
// Un petit chevalier en pixels court sans s'arrêter dans un décor qui défile : deux pas par temps
// du BPM (80 BPM sans musique). Chaque temps donne un coup d'épée au slime à portée, sinon remplit
// la jauge de combat ; il ne saute que par-dessus les rochers. Ennemis variés : slimes,
// champignons, gobelins, squelettes, chauves-souris, fantômes ; en pause, ruines au hasard. Jauge pleine : un boss (roi slime, squelette
// géant ou chat géant) arrive et se bat à coups d'épée sur le rythme. Il ramasse des pièces, ouvre des coffres ; pièces, niveau
// et jauge sont gardés sur l'appareil. Pendant le focus il avance vers le drapeau d'arrivée au fil
// du temps ; en pause il se repose au coin du feu.
const LS_HERO = 'projetfocus.heros';
const HERO_BOSS_AT = 150; // temps (ou slimes et coffres) avant l'arrivée du roi slime
const hero = (() => {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_HERO)) || {}; } catch { /* rien d'enregistré */ }
  return {
    coins: saved.coins | 0, kills: saved.kills | 0, bosses: saved.bosses | 0, charge: Math.min(HERO_BOSS_AT, +saved.charge || 0),
    dirty: false, lastSave: 0, beats: 0, vbeat: 0, hopT: -1e4, hopD: 350, fight: false, bat: null,
    wx: 0, hx: 0, f: 2.4, step: 0, last: 0, nextX: 40, things: [], parts: [], atk: -1e4, phase: '', level: 0,
  };
})();
const heroLevel = (c) => 1 + Math.floor(Math.sqrt(c / 15));
const HERO_FOE_HUE = { mushroom: 0, goblin: 110, skeleton: 50, bat: 280, ghost: 190 };
const HERO_RUINS = ['wall', 'columns', 'arch', 'tower'];
const HERO_BOSSES = ['slime', 'skeleton', 'cat'];
// Robe du chat géant : couleur, ventre et museau
const HERO_CATS = [['#f0a04b', '#ffe0b8'], ['#9aa0ac', '#e4e7ee'], ['#3a3340', '#e9e4ef'], ['#f4e3c3', '#ffffff']];
const bossHue = (e) => (e.type === 'skeleton' ? 0 : e.type === 'cat' ? 35 : e.hue ?? 285);
const HERO_HELM = ['#c3cbe0', '#5aa9ff', '#ff6b6b', '#ffd23f', '#b57bff', '#4fe3b0'];
const HERO_SCARF = ['#e63946', '#ff9f1c', '#2ec4b6', '#f72585', '#ffffff', '#ff6b6b'];
const HERO_BODY = [
  '...HHHH..',
  '..HHHHHH.',
  '..HSSSDS.',
  '..HSSSSS.',
  '...BBBBB.',
  '...BBBBB.',
  '...BBBBB.',
  '...DDDDD.',
];

function heroGain(n, x, y) {
  hero.coins += n;
  hero.dirty = true;
  hero.parts.push({ k: 'txt', x, y, vy: -0.012, t0: hero.last, txt: '+' + n });
}

function heroSpawn() {
  const r = Math.random();
  const x = hero.nextX;
  if (r < 0.34) for (let i = 0, n = 3 + Math.floor(Math.random() * 3); i < n; i++) hero.things.push({ k: 'coin', x: x + i * 6, y: 6 + 3 * Math.sin(i / Math.max(1, n - 1) * Math.PI) });
  else if (r < 0.52) {
    const q = Math.random(), k = q < 0.38 ? 'slime' : q < 0.52 ? 'mushroom' : q < 0.66 ? 'goblin' : q < 0.78 ? 'skeleton' : q < 0.9 ? 'bat' : 'ghost';
    hero.things.push({ k, foe: true, x, hue: k === 'slime' ? 90 + Math.floor(Math.random() * 200) : HERO_FOE_HUE[k] });
  }
  else if (r < 0.58) hero.things.push({ k: 'chest', x });
  else if (r < 0.67) hero.things.push({ k: 'rock', x, w: 5 + Math.floor(Math.random() * 3) });
  else if (r < 0.8) hero.things.push({ k: 'tree', x });
  else if (r < 0.9) hero.things.push({ k: 'bush', x });
  else hero.things.push({ k: 'flower', x, hue: Math.floor(Math.random() * 360) });
  hero.nextX += 16 + Math.random() * 26;
}

function drawHero(t, beat, pulse) {
  const k = devicePixelRatio || 1, W = Math.round(waveCanvas.clientWidth * k), H = Math.round(waveCanvas.clientHeight * k);
  if (!W || !H) return;
  if (waveCanvas.width !== W || waveCanvas.height !== H) { waveCanvas.width = W; waveCanvas.height = H; }
  // 40 pixels de haut ; une bande plus grande que 240 px (paysage, CSS) garde la taille des
  // pixels et montre plus de ciel. En pause, zoom ×2 sur le camp (20 pixels de haut, les côtés
  // sortent du cadre), ou 40 pixels de haut si la bande est grande.
  const px = Math.max(1, T.phase === 'break' ? Math.round(H / (H < 250 * k ? 20 : 40)) : Math.round(Math.min(H, 240 * k) / 40));
  const ctx = waveFx, LW = Math.ceil(W / px), LH = Math.ceil(H / px);
  const gy = LH - 7; // sol
  const dt = hero.last ? clamp(t - hero.last, 0, 60) : 16;
  hero.last = t;
  ctx.clearRect(0, 0, W, H);
  const rect = (x, y, w, h, c, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(Math.round(x) * px, Math.round(y) * px, w * px, h * px); };
  const batAt = (bx, by, up, dir) => { // chauve-souris, ailes en haut ou en bas
    const c = '#7a68a8', d = up ? -1 : 1;
    rect(bx, by, 3, 2, c); rect(bx, by - 1, 1, 1, c); rect(bx + 2, by - 1, 1, 1, c);
    rect(bx + (dir > 0 ? 2 : 0), by, 1, 1, '#ff5470');
    rect(bx - 2, by + d, 2, 1, c); rect(bx - 3, by + 2 * d, 1, 1, c); rect(bx + 3, by + d, 2, 1, c); rect(bx + 5, by + 2 * d, 1, 1, c);
  };

  const phase = T.phase;
  const running = phase === 'focus' || phase === 'break';
  const p = running && T.total ? clamp(1 - remaining() / T.total, 0, 1) : phase === 'done' ? 1 : 0;
  const camp = phase === 'break';
  const bpm = audio.musicOn && rhythm.bpm ? rhythm.bpm : 0;

  // Allure : deux pas par temps (plus lente et régulière sans musique).
  const fTarget = bpm ? clamp(bpm, 60, 200) / 30 : 2.4;
  hero.f += (fTarget - hero.f) * Math.min(1, dt * 0.004);
  const arrive = phase === 'focus' || phase === 'done';
  const target = arrive ? LW * 0.14 + p * (LW - 20 - LW * 0.14) : camp ? LW / 2 - 12 : LW * 0.2;
  if (target < hero.hx || (phase !== hero.phase && !camp)) hero.hx = target;
  else hero.hx += arrive ? (target - hero.hx) : Math.min(target - hero.hx, 22 * dt / 1000);
  if (camp && hero.phase !== 'break') { // au camp, plus de pièces ni d'ennemis ; des ruines au hasard derrière
    hero.things = hero.things.filter((e) => e.k === 'tree' || e.k === 'bush' || e.k === 'flower');
    hero.ruin = Math.random() < 0.75 ? HERO_RUINS[Math.floor(Math.random() * HERO_RUINS.length)] : null;
  }
  hero.phase = phase;
  const fight = hero.fight; // face au roi slime : le monde s'arrête le temps du combat
  const walking = (!camp || target - hero.hx > 0.5) && !fight;
  const sitting = camp && !walking;
  const speed = hero.f * 3.5 * (1 + pulse * 0.25); // pixels logiques par seconde
  if (!camp && phase !== 'done' && !fight) hero.wx += speed * dt / 1000;
  // Temps : ceux de la musique, ou un temps régulier à 80 BPM sans musique.
  let tick = beat;
  if (!audio.musicOn && t - hero.vbeat > 750) { hero.vbeat = t; tick = true; }
  if (tick && !sitting) hero.beats++;
  const out = camp || phase === 'done';
  const charge = (n) => { if (!out && !fight) { hero.charge = Math.min(HERO_BOSS_AT, hero.charge + n); hero.dirty = true; } };
  if (walking) hero.step += hero.f * dt / 1000;
  const wx = hero.wx, hx = Math.round(hero.hx);

  // Niveau
  const lvl = heroLevel(hero.coins);
  if (hero.level && lvl > hero.level) {
    hero.parts.push({ k: 'txt', x: hx - 4, y: gy - 22, vy: -0.01, t0: t, txt: 'NIVEAU ' + lvl + ' !', big: true });
    for (let i = 0; i < 10; i++) hero.parts.push({ k: 'spark', x: hx + 5, y: gy - 8, vx: (Math.random() - 0.5) * 0.008, vy: -0.003 - Math.random() * 0.005, t0: t, hue: Math.random() * 360 });
  }
  hero.level = lvl;

  // Décor lointain : ciel (jour ou nuit), étoiles, montagnes, collines
  const far = gy > 28; // bande haute : lune et grandes montagnes au loin
  const ridgeH = (x, par, base, amp, f1, f2) => {
    const xp = x + wx * par;
    return Math.round(base + amp * (Math.sin(xp * f1) * 0.6 + Math.sin(xp * f2 + 1.3) * 0.4));
  };
  const sc = Math.min(1, gy / 33); // bande basse (pause zoomée) : collines plus basses, le ciel reste visible
  const FAR = [0.05, Math.round(gy * 0.55), 7, 0.09, 0.21], MID = [0.12, Math.round(15 * sc), 6 * sc, 0.045, 0.11];
  const skyTop = (x) => gy - Math.max(far ? ridgeH(x, ...FAR) : 0, ridgeH(x, ...MID));
  // Ciel marqué quelle que soit la couleur du moment (le reste garde la teinte du fond) : jour
  // et soleil pendant le focus, nuit étoilée et lune pendant la pause.
  const night = camp;
  const sky = ctx.createLinearGradient(0, 0, 0, gy * px);
  if (night) { sky.addColorStop(0, '#070b24'); sky.addColorStop(1, '#2b3170'); }
  else { sky.addColorStop(0, '#2f6fd0'); sky.addColorStop(1, '#9fd4ff'); }
  ctx.globalAlpha = 0.94; ctx.fillStyle = sky;
  for (let x = 0; x < LW; x++) ctx.fillRect(x * px, 0, px, skyTop(x) * px);
  const ax = LW - (far ? 16 : 11), ay = far ? 5 : 2; // soleil ou lune, en haut à droite
  if (night) {
    ctx.globalCompositeOperation = 'lighter';
    rect(ax + 1, ay, 4, 1, '#fff6d8', 0.7); rect(ax, ay + 1, 6, 4, '#fff6d8', 0.7); rect(ax + 1, ay + 5, 4, 1, '#fff6d8', 0.7);
    ctx.globalCompositeOperation = 'source-over';
    rect(ax + 1, ay + 2, 1, 1, '#000', 0.12); rect(ax + 3, ay + 3, 2, 1, '#000', 0.1);
  } else {
    const sh = Math.round(Math.sin(t / 900));
    rect(ax - 2, ay + 2, 1, 2, '#fff3a0', 0.6); rect(ax + 7, ay + 2, 1, 2, '#fff3a0', 0.6);
    rect(ax + 2, ay - 2 - sh, 2, 1, '#fff3a0', 0.6); rect(ax + 2, ay + 7 + sh, 2, 1, '#fff3a0', 0.6);
    rect(ax + 1, ay, 4, 1, '#ffd23f'); rect(ax, ay + 1, 6, 4, '#ffd23f'); rect(ax + 1, ay + 5, 4, 1, '#ffd23f');
    rect(ax + 1, ay + 1, 2, 1, '#fff6b0');
    for (let i = 0; i < 3; i++) { // nuages qui passent lentement
      const cx = ((i * 71 - wx * 0.03 - t * 0.0015) % (LW + 30) + LW + 30) % (LW + 30) - 15, cy = 3 + ((i * 7) % Math.max(3, gy - 26));
      rect(cx, cy, 9, 2, '#ffffff', 0.75); rect(cx + 2, cy - 1, 4, 1, '#ffffff', 0.75); rect(cx + 1, cy + 2, 7, 1, '#e6f1ff', 0.6);
    }
  }
  for (let i = 0, n = night ? (far ? 34 : 18) : 0; i < n; i++) {
    const sx = (Math.imul(i + 1, 2654435761) >>> 0) % LW, sy = 2 + (Math.imul(i + 7, 2246822519) >>> 0) % Math.max(4, gy - 18);
    if (sy < skyTop(sx) - 1) rect(sx, sy, 1, 1, '#fff', 0.3 + 0.5 * Math.abs(Math.sin(t / 700 + i * 2.1)));
  }
  const ridge = (par, base, amp, f1, f2, a) => {
    for (let x = 0; x < LW; x++) {
      const h = ridgeH(x, par, base, amp, f1, f2);
      rect(x, gy - h, 1, h, '#000', a);
    }
  };
  if (far) ridge(...FAR, 0.08);
  ridge(...MID, 0.13);
  ridge(0.35, Math.round(8 * sc), 4 * sc, 0.08, 0.19, 0.2);
  // Sol
  rect(0, gy, LW, LH - gy, '#000', 0.4);
  rect(0, gy, LW, 1, '#fff', 0.4);
  const g0 = Math.floor(wx / 7);
  for (let i = g0; i < g0 + LW / 7 + 2; i++) {
    const h = (Math.imul(i, 2654435761) >>> 0) % 100;
    const sx = i * 7 - wx;
    if (h < 55) rect(sx, gy + 2 + h % 4, 2, 1, '#fff', 0.14);
    if (h > 80) rect(sx, gy - 1, 1, 1, '#9be37a', 0.8);
  }

  // Choses du monde
  if (!out) {
    if (hero.nextX < wx) hero.nextX = wx + 30;
    while (hero.nextX < wx + LW + 24) heroSpawn();
    if (hero.charge >= HERO_BOSS_AT && !hero.things.some((e) => e.k === 'boss')) {
      // Jauge pleine : le boss arrive par la droite, on lui fait de la place.
      const bx = wx + LW + 8, hp = 14 + Math.min(16, hero.bosses * 2);
      hero.things = hero.things.filter((e) => e.x < bx - 30 || e.x > bx + 40 || e.k === 'tree' || e.k === 'bush' || e.k === 'flower');
      const type = HERO_BOSSES[Math.floor(Math.random() * HERO_BOSSES.length)];
      const pal = type === 'cat' ? HERO_CATS[Math.floor(Math.random() * HERO_CATS.length)] : null;
      hero.things.push({ k: 'boss', type, pal, hue: Math.floor(Math.random() * 360), x: bx, hp, max: hp, hit: -1e4 });
      hero.nextX = Math.max(hero.nextX, bx + 40);
      hero.parts.push({ k: 'txt', x: LW / 2 - 14, y: gy - 24, vy: -0.004, t0: t, txt: { slime: 'UN ROI SLIME !', skeleton: 'UN SQUELETTE GÉANT !', cat: 'UN CHAT GÉANT !' }[type], big: true });
    }
  }
  const things = hero.things;
  let struck = !tick, fightNow = false;
  for (let i = things.length - 1; i >= 0; i--) {
    const e = things[i], sx = e.x - wx;
    if (sx < -24 || (e.dead && t - e.dead > 220)) { things.splice(i, 1); continue; }
    const near = sx - hx;
    if (e.k === 'coin' && !e.dead && near < 5 && near > -4) {
      e.dead = t - 999;
      heroGain(1, sx, gy - e.y - 4);
      for (let j = 0; j < 3; j++) hero.parts.push({ k: 'spark', x: sx + 1, y: gy - e.y, vx: (Math.random() - 0.5) * 0.006, vy: -0.002 - Math.random() * 0.004, t0: t, hue: 48 });
    } else if (e.foe && !e.dead && ((!struck && near < 24 && near > 0) || (near < 7 && near > -2))) {
      // Coup d'épée sur le temps quand il est à portée (ou au contact, si le temps tarde)
      struck = true;
      e.dead = t; hero.atk = t; hero.kills++;
      heroGain(e.k === 'skeleton' || e.k === 'ghost' ? 4 : 3, sx, gy - 10); charge(4);
      for (let j = 0; j < 6; j++) hero.parts.push({ k: 'spark', x: sx + 4, y: gy - 3 - (e.k === 'bat' ? 7 : 0), vx: (Math.random() - 0.3) * 0.008, vy: -0.002 - Math.random() * 0.005, t0: t, hue: e.hue });
    } else if (e.k === 'rock' && !e.jumped && near < 11 && !fight) {
      // Saut par-dessus le rocher : assez long pour qu'il passe dessous
      e.jumped = true; hero.hopT = t;
      hero.hopD = clamp((near + e.w + 2) / Math.max(speed, 1) * 1000, 400, 1500);
    } else if (e.k === 'chest' && !e.open && near < 10 && near > 0) {
      e.open = t; heroGain(10, sx, gy - 11); charge(6);
      for (let j = 0; j < 8; j++) hero.parts.push({ k: 'spark', x: sx + 4, y: gy - 5, vx: (Math.random() - 0.5) * 0.009, vy: -0.003 - Math.random() * 0.005, t0: t, hue: 48 });
    } else if (e.k === 'boss' && !e.dead && near < 17) {
      fightNow = true;
      if (near < 14) e.x = wx + hx + 14; // le héros avance avec le temps : le roi recule, sans se laisser traverser
      if (!struck) { // un coup par temps
        struck = true;
        e.hp--; e.hit = t; hero.atk = t;
        for (let j = 0; j < 5; j++) hero.parts.push({ k: 'spark', x: sx + 2, y: gy - 6 - Math.random() * 6, vx: Math.random() * 0.008, vy: -0.002 - Math.random() * 0.004, t0: t, hue: bossHue(e) });
        if (e.hp <= 0) {
          e.dead = t; hero.bosses++; hero.kills++; hero.charge = 0;
          heroGain(50, sx, gy - 20);
          hero.parts.push({ k: 'txt', x: LW / 2 - 12, y: gy - 26, vy: -0.004, t0: t, txt: 'VICTOIRE !', big: true });
          for (let j = 0; j < 26; j++) hero.parts.push({ k: 'spark', x: sx + 10, y: gy - 8, vx: (Math.random() - 0.5) * 0.016, vy: -0.003 - Math.random() * 0.008, t0: t, hue: j % 2 ? 48 : bossHue(e) });
        }
      }
    }
    if (e.dead && (e.k === 'coin' || e.k === 'boss')) continue;
    if (e.k === 'boss') {
      // Trois boss au hasard : roi slime (couleur au hasard), squelette géant, chat géant ;
      // tous blanchissent sous le coup et ont leur barre de vie au-dessus.
      const flash = t - e.hit < 110, dk = '#1a1a2e';
      if (e.type === 'skeleton') {
        const c = flash ? '#ffffff' : '#ece6d6', sh = '#b9b2a2', dy = Math.round(Math.sin(t / 320)), st = Math.floor(t / 400) % 2;
        rect(sx + 5, gy - 21 + dy, 9, 6, c); rect(sx + 6, gy - 22 + dy, 7, 1, c); // crâne
        rect(sx + 6, gy - 19 + dy, 2, 2, dk); rect(sx + 11, gy - 19 + dy, 2, 2, dk);
        rect(sx + 7, gy - 18 + dy, 1, 1, '#ff5470'); rect(sx + 11, gy - 18 + dy, 1, 1, '#ff5470');
        rect(sx + 9, gy - 17 + dy, 1, 1, dk);
        rect(sx + 6, gy - 15 + dy, 7, 1, c); for (let i = 7; i < 13; i += 2) rect(sx + i, gy - 15 + dy, 1, 1, dk); // mâchoire
        rect(sx + 9, gy - 14 + dy, 2, 8, sh); // colonne
        for (const y of [13, 11, 9]) rect(sx + 6, gy - y + dy, 8, 1, c); // côtes
        rect(sx + 4, gy - 13 + dy, 2, 6, c); rect(sx + 14, gy - 13 + dy, 2, 7, c); // bras
        rect(sx + 7, gy - 6, 6, 2, c); // bassin
        rect(sx + 7 + st, gy - 4, 2, 4, c); rect(sx + 11 - st, gy - 4, 2, 4, c);
        rect(sx + 6 + st, gy - 1, 3, 1, sh); rect(sx + 11 - st, gy - 1, 3, 1, sh);
        rect(sx + 1, gy - 8 + dy, 4, 1, '#8a5a2b'); rect(sx + 2, gy - 9 + dy, 1, 3, '#c9a227'); // grande épée
        rect(sx + 2, gy - 20 + dy, 1, 11, '#c9d1dc'); rect(sx + 3, gy - 19 + dy, 1, 10, '#8f98a6'); rect(sx + 2, gy - 21 + dy, 1, 1, '#ffffff');
      } else if (e.type === 'cat') {
        const [c0, l0] = e.pal, c = flash ? '#ffffff' : c0, l = flash ? '#ffffff' : l0, w = Math.round(Math.sin(t / 250) * 1.5);
        const blink = Math.floor(t / 2600) % 5 === 0 && t % 2600 < 160;
        rect(sx + 7, gy - 10, 12, 10, c); rect(sx + 8, gy - 11, 9, 1, c); // corps assis
        rect(sx + 2, gy - 8, 6, 6, c); rect(sx + 3, gy - 7, 4, 5, l); // poitrail
        rect(sx + 2, gy - 2, 3, 2, l); rect(sx + 6, gy - 2, 3, 2, l); // pattes
        rect(sx, gy - 16, 10, 8, c); rect(sx + 1, gy - 17, 8, 1, c); // tête
        rect(sx + 1, gy - 19, 2, 2, c); rect(sx + 7, gy - 19, 2, 2, c); rect(sx + 1, gy - 18, 1, 1, '#ff9db5'); rect(sx + 8, gy - 18, 1, 1, '#ff9db5');
        rect(sx + 2, gy - 12, 6, 3, l); // museau
        if (blink) { rect(sx + 2, gy - 14, 2, 1, dk); rect(sx + 6, gy - 14, 2, 1, dk); }
        else { rect(sx + 2, gy - 15, 2, 2, '#9be37a'); rect(sx + 6, gy - 15, 2, 2, '#9be37a'); rect(sx + 2, gy - 15, 1, 2, dk); rect(sx + 6, gy - 15, 1, 2, dk); }
        rect(sx + 4, gy - 12, 2, 1, '#ff9db5'); rect(sx + 3, gy - 10, 1, 1, dk); rect(sx + 6, gy - 10, 1, 1, dk); rect(sx + 4, gy - 11, 2, 1, dk, 0.6);
        rect(sx - 3, gy - 12, 4, 1, '#ffffff', 0.7); rect(sx - 3, gy - 10, 4, 1, '#ffffff', 0.7); // moustaches
        rect(sx + 19, gy - 3, 2, 2, c); rect(sx + 20, gy - 5, 2, 2, c); rect(sx + 20 + w, gy - 7, 2, 2, c); rect(sx + 19 + w, gy - 9, 2, 2, c); // queue
        for (let i = 9; i < 18; i += 3) rect(sx + i, gy - 9, 1, 3, dk, 0.15); // rayures
      } else {
        // Roi slime : 20 × 14 pixels, couronne, sourcils froncés
        const sq = Math.round(Math.sin(t / 300) * 0.7 + 0.7);
        const c = flash ? '#ffffff' : `hsl(${e.hue ?? 285} 65% 52%)`, y0 = gy + sq;
        rect(sx + 5, y0 - 15, 10, 1, c); rect(sx + 3, y0 - 14, 14, 1, c); rect(sx + 2, y0 - 13, 16, 2, c);
        rect(sx + 1, y0 - 11, 18, 3, c); rect(sx, y0 - 8, 20, 8 - sq, c);
        rect(sx + 4, y0 - 13, 2, 1, '#fff', 0.55); rect(sx + 3, y0 - 12, 1, 2, '#fff', 0.4);
        rect(sx + 4, y0 - 9, 3, 1, dk); rect(sx + 13, y0 - 9, 3, 1, dk);
        rect(sx + 5, y0 - 8, 2, 2, dk); rect(sx + 13, y0 - 8, 2, 2, dk);
        rect(sx + 8, y0 - 4, 4, 1, dk);
        rect(sx + 6, y0 - 17, 8, 2, '#ffd23f'); rect(sx + 6, y0 - 19, 1, 2, '#ffd23f'); rect(sx + 9, y0 - 19, 2, 2, '#ffd23f'); rect(sx + 13, y0 - 19, 1, 2, '#ffd23f');
        rect(sx + 9, y0 - 17, 2, 1, '#ff5470');
      }
      rect(sx, gy - 23, 20, 1, '#000', 0.5); rect(sx, gy - 23, Math.max(0, Math.round(20 * e.hp / e.max)), 1, '#ff5470');
    } else if (e.k === 'coin') {
      const y = gy - e.y - 4, w = Math.abs(Math.cos(t / 260 + e.x)) > 0.35 ? 3 : 1;
      rect(sx + (3 - w) / 2, y, w, 4, '#ffd23f');
      if (w === 3) rect(sx + 1, y + 1, 1, 2, '#fff6b0');
    } else if (e.foe && e.dead) { // petit nuage quand il disparaît
      const fy = e.k === 'bat' ? gy - 8 : gy;
      rect(sx - 1, fy - 6, 10, 1, '#fff', 0.8); rect(sx + 1, fy - 8, 6, 1, '#fff', 0.5);
    } else if (e.k === 'mushroom') {
      const b = Math.round(Math.sin(t / 260 + e.x) * 0.5 + 0.5);
      rect(sx + 2, gy - 3, 4, 3, '#f1e3c8'); rect(sx + 2, gy - 2, 1, 1, '#1a1a2e'); rect(sx + 5, gy - 2, 1, 1, '#1a1a2e');
      rect(sx + 1, gy - 6 + b, 6, 1, '#e23b3b'); rect(sx, gy - 5 + b, 8, 2, '#e23b3b');
      rect(sx + 2, gy - 6 + b, 1, 1, '#fff'); rect(sx + 5, gy - 5 + b, 1, 1, '#fff'); rect(sx + 1, gy - 4 + b, 1, 1, '#fff', 0.8);
    } else if (e.k === 'goblin') {
      const st = Math.floor(t / 180 + e.x) % 2, c = '#5dbb4a';
      rect(sx + 1, gy - 9, 5, 4, c); rect(sx, gy - 8, 1, 2, c); rect(sx + 6, gy - 8, 1, 2, c);
      rect(sx + 2, gy - 8, 1, 1, '#ffd23f'); rect(sx + 4, gy - 8, 1, 1, '#ffd23f'); rect(sx + 2, gy - 6, 3, 1, '#1a1a2e');
      rect(sx + 1, gy - 5, 5, 3, '#7a4a2a'); rect(sx + 1 + st, gy - 2, 1, 2, c); rect(sx + 4 - st, gy - 2, 1, 2, c);
      rect(sx - 1, gy - 7, 1, 4, '#8a5a2b'); rect(sx - 2, gy - 8, 2, 2, '#6b4423'); // gourdin
    } else if (e.k === 'skeleton') {
      const st = Math.floor(t / 200 + e.x) % 2, c = '#ece6d6';
      rect(sx + 1, gy - 11, 5, 4, c); rect(sx + 2, gy - 10, 1, 1, '#1a1a2e'); rect(sx + 4, gy - 10, 1, 1, '#1a1a2e'); rect(sx + 2, gy - 8, 3, 1, '#9a9488');
      rect(sx + 3, gy - 7, 1, 5, c); rect(sx + 1, gy - 6, 5, 1, c); rect(sx + 2, gy - 4, 3, 1, c);
      rect(sx + 2 + st, gy - 2, 1, 2, c); rect(sx + 4 - st, gy - 2, 1, 2, c);
      rect(sx - 1, gy - 7, 1, 5, '#b8c0cc'); rect(sx - 1, gy - 8, 1, 1, '#ffffff'); // épée rouillée
    } else if (e.k === 'bat') {
      batAt(sx + 2, gy - 9 + Math.sin(t / 200 + e.x) * 1.5, Math.floor(t / 110 + e.x) % 2 === 0, -1);
    } else if (e.k === 'ghost') {
      const fy = gy - 4 + Math.round(Math.sin(t / 300 + e.x) * 1.5), c = '#e8f4ff';
      rect(sx + 2, fy - 7, 4, 1, c, 0.8); rect(sx + 1, fy - 6, 6, 5, c, 0.8);
      rect(sx + 1, fy - 1, 1, 1, c, 0.8); rect(sx + 3, fy - 1, 2, 1, c, 0.8); rect(sx + 6, fy - 1, 1, 1, c, 0.8);
      rect(sx + 2, fy - 5, 1, 2, '#1a1a2e'); rect(sx + 5, fy - 5, 1, 2, '#1a1a2e'); rect(sx + 3, fy - 2, 2, 1, '#1a1a2e', 0.6);
    } else if (e.k === 'slime') {
      const sq = Math.round(Math.sin(t / 220 + e.x) * 0.6 + 0.6), c = `hsl(${e.hue} 70% 55%)`;
      rect(sx + 2, gy - 5 + sq, 4, 1, c); rect(sx + 1, gy - 4 + sq, 6, 1, c); rect(sx, gy - 3 + sq, 8, 3 - sq, c);
      rect(sx + 2, gy - 4 + sq, 1, 1, '#fff', 0.6);
      rect(sx + 2, gy - 3 + sq, 1, 1, '#1a1a2e'); rect(sx + 5, gy - 3 + sq, 1, 1, '#1a1a2e');
    } else if (e.k === 'chest') {
      rect(sx, gy - 5, 8, 5, '#a8642a'); rect(sx, gy - 3, 8, 1, '#5b3414'); rect(sx + 3, gy - 4, 2, 2, '#ffd23f');
      if (e.open) { rect(sx, gy - 8, 8, 3, '#8a4f1e'); rect(sx + 1, gy - 5, 6, 1, '#ffe27a'); }
    } else if (e.k === 'tree') {
      rect(sx + 3, gy - 6, 2, 6, '#6b4423');
      rect(sx + 3, gy - 15, 2, 2, '#2f8f4e'); rect(sx + 2, gy - 13, 4, 2, '#2f8f4e'); rect(sx + 1, gy - 11, 6, 2, '#2f8f4e'); rect(sx, gy - 9, 8, 3, '#2f8f4e');
      rect(sx + 3, gy - 14, 1, 1, '#fff', 0.35);
    } else if (e.k === 'rock') {
      const w = e.w;
      rect(sx + 1, gy - 4, w - 2, 1, '#8a8f9c'); rect(sx, gy - 3, w, 3, '#6f7480');
      rect(sx + 1, gy - 4, 2, 1, '#b5bac4'); rect(sx + 1, gy - 3, 1, 1, '#9aa0ac');
      rect(sx + w - 2, gy - 2, 2, 2, '#4b4f59');
    } else if (e.k === 'bush') {
      rect(sx, gy - 3, 7, 3, '#3aa35a'); rect(sx + 1, gy - 4, 5, 1, '#3aa35a'); rect(sx + 2, gy - 3, 1, 1, '#7ddc8a');
    } else if (e.k === 'flower') {
      const c = `hsl(${e.hue} 90% 65%)`;
      rect(sx + 1, gy - 3, 1, 3, '#2f8f4e'); rect(sx, gy - 4, 3, 1, c); rect(sx + 1, gy - 5, 1, 3, c);
    }
  }

  hero.fight = fightNow;
  if (tick && !struck) charge(1); // temps sans ennemi à portée : la jauge se remplit

  // Arrivée : drapeau pendant le focus
  if (arrive) {
    const fx = LW - 8, wv = Math.round(Math.sin(t / 180));
    rect(fx, gy - 15, 1, 15, '#e8e8f0');
    rect(fx + 1, gy - 15, 5, 1, '#ff5470'); rect(fx + 1, gy - 14, 5 + wv, 1, '#ff5470'); rect(fx + 1, gy - 13, 4, 1, '#ff5470');
  }
  // Ruines derrière le camp (une au hasard à chaque pause, ou rien)
  if (camp && hero.ruin) {
    const c0 = Math.round(LW / 2), st = '#8b8f9e', dk = '#5d6170', a = 0.85;
    if (hero.ruin === 'wall') { // pan de mur écroulé, à gauche du héros
      const x0 = c0 - 34, tops = [9, 11, 12, 10, 8, 8, 6, 5, 6, 4, 3, 3, 2, 2];
      tops.forEach((h, i) => rect(x0 + i, gy - h, 1, h, st, a));
      for (let y = 2; y < 12; y += 2) for (let x = (y / 2) % 2 ? 0 : 2; x < 14; x += 4) if (y < tops[x]) rect(x0 + x, gy - y, 1, 1, dk, a);
      rect(x0 + 15, gy - 1, 2, 1, st, a); rect(x0 + 18, gy - 1, 1, 1, st, a);
    } else if (hero.ruin === 'columns') { // deux colonnes, l'une brisée
      for (const [x0, h] of [[c0 - 26, 16], [c0 + 16, 9]]) {
        rect(x0, gy - h, 4, h, st, a); rect(x0 + 1, gy - h, 1, h, '#a9adbb', a); rect(x0 + 3, gy - h, 1, h, dk, a);
        rect(x0 - 1, gy - 1, 6, 1, dk, a);
        if (h > 12) { rect(x0 - 1, gy - h - 1, 6, 1, st, a); rect(x0 - 1, gy - h - 2, 6, 1, dk, a); }
        else { rect(x0, gy - h - 1, 1, 1, st, a); rect(x0 + 2, gy - h - 1, 2, 1, st, a); }
      }
      rect(c0 + 22, gy - 2, 5, 2, st, a); // morceau tombé
    } else if (hero.ruin === 'arch') { // arche de pierre au-dessus du camp
      const x0 = c0 - 22, w = 44, h = 22;
      rect(x0, gy - h + 4, 3, h - 4, st, a); rect(x0 + w - 3, gy - h + 4, 3, h - 4, st, a);
      for (let i = 0; i < w; i++) rect(x0 + i, Math.round(gy - h + 4 - Math.sin(i / (w - 1) * Math.PI) * 5), 1, 3, i % 4 ? st : dk, a);
    } else { // tour en ruine au loin, à droite
      const x0 = c0 + 18;
      rect(x0, gy - 18, 8, 18, st, 0.6); rect(x0, gy - 20, 2, 2, st, 0.6); rect(x0 + 4, gy - 20, 2, 2, st, 0.6); rect(x0 + 7, gy - 19, 1, 1, st, 0.6);
      rect(x0 + 3, gy - 14, 2, 3, '#1a1a2e', 0.6); rect(x0 + 3, gy - 7, 2, 3, '#ffd23f', 0.35 + 0.15 * Math.sin(t / 400));
    }
  }
  // Feu de camp pendant la pause
  if (camp) {
    const cx = Math.round(LW / 2 - 12) + 16, fl = Math.sin(t / 90) * 0.5 + Math.sin(t / 37) * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient((cx + 2) * px, (gy - 3) * px, 0, (cx + 2) * px, (gy - 3) * px, (26 + fl * 2) * px);
    gl.addColorStop(0, 'rgba(255,154,60,0.45)'); gl.addColorStop(1, 'rgba(255,154,60,0)');
    ctx.globalAlpha = 0.45 + pulse * 0.25; ctx.fillStyle = gl;
    ctx.fillRect((cx - 30) * px, (gy - 30) * px, 64 * px, 34 * px);
    ctx.globalCompositeOperation = 'source-over';
    rect(cx - 3, gy - 2, 8, 2, '#6b4423'); rect(cx - 1, gy - 3, 4, 1, '#4a2f17');
    rect(cx - 1, gy - 5 - (fl > 0 ? 1 : 0), 4, 3, '#ff7b1c'); rect(cx, gy - 7 - (fl > 0.4 ? 1 : 0), 2, 3, '#ffd23f'); rect(cx, gy - 4, 2, 1, '#fff6b0');
  }

  // Le héros
  const col = {
    H: HERO_HELM[(lvl - 1) % HERO_HELM.length], S: '#f2c9a0', D: '#1a1a2e', B: '#3b6fd4', L: '#3b3f6b', R: HERO_SCARF[(lvl - 1) % HERO_SCARF.length],
  };
  const atk = t - hero.atk < 230;
  const hopA = (t - hero.hopT) / hero.hopD;
  const hop = phase === 'done' ? Math.abs(Math.sin(t / 130)) * 6 : (!sitting && hopA < 1 ? Math.sin(Math.PI * hopA) * (5 + hero.hopD / 400) : 0);
  const air = hop > 0.8;
  const top = gy - 12 - Math.round(hop) + (sitting ? 3 : 0);
  const fr = Math.floor(hero.step) % 2;
  HERO_BODY.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) if (row[rx] !== '.') rect(hx + rx, top + ry, 1, 1, col[row[rx]]);
  });
  const sw = sitting ? 0 : fr; // l'écharpe flotte
  rect(hx + 1, top + 4 + sw, 2, 1, col.R); rect(hx - 1 + sw, top + 4 + sw, 2, 1, col.R);
  if (sitting) {
    rect(hx + 3, top + 8, 5, 1, col.L); rect(hx + 6, top + 9, 4, 1, col.L); rect(hx + 9, top + 9, 1, 1, '#5b3414');
  } else if (air) {
    rect(hx + 3, top + 8, 5, 2, col.L); rect(hx + 3, top + 10, 2, 1, '#5b3414'); rect(hx + 6, top + 10, 2, 1, '#5b3414');
  } else if (fr === 0) {
    rect(hx + 2, top + 8, 2, 3, col.L); rect(hx + 7, top + 8, 2, 3, col.L); rect(hx + 1, top + 11, 3, 1, '#5b3414'); rect(hx + 7, top + 11, 3, 1, '#5b3414');
  } else {
    rect(hx + 4, top + 8, 2, 4, col.L); rect(hx + 6, top + 8, 2, 4, col.L); rect(hx + 4, top + 11, 4, 1, '#5b3414');
  }
  if (atk) { // coup d'épée et croissant blanc
    rect(hx + 8, top + 5, 7, 1, '#e8f0ff'); rect(hx + 7, top + 4, 1, 3, '#c9a227');
    const a = 1 - (t - hero.atk) / 230;
    for (const [dx, dy] of [[14, 1], [15, 2], [16, 3], [16, 4], [16, 5], [16, 6], [15, 7], [14, 8]]) rect(hx + dx, top + dy, 1, 1, '#fff', a * 0.9);
  } else {
    const o = sitting ? 2 : 0;
    rect(hx + 9, top + 2 + o, 1, 5, '#e8f0ff'); rect(hx + 8, top + 7 + o, 3, 1, '#c9a227');
  }
  if (sitting) {
    const z = (t / 900) % 1;
    ctx.globalAlpha = 1 - z; ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(3.4 * px)}px system-ui, sans-serif`;
    ctx.fillText('z', (hx + 6 + z * 3) * px, (top - 1 - z * 7) * px);
  }

  // Chauve-souris : de temps en temps, elle traverse le ciel pendant la pause
  if (camp && !hero.bat && Math.random() < dt / 9000) hero.bat = { t0: t, y: 3 + Math.random() * Math.max(2, gy - 22), dir: Math.random() < 0.5 ? 1 : -1, s: 0.018 + Math.random() * 0.014 };
  if (hero.bat) {
    const b = hero.bat, age = t - b.t0, bx = b.dir > 0 ? -6 + age * b.s : LW + 6 - age * b.s;
    if (!camp || bx < -8 || bx > LW + 8) hero.bat = null;
    else {
      batAt(bx, b.y + Math.sin(age / 240) * 3, Math.floor(age / 110) % 2 === 0, b.dir);
    }
  }

  // Étincelles et petits textes flottants
  for (let i = hero.parts.length - 1; i >= 0; i--) {
    const q = hero.parts[i], age = t - q.t0;
    if (age > 900) { hero.parts.splice(i, 1); continue; }
    const a = 1 - age / 900;
    if (q.k === 'spark') rect(q.x + q.vx * age, q.y + q.vy * age + 0.00001 * age * age, 1, 1, `hsl(${q.hue} 100% 65%)`, a);
    else {
      ctx.globalAlpha = a; ctx.fillStyle = q.big ? '#ffe27a' : '#fff';
      ctx.font = `bold ${Math.round((q.big ? 4.2 : 3.4) * px)}px system-ui, sans-serif`;
      ctx.fillText(q.txt, q.x * px, (q.y + q.vy * age) * px);
    }
  }

  // Compteur : pièces, niveau et sa progression
  const base = 15 * (lvl - 1) ** 2, next = 15 * lvl ** 2;
  ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(8 * k, 11 * k, 4 * k, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(11 * k)}px system-ui, sans-serif`; ctx.textBaseline = 'middle';
  ctx.fillText(`${hero.coins}   niv. ${lvl}`, 17 * k, 11.5 * k);
  ctx.globalAlpha = 0.22; ctx.fillRect(4 * k, 20 * k, 60 * k, 2 * k);
  ctx.globalAlpha = 0.85; ctx.fillRect(4 * k, 20 * k, 60 * k * clamp((hero.coins - base) / (next - base), 0, 1), 2 * k);
  // Jauge de combat : pleine, le roi slime arrive (elle clignote)
  const full = hero.charge >= HERO_BOSS_AT;
  ctx.fillStyle = '#ff5470';
  ctx.globalAlpha = 0.22; ctx.fillRect(4 * k, 25 * k, 60 * k, 2 * k);
  ctx.globalAlpha = full ? 0.55 + 0.45 * Math.abs(Math.sin(t / 200)) : 0.85;
  ctx.fillRect(4 * k, 25 * k, 60 * k * hero.charge / HERO_BOSS_AT, 2 * k);
  ctx.font = `600 ${Math.round(9 * k)}px system-ui, sans-serif`;
  ctx.globalAlpha = 0.8; ctx.fillText(hero.bosses ? `boss ×${hero.bosses}` : 'boss', 68 * k, 26.5 * k);
  ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = 1;
  if (hero.dirty && t - hero.lastSave > 4000) {
    hero.dirty = false; hero.lastSave = t;
    try { localStorage.setItem(LS_HERO, JSON.stringify({ coins: hero.coins, kills: hero.kills, bosses: hero.bosses, charge: Math.round(hero.charge) })); } catch { /* stockage indisponible */ }
  }
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
const miniTime = $('#mini-time');
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
  const show = S.breathShow, colors = show === 'colors' || show === 'both', grow = show === 'word' || show === 'both';
  if (kind && colors) {
    // Une teinte par étape : inspire, retiens, expire.
    const color = kind === 'inspire' ? S.breathInspireColor : kind === 'retiens' ? S.breathHoldColor : S.breathExpireColor;
    const glide = kind === 'retiens' ? Math.min(1.5, sec) : sec;
    setPulse(1, glide, color);
    // Le texte change de teinte à mi-chemin, quand le fond a assez changé.
    clearTimeout(inkTimer);
    inkTimer = setTimeout(() => breathInk(color), glide * 500);
  } else if (kind && show === 'word') {
    // Seul le mot montre la respiration : l'écran ne bouge pas.
  } else if (kind === 'inspire' || (!kind && k % 2 === 0)) setPulse(0, sec);
  else if (kind === 'expire' || !kind) setPulse(dark, sec);
  breathEl.textContent = kind;
  breathEl.classList.toggle('on', !!kind && (S.breathLabels || show === 'word'));
  // Le mot grandit pendant toute l'inspiration, rétrécit pendant l'expiration, et garde sa
  // taille quand on retient (plus grand quand il est seul à montrer le mouvement).
  if (grow && (kind === 'inspire' || kind === 'expire')) {
    breathEl.style.transitionDuration = `0.8s, ${sec}s`;
    breathEl.style.transform = kind === 'inspire' ? `scale(${show === 'word' ? 3 : 2.4})` : 'scale(1)';
  } else if (!grow) breathEl.style.transform = '';
  breathTimer = setTimeout(() => breathStep(k + 1), sec * 1000);
}

function breathStart() {
  breathOn = true;
  // On part « poumons vides » : écran sombre ; en couleurs, la première inspiration
  // glisse de la couleur de pause vers la teinte d'inspiration.
  const word = S.breathShow === 'word' && breathSteps()[0][0];
  body.classList.toggle('breath-word', !!word);
  if (S.breathShow === 'colors' || S.breathShow === 'both') setPulse(0, 0, S.breathInspireColor);
  else if (word) setPulse(0, 0);
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
  body.classList.remove('breath-word');
  breathEl.style.transitionDuration = '';
  breathEl.style.transform = '';
}

/* =========================================================
   Fenêtre : plein écran, notifications, écran allumé
   ========================================================= */

let weWentFullscreen = false, fullscreenPending = false;
let landWant = false, landFs = false; // vue en bande sur téléphone : plein écran + paysage (voir setLand)

function enterFullscreen() {
  if (!S.fullscreenOnBreak || document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen()
    .then(() => { weWentFullscreen = true; fullscreenPending = false; })
    // Sans geste de l'utilisateur, le navigateur refuse : on réessaie au prochain toucher.
    .catch(() => { fullscreenPending = true; });
}

function leaveFullscreen() {
  fullscreenPending = false;
  if (weWentFullscreen && document.fullscreenElement && !landWant) document.exitFullscreen().catch(() => {}); // la vue paysage garde le plein écran
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

// Les radios s'ajoutent dans js/defaults.js (testées avant : lecture depuis un autre site, pub).
function allStations() {
  return STATIONS.map((s) => (s.kind === 'tracks' ? { ...s, tracks: PLAYLISTS[s.id].tracks } : s));
}

const kindOf = (st) => st.kind;

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
window.addEventListener('pointerdown', (e) => { poke(); }, true);
// Plein écran et rotation demandent un geste : au doigt, Chrome ne le compte qu'au relâcher
// (pointerup), pas à l'appui (vu sur l'émulateur : rien ne se passait à pointerdown).
window.addEventListener('pointerup', () => {
  if (fullscreenPending && T.phase === 'break') enterFullscreen();
  if (landWant && !orientationLocked) lockLandscape();
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
  checkUpdate(); // c'est là qu'on regarde la version
  syncForm();
  libraryStatus();
  sheet.inert = false;
  sheet.classList.add('open');
  body.classList.add('ui');
  $('#btn-close').focus({ preventScroll: true });
}

function closeSettings() {
  settingsOpen = false;
  sheet.classList.remove('open');
  sheet.inert = true;
  $('#btn-settings').focus({ preventScroll: true });
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
  showRelevant();
}

// Un réglage n'apparaît que s'il sert : data-if="pulseOn breathColors" (et), « a|b » (ou),
// « !clé », « clé=valeur », « clé!=valeur ».
function showRelevant() {
  const test = (t) => {
    if (t.includes('|')) return t.split('|').some(test);
    if (t.startsWith('!')) return !getPath(t.slice(1));
    const m = t.match(/^(.+?)(!?=)(.*)$/);
    if (!m) return !!getPath(t);
    return (String(getPath(m[1])) === m[3]) === (m[2] === '=');
  };
  for (const el of $$('[data-if]', sheet)) el.hidden = !el.dataset.if.split(' ').every(test);
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
  showRelevant();
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
  // GitHub Pages laisse le navigateur garder chaque fichier 10 min : sans ceci, un simple
  // rechargement reprenait l'ancien js/app.js de sa mémoire. On les retélécharge tous.
  await Promise.all(['./', 'index.html', 'css/style.css', 'js/app.js', 'js/audio.js', 'js/defaults.js', 'js/sync.js', 'sw.js']
    .map((u) => fetch(u, { cache: 'reload' }).catch(() => {})));
  saveEverything();
  location.reload();
});

// Une version plus récente est-elle en ligne ? On relit `APP_VERSION` dans le js/app.js
// publié (revalidé auprès du site : le fichier n'est renvoyé que s'il a changé) : à
// l'ouverture, au retour au premier plan, quand la fenêtre reprend la main, à l'ouverture
// des Paramètres (au plus une fois par minute), et toutes les 10 min.
// Jamais de rechargement tout seul : un point sur « Paramètres », et le bouton
// « Mettre à jour l'appli » mis en avant.
let lastCheck = 0;
async function checkUpdate() {
  if (!navigator.onLine || Date.now() - lastCheck < 60000) return;
  lastCheck = Date.now();
  try {
    const res = await fetch('js/app.js?verif-version', { cache: 'no-cache' });
    const online = res.ok && /APP_VERSION = '([^']+)'/.exec(await res.text())?.[1];
    if (!online || online === APP_VERSION) return;
    $('#btn-settings').classList.add('has-update');
    $('#btn-update').classList.add('primary');
    if (versionEl) versionEl.textContent = `Version du ${APP_VERSION} · nouvelle version en ligne : ${online}`;
  } catch { /* hors ligne ou site injoignable : on réessaiera */ }
}
setTimeout(checkUpdate, 5000);
setInterval(checkUpdate, 10 * 60000);
window.addEventListener('focus', checkUpdate); // PC : une fenêtre restée affichée ne change pas de visibilité
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });

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

// Menu « Affichage » en haut à gauche : style du cadran et forme du mode Rythme en une liste
// (les formes sont reprises du menu des Paramètres). Seuls les affichages cochés dans
// Paramètres → Apparence → Affichages du menu y figurent, plus celui en cours.
const selLook = $('#sel-look');
const LOOKS = [
  { id: 'standard', name: 'Normal' },
  { id: 'reveur', name: 'Rêveur' },
  ...[...$('[data-k="rhythmForm"]').options].map((o) => ({ id: 'rythme:' + o.value, name: 'Rythme · ' + o.text.replace(/ \(.*\)$/, ''), group: 'Rythme (réagit à la musique)' })),
];
const currentLook = () => (S.dialStyle === 'rythme' ? 'rythme:' + S.rhythmForm : S.dialStyle);
function fillLook() {
  const cur = currentLook();
  fillSelect(selLook, LOOKS.filter((l) => l.id === cur || !S.hiddenLooks.includes(l.id)), cur);
  $('#look-picks').innerHTML = LOOKS.map((l) =>
    `<label class="pick">${l.name}<input type="checkbox" data-look="${l.id}"${S.hiddenLooks.includes(l.id) ? '' : ' checked'}></label>`).join('');
}
$('#look-picks').addEventListener('change', (e) => {
  const id = e.target.dataset.look;
  if (!id) return;
  S.hiddenLooks = S.hiddenLooks.filter((x) => x !== id);
  if (!e.target.checked) S.hiddenLooks.push(id);
  saveSettings();
  fillLook();
});
selLook.addEventListener('change', () => {
  const [style, form] = selLook.value.split(':');
  S.dialStyle = style;
  if (form) S.rhythmForm = form;
  saveSettings(); syncForm(); applySettings();
});

// Paysage : téléphone couché, ou vue « onde horizontale » sur un écran plus large que haut.
// Cette vue demande aussi à Android de rester en paysage (possible seulement pour l'appli
// installée ou en plein écran ; ailleurs, la demande est refusée sans bruit).
const landPhone = matchMedia('(orientation: landscape) and (max-height: 560px)');
const landWide = matchMedia('(orientation: landscape)');
// Chrome sur Android ne couche l'écran que si la page est en plein écran : sur un téléphone, les
// vues en bande (onde, petit héros) passent en plein écran puis en paysage, dès le choix de la vue
// ou au toucher suivant (il faut un geste). Changer de vue rend la rotation et quitte ce plein écran.
const touchPhone = matchMedia('(pointer: coarse)');
let orientationLocked = false;
function lockLandscape() {
  if (!landWant || orientationLocked) return;
  const lock = () => screen.orientation?.lock?.('landscape').then(() => { orientationLocked = true; }, () => {});
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) { lock(); return; }
  document.documentElement.requestFullscreen().then(() => { landFs = true; lock(); }, () => {});
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) { orientationLocked = false; landFs = false; } // sorti par le geste retour
});
function setLand() {
  const horizon = S.dialStyle === 'rythme' && S.rhythmForm === 'horizon';
  const wide = horizon || (S.dialStyle === 'rythme' && S.rhythmForm === 'heros'); // bande sous / à droite de l'horloge
  body.classList.toggle('horizon', wide);
  body.classList.toggle('hero', wide && !horizon);
  body.classList.toggle('land', landPhone.matches || (wide && landWide.matches));
  landWant = wide && touchPhone.matches;
  if (landWant) lockLandscape();
  else {
    if (orientationLocked) {
      orientationLocked = false;
      try { screen.orientation.unlock(); } catch { /* rien à libérer */ }
    }
    if (landFs && document.fullscreenElement && !weWentFullscreen) document.exitFullscreen().catch(() => {});
    landFs = false;
  }
}
landPhone.addEventListener('change', setLand);
landWide.addEventListener('change', setLand);

function applySettings() {
  fillLook();
  setLand();
  const st = document.documentElement.style;
  st.setProperty('--fg', S.textColor);
  st.setProperty('--dial', S.dialColor);
  body.classList.toggle('dial-reveur', S.dialStyle === 'reveur');
  if (breathOn) breathStop(); // nouveau rythme : render() la relance
  audio.resumeLive = S.radioResume !== 'continuer';
  body.classList.toggle('dial-rythme', S.dialStyle === 'rythme');
  body.classList.toggle('slow-glow', S.slowGlow && S.dialStyle === 'standard');
  audio.wantAnalysis = S.dialStyle === 'rythme';
  if (audio.wantAnalysis && audio.musicOn) audio.enableAnalysis(); // relance la radio, analysable
  rhythmStart();
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
  setScene();

  const wantBreath = p === 'break' && S.pulseOn && !T.breakEnded && !demo;
  if (wantBreath !== breathOn) { if (wantBreath) breathStart(); else breathStop(); }

  const bg = demo ? day.color : p === 'break' ? T.breakColor || S.breakColor : S.dayGradient ? day.color : S.fixedColor;
  if (bg !== lastBg) {
    lastBg = bg;
    document.documentElement.style.setProperty('--bg', bg);
    // Niveau liquide : la couleur inverse du fond.
    document.documentElement.style.setProperty('--liquid', rgbToHex(hexToRgb(bg).map((v) => 255 - v)));
    $('meta[name="theme-color"]').setAttribute('content', bg);
  }

  drawDial(p === 'idle' ? rem : p === 'done' ? 0 : rem);
  setText(els.time, p === 'done' ? 'terminé' : fmt(rem));
  if (p === 'focus') setText(miniTime, fmt(rem)); // petit temps du mode Brisure

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
  if (S.dialStyle === 'rythme' && rhythm.bpm && (p === 'focus' || p === 'break')) sub += ` · ${rhythm.bpm} BPM`;
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
