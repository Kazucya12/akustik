// /api/jiosaavn?action=search&q=...            -> [{ id, title, artist, img, album, year, hasLyrics }]
// /api/jiosaavn?action=lyrics&id=...           -> { lyrics, id }
// /api/jiosaavn?action=lyrics&t=JUDUL&a=ARTIS  -> { lyrics, id }  (cari lagunya dulu, lalu ambil liriknya)
// Butuh env JIOSAAVN_API_URL = alamat backend JioSaavnAPI milikmu, contoh https://api-musik-zeta.vercel.app
// /api/jiosaavn?action=stream&id=ID[&t=JUDUL&a=ARTIS] -> { url }  (alamat audio langsung untuk elemen <audio>; v4.37)
// Lagu diputar langsung dari url ini (stabil di latar belakang APK). Kalau kosong/gagal, aplikasi jatuh ke YouTube.
// v4.62: /api/jiosaavn?action=transcribe&id=ID | &t=JUDUL&a=ARTIS[&fix=1]
//   -> { id, cached, duration, language, words:[{w,s,e}], segments:[{s,e,t}], fixed?:[teks per segmen] }
//   Mengunduh audio lagu dari JioSaavn (lagu YouTube dicocokkan lewat judul/artis), lalu Whisper di Groq membuat kata-kata
//   bertimestamp. fix=1 menambah koreksi salah-dengar oleh LLM (jumlah baris dijaga sama). Hasil di-cache di Redis 30 hari
//   (dipakai bersama semua pengguna), jadi satu lagu hanya diproses sekali.
//   Butuh env GROQ_API_KEY (gratis di console.groq.com). Redis (Upstash) opsional tapi sangat dianjurkan.
const UA = 'Loopify/4.30';

