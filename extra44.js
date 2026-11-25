/* v4.44: Mode Liquid Glass (opsional) — Pengaturan → "Liquid Glass". Kaca tembus pandang dengan blur, kilau tepi,
   dan pantulan cahaya di sudut. Disimpan di cfg.lg44. Mode hemat tetap menang (matikan blur). Dimuat setelah extra43.js. */
(function(){
  var LG='html.lg44';
  var css=
  /* bahan kaca */
  LG+'{--g1:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.05) 55%,rgba(255,255,255,.13));--gh:radial-gradient(130% 95% at 8% -25%,rgba(255,255,255,.42),rgba(255,255,255,0) 58%);--gb:rgba(255,255,255,.3);--gs:inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -1.5px 0 rgba(255,255,255,.12),inset 0 0 22px rgba(255,255,255,.07),0 14px 34px rgba(0,0,0,.3);--gf:blur(14px) saturate(1.5)}'+
  LG+'[data-t=light]{--g1:linear-gradient(145deg,rgba(255,255,255,.75),rgba(255,255,255,.3) 55%,rgba(255,255,255,.5));--gh:radial-gradient(130% 95% at 8% -25%,rgba(255,255,255,.95),rgba(255,255,255,0) 58%);--gb:rgba(255,255,255,.95);--gs:inset 0 1.5px 0 #fff,inset 0 -1.5px 0 rgba(255,255,255,.5),0 12px 30px rgba(90,60,40,.16)}'+
  /* latar: bola warna lebih hidup supaya kaca punya sesuatu untuk dibiaskan */
  LG+' .orb{opacity:.9!important;filter:blur(46px)!important}'+
  /* kartu, panel, input, chip */
  LG+' .gl,'+LG+' .srch,'+LG+' .chip:not(.a),'+LG+' .pcard,'+LG+' .seg,'+LG+' select,'+LG+' .in,'+LG+' .btn.g,'+LG+' .mly,'+LG+' .ban,'+LG+' .gt,'+LG+' .x39k,'+LG+' .x24sr{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important}'+
  /* hemat GPU: blur hanya di elemen besar yang jumlahnya sedikit (bilah, mini player, kartu profil, pencarian, banner) */
  LG+' .srch,'+LG+' .pcard,'+LG+' .ban{-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important}'+
  LG+' .ft{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;border-radius:20px;margin:8px 0;padding-left:14px;padding-right:14px;border-bottom:0}'+
  /* tombol utama: kaca berwarna */
  LG+' .btn:not(.g),'+LG+' .pbtn,'+LG+' .chip.a{background:var(--g)!important;border:1px solid rgba(255,255,255,.45)!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -3px 8px rgba(255,255,255,.18),0 10px 26px rgba(0,0,0,.35)!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -3px 8px rgba(255,255,255,.18),0 10px 26px color-mix(in srgb,var(--p) 55%,transparent)!important}'+
  /* bilah navigasi, mini player, toast */
  LG+' .nav{border-radius:36px!important;height:70px!important;background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important}'+
  LG+' .nav button.a{background:rgba(255,255,255,.16);border-radius:24px;padding:7px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 4px 14px rgba(0,0,0,.18);transform:none}'+
  '@media (min-width:768px) and (min-height:521px){'+LG+' #app .nav{height:auto!important;border-radius:0!important;border-width:0 1px 0 0!important;overflow:visible;box-shadow:inset -1px 0 0 var(--gb),10px 0 34px rgba(0,0,0,.28)!important}'+
  LG+' #app .nav button:not(.pbtn):hover{background:rgba(255,255,255,.12)}'+
  LG+' #app .nav button.a{padding:12px 16px;border-radius:14px;background:var(--c);box-shadow:inset 3px 0 0 var(--p)}'+
  LG+' #app .nav button.pbtn{border-radius:14px}}'+
  LG+' #mp,'+LG+' .mv,'+LG+' #toast,'+LG+' .upd{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important;border-radius:28px}'+
  /* pemutar penuh */
  LG+' #pl .act button,'+LG+' #pl .ctl button:not(.pbtn){background:var(--g1);border:1px solid var(--gb);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}'+
  LG+' #pl img{box-shadow:0 22px 50px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.2)}'+
  /* cover kartu: tepi kaca */
  LG+' .cd img,'+LG+' .rw img{border:1px solid var(--gb);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 8px 22px rgba(0,0,0,.28)}'+
  /* sentuhan kenyal */
  LG+' .btn,'+LG+' .chip,'+LG+' .pcard,'+LG+' .ft,'+LG+' .nav button,'+LG+' .cd{transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .25s}'+
  LG+' .btn:active,'+LG+' .chip:active,'+LG+' .pcard:active,'+LG+' .ft:active,'+LG+' .cd:active{transform:scale(.95)}'+
  /* perangkat lemah (class "weak", dipasang di bawah): tetap bergaya kaca tapi tanpa blur & bayangan besar */
  'html.weak.lg44 *,html.weak.lg44 *:before,html.weak.lg44 *:after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'+
  'html.weak.lg44{--gs:inset 0 1.5px 0 rgba(255,255,255,.5),0 6px 14px rgba(0,0,0,.25)}'+
  'html.weak.lg44[data-t=light]{--gs:inset 0 1.5px 0 #fff,0 6px 14px rgba(90,60,40,.14)}'+
  'html.weak.lg44 .orb{filter:blur(28px)!important}'+
  'html.weak.lg44 .nav,html.weak.lg44 #mp,html.weak.lg44 .mv,html.weak.lg44 #toast,html.weak.lg44 .upd{background:var(--gh),var(--nv)!important}'+
  /* mode hemat tetap menang */
  'html.eco.lg44 *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}';
  var st=document.createElement('style');st.id='x44';st.textContent=css;document.head.appendChild(st);

  /* Beranda/Cari/Library/Profil di sidebar: bila pemutar penuh / panel sub / video sedang terbuka, tutup dulu
     supaya halaman yang dipilih langsung tampil (bukan berjalan di belakang lagu). */
  document.addEventListener('click',function(e){
    try{
      var b=e.target&&e.target.closest&&e.target.closest('#nav button[data-p]');if(!b)return;
      var pl=document.getElementById('pl'),sp=document.getElementById('sp'),vo=document.getElementById('vo');
      if(pl&&pl.classList.contains('on'))clp();
      if(sp&&sp.classList.contains('on')){csp0();try{rbP=0}catch(x){}}
      if(vo&&vo.classList.contains('on'))vClose();
    }catch(x){}
  },true);

  /* Deteksi perangkat lemah (sama dengan ambang mode ringan di extra46) + hemat data + "kurangi transparansi". */
  try{
    var cn=navigator.connection,mq=window.matchMedia&&window.matchMedia('(prefers-reduced-transparency: reduce)');
    if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=3||(cn&&cn.saveData)||(mq&&mq.matches))
      document.documentElement.classList.add('weak');
  }catch(e){}

  function apply(){try{document.documentElement.classList.toggle('lg44',!!cfg.lg44)}catch(e){}}
  var _a=applyCfg;window.applyCfg=function(){var r=_a.apply(this,arguments);apply();return r};
  apply();

  var _s=setR;window.setR=function(){var r=_s.apply(this,arguments);
    try{var v=document;if(v.querySelector('[data-x44]'))return r;
      var fs=[].slice.call(v.querySelectorAll('.ft')),e=fs.filter(function(f){return(f.getAttribute('onclick')||'').indexOf("cfgTg('eco')")>=0})[0];if(!e)return r;
      var d=document.createElement('div');d.className='ft';d.setAttribute('data-x44','1');d.setAttribute('onclick',"cfgTg('lg44')");
      d.innerHTML='<div>Liquid Glass<br><small>Tampilan kaca tembus pandang. Butuh HP yang cukup kencang; mode hemat akan mematikannya.</small></div><i class="sw '+(cfg.lg44?'on':'')+'"></i>';
      e.parentNode.insertBefore(d,e)}catch(x){}
    return r};
})();
