/* Loopify v4.43 - Lirik layar kunci penuh (khusus APK).
   Tampilan lirik besar di atas layar kunci (jam, 5 baris lirik berjalan, kartu pemutar, "Geser ke atas untuk membuka").
   Layar itu digambar oleh aplikasi Android (LockActivity); bagian ini hanya mengirim baris lirik dan posisinya ke sana,
   serta menyambungkan saklar Pengaturan > "Lirik layar kunci penuh". Di browser biasa file ini tidak berbuat apa-apa. */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||!N.lyS||!N.lyI||!N.lk)return; /* bukan APK, atau APK lama tanpa jembatan baru */

  var lastKey='',lastI=-2;
  function push(a){
    if(!cur||cur.radio||a!==act){return}
    var al=null;try{al=alOf(cur)}catch(e){}
    var key=cur.id+':'+(al?al.length:0);
    if(key!==lastKey){
      lastKey=key;lastI=-2;
      N.lyS(key,al?al.map(function(x){return String(x.s||'\u266a').replace(/\s+/g,' ').trim()||'\u266a'}).join('\n'):'');
    }
    if(!al||!al.length)return;
    var ct=a.currentTime+.25,i=-1;
    for(var k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}
    if(i!==lastI){lastI=i;N.lyI(i)}
  }
  var _s=syncLy;
  syncLy=function(a){_s(a);try{push(a)}catch(e){}};

  /* saklar di Pengaturan: nyalakan -> minta izin layar penuh bila Android 14+ memerlukannya */
  var _t=cfgTg;
  cfgTg=function(k){_t(k);if(k==='lkf'){try{N.lk(!!cfg.lkf,true)}catch(e){}}if(k==='lyn'){try{if(N.ln)N.ln(cfg.lyn!==false)}catch(e){}}if(k==='ovl'){try{if(N.ov)N.ov(!!cfg.ovl,true)}catch(e){}}};
  try{N.lk(!!cfg.lkf,false)}catch(e){}
  /* baris lirik di notifikasi dan kontrol layar kunci mengikuti saklar "Lirik di notifikasi" (APK baru saja; APK lama tanpa ln mengabaikan) */
  try{if(N.ln)N.ln(cfg.lyn!==false)}catch(e){}
  /* Lirik mengambang di atas game/aplikasi lain (FloatLyric.java); butuh izin "Tampil di atas aplikasi lain" */
  try{if(N.ov)N.ov(!!cfg.ovl,false)}catch(e){}
})();
