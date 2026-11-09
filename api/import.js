// /api/import?url=<link playlist/album Spotify atau playlist YouTube>
// -> { name, src: 'spotify'|'youtube', tracks: [{ title, artist, id, img }] }
const MAX = 100;
const UA = 'Mozilla/5.0 (compatible; MidnightAcoustic/3.3)';
const fail = (res, code, error) => res.status(code).json({ error });

async function spotify(kind, id) {
  const r = await fetch(`https://open.spotify.com/embed/${kind}/${id}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!r.ok) throw Object.assign(new Error('spotify'), { user: 'Playlist/album Spotify tidak ditemukan atau tidak publik.' });
  const h = await r.text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw Object.assign(new Error('spotify'), { user: 'Spotify mengubah halamannya. Pakai opsi tempel daftar lagu.' });
  const en = JSON.parse(m[1]).props.pageProps.state.data.entity;
  const list = (en && en.trackList) || [];
  const tracks = list.slice(0, MAX).map((t) => ({
    title: String(t.title || '').slice(0, 200),
    artist: String(t.subtitle || '').replace(/\u00a0/g, ' ').slice(0, 100),
    id: String(t.uri || '').split(':').pop() || undefined,
    img: '',
  })).filter((t) => t.title);
  return { name: String((en && (en.name || en.title)) || 'Playlist Spotify').slice(0, 80), src: 'spotify', tracks };
}

async function youtube(id) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw Object.assign(new Error('nokey'), { code: 501, user: 'YOUTUBE_API_KEY belum diatur di Vercel.' });
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
    if (!r.ok) throw Object.assign(new Error('yt'), { user: r.status === 404 ? 'Playlist YouTube tidak ditemukan atau privat.' : 'Gagal mengambil playlist YouTube.' });
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
    let m = raw.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album)\/([A-Za-z0-9]{10,30})/i) || raw.match(/^spotify:(playlist|album):([A-Za-z0-9]{10,30})$/i);
    if (m) { const d = await spotify(m[1].toLowerCase(), m[2]); res.setHeader('Cache-Control', 'public, s-maxage=600'); return res.status(200).json(d); }
    m = raw.match(/[?&]list=([\w-]{10,50})/);
    if (m && /youtu/i.test(raw)) { const d = await youtube(m[1]); res.setHeader('Cache-Control', 'public, s-maxage=600'); return res.status(200).json(d); }
    return fail(res, 400, 'Link tidak dikenali. Pakai link playlist/album Spotify atau playlist YouTube.');
  } catch (e) {
    return fail(res, e.code || 502, e.user || 'Gagal mengambil playlist. Coba tempel daftar lagu manual.');
  }
};
