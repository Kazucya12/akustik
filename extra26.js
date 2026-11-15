/* Loopify v4.24 - (1) kartu "Hasil teratas" di pencarian, (2) simpan Album + tab Album di Library,
   (3) notifikasi rilis baru dari artis yang diikuti (cek saat aplikasi dibuka + Periodic Sync di PWA yang terpasang).
   Dimuat setelah extra25.js (pasangan extra26.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;var d=function(x){return x.toFixed(1).replace('.0','').replace('.',',')};return n>=1e9?d(n/1e9)+' M':n>=1e6?d(n/1e6)+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}

  /* ================= 1. Hasil teratas ================= */
  function top(){
    var b=Q('#x16'),qi=Q('#qi');if(!b||!qi)return;
    var q=low(typeof lq=='string'?lq:'');
    var old=Q('[data-x26t]',b);
    if(!q||q.length<2){if(old)old.remove();return}
    var f=Q('#x16f .chip.a');if(f&&f.textContent!=='Semua'){if(old)old.remove();return}
    var A=window.x16A||[],a=A[0],h='';
    var rel=function(n){var x=low(n);return x&&(x.indexOf(q)>=0||q.indexOf(x)>=0)};
    if(a&&rel(a.name)){
      h='<div class="x26t" onclick="x16AG(0)"><img src="'+E(cov(a.img?{img:a.img}:{h:hh(a.name)}))+'" class="r" alt=""><b>'+E(a.name)+'</b><small><i>Artis</i>'+(a.subs?' · '+fmtN(a.subs)+' subscriber':'')+'</small><span class="x26p">▶</span></div>';
    }else if(typeof lres!='undefined'&&lres&&lres[0]){
      var t=lres[0];
      h='<div class="x26t" onclick="P(\'sr\',0)"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small><i>Lagu</i> · '+E(t.artist||'')+'</small><span class="x26p">▶</span></div>';
    }
    var sig=h?h.length+q:'';
    if(old&&old.getAttribute('data-x26t')==sig)return;
    if(old)old.remove();
    if(!h)return;
    var d=document.createElement('div');d.setAttribute('data-x26t',sig);
    d.innerHTML='<div class="sec"><h3>Hasil teratas</h3></div>'+h;
    b.insertBefore(d,b.firstChild);
  }

  /* ================= 2. Simpan Album + tab Album di Library ================= */
  function sal(){return ls.get('sal',[])}
  function isSaved(id){return sal().some(function(x){return x.id==id})}
  function saveTg(al){
    var l=sal(),j=l.findIndex(function(x){return x.id==al.id});
    if(j>=0)l.splice(j,1);else l.unshift({id:al.id,name:al.name,img:al.img||'',n:al.n||0,artist:al.artist||'',aid:al.aid||''});
    ls.set('sal',l);return j<0;
  }
  window.x26Alb=function(al){
    if(!al)return;
    sub(shd(E(al.name))+'<div class="x16hd"><img src="'+E(cov(al.img?{img:al.img}:{h:hh(al.name)}))+'" alt=""><h2>'+E(al.name)+'</h2><small>Album · '+E(al.artist||'')+'</small><button class="x26sv" id="x26sv"></button></div><div id="x26at"><div class="em">Memuat…</div></div>');
    var bt=Q('#x26sv');
    var paint=function(){var on=isSaved(al.id);bt.textContent=on?'✓ Tersimpan di Library':'＋ Simpan ke Library';bt.className='x26sv'+(on?' on':'')};
    bt.onclick=function(){var on=saveTg(al);toast(on?'Album disimpan':'Album dihapus dari Library');paint()};paint();
    fetch('/api/artist?src=yt&album='+encodeURIComponent(al.id)).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx})});
      lists.x26al=t;
      var el=Q('#x26at'),sm=Q('.x16hd small');
      if(sm)sm.textContent='Album · '+(al.artist||'')+' · '+t.length+' lagu';
      if(el)el.innerHTML=t.length?'<div class="x16pb"><button class="btn" onclick="P(\'x26al\',0)">▶ Putar</button><button class="btn g" onclick="lists.x26al=lists.x26al.slice().sort(function(){return Math.random()-.5});P(\'x26al\',0)">⤮ Acak</button></div>'+rows('x26al',t):'<div class="em">Album kosong atau tidak bisa diputar.</div>';
    });
  };
  window.x26AlG=function(i){window.x26Alb(sal()[i])};
  function albBody(){
    var l=sal();
    if(!l.length)return'<div class="em">Belum ada album. Buka halaman artis, ketuk sebuah album di Diskografi, lalu pilih “Simpan ke Library”.</div>';
    return'<div class="x16g2 x26ag">'+l.map(function(x,i){return'<div class="x26ac" onclick="x26AlG('+i+')"><img src="'+E(cov(x.img?{img:x.img}:{h:hh(x.name)}))+'" alt=""><b>'+E(x.name)+'</b><small>'+E(x.artist||'Album')+'</small></div>'}).join('')+'</div>';
  }
  var _lib=V.library;
  V.library=function(){
    var html,isAl=lt==='al';
    if(isAl){lt='fav';try{html=_lib()}finally{lt='al'}}else html=_lib();
    var i=html.indexOf('<div class="chips">');if(i<0)return html;
    var j=html.indexOf('</div>',i);
    var chips=html.slice(i,j);
    if(isAl)chips=chips.replace(/chip a"/g,'chip "').replace(/class="chip "/g,'class="chip "');
    chips+='<span class="chip '+(isAl?'a':'')+'" onclick="lt=\'al\';go(\'library\')">Album</span>';
    var out=html.slice(0,i)+chips+'</div>';
    return isAl?out+albBody():out+html.slice(j+6);
  };

  /* ================= 3. Notifikasi rilis baru ================= */
  function fol(){return ls.get('fol',[]).filter(function(x){return x.i&&x.s=='yt'})}
  function seen(){return ls.get('seen',{})}
  function syncCache(){
    try{
      if(!window.caches)return;
      var s=seen(),l=fol().slice(0,8).map(function(x){return{i:x.i,n:x.n,last:s[x.i]||''}});
      caches.open('ma-fol').then(function(c){return c.put('/__fol',new Response(JSON.stringify(l),{headers:{'Content-Type':'application/json'}}))}).catch(function(){});
    }catch(e){}
  }
  function notify(title,body,tag){
    try{
      if(!('Notification' in window)||Notification.permission!=='granted'||!navigator.serviceWorker)return;
      navigator.serviceWorker.ready.then(function(r){r.showNotification(title,{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag,renotify:true})}).catch(function(){});
    }catch(e){}
  }
  var checking=false;
  function check(){
    var f=fol().slice(0,8);if(!f.length||checking)return;
    var lc=ls.get('relchk',0);if(Date.now()-lc<4*3600e3)return;
    checking=true;
    var s=seen(),fresh=[];
    Promise.all(f.map(function(a){
      return fetch('/api/artist?src=yt&latest=1&n=1&id='+encodeURIComponent(a.i)+'&name='+encodeURIComponent(a.n)).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
        var t=(j.tracks||[])[0];if(!t)return;
        if(s[a.i]&&s[a.i]!==t.id)fresh.push({a:a,t:t});
        s[a.i]=t.id;
      });
    })).then(function(){
      ls.set('seen',s);ls.set('relchk',Date.now());checking=false;syncCache();
      if(!fresh.length)return;
      var n=fresh.length;
      toast(n==1?fresh[0].a.n+' merilis lagu baru: '+fresh[0].t.title:n+' artis yang kamu ikuti punya rilis baru');
      fresh.slice(0,3).forEach(function(x){notify(x.a.n+' rilis baru',x.t.title,'new-'+x.a.i)});
      ls.set('newc',null); // paksa Beranda memuat ulang rilis terbaru
    });
  }
  function askPerm(){
    try{
      if(!('Notification' in window)||Notification.permission!=='default')return;
      Notification.requestPermission().then(function(p){
        if(p==='granted'){toast('Notifikasi rilis baru aktif');regSync()}
      }).catch(function(){});
    }catch(e){}
  }
  function regSync(){
    try{
      if(!navigator.serviceWorker||!('periodicSync' in ServiceWorkerRegistration.prototype))return;
      navigator.serviceWorker.ready.then(function(r){return r.periodicSync.register('ma-new',{minInterval:12*3600e3})}).catch(function(){});
    }catch(e){}
  }
  // minta izin saat pertama kali mengetuk Ikuti (harus dari ketukan pengguna)
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('#x25fb,#x16fb');
    if(!b)return;
    setTimeout(function(){
      var l=fol();if(!l.length)return;
      syncCache();
      if('Notification' in window&&Notification.permission==='default'&&!ls.get('npAsk',0)){ls.set('npAsk',1);askPerm()}
      ls.set('relchk',0);setTimeout(check,400);
    },150);
  },true);

  /* ================= pasang ================= */
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){try{top()}catch(e){}}).observe(vv,{childList:true,subtree:true});
  setTimeout(function(){try{syncCache();regSync();check()}catch(e){}},4000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(function(){try{check()}catch(e){}},1500)});
})();
