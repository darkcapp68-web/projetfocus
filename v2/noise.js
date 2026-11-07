// Bruits de fond générés (Web Audio, aucun fichier) : pluie, orage lointain, vent, neige,
// café. Repris de la 1.0 (js/audio.js) ; à revoir plus tard (demande de l'utilisateur, 07/11).


const LOOP_SECONDS = 12;
const FADE_SECONDS = 0.6; // fondu entre la fin et le début de la boucle
const TARGET_RMS = 0.12;
const MIRRORS = ['ice1', 'ice2', 'ice5', 'ice6'];

function whiteSample() { return Math.random() * 2 - 1; }

function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Remplit chaque canal ; `gen` reçoit (tableau, fréquence, objet partagé entre les canaux).
function makeLoop(ctx, gen, seconds = LOOP_SECONDS, channels = 2) {
  const rate = ctx.sampleRate;
  const n = Math.floor(seconds * rate);
  const f = Math.floor(FADE_SECONDS * rate);
  const buf = ctx.createBuffer(channels, n, rate);
  let sum = 0;
  const raw = [];
  const shared = {};
  for (let c = 0; c < channels; c++) {
    const data = new Float32Array(n + f);
    gen(data, rate, shared);
    // La fin de la boucle se fond dans son début : pas de clic à la jonction.
    for (let i = 0; i < f; i++) {
      const t = i / f;
      data[i] = data[i] * t + data[n + i] * (1 - t);
    }
    for (let i = 0; i < n; i++) sum += data[i] * data[i];
    raw.push(data);
  }
  const k = TARGET_RMS / Math.sqrt(sum / (n * channels) || 1);
  raw.forEach((data, c) => {
    const out = buf.getChannelData(c);
    for (let i = 0; i < n; i++) out[i] = data[i] * k;
  });
  return buf;
}

function pink(data) {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const w = whiteSample();
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
}

function brown(data) {
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * whiteSample()) / 1.02;
    data[i] = last * 3.5;
  }
}

function lowpass(data, rate, hz) {
  const a = 1 - Math.exp(-2 * Math.PI * hz / rate);
  let y = 0;
  for (let i = 0; i < data.length; i++) { y += a * (data[i] - y); data[i] = y; }
}

function highpass(data, rate, hz) {
  const rc = 1 / (2 * Math.PI * hz), dt = 1 / rate, a = rc / (rc + dt);
  let y = 0, prev = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i];
    y = a * (y + x - prev);
    prev = x;
    data[i] = y;
  }
}

// Courbe lente et irrégulière entre 0 et 1 (somme de sinus), la même pour les deux canaux.
function slowCurve(shared, key, count, fMin, fMax) {
  const lfo = shared[key] ||= Array.from({ length: count }, () => ({
    f: fMin + Math.random() * (fMax - fMin), p: Math.random() * 2 * Math.PI,
  }));
  return (t) => {
    let s = 0;
    for (const o of lfo) s += Math.sin(2 * Math.PI * o.f * t + o.p);
    return Math.max(0, Math.min(1, 0.5 + 0.8 * s / count));
  };
}

// Pluie : un fond doux + des milliers de petites gouttes.
// `perSec` gouttes par seconde ; `bright` coupe les aigus (pluie lointaine si bas).
const rain = (perSec, bright) => (data, rate) => {
  pink(data);
  lowpass(data, rate, bright);
  for (let i = 0; i < data.length; i++) data[i] *= 0.35;
  const drops = Math.floor((data.length / rate) * perSec);
  for (let d = 0; d < drops; d++) {
    const start = Math.floor(Math.random() * data.length);
    const len = Math.floor(rate * (0.003 + Math.random() * 0.025));
    const amp = 0.05 + 0.9 * Math.random() ** 3;
    const tau = len / 4;
    const bright = 0.2 + Math.random() * 0.7;
    let y = 0;
    for (let j = 0; j < len && start + j < data.length; j++) {
      y += bright * (whiteSample() - y);
      data[start + j] += y * amp * Math.exp(-j / tau);
    }
  }
  if (bright < 4000) lowpass(data, rate, bright);
};

