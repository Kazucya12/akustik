/* Loopify v4.5 - Dynamic Island: notifikasi "sedang diputar" gaya iPhone, interaktif.
   - Lagu ganti/mulai : pil membesar (foto penyanyi, judul, lirik berjalan, seekbar, prev/play/next), lalu mengecil sendiri.
   - Pil kecil        : foto + equalizer animasi. Ketuk untuk membuka, tahan untuk putar/jeda.
   - Lirik            : tersinkron (LRC) dengan baris aktif di tengah, ketuk baris = lompat. Lirik biasa bergulir mengikuti progres.
   - Foto             : cover asli lagu; kalau tidak ada / video YouTube, dicari foto yang cocok dengan penyanyi (iTunes), lalu inisial penyanyi.
   - Ringan           : animasi hanya transform/opacity, update progres via requestAnimationFrame hanya saat terbuka dan memutar.
   Mati lewat cfg.npn=false. Dimuat setelah extra14.js. */
(function(){
  'use strict';
  if(typeof document==='undefined')return;
  var app=document.getElementById('app');if(!app)return;
  var isl=document.createElement('div');isl.id='isl';
  var SV={prev:'<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    ly:'<svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1zm3 4v2h10V8zm0 4v2h7v-2z"/></svg>'};
  var EQ='<span class="eq"><i></i><i></i><i></i><i></i></span>';
  isl.innerHTML='<div class="bgc"><img alt="" id="islbg" decoding="async"></div><div class="ic"><img alt="" id="islc" decoding="async">'+EQ+'</div>'+
    '<div class="ex"><div class="tp"><img alt="" id="islc2" decoding="async"><div class="tt"><b><span class="mq" id="islt"></span></b><span id="isla"></span></div>'+EQ+'</div>'+
    '<div class="ly" id="islly"><div class="lst" id="isllst"></div><div class="lm" id="islm"></div></div>'+
    '<div class="sk"><em id="islct">0:00</em><div class="bar" id="islb"><u id="islu"></u></div><em id="isldu">0:00</em></div>'+
    '<div class="cb"><span></span><button id="islp" aria-label="Sebelumnya">'+SV.prev+'</button><button class="pp" id="islpp" aria-label="Putar atau jeda"><span class="i1">'+SV.play+'</span><span class="i2">'+SV.pause+'</span></button><button id="islnx" aria-label="Berikutnya">'+SV.next+'</button><button class="lb on" id="islly2" aria-label="Tampilkan lirik">'+SV.ly+'</button></div></div>';
  app.appendChild(isl);
  var $i=function(id){return document.getElementById(id)};
  var el={bg:$i('islbg'),c:$i('islc'),c2:$i('islc2'),t:$i('islt'),a:$i('isla'),ly:$i('islly'),lst:$i('isllst'),lm:$i('islm'),u:$i('islu'),ct:$i('islct'),du:$i('isldu'),bar:$i('islb'),lb:$i('islly2')};
  var started=0,big=false,hideT=0,lastId=null,lastTitle='',drag=0,dragRatio=0,lpT=0,lpFired=0,sx=0,sy=0,moved=0,raf=0,isPl=false,isShow=false,gone=0,vt=0;
  var lastR=-1,lastS=-1,lastD='',lyKey='',lyMode='',lyEls=[],lyT=[],lyI=-2,lyY=-1,lyOn=true;
  try{lyOn=localStorage.getItem('ma_isl_ly')!=='0'}catch(e){}
  el.lb.classList.toggle('on',lyOn);
  var fmt=function(s){return(typeof f2==='function')?f2(s):'0:00'};
  function enabled(){try{return cfg.npn!==false}catch(e){return true}}
  function vib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
  function playing(){try{return !!(cur&&act&&!act.paused)}catch(e){return false}}
  function playerOpen(){var p=document.getElementById('pl'),v=document.getElementById('vo'),k=document.getElementById('kr');
    return !!((p&&p.classList.contains('on'))||(v&&v.classList.contains('on'))||(k&&k.classList.contains('on')))}

  /* ---------- foto sesuai penyanyi ---------- */
  var ART_KEY='ma_isl_art',artC={},artNeg={};
  try{artC=JSON.parse(localStorage.getItem(ART_KEY)||'{}')||{}}catch(e){artC={}}
  function saveArt(){try{var k=Object.keys(artC);if(k.length>160){k.slice(0,40).forEach(function(x){delete artC[x]})}localStorage.setItem(ART_KEY,JSON.stringify(artC))}catch(e){}}
  var BAD=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio|YouTube|Internet Archive|Various Artists|Unknown( Artist)?)$/i;
  function norm(s){return String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyrics?|lirik|video|music|audio|mv|hd|hq|klip|feat|ft|topic|vevo)\b/g,' ').replace(/[^a-z0-9À-￿ ]+/g,' ').replace(/\s+/g,' ').trim()}
  function who(t){
    var ti=String(t.title||''),ar=String(t.artist||'').replace(/\s*-\s*Topic$/i,'').replace(/VEVO$/i,'').trim();
    if(BAD.test(ar))ar='';
    if(t.yt||!ar){
      var z=ti.replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\s+/g,' ').trim(),m=z.split(/\s[-–—|]\s/);
      if(m.length>1){ar=m[0].trim();ti=m.slice(1).join(' ').trim()}
    }
    return{a:ar,t:ti}
  }
  function initials(name){
    var n=String(name||'').trim()||'♪',w=n.split(/\s+/).filter(Boolean),s=(w.length>1?w[0].charAt(0)+w[1].charAt(0):n.slice(0,2)).toUpperCase().replace(/[&<>"']/g,''),h=0;
    for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',70%,56%)"/><stop offset="1" stop-color="hsl('+((h+50)%360)+',70%,34%)"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><text x="48" y="61" font-family="Sora,Arial,sans-serif" font-size="38" font-weight="700" text-anchor="middle" fill="#fff">'+s+'</text></svg>';
    return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)
  }
  var coverSrc='';
  function setCover(src,fb){
    if(src===coverSrc)return;coverSrc=src;
    [el.c,el.c2,el.bg].forEach(function(im){im.onerror=function(){this.onerror=null;this.src=fb};im.src=src});
  }
  async function itunes(term,entity){
    var ctl=typeof AbortController==='function'?new AbortController():null,to=setTimeout(function(){try{ctl&&ctl.abort()}catch(e){}},7000);
    try{
      var r=await fetch('https://itunes.apple.com/search?media=music&limit=8&entity='+entity+'&term='+encodeURIComponent(term),ctl?{signal:ctl.signal}:{});
      if(!r.ok)return null;var j=await r.json();return j.results||[];
    }catch(e){return null}finally{clearTimeout(to)}
  }
  function pickArt(rs,a,ti){
    var na=norm(a),nt=norm(ti),best=null;
    for(var i=0;i<(rs||[]).length;i++){
      var r=rs[i],ra=norm(r.artistName),rt=norm(r.trackName||r.collectionName);
      var am=!!(na&&ra&&(ra.indexOf(na)>=0||na.indexOf(ra)>=0)),tm=!!(nt&&rt&&(rt.indexOf(nt)>=0||nt.indexOf(rt)>=0));
      if(na?am:tm){if(!best)best=r;if(am&&tm){best=r;break}}
    }
    var u=best&&best.artworkUrl100;
    return(u&&/^https:\/\/[^\/]*mzstatic\.com\//.test(u))?u.replace(/\/\d+x\d+bb\.(jpg|png)/,'/600x600bb.$1'):'';
  }
  async function findArt(w,key,id){
    var u='',rs=await itunes((w.a+' '+w.t).trim(),'song');
    if(rs===null)return;                                   /* jaringan gagal: coba lagi lain waktu */
    u=pickArt(rs,w.a,w.t);
    if(!u&&w.a){rs=await itunes(w.a,'album');if(rs===null)return;u=pickArt(rs,w.a,'')}
    if(!u){artNeg[key]=1;return}
    artC[key]=u;saveArt();
    if(cur&&cur.id===id)setCover(u,initials(w.a||w.t));
  }
  function coverFor(t){
    var w=who(t),key=norm(w.a)+'|'+norm(w.t),fb=initials(w.a||t.artist||t.title);
    var real=t.img&&!/icon-(192|512)|maskable/.test(t.img)&&!t.yt;
    if(real){setCover(t.img,fb);return}
    if(artC[key]){setCover(artC[key],fb);return}
    setCover((t.yt&&t.img)?t.img:fb,fb);                    /* sementara: thumbnail video / inisial penyanyi */
    if(artNeg[key]||(!w.a&&!w.t)||t.radio)return;
    findArt(w,key,t.id).catch(function(){});
  }

  /* ---------- lirik ---------- */
  function lyState(t){
    if(t.radio)return'none';
    var L=lyc[t.id];if(L)return isLrc(L)?'sync':'plain';
    try{return lyS[t.id]==='none'?'none':'load'}catch(e){return'load'}
  }
  function buildLy(t,mode,L){
    el.lst.textContent='';lyEls=[];lyT=[];lyI=-2;lyY=-1;el.lst.style.transform='translate3d(0,0,0)';
    var frag=document.createDocumentFragment(),lines=[];
    if(mode==='sync'){var al=alOf(t)||[];al.forEach(function(x){lines.push(x.s||'♪');lyT.push(x.t)})}
    else lines=String(L).split(/\r?\n/).map(function(s){return s.trim()}).filter(Boolean).slice(0,300);
    lines.forEach(function(s,i){var p=document.createElement('p');p.textContent=s;p.setAttribute('data-i',i);frag.appendChild(p);lyEls.push(p)});
    el.lst.appendChild(frag);
    el.ly.classList.toggle('pn',mode==='plain');
  }
  function setLine(i){
    if(i===lyI)return;
    if(lyI>=0&&lyEls[lyI])lyEls[lyI].classList.remove('c');
    lyI=i;
    if(i>=0&&lyEls[i]){var p=lyEls[i];p.classList.add('c');el.lst.style.transform='translate3d(0,'+(-(p.offsetTop+p.offsetHeight/2-54))+'px,0)'}
    else el.lst.style.transform='translate3d(0,0,0)';
  }
  function syncLy(){
    var t=cur;if(!t)return;
    try{if(!t.radio&&!lyTry[t.id]&&typeof fetchLy==='function')fetchLy(t)}catch(e){}
    var st=lyState(t),L=lyc[t.id]||'',key=t.id+'|'+st+'|'+L.length;
    if(key!==lyKey){
      lyKey=key;lyMode=st;
      if(st==='sync'||st==='plain')buildLy(t,st,L);else{el.lst.textContent='';lyEls=[];lyT=[];lyI=-2}
      el.lm.textContent=st==='load'?'Memuat lirik…':(st==='none'?'Lirik tidak tersedia':'');
    }
    var nl=!(lyOn&&st!=='none');
    if(isl.classList.contains('nl')!==nl)isl.classList.toggle('nl',nl);
  }

  /* ---------- buka / tutup ---------- */
  function expand(auto){
    if(big)return;big=true;isl.classList.add('big');vib(10);
    lastR=-1;lastS=-1;lastD='';lyI=-2;marquee();arm(auto?5200:8000);upd();kick();
  }
  function stay(){clearTimeout(vt);if(isShow)vt=setTimeout(hideIsl,8000)}
  function hideIsl(){if(drag){stay();return}gone=1;collapse();slow()}
  function collapse(){if(!big)return;big=false;isl.classList.remove('big');clearTimeout(hideT)}
  function arm(ms){clearTimeout(hideT);hideT=setTimeout(function(){if(drag){arm(2000);return}collapse()},ms)}
  function marquee(){
    var m=el.t;m.classList.remove('run');m.style.removeProperty('--mx');
    setTimeout(function(){var w=m.parentNode.clientWidth,s=m.scrollWidth;if(s>w+2){m.style.setProperty('--mx',-(s-w+40)+'px');m.classList.add('run')}},560);
  }
  function setTrack(){
    var t=cur;if(!t)return;
    coverFor(t);
    var ti=t.title||'Tanpa judul';
    el.t.textContent=ti;el.a.textContent=who(t).a||t.artist||(t.radio?'Radio':(t.yt?'YouTube':'Loopify'));
    isl.title=ti;lastTitle=ti;lyKey='';if(big)marquee();
  }

  /* ---------- update (progres + lirik) ---------- */
  function upd(){
    var a=act;if(!big||!a||!cur)return;
    var c=a.currentTime||0,d=a.duration,live=!!cur.radio||!(d>0&&isFinite(d));
    if(isl.classList.contains('live')!==live)isl.classList.toggle('live',live);
    if(!drag){
      var r=live?0:Math.min(1,c/d);
      if(Math.abs(r-lastR)>.0004){lastR=r;el.u.style.transform='scaleX('+r+')'}
      var s=Math.floor(c);if(s!==lastS){lastS=s;el.ct.textContent=fmt(c)}
      var ds=cur.radio?'LIVE':fmt(d);if(ds!==lastD){lastD=ds;el.du.textContent=ds}
    }
    if(lyMode==='sync'&&lyT.length){
      var ct=c+.25,i=lyI<0?-1:lyI;
      if(i>=0&&lyT[i]>ct)i=-1;
      while(i+1<lyT.length&&lyT[i+1]<=ct)i++;
      setLine(i);
    }else if(lyMode==='plain'&&lyEls.length&&!live){
      var y=Math.round(Math.min(1,c/d)*Math.max(0,el.lst.scrollHeight-100));
      if(y!==lyY){lyY=y;el.lst.style.transform='translate3d(0,'+(-y)+'px,0)'}
    }
  }
  function frame(){raf=0;if(!big||document.hidden)return;upd();if(playing())raf=requestAnimationFrame(frame)}
  function kick(){if(!raf&&big&&!document.hidden&&playing())raf=requestAnimationFrame(frame)}

  /* ---------- sinkron ringan (status, ganti lagu) ---------- */
  function slow(){
    if(document.hidden)return;
    if(!started&&cur&&playing())started=1;
    var on=!!(enabled()&&started&&cur);
    if(on&&(cur.id!==lastId||(cur.title||'Tanpa judul')!==lastTitle))gone=0;
    var vis=on&&!playerOpen()&&!gone;
    if(vis!==isShow){isShow=vis;if(vis)stay();isl.classList.toggle('show',vis);document.body.classList.toggle('isl-on',vis)}
    if(!on){if(big)collapse();return}
    if(!vis&&big)collapse();
    var p=playing();if(p!==isPl){isPl=p;isl.classList.toggle('pl',p)}
    if(cur.id!==lastId||(cur.title||'Tanpa judul')!==lastTitle){lastId=cur.id;setTrack();if(vis){expand(true);stay()}}
    syncLy();
    if(big){upd();kick()}
  }
  setInterval(slow,400);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)slow()});
  function onPlay(){started=1;slow()}
  try{[A,B].forEach(function(a){a.addEventListener('play',onPlay);a.addEventListener('pause',slow)})}catch(e){}
  var _ms=window.ms;
  if(typeof _ms==='function'){window.ms=function(){var r=_ms.apply(this,arguments);if(cur&&(playing()||cur.yt))started=1;setTimeout(slow,60);return r}}

  /* ---------- interaksi ---------- */
  function press(e){
    if(e.target.closest('button')||e.target.closest('#islb'))return;
    var p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;moved=0;lpFired=0;
    if(!big){lpT=setTimeout(function(){lpFired=1;vib(14);try{toggle()}catch(e){}isl.classList.remove('pop');void isl.offsetWidth;isl.classList.add('pop');setTimeout(slow,120)},520)}
  }
  function mv(e){var p=e.touches?e.touches[0]:e;if(Math.abs(p.clientX-sx)+Math.abs(p.clientY-sy)>8){moved=1;clearTimeout(lpT)}}
  function rel(e){
    clearTimeout(lpT);
    var tg=e.target;
    if(tg.closest&&(tg.closest('button')||tg.closest('#islb')||tg.closest('#islly')))return;
    var p=(e.changedTouches&&e.changedTouches[0])||e,dy=p.clientY-sy;
    if(lpFired){lpFired=0;return}
    if(big){
      if(moved&&dy<-24){collapse();return}
      if(!moved){if(tg.closest('.tp')){collapse();try{openP()}catch(x){}}else arm(8000)}
    }else if(!moved||dy>16){expand(false)}
  }
  isl.addEventListener('touchstart',press,{passive:true});isl.addEventListener('touchmove',mv,{passive:true});isl.addEventListener('touchend',rel);
  isl.addEventListener('mousedown',press);isl.addEventListener('mousemove',function(e){if(e.buttons)mv(e)});isl.addEventListener('mouseup',rel);
  isl.addEventListener('mouseleave',function(){clearTimeout(lpT)});

  function btn(b,fn){var h=function(e){e.stopPropagation();vib(8);try{fn()}catch(x){}arm(8000);stay();setTimeout(slow,120)};
    b.addEventListener('click',h);['touchstart','mousedown','mouseup','touchend'].forEach(function(n){b.addEventListener(n,function(e){e.stopPropagation()},{passive:true})})}
  btn($i('islp'),function(){if(act&&act.currentTime>4&&!(cur&&cur.radio)){act.currentTime=0}else nxt(-1)});
  btn($i('islnx'),function(){nxt(1)});
  btn($i('islpp'),function(){toggle();var p=playing();isPl=p;isl.classList.toggle('pl',p);kick()});
  btn(el.lb,function(){lyOn=!lyOn;el.lb.classList.toggle('on',lyOn);try{localStorage.setItem('ma_isl_ly',lyOn?'1':'0')}catch(e){}syncLy();lyI=-2;setTimeout(upd,60)});

  /* ketuk baris lirik tersinkron = lompat ke baris itu */
  el.ly.addEventListener('click',function(e){
    var p=e.target.closest&&e.target.closest('p');arm(8000);
    if(!p||lyMode!=='sync')return;var i=+p.getAttribute('data-i');
    if(lyT[i]!=null){try{act.currentTime=Math.max(0,lyT[i])}catch(x){}vib(8);lyI=-2;setTimeout(function(){upd();kick()},60)}
  });

  /* seek: geser bar */
  var bar=el.bar;
  function ratioOf(e){var p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e,r=bar.getBoundingClientRect();return Math.max(0,Math.min(1,(p.clientX-r.left)/r.width))}
  function dstart(e){e.stopPropagation();if(isl.classList.contains('live'))return;drag=1;bar.classList.add('drag');dmove(e);clearTimeout(hideT)}
  function dmove(e){if(!drag)return;e.stopPropagation();dragRatio=ratioOf(e);var d=act&&act.duration;el.u.style.transform='scaleX('+dragRatio+')';if(d>0&&isFinite(d))el.ct.textContent=fmt(dragRatio*d)}
  function dend(e){if(!drag)return;e.stopPropagation();drag=0;bar.classList.remove('drag');var d=act&&act.duration;if(d>0&&isFinite(d)){try{act.currentTime=dragRatio*d}catch(x){}}lastR=-1;lastS=-1;lyI=-2;arm(8000);stay();setTimeout(function(){upd();kick()},60)}
  bar.addEventListener('touchstart',dstart,{passive:true});bar.addEventListener('touchmove',dmove,{passive:true});bar.addEventListener('touchend',dend);
  bar.addEventListener('mousedown',dstart);window.addEventListener('mousemove',function(e){if(drag)dmove(e)});window.addEventListener('mouseup',function(e){if(drag)dend(e)});

  /* ketuk di luar island = tutup */
  document.addEventListener('pointerdown',function(e){if(big&&!isl.contains(e.target)){collapse();stay()}},true);

  /* tombol "Coba notifikasi" di Profil: tampilkan island */
  var _nt=window.notifTest;
  window.notifTest=function(){try{if(cur&&enabled()){started=1;lastId=null;slow();return}}catch(e){}if(_nt)_nt()};
  window.islandShow=function(){started=1;gone=0;slow();expand(false);stay()};
})();
