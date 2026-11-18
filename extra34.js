/* v4.34: Kolase Foto Lagu — foto sendiri + 1 sampai 4 kartu pemutar miring, jadi gambar 1080x1920 (ukuran story) untuk disimpan/dibagikan. Dimuat setelah extra33.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x34c{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.x34c .btn{flex:none;padding:9px 14px;font-size:13px}.x34p{width:100%;max-height:220px;object-fit:cover;border-radius:16px;margin:8px 0}.x34r.on{outline:2px solid var(--p2);border-radius:14px}.x34i{width:100%;border-radius:18px;display:block;margin:10px 0}.x34h{font-size:13px;color:var(--mu);margin:10px 0 4px}';
  st.textContent+='.x34cv{flex:none;display:block;height:58vh;width:auto;max-width:100%;aspect-ratio:9/16;border-radius:16px;background:#000;touch-action:none;margin:6px auto}.x34c .btn{width:auto}#sp input[type=range]{width:100%;accent-color:var(--p2);margin:4px 0 10px}.x34c .btn.g{opacity:.9}';
  document.head.appendChild(st);
  var K={photo:null,purl:'',sel:[],style:'gelap',L:[],free:false};
  function cands(){var a=[cur].concat(hist.map(rs),favs.map(rs),sg()),seen={},o=[];
    a.forEach(function(t){if(t&&!t.radio&&!seen[t.id]){seen[t.id]=1;o.push(t)}});return o.slice(0,40)}
  function render(){
    var h=shd('Kolase Foto Lagu')+'<div class="x34h">1. Foto latar</div>'+(K.purl?'<img class="x34p" src="'+K.purl+'">':'')+
      '<label class="btn g" style="display:block;text-align:center">📷 '+(K.purl?'Ganti foto':'Pilih foto dari galeri')+'<input type="file" accept="image/*" hidden onchange="x34f(this.files[0])"></label>'+
      '<div class="x34h">2. Gaya kartu</div><div class="x34c">'+[['gelap','🖤 Gelap'],['kaca','🤍 Kaca'],['warna','🌈 Warna']].map(function(s){return '<button class="btn'+(K.style==s[0]?'':' g')+'" onclick="x34s(\''+s[0]+'\')">'+s[1]+'</button>'}).join('')+'</div>'+
      '<div class="x34h">3. Pilih 1 sampai 4 lagu ('+K.sel.length+'/4)</div>'+
      K.L.map(function(t,i){var on=K.sel.indexOf(i)>=0;return '<div class="rw x34r'+(on?' on':'')+'" onclick="x34t('+i+')"><img src="'+esc(cov(t))+'"><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small></div><span class="ph">'+(on?'✓ '+(K.sel.indexOf(i)+1):'')+'</span></div>'}).join('')+
      '<button class="btn" style="margin-top:14px" onclick="x34m()">✨ Atur posisi &amp; buat kolase</button>';
    var v=document.getElementById('sp'),y=v?v.scrollTop:0;sub(h);if(v)v.scrollTop=y}
  window.goKolase34=function(){rbP=0;K.L=cands();K.sel=cur&&!cur.radio?[0]:[];render()};
  window.x34s=function(s){K.style=s;render()};
  window.x34t=function(i){var p=K.sel.indexOf(i);if(p>=0)K.sel.splice(p,1);else if(K.sel.length<4)K.sel.push(i);else toast('Maksimal 4 lagu');render()};
  window.x34f=function(f){if(!f)return;var u=URL.createObjectURL(f),im=new Image();
    im.onload=function(){K.photo=im;K.purl=u;render()};im.onerror=function(){toast('Foto tidak bisa dibuka')};im.src=u};

  function loadImg(src){return new Promise(function(r){var im=new Image();if(/^https?:/.test(src))im.crossOrigin='anonymous';
    im.onload=function(){r(im)};im.onerror=function(){r(null)};setTimeout(function(){r(null)},6000);im.src=src})}
  function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function fit(c,im,x,y,w,h){var s=Math.max(w/im.width,h/im.height),iw=w/s,ih=h/s;c.drawImage(im,(im.width-iw)/2,(im.height-ih)/2,iw,ih,x,y,w,h)}
  function spark(c,x,y,s){c.save();c.translate(x,y);c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=18;c.beginPath();
    for(var i=0;i<8;i++){var a=i*Math.PI/4,r=i%2?s*.18:s;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();c.restore()}
  function hue(t){var s=String(t.title||''),n=0;for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%360;return n}
  function tm(n){return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
  var POS={1:[[50,1000,-6]],2:[[30,220,-7],[690,1000,6]],3:[[30,120,-7],[690,560,6],[30,1120,-5]],4:[[30,120,-6],[690,470,5],[24,1080,-5],[690,1130,6]]};
  var W=1080,H=1920,CW=360,CH=612;
  function tri(c,x,y,d,s){c.beginPath();c.moveTo(x+d*s,y-s);c.lineTo(x-d*s,y);c.lineTo(x+d*s,y+s);c.closePath();c.fill()}
  function spk(c,x,y,wave){c.beginPath();c.moveTo(x,y-4);c.lineTo(x+6,y-4);c.lineTo(x+13,y-10);c.lineTo(x+13,y+10);c.lineTo(x+6,y+4);c.lineTo(x,y+4);c.closePath();c.fill();
    if(wave){c.beginPath();c.arc(x+13,y,9,-.9,.9);c.lineWidth=2.5;c.strokeStyle='#fff';c.stroke()}}
  function fitTxt(c,t,w){t=String(t);if(c.measureText(t).width<=w)return t;while(t.length>2&&c.measureText(t+'…').width>w)t=t.slice(0,-1);return t.trimEnd()+'…'}
  function card(c,t,im,x,y,rot,style){var hu=hue(t),F='Sora, system-ui, sans-serif',p=24,cs=CW-2*p;
    c.save();c.translate(x+CW/2,y+CH/2);c.rotate(rot*Math.PI/180);c.translate(-CW/2,-CH/2);
    c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=50;c.shadowOffsetY=18;rr(c,0,0,CW,CH,32);
    if(style=='warna'){var g=c.createLinearGradient(0,0,CW,CH);g.addColorStop(0,'hsl('+hu+',65%,38%)');g.addColorStop(1,'hsl('+((hu+55)%360)+',70%,16%)');c.fillStyle=g}
    else if(style=='kaca')c.fillStyle='rgba(30,30,45,.4)';else c.fillStyle='#1c1c1e';
    c.fill();c.shadowColor='transparent';
    if(style=='kaca'){c.save();rr(c,0,0,CW,CH,32);c.clip();try{c.filter='blur(24px)';fit(c,K.photo,-40,-40,CW+80,CH+80);c.filter='none'}catch(e){}c.fillStyle='rgba(255,255,255,.22)';c.fillRect(0,0,CW,CH);c.restore()}
    c.save();rr(c,0,0,CW,CH,32);c.clip();var gl=c.createLinearGradient(0,0,0,CH*.5);gl.addColorStop(0,'rgba(255,255,255,.16)');gl.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gl;c.fillRect(0,0,CW,CH);c.restore();
    rr(c,0,0,CW,CH,32);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.3)';c.stroke();
    /* cover: tampil utuh (contain) di atas latar blur dari cover itu sendiri */
    c.save();rr(c,p,p,cs,cs,20);c.clip();
    if(im){c.fillStyle='#111';c.fillRect(p,p,cs,cs);try{c.filter='blur(16px)';fit(c,im,p-24,p-24,cs+48,cs+48);c.filter='none'}catch(e){}
      var k=Math.min(cs/im.width,cs/im.height),iw=im.width*k,ih=im.height*k;c.drawImage(im,p+(cs-iw)/2,p+(cs-ih)/2,iw,ih)}
    else{var g2=c.createLinearGradient(p,p,p+cs,p+cs);g2.addColorStop(0,'hsl('+hu+',70%,32%)');g2.addColorStop(1,'hsl('+((hu+40)%360)+',80%,60%)');c.fillStyle=g2;c.fillRect(p,p,cs,cs);c.fillStyle='rgba(255,255,255,.85)';c.font='700 110px '+F;c.textAlign='center';c.fillText('♪',CW/2,p+cs/2+36);c.textAlign='left'}
    c.restore();
    var ly=p+cs+30,ty=ly+36,ay=ty+32,by=ay+30,tt=by+34,cy=tt+36,vy=cy+44;
    c.fillStyle='#fff';c.globalAlpha=.6;c.font='400 16px '+F;c.fillText('♪  Loopify',p,ly);c.globalAlpha=1;
    c.font='700 27px '+F;c.fillText(fitTxt(c,t.title,CW-2*p-44),p,ty);
    c.globalAlpha=.7;c.font='400 21px '+F;c.fillText(fitTxt(c,t.artist,CW-2*p-44),p,ay);c.globalAlpha=1;
    c.font='400 30px '+F;c.fillText('♡',CW-p-30,ty);
    var tot=170+(hu%90),pos=Math.round(tot*(.25+(hu%50)/100)),bw=CW-2*p;
    c.fillStyle='rgba(255,255,255,.3)';rr(c,p,by,bw,6,3);c.fill();c.fillStyle='#fff';rr(c,p,by,bw*pos/tot,6,3);c.fill();c.beginPath();c.arc(p+bw*pos/tot,by+3,9,0,7);c.fill();
    c.font='400 17px '+F;c.globalAlpha=.7;c.fillText(tm(pos),p,tt);c.textAlign='right';c.fillText('-'+tm(tot-pos),CW-p,tt);c.textAlign='left';c.globalAlpha=1;
    tri(c,CW/2-62,cy,-1,12);tri(c,CW/2-80,cy,-1,12);c.fillRect(CW/2-9,cy-14,6,28);c.fillRect(CW/2+3,cy-14,6,28);tri(c,CW/2+62,cy,1,12);tri(c,CW/2+80,cy,1,12);
    c.fillStyle='#fff';spk(c,p,vy,0);c.fillStyle='rgba(255,255,255,.3)';rr(c,p+34,vy-3,bw-76,6,3);c.fill();c.fillStyle='#fff';rr(c,p+34,vy-3,(bw-76)*.62,6,3);c.fill();c.beginPath();c.arc(p+34+(bw-76)*.62,vy,8,0,7);c.fill();spk(c,CW-p-18,vy,1);
    c.restore();
    c.save();c.translate(x+CW/2,y+CH/2);c.rotate(rot*Math.PI/180);spark(c,-CW/2+8,-CH/2+8,26);spark(c,CW/2-4,-CH/2+34,16);spark(c,-CW/2+30,CH/2-6,14);c.restore()}

  /* ===== Editor: geser, miringkan, ubah ukuran, atur depan/belakang ===== */
  var M=90,E=null,raf=0,drag=null;
  function mkSprite(it){var cv=document.createElement('canvas');cv.width=it.w+2*M;cv.height=it.h+2*M;var c=cv.getContext('2d');
    if(it.k=='photo'){c.translate(M,M);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=40;c.shadowOffsetY=14;rr(c,0,0,it.w,it.h,28);c.fillStyle='#fff';c.fill();c.shadowColor='transparent';
      var b=10;c.save();rr(c,b,b,it.w-2*b,it.h-2*b,20);c.clip();fit(c,K.photo,b,b,it.w-2*b,it.h-2*b);c.restore()}
    else card(c,it.t,it.im,M,M,0,K.style);
    return cv}
  function mkPhoto(){var iw=K.photo.width,ih=K.photo.height,w=700,h=w*ih/iw;if(h>1000){h=1000;w=h*iw/ih}
    var it={k:'photo',w:Math.round(w),h:Math.round(h),cx:540,cy:700,r:-3,s:1};it.d0={cx:it.cx,cy:it.cy,r:it.r,s:it.s};it.spr=mkSprite(it);return it}
  function mkBg(){var cv=document.createElement('canvas');cv.width=108;cv.height=192;var c=cv.getContext('2d');try{c.filter='blur(3px)'}catch(e){}fit(c,K.photo,-6,-6,120,204);return cv}
  function drawItem(c,it){c.save();c.translate(it.cx,it.cy);c.rotate(it.r*Math.PI/180);c.scale(it.s,it.s);c.drawImage(it.spr,-(it.w/2+M),-(it.h/2+M));c.restore()}
  function outline(c,it){c.save();c.translate(it.cx,it.cy);c.rotate(it.r*Math.PI/180);c.scale(it.s,it.s);c.lineWidth=6/it.s;c.setLineDash([18/it.s,12/it.s]);c.strokeStyle='#fff';c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=6;rr(c,-it.w/2-8,-it.h/2-8,it.w+16,it.h+16,36);c.stroke();c.restore()}
  function paint(c,prev){
    if(!K.free){fit(c,K.photo,0,0,W,H);var g=c.createLinearGradient(0,H*.6,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=g;c.fillRect(0,0,W,H)}
    else{c.drawImage(E.bgc,0,0,W,H);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,W,H)}
    E.items.forEach(function(it){drawItem(c,it)});
    spark(c,520,90,22);spark(c,980,860,18);spark(c,90,990,16);
    c.fillStyle='rgba(0,0,0,.45)';rr(c,W/2-80,H-98,160,50,25);c.fill();c.fillStyle='#fff';c.globalAlpha=.95;c.font='700 24px Sora, system-ui, sans-serif';c.textAlign='center';c.fillText('Loopify',W/2,H-64);c.globalAlpha=1;c.textAlign='left';
    if(prev&&E.sel&&E.items.indexOf(E.sel)>=0)outline(c,E.sel)}
  function draw(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;var cv=document.getElementById('x34cv');if(!cv||!E)return;var c=cv.getContext('2d');c.setTransform(.5,0,0,.5,0,0);c.clearRect(0,0,W,H);paint(c,1)})}
  function hit(x,y){for(var i=E.items.length-1;i>=0;i--){var it=E.items[i],dx=x-it.cx,dy=y-it.cy,a=it.r*Math.PI/180,rx=(dx*Math.cos(a)+dy*Math.sin(a))/it.s,ry=(-dx*Math.sin(a)+dy*Math.cos(a))/it.s;
      if(Math.abs(rx)<=it.w/2&&Math.abs(ry)<=it.h/2)return it}return null}
  function lbl(it){return it.k=='photo'?'📷 Foto':'🎵 Lagu '+it.n}
  function $e(id){return document.getElementById(id)}
  function sync(){
    var s=E.sel;
    $e('x34m0').className='btn'+(K.free?' g':'');$e('x34m1').className='btn'+(K.free?'':' g');
    $e('x34fz').style.display=K.free?'':'none';
    $e('x34ht').textContent=K.free?'':'Latar penuh: foto jadi latar di belakang semua lagu. Pilih "Foto bebas" supaya foto bisa digeser dan ditaruh di depan lagu.';
    var h='';for(var i=E.items.length-1;i>=0;i--){var it=E.items[i];h+='<button class="btn'+(it===s?'':' g')+'" onclick="x34L('+i+')">'+lbl(it)+'</button>'}
    $e('x34ly').innerHTML=h;
    var r=$e('x34r'),z=$e('x34s');r.disabled=z.disabled=!s;
    if(s){r.value=Math.round(s.r);z.value=Math.round(s.s*100);$e('x34rv').textContent=Math.round(s.r);$e('x34sv').textContent=Math.round(s.s*100)}
    else{$e('x34rv').textContent='-';$e('x34sv').textContent='-'}}
  function setFree(f){K.free=f;
    if(f){if(!E.photo)E.photo=mkPhoto();if(E.items.indexOf(E.photo)<0)E.items.unshift(E.photo)}
    else{var i=E.items.indexOf(E.photo);if(i>=0)E.items.splice(i,1);if(E.sel===E.photo)E.sel=null}
    sync();draw()}
  function mv(sel,d){var i=E.items.indexOf(sel),j=i+d;if(i<0||j<0||j>=E.items.length)return;var t=E.items[i];E.items[i]=E.items[j];E.items[j]=t}
  window.x34L=function(i){E.sel=E.items[i]||null;sync();draw()};
  function showEditor(){
    E.sel=null;
    sub(shd('Atur kolase')+'<canvas id="x34cv" class="x34cv" width="540" height="960"></canvas>'
      +'<div class="x34h">Foto</div><div class="x34c"><button class="btn" id="x34m0">🖼 Latar penuh</button><button class="btn g" id="x34m1">🧩 Foto bebas</button></div><div class="x34h" id="x34ht"></div>'
      +'<div class="x34h">Lapisan: ketuk di gambar atau pilih di sini, lalu seret untuk memindah</div><div class="x34c" id="x34ly"></div>'
      +'<div class="x34h">Miring: <b id="x34rv"></b>°</div><input type="range" id="x34r" min="-90" max="90" step="1">'
      +'<div class="x34h">Ukuran: <b id="x34sv"></b>%</div><input type="range" id="x34s" min="40" max="200" step="1">'
      +'<div class="x34c"><button class="btn g" id="x34up">⬆ Maju</button><button class="btn g" id="x34dn">⬇ Mundur</button><button class="btn g" id="x34rs">↺ Reset semua</button></div>'
      +'<div class="x34c" id="x34fz"><button class="btn g" id="x34pf">📷 Foto di depan lagu</button><button class="btn g" id="x34pb">📷 Foto di belakang lagu</button></div>'
      +'<button class="btn" style="margin-top:14px" id="x34go">✨ Simpan jadi gambar</button><button class="btn g" style="margin-top:8px" onclick="goKolase34()">← Ganti foto / lagu</button>');
    var cv=$e('x34cv');
    function pt(e){var b=cv.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height}}
    cv.onpointerdown=function(e){var p=pt(e),h=hit(p.x,p.y);if(h){E.sel=h;drag={dx:h.cx-p.x,dy:h.cy-p.y};try{cv.setPointerCapture(e.pointerId)}catch(x){}}else{E.sel=null;drag=null}sync();draw();e.preventDefault()};
    cv.onpointermove=function(e){if(!drag||!E.sel)return;var p=pt(e);E.sel.cx=Math.max(-150,Math.min(W+150,p.x+drag.dx));E.sel.cy=Math.max(-150,Math.min(H+150,p.y+drag.dy));draw();e.preventDefault()};
    cv.onpointerup=cv.onpointercancel=function(){drag=null};
    $e('x34m0').onclick=function(){setFree(false)};$e('x34m1').onclick=function(){setFree(true)};
    $e('x34r').oninput=function(){if(E.sel){E.sel.r=+this.value;$e('x34rv').textContent=Math.round(E.sel.r);draw()}};
    $e('x34s').oninput=function(){if(E.sel){E.sel.s=+this.value/100;$e('x34sv').textContent=Math.round(E.sel.s*100);draw()}};
    $e('x34up').onclick=function(){if(E.sel){mv(E.sel,1);sync();draw()}};
    $e('x34dn').onclick=function(){if(E.sel){mv(E.sel,-1);sync();draw()}};
    $e('x34rs').onclick=function(){E.items.forEach(function(it){it.cx=it.d0.cx;it.cy=it.d0.cy;it.r=it.d0.r;it.s=it.d0.s});sync();draw()};
    $e('x34pf').onclick=function(){var i=E.items.indexOf(E.photo);if(i>=0){E.items.splice(i,1);E.items.push(E.photo);E.sel=E.photo;sync();draw()}};
    $e('x34pb').onclick=function(){var i=E.items.indexOf(E.photo);if(i>=0){E.items.splice(i,1);E.items.unshift(E.photo);E.sel=E.photo;sync();draw()}};
    $e('x34go').onclick=finish;
    sync();draw()}
  function finish(){
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),sv=E.sel;E.sel=null;paint(c,0);E.sel=sv;
    var u;try{u=cv.toDataURL('image/png')}catch(e){toast('Gambar tidak bisa dibuat (foto/cover diblokir). Coba foto lain.');return}
    sub(shd('Kolase Foto Lagu')+'<img class="x34i" src="'+u+'"><button class="btn" id="x34b">Bagikan / simpan</button><button class="btn g" style="margin-top:8px" onclick="x34e()">Atur lagi posisi</button><button class="btn g" style="margin-top:8px" onclick="goKolase34()">Ganti foto / lagu</button>');
    $e('x34b').onclick=function(){cv.toBlob(function(bl){var f=new File([bl],'loopify-kolase.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Loopify'}).catch(function(){});
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='loopify-kolase.png';document.body.appendChild(a);a.click();a.remove()}},'image/png')}}
  window.x34e=function(){if(E)showEditor()};
  window.x34m=function(){
    if(!K.photo){toast('Pilih foto dulu');return}if(!K.sel.length){toast('Pilih minimal 1 lagu');return}
    var T=K.sel.map(function(i){return K.L[i]});toast('Menyiapkan…');
    Promise.all(T.map(function(t){return loadImg(cov(t))})).then(function(ims){
      try{document.fonts.load('700 30px Sora').then(go,go)}catch(e){go()}
      function go(){
        E={items:[],sel:null,photo:null,bgc:mkBg()};
        T.forEach(function(t,i){var p=POS[T.length][i],it={k:'card',n:i+1,t:t,im:ims[i],w:CW,h:CH,cx:p[0]+CW/2,cy:p[1]+CH/2,r:p[2],s:1};it.d0={cx:it.cx,cy:it.cy,r:it.r,s:it.s};it.spr=mkSprite(it);E.items.push(it)});
        if(K.free){E.photo=mkPhoto();E.items.unshift(E.photo)}
        showEditor()}})}

  function inject(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x34]'))return;
    var s=v.querySelector('.ft[onclick="goStat()"]');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-x34','1');d.setAttribute('onclick','goKolase34()');d.innerHTML='<span>✨</span><div>Kolase Foto Lagu</div>';s.parentNode.insertBefore(d,s)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(inject,150)}).observe(document.getElementById('v'),{childList:true})}catch(e){}
  inject();
})();
