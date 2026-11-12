// /api/auth  (POST, JSON) - daftar, login, lupa password. Data di Upstash Redis (REST), email lewat SMTP Gmail.
//  register_start  { username, email, password }  -> kirim kode ke Gmail
//  register_verify { email, code }                -> buat akun, balas sesi
//  login           { id, password }               -> id = username atau email
//  reset_start     { email }                      -> kirim kode (selalu balas ok)
//  reset_verify    { email, code, password }      -> ganti password, balas sesi
//  me              { session }                    -> cek sesi
// Env: GMAIL_USER, GMAIL_APP_PASSWORD, AUTH_SECRET, dan Redis:
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)
const crypto = require('crypto');

const OTP_TTL = 600;                 // detik
const SESSION_TTL = 30 * 24 * 3600;  // detik
const COOLDOWN = 45;                 // detik, jeda kirim kode per email
const MAX_SEND_HOUR = 5;
const MAX_OTP_TRY = 5;
const MAX_LOGIN_FAIL = 8;            // per 15 menit per akun

/* ---------- Redis (Upstash REST, tanpa library) ---------- */
const PREFIX = 'ma:'; // awalan kunci supaya aman dipakai bersama aplikasi lain di database yang sama
async function rd(...cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !tok) { const e = new Error('nodb'); e.nodb = 1; throw e; }
  const c = cmd.map(String); c[1] = PREFIX + c[1]; // semua perintah di sini memakai kunci di argumen ke-2
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('redis: ' + (j.error || r.status));
  return j.result;
}
const getJ = async (k) => { const v = await rd('GET', k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const setJ = (k, v, ex) => (ex ? rd('SET', k, JSON.stringify(v), 'EX', ex) : rd('SET', k, JSON.stringify(v)));
async function bump(k, ex) { const n = await rd('INCR', k); if (n === 1) await rd('EXPIRE', k, ex); return n; }

/* ---------- util ---------- */
const b64 = (b) => Buffer.from(b).toString('base64url');
const sign = (s, d) => crypto.createHmac('sha256', s).update(d).digest('base64url');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const scrypt = (pw, salt) => new Promise((ok, no) => crypto.scrypt(pw, salt, 32, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? no(e) : ok(k.toString('hex')))));
async function hashPw(pw) { const salt = crypto.randomBytes(16).toString('hex'); return { s: salt, h: await scrypt(pw, salt) }; }
async function checkPw(pw, u) { return same(await scrypt(pw, u.s), u.h); }
const DUMMY = { s: '00'.repeat(16), h: '00'.repeat(32) };

const cleanEmail = (v) => { const e = String(v || '').trim().toLowerCase(); return e.length <= 80 && /^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(e) ? e : ''; };
const cleanUser = (v) => { const u = String(v || '').trim().toLowerCase(); return /^[a-z0-9_.]{3,20}$/.test(u) ? u : ''; };
const okPw = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 100;
const body = (req) => { let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } } return b && typeof b === 'object' ? b : {}; };

function makeSession(secret, u) {
  const p = b64(JSON.stringify({ e: u.email, n: u.username, v: u.sv || 0, x: Date.now() + SESSION_TTL * 1000 }));
  return { session: p + '.' + sign(secret, 'sess.' + p), exp: Date.now() + SESSION_TTL * 1000 };
}
function readSession(secret, tok) {
  const [p, s] = String(tok || '').split('.');
  if (!p || !s || !same(s, sign(secret, 'sess.' + p))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.x > Date.now() && d.e ? d : null; } catch (e) { return null; }
}
const pub = (u, s) => ({ session: s.session, exp: s.exp, email: u.email, username: u.username });

