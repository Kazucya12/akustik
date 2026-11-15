/* Loopify v4.22 - Semua Artis: kumpulkan semua nama artis dari koleksimu (lagu, favorit, riwayat, playlist, diikuti),
   lalu cari nama + foto channel YouTube-nya lewat /api/artist (hanya YouTube). Foto disimpan di perangkat 30 hari
   supaya kuota YouTube hemat. Plus pencarian artis bebas di YouTube. Dimuat setelah extra23.js (pasangan extra24.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  var DAY=864e5,TTL_HIT=30*DAY,TTL_MISS=3*DAY,STEP=24,BATCH=25,VM={};
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;return n>=1e6?(n/1e6).toFixed(1).replace('.0','')+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}

  /* ---------- cache foto di perangkat ---------- */
  var PC=ls.get('arp',{});
  function cget(n){var c=PC[low(n)];if(!c)return undefined;if(Date.now()-c.t>(c.m?TTL_MISS:TTL_HIT))return undefined;return c}
  function cset(n,v){PC[low(n)]=v?{t:Date.now(),id:v.id,name:v.name,img:v.img,subs:v.subs}:{t:Date.now(),m:1};}
  function csave(){
    var k=Object.keys(PC);
    if(k.length>600){k.sort(function(a,b){return PC[a].t-PC[b].t}).slice(0,k.length-600).forEach(function(x){delete PC[x]})}
    ls.set('arp',PC);
  }

  /* ---------- kumpulkan nama artis ---------- */
  function everything(){
    var a=[];
    try{a=a.concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(r,p){return r.concat(p.tr.map(rs))},[]))}catch(e){}
    return a.filter(function(t){return t&&typeof t==='object'});
  }
  function splitA(s){return String(s||'').split(/\s*(?:,|\bfeat\.?\s|\bft\.?\s|\bfeaturing\b)\s*/i).map(function(x){return x.trim()}).filter(Boolean)}
  function collect(){
    var m={};
    everything().forEach(function(t){
      splitA(t.artist).forEach(function(n){
        if(n.length<2||n.length>60||GEN.test(n))return;
        var k=low(n),o=m[k]||(m[k]={n:n,c:0,img:''});
        o.c++;if(!o.img&&t.img)o.img=t.img;
        if(t.yt&&t.vid&&!VM[k])VM[k]=t.vid;
      });
    });
    try{ls.get('fol',[]).forEach(function(f){var k=low(f.n);if(!f.n)return;var o=m[k]||(m[k]={n:f.n,c:0,img:f.img||''});o.f=1;if(!o.img&&f.img)o.img=f.img})}catch(e){}
    return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return(b.f?1:0)-(a.f?1:0)||b.c-a.c||a.n.localeCompare(b.n)});
  }

  /* ---------- ambil foto channel (bertahap, 8 nama per permintaan) ---------- */
  var busy=false,warnQuota=false,failKey=0;
  function resolve(names,done,deep){
    var todo=names.filter(function(n){var c=cget(n);return c===undefined||(deep&&c.m&&!c.deep)});
    if(!todo.length){done&&done();return}
    if(busy){setTimeout(function(){resolve(names,done,deep)},400);return}
    busy=true;
    var chunks=[],SZ=deep?8:BATCH;for(var i=0;i<todo.length;i+=SZ)chunks.push(todo.slice(i,i+SZ));
    var go=function(){
      var c=chunks.shift();
      if(!c){busy=false;csave();done&&done();return}
      fetch('/api/artist?names='+encodeURIComponent(c.map(function(n){var v=VM[low(n)];return n.replace(/[|~]/g,' ')+(v?'~'+v:'')}).join('|'))+(deep?'&s=1':'')).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(j){
        if(!j||!j.res){failKey++;chunks=[];}
        else{
          if(j.quota){warnQuota=true;chunks=[]}
          Object.keys(j.res).forEach(function(n){cset(n,j.res[n]);if(deep&&!j.res[n])PC[low(n)].deep=1});
        }
        csave();paint();go();
      });
    };
    go();
  }

  /* ---------- halaman Semua Artis ---------- */
  var L=[],SHOW=STEP,FQ='',YQ={},ytTimer=0;
  function sub1(x){var c=cget(x.n);return(x.c?x.c+' lagu':x.f?'Diikuti':'')+(c&&c.subs?(x.c?' · ':'')+fmtN(c.subs)+' subscriber':'')}
  function fb(n){return cov({h:hh(n)})}
  window.x24E=function(i){i.onerror=null;i.src=fb(i.getAttribute('data-n')||'')};
  function card(x,i){
    var c=cget(x.n),img=(c&&c.img)||x.img||'',loading=c===undefined&&busy;
    return'<div class="x24c'+(loading?' ld':'')+(c&&c.img?' yt':'')+'" onclick="x24Go('+i+')"><div class="x24r"><img src="'+E(img||fb(x.n))+'" data-n="'+E(x.n)+'" alt="" loading="lazy" onerror="x24E(this)"></div><b>'+E(x.n)+'</b><small>'+E(sub1(x))+'</small></div>';
  }
  function view(){
    var q=low(FQ),A=L.filter(function(x){return!q||low(x.n).indexOf(q)>=0});
    window.x24V=A;
    var vis=q?A:A.slice(0,SHOW),h='';
    h+=vis.length?'<div class="x24g">'+vis.map(function(x){return card(x,A.indexOf(x))}).join('')+'</div>':'<div class="em">'+(L.length?'Tidak ada artis dengan nama itu di koleksimu.':'Belum ada artis. Tambahkan lagu, favorit, atau putar video dulu.')+'</div>';
    var miss=L.filter(function(x){var c=cget(x.n);return c&&c.m&&!c.deep});
    if(!q&&miss.length)h+='<button class="btn g x24m" onclick="x24Deep()">Cari '+Math.min(8,miss.length)+' foto yang belum ketemu (pakai ±100 kuota YouTube per artis)</button>';
    if(!q&&A.length>SHOW)h+='<button class="btn g x24m" onclick="x24More()">Muat '+Math.min(STEP,A.length-SHOW)+' artis lagi ('+(A.length-SHOW)+' tersisa)</button>';
    return h;
  }
  function ytView(){
    var q=String(FQ).trim();
    if(q.length<2)return'';
    var r=YQ[q];
    if(r===undefined)return'<div class="sec"><h3>Di YouTube</h3></div><div class="em">Mencari “'+E(q)+'” di YouTube…</div>';
    if(!r.length)return'<div class="sec"><h3>Di YouTube</h3></div><div class="em">Tidak ada channel yang cocok.</div>';
    window.x24Y=r;
    return'<div class="sec"><h3>Di YouTube</h3></div><div class="x24g">'+r.map(function(x,i){
      return'<div class="x24c yt" onclick="x24GoY('+i+')"><div class="x24r"><img src="'+E(x.img||fb(x.name))+'" data-n="'+E(x.name)+'" alt="" loading="lazy" onerror="x24E(this)"></div><b>'+E(x.name)+'</b><small>'+(x.subs?fmtN(x.subs)+' subscriber':'Channel YouTube')+'</small></div>';
    }).join('')+'</div>';
  }
  function paint(){
    var g=Q('#x24l'),y=Q('#x24y'),s=Q('#x24s');
    if(!g)return;
    g.innerHTML=view();if(y)y.innerHTML=ytView();
    if(s){
      var got=L.filter(function(x){var c=cget(x.n);return c&&c.img}).length;
      s.textContent=L.length+' artis · '+got+' foto channel'+(busy?' · memuat…':'');
    }
    var w=Q('#x24w');if(w)w.style.display=warnQuota||failKey?'':'none';
  }
  function loadVisible(){
    var q=low(FQ),A=L.filter(function(x){return!q||low(x.n).indexOf(q)>=0});
    resolve((q?A.slice(0,12):A.slice(0,SHOW)).map(function(x){return x.n}),paint);
  }
  window.x24Deep=function(){
    var m=L.filter(function(x){var c=cget(x.n);return c&&c.m&&!c.deep}).slice(0,8).map(function(x){return x.n});
    resolve(m,paint,1);paint();
  };
  window.x24More=function(){SHOW+=STEP;paint();loadVisible()};
  window.x24Go=function(i){
    var x=(window.x24V||[])[i];if(!x)return;
    var c=cget(x.n);
    if(c&&c.id&&window.x16Ch)window.x16Ch({src:'yt',id:c.id,name:x.n,img:c.img,subs:c.subs||0,v:0});
    else artistPg(x.n);
  };
  window.x24GoY=function(i){
    var x=(window.x24Y||[])[i];if(!x)return;
    window.x16Ch?window.x16Ch(x):artistPg(x.name);
  };
  window.x24Q=function(v){
    FQ=v;paint();clearTimeout(ytTimer);
    var q=String(v).trim();
    if(q.length<2)return;
    loadVisible();
    ytTimer=setTimeout(function(){
      if(YQ[q]!==undefined){paint();return}
      fetch('/api/artist?q='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){
        YQ[q]=Array.isArray(a)?a:[];if(String(FQ).trim()==q)paint();
      });
    },650);
  };
  window.x24Open=function(){
    try{clp()}catch(e){}
    L=collect();SHOW=STEP;FQ='';
    var top=L.filter(function(x){var c=cget(x.n);return c&&c.img}).slice(0,3);
    sub(shd('Semua Artis')+
      '<div class="x24h"><div class="x24hb"><b>Semua artis kamu</b><span id="x24s"></span></div></div>'+
      '<div class="x24sr"><input id="x24i" type="search" placeholder="Cari artis di koleksimu atau YouTube" autocomplete="off" oninput="x24Q(this.value)"></div>'+
      '<div id="x24w" class="x24w" style="display:none">Foto channel belum bisa dimuat. Cek <code>YOUTUBE_API_KEY</code> di Vercel atau kuota harian YouTube. Coba lagi besok atau buka ulang halaman ini.</div>'+
      '<div id="x24l"></div><div id="x24y"></div>');
    paint();loadVisible();
  };

  /* ---------- tombol masuk: Library > Artis dan Beranda ---------- */
  var _al=window.arList;
  window.arList=function(){
    var h=_al.apply(this,arguments);
    return'<div class="x24bn" onclick="x24Open()"><div class="x24bi">✨</div><div><b>Semua Artis</b><small>Nama dan foto channel YouTube</small></div><span>›</span></div>'+h;
  };
  function home(v){
    var all=collect().slice(0,12);if(!all.length)return;
    var anchor=Q('[data-x16h]',v)||Q('.hero',v);if(!anchor)return;
    var d=document.createElement('div');d.setAttribute('data-x24h','1');
    var draw=function(){
      window.x24H=all;
      d.innerHTML='<div class="sec"><h3>Artis dari koleksimu</h3><a onclick="x24Open()">Lihat Semua</a></div><div class="hs x24hs">'+all.map(function(x,i){
        var c=cget(x.n),img=(c&&c.img)||x.img||'';
        return'<div class="cd x24a" onclick="x24GoH('+i+')"><div class="x24r"><img src="'+E(img||fb(x.n))+'" data-n="'+E(x.n)+'" alt="" onerror="x24E(this)"></div><b>'+E(x.n)+'</b></div>';
      }).join('')+'</div>';
    };
    draw();anchor.insertAdjacentElement('afterend',d);
    // hanya muat foto untuk 8 artis teratas di Beranda (hemat kuota); sisanya di halaman Semua Artis
    resolve(all.slice(0,8).map(function(x){return x.n}),function(){if(d.isConnected)draw()});
  }
  window.x24GoH=function(i){var x=(window.x24H||[])[i];if(!x)return;window.x24V=[x];window.x24Go(0)};
  function deco(){
    var v=Q('#v');if(!v)return;
    if(Q('.hero',v)&&!Q('[data-x24h]',v))home(v);
  }
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){setTimeout(function(){try{deco()}catch(e){console.error(e)}},60)}).observe(vv,{childList:true});
  setTimeout(function(){try{deco()}catch(e){}},500);
})();
