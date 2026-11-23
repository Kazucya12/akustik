/* Loopify v4.49 - Pengaturan "Hindari notifikasi lain" (APK): izin Akses notifikasi untuk NotifGuard.java.
   Dengan izin ini pil lirik mengambang minggir beberapa detik saat ada notifikasi pop-up dari aplikasi lain, supaya tidak saling menimpa.
   Baris ini hanya tampil di APK baru dan saat "Lirik mengambang" menyala. Loopify hanya mendeteksi ada notifikasi masuk, isinya tidak dibaca. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||!N.ng||!N.ngOn||typeof setR!=='function')return;
  function st(){var on=false;try{on=!!N.ngOn()}catch(e){}return on}
  function sub(on){
    return on?'Aktif: pil lirik minggir saat ada notifikasi masuk. Ketuk untuk mengubah izin'
      :'Izinkan akses notifikasi supaya pil lirik tidak menimpa notifikasi masuk (isi notifikasi tidak dibaca). Ketuk untuk mengaktifkan';
  }
  window.x56Ng=function(){try{N.ng()}catch(e){}};
  var _s=setR;
  setR=function(){
    _s.apply(this,arguments);
    try{
      var sp=document.getElementById('sp');
      if(!sp||sp.querySelector('.x56row')||!cfg.ovl)return;
      var html='<div class="x56row"><div class="ft" onclick="x56Ng()"><span>🔔</span><div>Hindari notifikasi lain<br><small>'+sub(st())+'</small></div></div></div>';
      var tgt=null;
      sp.querySelectorAll('.sec h3').forEach(function(h){if(h.textContent==='Lainnya')tgt=h.parentNode});
      if(tgt)tgt.insertAdjacentHTML('beforebegin',html);else sp.insertAdjacentHTML('beforeend',html);
    }catch(e){}
  };
  /* kembali dari halaman izin Android: perbarui teks status tanpa menggambar ulang pengaturan */
  window.addEventListener('focus',function(){
    try{var s=document.querySelector('.x56row small');if(s)s.textContent=sub(st())}catch(e){}
  });
})();
