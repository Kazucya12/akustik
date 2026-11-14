/* Loopify v4.11 - Antrean dua tingkat (dalam antrean / dari daftar putar), Lirik layar penuh + kartu bagikan,
   daftar panjang dirender bertahap (ringan di HP). Dimuat setelah extra21.js (pasangan extra22.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};

  /* ---------- 9. Antrean dua tingkat ---------- */
  var _qa=qAdd;
  qAdd=function(k,i){
    var t=lists[k]&&lists[k][i];
    if(!t||t.yt||!cur)return _qa(k,i);
    var c=Object.assign({},t,{_uq:1}),p=qi+1;
    while(q[p]&&q[p]._uq)p++;
    q.splice(p,0,c);try{toast('Masuk antrean: '+t.title)}catch(e){}
  };
  var _qn=qNext;
  qNext=function(j){if(j!=qi&&q[j]&&!q[j]._uq)q[j]=Object.assign({},q[j],{_uq:1});return _qn(j)};
  window.x22Cq=function(){q=q.filter(function(t,i){return i<=qi||!t._uq});qR()};
  var _qR=qR;
  qR=function(){
    _qR();
    try{
      var sp=Q('#sp');if(!sp)return;
      QA('.q-lb',sp).forEach(function(d){if(d.textContent=='Berikutnya dari antrean')d.remove()});
      var R=QA('.rw[data-qi]',sp).map(function(r){return{r:r,i:+r.dataset.qi}}).filter(function(x){return x.i>qi});
      var u=R.filter(function(x){return q[x.i]&&q[x.i]._uq})[0],p=R.filter(function(x){return!(q[x.i]&&q[x.i]._uq)})[0];
      function lb(h,b){var d=document.createElement('div');d.className='q-lb';d.innerHTML=h;b.parentNode.insertBefore(d,b)}
      if(u)lb('Berikutnya dalam antrean <span class="q-x" onclick="x22Cq()">Hapus semua</span>',u.r);
      if(p)lb('Berikutnya dari daftar putar',p.r);
    }catch(e){}
  };

  /* ---------- 5. Lirik layar penuh + kartu bagikan ---------- */
  var LY={a:null,idx:-1,id:'',had:false,t:0,wl:null};
  function ensure(){
    var el=Q('#x22l');if(el)return el;
    el=document.createElement('div');el.className='ov';el.id='x22l';
    el.innerHTML='<div class="x22h"><button class="ib g" onclick="x22Cl()" aria-label="Tutup">✕</button><div class="x22m"><b></b><small></small></div><button class="ib g" onclick="x22Sh()" aria-label="Bagikan lirik">⤴</button></div><div id="x22t"></div><div class="x22c"><button class="ib g" onclick="nxt(-1)">⏮</button><button class="ib g x22pp" onclick="toggle()">⏯</button><button class="ib g" onclick="nxt(1)">⏭</button></div>';
    var p=document.getElementById('pl');(p&&p.parentNode||document.body).appendChild(el);
    Q('#x22t',el).addEventListener('click',function(e){var l=e.target.closest('.x22ln'),s=l&&LY.a&&LY.a[+l.dataset.i];if(s)try{act.currentTime=s.t}catch(x){}});
    return el;
  }
  function render(){
    var el=ensure(),t=cur,box=Q('#x22t',el);if(!t)return;
    var L=lyc[t.id],hu=+hh(t.title)||260;
    LY.id=t.id;LY.had=!!L;LY.idx=-1;LY.a=null;
    Q('.x22m b',el).textContent=t.title;Q('.x22m small',el).textContent=t.artist||'';
    el.style.background='linear-gradient(180deg,hsl('+hu+',55%,24%),var(--ov) 85%)';
    if(!L){try{fetchLy(t)}catch(e){}box.innerHTML='<div class="em">'+(lyS[t.id]=='none'?'Lirik tidak tersedia untuk lagu ini.':'Memuat lirik…')+'</div>';return}
    var al=alOf(t);
    if(al&&al.length){LY.a=al;box.innerHTML=al.map(function(x,i){return'<div class="x22ln" data-i="'+i+'">'+E(x.s||'♪')+'</div>'}).join('')}
    else box.innerHTML=String(L).split(/\r?\n/).map(function(l){return l.trim()?'<div class="x22p">'+E(l)+'</div>':'<div class="x22g"></div>'}).join('');
  }
  function tick(){
    var el=Q('#x22l');
    if(!el||!el.classList.contains('on')){clearInterval(LY.t);LY.t=0;return}
    if(!cur)return;
    if(LY.id!==cur.id||(!!lyc[cur.id])!==LY.had)render();
    if(!LY.a)return;
    var ct=(+act.currentTime||0)+.25,i=-1;
    for(var k=0;k<LY.a.length;k++){if(LY.a[k].t<=ct)i=k;else break}
    if(i===LY.idx)return;
    LY.idx=i;QA('.x22ln.on',el).forEach(function(x){x.classList.remove('on')});
    var n=Q('.x22ln[data-i="'+i+'"]',el);if(n){n.classList.add('on');n.scrollIntoView({block:'center',behavior:'smooth'})}
  }
  window.x22Ly=function(){
    if(!cur)return;var el=ensure();render();el.classList.add('on');
    if(!LY.t)LY.t=setInterval(tick,250);tick();
    try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){LY.wl=w}).catch(function(){})}catch(e){}
  };
  window.x22Cl=function(){var el=Q('#x22l');if(el)el.classList.remove('on');try{if(LY.wl){LY.wl.release();LY.wl=null}}catch(e){}};
  function wrap(x,text,mw){
    var w=String(text).split(' '),l='',o=[];
    w.forEach(function(s){var n=l?l+' '+s:s;if(x.measureText(n).width>mw&&l){o.push(l);l=s}else l=n});
    if(l)o.push(l);return o;
  }
  window.x22Sh=function(){
    var t=cur;if(!t)return;var txt;
    if(LY.a)txt=LY.a.slice(Math.max(0,LY.idx),Math.max(0,LY.idx)+4).map(function(x){return x.s}).filter(Boolean);
    else txt=String(lyc[t.id]||'').split(/\r?\n/).map(function(s){return s.trim()}).filter(Boolean).slice(0,4);
    if(!txt.length)return;
    var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;
    var x=c.getContext('2d'),hu=+hh(t.title)||260,g=x.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'hsl('+hu+',60%,34%)');g.addColorStop(1,'hsl('+((hu+50)%360)+',55%,14%)');x.fillStyle=g;x.fillRect(0,0,W,H);
    function fin(){
      x.fillStyle='#fff';x.textBaseline='top';x.font='800 64px system-ui,sans-serif';
      var y=320;txt.forEach(function(l){wrap(x,l,W-200).forEach(function(s){x.fillText(s,100,y);y+=84});y+=26});
      x.globalAlpha=.9;x.font='700 36px system-ui,sans-serif';x.fillText(String(t.title).slice(0,40),100,H-220);
      x.globalAlpha=.7;x.font='500 30px system-ui,sans-serif';x.fillText(String(t.artist||'').slice(0,50),100,H-166);
      x.font='700 28px system-ui,sans-serif';x.fillText('Loopify',100,H-96);
      c.toBlob(function(b){
        if(!b)return;var f=new File([b],'lirik.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:t.title}).catch(function(){});
        else{var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='lirik.png';a.click();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
      },'image/png');
    }
    if(!t.img||!/^https?:/.test(t.img))return fin();
    var im=new Image(),done=0,go=function(ok){
      if(done)return;done=1;
      if(ok){x.save();x.beginPath();if(x.roundRect)x.roundRect(100,110,170,170,26);else x.rect(100,110,170,170);x.clip();x.drawImage(im,100,110,170,170);x.restore()}
      fin();
    };
    im.crossOrigin='anonymous';im.onload=function(){go(1)};im.onerror=function(){go(0)};setTimeout(function(){go(0)},2500);im.src=t.img;
  };
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x22b',b)){var r=document.createElement('button');r.className='btn g x22b';r.textContent='🎤 Lirik';r.onclick=window.x22Ly;b.appendChild(r)}}catch(e){}
  };

  /* ---------- 10. Daftar panjang dirender bertahap ---------- */
  function lz(r){var m=r.querySelector('img');if(m){m.loading='lazy';m.decoding='async'}}
  function lazy(){
    var all=QA('#v .rw,#sp .rw');if(all.length<=110)return;
    var P=[];all.forEach(function(r){var p=r.parentNode;if(P.indexOf(p)<0)P.push(p)});
    P.forEach(function(p){
      var rw=[].filter.call(p.children,function(c){return c.classList.contains('rw')});
      if(rw.length<=110||Q(':scope>.x22s',p))return;
      var rest=rw.slice(60),s=document.createElement('div');s.className='x22s';
      rest.forEach(function(r){r.remove()});rw.slice(0,60).forEach(lz);rw[59].after(s);
      var io=new IntersectionObserver(function(en){
        if(!en[0].isIntersecting)return;
        var ch=rest.splice(0,60);ch.forEach(function(r){lz(r);s.before(r)});
        if(!rest.length){io.disconnect();s.remove()}else{io.unobserve(s);io.observe(s)}
      },{rootMargin:'900px'});
      io.observe(s);
    });
  }
  var raf=0;
  function sched(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;try{lazy()}catch(e){}})}
  if(window.MutationObserver&&window.IntersectionObserver){
    var mo=new MutationObserver(sched);
    ['v','sp'].forEach(function(id){var n=document.getElementById(id);if(n)mo.observe(n,{childList:true,subtree:true})});
  }
})();
