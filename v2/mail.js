// Google en lecture, pour la tablette de bureau (15/11, demande de l'utilisateur) :
//  - les 10 derniers mails de la boîte de réception : expéditeur et objet seulement
//    (portée gmail.metadata : Google ne donne jamais le contenu) ;
//  - l'agenda du jour : titres et heures (portée calendar.readonly, agenda principal).
// Une seule connexion pour les deux. Rien n'est gardé sur l'appareil, hors le souvenir « déjà
// accordé » (pour que la fenêtre Google se referme seule) : le jeton et les listes ne vivent
// qu'en mémoire.

const MAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';
const CAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const MAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
const CAL_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const OK_KEY = 'projetfocus2.googleOk';

// Type de rendez-vous, deviné à partir de l'évènement Google (rien du texte n'est gardé ni affiché) :
//  - Meet : le champ officiel de visio de Google (conférence ou lien hangoutLink) ;
//  - Teams / Zoom : un lien dans le lieu, la description ou les points d'entrée de la conférence ;
//  - appel : un numéro de téléphone en point d'entrée, ou « appel / tél / call » dans le titre ;
//  - lieu : un lieu renseigné sans lien de visio (rendez-vous sur place).
export function meetingKind(e) {
  const entry = e.conferenceData?.entryPoints || [];
  const uris = entry.map((x) => x.uri || '').join(' ');
  const text = `${e.location || ''} ${e.description || ''} ${uris}`;
  const solution = e.conferenceData?.conferenceSolution?.name || '';
  const diag = {
    hangoutLink: !!e.hangoutLink,
    conference: solution || (entry.length ? 'oui' : ''),
    location: !!(e.location || '').trim(),
    description: !!(e.description || '').trim(),
  };
  let kind = '';
  if (e.hangoutLink || /meet\.google\.com/i.test(text) || /meet/i.test(solution)) kind = 'Meet';
  else if (/teams\.microsoft\.com|teams\.live\.com|\/l\/meetup-join/i.test(text)) kind = 'Teams';
  else if (/zoom\.us|zoomgov\.com/i.test(text)) kind = 'Zoom';
  else if (entry.some((x) => x.entryPointType === 'phone') || /(^|[^\p{L}])(appel|tél|tel|call|phone)([^\p{L}]|$)/iu.test(e.summary || '')) kind = 'appel';
  else if (diag.location) kind = 'lieu';
  return { kind, diag };
}

export function createMail({ getClientId }) {
  let token = null, tokenExp = 0, client = null, clientFor = '';
  let granted = { mail: false, agenda: false };
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

  // Jeton d'accès : la fenêtre Google s'ouvre (il faut partir d'un clic). Première fois : choix du
  // compte et accord ; ensuite elle se referme seule.
  async function getToken() {
    if (token && Date.now() < tokenExp - 60000) return token;
    const id = (getClientId() || '').trim();
    if (!id) throw new Error('sans identifiant');
    await loadGis();
    if (!client || clientFor !== id) {
      clientFor = id;
      client = window.google.accounts.oauth2.initTokenClient({
        client_id: id,
        scope: `${MAIL_SCOPE} ${CAL_SCOPE}`,
        callback: (r) => onToken?.(r),
        error_callback: (e) => onTokenError?.(e),
      });
    }
    return new Promise((resolve, reject) => {
      onToken = (r) => {
        if (r.error) { reject(new Error(r.error)); return; }
        const oa = window.google.accounts.oauth2;
        granted = { mail: oa.hasGrantedAnyScope(r, MAIL_SCOPE), agenda: oa.hasGrantedAnyScope(r, CAL_SCOPE) };
        if (!granted.mail && !granted.agenda) { reject(new Error('accès non accordé : reconnecte-toi et coche les cases')); return; }
        try { localStorage.setItem(OK_KEY, '1'); } catch { /* rien */ }
        token = r.access_token;
        tokenExp = Date.now() + Number(r.expires_in || 3600) * 1000;
        resolve(token);
      };
      onTokenError = (e) => reject(new Error(e?.type || 'fenêtre fermée'));
      client.requestAccessToken({ prompt: localStorage.getItem(OK_KEY) ? '' : 'select_account' });
    });
  }

  async function api(url, name) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) { token = null; throw new Error('jeton expiré, réessaie'); }
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      if (/accessNotConfigured|SERVICE_DISABLED|has not been used|is disabled/.test(body)) {
        throw new Error(`API ${name} non activée dans le projet Google Cloud`);
      }
      if (/insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient/i.test(body)) {
        throw new Error(`accès ${name === 'Gmail' ? 'aux mails' : 'à l’agenda'} non accordé : reconnecte-toi et coche la case`);
      }
      throw new Error(`${name} a répondu ${r.status}`);
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
    // Une seule fenêtre Google pour les deux ; renvoie ce qui a été accordé.
    async connect() { await getToken(); return { ...granted }; },

    // Les 10 derniers mails de la boîte de réception : [{ from, subject, unread }].
    async last10() {
      await getToken();
      if (!granted.mail) throw new Error('accès aux mails non accordé : reconnecte-toi et coche la case');
      const list = await api(`${MAIL_API}?labelIds=INBOX&maxResults=10`, 'Gmail');
      const ids = (list.messages || []).map((m) => m.id);
      const hdr = 'metadataHeaders=From&metadataHeaders=Subject';
      const msgs = await Promise.all(ids.map((id) => api(`${MAIL_API}/${id}?format=metadata&${hdr}`, 'Gmail')));
      return msgs.map((m) => {
        const h = Object.fromEntries((m.payload?.headers || []).map((x) => [x.name.toLowerCase(), x.value]));
        return { from: sender(h.from), subject: (h.subject || '').trim() || '(sans objet)', unread: (m.labelIds || []).includes('UNREAD') };
      });
    },

    // L'agenda du jour (agenda principal) : [{ title, allDay, start, end }], dans l'ordre.
    async today() {
      await getToken();
      if (!granted.agenda) throw new Error('accès à l’agenda non accordé : reconnecte-toi et coche la case');
      const d0 = new Date(); d0.setHours(0, 0, 0, 0);
      const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);
      const q = `timeMin=${encodeURIComponent(d0.toISOString())}&timeMax=${encodeURIComponent(d1.toISOString())}` +
        '&singleEvents=true&orderBy=startTime&maxResults=25' +
        '&fields=items(summary,status,start,end,location,description,hangoutLink,conferenceData(conferenceSolution(name),entryPoints(entryPointType,uri)))';
      const j = await api(`${CAL_API}?${q}`, 'Agenda');
      return (j.items || []).filter((e) => e.status !== 'cancelled').map((e) => {
        const allDay = !!e.start?.date;
        const { kind, diag } = meetingKind(e);
        return {
          title: (e.summary || '').trim() || '(sans titre)',
          allDay,
          start: allDay ? null : new Date(e.start.dateTime),
          end: allDay ? null : new Date(e.end.dateTime),
          kind, // 'Meet' | 'Teams' | 'Zoom' | 'appel' | 'lieu' | ''
          diag, // ce qui a permis de décider (rien du texte n'est gardé)
        };
      });
    },

    // Oublie le jeton (et le révoque côté Google).
    forget() {
      try { if (token) window.google?.accounts?.oauth2?.revoke(token, () => {}); } catch { /* rien */ }
      token = null;
    },
  };
}
