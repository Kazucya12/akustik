/* v4.39: pasang class "lite" di APK atau perangkat spek rendah (blur dimatikan, orb diam). Class "bg" dipasang native saat layar mati. */
(function(){
  try{
    var low=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=3;
    if(window.LoopifyNative||low)document.documentElement.classList.add('lite');
  }catch(e){}
})();

/* v4.39: pilih ikon aplikasi (hanya di APK; jembatan native LoopifyNative.setIcon / getIcon). */
(function(){
  var N=window.LoopifyNative;if(!N||!N.setIcon)return;
  var IC=[['asli','Asli','#7c4dff','#ff8a5b'],['biru','Biru','#4dceff','#ff5bca'],['hijau','Hijau','#4dff9e','#ad5bff'],
    ['pink','Pink','#ff4dd2','#d2ff5b'],['merah','Merah','#ff4d5d','#66ff5b'],['neon','Neon','#76ff4d','#5b79ff'],['mono','Mono','#e8e8e8','#8a8a8a']];
  window.icoSet=function(k){
    try{
      if(N.getIcon()===k)return;
      if(N.setIcon(k)){
        try{toast('Ikon dipilih. Tekan tombol Home untuk menerapkannya, lalu cek di layar utama.')}catch(e){}
        setTimeout(function(){try{setR()}catch(e){}},250);
      }
    }catch(e){}
  };
  function block(){
    var cur='asli';try{cur=N.getIcon()||'asli'}catch(e){}
    var d=document.createElement('div');d.setAttribute('data-x46i','1');
    d.innerHTML='<div class="sec"><h3>Ikon aplikasi</h3></div><div class="x46ic">'+IC.map(function(c){
      return '<button type="button" class="'+(c[0]===cur?'on':'')+'" onclick="icoSet(\''+c[0]+'\')" aria-label="Ikon '+c[1]+'"><i style="background:linear-gradient(135deg,'+c[2]+','+c[3]+')"></i>'+c[1]+'</button>'}).join('')+'</div>';
    return d;
  }
  var _s=window.setR;
  window.setR=function(){
    var r=_s.apply(this,arguments);
    try{
      if(document.querySelector('[data-x46i]'))return r;
      var h=[].slice.call(document.querySelectorAll('.sec')).filter(function(e){return(e.textContent||'').trim()==='Lainnya'})[0];
      if(h)h.parentNode.insertBefore(block(),h);
    }catch(e){}
    return r;
  };
})();

/* v4.39: tanda centang biru untuk developer. Ditentukan server (env DEV_EMAILS di Vercel); aplikasi hanya menampilkannya. */
(function(){
  var V='<svg class="x46v" viewBox="0 0 24 24" width="16" height="16" role="img" aria-label="Developer terverifikasi"><title>Developer terverifikasi</title><path fill="#1d9bf0" d="M12 1.5l2.7 1.9 3.3-.2 1.2 3.1 2.7 1.9-.9 3.2.9 3.2-2.7 1.9-1.2 3.1-3.3-.2L12 22.5l-2.7-1.9-3.3.2-1.2-3.1-2.7-1.9.9-3.2-.9-3.2 2.7-1.9L6 3.2l3.3.2z"/><path d="M8 12.3l2.7 2.7L16.2 9.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var devs=[],self=false;
  window.x46v=V;
  window.x46dv=function(u){return devs.indexOf(String(u||'').toLowerCase())>=0};
  function api(b){return fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}})}
  function paint(){
    try{
      if(!self)return;
      var v=document.getElementById('v');if(!v)return;
      var b=v.querySelector('.pcard b[style*="font-size:16px"]');
      if(b&&!b.querySelector('.x46v'))b.insertAdjacentHTML('beforeend',' '+V);
    }catch(e){}
  }
  function start(){
    var a=null;try{a=JSON.parse(localStorage.getItem('mx_auth'))}catch(e){}
    api({action:'devs'}).then(function(j){devs=(j.devs||[]).map(function(x){return String(x).toLowerCase()})});
    if(a&&a.session&&a.exp>Date.now())api({action:'me',session:a.session}).then(function(j){self=!!j.dev;paint()});
    var v=document.getElementById('v');
    if(v)new MutationObserver(paint).observe(v,{childList:true});
  }
  setTimeout(start,1500);
})();
