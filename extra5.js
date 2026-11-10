/* Midnight Acoustic v3.5.2 - Geser kiri/kanan untuk pindah tab: Beranda - Cari - Library - Profil.
   Berlaku di isi halaman dan di bilah navigasi bawah. Tidak aktif saat panel/overlay terbuka, di kolom input,
   atau saat menggeser daftar yang bisa digulir ke samping (chip, kartu trending). Dimuat setelah extra4.js. */
(function(){
  var ORDER=['home','explore','library','profile'],x0=0,y0=0,t0=0,ok=0;
  function blocked(){
    if(document.querySelector('.ov.on,#ob,#lg'))return true;
    return ORDER.indexOf(pg)<0;
  }
  function scrollsX(el){
    var v=document.getElementById('v');
    for(;el&&el!==document.body;el=el.parentElement){
      if(el.scrollWidth>el.clientWidth+2){var o=getComputedStyle(el).overflowX;if(o=='auto'||o=='scroll')return true}
      if(el===v)break;
    }
    return false;
  }
  document.addEventListener('touchstart',function(e){
    ok=0;if(e.touches.length!=1||blocked())return;
    var t=e.target;if(!t.closest||!t.closest('#v,#nav'))return;
    if(t.closest('input,textarea,select,[contenteditable],.rw,#mp'))return;
    if(scrollsX(t))return;
    var p=e.touches[0];x0=p.clientX;y0=p.clientY;t0=Date.now();ok=1;
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!ok)return;ok=0;if(blocked())return;
    var p=e.changedTouches[0],dx=p.clientX-x0,dy=p.clientY-y0;
    if(Date.now()-t0>650||Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6)return;
    var i=ORDER.indexOf(pg)+(dx<0?1:-1);if(i<0||i>=ORDER.length)return;
    go(ORDER[i]);
    var v=document.getElementById('v');
    if(v&&v.animate)v.animate([{transform:'translateX('+(dx<0?28:-28)+'px)',opacity:.35},{transform:'none',opacity:1}],{duration:220,easing:'ease-out'});
    try{if(navigator.vibrate)navigator.vibrate(8)}catch(x){}
  },{passive:true});
})();
