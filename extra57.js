/* Loopify v4.50 - Pengaturan dirapikan jadi 4 grup yang bisa dilipat: Tampilan, Pemutar & Suara, Notifikasi & Lirik, Lainnya.
   Hanya memindahkan baris yang sudah dibuat modul lain (semua tombol dan sakelar tetap sama), jadi tidak mengubah fungsi apa pun.
   Dimuat paling akhir (setelah extra56.js) karena modul-modul itu menyisipkan baris ke Pengaturan lewat pembungkus setR.
   Status buka/tutup tiap grup diingat di ls 'x57'. Kalau ada yang gagal, Pengaturan tampil seperti sebelumnya. */
(function(){
  'use strict';
  var G=[['tampil','Tampilan'],['pemutar','Pemutar & Suara'],['notif','Notifikasi & Lirik'],['lain','Lainnya']];
  /* sakelar (cfgTg) -> grup */
  var KEY={fade:'pemutar',nv:'pemutar',dmx:'pemutar',rsm:'pemutar',ar:'pemutar',
    npn:'notif',ntfOff:'notif',lyn:'notif',lkf:'notif',ovl:'notif',eco:'tampil',lg44:'tampil'};
  /* judul bagian -> grup */
  var HEAD={'Tema':'tampil','Warna aksen':'tampil','Jenis musik':'pemutar','Crossfade antar lagu':'pemutar',
    'Posisi lirik mengambang':'notif','Ukuran lirik mengambang':'notif','Transparansi lirik mengambang':'notif',
    'Ukuran lirik':'notif','Pengingat waktu dengar':'notif','Pemutar':'pemutar','Lainnya':'lain'};
  var DROP={'Pemutar':1,'Lainnya':1}; /* judul umum: digantikan judul grup */
  /* blok sisipan modul lain -> grup */
  var WRAP={x30row:'pemutar',x37row:'lain',x38row:'lain',x56row:'notif'};

  function attr(el,n){return el.getAttribute?(el.getAttribute(n)||''):''}
  function klass(el){return typeof el.className==='string'?el.className:''}
  function has(el,c){return(' '+klass(el)+' ').indexOf(' '+c+' ')>=0}
  function wrapG(el){
    for(var k in WRAP)if(WRAP.hasOwnProperty(k)&&has(el,k))return WRAP[k];
    if(el.hasAttribute&&el.hasAttribute('data-x46i'))return'tampil';
    return'';
  }
  function title(el){var h=el.querySelector?el.querySelector('h3'):null;return h?(h.textContent||'').trim():''}
  function rowG(el){
    var o=attr(el,'onclick'),m=/cfgTg\('([^']+)'\)/.exec(o);
    if(m)return KEY[m[1]]||'';
    if(o.indexOf('hapTg')>=0)return'tampil';
    return'';
  }

  /* Tentukan tiap elemen anak #sp masuk grup mana (belum memindahkan apa pun). */
  function plan(sp){
    var out={tampil:[],pemutar:[],notif:[],lain:[]},top=[],drop=[],cur='lain',seen=false;
    [].slice.call(sp.children).forEach(function(el){
      if(has(el,'hd'))return;
      var w=wrapG(el);
      if(w){seen=true;out[w].push(el);return}
      if(has(el,'sec')){
        seen=true;
        var t=title(el),g=HEAD[t]||cur;
        cur=g;
        if(DROP[t])drop.push(el);else out[g].push(el);
        return;
      }
      if(!seen){top.push(el);return} /* baris Nama di atas */
      var r=has(el,'ft')?rowG(el):'';
      out[r||cur].push(el);
    });
    /* di Pemutar & Suara, sakelar dulu, baru pilihan bertajuk (Jenis musik, Crossfade) supaya sakelar tidak tampak milik judul di atasnya */
    out.pemutar=out.pemutar.filter(function(e){return has(e,'ft')}).concat(out.pemutar.filter(function(e){return !has(e,'ft')}));
    return{out:out,top:top,drop:drop};
  }

  function summ(k,body){
    var sw=body.querySelectorAll('.sw'),n=0,i,a=[];
    for(i=0;i<sw.length;i++)if(has(sw[i],'on'))n++;
    if(k==='tampil'){var c=body.querySelector('.chips .chip.a');if(c)a.push((c.textContent||'').trim())}
    if(sw.length)a.push(n+' dari '+sw.length+' aktif');
    return a.join(' \u00B7 ');
  }

  function openState(){var o=ls.get('x57',{});return(o&&typeof o==='object')?o:{}}

  function build(p,open){
    var frag=document.createDocumentFragment();
    G.forEach(function(g){
      var items=p.out[g[0]];if(!items.length)return;
      var on=!!open[g[0]],box=document.createElement('div');
      box.className='x57g'+(on?' on':'');box.setAttribute('data-g',g[0]);
      var b=document.createElement('button');
      b.type='button';b.className='x57h';b.setAttribute('aria-expanded',on?'true':'false');
      b.setAttribute('onclick',"x57T('"+g[0]+"')");
      var t=document.createElement('span');t.className='x57t';t.textContent=g[1];
      var s=document.createElement('small');s.className='x57s';
      var i=document.createElement('i');i.className='x57c';i.setAttribute('aria-hidden','true');
      b.appendChild(t);b.appendChild(s);b.appendChild(i);
      var body=document.createElement('div');body.className='x57b';
      items.forEach(function(el){
        if(has(el,'x30row')){var h=el.querySelector('.sec h3');if(h&&h.textContent==='Tampilan & Kenyamanan')h.textContent='Gestur & Mode'}
        body.appendChild(el);
      });
      s.textContent=summ(g[0],body);
      box.appendChild(b);box.appendChild(body);
      frag.appendChild(box);
    });
    return frag;
  }

  window.x57T=function(k){
    try{
      var box=document.querySelector('#sp .x57g[data-g="'+k+'"]');if(!box)return;
      var on=!box.classList.contains('on');
      box.classList.toggle('on',on);
      var b=box.querySelector('.x57h');if(b)b.setAttribute('aria-expanded',on?'true':'false');
      var o=openState();o[k]=on?1:0;ls.set('x57',o);
    }catch(e){}
  };

  var _s=window.setR;
  window.setR=function(){
    var sp0=document.getElementById('sp'),wasG=!!(sp0&&sp0.querySelector('.x57g')),y=sp0?sp0.scrollTop:0;
    var r=_s.apply(this,arguments);
    try{
      var sp=document.getElementById('sp');
      if(!sp||sp.querySelector('.x57g')||!sp.querySelector('[onclick^="cfgTg("]'))return r;
      var p=plan(sp),frag=build(p,openState());
      p.drop.forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e)});
      sp.appendChild(frag);
      if(wasG)sp.scrollTop=y;
    }catch(e){}
    return r;
  };
  window.x57=window.x57||{};window.x57.plan=plan;window.x57.summ=summ;
})();