// Vent : un souffle filtré dont la hauteur et la force montent et descendent par rafales.
function wind(data, rate, shared) {
  const gust = slowCurve(shared, 'gust', 4, 0.02, 0.12);
  let low = 0, band = 0, body = 0;
  for (let i = 0; i < data.length; i++) {
    const g = gust(i / rate);
    const fc = 170 + 620 * g;
    const f = 2 * Math.sin(Math.PI * fc / rate);
    const x = whiteSample();
    // Filtre passe-bande à état variable : la fréquence peut bouger à chaque échantillon.
    low += f * band;
    band += f * (x - low - 0.65 * band);
    body += 0.01 * (x - body);
    data[i] = (band * 0.8 + body * 2.5) * (0.2 + 0.8 * g ** 1.6);
  }
  // Sans ça, il reste un souffle aigu qui ressemble au bruit blanc.
  lowpass(data, rate, 1100);
  lowpass(data, rate, 1100);
}

// Neige : le silence feutré d'un paysage enneigé, un souffle très doux,
// et de rares tintements cristallins au loin.
function snow(data, rate, shared) {
  brown(data);
  lowpass(data, rate, 380);
  const breath = slowCurve(shared, 'breath', 3, 0.03, 0.1);
  const air = slowCurve(shared, 'air', 3, 0.02, 0.08);
  let y = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / rate;
    const w = whiteSample();
    y += 0.45 * (w - y);
    const hiss = w - y; // seulement les aigus : le froissement des flocons
    data[i] = data[i] * (0.65 + 0.35 * breath(t)) + hiss * 0.025 * air(t);
  }
  const pings = 3 + Math.floor(Math.random() * 3);
  for (let p = 0; p < pings; p++) {
    const start = Math.floor(Math.random() * data.length);
    const f = 2600 + Math.random() * 2400;
    const tau = rate * (0.4 + Math.random() * 0.5);
    const amp = 0.006 + Math.random() * 0.008;
    for (let j = 0; j < tau * 5 && start + j < data.length; j++) {
      data[start + j] += amp * Math.exp(-j / tau) * Math.sin(2 * Math.PI * f * j / rate) * Math.min(1, j / (rate * 0.02));
    }
  }
}

// Un grondement d'orage lointain (quelques roulements graves qui s'éteignent lentement).
function thunderBuffer(ctx) {
  const rate = ctx.sampleRate;
  const n = Math.floor(rate * 9);
  const buf = ctx.createBuffer(2, n, rate);
  const rolls = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
    at: Math.random() * 3, tau: 1.2 + Math.random() * 2, amp: 0.4 + Math.random() * 0.6,
  }));
  const chans = [0, 1].map(() => {
    const data = new Float32Array(n);
    brown(data);
    lowpass(data, rate, 160);
    lowpass(data, rate, 160);
    for (let i = 0; i < n; i++) {
      const t = i / rate;
      let env = 0;
      for (const r of rolls) if (t > r.at) env += r.amp * (1 - Math.exp(-(t - r.at) / 0.3)) * Math.exp(-(t - r.at) / r.tau);
      data[i] *= env;
    }
    return data;
  });
  let peak = 0;
  for (const d of chans) for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
  const side = Math.random() < 0.5 ? 0 : 1; // vient plutôt d'un côté
  chans.forEach((d, c) => {
    const k = (0.5 / (peak || 1)) * (c === side ? 1 : 0.6);
    const out = buf.getChannelData(c);
    for (let i = 0; i < n; i++) out[i] = d[i] * k;
  });
  return buf;
}

