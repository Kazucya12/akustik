/* Loopify v4.9.1 - Pemulih lagu online yang tersendat (stream Audius/online).
   Saat buffering macet >7 dtk, sambungan dimuat ulang dari posisi terakhir; preload lagu berikutnya
   dijeda ketika jaringan sedang lemah supaya tidak berebut kecepatan. Dimuat setelah extra19.js. */
(function(){
  'use strict';
  var S={tm:0,n:0,id:'',last:0};
  function online(a){return a===act&&cur&&!cur.loc&&!cur.yt&&!cur.radio}
  function fix(a,src,id){
    if(!online(a)||a.paused||a.readyState>=3||cur.id!==id||(a.currentSrc||a.src)!==src)return;
    if(S.id!==id){S.id=id;S.n=0}
    if(S.n>=3)return;S.n++;
    var ct=a.currentTime;
    try{
      a.src=src;a.load();
      a.addEventListener('loadedmetadata',function f(){a.removeEventListener('loadedmetadata',f);try{a.currentTime=ct}catch(e){}a.play().catch(function(){})});
    }catch(e){}
  }
  function wait(e){
    var a=e.target;if(!online(a))return;
    S.last=Date.now();
    try{if(typeof pre!='undefined'&&pre){pre.removeAttribute('src');pre.load();pre=null}}catch(x){}
    clearTimeout(S.tm);var src=a.currentSrc||a.src,id=cur.id;
    S.tm=setTimeout(function(){fix(a,src,id)},7000);
  }
  function ok(e){if(e.target===act)clearTimeout(S.tm)}
  [A,B].forEach(function(a){
    a.preload='auto';
    ['waiting','stalled'].forEach(function(n){a.addEventListener(n,wait)});
    ['playing','canplay','canplaythrough','pause','ended'].forEach(function(n){a.addEventListener(n,ok)});
  });
  var _pr=prel;
  prel=function(a){if(Date.now()-S.last<30000)return;return _pr.apply(this,arguments)};
})();
