// StudySync PWA Service Worker - Automatic Self-Destruct & Cache Eviction
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.claim())
  );
});

// Zero fetch listeners - do NOT proxy or intercept any network traffic
