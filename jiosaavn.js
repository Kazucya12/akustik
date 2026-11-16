// /api/jiosaavn?action=search&q=...            -> [{ id, title, artist, img, album, year, hasLyrics }]
// /api/jiosaavn?action=lyrics&id=...           -> { lyrics, id }
// /api/jiosaavn?action=lyrics&t=JUDUL&a=ARTIS  -> { lyrics, id }  (cari lagunya dulu, lalu ambil liriknya)
// Butuh env JIOSAAVN_API_URL = alamat backend JioSaavnAPI milikmu, contoh https://api-musik-zeta.vercel.app
// Backend itu hanya memberi metadata dan lirik. Pemutaran lagu tetap lewat YouTube di sisi aplikasi.
const UA = 'Loopify/4.30';

function base() {
  const u = String(process.env.JIOSAAVN_API_URL || '').trim().replace(/\/+$/, '');
  return /^https:\/\//i.test(u) ? u : '';
}
async function jget(url, ms = 9000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const dec = (s) => String(s == null ? '' : s)
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const clip = (s, n) => dec(s).replace(/\s+/g, ' ').trim().slice(0, n);
const https = (u) => {
  const s = String(u || '').replace(/^http:\/\//i, 'https://').replace('150x150', '500x500');
  return /^https:\/\//i.test(s) ? s : '';
};
const norm = (s) => dec(s).toLowerCase().replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/[^a-z0-9\u00c0-\uffff]+/g, ' ').trim();

// Backend bisa mengembalikan bentuk lengkap (song, primary_artists) atau ringkas (title, more_info). Dua-duanya dibaca.
function pick(x) {
  if (!x || typeof x !== 'object' || !x.id) return null;
  const mi = x.more_info || {};
  const artists = x.primary_artists || x.singers || mi.primary_artists || mi.singers || x.subtitle || x.description || '';
  const names = String(artists).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2).join(', ');
  const title = clip(x.song || x.title || x.name, 200);
  if (!title) return null;
  return {
    id: String(x.id).slice(0, 40),
    title,
    artist: clip(names, 100) || 'Tidak diketahui',
    img: https(x.image),
    album: clip(x.album || mi.album, 100),
    year: clip(x.year, 4),
    hasLyrics: String(x.has_lyrics || mi.has_lyrics || '').toLowerCase() === 'true',
  };
}
async function search(b, q) {
  const j = await jget(b + '/song/?query=' + encodeURIComponent(q) + '&lyrics=false&songdata=false');
  const arr = Array.isArray(j) ? j : j && (j.songs || j.data || j.results) || [];
  const seen = new Set();
  return arr.map(pick).filter((s) => s && !seen.has(s.id) && seen.add(s.id));
}
function plain(html) {
  return dec(String(html || '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000);
}
async function lyricsById(b, id) {
  const j = await jget(b + '/lyrics/?query=' + encodeURIComponent(id));
  return plain(j && j.lyrics);
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const action = u.searchParams.get('action') || 'search';
  const b = base();
  if (!b) { res.status(501).json({ error: 'JIOSAAVN_API_URL belum diatur di Vercel' }); return; }
  try {
    if (action === 'search') {
      const q = clip(u.searchParams.get('q'), 100);
      if (!q) { res.status(200).json([]); return; }
      const list = (await search(b, q)).slice(0, 20);
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
      res.status(200).json(list);
      return;
    }
    if (action === 'lyrics') {
      let id = String(u.searchParams.get('id') || '').trim();
      if (id && !/^[\w-]{1,40}$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      let ids = id ? [id] : [];
      if (!ids.length) {
        const t = clip(u.searchParams.get('t'), 100), a = clip(u.searchParams.get('a'), 60);
        if (!t) { res.status(200).json({ lyrics: '' }); return; }
        const nt = norm(t);
        // Hanya terima hasil yang judulnya cocok, supaya lirik lagu lain tidak muncul
        const list = await search(b, (t + ' ' + a).trim());
        ids = list.filter((s) => { const n = norm(s.title); return n && nt && (n === nt || n.includes(nt) || nt.includes(n)); })
          .slice(0, 2).map((s) => s.id);
      }
      let lyrics = '', used = '';
      for (const i of ids) {
        try { lyrics = await lyricsById(b, i); } catch (e) { lyrics = ''; }
        if (lyrics) { used = i; break; }
      }
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.status(200).json({ lyrics, id: used });
      return;
    }
    res.status(400).json({ error: 'action tidak dikenal' });
  } catch (e) {
    res.status(502).json({ error: 'Gagal mengambil data dari JioSaavn', detail: String((e && e.message) || e).slice(0, 120) });
  }
};
