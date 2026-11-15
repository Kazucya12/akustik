/* v4.27: Library dan penemuan.
   1) Filter Library: Favorit, Baru (7 hari), Belum diputar, dan durasi (pendek / sedang / panjang), bisa digabung dengan pencarian dan urutan.
   2) Deteksi duplikat lagu di Library (judul+artis mirip atau ukuran file sama) + tombol Gabungkan; juga bersihkan duplikat di playlist.
   3) Playlist otomatis baru: Minggu Ini, Lama Tidak Diputar, Belum Pernah Diputar, Favorit Jarang Diputar.
   4) Tombol 🚫 di pemutar: "Jangan putar lagi" (disembunyikan dari mix/rekomendasi, dilewati saat lagu berikutnya, ada daftar untuk membatalkan).
   Dimuat setelah extra28.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x29t{display:flex;gap:8px;margin:10px 0 2px}.x29t .btn{flex:1;padding:10px 6px;font-size:13px}'+
    '.x29f{margin-top:8px}.x29b{font-size:16px!important}.x29g{margin:12px 0}.x29g .rw{cursor:default}';
  document.head.appendChild(st);
  var N=function(k,d){return ls.get(k,d)};
  var fil=N('f29','all');

  /* ---------- pelacak: kapan terakhir diputar ---------- */
  var LP=N('lp29',{}),lastId=null,lpT=0;
  setInterval(function(){
    try{
      if(!cur||cur.radio||cur.id===lastId)return;
      lastId=cur.id;LP[cur.id]=Date.now();
      var k=Object.keys(LP);
      if(k.length>400){k.sort(function(a,b){return LP[a]-LP[b]}).slice(0,k.length-400).forEach(function(x){delete LP[x]})}
      clearTimeout(lpT);lpT=setTimeout(function(){ls.set('lp29',LP)},1500);
    }catch(e){}
  },1000);
  addEventListener('pagehide',function(){try{ls.set('lp29',LP)}catch(e){}});

  /* ---------- daftar blokir ---------- */
  var BK=N('blk29',{});
  function bid(t){return t&&(t.vid?'y'+t.vid:t.id)}
  function isBlk(t){return !!(t&&(BK[t.id]||(t.vid&&BK['y'+t.vid])))}
  function saveBk(){ls.set('blk29',BK)}
  window.x29Blk=function(){
    if(!cur)return;
    var id=bid(cur);
    if(isBlk(cur)){delete BK[cur.id];delete BK[id];saveBk();toast('Lagu ini boleh diputar lagi')}
    else{BK[id]={t:cur.title,a:cur.artist};saveBk();toast('Tidak akan diputar lagi di mix dan rekomendasi');if(q.length>1)nxt(1)}
    rp();hideBlocked();
  };
  /* sembunyikan lagu terblokir dari daftar rekomendasi (kunci daftar di bawah). Library, favorit, playlist tetap utuh. */
  var HIDE=['dm','fy','sim','rc','rcm','rx','nw','tc','hv','am','ao','tr','sr','sv','al','ch','x24','x25p','x25n','x25d','x25o','x26al'];
  function hideBlocked(){
    try{
      if(!Object.keys(BK).length&&!document.querySelector('[data-x29h]'))return;
      [].forEach.call(document.querySelectorAll('[onclick^="P("]'),function(e){
        var m=/^P\('?([\w]+)'?,\s*(\d+)\)/.exec(e.getAttribute('onclick')||'');
        if(!m||HIDE.indexOf(m[1])<0)return;
        var t=lists[m[1]]&&lists[m[1]][+m[2]],h=!!(t&&isBlk(t));
        if(h){e.style.display='none';e.setAttribute('data-x29h','1')}else if(e.getAttribute('data-x29h')){e.style.display='';e.removeAttribute('data-x29h')}
      });
    }catch(e){}
  }
  var ot;try{new MutationObserver(function(){clearTimeout(ot);ot=setTimeout(hideBlocked,120)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  /* lompati lagu terblokir saat lanjut ke berikutnya */
  try{
    var _nxt=nxt;
    nxt=function(d){
      _nxt.apply(this,arguments);
      var g=0;
      while(cur&&isBlk(cur)&&q.length>1&&g++<q.length&&q.some(function(t){return !isBlk(t)}))_nxt.call(this,d||1);
    };
  }catch(e){}
  /* tombol 🚫 di baris aksi pemutar */
  try{
    var _rp=rp;
    rp=function(){
      _rp.apply(this,arguments);
      try{
        var a=document.querySelector('#pl .act');if(!a||!cur||a.querySelector('.x29b'))return;
        var b=document.createElement('button');b.className='x29b';b.title='Jangan putar lagi';b.textContent='🚫';
        b.style.color=isBlk(cur)?'#ff6b6b':'var(--mu)';b.setAttribute('onclick','x29Blk()');a.appendChild(b);
      }catch(e){}
    };
  }catch(e){}
  window.x29BlkList=function(){
    rbP=isPlO();clp();
    var k=Object.keys(BK),h=shd('Jangan Putar Lagi');
    h+=k.length?'<small style="display:block;margin:0 4px 10px;color:var(--mu)">Lagu ini disembunyikan dari mix dan rekomendasi, dan dilewati saat lagu berikutnya.</small>'+
      k.map(function(id){var v=BK[id]||{};return'<div class="rw" style="cursor:default"><div><b>'+esc(v.t||id)+'</b><small>'+esc(v.a||'')+'</small></div><button class="ib" style="color:var(--mu);width:auto;padding:0 12px" onclick="x29Un(\''+esc(id)+'\')">Batalkan</button></div>'}).join('')
      :'<div class="em">Belum ada. Ketuk 🚫 di pemutar untuk menandai lagu.</div>';
    sub(h);
  };
  window.x29Un=function(id){delete BK[id];saveBk();hideBlocked();x29BlkList()};

  /* ---------- durasi (dibaca sekali dari file, disimpan) ---------- */
  var DU=N('dur29',{});
  function readDurs(list,done){
    var todo=list.filter(function(t){return t.blob&&DU[t.id]==null}),n=todo.length,i=0,fin=0;
    if(!n){done();return}
    toast('Membaca durasi '+n+' lagu…');
    function nextOne(){
      if(i>=n){if(++fin===3){ls.set('dur29',DU);done()}return}
      var t=todo[i++],a=new Audio(),over=false;
      function end(v){if(over)return;over=true;DU[t.id]=v;try{a.removeAttribute('src');a.load()}catch(e){}nextOne()}
      a.preload='metadata';a.onloadedmetadata=function(){end(isFinite(a.duration)?Math.round(a.duration):0)};a.onerror=function(){end(0)};
      setTimeout(function(){end(0)},5000);
      try{a.src=urlOf(t)}catch(e){end(0)}
    }
    nextOne();nextOne();nextOne();
  }

  /* ---------- 1. filter Library ---------- */
  var FIL=[['all','Semua'],['fav','♥ Favorit'],['new','Baru (7 hari)'],['unp','Belum diputar'],['s','< 3 mnt'],['m','3–6 mnt'],['l','> 6 mnt']];
  function plays(t){var v=stt&&stt.pl&&stt.pl[t.id];return v&&typeof v=='object'?(+v.c||+v.s||0):+v||0}
  function passes(t){
    switch(fil){
      case'fav':return isF(t);
      case'new':return Date.now()-(t.added||0)<7*864e5;
      case'unp':return !stt.pl||!stt.pl[t.id];
      case's':return DU[t.id]>0&&DU[t.id]<180;
      case'm':return DU[t.id]>=180&&DU[t.id]<=360;
      case'l':return DU[t.id]>360;
    }
    return true;
  }
  try{var _sgList=sgList;sgList=function(){var a=_sgList.apply(this,arguments);return fil==='all'?a:a.filter(passes)}}catch(e){}
  window.x29F=function(k){
    fil=k;ls.set('f29',k);
    if(['s','m','l'].indexOf(k)>=0){readDurs(songs,function(){go(pg)})}else go(pg);
  };
  try{
    var _lsBar=lsBar;
    lsBar=function(){
      var base=_lsBar.apply(this,arguments);
      var nb=Object.keys(BK).length;
      return base+'<div class="chips x29f">'+FIL.map(function(x){return'<span class="chip '+(fil===x[0]?'a':'')+'" onclick="x29F(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+
        '<div class="x29t"><button class="btn g" onclick="x29Dup()">🔍 Cari duplikat</button><button class="btn g" onclick="x29BlkList()">🚫 Diblokir'+(nb?' ('+nb+')':'')+'</button></div>';
    };
  }catch(e){}

  /* ---------- 2. duplikat ---------- */
  var GEN=/^(lagu saya|link kustom|tidak diketahui|unknown( artist)?|various artists|youtube|)$/i;
  function norm(s){
    return String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyrics?|lirik|video|music|audio|mv|hd|hq|remastered|remaster)\b/g,' ')
      .replace(/\b(feat|ft|featuring)\b.*$/,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  }
  var GR=[];
  function dupGroups(){
    var L=songs.slice(),par=L.map(function(_,i){return i});
    function f(x){while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x}
    function u(a,b){a=f(a);b=f(b);if(a!==b)par[b]=a}
    var tt={},sz={};
    L.forEach(function(t,i){
      var k=norm(t.title);
      if(k.length>=2){(tt[k]=tt[k]||[]).push(i)}
      if(t.blob&&t.blob.size>100000){(sz[t.blob.size]=sz[t.blob.size]||[]).push(i)}
    });
    Object.keys(tt).forEach(function(k){
      var b=tt[k];
      for(var x=0;x<b.length;x++)for(var y=x+1;y<b.length;y++){
        var A=norm(L[b[x]].artist),B=norm(L[b[y]].artist);
        if(A===B||GEN.test(A)||GEN.test(B))u(b[x],b[y]);
      }
    });
    Object.keys(sz).forEach(function(k){var b=sz[k];for(var x=1;x<b.length;x++)u(b[0],b[x])});
    var m={};L.forEach(function(t,i){var r=f(i);(m[r]=m[r]||[]).push(t)});
    return Object.keys(m).map(function(r){return m[r]}).filter(function(g){return g.length>1}).map(function(g){
      var keep=g.filter(function(t){return cur&&cur.id===t.id})[0]||g.slice().sort(function(a,b){return (b.blob?b.blob.size:0)-(a.blob?a.blob.size:0)||(a.added||0)-(b.added||0)})[0];
      return{items:g,keep:keep.id};
    });
  }
  function plDups(){
    var n=0,p=0;
    pls.forEach(function(pl){var s={},c=0;(pl.tr||[]).forEach(function(x){if(s[x.id])c++;else s[x.id]=1});if(c){n+=c;p++}});
    return{n:n,p:p};
  }
  function mb(t){return t.blob?(t.blob.size/1048576).toFixed(1)+' MB':''}
  window.x29Dup=function(){
    rbP=isPlO();clp();GR=dupGroups();
    var pd=plDups(),h=shd('Duplikat Lagu');
    if(!GR.length&&!pd.n)h+='<div class="em">Tidak ada duplikat ditemukan.</div>';
    else{
      if(GR.length)h+='<button class="btn" onclick="x29MergeAll()">Gabungkan semua ('+GR.length+' grup)</button><small style="display:block;margin:8px 4px 4px;color:var(--mu)">Yang ukurannya terbesar (biasanya kualitas terbaik) dipertahankan. Favorit, playlist, riwayat, dan statistik dipindah ke lagu itu.</small>';
      GR.forEach(function(g,gi){
        h+='<div class="pcard x29g"><small>Grup '+(gi+1)+' · '+g.items.length+' file</small>'+g.items.map(function(t){
          return'<div class="rw"><img src="'+esc(cov(t))+'" alt=""><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+' · '+mb(t)+' · '+new Date(t.added||0).toLocaleDateString('id-ID')+'</small></div>'+(t.id===g.keep?'<span class="ph" style="color:var(--p2)">✔ dipertahankan</span>':'<span class="ph" style="color:var(--mu)">dihapus</span>')+'</div>';
        }).join('')+'<button class="btn g" style="margin-top:8px" onclick="x29Merge('+gi+')">Gabungkan grup ini</button></div>';
      });
      if(pd.n)h+='<div class="sec"><h3>Duplikat di playlist</h3></div><button class="btn g" onclick="x29PlClean()">Bersihkan '+pd.n+' lagu ganda di '+pd.p+' playlist</button>';
    }
    sub(h);
  };
  function repl(arr,from,to){
    var seen={};
    return arr.map(function(x){return x&&from[x.id]?{id:to,loc:1}:x}).filter(function(x){if(!x)return false;if(seen[x.id])return false;seen[x.id]=1;return true});
  }
  function mergeGroup(g){
    var keep=g.keep,from={},keepT=songs.filter(function(t){return t.id===keep})[0];
    g.items.forEach(function(t){if(t.id!==keep)from[t.id]=1});
    var ids=Object.keys(from);if(!ids.length||!keepT)return 0;
    favs=repl(favs,from,keep);pls.forEach(function(p){p.tr=repl(p.tr||[],from,keep)});hist=repl(hist,from,keep);
    ls.set('favs',favs);ls.set('pls',pls);ls.set('hist',hist);
    try{var l=ls.get('last',null);if(l&&l.t&&from[l.t.id]){l.t={id:keep,loc:1};ls.set('last',l)}}catch(e){}
    try{
      stt.pl=stt.pl||{};
      ids.forEach(function(id){
        var o=stt.pl[id];if(o==null)return;var k=stt.pl[keep];
        if(k==null)stt.pl[keep]=o;
        else if(typeof k=='object')k.s=(+k.s||0)+(typeof o=='object'?+o.s||0:+o||0),k.c=(+k.c||0)+(typeof o=='object'?+o.c||0:0);
        else stt.pl[keep]=typeof o=='object'?{s:(+k||0)+(+o.s||0),c:+o.c||0}:(+k||0)+(+o||0);
        delete stt.pl[id];
      });
      ls.set('stt',stt);
    }catch(e){}
    q=q.map(function(t){return t&&from[t.id]?keepT:t});
    ids.forEach(function(id){
      try{tx('readwrite',function(o){return o.delete(id)}).catch(function(){})}catch(e){}
      try{if(urls[id]){URL.revokeObjectURL(urls[id]);delete urls[id]}}catch(e){}
      delete LP[id];delete DU[id];delete BK[id];
    });
    songs=songs.filter(function(t){return !from[t.id]});
    ls.set('lp29',LP);ls.set('dur29',DU);saveBk();
    return ids.length;
  }
  window.x29Merge=function(i){var g=GR[i];if(!g)return;var n=mergeGroup(g);toast(n+' file ganda dihapus');x29Dup()};
  window.x29MergeAll=function(){var n=0;GR.forEach(function(g){n+=mergeGroup(g)});toast(n+' file ganda dihapus');x29Dup()};
  window.x29PlClean=function(){
    var n=0;pls.forEach(function(p){var s={},o=[];(p.tr||[]).forEach(function(x){if(s[x.id]){n++}else{s[x.id]=1;o.push(x)}});p.tr=o});
    ls.set('pls',pls);toast(n+' lagu ganda dibersihkan');x29Dup();
  };

  /* ---------- 3. playlist otomatis baru ---------- */
  var DAY=864e5;
  SMN.wk=['📅','Minggu Ini'];SMN.old=['🕰','Lama Tidak Diputar'];SMN.unp=['🌱','Belum Pernah Diputar'];SMN.rare=['💎','Favorit Jarang Diputar'];
  try{
    var _smGet=smGet;
    smGet=function(k){
      if(['wk','old','unp','rare'].indexOf(k)<0)return _smGet.apply(this,arguments);
      var m=known(),out=[];
      function T(id){var t=m.get(id);return t&&!isBlk(t)?t:null}
      if(k==='wk'){
        out=Object.keys(LP).filter(function(id){return Date.now()-LP[id]<7*DAY}).sort(function(a,b){return LP[b]-LP[a]}).map(T).filter(Boolean);
      }else if(k==='old'){
        out=Object.keys(LP).filter(function(id){return Date.now()-LP[id]>14*DAY}).sort(function(a,b){return LP[a]-LP[b]}).map(T).filter(Boolean).slice(0,50);
      }else if(k==='unp'){
        out=sg().filter(function(t){return !stt.pl||!stt.pl[t.id]}).filter(function(t){return !isBlk(t)}).slice(0,100);
      }else{
        out=favs.map(rs).filter(Boolean).filter(function(t){return !isBlk(t)}).sort(function(a,b){return plays(a)-plays(b)}).slice(0,30);
      }
      return out;
    };
  }catch(e){}
})();
