/* extra37.js - Pengaturan: bagian "Unduh Aplikasi" (v4.37)
   1) Unduh APK: mengunduh file loopify.apk dari server (taruh hasil PWABuilder di folder utama dengan nama itu).
      Sebelum mengunduh, file diperiksa dulu supaya tidak mengunduh halaman error.
   2) Pasang ke layar utama (PWA): memakai prompt instal browser kalau tersedia, kalau tidak ditampilkan petunjuknya.
   Dimuat setelah extra36.js. */
(function () {
  var APK = 'loopify.apk';

  function standalone() {
    try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; }
  }

  window.x37Apk = async function () {
    toast('Memeriksa file APK\u2026');
    try {
      var r = await fetch(APK, { method: 'HEAD', cache: 'no-store' });
      var ct = r.headers.get('content-type') || '';
      if (!r.ok || /text\/html/i.test(ct)) { toast('File APK belum tersedia di server'); return; }
    } catch (e) { toast('Tidak bisa memeriksa file. Periksa internet.'); return; }
    var a = document.createElement('a');
    a.href = APK; a.download = 'Loopify.apk';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Mengunduh Loopify.apk. Buka dari notifikasi untuk memasang.');
  };

  window.x37Pwa = function () {
    try { if (typeof dip !== 'undefined' && dip) { insGo(); return; } } catch (e) {}
    toast('Buka menu browser \u22EE lalu pilih Instal aplikasi / Tambahkan ke layar utama');
  };

  function html() {
    var inst = standalone();
    return '<div class="x37row"><div class="sec"><h3>Unduh Aplikasi</h3></div>' +
      '<div class="ft" onclick="x37Apk()"><span>\u2B07</span><div>Unduh APK (Android)<br><small>Pasang Loopify sebagai aplikasi. Izinkan \u201Cpasang dari sumber ini\u201D bila diminta</small></div></div>' +
      '<div class="ft" onclick="x37Pwa()"><span>\uD83D\uDCF2</span><div>Pasang ke layar utama<br><small>' +
      (inst ? 'Kamu sedang membuka dari aplikasi yang sudah terpasang' : 'Tanpa APK, langsung dari browser') + '</small></div></div></div>';
  }

  try {
    var _setR = setR;
    setR = function () {
      _setR.apply(this, arguments);
      var sp = document.getElementById('sp');
      if (!sp || sp.querySelector('.x37row')) return;
      var tgt = null;
      sp.querySelectorAll('.sec h3').forEach(function (h) { if (h.textContent === 'Lainnya') tgt = h.parentNode; });
      if (tgt) tgt.insertAdjacentHTML('beforebegin', html());
      else sp.insertAdjacentHTML('beforeend', html());
    };
  } catch (e) {}
})();
