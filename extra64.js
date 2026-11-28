/* Loopify v4.54 - Penjelasan singkat SEBELUM Android meminta izin (khusus APK).
   Tiap penjelasan muncul sekali saja per jenis izin (disimpan di ls 'pw64'); menekan Batal tidak meminta izin apa pun.
   Dimuat SESUDAH extra38 / extra52 / extra56 karena membungkus fungsi mereka. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||typeof uiConfirm!=='function')return;

  var TXT={
    audio:['Izin membaca musik','Loopify perlu membaca file audio di HP ini untuk menemukan lagu yang sudah kamu simpan. File hanya dibaca di perangkat dan tidak diunggah ke mana pun.'],
    notif:['Beberapa izin notifikasi','Android akan meminta izin satu per satu: notifikasi (kontrol pemutar dan lirik), akses notifikasi (supaya pil lirik tidak menimpa notifikasi masuk; isi notifikasi tidak dibaca), dan layar penuh saat HP terkunci. Menolak satu izin hanya mematikan fitur yang terkait.'],
    ovl:['Tampil di atas aplikasi lain','Lirik mengambang butuh izin ini agar pil lirik kecil bisa muncul di atas game dan aplikasi lain. Layarmu tidak direkam.'],
    lkf:['Layar kunci lirik penuh','Android 14+ meminta izin menampilkan layar penuh saat HP terkunci. Dipakai hanya untuk menampilkan lirik dan kontrol pemutar.']
  };

  function seen(k){var o=ls.get('pw64',{});return !!(o&&o[k])}
  function mark(k){var o=ls.get('pw64',{});if(!o||typeof o!=='object')o={};o[k]=1;ls.set('pw64',o)}

  /* tampilkan penjelasan sekali; lanjut hanya kalau pengguna menekan Lanjut */
  function ask(k,go){
    if(seen(k)){go();return}
    uiConfirm(TXT[k][1],{title:TXT[k][0],ok:'Lanjut',cancel:'Batal',icon:'🔒'}).then(function(y){
      if(y){mark(k);go()}
    }).catch(function(){go()});
  }

  /* 1) Pindai musik: hanya kalau izin audio belum ada */
  var _scan=window.x38Scan;
  if(typeof _scan==='function'){
    window.x38Scan=function(){
      var has=false;try{has=N.hasAudio()}catch(e){}
      if(has){_scan();return}
      ask('audio',function(){_scan()});
    };
  }

  /* 2) Izin notifikasi (satu alur berurutan di Pengaturan) */
  var _ng=window.x56Ng;
  if(typeof _ng==='function'){
    window.x56Ng=function(){ask('notif',function(){_ng()})};
  }

  /* 3) Saklar Pengaturan yang memicu izin sistem: hanya saat dinyalakan, bukan dimatikan */
  if(typeof cfgTg==='function'){
    var _t=cfgTg;
    cfgTg=function(k){
      if((k==='ovl'||k==='lkf')&&!(typeof cfg!=='undefined'&&cfg[k])&&!seen(k)){
        ask(k,function(){_t(k)});
        return;
      }
      return _t(k);
    };
  }
})();
