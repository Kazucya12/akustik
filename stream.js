// /api/stream?ids=ID1,ID2,...  (maks 10 id lagu Audius) -> { ID: "https://alamat-server-akhir/..." }
// Mengikuti pengalihan api.audius.co di server dan memeriksa alamat akhirnya, supaya pemutar langsung terhubung ke server lagu.
const UA = 'MidnightAcoustic/4.10';
const AUD = 'https://api.audius.co/v1';
module.exports = async (req, res) => {
  const ids = String(new URL(req.url, 'http://x').searchParams.get('ids') || '').split(',').map((s) => s.trim()).filter((s) => /^[\w-]{1,20}$/.test(s)).slice(0, 10);
  res.setHeader('Cache-Control', 'public, s-maxage=240');
  const out = {};
  await Promise.all(ids.map(async (id) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 4000);
    try {
      const r = await fetch(`${AUD}/tracks/${id}/stream?app_name=MidnightAcoustic`, { redirect: 'manual', signal: c.signal, headers: { 'User-Agent': UA } });
      const loc = r.headers.get('location');
      if (r.status >= 300 && r.status < 400 && /^https:\/\//.test(loc || '')) {
        const h = await fetch(loc, { method: 'HEAD', signal: c.signal, headers: { 'User-Agent': UA } });
        if (h.ok) out[id] = loc;
      }
    } catch (e) { /* lewati: pemutar memakai alamat biasa */ } finally { clearTimeout(t); }
  }));
  res.status(200).json(out);
};
