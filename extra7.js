/* Loopify Patch — Rekomendasi Adaptif Suasana, Filter Chip, Pencarian Khusus Musik, & Opsi Lihat Video */
(function () {
  'use strict';

  var HIDE_CHIPS = ['video', 'pilih', 'radio', 'pop', 'rock', 'indie', 'jazz', 'edm'];

  // 1. Sembunyikan chip Video, Pilih, Radio, Pop, Rock, Indie, Jazz, EDM
  function hideUnwantedChips(root) {
    var scope = root || document;
    var chips = scope.querySelectorAll('.chip, button');
    for (var i = 0; i < chips.length; i++) {
      var el = chips[i];
      if (el.closest('#pl') || el.closest('#vo')) continue;
      var txt = (el.textContent || '').replace(/[^\w\s]/g, '').trim().toLowerCase();
      if (HIDE_CHIPS.indexOf(txt) !== -1) {
        el.style.setProperty('display', 'none', 'important');
        // Sembunyikan juga wadah .chips jika seluruh isinya adalah genre yang disembunyikan
        var parent = el.parentElement;
        if (parent && parent.classList.contains('chips')) {
          var visible = Array.prototype.filter.call(parent.children, function (c) {
            return c.style.display !== 'none';
          });
          if (!visible.length) parent.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  // 2. Deteksi otomatis suasana lagu yang sedang diputar / terakhir diputar
  function detectCurrentMood() {
    var t = (typeof cur !== 'undefined' && cur) || (typeof hist !== 'undefined' && hist[0]) || null;
    if (!t) {
      var hr = new Date().getHours();
      if (hr >= 5 && hr < 11) return { type: 'time', value: 'morning', label: 'Pagi Cerah' };
      if (hr >= 11 && hr < 16) return { type: 'time', value: 'afternoon', label: 'Siang Santai' };
      if (hr >= 16 && hr < 21) return { type: 'time', value: 'evening', label: 'Senja & Sore' };
      return { type: 'time', value: 'night', label: 'Malam Tenang' };
    }
    var text = ((t.title || '') + ' ' + (t.artist || '')).toLowerCase();
    var bpm = Number(t.bpm || 0);

    if (/galau|sad|sedih|hurt|cry|alone|broken|ballad|slow|piano|rain|hujan|rindu|kecewa/.test(text) || (bpm > 0 && bpm < 82)) {
      return { type: 'mood', value: 'sad', label: 'Melankolis & Syahdu' };
    }
    if (/dj|remix|party|club|edm|bass|jedag|jedug|dance|disco|house|funk/.test(text) || bpm >= 122) {
      return { type: 'mood', value: 'danceable', label: 'Upbeat & Dance' };
    }
    if (/rock|metal|punk|workout|gym|energi| semangat|fast/.test(text) || (bpm >= 108 && bpm < 122)) {
      return { type: 'mood', value: 'energetic', label: 'Penuh Energi' };
    }
    if (/chill|lofi|lo-fi|akustik|acoustic|santai|relax|sleep|tidur|senja|kopi/.test(text)) {
      return { type: 'mood', value: 'relaxed', label: 'Santai & Akustik' };
    }
    return { type: 'mood', value: 'happy', label: 'Ceria & Hangat' };
  }

  // Sinkronkan pilihan suasana rekomendasi dengan lagu yang sedang diputar
  var lastSyncId = '';
  function syncMoodRecommendation() {
    var t = typeof cur !== 'undefined' ? cur : null;
    var key = t ? String(t.id || t.title) : 'init';
    if (key === lastSyncId) return;
    lastSyncId = key;

    var m = detectCurrentMood();
    if (typeof window.recPick === 'function') {
      try {
        window.recPick(m.type, m.value);
      } catch (e) {}
    } else if (typeof window.loadRec === 'function') {
      try {
        window.loadRec(m.type, m.value, true);
      } catch (e) {}
    }
  }

  // 3. Pastikan pencarian online hanya mencari musik (bukan video/radio)
  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('/api/music') !== -1) {
        var u = new URL(url, location.origin);
        var src = u.searchParams.get('src');
        if (src === 'radio' || src === 'video') {
          u.searchParams.set('src', 'all');
          u.searchParams.delete('tag');
          u.searchParams.delete('cc');
          input = u.pathname + u.search;
        }
      }
    } catch (e) {}
    return origFetch.call(this, input, init);
  };

  // Pantau perubahan DOM & pemutaran lagu
  var obs = new MutationObserver(function () {
    hideUnwantedChips(document);
  });

  function init() {
    hideUnwantedChips(document);
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    if (typeof A !== 'undefined') A.addEventListener('play', syncMoodRecommendation);
    if (typeof B !== 'undefined') B.addEventListener('play', syncMoodRecommendation);
    setTimeout(syncMoodRecommendation, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
