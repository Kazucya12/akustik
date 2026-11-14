/* Loopify v4.10 - Radio (dari lagu/artis, antrean terus bertambah), Rilis terbaru dari artis yang diikuti,
   dan alamat stream Audius langsung (mengurangi tersendat). Dimuat setelah extra20.js (pasangan extra21.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function jget(u){return fetch(u).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}})}
  function toT(t){return t.yt?Object.assign(mkV(t.vid||t.id,t.title,t.artist),{ts:t.ts}):Object.assign({h:hh(t.title)},t)}
  function note(m){return uiPick(m,['OK'])}

  /* ---------- Radio ---------- */
  var RAD=null,mor=0;
  function sim(art,title,have){
    var qs=[art];if(title)qs.push(String(title).split(/[\(\[\-]/)[0]+' '+art);
    return Promise.all(qs.map(function(s){return jget('/api/music?src=all&q='+encodeURIComponent(s))})).then(function(r){
      var o=[],S={};r.forEach(function(a){(Array.isArray(a)?a:[]).forEach(function(x){if(x&&x.id&&x.url&&!S[x.id]&&!have[x.id]){S[x.id]=1;o.push(toT(x))}})});
      return o.sort(function(){return Math.random()-.5});
    });
  }
  function bar(){
    var b=Q('#x21b');if(!RAD){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.id='x21b';document.body.appendChild(b)}
    b.innerHTML='📻 Radio · '+E(RAD.seed)+' <button class="ib g" onclick="x21End()">✕</button>';
  }
  window.x21End=function(){RAD=null;bar()};
  window.x21Radio=function(t){
    var seed=t&&typeof t=='object'?t:null,art=seed?seed.artist:String(t||'');if(!art)return;
    var have={};if(seed)have[seed.id]=1;
    sim(art,seed&&seed.title,have).then(function(l){
      if(!l.length)return note('Belum ada lagu mirip untuk radio ini.');
      var lst=(seed?[seed]:[]).concat(l.slice(0,24));RAD={seed:art,ids:{}};
      lst.forEach(function(x){RAD.ids[x.id]=1});play(lst,0);bar();
    });
  };
  function more(){
    if(mor||!RAD)return;mor=1;
    var A=[],S={},have={};q.forEach(function(x){have[x.id]=1});
    q.slice(-6).forEach(function(x){if(x.artist&&!S[x.artist]){S[x.artist]=1;A.push(x.artist)}});
    sim(A[Math.floor(Math.random()*A.length)]||RAD.seed,'',have).then(function(l){
      mor=0;if(!RAD)return;l.slice(0,15).forEach(function(x){q.push(x);RAD.ids[x.id]=1});
    }).catch(function(){mor=0});
  }

  /* ---------- Alamat stream Audius langsung ---------- */
  var RC={},INF={};
  function aid(t){var m=t&&!t.loc&&!t.yt&&typeof t.url=='string'&&/^https:\/\/api\.audius\.co\/v1\/tracks\/([\w-]+)\/stream/.exec(t.url);return m?m[1]:''}
  function resolve(list){
    var need=[];
    list.forEach(function(t){var id=aid(t);if(id&&!(RC[id]&&RC[id].e>Date.now())&&!INF[id]&&need.indexOf(id)<0)need.push(id)});
    need=need.slice(0,10);if(!need.length)return;
    need.forEach(function(id){INF[id]=1});
    jget('/api/stream?ids='+need.join(',')).then(function(m){need.forEach(function(id){delete INF[id];if(m&&m[id])RC[id]={u:m[id],e:Date.now()+4*60000}})});
  }
  var _play=play;
  play=function(l,i){
    var t=l&&l[i],id=aid(t),r=id&&RC[id];
    if(RAD&&t&&!RAD.ids[t.id])window.x21End();
    var o=_play.apply(this,arguments);
    try{
      if(r&&r.e>Date.now()&&act===B&&cur&&!cur.loc&&cur.id==t.id){B.src=r.u;B.play().catch(function(){})}
      resolve([cur].concat(q.slice(qi+1,qi+4)));
      if(RAD&&q.length-qi<=4)more();
    }catch(e){}
    return o;
  };
  window.x21Pre=resolve;

  /* ---------- Rilis terbaru dari artis yang diikuti ---------- */
  function fol(){return ls.get('fol',[])}
  function latest(){
    var f=fol().filter(function(x){return x.i&&x.s}).slice(0,8),key=f.map(function(x){return x.i}).join(),c=ls.get('newc',null);
    if(!f.length)return Promise.resolve([]);
    if(c&&c.k==key&&Date.now()-c.t<6*3600e3)return Promise.resolve(c.l);
    return Promise.all(f.map(function(x){return jget('/api/artist?latest=1&src='+x.s+'&id='+encodeURIComponent(x.i)+'&name='+encodeURIComponent(x.n)).then(function(j){return(j.tracks||[]).map(function(t){t._a=x.n;return t})})})).then(function(r){
      var l=[].concat.apply([],r).filter(function(t){return t.ts}).sort(function(a,b){return b.ts-a.ts}).slice(0,30);
      ls.set('newc',{t:Date.now(),k:key,l:l});return l;
    });
  }
  function ago(ts){var d=Math.floor((Date.now()-ts)/864e5);return d<1?'hari ini':d<7?d+' hari lalu':d<30?Math.floor(d/7)+' minggu lalu':Math.floor(d/30)+' bulan lalu'}
  function homeNew(){
    var h=Q('#v [data-x16h]');if(!h||Q('[data-x21n]',h)||!fol().some(function(x){return x.i}))return;
    var d=document.createElement('div');d.setAttribute('data-x21n','1');h.appendChild(d);
    latest().then(function(l){
      l=l.filter(function(t){return t.ts>Date.now()-90*864e5}).slice(0,12).map(toT);
      if(!l.length||!d.isConnected)return;
      lists.nw=l;
      d.innerHTML='<div class="sec"><h3>Rilis terbaru dari artis yang kamu ikuti</h3></div><div class="hs">'+l.map(function(t,i){return'<div class="cd" onclick="P(\'nw\','+i+')"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small>'+E(t.artist)+' · '+ago(t.ts)+'</small></div>'}).join('')+'</div>';
    });
  }
  function libBadge(){
    if(typeof pg=='undefined'||pg!='library'||lt!='ar')return;
    var c=ls.get('newc',null),f=fol();if(!c||!f.length)return;
    var fresh={};c.l.forEach(function(t){if(t.ts>Date.now()-14*864e5)fresh[String(t._a).toLowerCase()]=1});
    QA('#v .rw[onclick^="x16FG("]').forEach(function(r){
      var m=/x16FG\((\d+)\)/.exec(r.getAttribute('onclick')),x=m&&f[+m[1]];
      if(x&&fresh[String(x.n).toLowerCase()]&&!Q('.x21n',r)){var s=document.createElement('span');s.className='x21n';s.textContent='Baru';r.appendChild(s)}
    });
  }

  /* ---------- tombol Radio ---------- */
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x21r',b)){var r=document.createElement('button');r.className='btn g x21r';r.textContent='📻 Radio';r.onclick=function(){x21Radio(cur)};b.appendChild(r)}}catch(e){}
  };
  function inj(){
    var b=Q('#x16b .x16pb'),h=Q('.x16hd h2');
    if(b&&h&&!Q('.x21r',b)){var r=document.createElement('button');r.className='btn g x21r';r.textContent='📻 Radio';var n=h.textContent.replace(/ ✓$/,'');r.onclick=function(){x21Radio(n)};b.appendChild(r)}
  }
  var _ch=window.x16Ch,_tb=window.x16Tab;
  if(_ch)window.x16Ch=function(a){_ch(a);inj()};
  if(_tb)window.x16Tab=function(t){_tb(t);inj()};

  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{homeNew();libBadge()}catch(e){}}).observe(v,{childList:true});
  setTimeout(function(){try{latest().then(libBadge)}catch(e){}},2500);
})();
