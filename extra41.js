/* v4.41: Unduhan offline. Tombol Unduh di pemutar (menggantikan tombol bagikan lama) + halaman "Unduhan Offline" di Profil
   berisi daftar lagu yang sudah disimpan (ms. tersimpan di IndexedDB, bisa diputar tanpa internet). Dimuat setelah extra40.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='#pl .act button[onclick="dlc()"]:not([data-dl2]){display:none}.x41s{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:0 0 12px}.x41s small{color:var(--mu)}.x41s>div{flex:1;min-width:0}.x41s .btn{width:auto;flex:none;margin:0}';
  document.head.appendChild(st);
  function mb(n){return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'}
  function list(){return songs.filter(function(s){return s.off})}
  window.goOff41=function(){rbP=0;var L=list(),tot=0;L.forEach(function(t){tot+=(t.blob&&t.blob.size)||0});
    sub(shd('Unduhan Offline')+'<div class="pcard x41s"><div><b>'+L.length+' lagu</b><br><small>'+mb(tot)+' di perangkat · bisa diputar tanpa internet</small></div>'+
      (L.length?'<button class="btn g" style="flex:none;padding:9px 14px;font-size:13px" onclick="x41All()">▶ Putar</button>':'')+'</div>'+
      (L.length?rows('dl41',L,1):'<div class="em">Belum ada lagu yang diunduh. Buka pemutar lalu ketuk ikon unduh. Lagu yang bisa disimpan hanya yang diizinkan artisnya; lagu YouTube tidak bisa.</div>'))};
  window.x41All=function(){var L=list();if(!L.length)return;lists.dl41=L;play(L,0);openP()};
  function apply(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x41]'))return;
    var h=v.querySelector('h1');if(!h||h.textContent!=='Profil')return;
    var s=v.querySelector('.ft');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-x41','1');d.setAttribute('onclick','goOff41()');
    d.innerHTML='<span>⬇</span><div>Unduhan Offline<br><small>'+list().length+' lagu</small></div>';s.parentNode.insertBefore(d,s)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,150)}).observe(document.getElementById('v'),{childList:true})}catch(e){}
  apply();
})();
