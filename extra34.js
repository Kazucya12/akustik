/* v4.34: Kolase Foto Lagu — foto sendiri + 1 sampai 4 kartu pemutar miring, jadi gambar 1080x1920 (ukuran story) untuk disimpan/dibagikan. Dimuat setelah extra33.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x34c{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.x34c .btn{flex:none;padding:9px 14px;font-size:13px}.x34p{width:100%;max-height:220px;object-fit:cover;border-radius:16px;margin:8px 0}.x34r.on{outline:2px solid var(--p2);border-radius:14px}.x34i{width:100%;border-radius:18px;display:block;margin:10px 0}.x34h{font-size:13px;color:var(--mu);margin:10px 0 4px}';
  document.head.appendChild(st);
  var K={photo:null,purl:'',sel:[],style:'gelap',L:[]};
  function cands(){var a=[cur].concat(hist.map(rs),favs.map(rs),sg()),seen={},o=[];
    a.forEach(function(t){if(t&&!t.radio&&!seen[t.id]){seen[t.id]=1;o.push(t)}});return o.slice(0,40)}
  function render(){
    var h=shd('Kolase Foto Lagu')+'<div class="x34h">1. Foto latar</div>'+(K.purl?'<img class="x34p" src="'+K.purl+'">':'')+
      '<label class="btn g" style="display:block;text-align:center">📷 '+(K.purl?'Ganti foto':'Pilih foto dari galeri')+'<input type="file" accept="image/*" hidden onchange="x34f(this.files[0])"></label>'+
      '<div class="x34h">2. Gaya kartu</div><div class="x34c">'+[['gelap','🖤 Gelap'],['kaca','🤍 Kaca'],['warna','🌈 Warna']].map(function(s){return '<button class="btn'+(K.style==s[0]?'':' g')+'" onclick="x34s(\''+s[0]+'\')">'+s[1]+'</button>'}).join('')+'</div>'+
      '<div class="x34h">3. Pilih 1 sampai 4 lagu ('+K.sel.length+'/4)</div>'+
      K.L.map(function(t,i){var on=K.sel.indexOf(i)>=0;return '<div class="rw x34r'+(on?' on':'')+'" onclick="x34t('+i+')"><img src="'+esc(cov(t))+'"><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small></div><span class="ph">'+(on?'✓ '+(K.sel.indexOf(i)+1):'')+'</span></div>'}).join('')+
      '<button class="btn" style="margin-top:14px" onclick="x34m()">✨ Buat kolase</button>';
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
  var POS={1:[[60,1060,-6]],2:[[50,240,-7],[640,1080,6]],3:[[50,200,-7],[640,700,6],[40,1240,-5]],4:[[40,170,-6],[650,560,5],[30,1180,-5],[660,1290,6]]};
  var W=1080,H=1920,CW=390,CH=520;
  function card(c,t,im,x,y,rot,style){var hu=hue(t),F='Sora, system-ui, sans-serif';
    c.save();c.translate(x+CW/2,y+CH/2);c.rotate(rot*Math.PI/180);c.translate(-CW/2,-CH/2);
    c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=40;c.shadowOffsetY=14;rr(c,0,0,CW,CH,34);
    if(style=='kaca'){c.fillStyle='rgba(255,255,255,.22)'}else if(style=='warna'){var g=c.createLinearGradient(0,0,CW,CH);g.addColorStop(0,'hsl('+hu+',70%,35%)');g.addColorStop(1,'hsl('+((hu+50)%360)+',75%,18%)');c.fillStyle=g}else c.fillStyle='rgba(28,28,30,.96)';
    c.fill();c.shadowColor='transparent';c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.28)';c.stroke();
    var tx=style=='kaca'?'#fff':'#fff';
    c.save();rr(c,30,30,CW-60,CW-60,22);c.clip();
    if(im)fit(c,im,30,30,CW-60,CW-60);else{var g2=c.createLinearGradient(30,30,CW-30,CW-30);g2.addColorStop(0,'hsl('+hu+',70%,32%)');g2.addColorStop(1,'hsl('+((hu+40)%360)+',80%,60%)');c.fillStyle=g2;c.fillRect(30,30,CW-60,CW-60);c.fillStyle='rgba(255,255,255,.85)';c.font='700 120px '+F;c.textAlign='center';c.fillText('♪',CW/2,CW/2+35);c.textAlign='left'}
    c.restore();
    c.fillStyle=tx;c.font='700 30px '+F;var ti=String(t.title);while(ti.length>3&&c.measureText(ti).width>CW-120)ti=ti.slice(0,-2);if(ti!=String(t.title))ti+='…';c.fillText(ti,30,CW+28);
    c.globalAlpha=.7;c.font='400 24px '+F;var ar=String(t.artist);while(ar.length>3&&c.measureText(ar).width>CW-120)ar=ar.slice(0,-2);c.fillText(ar,30,CW+62);c.globalAlpha=1;
    c.font='400 30px '+F;c.fillText('♡',CW-62,CW+30);
    var tot=170+(hu%90),pos=Math.round(tot*(.25+(hu%50)/100)),by=CH-106;
    c.fillStyle='rgba(255,255,255,.3)';rr(c,30,by,CW-60,6,3);c.fill();c.fillStyle='#fff';rr(c,30,by,(CW-60)*pos/tot,6,3);c.fill();
    c.beginPath();c.arc(30+(CW-60)*pos/tot,by+3,9,0,7);c.fill();
    c.font='400 19px '+F;c.globalAlpha=.7;c.fillText(tm(pos),30,by+34);c.textAlign='right';c.fillText('-'+tm(tot-pos),CW-30,by+34);c.textAlign='left';c.globalAlpha=1;
    var cy=CH-34;c.fillStyle='#fff';c.beginPath();c.moveTo(CW/2-70,cy-14);c.lineTo(CW/2-92,cy);c.lineTo(CW/2-70,cy+14);c.fill();c.beginPath();c.moveTo(CW/2-90,cy-14);c.lineTo(CW/2-112,cy);c.lineTo(CW/2-90,cy+14);c.fill();
    c.fillRect(CW/2-10,cy-15,7,30);c.fillRect(CW/2+4,cy-15,7,30);
    c.beginPath();c.moveTo(CW/2+70,cy-14);c.lineTo(CW/2+92,cy);c.lineTo(CW/2+70,cy+14);c.fill();c.beginPath();c.moveTo(CW/2+90,cy-14);c.lineTo(CW/2+112,cy);c.lineTo(CW/2+90,cy+14);c.fill();
    c.restore();
    c.save();c.translate(x+CW/2,y+CH/2);c.rotate(rot*Math.PI/180);spark(c,-CW/2+8,-CH/2+8,26);spark(c,CW/2-4,-CH/2+30,16);spark(c,-CW/2+30,CH/2-6,14);c.restore()}

  window.x34m=function(){
    if(!K.photo){toast('Pilih foto dulu');return}if(!K.sel.length){toast('Pilih minimal 1 lagu');return}
    var T=K.sel.map(function(i){return K.L[i]});toast('Membuat kolase…');
    Promise.all(T.map(function(t){return loadImg(cov(t))})).then(function(ims){
      try{document.fonts.load('700 30px Sora').then(go,go)}catch(e){go()}
      function go(){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d');
        fit(c,K.photo,0,0,W,H);var g=c.createLinearGradient(0,H*.6,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=g;c.fillRect(0,0,W,H);
        T.forEach(function(t,i){var p=POS[T.length][i];card(c,t,ims[i],p[0],p[1],p[2],K.style)});
        spark(c,520,90,22);spark(c,980,860,18);spark(c,90,990,16);
        c.fillStyle='#fff';c.globalAlpha=.8;c.font='700 26px Sora, system-ui, sans-serif';c.textAlign='center';c.fillText('Loopify',W/2,H-50);
        var u;try{u=cv.toDataURL('image/png')}catch(e){toast('Gambar tidak bisa dibuat (foto/cover diblokir). Coba foto lain.');return}
        sub(shd('Kolase Foto Lagu')+'<img class="x34i" src="'+u+'"><button class="btn" id="x34b">Bagikan / simpan</button><button class="btn g" style="margin-top:8px" onclick="goKolase34()">Ubah lagi</button>');
        document.getElementById('x34b').onclick=function(){cv.toBlob(function(bl){var f=new File([bl],'loopify-kolase.png',{type:'image/png'});
          if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Loopify'}).catch(function(){});
          else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='loopify-kolase.png';document.body.appendChild(a);a.click();a.remove()}},'image/png')}}})};

  function inject(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x34]'))return;
    var s=v.querySelector('.ft[onclick="goStat()"]');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-x34','1');d.setAttribute('onclick','goKolase34()');d.innerHTML='<span>✨</span><div>Kolase Foto Lagu</div>';s.parentNode.insertBefore(d,s)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(inject,150)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  inject();
})();
