/* v4.32: Rekap Loopify (kartu bulanan), Streak & Lencana, Kartu Lirik untuk dibagikan.
   Data baru: ma_rc32 (detik per lagu/artis bulan ini, detik larut malam). Streak dan menit harian dari ma_wk (extra3). Dimuat setelah extra31.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x32b{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0}.x32b div{padding:12px;border-radius:16px;background:var(--c);border:1px solid var(--b);text-align:center;font-size:12px;color:var(--mu)}.x32b div.off{opacity:.38;filter:grayscale(1)}.x32b i{display:block;font-style:normal;font-size:30px;margin-bottom:4px}.x32b b{display:block;color:var(--tx);font-size:13px}.x32i{width:100%;border-radius:18px;display:block;margin:10px 0}.x32k{position:absolute;right:16px;bottom:96px;z-index:5;padding:8px 14px;font-size:13px}';
  document.head.appendChild(st);
  var MN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function mk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function dk(d){return mk(d)+'-'+String(d.getDate()).padStart(2,'0')}
  function fmt(s){var h=Math.floor(s/3600),m=Math.round(s%3600/60);if(m==60){h++;m=0}return h?h+' j '+m+' mnt':m+' mnt'}
  var RC=ls.get('rc32',null);
  if(!RC||RC.m!==mk())RC={m:mk(),pl:{},ar:{},night:0,tot:0};
  var rcT=0;
  function saveRc(){ls.set('rc32',RC)}
  /* pelacak bulanan: bungkus stat() (selisih stt.tot, sama seperti extra3) */
  var _stat=stat;
  stat=function(a){var b=+stt.tot||0;_stat(a);var d=(+stt.tot||0)-b;
    try{if(d>0&&d<5&&cur){
      if(RC.m!==mk())RC={m:mk(),pl:{},ar:{},night:0,tot:0};
      var e=RC.pl[cur.id]||(RC.pl[cur.id]={s:0,t:cur.title,a:cur.artist});e.s+=d;
      RC.ar[cur.artist]=(RC.ar[cur.artist]||0)+d;RC.tot+=d;
      var h=new Date().getHours();if(h>=22||h<4)RC.night+=d;
      if(Date.now()-rcT>15000){rcT=Date.now();saveRc()}
    }}catch(e){}};
  addEventListener('pagehide',saveRc);document.addEventListener('visibilitychange',saveRc);

  function top(o,n,f){return Object.keys(o).map(function(k){return f(k,o[k])}).sort(function(a,b){return b.s-a.s}).slice(0,n)}
  function streak(){var wk=ls.get('wk',{}),n=0,d=new Date();if((wk[dk(d)]||0)<30)d=new Date(d.getTime()-864e5);
    while((wk[dk(d)]||0)>=30){n++;d=new Date(d.getTime()-864e5)}return n}
  function best(){var wk=ls.get('wk',{}),ks=Object.keys(wk).sort(),b=0,c=0,p=null;
    ks.forEach(function(k){if(wk[k]<30){c=0;p=null;return}var t=new Date(k+'T00:00:00').getTime();c=(p&&Math.round((t-p)/864e5)==1)?c+1:1;p=t;if(c>b)b=c});return b}
  function badges(){var s=Math.max(streak(),best()),tot=+stt.tot||0,np=Object.keys(stt.pl||{}).length,na=Object.keys(stt.ar||{}).length;
    return [['🔥','Streak 3 hari',s>=3],['⚡','Streak 7 hari',s>=7],['👑','Streak 30 hari',s>=30],['🎧','10 jam mendengar',tot>=36000],['🏆','50 jam mendengar',tot>=180000],
      ['🎵','100 lagu berbeda',np>=100],['🧭','Penjelajah (10 artis)',na>=10],['🌙','Pendengar Malam',(RC.night||0)>=3600]]}
  window.goStreak32=function(){rbP=0;var s=streak(),b=best(),h=badges(),n=h.filter(function(x){return x[2]}).length;
    sub(shd('Streak & Lencana')+'<div class="pcard" style="text-align:center"><h1 style="font-size:46px">🔥 '+s+'</h1><small>hari berturut-turut (min. 30 detik per hari)<br>Rekor terbaik: '+Math.max(b,s)+' hari</small></div>'+
      '<div class="sec"><h3>Lencana ('+n+'/'+h.length+')</h3></div><div class="x32b">'+h.map(function(x){return '<div class="'+(x[2]?'':'off')+'"><i>'+x[0]+'</i><b>'+esc(x[1])+'</b>'+(x[2]?'Terbuka':'Terkunci')+'</div>'}).join('')+'</div>')};

  /* ---------- gambar kanvas + bagikan ---------- */
  function wrap(c,t,x,y,w,lh,max){var ws=String(t).split(' '),l='',n=0;for(var i=0;i<ws.length;i++){var k=l?l+' '+ws[i]:ws[i];if(c.measureText(k).width>w&&l){c.fillText(l,x,y);y+=lh;l=ws[i];if(++n>=max-1&&i<ws.length-1){c.fillText(l+'…',x,y);return y+lh}}else l=k}c.fillText(l,x,y);return y+lh}
  function base(W,H){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),r=getComputedStyle(document.documentElement),g=c.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#060928');g.addColorStop(.55,(r.getPropertyValue('--p')||'#6d5dfc').trim());g.addColorStop(1,(r.getPropertyValue('--p2')||'#9a8cff').trim());c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(6,9,40,.45)';c.fillRect(0,0,W,H);return [cv,c]}
  function show(cv,title,name){var u=cv.toDataURL('image/png');
    sub(shd(title)+'<img class="x32i" src="'+u+'"><button class="btn" id="x32s">Bagikan gambar</button>');
    var b=document.getElementById('x32s');b.onclick=function(){cv.toBlob(function(bl){var f=new File([bl],name,{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Loopify'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=name;document.body.appendChild(a);a.click();a.remove()}},'image/png')}}
  function ready(f){try{document.fonts.load('700 40px Sora').then(f,f)}catch(e){f()}}

  window.rekap32=function(){ready(function(){
    var W=1080,H=1350,o=base(W,H),cv=o[0],c=o[1],now=new Date(),ar=top(RC.ar,3,function(k,v){return{n:k,s:v}}),pl=top(RC.pl,3,function(k,v){return{n:v.t,a:v.a,s:v.s}});
    var F='Sora, system-ui, sans-serif';c.fillStyle='#fff';c.textBaseline='alphabetic';
    c.font='700 40px '+F;c.fillText('REKAP LOOPIFY',80,120);c.font='400 34px '+F;c.globalAlpha=.8;c.fillText(MN[now.getMonth()]+' '+now.getFullYear(),80,172);c.globalAlpha=1;
    c.font='700 150px '+F;c.fillText(String(Math.round((RC.tot||0)/60)),80,380);c.font='400 38px '+F;c.fillText('menit mendengar bulan ini',80,436);
    var y=540;c.font='700 36px '+F;c.fillText('Artis teratas',80,y);y+=30;
    if(!ar.length){c.font='400 32px '+F;c.fillText('Belum ada data. Putar lagu dulu ya.',80,y+50);y+=80}
    ar.forEach(function(a,i){y+=62;c.font='700 42px '+F;c.fillText((i+1)+'. '+(a.n.length>24?a.n.slice(0,23)+'…':a.n),80,y)});
    y+=100;c.font='700 36px '+F;c.fillText('Lagu teratas',80,y);
    pl.forEach(function(p,i){y+=62;c.font='700 40px '+F;c.fillText((i+1)+'. '+(p.n.length>26?p.n.slice(0,25)+'…':p.n),80,y)});
    c.font='400 34px '+F;c.fillText('🔥 Streak '+streak()+' hari',80,H-130);c.globalAlpha=.7;c.fillText('loopify1.vercel.app',80,H-80);
    show(cv,'Rekap Loopify','loopify-rekap-'+mk()+'.png')})};

  window.kartuLirik32=function(){
    if(!cur){return}var i=0,ps=[].slice.call(document.querySelectorAll('#pl .lyr p[data-i]')),on=ps.filter(function(p){return p.classList.contains('on')})[0],L=[];
    if(on){i=+on.dataset.i;var a=alOf(cur)||[];L=a.slice(i,i+4).map(function(x){return x.s}).filter(Boolean)}
    else{var P=[].slice.call(document.querySelectorAll('#pl .lyr p')).map(function(p){return p.textContent.trim()}).filter(Boolean);L=P.slice(0,4)}
    if(!L.length){return}
    ready(function(){var W=1080,o=base(W,W),cv=o[0],c=o[1],F='Sora, system-ui, sans-serif';c.fillStyle='#fff';
      c.font='700 58px '+F;var y=190;L.forEach(function(l,k){c.globalAlpha=k?.62:1;y=wrap(c,l,80,y,W-160,78,3)+14});
      c.globalAlpha=1;c.font='700 36px '+F;c.fillText(String(cur.title).slice(0,38),80,W-150);c.font='400 32px '+F;c.globalAlpha=.75;c.fillText(String(cur.artist).slice(0,40),80,W-100);
      c.globalAlpha=.55;c.font='400 26px '+F;c.fillText('Loopify',80,W-52);show(cv,'Kartu lirik','loopify-lirik.png')})};

  /* ---------- sisipkan menu dan tombol ---------- */
  function inject(){try{
    var v=$('#v');if(v&&!v.querySelector('[data-x32]')){var s=v.querySelector('.ft[onclick="goStat()"]');
      if(s){[['🗓','Rekap Loopify','rekap32()'],['🔥','Streak & Lencana','goStreak32()']].forEach(function(m){var d=document.createElement('div');d.className='ft';d.setAttribute('data-x32','1');d.setAttribute('onclick',m[2]);d.innerHTML='<span>'+m[0]+'</span><div>'+m[1].replace('&','&amp;')+'</div>';s.parentNode.insertBefore(d,s)})}}
    var pl=$('#pl'),has=pl&&pl.querySelector('.lyr'),bt=pl&&pl.querySelector('.x32k');
    if(has&&!bt){bt=document.createElement('button');bt.className='btn x32k';bt.textContent='🖼 Kartu';bt.onclick=function(e){e.stopPropagation();kartuLirik32()};pl.appendChild(bt)}
    else if(!has&&bt)bt.remove();
  }catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(inject,150)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  inject();
})();
