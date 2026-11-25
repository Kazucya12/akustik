// /api/artist?q=nama                     -> [{ src, id, name, img, subs, v }]   (cari profil artis)
// /api/artist?src=yt&id=ID&albums=1       -> { albums: [{ id, name, img, n }] }
// /api/artist?src=yt&id=ID&latest=1     -> { tracks: [... ts] }                (rilis terbaru, untuk Beranda)
// /api/artist?album=ID&src=yt           -> { tracks: [...] }                    (isi satu album; YouTube = playlist milik channel)
// /api/artist?src=yt&id=CHANNEL_ID       -> { tracks: [{..., yt, vid, rmx}] }   (video channel YouTube)
// /api/artist?names=A~VID|B~VID|C&s=1   -> { res: { A: {id,name,img,subs}|null, ... }, quota }   (foto channel banyak artis; maks 25; s=1 = boleh pakai pencarian yang mahal)
// /api/artist?src=yt&id=CHANNEL_ID&top=1 -> { tracks: [{id,title,artist,rmx,v,ts,d}] }  (lagu populer + terbaru, ±8 unit kuota)
// /api/artist?asearch=nama                -> [{ id, name, artist, img, n, year }]   (cari album lewat iTunes Search, tanpa API key & tanpa kuota YouTube)
// /api/artist?aid=123                    -> { album: {...}|null, tracks: [{ n, title, artist }] }   (isi album iTunes; tanpa alamat putar)
// Selain dua mode iTunes di atas, hanya YouTube (butuh YOUTUBE_API_KEY). Permintaan src=au lama dijawab kosong.
const UA = 'Loopify/4.5.6';
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

/* Cocokkan banyak nama artis ke channel YouTube-nya (nama + foto).
   Jalur murah (1-2 unit kuota untuk 50 artis): ambil channel dari video yang sudah kamu punya (videos.list -> channels.list).
   Jalur mahal (100 unit per nama): pencarian channel, hanya kalau diminta (s=1) atau tidak ada videonya. */
