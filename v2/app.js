// projetfocus 2.0 — socle : Paramètres, radio, volume. Rien de plus pour l'instant.
'use strict';

const APP_VERSION = '07/11/2026 · 07h06';

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
