/* Loopify v4.53 - Pembaruan aplikasi (khusus APK).
   - Memeriksa rilis APK terbaru (GitHub Releases) saat aplikasi dibuka / kembali ke depan (maks. tiap 30 menit),
     dan ada pemeriksaan berkala di latar belakang oleh sisi native yang memunculkan notifikasi.
   - Kalau ada versi baru: dialog "Perbarui" -> APK diunduh lalu dipasang lewat installer Android (bukan sekadar refresh halaman).
   - Baris "Pembaruan aplikasi" di Pengaturan > Lainnya untuk memeriksa manual.
   v4.53: tampilan lebih jelas (versi lama -> baru, ukuran, catatan rilis berpoin, langkah Siapkan/Unduh/Pasang,
     progres MB, petunjuk izin bernomor, lencana status di baris Pengaturan) dan animasi halus saat dialog
     dibuka, ditutup, dan berganti isi (memeriksa -> hasil). Mode hemat / "kurangi gerakan" mematikan animasi.
   v4.53 juga: pembaruan isi aplikasi (service worker) yang dulu muncul sebagai banner "Versi baru tersedia" di atas layar
     sekarang masuk ke fitur ini (dialog + lencana BARU di Pengaturan), dan ikut diperiksa saat cek manual.
   Di APK yang membundel situs (N.bundled()), pembaruan isi lewat service worker dimatikan: semuanya lewat pembaruan APK.
   Tidak aktif di browser/PWA atau di APK lama yang belum punya fungsi native pembaruan.
   Dimuat SEBELUM extra57.js (pembungkus setR terakhir). */
