// MusicAPI proxy for YouTube Music. Keep credentials on the server.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function send(res, code, body) { res.status(code).json(body); }
module.exports = async (req, res) => {
  const u = new URL(req.url, 'https://local.invalid');
  const action = u.searchParams.get('action') || '';
  const id = u.searchParams.get('uuid') || '';
  const clientId = String(process.env.MUSICAPI_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.MUSICAPI_CLIENT_SECRET || '').trim();
  const slug = String(process.env.MUSICAPI_SLUG || 'you').trim();
  if (!clientId || !clientSecret) return send(res, 501, { error: 'MUSICAPI_CLIENT_ID dan MUSICAPI_CLIENT_SECRET belum diatur di Vercel.' });
  if (action === 'auth') {
    const origin = (req.headers.origin || (req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host || '').replace(/\/$/, '');
    const returnUrl = origin + '/?musicapi_callback=1';
    const authUrl = 'https://app.musicapi.com/' + encodeURIComponent(slug) + '/youtube/auth?returnUrl=' + encodeURIComponent(returnUrl);
    res.setHeader('Cache-Control', 'no-store');
    return send(res, 200, { authUrl, returnUrl });
  }
  if (!['profile', 'playlists', 'liked'].includes(action)) return send(res, 400, { error: 'Action tidak dikenal.' });
  if (!UUID_RE.test(id)) return send(res, 400, { error: 'UUID koneksi tidak valid.' });
  const route = action === 'profile' ? 'users/profile' : action === 'playlists' ? 'playlists' : 'liked/tracks';
  const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  try {
    const upstream = await fetch('https://api.musicapi.com/api/' + id + '/' + route, {
      method: 'GET', headers: { Authorization: 'Basic ' + auth, Accept: 'application/json' }
    });
    const raw = await upstream.text();
    let data; try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { raw: raw.slice(0, 500) }; }
    res.setHeader('Cache-Control', 'no-store');
    if (!upstream.ok) return send(res, upstream.status, { error: (data && (data.message || data.error)) || 'MusicAPI mengembalikan HTTP ' + upstream.status, detail: data });
    return send(res, 200, data);
  } catch (e) {
    return send(res, 502, { error: 'Tidak dapat menghubungi MusicAPI.' });
  }
};
