/* Loopify v4.48 - Tombol cepat di notifikasi APK: Suka (favorit) dan Ulangi.
   Notifikasi digambar Android; di sini hanya mengirim status (lagu difavoritkan? mode ulang 0/1/2) lewat LoopifyNative.q().
   Ketukan tombolnya dijalankan native lewat fav() dan perubahan rep di app.js. Di browser biasa atau APK lama (tanpa q) tidak berbuat apa-apa. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||!N.q)return;
  var last='';
  function push(){
    try{
      var l=!!(cur&&typeof isF==='function'&&isF(cur)),r=typeof rep==='number'?rep:0,k=l+':'+r;
      if(k===last)return;
      last=k;N.q(l,r);
    }catch(e){}
  }
  /* rp() dipanggil setelah suka / ulang berubah */
  try{var _rp=rp;rp=function(){var x=_rp.apply(this,arguments);push();return x}}catch(e){}
  setInterval(push,1500);
  push();
})();
