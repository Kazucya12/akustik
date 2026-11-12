// Service worker: cangkang aplikasi tersimpan supaya bisa dibuka offline. /api dan sumber luar tidak disentuh.
// v3.5: login Gmail (extra4.js). v3.4: cache-first (buka instan), file diperbarui diam-diam di latar belakang.
const C = 'ma-v3.7.0';
const SHELL = ['./', 'index.html', 'style.css', 'web.css', 'dialog.js', 'app.js', 'extra.js', 'extra2.js', 'extra3.js', 'extra4.js', 'extra5.js', 'extra6.js', 'extra7.js', 'extra8.js', 'web.js', 'musicapi.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => {
  // addAll gagal total kalau satu file hilang, jadi tiap file dicoba sendiri
  e.waitUntil(caches.open(C).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: r.mode === 'navigate' }).then((hit) => {
      const net = fetch(r).then((res) => {
        if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); }
        return res;
      }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return net.then((res) => res || caches.match('index.html'));
    })
  );
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((l) => {
    for (const c of l) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
