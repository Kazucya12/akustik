// /api/artist?q=nama                     -> [{ src, id, name, img, subs, v }]   (cari profil artis)
// /api/artist?src=au&id=ID&name=Nama     -> { tracks: [{..., rmx}] }            (lagu Audius milik artis)
// /api/artist?src=au&id=ID&albums=1       -> { albums: [{ id, name, img, n }] }
// /api/artist?src=au|yt&id=ID&latest=1     -> { tracks: [... ts] }                (rilis terbaru, untuk Beranda)
// /api/artist?album=ID&src=au|yt           -> { tracks: [...] }                    (isi satu album; YouTube = playlist milik channel)
// /api/artist?src=yt&id=CHANNEL_ID       -> { tracks: [{..., yt, vid, rmx}] }   (video channel YouTube)
// Audius gratis. Channel YouTube butuh YOUTUBE_API_KEY (tanpa key, hanya artis Audius yang muncul).
const UA = 'MidnightAcoustic/4.6';
const AUD = 'https://api.audius.co/v1';
const APP = 'app_name=MidnightAcoustic';
const RMX = /\b(remix|mix|edit|bootleg|flip|rework|vip|mashup|slowed|sped up|nightcore)\b/i;

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
const dec = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/* ---------- Audius ---------- */
const audKey = () => String(process.env.AUDIUS_API_KEY || '').trim().replace(/^["']|["']$/g, '');
let audHosts = null;
async function hosts() {
  if (audHosts) return audHosts;
  const list = [AUD];
  try {
    const d = await jget('https://api.audius.co', {}, 4000);
    (d.data || []).slice(0, 3).forEach((h) => { if (/^https:\/\//.test(h)) list.push(h.replace(/\/$/, '') + '/v1'); });
  } catch (e) { /* host utama saja */ }
  return (audHosts = list);
}
async function audGet(path) {
  const key = audKey();
  const sep = path.includes('?') ? '&' : '?';
  let last;
  for (const h of await hosts()) {
    const url = `${h}${path}${sep}${APP}`;
    if (key) { try { return await jget(url, { headers: { Authorization: 'Bearer ' + key } }); } catch (e) { last = e; } }
    try { return await jget(url); } catch (e) { last = e; }
  }
  throw last || new Error('audius');
}
async function audArtists(q) {
  const j = await audGet(`/users/search?query=${encodeURIComponent(q)}&limit=8`);
  return (j.data || []).filter((u) => u && u.id && u.track_count > 0).map((u) => ({
    src: 'au', id: String(u.id), name: clip(u.name, 100) || u.handle,
    img: httpsOnly(u.profile_picture && (u.profile_picture['480x480'] || u.profile_picture['150x150'] || u.profile_picture['1000x1000'])),
    subs: u.follower_count || 0, v: u.is_verified ? 1 : 0,
  }));
}
const mapT = (t, name) => ({
  id: 'a' + t.id,
  title: clip(t.title, 200) || 'Tanpa judul',
  artist: clip((t.user && t.user.name) || name, 100) || 'Tidak diketahui',
  img: httpsOnly(t.artwork && (t.artwork['480x480'] || t.artwork['150x150'] || t.artwork['1000x1000'])),
  url: `${AUD}/tracks/${t.id}/stream?${APP}`,
  dl: t.is_downloadable && !t.is_download_gated ? 1 : 0,
  d: +t.duration || 0,
  ts: Date.parse(t.release_date || t.created_at) || 0,
  rmx: (t.remix_of && t.remix_of.tracks && t.remix_of.tracks.length) || RMX.test(t.title || '') ? 1 : 0,
});
const okT = (t) => t && t.id && t.is_streamable !== false && !t.is_delete && !t.is_stream_gated;
async function audTracks(id, name, latest) {
  const j = await audGet(`/users/${encodeURIComponent(id)}/tracks?limit=${latest ? 8 : 60}&sort=${latest ? 'date' : 'plays'}`);
  return (j.data || []).filter(okT).map((t) => mapT(t, name));
}
async function audAlbums(id) {
  let l;
  try { l = (await audGet(`/users/${encodeURIComponent(id)}/albums?limit=30`)).data || []; }
  catch (e) { l = ((await audGet(`/users/${encodeURIComponent(id)}/playlists?limit=30`)).data || []).filter((p) => p.is_album); }
  return l.filter((p) => p && p.id && !p.is_delete).map((p) => ({
    id: String(p.id), name: clip(p.playlist_name, 120) || 'Album',
    img: httpsOnly(p.artwork && (p.artwork['480x480'] || p.artwork['150x150'] || p.artwork['1000x1000'])),
    n: p.track_count || (p.playlist_contents && p.playlist_contents.length) || 0,
  }));
}
async function audAlbumTracks(id) {
  const j = await audGet(`/playlists/${encodeURIComponent(id)}/tracks`);
  return (j.data || []).filter(okT).map((t) => mapT(t, ''));
}

/* ---------- YouTube ---------- */
const ytKey = () => String(process.env.YOUTUBE_API_KEY || '').trim();
async function ytArtists(q) {
  const k = ytKey();
  if (!k) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=4&q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(k));
  const items = (j.items || []).filter((x) => x.id && x.id.channelId);
  let st = {};
  try {
    const s = await jget('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + items.map((x) => x.id.channelId).join(',') + '&key=' + encodeURIComponent(k));
    (s.items || []).forEach((c) => { st[c.id] = c.statistics || {}; });
  } catch (e) { /* jumlah subscriber opsional */ }
  return items.map((x) => {
    const th = x.snippet.thumbnails || {};
    const s = st[x.id.channelId] || {};
    return {
      src: 'yt', id: x.id.channelId, name: clip(dec(x.snippet.channelTitle || x.snippet.title), 100),
      img: httpsOnly((th.high || th.medium || th.default || {}).url),
      subs: s.hiddenSubscriberCount ? 0 : +s.subscriberCount || 0, v: 0,
    };
  });
}
async function ytAlbums(id) {
  const k = ytKey();
  if (!k) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=30&channelId=' + encodeURIComponent(id) + '&key=' + encodeURIComponent(k));
  return (j.items || []).map((p) => {
    const th = p.snippet.thumbnails || {};
    return { id: p.id, name: clip(dec(p.snippet.title), 120) || 'Album', img: httpsOnly((th.high || th.medium || th.default || {}).url), n: (p.contentDetails && p.contentDetails.itemCount) || 0 };
  });
}
async function ytAlbumTracks(id) {
  const k = ytKey();
  if (!k) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + encodeURIComponent(id) + '&key=' + encodeURIComponent(k));
  return (j.items || []).filter((x) => x.snippet && x.snippet.resourceId && x.snippet.resourceId.videoId && !/^(private|deleted) video$/i.test(x.snippet.title || '')).map((x) => {
    const title = clip(dec(x.snippet.title), 200);
    return { id: x.snippet.resourceId.videoId, title, artist: clip(dec(x.snippet.videoOwnerChannelTitle || '').replace(/ - Topic$/i, ''), 100), rmx: RMX.test(title) ? 1 : 0 };
  });
}
async function ytLatest(id) {
  const k = ytKey();
  if (!k || !/^UC[\w-]{22}$/.test(id)) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=8&playlistId=UU' + id.slice(2) + '&key=' + encodeURIComponent(k));
  return (j.items || []).filter((x) => x.snippet && x.snippet.resourceId && x.snippet.resourceId.videoId && !/^(private|deleted) video$/i.test(x.snippet.title || '')).map((x) => ({
    id: x.snippet.resourceId.videoId, yt: 1, vid: x.snippet.resourceId.videoId, title: clip(dec(x.snippet.title), 200),
    artist: clip(dec(x.snippet.videoOwnerChannelTitle || '').replace(/ - Topic$/i, ''), 100), ts: Date.parse(x.snippet.publishedAt) || 0,
  }));
}
async function ytTracks(id, name) {
  const k = ytKey();
  if (!k) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=40&order=viewCount&channelId=' + encodeURIComponent(id) + '&key=' + encodeURIComponent(k));
  return (j.items || []).filter((x) => x.id && x.id.videoId).map((x) => {
    const title = clip(dec(x.snippet.title), 200);
    return { id: x.id.videoId, title, artist: clip(dec(x.snippet.channelTitle), 100) || name, rmx: RMX.test(title) ? 1 : 0 };
  });
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x').searchParams;
  const q = clip(u.get('q'), 100), id = clip(u.get('id'), 60), src = u.get('src') === 'yt' ? 'yt' : 'au';
  const name = clip(u.get('name'), 100);
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  try {
    const alb = clip(u.get('album'), 60);
    if (alb) {
      if (!/^[\w-]+$/.test(alb)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytAlbumTracks(alb) : await audAlbumTracks(alb) }); return;
    }
    if (id && u.get('latest')) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytLatest(id) : await audTracks(id, name, 1) }); return;
    }
    if (id && u.get('albums')) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ albums: src === 'yt' ? await ytAlbums(id) : await audAlbums(id) }); return;
    }
    if (id) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytTracks(id, name) : await audTracks(id, name) });
      return;
    }
    if (!q) { res.status(200).json([]); return; }
    const r = await Promise.allSettled([audArtists(q), ytArtists(q)]);
    const out = r.flatMap((x) => (x.status === 'fulfilled' ? x.value : []));
    // yang namanya sama persis dengan kata kunci tampil lebih dulu
    const ql = q.toLowerCase();
    out.sort((a, b) => (b.name.toLowerCase() === ql) - (a.name.toLowerCase() === ql) || b.subs - a.subs);
    res.status(200).json(out.slice(0, 8));
  } catch (e) {
    res.status(502).json({ error: 'Gagal memuat artis' });
  }
};