async function sendMail(to, code, why) {
  const user = process.env.GMAIL_USER, pass = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  const nodemailer = require('nodemailer');
  const tr = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } });
  const label = why === 'reset' ? 'reset password' : 'verifikasi pendaftaran';
  await tr.sendMail({
    from: '"Loopify" <' + user + '>', to,
    subject: 'Kode ' + label + ' Loopify: ' + code,
    text: 'Kode ' + label + ' kamu: ' + code + '\n\nBerlaku 10 menit. Jangan bagikan kode ini. Abaikan email ini jika bukan kamu.',
    html: '<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;background:#0b0f3a;color:#e9ecff;border-radius:16px"><h2 style="margin:0 0 8px">Loopify</h2><p style="margin:0 0 16px;color:#9aa3e6">Kode ' + label + ' kamu:</p><div style="font-size:34px;letter-spacing:8px;font-weight:700;background:#161b5c;border-radius:12px;padding:14px;text-align:center">' + code + '</div><p style="margin:16px 0 0;color:#9aa3e6;font-size:12px">Berlaku 10 menit. Jangan bagikan kode ini. Abaikan email ini jika bukan kamu.</p></div>',
  });
}

/* kirim kode: batasi laju, simpan hash kode + data tertunda di Redis */
async function issueCode(secret, email, why, extra) {
  const last = await rd('GET', 'cd:' + email);
  if (last) { const e = new Error('Tunggu sebentar sebelum kirim ulang kode'); e.st = 429; throw e; }
  if ((await bump('sh:' + email, 3600)) > MAX_SEND_HOUR) { const e = new Error('Terlalu banyak permintaan kode, coba lagi nanti'); e.st = 429; throw e; }
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  try { await sendMail(email, code, why); }
  catch (x) { const e = new Error(x && (x.code === 'EAUTH' || x.responseCode === 535) ? 'Login Gmail pengirim ditolak. Cek GMAIL_USER dan App Password di Vercel' : 'Gagal mengirim email, coba lagi'); e.st = 502; throw e; }
  await setJ('otp:' + why + ':' + email, { c: sign(secret, 'otp.' + email + '.' + code), n: 0, d: extra || null }, OTP_TTL);
  await rd('SET', 'cd:' + email, '1', 'EX', COOLDOWN);
  return COOLDOWN;
}
/* cek kode; kembalikan data tertunda atau lempar error */
async function takeCode(secret, email, why, code) {
  const k = 'otp:' + why + ':' + email, o = await getJ(k);
  if (!o) { const e = new Error('Kode kedaluwarsa. Minta kode baru'); e.st = 400; throw e; }
  if (o.n >= MAX_OTP_TRY) { await rd('DEL', k); const e = new Error('Terlalu banyak salah. Minta kode baru'); e.st = 429; throw e; }
  if (!same(o.c, sign(secret, 'otp.' + email + '.' + code))) {
    o.n++; const ttl = await rd('TTL', k); await setJ(k, o, ttl > 0 ? ttl : OTP_TTL);
    const e = new Error('Kode salah'); e.st = 400; throw e;
  }
  await rd('DEL', k);
  return o.d;
}
const fail = (st, msg) => { const e = new Error(msg); e.st = st; return e; };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'Metode tidak didukung' }); return; }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) { res.status(501).json({ error: 'AUTH_SECRET belum diatur di Vercel' }); return; }
  const b = body(req);
  try {
    switch (b.action) {
      case 'me': {
        const d = readSession(secret, b.session);
        if (!d) throw fail(401, 'Sesi tidak valid');
        const u = await getJ('user:' + d.e);
        if (!u || (u.sv || 0) !== d.v) throw fail(401, 'Sesi tidak valid');
        res.status(200).json({ email: u.email, username: u.username, exp: d.x }); return;
      }
      case 'register_start': {
        const username = cleanUser(b.username), email = cleanEmail(b.email);
        if (!username) throw fail(400, 'Username 3-20 karakter: huruf kecil, angka, titik, atau _');
        if (!email) throw fail(400, 'Pakai alamat Gmail yang valid (@gmail.com)');
        if (!okPw(b.password)) throw fail(400, 'Password minimal 8 karakter');
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw fail(501, 'GMAIL_USER / GMAIL_APP_PASSWORD belum diatur di Vercel');
        if (await rd('EXISTS', 'user:' + email)) throw fail(409, 'Email ini sudah terdaftar. Silakan masuk');
        if (await rd('EXISTS', 'uname:' + username)) throw fail(409, 'Username sudah dipakai');
        const pw = await hashPw(b.password);
        const cd = await issueCode(secret, email, 'reg', { username, s: pw.s, h: pw.h });
        res.status(200).json({ ok: 1, cooldown: cd }); return;
      }
      case 'register_verify': {
        const email = cleanEmail(b.email), code = String(b.code || '').replace(/\D/g, '');
        if (!email || code.length !== 6) throw fail(400, 'Masukkan kode 6 digit');
        const d = await takeCode(secret, email, 'reg', code);
        // klaim username dan email secara atomik (SET NX)
        if (await rd('SET', 'uname:' + d.username, email, 'NX') !== 'OK') throw fail(409, 'Username sudah dipakai, daftar ulang dengan username lain');
        const u = { email, username: d.username, s: d.s, h: d.h, sv: 0, created: Date.now() };
        if (await rd('SET', 'user:' + email, JSON.stringify(u), 'NX') !== 'OK') { await rd('DEL', 'uname:' + d.username); throw fail(409, 'Email ini sudah terdaftar. Silakan masuk'); }
        res.status(200).json(pub(u, makeSession(secret, u))); return;
      }
      case 'login': {
        const id = String(b.id || '').trim().toLowerCase(), pw = String(b.password || '');
        if (!id || !pw || id.length > 80 || pw.length > 100) throw fail(400, 'Isi username/email dan password');
        const email = id.includes('@') ? id : await rd('GET', 'uname:' + id);
        const fk = 'lf:' + (email || id);
        if (Number(await rd('GET', fk)) >= MAX_LOGIN_FAIL) throw fail(429, 'Terlalu banyak percobaan. Coba lagi 15 menit lagi');
        const u = email ? await getJ('user:' + email) : null;
        const ok = await checkPw(pw, u || DUMMY);
        if (!u || !ok) { await bump(fk, 900); throw fail(401, 'Username/email atau password salah'); }
        await rd('DEL', fk);
        res.status(200).json(pub(u, makeSession(secret, u))); return;
      }
      case 'reset_start': {
        const email = cleanEmail(b.email);
        if (!email) throw fail(400, 'Pakai alamat Gmail yang valid (@gmail.com)');
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw fail(501, 'GMAIL_USER / GMAIL_APP_PASSWORD belum diatur di Vercel');
        let cd = COOLDOWN;
        if (await rd('EXISTS', 'user:' + email)) cd = await issueCode(secret, email, 'reset');
        res.status(200).json({ ok: 1, cooldown: cd }); return; // balasan sama walau email tidak terdaftar
      }
      case 'reset_verify': {
        const email = cleanEmail(b.email), code = String(b.code || '').replace(/\D/g, '');
        if (!email || code.length !== 6) throw fail(400, 'Masukkan kode 6 digit');
        if (!okPw(b.password)) throw fail(400, 'Password minimal 8 karakter');
        await takeCode(secret, email, 'reset', code);
        const u = await getJ('user:' + email);
        if (!u) throw fail(400, 'Kode kedaluwarsa. Minta kode baru');
        const pw = await hashPw(b.password);
        u.s = pw.s; u.h = pw.h; u.sv = (u.sv || 0) + 1; // sesi lama jadi tidak berlaku
        await rd('SET', 'user:' + email, JSON.stringify(u));
        await rd('DEL', 'lf:' + email);
        res.status(200).json(pub(u, makeSession(secret, u))); return;
      }
      default: throw fail(400, 'Aksi tidak dikenal');
    }
  } catch (e) {
    if (e.nodb) { res.status(501).json({ error: 'Database belum diatur di Vercel (Upstash Redis)' }); return; }
    if (e.st) { res.status(e.st).json({ error: e.message }); return; }
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
