/* Loopify v4.52 - Pembaruan aplikasi (khusus APK).
   - Memeriksa rilis APK terbaru (GitHub Releases) saat aplikasi dibuka / kembali ke depan (maks. tiap 30 menit),
     dan ada pemeriksaan berkala di latar belakang oleh sisi native yang memunculkan notifikasi.
   - Kalau ada versi baru: dialog "Perbarui" -> APK diunduh lalu dipasang lewat installer Android (bukan sekadar refresh halaman).
   - Baris "Pembaruan aplikasi" di Pengaturan > Lainnya untuk memeriksa manual.
   Tidak aktif di browser/PWA atau di APK lama yang belum punya fungsi native pembaruan.
   Dimuat SEBELUM extra57.js (pembungkus setR terakhir). */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||typeof N.checkUpdate!=='function'||typeof N.installUpdate!=='function')return;
  var KEY='x59',cur={code:0,name:''},info=null,checking=0,manual=0,working=0,last=0;
  try{var vv=String(N.appVersion()).split('|');cur.code=parseInt(vv[0],10)||0;cur.name=vv[1]||''}catch(e){}

  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function S(){var o=ls.get(KEY,{});return(o&&typeof o==='object')?o:{}}
  function $m(){return document.getElementById('x59m')}
  function close(){var m=$m();if(m&&m.parentNode)m.parentNode.removeChild(m)}
  function verLabel(){return cur.name||('build '+cur.code)}

  function modal(o){
    close();
    var m=document.createElement('div');m.id='x59m';m.className='x59m';
    var b=(o.btns||[]).map(function(x){return'<button type="button" class="btn'+(x[2]?'':' g')+'" onclick="'+x[1]+'">'+E(x[0])+'</button>'}).join('');
    m.innerHTML='<div class="x59c" role="dialog" aria-modal="true"><h3>'+E(o.title)+'</h3><p id="x59t">'+E(o.text||'')+'</p>'
      +(o.notes?'<div class="x59n">'+E(o.notes)+'</div>':'')
      +(o.bar?'<div class="x59p"><i id="x59i"></i></div>':'')
      +'<div class="x59b">'+b+'</div></div>';
    document.body.appendChild(m);
  }
  function ask(r){
    modal({title:'Pembaruan tersedia',
      text:'Versi '+r.name+' siap dipasang (sekarang '+verLabel()+').'+(r.size?' Ukuran sekitar '+Math.max(1,Math.round(r.size/1048576))+' MB.':''),
      notes:r.notes||'',btns:[['Nanti','x59Later()',0],['Perbarui','x59Go()',1]]});
  }
  function canPrompt(r){
    var sn=S().sn;
    if($m()||working)return false;
    return!(sn&&sn.c===r.code&&Date.now()-sn.t<12*3600*1000);
  }

  window.x59Close=function(){working=0;close()};
  window.x59Later=function(){var o=S();o.sn={c:info?info.code:0,t:Date.now()};ls.set(KEY,o);working=0;close()};
  window.x59Go=function(){
    if(working)return;
    working=1;
    modal({title:'Memperbarui Loopify',text:'Menyiapkan unduhan…',bar:1,btns:[]});
    try{N.installUpdate()}catch(e){window.x59Err('Fitur pembaruan tidak tersedia di aplikasi ini')}
  };
  window.x59Prog=function(p){
    var i=document.getElementById('x59i'),t=document.getElementById('x59t');
    if(i)i.style.width=p+'%';
    if(t)t.textContent='Mengunduh… '+p+'%';
  };
  window.x59Perm=function(){
    working=0;
    modal({title:'Izin diperlukan',
      text:'Di layar pengaturan yang terbuka, aktifkan "Izinkan dari sumber ini" untuk Loopify. Setelah itu kembali ke sini dan ketuk Perbarui lagi.',
      btns:[['Tutup','x59Close()',0],['Perbarui','x59Go()',1]]});
  };
  window.x59Inst=function(){
    var i=document.getElementById('x59i'),t=document.getElementById('x59t');
    if(i)i.style.width='100%';
    if(t)t.textContent='Unduhan selesai. Ketuk "Pasang" di layar sistem untuk melanjutkan.';
  };
  window.x59Err=function(m){
    working=0;
    modal({title:'Pembaruan gagal',text:m||'Terjadi kesalahan.',btns:[['Tutup','x59Close()',0],['Coba lagi','x59Go()',1]]});
  };

  function check(man){
    if(checking)return;
    checking=1;manual=!!man;refreshRow();
    try{N.checkUpdate()}catch(e){checking=0;manual=0;refreshRow();if(man)window.x59Err('Tidak bisa memeriksa pembaruan')}
  }
  window.x59Res=function(r){
    checking=0;var man=manual;manual=0;
    if(!r||r.error){
      info=null;refreshRow();
      if(man)modal({title:'Tidak bisa memeriksa',text:(r&&r.error)||'Coba lagi nanti.',btns:[['Tutup','x59Close()',1]]});
      return;
    }
    info=r;refreshRow();
    if(r.newer){if(man||canPrompt(r))ask(r)}
    else if(man)modal({title:'Sudah versi terbaru',text:'Kamu memakai versi terbaru ('+(r.curName||verLabel())+').',btns:[['OK','x59Close()',1]]});
  };

  /* ---------- baris di Pengaturan > Lainnya ---------- */
  function rowHtml(){
    var t=checking?'Memeriksa…':(info&&info.newer?'Versi baru tersedia: '+E(info.name)+' · ketuk untuk memperbarui':'Versi '+E(verLabel())+' · ketuk untuk memeriksa');
    return'<span>⬆</span><div>Pembaruan aplikasi<br><small>'+t+'</small></div>';
  }
  function refreshRow(){var d=document.querySelector('[data-x59]');if(d)d.innerHTML=rowHtml()}
  window.x59Row=function(){if(info&&info.newer)ask(info);else check(1)};
  function addRow(){
    var sp=document.getElementById('sp');if(!sp||sp.querySelector('[data-x59]'))return;
    var rows=sp.querySelectorAll('.ft'),ref=null,i;
    for(i=0;i<rows.length;i++){if((rows[i].getAttribute('onclick')||'').indexOf('goBk(')===0){ref=rows[i];break}}
    if(!ref)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-x59','1');d.setAttribute('onclick','x59Row()');d.innerHTML=rowHtml();
    ref.parentNode.insertBefore(d,ref);
  }
  var _s=window.setR;
  if(typeof _s==='function')window.setR=function(){var r=_s.apply(this,arguments);try{addRow()}catch(e){}return r};

  /* ---------- pemeriksaan otomatis ---------- */
  function auto(){var t=Date.now();if(checking||t-last<30*60*1000)return;last=t;check(0)}
  setTimeout(auto,5000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)auto()});
})();
