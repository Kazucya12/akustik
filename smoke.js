/* Uji asap (smoke test): muat loopify.js di jsdom, pastikan tidak ada error, menu tampil, Liquid Glass bisa dinyalakan,
   dan rekomendasi suasana mengembalikan lagu. Jalankan: npm test   (butuh: npm i, lalu node build.js dulu) */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'loopify.js'), 'utf8').replace(/<\/script>/g, '<\\/script>');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="loopify.js"><\/script>/, '<script>' + bundle + '</script>');

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push((e.detail && e.detail.message) || e.message));

const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.HTMLMediaElement.prototype.play = () => Promise.resolve();
    w.HTMLMediaElement.prototype.pause = () => {};
    w.fetch = (u) => {
      u = String(u);
      if (u.includes('/api/yt-music')) {
        const q = decodeURIComponent(u.split('q=')[1].split('&')[0]);
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([1, 2, 3].map((i) => ({ id: 'v' + i + q.length + q[0], title: q + ' #' + i, artist: 'Artis ' + i }))) });
      }
      return Promise.reject(new Error('offline (uji)'));
    };
  },
});

let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };

(async () => {
  await new Promise((r) => setTimeout(r, 800));
  const w = dom.window;
  ok(errs.length === 0, 'tidak ada error saat memuat' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  ok(w.document.querySelectorAll('#nav button').length >= 4, 'menu navigasi tampil');
  w.eval('cfg.lg44=1;applyCfg()');
  ok(w.document.documentElement.classList.contains('lg44'), 'Liquid Glass bisa dinyalakan');
  w.eval("go('profile')");
  ok(w.document.getElementById('v').innerHTML.length > 500, 'halaman Profil dirender');
  for (const k of ['mood:relaxed', 'mood:sad', 'activity:study', 'time:night']) {
    await w.eval("recSel='" + k + "';delete recC['" + k + "'];recFetch('" + k + "',0)");
    const n = w.eval("(recC['" + k + "']||[]).length");
    ok(n > 0 && w.eval("recC['" + k + "'][0].yt") === 1, 'rekomendasi ' + k + ' berisi lagu (' + n + ')');
  }
  console.log(fail ? '\n' + fail + ' pengujian gagal' : '\nSemua pengujian lolos');
  process.exit(fail ? 1 : 0);
})();
