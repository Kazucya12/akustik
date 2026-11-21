/* Loopify v4.40 - Pencarian ala Spotify.
   1) Hasil dikelompokkan seperti Spotify: Hasil teratas (dipilih lewat skor relevansi) + Lagu, Artis, Album, Playlist, masing-masing dengan "Lihat semua".
   2) Chip filter: Semua / Lagu / Artis / Album / Playlist (chip Video tetap disembunyikan seperti pilihan lama: pencarian audio-first).
   3) Pencarian langsung saat mengetik (jeda singkat), tanpa pencarian ganda.
   4) Koreksi ejaan: "Maksud kamu ...?" dan otomatis dipakai bila hasil kosong. Memakai /api/suggest dan koleksi sendiri (jalan juga saat offline).
   5) Pencarian terbaru berupa daftar (hapus satu per satu), tombol hapus teks, kartu genre dengan ikon, "Pencarian terkait".
   6) v4.40: hasil Library muncul seketika (sebelum hasil online), cache hasil per sesi (kata kunci sama = tanpa panggilan API),
      riwayat berisi artis/lagu/album (dengan foto), album dicari lewat nama (iTunes via /api/artist?asearch=), pencarian lirik
      (lirik tersimpan di perangkat + tebakan dari YouTube untuk potongan lirik).
   Dimuat setelah extra47.js (pasangan extra48.css). Tidak mengubah data lama dan tidak mengganti file lain:
   hanya membungkus doSearch dan V.explore, lalu menggambar hasilnya sendiri di #x48. Data lagu tetap dari daftar lama (lists.sl / sr / sv). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)};
  var QA=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var E=function(s){return esc(s)};

  var ST={q:'',done:false,doneT:0,f:'all',ver:0,auto:null,nofix:{},tried:{}};
  var SG={},FX={},AL={},IT={},LYW={},ITT=[],CACHE={};
  var CHIPS=[['all','Semua'],['sg','Lagu'],['ar','Artis'],['al','Album'],['pl','Playlist']];
  var ORD=[['','Relevan'],['viewCount','Terpopuler'],['date','Terbaru']];
  var EMO={'Pop':'🎤','Rock':'🎸','Indie':'🌿','EDM':'🎛️','Jazz':'🎷','Hip-Hop':'🧢','Dangdut':'🪘','Santai':'🛋️','Galau':'🌧️','Semangat':'🔥','Gym':'🏋️','Tidur':'🌙','Akustik':'🪕','Lo-Fi':'☕','K-Pop':'💜','Anime':'🌸'};
  var CLOCK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var tmR=0,ft=0;

  function sched(){clearTimeout(tmR);tmR=setTimeout(render,60)}

  /* ---------- Teks: normalisasi, jarak ketik, skor relevansi ---------- */
  function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
  function lev(a,b){
    var m=a.length,n=b.length;if(!m)return n;if(!n)return m;
    var d=[],i,j,c;
    for(i=0;i<=m;i++)d[i]=[i];
    for(j=1;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++){
      c=a.charAt(i-1)==b.charAt(j-1)?0:1;
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
      if(i>1&&j>1&&a.charAt(i-1)==b.charAt(j-2)&&a.charAt(i-2)==b.charAt(j-1))d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
    }
    return d[m][n];
  }
  function score(q,t){
    q=norm(q);t=norm(t);if(!q||!t)return 0;
    if(t===q)return 100;
    if(t.indexOf(q)===0)return 86;
    if((' '+t).indexOf(' '+q)>=0)return 72;
    if(t.indexOf(q)>=0)return 58;
    var qw=q.split(' '),tw=t.split(' '),h=0,i,j;
    for(i=0;i<qw.length;i++){for(j=0;j<tw.length;j++){if(tw[j].indexOf(qw[i])===0){h++;break}}}
    if(h===qw.length)return 52+Math.min(10,qw.length*2);
    var base=h?18+30*h/qw.length:0;
    if(q.length>=3){
      var d=lev(q,t.slice(0,Math.min(t.length,q.length+1))),lim=Math.max(1,Math.floor(q.length/4));
      if(d<=lim)base=Math.max(base,44-d*6);
    }
    return base;
  }
  function fmtN(n){n=+n||0;var d=function(x){return x.toFixed(1).replace('.0','').replace('.',',')};return n>=1e9?d(n/1e9)+' M':n>=1e6?d(n/1e6)+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}
  function av(x){return E(cov(x.img?{img:x.img}:{h:hh(x.n||x.name)}))}

  /* ---------- Koreksi ejaan ---------- */
  function accept(nq,cand){
    if(!cand||cand===nq)return -1;
    if(cand.indexOf(nq)===0||(' '+cand).indexOf(' '+nq)>=0)return -1;
    var L=nq.length,lim=L<=4?1:L<=9?2:3,best=99,k,d;
    for(k=-1;k<=1;k++){d=lev(nq,cand.slice(0,Math.max(1,L+k)));if(d<best)best=d}
    d=lev(nq,cand);if(d<best)best=d;
    return(best>=1&&best<=lim&&nq.charAt(0)==cand.charAt(0))?best:-1;
  }
  function vocab(){
    var out=[],seen={};
    function add(s){var n=norm(s);if(n.length>=3&&n.length<=60&&!seen[n]){seen[n]=1;out.push(n)}}
    function tr(t){if(t){add(t.title);add(t.artist)}}
    try{(songs||[]).slice(0,800).forEach(tr)}catch(e){}
    try{(favs||[]).slice(0,400).forEach(function(t){tr(rs(t)||t)})}catch(e){}
    try{(hist||[]).slice(0,400).forEach(function(t){tr(rs(t)||t)})}catch(e){}
    try{(pls||[]).forEach(function(p){add(p.n)})}catch(e){}
    try{ls.get('fol',[]).forEach(function(f){add(f.n)})}catch(e){}
    try{ls.get('sh',[]).forEach(add)}catch(e){}
    try{(window.x16A||[]).forEach(function(a){add(a.name)})}catch(e){}
    return out.slice(0,1500);
  }
  function pickFix(q,sugg){
    var nq=norm(q);if(nq.length<4)return null;
    var best=null,bd=99,i,s,n,d,list=[];
    sugg=Array.isArray(sugg)?sugg:[];
    for(i=0;i<sugg.length;i++){n=norm(sugg[i]);if(n&&(n===nq||n.indexOf(nq)===0))return null}
    for(i=0;i<sugg.length;i++){s=String(sugg[i]||'').replace(/\s+/g,' ').trim();n=norm(s);d=accept(nq,n);if(d>=0&&d<bd){bd=d;best=s}}
    if(best)return best;
    list=vocab();
    for(i=0;i<list.length;i++){n=list[i];if(n===nq||n.indexOf(nq)===0||(' '+n).indexOf(' '+nq)>=0)return null}
    for(i=0;i<list.length;i++){n=list[i];d=accept(nq,n);if(d>=0&&(d<bd||(d==bd&&best&&n.length>norm(best).length))){bd=d;best=n}}
    return best;
  }
  function ensureSg(q){
    if(SG[q]!==undefined)return;
    SG[q]=null;
    var done=function(a){SG[q]=Array.isArray(a)?a:[];try{FX[q]=pickFix(q,SG[q])||''}catch(e){FX[q]=''}sched()};
    try{fetch('/api/suggest?q='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(done)}catch(e){done([])}
  }

  /* ---------- Album: diambil lewat artis yang cocok (YouTube) ---------- */
  function needAl(){
    (window.x16A||[]).filter(function(a){return a&&a.src=='yt'&&a.id}).slice(0,3).forEach(function(a){
      if(AL[a.id]!==undefined)return;
      var c=null;try{c=(ls.get('x48al',{})||{})[a.id]}catch(e){}
      if(c&&c.l&&Date.now()-c.t<864e5){AL[a.id]=c.l;return}
      AL[a.id]=null;
      fetch('/api/artist?src=yt&id='+encodeURIComponent(a.id)+'&albums=1').then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
        var l=((j&&j.albums)||[]).slice(0,30).map(function(x){return{id:x.id,name:x.name,img:x.img||'',n:x.n||0,artist:a.name,aid:a.id}});
        AL[a.id]=l;
        try{var m=ls.get('x48al',{})||{};if(l.length){m[a.id]={t:Date.now(),l:l};ls.set('x48al',m)}}catch(e){}
        sched();
      });
    });
  }
  function ensureIt(q){
    if(IT[q]!==undefined||norm(q).length<3)return;
    IT[q]=null;
    var done=function(a){IT[q]=Array.isArray(a)?a:[];sched()};
    try{fetch('/api/artist?asearch='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(done)}catch(e){done([])}
  }
  function albumsFor(q){
    var out=[],seen={},names={};
    (window.x16A||[]).filter(function(a){return a&&a.src=='yt'&&a.id}).slice(0,3).forEach(function(a,ai){
      (AL[a.id]||[]).forEach(function(al){
        if(seen[al.id])return;seen[al.id]=1;names[norm(al.name)]=1;
        var s=Math.max(score(q,al.name),score(q,al.artist+' '+al.name)*.9,score(q,al.artist)*.55)-ai*2;
        out.push({al:al,s:s});
      });
    });
    try{(ls.get('sal',[])||[]).forEach(function(al){
      if(seen[al.id])return;var s=Math.max(score(q,al.name),score(q,(al.artist||'')+' '+al.name)*.9);
      if(s>=40){seen[al.id]=1;names[norm(al.name)]=1;out.push({al:al,s:s+4})}
    })}catch(e){}
    (IT[q]||[]).forEach(function(x){
      var k=norm(x.name);if(names[k])return;names[k]=1;
      var s=Math.max(score(q,x.name),score(q,x.artist+' '+x.name)*.92,score(q,x.artist)*.5)-2;
      out.push({al:{id:'it'+x.id,cid:x.id,src:'it',name:x.name,artist:x.artist,img:x.img,n:x.n},s:s});
    });
    out.sort(function(a,b){return b.s-a.s});
    return out.filter(function(o){return o.s>=30});
  }
  function albumsLoading(){return(window.x16A||[]).some(function(a){return a&&a.src=='yt'&&a.id&&AL[a.id]===null})}
  /* halaman album dari iTunes: daftar lagu tanpa alamat putar, versi putarnya dicari di YouTube saat lagu diketuk */
  function itAlbum(al){
    sub(shd(E(al.name))+'<div class="x16hd"><img src="'+av(al)+'" alt=""><h2>'+E(al.name)+'</h2><small>Album · '+E(al.artist||'')+'</small></div><div id="x48at"><div class="em">Memuat…</div></div>');
    fetch('/api/artist?aid='+encodeURIComponent(al.cid)).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
      var t=(j&&j.tracks)||[];
      ITT=t.map(function(x){return{title:x.title,artist:x.artist||al.artist}});
      var el=Q('#x48at'),sm=Q('.x16hd small');
      if(sm)sm.textContent='Album · '+(al.artist||'')+(t.length?' · '+t.length+' lagu':'');
      if(el)el.innerHTML=t.length?'<div class="x16pb"><button class="btn" onclick="x48Pt(0)">▶ Putar</button></div>'+t.map(function(x,i){return'<div class="rw" onclick="x48Pt('+i+')"><span class="x48n">'+(i+1)+'</span><div><b>'+E(x.title)+'</b><small>'+E(x.artist||al.artist||'')+'</small></div></div>'}).join(''):'<div class="em">Daftar lagu album ini tidak tersedia.</div>';
    });
  }
  window.x48Pt=function(i){
    var t=ITT[i];if(!t)return;
    ytSearch((t.artist+' '+t.title).trim(),'',2).then(function(a){
      if(!a||!a.length)return;
      lists.x48pt=[a[0]];P('x48pt',0);
    }).catch(function(){});
  };
  function openAl(al){if(!al)return;if(al.src=='it')itAlbum(al);else if(typeof window.x26Alb=='function')window.x26Alb(al)}

  /* ---------- Data hasil ---------- */
  function mergeSongs(q){
    var seen={},out=[];
    [['sl',lists.sl],['sr',lists.sr],['sv',lists.sv]].forEach(function(p){
      (p[1]||[]).forEach(function(t,i){
        if(!t)return;var k=norm(t.title)+'|'+norm(t.artist);if(seen[k])return;seen[k]=1;
        var s=Math.max(score(q,t.title),score(q,(t.artist||'')+' '+t.title)*.97,score(q,t.title+' '+(t.artist||''))*.97,score(q,t.artist)*.6);
        out.push({t:t,s:s,src:p[0],i:i,r:(p[0]=='sl'?8:0)+Math.max(0,30-i*.8)+s*.7});
      });
    });
    out.sort(function(a,b){return b.r-a.r});
    return out;
  }
  function artistsFor(q,all){
    var A=window.x16A||[],out=[];
    A.forEach(function(a,i){if(a&&a.name){var s=score(q,a.name);if(s>=(all?25:40))out.push({a:a,i:i,s:s+(a.v?4:0)+(a.src?2:0)})}});
    out.sort(function(x,y){return y.s-x.s});
    return out;
  }
  function playlistsFor(q){
    var out=[];
    try{pls.forEach(function(p,i){var s=score(q,p.n);if(s>=40)out.push({p:p,i:i,s:s})})}catch(e){}
    out.sort(function(a,b){return b.s-a.s});
    return out;
  }
  function pickTop(S,A,AB,PL){
    var C=[];
    A.slice(0,3).forEach(function(o,k){C.push({type:'ar',s:o.s-k*2,o:o})});
    S.slice(0,3).forEach(function(o,k){C.push({type:'sg',s:o.s+(o.src=='sl'?6:0)-k*2,o:o})});
    AB.slice(0,2).forEach(function(o,k){C.push({type:'al',s:o.s*.95-k*2,o:o})});
    PL.slice(0,1).forEach(function(o){C.push({type:'pl',s:o.s,o:o})});
    if(!C.length)return null;
    C.sort(function(a,b){return b.s-a.s});
    return C[0];
  }

  /* ---------- Pencarian lirik ---------- */
  function everyTrack(){
    var out=[],seen={};
    function add(t){if(t&&t.id!=null&&!seen[t.id]){seen[t.id]=1;out.push(t)}}
    try{(songs||[]).forEach(add)}catch(e){}
    try{(favs||[]).forEach(function(t){add(rs(t))})}catch(e){}
    try{(hist||[]).forEach(function(t){add(rs(t))})}catch(e){}
    try{(pls||[]).forEach(function(p){(p.tr||[]).forEach(function(t){add(rs(t))})})}catch(e){}
    return out;
  }
  function lyricHits(q){
    var nq=norm(q),out=[];
    if(nq.length<6)return out;
    try{
      everyTrack().forEach(function(t){
        var L=lyc&&lyc[t.id];if(typeof L!='string'||!L)return;
        var lines=L.split(/\r?\n/);
        for(var i=0;i<lines.length;i++){
          var ln=lines[i].replace(/\[[^\]]*\]/g,'').trim();
          if(ln&&norm(ln).indexOf(nq)>=0){out.push({t:t,line:ln});break}
        }
      });
    }catch(e){}
    return out.slice(0,5);
  }
  function lyricRow(o,i){
    return'<div class="rw" onclick="x48Ly('+i+')"><img loading="lazy" src="'+E(cov(o.t))+'" alt=""><div><b>'+E(o.t.title)+'</b><small>♪ '+E(o.line)+'</small></div></div>';
  }
  window.x48Ly=function(i){var o=(window.x48L||[])[i];if(!o)return;lists.x48y=[o.t];P('x48y',0)};
  function ensureLyw(q,S){
    var nq=norm(q);
    if(LYW[q]!==undefined||nq.split(' ').length<4||typeof ytSearch!='function')return;
    LYW[q]=null;
    var done=function(a){LYW[q]=Array.isArray(a)?a:[];sched()};
    ytSearch(q+' lirik','',2).then(done).catch(function(){done([])});
  }

  /* ---------- HTML ---------- */
  function secH(t,more){return'<div class="sec"><h3>'+t+'</h3>'+(more?'<a data-x48f="'+more+'">Lihat semua</a>':'')+'</div>'}
  function chipsH(){return'<div class="chips" id="x48f">'+CHIPS.map(function(c){return'<span class="chip '+(ST.f==c[0]?'a':'')+'" data-x48c="'+c[0]+'">'+c[1]+'</span>'}).join('')+'</div>'}
  function songRow(o){
    var h=row(o.src,o.t,o.i);
    return o.src=='sl'?h.replace('</small>',' · Di Library</small>'):h;
  }
  function artistRow(o){
    var a=o.a;
    return'<div class="rw" data-x48r="ar|'+o.i+'" onclick="x16AG('+o.i+')"><img class="x48r" loading="lazy" src="'+av(a)+'" alt=""><div><b>'+E(a.name)+(a.v?' ✓':'')+'</b><small>Artis'+(a.subs?' · '+fmtN(a.subs)+(a.src=='au'?' pengikut':' subscriber'):'')+'</small></div></div>';
  }
  function albumRow(o,i){
    var al=o.al;
    return'<div class="rw" data-x48r="al|'+i+'" onclick="x48Al('+i+')"><img class="x48sq" loading="lazy" src="'+av(al)+'" alt=""><div><b>'+E(al.name)+'</b><small>Album'+(al.artist?' · '+E(al.artist):'')+(al.n?' · '+al.n+' lagu':'')+'</small></div></div>';
  }
  function plRow(o){
    var p=o.p,c=cov(p.img?{img:p.img}:((p.tr||[]).map(rs).filter(Boolean)[0]||{h:hh(p.n)}));
    return'<div class="rw" data-x48r="pl|'+o.i+'" onclick="openPl('+o.i+')"><img class="x48sq" loading="lazy" src="'+E(c)+'" alt=""><div><b>'+E(p.n)+'</b><small>Playlist · '+((p.tr||[]).length)+' lagu</small></div></div>';
  }
  function topH(c,AB){
    var o=c.o,img,r='',name,sub,on,btn='▶',rec='';
    if(c.type=='ar'){img=av(o.a);r=' r';name=o.a.name;sub='<i>Artis</i>'+(o.a.subs?' · '+fmtN(o.a.subs)+(o.a.src=='au'?' pengikut':' subscriber'):'');on='x16AG('+o.i+')';btn='›';rec='ar|'+o.i}
    else if(c.type=='sg'){img=E(cov(o.t));name=o.t.title;sub='<i>Lagu</i> · '+E(o.t.artist||'');on='P(\''+o.src+'\','+o.i+')';rec='sg|'+o.src+'|'+o.i}
    else if(c.type=='al'){img=av(o.al);name=o.al.name;sub='<i>Album</i> · '+E(o.al.artist||'');on='x48Al('+Math.max(0,AB.indexOf(o))+')';btn='›';rec='al|'+Math.max(0,AB.indexOf(o))}
    else{img=E(cov(o.p.img?{img:o.p.img}:((o.p.tr||[]).map(rs).filter(Boolean)[0]||{h:hh(o.p.n)})));name=o.p.n;sub='<i>Playlist</i> · '+((o.p.tr||[]).length)+' lagu';on='openPl('+o.i+')';rec='pl|'+o.i}
    return'<div class="x48t" data-x48r="'+rec+'" onclick="'+on+'"><img class="'+(r?'r':'')+'" src="'+img+'" alt=""><b>'+E(name)+'</b><small>'+sub+'</small><span class="x48p'+(btn=='›'?' o':'')+'">'+btn+'</span></div>';
  }
  function fixH(q){
    var a=ST.auto;
    if(a&&a.to===q)return'<div class="x48fx">Menampilkan hasil untuk <b>'+E(q)+'</b><small>Cari <a data-x48k="orig" data-v="'+E(a.from)+'">“'+E(a.from)+'”</a> saja</small></div>';
    var fx=FX[q];
    if(fx&&!ST.nofix[q])return'<div class="x48fx">Maksud kamu <a data-x48k="fix" data-v="'+E(fx)+'"><b>'+E(fx)+'</b></a>?</div>';
    return'';
  }
  function relatedH(q){
    var nq=norm(q),a=(SG[q]||[]).filter(function(s){var n=norm(s);return n&&n!==nq}).slice(0,6);
    if(!a.length)return'';
    return secH('Pencarian terkait')+'<div class="chips x48rel">'+a.map(function(s){return'<span class="chip" data-x48q="'+E(s)+'">'+E(s)+'</span>'}).join('')+'</div>';
  }
  function sortH(){
    var cur='',el=Q('#v > .chips .chip.a[onclick^="setOrd"]');
    if(el){var m=/setOrd\('([^']*)'\)/.exec(el.getAttribute('onclick')||'');if(m)cur=m[1]}
    return'<div class="chips x48so">'+ORD.map(function(o){return'<span class="chip '+(cur==o[0]?'a':'')+'" data-x48o="'+o[0]+'">'+o[1]+'</span>'}).join('')+'</div>';
  }
  function ents(){var a=[];try{a=ls.get('x49re',[])||[]}catch(e){}return Array.isArray(a)?a:[]}
  function recAdd(e){
    var key=e.k+':'+(e.id||norm(e.name||(e.t&&e.t.title)||(e.al&&e.al.name)||'')),l=ents().filter(function(x){return(x.k+':'+(x.id||norm(x.name||(x.t&&x.t.title)||(x.al&&x.al.name)||'')))!=key});
    e.id=e.id||'';l.unshift(e);ls.set('x49re',l.slice(0,12));
  }
  function entHtml(e,i){
    var img,cls='x48sq',name,sub;
    if(e.k=='ar'){img=av(e);cls='x48r';name=e.name;sub='Artis'}
    else if(e.k=='al'){img=av(e.al||{});name=(e.al||{}).name;sub='Album · '+((e.al||{}).artist||'')}
    else if(e.k=='pl'){img=E(cov({h:hh(e.name)}));name=e.name;sub='Playlist'}
    else{var t=null;try{t=rs(e.t)||e.t}catch(x){t=e.t}t=t||{};img=E(cov(t));name=t.title||'';sub='Lagu · '+(t.artist||'')}
    return'<div class="rw x48rc" data-x48e="'+i+'"><img class="'+cls+'" loading="lazy" src="'+img+'" alt=""><div><b>'+E(name)+'</b><small>'+E(sub)+'</small></div><button class="ib x48d" data-x48x="'+i+'" aria-label="Hapus dari riwayat">'+ic('x',16)+'</button></div>';
  }
  function openEnt(e){
    if(!e)return;
    if(e.k=='ar'){if(e.id&&e.src=='yt'&&typeof window.x16Ch=='function')window.x16Ch({src:e.src,id:e.id,name:e.name,img:e.img||'',subs:e.subs||0,v:e.v||0});else artistPg(e.name)}
    else if(e.k=='al')openAl(e.al);
    else if(e.k=='pl'){var j=-1;try{pls.forEach(function(p,x){if(j<0&&p.n==e.name)j=x})}catch(x){}if(j>=0)openPl(j)}
    else{var t=null;try{t=rs(e.t)||e.t}catch(x){t=e.t}if(t){lists.x48y=[t];P('x48y',0)}}
  }
  function recentH(){
    var a=[],E2=ents().slice(0,6),h='';
    try{a=ls.get('sh',[])||[]}catch(e){}
    if(!a.length&&!E2.length)return'';
    h='<div class="sec"><h3>Pencarian terbaru</h3><a data-x48f="clr">Hapus semua</a></div>';
    h+=E2.map(entHtml).join('');
    h+=a.slice(0,8).map(function(s,i){
      return'<div class="rw x48rc" data-x48s="'+i+'"><span class="x48ci">'+CLOCK+'</span><div><b>'+E(s)+'</b></div><button class="ib x48d" data-x48d="'+i+'" aria-label="Hapus dari riwayat">'+ic('x',16)+'</button></div>';
    }).join('');
    return h;
  }
  function noneH(){
    var em=Q('#res .em'),msg=em&&em.textContent.trim();
    return'<div class="em">'+E(msg||'Tidak ada hasil. Coba kata kunci lain atau periksa ejaannya.')+'</div>';
  }

  function resultsHtml(q){
    var h=chipsH();
    if(!(ST.q===q&&ST.done)){
      /* hasil Library tampil seketika; hasil online menyusul di bawahnya */
      var L=ST.q===q?(lists.sl||[]):[],sk=typeof skel6=='function'?skel6(L.length?3:6):'<div class="em">Mencari…</div>';
      if(L.length&&(ST.f=='all'||ST.f=='sg'))h+=secH('Di Library')+L.slice(0,ST.f=='sg'?8:5).map(function(t,i){return songRow({src:'sl',t:t,i:i})}).join('');
      return h+sk;
    }
    ensureSg(q);needAl();ensureIt(q);
    var S=mergeSongs(q),A=artistsFor(q,ST.f=='ar'),AB=albumsFor(q),PL=playlistsFor(q),f=ST.f,LY=lyricHits(q);
    window.x48A=AB.map(function(o){return o.al});window.x48L=LY;
    h+=fixH(q);
    if(f=='sg'){
      h+=sortH();
      h+=S.length?S.slice(0,60).map(songRow).join(''):noneH();
    }else if(f=='ar'){
      h+=secH('Artis');
      if(A.length)h+=A.map(artistRow).join('');
      else{h+='<div class="em">'+(Date.now()-ST.doneT<5000?'Mencari artis…':'Tidak ada artis yang cocok.')+'</div>';if(Date.now()-ST.doneT<5000)setTimeout(sched,5200)}
    }else if(f=='al'){
      h+=secH('Album');
      if(AB.length)h+=AB.slice(0,40).map(albumRow).join('');
      else h+='<div class="em">'+((albumsLoading()||IT[q]===null)?'Memuat album…':'Tidak ada album yang cocok.')+'</div>';
    }else if(f=='pl'){
      h+=secH('Playlist');
      h+=PL.length?PL.map(plRow).join(''):'<div class="em">Tidak ada playlist yang cocok di Library.</div>';
    }else{
      var top=pickTop(S,A,AB,PL),weak=!top||top.s<55;
      if(weak)ensureLyw(q,S);
      var LW=weak&&LYW[q]&&LYW[q].length?LYW[q].slice(0,3):[];
      if(!top&&!S.length&&!A.length&&!AB.length&&!PL.length&&!LY.length&&!LW.length)h+=noneH();
      else{
        var sh=S.length?'<div class="x48tl">'+secH('Lagu',S.length>4?'sg':'')+S.slice(0,4).map(songRow).join('')+'</div>':'';
        h+=top?'<div class="x48top"><div class="x48tc">'+secH('Hasil teratas')+topH(top,AB)+'</div>'+sh+'</div>':sh;
        if(LY.length)h+=secH('Cocok di lirik')+LY.slice(0,3).map(lyricRow).join('');
        if(A.length)h+=secH('Artis',A.length>3?'ar':'')+A.slice(0,3).map(artistRow).join('');
        if(AB.length)h+=secH('Album',AB.length>3?'al':'')+AB.slice(0,3).map(albumRow).join('');
        if(PL.length)h+=secH('Playlist',PL.length>3?'pl':'')+PL.slice(0,3).map(plRow).join('');
        if(LW.length){lists.x48lw=LW;h+=secH('Mungkin lagu ini (tebakan dari lirik)')+LW.map(function(t,i){return row('x48lw',t,i)}).join('')}
        h+=relatedH(q);
      }
    }
    autoFix(q,S,A);
    return h;
  }
  function autoFix(q,S,A){
    if(ST.nofix[q]||ST.tried[q]||ST.auto)return;
    var fx=FX[q];if(!fx||S.length)return;
    if(A.some(function(o){return o.s>=70}))return;
    ST.tried[q]=1;ST.auto={from:q,to:fx};
    setTimeout(function(){qs(fx)},0);
  }

  /* ---------- Gambar ke halaman ---------- */
  function syncX(){
    var s=Q('#v .srch'),i=Q('#qi');if(!s||!i)return;
    var b=Q('.x48x',s);
    if(!b){b=document.createElement('button');b.type='button';b.className='ib x48x';b.setAttribute('aria-label','Hapus teks');b.innerHTML=ic('x',16);s.insertBefore(b,i.nextSibling)}
    var on=i.value?'':'none';if(b.style.display!==on)b.style.display=on;
  }
  function decorate(){
    QA('#x16cat .x16c:not([data-x48e])').forEach(function(c){
      c.setAttribute('data-x48e','1');
      var n=(c.textContent||'').trim(),i=document.createElement('i');
      i.className='x48e';i.textContent=EMO[n]||'🎵';i.setAttribute('aria-hidden','true');c.appendChild(i);
    });
  }
  function render(){
    var v=Q('#v'),host=Q('#x48');
    if(!v)return;
    if(!host){v.classList.remove('x48','x48q');return}
    var on=typeof smode=='string'&&smode=='a';
    var q=on&&typeof lq=='string'?lq.trim():'';
    v.classList.toggle('x48',on);v.classList.toggle('x48q',!!q);
    if(!on){if(host.__h){host.innerHTML='';host.__h=''}return}
    syncX();decorate();
    if(q&&ST.done&&ST.sig&&CACHE[ST.sig])CACHE[ST.sig].A=window.x16A;
    var html=q?resultsHtml(q):recentH();
    if(html!==host.__h){host.__h=html;host.innerHTML=html}
  }

  /* ---------- Pembungkus: doSearch dan halaman Cari ---------- */
  var _ds=window.doSearch,pend=null,pendSig='',lastSig='',lastT=0,CKEYS=[];
  function ordNow(){var el=Q('#v > .chips .chip.a[onclick^="setOrd"]'),m=el&&/setOrd\('([^']*)'\)/.exec(el.getAttribute('onclick')||'');return m?m[1]:''}
  function srcNow(){try{return String(cfg.src||'')}catch(e){return''}}
  function localMatches(q){
    var nq=norm(q),out=[];
    if(!nq)return out;
    try{
      var all=typeof mineAll=='function'?mineAll():everyTrack().filter(function(t){return!t.yt});
      all.forEach(function(t){if(out.length<8&&norm((t.title||'')+' '+(t.artist||'')).indexOf(nq)>=0)out.push(t)});
    }catch(e){}
    return out;
  }
  function pushHist(q){try{var h=ls.get('sh',[])||[];h=[q].concat(h.filter(function(x){return String(x).toLowerCase()!=q.toLowerCase()})).slice(0,10);ls.set('sh',h)}catch(e){}}
  if(typeof _ds=='function')window.doSearch=function(s){
    var q=String(s==null?'':s).trim(),sig;
    if(!q){
      clearTimeout(ft);pend=null;pendSig='';lastSig='';ST.sig='';
      ST.q='';ST.done=false;ST.auto=null;lists.sl=[];lists.sr=[];lists.sv=[];
      var r0=_ds(s);sched();return r0;
    }
    sig=q+'|'+(typeof smode=='string'?smode:'')+'|'+ordNow()+'|'+srcNow();
    if(pend&&pendSig===sig)return pend;
    if(lastSig===sig&&ST.done&&Date.now()-lastT<2500)return Promise.resolve();
    if(!(ST.auto&&ST.auto.to===q))ST.auto=null;
    /* cache sesi: kata kunci yang sama (urutan/sumber sama) dalam 8 menit dipakai ulang tanpa memanggil API */
    var c=CACHE[sig];
    if(c&&Date.now()-c.t<480000&&typeof smode=='string'&&smode=='a'){
      lq=q;ST.q=q;ST.sig=sig;ST.done=true;ST.doneT=Date.now();lastSig=sig;lastT=Date.now();
      lists.sl=c.sl;lists.sr=c.sr;lists.sv=c.sv;window.x16A=c.A;pushHist(q);sched();
      return Promise.resolve();
    }
    ST.q=q;ST.sig=sig;ST.done=false;lists.sl=localMatches(q);lists.sr=[];lists.sv=[];
    pendSig=sig;
    var p=Promise.resolve(_ds(s)).catch(function(){}).then(function(){
      if(pendSig===sig)pend=null;
      if(ST.q===q){
        ST.done=true;ST.doneT=Date.now();lastSig=sig;lastT=Date.now();
        if((lists.sl.length+lists.sr.length+lists.sv.length)&&typeof smode=='string'&&smode=='a'){
          if(!CACHE[sig]){CKEYS.push(sig);if(CKEYS.length>30)delete CACHE[CKEYS.shift()]}
          CACHE[sig]={t:Date.now(),sl:lists.sl,sr:lists.sr,sv:lists.sv,A:window.x16A};
        }
      }
      sched();
    });
    pend=p;sched();return p;
  };
  if(typeof V!='undefined'&&V&&typeof V.explore=='function'){
    var _ex=V.explore;
    V.explore=function(){
      var h=_ex.call(V);
      h=h.replace('Cari musik, artis, atau album…','Apa yang ingin kamu dengarkan?');
      h=h.indexOf('<div id="sh">')>=0?h.replace('<div id="sh">','<div id="x48"></div><div id="sh">'):h.replace('<div id="res">','<div id="x48"></div><div id="res">');
      setTimeout(sched,0);
      return h;
    };
  }
  window.x48Al=function(i){openAl((window.x48A||[])[i])};

  /* ---------- Interaksi ---------- */
  document.addEventListener('input',function(e){
    var t=e.target;if(!t||t.id!='qi')return;
    syncX();
    var q=t.value.trim();clearTimeout(ft);
    if(typeof smode!='string'||smode!='a')return;
    /* pencarian lama (jeda 1,1 detik di onS) dibatalkan: digantikan pencarian langsung di bawah, supaya tidak menimpa hasil koreksi */
    setTimeout(function(){try{clearTimeout(dt)}catch(e){}},0);
    if(!q){if(typeof lq=='string'&&lq.trim())window.doSearch('');return}
    if(q.length<2)return;
    ft=setTimeout(function(){
      var i=Q('#qi');if(!i||i.value.trim()!==q)return;
      try{if(window.x24H)window.x24H()}catch(e){}
      window.doSearch(q);
    },380);
  },true);

  /* ketukan pada hasil dicatat ke riwayat (artis/lagu/album/playlist) tanpa menghentikan aksi aslinya */
  function recFrom(el){
    try{
      var d=el.getAttribute('data-x48r'),m,a;
      if(d){
        m=d.split('|');
        if(m[0]=='ar'){a=(window.x16A||[])[+m[1]];if(a)recAdd({k:'ar',id:(a.src||'')+(a.id||''),name:a.name,img:a.img||'',src:a.src||'',aid:a.id||'',subs:a.subs||0,v:a.v||0})}
        else if(m[0]=='al'){a=(window.x48A||[])[+m[1]];if(a)recAdd({k:'al',id:a.id,al:a})}
        else if(m[0]=='pl'){a=pls[+m[1]];if(a)recAdd({k:'pl',id:'',name:a.n})}
        else if(m[0]=='sg'){a=(lists[m[1]]||[])[+m[2]];if(a)recAdd({k:'sg',id:String(a.id),t:a.loc?{id:a.id,loc:1}:a})}
        return;
      }
      m=/^P\('([^']+)',(\d+)\)/.exec(el.getAttribute('onclick')||'');
      if(m){a=(lists[m[1]]||[])[+m[2]];if(a)recAdd({k:'sg',id:String(a.id),t:a.loc?{id:a.id,loc:1}:a})}
    }catch(x){}
  }
  document.addEventListener('click',function(e){
    var rc=e.target&&e.target.closest?e.target.closest('#x48 [data-x48r],#x48 .rw[onclick^="P("]'):null;
    if(rc&&!(e.target.closest&&e.target.closest('.x49m')))recFrom(rc);
  },true);

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('.x48x,[data-x48c],[data-x48f],[data-x48s],[data-x48d],[data-x48e],[data-x48x],[data-x48k],[data-x48o],[data-x48q]'):null;
    if(!t)return;
    var v=Q('#v'),a;
    if(t.classList.contains('x48x')){
      e.preventDefault();var i=Q('#qi');if(i){i.value='';i.focus()}
      try{if(window.x24H)window.x24H()}catch(x){}
      window.doSearch('');syncX();return;
    }
    if(t.hasAttribute('data-x48c')){
      a=t.getAttribute('data-x48c');
      ST.f=a;render();if(v)v.scrollTop=0;return;
    }
    if(t.hasAttribute('data-x48f')){
      a=t.getAttribute('data-x48f');
      if(a=='clr'){ls.set('sh',[]);ls.set('x49re',[]);render();return}
      ST.f=a;render();if(v)v.scrollTop=0;return;
    }
    if(t.hasAttribute('data-x48x')){
      e.stopPropagation();e.preventDefault();
      var le=ents();le.splice(+t.getAttribute('data-x48x'),1);ls.set('x49re',le);render();return;
    }
    if(t.hasAttribute('data-x48e')){openEnt(ents()[+t.getAttribute('data-x48e')]);return}
    if(t.hasAttribute('data-x48d')){
      e.stopPropagation();e.preventDefault();
      var l=ls.get('sh',[])||[];l.splice(+t.getAttribute('data-x48d'),1);ls.set('sh',l);render();return;
    }
    if(t.hasAttribute('data-x48s')){
      a=(ls.get('sh',[])||[])[+t.getAttribute('data-x48s')];if(a)qs(a);return;
    }
    if(t.hasAttribute('data-x48k')){
      a=t.getAttribute('data-v')||'';
      if(t.getAttribute('data-x48k')=='orig'){ST.nofix[a]=1;ST.auto=null}
      if(a)qs(a);return;
    }
    if(t.hasAttribute('data-x48o')){if(typeof window.setOrd=='function')window.setOrd(t.getAttribute('data-x48o'));return}
    if(t.hasAttribute('data-x48q')){a=t.getAttribute('data-x48q');if(a)qs(a)}
  },true);

  var root=Q('#v');
  if(root&&window.MutationObserver)new MutationObserver(sched).observe(root,{childList:true,subtree:true});
  sched();
})();
