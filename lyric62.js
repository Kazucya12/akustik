/* Uji v4.62: transkripsi audio (api/jiosaavn?action=transcribe, Groq di-mock) dan penyelarasan lirik (extra62.js).
   Jalankan: node test/lyric62.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };

/* ---------- A. handler API ---------- */
async function apiTest() {
  process.env.JIOSAAVN_API_URL = 'https://jio.example';
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'x';
  const store = new Map();
  const calls = { groq: 0, chat: 0, audio: 0 };
  let chatMode = 'ok';
  const real = global.fetch;
  const R = (body, extra) => Object.assign({ ok: true, status: 200, json: async () => body, headers: { get: () => null } }, extra);
  global.fetch = async (u, o) => {
    u = String(u);
    if (u.startsWith('https://redis.example')) {
      const cmd = JSON.parse(o.body);
      if (cmd[0] === 'GET') return R({ result: store.has(cmd[1]) ? store.get(cmd[1]) : null });
      if (cmd[0] === 'SET') { store.set(cmd[1], cmd[2]); return R({ result: 'OK' }); }
      if (cmd[0] === 'INCR') return R({ result: 1 });
      return R({ result: 1 });
    }
    if (u.includes('jio.example/song/?query=')) return R([{ id: 'abc', song: 'Lagu Uji', primary_artists: 'Penyanyi X' }, { id: 'zzz', song: 'Lagu Lain', primary_artists: 'Q' }]);
    if (u.includes('jio.example/song/get/?id=')) return R({ data: [{ downloadUrl: [{ quality: '160kbps', url: 'http://cdn.example/a.mp4' }, { quality: '320kbps', url: 'http://cdn.example/b.mp4' }] }] });
    if (u.includes('cdn.example')) { calls.audio++; return R(null, { arrayBuffer: async () => new Uint8Array(2048).buffer }); }
    if (u.includes('/audio/transcriptions')) {
      calls.groq++;
      return R({ duration: 200.4, language: 'indonesian',
        words: [{ word: ' halo', start: 1.0, end: 1.4 }, { word: 'dunia', start: 1.5, end: 2 }],
        segments: [{ start: 1, end: 2, text: ' halo dunia', no_speech_prob: 0.01 }, { start: 3, end: 4, text: ' musik', no_speech_prob: 0.95 }, { start: 5, end: 6, text: ' kita pergi', no_speech_prob: 0.02 }] });
    }
    if (u.includes('/chat/completions')) {
      calls.chat++;
      if (chatMode === 'bad') return R({ choices: [{ message: { content: JSON.stringify({ lines: ['cuma satu'] }) } }] });
      return R({ choices: [{ message: { content: JSON.stringify({ lines: ['Halo, dunia', 'Kita pergi'] }) } }] });
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const call = (url) => new Promise((resolve) => {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b }); } };
    require('../api/jiosaavn.js')({ url, headers: {}, socket: {} }, res).catch((e) => resolve({ code: 'throw', body: String(e) }));
  });

  delete process.env.GROQ_API_KEY;
  let a = await call('/api/jiosaavn?action=transcribe&id=abc');
  ok(a.code === 501 && a.body.code === 'nokey', 'tanpa GROQ_API_KEY: 501 (aplikasi diam-diam melewati)');

  process.env.GROQ_API_KEY = 'gsk_test';
  a = await call('/api/jiosaavn?action=transcribe&id=abc');
  ok(a.code === 200 && a.body.words.length === 2 && a.body.words[0].w === 'halo' && a.body.duration === 200.4, 'transkripsi per id: kata bertimestamp');
  ok(a.body.segments.length === 2 && !a.body.segments.some((s) => /musik/.test(s.t)), 'segmen hening/halusinasi (no_speech_prob tinggi) dibuang');
  ok(a.body.cached === false && calls.groq === 1 && calls.audio === 1, 'pertama kali: audio diunduh dan Groq dipanggil sekali');
  ok(store.has('ma:tr:abc'), 'hasil disimpan di Redis');

  a = await call('/api/jiosaavn?action=transcribe&id=abc');
  ok(a.code === 200 && a.body.cached === true && calls.groq === 1 && calls.audio === 1, 'permintaan kedua dari cache: Groq tidak dipanggil lagi');

  a = await call('/api/jiosaavn?action=transcribe&id=abc&fix=1');
  ok(a.body.fixed && a.body.fixed.length === 2 && a.body.fixed[0] === 'Halo, dunia' && calls.chat === 1 && calls.groq === 1, 'fix=1: koreksi LLM ditambahkan tanpa mengulang Whisper');
  a = await call('/api/jiosaavn?action=transcribe&id=abc&fix=1');
  ok(a.body.fixed && calls.chat === 1, 'hasil koreksi ikut di-cache');

  store.clear(); chatMode = 'bad';
  a = await call('/api/jiosaavn?action=transcribe&id=abc&fix=1');
  ok(a.code === 200 && !a.body.fixed && a.body.segments.length === 2, 'koreksi LLM yang mengubah jumlah baris ditolak (teks asli dipakai)');
  chatMode = 'ok'; store.clear();

  a = await call('/api/jiosaavn?action=transcribe&t=' + encodeURIComponent('Lagu Uji') + '&a=' + encodeURIComponent('Penyanyi X'));
  ok(a.code === 200 && a.body.id === 'abc', 'lagu YouTube: dicocokkan ke versi JioSaavn lewat judul dan artis');
  a = await call('/api/jiosaavn?action=transcribe&t=' + encodeURIComponent('Judul Tidak Ada') + '&a=x');
  ok(a.code === 404 && a.body.code === 'noaudio', 'judul tidak cocok: 404 noaudio, tidak menebak lagu lain');
  a = await call('/api/jiosaavn?action=transcribe&id=' + encodeURIComponent('a/b'));
  ok(a.code === 400, 'id tidak valid ditolak');
  global.fetch = real;
}

