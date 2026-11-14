/* Loopify v4.6 - ala Spotify & YT Music: Jelajahi semua, filter hasil (Lagu/Artis/Playlist), Ikuti artis,
   Library (sematkan, urutkan, tampilan grid, Lagu Disukai), cover playlist mosaik, chip suasana di Beranda.
   Dimuat setelah extra15.js (pasangan extra16.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  function low(s){return String(s||'').trim().toLowerCase()}
  function mine(){var m={},o=[];[].concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(a,p){return a.concat(p.tr.map(rs))},[])).forEach(function(t){if(t&&t.id!=null&&!m[t.id]){m[t.id]=1;o.push(t)}});return o}
  function avatar(x){return E(cov(x.img?{img:x.img}:{h:hh(x.n||x.name)}))}

  /* ---------- 1. Jelajahi semua + filter hasil pencarian ---------- */
  var CAT=[['Pop',280],['Rock',215],['Indie',260],['EDM',300],['Jazz',190],['Hip-Hop',330],['Dangdut',20],['Santai',160],['Galau',240],['Semangat',35],['Gym',0],['Tidur',225],['Akustik',95],['Lo-Fi',200],['K-Pop',320],['Anime',350]];
  var FIL='all';
  var _ex=V.explore;
  V.explore=function(){
    var h=_ex.call(V);
    var g='<div id="x16cat"><div class="sec"><h3>Jelajahi semua</h3></div><div class="x16g2">'+CAT.map(function(c){return'<div class="x16c" style="background:linear-gradient(150deg,hsl('+c[1]+',75%,52%),hsl('+(c[1]+35)+',70%,26%))" onclick="qs(\''+c[0]+'\')"><b>'+c[0]+'</b></div>'}).join('')+'</div></div>';
    h=h.replace(/<div class="sec"><h3>Genre Populer<\/h3><\/div><div class="gg">(?:<div class="gt"[^>]*>[^<]*<\/div>)*<\/div>/,g);
    return h.replace('<div id="res">','<div id="x16f"></div><div id="x16"></div><div id="res">');
  };
  window.x16F=function(f){FIL=f;rnd()};
  function rnd(){
    var q=low(typeof lq=='string'?lq:''),f=Q('#x16f'),b=Q('#x16'),r=Q('#res'),cat=Q('#x16cat');
    if(!f||!b)return;
    if(cat)cat.style.display=q?'none':'';
    if(!q){f.innerHTML='';b.innerHTML='';if(r)r.style.display='';return}
    f.innerHTML='<div class="chips">'+[['all','Semua'],['sg','Lagu'],['ar','Artis'],['pl','Playlist']].map(function(x){return'<span class="chip '+(FIL==x[0]?'a':'')+'" onclick="x16F(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>';
    var qq=String(lq).trim();fetchArtists(qq);
    var A=(ARC[qq]||[]).slice(),S={};A.forEach(function(x){S[low(x.name)]=1});
    mine().filter(function(t){return low(t.artist).indexOf(q)>=0}).forEach(function(t){var n=String(t.artist||'').trim(),k=low(n);if(!n||GEN.test(n)||S[k])return;S[k]=1;A.push({src:'',id:'',name:n,img:t.img,subs:0,v:0})});
    A=A.slice(0,8);window.x16A=A;
    var P=pls.map(function(p,i){return{p:p,i:i}}).filter(function(x){return low(x.p.n).indexOf(q)>=0}),h='';
    var AL=FIL=='ar'?A:A.slice(0,4);
    if(FIL=='all'||FIL=='ar')h+=AL.length?'<div class="sec"><h3>Artis</h3></div>'+AL.map(function(x,i){return'<div class="rw" onclick="x16AG('+i+')"><img src="'+avatar(x)+'" style="border-radius:50%" alt=""><div><b>'+E(x.name)+(x.v?' ✓':'')+'</b><small>'+subT(x)+'</small></div></div>'}).join(''):FIL=='ar'?'<div class="em">'+(ARC[qq]===null?'Mencari artis…':'Tidak ada artis yang cocok.')+'</div>':'';
    if(FIL=='all'||FIL=='pl')h+=P.length?'<div class="sec"><h3>Playlist</h3></div>'+P.map(function(x){return'<div class="rw" onclick="openPl('+x.i+')"><img src="'+E(cov(x.p.img?{img:x.p.img}:(x.p.tr.map(rs).filter(Boolean)[0]||{h:hh(x.p.n)})))+'" alt=""><div><b>'+E(x.p.n)+'</b><small>'+x.p.tr.length+' lagu</small></div></div>'}).join(''):FIL=='pl'?'<div class="em">Tidak ada playlist yang cocok.</div>':'';
    if(FIL=='all'&&h)h+='<div class="sec"><h3>Lagu</h3></div>';
    b.innerHTML=h;if(r)r.style.display=(FIL=='ar'||FIL=='pl')?'none':'';
  }
  var _ds=doSearch;
  doSearch=async function(s){await _ds(s);try{rnd()}catch(e){}};

  /* ---------- 2. Profil artis seperti channel (Lagu / Remix / Koleksimu) + Ikuti ---------- */
  var ARC={},CH=null,CHC={},CHN={};
  function fmtN(n){n=+n||0;return n>=1e6?(n/1e6).toFixed(1).replace('.0','')+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}
  function subT(a){return a.src=='yt'?(a.subs?fmtN(a.subs)+' subscriber · ':'')+'YouTube':a.src=='au'?(a.subs?fmtN(a.subs)+' pengikut · ':'')+'Audius':'Di koleksimu'}
  function fetchArtists(q){
    if(!q||ARC[q]!==undefined)return;ARC[q]=null;
    fetch('/api/artist?q='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){ARC[q]=Array.isArray(a)?a:[];try{rnd()}catch(e){}});
  }
  window.x16AG=function(i){var a=(window.x16A||[])[i];if(!a)return;if(a.id)x16Ch(a);else artistPg(a.name)};
  function fol(){return ls.get('fol',[])}
  function isFol(n){return fol().some(function(x){return low(x.n)==low(n)})}
  function folTg(a){
    var l=fol(),k=low(a.name),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else{var m=mine().filter(function(t){return low(t.artist)==k&&t.img})[0];l.unshift({n:a.name,img:a.img||(m?m.img:''),s:a.src||'',i:a.id||''})}
    ls.set('fol',l);
  }
  function folBtn(a){
    var b=Q('#x16fb');if(!b)return;
    var paint=function(){var on=isFol(a.name);b.textContent=on?'Mengikuti':'Ikuti';b.className='x16fb'+(on?' on':'')};
    b.onclick=function(){folTg(a);paint()};paint();
  }
  function chBody(){
    var a=CH.a,tr=CH.tr,own=CH.own,L=CH.tab=='new'?(CH.nw||null):tr===null&&CH.tab!='own'?null:CH.tab=='rmx'?tr.filter(function(x){return x.rmx}):CH.tab=='own'?own:tr.filter(function(x){return!x.rmx});
    if(L===null)return'<div class="em">Memuat…</div>';
    if(!L.length)return'<div class="em">'+(CH.tab=='rmx'?'Belum ada remix.':CH.tab=='new'?'Belum ada rilis terbaru.':'Belum ada lagu.')+'</div>';
    return'<div class="x16pb"><button class="btn" onclick="P(\'ch\',0)">▶ Putar</button><button class="btn g" onclick="x16Shuf()">⤮ Acak</button></div>'+rows('ch',L);
  }
  function chTabs(){
    var T=[['lagu','Terpopuler']];if(CH.a&&CH.a.id&&CH.a.src=='yt')T.push(['new','Terbaru']);T.push(['rmx','Remix']);if(CH.own.length)T.push(['own','Koleksimu']);
    return T.map(function(x){return'<span class="chip '+(CH.tab==x[0]?'a':'')+'" onclick="x16Tab(\''+x[0]+'\')">'+x[1]+'</span>'}).join('');
  }
  function loadNew(){
    var a=CH.a,key=CH.key;
    if(CHN[key]){CH.nw=CHN[key];return}
    fetch('/api/artist?src='+a.src+'&id='+encodeURIComponent(a.id)+'&latest=1&n=25&name='+encodeURIComponent(a.name)).then(function(r){return r.ok?r.json():{tracks:[]}}).catch(function(){return{tracks:[]}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return Object.assign(mkV(x.id,x.title,x.artist),{ts:x.ts})}).sort(function(m,n){return(n.ts||0)-(m.ts||0)});
      CHN[key]=t;
      if(CH&&CH.key==key){CH.nw=t;if(CH.tab=='new'){var b=Q('#x16b');if(b)b.innerHTML=chBody()}}
    });
  }
  window.x16Tab=function(t){CH.tab=t;if(t=='new'&&CH.nw===undefined)loadNew();var c=Q('#x16t'),b=Q('#x16b');if(c)c.innerHTML=chTabs();if(b)b.innerHTML=chBody()};
  window.x16Shuf=function(){lists.ch=(lists.ch||[]).slice().sort(function(){return Math.random()-.5});P('ch',0)};
  window.x16Ch=function(a){
    clp();var key=a.src+a.id;
    CH={a:a,key:key,tab:'lagu',tr:CHC[key]||null,own:mine().filter(function(t){return low(t.artist)==low(a.name)})};
    sub(shd(E(a.name))+'<div class="x16hd"><img src="'+avatar(a)+'" alt=""><h2>'+E(a.name)+(a.v?' ✓':'')+'</h2><small>'+subT(a)+'</small><button id="x16fb"></button></div><div class="chips" id="x16t">'+chTabs()+'</div><div id="x16b">'+chBody()+'</div>');
    folBtn(a);
    if(CH.tr)return;
    fetch('/api/artist?src='+a.src+'&id='+encodeURIComponent(a.id)+'&name='+encodeURIComponent(a.name)).then(function(r){return r.ok?r.json():{tracks:[]}}).catch(function(){return{tracks:[]}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return a.src=='yt'?Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx}):Object.assign({},x,{h:hh(x.title)})});
      CHC[key]=t;if(CH&&CH.key==key){CH.tr=t;if(!t.length&&CH.own.length)CH.tab='own';x16Tab(CH.tab)}
    });
  };
  var _ap=artistPg;
  artistPg=function(n){
    n=String(n||'').trim();
    if(!n||GEN.test(n))return _ap(n);
    clp();sub(shd(E(n))+'<div class="em">Memuat artis…</div>');
    var old=function(){_ap(n);try{var h=Q('#sp h2');if(h&&!Q('#x16fb')){var b=document.createElement('button');b.id='x16fb';h.parentNode.appendChild(b);folBtn({name:n})}}catch(e){}};
    fetch('/api/artist?q='+encodeURIComponent(n)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){
      var m=(Array.isArray(a)?a:[]).filter(function(x){return low(x.name)==low(n)})[0];
      if(m)x16Ch(m);else old();
    });
  };
  window.x16FG=function(i){var f=fol()[i];if(!f)return;if(f.i&&f.s=='yt')x16Ch({src:f.s,id:f.i,name:f.n,img:f.img,subs:0,v:0});else artistPg(f.n)};
  var _al=window.arList;
  window.arList=function(){
    var h=_al(),f=fol();if(!f.length)return h;var seen={};
    var a=f.map(function(x,i){seen[low(E(x.n))]=1;return'<div class="rw" onclick="x16FG('+i+')"><img src="'+avatar(x)+'" style="border-radius:50%"><div><b>'+E(x.n)+'</b><small>Diikuti</small></div></div>'}).join('');
    var rest=(h.match(/<div class="rw" onclick="artistPg\(AN\(\d+\)\)">[\s\S]*?<\/small><\/div><\/div>/g)||[]).filter(function(r){var m=/<b>([\s\S]*?)<\/b>/.exec(r);return!(m&&seen[low(m[1])])}).join('');
    return a+rest;
  };

  /* ---------- 3. Beranda: chip suasana (ala YT Music) + artis yang diikuti ---------- */
  function home(v){
    var b=Q('[data-sp]',v)||Q('.hd',v);if(!b)return;
    var f=fol(),d=document.createElement('div');d.setAttribute('data-x16h','1');
    d.innerHTML='<div class="chips">'+['Santai','Energi','Fokus','Galau','Olahraga','Pesta','Tidur'].map(function(m){return'<span class="chip" onclick="qs(\''+m+'\')">'+m+'</span>'}).join('')+'</div>'+
      (f.length?'<div class="sec"><h3>Artis yang kamu ikuti</h3></div><div class="hs">'+f.map(function(x,i){return'<div class="cd x16a" onclick="x16FG('+i+')"><img src="'+avatar(x)+'" alt=""><b>'+E(x.n)+'</b></div>'}).join('')+'</div>':'');
    b.insertAdjacentElement('afterend',d);
  }

  /* ---------- 4. Library: Lagu Disukai, sematkan, urutkan, grid, cover mosaik ---------- */
  var SO={pl:[['new','Terbaru ditambahkan'],['rec','Terakhir diputar'],['az','Abjad']],ar:[['new','Terbanyak lagu'],['rec','Terakhir diputar'],['az','Abjad']]};
  function rec(i){var p=pls[i];if(!p)return;var r=ls.get('plr',{});r[low(p.n)]=Date.now();ls.set('plr',r)}
  var _pp=plPlay;plPlay=function(i){rec(i);return _pp(i)};
  var _op=window.openPl;window.openPl=function(i,k){if(!k)rec(i);return _op(i,k)};
  window.x16Fav=function(){
    var a=favs.map(rs).filter(Boolean);
    sub(shd('Lagu Disukai')+(a.length?'<button class="btn" onclick="P(\'fv\',0)">▶ Putar</button><div style="height:8px"></div>'+rows('fv',a):'<div class="em">Belum ada favorit. Ketuk ♥ di pemutar.</div>'));
  };
  function key(r){
    var o=r.getAttribute('onclick')||'',m,n;
    if(m=/^openPl\((\d+)\)/.exec(o)){var p=pls[+m[1]];return p?{k:'p:'+low(p.n),n:p.n,p:p}:null}
    if(m=/^artistPg\(AN\((\d+)\)\)/.exec(o)){n=window.AN(+m[1]);return n?{k:'a:'+low(n),n:n}:null}
    if(m=/^x16FG\((\d+)\)/.exec(o)){var fo=fol()[+m[1]];return fo?{k:'a:'+low(fo.n),n:fo.n}:null}
    return null;
  }
  function mosaic(p){
    if(p.img)return'';var im=[],S={};
    p.tr.map(rs).filter(Boolean).forEach(function(t){if(t.img&&!S[t.img]&&im.length<4){S[t.img]=1;im.push(t.img)}});
    return im.length==4?'<div class="x16m">'+im.map(function(s){return'<img src="'+E(s)+'" alt="">'}).join('')+'</div>':'';
  }
  function lib(v){
    var T=lt,ch=Q('.chips',v);if(!ch)return;
    var rows=QA('.rw',v).map(function(r){return{r:r,i:key(r)}}).filter(function(x){return x.i});
    rows.forEach(function(x,j){x.o=j});
    var S=ls.get('lsrt',{}),sm=S[T]||'new',grid=ls.get('lgrid',0),pin=ls.get('pin',[]);
    var lab=SO[T].filter(function(o){return o[0]==sm})[0]||SO[T][0];
    var d=document.createElement('div');d.className='x16tb';d.setAttribute('data-x16l','1');
    d.innerHTML='<span id="x16s">⇅ <b>'+lab[1]+'</b></span><span id="x16g">'+(grid?'☰':'▦')+'</span>';
    ch.insertAdjacentElement('afterend',d);
    Q('#x16s',d).onclick=function(){uiPick('Urutkan',SO[T].map(function(o){return o[1]})).then(function(k){if(k==null)return;S[T]=SO[T][k][0];ls.set('lsrt',S);go('library')})};
    Q('#x16g',d).onclick=function(){ls.set('lgrid',grid?0:1);go('library')};
    var anchor=rows[0]?rows[0].r:null,H=hist.map(function(t){return t&&low(rs(t)&&rs(t).artist)}),pr=ls.get('plr',{});
    function rc(x){if(T=='pl')return pr[low(x.i.n)]||0;var j=H.indexOf(low(x.i.n));return j<0?0:1e9-j}
    rows.sort(function(a,b){
      var pa=pin.indexOf(a.i.k),pb=pin.indexOf(b.i.k);
      if(pa>=0||pb>=0)return pa<0?1:pb<0?-1:pa-pb;
      if(sm=='az')return low(a.i.n).localeCompare(low(b.i.n));
      if(sm=='rec')return rc(b)-rc(a);
      return T=='pl'?b.o-a.o:a.o-b.o;
    });
    if(T=='pl'){
      var h=document.createElement('div');h.className='rw x16fav';h.setAttribute('onclick','x16Fav()');
      h.innerHTML='<div class="x16heart">♥</div><div><b>Lagu Disukai</b><small>'+favs.length+' lagu</small></div>';
      rows.unshift({r:h,i:{k:'fav',fav:1}});
    }
    var c=document.createElement('div');c.className='x16grid'+(grid?' x16gm':'');
    if(anchor)anchor.parentNode.insertBefore(c,anchor);else d.insertAdjacentElement('afterend',c);
    rows.forEach(function(x){
      var r=x.r,k=x.i.k;
      if(!x.i.fav){
        r.classList.add(k.charAt(0)=='a'?'ar':'pl');
        if(x.i.p){var m=mosaic(x.i.p),im=r.querySelector('img');if(m&&im){im.insertAdjacentHTML('beforebegin',m);im.remove()}}
        var b=document.createElement('button'),on=pin.indexOf(k)>=0;
        b.className='x16pin'+(on?' on':'');b.textContent='📌';
        b.onclick=function(e){e.stopPropagation();var P=ls.get('pin',[]),j=P.indexOf(k);if(j>=0)P.splice(j,1);else P.push(k);ls.set('pin',P);go('library')};
        r.appendChild(b);
      }
      c.appendChild(r);
    });
  }

  /* ---------- pengamat halaman ---------- */
  function deco(){
    var v=Q('#v');if(!v)return;
    if(Q('.hero',v)&&!Q('[data-x16h]',v))home(v);
    if(Q('#qi'))rnd();
    if(typeof pg!='undefined'&&pg=='library'&&!Q('[data-x16l]',v)&&(lt=='pl'||lt=='ar'))lib(v);
  }
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){try{deco()}catch(e){console.error(e)}}).observe(vv,{childList:true});
  setTimeout(function(){try{deco()}catch(e){}},300);
})();
