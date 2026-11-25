// Service worker khusus APK (didaftarkan oleh APK menggantikan sw.js; lihat langkah "Siapkan situs" di build-apk.yml).
// TANPA cache dan TANPA fetch handler: isi aplikasi sudah ada di dalam APK dan hanya berubah lewat pembaruan APK,
// jadi tidak ada lagi versi basi dari cache. Tetap ada supaya notifikasi (showNotification) dan sinkron rilis artis jalan.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  // hapus cache lama milik sw.js (kecuali 'ma-fol' = daftar artis yang diikuti)
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== 'ma-fol').map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((l) => {
    for (const c of l) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });

// Rilis baru dari artis yang diikuti (Periodic Background Sync, bila didukung). Daftar artis ada di Cache Storage 'ma-fol'.
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
