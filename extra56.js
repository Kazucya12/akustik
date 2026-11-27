/* Loopify v4.49 / v4.51 - Pengaturan "Izin notifikasi" (APK).
   v4.51: SATU tombol untuk semua izin terkait notifikasi. Sebelumnya tiap fitur membuka halaman izinnya sendiri-sendiri
   (notifikasi, layar kunci penuh, tampil di atas aplikasi, akses notifikasi), jadi pengguna harus mengurusnya satu per satu.
   Sekarang ketuk baris ini sekali: Loopify membuka halaman izin yang masih kurang secara berurutan (MainActivity.permStart),
   pengguna cukup menyalakan lalu tekan Kembali. Izin yang sudah aktif dilewati dan tidak ditanyakan lagi.
   Akses notifikasi dipakai NotifGuard.java hanya untuk mendeteksi ada notifikasi masuk (pil lirik minggir); isinya tidak dibaca.
   APK lama (tanpa LoopifyNative.pa/pm) tetap memakai perilaku v4.49: baris "Hindari notifikasi lain" saat Lirik mengambang menyala. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  var NEW=!!(N&&N.pa&&N.pm);
  if(!N||typeof setR!=='function')return;
  if(!NEW&&!(N.ng&&N.ngOn))return;
  var NM=['Notifikasi','Layar kunci penuh','Tampil di atas aplikasi','Akses notifikasi'];
  function miss(){var m=0;try{m=N.pm()|0}catch(e){}return m}
  function sub(){
    if(!NEW){
      var on=false;try{on=!!N.ngOn()}catch(e){}
      return on?'Aktif: pil lirik minggir saat ada notifikasi masuk. Ketuk untuk mengubah izin'
        :'Izinkan akses notifikasi supaya pil lirik tidak menimpa notifikasi masuk (isi notifikasi tidak dibaca). Ketuk untuk mengaktifkan';
    }
    var m=miss();
    if(!m)return 'Semua izin sudah aktif. Ketuk untuk memeriksa lagi';
    var a=[];for(var i=0;i<4;i++)if(m&(1<<i))a.push(NM[i]);
    return 'Belum diizinkan: '+a.join(', ')+'. Ketuk sekali untuk mengizinkan semua, berurutan';
  }
  window.x56Ng=function(){try{if(NEW)N.pa();else N.ng()}catch(e){}};
  /* dipanggil native saat alur izin selesai, dan saat jendela kembali fokus */
  window.x56up=function(){try{var s=document.querySelector('.x56row small');if(s)s.textContent=sub()}catch(e){}};
  var _s=setR;
  setR=function(){
    _s.apply(this,arguments);
    try{
      var sp=document.getElementById('sp');
      if(!sp||sp.querySelector('.x56row'))return;
      if(!NEW&&!cfg.ovl)return;
      var html='<div class="x56row"><div class="ft" onclick="x56Ng()"><span>🔔</span><div>'+(NEW?'Izin notifikasi':'Hindari notifikasi lain')+'<br><small>'+sub()+'</small></div></div></div>';
      var tgt=null;
      sp.querySelectorAll('.sec h3').forEach(function(h){if(h.textContent==='Lainnya')tgt=h.parentNode});
      if(tgt)tgt.insertAdjacentHTML('beforebegin',html);else sp.insertAdjacentHTML('beforeend',html);
    }catch(e){}
  };
  /* kembali dari halaman izin Android: perbarui teks status tanpa menggambar ulang pengaturan */
  window.addEventListener('focus',function(){window.x56up()});
})();
