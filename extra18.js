/* Loopify v4.8 - Halaman Album (tab Album di profil artis Audius) + playlist: deskripsi, folder, seret untuk mengurutkan.
   Dimuat setelah extra17.js (pasangan extra18.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function img(x){return E(cov(x.img?{img:x.img}:{h:hh(x.name||x.title||'')}))}
  function get(u,k){return fetch(u).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){return j[k]||[]})}

  /* ---------- 5. Album ---------- */
  var ca=null,AC={},_ch=window.x16Ch,_tb=window.x16Tab;
  function chip(){var t=Q('#x16t');if(ca&&ca.src&&t&&!Q('.x18ac',t)){var s=document.createElement('span');s.className='chip x18ac';s.textContent='Album';s.onclick=alb;t.appendChild(s)}}
  window.x16Ch=function(a){ca=a;_ch(a);chip()};
  window.x16Tab=function(t){_tb(t);chip()};
  function alb(){
    var t=Q('#x16t'),b=Q('#x16b');if(!t||!b||!ca)return;
    QA('.chip',t).forEach(function(c){c.classList.toggle('a',c.classList.contains('x18ac'))});
    var id=ca.id,show=function(l){window.x18A=l;b.innerHTML=l.length?'<div class="x16g2">'+l.map(function(x,i){return'<div class="x18c" onclick="x18Al('+i+')"><img src="'+img(x)+'" alt=""><b>'+E(x.name)+'</b><small>'+(x.n?x.n+' lagu':'Album')+'</small></div>'}).join('')+'</div>':'<div class="em">Belum ada album.</div>'};
    if(AC[id])return show(AC[id]);
    b.innerHTML='<div class="em">Memuat…</div>';
    get('/api/artist?src='+ca.src+'&albums=1&id='+encodeURIComponent(id),'albums').then(function(l){AC[id]=l;if(ca&&ca.id==id&&Q('.x18ac.a'))show(l)});
  }
  window.x18Shuf=function(){lists.al=(lists.al||[]).slice().sort(function(){return Math.random()-.5});P('al',0)};
  window.x18Al=function(i){
    var al=(window.x18A||[])[i];if(!al)return;var who=ca?ca.name:'';
    sub(shd(E(al.name))+'<div class="x16hd"><img src="'+img(al)+'" alt=""><h2>'+E(al.name)+'</h2><small>Album · '+E(who)+'</small></div><div id="x18t"><div class="em">Memuat…</div></div>');
    get('/api/artist?src='+(ca?ca.src:'au')+'&album='+encodeURIComponent(al.id),'tracks').then(function(a){
      a=a.map(function(x){return ca&&ca.src=='yt'?Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx}):Object.assign({h:hh(x.title)},x)});
      var el=Q('#x18t'),sm=Q('.x16hd small'),sec=a.reduce(function(s,x){return s+(x.d||0)},0);
      if(sm)sm.textContent='Album · '+who+' · '+a.length+' lagu'+(sec?' · '+Math.max(1,Math.round(sec/60))+' mnt':'');
      if(el)el.innerHTML=a.length?'<div class="x16pb"><button class="btn" onclick="P(\'al\',0)">▶ Putar</button><button class="btn g" onclick="x18Shuf()">⤮ Acak</button></div>'+rows('al',a):'<div class="em">Album kosong atau tidak bisa diputar.</div>';
    });
  };

  /* ---------- 4. Playlist: deskripsi, folder, seret urutan ---------- */
  var _op=window.openPl;
  window.openPl=function(i,k){_op(i,k);try{pl(i)}catch(e){}};
  function pl(i){
    var p=pls[i],sp=Q('#sp');if(!p||!sp||Q('[data-x18]',sp))return;
    var ch=Q('.chips',sp);if(!ch)return;
    var d=document.createElement('div');d.setAttribute('data-x18','1');d.className='x18d';d.textContent=p.d||'';d.style.display=p.d?'':'none';
    ch.parentNode.insertBefore(d,ch);
    ch.insertAdjacentHTML('beforeend','<span class="chip" onclick="x18Ds('+i+')">✎ Deskripsi</span><span class="chip" onclick="x18Fo('+i+')">📁 '+(p.f?E(p.f):'Folder')+'</span>');
    QA('.rw',sp).forEach(function(r){
      var up=r.querySelector('[onclick^="plMv("]'),m=up&&/plMv\((\d+),(\d+),-1\)/.exec(up.getAttribute('onclick'));if(!m)return;
      var h=document.createElement('span');h.className='x18dh';h.textContent='≡';h.dataset.i=m[1];h.dataset.j=m[2];r.insertBefore(h,r.firstChild);
    });
  }
  window.x18Ds=async function(i){var p=pls[i];if(!p)return;var v=await uiPrompt('Tulis deskripsi playlist.',p.d||'',{title:'Deskripsi playlist',max:160});if(v==null)return;p.d=String(v).trim().slice(0,160);if(!p.d)delete p.d;plSave();openPl(i,1)};
  window.x18Fo=async function(i){var p=pls[i];if(!p)return;var v=await uiPrompt('Nama folder. Kosongkan untuk melepas dari folder.',p.f||'',{title:'Folder playlist',max:30});if(v==null)return;p.f=String(v).trim().slice(0,30);if(!p.f)delete p.f;plSave();openPl(i,1)};
  var dg=null;
  document.addEventListener('pointerdown',function(e){
    var h=e.target.closest&&e.target.closest('.x18dh');if(!h)return;
    e.preventDefault();dg={i:+h.dataset.i,r:h.parentNode};dg.r.classList.add('x18drag');
    try{h.setPointerCapture(e.pointerId)}catch(x){}
  });
  document.addEventListener('pointermove',function(e){
    if(!dg)return;
    var el=document.elementFromPoint(e.clientX,e.clientY),row=el&&el.closest&&el.closest('#sp .rw');
    if(!row||row===dg.r||!row.querySelector('.x18dh'))return;
    var b=row.getBoundingClientRect();row.parentNode.insertBefore(dg.r,e.clientY>b.top+b.height/2?row.nextSibling:row);
  });
  function drop(){
    var s=dg;dg=null;if(!s)return;s.r.classList.remove('x18drag');
    var p=pls[s.i];if(!p)return;
    var ord=QA('#sp .x18dh').map(function(h){return+h.dataset.j}),old=p.tr.slice();
    if(ord.length==old.length)p.tr=ord.map(function(j){return old[j]});
    plSave();openPl(s.i,1);
  }
  document.addEventListener('pointerup',drop);document.addEventListener('pointercancel',drop);

  /* folder di Library > Playlist */
  var OP={};
  function fold(){
    var c=Q('#v .x16grid');if(!c||c.dataset.x18f||typeof lt=='undefined'||lt!='pl')return;
    c.dataset.x18f='1';var G={};
    QA('.rw.pl',c).forEach(function(r){var m=/^openPl\((\d+)\)/.exec(r.getAttribute('onclick')||''),p=m&&pls[+m[1]];if(p&&p.f)(G[p.f]=G[p.f]||[]).push(r)});
    Object.keys(G).forEach(function(n){
      var f=document.createElement('div');f.className='rw x18fd';
      f.innerHTML='<div class="x16heart x18fo">📁</div><div><b>'+E(n)+'</b><small>'+G[n].length+' playlist</small></div><span class="x18ch"></span>';
      G[n][0].parentNode.insertBefore(f,G[n][0]);
      var set=function(){G[n].forEach(function(r){r.style.display=OP[n]?'':'none';r.classList.add('x18in')});Q('.x18ch',f).textContent=OP[n]?'⌄':'›'};
      f.onclick=function(){OP[n]=!OP[n];set()};set();
    });
  }
  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{fold()}catch(e){}}).observe(v,{childList:true});
  setTimeout(function(){try{fold()}catch(e){}},500);
})();
