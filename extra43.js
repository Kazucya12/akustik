/* v4.43: Tantangan Mingguan (3 tantangan baru tiap Senin) + Lencana (pencapaian). Dimuat setelah extra42.js.
   Data: ma_wc43 (progres minggu ini), ma_wcTot (total tantangan selesai), ma_ach43 (penghitung kejadian). */
(function(){
  function p2(n){return String(n).padStart(2,'0')}
  function dk(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
  function monday(d){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
  function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}

  var POOL=[
    {id:'ar',e:'🧭',t:'Dengar {n} artis berbeda',n:[3,5,7]},
    {id:'min',e:'⏱',t:'Dengar total {n} menit',n:[60,120,200]},
    {id:'trk',e:'🎵',t:'Putar {n} lagu berbeda',n:[8,15,25]},
    {id:'day',e:'📅',t:'Dengar di {n} hari berbeda',n:[3,4,5]},
    {id:'fav',e:'💖',t:'Tambahkan {n} lagu ke favorit',n:[2,3,5]}
  ];
  function wkKey(){return dk(monday(new Date()))}
  function pick(w){var seed=hash(w),a=POOL.slice(),out=[],i;
    for(i=0;i<3;i++){var k=(seed>>>(i*5))%a.length,t=a.splice(k,1)[0];out.push({id:t.id,e:t.e,t:t.t,n:t.n[(seed>>>(i*3+1))%t.n.length]})}
    return out}
  var W;function load(){W=ls.get('wc43',null);var k=wkKey();
    if(!W||W.w!==k){var b=0;try{b=favs.length}catch(e){}W={w:k,ch:pick(k),ar:{},pl:{},fb:b,done:[]};ls.set('wc43',W)}}
  function minutes(){var wk=ls.get('wk',{}),m=monday(new Date()),s=0,i;for(i=0;i<7;i++){var d=new Date(m.getTime()+i*864e5);if(d<=new Date())s+=(wk[dk(d)]||0)}return Math.floor(s/60)}
  function days(){var wk=ls.get('wk',{}),m=monday(new Date()),n=0,i;for(i=0;i<7;i++){var d=new Date(m.getTime()+i*864e5);if((wk[dk(d)]||0)>=30)n++}return n}
  function val(c){switch(c.id){
    case'ar':return Object.keys(W.ar).length;
    case'trk':return Object.keys(W.pl).length;
    case'min':return minutes();
    case'day':return days();
    case'fav':try{return Math.max(0,favs.length-(W.fb||0))}catch(e){return 0}}
    return 0}
  function tick(){try{load();
    if(cur&&act&&act.paused===false){if(cur.artist)W.ar[cur.artist]=1;if(cur.id!=null)W.pl[cur.id]=1}
    var ch=false;W.ch.forEach(function(c){if(W.done.indexOf(c.id)<0&&val(c)>=c.n){W.done.push(c.id);ls.set('wcTot',(+ls.get('wcTot',0)||0)+1);ch=true;
      if(typeof toast==='function')toast('🎯 Tantangan selesai: '+c.t.replace('{n}',c.n))}});
    ls.set('wc43',W)}catch(e){}}
  setInterval(tick,5000);setTimeout(tick,2500);

  /* ---------- Halaman Tantangan ---------- */
  window.goChal43=function(){rbP=0;load();
    var end=new Date(monday(new Date()).getTime()+7*864e5),left=Math.max(0,Math.ceil((end-new Date())/864e5)),dn=W.done.length;
    sub(shd('Tantangan Mingguan')+'<div class="pcard" style="margin:0 0 12px"><b>'+dn+' dari 3 selesai</b><br><small>Tantangan baru muncul Senin · sisa '+left+' hari · total selesai: '+(+ls.get('wcTot',0)||0)+'</small></div>'+
      W.ch.map(function(c){var v=val(c),ok=W.done.indexOf(c.id)>=0,pc=Math.min(100,Math.round(v/c.n*100));
        return'<div class="pcard" style="margin:0 0 12px'+(ok?';outline:2px solid #2ed39a':'')+'"><div style="display:flex;gap:12px;align-items:center"><div style="font-size:30px">'+(ok?'✅':c.e)+'</div><div style="flex:1;min-width:0"><b>'+c.t.replace('{n}',c.n)+'</b><br><small>'+Math.min(v,c.n)+' / '+c.n+(ok?' · selesai':'')+'</small></div></div>'+
          '<div style="height:8px;border-radius:99px;background:rgba(255,255,255,.12);margin-top:10px;overflow:hidden"><div style="height:100%;width:'+pc+'%;background:linear-gradient(90deg,#ff9a5c,#ff4f7a);border-radius:99px"></div></div></div>'}).join('')+
      '<small style="display:block;color:var(--mu);text-align:center;margin-top:6px">Selesaikan 10 tantangan untuk membuka title 🏆 CHALLENGER</small>')};

  /* ---------- Lencana ---------- */
  function A(){return ls.get('ach43',{})}
  function bump(k){var o=A();o[k]=(o[k]||0)+1;ls.set('ach43',o)}
  /* hitung kejadian dengan membungkus fungsi yang sudah ada */
  try{var _v=window.x42voice;window.x42voice=function(){bump('voice');return _v.apply(this,arguments)}}catch(e){}
  try{var _s=window.x42Share;window.x42Share=function(){bump('share');return _s.apply(this,arguments)}}catch(e){}
  try{var _c=window.x42Card;window.x42Card=function(){bump('card');return _c.apply(this,arguments)}}catch(e){}
  function S(f,d){try{return f()}catch(e){return d}}
  function list(){var pf=ls.get('pf36',{}),a=A();
    var np=S(function(){return Object.keys(stt.pl||{}).length},0),fv=S(function(){return favs.length},0),pl=S(function(){return pls.length},0),off=S(function(){return songs.some(function(s){return s.off})},false);
    return[
      ['🎵','Lagu pertama','Putar lagu apa saja',np>=1],
      ['🎶','Pendengar Setia','Putar 25 lagu berbeda',np>=25],
      ['💖','Penyuka','Punya 10 lagu favorit',fv>=10],
      ['💎','Kolektor Sejati','Punya 50 lagu favorit',fv>=50],
      ['🗂','Pembuat Playlist','Buat playlist pertama',pl>=1],
      ['🎼','Kurator','Punya 5 playlist',pl>=5],
      ['📷','Punya Wajah','Pasang foto profil',!!pf.photo],
      ['✍️','Punya Cerita','Isi bio profil',!!(pf.bio&&pf.bio.trim())],
      ['🏅','Gaya Baru','Ganti title profil',S(function(){return ls.get('ttl39','new')!=='new'},false)],
      ['🎤','Suara Pencari','Cari lagu dengan suara',(a.voice||0)>=1],
      ['🖼','Pamer Profil','Buat kartu profil',(a.card||0)>=1],
      ['📤','Pembagi Musik','Bagikan kartu atau lagu',(a.share||0)>=1],
      ['⬇','Siap Offline','Simpan lagu untuk offline',off],
      ['📆','Rutin','Dengar di 5 hari berbeda',S(function(){var wk=ls.get('wk',{});return Object.keys(wk).filter(function(k){return wk[k]>=30}).length>=5},false)],
      ['🎯','Penantang','Selesaikan 3 tantangan mingguan',(+ls.get('wcTot',0)||0)>=3],
      ['🏆','Juara Mingguan','Selesaikan 10 tantangan',(+ls.get('wcTot',0)||0)>=10]]}
  window.goBadge43=function(){rbP=0;var L=list(),n=L.filter(function(x){return x[3]}).length;
    sub(shd('Lencana')+'<div class="pcard" style="margin:0 0 12px"><b>'+n+' dari '+L.length+' lencana</b><br><small>Terbuka otomatis saat syaratnya terpenuhi</small></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+L.map(function(x){return'<div class="pcard" style="margin:0;text-align:center;'+(x[3]?'outline:2px solid #ffb36b':'opacity:.5')+'"><div style="font-size:38px;'+(x[3]?'':'filter:grayscale(1)')+'">'+x[0]+'</div><b style="display:block;font-size:13px;margin-top:6px">'+x[1]+'</b><small>'+x[2]+'</small></div>'}).join('')+'</div>')};
  var seen=ls.get('bd43',null);
  function bchk(){try{var L=list(),ids=L.filter(function(x){return x[3]}).map(function(x){return x[1]});
    if(seen){var nw=L.filter(function(x){return x[3]&&seen.indexOf(x[1])<0});if(nw.length&&typeof toast==='function')toast(nw[0][0]+' Lencana baru: '+nw[0][1])}
    if(!seen||seen.length!==ids.length){seen=ids;ls.set('bd43',ids)}}catch(e){}}
  setInterval(bchk,15000);setTimeout(bchk,4000);

  /* ---------- Menu di Profil ---------- */
  function row(id,fn,ico,t,sub){var d=document.createElement('div');d.className='ft';d.setAttribute('data-'+id,'1');d.setAttribute('onclick',fn);d.innerHTML='<span>'+ico+'</span><div>'+t+'<br><small>'+sub+'</small></div>';return d}
  function apply(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x43]'))return;var h=v.querySelector('h1');if(!h||h.textContent!=='Profil')return;
    var f=v.querySelector('.ft');if(!f)return;load();var L=list(),n=L.filter(function(x){return x[3]}).length;
    var a=row('x43','goChal43()','🎯','Tantangan Mingguan',W.done.length+' dari 3 selesai minggu ini'),b=row('x43b','goBadge43()','🏆','Lencana',n+' dari '+L.length+' terbuka');
    f.parentNode.insertBefore(a,f);f.parentNode.insertBefore(b,f)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,200)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  apply();
})();