function base() {
  const u = String(process.env.JIOSAAVN_API_URL || '').trim().replace(/\/+$/, '');
  return /^https:\/\//i.test(u) ? u : '';
}
async function jget(url, ms = 9000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const dec = (s) => String(s == null ? '' : s)
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const clip = (s, n) => dec(s).replace(/\s+/g, ' ').trim().slice(0, n);
const https = (u) => {
  const s = String(u || '').replace(/^http:\/\//i, 'https://').replace('150x150', '500x500');
  return /^https:\/\//i.test(s) ? s : '';
};
const norm = (s) => dec(s).toLowerCase().replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/[^a-z0-9\u00c0-\uffff]+/g, ' ').trim();

// Backend bisa mengembalikan bentuk lengkap (song, primary_artists) atau ringkas (title, more_info). Dua-duanya dibaca.
function pick(x) {
  if (!x || typeof x !== 'object' || !x.id) return null;
  const mi = x.more_info || {};
  const artists = x.primary_artists || x.singers || mi.primary_artists || mi.singers || x.subtitle || x.description || '';
  const names = String(artists).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2).join(', ');
  const title = clip(x.song || x.title || x.name, 200);
  if (!title) return null;
  return {
    id: String(x.id).slice(0, 40),
    title,
    artist: clip(names, 100) || 'Tidak diketahui',
    img: https(x.image),
    album: clip(x.album || mi.album, 100),
    year: clip(x.year, 4),
    hasLyrics: String(x.has_lyrics || mi.has_lyrics || '').toLowerCase() === 'true',
  };
}
async function search(b, q) {
  const j = await jget(b + '/song/?query=' + encodeURIComponent(q) + '&lyrics=false&songdata=false');
  const arr = Array.isArray(j) ? j : j && (j.songs || j.data || j.results) || [];
  const seen = new Set();
  return arr.map(pick).filter((s) => s && !seen.has(s.id) && seen.add(s.id));
}
function plain(html) {
  return dec(String(html || '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000);
}
async function lyricsById(b, id) {
  const j = await jget(b + '/lyrics/?query=' + encodeURIComponent(id));
  return plain(j && j.lyrics);
}

// v4.37: ambil alamat audio langsung dari berbagai bentuk respons backend (media_url atau downloadUrl[])
function mediaOf(x) {
  if (!x || typeof x !== 'object') return '';
  if (Array.isArray(x.downloadUrl) && x.downloadUrl.length) {
    const best = x.downloadUrl.find((d) => /320/.test(String(d.quality || ''))) || x.downloadUrl[x.downloadUrl.length - 1];
    const u = best && (best.url || best.link);
    if (u) return https(u);
  }
  const mi = x.more_info || {};
  const m = x.media_url || mi.media_url || '';
  return /^https?:\/\//i.test(String(m)) ? https(m) : '';
}
async function streamOf(b, id, t, a) {
  const e = encodeURIComponent;
  const tries = [b + '/song/get/?id=' + e(id), b + '/api/songs/' + e(id), b + '/songs/' + e(id)];
  for (const u of tries) {
    try {
      const j = await jget(u, 7000);
      const d = j && j.data;
      const x = Array.isArray(j) ? j[0] : Array.isArray(d) ? d[0] : d || j;
      const m = mediaOf(x);
      if (m) return m;
    } catch (err) { /* coba alamat berikutnya */ }
  }
  if (t) {
    try {
      const j = await jget(b + '/song/?query=' + e((t + ' ' + (a || '')).trim()) + '&lyrics=false&songdata=true', 9000);
      const arr = Array.isArray(j) ? j : j && (j.songs || j.data || j.results) || [];
      const hit = arr.find((x) => x && String(x.id) === String(id)) || arr.find((x) => norm(x && (x.song || x.title || x.name)) === norm(t));
      const m = mediaOf(hit);
      if (m) return m;
    } catch (err) { /* menyerah */ }
  }
  return '';
}

/* ---------- v4.62: transkripsi audio (Whisper di Groq) ---------- */
const GROQ = 'https://api.groq.com/openai/v1';
const MAX_AUDIO = 24 * 1048576;       // batas file layanan transkripsi 25 MB
const r2 = (x) => Math.round((+x || 0) * 100) / 100;
const tokens = (s) => norm(s).split(' ').filter(Boolean);

// Cari id JioSaavn: pakai id kalau ada; kalau tidak, cari lewat judul dan artis (judul harus cocok, artis diutamakan).
async function resolveId(b, id, t, a) {
  if (id) return id;
  if (!t) return '';
  const nt = norm(t);
  const list = await search(b, (t + ' ' + a).trim());
  const byTitle = list.filter((s) => { const n = norm(s.title); return n && nt && (n === nt || n.includes(nt) || nt.includes(n)); });
  const ta = tokens(a);
  const hit = (ta.length && byTitle.find((s) => tokens(s.artist).some((w) => ta.includes(w)))) || byTitle[0];
  return hit ? hit.id : '';
}
async function getAudio(url) {
  const c = new AbortController();
  const tm = setTimeout(() => c.abort(), 25000);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error('audio HTTP ' + r.status);
    const len = +(r.headers && r.headers.get && r.headers.get('content-length')) || 0;
    if (len > MAX_AUDIO) throw Object.assign(new Error('audio terlalu besar'), { code: 413 });
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) throw new Error('audio kosong');
    if (buf.length > MAX_AUDIO) throw Object.assign(new Error('audio terlalu besar'), { code: 413 });
    return buf;
  } finally { clearTimeout(tm); }
}
async function whisper(buf, key, ext) {
  const fd = new FormData();
  fd.append('file', new Blob([buf]), 'lagu.' + ext);
  fd.append('model', 'whisper-large-v3-turbo');
  fd.append('response_format', 'verbose_json');
  fd.append('temperature', '0');
  fd.append('timestamp_granularities[]', 'word');
  fd.append('timestamp_granularities[]', 'segment');
  const c = new AbortController();
  const tm = setTimeout(() => c.abort(), 40000);
  try {
    const r = await fetch(GROQ + '/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd, signal: c.signal });
    if (!r.ok) throw Object.assign(new Error('Groq HTTP ' + r.status), { code: r.status === 429 ? 429 : 502 });
    const j = await r.json();
    const words = (Array.isArray(j.words) ? j.words : []).map((x) => ({ w: String(x.word || '').trim(), s: r2(x.start), e: r2(x.end) })).filter((x) => x.w);
    // segmen yang hampir pasti bukan nyanyian (hening / halusinasi) dibuang
    const segments = (Array.isArray(j.segments) ? j.segments : [])
      .filter((x) => !(+x.no_speech_prob > 0.7))
      .map((x) => ({ s: r2(x.start), e: r2(x.end), t: String(x.text || '').trim() })).filter((x) => x.t.length > 1);
    return { duration: r2(j.duration), language: String(j.language || '').slice(0, 20), words, segments };
  } finally { clearTimeout(tm); }
}
// Koreksi salah-dengar oleh LLM. Jumlah dan urutan baris dijaga: kalau tidak cocok, baris asli dipakai.
async function fixLines(lines, key) {
  const c = new AbortController();
  const tm = setTimeout(() => c.abort(), 15000);
  try {
    const r = await fetch(GROQ + '/chat/completions', {
      method: 'POST', signal: c.signal,
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', temperature: 0, response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Kamu memperbaiki hasil transkripsi otomatis lirik lagu (bahasa bisa Indonesia, Inggris, Jawa, dll). Betulkan kata yang salah dengar dan ejaan. JANGAN menerjemahkan, menambah, menghapus, menggabung, atau memecah baris: jumlah dan urutan baris harus sama persis. Balas hanya JSON {"lines":[...]}.' },
          { role: 'user', content: JSON.stringify({ lines }) },
        ],
      }),
    });
    if (!r.ok) throw new Error('LLM HTTP ' + r.status);
    const j = await r.json();
    const out = JSON.parse(j.choices[0].message.content).lines;
    if (!Array.isArray(out) || out.length !== lines.length) throw new Error('jumlah baris berubah');
    return out.map((x, i) => (typeof x === 'string' && x.trim() && x.length <= lines[i].length * 1.6 + 10 ? x.trim() : lines[i]));
  } finally { clearTimeout(tm); }
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const action = u.searchParams.get('action') || 'search';
  const b = base();
  if (!b) { res.status(501).json({ error: 'JIOSAAVN_API_URL belum diatur di Vercel' }); return; }
  try {
    if (action === 'search') {
      const q = clip(u.searchParams.get('q'), 100);
      if (!q) { res.status(200).json([]); return; }
      const list = (await search(b, q)).slice(0, 20);
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
      res.status(200).json(list);
      return;
    }
    if (action === 'stream') {
      if (!(await require('./_rl')(req, res, 'jst', 60, 60))) return;
      const id = String(u.searchParams.get('id') || '').trim();
      if (!/^[\w-]{1,40}$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      const url = await streamOf(b, id, clip(u.searchParams.get('t'), 100), clip(u.searchParams.get('a'), 60));
      res.setHeader('Cache-Control', 'private, max-age=120');
      res.status(200).json({ url });
      return;
    }
    if (action === 'lyrics') {
      let id = String(u.searchParams.get('id') || '').trim();
      if (id && !/^[\w-]{1,40}$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      let ids = id ? [id] : [];
      if (!ids.length) {
        const t = clip(u.searchParams.get('t'), 100), a = clip(u.searchParams.get('a'), 60);
        if (!t) { res.status(200).json({ lyrics: '' }); return; }
        const nt = norm(t);
        // Hanya terima hasil yang judulnya cocok, supaya lirik lagu lain tidak muncul
        const list = await search(b, (t + ' ' + a).trim());
        ids = list.filter((s) => { const n = norm(s.title); return n && nt && (n === nt || n.includes(nt) || nt.includes(n)); })
          .slice(0, 2).map((s) => s.id);
      }
      let lyrics = '', used = '';
      for (const i of ids) {
        try { lyrics = await lyricsById(b, i); } catch (e) { lyrics = ''; }
        if (lyrics) { used = i; break; }
      }
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.status(200).json({ lyrics, id: used });
      return;
    }
    if (action === 'transcribe') {
      const key = String(process.env.GROQ_API_KEY || '').trim();
      if (!key) { res.status(501).json({ error: 'GROQ_API_KEY belum diatur di Vercel', code: 'nokey' }); return; }
      const id0 = String(u.searchParams.get('id') || '').trim();
      if (id0 && !/^[\w-]{1,40}$/.test(id0)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      const fix = u.searchParams.get('fix') === '1';
      const id = await resolveId(b, id0, clip(u.searchParams.get('t'), 100), clip(u.searchParams.get('a'), 60));
      if (!id) { res.status(404).json({ error: 'Versi audio lagu ini tidak ditemukan', code: 'noaudio' }); return; }
      const ck = 'ma:tr:' + id;
      const rl = require('./_rl');
      let rec = null, dirty = false;
      const hit = await rl.redis(['GET', ck]);
      if (hit) { try { rec = JSON.parse(hit); } catch (e) { rec = null; } }
      if (!rec || !Array.isArray(rec.words)) {
        if (!(await rl(req, res, 'jtr', 6, 600))) return;   // hanya permintaan yang benar-benar memanggil Groq yang dibatasi
        const url = await streamOf(b, id, clip(u.searchParams.get('t'), 100), clip(u.searchParams.get('a'), 60));
        if (!url) { res.status(404).json({ error: 'Alamat audio tidak tersedia', code: 'noaudio' }); return; }
        const ext = (String(url).match(/\.(mp3|m4a|mp4|wav|ogg|webm)(?:\?|$)/i) || [0, 'm4a'])[1].toLowerCase();
        rec = await whisper(await getAudio(url), key, ext);
        dirty = true;
      }
      if (fix && !rec.fixed && rec.segments.length) {
        try { rec.fixed = await fixLines(rec.segments.map((s) => s.t), key); dirty = true; } catch (e) { /* koreksi gagal: pakai teks asli */ }
      }
      if (dirty) await rl.redis(['SET', ck, JSON.stringify(rec), 'EX', 2592000]);
      res.setHeader('Cache-Control', 'private, max-age=600');
      res.status(200).json({ id, cached: !dirty, duration: rec.duration, language: rec.language, words: rec.words, segments: rec.segments, fixed: fix ? rec.fixed : undefined });
      return;
    }
    res.status(400).json({ error: 'action tidak dikenal' });
  } catch (e) {
    if (e && (e.code === 413 || e.code === 429)) { res.status(e.code).json({ error: e.code === 413 ? 'File audio terlalu besar untuk diproses' : 'Batas pemakaian Groq tercapai, coba lagi nanti', code: e.code === 413 ? 'big' : 'groq429' }); return; }
    res.status(502).json({ error: 'Gagal mengambil data dari JioSaavn', detail: String((e && e.message) || e).slice(0, 120) });
  }
};
