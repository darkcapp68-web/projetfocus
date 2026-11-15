// Pont (15/11/2026) : la 1.0 est archivée dans v1/ et l'adresse racine ouvre la 2.0 (v2/).
// Les appareils qui avaient installé l'ancien service worker de la 1.0 reçoivent celui-ci : il efface les
// caches de la 1.0 (pages et musiques) et laisse tout passer par le réseau, pour ne jamais servir l'ancienne version.
// La 2.0 a son propre service worker, limité à v2/.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('projetfocus-')).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', () => { /* rien : réseau direct */ });
