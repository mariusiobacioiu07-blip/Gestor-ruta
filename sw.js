// Cambia este número cada vez que subas una actualización a Netlify
// Eso fuerza al encargado a recibir la versión nueva automáticamente
const CACHE = 'gestorrutas-v11';
const ASSETS = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Activa el nuevo SW inmediatamente
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim()) // Toma control de todos los tabs abiertos
  );
});

self.addEventListener('fetch', e => {
  // Estrategia: Network First (intenta red primero, caché como fallback)
  // Así el encargado siempre ve la versión más nueva si tiene internet
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request)) // Sin internet → usa caché
  );
});
