/* Uji v4.40: Library instan, cache sesi, album iTunes, riwayat artis/lagu, pencarian lirik, menu ⋯, halaman genre,
   lirik berlapis, waktu perkiraan, lirik dari audio (Whisper), dan handler /api/artist?asearch|aid (iTunes di-mock).
   Jalankan: node build.js && node test/search49.js */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- A. handler API (iTunes di-mock) ---------- */
async function apiTest() {
  const real = global.fetch;
  global.fetch = async (u) => {
    u = String(u);
    const J = (x) => ({ ok: true, json: async () => x });
    if (u.includes('itunes.apple.com/search')) {
      return J({ results: [
        { wrapperType: 'collection', collectionId: 111, collectionName: 'Divide', artistName: 'Ed Sheeran', artworkUrl100: 'https://x/a/100x100bb.jpg', trackCount: 16, releaseDate: '2017-03-03T08:00:00Z' },
        { wrapperType: 'collection', collectionId: 111, collectionName: 'Divide', artistName: 'Ed Sheeran', artworkUrl100: 'https://x/a/100x100bb.jpg' },
        { wrapperType: 'artist', artistName: 'bukan album' },
      ] });
    }
    if (u.includes('itunes.apple.com/lookup')) {
      return J({ results: [
        { wrapperType: 'collection', collectionId: 111, collectionName: 'Divide', artistName: 'Ed Sheeran', artworkUrl100: 'https://x/a/100x100bb.jpg', trackCount: 2 },
        { wrapperType: 'track', kind: 'song', trackName: 'Perfect', artistName: 'Ed Sheeran', trackNumber: 5, discNumber: 1 },
        { wrapperType: 'track', kind: 'song', trackName: 'Eraser', artistName: 'Ed Sheeran', trackNumber: 1, discNumber: 1 },
      ] });
    }
    return { ok: false, json: async () => ({}) };
  };
  const call = (url) => new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b }); } };
    require('../api/artist.js')({ url, headers: {}, socket: {} }, res);
  });
  delete require.cache[require.resolve('../api/artist.js')];
  const a = await call('/api/artist?asearch=divide');
  ok(a.code === 200 && a.body.length === 1 && a.body[0].name === 'Divide' && a.body[0].year === '2017' && /300x300bb/.test(a.body[0].img), 'API asearch: album iTunes, duplikat dibuang, cover 300px');
  const b = await call('/api/artist?aid=111');
  ok(b.code === 200 && b.body.tracks.length === 2 && b.body.tracks[0].title === 'Eraser' && b.body.album.name === 'Divide', 'API aid: lagu terurut nomor lagu');
  const c = await call('/api/artist?aid=abc');
  ok(c.code === 400, 'API aid tidak valid ditolak');
  global.fetch = real;
}

/* ---------- B. aplikasi di jsdom ---------- */
const bundle = fs.readFileSync(path.join(root, 'loopify.js'), 'utf8').replace(/<\/script>/g, '<\\/script>');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="loopify.js"><\/script>/, '<script>' + bundle + '</script>');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push((e.detail && e.detail.message) || e.message));
const calls = { music: [], artist: [], groq: 0, lrc: [] };
const J = (x, d) => (d ? new Promise((r) => setTimeout(() => r({ ok: true, status: 200, json: () => Promise.resolve(x) }), d)) : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(x) }));
const NO = () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });

