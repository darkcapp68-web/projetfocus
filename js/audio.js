// Moteur audio : radio en ligne (élément <audio>), bruits de fond générés
// en Web Audio (aucun fichier) et petits signaux de changement de phase.

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

// Musique douce de pause, façon « ascenseur » : accords jazzy tenus, une basse ronde
// et quelques notes de piano électrique. Calculée une fois (64 s), puis jouée en boucle.
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const LIFT_CHORDS = [
  { bass: 41, notes: [53, 57, 60, 64, 67] }, // Fa maj9
  { bass: 40, notes: [52, 55, 59, 62] }, // Mi m7
  { bass: 38, notes: [50, 53, 57, 60, 64] }, // Ré m9
  { bass: 43, notes: [55, 60, 65, 69] }, // Sol 9sus
];
const LIFT_BAR = 8; // secondes par accord

async function renderLift(rate) {
  const chords = [...LIFT_CHORDS, ...LIFT_CHORDS]; // deux tours, avec des notes de piano différentes
  const loop = chords.length * LIFT_BAR, tail = 4;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const oc = new OAC(2, Math.ceil((loop + tail) * rate), rate);
  const lp = oc.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1800;
  lp.connect(oc.destination);
  const out = (node, pan) => {
    const p = oc.createStereoPanner();
    p.pan.value = pan;
    node.connect(p).connect(lp);
  };
  const voice = (freq, type, at, dur, level, attack, release, pan) => {
    const o = oc.createOscillator();
    const g = oc.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + attack);
    g.gain.setValueAtTime(level, at + dur);
    g.gain.linearRampToValueAtTime(0, at + dur + release);
    o.connect(g);
    out(g, pan);
    o.start(at);
    o.stop(at + dur + release + 0.1);
  };
  const piano = (freq, at, level, pan) => {
    for (const [mult, lv, dec] of [[1, 1, 1.8], [2, 0.25, 0.6], [3, 0.08, 0.3]]) {
      const o = oc.createOscillator();
      const g = oc.createGain();
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(level * lv, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dec * 2);
      o.connect(g);
      out(g, pan);
      o.start(at);
      o.stop(at + dec * 2 + 0.05);
    }
  };
  chords.forEach((ch, i) => {
    const at = i * LIFT_BAR;
    ch.notes.forEach((n, k) => {
      const pan = (k / (ch.notes.length - 1)) * 1.2 - 0.6;
      voice(midi(n), 'triangle', at, LIFT_BAR - 1, 0.035, 1.5, 2, pan);
      voice(midi(n) * 1.004, 'sine', at, LIFT_BAR - 1, 0.03, 1.8, 2, -pan);
    });
    voice(midi(ch.bass), 'sine', at, LIFT_BAR - 1.5, 0.12, 0.08, 1.5, 0);
    for (let s = 0; s < LIFT_BAR * 2; s++) {
      if (Math.random() < 0.4) {
        const n = ch.notes[Math.floor(Math.random() * ch.notes.length)] + 12;
        piano(midi(n), at + s * 0.5 + Math.random() * 0.03, 0.05 + Math.random() * 0.04, Math.random() * 0.8 - 0.4);
      }
    }
  });
  const rendered = await oc.startRendering();
  // La traîne du dernier accord revient sur le début : la boucle ne s'entend pas.
  const n = Math.floor(loop * rate);
  const buf = new AudioBuffer({ numberOfChannels: 2, length: n, sampleRate: rate });
  let peak = 0;
  const chans = [0, 1].map((c) => {
    const src = rendered.getChannelData(c);
    const d = src.slice(0, n);
    for (let i = n; i < src.length; i++) d[i - n] += src[i];
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
    return d;
  });
  chans.forEach((d, c) => {
    const o = buf.getChannelData(c);
    for (let i = 0; i < n; i++) o[i] = d[i] * (0.8 / (peak || 1));
  });
  return buf;
}

