// /api/artist?q=nama                     -> [{ src, id, name, img, subs, v }]   (cari profil artis)
// /api/artist?src=yt&id=ID&albums=1       -> { albums: [{ id, name, img, n }] }
// /api/artist?src=yt&id=ID&latest=1     -> { tracks: [... ts] }                (rilis terbaru, untuk Beranda)
// /api/artist?album=ID&src=yt           -> { tracks: [...] }                    (isi satu album; YouTube = playlist milik channel)
// /api/artist?src=yt&id=CHANNEL_ID       -> { tracks: [{..., yt, vid, rmx}] }   (video channel YouTube)
// Hanya YouTube (butuh YOUTUBE_API_KEY). Permintaan src=au lama dijawab kosong.
const UA = 'MidnightAcoustic/4.6';
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
    const raw = clip(dec(x.snippet.title), 200);
    const n = tidy(raw, dec(x.snippet.videoOwnerChannelTitle || ''));
    return { id: x.snippet.resourceId.videoId, title: n.title, artist: clip(n.artist, 100), rmx: RMX.test(raw) ? 1 : 0 };
  });
}
async function ytLatest(id, n) {
  const k = ytKey();
  if (!k || !/^UC[\w-]{22}$/.test(id)) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=' + (n || 8) + '&playlistId=UU' + id.slice(2) + '&key=' + encodeURIComponent(k));
  return (j.items || []).filter((x) => x.snippet && x.snippet.resourceId && x.snippet.resourceId.videoId && !/^(private|deleted) video$/i.test(x.snippet.title || '')).map((x) => {
    const t = tidy(clip(dec(x.snippet.title), 200), dec(x.snippet.videoOwnerChannelTitle || ''));
    return { id: x.snippet.resourceId.videoId, yt: 1, vid: x.snippet.resourceId.videoId, title: t.title, artist: clip(t.artist, 100), ts: Date.parse(x.snippet.publishedAt) || 0 };
  });
}
async function ytTracks(id, name) {
  const k = ytKey();
  if (!k) return [];
  const j = await jget('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=40&order=viewCount&channelId=' + encodeURIComponent(id) + '&key=' + encodeURIComponent(k));
  return (j.items || []).filter((x) => x.id && x.id.videoId).map((x) => {
    const raw = clip(dec(x.snippet.title), 200);
    const n = tidy(raw, dec(x.snippet.channelTitle) || name);
    return { id: x.id.videoId, title: n.title, artist: clip(n.artist, 100) || name, rmx: RMX.test(raw) ? 1 : 0 };
  });
}

// Rapikan judul dan nama penyanyi supaya mirip aplikasi musik (bukan judul video mentah)
const TAG = /\b(official|video|audio|lyrics?|lirik|visuali[sz]er|mv|m\/v|hd|4k|clip|klip|resmi|music)\b/i;
function cleanArtist(a) {
  const r = String(a || '').replace(/\s*-\s*Topic$/i, '').replace(/\s*VEVO$/i, '').replace(/\s*(official( channel)?|resmi)$/i, '').replace(/\s+/g, ' ').trim();
  return r || String(a || '').trim();
}
function tidy(rawTitle, rawArtist) {
  let t = String(rawTitle || '');
  let a = cleanArtist(rawArtist);
  // buang tag dalam kurung: (Official Video), [Lyrics], (Video Lirik), dst.
  t = t.replace(/\s*[\(\[【]([^\)\]】]*)[\)\]】]/g, (m, inner) => (TAG.test(inner) ? '' : m));
  t = t.replace(/\s*[|｜]\s*(official|lyric|video|audio|lirik|mv|visuali).*$/i, '');
  t = t.replace(/\s+[-–—]\s*(official|lyric|video|audio|lirik|visuali)[^-–—]*$/i, '').replace(/^\s*[\[\(【](mv|m\/v|official[^\]\)】]*)[\]\)】]\s*/i, '').replace(/\s+/g, ' ').trim();
  // "Artis - Judul" -> pisahkan; "Judul - Artis" (nama channel sama dengan bagian kanan) -> tukar
  const m = t.match(/^(.{2,60}?)\s[-–—]\s(.{2,})$/);
  if (m) {
    const l = m[1].trim(), r = m[2].trim(), an = a.toLowerCase();
    if (an && r.toLowerCase() === an) { a = r; t = l; }
    else if (!/^(live|cover|remix|acoustic|akustik)\b/i.test(r)) { a = l; t = r; }
  }
  return { title: t || String(rawTitle || ''), artist: a || String(rawArtist || '') };
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x').searchParams;
  const q = clip(u.get('q'), 100), id = clip(u.get('id'), 60), src = u.get('src') === 'yt' ? 'yt' : 'au';
  const name = clip(u.get('name'), 100);
  const n = Math.min(30, Math.max(1, parseInt(u.get('n'), 10) || 8));
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  try {
    const alb = clip(u.get('album'), 60);
    if (alb) {
      if (!/^[\w-]+$/.test(alb)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytAlbumTracks(alb) : [] }); return;
    }
    if (id && u.get('latest')) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytLatest(id, n) : [] }); return;
    }
    if (id && u.get('albums')) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ albums: src === 'yt' ? await ytAlbums(id) : [] }); return;
    }
    if (id) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytTracks(id, name) : [] });
      return;
    }
    if (!q) { res.status(200).json([]); return; }
    const r = await Promise.allSettled([ytArtists(q)]);
    const out = r.flatMap((x) => (x.status === 'fulfilled' ? x.value : []));
    // yang namanya sama persis dengan kata kunci tampil lebih dulu
    const ql = q.toLowerCase();
    out.sort((a, b) => (b.name.toLowerCase() === ql) - (a.name.toLowerCase() === ql) || b.subs - a.subs);
    res.status(200).json(out.slice(0, 8));
  } catch (e) {
    res.status(502).json({ error: 'Gagal memuat artis' });
  }
};
