// /api/soundstat?type=mood|activity|time&value=... (&r=timestamp untuk segarkan)
const BASE = 'https://soundstat.info/api/v1';
const AUD = 'https://api.audius.co/v1';
const APP = 'app_name=MidnightAcoustic';

const OK = {
  mood: ['happy', 'sad', 'energetic', 'relaxed', 'danceable'],
  activity: ['workout', 'study', 'sleep', 'party', 'focus'],
  time: ['morning', 'afternoon', 'evening', 'night'],
};
const PATH = { mood: ['mood', 'mood'], activity: ['activity', 'activity'], time: ['time-of-day', 'time'] };

// Kata kunci suasana untuk fallback otomatis & pengayaan hasil
const MOOD_QUERY = {
  happy: ['happy acoustic upbeat', 'feel good pop', 'sunny day chill'],
  sad: ['sad acoustic ballad', 'melancholy piano', 'galau akustik'],
  energetic: ['energetic rock upbeat', 'high energy electronic', 'power workout'],
  relaxed: ['chill acoustic ambient', 'lofi relax', 'santai akustik'],
  danceable: ['dance groove nu disco', 'house dance', 'upbeat funk'],
  workout: ['workout bass boost', 'gym motivation beat', 'cardio electronic'],
  study: ['lofi study beats', 'instrumental focus', 'calm piano study'],
  sleep: ['sleep ambient rain', 'deep sleep piano', 'soft lullaby'],
  party: ['party remix dance', 'club hits', 'dj party'],
  focus: ['deep focus instrumental', 'ambient concentration', 'minimal electronic'],
  morning: ['morning coffee acoustic', 'pagi cerah akustik', 'sunrise chill'],
  afternoon: ['afternoon indie chill', 'sunny acoustic', 'sore santai'],
  evening: ['evening jazz chill', 'sunset lofi', 'senja akustik'],
  night: ['midnight lofi chill', 'late night R&B', 'malam tenang'],
};

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

async function fallbackMoodTracks(value) {
  const queries = MOOD_QUERY[value] || ['acoustic chill'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const j = await jget(`${AUD}/tracks/search?query=${encodeURIComponent(q)}&limit=25&${APP}`);
  const list = (Array.isArray(j.data) ? j.data : [])
    .filter((t) => t && t.id && t.is_streamable !== false && !t.is_delete && !t.is_stream_gated)
    .map((t) => ({
      id: 'a' + t.id,
      title: String(t.title || 'Tanpa judul').slice(0, 200),
      artist: String((t.user && t.user.name) || 'Tidak diketahui').slice(0, 100),
      img: (t.artwork && (t.artwork['480x480'] || t.artwork['150x150'])) || '',
      url: `${AUD}/tracks/${t.id}/stream?${APP}`,
    }));
  for (let i = list.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [list[i], list[k]] = [list[k], list[i]];
  }
  return list.slice(0, 10);
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

  // Fallback otomatis ke Audius jika SoundStat gagal atau API key kosong
  if (!out.length) {
    try {
      out = await fallbackMoodTracks(value);
    } catch (e) {
      res.status(502).json({ error: 'Gagal memuat rekomendasi suasana lagu' });
      return;
    }
  }

  res.setHeader('Cache-Control', p.get('r') ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(out);
};
