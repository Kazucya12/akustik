/* Uji pencarian ala Spotify (extra48): kelompok hasil, Hasil teratas, chip filter, Album, koreksi ejaan, riwayat, tanpa pencarian ganda.
   Jalankan: node build.js && node test/search48.js   (butuh npm i untuk jsdom) */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'loopify.js'), 'utf8').replace(/<\/script>/g, '<\\/script>');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="loopify.js"><\/script>/, '<script>' + bundle + '</script>');

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push((e.detail && e.detail.message) || e.message));
vc.on('error', (e) => errs.push(String(e)));

const calls = { music: [], suggest: [], artist: [] };
const J = (x) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(x) });

const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.HTMLMediaElement.prototype.play = () => Promise.resolve();
    w.HTMLMediaElement.prototype.pause = () => {};
    w.fetch = (u) => {
      u = String(u);
      const q = decodeURIComponent((u.split('q=')[1] || '').split('&')[0]);
      if (u.includes('/api/yt-music')) {
        calls.music.push(q);
        if (/swfit|zzzz/.test(q)) return J([]);
        return J([1, 2, 3, 4, 5, 6].map((i) => ({ id: 'v' + i + q.length, title: i == 1 ? q : q + ' #' + i, artist: 'Artis ' + i })));
      }
      if (u.includes('/api/suggest')) {
        calls.suggest.push(q);
        if (/swfit/.test(q)) return J(['taylor swift', 'taylor swift lover']);
        return J([q + ' live', q + ' acoustic']);
      }
      if (u.includes('albums=1')) return J({ albums: [{ id: 'PL1', name: '1989', img: '', n: 13 }, { id: 'PL2', name: 'Folklore', img: '', n: 16 }] });
      if (u.includes('/api/artist?q=')) {
        calls.artist.push(q);
        return J(/taylor/i.test(q) ? [{ src: 'yt', id: 'UC1', name: 'Taylor Swift', img: '', subs: 90000000, v: 1 }] : []);
      }
      return Promise.reject(new Error('offline (uji)'));
    };
  },
});

let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const w = dom.window, d = w.document;
  await wait(800);
  ok(errs.length === 0, 'tidak ada error saat memuat' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  w.eval("go('explore')");
  await wait(250);
  const v = d.getElementById('v');
  ok(!!d.getElementById('x48') && v.classList.contains('x48'), 'halaman Cari memakai wadah #x48');
  ok(d.querySelectorAll('#x16cat .x16c .x48e').length >= 10, 'kartu genre punya ikon');
  ok(/Apa yang ingin kamu dengarkan/.test(d.getElementById('qi').placeholder), 'placeholder ala Spotify');

  const type = async (q, ms) => {
    const i = d.getElementById('qi'); i.value = q;
    i.dispatchEvent(new w.Event('input', { bubbles: true }));
    await wait(ms || 900);
  };

  /* 1. pencarian normal */
  await type('taylor swift', 1700);
  const t1 = d.getElementById('x48').innerHTML;
  ok(d.querySelectorAll('#x48f .chip').length === 5, 'chip filter: Semua, Lagu, Artis, Album, Playlist');
  ok(/Hasil teratas/.test(t1) && d.querySelector('.x48t'), 'kartu Hasil teratas tampil');
  ok(/<i>Artis<\/i>/.test(d.querySelector('.x48t').innerHTML), 'nama artis persis -> Hasil teratas berupa Artis');
  ok(d.querySelectorAll('.x48tl .rw').length === 4 && /Lihat semua/.test(d.querySelector('.x48tl').innerHTML), 'Lagu: 4 baris + Lihat semua');
  ok(/<h3>Album<\/h3>/.test(t1) && /1989/.test(t1), 'bagian Album tampil (dari artis yang cocok)');
  ok(calls.music.filter((x) => x === 'taylor swift').length === 1, 'hanya 1x pencarian untuk 1 kata kunci (' + calls.music.filter((x) => x === 'taylor swift').length + 'x)');
  ok(v.classList.contains('x48q'), 'tampilan lama disembunyikan saat ada kata kunci');

  /* 2. filter */
  d.querySelector('#x48f [data-x48c="al"]').click(); await wait(150);
  ok(d.querySelectorAll('#x48 .rw').length === 2 && /Album · Taylor Swift/.test(d.getElementById('x48').innerHTML), 'filter Album: daftar album artis');
  d.querySelector('#x48f [data-x48c="sg"]').click(); await wait(150);
  ok(d.querySelectorAll('#x48 .rw').length >= 5 && d.querySelector('.x48so'), 'filter Lagu: semua lagu + urutan');
  d.querySelector('#x48f [data-x48c="ar"]').click(); await wait(150);
  ok(/Taylor Swift/.test(d.getElementById('x48').innerHTML) && /subscriber/.test(d.getElementById('x48').innerHTML), 'filter Artis: baris artis');
  d.querySelector('#x48f [data-x48c="pl"]').click(); await wait(150);
  ok(/Tidak ada playlist/.test(d.getElementById('x48').innerHTML), 'filter Playlist: pesan kosong');
  d.querySelector('#x48f [data-x48c="all"]').click(); await wait(150);

  /* 3. lagu persis -> Hasil teratas = lagu */
  await type('lagu tes', 1700);
  ok(/<i>Lagu<\/i>/.test((d.querySelector('.x48t') || { innerHTML: '' }).innerHTML), 'judul persis -> Hasil teratas berupa Lagu');

  /* 4. salah ketik: saran */
  await type('taylor swfit', 1700);
  const fx = d.querySelector('.x48fx');
  ok(!!d.getElementById('x48').querySelector('[data-x48k]') || !!fx, 'salah ketik -> banner koreksi muncul');
  await wait(1800);
  const bt = d.getElementById('x48').innerHTML;
  ok(/Menampilkan hasil untuk <b>taylor swift<\/b>/.test(bt), 'hasil kosong + koreksi -> otomatis mencari "taylor swift"');
  ok(/Cari <a[^>]*data-x48k="orig"[^>]*>“taylor swfit”/.test(bt), 'ada tautan "Cari ... saja"');
  d.querySelector('[data-x48k="orig"]').click(); await wait(1500);
  ok(!/Menampilkan hasil untuk/.test(d.getElementById('x48').innerHTML) && /Tidak ada hasil/.test(d.getElementById('x48').innerHTML), 'pilih "Cari ... saja" -> tidak dikoreksi lagi');

  /* 5. hapus teks & riwayat */
  d.querySelector('.x48x').click(); await wait(300);
  ok(d.getElementById('qi').value === '' && !v.classList.contains('x48q'), 'tombol hapus teks mengosongkan pencarian');
  const rc = d.querySelectorAll('.x48rc');
  ok(rc.length >= 2, 'Pencarian terbaru tampil sebagai daftar (' + rc.length + ')');
  const before = rc.length;
  d.querySelector('.x48d').click(); await wait(200);
  ok(d.querySelectorAll('.x48rc').length === before - 1, 'hapus satu riwayat');
  d.querySelector('[data-x48f="clr"]').click(); await wait(200);
  ok(d.querySelectorAll('.x48rc').length === 0, 'hapus semua riwayat');

  ok(errs.length === 0, 'tidak ada error selama pengujian' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fail ? '\n' + fail + ' pengujian gagal' : '\nSemua pengujian lolos');
  process.exit(fail ? 1 : 0);
})();
