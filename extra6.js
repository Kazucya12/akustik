/* Midnight Acoustic v3.6 - Urungkan hapus, geser baris, geser mini-player, fade sleep timer, crossfade,
   warna aksen, tampilan kosong, getar halus, kontrol layar kunci, kartu bagikan. Dimuat setelah extra5.js. */
(function(){
  'use strict';
  var $1=function(s,r){return(r||document).querySelector(s)};
  function css(t){var s=document.createElement('style');s.textContent=t;document.head.appendChild(s)}
  var noClick=0;

  css('#un6{position:absolute;left:14px;right:14px;max-width:440px;margin:0 auto;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 142px);z-index:60;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 18px;border-radius:20px;overflow:hidden;background:var(--lgb,var(--c));color:var(--tx);border:1px solid var(--lgl,var(--b));-webkit-backdrop-filter:blur(22px) saturate(1.8);backdrop-filter:blur(22px) saturate(1.8);box-shadow:0 14px 36px var(--lgs,rgba(0,0,0,.35));font-size:13px;font-weight:600;transform:translateY(30px) scale(.96);opacity:0;pointer-events:none;transition:transform .4s cubic-bezier(.34,1.4,.64,1),opacity .25s}'
  +'#un6.on{transform:none;opacity:1;pointer-events:auto}'
  +'#un6 span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  +'#un6 button{flex:none;border:0;border-radius:14px;padding:9px 16px;font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--g,linear-gradient(135deg,var(--p),var(--p2)));cursor:pointer}'
  +'#un6 i{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--g,var(--p));transform-origin:left;transform:scaleX(0)}'
  +'#un6.on i{animation:un6 5.5s linear forwards}@keyframes un6{from{transform:scaleX(1)}to{transform:scaleX(0)}}'
  +'.rw{touch-action:pan-y}'
  +'html.sw6 #v,html.sw6 #sp{overflow-x:hidden}'
  +'.rw.swr,.rw.swl{position:relative;z-index:2;content-visibility:visible!important;contain:none!important}'
  +'.rw.swr:before,.rw.swl:before{position:absolute;top:2px;bottom:2px;width:170px;display:flex;align-items:center;font-size:12px;font-weight:700;color:#fff;border-radius:16px;opacity:.75;transition:opacity .15s,filter .15s}'
  +'.rw.swr:before{content:"\\FF0B  Antrean";right:100%;justify-content:flex-end;padding-right:14px;background:linear-gradient(90deg,transparent,var(--p))}'
  +'.rw.swl:before{content:"\\1F5D1  Hapus";left:100%;padding-left:14px;background:linear-gradient(90deg,#e0354f,transparent)}'
  +'.rw.swl.swf:before{content:"\\2665  Favorit";background:linear-gradient(90deg,#ff5f9e,transparent)}'
  +'.rw.rdy:before{opacity:1;filter:brightness(1.2)}'
  +'#mp.h6{display:none!important}'
  +'.ac6row{display:flex;flex-wrap:wrap;gap:12px;padding:6px 2px 10px}'
  +'.ac6{width:38px;height:38px;border-radius:50%;border:2px solid transparent;background:var(--c6);cursor:pointer;padding:0;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:transform .2s,border-color .2s;position:relative}'
  +'.ac6:active{transform:scale(.88)}.ac6.sel{border-color:var(--tx);transform:scale(1.08)}'
  +'.ac6.sel:after{content:"\\2713";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.5)}'
  +'.ac6.auto{background:conic-gradient(#ff5f6d,#ffc547,#2ed39a,#3da5ff,#8b7bff,#ff5fa2,#ff5f6d)}'
  +'.ac6.def{background:linear-gradient(135deg,#6d5dfc,#ff8a5b)}'
  +'.emp6{text-align:center;padding:26px 18px 22px;margin:14px 0;border-radius:26px;background:var(--c);border:1px solid var(--b)}'
  +'.emp6-i{width:118px;height:118px;display:block;margin:0 auto 10px;animation:emf 3.4s ease-in-out infinite}'
  +'@keyframes emf{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}'
  +'.emp6 b{display:block;font-size:17px;margin-bottom:6px}.emp6 small{display:block;color:var(--mu);line-height:1.55;margin:0 auto 16px;max-width:280px}'
  +'.emp6-b{display:flex;flex-direction:column;gap:8px}'
  +'.sc6{display:block;width:auto;max-width:100%;max-height:52vh;margin:0 auto 18px;border-radius:22px;box-shadow:0 14px 40px rgba(0,0,0,.45)}');

  /* ---------- Getar halus ---------- */
  window.hap6=function(n){if(cfg.hap===false)return;try{navigator.vibrate&&navigator.vibrate(n||6)}catch(e){}};
  window.hapTg=function(){cfg.hap=(cfg.hap===false);ls.set('cfg',cfg);if(cfg.hap!==false)hap6(14);setR()};
  document.addEventListener('click',function(e){
    if(Date.now()<noClick&&e.target.closest&&e.target.closest('#mp,.rw')){e.stopPropagation();e.preventDefault();return}
    var t=e.target.closest&&e.target.closest('button,.rw,.ft,.chip,.ib,.nav *,.ac6');
    if(t)hap6(t.matches('.dg .o,[onclick*="delS("],[onclick*="delV("]')?14:6)
  },true);

  /* ---------- Urungkan (undo) ---------- */
  var pend=null,unEl=null;
  function bar(){if(unEl&&unEl.isConnected)return unEl;unEl=document.createElement('div');unEl.id='un6';unEl.innerHTML='<span></span><button type="button">Urungkan</button><i></i>';
    unEl.querySelector('button').onclick=undoNow;(document.getElementById('app')||document.body).appendChild(unEl);return unEl}
  function hide(){if(unEl)unEl.classList.remove('on')}
  function flush(){if(!pend)return;clearTimeout(pend.t);var p=pend;pend=null;hide();try{p.commit&&p.commit()}catch(e){}}
  function undoNow(){if(!pend)return;clearTimeout(pend.t);var p=pend;pend=null;hide();hap6(12);try{p.revert&&p.revert()}catch(e){}}
  window.undo6=function(msg,commit,revert){flush();var el=bar();el.querySelector('span').textContent=msg;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
    pend={commit:commit,revert:revert,t:setTimeout(flush,5500)}};
  document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});
  addEventListener('pagehide',flush);

  window.delS=function(id){
    var s=songs.find(function(x){return x.id==id});if(!s)return;
    var idx=songs.indexOf(s);songs=songs.filter(function(x){return x.id!=id});
    if(cur&&cur.id==id){A.pause();B.pause();cur=null;clp();try{rn()}catch(e){}}
    go(pg);
    undo6('Lagu dihapus',function(){tx('readwrite',function(o){return o.delete(id)}).catch(function(){})},
      function(){songs.splice(Math.min(idx,songs.length),0,s);go(pg)});
  };
  window.delV=function(id){
    var v=vids.find(function(x){return x.id==id});if(!v)return;
    var idx=vids.indexOf(v);vids=vids.filter(function(x){return x.id!=id});ls.set('vids',vids);go(pg);
    undo6('Video dihapus',null,function(){vids.splice(Math.min(idx,vids.length),0,v);ls.set('vids',vids);go(pg)});
  };
  window.plDel=function(i){
    var p=pls[i];if(!p)return;pls.splice(i,1);ls.set('pls',pls);csp();
    undo6('Playlist dihapus',null,function(){pls.splice(Math.min(i,pls.length),0,p);ls.set('pls',pls);go(pg)});
  };
  window.histClr=function(){
    var old=hist;hist=[];ls.set('hist',hist);
    undo6('Riwayat putar dihapus',null,function(){hist=old;ls.set('hist',hist)});
  };

  /* ---------- Geser baris lagu: kanan = antrean, kiri = hapus / favorit ---------- */
  var sw={row:null};
  function selOn(){try{return !!(window.SEL&&SEL.on)}catch(e){return false}}
  document.addEventListener('touchstart',function(e){
    sw={row:null};if(e.touches.length!=1||selOn())return;
    var r=e.target.closest&&e.target.closest('.rw');if(!r||!r.closest('#v,#sp')||e.target.closest('input,select'))return;
    var m=(r.getAttribute('onclick')||'').match(/^P\('(\w+)',(\d+)\)/);if(!m)return;
    var t=lists[m[1]]&&lists[m[1]][+m[2]];if(!t)return;
    var p=e.touches[0];sw={row:r,t:t,x:p.clientX,y:p.clientY,dx:0,lock:0,del:null};
    var b=r.querySelector('button[onclick*="delS("],button[onclick*="delV("]');
    if(b){var mm=b.getAttribute('onclick').match(/(delS|delV)\('([^']+)'\)/);if(mm)sw.del=[mm[1],mm[2]]}
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!sw.row||!sw.t)return;var p=e.touches[0],dx=p.clientX-sw.x,dy=p.clientY-sw.y;
    if(!sw.lock){
      if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
      if(Math.abs(dx)>Math.abs(dy)*1.3){sw.lock=1;document.documentElement.classList.add('sw6');sw.row.style.transition='none'}else{sw.lock=-1;return}
    }
    if(sw.lock!==1)return;
    if(e.cancelable)e.preventDefault();
    sw.dx=dx;var d=Math.max(-170,Math.min(170,dx))*.85,r=sw.row;
    r.style.transform='translateX('+d+'px)';
    var right=dx>0,fav=!sw.del;
    r.classList.toggle('swr',right);r.classList.toggle('swl',!right);r.classList.toggle('swf',!right&&fav);
    var rdy=Math.abs(dx)>=90;if(rdy&&!r.classList.contains('rdy'))hap6(8);r.classList.toggle('rdy',rdy);
  },{passive:false});
  function swEnd(){
    var s=sw;sw={row:null};if(!s.row||s.lock!==1)return;
    noClick=Date.now()+400;var r=s.row,dx=s.dx;
    r.style.transition='transform .25s cubic-bezier(.2,.9,.3,1)';r.style.transform='';
    setTimeout(function(){r.classList.remove('swr','swl','swf','rdy');r.style.transition='';document.documentElement.classList.remove('sw6')},270);
    if(Math.abs(dx)<90)return;
    var t=s.t;
    if(dx>0){
      if(t.yt||t.radio){toast('Hanya lagu yang bisa masuk antrean');return}
      if(t.rec&&!t.url){toast('Lagu rekomendasi belum bisa diantrekan');return}
      hap6(14);
      if(!cur){play([t],0);toast('Diputar: '+ct(t.title))}else{q.push(t);toast('Masuk antrean: '+ct(t.title))}
    }else if(s.del){hap6(14);window[s.del[0]](s.del[1])}
    else{
      if(t.yt||t.radio||(t.rec&&!t.url)){toast('Ini belum bisa difavoritkan');return}
      hap6(14);
      if(isF(t)){favs=favs.filter(function(x){return x.id!=t.id});toast('Dihapus dari Favorit')}
      else{favs=favs.concat([svt(t)]);toast('Masuk Favorit')}
      ls.set('favs',favs);
    }
  }
  document.addEventListener('touchend',swEnd,{passive:true});
  document.addEventListener('touchcancel',function(){var s=sw;sw={row:null};if(s.row){s.row.style.transform='';s.row.classList.remove('swr','swl','swf','rdy');document.documentElement.classList.remove('sw6')}},{passive:true});

  /* ---------- Geser mini-player: atas = buka, bawah = tutup ---------- */
  var mpS=null;
  document.addEventListener('touchstart',function(e){
    mpS=null;var m=e.target.closest&&e.target.closest('#mp');if(!m||e.touches.length!=1||e.target.closest('button'))return;
    var p=e.touches[0];mpS={m:m,x:p.clientX,y:p.clientY,dy:0,lock:0};
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!mpS)return;var p=e.touches[0],dx=p.clientX-mpS.x,dy=p.clientY-mpS.y;
    if(!mpS.lock){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;mpS.lock=Math.abs(dy)>Math.abs(dx)?1:-1;if(mpS.lock===1)mpS.m.style.transition='none'}
    if(mpS.lock!==1)return;mpS.dy=dy;
    var d=dy>0?dy:dy*.4;mpS.m.style.transform='translateY('+d+'px)';mpS.m.style.opacity=dy>0?Math.max(.25,1-dy/160):1;
  },{passive:true});
  function mpEnd(){
    var s=mpS;mpS=null;if(!s||s.lock!==1)return;noClick=Date.now()+400;
    var m=s.m;m.style.transition='transform .25s ease,opacity .25s';m.style.transform='';m.style.opacity='';
    setTimeout(function(){m.style.transition=''},280);
    if(s.dy>56){hap6(12);try{A.pause();B.pause()}catch(e){}m.classList.add('h6');toast('Pemutar ditutup')}
    else if(s.dy<-48){hap6(8);openP()}
  }
  document.addEventListener('touchend',mpEnd,{passive:true});
  document.addEventListener('touchcancel',function(){var s=mpS;mpS=null;if(s){s.m.style.transform='';s.m.style.opacity=''}},{passive:true});
  [A,B].forEach(function(a){a.addEventListener('play',function(){var m=$('#mp');if(m)m.classList.remove('h6')})});

  /* ---------- Fade sleep timer + Crossfade (lewat xf yang dipanggil tiap tick) ---------- */
  var ghost=null,ghostT=0,cfIn=null,calling=0;
  function killGhost(){clearInterval(ghostT);if(ghost){try{ghost.pause();ghost.removeAttribute('src');ghost.load()}catch(e){}ghost=null}}
  function startCF(cf){
    var ni=shuf?Math.floor(Math.random()*q.length):qi+1;
    if(!shuf&&ni>=q.length){if(rep==1)ni=0;else return}
    var n=q[ni];if(!n||n.yt||n.radio||(n.rec&&!n.url)||(!n.loc&&!n.url))return;
    cur._cf6=1;killGhost();
    var o=act,g=new Audio(),v0=o.volume||1;
    try{g.src=o.currentSrc||o.src;g.currentTime=o.currentTime;g.volume=v0;g.playbackRate=o.playbackRate||1;g.play().catch(function(){})}catch(e){}
    ghost=g;g._t0=Date.now();
    calling=1;try{play(q,ni)}finally{calling=0}
    fv=.02;try{setVol()}catch(e){}
    cfIn={t0:performance.now(),ms:cf*1000};
    var t0=Date.now();ghostT=setInterval(function(){var p=(Date.now()-t0)/(cf*1000);if(p>=1||ghost!==g){killGhost();return}try{g.volume=Math.max(0,v0*(1-p))}catch(e){}},80);
  }
  var _play=play;
  play=function(l,i){if(!calling)killGhost();try{var t=l&&l[i];if(t)t._cf6=0}catch(e){}return _play.apply(this,arguments)};
  [A,B].forEach(function(a){a.addEventListener('pause',function(){setTimeout(function(){if(ghost&&act&&act.paused&&Date.now()-ghost._t0>400)killGhost()},450)})});
  var _xf=xf;
  xf=function(){
    _xf();var a=act;if(!a)return;
    try{
      if(slEnd){var rem=slEnd>0?(slEnd-Date.now())/1000:(isFinite(a.duration)?a.duration-a.currentTime:99),F=slEnd>0?20:8;if(rem<F)fv=Math.min(fv,Math.max(.02,rem/F))}
      if(cfIn){var p=(performance.now()-cfIn.t0)/cfIn.ms;if(p<1)fv=Math.min(fv,Math.max(.02,p));else cfIn=null}
      var cf=+cfg.cf||0;
      if(cf>0&&cur&&!a.paused&&!cur.radio&&!cur.yt&&!cur._cf6&&isFinite(a.duration)&&a.duration>cf*2+2&&q.length>1&&rep!==2&&slEnd!==-1&&!(ab&&(ab.a!=null||ab.b!=null))){
        var r2=a.duration-a.currentTime;if(r2<=cf&&r2>.4)startCF(cf);
      }
    }catch(e){}
  };
  var _slR=slR;
  slR=function(){_slR();var sp=$('#sp');if(!sp||sp.querySelector('[data-sl6]'))return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-sl6','1');d.setAttribute('onclick','slCustom()');
    d.innerHTML='<span>✎</span><div>Atur sendiri<br><small>Volume memudar pelan di 20 detik terakhir</small></div>';
    var last=sp.querySelector('.ft:last-of-type');if(last&&last.parentNode)last.parentNode.insertBefore(d,last);else sp.appendChild(d)};
  window.slCustom=function(){uiPrompt('Berapa menit lagi musik berhenti?','45',{title:'Sleep timer',placeholder:'Menit (1-720)',ok:'Atur',max:3}).then(function(v){
    if(v==null)return;var m=parseInt(v,10);if(!(m>=1&&m<=720)){toast('Masukkan 1 sampai 720 menit');return}slSet(m)})};

  /* ---------- Kontrol layar kunci ---------- */
  var _ms=ms;
  ms=function(){
    _ms();if(!('mediaSession' in navigator)||!cur)return;
    try{
      if(cur.img&&/^(https?:|data:|blob:)/.test(cur.img)){
        navigator.mediaSession.metadata=new MediaMetadata({title:cur.title,artist:cur.artist,album:'Midnight Acoustic',
          artwork:['96x96','128x128','192x192','256x256','384x384','512x512'].map(function(z){return{src:cur.img,sizes:z}})});
      }
      var h=function(n,f){try{navigator.mediaSession.setActionHandler(n,f)}catch(e){}};
      if(cur.radio){h('seekbackward',null);h('seekforward',null)}
      else{
        h('seekbackward',function(d){act.currentTime=Math.max(0,act.currentTime-((d&&d.seekOffset)||10))});
        h('seekforward',function(d){if(isFinite(act.duration))act.currentTime=Math.min(act.duration,act.currentTime+((d&&d.seekOffset)||10))});
      }
      h('stop',function(){act.pause()});
    }catch(e){}
  };

  /* ---------- Warna aksen ---------- */
  var accAuto=null;
  function hexHsl(h){var r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,H=0;
    if(mx!=mn){var d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);H=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;H*=60}return[H,s*100,l*100]}
  function hslHex(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l);function f(n){var k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return('0'+Math.round(c*255).toString(16)).slice(-2)}return'#'+f(0)+f(8)+f(4)}
  function accApply(){
    var s=document.documentElement.style,c=cfg.acc==='auto'?accAuto:cfg.acc;
    if(!c||!/^#[0-9a-f]{6}$/i.test(c)){['--p','--p2','--g'].forEach(function(k){s.removeProperty(k)});return}
    var h=hexHsl(c),light=document.documentElement.dataset.t==='light';
    var p2=hslHex(h[0],Math.min(h[1],95),light?Math.max(h[2]-10,28):Math.min(h[2]+14,82)),p3=hslHex((h[0]+24)%360,h[1],h[2]);
    s.setProperty('--p',c);s.setProperty('--p2',p2);s.setProperty('--g','linear-gradient(135deg,'+c+','+p3+')');
  }
  function autoAcc(t){
    if(!t||!t.img){accAuto=null;accApply();return}
    var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){if(cur!==t)return;try{
      var c=document.createElement('canvas');c.width=c.height=24;var x=c.getContext('2d');x.drawImage(im,0,0,24,24);
      var d=x.getImageData(0,0,24,24).data,best=null,bs=-1;
      for(var i=0;i<d.length;i+=4){var hs=hexHsl('#'+('0'+d[i].toString(16)).slice(-2)+('0'+d[i+1].toString(16)).slice(-2)+('0'+d[i+2].toString(16)).slice(-2));
        if(hs[2]<18||hs[2]>88)continue;var sc=hs[1]*(1-Math.abs(hs[2]-50)/60);if(sc>bs){bs=sc;best=hs}}
      if(best&&bs>12){accAuto=hslHex(best[0],Math.max(55,Math.min(best[1],90)),light6()?42:58);accApply()}
    }catch(e){}};
    im.src=t.img;
  }
  function light6(){return document.documentElement.dataset.t==='light'}
  var _thm=thm;thm=function(t){_thm(t);if(cfg.acc==='auto')autoAcc(t)};
  var _ac=applyCfg;applyCfg=function(){_ac();accApply()};
  window.accSet=function(c){cfg.acc=c||'';ls.set('cfg',cfg);if(c==='auto'){accAuto=null;autoAcc(cur)}hap6(8);accApply();setR()};
  accApply();

  var SW=[['#ff8a5b','Oranye'],['#ff5f6d','Merah'],['#ff5fa2','Pink'],['#8b7bff','Ungu'],['#3da5ff','Biru'],['#2ed39a','Hijau'],['#f5b301','Kuning']];
  function settingsHtml(){
    var cf=cfg.cf==null?0:+cfg.cf,ch=[[0,'Mati'],[3,'3 dtk'],[5,'5 dtk'],[8,'8 dtk']].map(function(x){return'<span class="chip '+(cf==x[0]?'a':'')+'" onclick="cfgSet(\'cf\','+x[0]+')">'+x[1]+'</span>'}).join('');
    var a=cfg.acc||'',sw='<button class="ac6 def'+(a?'':' sel')+'" aria-label="Bawaan" onclick="accSet(\'\')"></button>'
      +SW.map(function(x){return'<button class="ac6'+(a.toLowerCase()==x[0]?' sel':'')+'" style="--c6:'+x[0]+'" aria-label="'+x[1]+'" onclick="accSet(\''+x[0]+'\')"></button>'}).join('')
      +'<button class="ac6 auto'+(a==='auto'?' sel':'')+'" aria-label="Otomatis dari sampul" onclick="accSet(\'auto\')"></button>';
    return'<div class="sec"><h3>Crossfade antar lagu</h3></div><div class="chips">'+ch+'</div>'
      +'<div class="sec"><h3>Warna aksen</h3></div><div class="ac6row">'+sw+'</div><small style="display:block;margin:-2px 2px 8px">Bulat paling kanan: warna otomatis mengikuti sampul lagu.</small>'
      +'<div class="ft" onclick="hapTg()"><div>Getar halus<br><small>Getar singkat saat menekan tombol dan menggeser</small></div><i class="sw '+(cfg.hap!==false?'on':'')+'"></i></div>';
  }
  var _setR=setR;
  setR=function(){_setR();var sp=$('#sp');if(!sp)return;var tgt=null;sp.querySelectorAll('.sec h3').forEach(function(h){if(h.textContent==='Lainnya')tgt=h.parentNode});
    if(tgt&&!sp.querySelector('.ac6row'))tgt.insertAdjacentHTML('beforebegin',settingsHtml())};

  /* ---------- Tampilan kosong ---------- */
  function emptyCard(){
    return'<div class="emp6"><svg class="emp6-i" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="eg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--p2)"/><stop offset="1" style="stop-color:var(--p)"/></linearGradient></defs>'
      +'<circle cx="60" cy="60" r="54" fill="url(#eg6)" opacity=".16"/><circle cx="60" cy="60" r="40" fill="none" stroke="url(#eg6)" stroke-width="2" opacity=".55"/><circle cx="60" cy="60" r="26" fill="none" stroke="url(#eg6)" stroke-width="2" opacity=".35"/>'
      +'<path d="M54 78V42l28-8v32" fill="none" stroke="url(#eg6)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="47" cy="78" r="8" fill="url(#eg6)"/><circle cx="75" cy="66" r="8" fill="url(#eg6)"/></svg>'
      +'<b>Belum ada musik</b><small>Tambahkan lagu dari perangkatmu, cari musik online, atau bawa playlist dari Spotify.</small>'
      +'<div class="emp6-b"><button class="btn" onclick="pick()">＋ Tambah lagu</button><button class="btn g" onclick="go(\'explore\')">Cari musik online</button><button class="btn g" onclick="impOpen()">⇩ Impor dari Spotify / YouTube</button></div></div>';
  }
  var _prof=V.profile;
  V.profile=function(){var h=_prof.call(V);
    if(songs.length||favs.length||pls.length)return h;
    var m='<div><div class="ft" onclick="goSet()">';return h.indexOf(m)>-1?h.replace(m,emptyCard()+m):h};
  var _lib=V.library;
  V.library=function(){var h=_lib.call(V),e='<div class="em">Belum ada lagu. Tambahkan file musik atau pindai satu folder sekaligus.</div>';
    return h.indexOf(e)>-1?h.replace(e,emptyCard()):h};

  /* ---------- Kartu bagikan ---------- */
  function wrapTxt(x,t,w,max){var words=String(t).split(/\s+/),lines=[],l='';
    for(var i=0;i<words.length;i++){var n=l?l+' '+words[i]:words[i];if(x.measureText(n).width>w&&l){lines.push(l);l=words[i]}else l=n}
    if(l)lines.push(l);if(lines.length>max){lines=lines.slice(0,max);var s=lines[max-1];while(s.length>1&&x.measureText(s+'…').width>w)s=s.slice(0,-1);lines[max-1]=s+'…'}return lines}
  function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
  function drawCard(t,img){
    var W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
    var acc=getComputedStyle(document.documentElement).getPropertyValue('--p').trim()||'#6d5dfc',F='Sora, system-ui, -apple-system, sans-serif';
    var bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0b0f33');bg.addColorStop(1,'#04050f');x.fillStyle=bg;x.fillRect(0,0,W,H);
    if(img){x.save();x.globalAlpha=.5;try{x.filter='blur(70px)'}catch(e){}x.drawImage(img,-260,-60,W+520,W+520);x.restore()}
    x.save();x.globalAlpha=.4;var gl=x.createRadialGradient(W/2,730,40,W/2,730,820);gl.addColorStop(0,acc);gl.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gl;x.fillRect(0,0,W,H);x.restore();
    x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,W,H);
    x.textAlign='center';x.textBaseline='alphabetic';
    x.fillStyle='rgba(255,255,255,.72)';x.font='600 34px '+F;try{x.letterSpacing='9px'}catch(e){}x.fillText('SEDANG MENDENGARKAN',W/2,240);try{x.letterSpacing='0px'}catch(e){}
    var S=780,cx=(W-S)/2,cy=330;
    x.save();x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=90;x.shadowOffsetY=40;rr(x,cx,cy,S,S,72);x.fillStyle='#111';x.fill();x.restore();
    x.save();rr(x,cx,cy,S,S,72);x.clip();
    if(img){var m=Math.min(img.naturalWidth||S,img.naturalHeight||S)||S,sx=((img.naturalWidth||S)-m)/2,sy=((img.naturalHeight||S)-m)/2;x.drawImage(img,sx,sy,m,m,cx,cy,S,S)}
    else{var hu=(t.h!=null?t.h:hh(String(t.title||'')))%360,ga=x.createLinearGradient(cx,cy,cx+S,cy+S);ga.addColorStop(0,'hsl('+hu+',70%,52%)');ga.addColorStop(1,'hsl('+((hu+60)%360)+',70%,28%)');x.fillStyle=ga;x.fillRect(cx,cy,S,S);
      x.fillStyle='rgba(255,255,255,.85)';x.font='700 360px '+F;x.textBaseline='middle';x.fillText('\u266A',W/2,cy+S/2+10);x.textBaseline='alphabetic'}
    x.restore();
    x.fillStyle='#fff';x.font='700 68px '+F;var lines=wrapTxt(x,ct(t.title||'Tanpa judul'),900,2),y=1245;
    lines.forEach(function(l){x.fillText(l,W/2,y);y+=84});
    x.fillStyle='rgba(255,255,255,.72)';x.font='500 44px '+F;x.fillText(wrapTxt(x,t.artist||'',900,1)[0]||'',W/2,y+14);
    var seed=(typeof hh==='function'?hh(String(t.title||'')):7)||7,bw=16,gap=12,n=26,tw=n*bw+(n-1)*gap,bx=(W-tw)/2;
    x.fillStyle=acc;for(var i=0;i<n;i++){seed=(seed*1103515245+12345)&0x7fffffff;var bh=30+(seed%100)*1.1;x.globalAlpha=.55+(i%3)*.15;rr(x,bx+i*(bw+gap),1650-bh/2,bw,bh,8);x.fill()}x.globalAlpha=1;
    x.fillStyle='rgba(255,255,255,.9)';x.font='700 36px '+F;x.fillText('Midnight Acoustic',W/2,1810);
    x.fillStyle='rgba(255,255,255,.5)';x.font='500 28px '+F;x.fillText('Musik gratis, tanpa iklan',W/2,1856);
    return c;
  }
  function cardModal(blob,t){
    var url=URL.createObjectURL(blob),root=document.createElement('div');root.className='ud';
    root.innerHTML='<div class="udc" role="dialog" aria-modal="true"><h3>Kartu bagikan</h3><img class="sc6" alt="" src="'+url+'"><div class="udb"><button type="button" class="c">Tutup</button><button type="button" class="o">Bagikan</button></div></div>';
    function close(){document.removeEventListener('keydown',key,true);root.classList.remove('on');setTimeout(function(){root.remove();URL.revokeObjectURL(url)},230)}
    function key(e){if(e.key=='Escape'){e.stopPropagation();close()}}
    document.addEventListener('keydown',key,true);
    root.addEventListener('mousedown',function(e){if(e.target===root)close()});
    root.querySelector('.c').onclick=close;
    root.querySelector('.o').onclick=function(){
      var f=new File([blob],'midnight-acoustic.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:t.title,text:'Sedang mendengarkan '+t.title+' - '+t.artist}).catch(function(){});
      else{var a=document.createElement('a');a.href=url;a.download='midnight-acoustic.png';document.body.appendChild(a);a.click();a.remove();toast('Gambar disimpan')}
    };
    (document.getElementById('app')||document.body).appendChild(root);
    requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('on')})});
    if(window.hap6)hap6(10);
  }
  window.shareCard=function(){
    var t=cur;if(!t){toast('Putar lagu dulu');return}
    var src='';try{src=cov(t)}catch(e){}
    var done=0;function go1(img){if(done)return;done=1;var c=drawCard(t,img);c.toBlob(function(b){if(b)cardModal(b,t);else toast('Gagal membuat kartu')},'image/png')}
    if(!src){go1(null);return}
    var im=new Image();im.crossOrigin='anonymous';im.onload=function(){go1(im)};im.onerror=function(){go1(null)};im.src=src;
    setTimeout(function(){go1(null)},4000);
  };
  var _rp=rp;
  rp=function(){_rp.apply(this,arguments);try{
    var a=$('#pl .act');if(!a||a.querySelector('[data-sc6]'))return;
    var b=document.createElement('button');b.setAttribute('data-sc6','1');b.setAttribute('aria-label','Bagikan kartu');b.setAttribute('onclick','shareCard()');
    b.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>';
    a.appendChild(b)}catch(e){}};
})();
