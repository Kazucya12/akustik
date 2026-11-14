// /api/soundstat?type=mood|activity|time&value=... (&r=timestamp untuk segarkan)
const BASE = 'https://soundstat.info/api/v1';

const OK = {
  mood: ['happy', 'sad', 'energetic', 'relaxed', 'danceable'],
  activity: ['workout', 'study', 'sleep', 'party', 'focus'],
  time: ['morning', 'afternoon', 'evening', 'night'],
};
const PATH = { mood: ['mood', 'mood'], activity: ['activity', 'activity'], time: ['time-of-day', 'time'] };

async function jget(url, opt = {}, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { ...opt, signal: c.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const names = (a) => (Array.isArray(a) ? a : a ? [a] : [])
  .map((x) => (typeof x === 'string' ? x : x && x.name))
  .filter(Boolean);

async function info(id, key) {
  let title = '', artist = '', bpm = 0;
  try {
    const j = await jget(`${BASE}/track/${encodeURIComponent(id)}`, { headers: { 'x-api-key': key } });
    const t = j.track || j;
    title = t.name || t.title || '';
    artist = names(t.artists || t.artist).join(', ');
    const f = t.features || t.audio_features || t;
    bpm = Math.round(+(f.tempo || t.tempo || 0)) || 0;
  } catch (e) {}

  if (!title) {
    try {
      const r = await fetch(`https://open.spotify.com/embed/track/${encodeURIComponent(id)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const h = await r.text();
      const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      const en = m && JSON.parse(m[1]).props.pageProps.state.data.entity;
      if (en) {
        title = en.name || en.title || '';
        artist = artist || names(en.artists).join(', ');
      }
    } catch (e) {}
  }
  if (!title) return null;
  const o = { id: 's' + id, title: title.slice(0, 200), artist: (artist || 'Tidak diketahui').slice(0, 100), img: '' };
  if (bpm) o.bpm = bpm;
  return o;
}

module.exports = async (req, res) => {
  const key = String(process.env.SOUNDSTAT_API_KEY || '').trim();
  const p = new URL(req.url, 'http://x').searchParams;
  const type = p.get('type'), value = p.get('value');

  if (!OK[type] || !OK[type].includes(value)) {
    res.status(400).json({ error: 'type/value tidak valid' });
    return;
  }

  let out = [];
  if (key) {
    try {
      const [path, field] = PATH[type];
      const j = await jget(`${BASE}/recommendations/${path}`, {
        method: 'POST',
        headers: { 'x-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ [field]: value, limit: 30 }),
      });
      let ids = (j.track_ids || []).filter((x) => /^[A-Za-z0-9]{10,30}$/.test(x));
      for (let i = ids.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[k]] = [ids[k], ids[i]];
      }
      ids = ids.slice(0, 10);
      out = (await Promise.all(ids.map((id) => info(id, key)))).filter(Boolean);
    } catch (e) {
      out = [];
    }
  }

  // Tanpa key, rekomendasi tidak tersedia (fallback Audius sudah dihapus)
  if (!key) {
    res.status(501).json({ error: 'SOUNDSTAT_API_KEY belum diatur' });
    return;
  }

  res.setHeader('Cache-Control', p.get('r') ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(out);
};
