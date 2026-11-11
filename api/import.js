// /api/import?url=<link playlist/album Spotify atau playlist YouTube>
// -> { name, src: 'spotify'|'youtube', tracks: [{ title, artist, id, img }] }
const MAX = 100;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const fail = (res, code, error) => res.status(code).json({ error });
const oops = (user, code) => Object.assign(new Error(user), { user, code });

async function get(url, ms = 9000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: c.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html,application/xhtml+xml,application/json' },
    });
  } finally { clearTimeout(t); }
}

// Kenali link Spotify: web, intl-xx, /user/x/playlist/, /embed/, URI spotify:...
function parseSpotify(raw) {
  let m = raw.match(/open\.spotify\.com\/(?:embed\/)?(?:intl-[a-z-]+\/)?(?:user\/[^/?#]+\/)?(playlist|album)\/([A-Za-z0-9]{10,30})/i);
  if (m) return { kind: m[1].toLowerCase(), id: m[2] };
  m = raw.match(/^spotify:(?:user:[^:]+:)?(playlist|album):([A-Za-z0-9]{10,30})$/i);
  return m ? { kind: m[1].toLowerCase(), id: m[2] } : null;
}

// Link pendek dari tombol Bagikan di HP (spotify.link / spotify.app.link): ikuti redirect
async function expandShort(raw) {
  const u = (raw.match(/https?:\/\/(?:spotify\.link|spotify\.app\.link)\/[^\s]+/i) || [])[0];
  if (!u) return null;
  try {
    const r = await get(u, 7000);
    const hit = parseSpotify(r.url || '');
    if (hit) return hit;
    const h = await r.text();
    const m = h.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album)\/([A-Za-z0-9]{10,30})/i);
    return m ? { kind: m[1].toLowerCase(), id: m[2] } : null;
  } catch (e) { return null; }
}

// Cari objek yang punya trackList di mana pun posisinya (struktur __NEXT_DATA__ sering berubah)
function findEntity(o, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 8) return null;
  if (Array.isArray(o.trackList) && o.trackList.length) return o;
  for (const k of Object.keys(o)) {
    const f = findEntity(o[k], depth + 1);
    if (f) return f;
  }
  return null;
}

function fromNextData(h) {
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  let j;
  try { j = JSON.parse(m[1]); } catch (e) { return null; }
  const en = findEntity(j);
  if (!en) return null;
  return {
    name: en.name || en.title,
    tracks: en.trackList.map((t) => ({
      title: t.title || t.name,
      artist: t.subtitle || (Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : ''),
      id: String(t.uri || '').split(':').pop() || undefined,
    })),
  };
}

