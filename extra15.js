/* Loopify v4.4 - Dynamic Island: notifikasi "sedang diputar" gaya iPhone, interaktif.
   - Lagu ganti/mulai  : pil membesar (kover, judul, artis, seekbar, kontrol), lalu mengecil sendiri.
   - Pil kecil         : kover + equalizer animasi (diam saat jeda). Ketuk untuk membuka.
   - Terbuka           : ketuk kover/judul = buka pemutar penuh, seek dengan geser bar, prev/play/next,
                         geser ke atas atau ketuk di luar = tutup. Tahan pil kecil = putar/jeda.
   Mati lewat cfg.npn=false (pengaturan notifikasi yang sudah ada). Dimuat setelah extra14.js. */
(function(){
  'use strict';
  if(typeof document==='undefined')return;
  var app=document.getElementById('app');if(!app)return;
  var isl=document.createElement('div');isl.id='isl';
  var SV={prev:'<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'};
  var EQ='<span class="eq"><i></i><i></i><i></i><i></i></span>';
  isl.innerHTML='<div class="ic"><img alt="" id="islc"><span class="eq"><i></i><i></i><i></i><i></i></span></div>'+
    '<div class="ex"><div class="tp"><img alt="" id="islc2"><div class="tt"><b><span class="mq" id="islt"></span></b><span id="isla"></span></div>'+EQ+'</div>'+
    '<div class="sk"><em id="islct">0:00</em><div class="bar" id="islb"><u id="islu"></u></div><em id="isldu">0:00</em></div>'+
    '<div class="cb"><button id="islp" aria-label="Sebelumnya">'+SV.prev+'</button><button class="pp" id="islpp" aria-label="Putar atau jeda"><span class="i1">'+SV.play+'</span><span class="i2">'+SV.pause+'</span></button><button id="islnx" aria-label="Berikutnya">'+SV.next+'</button></div></div>';
  app.appendChild(isl);
  var $i=function(id){return document.getElementById(id)};
  var started=0,big=false,hideT=0,lastId=null,lastSrc='',lastTitle='',drag=0,dragRatio=0,lpT=0,lpFired=0,sx=0,sy=0,moved=0;
  var fmt=function(s){return(typeof f2==='function')?f2(s):'0:00'};
  function enabled(){try{return cfg.npn!==false}catch(e){return true}}
  function vib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
  function playing(){try{return !!(cur&&act&&!act.paused)}catch(e){return false}}
  function playerOpen(){var p=document.getElementById('pl'),v=document.getElementById('vo'),k=document.getElementById('kr');
    return !!((p&&p.classList.contains('on'))||(v&&v.classList.contains('on'))||(k&&k.classList.contains('on')))}
  function expand(auto){
    if(big)return;big=true;isl.classList.add('big');isl.classList.remove('pop');void isl.offsetWidth;isl.classList.add('pop');vib(10);
    marquee();arm(auto?4800:7000);
  }
  function collapse(){if(!big)return;big=false;isl.classList.remove('big');clearTimeout(hideT)}
  function arm(ms){clearTimeout(hideT);hideT=setTimeout(function(){if(drag){arm(2000);return}collapse()},ms)}
  function marquee(){
    var m=$i('islt');if(!m)return;m.classList.remove('run');m.style.removeProperty('--mx');
    setTimeout(function(){var w=m.parentNode.clientWidth,s=m.scrollWidth;if(s>w+2){m.style.setProperty('--mx',-(s-w+40)+'px');m.classList.add('run')}},550);
  }
  function setTrack(){
    var t=cur;if(!t)return;
    var src=t.img||'icon-192.png';
    if(src!==lastSrc){lastSrc=src;$i('islc').src=src;$i('islc2').src=src;
      isl.style.setProperty('--ic','rgba(109,93,252,.35)');
      $i('islc').onerror=$i('islc2').onerror=function(){this.src='icon-192.png'}}
    var ti=t.title||'Tanpa judul';
    $i('islt').textContent=ti;$i('isla').textContent=t.artist||(t.radio?'Radio':(t.yt?'YouTube':'Loopify'));
    isl.title=ti;lastTitle=ti;if(big)marquee();
  }
  /* sinkron ringan: status putar, progres, tampil/sembunyi */
  function sync(){
    if(document.hidden)return;
    if(!started&&cur&&playing())started=1;
    var on=enabled()&&started&&cur;
    var vis=!!on&&!playerOpen();
    isl.classList.toggle('show',vis);document.body.classList.toggle('isl-on',vis);
    if(!on){if(big)collapse();return}
    if(!vis&&big)collapse();
    isl.classList.toggle('pl',playing());
    if(cur.id!==lastId||(cur.title||'Tanpa judul')!==lastTitle){
      lastId=cur.id;setTrack();
      if(vis)expand(true);
    }
    if(!big)return;
    var a=act,live=!!(cur.radio),d=a&&a.duration,c=a?a.currentTime:0;
    isl.classList.toggle('live',live||!isFinite(d)||!(d>0));
    if(!drag){
      var r=(d>0&&isFinite(d))?Math.min(1,c/d):0;$i('islu').style.transform='scaleX('+r+')';
      $i('islct').textContent=fmt(c);$i('isldu').textContent=live?'LIVE':fmt(d);
    }
  }
  setInterval(sync,250);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sync()});

  /* mulai muncul setelah ada pemutaran pertama */
  function onPlay(){started=1;sync()}
  try{[A,B].forEach(function(a){a.addEventListener('play',onPlay)})}catch(e){}
  var _ms=window.ms;
  if(typeof _ms==='function'){window.ms=function(){var r=_ms.apply(this,arguments);if(cur&&(playing()||cur.yt))started=1;setTimeout(sync,60);return r}}

  /* ---------- interaksi ---------- */
  function press(e){
    if(e.target.closest('button')||e.target.closest('#islb'))return;
    var p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;moved=0;lpFired=0;
    if(!big){lpT=setTimeout(function(){lpFired=1;vib(14);try{toggle()}catch(e){}isl.classList.remove('pop');void isl.offsetWidth;isl.classList.add('pop')},520)}
  }
  function mv(e){var p=e.touches?e.touches[0]:e;if(Math.abs(p.clientX-sx)+Math.abs(p.clientY-sy)>8){moved=1;clearTimeout(lpT)}}
  function rel(e){
    clearTimeout(lpT);
    if(e.target.closest&&(e.target.closest('button')||e.target.closest('#islb')))return;
    var p=(e.changedTouches&&e.changedTouches[0])||e;
    var dy=p.clientY-sy;
    if(lpFired){lpFired=0;return}
    if(big){
      if(moved&&dy<-24){collapse();return}
      if(!moved){
        if(e.target.closest('.tp')){collapse();try{openP()}catch(x){}}
        else arm(7000);
      }
    }else if(!moved||dy>16){expand(false)}
  }
  isl.addEventListener('touchstart',press,{passive:true});isl.addEventListener('touchmove',mv,{passive:true});isl.addEventListener('touchend',rel);
  isl.addEventListener('mousedown',press);isl.addEventListener('mousemove',function(e){if(e.buttons)mv(e)});isl.addEventListener('mouseup',rel);
  isl.addEventListener('mouseleave',function(){clearTimeout(lpT)});

  function btn(id,fn){var b=$i(id);var h=function(e){e.stopPropagation();vib(8);try{fn()}catch(x){}arm(7000);setTimeout(sync,120)};
    b.addEventListener('click',h);b.addEventListener('touchstart',function(e){e.stopPropagation()},{passive:true});b.addEventListener('mousedown',function(e){e.stopPropagation()});b.addEventListener('mouseup',function(e){e.stopPropagation()});b.addEventListener('touchend',function(e){e.stopPropagation()})}
  btn('islp',function(){if(act&&act.currentTime>4&&!(cur&&cur.radio)){act.currentTime=0}else nxt(-1)});
  btn('islnx',function(){nxt(1)});
  btn('islpp',function(){toggle();isl.classList.toggle('pl',playing())});

  /* seek: geser bar */
  var bar=$i('islb');
  function ratioOf(e){var p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e,r=bar.getBoundingClientRect();return Math.max(0,Math.min(1,(p.clientX-r.left)/r.width))}
  function dstart(e){e.stopPropagation();if(isl.classList.contains('live'))return;drag=1;bar.classList.add('drag');dmove(e);clearTimeout(hideT)}
  function dmove(e){if(!drag)return;e.stopPropagation();dragRatio=ratioOf(e);var d=act&&act.duration;$i('islu').style.transform='scaleX('+dragRatio+')';if(d>0&&isFinite(d))$i('islct').textContent=fmt(dragRatio*d)}
  function dend(e){if(!drag)return;e.stopPropagation();drag=0;bar.classList.remove('drag');var d=act&&act.duration;if(d>0&&isFinite(d)){try{act.currentTime=dragRatio*d}catch(x){}}arm(7000)}
  bar.addEventListener('touchstart',dstart,{passive:true});bar.addEventListener('touchmove',dmove,{passive:true});bar.addEventListener('touchend',dend);
  bar.addEventListener('mousedown',dstart);window.addEventListener('mousemove',function(e){if(drag)dmove(e)});window.addEventListener('mouseup',function(e){if(drag)dend(e)});

  /* ketuk di luar island = tutup */
  document.addEventListener('pointerdown',function(e){if(big&&!isl.contains(e.target))collapse()},true);

  /* uji coba dari Profil: tampilkan island */
  var _nt=window.notifTest;
  window.notifTest=function(){try{if(cur&&enabled()){started=1;lastId=null;sync();return}}catch(e){}if(_nt)_nt()};
  window.islandShow=function(){started=1;sync();expand(false)};
})();
