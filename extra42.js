/* v4.42: (1) "Lanjutkan" juga untuk lagu YouTube, (2) pencarian suara lewat jembatan native di APK,
   (3) Kartu profil untuk dibagikan (gambar). Dimuat setelah extra41.js. */
(function(){
  /* ---------- 1. Lanjutkan: dukung lagu YouTube ---------- */
  var _save=saveLast,_resume=resume;
  window.saveLast=function(){
    try{if(cur&&cur.yt&&act){var p=Math.floor(act.currentTime||0);if(p>0)ls.set('last',{t:{id:cur.id,yt:1,vid:cur.vid,title:cur.title,artist:cur.artist,img:cur.img},p:p,ts:Date.now()});return}}catch(e){}
    return _save.apply(this,arguments)};
  window.resume=function(){
    try{var l=ls.get('last',null),t=l&&l.t;
      if(t&&t.yt&&t.vid){vS0=l.p>3?l.p:0;playV([t],0,true);openP();return}}catch(e){}
    return _resume.apply(this,arguments)};
  setInterval(function(){try{if(cur&&cur.yt&&act&&act.paused===false)saveLast()}catch(e){}},10000);

  /* ---------- 2. Pencarian suara (APK) ---------- */
  var _vSr=vSr;
  window.vSr=function(){var N=window.LoopifyNative;if(N&&N.voice){try{N.voice();return}catch(e){}}return _vSr.apply(this,arguments)};
  window.x42voice=function(t){t=String(t||'').trim();if(!t){toast('Suara tidak terbaca');return}toast('🎤 '+t);qs(t)};

  /* ---------- 3. Kartu profil ---------- */
  function top(o,n){return Object.keys(o||{}).map(function(k){return[k,+o[k]||0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,n)}
  function rr(x,X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath()}
  function img(src){return new Promise(function(ok){if(!src)return ok(null);var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){ok(null)};i.src=src})}
  function fit(x,t,max){t=String(t);if(x.measureText(t).width<=max)return t;while(t.length>1&&x.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…'}
  function hh(sec){return sec>=3600?(sec/3600).toFixed(1)+' jam':Math.max(1,Math.round(sec/60))+' menit'}
  window.x42Card=async function(){
    var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b0d22');g.addColorStop(.55,'#241a3a');g.addColorStop(1,'#5a2a45');x.fillStyle=g;x.fillRect(0,0,W,H);
    var r=x.createRadialGradient(W*.8,H*.12,0,W*.8,H*.12,520);r.addColorStop(0,'rgba(255,107,154,.45)');r.addColorStop(1,'rgba(255,107,154,0)');x.fillStyle=r;x.fillRect(0,0,W,H);
    var pf=ls.get('pf36',{}),name=(typeof nm==='function'?nm():'Pengguna'),t=window.x39cur?x39cur():null;
    var av=await img(pf.photo);
    /* foto / inisial */
    x.save();x.beginPath();x.arc(W/2,300,150,0,7);x.closePath();x.clip();
    if(av){var s=Math.min(av.width,av.height);x.drawImage(av,(av.width-s)/2,(av.height-s)/2,s,s,W/2-150,150,300,300)}
    else{var ag=x.createLinearGradient(W/2-150,150,W/2+150,450);ag.addColorStop(0,'#ff9a5c');ag.addColorStop(1,'#ff4f7a');x.fillStyle=ag;x.fillRect(W/2-150,150,300,300);x.fillStyle='#fff';x.font='800 150px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText((name[0]||'?').toUpperCase(),W/2,308)}
    x.restore();x.lineWidth=8;x.strokeStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(W/2,300,150,0,7);x.stroke();
    /* nama + ikon title */
    x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#fff';x.font='800 72px sans-serif';
    var nmT=fit(x,name,720),nw=x.measureText(nmT).width,ix=0;
    var ico=null;if(t){ico=await img('data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="160" height="160">'+t.s+'</svg>'))}
    var tw=ico?96:0,gap=ico?18:0,start=(W-(nw+gap+tw))/2;
    x.textAlign='left';x.fillText(nmT,start,560);
    if(ico){var cx=start+nw+gap+48,cy=533;x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.arc(cx,cy,48,0,7);x.fill();x.lineWidth=5;x.strokeStyle=t.c;x.stroke();x.drawImage(ico,cx-36,cy-36,72,72)}
    if(pf.bio){x.textAlign='center';x.fillStyle='rgba(255,255,255,.7)';x.font='400 34px sans-serif';x.fillText(fit(x,pf.bio,860),W/2,620)}
    /* statistik */
    var tot=(+stt.tot||0),st=[[hh(tot),'Total dengar'],[String((songs||[]).length+(favs||[]).length),'Lagu & favorit'],[String(Object.keys(stt.ar||{}).length),'Artis']];
    st.forEach(function(a,i){var bx=70+i*320,by=680;x.fillStyle='rgba(255,255,255,.09)';rr(x,bx,by,300,170,28);x.fill();
      x.textAlign='center';x.fillStyle='#fff';x.font='800 50px sans-serif';x.fillText(fit(x,a[0],270),bx+150,by+82);x.fillStyle='rgba(255,255,255,.65)';x.font='400 28px sans-serif';x.fillText(a[1],bx+150,by+128)});
    /* artis teratas */
    x.textAlign='left';x.fillStyle='rgba(255,255,255,.7)';x.font='700 30px sans-serif';x.fillText('ARTIS TERATAS',80,935);
    var ta=top(stt.ar,3);if(!ta.length){x.fillStyle='rgba(255,255,255,.5)';x.font='400 34px sans-serif';x.fillText('Belum ada data. Putar lagu dulu.',80,1005)}
    ta.forEach(function(a,i){var y=1000+i*88;x.fillStyle=i==0?'#ffb36b':'rgba(255,255,255,.5)';x.font='800 44px sans-serif';x.fillText(String(i+1),80,y);
      x.fillStyle='#fff';x.font='700 42px sans-serif';x.fillText(fit(x,a[0],600),150,y);x.fillStyle='rgba(255,255,255,.6)';x.font='400 32px sans-serif';x.textAlign='right';x.fillText(hh(a[1]),1000,y);x.textAlign='left'});
    /* logo */
    var lg=null;try{var m=String(typeof logo==='string'?logo:'').match(/src="([^"]+)"/);if(m)lg=await img(m[1])}catch(e){}
    if(lg){x.save();rr(x,80,1262,56,56,14);x.clip();x.drawImage(lg,80,1262,56,56);x.restore()}
    x.fillStyle='rgba(255,255,255,.85)';x.font='800 34px sans-serif';x.textAlign='left';x.fillText('Loopify',lg?152:80,1302);
    return new Promise(function(ok){c.toBlob(function(b){ok(b)},'image/png')})};
  var BLOB=null,URL42=null;
  window.goCard42=async function(){rbP=0;sub(shd('Kartu Profil')+'<div class="em" id="x42w">Membuat kartu…</div>');
    try{BLOB=await x42Card();if(URL42)URL.revokeObjectURL(URL42);URL42=URL.createObjectURL(BLOB);
      sub(shd('Kartu Profil')+'<img src="'+URL42+'" alt="Kartu profil" style="width:100%;border-radius:22px;display:block"><button class="btn" style="margin-top:14px" onclick="x42Share()">Bagikan / simpan</button>')}
    catch(e){var w=document.getElementById('x42w');if(w)w.textContent='Gagal membuat kartu'}};
  window.x42Share=async function(){if(!BLOB)return;var f=new File([BLOB],'loopify-profil.png',{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Profil Loopify'});return}}catch(e){if(e&&e.name==='AbortError')return}
    var a=document.createElement('a');a.href=URL42;a.download='loopify-profil.png';document.body.appendChild(a);a.click();a.remove();toast('Kartu disimpan')};
  function apply(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x42]'))return;var h=v.querySelector('h1');if(!h||h.textContent!=='Profil')return;
    var tb=v.querySelector('[data-x39b]');if(!tb)return;
    var b=document.createElement('button');b.className='btn g';b.setAttribute('data-x42','1');b.textContent='🖼 Kartu profil';b.setAttribute('onclick','goCard42()');tb.appendChild(b)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,200)}).observe(document.getElementById('v'),{childList:true})}catch(e){}
  apply();
})();
