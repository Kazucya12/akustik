// /api/music?src=radio|custom&q=...  (&trending=1 &cc= &tag=)
// Mengembalikan array: { id, title, artist, img, url }
// Sumber musik online selain Radio sudah dihapus. Pencarian lagu memakai YouTube lewat /api/yt-music.
const UA = 'MidnightAcoustic/4.12';
const RB = ['https://de1.api.radio-browser.info', 'https://nl1.api.radio-browser.info', 'https://at1.api.radio-browser.info'];
const REMOVED = ['all', 'audius', 'jamendo', 'archive']; // permintaan lama dijawab daftar kosong, bukan error

async function jget(url, opt = {}, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { ...opt, signal: c.signal, headers: { 'User-Agent': UA, Accept: 'application/json', ...(opt.headers || {}) } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const httpsOnly = (u) => (typeof u === 'string' && /^https:\/\//i.test(u) ? u : '');
const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);

/* ---------- Radio (radio-browser.info) ---------- */
async function radio(q, cc, tag) {
  const p = new URLSearchParams({ limit: '40', hidebroken: 'true', is_https: 'true', order: 'clickcount', reverse: 'true' });
  if (q) p.set('name', q);
  if (cc) p.set('countrycode', cc.toUpperCase().slice(0, 2));
  if (tag) p.set('tag', tag);
  let j = null, err;
  for (const h of RB) {
    try { j = await jget(`${h}/json/stations/search?${p}`, {}, 6000); break; } catch (e) { err = e; }
  }
  if (!j) throw err || new Error('radio');
  const seen = new Set();
  return j.filter((s) => {
    const u = httpsOnly(s.url_resolved || s.url);
    const k = (s.name || '').trim().toLowerCase();
    if (!u || !k || seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0, 30).map((s) => ({
    id: 'r' + s.stationuuid,
    title: clip(s.name, 100),
    artist: clip([s.state || s.country, (s.tags || '').split(',')[0]].filter(Boolean).join(' · '), 100) || 'Radio',
    img: httpsOnly(s.favicon),
    url: httpsOnly(s.url_resolved || s.url),
  }));
}

/* ---------- API kustom ---------- */
async function custom(q) {
  const base = process.env.MUSIC_API_URL;
  if (!base) { const e = new Error('no-url'); e.code = 501; throw e; }
  const url = base.replace('{q}', encodeURIComponent(q)).replace('{key}', encodeURIComponent(process.env.MUSIC_API_KEY || ''));
  const j = await jget(url);
  const arr = Array.isArray(j) ? j : j.results || j.data || j.tracks || j.items || [];
  return arr.map((t, i) => ({
    id: 'c' + (t.id != null ? t.id : i + '-' + clip(t.title || t.name, 20)),
    title: clip(t.title || t.name, 200) || 'Tanpa judul',
    artist: clip(t.artist || t.artist_name || (t.user && t.user.name), 100) || 'Tidak diketahui',
    img: httpsOnly(t.img || t.image || t.cover || t.artwork),
    url: httpsOnly(t.url || t.audio || t.stream_url || t.stream),
  })).filter((t) => t.url);
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const src = u.searchParams.get('src') || 'radio';
  const q = clip(u.searchParams.get('q'), 100);
  const trending = u.searchParams.get('trending') === '1';
  const cc = clip(u.searchParams.get('cc'), 2).replace(/[^a-zA-Z]/g, '');
  const tag = clip(u.searchParams.get('tag'), 30);
  try {
    if (REMOVED.includes(src)) { res.status(200).json([]); return; }
    if (!q && !trending && src !== 'radio') { res.status(200).json([]); return; }
    let data;
    if (src === 'radio') data = await radio(trending ? '' : q, cc, tag);
    else if (src === 'custom') data = await custom(q);
    else { res.status(400).json({ error: 'src tidak dikenal' }); return; }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    res.status(200).json(data);
  } catch (e) {
    if (e && e.code === 501) { res.status(501).json({ error: 'Sumber belum diaktifkan di server' }); return; }
    res.status(502).json({ error: 'Gagal mengambil data dari sumber', detail: String((e && e.message) || e).slice(0, 120) });
  }
};
