/* Uji v4.63: katalog Deezer (api/artist?dsearch), penyaringan hasil YouTube, dan pemilih versi YouTube berdasar durasi (extra63.js).
   Jalankan: node test/dz63.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };

/* ---------- A. handler API (Deezer di-mock) ---------- */
async function apiTest() {
  const real = global.fetch;
  let dzCalls = 0, dzMode = 'ok';
  global.fetch = async (u) => {
    u = String(u);
    if (u.startsWith('https://api.deezer.com/search')) {
      dzCalls++;
      if (dzMode === 'down') return { ok: false, status: 500, json: async () => ({}) };
      const tr = (id, title, ver, art, alb, dur) => ({ type: 'track', id, title: title + (ver ? ' ' + ver : ''), title_short: title, title_version: ver, duration: dur, artist: { name: art }, album: { title: alb, cover_medium: 'https://cdn.example/' + id + '.jpg' } });
      return { ok: true, json: async () => ({ data: [
        tr(1, 'Perfect', '', 'Ed Sheeran', 'Divide', 263),
        tr(2, 'Perfect', '', 'Ed Sheeran', 'Greatest Hits', 263),                    // duplikat dari album lain
        tr(3, 'Perfect', '(Live)', 'Ed Sheeran', 'Live', 270),                         // versi lain tetap tampil, bertanda
        { type: 'album', id: 9, title: 'bukan lagu' },
        { type: 'track', id: 4, title: 'Tanpa artis', title_short: 'Tanpa artis', duration: 1 },
        Object.assign(tr(5, 'Perfect Symphony', '', 'Ed Sheeran', 'Divide', 258), { album: { title: 'x', cover_medium: 'http://insecure/x.jpg' } }),
      ] }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const call = (url) => new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b, h: this.headers }); } };
    delete require.cache[require.resolve('../api/artist.js')];
    require('../api/artist.js')({ url, headers: {}, socket: {} }, res).catch((e) => resolve({ code: 'throw', body: String(e) }));
  });
  let a = await call('/api/artist?dsearch=ed+sheeran+perfect');
  ok(a.code === 200 && a.body.length === 3, 'katalog: duplikat album dibuang, bukan-lagu dan tanpa artis disaring (' + a.body.length + ' hasil)');
  ok(a.body[0].title === 'Perfect' && a.body[0].artist === 'Ed Sheeran' && a.body[0].album === 'Divide' && a.body[0].d === 263 && /cdn\.example/.test(a.body[0].img), 'bentuk hasil: judul, artis, album, durasi, cover');
  ok(a.body[1].title === 'Perfect (Live)', 'versi live tetap tampil dengan label, tidak dianggap duplikat');
  ok(a.body[2].img === '', 'cover http (tidak aman) dibuang');
  ok(/s-maxage=21600/.test(a.h['Cache-Control']), 'hasil di-cache di edge Vercel 6 jam');
  dzMode = 'down';
  a = await call('/api/artist?dsearch=apa+saja');
  ok(a.code === 200 && Array.isArray(a.body) && a.body.length === 0, 'Deezer mati: daftar kosong (aplikasi memakai YouTube)');
  global.fetch = real;
}

