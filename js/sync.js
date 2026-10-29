// Sauvegarde des Paramètres sur Google Drive, à la main : « Sauvegarder » envoie les réglages
// de cet appareil dans un fichier visible « projetfocus-parametres.json » ; « Reprendre » les
// ramène sur un autre appareil. Rien d'automatique : jamais de conflit entre appareils.
// L'accès (portée drive.file) se limite aux fichiers créés par l'appli.

const FILE_NAME = 'projetfocus-parametres.json';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const LS_SYNC = 'projetfocus.sync';
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

export function createSync({ getSettings, applyRemote, onStatus }) {
  let state = (() => { try { return JSON.parse(localStorage.getItem(LS_SYNC)) || {}; } catch { return {}; } })();
  let token = null, tokenExp = 0, client = null, clientFor = '';
  let onToken = null, onTokenError = null;
  let busy = false;

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
        // Case « accès aux fichiers » laissée décochée dans la fenêtre Google.
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) {
          reject(new Error('accès au Drive non accordé : reconnecte-toi et coche la case des fichiers'));
          return;
        }
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
    if (!r.ok) {
      // On traduit les refus les plus courants (403) en consigne claire.
      const body = await r.text().catch(() => '');
      if (/accessNotConfigured|SERVICE_DISABLED|has not been used|is disabled/.test(body)) {
        throw new Error('API Google Drive non activée dans le projet Google Cloud');
      }
      if (/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient/i.test(body)) {
        token = null;
        throw new Error('accès au Drive non accordé : reconnecte-toi et coche la case des fichiers');
      }
      throw new Error(`Google Drive a répondu ${r.status}`);
    }
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
    const meta = { name: FILE_NAME, mimeType: 'application/json', description: 'Paramètres de projetfocus (Sauvegarder / Reprendre dans l’appli).' };
    const multipart = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
      `--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
    const r = await drive(`${UPLOAD}?uploadType=multipart&fields=id`, {
      method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: multipart,
    });
    state.fileId = (await r.json()).id;
    save();
  }

  const when = (ms) => new Date(ms).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', ' à ');

  // Les deux boutons partent d'un clic : la fenêtre Google peut s'ouvrir si besoin
  // (la première fois pour l'accord, ensuite elle se referme seule).
  async function run(label, job) {
    if (busy) return;
    busy = true;
    try {
      status(label);
      await getToken(!state.connected);
      state.connected = true;
      state.fileId = await findFile();
      save();
      await job();
    } catch (e) {
      status(e.message === 'sans identifiant'
        ? 'Ajoute d’abord l’ID client Google (voir le README).'
        : `Google Drive indisponible (${e.message}).`, 'warn');
    } finally {
      busy = false;
    }
  }

  function showLast() {
    const l = state.last;
    if (!l) status(state.connected ? 'Connecté à Google Drive.' : 'Pas encore de sauvegarde depuis cet appareil.');
    else status(`${l.kind === 'save' ? 'Sauvegardé sur le Drive' : 'Repris du Drive'} le ${when(l.at)}.`, 'ok');
  }

  return {
    get connected() { return !!state.connected; },

    start: showLast,

    // Envoie les réglages de cet appareil sur le Drive (ils remplacent la sauvegarde).
    save() {
      return run('Sauvegarde…', async () => {
        await writeFile({ ...getSettings(), savedAt: Date.now() });
        state.last = { kind: 'save', at: Date.now() };
        save();
        showLast();
      });
    },

    // Reprend la dernière sauvegarde du Drive sur cet appareil.
    load() {
      return run('Récupération…', async () => {
        if (!state.fileId) { status('Aucune sauvegarde sur le Drive : sauvegarde d’abord depuis ton appareil de référence.', 'warn'); return; }
        const remote = await (await drive(`${API}/${state.fileId}?alt=media`)).json();
        applyRemote(remote);
        state.last = { kind: 'load', at: Date.now() };
        save();
        status(`Repris du Drive (sauvegarde du ${when(Number(remote.savedAt || remote.updatedAt) || Date.now())}).`, 'ok');
      });
    },

    disconnect() {
      try { if (token) window.google?.accounts?.oauth2?.revoke(token, () => {}); } catch { /* rien */ }
      token = null;
      state = {};
      save();
      status('Déconnecté. La sauvegarde reste dans ton Drive.');
    },
  };
}
