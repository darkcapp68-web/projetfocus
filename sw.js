// Service worker : l'appli marche hors ligne une fois ouverte une première fois.
// Stratégie « réseau d'abord, cache en secours » : une nouvelle version publiée sur
// GitHub Pages arrive dès le chargement suivant (l'ancienne stratégie « cache d'abord »
// en demandait deux, d'où des écrans qui ne reflétaient pas les derniers changements).

const CACHE = 'projetfocus-v8';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/audio.js',
  'js/defaults.js',
  'js/sync.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'img/cadre-reveur.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== MUSIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Musique embarquée : trop lourde pour être mise en cache à l'installation.
// Chaque morceau écouté est gardé (en entier) pour la prochaine fois, hors ligne compris.
// Le lecteur audio demande des morceaux de fichier (« Range ») : on les découpe dans le cache.
const MUSIC = 'projetfocus-music-v1';
const pending = new Set();

function keepTrack(url) {
  if (pending.has(url)) return Promise.resolve();
  pending.add(url);
  return caches.open(MUSIC)
    .then(async (cache) => { if (!(await cache.match(url))) await cache.add(url); })
    .catch(() => {})
    .finally(() => pending.delete(url));
}

async function slice(res, range) {
  if (!range) return res;
  const blob = await res.blob();
  const total = blob.size;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return res;
  let start = m[1] === '' ? total - Number(m[2]) : Number(m[1]);
  let end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : total - 1;
  start = Math.max(0, start);
  end = Math.min(end, total - 1);
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Les radios (autres domaines) ne passent pas par le cache.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const url = req.url.split(/[?#]/)[0];
  if (new URL(url).pathname.includes('/music/')) {
    e.respondWith(caches.open(MUSIC).then(async (cache) => {
      const cached = await cache.match(url);
      if (cached) return slice(cached, req.headers.get('range'));
      e.waitUntil(keepTrack(url));
      return fetch(req);
    }));
    return;
  }
  // Le site : réseau d'abord (un seul F5 suffit pour voir une nouvelle version),
  // le cache si le réseau ne répond pas en 3 s ou si l'on est hors ligne.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req, { cache: 'no-cache' })
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
      const fallback = () => cached || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
      if (!cached) return network.catch(fallback);
      const late = new Promise((ok) => setTimeout(() => ok(cached), 3000));
      e.waitUntil(network.catch(() => {}));
      return Promise.race([network.catch(fallback), late]);
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const win = list.find((c) => 'focus' in c);
      return win ? win.focus() : self.clients.openWindow('./');
    }),
  );
});
