// /api/yt-search?q=...  -> [{ id, title, artist }]   (butuh YOUTUBE_API_KEY)
const dec = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

// Rapikan judul dan nama penyanyi supaya mirip aplikasi musik (bukan judul video mentah)
const TAG = /\b(official|video|audio|lyrics?|lirik|visuali[sz]er|mv|m\/v|hd|4k|clip|klip|resmi|music)\b/i;
function cleanArtist(a) {
  const r = String(a || '').replace(/\s*-\s*Topic$/i, '').replace(/\s*VEVO$/i, '').replace(/\s*(official( channel)?|resmi)$/i, '').replace(/\s+/g, ' ').trim();
  return r || String(a || '').trim();
}
function tidy(rawTitle, rawArtist) {
  let t = String(rawTitle || '');
  let a = cleanArtist(rawArtist);
  // buang tag dalam kurung: (Official Video), [Lyrics], (Video Lirik), dst.
  t = t.replace(/\s*[\(\[【]([^\)\]】]*)[\)\]】]/g, (m, inner) => (TAG.test(inner) ? '' : m));
  t = t.replace(/\s*[|｜]\s*(official|lyric|video|audio|lirik|mv|visuali).*$/i, '');
  t = t.replace(/\s+[-–—]\s*(official|lyric|video|audio|lirik|visuali)[^-–—]*$/i, '').replace(/^\s*[\[\(【](mv|m\/v|official[^\]\)】]*)[\]\)】]\s*/i, '').replace(/\s+(m\/v|mv)$/i, '').replace(/\s+/g, ' ').trim();
  // "Artis - Judul" -> pisahkan; "Judul - Artis" (nama channel sama dengan bagian kanan) -> tukar
  const m = t.match(/^(.{2,60}?)\s[-–—]\s(.{2,})$/);
  if (m) {
    const l = m[1].trim(), r = m[2].trim(), an = a.toLowerCase();
    if (an && r.toLowerCase() === an) { a = r; t = l; }
    else if (!/^(live|cover|remix|acoustic|akustik)\b/i.test(r)) { a = l; t = r; }
  }
  return { title: t || String(rawTitle || ''), artist: a || String(rawArtist || '') };
}

