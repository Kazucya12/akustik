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
        try{toast('Ikon diganti. Kalau aplikasi tertutup sendiri, buka lagi dari ikon baru.')}catch(e){}
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
