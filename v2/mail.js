// Essai (15/11, demande de l'utilisateur) : afficher les 10 derniers mails de la boîte de
// réception, en liste : expéditeur et objet, rien d'autre (ni lien, ni texte du mail).
// Portée gmail.metadata : Google ne donne que les en-têtes, jamais le contenu. Rien n'est gardé
// sur l'appareil : le jeton et la liste ne vivent qu'en mémoire, à chaque clic.

const SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';
const API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

export function createMail({ getClientId }) {
  let token = null, tokenExp = 0, client = null, clientFor = '';
  let onToken = null, onTokenError = null;

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

  // Jeton d'accès : la fenêtre Google s'ouvre (il faut partir d'un clic) et on choisit le compte.
  async function getToken() {
    if (token && Date.now() < tokenExp - 60000) return token;
    const id = (getClientId() || '').trim();
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
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) {
          reject(new Error('accès aux mails non accordé : reconnecte-toi et coche la case des mails'));
          return;
        }
        try { localStorage.setItem('projetfocus2.mailOk', '1'); } catch { /* rien */ }
        token = r.access_token;
        tokenExp = Date.now() + Number(r.expires_in || 3600) * 1000;
        resolve(token);
      };
      onTokenError = (e) => reject(new Error(e?.type || 'fenêtre fermée'));
      // Première fois : choix du compte ; ensuite la fenêtre Google se referme seule.
      client.requestAccessToken({ prompt: localStorage.getItem('projetfocus2.mailOk') ? '' : 'select_account' });
    });
  }

  async function gmail(url) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) { token = null; throw new Error('jeton expiré, réessaie'); }
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      if (/accessNotConfigured|SERVICE_DISABLED|has not been used|is disabled/.test(body)) {
        throw new Error('API Gmail non activée dans le projet Google Cloud');
      }
      if (/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient/i.test(body)) {
        token = null;
        throw new Error('accès aux mails non accordé : reconnecte-toi et coche la case des mails');
      }
      throw new Error(`Gmail a répondu ${r.status}`);
    }
    return r.json();
  }

  // « Jean Dupont <jean@exemple.fr> » → « Jean Dupont » (sinon l'adresse).
  const sender = (from) => {
    const f = (from || '').trim();
    const m = /^"?([^"<]+?)"?\s*<([^>]+)>$/.exec(f);
    return (m ? m[1] : f.replace(/^<|>$/g, '')) || '(expéditeur inconnu)';
  };

  return {
    // Les 10 derniers mails de la boîte de réception : [{ from, subject, unread }].
    async last10() {
      await getToken();
      const list = await gmail(`${API}?labelIds=INBOX&maxResults=10`);
      const ids = (list.messages || []).map((m) => m.id);
      const hdr = 'metadataHeaders=From&metadataHeaders=Subject';
      const msgs = await Promise.all(ids.map((id) => gmail(`${API}/${id}?format=metadata&${hdr}`)));
      return msgs.map((m) => {
        const h = Object.fromEntries((m.payload?.headers || []).map((x) => [x.name.toLowerCase(), x.value]));
        return { from: sender(h.from), subject: (h.subject || '').trim() || '(sans objet)', unread: (m.labelIds || []).includes('UNREAD') };
      });
    },

    // Oublie le jeton (et le révoque côté Google).
    forget() {
      try { if (token) window.google?.accounts?.oauth2?.revoke(token, () => {}); } catch { /* rien */ }
      token = null;
    },
  };
}
