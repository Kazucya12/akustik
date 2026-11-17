/* extra38.js - Musik di perangkat (hanya di aplikasi Android Loopify; v4.38)
   Aplikasi native menyediakan jembatan LoopifyNative: pindai MediaStore dan sajikan file lewat /__local/ID.
   Lagu hasil pindai masuk ke daftar lagu lokal TANPA menyalin file (tidak memakan ruang), memakai url dari urls[id].
   Di browser biasa (tanpa jembatan) file ini tidak melakukan apa-apa. Dimuat setelah extra37.js. */
(function () {
  var N = window.LoopifyNative;
  if (!N || typeof N.scan !== 'function') return;

  var manual = 0;
  var origin = location.origin;

  function devUrl(s) { return origin + '/__local/' + s.did; }

  /* url lagu perangkat harus dipulihkan setiap aplikasi dibuka (urls hanya hidup di memori) */
  function fix() {
    try {
      for (var i = 0; i < songs.length; i++) {
        var s = songs[i];
        if (s && s.dev && !urls[s.id]) urls[s.id] = devUrl(s);
      }
    } catch (e) {}
  }
  setInterval(fix, 1000);
  fix();

  function putAll(list) {
    return tx('readwrite', function (o) {
      var r;
      list.forEach(function (s) { r = o.put(s); });
      return r;
    });
  }
  function delAll(ids) {
    return tx('readwrite', function (o) {
      var r;
      ids.forEach(function (id) { r = o.delete(id); });
      return r;
    });
  }

  window.x38perm = function (ok) {
    if (ok) { N.scan(); } else { toast('Izin musik ditolak. Aktifkan di Info aplikasi \u2192 Izin'); }
  };

  window.x38Scan = function () {
    manual = 1;
    var has = false;
    try { has = N.hasAudio(); } catch (e) {}
    if (has) { toast('Memindai musik\u2026'); N.scan(); } else { N.askAudio(); }
  };

  window.x38done = function (arr) {
    var m = manual; manual = 0;
    try {
      arr = arr || [];
      var seen = {}, have = {};
      songs.forEach(function (s) { have[s.id] = 1; });
      var base = Date.now(), n = arr.length, add = [];
      arr.forEach(function (x, k) {
        var id = 'd' + x.i; seen[id] = 1;
        if (have[id]) return;
        var t = String(x.t || 'Lagu').trim() || 'Lagu', a = String(x.a || '').trim();
        if (!a || /^<unknown>$/i.test(a)) a = 'Lagu Saya';
        add.push({ id: id, loc: 1, dev: 1, did: x.i, title: t, artist: a, h: hh(t), added: base + (n - k) });
      });
      /* lagu perangkat yang filenya sudah tidak ada dibuang dari daftar */
      var gone = [];
      if (n > 0) songs.forEach(function (s) { if (s.dev && !seen[s.id]) gone.push(s.id); });
      if (gone.length) {
        songs = songs.filter(function (s) { return !(s.dev && !seen[s.id]); });
        delAll(gone).catch(function () {});
      }
      if (!add.length && !gone.length) { if (m) toast(n ? 'Tidak ada lagu baru' : 'Tidak ada musik ditemukan di HP'); return; }
      add.forEach(function (s) { urls[s.id] = devUrl(s); songs.push(s); });
      songs.sort(function (a, b) { return a.added - b.added; });
      if (add.length) putAll(add).catch(function () {});
      ls.set('dev38', 1);
      if (m || add.length) toast(add.length ? add.length + ' lagu ditemukan di HP' : 'Daftar diperbarui');
      go(pg);
    } catch (e) { if (m) toast('Gagal memindai musik'); }
  };

  window.x38Clear = async function () {
    var ids = songs.filter(function (s) { return s.dev; }).map(function (s) { return s.id; });
    if (!ids.length) { toast('Belum ada lagu hasil pindai'); return; }
    if (!await uiConfirm('Lagu hasil pindai dihapus dari daftar. File musik di HP tidak dihapus.', { title: 'Hapus hasil pindai?', ok: 'Hapus', danger: 1 })) return;
    try { await delAll(ids); } catch (e) {}
    songs = songs.filter(function (s) { return !s.dev; });
    ids.forEach(function (id) { delete urls[id]; });
    ls.set('dev38', 0);
    toast(ids.length + ' lagu dihapus dari daftar');
    go(pg);
  };

  function html() {
    var c = 0;
    try { c = songs.filter(function (s) { return s.dev; }).length; } catch (e) {}
    return '<div class="x38row"><div class="sec"><h3>Musik di Perangkat</h3></div>' +
      '<div class="ft" onclick="x38Scan()"><span>\uD83C\uDFB5</span><div>Pindai musik di HP<br><small>' +
      (c ? c + ' lagu dari HP di daftarmu. Lagu baru ditambahkan otomatis saat aplikasi dibuka' : 'Cari semua lagu di HP dan masukkan ke daftar tanpa menyalin file') +
      '</small></div></div>' +
      (c ? '<div class="ft" onclick="x38Clear()"><span>\uD83D\uDDD1</span><div>Hapus hasil pindai<br><small>Hanya dari daftar, file di HP tetap aman</small></div></div>' : '') +
      '</div>';
  }

  try {
    var _setR = setR;
    setR = function () {
      _setR.apply(this, arguments);
      var sp = document.getElementById('sp');
      if (!sp || sp.querySelector('.x38row')) return;
      var tgt = null;
      sp.querySelectorAll('.sec h3').forEach(function (h) { if (h.textContent === 'Lainnya') tgt = h.parentNode; });
      if (tgt) tgt.insertAdjacentHTML('beforebegin', html());
      else sp.insertAdjacentHTML('beforeend', html());
    };
  } catch (e) {}

  /* pindai otomatis saat aplikasi dibuka, kalau pernah dipindai dan izin masih ada */
  setTimeout(function () {
    try { if (ls.get('dev38', 0) && N.hasAudio()) { manual = 0; N.scan(); } } catch (e) {}
  }, 2500);
})();
