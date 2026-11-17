/* v4.45: (1) Animasi halaman Masuk / Daftar, (2) kehalusan umum (transisi halaman, daftar panjang, sentuhan),
   (3) dua sakelar notifikasi musik: "Dynamic Island" (banner di dalam aplikasi, cfg.npn) dan "Notifikasi musik Android" (cfg.ntfOff).
   Semua animasi hanya memakai transform/opacity. Dimati otomatis oleh Mode hemat dan "kurangi gerakan" milik sistem. Dimuat setelah extra44.js. */
(function(){
  var E='cubic-bezier(.22,1,.36,1)',SP='cubic-bezier(.34,1.56,.64,1)';
  var M='html:not(.eco)';
  var css=
  /* ===== kehalusan umum ===== */
  'html{-webkit-tap-highlight-color:transparent}button,.ft,.chip,.rw,.cd,.pcard,.nav button{touch-action:manipulation}'+
  '#v,.ov{overscroll-behavior:contain}'+
  '.rw{content-visibility:auto;contain-intrinsic-size:auto 64px}'+
  '.nav,#mp,.ov{will-change:transform}'+
  M+' #v.x45p{animation:x45p .32s '+E+'}@keyframes x45p{from{opacity:0;transform:translate3d(0,14px,0)}to{opacity:1;transform:none}}'+
  M+' .rw:active,'+M+' .ft:active{transform:scale(.985);transition:transform .12s}'+
  /* ===== Masuk / Daftar ===== */
  M+' #lg{transition:opacity .45s '+E+',transform .5s '+E+'}'+
  M+' #lg.x{transform:scale(1.05)}'+
  /* bola warna melayang di belakang */
  M+' #lg:before,'+M+' #lg:after{content:"";position:fixed;width:320px;height:320px;border-radius:50%;pointer-events:none;opacity:.55;filter:blur(40px);will-change:transform}'+
  M+' #lg:before{top:-90px;right:calc(50% - 215px - 80px);background:radial-gradient(circle,var(--o1),transparent 68%);animation:x45a 14s ease-in-out infinite alternate}'+
  M+' #lg:after{bottom:-110px;left:calc(50% - 215px - 90px);background:radial-gradient(circle,var(--o2),transparent 68%);animation:x45a 17s ease-in-out infinite alternate-reverse}'+
  '@keyframes x45a{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(-40px,50px,0) scale(1.18)}}'+
  M+' #lg .lgc{position:relative;z-index:1}'+
  /* konten masuk bergantian (anak-anaknya dibuat ulang tiap ganti langkah, jadi animasi ikut mengulang) */
  M+' #lg .lgc>*{opacity:0;animation:x45u .6s '+E+' forwards}'+
  M+' #lg .lgc>*:nth-child(1){animation-delay:.02s}'+M+' #lg .lgc>*:nth-child(2){animation-delay:.08s}'+M+' #lg .lgc>*:nth-child(3){animation-delay:.14s}'+
  M+' #lg .lgc>*:nth-child(4){animation-delay:.2s}'+M+' #lg .lgc>*:nth-child(5){animation-delay:.26s}'+M+' #lg .lgc>*:nth-child(6){animation-delay:.32s}'+
  M+' #lg .lgc>*:nth-child(7){animation-delay:.38s}'+M+' #lg .lgc>*:nth-child(8){animation-delay:.44s}'+M+' #lg .lgc>*:nth-child(n+9){animation-delay:.5s}'+
  '@keyframes x45u{from{opacity:0;transform:translate3d(0,22px,0) scale(.97)}to{opacity:1;transform:none}}'+
  /* logo: muncul memantul lalu melayang pelan dengan cahaya */
  M+' #lg .lgc>div:first-child img{animation:x45l .9s '+SP+' both,x45f 5s ease-in-out .9s infinite;box-shadow:0 0 0 1px rgba(255,255,255,.18),0 18px 44px rgba(255,100,130,.4)}'+
  '@keyframes x45l{from{opacity:0;transform:scale(.5) rotate(-12deg)}to{opacity:1;transform:none}}'+
  '@keyframes x45f{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-7px,0)}}'+
  /* kolom isian menyala saat difokus */
  '#lg .in{transition:box-shadow .25s,border-color .25s,transform .25s '+SP+'}'+
  '#lg .in:focus{border-color:var(--p2)!important;box-shadow:0 0 0 3px rgba(255,138,91,.28),0 8px 24px rgba(255,95,126,.22)!important;transform:translateY(-2px)}'+
  /* tombol: kilau menyapu */
  M+' #lg .btn{position:relative;overflow:hidden}'+
  M+' #lg .btn:before{content:"";position:absolute;top:0;bottom:0;width:50%;left:-70%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:skewX(-20deg);animation:x45s 3.4s ease-in-out 1s infinite}'+
  '@keyframes x45s{0%{left:-70%}55%,100%{left:130%}}'+
  '#lg .btn:active{transform:scale(.96);transition:transform .15s '+SP+'}'+
  /* pesan galat: goyang */
  M+' #lg .shk{animation:x45k .42s ease both}@keyframes x45k{0%,100%{transform:none}20%{transform:translateX(-9px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}'+
  M+' #lg .er:not(:empty){animation:x45e .3s '+E+'}@keyframes x45e{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}'+
  /* kurangi gerakan */
  '@media (prefers-reduced-motion:reduce){#lg:before,#lg:after,#lg .lgc>*,#lg .btn:before,#v.x45p{animation:none!important}#lg .lgc>*{opacity:1!important}}';
  var st=document.createElement('style');st.id='x45';st.textContent=css;document.head.appendChild(st);

  /* ---- goyang saat ada galat di Masuk / Daftar ---- */
  var last='';
  function shake(){try{var l=document.getElementById('lg');if(!l)return;var er=l.querySelector('.er'),t=er?er.textContent.trim():'';
    if(t&&t!==last){var c=l.querySelector('.lgc');if(c){c.classList.remove('shk');void c.offsetWidth;c.classList.add('shk')}}last=t}catch(e){}}
  try{new MutationObserver(shake).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}

  /* ---- transisi halus saat pindah halaman ---- */
  var lp=null,pt=0;
  function pgChk(){try{var v=document.getElementById('v');if(!v||typeof pg==='undefined')return;if(lp===null){lp=pg;return}
    if(pg!==lp){lp=pg;if(document.documentElement.classList.contains('eco'))return;v.classList.remove('x45p');void v.offsetWidth;v.classList.add('x45p');clearTimeout(pt);pt=setTimeout(function(){v.classList.remove('x45p')},400)}}catch(e){}}
  try{new MutationObserver(function(){pgChk()}).observe(document.getElementById('v')||document.body,{childList:true})}catch(e){}

  /* ---- sakelar notifikasi ---- */
  function nat(){return !!(window.LoopifyNative&&window.LoopifyNative.n)}
  function push(){try{if(nat())LoopifyNative.n(!cfg.ntfOff)}catch(e){}}
  var _a=applyCfg;window.applyCfg=function(){var r=_a.apply(this,arguments);push();return r};
  push();setTimeout(push,1500);
  var _s=setR;window.setR=function(){var r=_s.apply(this,arguments);
    try{var d=document;if(d.querySelector('[data-x45]'))return r;
      var row=[].slice.call(d.querySelectorAll('.ft')).filter(function(f){return(f.getAttribute('onclick')||'').indexOf("cfgTg('npn')")>=0})[0];if(!row)return r;
      var sw=row.querySelector('.sw'),dv=row.querySelector('div');
      if(dv)dv.innerHTML='Dynamic Island<br><small>Banner interaktif di atas layar saat lagu diputar (lirik, kontrol, cover)</small>';
      if(nat()){var n=d.createElement('div');n.className='ft';n.setAttribute('data-x45','1');n.setAttribute('onclick',"cfgTg('ntfOff')");
        n.innerHTML='<div>Notifikasi musik Android<br><small>Cover dan tombol kontrol di bilah notifikasi &amp; layar kunci. Jika dimatikan, Android tetap menampilkan notifikasi kecil agar musik tidak berhenti saat layar mati.</small></div><i class="sw '+(cfg.ntfOff?'':'on')+'"></i>';
        row.parentNode.insertBefore(n,row.nextSibling)}}catch(x){}
    return r};
})();
