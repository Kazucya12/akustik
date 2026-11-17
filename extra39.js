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
  ];
  function svg(t,z){return'<svg viewBox="0 0 80 80" width="'+z+'" height="'+z+'" aria-hidden="true">'+t.s+'</svg>'}
  function hrs(){try{return(+stt.tot||0)/3600}catch(e){return 0}}
  function open(t){return hrs()>=t.h}
  function by(id){for(var i=0;i<T.length;i++)if(T[i].id==id)return T[i];return T[0]}
  function cur(){var t=by(ls.get('ttl39','new'));return open(t)?t:T[0]}
  var css=document.createElement('style');
  css.textContent='.x39b{display:inline-flex;align-items:center;gap:5px;vertical-align:middle;margin-left:8px;padding:2px 9px 2px 3px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:.06em;line-height:1.4;background:rgba(255,255,255,.08);border:1px solid var(--tc);color:var(--tc);white-space:nowrap}.x33g .x39b{background:rgba(0,0,0,.4);color:#fff;border-color:rgba(255,255,255,.55)}.x39b svg{display:block;background:rgba(0,0,0,.45);border-radius:50%;padding:2px}'
  +'.x39g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.x39k{border-radius:18px;padding:10px;background:var(--c);border:1px solid var(--b);cursor:pointer;position:relative}.x39k.on{outline:2px solid var(--tc)}.x39k.lk{opacity:.55}'
  +'.x39i{aspect-ratio:1;border-radius:14px;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.1),rgba(0,0,0,.55));display:grid;place-items:center;margin-bottom:8px}.x39i svg{width:62%;height:62%}'
  +'.x39k b{display:block;font-size:14px}.x39r{display:inline-block;margin:6px 0;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;color:var(--tc);background:rgba(255,255,255,.08)}.x39k small{display:block;color:var(--mu);font-size:11px}.x39l{position:absolute;top:16px;right:16px;font-size:18px}';
  document.head.appendChild(css);
  function badge(t,z){return'<span class="x39b" data-x39="1" style="--tc:'+t.c+'">'+svg(t,z||18)+t.n+'</span>'}
  window.goTitle39=function(){rbP=0;var c=cur(),h=hrs(),nx=null;
    for(var i=0;i<T.length;i++)if(!open(T[i])){nx=T[i];break}
    sub(shd('Title profil')+'<div class="pcard" style="margin:0 0 12px"><small>Total dengar: <b>'+h.toFixed(1)+' jam</b>'+(nx?' · berikutnya <b>'+nx.n+'</b> di '+nx.h+' jam':' · semua title terbuka 🎉')+'</small></div>'
      +'<div class="x39g">'+T.map(function(t){var o=open(t);
        return'<div class="x39k'+(t.id==c.id?' on':'')+(o?'':' lk')+'" style="--tc:'+t.c+'" onclick="x39s(\''+t.id+'\')">'+(o?'':'<span class="x39l">🔒</span>')+
          '<div class="x39i">'+svg(t,80)+'</div><b>'+t.n+'</b><span class="x39r">'+t.r+'</span><small>'+t.d+'</small><small>'+(o?(t.id==c.id?'Sedang dipakai':'Ketuk untuk pakai'):'Terbuka di '+t.h+' jam dengar')+'</small></div>'}).join('')+'</div>')};
  window.x39s=function(id){var t=by(id);if(!open(t)){toast('Dengarkan '+t.h+' jam untuk membuka '+t.n);return}ls.set('ttl39',id);toast('Title: '+t.n);goTitle39();apply()};
  function apply(){try{var t=cur(),v=document.getElementById('v');if(!v)return;
    [].forEach.call(v.querySelectorAll('[data-x39]'),function(e){if(e.getAttribute('data-t39')!=t.id)e.remove()});
    var h=v.querySelector('h1');
    if(h&&h.textContent==='Profil'){var c=v.querySelector('.pcard'),b=c&&c.querySelector('b');
      if(b&&!b.querySelector('[data-x39]'))b.insertAdjacentHTML('beforeend',badge(t,20));
      if(!v.querySelector('[data-x39b]')){var d=document.createElement('div');d.setAttribute('data-x39b','1');d.className='x36c';d.style.margin='0 0 10px';
        d.innerHTML='<button class="btn g" onclick="goTitle39()">🏅 Title profil</button>';(c.nextSibling&&c.nextSibling.parentNode||c.parentNode).insertBefore(d,c.nextSibling)}}
    var g=v.querySelector('.x33g b');if(g&&!g.querySelector('[data-x39]'))g.insertAdjacentHTML('beforeend',badge(t,16));
    [].forEach.call(v.querySelectorAll('[data-x39]'),function(e){e.setAttribute('data-t39',t.id)})}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,150)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  apply();
})();
