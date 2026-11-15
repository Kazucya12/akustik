// /api/suggest?q=...  -> ["saran 1","saran 2",...]
// Saran pencarian ala YouTube/Spotify saat mengetik. Gratis, tanpa API key dan tanpa kuota YouTube Data API.
// Endpoint saran ini tidak resmi; kalau berhenti bekerja, aplikasi tetap jalan (hanya saran dari koleksi sendiri yang tampil).
module.exports = async (req, res) => {
  const q = String(new URL(req.url, 'http://x').searchParams.get('q') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!q) { res.status(200).json([]); return; }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 4000);
  try {
    const r = await fetch('https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=id&q=' + encodeURIComponent(q), {
      signal: c.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const enc = /iso-8859-1/i.test(r.headers.get('content-type') || '') ? 'latin1' : 'utf8';
    const j = JSON.parse(Buffer.from(await r.arrayBuffer()).toString(enc));
    const list = (Array.isArray(j) && Array.isArray(j[1]) ? j[1] : [])
      .map((s) => String(s).replace(/\s+/g, ' ').trim().slice(0, 100))
      .filter(Boolean)
      .slice(0, 10);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(list);
  } catch (e) {
    res.status(200).json([]);
  } finally {
    clearTimeout(t);
  }
};
