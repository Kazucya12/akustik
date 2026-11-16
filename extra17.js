/* Loopify v4.7 - Sinkron akun, riwayat & saran pencarian (termasuk lirik), geser mini-player kiri/kanan,
   kartu "Tentang artis" + "Lagu serupa" di pemutar. Dimuat setelah extra16.js (pasangan extra17.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},E=function(s){return esc(s)};
  function low(s){return String(s||'').trim().toLowerCase()}

  /* ---------- 1. Sinkron lewat akun (butuh login; data: favorit, playlist, artis diikuti, pin, riwayat cari) ----------
     v4.30: gabung tiga arah (dasar = hasil sinkron terakhir 'syncB', lokal, server). Penambahan dan penghapusan dari
     dua perangkat sama-sama dipertahankan. Server menolak (409) simpanan yang berdasar versi lama, jadi tidak ada lagi yang saling menimpa. */
  var KS=['favs','pls','fol','pin','plr','lsrt','lgrid','qh'],last='',ready=0,busy=0;
  function J(x){return JSON.stringify(x)}
  function union(a,b,f){var s={},o=[];(a||[]).concat(b||[]).forEach(function(x){var k=f(x);if(!s[k]){s[k]=1;o.push(x)}});return o}
  function snap(){var o={};KS.forEach(function(k){var v=ls.get(k,null);if(v!==null)o[k]=v});return o}
  function auth(){try{var a=JSON.parse(localStorage.getItem('mx_auth'));return a&&a.session&&a.exp>Date.now()?a:null}catch(e){return null}}
  function call(b){return fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:J(b)}).then(function(r){return r.ok||r.status==409?r.json():null}).catch(function(){return null})}
  function tk(t){return t&&t.id!=null?String(t.id):J(t)}
  // daftar: unsur dasar yang hilang di salah satu sisi = dihapus di sisi itu; unsur baru di salah satu sisi = ditambah
  function m3(b,l,r,f,front){
    var B={},L={},R={},o=[],seen={},add=[];
    (b||[]).forEach(function(x){B[f(x)]=1});(l||[]).forEach(function(x){L[f(x)]=1});(r||[]).forEach(function(x){R[f(x)]=1});
    (r||[]).forEach(function(x){var k=f(x);if(seen[k])return;seen[k]=1;if(B[k]&&!L[k])return;o.push(x)});
    (l||[]).forEach(function(x){var k=f(x);if(seen[k])return;seen[k]=1;if(B[k])return;add.push(x)});
    return front?add.concat(o):o.concat(add);
  }
  function byName(a){var m={};(a||[]).forEach(function(p){if(p)m[String(p.n||'').trim().toLowerCase()]=p});return m}
  function mPl(b,l,r){
    var bm=byName(b),lm=byName(l),rm=byName(r);
    return m3(b,l,r,function(p){return String(p.n||'').trim().toLowerCase()}).map(function(p){
      var k=String(p.n||'').trim().toLowerCase(),B=bm[k],L=lm[k],R=rm[k];
      if(!L||!R)return p;
      if(B&&J(L)==J(B))return R;
      if(B&&J(R)==J(B))return L;
      var o=Object.assign({},R,L);o.tr=m3(B&&B.tr,L.tr,R.tr,tk);return o;
    });
  }
  function mo(b,l,r,max){
    b=b||{};l=l||{};r=r||{};var o=Object.assign({},r);
    Object.keys(l).forEach(function(k){if(max)o[k]=Math.max(+l[k]||0,+r[k]||0);else if(J(l[k])!=J(b[k]))o[k]=l[k]});
    return o;
  }
  function merge3(B,l,r){
    B=B||{};l=l||{};r=r||{};var o=Object.assign({},r);
    function has(k){return l[k]!==undefined||r[k]!==undefined}
    if(has('favs'))o.favs=m3(B.favs,l.favs,r.favs,tk);
    if(has('pls'))o.pls=mPl(B.pls,l.pls,r.pls);
    if(has('fol'))o.fol=m3(B.fol,l.fol,r.fol,function(x){return low(x.n)});
    if(has('pin'))o.pin=m3(B.pin,l.pin,r.pin,String);
    if(has('qh'))o.qh=m3(B.qh,l.qh,r.qh,low,1).slice(0,10);
    if(has('plr'))o.plr=mo(B.plr,l.plr,r.plr,1);
    if(has('lsrt'))o.lsrt=mo(B.lsrt,l.lsrt,r.lsrt);
    if(has('lgrid'))o.lgrid=l.lgrid!==undefined&&J(l.lgrid)!=J(B.lgrid)?l.lgrid:(r.lgrid!==undefined?r.lgrid:l.lgrid);
    return typeof scrubData=='function'?scrubData(o):o;
  }
  function apply(m){KS.forEach(function(k){if(m[k]!==undefined)ls.set(k,m[k])})}
  function push(f,n){
    var a=auth(),s=J(snap());
    if(!a||!ready||busy||(!f&&s==last))return Promise.resolve();
    busy=1;
    return call({action:'put',session:a.session,data:snap(),bt:ls.get('syncT',0)}).then(function(j){
      busy=0;
      if(j&&j.conflict){
        var l=snap(),m=merge3(ls.get('syncB',null),l,j.data||{});
        apply(m);var s2=snap(),ch=J(s2)!=J(l);
        ls.set('syncB',s2);ls.set('syncT',j.t);last='';
        if((n||0)>=2){if(ch)location.reload();return}
        return push(true,(n||0)+1).then(function(){if(ch)location.reload()});
      }
      if(j&&j.t){ls.set('syncT',j.t);ls.set('syncB',JSON.parse(s));last=s}
    });
  }
  function pull(){
    var a=auth();if(!a)return;
    call({action:'get',session:a.session}).then(function(j){
      if(!j||j.conflict)return;
      var T=ls.get('syncT',0),l=snap(),B=ls.get('syncB',null);
      if(!j.data){ready=1;last='';return}
      if(j.t<=T){ready=1;if(J(l)==J(j.data))last=J(l);return}
      var dirty=B?J(l)!=J(B):true;
      var m=(T&&!dirty)?j.data:merge3(T?B:null,l,j.data);
      if(typeof scrubData=='function')m=scrubData(m);
      var changed=J(m)!=J(l),need=J(m)!=J(j.data);
      apply(m);ready=1;
      var s=snap();ls.set('syncB',s);ls.set('syncT',j.t);last=need?'':J(s);
      var done=function(){if(changed)location.reload()};
      if(need)push(true).then(done);else done();
    });
  }
  setTimeout(pull,1500);
  setInterval(function(){push()},5000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)pull()});

  /* ---------- 8. Riwayat & saran pencarian ---------- */
  function qh(){return ls.get('qh',[])}
  var _ds=doSearch;
  doSearch=async function(s){
    await _ds(s);
    try{var t=String(s||'').trim();if(t&&typeof lres!='undefined'&&lres&&lres.length){ls.set('qh',[t].concat(qh().filter(function(x){return low(x)!=low(t)})).slice(0,10))}}catch(e){}
  };
  window.x17Q=function(i){var s=(window.x17S||[])[i];if(s!=null)qs(s)};
  window.x17Rm=function(i,e){if(e)e.stopPropagation();var h=qh();h.splice(i,1);ls.set('qh',h);sg17()};
  window.x17Cl=function(){ls.set('qh',[]);sg17()};
  function titles(q){
    var r=[],s={};
    function add(t,why){var k=low(t.title);if(s[k]||r.length>=6)return;s[k]=1;r.push({s:t.title+(t.artist&&!GEN17.test(t.artist)?' '+t.artist:''),t:t.title,w:why})}
    var all=[].concat(songs,favs.map(rs),hist.map(rs)).filter(Boolean);
    all.filter(function(t){return low(t.title).indexOf(q)>=0||low(t.artist).indexOf(q)>=0}).forEach(function(t){add(t,t.artist||'')});
    if(q.length>=4)all.forEach(function(t){var L=lyc[t.id];if(L&&JSON.stringify(L).toLowerCase().indexOf(q)>=0)add(t,'Cocok di lirik')});
    return r;
  }
  var GEN17=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  function sg17(){
    var b=Q('#x16');if(!b||!Q('#qi'))return;
    var q=low(typeof lq=='string'?lq:''),h='',S=[];
    if(!q){
      var H=qh();if(!H.length)return;S=H.slice();
      h='<div class="sec"><h3>Pencarian terakhir</h3><button class="ib g" style="font-size:12px;width:auto;padding:0 10px" onclick="x17Cl()">Hapus</button></div>'+H.map(function(x,i){return'<div class="rw x17s" onclick="x17Q('+i+')"><span class="x17i">⟲</span><div><b>'+E(x)+'</b></div><button class="ib g" onclick="x17Rm('+i+',event)">✕</button></div>'}).join('');
    }else{
      var P=union(qh().filter(function(x){return low(x).indexOf(q)==0&&low(x)!=q}).map(function(x){return{s:x,w:'Riwayat'}}),titles(q),function(x){return low(x.s)}).slice(0,6);
      if(!P.length||Q('[data-x17s]',b))return;S=P.map(function(x){return x.s});
      h='<div data-x17s="1">'+P.map(function(x,i){return'<div class="rw x17s" onclick="x17Q('+i+')"><span class="x17i">⌕</span><div><b>'+E(x.s)+'</b>'+(x.w?'<small>'+E(x.w)+'</small>':'')+'</div></div>'}).join('')+'</div>';
    }
    window.x17S=S;b.insertAdjacentHTML('afterbegin',h);
  }

  /* ---------- 7. Geser mini-player kiri/kanan = lagu berikutnya/sebelumnya ---------- */
  var sw=null;
  document.addEventListener('touchstart',function(e){var m=e.target.closest&&e.target.closest('#mp');sw=m&&e.touches.length==1&&!e.target.closest('button')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
  document.addEventListener('touchend',function(e){
    var s=sw;sw=null;if(!s||!e.changedTouches[0])return;
    var dx=e.changedTouches[0].clientX-s.x,dy=e.changedTouches[0].clientY-s.y;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2){try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}nxt(dx<0?1:-1)}
  },{passive:true});

  /* ---------- 6. Pemutar: Tentang artis + Lagu serupa ---------- */
  function isFolA(n){return ls.get('fol',[]).some(function(x){return low(x.n)==low(n)})}
  window.x17Fol=function(b){
    var t=cur;if(!t)return;var l=ls.get('fol',[]),k=low(t.artist),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else l.unshift({n:t.artist,img:t.img||'',s:'',i:''});
    ls.set('fol',l);b.textContent=j>=0?'Ikuti':'Mengikuti';b.classList.toggle('on',j<0);
  };
  window.x17Sim=function(b){
    var t=cur;if(!t)return;b.disabled=true;b.textContent='Mencari…';
    ytSearch(t.artist+' '+t.title.split(/[\(\[\-]/)[0]).catch(function(){return[]}).then(function(a){
      b.disabled=false;b.textContent='Lagu serupa';
      a=(Array.isArray(a)?a:[]).filter(function(x){return x&&x.id!=t.id}).slice(0,25).map(function(x){return Object.assign({h:hh(x.title)},x)});
      if(!a.length)return;lists.sim=a;clp();sub(shd('Lagu serupa')+rows('sim',a));
    });
  };
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{
      var p=document.getElementById('pl'),t=cur;
      if(!p||!t||t.yt&&0||Q('.x17ab',p)||!t.artist||GEN17.test(t.artist))return;
      var d=document.createElement('div'),on=isFolA(t.artist);d.className='x17ab';
      d.innerHTML='<div class="x17h">Tentang artis</div><div class="x17r"><img src="'+E(cov(t.img?{img:t.img}:{h:hh(t.artist)}))+'" alt=""><div><b>'+E(t.artist)+'</b><small>Ketuk untuk membuka profil</small></div></div>'+
        '<div class="x17b"><button class="btn g" onclick="clp();artistPg(cur.artist)">Buka artis</button><button class="btn g'+(on?' on':'')+'" onclick="x17Fol(this)">'+(on?'Mengikuti':'Ikuti')+'</button><button class="btn g" onclick="x17Sim(this)">Lagu serupa</button></div>';
      p.appendChild(d);
    }catch(e){}
  };

  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{sg17()}catch(e){}}).observe(v,{childList:true});
  var _rn=window.x16F;if(_rn)window.x16F=function(f){_rn(f);setTimeout(sg17,0)};
  setTimeout(function(){try{sg17()}catch(e){}},400);
  var qi=Q('#qi');if(qi)qi.addEventListener('input',function(){setTimeout(function(){var b=Q('#x16');if(b){var o=Q('[data-x17s]',b);if(o)o.remove()}sg17()},650)});
})();
