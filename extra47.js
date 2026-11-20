
/* Loopify v4.47 - Download Offline */
(function () {
  'use strict';

  if (window.__loopifyOffline47) return;
  window.__loopifyOffline47 = true;

  var pending = Object.create(null);
  var feedbackTimer = null;

  function say(message) {
    try {
      if (typeof toast === 'function') { toast(message); return; }
      var node = document.getElementById('offline47-toast');
      if (!node) {
        node = document.createElement('div');
        node.id = 'offline47-toast';
        node.style.cssText = 'position:fixed;z-index:99999;left:16px;right:16px;bottom:92px;padding:12px 15px;border-radius:14px;background:#211a2d;color:#fff;font:500 13px/1.45 system-ui,sans-serif;text-align:center;opacity:0;transition:opacity .18s';
        document.body.appendChild(node);
      }
      node.textContent = message;
      node.style.opacity = '1';
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(function () {
        node.style.opacity = '0';
      }, 2600);
    } catch (_) {}
  }

  function validUrl(value) {
    try {
      var u = new URL(value, location.href);
      return u.protocol === 'https:' && !!u.hostname;
    } catch (_) { return false; }
  }

  function findSaved(id) {
    return songs.some(function (song) {
      return song && song.id === id;
    });
  }

  window.dlOff = async function (track) {
    if (!track) return;

    if (track.yt) {
      say('Lagu YouTube tidak bisa disimpan offline');
      return;
    }

    if (track.loc) {
      say('Lagu sudah tersedia di perangkat');
      return;
    }

    if (track.radio) {
      say('Siaran radio langsung tidak bisa disimpan offline');
      return;
    }

    if (track.dl === 0) {
      say('Artis tidak mengizinkan unduhan lagu ini');
      return;
    }

    if (!validUrl(track.url)) {
      say('Alamat audio tidak valid');
      return;
    }

    if (navigator.onLine === false) {
      say('Hubungkan internet untuk mengunduh lagu');
      return;
    }

    var id = 'o' + track.id;

    if (findSaved(id)) {
      say('Lagu sudah tersimpan offline');
      return;
    }

    if (pending[id]) {
      say('Lagu sedang diunduh');
      return;
    }

    pending[id] = true;
    say('Mengunduh ' + (track.title || 'lagu') + '...');

    try {
      var existing = await tx('readonly', function (store) {
        return store.get(id);
      });

      if (existing) {
        if (!findSaved(id)) songs.push(existing);
        say('Lagu sudah tersimpan offline');
        return;
      }

      var response = await fetch(track.url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error('HTTP_' + response.status);
      }

      var blob = await response.blob();

      if (!blob || !blob.size) {
        throw new Error('EMPTY_AUDIO');
      }

      var type = String(
        blob.type ||
        response.headers.get('content-type') ||
        ''
      ).toLowerCase();

      if (/text\/html|application\/json/.test(type)) {
        throw new Error('NOT_AUDIO');
      }

      var saved = {
        id: id,
        loc: 1,
        off: 1,
        blob: blob,
        title: String(track.title || 'Lagu offline'),
        artist: String(track.artist || 'Tidak diketahui'),
        h: typeof hh === 'function' ? hh(track.title || '') : 220,
        added: Date.now()
      };

      if (track.img) saved.img = track.img;

      await tx('readwrite', function (store) {
        return store.put(saved);
      });

      if (!findSaved(id)) songs.push(saved);

      try {
        if (navigator.storage && navigator.storage.persist) {
          await navigator.storage.persist();
        }
      } catch (_) {}

      say('Berhasil disimpan untuk diputar offline');

      if (pg === 'library' || pg === 'home') {
        go(pg);
      }

      if (typeof window.x41Refresh === 'function') {
        window.x41Refresh();
      }

      try {
        var v = document.getElementById('v');
        if (v && typeof window.goOff41 === 'function' && /Unduhan Offline/.test(v.textContent || '') && !v.querySelector('[data-x41]')) {
          window.goOff41();
        }
      } catch (_) {}

    } catch (error) {
      var message = 'Gagal mengunduh lagu';

      if (error.message === 'NOT_AUDIO') {
        message = 'Server tidak mengirim file audio yang valid';
      } else if (error.message === 'EMPTY_AUDIO') {
        message = 'File audio kosong';
      } else if (/^HTTP_/.test(error.message || '')) {
        message = 'Server menolak unduhan';
      } else if (error instanceof TypeError) {
        message = 'Unduhan diblokir CORS atau jaringan';
      }

      say(message);

    } finally {
      delete pending[id];
    }
  };

  window.dlc = function () {
    if (!cur) return;

    if (cur.yt) {
      say('Lagu YouTube tidak bisa disimpan offline');
      return;
    }

    if (cur.loc) {
      say(cur.off
        ? 'Lagu sudah tersedia secara offline'
        : 'Lagu lokal sudah ada di perangkat');
      return;
    }

    window.dlOff(cur);
  };

  window.x41Refresh = function () {
    try {
      var badge = document.querySelector('[data-x41] small');
      if (badge) {
        badge.textContent =
          songs.filter(function (s) {
            return s && s.off;
          }).length + ' lagu';
      }
    } catch (_) {}
  };

})();
