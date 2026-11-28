/* Loopify - pemantau kesehatan layanan hidup (bukan uji unit). Memanggil situs yang SUDAH di-deploy.
   Jalankan:  node test/health.js            (BASE bawaan: https://loopify1.vercel.app)
              BASE=https://situsmu.vercel.app HEALTH_SPOTIFY_URL=<link playlist publik> node test/health.js
   Keluar dengan kode 1 kalau ada yang rusak, supaya GitHub Actions menandai gagal dan mengirim email. */
const BASE = (process.env.BASE || 'https://loopify1.vercel.app').replace(/\/$/, '');
// Pakai playlist publik buatan pengguna biasa bila ada; playlist editorial Spotify bisa berubah isi/aksesnya.
const SPOTIFY = process.env.HEALTH_SPOTIFY_URL || 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(path, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 25000);
      const r = await fetch(BASE + path, { signal: c.signal, headers: { 'User-Agent': 'Loopify-Health' } });
      clearTimeout(t);
      const text = await r.text();
      let json = null; try { json = JSON.parse(text); } catch (e) {}
      if (r.status === 429 || r.status >= 500) { last = { r, text, json }; await sleep(3000 * (i + 1)); continue; }
      return { r, text, json };
    } catch (e) { last = { err: e }; await sleep(2000 * (i + 1)); }
  }
  return last;
}

const checks = [
  ['Situs utama terbuka', async () => {
    const x = await get('/');
    if (!x.r || !x.r.ok) throw new Error('HTTP ' + (x.r && x.r.status));
    if (!/loopify\.js/.test(x.text)) throw new Error('index.html tidak memuat loopify.js');
  }],
  ['Service worker tersedia', async () => {
    const x = await get('/sw.js');
    if (!x.r || !x.r.ok || !/const C = 'ma-v/.test(x.text)) throw new Error('sw.js hilang atau nama cache tidak terisi (build.js tidak jalan?)');
  }],
  ['Pencarian YouTube (/api/yt-music)', async () => {
    const x = await get('/api/yt-music?q=' + encodeURIComponent('tulus hati hati di jalan') + '&songs=1');
    if (!x.r) throw new Error('tidak ada respons');
    if (x.r.status === 429 && x.json && x.json.code === 'quota') throw new Error('KUOTA YouTube API habis (scrape cadangan juga gagal)');
    if (x.r.status === 501) throw new Error('YOUTUBE_API_KEY belum diatur');
    if (!x.r.ok) throw new Error('HTTP ' + x.r.status + ' ' + String((x.json && x.json.error) || '').slice(0, 120));
    if (!Array.isArray(x.json) || !x.json.length || !x.json[0].id) throw new Error('hasil kosong atau format berubah');
  }],
  ['Impor Spotify (/api/import)', async () => {
    const x = await get('/api/import?url=' + encodeURIComponent(SPOTIFY));
    if (!x.r) throw new Error('tidak ada respons');
    if (!x.r.ok) throw new Error('HTTP ' + x.r.status + ': ' + String((x.json && x.json.error) || '').slice(0, 160));
    if (!x.json || !Array.isArray(x.json.tracks) || x.json.tracks.length < 5) throw new Error('daftar lagu kosong/format halaman embed Spotify berubah');
    if (!x.json.tracks[0].title) throw new Error('judul lagu tidak terbaca (format embed Spotify berubah)');
  }],
];

(async () => {
  let bad = 0;
  console.log('Memeriksa ' + BASE);
  for (const [name, fn] of checks) {
    try { await fn(); console.log('OK     ' + name); }
    catch (e) { bad++; console.log('GAGAL  ' + name + ' -> ' + (e && e.message)); }
  }
  console.log(bad ? '\n' + bad + ' pemeriksaan gagal' : '\nSemua layanan sehat');
  process.exit(bad ? 1 : 0);
})();
