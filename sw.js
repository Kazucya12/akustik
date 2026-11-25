// Service worker: cangkang aplikasi tersimpan supaya bisa dibuka offline. /api dan sumber luar tidak disentuh.
// v4.29: cangkang = bundle (loopify.css/js) hasil node build.js. v3.5: login Gmail (extra4.js). v3.4: cache-first (buka instan), file diperbarui diam-diam di latar belakang.
const C = 'ma-v4.43.0-7f1f1e51';
const SHELL = ['./', 'index.html', 'loopify.css', 'loopify.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => {
  // addAll gagal total kalau satu file hilang, jadi tiap file dicoba sendiri
  e.waitUntil(caches.open(C).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C && x !== 'ma-fol').map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.endsWith('.apk') || u.pathname.startsWith('/__local/')) return;
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

// Rilis baru dari artis yang diikuti (Periodic Background Sync; hanya di PWA terpasang pada browser yang mendukung).
// Daftar artis disimpan aplikasi di Cache Storage 'ma-fol' (service worker tidak bisa membaca localStorage).
async function cekRilis() {
  const c = await caches.open('ma-fol');
  const r = await c.match('/__fol');
  if (!r) return;
  const f = await r.json();
  let ubah = false;
  for (const a of f.slice(0, 8)) {
    try {
      const j = await (await fetch('/api/artist?src=yt&latest=1&n=1&id=' + encodeURIComponent(a.i) + '&name=' + encodeURIComponent(a.n))).json();
      const t = (j.tracks || [])[0];
      if (!t) continue;
      if (a.last && a.last !== t.id) await self.registration.showNotification(a.n + ' rilis baru', { body: t.title, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'new-' + a.i });
      if (a.last !== t.id) { a.last = t.id; ubah = true; }
    } catch (e) { /* abaikan, coba lagi di jadwal berikutnya */ }
  }
  if (ubah) await c.put('/__fol', new Response(JSON.stringify(f), { headers: { 'Content-Type': 'application/json' } }));
}
self.addEventListener('periodicsync', (e) => { if (e.tag === 'ma-new') e.waitUntil(cekRilis()); });
