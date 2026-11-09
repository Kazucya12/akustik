const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem('ma_'+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('ma_'+k,JSON.stringify(v))}catch(e){}}};
let favs=ls.get('favs',[]),pls=ls.get('pls',[]),hist=ls.get('hist',[]),lyc=ls.get('ly',{}),cfg=ls.get('cfg',{src:'audius',prem:false,name:'',theme:'auto'}),
eq=ls.get('eq',{on:true,v:[0,0,0,0,0,0],bass:0,treb:0,pre:'Flat'}),stt=ls.get('stt',{tot:0,pl:{},ar:{}});
const SRCS=['all','audius','jamendo','archive','radio','custom'],SN={audius:'Audius',jamendo:'Jamendo',archive:'Arsip',radio:'Radio',custom:'API sendiri'};
if(!SRCS.includes(cfg.src)){cfg.src='all';ls.set('cfg',cfg)}
const I={home:'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',lib:'M4 4h3v16H4zM10 4h3v16h-3zM16 6l3-1 3 14-3 1z',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',play:'M7 4l13 8-13 8z',pause:'M7 4h4v16H7zM13 4h4v16h-4z',next:'M5 4l11 8-11 8zM18 4h2v16h-2z',prev:'M19 4L8 12l11 8zM4 4h2v16H4z',shuffle:'M3 6h4l10 12h4M3 18h4l3-4M14 9l3-3h4M19 3l2 3-2 3M19 15l2 3-2 3',repeat:'M4 11V9a3 3 0 013-3h13M17 3l3 3-3 3M20 13v2a3 3 0 01-3 3H4M7 21l-3-3 3-3',heart:'M12 21s-8-5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6-8 11-8 11z',dl:'M12 3v12M7 10l5 5 5-5M4 21h16',back:'M15 4l-8 8 8 8',q:'M4 6h16M4 12h16M4 18h10',plus:'M12 5v14M5 12h14',x:'M6 6l12 12M18 6L6 18',music:'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z'};
I.eq='M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6';I.moon='M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z';
const ic=(n,s=22,f)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${I[n]}"/></svg>`;
const hh=s=>[...String(s)].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const cov=t=>t.img||('data:image/svg+xml,'+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='hsl(${t.h},70%,30%)'/><stop offset='1' stop-color='hsl(${(t.h+40)%360},80%,60%)'/></linearGradient></defs><rect width='100' height='100' fill='url(#g)'/><circle cx='68' cy='30' r='14' fill='#fff' opacity='.85'/><path d='M0 100V72l22-22 16 14 24-30 38 40v26z' fill='hsl(${t.h},60%,12%)'/></svg>`));
const f2=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
/* ===== Tema ===== */
function th(){const t=cfg.theme||'auto',d=t=='auto'?matchMedia('(prefers-color-scheme: dark)').matches:t!='light';document.documentElement.dataset.t=d?'dark':'light';document.documentElement.classList.toggle('am',t=='amoled')}
function tgTheme(){cfg.theme=document.documentElement.dataset.t=='dark'?'light':'dark';ls.set('cfg',cfg);th();go(pg)}
matchMedia('(prefers-color-scheme: dark)').addEventListener&&matchMedia('(prefers-color-scheme: dark)').addEventListener('change',th);
/* ===== Lagu lokal (disimpan di IndexedDB, tetap ada saat dibuka lagi) ===== */
const DB=new Promise((res,rej)=>{try{const r=indexedDB.open('ma',1);r.onupgradeneeded=()=>r.result.createObjectStore('s',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej()}catch(e){rej()}});
const tx=async(m,f)=>{const d=await DB;return new Promise((res,rej)=>{const t=d.transaction('s',m),r=f(t.objectStore('s'));t.oncomplete=()=>res(r.result);t.onerror=()=>rej(t.error)})};
let songs=[];const urls={},urlOf=t=>urls[t.id]||(urls[t.id]=URL.createObjectURL(t.blob)),sg=()=>[...songs].reverse();
(async()=>{try{songs=(await tx('readonly',s=>s.getAll()))||[]}catch(e){}songs.sort((a,b)=>a.added-b.added);go(pg)})();
const pick=()=>$('#fi').click(),pickDir=()=>$('#fd').click();
async function addF(files){let n=0;for(const f of files){if(!(f.type.startsWith('audio/')||/\.(mp3|m4a|wav|ogg|flac|aac|opus|wma)$/i.test(f.name)))continue;const id='s'+f.size+'_'+hh(f.name)+f.name.length;if(songs.some(s=>s.id==id))continue;
let p=f.name.replace(/\.[^.]+$/,'').replace(/_/g,' ').split(' - '),a=p.length>1?p.shift():'Lagu Saya',t=p.join(' - ');const s={id,loc:1,blob:f,title:t.trim(),artist:a.trim(),h:hh(t),added:Date.now()+n};const m3=await id3(f);if(m3.title&&m3.title.trim())s.title=m3.title.trim();if(m3.artist&&m3.artist.trim())s.artist=m3.artist.trim();if(m3.img)s.img=m3.img;s.h=hh(s.title);
try{await tx('readwrite',o=>o.put(s))}catch(e){}songs.push(s);n++}
toast(n?n+' lagu masuk ke daftar':'Tidak ada lagu baru ditemukan');if(n&&navigator.storage&&navigator.storage.persist)navigator.storage.persist();go(pg)}
async function delS(id){if(!confirm('Hapus lagu dari daftar?'))return;try{await tx('readwrite',o=>o.delete(id))}catch(e){}songs=songs.filter(s=>s.id!=id);if(cur&&cur.id==id){A.pause();cur=null;clp()}go(pg)}
const svt=t=>t.loc?{id:t.id,loc:1}:t,rs=x=>x.loc?songs.find(s=>s.id==x.id):x;
/* ===== Pemutar ===== */
const A=new Audio(),B=new Audio();let act=A,cur=null,q=[],qi=0,shuf=0,rep=0,pm=0,ac,an,flt=[],bs,tb;
function graph(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();let n=ac.createMediaElementSource(A);const mk=(ty,f)=>{const x=ac.createBiquadFilter();x.type=ty;x.frequency.value=f;x.Q.value=1;n.connect(x);n=x;return x};
bs=mk('lowshelf',120);flt=[60,230,910,3600,8000,14000].map(f=>mk('peaking',f));tb=mk('highshelf',9000);an=ac.createAnalyser();an.fftSize=128;n.connect(an);const cm=ac.createDynamicsCompressor();cm.knee.value=24;cm.attack.value=.01;cm.release.value=.25;window._cm=cm;an.connect(cm);cm.connect(ac.destination);nvA();ap()}
function ap(){if(!ac)return;flt.forEach((x,i)=>x.gain.value=eq.on?eq.v[i]:0);bs.gain.value=eq.on?eq.bass:0;tb.gain.value=eq.on?eq.treb:0}
function play(list,i){q=[...list];qi=i;cur=q[qi];A.pause();B.pause();cur._pt=0;cur._cn=0;cur._xf=0;lastCt=0;
if(cur.rec&&!cur.url){const t=cur;toast('Mencari versi yang bisa diputar\u2026');resolveRec(t).then(ok=>{if(cur!==t)return;if(ok){rrec();play(q,qi)}else{toast('Belum ada versi lagu ini'+(q.length>1?', lanjut ke berikutnya':''));if(q.length>1&&fq<q.length){fq++;nxt(1)}else fq=0}});return}
fq=0;ab={a:null,b:null};A.volume=B.volume=1;
if(cur.loc){graph();ac.resume();act=A;A.src=urlOf(cur);A.play().catch(()=>toast('Gagal memutar file ini'))}
else{act=B;B.src=cur.url;B.play().catch(()=>toast('Gagal memutar lagu ini. Coba lagu lain.'))}
setVol();hist=[svt(cur),...hist.filter(x=>x.id!=cur.id)].slice(0,12);ls.set('hist',hist);ms();thm(cur);rp();rn()}
function toggle(){if(!cur){playAll();return}act.paused?act.play():act.pause()}
function playAll(){if(!songs.length){pick();return}lists.sg=sg();P('sg',0)}
function nxt(d=1){if(!q.length)return;qi=shuf?Math.floor(Math.random()*q.length):(qi+d+q.length)%q.length;play(q,qi)}
[A,B].forEach(a=>{a.addEventListener('timeupdate',tick);a.addEventListener('play',()=>{stopV();vbg=0;mvUi();mst('playing');rp();rn()});a.addEventListener('pause',()=>{mst('paused');ls.set('stt',stt);saveLast();rp();rn()});
a.addEventListener('error',()=>{if(!(a.getAttribute('src')&&cur))return;if(a!==act)return;window._ef=(window._ef||0)+1;if(window._ef<=3&&!cur.radio&&q.length>1&&(qi<q.length-1||rep==1)){toast('Lagu tidak bisa dimuat, lanjut ke berikutnya');setTimeout(()=>nxt(1),600)}else toast('Sumber lagu tidak bisa dimuat')});
[A,B].forEach(a=>a.addEventListener('playing',()=>{window._ef=0}));
a.addEventListener('ended',()=>{if(rep==2){a.currentTime=0;a.play()}else if(rep==1||qi<q.length-1)nxt();else{rp();autoRadio()}})});
function tick(){xf();const a=act,s=$('#sk');setVol();abLoop(a);prel(a);stat(a);syncLy(a);msPos(a);if(!s)return;if(document.activeElement!==s)s.value=a.duration?a.currentTime/a.duration*1000:0;$('#ct').textContent=f2(a.currentTime);$('#du').textContent=cur&&cur.radio?'LIVE':f2(a.duration)}
const isF=t=>favs.some(x=>x.id==t.id);
function fav(){if(!cur)return;favs=isF(cur)?favs.filter(x=>x.id!=cur.id):[...favs,svt(cur)];ls.set('favs',favs);rp();toast(isF(cur)?'Masuk ke Favorit':'Dihapus dari Favorit')}
function dlc(){if(!cur)return;if(!cur.loc&&cur.dl===0){toast('Artis tidak mengizinkan unduhan lagu ini');return}if(!cur.loc&&cur.dl===1){dlOff(cur);return}if(!cur.loc){window.open(cur.url,'_blank');return}const a=document.createElement('a');a.href=urlOf(cur);a.download=cur.title;a.click()}
function addPl(){if(!cur)return;if(!pls.length){toast('Buat playlist dulu di Library');return}const k=prompt('Tambah ke playlist nomor:\n'+pls.map((p,i)=>(i+1)+'. '+p.n).join('\n'));const p=pls[(parseInt(k)||0)-1];if(p){p.tr.push(svt(cur));ls.set('pls',pls);toast('Masuk ke '+p.n)}}
function addLy(){clp();sub(`${shd('Lirik')}<textarea class="in" id="lt" rows="14" placeholder="Tempel lirik di sini">${esc(lyc[cur.id]||'')}</textarea><button class="btn" style="margin-top:12px" onclick="lyc[cur.id]=$('#lt').value;ls.set('ly',lyc);csp0();openP()">Simpan</button>`)}
function rp(){const t=cur;if(!t)return;const p=!act.paused,L=lyc[t.id];lyI=-1;if(pm&&!L)fetchLy(t);const AL=ly2[t.id];
$('#pl').innerHTML=`<div class="hd"><button class="ib g" onclick="clp()">${ic('back')}</button><div class="seg"><b class="${pm?'':'a'}" onclick="pm=0;rp()">Lagu</b><b onclick="vFromSong()">Video</b><b class="${pm?'a':''}" onclick="pm=1;rp()">Lirik</b></div><button class="ib g" onclick="addPl()">${ic('plus')}</button></div>
${pm?`${lyHtml(t,L,AL)}<button class="btn g" style="margin-bottom:12px" onclick="addLy()">${L?'Ubah Lirik':'Tambah Lirik'}</button><button class="btn" style="margin-bottom:12px" onclick="openKr()">⛶ Layar Penuh</button>`:`<div class="disc"><img src="${esc(cov(t))}"></div>`}
<h2 class="pt">${esc(t.title)}</h2><p class="pa" onclick="artistPg(cur&&cur.artist)" style="cursor:pointer">${esc(t.artist)} ›</p>
<input type="range" id="sk" min="0" max="1000" value="0" oninput="if(isFinite(act.duration))act.currentTime=this.value/1000*act.duration">
<div class="tm"><span id="ct">0:00</span><span id="du">0:00</span></div>
<div class="ctl"><button style="color:${shuf?'var(--p2)':'var(--mu)'}" onclick="shuf=!shuf;rp()">${ic('shuffle')}</button><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button><button style="color:${rep?'var(--p2)':'var(--mu)'}" onclick="rep=(rep+1)%3;rp();toast(['Ulangi: mati','Ulangi semua','Ulangi satu lagu'][rep])">${ic('repeat')}</button></div>
<div class="act"><button class="${isF(t)?'on-c':''}" onclick="fav()">${ic('heart',24,isF(t))}</button><button onclick="dlc()">${ic('dl',24)}</button><button onclick="goEq()">${ic('eq',24)}</button><button onclick="goQ()">${ic('q',24)}</button><button onclick="goSl()" style="color:${slEnd?'var(--p2)':'var(--mu)'}">${ic('moon',24)}</button><button onclick="spd()" style="font-weight:700;font-size:13px;color:${rate!=1?'var(--p2)':'var(--mu)'}">${rate}x</button><button onclick="shareCard()" style="font-size:18px;color:var(--mu)">⤴</button><button onclick="abT()" style="font-weight:700;font-size:12px;color:${ab.b!=null?'var(--p2)':ab.a!=null?'#ff6b9a':'var(--mu)'}">${ab.a!=null&&ab.b==null?'A→':'A-B'}</button></div><canvas id="vz" width="400" height="70"></canvas>`;if(krOn())krRender();tick()}
function openP(){if(cur){rp();$('#pl').classList.add('on')}}function clp(){$('#pl').classList.remove('on')}
(function viz(){const c=document.hidden?null:$('#vz');if(c&&$('#pl').classList.contains('on')&&!(cfg.eco&&(window._vf=!window._vf))){const x=c.getContext('2d'),w=c.width,h=c.height,n=36;x.clearRect(0,0,w,h);let d=new Uint8Array(64);const real=act===A&&an;if(real)an.getByteFrequencyData(d);const g=x.createLinearGradient(0,h,0,0);g.addColorStop(0,'#6d5dfc');g.addColorStop(1,'#35c4ff');x.fillStyle=g;
const vs=window._vs||(window._vs=new Float32Array(36));for(let i=0;i<n;i++){let v=real?d[i]/255:(!act.paused?.25+.5*Math.abs(Math.sin(Date.now()/260+i*.7)):.05);vs[i]+=(v-vs[i])*.22;v=vs[i];x.fillRect(i*(w/n)+2,h-v*h,w/n-5,v*h)}}requestAnimationFrame(viz)})();
/* ===== Pencarian online ===== */
async function srch(s){const r=await fetch('/api/music?src='+cfg.src+'&q='+encodeURIComponent(s));if(!r.ok)throw 0;return (await r.json()).map(x=>({...x,h:hh(x.title)}))}
const lists={};
const row=(k,t,i,del)=>`<div class="rw" onclick="P('${k}',${i})"><img loading="lazy" decoding="async" src="${esc(cov(t))}"><div><b>${esc(t.title)}</b><small>${esc(t.artist)}${t.bpm?' · '+t.bpm+' BPM':''}${t.loc?'':t.yt?' · video':t.rec?(t.nf?' · belum ada versi putar':' · SoundStat'):' · '+(SN[t.sn]||'online')}</small></div>${del?`${del==1?`<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();edS('${t.id}')">✎</button>`:''}<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();${del==2?'delV':'delS'}('${t.id}')">${ic('x',18)}</button>`:`<span class="ph">${cur&&cur.id==t.id&&!act.paused?'♪':''}</span><button class="ib" style="color:var(--mu);width:30px" onclick="event.stopPropagation();qAdd('${k}',${i})">${ic('plus',16)}</button>`}</div>`;
const rows=(k,a,del)=>(lists[k]=a,a.map((t,i)=>row(k,t,i,del)).join(''));
function P(k,i){const t=lists[k][i];if(t.rec){play(lists[k],i);openP();return}if(t.yt)playV(lists[k],i);else{play(lists[k],i);openP()}}
let lq='',lres=null,lt='sg',pg='home',dt,smode='m';
async function doSearch(s){lq=s;const r=$('#res');if(!s.trim()){lres=null;r.innerHTML='';return}r.innerHTML='<div class="em">Mencari…</div>';
try{lres=smode=='v'?await ytSearch(s):await srch(s);r.innerHTML=lres.length?rows('sr',lres):'<div class="em">Tidak ada hasil. Coba kata kunci lain.</div>'}catch(e){r.innerHTML='<div class="em">Tidak bisa terhubung. Periksa internet atau ganti sumber di Pengaturan.</div>'}}
const onS=v=>{clearTimeout(dt);dt=setTimeout(()=>doSearch(v),500)};
function link(){const u=$('#lk').value.trim();if(!u)return;const y=ytId(u);if(y){vAdd(y);return}const t={id:'l'+Date.now(),title:decodeURIComponent(u.split('/').pop().split('?')[0])||'Lagu dari link',artist:'Link kustom',url:u,h:hh(u)};play([t],0);openP()}
/* ===== Halaman ===== */
const gen=[['Pop',280],['Rock',215],['Indie',260],['EDM',300],['Jazz',190],['Hip-Hop',330]];
const logo='<svg width="30" height="26" viewBox="0 0 30 26"><path d="M1 25L11 3l5 10 4-6 9 18z" fill="none" stroke="#8b7bff" stroke-width="2.4" stroke-linejoin="round"/></svg>';
const addBtns=`<div style="display:flex;gap:8px"><button class="btn" onclick="pick()">+ Tambah Lagu</button><button class="btn g" onclick="pickDir()">Pindai Folder</button></div>`;
function sub(h){$('#sp').innerHTML=h;$('#sp').classList.add('on')}function csp(){csp0();go(pg)}const csp0=()=>$('#sp').classList.remove('on');
const shd=t=>`<div class="hd"><button class="ib g" onclick="csp()">${ic('back')}</button><h3>${t}</h3><span style="width:38px"></span></div>`;
const nm=()=>cfg.name||'Pengguna';
const V={
home(){if(!trRes)trend(tg);const rec=hist.map(rs).filter(Boolean).slice(0,6);return`<div class="hd"><div class="logo">${logo}<span>MIDNIGHT<br>ACOUSTIC</span></div><div style="display:flex;gap:8px;align-items:center"><button class="ib g" onclick="tgTheme()">${document.documentElement.dataset.t=='dark'?'☀':'🌙'}</button><div class="av" onclick="go('profile')">${esc(nm()[0])}</div></div></div>
<div class="hero"><h1>Good Vibes<br>Only</h1><small>Putar sekarang dan nikmati momennya.</small><button class="pbtn" onclick="playAll()">${ic('play',24,1)}</button></div>${rsmCard()}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn g" onclick="openV()">▶ Tonton Video</button><button class="btn g" onclick="drOpen()">🚗 Berkendara</button></div><div class="sec"><h3>Rekomendasi Suasana</h3><small>SoundStat</small></div><div class="chips">${RC.map(x=>`<span class="chip rcc ${recSel==x[0]?'a':''}" data-k="${x[0]}" onclick="recGo('${x[0]}')">${x[1]}</span>`).join('')}</div><div id="rec">${recHtml()}</div>
<div class="sec"><h3>Trending di Audius</h3><a onclick="go('explore')">Lihat Semua</a></div><div class="hs" id="trh">${trCards()}</div>
${songs.length?`<div class="sec"><h3>Baru Ditambahkan</h3><a onclick="go('library')">Lihat Semua</a></div><div class="hs">${(lists.nw=sg().slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('nw',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`
:`<div class="pcard em" style="margin-top:18px">${ic('music',34)}<br><b style="color:var(--tx);font-size:14px">Belum ada lagu</b><br>Izinkan akses ke file musik di perangkatmu. Lagu yang kamu pilih tersimpan dan muncul otomatis di daftar setiap aplikasi dibuka.<div style="margin-top:14px">${addBtns}</div></div>`}
${rec.length?`<div class="sec"><h3>Terakhir Diputar</h3></div>${rows('rc',rec)}`:''}${vids.length?`<div class="sec"><h3>Video Tersimpan</h3><a onclick="lt='vd';go('library')">Lihat Semua</a></div><div class="hs">${(lists.hv=vids.slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('hv',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`:''}`},
explore(){const src=cfg.src=='custom'?'API server sendiri':'Audius (lagu penuh)';if(!trRes)trend(tg);return`<div class="srch">${ic('search',18)}<input id="qi" placeholder="Cari musik, artis, atau album…" value="${esc(lq)}" oninput="onS(this.value)"><button class="ib" onclick="vSr()">🎤</button></div>
<div class="chips"><span class="chip ${smode=='m'?'a':''}" onclick="smode='m';go('explore')">Musik</span><span class="chip ${smode=='v'?'a':''}" onclick="smode='v';go('explore')">Video</span></div><div class="chips">${['Pop','Rock','Indie','Jazz','EDM'].map(c=>`<span class="chip" onclick="qs('${c}')">${c}</span>`).join('')}</div>
<div id="res">${lres?rows('sr',lres):''}</div>
<div class="sec"><h3>Trending Minggu Ini</h3></div><div class="chips" id="tgc">${tgChips()}</div><div id="tr">${trBody()}</div>
<div class="sec"><h3>Genre Populer</h3></div><div class="gg">${gen.map(g=>`<div class="gt" style="background:linear-gradient(160deg,hsla(${g[1]},80%,58%,.9),hsla(${g[1]+30},70%,25%,.9))" onclick="qs('${g[0]}')">${g[0]}</div>`).join('')}</div>
<div class="sec"><h3>Putar dari Link</h3></div><div style="display:flex;gap:8px"><input class="in" id="lk" placeholder="Link .mp3 atau link YouTube"><button class="btn" style="width:90px" onclick="link()">Putar</button></div><small style="display:block;margin-top:10px">Sumber pencarian: ${src}. Ubah di Pengaturan.</small>`},
library(){const T=[['sg','Lagu'],['ar','Artis'],['pl','Playlist'],['fav','Favorit'],['vd','Video']];let b='';
if(lt=='sg')b=addBtns+lsBar()+`<div style="height:10px"></div>`+(songs.length?`<div id="sgl">${rows('sg',sgList(),1)}</div>`:'<div class="em">Belum ada lagu. Tambahkan file musik atau pindai satu folder sekaligus.</div>');
else if(lt=='pl')b=`<div style="display:flex;gap:8px"><button class="btn g" onclick="mkPl()">+ Buat Playlist</button><button class="btn g" onclick="$('#fpl').click()">Impor</button></div><div style="height:6px"></div>`+(pls.length?pls.map((p,i)=>{const f=p.tr.map(rs).filter(Boolean)[0];return`<div class="rw" onclick="openPl(${i})"><img src="${esc(cov(p.img?{img:p.img}:(f||{h:260+i*25})))}"><div><b>${esc(p.n)}</b><small>${p.tr.length} Lagu</small></div></div>`}).join(''):'<div class="em">Belum ada playlist.</div>')+smBlock();
else if(lt=='ar')b=arList();
else if(lt=='vd')b=`<button class="btn" onclick="openV()">+ Cari / Tambah Video</button><div style="height:10px"></div>`+(vids.length?rows('vd',vids,2):'<div class="em">Belum ada video. Tempel link YouTube atau cari video.</div>');
else{const a=favs.map(rs).filter(Boolean);b=a.length?rows('fv',a):'<div class="em">Belum ada favorit. Ketuk ♥ di pemutar.</div>'}
return`<div class="hd"><h1>Library</h1><button class="ib g" onclick="goSet()">⚙</button></div><div class="chips">${T.map(x=>`<span class="chip ${lt==x[0]?'a':''}" onclick="lt='${x[0]}';go('library')">${x[1]}</span>`).join('')}</div>${b}`},
profile(){const a=favs.map(rs).fi
