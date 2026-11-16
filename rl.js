// Pembatas permintaan per IP (jendela tetap) memakai Upstash Redis yang sama dengan /api/auth.
// Nama file diawali "_" supaya Vercel TIDAK menghitungnya sebagai fungsi (batas 12 fungsi di paket Hobby).
// Gagal-buka: kalau Redis belum diatur atau error, permintaan tetap lolos (aplikasi tidak ikut mati).
// Hanya permintaan yang lolos cache edge Vercel yang sampai ke sini, jadi hasil yang sudah di-cache tidak terhitung.
const crypto = require('crypto');

async function redis(cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !tok) return null;
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 1500);
  try {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd.map(String)), signal: c.signal });
    const j = await r.json().catch(() => ({}));
    return r.ok && !j.error ? j.result : null;
  } catch (e) { return null; } finally { clearTimeout(t); }
}

// limit(req, res, 'nama', maks, detik) -> true kalau boleh lanjut; false kalau sudah dijawab 429.
module.exports = async function limit(req, res, name, max, windowSec) {
  try {
    const h = req.headers || {};
    const ip = String(h['x-vercel-forwarded-for'] || h['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '?').split(',')[0].trim();
    const id = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16); // IP asli tidak disimpan
    const slot = Math.floor(Date.now() / 1000 / windowSec);
    const key = 'ma:rl:' + name + ':' + id + ':' + slot;
    const n = await redis(['INCR', key]);
    if (n == null) return true;
    if (n === 1) await redis(['EXPIRE', key, windowSec * 2]);
    if (n > max) {
      const wait = windowSec - (Math.floor(Date.now() / 1000) % windowSec);
      res.setHeader('Retry-After', String(wait));
      res.setHeader('Cache-Control', 'no-store');
      res.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' });
      return false;
    }
    return true;
  } catch (e) { return true; }
};
