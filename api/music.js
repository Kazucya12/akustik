// /api/music?src=all|audius|jamendo|archive|radio|custom&q=...  (&trending=1 &genre= &cc= &tag=)
// Mengembalikan array lagu: { id, title, artist, img, url, dl? }
const UA = 'MidnightAcoustic/3.4';
const AUD = 'https://api.audius.co/v1';
const RB = ['https://de1.api.radio-browser.info', 'https://nl1.api.radio-browser.info', 'https://at1.api.radio-browser.info'];

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

/* ---------- Audius ---------- */
// Key dibersihkan (spasi/enter/tanda kutip hasil tempel) dan dikirim lewat header, bukan di URL.
const audKey = () => String(process.env.AUDIUS_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const APP = 'app_name=MidnightAcoustic';
let audHosts = null;
async function hosts() {
  if (audHosts) return audHosts;
  const list = [AUD];
  try {
    const d = await jget('https://api.audius.co', {}, 4000);
    (d.data || []).slice(0, 3).forEach((h) => { if (/^https:\/\//.test(h)) list.push(h.replace(/\/$/, '') + '/v1'); });
  } catch (e) { /* pakai host utama saja */ }
  return (audHosts = list);
}
async function audGet(path) {
  const key = audKey();
  const sep = path.includes('?') ? '&' : '?';
  let last;
  for (const h of await hosts()) {
    const url = `${h}${path}${sep}${APP}`;
    if (key) { // coba dengan key; kalau ditolak, ulangi tanpa key
      try { return await jget(url, { headers: { Authorization: 'Bearer ' + key } }); } catch (e) { last = e; }
    }
    try { return await jget(url); } catch (e) { last = e; }
  }
  throw last || new Error('audius');
}
const mapAudius = (a) => (Array.isArray(a) ? a : [])
  .filter((t) => t && t.id && t.is_streamable !== false && !t.is_delete && !t.is_stream_gated)
  .map((t) => ({
    id: 'a' + t.id,
    title: clip(t.title, 200) || 'Tanpa judul',
    artist: clip(t.user && t.user.name, 100) || 'Tidak diketahui',
    img: httpsOnly(t.artwork && (t.artwork['480x480'] || t.artwork['150x150'] || t.artwork['1000x1000'])),
    url: `${AUD}/tracks/${t.id}/stream?${APP}`,
    dl: t.is_downloadable && !t.is_download_gated ? 1 : 0,
  }));
async function audius(q, trending, genre) {
  if (trending) {
    let j = await audGet(`/tracks/trending?time=week&limit=25${genre ? '&genre=' + encodeURIComponent(genre) : ''}`);
    let out = mapAudius(j.data);
    if (!out.length && genre) out = mapAudius((await audGet('/tracks/trending?time=week&limit=25')).data);
    return out;
  }
  const j = await audGet(`/tracks/search?query=${encodeURIComponent(q)}&limit=25`);
  return mapAudius(j.data);
}

/* ---------- Jamendo ---------- */
async function jamendo(q, trending) {
  const id = process.env.JAMENDO_CLIENT_ID;
  if (!id) { const e = new Error('no-key'); e.code = 501; throw e; }
  const base = `https://api.jamendo.com/v3.0/tracks/?client_id=${encodeURIComponent(id)}&format=json&limit=25&audioformat=mp32&imagesize=300`;
  const j = await jget(base + (trending || !q ? '&order=popularity_week' : '&search=' + encodeURIComponent(q)));
  return (j.results || []).filter((t) => t.audio).map((t) => ({
    id: 'j' + t.id,
    title: clip(t.name, 200) || 'Tanpa judul',
    artist: clip(t.artist_name, 100) || 'Tidak diketahui',
    img: httpsOnly(t.image || t.album_image),
    url: httpsOnly(t.audio),
  }));
}

/* ---------- Internet Archive ---------- */
async function archive(q, trending) {
  const qq = trending || !q ? 'collection:opensource_audio' : `(${q.replace(/[()"\\]/g, ' ')}) AND mediatype:audio`;
  const u = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(qq) +
    '&fl[]=identifier&fl[]=title&fl[]=creator&rows=6&page=1&output=json&sort[]=' + encodeURIComponent('downloads desc');
  const j = await jget(u);
  const docs = (j.response && j.response.docs) || [];
  const out = await Promise.all(docs.map(async (d) => {
    try {
      const m = await jget(`https://archive.org/metadata/${encodeURIComponent(d.identifier)}`, {}, 3500);
      const files = (m.files || []).filter((f) => f && f.name);
      const f = files.find((x) => /\.mp3$/i.test(x.name)) || files.find((x) => /\.(ogg|m4a)$/i.test(x.name));
      if (!f) return null;
      const cr = Array.isArray(d.creator) ? d.creator[0] : d.creator;
      return {
        id: 'i' + d.identifier,
        title: clip(Array.isArray(d.title) ? d.title[0] : d.title, 200) || d.identifier,
        artist: clip(cr, 100) || 'Internet Archive',
        img: `https://archive.org/services/img/${encodeURIComponent(d.identifier)}`,
        url: `https://archive.org/download/${encodeURIComponent(d.identifier)}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
      };
    } catch (e) { return null; }
  }));
  return out.filter(Boolean);
}

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

/* ---------- Gabungan ---------- */
async function all(q, trending, genre) {
  const slow = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r([]), ms))]); // sumber lambat tidak menahan hasil lain
  const jobs = [audius(q, trending, genre), slow(archive(q, trending), 5000)];
  if (process.env.JAMENDO_CLIENT_ID) jobs.splice(1, 0, jamendo(q, trending));
  const rs = (await Promise.allSettled(jobs)).map((r) => (r.status === 'fulfilled' ? r.value : []));
  const out = [], seen = new Set();
  for (let i = 0; out.length < 40; i++) {
    let any = false;
    for (const l of rs) {
      if (i < l.length) { any = true; if (!seen.has(l[i].id)) { seen.add(l[i].id); out.push(l[i]); } }
    }
    if (!any) break;
  }
  return out;
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const src = u.searchParams.get('src') || 'audius';
  const q = clip(u.searchParams.get('q'), 100);
  const trending = u.searchParams.get('trending') === '1';
  const genre = clip(u.searchParams.get('genre'), 40);
  const cc = clip(u.searchParams.get('cc'), 2).replace(/[^a-zA-Z]/g, '');
  const tag = clip(u.searchParams.get('tag'), 30);
  try {
    if (!q && !trending && src !== 'radio') { res.status(200).json([]); return; }
    let data;
    if (src === 'audius') data = await audius(q, trending, genre);
    else if (src === 'jamendo') data = await jamendo(q, trending);
    else if (src === 'archive') data = await archive(q, trending);
    else if (src === 'radio') data = await radio(trending ? '' : q, cc, tag);
    else if (src === 'custom') data = await custom(q);
    else if (src === 'all') data = trending ? await audius('', true, genre) : await all(q, false, genre);
    else { res.status(400).json({ error: 'src tidak dikenal' }); return; }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    res.status(200).json(data);
  } catch (e) {
    if (e && e.code === 501) { res.status(501).json({ error: 'Sumber belum diaktifkan di server' }); return; }
    res.status(502).json({ error: 'Gagal mengambil data dari sumber', detail: String((e && e.message) || e).slice(0, 120) });
  }
};
      