const normN = (s) => String(s || '').toLowerCase().replace(/\s*-\s*topic$/, '').replace(/\b(official|vevo|music|channel|resmi)\b/g, '').replace(/[^a-z0-9À-￿]+/g, '');
const rank = (n, title) => { const a = normN(n), t = normN(title); return !a || !t ? 0 : t === a ? 3 : (t.indexOf(a) >= 0 || a.indexOf(t) >= 0) ? 2 : 0; };
async function ytResolve(entries, allowSearch) {
  const k = ytKey();
  const out = {};
  let quota = false;
  if (!k) return { res: out, quota: false, nokey: true };
  const kk = encodeURIComponent(k);
  const note = (e) => { if (/403|429/.test(String(e && e.message))) quota = true; };
  // 1) video -> channel (1 unit)
  const vids = [...new Set(entries.map((e) => e.vid).filter(Boolean))].slice(0, 50);
  const chOf = {};
  if (vids.length) {
    try {
      const j = await jget('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + vids.join(',') + '&key=' + kk);
      (j.items || []).forEach((v) => { if (v.snippet && v.snippet.channelId) chOf[v.id] = v.snippet.channelId; });
    } catch (e) { note(e); }
  }
  // 2) pencarian channel untuk yang belum ketemu (mahal, opsional)
  const found = {};
  if (allowSearch) {
    await Promise.all(entries.filter((e) => !chOf[e.vid]).slice(0, 8).map(async (e) => {
      try {
        const j = await jget('https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=3&q=' + encodeURIComponent(e.n) + '&key=' + kk);
        found[e.n] = (j.items || []).filter((x) => x.id && x.id.channelId).map((x) => x.id.channelId);
      } catch (er) { note(er); found[e.n] = null; }
    }));
  }
  // 3) detail channel: nama, foto, subscriber (1 unit)
  const ids = [...new Set(Object.values(chOf).concat(...Object.values(found).filter(Boolean)))].slice(0, 50);
  const info = {};
  if (ids.length) {
    try {
      const j = await jget('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=' + ids.join(',') + '&key=' + kk);
      (j.items || []).forEach((c) => { info[c.id] = c; });
    } catch (e) { note(e); }
  }
  const pack = (c) => { const th = (c.snippet && c.snippet.thumbnails) || {}, st = c.statistics || {}; return { id: c.id, name: clip(dec(c.snippet.title), 100), img: httpsOnly((th.high || th.medium || th.default || {}).url), subs: st.hiddenSubscriberCount ? 0 : +st.subscriberCount || 0 }; };
  entries.forEach((e) => {
    const cand = [chOf[e.vid]].concat(found[e.n] || []).filter((id) => id && info[id]);
    const best = cand.map((id) => ({ c: info[id], r: rank(e.n, info[id].snippet && info[id].snippet.title) })).filter((m) => m.r > 0).sort((m, o) => o.r - m.r)[0];
    if (best) { out[e.n] = pack(best.c); return; }
    if (found[e.n] === null) return;           // pencarian gagal: jangan disimpan sebagai "tidak ada"
    if (!allowSearch && !cand.length && !e.vid) { out[e.n] = null; return; }
    if (quota && !cand.length) return;         // kuota habis: coba lagi nanti
    out[e.n] = null;
  });
  return { res: out, quota };
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

/* Lagu populer + rilis terbaru satu artis dengan kuota kecil: ambil sampai 200 upload channel (4 unit), lalu statistik tontonan (4 unit).
   Hasil diurutkan di klien: Populer = views terbanyak, Terbaru = tanggal. */
const isoSec = (d) => { const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(d || ''); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0; };
const NOSONG = /\b(full album|karaoke|livestream|live stream|podcast|compilation|nonstop|non stop|1 hour|1 jam|behind the scenes|trailer|interview|wawancara|reaction)\b/i;
async function ytTop(id, name) {
  const k = ytKey();
  if (!k || !/^UC[\w-]{22}$/.test(id)) return [];
  const kk = encodeURIComponent(k), pl = 'UU' + id.slice(2);
  let ids = [], tok = '';
  const meta = {};
  for (let i = 0; i < 4; i++) {
    const j = await jget('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + pl + (tok ? '&pageToken=' + tok : '') + '&key=' + kk);
    (j.items || []).forEach((x) => {
      const sn = x.snippet || {}, v = sn.resourceId && sn.resourceId.videoId;
      if (v && !/^(private|deleted) video$/i.test(sn.title || '')) { ids.push(v); meta[v] = { t: clip(dec(sn.title), 200), o: dec(sn.videoOwnerChannelTitle || ''), ts: Date.parse(sn.publishedAt) || 0 }; }
    });
    tok = j.nextPageToken || '';
    if (!tok) break;
  }
  ids = [...new Set(ids)];
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const j = await jget('https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,status&id=' + ids.slice(i, i + 50).join(',') + '&key=' + kk);
      (j.items || []).forEach((v) => {
        const d = isoSec(v.contentDetails && v.contentDetails.duration);
        if (d < 60 || d > 600 || NOSONG.test(meta[v.id].t) || (v.status && v.status.embeddable === false)) return;
        const m = meta[v.id], n = tidy(m.t, m.o || name);
        out.push({ id: v.id, title: n.title, artist: clip(n.artist, 100) || name, rmx: RMX.test(m.t) ? 1 : 0, v: +(v.statistics && v.statistics.viewCount) || 0, ts: m.ts, d });
      });
    } catch (e) { if (!out.length) throw e; }
  }
  // satu judul = satu lagu (ambil versi dengan tontonan terbanyak)
  const best = new Map();
  out.forEach((t) => { const key = t.title.toLowerCase().replace(/[^a-z0-9À-￿]+/g, ''); const o = best.get(key); if (!o || t.v > o.v) best.set(key, t); });
  return [...best.values()].sort((a, b) => b.v - a.v).slice(0, 60);
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
  t = t.replace(/\s+[-–—]\s*(official|lyric|video|audio|lirik|visuali)[^-–—]*$/i, '').replace(/^\s*[\[\(【](mv|m\/v|official[^\]\)】]*)[\]\)】]\s*/i, '').replace(/\s+(m\/v|mv)$/i, '').replace(/\s+/g, ' ').trim();
  // "Artis - Judul" -> pisahkan; "Judul - Artis" (nama channel sama dengan bagian kanan) -> tukar
  const m = t.match(/^(.{2,60}?)\s[-–—]\s(.{2,})$/);
  if (m) {
    const l = m[1].trim(), r = m[2].trim(), an = a.toLowerCase();
    if (an && r.toLowerCase() === an) { a = r; t = l; }
    else if (!/^(live|cover|remix|acoustic|akustik)\b/i.test(r)) { a = l; t = r; }
  }
  return { title: t || String(rawTitle || ''), artist: a || String(rawArtist || '') };
}

