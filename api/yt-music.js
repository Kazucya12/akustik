// /api/yt-search?q=...  -> [{ id, title, artist }]   (butuh YOUTUBE_API_KEY)
const dec = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

module.exports = async (req, res) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) { res.status(501).json({ error: 'YOUTUBE_API_KEY belum diatur di Vercel' }); return; }
  const q = String(new URL(req.url, 'http://x').searchParams.get('q') || '').trim().slice(0, 100);
  if (!q) { res.status(200).json([]); return; }
  try {
    const u = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=20' +
      '&q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(key);
    const r = await fetch(u);
    const j = await r.json();
    if (!r.ok) { res.status(r.status === 403 ? 429 : 502).json({ error: (j.error && j.error.message) || 'Gagal mencari video' }); return; }
    const out = (j.items || []).filter((x) => x.id && x.id.videoId).map((x) => ({
      id: x.id.videoId,
      title: dec(x.snippet.title).slice(0, 200),
      artist: dec(x.snippet.channelTitle).slice(0, 100),
    }));
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: 'Gagal mencari video' });
  }
};
