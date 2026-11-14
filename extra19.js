/* Loopify v4.9 - Playlist kolaboratif (tautan edit bersama) + Jam (dengar bareng). Butuh login. Dimuat setelah extra18.js. */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function auth(){try{var a=JSON.parse(localStorage.getItem('mx_auth'));return a&&a.session&&a.exp>Date.now()?a:null}catch(e){return null}}
  function api(b){
    var a=auth();if(!a)return Promise.reject({status:401});b.session=a.session;
    return fetch('/api/collab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw{status:r.status,msg:j.error};return j})});
  }
  function note(m){return uiPick(m,['OK'])}
  function need(){return note('Masuk dulu di tab Profil untuk memakai fitur ini.')}
  function err(e){return note(e&&e.status==401?'Sesi habis. Masuk lagi di tab Profil.':(e&&e.msg)||'Gagal. Coba lagi nanti.')}
  function clean(t){var o={id:t.id,title:t.title,artist:t.artist,img:t.img};if(t.yt){o.yt=1;o.vid=t.vid}else o.url=t.url;return o}
  function toLocal(t){return t.yt?mkV(t.vid,t.title,t.artist):Object.assign({h:hh(t.title)},t)}
  function ids(a){return a.map(function(x){return String(x&&typeof x=='object'?x.id:x)})}
  function url(k,c){return location.origin+location.pathname+'#'+k+'='+c}

  /* ---------- Playlist kolaboratif ---------- */
  function coSync(i){
    var p=pls[i];if(!p||!p.co)return Promise.resolve(0);
    var L=p.tr.map(rs).filter(Boolean),Ls=ids(L),Cs=p.cs||[];
    var add=L.filter(function(t){return!t.loc&&Cs.indexOf(String(t.id))<0}).slice(0,30).map(clean);
    var rm=Cs.filter(function(x){return Ls.indexOf(x)<0});
    return api({action:'co_sync',code:p.co,add:add,rm:rm}).then(function(d){
      var keep=p.tr.filter(function(x){var t=rs(x);return t&&t.loc});
      p.tr=d.tr.map(toLocal).concat(keep);p.cs=ids(d.tr);plSave();return d;
    });
  }
  var _op=window.openPl,busy={};
  window.openPl=function(i,k){
    _op(i,k);
    try{
      var p=pls[i],sp=Q('#sp'),ch=sp&&Q('.chips',sp);
      if(p&&ch&&!Q('[data-x19c]',sp))ch.insertAdjacentHTML('beforeend','<span class="chip" data-x19c="1" onclick="x19Co('+i+')">👥 Kolab'+(p.co?' · '+E(p.co):'')+'</span>');
      if(!k&&p&&p.co&&auth()&&!busy[i]){busy[i]=1;coSync(i).then(function(){busy[i]=0;if(Q('#sp [onclick^="plPlay('+i+')"]'))window.openPl(i,1)}).catch(function(){busy[i]=0})}
    }catch(e){}
  };
  window.x19Co=async function(i){
    var p=pls[i];if(!p)return;if(!auth())return need();
    var k=await uiPick('Playlist kolaboratif',p.co?['Salin tautan','Sinkronkan sekarang','Berhenti berkolaborasi']:['Buat tautan kolaborasi']);if(k==null)return;
    if(!p.co){
      var L=p.tr.map(rs).filter(function(t){return t&&!t.loc}).slice(0,200).map(clean);
      return api({action:'co_create',name:p.n,d:p.d||'',tracks:L}).then(function(d){p.co=d.code;p.cs=ids(d.tr);plSave();openPl(i,1);share('Kirim tautan ini ke temanmu. Mereka perlu masuk dulu agar bisa ikut menambah dan menghapus lagu.','collab',d.code)}).catch(err);
    }
    if(k==0)share('Kirim tautan ini ke temanmu.','collab',p.co);
    else if(k==1)coSync(i).then(function(){openPl(i,1)}).catch(err);
    else{delete p.co;delete p.cs;plSave();openPl(i,1)}
  };
  function share(msg,kind,c){return uiPrompt(msg,url(kind,c),{title:kind=='jam'?'Tautan Jam':'Tautan kolaborasi',max:200})}

  /* ---------- Jam (dengar bareng) ---------- */
  var J=null;
  function bar(){
    var b=Q('#x19b');if(!J){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.id='x19b';document.body.appendChild(b)}
    b.innerHTML='👥 Jam '+J.code+' · '+(J.role=='host'?'Host':'Tamu')+' <button class="ib g" onclick="x19End()">✕</button>';
  }
  window.x19End=function(){if(J){clearInterval(J.t);if(J.role=='host')api({action:'jam_end',code:J.code}).catch(function(){})}J=null;bar()};
  function pos(){return cur&&!cur.yt?+act.currentTime||0:0}
  function hostTick(){
    if(!J||J.role!='host'||!cur||cur.loc)return;
    api({action:'jam_put',code:J.code,track:clean(cur),pos:pos(),playing:cur.yt?true:!act.paused}).catch(function(e){if(e&&(e.status==404||e.status==401))x19End()});
  }
  function apply(s){
    if(!s||!s.track)return;var t=toLocal(s.track);
    if(!cur||String(cur.id)!=String(t.id)){play([t],0);return}
    if(t.yt)return;
    var tg=s.pos+(s.playing?(s.now-s.ts)/1000:0);
    if(Math.abs(act.currentTime-tg)>5)try{act.currentTime=tg}catch(e){}
    if(s.playing&&act.paused)act.play().catch(function(){});else if(!s.playing&&!act.paused)act.pause();
  }
  function guestTick(){if(!J)return;api({action:'jam_get',code:J.code}).then(apply).catch(function(e){if(e&&(e.status==404||e.status==401))x19End()})}
  function jamJoin(c){
    x19End();
    api({action:'jam_get',code:c}).then(function(s){J={role:'guest',code:c};J.t=setInterval(guestTick,3000);bar();apply(s)}).catch(function(e){err(e&&e.status==404?{msg:'Kode Jam tidak ditemukan atau sudah berakhir.'}:e)});
  }
  window.x19Jam=async function(){
    var k=await uiPick('Jam · dengar bareng',J?['Salin tautan Jam','Keluar dari Jam']:['Mulai Jam (jadi host)','Gabung dengan kode']);if(k==null)return;
    if(!auth())return need();
    if(J){if(k==0)share('Kirim tautan ini ke temanmu.','jam',J.code);else x19End();return}
    if(k==1){var c=((await uiPrompt('Masukkan kode Jam 6 huruf.','',{title:'Gabung Jam',max:6}))||'').trim().toUpperCase();if(c)jamJoin(c);return}
    if(!cur||cur.loc)return note('Putar lagu online dulu (bukan file dari perangkat), lalu mulai Jam.');
    api({action:'jam_start',track:clean(cur),pos:pos(),playing:cur.yt?true:!act.paused}).then(function(d){
      J={role:'host',code:d.code};J.t=setInterval(hostTick,3000);bar();share('Kirim tautan atau kode ini ke temanmu. Jam berakhir kalau kamu keluar.','jam',d.code);
    }).catch(err);
  };

  /* tombol Jam di pemutar dan di Beranda */
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x19j',b)){var j=document.createElement('button');j.className='btn g x19j';j.textContent='👥 Jam';j.onclick=window.x19Jam;b.appendChild(j)}}catch(e){}
  };
  function homeChip(){var c=Q('#v [data-x16h] .chips');if(c&&!Q('.x19j',c)){var s=document.createElement('span');s.className='chip x19j';s.textContent='👥 Jam';s.onclick=window.x19Jam;c.appendChild(s)}}
  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{homeChip()}catch(e){}}).observe(v,{childList:true});

  /* buka tautan #collab=KODE atau #jam=KODE */
  function hashJoin(){
    var m=/[#&](collab|jam)=([A-Za-z0-9]{6})/.exec(location.hash);if(!m)return;
    if(!auth())return need();
    history.replaceState(null,'',location.pathname+location.search);
    var c=m[2].toUpperCase();
    if(m[1]=='jam')return jamJoin(c);
    api({action:'co_sync',code:c,add:[],rm:[]}).then(function(d){
      if(!pls.some(function(p){return p.co==d.code})){pls.push({n:d.name,tr:d.tr.map(toLocal),co:d.code,cs:ids(d.tr),d:d.d||undefined});plSave()}
      lt='pl';go('library');
    }).catch(err);
  }
  setTimeout(hashJoin,2200);
})();
