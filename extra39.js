/* v4.39: Title profil — 6 tingkat (Common sampai Mythic) dengan ikon gambar. Terbuka otomatis dari total waktu dengar (stt.tot).
   Title yang dipakai disimpan di ma_ttl39 (ikut Cadangan Data) dan tampil di samping nama (profil dan beranda). Dimuat setelah extra38.js. */
(function(){
  var G=function(id,a,b){return'<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs>'};
  var T=[
    {id:'new',n:'NEW LISTENER',r:'Common',c:'#b8c0cc',h:0,d:'Ikon: Headphone silver',
      s:G('t0','#f2f5fa','#8e98a8')+'<path d="M16 46V40a24 24 0 0 1 48 0v6" fill="none" stroke="url(#t0)" stroke-width="5" stroke-linecap="round"/><rect x="11" y="42" width="12" height="20" rx="5" fill="url(#t0)"/><rect x="57" y="42" width="12" height="20" rx="5" fill="url(#t0)"/>'},
    {id:'lover',n:'MUSIC LOVER',r:'Uncommon',c:'#2ed39a',h:2,d:'Ikon: Equalizer ungu',
      s:G('t1','#ff6bd6','#7b5cff')+'<g stroke="url(#t1)" stroke-width="6" stroke-linecap="round"><path d="M18 44v-8M30 54V26M42 62V18M54 52V28M66 44v-8"/></g>'},
    {id:'master',n:'SOUND MASTER',r:'Rare',c:'#3da5ff',h:10,d:'Ikon: Diamond biru',
      s:G('t2','#bfe6ff','#4a7dff')+'<path d="M24 28h32l10 12-26 28L14 40z" fill="url(#t2)"/><path d="M14 40h52M30 28l10 40 10-40M40 28 30 40M40 28l10 12" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linejoin="round"/>'},
    {id:'royal',n:'MUSIC ROYAL',r:'Epic',c:'#ff8a3d',h:30,d:'Ikon: Mahkota emas',
      s:G('t3','#fff0a8','#e0902a')+'<path d="M14 58 10 26l17 14 13-20 13 20 17-14-4 32z" fill="url(#t3)"/><rect x="14" y="60" width="52" height="7" rx="3" fill="url(#t3)"/><circle cx="40" cy="46" r="3.5" fill="#7a3d00"/>'},
    {id:'legend',n:'LEGENDARY',r:'Legendary',c:'#ff5f3d',h:100,d:'Ikon: Phoenix api',
      s:G('t4','#ffe36b','#ff3d2e')+'<path d="M40 12c4 10 10 14 10 22 0 5-3 8-6 10 8-2 16-8 20-18 2 14-4 28-16 34-3 2-6 3-8 8-2-5-5-6-8-8C20 54 14 40 16 26c4 10 12 16 20 18-3-2-6-5-6-10 0-8 6-12 10-22z" fill="url(#t4)"/>'},
    {id:'god',n:'LOOPIFY GOD',r:'Mythic',c:'#b58cff',h:300,d:'Ikon: Cosmic star',
      s:G('t5','#e8d8ff','#6a5cff')+'<circle cx="40" cy="40" r="30" fill="none" stroke="url(#t5)" stroke-width="3"/><circle cx="40" cy="40" r="22" fill="none" stroke="url(#t5)" stroke-width="1.5" opacity=".6"/><path d="M40 16l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" fill="url(#t5)"/>'}
    ,
    {id:'owl',n:'NIGHT OWL',r:'Uncommon',c:'#2ed39a',k:'owl',need:5,u:'hari',d:'Ikon: Bulan & bintang',x:'Dengar lewat tengah malam (00.00–04.59) di 5 hari berbeda',
      s:G('t6','#d9e4ff','#6d7dff')+'<path d="M52 14a28 28 0 1 0 14 40A24 24 0 0 1 52 14z" fill="url(#t6)"/><path d="M58 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#fff"/>'},
    {id:'curator',n:'CURATOR',r:'Uncommon',c:'#2ed39a',k:'pls',need:3,u:'playlist',d:'Ikon: Daftar lagu',x:'Buat 3 playlist',
      s:G('t7','#9bffd8','#2fa8ff')+'<g stroke="url(#t7)" stroke-width="6" stroke-linecap="round"><path d="M14 22h36M14 38h36M14 54h22"/></g><path d="M66 18v30a8 8 0 1 1-4-7V26l-12 3V18z" fill="url(#t7)" transform="translate(-2 4) scale(.9)"/>'},
    {id:'explorer',n:'EXPLORER',r:'Rare',c:'#3da5ff',k:'art',need:20,u:'artis',d:'Ikon: Kompas',x:'Dengar 20 artis berbeda',
      s:G('t8','#aef0ff','#3a7bff')+'<circle cx="40" cy="40" r="28" fill="none" stroke="url(#t8)" stroke-width="5"/><path d="M52 28 44 44 28 52 36 36z" fill="url(#t8)"/><circle cx="40" cy="40" r="3" fill="#0b1030"/>'},
    {id:'collector',n:'COLLECTOR',r:'Rare',c:'#3da5ff',k:'fav',need:25,u:'favorit',d:'Ikon: Hati permata',x:'Punya 25 lagu favorit',
      s:G('t9','#ffb3d9','#ff4f8b')+'<path d="M40 66C16 50 10 36 14 25c4-10 18-11 26-1 8-10 22-9 26 1 4 11-2 25-26 41z" fill="url(#t9)"/><path d="M26 30c2-4 7-5 10-2" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>'},
    {id:'fire',n:'ON FIRE',r:'Epic',c:'#ff8a3d',k:'str',need:7,u:'hari beruntun',d:'Ikon: Api',x:'Streak mendengar 7 hari berturut-turut',
      s:G('t10','#fff08a','#ff6a1f')+'<path d="M42 10c2 12 16 18 16 34a18 18 0 0 1-36 0c0-8 4-12 8-17 1 6 4 8 7 8-3-9 0-18 5-25z" fill="url(#t10)"/><path d="M40 70a9 9 0 0 1-9-9c0-6 5-8 7-13 4 3 11 6 11 13a9 9 0 0 1-9 9z" fill="#fff" fill-opacity=".55"/>'},
    {id:'champ',n:'CHALLENGER',r:'Epic',c:'#ff8a3d',k:'chal',need:10,u:'tantangan',d:'Ikon: Piala',x:'Selesaikan 10 tantangan mingguan',
      s:G('t12','#fff0a8','#e8962b')+'<path d="M24 12h32v18a16 16 0 0 1-32 0z" fill="url(#t12)"/><path d="M24 18H12c0 12 6 18 14 18M56 18h12c0 12-6 18-14 18" fill="none" stroke="url(#t12)" stroke-width="5"/><rect x="36" y="44" width="8" height="12" fill="url(#t12)"/><rect x="26" y="58" width="28" height="8" rx="3" fill="url(#t12)"/>'},
    {id:'bolt',n:'UNSTOPPABLE',r:'Legendary',c:'#ff5f3d',k:'str',need:30,u:'hari beruntun',d:'Ikon: Petir',x:'Streak mendengar 30 hari berturut-turut',
      s:G('t11','#fff6a8','#ff4a2e')+'<path d="M46 6 18 44h18l-6 30 32-42H44z" fill="url(#t11)"/>'}
  ];
  function svg(t,z){return'<svg viewBox="0 0 80 80" width="'+z+'" height="'+z+'" aria-hidden="true">'+t.s+'</svg>'}
  function hrs(){try{return(+stt.tot||0)/3600}catch(e){return 0}}
  function dk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function streak(){var wk=ls.get('wk',{}),n=0,d=new Date(),k=0;if((wk[dk(d)]||0)<30)d=new Date(d.getTime()-864e5);
    while((wk[dk(d)]||0)>=30&&k++<400){n++;d=new Date(d.getTime()-864e5)}return n}
  function best(){var wk=ls.get('wk',{}),ks=Object.keys(wk).sort(),b=0,c=0,p=null;
    ks.forEach(function(k){if(wk[k]<30){c=0;p=null;return}var t=new Date(k+'T00:00:00').getTime();c=(p&&Math.round((t-p)/864e5)==1)?c+1:1;p=t;if(c>b)b=c});return b}
  /* hari-hari saat lagu diputar lewat tengah malam (00.00–04.59), dicatat tiap 30 detik */
  function nightDays(){var o=ls.get('nd39',{});return Object.keys(o).length}
  try{setInterval(function(){try{var h=new Date().getHours();if(h<5&&cur&&act&&!act.paused){var o=ls.get('nd39',{});o[dk(new Date())]=1;var ks=Object.keys(o).sort();if(ks.length>60)delete o[ks[0]];ls.set('nd39',o)}}catch(e){}},30000)}catch(e){}
  function val(t){switch(t.k){
    case'owl':return nightDays();
    case'pls':try{return pls.length}catch(e){return 0}
    case'art':try{return Object.keys(stt.ar||{}).length}catch(e){return 0}
    case'fav':try{return favs.length}catch(e){return 0}
    case'str':return Math.max(streak(),best());
    case'chal':return +ls.get('wcTot',0)||0;
    default:return hrs()}}
  function open(t){return t.k?val(t)>=t.need:hrs()>=t.h}
  function req(t){return t.k?t.x:'Dengarkan total '+t.h+' jam'}
  function prog(t){return t.k?Math.min(val(t),t.need)+' / '+t.need+' '+t.u:''}
  function by(id){for(var i=0;i<T.length;i++)if(T[i].id==id)return T[i];return T[0]}
  function cur(){var t=by(ls.get('ttl39','new'));return open(t)?t:T[0]}
  var css=document.createElement('style');
  css.textContent='.x39b{display:inline-flex;align-items:center;gap:5px;vertical-align:middle;margin-left:8px;padding:2px 9px 2px 3px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:.06em;line-height:1.4;background:rgba(255,255,255,.08);border:1px solid var(--tc);color:var(--tc);white-space:nowrap}.x33g .x39b{background:rgba(0,0,0,.4);color:#fff;border-color:rgba(255,255,255,.55)}.x39b svg{display:block;background:rgba(0,0,0,.45);border-radius:50%;padding:2px}'
  +'.x39g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.x39k{border-radius:18px;padding:10px;background:var(--c);border:1px solid var(--b);cursor:pointer;position:relative}.x39k.on{outline:2px solid var(--tc)}.x39k.lk{opacity:.55}'
  +'.x39i{aspect-ratio:1;border-radius:14px;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.1),rgba(0,0,0,.55));display:grid;place-items:center;margin-bottom:8px}.x39i svg{width:62%;height:62%}'
  +'.x39k b{display:block;font-size:14px}.x39r{display:inline-block;margin:6px 0;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;color:var(--tc);background:rgba(255,255,255,.08)}.x39k small{display:block;color:var(--mu);font-size:11px}.x39l{position:absolute;top:16px;right:16px;font-size:18px}';
  document.head.appendChild(css);
  function badge(t,z){return'<span class="x39b" data-x39="1" role="img" aria-label="Title: '+t.n+'" title="'+t.n+'" style="--tc:'+t.c+'">'+svg(t,z||22)+'</span>'}
  var RK={Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4,Mythic:5};
  window.goTitle39=function(){rbP=0;var c=cur(),L=T.slice().sort(function(a,b){return RK[a.r]-RK[b.r]}),n=T.filter(open).length;
    sub(shd('Title profil')+'<div class="pcard" style="margin:0 0 12px"><small><b>'+n+' dari '+T.length+'</b> title terbuka · total dengar <b>'+hrs().toFixed(1)+' jam</b></small></div>'
      +'<div class="x39g">'+L.map(function(t){var o=open(t),p=o?'':prog(t);
        return'<div class="x39k'+(t.id==c.id?' on':'')+(o?'':' lk')+'" style="--tc:'+t.c+'" onclick="x39s(\''+t.id+'\')">'+(o?'':'<span class="x39l">🔒</span>')+
          '<div class="x39i">'+svg(t,80)+'</div><b>'+t.n+'</b><span class="x39r">'+t.r+'</span><small>'+t.d+'</small><small>'+(o?(t.id==c.id?'✔ Sedang dipakai':'Ketuk untuk pakai'):req(t)+(p?' · '+p:''))+'</small></div>'}).join('')+'</div>')};
  window.x39s=function(id){var t=by(id);if(!open(t)){toast(req(t)+' untuk membuka '+t.n);return}ls.set('ttl39',id);toast('Title: '+t.n);goTitle39();apply()};
  window.x39cur=function(){return cur()};window.x39svg=svg;
  function chk(){try{var ids=T.filter(open).map(function(t){return t.id}),old=ls.get('tu39',null);
    if(old){var nw=T.filter(function(t){return open(t)&&old.indexOf(t.id)<0});if(nw.length&&typeof toast==='function')toast('🏅 Title baru terbuka: '+nw[0].n)}
    if(!old||ids.length!==old.length)ls.set('tu39',ids)}catch(e){}}
  setInterval(chk,20000);setTimeout(chk,3000);
  function apply(){try{var t=cur(),v=document.getElementById('v');if(!v)return;
    [].forEach.call(v.querySelectorAll('[data-x39]'),function(e){if(e.getAttribute('data-t39')!=t.id)e.remove()});
    var h=v.querySelector('h1');
    if(h&&h.textContent==='Profil'){var c=v.querySelector('.pcard'),b=c&&c.querySelector('b');
      if(b&&!b.querySelector('[data-x39]'))b.insertAdjacentHTML('beforeend',badge(t,20));
      if(!v.querySelector('[data-x39b]')){var d=document.createElement('div');d.setAttribute('data-x39b','1');d.className='x36c';d.style.margin='0 0 10px';
        d.innerHTML='<button class="btn g" onclick="goTitle39()">🏅 Title profil</button>';(c.nextSibling&&c.nextSibling.parentNode||c.parentNode).insertBefore(d,c.nextSibling)}}
    [].forEach.call(v.querySelectorAll('[data-x39]'),function(e){e.setAttribute('data-t39',t.id)})}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,150)}).observe(document.getElementById('v'),{childList:true})}catch(e){}
  apply();
})();
