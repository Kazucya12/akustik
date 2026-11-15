// POST /api/sync { action:'get'|'put', session, data?, t? } -> { t, data }  (sinkron favorit/playlist/artis diikuti per akun)
// Pakai database & AUTH_SECRET yang sama dengan /api/auth. Tidak ada env baru.
const crypto = require('crypto');
const PREFIX = 'ma:';
const KEYS = ['favs', 'pls', 'fol', 'pin', 'plr', 'lsrt', 'lgrid', 'qh'];
const MAX = 400000; // byte

async function rd(...cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !tok) throw new Error('nodb');
  const c = cmd.map(String); c[1] = PREFIX + c[1];
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('redis');
  return j.result;
}
const getJ = async (k) => { const v = await rd('GET', k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const sign = (s, d) => crypto.createHmac('sha256', s).update(d).digest('base64url');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function readSession(secret, tok) {
  const [p, s] = String(tok || '').split('.');
  if (!p || !s || !same(s, sign(secret, 'sess.' + p))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.x > Date.now() && d.e ? d : null; } catch (e) { return null; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metode tidak didukung' }); return; }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) { res.status(501).json({ error: 'AUTH_SECRET belum diatur' }); return; }
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } } b = b && typeof b === 'object' ? b : {};
  try {
    const d = readSession(secret, b.session);
    const u = d && (await getJ('user:' + d.e));
    if (!d || !u || (u.sv || 0) !== d.v) { res.status(401).json({ error: 'Sesi tidak valid' }); return; }
    const k = 'sync:' + d.e;
    if (b.action === 'get') {
      const v = await getJ(k);
      res.status(200).json(v || { t: 0, data: null }); return;
    }
    if (b.action === 'put') {
      const data = {};
      KEYS.forEach((x) => { if (b.data && b.data[x] !== undefined) data[x] = b.data[x]; });
      if (JSON.stringify(data).length > MAX) { res.status(413).json({ error: 'Data terlalu besar' }); return; }
      const t = Date.now();
      await rd('SET', k, JSON.stringify({ t, data }));
      res.status(200).json({ t }); return;
    }
    res.status(400).json({ error: 'Aksi tidak dikenal' });
  } catch (e) {
    res.status(502).json({ error: 'Sinkron gagal' });
  }
};