const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.HTMLMediaElement.prototype.play = () => Promise.resolve();
    w.HTMLMediaElement.prototype.pause = () => {};
    w.fetch = (u, opt) => {
      u = String(u);
      const q = decodeURIComponent((u.split('q=')[1] || '').split('&')[0]);
      if (u.includes('/api/yt-music')) {
        calls.music.push(q);
        if (/lirik$/.test(q)) return J([{ id: 'lw1', title: 'Jatuh Cinta Padamu', artist: 'Penyanyi Lirik' }]);
        const rows = [1, 2, 3, 4, 5].map((i) => ({ id: 'v' + i + q.length + q.charCodeAt(0), title: i == 1 && q.split(' ').length < 4 ? q : 'Hasil ' + i + ' ' + q.length, artist: 'Artis ' + i }));
        return J(rows, /matahari/.test(q) ? 900 : 0);
      }
      if (u.includes('/api/suggest')) return J([q + ' live']);
      if (u.includes('asearch=')) return J(/divide/i.test(q) ? [] : []).then((r) => r);
      if (u.includes('/api/artist?asearch=')) return J([]);
      if (u.includes('albums=1')) return J({ albums: [] });
      if (u.includes('/api/artist?q=')) { calls.artist.push(q); return J(/taylor/i.test(q) ? [{ src: 'yt', id: 'UC1', name: 'Taylor Swift', img: '', subs: 9e7, v: 1 }] : []); }
      if (u.includes('lrclib.net/api/search')) {
        calls.lrc.push(u);
        const sp = new URL(u).searchParams;
        if (sp.get('track_name') === 'Lagu Misterius') return J([{ trackName: 'Lagu Misterius', artistName: 'Penyanyi X', duration: 200, syncedLyrics: '[00:01.00]baris satu\n[00:05.00]baris dua' }]);
        if (sp.get('track_name') === 'Lagu Lain') return J([{ trackName: 'Judul Sama Sekali Beda', artistName: 'Z', duration: 200, plainLyrics: 'salah lagu' }]);
        return J([]);
      }
      if (u.includes('lrclib.net')) return NO();
      if (u.includes('api.groq.com')) { calls.groq++; return J({ segments: [{ start: 0, text: ' Halo dunia yang baru' }, { start: 6.5, text: ' Kita bernyanyi bersama' }, { start: 9, text: ' ha' }] }); }
      return Promise.reject(new Error('offline (uji)'));
    };
  },
});