(function(){
  'use strict';
  var N=window.LoopifyNative;
  if(!N||typeof N.checkUpdate!=='function'||typeof N.installUpdate!=='function')return;
  var KEY='x59',cur={code:0,name:''},info=null,checking=0,manual=0,working=0,last=0,at=0;
  var pct=0,ph=0,dis='x59Close',closing=0,closeT=0,swapT=0,web=null,webAsked=0,wman=0;
  try{var vv=String(N.appVersion()).split('|');cur.code=parseInt(vv[0],10)||0;cur.name=vv[1]||''}catch(e){}
  /* APK baru membundel isi situs: semua perubahan (tampilan + fitur) hanya datang lewat pembaruan APK, tanpa muat ulang halaman */
  var bundled=false;
  try{bundled=typeof N.bundled==='function'&&!!N.bundled()}catch(e){}

  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function S(){var o=ls.get(KEY,{});return(o&&typeof o==='object')?o:{}}
  function $m(){return document.getElementById('x59m')}
  function verLabel(){return cur.name||('build '+cur.code)}
  function still(){
    try{if(document.documentElement.classList.contains('eco'))return true}catch(e){}
    try{return!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
    return false;
  }
  function mb(b){var v=b/1048576;return(v<10?v.toFixed(1).replace('.',','):String(Math.round(v)))+' MB'}
  function clock(t){
    try{return new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}catch(e){return''}
  }

  /* ---------- ikon ---------- */
  function svg(p,c){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="'+(c||'')+'" aria-hidden="true">'+p+'</svg>'}
  var IC={
    up:svg('<path d="M12 19V6M6 12l6-6 6 6"/>','x59up'),
    down:svg('<path d="M12 5v11M7 12l5 5 5-5M5 20h14"/>','x59dn'),
    ok:svg('<path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/>','x59ck'),
    err:svg('<path d="M12 7v6M12 16.5v.01"/><circle cx="12" cy="12" r="9"/>','x59er'),
    lock:svg('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',''),
    spin:'<i class="x59sp x59big"></i>'
  };

  /* ---------- isi dialog ---------- */
  function notesHtml(t){
    var L=String(t||'').replace(/\r/g,'').split('\n'),out=[],i,s,hd;
    for(i=0;i<L.length&&out.length<8;i++){
      s=L[i].trim();if(!s)continue;
      hd=/^#/.test(s);
      s=s.replace(/^#+\s*/,'').replace(/^([-*+\u2022]|\d+[.)])\s+/,'').replace(/\*\*|__|`/g,'').trim();
      if(!s)continue;
      out.push('<li'+(hd?' class="h"':'')+'>'+E(s)+'</li>');
    }
    return out.length?'<div class="x59n"><div class="x59nh">Yang baru</div><ul>'+out.join('')+'</ul></div>':'';
  }
  function listHtml(a){
    return'<ol class="x59l">'+a.map(function(x){return'<li>'+E(x)+'</li>'}).join('')+'</ol>';
  }
  function stepsHtml(){
    var n=['Siapkan','Unduh','Pasang'],i,c,h='';
    for(i=0;i<3;i++){c=i<ph?'d':(i===ph?'a':'');h+='<span class="'+c+'">'+n[i]+'</span>'}
    return'<div class="x59z" id="x59z">'+h+'</div>';
  }
  function progText(){
    if(ph>=2)return'Unduhan selesai dan sudah diperiksa';
    if(ph===0)return'Menyiapkan unduhan…';
    if(pct>=99)return'Memeriksa berkas…';
    if(info&&info.size)return'Mengunduh '+mb(info.size*pct/100)+' dari '+mb(info.size);
    return'Mengunduh…';
  }
  function barHtml(){
    return'<div class="x59pr"><span id="x59t">'+E(progText())+'</span><b id="x59pc">'+(ph>=1?pct+'%':'')+'</b></div>'
      +'<div class="x59p"><i id="x59i" class="'+(ph===0?'ind':'')+'" style="width:'+(ph>=1?pct:0)+'%"></i></div>';
  }
  function body(o){
    var h='<div class="x59ic'+(o.tone?' '+o.tone:'')+'">'+(IC[o.icon]||IC.up)+'</div><h3>'+E(o.title)+'</h3>';
    if(o.bar)h+=stepsHtml();
    if(o.text)h+='<p>'+E(o.text)+'</p>';
    if(o.vers){
      h+='<div class="x59v"><div><small>Sekarang</small><b>'+E(o.vers.from)+'</b></div>'
        +svg('<path d="M5 12h14M13 6l6 6-6 6"/>','x59ar')
        +'<div class="nw"><small>Terbaru</small><b>'+E(o.vers.to)+'</b></div></div>'
        +(o.vers.size?'<div class="x59sz">Ukuran unduhan sekitar '+mb(o.vers.size)+'</div>':'');
    }
    if(o.chip)h+='<div class="x59ch">'+E(o.chip)+'</div>';
    if(o.list)h+=listHtml(o.list);
    if(o.notes)h+=notesHtml(o.notes);
    if(o.bar)h+=barHtml();
    if(o.btns&&o.btns.length){
      h+='<div class="x59b">'+o.btns.map(function(x){return'<button type="button" class="btn'+(x[2]?'':' g')+'" onclick="'+x[1]+'">'+E(x[0])+'</button>'}).join('')+'</div>';
    }
    if(o.hint)h+='<div class="x59h">'+E(o.hint)+'</div>';
    return h;
  }

  /* ---------- buka / ganti isi / tutup dengan animasi ---------- */
  function modal(o){
    clearTimeout(closeT);
    var m=$m();
    if(m&&closing){if(m.parentNode)m.parentNode.removeChild(m);m=null;closing=0}
    dis=o.dismiss||'x59Close';
    if(!m){
      m=document.createElement('div');m.id='x59m';m.className='x59m';
      m.setAttribute('onclick','x59Bk(event)');
      m.innerHTML='<div class="x59c" role="dialog" aria-modal="true" aria-live="polite"><div class="x59w" id="x59w">'+body(o)+'</div></div>';
      document.body.appendChild(m);
      void m.offsetWidth;
      requestAnimationFrame(function(){var x=$m();if(x&&!closing)x.classList.add('in')});
      return;
    }
    swap(o);
  }
  function swap(o){
    var w=document.getElementById('x59w');if(!w)return;
    clearTimeout(swapT);
    if(still()){w.style.height='';w.innerHTML=body(o);return}
    var h0=w.offsetHeight;
    w.style.height=h0+'px';w.style.overflow='hidden';
    w.classList.add('sw');
    swapT=setTimeout(function(){
      var x=document.getElementById('x59w');if(!x)return;
      x.innerHTML=body(o);
      x.style.height='auto';var h1=x.offsetHeight;
      x.style.height=h0+'px';void x.offsetHeight;
      x.style.height=h1+'px';
      x.classList.remove('sw');
      swapT=setTimeout(function(){var y=document.getElementById('x59w');if(y){y.style.height='';y.style.overflow=''}},360);
    },150);
  }
  function close(){
    var m=$m();if(!m||closing)return;
    clearTimeout(swapT);clearTimeout(closeT);
    if(still()){if(m.parentNode)m.parentNode.removeChild(m);return}
    closing=1;m.classList.remove('in');m.classList.add('out');
    closeT=setTimeout(function(){var x=$m();if(x&&x.parentNode)x.parentNode.removeChild(x);closing=0},300);
  }

  /* ---------- keadaan dialog ---------- */
  function ask(r){
    modal({icon:'up',title:'Pembaruan tersedia',
      text:bundled?'Semua perubahan tampilan dan fitur datang lewat pembaruan ini. Aplikasi mengunduh versi baru, lalu Android meminta kamu mengetuk Pasang.':'Aplikasi akan mengunduh versi baru, lalu Android meminta kamu mengetuk Pasang.',
      vers:{from:verLabel(),to:r.name,size:r.size},notes:r.notes||'',
      btns:[['Nanti','x59Later()',0],['Perbarui sekarang','x59Go()',1]],
      hint:'Pilih Nanti: pengingat muncul lagi dalam 12 jam.',dismiss:'x59Later'});
  }
  function checkingModal(){
    modal({icon:'spin',title:'Memeriksa pembaruan',text:'Memeriksa versi aplikasi dan isi aplikasi…',
      btns:[['Tutup','x59Close()',0]]});
  }
  function upToDate(r){
    modal({icon:'ok',tone:'t-ok',title:'Sudah versi terbaru',
      text:'Belum ada pembaruan baru. Kamu sudah memakai versi paling baru.',
      chip:'Versi '+(r&&r.curName||verLabel())+' · dicek pukul '+clock(at),
      btns:[['OK','x59Close()',1]]});
  }
  function checkFail(m){
    modal({icon:'err',tone:'t-err',title:'Tidak bisa memeriksa',
      text:/membatasi/i.test(String(m))?'GitHub sedang membatasi permintaan dari jaringan ini. Tunggu beberapa menit, lalu coba lagi.':String(m||'Terjadi kesalahan').replace(/[.\s]+$/,'')+'. Pastikan internet aktif, lalu coba lagi.',
      btns:[['Tutup','x59Close()',0],['Coba lagi','x59Re()',1]]});
  }
  function canPrompt(r){
    var sn=S().sn;
    if($m()||working)return false;
    return!(sn&&sn.c===r.code&&Date.now()-sn.t<12*3600*1000);
  }

  /* ---------- pembaruan isi aplikasi (service worker) ---------- */
  function askWeb(){
    modal({icon:'up',title:'Pembaruan isi aplikasi',
      text:'Tampilan dan fitur Loopify punya versi baru. Muat ulang untuk memakainya; musik yang sedang diputar akan berhenti sebentar.',
      chip:'Tanpa unduh APK',
      btns:[['Nanti','x59Close()',0],['Muat ulang sekarang','x59Web()',1]],
      hint:'Pilih Nanti: lencana BARU tetap ada di Pengaturan > Pembaruan aplikasi.'});
  }
  function webCheck(cb){
    var sw=navigator.serviceWorker,done=0,t;
    function fin(){if(done)return;done=1;clearTimeout(t);wman=0;refreshRow();cb()}
    wman=1;t=setTimeout(fin,6000);
    try{
      sw.getRegistration().then(function(r){
        if(!r){fin();return}
        if(r.waiting&&sw.controller){web=r;fin();return}
        r.update().then(function(){
          if(r.waiting&&sw.controller){web=r;fin();return}
          var w=r.installing;
          if(!w){fin();return}
          w.addEventListener('statechange',function(){
            if(w.state==='installed'&&sw.controller)web=r;
            if(w.state==='installed'||w.state==='redundant')fin();
          });
        }).catch(fin);
      }).catch(fin);
    }catch(e){fin()}
  }
  /* menggantikan banner lama di app.js: dipanggil saat ada service worker baru yang menunggu */
  window.updShow=function(reg){
    if(bundled)return;
    web=reg||web;refreshRow();
    if(wman||webAsked||$m()||working)return;
    webAsked=1;askWeb();
  };
  window.x59Web=function(){
    if(working)return;
    working=1;
    modal({icon:'spin',title:'Menerapkan pembaruan',text:'Aplikasi akan dimuat ulang sebentar lagi…'});
    var r=web,d=0;
    function go(){if(d)return;d=1;location.reload()}
    try{
      navigator.serviceWorker.addEventListener('controllerchange',go);
      if(r&&r.waiting)r.waiting.postMessage('skip');else go();
    }catch(e){go()}
    setTimeout(go,5000);
  };

  window.x59Close=function(){working=0;manual=0;close()};
  window.x59Later=function(){var o=S();o.sn={c:info?info.code:0,t:Date.now()};ls.set(KEY,o);working=0;close()};
  window.x59Bk=function(e){
    if(!e||e.target!==$m()||working)return;
    var f=window[dis];if(typeof f==='function')f();
  };
  window.x59Re=function(){check(1)};
  window.x59Go=function(){
    if(working)return;
    working=1;pct=0;ph=0;
    modal({icon:'down',title:'Memperbarui Loopify',bar:1});
    try{N.installUpdate()}catch(e){window.x59Err('Fitur pembaruan tidak tersedia di aplikasi ini')}
  };
  window.x59Prog=function(p){
    p=Math.max(0,Math.min(100,Math.round(+p||0)));
    var first=ph<1;
    pct=p;if(first)ph=1;
    var i=document.getElementById('x59i'),t=document.getElementById('x59t'),c=document.getElementById('x59pc'),z=document.getElementById('x59z');
    if(i){i.classList.remove('ind');i.style.width=p+'%'}
    if(c)c.textContent=p+'%';
    if(t)t.textContent=progText();
    if(first&&z){var s=z.children;if(s[0])s[0].className='d';if(s[1])s[1].className='a'}
  };
  window.x59Perm=function(){
    working=0;
    modal({icon:'lock',title:'Izin pemasangan diperlukan',
      text:'Android perlu izin sekali saja agar Loopify boleh memasang pembaruannya sendiri.',
      list:['Di layar pengaturan yang terbuka, aktifkan “Izinkan dari sumber ini” untuk Loopify.','Tekan tombol Kembali untuk pulang ke Loopify.','Ketuk Perbarui lagi di sini.'],
      btns:[['Tutup','x59Close()',0],['Perbarui','x59Go()',1]]});
  };
  window.x59Inst=function(){
    pct=100;ph=2;working=0;
    modal({icon:'ok',tone:'t-ok',title:'Siap dipasang',
      text:'Ketuk “Pasang” di layar Android untuk menyelesaikan. Kalau layarnya tertutup atau dibatalkan, ketuk Coba lagi.',
      bar:1,btns:[['Tutup','x59Close()',0],['Coba lagi','x59Go()',1]]});
  };
  window.x59Err=function(m){
    working=0;
    modal({icon:'err',tone:'t-err',title:'Pembaruan gagal',text:m||'Terjadi kesalahan.',
      btns:[['Tutup','x59Close()',0],['Coba lagi','x59Go()',1]]});
  };

  function check(man){
    if(checking){
      if(man&&!manual){manual=1;checkingModal()}
      return;
    }
    checking=1;manual=!!man;refreshRow();
    if(man)checkingModal();
    try{N.checkUpdate()}catch(e){checking=0;manual=0;refreshRow();if(man)checkFail('Tidak bisa memeriksa pembaruan.')}
  }
  window.x59Res=function(r){
    checking=0;var man=manual;manual=0;
    if(!r||r.error){
      info=null;refreshRow();
      if(man)checkFail((r&&r.error)||'Coba lagi nanti.');
      return;
    }
    info=r;at=Date.now();refreshRow();
    if(r.newer){if(man||canPrompt(r))ask(r)}
    else if(man){
      if(bundled||!navigator.serviceWorker||typeof navigator.serviceWorker.getRegistration!=='function'){upToDate(r);return}
      webCheck(function(){
        if(!$m()||closing)return;
        if(web)askWeb();else upToDate(r);
      });
    }
  };

  /* ---------- baris di Pengaturan > Lainnya ---------- */
  function rowHtml(){
    var t,b='';
    if(checking){t='Memeriksa pembaruan…';b='<i class="x59sp"></i>'}
    else if(web){t='Isi aplikasi punya versi baru · ketuk untuk memuat ulang';b='<em class="x59bd">BARU</em>'}
    else if(info&&info.newer){t='Versi '+E(info.name)+' siap dipasang · ketuk untuk memperbarui';b='<em class="x59bd">BARU</em>'}
    else if(info&&at){t='Versi '+E(verLabel())+' · sudah terbaru · dicek '+E(clock(at));b='<em class="x59bd ok">\u2713</em>'}
    else t='Versi '+E(verLabel())+' · ketuk untuk memeriksa';
    return'<span>⬆</span><div>Pembaruan aplikasi<br><small>'+t+'</small></div>'+b;
  }
  function refreshRow(){var d=document.querySelector('[data-x59]');if(d)d.innerHTML=rowHtml()}
  window.x59Row=function(){if(web)askWeb();else if(info&&info.newer)ask(info);else check(1)};
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
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape'||working||!$m()||closing)return;
    var f=window[dis];if(typeof f==='function')f();
  });
})();
