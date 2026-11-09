// Service worker: cangkang aplikasi tersimpan supaya bisa dibuka offline. /api dan sumber luar tidak disentuh.
const C = 'ma-v3.3.0';
const SHELL = ['./', 'index.html', 'style.css', 'web.css', 'app.js', 'extra.js', 'extra2.js', 'web.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then((m) => m || caches.match('index.html')))
  );
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
