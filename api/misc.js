// /api/misc?m=suggest|soundstat|stream  - satu fungsi Vercel untuk tiga endpoint kecil (hemat slot, batas 12 fungsi di paket Hobby).
// Alamat lama tetap jalan lewat "rewrites" di vercel.json: /api/suggest, /api/soundstat, /api/stream -> /api/misc?m=...
// Isi tiap endpoint ada di folder lib/ (di luar api/ supaya tidak dihitung sebagai fungsi). Endpoint baru yang kecil: taruh di lib/ lalu daftarkan di bawah.
const H = {
  suggest: () => require('../lib/suggest'),
  soundstat: () => require('../lib/soundstat'),
  stream: () => require('../lib/stream'),
};
module.exports = async (req, res) => {
  const q = new URL(req.url, 'http://x').searchParams;
  const m = String((req.query && req.query.m) || q.get('m') || '');
  if (!Object.prototype.hasOwnProperty.call(H, m)) { res.setHeader('Cache-Control', 'no-store'); res.status(404).json({ error: 'endpoint tidak dikenal' }); return; }
  // Susun ulang req.url tanpa "m" supaya handler memakai parameter aslinya (q, ids, type, value, r).
  const src = Object.assign({}, req.query || {}); q.forEach((v, k) => { if (!(k in src)) src[k] = v; });
  delete src.m;
  const p = new URLSearchParams();
  Object.keys(src).forEach((k) => { [].concat(src[k]).forEach((v) => p.append(k, v)); });
  req.url = '/api/' + m + (p.toString() ? '?' + p : '');
  return H[m]()(req, res);
};
