#!/usr/bin/env node
/* Loopify - gabungkan file sumber menjadi satu CSS dan satu JS (31 permintaan jaringan jadi 2).
   Pakai:  node build.js   (tanpa instalasi apa pun), lalu commit loopify.css dan loopify.js.
   Urutan di bawah = urutan muat lama di index.html. Untuk fitur baru: buat file extraNN.js/css, tambahkan ke daftar ini. */
const fs = require('fs');

const CSS = ['style.css', 'web.css', 'extra9.css', 'extra10.css', 'extra15.css', 'extra16.css', 'extra17.css',
  'extra18.css', 'extra19.css', 'extra21.css', 'extra22.css', 'extra24.css', 'extra25.css', 'extra26.css', 'a11y.css'];

const JS = ['dialog.js', 'app.js', 'extra.js', 'extra2.js', 'extra3.js', 'extra4.js', 'extra5.js', 'extra6.js', 'extra7.js',
  'extra8.js', 'extra9.js', 'extra10.js', 'extra14.js', 'extra15.js', 'extra16.js', 'extra17.js', 'extra18.js', 'extra19.js',
  'extra20.js', 'extra21.js', 'extra22.js', 'extra23.js', 'extra24.js', 'extra25.js', 'extra26.js', 'extra27.js', 'extra28.js',
  'extra29.js', 'extra30.js', 'extra31.js', 'extra32.js', 'extra33.js', 'extra34.js', 'extra35.js', 'extra36.js', 'extra37.js', 'extra38.js', 'extra39.js', 'extra40.js', 'extra41.js', 'web.js', 'a11y.js'];

// app.js memakai deklarasi global (const/let/function) yang dipakai file lain, jadi tidak dibungkus.
// File lain berupa IIFE: dibungkus try/catch supaya satu file yang error tidak menghentikan file sesudahnya.
const RAW = new Set(['app.js']);

const css = CSS.map((f) => `/* ==== ${f} ==== */\n${fs.readFileSync(f, 'utf8').trim()}\n`).join('\n');
fs.writeFileSync('loopify.css', css);

const js = JS.map((f) => {
  const s = fs.readFileSync(f, 'utf8').trim();
  return RAW.has(f)
    ? `/* ==== ${f} ==== */\n${s}\n;`
    : `/* ==== ${f} ==== */\ntry{\n${s}\n}catch(e){console.error('[loopify] ${f}',e)}`;
}).join('\n\n');
fs.writeFileSync('loopify.js', js);

// Nama cache service worker = versi + hash isi cangkang. Tiap kali bundle/index/manifest berubah, SW dianggap baru,
// jadi pengguna otomatis mendapat toast "Versi baru tersedia" (tidak perlu mengubah angka di sw.js manual).
const crypto = require('crypto');
const h = crypto.createHash('sha1');
['loopify.css', 'loopify.js', 'index.html', 'manifest.json'].forEach((f) => h.update(fs.readFileSync(f)));
const ver = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const tag = `ma-v${ver}-${h.digest('hex').slice(0, 8)}`;
const sw = fs.readFileSync('sw.js', 'utf8');
const sw2 = sw.replace(/^const C = '[^']*';/m, `const C = '${tag}';`);
if (sw2 !== sw) fs.writeFileSync('sw.js', sw2);

console.log(`SW cache ${tag}\nloopify.css ${css.length} byte, loopify.js ${js.length} byte`);
