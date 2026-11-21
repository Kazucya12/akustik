/* Loopify v4.45 - Progres lagu di notifikasi APK (menit berjalan, durasi, dan geser untuk melompat).
   Notifikasi digambar oleh Android; di sini hanya mengirim posisi dan durasi lewat jembatan LoopifyNative.pos().
   Android menghitung sendiri detik berjalan, jadi dikirim saat lagu ganti, play/pause, geser, atau posisi melompat.
   Di browser biasa atau APK lama (tanpa pos) file ini tidak berbuat apa-apa. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||!N.pos)return;
  var lastD=-1;

  function push(){
    try{
      if(!cur||typeof act==='undefined'||!act)return;
      var d=act.duration,p=act.currentTime;
      if(cur.radio||!isFinite(d)||d<=0){
        if(lastD!==0){lastD=0;N.pos(0,0)}
        return;
      }
      lastD=d;
      N.pos(p||0,d);
    }catch(e){}
  }

  /* peristiwa pemutar lokal (A dan B dipakai bergantian untuk crossfade) */
  try{
    [A,B].forEach(function(a){
      ['play','pause','seeked','loadedmetadata','durationchange'].forEach(function(ev){
        a.addEventListener(ev,function(){setTimeout(push,60)});
      });
    });
  }catch(e){}

  /* ganti lagu */
  try{
    var _ms=ms;
    ms=function(){_ms();setTimeout(push,400)};
  }catch(e){}

  /* cadangan untuk pemutar YouTube dan koreksi drift (APK mengabaikan bila selisih kecil) */
  setInterval(push,2000);
})();
