/* v4.44: Mode Liquid Glass (opsional) — Pengaturan → "Liquid Glass". Kaca tembus pandang dengan blur, kilau tepi,
   dan pantulan cahaya di sudut. Disimpan di cfg.lg44. Mode hemat tetap menang (matikan blur). Dimuat setelah extra43.js. */
(function(){
  var LG='html.lg44';
  var css=
  /* bahan kaca */
  LG+'{--g1:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.05) 55%,rgba(255,255,255,.13));--gh:radial-gradient(130% 95% at 8% -25%,rgba(255,255,255,.42),rgba(255,255,255,0) 58%);--gb:rgba(255,255,255,.3);--gs:inset 0 1.5px 0 rgba(255,255,255,.6),inset 0 -1.5px 0 rgba(255,255,255,.12),inset 0 0 22px rgba(255,255,255,.07),0 14px 34px rgba(0,0,0,.3);--gf:blur(20px) saturate(1.8)}'+
  LG+'[data-t=light]{--g1:linear-gradient(145deg,rgba(255,255,255,.75),rgba(255,255,255,.3) 55%,rgba(255,255,255,.5));--gh:radial-gradient(130% 95% at 8% -25%,rgba(255,255,255,.95),rgba(255,255,255,0) 58%);--gb:rgba(255,255,255,.95);--gs:inset 0 1.5px 0 #fff,inset 0 -1.5px 0 rgba(255,255,255,.5),0 12px 30px rgba(90,60,40,.16)}'+
  /* latar: bola warna lebih hidup supaya kaca punya sesuatu untuk dibiaskan */
  LG+' .orb{opacity:.9!important;filter:blur(46px)!important}'+
  /* kartu, panel, input, chip */
  LG+' .gl,'+LG+' .srch,'+LG+' .chip:not(.a),'+LG+' .pcard,'+LG+' .seg,'+LG+' select,'+LG+' .in,'+LG+' .btn.g,'+LG+' .mly,'+LG+' .ban,'+LG+' .gt,'+LG+' .x39k,'+LG+' .x24sr{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important}'+
  LG+' .ft{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;border-radius:20px;margin:8px 0;padding-left:14px;padding-right:14px;border-bottom:0}'+
  /* tombol utama: kaca berwarna */
  LG+' .btn:not(.g),'+LG+' .pbtn,'+LG+' .chip.a{background:linear-gradient(135deg,rgba(255,150,100,.92),rgba(255,86,128,.88))!important;border:1px solid rgba(255,255,255,.45)!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -3px 8px rgba(255,255,255,.18),0 10px 26px rgba(255,86,128,.5)!important;-webkit-backdrop-filter:blur(10px) saturate(1.6);backdrop-filter:blur(10px) saturate(1.6)}'+
  /* bilah navigasi, mini player, toast */
  LG+' .nav{border-radius:36px!important;height:70px!important;background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important}'+
  LG+' .nav button.a{background:rgba(255,255,255,.16);border-radius:24px;padding:7px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 4px 14px rgba(0,0,0,.18);transform:none}'+
  LG+' #mp,'+LG+' .mv,'+LG+' #toast,'+LG+' .upd{background:var(--gh),var(--g1)!important;border:1px solid var(--gb)!important;box-shadow:var(--gs)!important;-webkit-backdrop-filter:var(--gf)!important;backdrop-filter:var(--gf)!important;border-radius:28px}'+
  /* pemutar penuh */
  LG+' #pl .act button,'+LG+' #pl .ctl button:not(.pbtn){background:var(--g1);border:1px solid var(--gb);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.5);-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6)}'+
  LG+' #pl img{box-shadow:0 22px 50px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.2)}'+
  /* cover kartu: tepi kaca */
  LG+' .cd img,'+LG+' .rw img{border:1px solid var(--gb);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 8px 22px rgba(0,0,0,.28)}'+
  /* sentuhan kenyal */
  LG+' .btn,'+LG+' .chip,'+LG+' .pcard,'+LG+' .ft,'+LG+' .nav button,'+LG+' .cd{transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .25s}'+
  LG+' .btn:active,'+LG+' .chip:active,'+LG+' .pcard:active,'+LG+' .ft:active,'+LG+' .cd:active{transform:scale(.95)}'+
  /* mode hemat tetap menang */
  'html.eco.lg44 *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}';
  var st=document.createElement('style');st.id='x44';st.textContent=css;document.head.appendChild(st);

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
