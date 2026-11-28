/* Loopify v4.66 - (1) skeleton loading di Trending menggantikan teks "Memuat…", (2) onboarding jadi satu layar (3 slide jadi 1).
   Pasangan extra66.css. Dimuat setelah extra65.js (yang mengganti emoji .obe dengan logo). Untuk membatalkan: hapus 'extra66.js' dari daftar JS di build.js. */
(function(){
  'use strict';

  /* ---------- 1. Skeleton loading ---------- */
  try{
    var oTr=window.trCards;
    if(typeof oTr==='function'){
      window.trCards=function(){
        var h=oTr.apply(this,arguments);
        if(typeof h==='string'&&h.indexOf('Memuat')>-1){
          var s='',i;
          for(i=0;i<4;i++)s+='<div class="cd x66sk" aria-hidden="true"><i></i><b></b><small></small></div>';
          return s;
        }
        return h;
      };
    }
  }catch(e){}

  /* ---------- 2. Onboarding satu layar ---------- */
  function obOne(){
    var e=document.querySelector('#ob');
    if(!e)return;
    e.innerHTML='<div class="obc"><div class="obe">🎧</div><h2>Loopify</h2>'+
      '<p>Musik dan video gratis, tanpa iklan. Bisa dibuka offline.</p>'+
      '<input class="in" id="obn" placeholder="Nama kamu (boleh dikosongkan)" maxlength="30" style="margin-bottom:18px;text-align:center">'+
      '<button class="btn" onclick="obNext()">Mulai</button><a id="obs" onclick="obEnd()">Lewati</a></div>';
  }
  try{
    if(typeof window.obR==='function'&&typeof window.obNext==='function'){
      window.obR=obOne;
      window.obNext=function(){
        var i=document.getElementById('obn'),n=i&&i.value;
        if(n&&n.trim()){cfg.name=n.trim().slice(0,30);ls.set('cfg',cfg)}
        obEnd();
      };
      /* app.js sudah menggambar slide pertama sebelum file ini dimuat: gambar ulang. */
      obOne();
    }
  }catch(e){}
})();
