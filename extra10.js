/* Loopify v3.9 - fitur 5-10 ala Spotify (pasangan extra10.css). Dimuat setelah extra9.js. */
(function(){
  'use strict';
  var E=function(s){return esc(s)};
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

  /* ---------- gambar kartu (dipakai playlist & Wrapped) ---------- */
  function ensureImgModal(){
    var m=document.getElementById('wrimg');if(m)return m;
    m=document.createElement('div');m.id='wrimg';document.getElementById('app').appendChild(m);return m;
  }
  function showCard(canvas,name){
    canvas.toBlob(function(b){
      if(!b){toast('Gagal membuat gambar');return}
      var url=URL.createObjectURL(b),m=ensureImgModal();
      m.innerHTML='<img src="'+url+'" alt=""><div class="row"><button class="btn" id="wrimgS">Bagikan</button><button class="btn g" id="wrimgD">Simpan</button><button class="btn g" id="wrimgC">Tutup</button></div>';
      m.classList.add('on');
      document.getElementById('wrimgC').onclick=function(){m.classList.remove('on');setTimeout(function(){URL.revokeObjectURL(url)},500)};
      document.getElementById('wrimgD').onclick=function(){var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Gambar disimpan')};
      document.getElementById('wrimgS').onclick=function(){
        try{var f=new File([b],name,{type:'image/png'});
          if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Loopify'}).catch(function(){});return}}catch(e){}
        document.getElementById('wrimgD').click();
      };
    },'image/png');
  }
  function loadImg(src,cb){
    if(!src){cb(null);return}
    var im=new Image(),done=0;im.crossOrigin='anonymous';
    function f(v){if(done)return;done=1;cb(v)}
    im.onload=function(){f(im)};im.onerror=function(){f(null)};im.src=src;setTimeout(function(){f(null)},3500);
  }
  function wrapTxt(x,t,mx,fs,maxW){ /* potong teks agar muat */
    x.font=fs;if(x.measureText(t).width<=maxW)return t;
    while(t.length>1&&x.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t+'…';
  }

  /* ---------- 5. Antrean: seret untuk mengatur urutan + penanda + crossfade ---------- */
  var _qR=qR;
  qR=function(){
    _qR();
    try{
      var sp=document.getElementById('sp');if(!sp)return;
      var rowsEl=$$('.rw[onclick^="qGo("]',sp);if(!rowsEl.length)return;
      rowsEl.forEach(function(r){
        var i=+r.getAttribute('onclick').match(/\d+/)[0];r.setAttribute('data-qi',i);
        if(i!==qi){
          var h=document.createElement('span');h.className='q-h';h.textContent='≡';h.setAttribute('data-qh',i);h.setAttribute('aria-label','Geser');
          var b=r.querySelector('button');r.insertBefore(h,b||null);
        }
      });
      var cr=rowsEl.filter(function(r){return +r.getAttribute('data-qi')===qi})[0],nx=rowsEl.filter(function(r){return +r.getAttribute('data-qi')===qi+1})[0];
      function lb(t,before){var d=document.createElement('div');d.className='q-lb';d.textContent=t;before.parentNode.insertBefore(d,before)}
      if(cr)lb('Sedang diputar',cr);
      if(nx)lb('Berikutnya dari antrean',nx);
      /* crossfade cepat */
      var cf=cfg.cf==null?0:+cfg.cf,box=document.createElement('div');box.className='q-cf';
      box.innerHTML='<div class="q-lb" style="margin-left:0">Crossfade</div><div class="chips">'+[[0,'Mati'],[3,'3 dtk'],[5,'5 dtk'],[8,'8 dtk']].map(function(x){return'<span class="chip '+(cf==x[0]?'a':'')+'" onclick="cfgSet(\'cf\','+x[0]+');qR()">'+x[1]+'</span>'}).join('')+'</div>';
      sp.appendChild(box);
    }catch(e){}
  };
  var drag=null;
  document.addEventListener('pointerdown',function(e){
    var h=e.target.closest&&e.target.closest('.q-h');if(!h)return;
    var row=h.closest('.rw');if(!row)return;
    e.preventDefault();e.stopPropagation();
    drag={row:row,id:e.pointerId};row.classList.add('q-dg');
    try{h.setPointerCapture(e.pointerId)}catch(x){}
  },true);
  document.addEventListener('pointermove',function(e){
    if(!drag)return;e.preventDefault();
    var row=drag.row,list=row.parentNode;
    var others=$$('.rw[data-qi]',list).filter(function(r){return r!==row});
    for(var k=0;k<others.length;k++){
      var rc=others[k].getBoundingClientRect(),mid=rc.top+rc.height/2;
      if(e.clientY<mid){if(others[k].previousElementSibling!==row)list.insertBefore(row,others[k]);return}
    }
    var last=others[others.length-1];if(last&&last.nextElementSibling!==row)last.after(row);
  },{passive:false});
  function endDrag(){
    if(!drag)return;var row=drag.row;drag=null;row.classList.remove('q-dg');
    var order=$$('.rw[data-qi]',row.parentNode).map(function(r){return +r.getAttribute('data-qi')});
    var nq=order.map(function(i){return q[i]}),cu=q[qi];
    if(nq.some(function(t){return !t}))return;
    q=nq;qi=Math.max(0,q.indexOf(cu));qR();
  }
  document.addEventListener('pointerup',endDrag,true);document.addEventListener('pointercancel',endDrag,true);

  /* ---------- 6/9. Pemutar: tombol "Mirip lagu ini" ---------- */
  var _rp=rp;
  rp=function(){
    _rp();
    try{
      var p=document.getElementById('pl'),t=cur;if(!p||!t||p.querySelector('.q-sim'))return;
      if(t.loc||t.radio||t.yt||(t.rec&&!t.url))return;
      var act=p.querySelector('.act');if(!act)return;
      var b=document.createElement('button');b.className='btn g q-sim';b.textContent='✨ Mirip lagu ini';b.setAttribute('onclick','autoRadio(1)');
      act.after(b);
    }catch(e){}
  };

  /* ---------- 8. Kartu bagikan playlist ---------- */
  window.plCard=function(i){
    var p=pls[i];if(!p)return;
    var tr=p.tr.map(rs).filter(Boolean);
    if(!tr.length){toast('Playlist masih kosong');return}
    toast('Membuat kartu…');
    var srcs=(p.img?[p.img]:[]).concat(tr.map(function(t){return t.img}).filter(Boolean)).slice(0,4),imgs=[],n=0;
    function done(){
      var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
      var hue=hh(p.n),g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'hsl('+hue+',70%,34%)');g.addColorStop(1,'hsl('+((hue+50)%360)+',75%,14%)');x.fillStyle=g;x.fillRect(0,0,W,H);
      var S=520,X=(W-S)/2,Y=110;
      x.save();x.beginPath();x.rect(X,Y,S,S);x.clip();
      var ok=imgs.filter(Boolean);
      if(ok.length>=4){ok.slice(0,4).forEach(function(im,k){x.drawImage(im,X+(k%2)*S/2,Y+Math.floor(k/2)*S/2,S/2,S/2)})}
      else if(ok.length){x.drawImage(ok[0],X,Y,S,S)}
      else{var gg=x.createLinearGradient(X,Y,X+S,Y+S);gg.addColorStop(0,'hsl('+hue+',80%,55%)');gg.addColorStop(1,'hsl('+((hue+60)%360)+',70%,30%)');x.fillStyle=gg;x.fillRect(X,Y,S,S);x.fillStyle='rgba(255,255,255,.9)';x.font='700 200px sans-serif';x.textAlign='center';x.fillText('♪',W/2,Y+S/2+70)}
      x.restore();
      x.fillStyle='#fff';x.textAlign='left';
      x.font='800 64px sans-serif';x.fillText(wrapTxt(x,p.n,0,'800 64px sans-serif',W-160),80,Y+S+110);
      x.font='400 32px sans-serif';x.fillStyle='rgba(255,255,255,.75)';x.fillText(p.tr.length+' lagu',80,Y+S+160);
      x.font='600 36px sans-serif';
      tr.slice(0,5).forEach(function(t,k){
        x.fillStyle='rgba(255,255,255,.55)';x.fillText(String(k+1),80,Y+S+240+k*62);
        x.fillStyle='#fff';x.fillText(wrapTxt(x,t.title+' - '+t.artist,0,'600 36px sans-serif',W-240),140,Y+S+240+k*62);
      });
      x.textAlign='center';x.font='700 34px sans-serif';x.fillStyle='rgba(255,255,255,.9)';x.fillText('Loopify',W/2,H-50);
      showCard(c,'loopify-playlist.png');
    }
    if(!srcs.length)done();else srcs.forEach(function(s,k){loadImg(s,function(im){imgs[k]=im;if(++n===srcs.length)done()})});
  };
  var _op=openPl;
  openPl=function(i,keep){
    _op(i,keep);
    try{var sp=document.getElementById('sp'),b=sp&&sp.querySelector('[onclick^="plShare("]');
      if(b&&!sp.querySelector('[data-pc]')){var k=document.createElement('button');k.className='btn g';k.setAttribute('data-pc','1');k.setAttribute('onclick','plCard('+i+')');k.textContent='Kartu';b.after(k)}}catch(e){}
  };

  /* ---------- 9. Daily Mix ---------- */
  var dmCache={};
  function dayKey(){var d=new Date();return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
  function seeded(a,seed){ /* acak stabil per hari */
    var s=0;for(var i=0;i<seed.length;i++)s=(s*31+seed.charCodeAt(i))>>>0;
    function r(){s=(s*1664525+1013904223)>>>0;return s/4294967296}
    a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a;
  }
  function topArtists(){
    return Object.keys(stt.ar||{}).map(function(n){return{n:n,s:+stt.ar[n]||0}}).filter(function(x){return x.s>20&&x.n&&x.n!=='Tidak diketahui'}).sort(function(a,b){return b.s-a.s}).slice(0,3).map(function(x){return x.n});
  }
  function mixes(){
    var ar=topArtists();if(!ar.length)return[];
    var n=Math.min(3,ar.length),out=[];
    for(var i=0;i<n;i++){var a=[ar[i]];if(ar.length>1)a.push(ar[(i+1)%ar.length]);out.push(a)}
    return out;
  }
  function localFor(artists){
    var m=known(),res=[];
    m.forEach(function(t){if(t&&!t.yt&&!t.radio&&artists.indexOf(t.artist)>=0)res.push(t)});return res;
  }
  window.dmOpen=function(k){
    var mx=mixes()[k];if(!mx)return;
    var key=dayKey()+':'+k+':'+mx.join('|');
    function show(list){
      lists.dm=list;
      sub(shd('Daily Mix '+(k+1))+'<small style="display:block;margin:0 4px 10px;color:var(--mu)">'+E(mx.join(', '))+' dan lagu serupa</small>'+(list.length?'<button class="btn" onclick="play(lists.dm,0);openP()">▶ Putar</button><div style="height:8px"></div>'+rows('dm',list):'<div class="em">Belum ada lagu.</div>'));
    }
    if(dmCache[key]){show(dmCache[key]);return}
    var loc=localFor(mx);
    sub(shd('Daily Mix '+(k+1))+'<div class="em">Menyiapkan mix…</div>');
    Promise.all(mx.map(function(a){return ytSearch(a).catch(function(){return[]})})).then(function(rs2){
      var seen={},all=[];
      loc.concat([].concat.apply([],rs2).map(function(x){x.h=hh(x.title);return x})).forEach(function(t){if(t&&t.id!=null&&!seen[t.id]){seen[t.id]=1;all.push(t)}});
      dmCache[key]=seeded(all,key).slice(0,30);show(dmCache[key]);
    });
  };
  function addMixes(v){
    if(v.querySelector('[data-dm]')||cfg.dmx===false)return;
    var mx=mixes();if(!mx.length)return;
    var tr=null;$$('.sec h3',v).forEach(function(h){if(h.textContent.trim()==='Trending')tr=h.closest('.sec')});
    var w=document.createElement('div');w.setAttribute('data-dm','1');
    var m=known();
    w.innerHTML='<div class="sec"><h3>Daily Mix</h3></div><div class="hs">'+mx.map(function(a,k){
      var f=null;m.forEach(function(t){if(!f&&t&&a.indexOf(t.artist)>=0&&t.img)f=t});
      var im=f?'<img src="'+E(f.img)+'" alt="">':'',hue=hh(a[0]);
      return'<div class="dm-cd" onclick="dmOpen('+k+')"><div class="dm-cv" style="background:linear-gradient(135deg,hsl('+hue+',70%,45%),hsl('+((hue+60)%360)+',70%,22%))">'+im+'<span>Daily Mix '+(k+1)+'</span></div><small>'+E(a.join(', '))+'</small></div>';
    }).join('')+'</div>';
    if(tr)tr.parentNode.insertBefore(w,tr);else v.appendChild(w);
  }

  /* ---------- 10. Wrapped ---------- */
  function wrData(){
    var SS=(window.wrSrc&&window.wrSrc(window.wrPeriod||'all'))||stt;
    var mm=known(),tot=+SS.tot||0;
    var songs2=Object.keys(SS.pl||{}).map(function(id){var v=SS.pl[id],o=v&&typeof v==='object'?v:{s:+v||0},t=mm.get(id);return{n:(t&&t.title)||o.t||id,a:(t&&t.artist)||o.a||'',s:+o.s||0,c:o.n||0}}).filter(function(x){return x.s>5}).sort(function(a,b){return b.s-a.s}).slice(0,5);
    var arts=Object.keys(SS.ar||{}).map(function(n){return{n:n,s:+SS.ar[n]||0}}).filter(function(x){return x.s>5}).sort(function(a,b){return b.s-a.s}).slice(0,5);
    return{tot:tot,min:Math.round(tot/60),songs:songs2,arts:arts};
  }
  var WRC=[['#ff5f7e','#8b5cf6'],['#12b886','#2d8bff'],['#f59f00','#ff5f7e'],['#7048e8','#15aabf'],['#e64980','#f76707']];
  function wrSlides(d){
    var s=[];
    s.push('<h2>Loopify Wrapped</h2><p>Rangkuman dengarmu · '+(window.wrLabel?window.wrLabel(window.wrPeriod||'all'):'sepanjang waktu')+'</p><div class="big">'+d.min+'</div><p>menit mendengarkan musik'+(d.min>=60?' (sekitar '+(d.tot/3600).toFixed(1)+' jam)':'')+'</p>');
    if(d.songs[0])s.push('<p>Lagu nomor 1-mu</p><h2>'+E(d.songs[0].n)+'</h2><p>'+E(d.songs[0].a)+'</p><div class="big">'+Math.max(1,Math.round(d.songs[0].s/60))+'</div><p>menit diputar'+(d.songs[0].c?' · '+d.songs[0].c+'x diputar':'')+'</p>');
    if(d.songs.length)s.push('<h2>5 lagu teratasmu</h2><div class="wr-l">'+d.songs.map(function(x,i){return'<div><em>'+(i+1)+'</em><span>'+E(x.n)+'<small>'+E(x.a)+'</small></span></div>'}).join('')+'</div>');
    if(d.arts.length)s.push('<p>Artis yang paling sering kamu dengar</p><h2>'+E(d.arts[0].n)+'</h2><div class="wr-l">'+d.arts.map(function(x,i){return'<div><em>'+(i+1)+'</em><span>'+E(x.n)+'<small>'+Math.max(1,Math.round(x.s/60))+' menit</small></span></div>'}).join('')+'</div>');
    s.push('<h2>Terima kasih sudah mendengarkan.</h2><p>Terus putar, terus temukan lagu baru.</p><button class="wr-btn" onclick="wrShare()">Bagikan ringkasan</button>');
    return s;
  }
  var wrS=[],wrI=0;
  function wrShow(){
    var w=document.getElementById('wr');if(!w)return;
    var c=WRC[wrI%WRC.length];
    w.style.background='linear-gradient(160deg,'+c[0]+','+c[1]+')';
    w.innerHTML='<div class="wr-bar">'+wrS.map(function(_,k){return'<i class="'+(k<wrI?'d':k===wrI?'a':'')+'"></i>'}).join('')+'</div><button class="wr-x" onclick="wrClose()" aria-label="Tutup">✕</button><div class="wr-s">'+wrS[wrI]+'</div><div class="wr-t"><b onclick="wrGo(-1)"></b><b onclick="wrGo(1)"></b></div>';
  }
  window.wrGo=function(d){var n=wrI+d;if(n<0)return;if(n>=wrS.length){wrClose();return}wrI=n;wrShow()};
  window.wrClose=function(){var w=document.getElementById('wr');if(w)w.classList.remove('on')};
  window.wrOpen=function(p){
    window.wrPeriod=p||'all';
    var d=wrData();if(d.tot<60){toast(window.wrPeriod==='all'?'Dengarkan beberapa lagu dulu, lalu buka Wrapped':'Belum ada data untuk periode ini. Data bulanan mulai dihitung sejak pembaruan ini');return}
    var w=document.getElementById('wr');if(!w){w=document.createElement('div');w.id='wr';document.getElementById('app').appendChild(w)}
    wrS=wrSlides(d);wrI=0;wrShow();w.classList.add('on');
  };
  window.wrShare=function(){
    var d=wrData(),W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5f7e');g.addColorStop(.55,'#8b5cf6');g.addColorStop(1,'#2d8bff');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#fff';x.textAlign='left';
    x.font='800 84px sans-serif';x.fillText('Loopify Wrapped',80,200);
    x.font='400 40px sans-serif';x.fillStyle='rgba(255,255,255,.85)';x.fillText('Rangkuman dengarmu · '+(window.wrLabel?window.wrLabel(window.wrPeriod||'all'):'sepanjang waktu'),80,262);
    x.fillStyle='#fff';x.font='800 190px sans-serif';x.fillText(String(d.min),80,520);
    x.font='400 42px sans-serif';x.fillText('menit mendengarkan',80,584);
    x.font='700 46px sans-serif';x.fillText('Lagu teratas',80,720);
    d.songs.forEach(function(t,k){x.font='700 44px sans-serif';x.fillStyle='rgba(255,255,255,.6)';x.fillText(String(k+1),80,800+k*86);x.fillStyle='#fff';x.fillText(wrapTxt(x,t.n,0,'700 44px sans-serif',W-240),150,800+k*86)});
    x.font='700 46px sans-serif';x.fillStyle='#fff';x.fillText('Artis teratas',80,1290);
    d.arts.forEach(function(t,k){x.font='700 44px sans-serif';x.fillStyle='rgba(255,255,255,.6)';x.fillText(String(k+1),80,1370+k*86);x.fillStyle='#fff';x.fillText(wrapTxt(x,t.n,0,'700 44px sans-serif',W-240),150,1370+k*86)});
    x.textAlign='center';x.font='700 40px sans-serif';x.fillText('Loopify',W/2,H-70);
    showCard(c,'loopify-wrapped.png');
  };
  function addWrapped(v){
    if(v.querySelector('[data-wr]'))return;
    var h1=v.querySelector('h1');if(!h1||h1.textContent.trim()!=='Profil')return;
    var first=v.querySelector('.pcard');if(!first)return;
    var d=document.createElement('div');d.className='wr-c';d.setAttribute('data-wr','1');d.setAttribute('onclick',"wrOpen('all')");
    d.innerHTML='<span class="wr-e">✨</span><div><b>Loopify Wrapped</b><br><small>Lihat rangkuman dengarmu</small><div class="wr-p"><span onclick="event.stopPropagation();wrOpen(\'all\')">Semua</span><span onclick="event.stopPropagation();wrOpen(\'m0\')">Bulan ini</span><span onclick="event.stopPropagation();wrOpen(\'m1\')">Bulan lalu</span></div></div>';
    first.after(d);
  }

  /* ---------- pengamat halaman ---------- */
  function deco(){var v=document.getElementById('v');if(!v)return;try{if(v.querySelector('.hero'))addMixes(v);addWrapped(v)}catch(e){}}
  var vv=document.getElementById('v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){setTimeout(deco,0)}).observe(vv,{childList:true});
  setTimeout(deco,300);
})();
