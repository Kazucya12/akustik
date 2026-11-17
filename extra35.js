/* v4.35: Ingat login & nama. Sesi (mx_auth) dan nama sudah disimpan di localStorage; file ini menambah cadangan di IndexedDB dan minta browser
   agar penyimpanan tidak dihapus otomatis. Kalau localStorage kosong tapi cadangan masih ada, login dan nama dipulihkan tanpa layar masuk. Dimuat setelah extra34.js. */
(function(){
  var DB='loopify-keep';
  function open(){return new Promise(function(ok,no){try{var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore('k')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}}catch(e){no(e)}})}
  function get(k){return open().then(function(d){return new Promise(function(ok){var q=d.transaction('k').objectStore('k').get(k);q.onsuccess=function(){ok(q.result)};q.onerror=function(){ok(null)}})}).catch(function(){return null})}
  function put(k,v){return open().then(function(d){var t=d.transaction('k','readwrite');t.objectStore('k').put(v,k)}).catch(function(){})}
  function rd(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
  function okAuth(a){return a&&a.email&&a.session&&a.exp>Date.now()}
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
  function snap(){return {auth:rd('mx_auth'),skip:rd('mx_authskip'),name:(typeof cfg!='undefined'&&cfg.name)||''}}
  var last='';
  function save(){try{var s=JSON.stringify(snap());if(s!==last){last=s;put('snap',snap())}}catch(e){}}
  get('snap').then(function(b){
    try{
      if(b&&!okAuth(rd('mx_auth'))&&okAuth(b.auth)){
        localStorage.setItem('mx_auth',JSON.stringify(b.auth));localStorage.removeItem('mx_authskip');
        var lg=document.getElementById('lg');if(lg)lg.remove();
      }
      if(b&&b.name&&!cfg.name){cfg.name=String(b.name).slice(0,30);ls.set('cfg',cfg)}
      if(b&&(okAuth(b.auth)||b.name))go(pg);
    }catch(e){}
    save();setInterval(save,3000);
    addEventListener('pagehide',save);document.addEventListener('visibilitychange',save);
    try{var _o=window.lgOut;if(_o)window.lgOut=function(){var r=_o.apply(this,arguments);Promise.resolve(r).then(function(){setTimeout(save,300)});return r}}catch(e){}
  });
})();
