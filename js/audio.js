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

// Remplit un canal de `len` échantillons ; `gen` reçoit (tableau, fréquence).
function makeLoop(ctx, gen, channels = 2) {
  const rate = ctx.sampleRate;
  const n = Math.floor(LOOP_SECONDS * rate);
  const f = Math.floor(FADE_SECONDS * rate);
  const buf = ctx.createBuffer(channels, n, rate);
  let sum = 0;
  const raw = [];
  for (let c = 0; c < channels; c++) {
    const data = new Float32Array(n + f);
    gen(data, rate);
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

// Pluie : un fond doux + des milliers de petites gouttes.
function rain(data, rate) {
  pink(data);
  lowpass(data, rate, 5000);
  for (let i = 0; i < data.length; i++) data[i] *= 0.35;
  const drops = Math.floor((data.length / rate) * 450);
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
  blanc: (d) => { for (let i = 0; i < d.length; i++) d[i] = whiteSample(); },
  rose: pink,
  brun: brown,
  pluie: rain,
  cafe,
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
  playStation(station) {
    this.station = station;
    this.queue = null;
    this.track = null;
    if (station.kind === 'tracks') {
      this.queue = shuffled(station.tracks);
      this.qi = 0;
      this.skips = 0;
      this.track = this.queue[0];
      this.music.src = this.track.file;
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
    this.music.pause();
    // Un flux en direct mis en pause continue de télécharger : on le coupe vraiment.
    this.music.removeAttribute('src');
    this.music.load();
    this._setMusicState('stopped');
  }

  get musicOn() { return this.musicState === 'playing' || this.musicState === 'loading'; }

  setMusicLevel(v, fadeMs = 1500) {
    this.musicLevel = Math.max(0, Math.min(1, v));
    clearInterval(this._fadeTimer);
    const from = this.music.volume, to = this.musicLevel;
    if (fadeMs <= 0 || from === to) { this.music.volume = to; return; }
    const t0 = performance.now();
    this._fadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / fadeMs);
      this.music.volume = from + (to - from) * t;
      if (t >= 1) clearInterval(this._fadeTimer);
    }, 50);
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
      if (!this.buffers[id]) this.buffers[id] = makeLoop(ctx, GENERATORS[id]);
      const src = ctx.createBufferSource();
      src.buffer = this.buffers[id];
      src.loop = true;
      src.connect(this.noiseGain);
      src.start();
      this.noiseSrc = src;
      this.noiseGain.gain.cancelScheduledValues(ctx.currentTime);
      this.noiseGain.gain.setTargetAtTime(this.noiseLevel, ctx.currentTime, 0.5);
      this.onchange();
    };
    setTimeout(start, old ? 700 : 0);
  }

  setNoiseLevel(v) {
    this.noiseLevel = Math.max(0, Math.min(1, v));
    if (this.ctx && this.noiseSrc) this.noiseGain.gain.setTargetAtTime(this.noiseLevel, this.ctx.currentTime, 0.5);
  }

  /* ---------- Signal de changement de phase ---------- */
  chime(type, volume = 0.6) {
    if (type === 'aucun' || volume <= 0) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.05;
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
