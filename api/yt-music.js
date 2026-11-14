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
  t = t.replace(/\s+[-–—]\s*(official|lyric|video|audio|lirik|visuali)[^-–—]*$/i, '').replace(/^\s*[\[\(【](mv|m\/v|official[^\]\)】]*)[\]\)】]\s*/i, '').replace(/\s+/g, ' ').trim();
  // "Artis - Judul" -> pisahkan; "Judul - Artis" (nama channel sama dengan bagian kanan) -> tukar
  const m = t.match(/^(.{2,60}?)\s[-–—]\s(.{2,})$/);
  if (m) {
    const l = m[1].trim(), r = m[2].trim(), an = a.toLowerCase();
    if (an && r.toLowerCase() === an) { a = r; t = l; }
    else if (!/^(live|cover|remix|acoustic|akustik)\b/i.test(r)) { a = l; t = r; }
  }
  return { title: t || String(rawTitle || ''), artist: a || String(rawArtist || '') };
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
    let items = await run('&videoCategoryId=10');
    if (items.length < 15) {
      try { items = items.concat(await run('')); } catch (e) { if (!items.length) throw e; }
    }
    const seen = new Set();
    const out = items.filter((x) => !seen.has(x.id.videoId) && seen.add(x.id.videoId)).map((x) => {
      const n = tidy(dec(x.snippet.title), dec(x.snippet.channelTitle));
      return { id: x.id.videoId, title: n.title.slice(0, 200), artist: n.artist.slice(0, 100) };
    });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(out);
  } catch (e) {
    res.status(e && e.status === 403 ? 429 : 502).json({ error: (e && e.message) || 'Gagal mencari video' });
  }
};