// Mode "lagu saja": buang kompilasi, album penuh, mix panjang, karaoke, dll.
const BADT = /(kumpulan|full album|compilation|non[\s-]?stop|megamix|medley|playlist|\bbest of\b|\btop\s*\d+|\b\d+\s*(lagu|songs?|hits|tracks)\b|\b\d+\s*(jam|hours?|hrs?)\b|tanpa iklan|karaoke|reaction|tutorial|podcast|interview|trailer|\bmix\b)|(\blagu\b.*\b(terbaru|terpopuler|terbaik|viral|populer|hits)\b.*\b20\d\d\b)/i;
// Satu panggilan videos.list (1 unit kuota per 50 video): durasi + deskripsi (untuk daftar lagu/timestamp album)
async function durations(ids, key) {
  if (!ids.length) return null;
  try {
    const r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&maxResults=50&id=' + ids.join(',') + '&key=' + encodeURIComponent(key));
    if (!r.ok) return null;
    const j = await r.json();
    const o = {}, d = {};
    (j.items || []).forEach((v) => {
      const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec((v.contentDetails || {}).duration || '');
      o[v.id] = m ? (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : 0;
      d[v.id] = String((v.snippet || {}).description || '').slice(0, 20000);
    });
    Object.defineProperty(o, '_desc', { value: d, enumerable: false });
    return o;
  } catch (e) { return null; }
}

// Baca daftar lagu dari deskripsi: "00:00 Judul", "1. 03:45 - Judul", atau "Judul 03:45".
// Hasil: [[mulai, selesai, judul], ...]; kosong kalau bukan daftar lagu yang masuk akal.
const TS = '(?:(\\d{1,2}):)?(\\d{1,2}):(\\d{2})';
const LEAD = new RegExp('^\\s*(?:[\\[(▶►•*\\-–]\\s*)?(?:\\d{1,3}[.)]\\s+)?[\\[(]?' + TS + '[\\])]?\\s*[-–—:.|)]*\\s*(.{2,})$');
const TRAIL = new RegExp('^(.{2,}?)\\s*[-–—:|(\\[]*\\s*[\\[(]?' + TS + '[\\])]?\\s*$');
const toSec = (h, m, s) => (+h || 0) * 3600 + +m * 60 + +s;
const clipT = (t) => String(t).replace(/^\s*\d{1,3}[.)]\s+/, '').replace(/^[\s\-–—:.|)\]]+|[\s\-–—:.|(\[]+$/g, '').replace(/\s+/g, ' ').slice(0, 100);
function parseTracks(desc, total) {
  const lines = String(desc || '').split(/\r?\n/).slice(0, 400);
  const run = (mode) => {
    const out = [];
    for (const ln of lines) {
      if (ln.length > 300) continue;
      let st, title;
      if (mode === 'lead') { const m = LEAD.exec(ln); if (!m) continue; st = toSec(m[1], m[2], m[3]); title = clipT(m[4]); }
      else { const m = TRAIL.exec(ln); if (!m) continue; st = toSec(m[2], m[3], m[4]); title = clipT(m[1]); }
      if (!title) continue;
      if (out.length && st <= out[out.length - 1][0]) break; // urutan harus naik; daftar kedua/pengulangan diabaikan
      out.push([st, 0, title]);
    }
    return out;
  };
  let a = run('lead'), b = run('trail');
  let t = b.length > a.length ? b : a;
  if (t.length < 3 || t[0][0] > 60) return [];
  for (let i = 0; i < t.length; i++) t[i][1] = i + 1 < t.length ? t[i + 1][0] : total;
  t = t.filter((x) => x[1] - x[0] >= 20 && x[0] < total);
  return t.length >= 3 ? t.slice(0, 80) : [];
}

const crypto = require('crypto');
const rl = require('./_rl');
const FRESH = 12 * 3600e3, KEEP = 7 * 86400; // segar 12 jam di Redis; disimpan 7 hari sebagai cadangan saat kuota/ YouTube bermasalah

module.exports = async (req, res) => {
  // 120/menit: banyak pengguna HP seluler berbagi satu IP (CGNAT), jadi batas dibuat longgar
  if (!(await rl(req, res, 'yt', 120, 60))) return;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) { res.status(501).json({ error: 'YOUTUBE_API_KEY belum diatur di Vercel' }); return; }
  const q = String(new URL(req.url, 'http://x').searchParams.get('q') || '').trim().slice(0, 100);
  if (!q) { res.status(200).json([]); return; }
  const o = String(new URL(req.url, 'http://x').searchParams.get('order') || '');
  const ord = o === 'viewCount' || o === 'date' ? '&order=' + o : '';
  const sm0 = String(new URL(req.url, 'http://x').searchParams.get('songs') || '');
  const ck = 'ma:yt2:' + crypto.createHash('sha1').update([q.toLowerCase(), o, sm0].join('|')).digest('hex').slice(0, 24);
  let hit = null;
  try { const raw = await rl.redis(['GET', ck]); hit = raw ? JSON.parse(raw) : null; } catch (e) { hit = null; }
  if (hit && Array.isArray(hit.out) && Date.now() - hit.t < FRESH) {
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(hit.out); return;
  }
  try {
    const base = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=50' +
      '&q=' + encodeURIComponent(q) + ord + '&key=' + encodeURIComponent(key);
    const run = async (extra) => {
      const r = await fetch(base + extra);
      const j = await r.json();
      if (!r.ok) { const e = new Error((j.error && j.error.message) || 'Gagal mencari video'); e.status = r.status; throw e; }
      return (j.items || []).filter((x) => x.id && x.id.videoId);
    };
    // Coba kategori Musik dulu supaya hasil lagu lebih tepat; kalau sedikit, lengkapi tanpa kategori
    // Hemat kuota (search.list = 100 unit): panggilan kedua tanpa kategori hanya kalau kategori Musik kosong
    let items = await run('&videoCategoryId=10');
    if (!items.length) items = await run('');
    const seen = new Set();
    const uniq = items.filter((x) => !seen.has(x.id.videoId) && seen.add(x.id.videoId)).slice(0, 50);
    const sm = String(new URL(req.url, 'http://x').searchParams.get('songs') || '');
    let list = uniq;
    if (sm === '1' || sm === '2') {
      const dur = await durations(uniq.map((x) => x.id.videoId), key);
      const isSong = (x) => !BADT.test(dec(x.snippet.title)) && (!dur || (dur[x.id.videoId] >= 90 && dur[x.id.videoId] <= 540));
      const good = uniq.filter(isSong);
      if (sm === '2') {
        // pencarian: lagu dulu, lalu album/video panjang yang punya daftar lagu (dipecah per lagu di aplikasi), lalu sisanya
        const rest = uniq.filter((x) => !isSong(x));
        const desc = (dur && dur._desc) || {};
        rest.forEach((x) => {
          const d = dur ? dur[x.id.videoId] : 0;
          if (d >= 600) { const tr = parseTracks(desc[x.id.videoId], d); if (tr.length) x._tracks = tr; }
        });
        list = good.concat(rest.filter((x) => x._tracks), rest.filter((x) => !x._tracks));
      }
      else list = good.length ? good : uniq;                              // rekomendasi: lagu saja
    }
    const out = list.map((x) => {
      const n = tidy(dec(x.snippet.title), dec(x.snippet.channelTitle));
      const o = { id: x.id.videoId, title: n.title.slice(0, 200), artist: n.artist.slice(0, 100) };
      if (x._tracks) o.tracks = x._tracks;
      return o;
    });
    if (out.length) { try { await rl.redis(['SET', ck, JSON.stringify({ t: Date.now(), out }), 'EX', KEEP]); } catch (e) { /* abaikan */ } }
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(out);
  } catch (e) {
    // kuota habis / YouTube error: pakai hasil lama kalau ada (lebih baik daftar kemarin daripada gagal total)
    if (hit && Array.isArray(hit.out) && hit.out.length) {
      res.setHeader('Cache-Control', 'public, s-maxage=300');
      res.status(200).json(hit.out); return;
    }
    const quota = e && e.status === 403;
    res.setHeader('Cache-Control', 'no-store');
    res.status(quota ? 429 : 502).json({ error: (e && e.message) || 'Gagal mencari video', code: quota ? 'quota' : 'upstream' });
  }
};
