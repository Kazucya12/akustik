/* Loopify v4.23 - Halaman artis ala Spotify: header foto besar berwarna dari foto, tombol Putar/Acak/Ikuti/Radio,
   Populer (bernomor, 5 lalu Lihat lainnya), Rilis terbaru, Diskografi (Album / Single / Remix),
   "Sering kamu putar bersama" (dihitung dari playlistmu, tanpa kuota), Koleksimu, dan Tentang.
   Menggantikan tampilan x16Ch dari extra16 untuk artis YouTube. Dimuat setelah extra24.js (pasangan extra25.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;var d=function(x){return x.toFixed(1).replace('.0','').replace('.',',')};return n>=1e9?d(n/1e9)+' M':n>=1e6?d(n/1e6)+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}
  function tgl(ts){try{return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return''}}
  function img(a){return E(cov(a.img?{img:a.img}:{h:hh(a.name||a.n||'x')}))}

  var DATA={},ALB={},S=null;

  /* ---------- data lokal: koleksi + artis yang sering diputar bersama ---------- */
  function everything(){
    var a=[];try{a=a.concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(r,p){return r.concat(p.tr.map(rs))},[]))}catch(e){}
    return a.filter(function(t){return t&&typeof t==='object'});
  }
  function own(name){
    var k=low(name),seen={};
    return everything().filter(function(t){var ok=low(t.artist)==k&&t.id!=null&&!seen[t.id];if(ok)seen[t.id]=1;return ok});
  }
  function together(name){
    var k=low(name),c={},nm={};
    var lists_=[];try{pls.forEach(function(p){lists_.push(p.tr.map(rs))});lists_.push(favs.map(rs));lists_.push(hist.map(rs))}catch(e){}
    lists_.forEach(function(l){
      var arts={};l.forEach(function(t){if(t&&t.artist&&!GEN.test(t.artist))arts[low(t.artist)]=t.artist});
      if(!arts[k])return;
      Object.keys(arts).forEach(function(x){if(x==k)return;c[x]=(c[x]||0)+1;nm[x]=arts[x]});
    });
    return Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,10).map(function(x){return{name:nm[x],n:c[x]}});
  }
  function photo(n){try{var c=(ls.get('arp',{}))[low(n)];return c&&c.img||''}catch(e){return''}}

  /* ---------- Ikuti (format sama dengan extra16) ---------- */
  function fol(){return ls.get('fol',[])}
  function isFol(n){return fol().some(function(x){return low(x.n)==low(n)})}
  function folTg(a){
    var l=fol(),k=low(a.name),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else l.unshift({n:a.name,img:a.img||'',s:'yt',i:a.id||''});
    ls.set('fol',l);
  }

  /* ---------- warna header dari foto artis ---------- */
  function tint(src,el){
    if(!src||!/^https:/.test(src))return;
    var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){
      try{
        var c=document.createElement('canvas');c.width=c.height=10;var x=c.getContext('2d');x.drawImage(im,0,0,10,10);
        var d=x.getImageData(0,0,10,10).data,r=0,g=0,b=0,n=0;
        for(var i=0;i<d.length;i+=4){if(d[i+3]<200)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
        if(n&&el.isConnected)el.style.setProperty('--hc','rgb('+Math.round(r/n*.8)+','+Math.round(g/n*.8)+','+Math.round(b/n*.8)+')');
      }catch(e){}
    };
    im.src=src;
  }

  /* ---------- halaman ---------- */
  function get(url,k){return fetch(url).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){return j[k]||[]})}
  function mk(x){return Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx,v:x.v,ts:x.ts,d:x.d})}
  function open(a){
    try{clp()}catch(e){}
    var key=a.id;
    S={a:a,key:key,more:false,tab:'',pop:null,all:null};
    var mine=own(a.name),tg=together(a.name);
    sub(shd(E(a.name))+
      '<div class="x25" id="x25">'+
        '<div class="x25h" id="x25h"><div class="x25bg" style="background-image:url(\''+img(a).replace(/'/g,'%27')+'\')"></div>'+
          '<div class="x25ph"><img src="'+img(a)+'" alt="" data-n="'+E(a.name)+'" onerror="x24E&&x24E(this)"></div>'+
          '<h1>'+E(a.name)+'</h1>'+
          '<small>'+(a.subs?fmtN(a.subs)+' subscriber · ':'')+'YouTube'+'</small></div>'+
        '<div class="x25ac"><button class="x25play" id="x25play" onclick="x25Play()" aria-label="Putar">▶</button>'+
          '<button class="x25ic" onclick="x25Shuf()" aria-label="Acak">⤮</button>'+
          '<button class="x25fb" id="x25fb"></button>'+
          '<button class="x25ic" onclick="x25Rad()" aria-label="Radio" title="Radio artis">📻</button></div>'+
        '<div id="x25pop"><div class="sec"><h3>Populer</h3></div><div class="x25sk"></div><div class="x25sk"></div><div class="x25sk"></div></div>'+
        '<div id="x25new"></div>'+
        '<div id="x25dis"></div>'+
        (mine.length?'<div class="sec"><h3>Koleksimu</h3></div><div id="x25own"></div>':'')+
        (tg.length?'<div class="sec"><h3>Sering kamu putar bersama</h3></div><div class="hs x25tg">'+tg.map(function(x,i){var p=photo(x.name);return'<div class="cd x25a" onclick="x25Sim('+i+')"><div class="x25r"><img src="'+E(p||cov({h:hh(x.name)}))+'" data-n="'+E(x.name)+'" alt="" onerror="x24E&&x24E(this)"></div><b>'+E(x.name)+'</b><small>'+(+x.n||0)+' playlist</small></div>'}).join('')+'</div>':'')+
        '<div id="x25ab"></div>'+
      '</div>');
    window.x25T=tg;
    if(mine.length){lists.x25o=mine;var o=Q('#x25own');if(o)o.innerHTML=rows('x25o',mine)}
    var b=Q('#x25fb');
    var paint=function(){var on=isFol(a.name);b.textContent=on?'Mengikuti':'Ikuti';b.className='x25fb'+(on?' on':'')};
    b.onclick=function(){folTg(a);paint()};paint();
    tint(a.img,Q('#x25'));
    about();
    if(DATA[key])fill(DATA[key]);
    else get('/api/artist?src=yt&id='+encodeURIComponent(a.id)+'&top=1&name='+encodeURIComponent(a.name),'tracks').then(function(t){
      if(t.length)return t;
      // cadangan: pencarian video channel (lebih mahal, hanya kalau jalur hemat kosong)
      return get('/api/artist?src=yt&id='+encodeURIComponent(a.id)+'&name='+encodeURIComponent(a.name),'tracks');
    }).then(function(t){
      DATA[key]=t.map(mk);
      if(S&&S.key==key)fill(DATA[key]);
    });
  }
  function popList(){return(S.all||[]).filter(function(t){return!t.rmx}).sort(function(a,b){return(b.v||0)-(a.v||0)})}
  function newList(){return(S.all||[]).filter(function(t){return t.ts}).sort(function(a,b){return b.ts-a.ts})}
  function fill(all){
    if(!S)return;
    S.all=all;
    var pop=popList();if(!pop.length)pop=all.slice();
    lists.x25p=pop.slice(0,30);
    paintPop();
    var nw=newList().filter(function(t){return!t.rmx}).slice(0,10);
    var el=Q('#x25new');
    if(el&&nw.length){
      lists.x25n=nw;
      var f=nw[0];
      el.innerHTML='<div class="sec"><h3>Rilis terbaru</h3></div>'+
        '<div class="x25nw" onclick="P(\'x25n\',0)"><img src="'+E(f.img)+'" alt=""><div><small>'+E(tgl(f.ts))+'</small><b>'+E(f.title)+'</b><span>▶ Putar</span></div></div>'+
        (nw.length>1?'<div class="hs">'+nw.slice(1).map(function(t,i){return'<div class="cd" onclick="P(\'x25n\','+(i+1)+')"><img src="'+E(t.img)+'" alt=""><b>'+E(t.title)+'</b><small>'+E(tgl(t.ts))+'</small></div>'}).join('')+'</div>':'');
    }
    S.tab=S.tab||'';
    disco();
  }
  function paintPop(){
    var el=Q('#x25pop');if(!el||!S)return;
    var L=lists.x25p||[];
    if(!L.length){el.innerHTML='<div class="sec"><h3>Populer</h3></div><div class="em">Belum ada lagu yang bisa diputar. Jika ini terus terjadi, cek kuota YouTube.</div>';return}
    var n=S.more?10:5,show=L.slice(0,n);
    lists.x25s=show;
    el.innerHTML='<div class="sec"><h3>Populer</h3></div><div class="x25ol">'+show.map(function(t,i){
      return'<div class="x25p" onclick="P(\'x25p\','+i+')"><span class="x25n">'+(i+1)+'</span><img src="'+E(t.img)+'" alt=""><div><b>'+E(t.title)+'</b><small>'+(t.v?fmtN(t.v)+' kali ditonton':'')+'</small></div><button class="x25mo" onclick="event.stopPropagation();x25Q('+i+')" aria-label="Tambah ke antrean">＋</button></div>';
    }).join('')+'</div>'+(L.length>5?'<button class="x25lm" onclick="x25More()">'+(S.more?'Lihat lebih sedikit':'Lihat lainnya')+'</button>':'');
  }
  function disco(){
    var el=Q('#x25dis');if(!el||!S)return;
    var a=S.a,all=S.all||[];
    var singles=newList().filter(function(t){return!t.rmx}),rmx=all.filter(function(t){return t.rmx});
    var albums=ALB[a.id];
    var tabs=[['alb','Album'],['sg','Single & Video'],['rmx','Remix']].filter(function(x){return x[0]=='alb'?albums===undefined||albums.length:x[0]=='sg'?singles.length:rmx.length});
    if(!tabs.length){el.innerHTML='';return}
    if(!S.tab||!tabs.some(function(x){return x[0]==S.tab}))S.tab=tabs[0][0];
    var body='';
    if(S.tab=='alb'){
      if(albums===undefined){
        body='<div class="em">Memuat album…</div>';
        get('/api/artist?src=yt&albums=1&id='+encodeURIComponent(a.id),'albums').then(function(l){ALB[a.id]=l;if(S&&S.a.id==a.id)disco()});
      }else{
        window.x25A=albums.map(function(x){return Object.assign({},x,{artist:a.name,aid:a.id})});
        body='<div class="hs">'+albums.map(function(x,i){return'<div class="cd" onclick="x25Al('+i+')"><img src="'+E(cov(x.img?{img:x.img}:{h:hh(x.name)}))+'" alt=""><b>'+E(x.name)+'</b><small>'+(+x.n?(+x.n)+' lagu':'Album')+'</small></div>'}).join('')+'</div>';
      }
    }else{
      var L=(S.tab=='sg'?singles:rmx).slice(0,30);lists.x25d=L;
      body='<div class="hs">'+L.map(function(t,i){return'<div class="cd" onclick="P(\'x25d\','+i+')"><img src="'+E(t.img)+'" alt=""><b>'+E(t.title)+'</b><small>'+(S.tab=='sg'?E(tgl(t.ts)):'Remix')+'</small></div>'}).join('')+'</div>';
    }
    el.innerHTML='<div class="sec"><h3>Diskografi</h3></div><div class="chips">'+tabs.map(function(x){return'<span class="chip '+(S.tab==x[0]?'a':'')+'" onclick="x25Tab(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+body;
  }
  function about(){
    var el=Q('#x25ab');if(!el||!S)return;
    var a=S.a,mine=own(a.name).length;
    el.innerHTML='<div class="sec"><h3>Tentang</h3></div><div class="x25ab"><div class="x25abi" style="background-image:url(\''+img(a).replace(/'/g,'%27')+'\')"><div><b>'+E(a.name)+'</b><small>'+(a.subs?fmtN(a.subs)+' subscriber':'Channel YouTube')+(mine?' · '+mine+' lagu di koleksimu':'')+'</small></div></div></div>';
  }

  /* ---------- aksi ---------- */
  window.x25Play=function(){if(lists.x25p&&lists.x25p.length)P('x25p',0);else toast('Lagu belum selesai dimuat')};
  window.x25Shuf=function(){
    var l=(lists.x25p||[]).slice();if(!l.length){toast('Lagu belum selesai dimuat');return}
    lists.x25a=l.sort(function(){return Math.random()-.5});P('x25a',0);
  };
  window.x25Rad=function(){
    var t=(lists.x25p||[])[0];
    if(!t){toast('Lagu belum selesai dimuat');return}
    if(typeof window.x21Radio=='function')window.x21Radio(t);else P('x25p',0);
  };
  window.x25More=function(){S.more=!S.more;paintPop()};
  window.x25Q=function(i){
    var t=(lists.x25s||[])[i];if(!t)return;
    try{if(!cur){play([t],0);openP();return}q.push(t);toast('Ditambahkan ke antrean')}catch(e){}
  };
  window.x25Tab=function(t){S.tab=t;disco()};
  window.x25Sim=function(i){var x=(window.x25T||[])[i];if(x)artistPg(x.name)};
  window.x25Al=function(i){var al=(window.x25A||[])[i];if(al&&window.x26Alb)window.x26Alb(al)};

  /* ---------- pasang: ganti x16Ch untuk artis YouTube ---------- */
  var _ch=window.x16Ch;
  window.x16Ch=function(a){
    if(a&&a.src=='yt'&&a.id)return open(a);
    return _ch?_ch(a):undefined;
  };
})();
