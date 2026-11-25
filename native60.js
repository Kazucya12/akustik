/* Uji v4.44: perintah dari APK (bagikan tautan, pintasan, Android Auto), sinkron perpustakaan, tanpa jeda antar lagu.
   Jalankan: node test/native60.js  (setelah node build.js) */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'loopify.js'), 'utf8').replace(/<\/script>/g, '<\\/script>');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="loopify.js"><\/script>/, '<script>' + bundle + '</script>');
const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push((e.detail && e.detail.message) || e.message));
const native = { pending: '', lib: [], takeCmd() { const r = this.pending; this.pending = ''; return r; }, setLibrary(j) { this.lib.push(j); } };
const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.LoopifyNative = native;
    w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.HTMLMediaElement.prototype.play = () => Promise.resolve();
    w.HTMLMediaElement.prototype.pause = () => {};
    w.HTMLMediaElement.prototype.load = () => {};
    w.fetch = (u) => {
      u = String(u);
      if (u.includes('/api/yt-music')) {
        const q = decodeURIComponent(u.split('q=')[1].split('&')[0]);
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([1, 2].map((i) => ({ id: 'abcdefghi' + i + 'x', title: q + ' #' + i, artist: 'Artis ' + i }))) });
      }
      return Promise.reject(new Error('offline (uji)'));
    };
  },
});
let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cmd = (k, a) => { native.pending = JSON.stringify({ k, a }); dom.window.loopifyPoll(); };

(async () => {
  await sleep(800);
  const w = dom.window;
  ok(errs.length === 0, 'tidak ada error saat memuat' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));

  /* parser tautan */
  const P = (s) => JSON.stringify(w.lpParse60(s));
  ok(P('https://youtu.be/dQw4w9WgXcQ?si=abc') === '{"t":"video","id":"dQw4w9WgXcQ"}', 'youtu.be -> video');
  ok(P('Dengar ini https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabcdefghijk') === '{"t":"video","id":"dQw4w9WgXcQ"}', 'watch?v + list -> video');
  ok(P('https://music.youtube.com/watch?v=dQw4w9WgXcQ') === '{"t":"video","id":"dQw4w9WgXcQ"}', 'YouTube Music -> video');
  ok(P('https://www.youtube.com/shorts/dQw4w9WgXcQ') === '{"t":"video","id":"dQw4w9WgXcQ"}', 'shorts -> video');
  ok(/"t":"list"/.test(P('https://www.youtube.com/playlist?list=PLabcdefghijklmn')), 'playlist YouTube -> impor');
  ok(/"t":"list"/.test(P('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=1')), 'playlist Spotify -> impor');
  ok(P('https://open.spotify.com/track/xyz Sheila on 7 Dan') === '{"t":"search","q":"Sheila on 7 Dan"}', 'tautan lain + teks -> cari teks');
  ok(P('   ') === 'null' && P('https://youtu.be/pendek') === 'null', 'kosong / id YouTube tidak valid -> diabaikan');
  ok(P('https://evil.example/x?v=dQw4w9WgXcQ') === 'null', 'domain asing tidak dianggap YouTube');

  /* pintasan + Android Auto */
  w.eval("favs=[{id:'a1',title:'Lagu A',artist:'Artis A',url:'https://x/a.mp3'},{id:'a2',title:'Lagu B',artist:'Artis B',url:'https://x/b.mp3'},{id:'a3',title:'Lagu C',artist:'Artis C',url:'https://x/c.mp3'}];ls.set('favs',favs)");
  cmd('auto', 'fav:1');
  ok(w.eval('cur&&cur.id') === 'a2' && w.eval('q.length') === 3, 'Auto: fav:1 memutar lagu ke-2 dengan antrean Favorit');
  cmd('auto', 'fav:99');
  ok(w.eval('cur.id') === 'a2', 'Auto: indeks di luar daftar diabaikan');
  cmd('auto', 'cmd:shuffle');
  ok(w.eval('q.length') === 3 && ['a1', 'a2', 'a3'].includes(w.eval('cur.id')), 'Auto/pintasan: Acak Favorit memutar dari Favorit');
  cmd('shortcut', 'bukan-perintah');
  ok(w.eval('q.length') === 3, 'perintah pintasan asing diabaikan');
  native.pending = '{rusak'; w.loopifyPoll();
  ok(true, 'JSON rusak tidak membuat error');
  cmd('search', 'Peterpan');
  await sleep(100);
  ok(w.eval("(lists.x60||[]).length") > 0 && /Peterpan/.test(w.eval('lists.x60[0].title')), 'asisten suara: cari "Peterpan" lalu putar hasil pertama');

  /* sinkron perpustakaan ke mobil */
  await sleep(4300);
  const last = native.lib[native.lib.length - 1];
  const lj = last && JSON.parse(last);
  ok(lj && lj.fav.length === 3 && lj.fav[0].t === 'Lagu A' && Array.isArray(lj.hist), 'Favorit terkirim ke LoopifyNative.setLibrary');

  /* tanpa jeda */
  w.eval("cfg.gl=true;cfg.cf=0;q=[{id:'g1',title:'G1',artist:'x',url:'https://x/1.mp3'},{id:'g2',title:'G2',artist:'x',url:'https://x/2.mp3'}];qi=0;cur=q[0];act=B;shuf=0;rep=0;slEnd=0;ab={a:null,b:null}");
  const def = (k, v) => w.Object.defineProperty(w.eval('B'), k, { get: v, configurable: true });
  def('duration', () => 30); def('paused', () => false); def('currentTime', () => 29.8);
  await sleep(400);
  ok(w.eval('qi') === 1 && w.eval('cur.id') === 'g2', 'tanpa jeda: lagu berikutnya dimulai sedikit sebelum lagu habis');
  w.eval("cfg.gl=false;q=[{id:'g1',title:'G1',artist:'x',url:'https://x/1.mp3'},{id:'g2',title:'G2',artist:'x',url:'https://x/2.mp3'}];qi=0;cur=q[0];act=B");
  await sleep(400);
  ok(w.eval('qi') === 0, 'tanpa jeda mati: tidak ada yang berubah');
  w.eval("cfg.gl=true;cfg.cf=5;qi=0;cur=q[0];act=B");
  await sleep(400);
  ok(w.eval('qi') === 0, 'crossfade menyala: tanpa jeda tidak ikut campur');
  ok(errs.length === 0, 'tidak ada error selama pengujian' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fail ? '\n' + fail + ' pengujian gagal' : '\nSemua pengujian lolos');
  process.exit(fail ? 1 : 0);
})();
