// Lecteur YouTube intégré (lecteur officiel, API IFrame) : une vidéo ou une playlist de
// « Mes liens » jouée dans l'appli, dans l'ordre et en boucle.
// Il imite l'élément <audio> (play, pause, paused, volume, currentTime, événements) pour
// que le moteur audio le pilote comme une radio : pause, reprise à la seconde près, Arrêter.
// Règle de YouTube : la vidéo reste visible (au moins 200 × 200 px) tant qu'elle joue.

let apiReady = null;
function loadApi() {
  apiReady ||= new Promise((resolve, reject) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { apiReady = null; reject(new Error('YouTube injoignable')); };
    document.head.appendChild(s);
  });
  return apiReady;
}

// Lien YouTube (youtube.com, music.youtube.com, youtu.be) → { list, video } : une playlist
// (et le morceau du lien, par où commencer) ou une vidéo seule.
export function parseYouTube(url) {
  try {
    const u = new URL(url);
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(u.hostname)) return null;
    const list = u.searchParams.get('list');
    const video = u.hostname.endsWith('youtu.be') ? u.pathname.slice(1)
      : u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/)?.[1];
    return list || video ? { list, video } : null;
  } catch { return null; }
}

export class YouTubePlayer extends EventTarget {
  constructor() {
    super();
    this.player = null;
    this.ready = false;
    this.ref = null; // { list } ou { video }
    this._src = '';
    this._paused = true;
    this._volume = 0.4;
    this._fails = 0;
    this._on = false; // « en lecture » annoncé au moteur audio
    this._startAt = null;
    this._watcher = 0;
  }

  _emit(type) { this.dispatchEvent(new Event(type)); }

  // Ce qui suit imite l'élément <audio>.
  get paused() { return this._paused; }
  get volume() { return this._volume; }
  set volume(v) { this._volume = v; if (this.ready) this.player.setVolume(Math.round(v * 100)); }
  get currentTime() { return this.ready ? this.player.getCurrentTime() || 0 : 0; }
  getAttribute(name) { return name === 'src' ? this._src : null; }
  removeAttribute() { this.stop(); }
  load() {}

  // Où en est la lecture : pour reprendre au même morceau et à la seconde près.
  where() {
    if (!this.ready) return null;
    return { index: Math.max(0, this.player.getPlaylistIndex?.() ?? 0), time: this.player.getCurrentTime() || 0 };
  }

  get title() { return this.ready ? this.player.getVideoData?.()?.title || '' : ''; }
  get isPlaylist() { return !!this.ref?.list; }

  _box() {
    let box = document.getElementById('yt-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'yt-box';
      box.innerHTML = '<div id="yt-player"></div>';
      document.body.appendChild(box);
    }
    return box;
  }

  // Ouvre une vidéo ou une playlist ; `at` : { index, time } pour reprendre.
  async open(url, at = null) {
    const ref = parseYouTube(url);
    if (!ref) { this._emit('error'); return; }
    this.ref = ref;
    this._src = url;
    this._paused = false;
    this._fails = 0;
    this._on = false;
    this._box().classList.add('on');
    this._watch();
    try { await loadApi(); } catch { this._emit('error'); return; }
    if (this._src !== url) return; // autre choix entre-temps
    const start = Math.floor(at?.time || 0);
    if (this.ready) { this._cue(ref, at?.index || 0, start); return; }
    this.player = new window.YT.Player('yt-player', {
      width: '100%',
      height: '100%',
      playerVars: { playsinline: 1, rel: 0, autoplay: 1 },
      events: {
        onReady: () => {
          this.ready = true;
          this.player.setVolume(Math.round(this._volume * 100));
          if (this._src) this._cue(this.ref, at?.index || 0, start);
        },
        onStateChange: (e) => this._state(e.data),
        onError: () => {
          // Vidéo retirée ou interdite hors de YouTube : on passe à la suivante de la playlist.
          if (this.isPlaylist && ++this._fails < 20) this.player.nextVideo();
          else this._emit('error');
        },
      },
    });
  }

  _cue(ref, index, start) {
    // Une playlist ouverte depuis un de ses morceaux (Mix « RD… ») commence par ce morceau.
    this._startAt = ref.list && ref.video && !index && !start ? ref.video : null;
    this._looped = false;
    if (ref.list) this.player.loadPlaylist({ list: ref.list, listType: 'playlist', index, startSeconds: start });
    else this.player.loadVideoById({ videoId: ref.video, startSeconds: start });
    if (this._paused) this.player.pauseVideo();
  }

  _state(s) {
    const YTS = window.YT.PlayerState;
    if (s === YTS.PLAYING) {
      if (this._goToStart()) return;
      if (this._paused) { this.player.pauseVideo(); return; } // mis en pause pendant le chargement
      this._playing();
    } else if (s === YTS.BUFFERING) this._emit('waiting');
    else if (s === YTS.PAUSED) {
      // Pause depuis la vidéo elle-même : elle compte comme une pause du lecteur.
      if (!this._paused) { this._paused = true; this._emit('pause'); }
    } else if (s === YTS.ENDED) {
      // Une vidéo seule recommence ; une playlist en boucle repart d'elle-même.
      if (!this.isPlaylist) { this.player.seekTo(0, true); this.player.playVideo(); }
    }
  }

  // Une playlist ouverte depuis un de ses morceaux (Mix « RD… ») saute à ce morceau.
  _goToStart() {
    if (!this._startAt) return false;
    const list = this.player.getPlaylist();
    if (!list?.length) return false;
    const k = list.indexOf(this._startAt);
    this._startAt = null;
    if (k <= 0) return false;
    this.player.playVideoAt(k);
    return true;
  }

  _playing() {
    this._fails = 0;
    this._on = true;
    this._lastTitle = this.title;
    // Boucle sur la playlist, posée une fois (la redemander fait repartir le morceau au début).
    if (this.isPlaylist && !this._looped) { this._looped = true; this.player.setLoop(true); }
    this._emit('play');
    this._emit('playing');
  }

  // Avec un Mix, YouTube n'annonce pas toujours « en lecture » : on regarde chaque seconde si
  // le temps avance (et si le morceau a changé, pour mettre son titre à jour).
  _watch() {
    if (this._watcher) return;
    this._watcher = setInterval(() => {
      if (!this.ready || !this._src || this._paused) { this._lastT = null; return; }
      if (this._goToStart()) return;
      const t = this.player.getCurrentTime() || 0;
      if (this._lastT != null && t > this._lastT && (!this._on || this.title !== this._lastTitle)) this._playing();
      this._lastT = t;
    }, 1000);
  }

  play() {
    this._paused = false;
    this._box().classList.add('on');
    if (this.ready && this._src) this.player.playVideo();
    return Promise.resolve();
  }

  pause() {
    if (this._paused) return;
    this._paused = true;
    this._on = false;
    if (this.ready) this.player.pauseVideo();
    document.getElementById('yt-box')?.classList.remove('on'); // rien ne joue : la vidéo se range
    this._emit('pause');
  }

  next() { if (this.ready && this.isPlaylist) this.player.nextVideo(); }

  // Arrêter : plus de son, la vidéo disparaît.
  stop() {
    this._paused = true;
    this._on = false;
    this._src = '';
    if (this.ready) this.player.stopVideo();
    document.getElementById('yt-box')?.classList.remove('on');
  }
}
