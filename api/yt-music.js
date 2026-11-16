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
async function durations(ids, key) {
  if (!ids.length) return null;
  try {
    const r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&maxResults=50&id=' + ids.join(',') + '&key=' + encodeURIComponent(key));
    if (!r.ok) return null;
    const j = await r.json();
    const o = {};
    (j.items || []).forEach((v) => {
      const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec((v.contentDetails || {}).duration || '');
      o[v.id] = m ? (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : 0;
    });
    return o;
  } catch (e) { return null; }
}

module.exports = async (req, res) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) { res.status(501).json({ error: 'YOUTUBE_API_KEY belum diatur di Vercel' }); return; }
  const q = String(new URL(req.url, 'http://x').searchParams.get('q') || '').trim().slice(0, 100);
  if (!q) { res.status(200).json([]); return; }
  const o = String(new URL(req.url, 'http://x').searchParams.get('order') || '');
  const ord = o === 'viewCount' || o === 'date' ? '&order=' + o : '';
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
      if (sm === '2') list = good.concat(uniq.filter((x) => !isSong(x))); // pencarian: lagu dulu, sisanya menyusul
      else list = good.length ? good : uniq;                              // rekomendasi: lagu saja
    }
    const out = list.map((x) => {
      const n = tidy(dec(x.snippet.title), dec(x.snippet.channelTitle));
      return { id: x.id.videoId, title: n.title.slice(0, 200), artist: n.artist.slice(0, 100) };
    });
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(out);
  } catch (e) {
    res.status(e && e.status === 403 ? 429 : 502).json({ error: (e && e.message) || 'Gagal mencari video' });
  }
};
