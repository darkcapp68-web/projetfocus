// projetfocus 2.0 — socle : Paramètres, radio, volume. Rien de plus pour l'instant.
'use strict';

const APP_VERSION = '07/11/2026 · 07h09';

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

/* ---------- Radio ---------- */
// Jouée par le lecteur du téléphone (balise audio), sans passer par le moteur audio de la
// page : c'est ce qui faisait craquer le son de la 1.0 quand le téléphone était occupé.
const RADIO = {
  name: 'Radio Technolovers Minimal',
  desc: 'minimal techno',
  url: 'https://stream.technolovers.fm/minimal',
};

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

function radioOn() {
  wantOn = true;
  // Une radio repart toujours en direct : on recharge le flux.
  player.crossOrigin = 'anonymous'; // permet d'analyser le son pour l'onde (la radio l'autorise)
  player.src = RADIO.url;
  player.volume = volume.value / 100;
  setState('Connexion…');
  player.play().catch(() => { if (wantOn) { wantOn = false; setState('Lecture refusée, touche encore ▶'); renderRadio(); } });
  renderRadio();
}

function radioOff() {
  wantOn = false;
  player.pause();
  player.removeAttribute('src');
  player.load(); // coupe vraiment la connexion au flux
  setState(RADIO.desc);
  renderRadio();
  wave.settle();
}

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

if ('mediaSession' in navigator && window.MediaMetadata) {
  navigator.mediaSession.metadata = new MediaMetadata({ title: RADIO.name, artist: RADIO.desc, album: 'projetfocus 2' });
  navigator.mediaSession.setActionHandler('play', radioOn);
  navigator.mediaSession.setActionHandler('pause', radioOff);
  navigator.mediaSession.setActionHandler('stop', radioOff);
}

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
    const mid = H / 2, step = 7 * k, bw = 2.6 * k, n = Math.floor(W / step);
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const f = i / Math.max(1, n - 1);
      // Chaque barre a sa propre sensibilité (son maximum récent) : les aigus bougent aussi.
      const raw = level ? level(Math.floor(2 * Math.pow(95, f))) : 0;
      const top = hzMax[i] = Math.max(raw, (hzMax[i] || 0.2) * 0.997, 0.1);
      const s = hz[i] = Math.max(raw / top, (hz[i] || 0) * 0.9);
      const env = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, f * 1.15)); // plus haut vers le milieu
      const a = Math.max(1.5 * k, (0.03 + 0.97 * s ** 1.3) * mid * 0.94 * env);
      const x = i * step + (step - bw) / 2, hue = 188 + f * 87;
      g.globalAlpha = 0.16;
      g.fillStyle = `hsl(${hue} 100% 60%)`;
      g.fillRect(x - bw * 0.8, mid - a - k, bw * 2.6, 2 * a + 2 * k); // halo
      g.globalAlpha = 0.9;
      g.fillStyle = `hsl(${hue} 100% 72%)`;
      g.fillRect(x, mid - a, bw, 2 * a);
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
  store.set('volume', Number(volume.value));
});

/* ---------- Horloge ---------- */
// Cadran de la 1.0 (style « Normal ») : on le tourne pour régler le temps du focus, de 1 à
// 90 min (07/11, demande de l'utilisateur ; 60 dans la 1.0), comme un minuteur de cuisine. L'arc part de la position du temps et finit à midi ;
// le point est en tête. Graduations visibles pendant le réglage. Le temps choisi est gardé.
// Pour l'instant l'horloge ne fait que régler : son comportement viendra ensuite.
const clock = (() => {
  const dial = $('#dial'), arc = $('#arc'), knob = $('#knob'), time = $('#time');
  const R = 128, CIRC = 2 * Math.PI * R;
  const MAX = 90, DEG = 360 / MAX; // un tour complet = 90 min, 4° par minute
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let minutes = clamp(Math.round(store.get('focusMin', 25)) || 25, 1, MAX);
  let dragging = false, prev = 0, ticksTimer = 0;

  (function buildTicks() {
    const g = $('#ticks'), ns = 'http://www.w3.org/2000/svg';
    for (let m = 0; m < MAX; m++) {
      // Comme un minuteur de cuisine : les minutes se lisent dans le sens inverse des aiguilles.
      const a = ((360 - m * DEG) % 360) * Math.PI / 180;
      const major = m % 5 === 0;
      const r1 = major ? 112 : 117, r2 = 122;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', 150 + r1 * Math.sin(a)); l.setAttribute('y1', 150 - r1 * Math.cos(a));
      l.setAttribute('x2', 150 + r2 * Math.sin(a)); l.setAttribute('y2', 150 - r2 * Math.cos(a));
      if (major) l.classList.add('major');
      g.appendChild(l);
      if (m % 10 === 0) { // chiffres toutes les 10 min
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', 150 + 99 * Math.sin(a)); t.setAttribute('y', 150 - 99 * Math.cos(a));
        t.textContent = m;
        g.appendChild(t);
      }
    }
  })();

  // Arc et point pour un temps donné (en secondes).
  function draw(sec) {
    const min = clamp(sec / 60, 0, MAX);
    const len = (min / MAX) * CIRC;
    arc.style.strokeDasharray = `${len} ${CIRC}`;
    arc.style.strokeDashoffset = `${len - CIRC}`;
    arc.style.opacity = len < 0.5 ? 0 : 1;
    const a = (360 - min * DEG) * Math.PI / 180;
    knob.setAttribute('cx', 150 + R * Math.sin(a));
    knob.setAttribute('cy', 150 - R * Math.cos(a));
    knob.style.opacity = min <= 0 ? 0 : 1;
    const s = Math.max(0, Math.round(sec));
    time.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function set(m) {
    minutes = clamp(Math.round(m), 1, MAX);
    dial.setAttribute('aria-valuenow', String(minutes));
    draw(minutes * 60);
  }

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
    return { m: Math.round((360 - a) / DEG), dist: Math.hypot(dx, dy) / (r.width / 2) };
  }

  const save = () => store.set('focusMin', minutes);

  dial.addEventListener('pointerdown', (e) => {
    showTicks();
    const { m, dist } = fromPointer(e);
    if (dist < 0.35) return; // le centre ne règle rien
    dragging = true;
    dial.setPointerCapture(e.pointerId);
    document.body.classList.add('adjusting');
    prev = clamp(m, 1, MAX);
    set(prev);
  });
  dial.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    let { m } = fromPointer(e);
    // Pas de saut de 90 à 0 en passant par midi : on bute comme un vrai minuteur.
    if (Math.abs(m - prev) > MAX / 2) m = prev > MAX / 2 ? MAX : 1;
    m = clamp(m, 1, MAX);
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
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (!step) return;
    e.preventDefault();
    showTicks(); set(minutes + step); save();
  });
  dial.addEventListener('wheel', (e) => {
    e.preventDefault();
    showTicks(); set(minutes + (e.deltaY < 0 ? 1 : -1)); save();
  }, { passive: false });

  set(minutes);
  return { get minutes() { return minutes; }, draw };
})();

/* ---------- Paramètres ---------- */
const dlg = $('#settings');
$('#version').textContent = APP_VERSION;
$('#btn-settings').addEventListener('click', () => { dlg.showModal(); checkUpdate(); });
$('#btn-close').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // toucher à côté ferme

/* ---------- Mise à jour ---------- */
// L'appli relit la version publiée ; si elle a changé, un point bleu s'allume sur
// « Paramètres ». Jamais de rechargement tout seul.
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
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
