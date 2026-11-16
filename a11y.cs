/* Loopify v4.29 - aksesibilitas: nama untuk tombol ikon, akses keyboard untuk elemen yang bisa diketuk,
   label kolom isi, alt gambar, dan pengumuman toast. Satu pengamat DOM ringan, hanya memproses node baru.
   Dimuat paling akhir (pasangan a11y.css). */
(function(){
  'use strict';
  var GL={'⚙':'Pengaturan','⋮':'Menu lainnya','✕':'Tutup','×':'Tutup','✖':'Tutup','‹':'Kembali','›':'Lanjut',
    '▶':'Putar','⏸':'Jeda','⏯':'Putar atau jeda','⏮':'Lagu sebelumnya','⏭':'Lagu berikutnya','⏪':'Mundur','⏩':'Maju',
    '⤴':'Bagikan','⤓':'Simpan','⤒':'Putar berikutnya','☑':'Pilih beberapa lagu','🎧':'Mode audio','🎚':'Equalizer',
    '🎤':'Cari dengan suara','✎':'Ubah','▲':'Naikkan','▼':'Turunkan','▢':'Kembali ke video','≡':'Seret untuk mengurutkan',
    '♡':'Favorit','♥':'Favorit','+':'Tambah','＋':'Tambah','⇩':'Impor'};
  /* tombol berisi SVG saja: nama diambil dari fungsi yang dipanggil */
  var OC=[[/toggle\(\)/,'Putar atau jeda'],[/nxt\(-1\)|prv\(/,'Lagu sebelumnya'],[/nxt\((1)?\)/,'Lagu berikutnya'],
    [/addPl\(/,'Playlist baru'],[/(^|[^a-zA-Z])(csp|clp|krX|drClose|ksClose|ovc|vBack)\(/,'Kembali'],
    [/qAdd\(/,'Tambah ke antrean'],[/qRm\(|plRm\(|delS\(|delV\(/,'Hapus'],[/tgTheme\(/,'Ganti tema'],[/goSet\(/,'Pengaturan']];
  var SKIP={BUTTON:1,A:1,INPUT:1,SELECT:1,TEXTAREA:1,LABEL:1,SUMMARY:1,OPTION:1};
  var CLK='[onclick],.rw,.cd,.pcard,.ft,.chip,.x18c';
  var INNER='button,a,[onclick],input,select,textarea,[role="button"]';

  function nameBtn(b){
    if(b.hasAttribute('aria-label')||b.hasAttribute('aria-labelledby')||b.title)return;
    var t=(b.textContent||'').replace(/[\uFE0F\s]/g,'');
    if(t){if(GL[t])b.setAttribute('aria-label',GL[t]);return}
    var oc=b.getAttribute('onclick')||'';
    for(var i=0;i<OC.length;i++)if(OC[i][0].test(oc)){b.setAttribute('aria-label',OC[i][1]);return}
  }
  function keyable(el){
    if(el.hasAttribute('data-a11y')||SKIP[el.tagName]||el.hasAttribute('role'))return;
    if(el.id==='app'||el.classList.contains('ov')||el.getAttribute('aria-hidden')==='true')return;
    el.setAttribute('data-a11y','1');
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.querySelector(INNER))el.setAttribute('role','button');
  }
  function field(f){
    if(f.type==='hidden'||f.type==='file'||f.hasAttribute('aria-label')||f.hasAttribute('aria-labelledby'))return;
    if(f.id&&document.querySelector('label[for="'+f.id+'"]'))return;
    var n=f.getAttribute('placeholder')||f.title;if(n)f.setAttribute('aria-label',n);
  }
  function scan(r){
    if(!r||r.nodeType!==1||!r.isConnected)return;
    var l,i;
    if(r.tagName==='BUTTON')nameBtn(r);
    l=r.querySelectorAll('button');for(i=0;i<l.length;i++)nameBtn(l[i]);
    if(r.matches(CLK))keyable(r);
    l=r.querySelectorAll(CLK);for(i=0;i<l.length;i++)keyable(l[i]);
    if(r.matches('input,select,textarea'))field(r);
    l=r.querySelectorAll('input,select,textarea');for(i=0;i<l.length;i++)field(l[i]);
    l=r.querySelectorAll('img:not([alt])');for(i=0;i<l.length;i++)l[i].setAttribute('alt','');
  }

  /* Enter / Spasi pada elemen yang difokuskan = ketuk (ditangkap lebih dulu supaya Spasi tidak memicu pintasan putar/jeda) */
  document.addEventListener('keydown',function(e){
    var t=e.target;
    if(!t||t.nodeType!==1||!t.hasAttribute('data-a11y'))return;
    if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();e.stopPropagation();t.click()}
  },true);

  var q=[],tm=0;
  function flush(){tm=0;var a=q;q=[];for(var i=0;i<a.length;i++){try{scan(a[i])}catch(x){}}}
  function init(){
    var app=document.getElementById('app')||document.body;
    var toast=document.getElementById('toast');
    if(toast){toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true')}
    try{scan(app)}catch(x){}
    if(!window.MutationObserver)return;
    new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){var n=ms[i].addedNodes;for(var j=0;j<n.length;j++)if(n[j].nodeType===1)q.push(n[j])}
      if(q.length&&!tm)tm=setTimeout(flush,100);
    }).observe(app,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
