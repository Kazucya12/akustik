/* Loopify - Kartu Musik: kartu pemutar miring ala kolase, isi dari playlist, latar foto sendiri, simpan jadi gambar PNG. Dimuat setelah extra22.js. */
(function(){
'use strict';
var DIM={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080]},RATIOS=['9:16','4:5','1:1'];
var THEMES=['gelap','terang','kaca'],CW=520,CH=820,FONT='Sora,system-ui,-apple-system,sans-serif';
var LAY={
  1:[{x:.5,y:.5,r:-4,s:1.2}],
  2:[{x:.30,y:.34,r:-6,s:.95},{x:.70,y:.66,r:6,s:.95}],
  3:[{x:.27,y:.27,r:-6,s:.82},{x:.73,y:.45,r:5,s:.82},{x:.32,y:.76,r:-4,s:.82}],
  4:[{x:.27,y:.26,r:-6,s:.8},{x:.74,y:.37,r:5,s:.8},{x:.25,y:.69,r:-4,s:.8},{x:.76,y:.80,r:6,s:.8}],
  6:[{x:.27,y:.20,r:-5,s:.62},{x:.73,y:.26,r:5,s:.62},{x:.27,y:.52,r:-3,s:.62},{x:.73,y:.58,r:4,s:.62},{x:.27,y:.82,r:-5,s:.62},{x:.73,y:.86,r:5,s:.62}]
};
var st=null,IM={},root=null,warned=0;

var ok=function(t){return t&&typeof t==='object'&&t.title};
function uniq(a){var s={},o=[];a.forEach(function(t){if(ok(t)&&!s[t.id]){s[t.id]=1;o.push(t)}});return o}
function fmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function seedOf(t){return Math.abs(hh(String(t.title||'x')+String(t.artist||'')))}

/* ---------- Sumber lagu ---------- */
function srcPlayer(){
  var a=[];if(typeof cur!=='undefined'&&cur)a.push(cur);
  try{a=a.concat(hist.map(rs))}catch(e){}
  try{a=a.concat(favs.map(rs))}catch(e){}
  try{a=a.concat(sg())}catch(e){}
  return{label:'Sedang diputar',list:uniq(a)};
}
function srcPl(i){var p=pls[i];return{label:p.n,list:uniq(p.tr.map(rs))}}
function srcFav(){return{label:'Favorit',list:uniq(favs.map(rs))}}
function srcAll(){return{label:'Library',list:uniq(sg())}}

function mkCard(t,pos){
  var sd=seedOf(t),dur=150+sd%130,prog=.18+(sd%55)/100;
  try{if(typeof cur!=='undefined'&&cur&&cur.id==t.id&&isFinite(act.duration)&&act.duration>0){dur=act.duration;prog=Math.min(1,act.currentTime/act.duration)}}catch(e){}
  return{t:t,x:pos.x,y:pos.y,r:pos.r,s:pos.s,dur:dur,prog:prog,m:null};
}
function layoutFor(n){return LAY[n>4?6:n]||LAY[4]}
function fill(src,n){
  n=Math.max(1,Math.min(6,n));var L=layoutFor(n),pos=n===5?L.slice(0,5):L;
  st.cards=[];for(var i=0;i<n;i++){st.cards.push(mkCard(src.list[i%src.list.length],pos[i]))}
  st.sel=0;st.src=src;
}

/* ---------- Gambar ---------- */
function cover(url){
  if(!url)return null;var e=IM[url];if(e)return e.img?e:null;
  e=IM[url]={img:null,tainted:false};var im=new Image();im.crossOrigin='anonymous';
  im.onload=function(){e.img=im;sched()};
  im.onerror=function(){var i2=new Image();i2.onload=function(){e.img=i2;e.tainted=true;sched()};i2.src=url};
  im.src=url;return null;
}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function ell(x,t,mx){if(x.measureText(t).width<=mx)return t;while(t.length>1&&x.measureText(t+'…').width>mx)t=t.slice(0,-1);return t+'…'}
function heart(x,cx,cy,s,filled,col){
  x.beginPath();x.moveTo(cx,cy+s*.95);x.bezierCurveTo(cx-s*1.7,cy-s*.15,cx-s*1.0,cy-s*1.35,cx,cy-s*.4);
  x.bezierCurveTo(cx+s*1.0,cy-s*1.35,cx+s*1.7,cy-s*.15,cx,cy+s*.95);x.closePath();
  if(filled){x.fillStyle='#ff5f7e';x.fill()}else{x.strokeStyle=col;x.lineWidth=3.5;x.lineJoin='round';x.stroke()}
}
function star(x,cx,cy,r){
  x.save();x.translate(cx,cy);x.shadowColor='rgba(255,255,255,.95)';x.shadowBlur=r*1.1;x.fillStyle='#fff';x.beginPath();
  x.moveTo(0,-r);x.quadraticCurveTo(r*.08,-r*.08,r,0);x.quadraticCurveTo(r*.08,r*.08,0,r);x.quadraticCurveTo(-r*.08,r*.08,-r,0);x.quadraticCurveTo(-r*.08,-r*.08,0,-r);x.fill();x.restore();
}
function tri(x,cx,cy,d,h){x.beginPath();x.moveTo(cx-d*h*.5,cy-h);x.lineTo(cx+d*h*.7,cy);x.lineTo(cx-d*h*.5,cy+h);x.closePath();x.fill()}

function pal(){
  var m=st.theme;
  if(m==='terang')return{bg:'#f6f3f0',tx:'#1d1a19',mu:'#7d726c',ln:'rgba(0,0,0,.18)',fl:'#1d1a19',bd:'rgba(0,0,0,.06)'};
  if(m==='kaca')return{bg:'rgba(24,26,44,.46)',tx:'#fff',mu:'rgba(255,255,255,.72)',ln:'rgba(255,255,255,.32)',fl:'#fff',bd:'rgba(255,255,255,.4)'};
  return{bg:'#2b2b2e',tx:'#fff',mu:'rgba(255,255,255,.62)',ln:'rgba(255,255,255,.26)',fl:'#fff',bd:'rgba(255,255,255,.08)'};
}

function drawCard(x,cd,i,ex,f,P){
  var t=cd.t,w=CW,h=CH,rx=-w/2,ry=-h/2,pad=32,cs=w-pad*2,hue=t.h!=null?t.h:seedOf(t)%360;
  x.save();x.translate(cd.x*st.W,cd.y*st.H);x.rotate(cd.r*Math.PI/180);x.transform(1,Math.tan(cd.r*Math.PI/180)*.28,0,1,0,0);x.scale(cd.s*f,cd.s*f);
  cd.m=x.getTransform();
  /* badan kartu */
  x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=60;x.shadowOffsetY=26;x.fillStyle=P.bg;rr(x,rx,ry,w,h,46);x.fill();x.restore();
  x.lineWidth=3;x.strokeStyle=P.bd;rr(x,rx,ry,w,h,46);x.stroke();
  /* sampul */
  x.save();rr(x,rx+pad,ry+pad,cs,cs,28);x.clip();
  var e=cover(t.img);
  if(e&&!(ex&&e.tainted)){var iw=e.img.width,ih=e.img.height,sc=Math.max(cs/iw,cs/ih),dw=iw*sc,dh=ih*sc;x.drawImage(e.img,rx+pad+(cs-dw)/2,ry+pad+(cs-dh)/2,dw,dh)}
  else{if(e&&e.tainted&&!warned){warned=1;st.warn=1}
    var g=x.createLinearGradient(rx+pad,ry+pad,rx+pad+cs,ry+pad+cs);g.addColorStop(0,'hsl('+hue+',70%,52%)');g.addColorStop(1,'hsl('+((hue+55)%360)+',75%,24%)');x.fillStyle=g;x.fillRect(rx+pad,ry+pad,cs,cs);
    x.fillStyle='rgba(255,255,255,.9)';x.font='700 190px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('♪',rx+w/2,ry+pad+cs/2+6);x.textBaseline='alphabetic'}
  x.restore();
  /* label, judul, artis */
  x.textAlign='left';x.fillStyle=P.mu;x.font='600 22px '+FONT;
  x.strokeStyle=P.mu;x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(rx+pad,ry+532);x.bezierCurveTo(rx+pad+6,ry+518,rx+pad+10,ry+546,rx+pad+16,ry+532);x.bezierCurveTo(rx+pad+22,ry+518,rx+pad+26,ry+546,rx+pad+32,ry+532);x.stroke();
  x.fillText('Loopify',rx+pad+42,ry+540);
  x.fillStyle=P.tx;x.font='700 40px '+FONT;x.fillText(ell(x,t.title,cs-70),rx+pad,ry+588);
  x.fillStyle=P.mu;x.font='400 28px '+FONT;x.fillText(ell(x,t.artist||'',cs-70),rx+pad,ry+628);
  var fv=false;try{fv=isF(t)}catch(er){}
  heart(x,rx+w-pad-18,ry+578,16,fv,P.mu);
  /* progres */
  var lx=rx+pad,rx2=rx+w-pad,py=ry+676,pxx=lx+(rx2-lx)*cd.prog;
  x.lineCap='round';x.lineWidth=5;x.strokeStyle=P.ln;x.beginPath();x.moveTo(lx,py);x.lineTo(rx2,py);x.stroke();
  x.strokeStyle=P.fl;x.beginPath();x.moveTo(lx,py);x.lineTo(pxx,py);x.stroke();
  x.fillStyle=P.fl;x.beginPath();x.arc(pxx,py,9,0,7);x.fill();
  x.font='400 21px '+FONT;x.fillStyle=P.mu;x.textAlign='left';x.fillText(fmt(cd.prog*cd.dur),lx,py+38);x.textAlign='right';x.fillText('-'+fmt(cd.dur*(1-cd.prog)),rx2,py+38);x.textAlign='left';
  /* kontrol */
  var cy=ry+752,cx=rx+w/2;x.fillStyle=P.fl;
  tri(x,cx-96,cy,-1,15);tri(x,cx-78,cy,-1,15);
  rr(x,cx-13,cy-17,9,34,3);x.fill();rr(x,cx+4,cy-17,9,34,3);x.fill();
  tri(x,cx+78,cy,1,15);tri(x,cx+96,cy,1,15);
  /* volume */
  var vy=ry+h-34,vl=lx+40,vr=rx2-40;x.lineWidth=4;x.strokeStyle=P.ln;x.beginPath();x.moveTo(vl,vy);x.lineTo(vr,vy);x.stroke();
  x.strokeStyle=P.fl;x.beginPath();x.moveTo(vl,vy);x.lineTo(vl+(vr-vl)*.7,vy);x.stroke();
  x.fillStyle=P.fl;x.beginPath();x.arc(vl+(vr-vl)*.7,vy,7,0,7);x.fill();
  x.fillStyle=P.mu;x.beginPath();x.moveTo(lx,vy-5);x.lineTo(lx+8,vy-5);x.lineTo(lx+17,vy-12);x.lineTo(lx+17,vy+12);x.lineTo(lx+8,vy+5);x.lineTo(lx,vy+5);x.closePath();x.fill();
  x.beginPath();x.moveTo(rx2-26,vy-5);x.lineTo(rx2-18,vy-5);x.lineTo(rx2-9,vy-12);x.lineTo(rx2-9,vy+12);x.lineTo(rx2-18,vy+5);x.lineTo(rx2-26,vy+5);x.closePath();x.fill();
  /* kilau */
  if(st.spark){star(x,rx+6,ry+6,34);star(x,rx+w-10,ry+4,22);if(i%2===0)star(x,rx+w-6,ry+h-8,18)}
  /* penanda kartu terpilih (tidak ikut tersimpan) */
  if(!ex&&i===st.sel){x.save();x.setLineDash([22,14]);x.lineWidth=7;x.strokeStyle='#ff8a5b';rr(x,rx-16,ry-16,w+32,h+32,58);x.stroke();x.restore()}
  x.restore();
}

function draw(ex){
  if(!st)return;var cv=st.cv,x=cv.getContext('2d'),W=st.W,H=st.H,P=pal(),f=Math.min(1,H/1920*1.25);
  x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
  if(st.bg){
    var b=st.bg,sc=Math.max(W/b.width,H/b.height)*st.bgZ,dw=b.width*sc,dh=b.height*sc;
    x.drawImage(b,(W-dw)/2+st.bgX*(dw-W)/2,(H-dh)/2+st.bgY*(dh-H)/2,dw,dh);
  }else{
    var c0=st.cards[0],hu=c0&&c0.t.h!=null?c0.t.h:(c0?seedOf(c0.t)%360:250),g=x.createLinearGradient(0,0,W*.4,H);
    g.addColorStop(0,'hsl('+hu+',62%,34%)');g.addColorStop(1,'hsl('+((hu+60)%360)+',70%,9%)');x.fillStyle=g;x.fillRect(0,0,W,H);
    var rg=x.createRadialGradient(W*.8,H*.12,0,W*.8,H*.12,W*.9);rg.addColorStop(0,'rgba(255,255,255,.22)');rg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);
  }
  st.cards.forEach(function(cd,i){drawCard(x,cd,i,ex,f,P)});
}
function sched(){if(!st||st.raf)return;st.raf=requestAnimationFrame(function(){st.raf=0;draw(false)})}

/* ---------- Interaksi kanvas ---------- */
function pt(e){var r=st.cv.getBoundingClientRect();return{x:(e.clientX-r.left)*st.W/r.width,y:(e.clientY-r.top)*st.H/r.height}}
function hit(p){
  for(var i=st.cards.length-1;i>=0;i--){var m=st.cards[i].m;if(!m)continue;var q=m.inverse().transformPoint(new DOMPoint(p.x,p.y));if(Math.abs(q.x)<=CW/2&&Math.abs(q.y)<=CH/2)return i}
  return -1;
}
function syncSl(){
  var c=st.cards[st.sel];if(!c)return;
  root.querySelector('#kss').value=Math.round(c.s*100);root.querySelector('#ksr').value=Math.round(c.r);
  root.querySelector('#ksz').value=Math.round(st.bgZ*100);root.querySelector('#ksz').disabled=!st.bg;
}
function bind(){
  var cv=st.cv;cv.style.touchAction='none';var d=null;
  cv.addEventListener('pointerdown',function(e){
    var p=pt(e),i=hit(p);try{cv.setPointerCapture(e.pointerId)}catch(er){}
    if(i>=0){var c=st.cards.splice(i,1)[0];st.cards.push(c);st.sel=st.cards.length-1;d={k:'c',p:p};syncSl()}
    else d={k:'b',p:p};
    sched();
  });
  cv.addEventListener('pointermove',function(e){
    if(!d)return;var p=pt(e),dx=p.x-d.p.x,dy=p.y-d.p.y;d.p=p;
    if(d.k==='c'){var c=st.cards[st.sel];c.x=Math.max(.02,Math.min(.98,c.x+dx/st.W));c.y=Math.max(.02,Math.min(.98,c.y+dy/st.H))}
    else if(st.bg){
      var sc=Math.max(st.W/st.bg.width,st.H/st.bg.height)*st.bgZ,fx=(st.bg.width*sc-st.W)/2,fy=(st.bg.height*sc-st.H)/2;
      if(fx>1)st.bgX=Math.max(-1,Math.min(1,st.bgX+dx/fx));if(fy>1)st.bgY=Math.max(-1,Math.min(1,st.bgY+dy/fy));
    }
    sched();
  });
  var up=function(){d=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
}
function fit(){
  if(!st||!root)return;var box=root.querySelector('.ks-st'),aw=box.clientWidth,ah=box.clientHeight;if(aw<10||ah<10)return;
  var s=Math.min(aw/st.W,ah/st.H);st.cv.style.width=Math.floor(st.W*s)+'px';st.cv.style.height=Math.floor(st.H*s)+'px';
}

/* ---------- Antarmuka ---------- */
function build(){
  root=document.getElementById('ks');
  if(!root){root=document.createElement('div');root.className='ov';root.id='ks';document.getElementById('app').appendChild(root)}
  root.innerHTML='<div class="hd"><button class="ib g" onclick="ksClose()">'+ic('back')+'</button><h3>Kartu Musik</h3><button class="ib g ks-sv" onclick="ksSave()" aria-label="Simpan">⤓</button></div>'
   +'<div class="ks-st"><canvas id="ksc"></canvas></div>'
   +'<div class="ks-tb"><span class="chip" onclick="ksPhoto()">🖼 Foto</span><span class="chip" onclick="ksSrc()">🎵 Playlist</span><span class="chip" onclick="ksAdd()">＋ Kartu</span><span class="chip" onclick="ksSwap()">🔁 Ganti lagu</span><span class="chip" onclick="ksDel()">🗑 Hapus</span><span class="chip" id="kst" onclick="ksTheme()"></span><span class="chip" id="ksk" onclick="ksSpark()">✨ Kilau</span><span class="chip" id="ksa" onclick="ksRatio()"></span><span class="chip" onclick="ksSave(1)">⤴ Bagikan</span></div>'
   +'<div class="ks-sl"><label><small>Ukuran</small><input id="kss" type="range" min="40" max="150" value="80"></label><label><small>Miring</small><input id="ksr" type="range" min="-30" max="30" value="0"></label><label><small>Zoom foto</small><input id="ksz" type="range" min="100" max="300" value="100"></label></div>'
   +'<input id="ksf" type="file" accept="image/*" hidden>';
  st.cv=root.querySelector('#ksc');bind();
  root.querySelector('#kss').oninput=function(){var c=st.cards[st.sel];if(c){c.s=this.value/100;sched()}};
  root.querySelector('#ksr').oninput=function(){var c=st.cards[st.sel];if(c){c.r=+this.value;sched()}};
  root.querySelector('#ksz').oninput=function(){st.bgZ=this.value/100;sched()};
  root.querySelector('#ksf').onchange=function(){
    var f=this.files&&this.files[0];this.value='';if(!f)return;var u=URL.createObjectURL(f),im=new Image();
    im.onload=function(){if(st.bgUrl)URL.revokeObjectURL(st.bgUrl);st.bgUrl=u;st.bg=im;st.bgX=st.bgY=0;st.bgZ=1;syncSl();sched()};
    im.onerror=function(){URL.revokeObjectURL(u);toast('Foto tidak bisa dibuka')};im.src=u;
  };
}
function labels(){
  root.querySelector('#kst').textContent='🎨 Tema: '+st.theme;
  root.querySelector('#ksk').classList.toggle('a',!!st.spark);
  root.querySelector('#ksa').textContent='▭ Rasio '+st.ratio;
}
function setRatio(r){st.ratio=r;st.W=DIM[r][0];st.H=DIM[r][1];st.cv.width=st.W;st.cv.height=st.H;fit();sched()}

window.ksOpen=function(o){
  o=o||{};var src;
  try{
    if(o.pl!=null&&pls[o.pl])src=srcPl(o.pl);else src=srcPlayer();
  }catch(e){src=null}
  if(!src||!src.list.length){toast(o.pl!=null?'Playlist masih kosong':'Belum ada lagu untuk dibuat kartu');return}
  if(st&&st.bgUrl)URL.revokeObjectURL(st.bgUrl);
  st={cards:[],sel:0,src:src,theme:'gelap',spark:true,ratio:'9:16',W:1080,H:1920,bg:null,bgUrl:'',bgX:0,bgY:0,bgZ:1,raf:0,cv:null,warn:0};
  warned=0;build();fill(src,Math.min(4,src.list.length));setRatio('9:16');labels();syncSl();
  root.classList.add('on');
  requestAnimationFrame(function(){fit();sched()});setTimeout(function(){fit();sched()},450);
  if(document.fonts&&document.fonts.load){document.fonts.load('700 40px Sora').then(sched).catch(function(){})}
};
window.ksClose=function(){if(root)root.classList.remove('on')};
window.ksPhoto=async function(){
  if(!st)return;
  if(st.bg){var k=await uiPick('Foto latar',['Pilih foto baru','Hapus foto']);if(k==null)return;
    if(k===1){st.bg=null;if(st.bgUrl)URL.revokeObjectURL(st.bgUrl);st.bgUrl='';syncSl();sched();return}}
  root.querySelector('#ksf').click();
};
window.ksSrc=async function(){
  if(!st)return;var opts=[],names=['Sedang diputar dan riwayat'];opts.push(srcPlayer);
  names.push('Favorit ('+uniq(favs.map(rs)).length+')');opts.push(srcFav);
  names.push('Semua lagu di Library ('+sg().length+')');opts.push(srcAll);
  pls.forEach(function(p,i){names.push('Playlist: '+p.n+' ('+p.tr.length+')');opts.push(function(){return srcPl(i)})});
  var k=await uiPick('Ambil lagu dari',names);if(k==null)return;
  var s=opts[k]();if(!s.list.length){toast('Daftar itu masih kosong');return}
  fill(s,Math.min(Math.max(st.cards.length,Math.min(4,s.list.length)),s.list.length));syncSl();sched();toast(s.label+': '+st.cards.length+' kartu');
};
window.ksAdd=function(){
  if(!st)return;if(st.cards.length>=6){toast('Maksimal 6 kartu');return}
  var used={};st.cards.forEach(function(c){used[c.t.id]=1});var l=st.src.list,t=l.filter(function(x){return!used[x.id]})[0]||l[st.cards.length%l.length];
  st.cards.push(mkCard(t,{x:.5,y:.5,r:4,s:.8}));st.sel=st.cards.length-1;syncSl();sched();
};
window.ksSwap=async function(){
  if(!st||!st.cards[st.sel])return;var l=st.src.list.slice(0,120);
  var k=await uiPick('Ganti lagu kartu',l.map(function(t){return t.title+' - '+(t.artist||'')}));if(k==null)return;
  var c=st.cards[st.sel],n=mkCard(l[k],c);c.t=n.t;c.dur=n.dur;c.prog=n.prog;sched();
};
window.ksDel=function(){
  if(!st)return;if(st.cards.length<=1){toast('Sisakan minimal 1 kartu');return}
  st.cards.splice(st.sel,1);st.sel=st.cards.length-1;syncSl();sched();
};
window.ksTheme=function(){if(!st)return;st.theme=THEMES[(THEMES.indexOf(st.theme)+1)%THEMES.length];labels();sched()};
window.ksSpark=function(){if(!st)return;st.spark=!st.spark;labels();sched()};
window.ksRatio=function(){if(!st)return;setRatio(RATIOS[(RATIOS.indexOf(st.ratio)+1)%RATIOS.length]);labels()};
window.ksSave=function(share){
  if(!st)return;st.warn=0;draw(true);
  var done=function(b){
    draw(false);
    if(!b){toast('Gagal membuat gambar');return}
    if(st.warn)toast('Sebagian sampul online diganti warna polos agar bisa disimpan');
    var f=null;try{f=new File([b],'kartu-musik.png',{type:'image/png'})}catch(e){}
    if(share===1&&f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Kartu Musik Loopify'}).catch(function(){});return}
    var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='kartu-musik.png';document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(u)},4000);if(!st.warn)toast('Gambar disimpan');
  };
  try{st.cv.toBlob(done,'image/png')}catch(e){draw(false);toast('Gambar tidak bisa diekspor')}
};
addEventListener('resize',function(){fit()});

/* Tombol di halaman playlist */
var _op=window.openPl;
if(typeof _op==='function'){
  window.openPl=function(i,keep){
    _op(i,keep);
    try{var ch=document.querySelector('#sp .chips');
      if(ch&&!ch.querySelector('[data-ks]')){var s=document.createElement('span');s.className='chip';s.setAttribute('data-ks','1');s.setAttribute('onclick','ksOpen({pl:'+i+'})');s.textContent='🎴 Kartu Musik';ch.insertBefore(s,ch.firstChild)}}catch(e){}
  };
}
})();
