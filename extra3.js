/* Loopify v3.4 - Riwayat dengar + statistik mingguan (dimuat setelah extra2.js)
   Data disimpan lokal: ma_wk (detik per hari) dan ma_hlog (riwayat lagu, maks 300). Tidak mengubah data lama. */
(function(){
  var DAY=86400000,HN=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  var wk=ls.get('wk',{}),hlog=ls.get('hlog',[]),lastSave=0;
  function dk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function saveWk(force){var n=Date.now();if(!force&&n-lastSave<15000)return;lastSave=n;var ks=Object.keys(wk).sort();if(ks.length>60)ks.slice(0,ks.length-60).forEach(function(k){delete wk[k]});ls.set('wk',wk)}
  /* hitung detik mendengar per hari: bungkus stat() lama, ambil selisih stt.tot */
  var _stat=stat;
  stat=function(a){var b=stt.tot;_stat(a);var d=stt.tot-b;if(d>0&&d<5){var k=dk();wk[k]=(wk[k]||0)+d;saveWk()}};
  document.addEventListener('visibilitychange',function(){saveWk(true)});
  addEventListener('pagehide',function(){saveWk(true)});
  /* catat riwayat lagu: bungkus play() lama */
  var _play=play;
  play=function(list,i){_play(list,i);try{
    if(!cur||cur.yt||(!cur.loc&&!cur.url))return;
    var n=Date.now(),f=hlog[0];
    if(f&&f.t&&f.t.id==cur.id&&n-f.ts<30000)return;
    hlog.unshift({ts:n,t:svt(cur)});if(hlog.length>300)hlog.length=300;ls.set('hlog',hlog);
  }catch(e){}};
  /* menu: sisipkan "Riwayat & Mingguan" sebelum Statistik Dengar */
  function inject(){var v=$('#v');if(!v||v.querySelector('[data-hist]'))return;
    var s=v.querySelector('.ft[onclick="goStat()"]');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-hist','1');d.setAttribute('onclick','goHist()');
    d.innerHTML='<span>\uD83D\uDCC5</span><div>Riwayat &amp; Mingguan</div>';s.parentNode.insertBefore(d,s)}
  var _go=go;go=function(p){_go(p);inject()};inject();
  function fmt(sec){var h=Math.floor(sec/3600),m=Math.round(sec%3600/60);if(m==60){h++;m=0}return h?h+' j '+m+' mnt':m+' mnt'}
  function label(k){var t=dk(),y=dk(new Date(Date.now()-DAY));if(k==t)return 'Hari ini';if(k==y)return 'Kemarin';var p=k.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
  window.goHist=function(){
    saveWk(true);var now=new Date(),days=[],i,max=1,tot=0;
    for(i=6;i>=0;i--){var d=new Date(now.getTime()-i*DAY),k=dk(d),s=wk[k]||0;days.push({k:k,n:HN[d.getDay()],s:s});tot+=s;if(s>max)max=s}
    var streak=0;for(i=days.length-1;i>=0;i--){if(days[i].s>=30)streak++;else if(i==days.length-1)continue;else break}
    var wkStart=Date.now()-7*DAY,cnt={};hlog.forEach(function(e){if(e.ts>=wkStart&&e.t){var a=(rs(e.t)||e.t).artist;if(a)cnt[a]=(cnt[a]||0)+1}});
    var top=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]})[0];
    var bars=days.map(function(d){var h=Math.max(d.s?6:2,Math.round(d.s/max*84));
      return '<div style="flex:1;text-align:center"><div style="height:90px;display:flex;align-items:flex-end;justify-content:center"><div style="width:70%;height:'+h+'px;border-radius:8px 8px 4px 4px;background:'+(d.k==dk()?'var(--p2)':'var(--p)')+';opacity:'+(d.s?1:.25)+'"></div></div><small style="font-size:10px">'+d.n+'</small></div>'}).join('');
    var h='<div class="pcard" style="text-align:center"><small>7 hari terakhir</small><h1 style="margin-top:4px">'+fmt(tot)+'</h1><small>Rata-rata '+fmt(tot/7)+' per hari'+(streak>1?' · \uD83D\uDD25 '+streak+' hari beruntun':'')+'</small></div>'
      +'<div class="pcard" style="margin-top:12px"><div style="display:flex;gap:4px">'+bars+'</div>'+(top?'<small style="display:block;margin-top:10px;text-align:center">Artis minggu ini: <b>'+esc(top)+'</b></small>':'')+'</div>'
      +'<div class="sec"><h3>Riwayat Lagu</h3></div>';
    var items=[];hlog.slice(0,100).forEach(function(e){var t=rs(e.t);if(t)items.push({ts:e.ts,t:t})});
    lists.hl=items.map(function(x){return x.t});
    if(!items.length)h+='<div class="em">Belum ada riwayat. Lagu yang kamu putar akan muncul di sini.</div>';
    else{var g='';items.forEach(function(x,j){var k=dk(new Date(x.ts));if(k!=g){g=k;h+='<small style="display:block;margin:12px 0 4px;color:var(--p2);font-weight:700">'+label(k)+'</small>'}h+=row('hl',x.t,j)});
      h+='<button class="btn g" style="margin-top:16px" onclick="uiConfirm(\'Semua riwayat lagu akan dihapus.\',{title:\'Hapus riwayat?\',ok:\'Hapus\',danger:1}).then(function(o){if(o)ma3Clr()})">Hapus Riwayat</button>'}
    sub(shd('Riwayat &amp; Mingguan')+h)};
  window.ma3Clr=function(){hlog=[];ls.set('hlog',hlog);goHist()};
})();
