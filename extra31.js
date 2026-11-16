/* extra31.js - JioSaavn: hasil pencarian + lirik cadangan (v4.30)
   Butuh /api/jiosaavn (api/jiosaavn.js) dan env JIOSAAVN_API_URL di Vercel.
   1) Pencarian: hasil JioSaavn tampil bersama hasil YouTube. Lagunya ditandai rec:1 tanpa url,
      jadi saat diputar, aplikasi otomatis mencari versi YouTube-nya (resolveRec di app.js).
   2) Lirik: lrclib tetap dicoba lebih dulu (ada lirik berjalan). Kalau kosong, baru ambil dari JioSaavn (teks biasa).
   Kalau JIOSAAVN_API_URL belum diisi atau backend mati, semuanya diam-diam dilewati dan aplikasi jalan seperti biasa. */
(function () {
  /* ---------- 1. Pencarian ---------- */
  var _srch = srch;
  srch = async function (s) {
    if (cfg.src === 'radio') return _srch(s);   // sumber Radio tetap seperti semula
    try {
      var r = await fetch('/api/jiosaavn?action=search&q=' + encodeURIComponent(s));
      if (!r.ok) return [];                     // 501 (belum diatur) atau 502 (backend mati): lewati saja
      var a = await r.json();
      if (!Array.isArray(a)) return [];
      return a.slice(0, 15).map(function (x) {
        return {
          id: 'j' + x.id, jid: x.id, jio: 1, rec: 1,
          title: x.title, artist: x.artist || 'Tidak diketahui', img: x.img || '',
          h: hh(x.title)
        };
      });
    } catch (e) { return []; }
  };

  /* ---------- 2. Lirik cadangan ---------- */
  var JT = {};
  var _fl = fetchLy;
  fetchLy = async function (t) {
    try { await _fl(t); } catch (e) {}
    try {
      if (!t || t.radio || t.loc || JT[t.id]) return;
      if (lyS[t.id] !== 'none') return;         // lrclib berhasil, atau masih jalan: tidak perlu cadangan
      JT[t.id] = 1;
      lyS[t.id] = 'load';
      if (cur && cur.id == t.id && typeof rp === 'function') rp();

      var cl = function (x) { return String(x || '').replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim(); };
      var generic = /^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
      var title = cl(t.title), artist = generic.test(t.artist || '') ? '' : cl(t.artist);
      if (t.yt && !t.jio) {                      // judul video mentah: buang kata tambahan, pisahkan "Artis - Judul"
        title = title.replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip)\b/ig, ' ').replace(/\s+/g, ' ').trim();
        var m = title.split(/\s[-\u2013\u2014|]\s/);
        if (m.length > 1) { artist = m[0].trim(); title = m.slice(1).join(' ').trim(); }
      }
      var url = '/api/jiosaavn?action=lyrics' + (t.jid ? '&id=' + encodeURIComponent(t.jid)
        : '&t=' + encodeURIComponent(title) + '&a=' + encodeURIComponent(artist));
      var txt = '';
      if (title || t.jid) {
        var r = await fetch(url);
        if (r.ok) { var j = await r.json(); txt = String((j && j.lyrics) || '').trim(); }
      }
      if (txt) {
        lyc[t.id] = txt;
        var k = Object.keys(lyc);
        if (k.length > 150) k.slice(0, k.length - 150).forEach(function (x) { delete lyc[x]; });
        ls.set('ly', lyc);
        lyS[t.id] = 'ok';
      } else lyS[t.id] = 'none';
      if (cur && cur.id == t.id && typeof rp === 'function' && ((typeof pm !== 'undefined' && pm) || (typeof krOn === 'function' && krOn()))) rp();
    } catch (e) {
      try { if (lyS[t.id] === 'load') lyS[t.id] = 'none'; } catch (_) {}
    }
  };
})();