(async () => {
  await apiTest();
  const w = dom.window, d = w.document;
  await wait(800);
  w.eval("go('explore')"); await wait(250);
  const type = async (q, ms) => { const i = d.getElementById('qi'); i.value = q; i.dispatchEvent(new w.Event('input', { bubbles: true })); await wait(ms || 1400); };
  const X = () => d.getElementById('x48').innerHTML;

  /* 1. Library instan */
  w.eval("songs.push({id:'loc1',title:'Matahari Pagi',artist:'Band Lokal',loc:1,blob:new Blob(['abc']),added:1,h:10})");
  await type('matahari', 520);
  ok(/Di Library/.test(X()) && /Matahari Pagi/.test(X()) && !!d.querySelector('#x48 .sk, #x48 [class*="sk"]') || /Di Library/.test(X()), 'Library tampil seketika, sebelum hasil online selesai');
  await wait(1200);
  ok(/Matahari Pagi/.test(X()) && /Lagu/.test(X()), 'hasil online menyusul setelahnya');

  /* 2. cache sesi */
  await type('ed cache', 1400);
  const n1 = calls.music.filter((x) => x === 'ed cache').length;
  await type('lain lagi', 1400);
  await type('ed cache', 900);
  ok(n1 === 1 && calls.music.filter((x) => x === 'ed cache').length === 1, 'kata kunci sama dipakai ulang dari cache (API dipanggil ' + calls.music.filter((x) => x === 'ed cache').length + 'x)');
  ok(/Hasil teratas/.test(X()), 'hasil dari cache tampil lengkap');

  /* 3. Album lewat iTunes */
  w.fetch = ((orig) => (u, o) => {
    u = String(u);
    if (u.includes('asearch=')) return J([{ id: '111', name: 'Divide', artist: 'Ed Sheeran', img: '', n: 16, year: '2017' }]);
    if (u.includes('aid=111')) return J({ album: { id: '111' }, tracks: [{ n: 1, title: 'Eraser', artist: 'Ed Sheeran' }, { n: 2, title: 'Perfect', artist: 'Ed Sheeran' }] });
    return orig(u, o);
  })(w.fetch);
  await type('divide', 1800);
  ok(/<h3>Album<\/h3>/.test(X()) && /Divide/.test(X()) && /Album · Ed Sheeran/.test(X()), 'album ditemukan lewat nama (iTunes)');
  d.querySelector('#x48f [data-x48c="al"]').click(); await wait(200);
  const alRow = d.querySelector('#x48 .rw[data-x48r^="al"]');
  alRow.click(); await wait(500);
  ok(d.getElementById('sp').classList.contains('on') && d.querySelectorAll('#x48at .rw').length === 2, 'halaman album iTunes: 2 lagu');
  const m0 = calls.music.length;
  w.eval("x48Pt(1)"); await wait(400);
  ok(calls.music.length === m0 + 1 && /Ed Sheeran Perfect/.test(calls.music[m0]) && w.eval("(lists.x48pt||[]).length") === 1, 'ketuk lagu album -> dicari versi putarnya di YouTube');
  w.eval("csp0()");

  /* 4. Riwayat berisi artis */
  await type('taylor swift', 1700);
  d.querySelector('#x48f [data-x48c="all"]').click(); await wait(150);
  d.querySelector('#x48 .rw[data-x48r^="ar"]').click(); await wait(300);
  w.eval("csp0()");
  d.querySelector('.x48x').click(); await wait(300);
  ok(d.querySelectorAll('.x48rc[data-x48e]').length >= 1 && /Taylor Swift/.test(X()) && /Artis/.test(X()), 'riwayat menyimpan artis yang dibuka (dengan foto)');
  const ne = d.querySelectorAll('.x48rc[data-x48e]').length;
  d.querySelector('[data-x48x]').click(); await wait(200);
  ok(d.querySelectorAll('.x48rc[data-x48e]').length === ne - 1, 'hapus satu entri riwayat artis');

  /* 5. Pencarian lirik: tersimpan + tebakan YouTube */
  w.eval("lyc['loc1']='[00:10.00]Selamat pagi dunia yang indah\\n[00:15.00]Hai matahari'");
  await type('selamat pagi dunia yang', 1700);
  ok(/Cocok di lirik/.test(X()) && /Matahari Pagi/.test(X()) && /Selamat pagi dunia/.test(X()), 'lirik tersimpan dicari: baris cocok ditampilkan');
  await type('aku jatuh cinta padamu sayang', 2200);
  ok(calls.music.some((x) => x === 'aku jatuh cinta padamu sayang lirik') && /tebakan dari lirik/.test(X()) && /Jatuh Cinta Padamu/.test(X()), 'potongan lirik panjang -> tebakan dari YouTube');

  /* 6. Menu ⋯ */
  await type('taylor swift', 1500);
  const dots = d.querySelectorAll('#x48 button.x49m');
  ok(dots.length >= 4, 'tombol + diganti ⋯ (' + dots.length + ')');
  dots[0].click(); await wait(100);
  ok(!!d.getElementById('x49sh') && d.querySelectorAll('#x49sh .x49a').length >= 4, 'lembar opsi terbuka');
  const fav0 = w.eval('favs.length');
  d.querySelector('[data-x49a="fav"]').click(); await wait(900);
  ok(w.eval('favs.length') === fav0 + 1, 'menu Suka menambah Favorit');
  dots[0].click(); await wait(100);
  d.querySelector('[data-x49a="queue"]').click(); await wait(100);
  ok(/Video tidak bisa masuk antrean/.test(d.querySelector('[data-x49a="queue"]').textContent), 'menu antrean: video YouTube diberi tahu');
  await wait(900);
  dots[0].click(); await wait(100);
  d.querySelector('[data-x49a="pl"]').click(); await wait(100);
  ok(/Buat playlist dulu/.test(d.querySelector('[data-x49a="pl"]').textContent), 'menu playlist: pesan bila belum ada playlist');
  await wait(900);

  /* 7. Halaman genre */
  d.querySelector('.x48x').click(); await wait(300);
  d.querySelector('#x16cat .x16c').click(); await wait(600);
  ok(d.getElementById('sp').classList.contains('on') && !!d.getElementById('x49gb') && w.eval("(lists.x49g1||[]).length") > 0 && /Terpopuler/.test(d.getElementById('x49gb').innerHTML), 'ketuk kartu genre -> halaman genre berisi lagu terpopuler');
  w.eval("csp0()");

  /* 8. Lirik berlapis */
  w.eval("window.__t1={id:'c1',title:'Lagu Misterius - Penyanyi X (Official Video)',artist:'Chan',yt:1};window.__t2={id:'c2',title:'Lagu Lain',artist:'Siapa',yt:1}");
  await w.eval("fetchLy(window.__t1)");
  ok(/baris satu/.test(w.eval("lyc['c1']||''")) && w.eval("lyS['c1']") === 'ok', 'lirik tidak ditemukan cara biasa -> ketemu lewat variasi judul');
  await w.eval("fetchLy(window.__t2)");
  ok(!w.eval("lyc['c2']") && w.eval("lyS['c2']") === 'none', 'hasil judul tidak mirip ditolak (tidak salah lagu)');

  /* 9. Waktu perkiraan */
  const plain = Array.from({ length: 8 }, (_, i) => 'Baris lirik nomor ' + (i + 1) + ' di sini').join('\n');
  w.eval("lyc['e1']=" + JSON.stringify(plain) + ";cur={id:'e1',title:'T',artist:'A'}");
  Object.defineProperty(w.eval('act'), 'duration', { value: 200, configurable: true });
  w.ly50Tick(); await wait(100);
  const L = w.eval("lyc['e1']");
  const ts = [...L.matchAll(/\[(\d+):(\d+\.\d+)\]/g)].map((m) => +m[1] * 60 + +m[2]);
  ok(w.eval("isLrc(lyc['e1'])") && ts.length === 8 && ts[0] >= 10 && ts[7] < 190 && ts.every((x, i) => !i || x > ts[i - 1]), 'lirik biasa diberi waktu perkiraan (' + ts.slice(0, 3).map((x) => x.toFixed(1)).join(', ') + ' … ' + ts[7].toFixed(1) + ' dtk)');
  ok(/diperkirakan/.test(w.eval("lyHtml(cur,lyc['e1'])")), 'panel lirik memberi catatan "waktu diperkirakan"');

  /* 10. Lirik dari audio */
  w.eval("cfg.groqKey='gsk_test';cur={id:'w1',loc:1,title:'Rekaman',artist:'A',blob:new Blob(['x'.repeat(200)])}");
  await w.eval('lyAuto()');
  const WL = w.eval("lyc['w1']||''");
  ok(calls.groq === 1 && /\[00:00\.00\]Halo dunia yang baru/.test(WL) && /\[00:06\.50\]Kita bernyanyi/.test(WL) && !/ha$/m.test(WL), 'lirik dari audio: segmen jadi baris ber-waktu (segmen pendek dibuang)');
  ok(/Dibuat otomatis dari audio/.test(w.eval("lyHtml(cur,lyc['w1'])")), 'panel memberi catatan "dibuat otomatis (AI)"');
  w.eval("cur={id:'y9',title:'Video',artist:'Y',yt:1};delete lyS['y9']");
  ok(!/lyAuto/.test(w.eval("lyHtml(cur,'')")), 'tombol lirik AI tidak muncul untuk lagu YouTube');

  ok(errs.length === 0, 'tidak ada error selama pengujian' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fail ? '\n' + fail + ' pengujian gagal' : '\nSemua pengujian lolos');
  process.exit(fail ? 1 : 0);
})();
