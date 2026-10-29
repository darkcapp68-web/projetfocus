// Synchronisation des Paramètres avec Google Drive.
// Un fichier visible « projetfocus-parametres.json » dans ton Drive : à l'ouverture on le lit,
// à chaque changement on le réécrit ; la version la plus récente (updatedAt) gagne.
// L'accès (portée drive.file) se limite aux fichiers créés par l'appli.

const FILE_NAME = 'projetfocus-parametres.json';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const LS_SYNC = 'projetfocus.sync';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const PUSH_DELAY = 3000;

const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function createSync({ getSettings, applyRemote, onStatus }) {
  let state = (() => { try { return JSON.parse(localStorage.getItem(LS_SYNC)) || {}; } catch { return {}; } })();
  let token = null, tokenExp = 0, client = null, clientFor = '';
  let onToken = null, onTokenError = null;
  let pushTimer = 0, pending = false, busy = false, lastAsk = 0;

  const save = () => { try { localStorage.setItem(LS_SYNC, JSON.stringify(state)); } catch { /* rien */ } };
  const status = (text, kind = '') => onStatus({ text, kind, connected: !!state.connected });
  const tokenOk = () => token && Date.now() < tokenExp - 60000;

  function loadGis() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('hors ligne'));
      document.head.appendChild(s);
    });
  }

  // Jeton d'accès Google. La première fois, Google demande ton accord ; ensuite la
  // fenêtre s'ouvre et se referme seule (elle doit partir d'un clic ou d'un toucher).
  async function getToken(firstTime) {
    if (tokenOk()) return token;
    const id = (getSettings().syncClientId || '').trim();
    if (!id) throw new Error('sans identifiant');
    await loadGis();
    if (!client || clientFor !== id) {
      clientFor = id;
      client = window.google.accounts.oauth2.initTokenClient({
        client_id: id,
        scope: SCOPE,
        callback: (r) => onToken?.(r),
        error_callback: (e) => onTokenError?.(e),
      });
    }
    return new Promise((resolve, reject) => {
      onToken = (r) => {
        if (r.error) { reject(new Error(r.error)); return; }
        token = r.access_token;
        tokenExp = Date.now() + Number(r.expires_in || 3600) * 1000;
        resolve(token);
      };
      onTokenError = (e) => reject(new Error(e?.type || 'fenêtre fermée'));
      client.requestAccessToken({ prompt: firstTime ? 'consent' : '' });
    });
  }

  async function drive(url, opts = {}) {
    const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });
    if (r.status === 401) { token = null; throw new Error('jeton expiré'); }
    if (!r.ok) throw new Error(`Google Drive a répondu ${r.status}`);
    return r;
  }

  async function findFile() {
    if (state.fileId) {
      try {
        const j = await (await drive(`${API}/${state.fileId}?fields=id,trashed`)).json();
        if (!j.trashed) return j.id;
      } catch (e) {
        if (!token) throw e; // jeton expiré : on remonte l'erreur ; sinon fichier disparu
      }
    }
    const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
    const j = await (await drive(`${API}?q=${q}&spaces=drive&orderBy=modifiedTime desc&fields=files(id)`)).json();
    return j.files?.[0]?.id || null;
  }

  async function writeFile(data) {
    const body = JSON.stringify(data, null, 2);
    if (state.fileId) {
      await drive(`${UPLOAD}/${state.fileId}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
      return;
    }
    const b = 'projetfocus' + Math.random().toString(36).slice(2);
    const meta = { name: FILE_NAME, mimeType: 'application/json', description: 'Paramètres de projetfocus, synchronisés automatiquement.' };
    const multipart = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
      `--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
    const r = await drive(`${UPLOAD}?uploadType=multipart&fields=id`, {
      method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: multipart,
    });
    state.fileId = (await r.json()).id;
    save();
  }

  // Compare les deux versions : la plus récente remplace l'autre.
  async function syncNow() {
    if (busy) { pending = true; return; }
    busy = true;
    pending = false;
    try {
      status('Synchronisation…');
      state.fileId = await findFile();
      save();
      const local = getSettings();
      if (state.fileId) {
        const remote = await (await drive(`${API}/${state.fileId}?alt=media`)).json();
        const r = Number(remote.updatedAt) || 0, l = Number(local.updatedAt) || 0;
        if (r > l) applyRemote(remote);
        else if (r < l) await writeFile(local);
      } else {
        await writeFile(local);
      }
      state.lastSync = Date.now();
      save();
      status(`Synchronisé à ${hhmm()} · fichier « ${FILE_NAME} » dans ton Drive`, 'ok');
    } catch (e) {
      pending = true;
      status(tokenOk()
        ? `Pas de synchronisation (${e.message}) : nouvel essai plus tard.`
        : 'Connexion à renouveler : touche l’écran ou clique « Synchroniser maintenant ».', 'warn');
    } finally {
      busy = false;
    }
    if (pending && tokenOk()) setTimeout(syncNow, PUSH_DELAY);
  }

  async function withToken(firstTime) {
    lastAsk = Date.now();
    try {
      await getToken(firstTime);
    } catch (e) {
      pending = true;
      status(e.message === 'sans identifiant'
        ? 'Ajoute d’abord l’ID client Google (voir le README).'
        : `Connexion Google impossible (${e.message}).`, 'warn');
      return;
    }
    await syncNow();
  }

  return {
    get connected() { return !!state.connected; },

    start() {
      if (!state.connected) { status('Non connecté.'); return; }
      pending = true;
      status('Connecté · la synchronisation se fait au premier toucher.');
    },

    connect() {
      state.connected = true;
      save();
      withToken(true);
    },

    disconnect() {
      try { if (token) window.google?.accounts?.oauth2?.revoke(token, () => {}); } catch { /* rien */ }
      token = null;
      state = {};
      save();
      status('Non connecté. Le fichier reste dans ton Drive.');
    },

    syncNow() {
      if (!state.connected) return;
      if (tokenOk()) syncNow(); else withToken(false);
    },

    // Un paramètre a changé : on l'envoie quelques secondes après le dernier réglage.
    changed() {
      if (!state.connected) return;
      pending = true;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        if (tokenOk()) syncNow();
        else status('Changement à envoyer : touche l’écran pour renouveler la connexion.', 'warn');
      }, PUSH_DELAY);
    },

    // Premier toucher, page revenue au premier plan, retour du réseau.
    gesture() {
      if (state.connected && pending && !tokenOk() && Date.now() - lastAsk > 60000) withToken(false);
    },
    wake() {
      if (state.connected && tokenOk()) syncNow(); // récupère ce qui a changé sur un autre appareil
    },
  };
}