/* ---------- B. penyelarasan di extra62.js ---------- */
function alignTest() {
  const ctx = { window: {}, console, ls: { get: (k, d) => d, set() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'extra62.js'), 'utf8'), ctx);
  const { align, linesFromSegments, toLrc, lev1 } = ctx.window.__ly62;
  ok(lev1('cinta', 'cinte') && lev1('rindu', 'rindus') && !lev1('cinta', 'cantik'), 'lev1: selisih satu huruf');

  const lines = ['Aku berjalan sendiri', 'Di bawah langit malam', 'Mencari arti cinta', 'Yang tak pernah kutemukan', 'Pulanglah padaku sayang'];
  const T = [12, 18, 25, 31, 40];
  const words = [{ w: 'yeah', s: 8 }];            // kata ekstra di intro
  lines.forEach((l, i) => l.split(' ').forEach((w, k) => {
    let x = w;
    if (i === 1 && k === 0) x = 'Dibawah';          // salah dengar: "Di bawah" jadi satu kata
    if (i === 2 && k === 2) x = 'cinte';            // salah dengar satu huruf
    if (i === 3) return;                            // baris ini tidak terdengar sama sekali
    words.push({ w: x, s: T[i] + k * 0.5, e: T[i] + k * 0.5 + 0.4 });
  }));
  const r = align(lines, words);
  ok(!!r && r.lines.length === 5, 'penyelarasan menghasilkan 5 baris');
  ok(r && Math.abs(r.lines[0].t - 12) < 0.01 && Math.abs(r.lines[2].t - 25) < 0.01 && Math.abs(r.lines[4].t - 40) < 0.01, 'baris yang terdengar mendapat waktu nyata (12 / 25 / 40 detik)');
  ok(r && r.lines[3].t > 25 && r.lines[3].t < 40, 'baris yang tidak terdengar diisi di antara tetangganya (' + (r && r.lines[3].t.toFixed(1)) + ' detik)');
  ok(r && r.lines.every((x, i) => !i || x.t > r.lines[i - 1].t), 'waktu selalu naik');
  ok(r && r.lines[1].t >= 17 && r.lines[1].t <= 19, 'kata salah-dengar tetap cocok (waktu baris 2 mendekati 18)');
  ok(align(['lirik lagu lain sama sekali', 'tidak ada hubungannya'], words) === null, 'lirik yang tidak cocok dengan audio ditolak (null)');
  ok(align([], words) === null && align(lines, []) === null, 'masukan kosong aman');

  const segs = [{ s: 1, t: 'baris satu' }, { s: 4, t: 'ha ha' }, { s: 6, t: 'ha ha' }, { s: 8, t: 'ha ha' }, { s: 10, t: 'ha ha' }, { s: 12, t: 'baris dua' }];
  const L = linesFromSegments(segs, null, null);
  ok(L.length === 4 && L[3].s === 'baris dua', 'ulangan identik berkali-kali (halusinasi) dipangkas');
  const F = linesFromSegments([{ s: 1, t: 'halo dunia' }, { s: 5, t: 'kita pergi' }], ['Halo, dunia', 'Kita pergi'], null);
  ok(F[0].s === 'Halo, dunia' && F[1].t === 5, 'teks hasil koreksi LLM dipakai, waktu tetap dari Whisper');
  const G = linesFromSegments([], null, [{ w: 'a', s: 1, e: 1.2 }, { w: 'b', s: 1.3, e: 1.5 }, { w: 'c', s: 5, e: 5.2 }]);
  ok(G.length === 2 && G[0].s === 'a b' && G[1].t === 5, 'tanpa segmen: kata dikelompokkan menurut jeda');
  ok(toLrc([{ t: 75.5, s: 'x' }]) === '[01:15.50]x', 'format LRC mm:ss.xx');
}

(async () => {
  await apiTest();
  alignTest();
  console.log(fail ? '\n' + fail + ' uji GAGAL' : '\nSemua uji lolos');
  process.exit(fail ? 1 : 0);
})();