// ---- Album lewat iTunes Search (gratis, tanpa kunci). Digabung di sini karena paket Hobby Vercel dibatasi 12 fungsi. ----
const itArt = (x) => { x = String(x || ''); return /^https:\/\//.test(x) ? x.replace(/\/\d+x\d+(bb)?\.(jpg|png)$/i, '/300x300bb.jpg') : ''; };
const itAlb = (x) => ({
  id: String(x.collectionId), name: String(x.collectionName || '').slice(0, 120), artist: String(x.artistName || '').slice(0, 100),
  img: itArt(x.artworkUrl100), n: x.trackCount || 0, year: /^\d{4}/.test(String(x.releaseDate || '')) ? String(x.releaseDate).slice(0, 4) : '',
});
async function itunesAlbum(as, aid, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  try {
    if (aid) {
      if (!/^\d{1,12}$/.test(aid)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      const j = await jget('https://itunes.apple.com/lookup?id=' + aid + '&entity=song&limit=80', {}, 4500);
      const rs = Array.isArray(j.results) ? j.results : [];
      const al = rs.find((x) => x.wrapperType === 'collection');
      const tracks = rs.filter((x) => x.wrapperType === 'track' && x.kind === 'song')
        .sort((a, b) => (a.discNumber || 1) - (b.discNumber || 1) || (a.trackNumber || 0) - (b.trackNumber || 0))
        .map((x, i) => ({ n: i + 1, title: String(x.trackName || '').slice(0, 160), artist: String(x.artistName || '').slice(0, 100) }))
        .filter((x) => x.title);
      res.status(200).json({ album: al ? itAlb(al) : null, tracks });
      return;
    }
    let list = [];
    for (const c of ['ID', 'US']) {
      const j = await jget('https://itunes.apple.com/search?media=music&entity=album&limit=10&country=' + c + '&term=' + encodeURIComponent(as), {}, 4500);
      list = (Array.isArray(j.results) ? j.results : []).filter((x) => x.wrapperType === 'collection' && x.collectionId && x.collectionName);
      if (list.length) break;
    }
    const seen = new Set(), out = [];
    for (const x of list) {
      const a = itAlb(x), k = (a.name + '|' + a.artist).toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k); out.push(a);
      if (out.length >= 8) break;
    }
    res.status(200).json(out);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(aid ? { album: null, tracks: [] } : []);
  }
}

module.exports = async (req, res) => {
  if (!(await require('./_rl')(req, res, 'ar', 60, 60))) return;
  const u = new URL(req.url, 'http://x').searchParams;
  const q = clip(u.get('q'), 100), id = clip(u.get('id'), 60), src = u.get('src') === 'yt' ? 'yt' : 'au';
  const name = clip(u.get('name'), 100);
  const n = Math.min(30, Math.max(1, parseInt(u.get('n'), 10) || 8));
  const as = clip(u.get('asearch'), 80), aid = clip(u.get('aid'), 14);
  if (as || aid) { await itunesAlbum(as, aid, res); return; }
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  if (!ytKey()) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(501).json({ error: 'YOUTUBE_API_KEY belum terbaca di server. Isi di Vercel > Settings > Environment Variables (Production), lalu Redeploy.' });
    return;
  }
  try {
    const nm = clip(u.get('names'), 2500);
    if (nm) {
      // format: "Nama~VIDEOID|Nama2~VIDEOID2|Nama3" (VIDEOID opsional)
      const seen = new Set();
      const list = nm.split('|').map((x) => { const i = x.lastIndexOf('~'); const v = i > 0 ? x.slice(i + 1).trim() : ''; return { n: clip(i > 0 ? x.slice(0, i) : x, 100), vid: /^[\w-]{6,20}$/.test(v) ? v : '' }; }).filter((e) => e.n && !seen.has(e.n) && seen.add(e.n)).slice(0, 25);
      const r = await ytResolve(list, u.get('s') === '1');
      if (r.quota || r.nokey) res.setHeader('Cache-Control', 'no-store');
      else res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
      res.status(200).json(r); return;
    }
    const alb = clip(u.get('album'), 60);
    if (alb) {
      if (!/^[\w-]+$/.test(alb)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.status(200).json({ tracks: src === 'yt' ? await ytAlbumTracks(alb) : [] }); return;
    }
    if (id && u.get('top')) {
      if (!/^[\w-]+$/.test(id)) { res.status(400).json({ error: 'id tidak valid' }); return; }
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=259200');
      res.status(200).json({ tracks: src === 'yt' ? await ytTop(id, name) : [] }); return;
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
    if (!out.length) res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.status(200).json(out.slice(0, 8));
  } catch (e) {
    res.status(502).json({ error: 'Gagal memuat artis' });
  }
};
