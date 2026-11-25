/* v4.44: (1) perintah dari APK: bagikan/buka tautan, pintasan ikon, Android Auto / Bluetooth / asisten suara,
   (2) sinkron Favorit + Terakhir diputar ke layar mobil, (3) "Tanpa jeda antar lagu" (gapless, eksperimental).
   Dimuat setelah extra58.js. Di peramban biasa (tanpa APK) bagian 1 dan 2 diam saja. */
(function () {
  var NT = function () { return window.LoopifyNative || null; };

  /* ---------- 1. Perintah masuk ---------- */
  function firstUrl(t) { var m = /https?:\/\/[^\s<>"']+/i.exec(t); return m ? m[0] : ''; }

  /* Teks/tautan -> {t:'video',id} | {t:'list',url} | {t:'search',q} | null */
  function parse(text) {
    text = String(text || '').trim().slice(0, 2000);
    var u = firstUrl(text), x = null;
    if (u) {
      try { x = new URL(u); } catch (e) { x = null; }
      if (x) {
        var h = x.hostname.toLowerCase().replace(/^(www|m|music)\./, ''), id = '', m;
        if (h === 'youtu.be') id = x.pathname.slice(1).split('/')[0];
        else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
          if (x.pathname === '/watch') id = x.searchParams.get('v') || '';
          else if ((m = /^\/(shorts|live|embed|v)\/([\w-]{11})/.exec(x.pathname))) id = m[2];
        }
        if (/^[\w-]{11}$/.test(id)) return { t: 'video', id: id };
        var li = h === 'youtube.com' ? x.searchParams.get('list') : '';
        if (li && /^[\w-]{10,60}$/.test(li) && x.pathname === '/playlist') return { t: 'list', url: 'https://www.youtube.com/playlist?list=' + li };
        if (h === 'open.spotify.com' && /^\/(intl-[a-z]+\/)?(playlist|album)\//.test(x.pathname)) return { t: 'list', url: u };
      }
      text = text.split(u).join(' ');
    }
    text = text.replace(/\s+/g, ' ').trim();
    return text ? { t: 'search', q: text.slice(0, 100) } : null;
  }
  window.lpParse60 = parse;

  function favList() { try { return favs.map(function (t) { return t && t.loc ? rs(t) : t; }).filter(Boolean); } catch (e) { return []; } }
  function histList() { try { return hist.map(function (t) { return t && t.loc ? rs(t) : t; }).filter(Boolean); } catch (e) { return []; } }

  function playList(arr, i) {
    if (!arr.length || !arr[i]) return false;
    try { lists.x60 = arr.slice(); P('x60', i); return true; } catch (e) { return false; }
  }
  function shuffleFav() {
    var a = favList();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    if (!playList(a, 0)) { try { go('explore'); } catch (e) {} }
  }
  function openSearch(q) {
    try { go('explore'); } catch (e) {}
    setTimeout(function () {
      var i = document.getElementById('qi'); if (!i) return;
      if (q) { i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }
      try { i.focus(); } catch (e) {}
    }, 350);
  }
  function playQuery(q) {
    if (!q) { shuffleFav(); return; }
    Promise.resolve().then(function () { return ytSearch(q, '', 1); }).then(function (r) {
      if (r && r.length) { lists.x60 = r.slice(0, 20); P('x60', 0); } else openSearch(q);
    }).catch(function () { openSearch(q); });
  }
  function openShared(text) {
    var p = parse(text); if (!p) return;
    if (p.t === 'video') { try { vAdd(p.id); } catch (e) { openSearch(''); } }
    else if (p.t === 'list') {
      try { impOpen(); setTimeout(function () { var i = document.getElementById('iu'); if (i) i.value = p.url; }, 250); } catch (e) {}
    } else openSearch(p.q);
  }
  function run(k, a) {
    a = String(a || '');
    if (k === 'share' || k === 'view') return openShared(a);
    if (k === 'shortcut') {
      if (a === 'shuffle') return shuffleFav();
      if (a === 'resume') { try { if (ls.get('last', null)) { resume(); return; } } catch (e) {} return shuffleFav(); }
      if (a === 'search') return openSearch('');
      return;
    }
    if (k === 'search') return playQuery(a.slice(0, 100));
    if (k === 'auto') {
      if (a === 'cmd:resume') { try { if (ls.get('last', null)) { resume(); return; } } catch (e) {} return shuffleFav(); }
      if (a === 'cmd:shuffle') return shuffleFav();
      var m = /^(fav|hist):(\d{1,3})$/.exec(a);
      if (m) playList(m[1] === 'fav' ? favList() : histList(), +m[2]);
    }
  }
  window.loopifyPoll = function () {
    var N = NT(); if (!N || typeof N.takeCmd === 'undefined') return;
    var raw = ''; try { raw = N.takeCmd(); } catch (e) {}
    if (!raw) return;
    var c; try { c = JSON.parse(raw); } catch (e) { return; }
    if (c && c.k) { try { run(String(c.k), c.a); } catch (e) {} }
  };
  [1200, 3500, 8000].forEach(function (ms) { setTimeout(window.loopifyPoll, ms); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) window.loopifyPoll(); });

  /* ---------- 2. Perpustakaan untuk layar mobil ---------- */
  var lastLib = '';
  function pack(a) { return a.slice(0, 100).map(function (t) { return { t: String(t.title || '').slice(0, 80), a: String(t.artist || '').slice(0, 60) }; }); }
  setInterval(function () {
    var N = NT(); if (!N || typeof N.setLibrary === 'undefined') return;
    try {
      var s = JSON.stringify({ fav: pack(favList()), hist: pack(histList()) });
      if (s !== lastLib) { lastLib = s; N.setLibrary(s); }
    } catch (e) {}
  }, 4000);

  /* ---------- 3. Tanpa jeda antar lagu ---------- */
  var GL = { lat: 0.25, t0: 0, ghost: null, ghostT: 0, forCur: null, pick: null, pre: null, preUrl: '' };
  function killGhost() {
    clearInterval(GL.ghostT);
    if (GL.ghost) { try { GL.ghost.pause(); GL.ghost.removeAttribute('src'); GL.ghost.load(); } catch (e) {} GL.ghost = null; }
  }
  function peek() {
    if (GL.pick && GL.pick.of === cur) return GL.pick;
    var ni = shuf ? Math.floor(Math.random() * q.length) : qi + 1;
    if (!shuf && ni >= q.length) { if (rep === 1) ni = 0; else return null; }
    var n = q[ni];
    if (!n || n.yt || n.radio || (n.rec && !n.url) || (!n.loc && !n.url)) return null;
    return (GL.pick = { n: n, i: ni, of: cur });
  }
  function preload(p) {
    if (p.n.loc || !p.n.url || GL.preUrl === p.n.url) return;
    GL.preUrl = p.n.url;
    try { GL.pre = new Audio(); GL.pre.preload = 'auto'; GL.pre.volume = 0; GL.pre.src = p.n.url; } catch (e) {}
  }
  function startGapless(p) {
    GL.forCur = cur;
    var o = act, g = new Audio(), v0 = o.volume || 1, lead = GL.lat + 0.1;
    killGhost();
    try { g.src = o.currentSrc || o.src; g.currentTime = o.currentTime; g.volume = v0; g.playbackRate = o.playbackRate || 1; g.play().catch(function () {}); } catch (e) {}
    GL.ghost = g;
    GL.t0 = performance.now();
    play(q, p.i);
    var t0 = Date.now();
    GL.ghostT = setInterval(function () {
      var f = (Date.now() - t0) / (lead * 1000 + 250);
      if (f >= 1 || GL.ghost !== g) { killGhost(); return; }
      try { g.volume = Math.max(0, v0 * (1 - f)); } catch (e) {}
    }, 30);
  }
  [A, B].forEach(function (a) {
    a.addEventListener('playing', function () {
      if (!GL.t0) return;
      var m = (performance.now() - GL.t0) / 1000; GL.t0 = 0;
      if (m > 0 && m < 3) GL.lat = Math.min(0.8, Math.max(0.12, GL.lat * 0.7 + m * 0.3));
    });
  });
  setInterval(function () {
    try {
      if (!cfg.gl || (+cfg.cf || 0) > 0) return;       /* crossfade menang kalau dinyalakan */
      var a = act;
      if (!a || !cur || a.paused || cur.yt || cur.radio || (cur.rec && !cur.url) || q.length < 2 || rep === 2 || slEnd === -1) return;
      if (ab && (ab.a != null || ab.b != null)) return;
      var d = a.duration; if (!isFinite(d) || d < 8) return;
      var r = d - a.currentTime, lead = GL.lat + 0.1;
      if (GL.forCur === cur) return;
      if (r < 20 && r > lead + 1) { var p0 = peek(); if (p0) preload(p0); }
      if (r <= lead && r > 0.03) { var p = peek(); if (p) startGapless(p); }
    } catch (e) {}
  }, 50);
})();
