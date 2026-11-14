// POST /api/collab { action, session, ... }  (wajib login; database & AUTH_SECRET sama dengan /api/auth)
//  Playlist kolaboratif: co_create {name,d,tracks} -> {code,name,d,tr} | co_sync {code,add[],rm[]} -> {code,name,d,tr}
//  Jam (dengar bareng):  jam_start {track,pos,playing} -> {code} | jam_put {code,track,pos,playing} | jam_get {code} | jam_end {code}
const crypto = require('crypto');
const PREFIX = 'ma:';
async function rd(...cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !tok) throw new Error('nodb');
  const c = cmd.map(String); c[1] = PREFIX + c[1];
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('redis');
  return j.result;
}
const getJ = async (k) => { const v = await rd('GET', k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const sign = (s, d) => crypto.createHmac('sha256', s).update(d).digest('base64url');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function readSession(secret, tok) {
  const [p, s] = String(tok || '').split('.');
  if (!p || !s || !same(s, sign(secret, 'sess.' + p))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.x > Date.now() && d.e ? d : null; } catch (e) { return null; }
}
const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);
const https = (u) => (typeof u === 'string' && /^https:\/\//i.test(u) ? u.slice(0, 600) : '');
function cleanT(t) {
  if (!t || typeof t !== 'object' || t.loc) return null;
  const id = clip(t.id, 60); if (!id) return null;
  const o = { id, title: clip(t.title, 200) || 'Tanpa judul', artist: clip(t.artist, 100), img: https(t.img) };
  if (t.yt) { o.yt = 1; o.vid = clip(t.vid, 20); if (!/^[\w-]{11}$/.test(o.vid)) return null; }
  else { o.url = https(t.url); if (!o.url) return null; }
  return o;
}
const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => { let s = ''; for (let i = 0; i < 6; i++) s += A[crypto.randomInt(A.length)]; return s; };
const okCode = (c) => { c = String(c || '').toUpperCase(); return /^[A-HJ-NP-Z2-9]{6}$/.test(c) ? c : ''; };
const pubCo = (d) => ({ code: d.code, name: d.name, d: d.d, tr: d.tr });
const COTTL = 90 * 86400, JAMTTL = 6 * 3600;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metode tidak didukung' }); return; }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) { res.status(501).json({ error: 'AUTH_SECRET belum diatur' }); return; }
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } } b = b && typeof b === 'object' ? b : {};
  try {
    const s = readSession(secret, b.session);
    const u = s && (await getJ('user:' + s.e));
    if (!s || !u || (u.sv || 0) !== s.v) { res.status(401).json({ error: 'Sesi tidak valid' }); return; }
    const who = u.username || 'pengguna';
    const code = okCode(b.code);
    switch (b.action) {
      case 'co_create': {
        const tr = (Array.isArray(b.tracks) ? b.tracks : []).map(cleanT).filter(Boolean).slice(0, 200).map((t) => ({ ...t, by: who }));
        let c = newCode();
        while (await rd('EXISTS', 'collab:' + c)) c = newCode();
        const doc = { code: c, owner: s.e, name: clip(b.name, 60) || 'Playlist bersama', d: clip(b.d, 160), tr };
        await rd('SET', 'collab:' + c, JSON.stringify(doc), 'EX', COTTL);
        res.status(200).json(pubCo(doc)); return;
      }
      case 'co_sync': {
        const doc = code && (await getJ('collab:' + code));
        if (!doc) { res.status(404).json({ error: 'Playlist bersama tidak ditemukan' }); return; }
        const rm = new Set((Array.isArray(b.rm) ? b.rm : []).map((x) => String(x)).slice(0, 200));
        const add = (Array.isArray(b.add) ? b.add : []).map(cleanT).filter(Boolean).slice(0, 30);
        let tr = doc.tr.filter((t) => !rm.has(String(t.id)));
        const have = new Set(tr.map((t) => String(t.id)));
        add.forEach((t) => { if (!have.has(String(t.id)) && tr.length < 300) { have.add(String(t.id)); tr.push({ ...t, by: who }); } });
        if (tr.length !== doc.tr.length || add.length || rm.size) { doc.tr = tr; await rd('SET', 'collab:' + code, JSON.stringify(doc), 'EX', COTTL); }
        res.status(200).json(pubCo(doc)); return;
      }
      case 'jam_start': {
        const track = cleanT(b.track);
        if (!track) { res.status(400).json({ error: 'Putar lagu online dulu' }); return; }
        let c = newCode();
        while (await rd('EXISTS', 'jam:' + c)) c = newCode();
        await rd('SET', 'jam:' + c, JSON.stringify({ host: s.e, hn: who, track, pos: +b.pos || 0, playing: !!b.playing, ts: Date.now() }), 'EX', JAMTTL);
        res.status(200).json({ code: c }); return;
      }
      case 'jam_put': {
        const j = code && (await getJ('jam:' + code));
        if (!j) { res.status(404).json({ error: 'Jam sudah berakhir' }); return; }
        if (j.host !== s.e) { res.status(403).json({ error: 'Hanya host yang bisa mengubah' }); return; }
        const track = cleanT(b.track) || j.track;
        await rd('SET', 'jam:' + code, JSON.stringify({ ...j, track, pos: +b.pos || 0, playing: !!b.playing, ts: Date.now() }), 'EX', JAMTTL);
        res.status(200).json({ ok: 1 }); return;
      }
      case 'jam_get': {
        const j = code && (await getJ('jam:' + code));
        if (!j) { res.status(404).json({ error: 'Jam tidak ditemukan atau sudah berakhir' }); return; }
        res.status(200).json({ track: j.track, pos: j.pos, playing: j.playing, ts: j.ts, now: Date.now(), host: j.hn }); return;
      }
      case 'jam_end': {
        const j = code && (await getJ('jam:' + code));
        if (j && j.host === s.e) await rd('DEL', 'jam:' + code);
        res.status(200).json({ ok: 1 }); return;
      }
      default: res.status(400).json({ error: 'Aksi tidak dikenal' });
    }
  } catch (e) {
    res.status(502).json({ error: 'Layanan sedang bermasalah' });
  }
};
