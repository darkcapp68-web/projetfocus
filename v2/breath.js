// Respiration guidée par le SON, pour la pause : on n'a pas besoin de regarder l'écran.
// Trois dings faciles à retenir (07/11, idée de l'utilisateur), un par action :
//   aigu  = inspire      moyen = retiens      grave = expire
// Un cycle de respiration est fabriqué une fois en mémoire (les dings placés aux bons
// moments), puis joué EN BOUCLE par le moteur audio : le rythme est tenu par l'horloge
// audio, pas par des minuteurs de la page, donc il ne dérive pas et continue écran éteint.

export const RHYTHMS = [
  { id: 'coherence', name: 'Cohérence cardiaque (5 s / 5 s)', steps: [['inspire', 5], ['expire', 5]] },
  { id: 'apaisante', name: 'Apaisante (4 s / 6 s)', steps: [['inspire', 4], ['expire', 6]] },
  { id: 'carree', name: 'Carrée (4-4-4-4)', steps: [['inspire', 4], ['retiens', 4], ['expire', 4], ['retiens', 4]] },
  { id: '478', name: '4-7-8 (pour se détendre)', steps: [['inspire', 4], ['retiens', 7], ['expire', 8]] },
  { id: 'aucune', name: 'Aucun son de respiration', steps: null },
];

// Les trois notes : do aigu, mi moyen, sol grave (écart net, même volume).
export const NOTES = { inspire: 1046.5, retiens: 659.3, expire: 392 };
export const WORDS = { inspire: 'inspire', retiens: 'retiens', expire: 'expire' };

const TAIL = 2.4; // secondes de résonance d'un ding

// Un ding de cloche : attaque de 8 ms (pas de claquement), puis résonance qui s'éteint.
function ding(freq, rate) {
  const n = Math.floor(rate * TAIL);
  const out = new Float32Array(n);
  const parts = [[1, 1, 0.9], [2.76, 0.28, 0.35], [5.4, 0.1, 0.15]]; // multiple, niveau, durée de vie
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const attack = Math.min(1, t / 0.008);
    let v = 0;
    for (const [m, lv, tau] of parts) v += lv * Math.sin(2 * Math.PI * freq * m * t) * Math.exp(-t / tau);
    out[i] = v * attack;
    peak = Math.max(peak, Math.abs(out[i]));
  }
  const k = peak ? 0.55 / peak : 0; // même volume pour les trois notes
  for (let i = 0; i < n; i++) out[i] *= k;
  return out;
}

// Un tour de respiration : les dings aux bons moments ; la résonance de la fin revient au
// début (la boucle ne s'entend pas).
export function renderCycle(steps, rate) {
  const total = steps.reduce((a, [, s]) => a + s, 0);
  const len = Math.round(total * rate);
  const out = new Float32Array(len);
  let at = 0;
  for (const [name, secs] of steps) {
    const d = ding(NOTES[name], rate);
    const start = Math.round(at * rate);
    for (let i = 0; i < d.length; i++) out[(start + i) % len] += d[i];
    at += secs;
  }
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.95) for (let i = 0; i < len; i++) out[i] *= 0.95 / peak;
  return out;
}

export function createBreath() {
  let ctx = null, src = null, gain = null, steps = null, cycle = 0, t0 = 0;
  const cache = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      // Mode « playback » : grande réserve de son, moins de craquements si le téléphone est occupé.
      try { ctx = new AC({ latencyHint: 'playback' }); } catch { ctx = new AC(); }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const makeBuffer = (c, data) => {
    const b = c.createBuffer(1, data.length, c.sampleRate);
    b.copyToChannel(data, 0);
    return b;
  };

  // Lance la respiration (à appeler depuis un geste : toucher, clic). Faux si « aucune ».
  function start(rhythmId, volume) {
    stop();
    const r = RHYTHMS.find((x) => x.id === rhythmId);
    if (!r?.steps) return false;
    const c = ensure();
    if (!c) return false;
    cache[r.id] ||= makeBuffer(c, renderCycle(r.steps, c.sampleRate));
    const s = c.createBufferSource();
    s.buffer = cache[r.id];
    s.loop = true;
    const g = c.createGain();
    g.gain.value = Math.max(0, Math.min(1, volume));
    s.connect(g).connect(c.destination);
    s.start(c.currentTime + 0.15); // un court instant pour que le premier ding soit propre
    src = s; gain = g; steps = r.steps;
    cycle = r.steps.reduce((a, [, sec]) => a + sec, 0);
    t0 = Date.now() + 150;
    return true;
  }

  function stop() {
    const s = src, g = gain;
    src = gain = null;
    if (!s) return;
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => { try { s.stop(); } catch { /* déjà arrêté */ } g.disconnect(); }, 800);
  }

  function setLevel(v) {
    if (gain) gain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.1);
  }

  // L'action en cours (pour l'écran, à titre d'indication) : « inspire », « retiens », « expire ».
  function word() {
    if (!src) return '';
    const e = (Date.now() - t0) / 1000;
    if (e < 0) return '';
    let t = e % cycle;
    for (const [name, sec] of steps) {
      if (t < sec) return WORDS[name];
      t -= sec;
    }
    return '';
  }

  // Pour apprendre les trois sons : inspire, retiens, expire, l'un après l'autre.
  function preview(volume) {
    const c = ensure();
    if (!c) return;
    ['inspire', 'retiens', 'expire'].forEach((name, k) => {
      const key = 'ding:' + name;
      cache[key] ||= makeBuffer(c, ding(NOTES[name], c.sampleRate));
      const s = c.createBufferSource();
      s.buffer = cache[key];
      const g = c.createGain();
      g.gain.value = Math.max(0, Math.min(1, volume));
      s.connect(g).connect(c.destination);
      s.start(c.currentTime + 0.1 + k * 1.8);
    });
  }

  return { start, stop, setLevel, word, preview, get playing() { return !!src; } };
}
