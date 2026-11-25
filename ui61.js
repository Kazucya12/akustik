/* Uji v4.45: toast tampil, aman dari HTML, tidak dobel; CSS landscape + breakpoint tablet ada di bundel. */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'loopify.js'), 'utf8').replace(/<\/script>/g, '<\\/script>');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="loopify.js"><\/script>/, '<script>' + bundle + '</script>');
const css = fs.readFileSync(path.join(root, 'loopify.css'), 'utf8');
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', (e) => errs.push((e.detail && e.detail.message) || e.message));
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) { w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} }); w.HTMLCanvasElement.prototype.getContext = () => null;
    w.HTMLMediaElement.prototype.play = () => Promise.resolve(); w.HTMLMediaElement.prototype.pause = () => {}; w.fetch = () => Promise.reject(new Error('offline')); } });
let fail = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'GAGAL') + ' ' + m); if (!c) fail++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  await sleep(600);
  const w = dom.window, d = w.document;
  ok(errs.length === 0, 'tidak ada error saat memuat' + (errs.length ? ': ' + errs[0] : ''));
  w.eval("toast('Berhenti dalam 30 menit')");               // dipanggil seperti kode lama: nama polos, bukan window.toast
  let t = d.getElementById('tst61');
  ok(t && t.textContent === 'Berhenti dalam 30 menit' && t.classList.contains('on'), 'toast() lama kini tampil (pemanggilan nama polos)');
  ok(t.getAttribute('role') === 'status' && t.getAttribute('aria-live') === 'polite', 'toast terbaca pembaca layar (role=status)');
  w.eval("toast('<img src=x onerror=alert(1)>')");
  t = d.getElementById('tst61');
  ok(!t.querySelector('img') && t.textContent.indexOf('<img') === 0, 'isi pesan diperlakukan sebagai teks, bukan HTML');
  w.eval("toast('A');toast('A');"); ok(d.querySelectorAll('#tst61').length === 1, 'hanya satu elemen toast, pesan sama beruntun tidak dobel');
  w.eval("toast('   ')"); ok(t.textContent === 'A', 'pesan kosong diabaikan');
  w.eval("toast(null);toast(undefined);toast(12345)"); ok(t.textContent === '12345', 'nilai non-teks tidak membuat error');
  await sleep(2400);
  ok(!t.classList.contains('on'), 'toast pendek hilang sendiri (~2,2 dtk)');
  w.eval("toast('" + 'x'.repeat(300) + "')"); ok(t.textContent.length === 140, 'pesan sangat panjang dipotong 140 karakter');
  /* CSS */
  ok(/orientation:landscape\)\s*and\s*\(max-height:520px\)/.test(css) && css.includes('#pl.ov:has(>.disc)'), 'CSS landscape HP + pemutar dua kolom ada di bundel');
  ok(/@media \(min-width:768px\) and \(min-height:521px\)\{[^]*?--sw:248px/.test(css), 'layout sidebar mulai 768px (tablet), tidak di HP landscape');
  ok(!/@media \(min-width:900px\)\{:root\{--sw/.test(css), 'tidak tersisa breakpoint 900px lama untuk sidebar');
  ok(errs.length === 0, 'tidak ada error selama pengujian' + (errs.length ? ': ' + errs[0] : ''));
  console.log(fail ? '\n' + fail + ' pengujian gagal' : '\nSemua pengujian lolos'); process.exit(fail ? 1 : 0);
})();
