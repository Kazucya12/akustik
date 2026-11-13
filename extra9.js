/* Loopify v3.8 - Beranda, mini player, Library, dan pemutar ala Spotify (pasangan extra9.css). Dimuat setelah extra8.js. */
(function(){
  'use strict';
  var E=function(s){return esc(s)};

  /* ---------- 1. Beranda ---------- */
  function greet(){var h=new Date().getHours();return h<4?'Selamat malam':h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam'}
  function lastRes(){try{var l=ls.get('last',null);return l&&rs(l.t)||null}catch(e){return null}}
  function tiles(){
    var t=[],f=favs.length;
    t.push('<div class="sp-t" onclick="lt=\'fav\';go(\'library\')"><span class="sp-i l">♥</span><b>Lagu Disukai</b></div>');
    pls.slice(0,3).forEach(function(p,i){
      var f0=(p.tr||[]).map(rs).filter(Boolean)[0],im=p.img?{img:p.img}:(f0||{h:260+i*25});
      t.push('<div class="sp-t" onclick="openPl('+i+')"><img src="'+E(cov(im))+'" alt=""><b>'+E(p.n)+'</b></div>');
    });
    var lr=lastRes();
    if(lr&&t.length<6)t.push('<div class="sp-t" onclick="resume()"><img src="'+E(cov(lr))+'" alt=""><b>Lanjutkan: '+E(lr.title)+'</b></div>');
    if(t.length<6)t.push('<div class="sp-t" onclick="shuf=true;playAll()"><span class="sp-i r">⤮</span><b>Putar Acak</b></div>');
    if(t.length<6)t.push('<div class="sp-t" onclick="go(\'explore\')"><span class="sp-i g">↗</span><b>Trending</b></div>');
    if(t.length<6)t.push('<div class="sp-t" onclick="openV()"><span class="sp-i">▶</span><b>Video</b></div>');
    return t.slice(0,6).join('');
  }
  function sectionEnd(sec){ /* hapus judul bagian + baris daftar sesudahnya */
    var n=sec.nextElementSibling;sec.remove();
    while(n&&n.classList&&n.classList.contains('rw')){var x=n.nextElementSibling;n.remove();n=x}
  }
  function decorateHome(){
    var v=document.getElementById('v');if(!v)return;
    var home=!!v.querySelector('.hero');
    v.classList.toggle('sp-home',home);
    if(!home||v.querySelector('[data-sp]'))return;
    var hd=v.querySelector('.hd');if(!hd)return;
    var box=document.createElement('div');box.setAttribute('data-sp','1');
    var name=''; try{name=nm()}catch(e){}
    box.innerHTML='<div class="sp-hi">'+greet()+(name&&name!=='Pengguna'&&name!=='Kamu'?', '+E(name):'')+'</div><div class="sp-g">'+tiles()+'</div>';
    hd.insertAdjacentElement('afterend',box);
    /* "Terakhir Diputar" (daftar) -> "Diputar baru-baru ini" (kartu geser) */
    var hs=v.querySelectorAll('.sec h3');
    for(var i=0;i<hs.length;i++){
      var tx=hs[i].textContent.trim(),sec=hs[i].closest('.sec');
      if(tx==='Rekomendasi Suasana')hs[i].textContent='Dibuat untukmu';
      if(tx==='Terakhir Diputar'&&sec){
        var rec=hist.map(rs).filter(Boolean).slice(0,10);
        sectionEnd(sec);
        if(rec.length){
          lists.rx=rec;
          var w=document.createElement('div');
          w.innerHTML='<div class="sec"><h3>Diputar baru-baru ini</h3></div><div class="hs">'+rec.map(function(t,k){return'<div class="cd" onclick="P(\'rx\','+k+')"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small>'+E(t.artist)+'</small></div>'}).join('')+'</div>';
          box.after.apply(box,Array.prototype.slice.call(w.children));
        }
        break;
      }
    }
  }
  var vv=document.getElementById('v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){decorateHome()}).observe(vv,{childList:true});
  setTimeout(decorateHome,200);

  /* ---------- 2. Mini player: warna dari cover ---------- */
  var lastImg='';
  function tintMini(){
    var m=document.getElementById('mp');if(!m||!cur)return;
    var src=cur.img||'';
    if(src===lastImg)return;lastImg=src;
    if(!src||!/^(https?:|data:|blob:)/.test(src)){m.style.removeProperty('--mpc');return}
    var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){
      if(!cur||cur.img!==src)return;
      try{
        var c=document.createElement('canvas');c.width=c.height=12;var x=c.getContext('2d');x.drawImage(im,0,0,12,12);
        var d=x.getImageData(0,0,12,12).data,r=0,g=0,b=0,n=0;
        for(var i=0;i<d.length;i+=4){if(d[i+3]<200)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
        if(n){m.style.setProperty('--mpc','rgb('+Math.round(r/n)+','+Math.round(g/n)+','+Math.round(b/n)+')')}
      }catch(e){m.style.removeProperty('--mpc')}
    };
    im.onerror=function(){m.style.removeProperty('--mpc')};
    im.src=src;
  }
  var _rn=rn;
  rn=function(){_rn();try{tintMini()}catch(e){}};

  /* ---------- 3. Library: urutan chip ala Spotify + tab Unduhan ---------- */
  var _lib=V.library;
  V.library=function(){
    var wasDl=lt==='dl',html;
    if(wasDl){lt='fav';try{html=_lib()}finally{lt='dl'}}else html=_lib();
    var T=[['pl','Playlist'],['ar','Artis'],['sg','Lagu'],['fav','Favorit'],['dl','Unduhan'],['vd','Video']];
    var chips='<div class="chips">'+T.map(function(x){return'<span class="chip '+(lt===x[0]?'a':'')+'" onclick="lt=\''+x[0]+'\';go(\'library\')">'+x[1]+'</span>'}).join('')+'</div>';
    var i=html.indexOf('<div class="chips">');if(i<0)return html;
    var j=html.indexOf('</div>',i)+6;
    var head=html.slice(0,i)+chips,body=html.slice(j);
    if(wasDl){
      var off=songs.filter(function(s){return s.off});
      body=off.length?'<div id="sgl">'+rows('dl',(lists.dl=off),1)+'</div>':'<div class="em">Belum ada lagu yang disimpan offline. Buka pemutar, lalu ketuk ikon unduh pada lagu Audius yang diizinkan artisnya.</div>';
    }
    return head+body;
  };

  /* ---------- 4. Pemutar penuh: judul rata kiri + tombol hati di samping ---------- */
  var _rp=rp;
  rp=function(){
    _rp();
    try{
      var p=document.getElementById('pl'),t=cur;if(!p||!t)return;
      var pt=p.querySelector('.pt'),pa=p.querySelector('.pa');
      if(!pt||!pa||p.querySelector('.sp-tt'))return;
      var w=document.createElement('div');w.className='sp-tt';
      var tx=document.createElement('div');tx.className='sp-tx';
      pt.parentNode.insertBefore(w,pt);tx.appendChild(pt);tx.appendChild(pa);w.appendChild(tx);
      var b=document.createElement('button');b.className='sp-h'+(isF(t)?' on-c':'');b.setAttribute('onclick','fav()');b.setAttribute('aria-label','Favorit');
      b.innerHTML=ic('heart',26,isF(t));w.appendChild(b);
    }catch(e){}
  };
})();
