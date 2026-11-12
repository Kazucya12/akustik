/* Loopify v3.7 - Lirik berjalan di notifikasi pemutar + notifikasi sistem untuk pengingat waktu dengar.
   Dimuat setelah extra7.js. Notifikasi pemutar (layar kunci/bayangan notifikasi) digambar oleh sistem HP,
   jadi tampilannya mengikuti HP; yang bisa kita atur hanya isinya (judul, artis, cover, dan baris lirik). */
(function(){
  'use strict';
  function on(){return cfg.lyn!==0}

  /* ---------- Notifikasi sistem (hanya saat aplikasi tidak sedang dibuka) ---------- */
  function sysNotify(title,body,tag){
    try{
      if(!('Notification' in window)||Notification.permission!=='granted'||!navigator.serviceWorker)return;
      navigator.serviceWorker.ready.then(function(r){
        r.showNotification(title,{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag||'loopify',renotify:true,silent:false});
      }).catch(function(){});
    }catch(e){}
  }
  function askPerm(){
    try{
      if(!('Notification' in window)||Notification.permission!=='default')return;
      Notification.requestPermission().then(function(p){if(p==='granted')toast('Notifikasi diaktifkan')}).catch(function(){});
    }catch(e){}
  }
  var _toast=toast;
  toast=function(m,img){
    _toast(m,img);
    if(document.hidden&&/^Kamu sudah mendengarkan/.test(String(m)))sysNotify('Loopify',m,'loopify-rem');
  };
  /* minta izin saat pengingat dinyalakan */
  if(typeof cfgSet==='function'){
    var _cs=cfgSet;
    cfgSet=function(k,v){_cs(k,v);if(k==='rem'&&Number(v)>0)askPerm()};
  }

  /* ---------- Lirik di notifikasi pemutar ---------- */
  var lastI=-2,lastId='';
  function setMeta(line){
    if(!('mediaSession' in navigator)||!cur||typeof MediaMetadata==='undefined')return;
    try{
      var m=navigator.mediaSession.metadata,art=m&&m.artwork&&m.artwork.length?m.artwork:[{src:'icon-512.png',sizes:'512x512',type:'image/png'}];
      navigator.mediaSession.metadata=new MediaMetadata(line
        ?{title:cur.title,artist:'♪ '+line,album:cur.artist||'Loopify',artwork:art}
        :{title:cur.title,artist:cur.artist,album:'Loopify',artwork:art});
    }catch(e){}
  }
  function lyricNow(a){
    if(!on()||!cur||a!==act||cur.radio)return;
    var al=alOf(cur);
    if(!al||!al.length){
      if(lastI!==-2){lastI=-2;setMeta('')}
      return;
    }
    var ct=a.currentTime+.25,i=-1;
    for(var k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}
    if(i===lastI&&cur.id===lastId)return;
    lastI=i;lastId=cur.id;
    setMeta(i>=0?al[i].s:'');
  }
  var _sync=syncLy;
  syncLy=function(a){_sync(a);try{lyricNow(a)}catch(e){}};

  /* ganti lagu: muat lirik otomatis supaya notifikasi bisa menampilkannya */
  var _ms=ms;
  ms=function(){
    _ms();
    lastI=-2;lastId='';
    try{if(on()&&cur&&!cur.radio&&typeof fetchLy==='function')fetchLy(cur)}catch(e){}
  };
})();