const GENERATORS = {
  pluie: { gen: rain(450, 5000) },
  orage: { gen: rain(140, 2200), thunder: true },
  vent: { gen: wind, seconds: 30 },
  neige: { gen: snow, seconds: 24 },
  cafe: { gen: cafe },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.noiseSrc = null;
    this.noiseGain = null;
    this.noiseId = 'none';
    this.noiseLevel = 0.3;

    this.music = new Audio();
    this.music.preload = 'none';
    this.station = null;
    this.musicLevel = 0.4;
    this.musicState = 'stopped'; // 'stopped' | 'loading' | 'playing' | 'error'
    this._fadeTimer = null;
    this.onchange = () => {};

    this.music.addEventListener('playing', () => { this.skips = 0; this._setMusicState('playing'); });
    this.music.addEventListener('ended', () => this.nextTrack());
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack()); } catch { /* non géré */ }
    }
    this.music.addEventListener('waiting', () => this._setMusicState('loading'));
    this.music.addEventListener('error', () => {
      if (!this.music.getAttribute('src')) return;
      // Morceau absent (hors ligne, pas encore en cache) : on essaie le suivant.
      if (this.queue && ++this.skips < this.queue.length) { this.nextTrack(); return; }
      // Serveur SomaFM suivant si celui-ci ne répond pas.
      const m = this.music.src.match(/:\/\/(ice\d)\.somafm\.com/);
      const next = m && MIRRORS[MIRRORS.indexOf(m[1]) + 1];
      if (next) {
        this.music.src = this.music.src.replace(`://${m[1]}.`, `://${next}.`);
        this.music.play().catch(() => {});
        return;
      }
      this._setMusicState('error');
    });
  }

  _setMusicState(s) { this.musicState = s; this.onchange(); }

  // À appeler depuis un geste de l'utilisateur (clic, touche).
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = 0;
      this.noiseGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /* ---------- Radio et playlist embarquée ---------- */
  // `resume` : { file, time } pour reprendre la playlist au morceau et à la seconde près.
  playStation(station, resume) {
    this._stopLift();
    this.station = station;
    this.queue = null;
    this.track = null;
    if (station.kind === 'tracks') {
      this.queue = shuffled(station.tracks);
      const k = resume?.file ? this.queue.findIndex((t) => t.file === resume.file) : -1;
      if (k > 0) this.queue.unshift(...this.queue.splice(k, 1));
      this.qi = 0;
      this.skips = 0;
      this.track = this.queue[0];
      this.music.src = this.track.file;
      if (k >= 0 && resume.time > 0) {
        this.music.addEventListener('loadedmetadata', () => { this.music.currentTime = resume.time; }, { once: true });
      }
    } else {
      this.music.src = station.url;
    }
    this.music.volume = this.musicLevel;
    this._setMusicState('loading');
    // Une erreur de chargement passe par l'événement 'error' (serveurs de secours).
    return this.music.play().catch((e) => { if (e.name === 'NotAllowedError') this._setMusicState('error'); });
  }

  nextTrack() {
    if (!this.queue) return;
    this.qi++;
    if (this.qi >= this.queue.length) { this.queue = shuffled(this.queue); this.qi = 0; }
    this.track = this.queue[this.qi];
    this.music.src = this.track.file;
    this.music.play().catch(() => {});
    this.onchange();
  }

  stopMusic() {
    this._stopLift();
    this.music.pause();
    // Un flux en direct mis en pause continue de télécharger : on le coupe vraiment.
    this.music.removeAttribute('src');
    this.music.load();
    this._setMusicState('stopped');
  }

  get musicOn() { return this.musicState === 'playing' || this.musicState === 'loading'; }

  setMusicLevel(v, fadeMs = 1500, done = null) {
    this.musicLevel = Math.max(0, Math.min(1, v));
    clearInterval(this._fadeTimer);
    const from = this.music.volume, to = this.musicLevel;
    if (fadeMs <= 0 || from === to) { this.music.volume = to; done?.(); return; }
    const t0 = performance.now();
    this._fadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / fadeMs);
      this.music.volume = from + (to - from) * t;
      if (t >= 1) { clearInterval(this._fadeTimer); done?.(); }
    }, 50);
  }

  /* ---------- Pause : une musique à part, puis retour à celle du focus ---------- */
  // mode : 'calme' (musique douce générée), 'silence', 'same' (même musique, plus bas)
  // ou 'station' (une playlist ou une radio choisie pour la pause).
  // Peut être rappelée pendant la pause pour changer de musique.
  enterBreak(mode, level, station = null) {
    // On note la musique du focus une seule fois, au début de la pause.
    if (!this.memo) {
      this.memo = {
        station: this.station, on: this.musicOn,
        file: this.track?.file || null, time: this.track ? this.music.currentTime : 0,
      };
    }
    this.breakMode = mode;
    this._stopLift();
    const m = this.memo;
    if (mode === 'same') {
      if (m.on && (this.station !== m.station || this.music.paused)) this._restoreFocus(level);
      else this.setMusicLevel(level);
    } else if (mode === 'station' && station) {
      if (this.station?.id !== station.id || !this.musicOn || this.music.paused) {
        this.setMusicLevel(level, 0);
        this.playStation(station);
      } else this.setMusicLevel(level);
    } else {
      // Silence ou musique douce : la musique du lecteur s'efface puis se met en pause.
      if (!this.music.paused) this.setMusicLevel(0, 2500, () => { if (this.breakMode === mode) this.music.pause(); });
      if (mode === 'calme') this._startLift(level); // même si rien ne jouait avant la pause
    }
    this.onchange();
  }

  leaveBreak(level) {
    this._stopLift();
    const m = this.memo;
    this.memo = null;
    this.breakMode = null;
    if (!m) { this.setMusicLevel(level); return; }
    if (m.on) {
      if (this.station === m.station && this.musicOn && !this.music.paused) this.setMusicLevel(level, 2500);
      else this._restoreFocus(level, m);
    } else if (this.musicOn || !this.music.paused) {
      this.stopMusic();
    }
    this.onchange();
  }

  // Relance la musique du focus : la playlist reprend au morceau et à la seconde près,
  // une radio repart en direct.
  _restoreFocus(level, m = this.memo) {
    this.music.volume = 0;
    if (this.station === m.station && this.musicState !== 'stopped') {
      this.music.play().catch(() => {});
    } else {
      this.musicLevel = 0;
      this.playStation(m.station, { file: m.file, time: m.time });
    }
    this.setMusicLevel(level, 2500);
  }

  // Bouton « Arrêter » : plus aucun son (musique, musique de pause, bruit de fond).
  stopAll() {
    this.memo = null;
    this.breakMode = null;
    this.stopMusic();
    this.setNoise('none');
  }

  // Ce que le lecteur doit afficher et enregistrer comme musique « du focus ».
  get focusTrack() { return this.memo ? { file: this.memo.file, time: this.memo.time, on: this.memo.on } : null; }

  get liftOn() { return !!this.liftGain; }

  setLiftLevel(v) {
    this.liftLevel = v;
    if (this.liftGain) this.liftGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.3);
  }

  async _startLift(level) {
    const ctx = this.ensure();
    if (!ctx || this.liftGain) return;
    this.liftLevel = level;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(ctx.destination);
    this.liftGain = g;
    try {
      this.liftBuf ||= await renderLift(ctx.sampleRate);
    } catch { this.liftGain = null; return; }
    if (this.liftGain !== g) return; // la pause est déjà finie
    const src = ctx.createBufferSource();
    src.buffer = this.liftBuf;
    src.loop = true;
    src.connect(g);
    src.start();
    this.liftSrc = src;
    g.gain.setTargetAtTime(this.liftLevel, ctx.currentTime + 1, 1);
  }

  _stopLift() {
    const g = this.liftGain, src = this.liftSrc;
    this.liftGain = null;
    this.liftSrc = null;
    if (!g) return;
    g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6);
    setTimeout(() => { try { src?.stop(); } catch { /* déjà arrêté */ } g.disconnect(); }, 3000);
  }

  /* ---------- Bruits de fond ---------- */
  setNoise(id) {
    if (id === this.noiseId && (id === 'none' || this.noiseSrc)) return;
    this.noiseId = id;
    const ctx = this.ensure();
    if (!ctx) return;
    const old = this.noiseSrc;
    this.noiseSrc = null;
    if (old) {
      this.noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => { try { old.stop(); } catch { /* déjà arrêté */ } }, 700);
    }
    if (id === 'none' || !GENERATORS[id]) { this.onchange(); return; }
    const start = () => {
      if (this.noiseId !== id) return;
      const def = GENERATORS[id];
      if (!this.buffers[id]) this.buffers[id] = makeLoop(ctx, def.gen, def.seconds);
      const src = ctx.createBufferSource();
      src.buffer = this.buffers[id];
      src.loop = true;
      src.connect(this.noiseGain);
      src.start();
      this.noiseSrc = src;
      this.noiseGain.gain.cancelScheduledValues(ctx.currentTime);
      this.noiseGain.gain.setTargetAtTime(this.noiseLevel, ctx.currentTime, 0.5);
      if (def.thunder) this._thunderLater(true);
      this.onchange();
    };
    clearTimeout(this.thunderTimer);
    setTimeout(start, old ? 700 : 0);
  }

  // Les grondements arrivent à des moments imprévisibles, jamais en boucle.
  _thunderLater(first) {
    const wait = first ? 4000 + Math.random() * 6000 : 18000 + Math.random() * 30000;
    clearTimeout(this.thunderTimer);
    this.thunderTimer = setTimeout(() => {
      if (!this.noiseSrc || !GENERATORS[this.noiseId]?.thunder) return;
      this.thunders ||= [0, 1, 2].map(() => thunderBuffer(this.ctx));
      const src = this.ctx.createBufferSource();
      src.buffer = this.thunders[Math.floor(Math.random() * this.thunders.length)];
      src.playbackRate.value = 0.8 + Math.random() * 0.35;
      src.connect(this.noiseGain);
      src.start();
      this._thunderLater(false);
    }, wait);
  }

  setNoiseLevel(v) {
    this.noiseLevel = Math.max(0, Math.min(1, v));
    if (this.ctx && this.noiseSrc) this.noiseGain.gain.setTargetAtTime(this.noiseLevel, this.ctx.currentTime, 0.5);
  }

  /* ---------- Signal de changement de phase ---------- */
  chime(type, volume = 0.6, times = 1) {
    if (type === 'aucun' || volume <= 0) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (type === 'tictac') {
      // « tic tac tic tac », une fois par signal demandé.
      for (let k = 0; k < Math.max(1, times) * 4; k++) this._tick(ctx, volume, k % 2 === 0, ctx.currentTime + 0.05 + k * 0.5);
      return;
    }
    // Plusieurs « ding » : on rejoue le signal, un peu espacé.
    const gap = type === 'bol' ? 1.6 : type === 'douce' ? 1.1 : 0.8;
    for (let k = 0; k < Math.max(1, times); k++) this._ding(ctx, type, volume, ctx.currentTime + 0.05 + k * gap);
  }

  // Un « tic » (aigu) ou un « tac » (plus grave) d'horloge : un petit claquement de bois.
  tick(volume = 0.6, high = true) {
    if (volume <= 0) return;
    const ctx = this.ensure();
    if (ctx) this._tick(ctx, volume, high, ctx.currentTime + 0.02);
  }

  _tick(ctx, volume, high, t0) {
    const len = Math.floor(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = high ? 3200 : 2000;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.value = volume * 2.2;
    src.connect(bp).connect(g).connect(ctx.destination);
    // Le corps de l'horloge : une note sourde très brève sous le claquement.
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.value = high ? 900 : 620;
    og.gain.setValueAtTime(volume * 0.12, t0);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
    o.connect(og).connect(ctx.destination);
    src.start(t0);
    o.start(t0);
    o.stop(t0 + 0.06);
  }

  // Petit « ding » court du compte à rebours ; `urgency` (0 à 1) le fait monter un peu.
  countdownDing(volume = 0.6, urgency = 0) {
    if (volume <= 0) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.02;
    const f = 1175 * (1 + 0.12 * urgency);
    for (const [mult, lv, dur] of [[1, 0.22, 0.5], [2.76, 0.05, 0.2]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(lv * volume, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    }
  }

  _ding(ctx, type, volume, t0) {
    const out = ctx.createGain();
    out.gain.value = volume * 0.5;
    out.connect(ctx.destination);
    const tone = (freq, at, dur, level) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(level, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + dur + 0.05);
    };
    if (type === 'bol') {
      tone(220, t0, 4.5, 0.6);
      tone(221.6, t0, 4.5, 0.4);
      tone(528, t0, 3, 0.18);
      tone(869, t0, 2, 0.08);
    } else if (type === 'douce') {
      tone(660, t0, 0.9, 0.45);
      tone(880, t0 + 0.35, 1.3, 0.45);
    } else {
      tone(1046, t0, 2.4, 0.4);
      tone(1046 * 2.76, t0, 1.2, 0.12);
      tone(1046 * 5.4, t0, 0.6, 0.05);
    }
  }
}