/* ---------- B. klien (extra63.js) ---------- */
async function clientTest() {
  const J = (x) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(x) });
  const calls = { yt: [], dz: [] };
  const CAT = [
    { id: '1', title: 'Perfect', artist: 'Ed Sheeran', album: 'Divide', img: 'https://c/1.jpg', d: 263 },
    { id: '2', title: 'Shape of You', artist: 'Ed Sheeran', album: 'Divide', img: '', d: 233 },
    { id: '3', title: 'Thinking Out Loud', artist: 'Ed Sheeran', album: 'x', img: '', d: 281 },
  ];
  const YT = {
    'Ed Sheeran Perfect': [
      { id: 'cover1', title: 'Perfect (Piano Cover)', artist: 'Some Guy', d: 262 },
      { id: 'wrongdur', title: 'Perfect', artist: 'Ed Sheeran', d: 410 },
      { id: 'good', title: 'Perfect', artist: 'Ed Sheeran', d: 263, tp: 1 },
      { id: 'live', title: 'Perfect (Live)', artist: 'Ed Sheeran', d: 270 },
    ],
    'Penyanyi Lagu Rahasia': [{ id: 'xx', title: 'Sesuatu Yang Lain Sama Sekali', artist: 'Orang', d: 200 }],
  };
  const ctx = {
    console, window: {}, cfg: { src: 'all' }, lq: '', hh: () => 1,
    fetch: (u) => {
      u = String(u);
      if (u.includes('/api/artist?dsearch=')) { calls.dz.push(decodeURIComponent(u.split('dsearch=')[1])); return J(/indie/.test(u) ? [] : CAT); }
      if (u.includes('/api/yt-music')) { const q = decodeURIComponent(u.split('q=')[1].split('&')[0]); calls.yt.push(q); return J(YT[q] || []); }
      return Promise.reject(new Error('offline'));
    },
  };
  ctx.srch = async () => [{ id: 'j9', title: 'Shape Of You', artist: 'Ed Sheeran', jio: 1 }, { id: 'j8', title: 'Lagu Lokal', artist: 'Band X', jio: 1 }];
  ctx.ytSearch = async (s) => [
    { id: 'y1', title: 'Perfect', artist: 'Ed Sheeran' },                    // duplikat katalog
    { id: 'y2', title: 'Perfect (Cover)', artist: 'Anak SMA' },               // cover tak diminta
    { id: 'y3', title: 'Lagu Yang Hanya Ada Di YouTube', artist: 'Indie Band' },
    { id: 'y4', title: 'Album Penuh', artist: 'A', se: 100, ss: 0 },
  ];
  ctx.resolveRec = async () => { ctx.fellBack = true; return false; };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'extra63.js'), 'utf8'), ctx);
  const { score, pickBest, key } = ctx.window.__dz63;

  /* hasil pencarian */
  ctx.lq = 'ed sheeran';
  const sr = await ctx.srch('ed sheeran');
  ok(sr.length === 4 && sr[0].dz && sr[0].rec === 1 && sr[0].dur === 263 && sr[0].title === 'Perfect', 'srch: katalog tampil dulu, bertanda rec (diputar lewat YouTube saat diketuk)');
  ok(sr.filter((t) => /shape of you/i.test(t.title)).length === 1 && sr.some((t) => t.title === 'Lagu Lokal'), 'duplikat dengan hasil JioSaavn digabung, lagu lain tetap ada');
  const yt = await ctx.ytSearch('ed sheeran', '', 2);
  ok(yt.length === 2 && yt.some((v) => v.id === 'y3') && yt.some((v) => v.se), 'ytSearch halaman pencarian: duplikat katalog dan cover dibuang, lagu khas YouTube dan track album tetap');
  ok(calls.dz.length === 1, 'katalog dipakai bersama (1 panggilan untuk srch + ytSearch)');
  const raw = await ctx.ytSearch('ed sheeran', '', 1);
  ok(raw.length === 4, 'ytSearch untuk keperluan lain (m bukan 2) tidak disentuh');
  ctx.lq = 'ed sheeran cover';
  const cv = await ctx.ytSearch('ed sheeran cover', '', 2);
  ok(cv.length === 3 && cv.some((v) => v.id === 'y2'), 'kata "cover" ada di pencarian: cover tidak dibuang (duplikat katalog tetap dibuang)');
  ctx.lq = 'lagu indie';
  const s2 = await ctx.srch('lagu indie');
  ok(s2.length === 2 && !s2[0].dz, 'katalog kosong: hasil lama dipakai apa adanya');
  ok((await ctx.ytSearch('lagu indie', '', 2)).length === 4, 'katalog kosong: hasil YouTube tidak disaring');

  /* pemilih versi YouTube */
  const t = sr[0];
  ok(await ctx.resolveRec(t) === true && t.vid === 'good' && t.yt === 1 && t.rec === 0, 'resolveRec: memilih versi dengan durasi pas + channel Topic (bukan cover/live/durasi beda)');
  ok(!ctx.fellBack, 'tidak jatuh ke cara lama saat ada yang cocok');
  const bad = { id: 'd7', dz: 1, rec: 1, title: 'Lagu Rahasia', artist: 'Penyanyi', dur: 200 };
  await ctx.resolveRec(bad);
  ok(ctx.fellBack === true && !bad.vid, 'tidak ada yang cukup cocok: jatuh ke cara lama (hasil pertama), tidak menebak');
  const items = YT['Ed Sheeran Perfect'], tt = { title: 'Perfect', artist: 'Ed Sheeran', dur: 263 };
  ok(score(items[2], tt) > score(items[1], tt) + 1.5, 'skor: durasi pas mengalahkan durasi beda 2,5 menit');
  ok(pickBest([items[0]], tt) === null, 'cover piano tidak lolos meski durasinya pas');
  ok(key('Perfect (feat. X)', 'Ed Sheeran, Y') === key('Perfect', 'Ed Sheeran'), 'kunci duplikat mengabaikan (feat.) dan artis tambahan');
  ctx.cfg.dz63 = false;
  const off = await ctx.srch('ed sheeran');
  ok(off.length === 2 && !off[0].dz, 'cfg.dz63=false: perilaku lama sepenuhnya');
}

(async () => {
  await apiTest();
  await clientTest();
  console.log(fail ? '\n' + fail + ' uji GAGAL' : '\nSemua uji lolos');
  process.exit(fail ? 1 : 0);
})();
