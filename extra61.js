/* v4.45: pemberitahuan singkat (toast) yang benar-benar tampil. Sebelumnya toast() langsung return (mati), jadi pesan seperti
   "Berhenti dalam 30 menit", "Lencana baru", dan pesan error tidak pernah terlihat. Dimuat paling akhir; menimpa toast() dari app.js. */
(function () {
  var el = null, tm = 0, last = '', lastT = 0;
  function mk() {
    if (el && el.isConnected) return el;
    el = document.createElement('div');
    el.id = 'tst61';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    (document.getElementById('app') || document.body).appendChild(el);
    return el;
  }
  window.toast = function (m) {
    try {
      m = String(m == null ? '' : m).replace(/\s+/g, ' ').trim();
      if (!m) return;
      var now = Date.now();
      if (m === last && now - lastT < 1200) return;      /* pesan sama beruntun: cukup sekali */
      last = m; lastT = now;
      var d = mk();
      d.textContent = m.slice(0, 140);                   /* textContent: isi pesan tidak pernah dianggap HTML */
      d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
      clearTimeout(tm);
      /* lama tampil menyesuaikan panjang pesan: 2,2 dtk (pendek) sampai 6 dtk (panjang) */
      tm = setTimeout(function () { d.classList.remove('on'); }, Math.min(6000, Math.max(2200, 1400 + m.length * 45)));
    } catch (e) {}
  };
})();
