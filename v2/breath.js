// Respiration guidée par le SON, pour la pause : on n'a pas besoin de regarder l'écran.
// Trois sons faciles à retenir (07/11, idée de l'utilisateur), un par action :
//   aigu  = inspire      moyen = retiens      grave = expire
// Un cycle de respiration est fabriqué une fois en mémoire (les sons placés aux bons
// moments), puis joué EN BOUCLE par le moteur audio : le rythme est tenu par l'horloge
// audio, pas par des minuteurs de la page, donc il ne dérive pas et continue écran éteint.
//
// Les sons viennent de fichiers si on en fournit (dossier audio/respiration/, voir le
// README qui s'y trouve) ; sinon, de simples notes de cloche fabriquées ici.

export const RHYTHMS = [
  { id: 'coherence', name: 'Cohérence cardiaque (5 s / 5 s)', steps: [['inspire', 5], ['expire', 5]] },
  { id: 'apaisante', name: 'Apaisante (4 s / 6 s)', steps: [['inspire', 4], ['expire', 6]] },
  { id: 'carree', name: 'Carrée (4-4-4-4)', steps: [['inspire', 4], ['retiens', 4], ['expire', 4], ['retiens', 4]] },
  { id: '478', name: '4-7-8 (pour se détendre)', steps: [['inspire', 4], ['retiens', 7], ['expire', 8]] },
  { id: 'aucun', name: 'Aucun (pas de respiration guidée)', steps: null },
];

// Les étapes d'un rythme (« aucun » n'en a pas : rien n'est guidé).
export function stepsFor(id) {
  return RHYTHMS.find((x) => x.id === id)?.steps || null;
}

// Où en est-on, `elapsed` secondes après le début ? { i, kind, secs, p (0 à 1), cycle }.
export function stepAt(steps, elapsed) {
  const total = steps.reduce((a, [, s]) => a + s, 0);
  let t = ((elapsed % total) + total) % total;
  for (let i = 0; i < steps.length; i++) {
    const [kind, secs] = steps[i];
    if (t < secs) return { i, kind, secs, p: t / secs, cycle: Math.floor(elapsed / total) };
    t -= secs;
  }
  return { i: 0, kind: steps[0][0], secs: steps[0][1], p: 0, cycle: 0 };
}

// Les trois notes : do aigu, mi moyen, sol grave (écart net, même volume).
export const NOTES = { inspire: 1046.5, retiens: 659.3, expire: 392 };

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

// Un tour de respiration : les sons aux bons moments ; la résonance de la fin revient au
// début (la boucle ne s'entend pas). `samples` : sons fournis par fichier, par action.
export function renderCycle(steps, rate, samples = {}) {
  const total = steps.reduce((a, [, s]) => a + s, 0);
  const len = Math.round(total * rate);
  const out = new Float32Array(len);
  let at = 0;
  for (const [name, secs] of steps) {
    let d = samples[name] || ding(NOTES[name], rate);
    const max = Math.round((secs + 1.5) * rate); // un son de fichier ne déborde pas sur la suite
    if (d.length > max) d = d.subarray(0, max);
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
  let ctx = null, src = null, gain = null, seq = 0; // seq : la dernière demande l'emporte (ou un arrêt)
  const cache = {};
  let manifest; // sons fournis : { défaut ou rythme: { inspire, retiens, expire } } (chemins dans audio/respiration/)
  const decoded = {};

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

  async function loadManifest() {
    if (manifest !== undefined) return manifest;
    try {
      const r = await fetch('audio/respiration/manifest.json', { cache: 'no-cache' });
      manifest = r.ok ? await r.json() : null;
    } catch { manifest = null; }
    return manifest;
  }

  // Les sons de fichier d'un rythme (ceux qui existent) ; le reste sera des notes de cloche.
  async function loadSamples(c, id) {
    const m = await loadManifest();
    const entry = m && (m[id] || m.default);
    if (!entry) return {};
    const out = {};
    for (const action of ['inspire', 'retiens', 'expire']) {
      const path = entry[action];
      if (!path) continue;
      const key = 'audio/respiration/' + path;
      try {
        decoded[key] ||= (async () => {
          const buf = await c.decodeAudioData(await (await fetch(key)).arrayBuffer());
          const mono = new Float32Array(buf.length);
          for (let ch = 0; ch < buf.numberOfChannels; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < buf.length; i++) mono[i] += d[i] / buf.numberOfChannels;
          }
          return mono;
        })();
        out[action] = await decoded[key];
      } catch { delete decoded[key]; /* fichier absent ou illisible : cloche */ }
    }
    return out;
  }

  // Lance la respiration (à appeler depuis un geste : toucher, clic). Rend l'heure (ms) du
  // premier son, ou null si rien ne peut jouer.
  async function start(id, volume) {
    stop();
    const my = seq;
    const c = ensure();
    if (!c) return null;
    const steps = stepsFor(id);
    if (!steps) return null; // « aucun »
    const key = id;
    if (!cache[key]) {
      const samples = await loadSamples(c, id);
      cache[key] = makeBuffer(c, renderCycle(steps, c.sampleRate, samples));
    }
    if (my !== seq) return null; // un arrêt ou une autre demande est passé pendant le chargement
    const s = c.createBufferSource();
    s.buffer = cache[key];
    s.loop = true;
    const g = c.createGain();
    g.gain.value = Math.max(0, Math.min(1, volume));
    s.connect(g).connect(c.destination);
    s.start(c.currentTime + 0.15); // un court instant pour que le premier son soit propre
    src = s; gain = g;
    return Date.now() + 150;
  }

  function stop() {
    seq++;
    const s = src, g = gain;
    src = gain = null;
    if (!s) return;
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => { try { s.stop(); } catch { /* déjà arrêté */ } g.disconnect(); }, 800);
  }

  function setLevel(v) {
    if (gain) gain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.1);
  }

  // Pour apprendre les trois sons : inspire, retiens, expire, l'un après l'autre.
  function preview(volume, id = 'coherence') {
    const c = ensure();
    if (!c) return;
    loadSamples(c, id).then((samples) => {
      ['inspire', 'retiens', 'expire'].forEach((name, k) => {
        const data = samples[name] || ding(NOTES[name], c.sampleRate);
        const s = c.createBufferSource();
        s.buffer = makeBuffer(c, data);
        const g = c.createGain();
        g.gain.value = Math.max(0, Math.min(1, volume));
        s.connect(g).connect(c.destination);
        s.start(c.currentTime + 0.1 + k * 2);
      });
    });
  }

  return { start, stop, setLevel, preview, get playing() { return !!src; } };
}
