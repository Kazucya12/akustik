/* Loopify v4.40 - Menu ⋯ di tiap baris lagu dan halaman genre.
   1) Tombol "+" di baris lagu diganti ⋯ yang membuka lembar opsi: Putar, Tambah ke antrean, Suka, Tambah ke playlist, Buka artis, Bagikan.
      (Tombol "+" lama hanya menambah ke antrean; kini aksi itu ada di dalam menu.) Berlaku di semua daftar lagu: hasil cari, artis, album, playlist.
   2) Ketuk kartu genre/suasana di halaman Cari membuka halaman sendiri (Putar, Acak, Terpopuler, Terbaru, playlist Library yang cocok),
      bukan sekadar mengisi kolom cari.
   Dimuat setelah extra48.js. Memakai fungsi lama: P, qAdd, isF, svt, uiPick, artistPg, ytSearch, rows, sub, shd. */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)};
  var QA=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var E=function(s){return esc(s)};
  var DOTS='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  var GENERIC=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio|YouTube)$/i;
  var tm=0;

  /* ---------- 1. Ganti "+" menjadi ⋯ ---------- */
  function decorate(){
    QA('button.ib[onclick*="qAdd("]:not([data-x49])').forEach(function(b){
      var m=/qAdd\('([^']+)',(\d+)\)/.exec(b.getAttribute('onclick')||'');
      if(!m)return;
      b.setAttribute('data-x49','1');b.setAttribute('data-x49k',m[1]);b.setAttribute('data-x49i',m[2]);
      b.setAttribute('aria-label','Opsi lagu');b.classList.add('x49m');b.removeAttribute('onclick');b.innerHTML=DOTS;
    });
  }
  function sched(){clearTimeout(tm);tm=setTimeout(decorate,50)}

  /* ---------- Lembar opsi ---------- */
  function closeSheet(){var s=Q('#x49sh');if(s){s.classList.remove('on');setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},220)}}
  function openSheet(k,i){
    var t=lists[k]&&lists[k][i];if(!t)return;
    closeSheet();
    var fav=false;try{fav=isF(t)}catch(e){}
    var hasArtist=t.artist&&!GENERIC.test(t.artist);
    var A=[['play','▶','Putar sekarang'],['queue','＋','Tambah ke antrean'],['fav',fav?'♥':'♡',fav?'Hapus dari Favorit':'Suka'],['pl','☰','Tambah ke playlist']];
    if(hasArtist)A.push(['artist','♪','Buka artis']);
    if(t.vid&&navigator.share)A.push(['share','↗','Bagikan']);
    var d=document.createElement('div');d.id='x49sh';d.className='x49sh';
    d.innerHTML='<div class="x49bk" data-x49c="1"></div><div class="x49pn" role="dialog" aria-label="Opsi lagu"><div class="x49hd"><img src="'+E(cov(t))+'" alt=""><div><b>'+E(t.title)+'</b><small>'+E(t.artist||'')+'</small></div></div>'+
      A.map(function(a){return'<button type="button" class="x49a" data-x49a="'+a[0]+'"><span>'+a[1]+'</span><b>'+a[2]+'</b></button>'}).join('')+'</div>';
    d.setAttribute('data-k',k);d.setAttribute('data-i',i);
    document.body.appendChild(d);
    requestAnimationFrame(function(){d.classList.add('on')});
  }
  function done(btn,txt){if(btn){btn.querySelector('b').textContent=txt;btn.classList.add('ok')}setTimeout(closeSheet,650)}
  function act(a,btn){
    var sh=Q('#x49sh');if(!sh)return;
    var k=sh.getAttribute('data-k'),i=+sh.getAttribute('data-i'),t=lists[k]&&lists[k][i];if(!t)return;
    if(a=='play'){closeSheet();P(k,i)}
    else if(a=='queue'){
      if(t.yt){done(btn,'Video tidak bisa masuk antrean musik');return}
      qAdd(k,i);done(btn,'✓ Masuk antrean');
    }
    else if(a=='fav'){
      try{favs=isF(t)?favs.filter(function(x){return x.id!=t.id}):favs.concat([svt(t)]);ls.set('favs',favs);done(btn,isF(t)?'✓ Masuk Favorit':'✓ Dihapus dari Favorit')}catch(e){closeSheet()}
    }
    else if(a=='pl'){
      if(!pls.length){done(btn,'Buat playlist dulu di Library');return}
      closeSheet();
      uiPick('Tambah ke playlist',pls.map(function(p){return p.n})).then(function(x){if(x!=null&&pls[x]){pls[x].tr.push(svt(t));ls.set('pls',pls)}});
    }
    else if(a=='artist'){closeSheet();artistPg(t.artist)}
    else if(a=='share'){closeSheet();try{navigator.share({title:t.title,text:t.artist||'',url:'https://youtu.be/'+t.vid}).catch(function(){})}catch(e){}}
  }
  document.addEventListener('click',function(e){
    var tg=e.target;if(!tg||!tg.closest)return;
    var m=tg.closest('.x49m');
    if(m){e.preventDefault();e.stopPropagation();openSheet(m.getAttribute('data-x49k'),+m.getAttribute('data-x49i'));return}
    var a=tg.closest('[data-x49a]');
    if(a){e.preventDefault();e.stopPropagation();act(a.getAttribute('data-x49a'),a);return}
    if(tg.closest('[data-x49c]')){e.preventDefault();e.stopPropagation();closeSheet()}
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});

  /* ---------- 2. Halaman genre ---------- */
  var GQ={'Pop':'lagu pop indonesia terpopuler','Rock':'lagu rock indonesia terbaik','Indie':'lagu indie indonesia','EDM':'edm hits terbaru','Jazz':'jazz indonesia santai','Hip-Hop':'hip hop indonesia terbaru','Dangdut':'lagu dangdut terpopuler','Santai':'lagu santai chill','Galau':'lagu galau indonesia','Semangat':'lagu semangat pagi','Gym':'lagu workout gym semangat','Tidur':'lagu pengantar tidur tenang','Akustik':'lagu akustik indonesia','Lo-Fi':'lofi chill beats','K-Pop':'kpop hits terbaru','Anime':'anime opening songs'};
  var GC={},GN='';
  function uniqIds(a,seen){return a.filter(function(t){if(seen[t.id])return false;seen[t.id]=1;return true})}
  function body(name,pop,nw,err){
    var el=Q('#x49gb');if(!el||GN!==name)return;
    if(pop===null){el.innerHTML='<div class="em">Memuat…</div>';return}
    var seen={},p=uniqIds(pop,seen).slice(0,20),n=uniqIds(nw,seen).slice(0,12),h='';
    lists.x49g1=p;lists.x49g2=n;
    if(!p.length&&!n.length){el.innerHTML='<div class="em">'+E(err||'Belum ada lagu untuk genre ini. Coba lagi nanti.')+'</div>';return}
    h+='<div class="x16pb"><button class="btn" onclick="P(\'x49g1\',0)">▶ Putar</button><button class="btn g" onclick="lists.x49g1=lists.x49g1.slice().sort(function(){return Math.random()-.5});P(\'x49g1\',0)">⤮ Acak</button></div>';
    var my=[];try{pls.forEach(function(pl,i){if(String(pl.n).toLowerCase().indexOf(name.toLowerCase())>=0)my.push([pl,i])})}catch(e){}
    if(my.length)h+='<div class="sec"><h3>Playlist di Library</h3></div>'+my.map(function(x){return'<div class="rw" onclick="openPl('+x[1]+')"><img src="'+E(cov({h:hh(x[0].n)}))+'" alt="" style="border-radius:8px"><div><b>'+E(x[0].n)+'</b><small>Playlist · '+((x[0].tr||[]).length)+' lagu</small></div></div>'}).join('');
    if(p.length)h+='<div class="sec"><h3>Terpopuler</h3></div>'+rows('x49g1',p);
    if(n.length)h+='<div class="sec"><h3>Terbaru</h3></div>'+rows('x49g2',n);
    el.innerHTML=h;
  }
  function genre(name,bg,emo){
    GN=name;
    sub(shd(E(name))+'<div class="x49gh" style="background:'+E(bg||'var(--c)')+'"><b>'+E(name)+'</b><small>Pilihan lagu</small><i aria-hidden="true">'+E(emo||'🎵')+'</i></div><div id="x49gb"><div class="em">Memuat…</div></div>');
    var c=GC[name];
    if(c&&Date.now()-c.t<900000){body(name,c.p,c.n);return}
    var q=GQ[name]||('lagu '+name.toLowerCase()+' terpopuler');
    Promise.allSettled([ytSearch(q,'viewCount',2),ytSearch(q,'date',2)]).then(function(r){
      var p=r[0].status=='fulfilled'?r[0].value:[],n=r[1].status=='fulfilled'?r[1].value:[],err='';
      if(!p.length&&!n.length&&r[0].status=='rejected'&&typeof ytMsg=='function')err=ytMsg(r[0].reason);
      if(p.length||n.length)GC[name]={t:Date.now(),p:p,n:n};
      body(name,p,n,err);
    });
  }
  document.addEventListener('click',function(e){
    var c=e.target&&e.target.closest?e.target.closest('#x16cat .x16c'):null;
    if(!c)return;
    var b=Q('b',c),name=b?(b.textContent||'').trim():'';if(!name)return;
    e.preventDefault();e.stopPropagation();
    var em=Q('.x48e',c);
    genre(name,c.style.background||c.style.backgroundImage,em?em.textContent:'');
  },true);

  var root=Q('#v'),sp=Q('#sp');
  if(window.MutationObserver){var mo=new MutationObserver(sched);if(root)mo.observe(root,{childList:true,subtree:true});if(sp)mo.observe(sp,{childList:true,subtree:true})}
  sched();
})();