// Format lama: <script id="resource" type="application/json"> (URL-encoded / base64)
function fromResource(h) {
  const m = h.match(/<script id="resource"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  let j;
  const s = m[1].trim();
  try { j = JSON.parse(decodeURIComponent(s)); } catch (e) {
    try { j = JSON.parse(Buffer.from(s, 'base64').toString('utf8')); } catch (e2) { return null; }
  }
  const items = (j.tracks && j.tracks.items) || [];
  if (!items.length) return null;
  return {
    name: j.name,
    tracks: items.map((x) => { const t = x.track || x; return { title: t.name, artist: (t.artists || []).map((a) => a.name).join(', '), id: t.id }; }),
  };
}

async function spotify(kind, id) {
  let r;
  try { r = await get(`https://open.spotify.com/embed/${kind}/${id}`); }
  catch (e) { throw oops('Server tidak bisa menghubungi Spotify (timeout). Coba lagi sebentar lagi.', 504); }
  if (r.status === 404) throw oops('Playlist/album Spotify tidak ditemukan atau tidak publik.', 404);
  if (r.status === 403 || r.status === 429) {
    console.error('spotify embed blocked', r.status);
    throw oops('Spotify menolak permintaan dari server (diblokir/dibatasi). Pakai opsi tempel daftar lagu.', 502);
  }
  if (!r.ok) { console.error('spotify embed status', r.status); throw oops('Spotify membalas error ' + r.status + '. Coba lagi nanti.', 502); }
  const h = await r.text();
  const d = fromNextData(h) || fromResource(h);
  if (!d) {
    console.error('spotify embed: format tidak dikenali', h.length, h.slice(0, 300));
    throw oops('Daftar lagu tidak terbaca. Pastikan playlist publik (bukan playlist buatan Spotify seperti Daily Mix) atau pakai tempel daftar lagu.', 502);
  }
  const tracks = d.tracks.slice(0, MAX).map((t) => ({
    title: String(t.title || '').slice(0, 200),
    artist: String(t.artist || '').replace(/\u00a0/g, ' ').slice(0, 100),
    id: t.id,
    img: '',
  })).filter((t) => t.title);
  if (!tracks.length) throw oops('Playlist ini kosong atau daftar lagunya tidak bisa dibaca.', 422);
  return { name: String(d.name || 'Playlist Spotify').slice(0, 80), src: 'spotify', tracks };
}

async function youtube(id) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw oops('YOUTUBE_API_KEY belum diatur di Vercel.', 501);
  let name = 'Playlist YouTube';
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${id}&key=${encodeURIComponent(key)}`);
    const j = await r.json();
    if (j.items && j.items[0]) name = j.items[0].snippet.title;
  } catch (e) { /* pakai nama bawaan */ }
  const tracks = [];
  let token = '';
  while (tracks.length < MAX) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id}&key=${encodeURIComponent(key)}${token ? '&pageToken=' + token : ''}`);
    const j = await r.json();
    if (!r.ok) throw oops(r.status === 404 ? 'Playlist YouTube tidak ditemukan atau privat.' : 'Gagal mengambil playlist YouTube.', 502);
    for (const it of j.items || []) {
      const s = it.snippet || {};
      if (!s.resourceId || !s.resourceId.videoId || /^(Private|Deleted) video$/i.test(s.title)) continue;
      tracks.push({
        title: String(s.title || '').slice(0, 200),
        artist: String(s.videoOwnerChannelTitle || s.channelTitle || '').slice(0, 100),
        id: s.resourceId.videoId,
        img: (s.thumbnails && ((s.thumbnails.medium || s.thumbnails.default) || {}).url) || '',
      });
    }
    token = j.nextPageToken;
    if (!token) break;
  }
  return { name: String(name).slice(0, 80), src: 'youtube', tracks: tracks.slice(0, MAX) };
}

module.exports = async (req, res) => {
  const raw = String(new URL(req.url, 'http://x').searchParams.get('url') || '').trim().slice(0, 300);
  if (!raw) return fail(res, 400, 'Tempel link playlist dulu.');
  try {
    let sp = parseSpotify(raw) || (await expandShort(raw));
    if (sp) { const d = await spotify(sp.kind, sp.id); res.setHeader('Cache-Control', 'public, s-maxage=600'); return res.status(200).json(d); }
    if (/spotify\.com\/track\//i.test(raw)) return fail(res, 400, 'Itu link satu lagu. Tempel link playlist atau album.');
    if (/spotify\.link|spotify\.app\.link/i.test(raw)) return fail(res, 400, 'Link pendek Spotify tidak bisa dibuka. Buka linknya, lalu salin link open.spotify.com/playlist/… dari browser.');
    const m = raw.match(/[?&]list=([\w-]{10,50})/);
    if (m && /youtu/i.test(raw)) { const d = await youtube(m[1]); res.setHeader('Cache-Control', 'public, s-maxage=600'); return res.status(200).json(d); }
    return fail(res, 400, 'Link tidak dikenali. Pakai link playlist/album Spotify atau playlist YouTube.');
  } catch (e) {
    console.error('import error', e && e.message);
    return fail(res, e.code || 502, e.user || 'Gagal mengambil playlist. Coba tempel daftar lagu manual.');
  }
};