// Café : un murmure de voix lointaines + quelques tintements de tasses.
function cafe(data, rate) {
  pink(data);
  lowpass(data, rate, 900);
  highpass(data, rate, 180);
  const lfo = [0, 1, 2].map(() => ({ f: 0.05 + Math.random() * 0.3, p: Math.random() * 6.28 }));
  for (let i = 0; i < data.length; i++) {
    const t = i / rate;
    let env = 0.55;
    for (const o of lfo) env += 0.15 * Math.sin(2 * Math.PI * o.f * t + o.p);
    data[i] *= env;
  }
  const clinks = 7 + Math.floor(Math.random() * 5);
  for (let c = 0; c < clinks; c++) {
    const start = Math.floor(Math.random() * data.length);
    const f = 1800 + Math.random() * 3000;
    const tau = rate * (0.05 + Math.random() * 0.18);
    const amp = 0.04 + Math.random() * 0.1;
    const len = Math.floor(tau * 6);
    for (let j = 0; j < len && start + j < data.length; j++) {
      const t = j / rate;
      data[start + j] += amp * Math.exp(-j / tau) *
        (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t));
    }
  }
}


const GENERATORS = {
  pluie: { gen: rain(450, 5000) },
  orage: { gen: rain(140, 2200), thunder: true },
  vent: { gen: wind, seconds: 30 },
  neige: { gen: snow, seconds: 24 },
  cafe: { gen: cafe },
};


export const NOISES = [
  { id: 'none', name: 'Aucun bruit' },
  { id: 'pluie', name: 'Pluie' },
  { id: 'orage', name: 'Orage lointain' },
  { id: 'vent', name: 'Vent' },
  { id: 'neige', name: 'Neige' },
  { id: 'cafe', name: 'Café' },
];

// Petit moteur de bruit de fond. Le contexte audio est en mode « playback » (grande réserve
// de son) : il craque moins quand le téléphone est occupé. À créer / démarrer depuis un geste.
export function createNoise() {
  let ctx = null, gain = null, src = null, id = 'none', level = 0.3, thunderTimer = 0, thunders = null;
  const buffers = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC({ latencyHint: 'playback' }); } catch { ctx = new AC(); }
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Les grondements arrivent à des moments imprévisibles, jamais en boucle.
  function thunderLater(first) {
    const wait = first ? 4000 + Math.random() * 6000 : 18000 + Math.random() * 30000;
    clearTimeout(thunderTimer);
    thunderTimer = setTimeout(() => {
      if (!src || !GENERATORS[id]?.thunder) return;
      thunders ||= [0, 1, 2].map(() => thunderBuffer(ctx));
      const s = ctx.createBufferSource();
      s.buffer = thunders[Math.floor(Math.random() * thunders.length)];
      s.playbackRate.value = 0.8 + Math.random() * 0.35;
      s.connect(gain);
      s.start();
      thunderLater(false);
    }, wait);
  }

  function set(next) {
    if (next === id && (next === 'none' || src)) return;
    id = next;
    clearTimeout(thunderTimer);
    if (next === 'none' && !ctx) return;
    const c = ensure();
    if (!c) return;
    const old = src;
    src = null;
    if (old) {
      gain.gain.setTargetAtTime(0, c.currentTime, 0.15);
      setTimeout(() => { try { old.stop(); } catch { /* déjà arrêté */ } }, 700);
    }
    if (next === 'none' || !GENERATORS[next]) return;
    const begin = () => {
      if (id !== next) return;
      const def = GENERATORS[next];
      buffers[next] ||= makeLoop(c, def.gen, def.seconds);
      const s = c.createBufferSource();
      s.buffer = buffers[next];
      s.loop = true;
      s.connect(gain);
      s.start();
      src = s;
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.setTargetAtTime(level, c.currentTime, 0.5);
      if (def.thunder) thunderLater(true);
    };
    setTimeout(begin, old ? 700 : 0);
  }

  function setLevel(v) {
    level = Math.max(0, Math.min(1, v));
    if (ctx && src) gain.gain.setTargetAtTime(level, ctx.currentTime, 0.5);
  }

  return { set, setLevel, get playing() { return id !== 'none' && !!src; } };
}
