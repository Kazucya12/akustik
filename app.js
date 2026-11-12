const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem('ma_'+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('ma_'+k,JSON.stringify(v))}catch(e){}}};
let favs=ls.get('favs',[]),pls=ls.get('pls',[]),hist=ls.get('hist',[]),lyc=ls.get('ly',{}),cfg=ls.get('cfg',{src:'audius',prem:false,name:'',theme:'auto'}),
eq=ls.get('eq',{on:true,v:[0,0,0,0,0,0],bass:0,treb:0,pre:'Flat'}),stt=ls.get('stt',{tot:0,pl:{},ar:{}});
const SRCS=['all','audius','jamendo','archive','radio','custom'],SN={audius:'online',jamendo:'online',archive:'online',radio:'Radio',custom:'online'};
/* nama sumber disembunyikan: pengguna lama dipindah ke Semua, judul dibersihkan dari tag nama sumber */
const ct=s=>{s=String(s==null?'':s);const r=s.replace(/\s*[\(\[][^\)\]]*\b(audius|jamendo)\b[^\)\]]*[\)\]]/ig,'').replace(/\s*[-–|]\s*(audius|jamendo)\s*$/i,'').trim();return r||s};
if(!SRCS.includes(cfg.src)||['audius','jamendo','archive','custom'].includes(cfg.src)){cfg.src='all';ls.set('cfg',cfg)}
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
async function delS(id){if(!await uiConfirm('Lagu ini akan dihapus dari daftar.',{title:'Hapus lagu?',ok:'Hapus',danger:1}))return;try{await tx('readwrite',o=>o.delete(id))}catch(e){}songs=songs.filter(s=>s.id!=id);if(cur&&cur.id==id){A.pause();cur=null;clp()}go(pg)}
const svt=t=>t.loc?{id:t.id,loc:1}:t,rs=x=>x.loc?songs.find(s=>s.id==x.id):x;
/* ===== Pemutar ===== */
const A=new Audio(),B=new Audio();let act=A,cur=null,q=[],qi=0,shuf=0,rep=0,pm=0,ac,an,flt=[],bs,tb;
function graph(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();let n=ac.createMediaElementSource(A);const mk=(ty,f)=>{const x=ac.createBiquadFilter();x.type=ty;x.frequency.value=f;x.Q.value=1;n.connect(x);n=x;return x};
bs=mk('lowshelf',120);flt=[60,230,910,3600,8000,14000].map(f=>mk('peaking',f));tb=mk('highshelf',9000);an=ac.createAnalyser();an.fftSize=128;n.connect(an);const cm=ac.createDynamicsCompressor();cm.knee.value=24;cm.attack.value=.01;cm.release.value=.25;window._cm=cm;an.connect(cm);cm.connect(ac.destination);nvA();ap()}
function ap(){if(!ac)return;flt.forEach((x,i)=>x.gain.value=eq.on?eq.v[i]:0);bs.gain.value=eq.on?eq.bass:0;tb.gain.value=eq.on?eq.treb:0}
function play(list,i){if(list[i]&&list[i].yt){playV(list,i,1);return}q=[...list];qi=i;cur=q[qi];A.pause();B.pause();cur._pt=0;cur._cn=0;cur._xf=0;lastCt=0;
if(cur.rec&&!cur.url){const t=cur;toast('Mencari versi yang bisa diputar\u2026');resolveRec(t).then(ok=>{if(cur!==t)return;if(ok){rrec();if(t.yt)playV(q,qi,1);else play(q,qi)}else{toast('Belum ada versi lagu ini'+(q.length>1?', lanjut ke berikutnya':''));if(q.length>1&&fq<q.length){fq++;nxt(1)}else fq=0}});return}
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
a.addEventListener('ended',()=>{if(slEnd==-1){slFire();return}if(rep==2){a.currentTime=0;a.play()}else if(rep==1||qi<q.length-1)nxt();else{rp();autoRadio()}})});
function tick(){xf();const a=act,s=$('#sk');setVol();abLoop(a);prel(a);stat(a);syncLy(a);msPos(a);if(!s)return;if(document.activeElement!==s)s.value=a.duration?a.currentTime/a.duration*1000:0;$('#ct').textContent=f2(a.currentTime);$('#du').textContent=cur&&cur.radio?'LIVE':f2(a.duration)}
const isF=t=>favs.some(x=>x.id==t.id);
function fav(){if(!cur)return;favs=isF(cur)?favs.filter(x=>x.id!=cur.id):[...favs,svt(cur)];ls.set('favs',favs);rp();toast(isF(cur)?'Masuk ke Favorit':'Dihapus dari Favorit')}
function dlc(){if(!cur)return;if(!cur.loc&&cur.dl===0){toast('Artis tidak mengizinkan unduhan lagu ini');return}if(!cur.loc&&cur.dl===1){dlOff(cur);return}if(!cur.loc){window.open(cur.url,'_blank');return}const a=document.createElement('a');a.href=urlOf(cur);a.download=cur.title;a.click()}
async function addPl(){if(!cur)return;if(!pls.length){toast('Buat playlist dulu di Library');return}const k=await uiPick('Tambah ke playlist',pls.map(p=>p.n));const p=k==null?null:pls[k];if(p){p.tr.push(svt(cur));ls.set('pls',pls);toast('Masuk ke '+p.n)}}
function addLy(){clp();sub(`${shd('Lirik')}<textarea class="in" id="lt" rows="14" placeholder="Tempel lirik di sini">${esc(lyc[cur.id]||'')}</textarea><button class="btn" style="margin-top:12px" onclick="lyc[cur.id]=$('#lt').value;ls.set('ly',lyc);csp0();openP()">Simpan</button>`)}
function rp(){const t=cur;if(!t)return;$('#pl').classList.toggle('ytm',!!t.yt);if(t.yt){rpY(t);return}const p=!act.paused,L=lyc[t.id];lyI=-1;if(pm&&!L)fetchLy(t);const AL=ly2[t.id];
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
const row=(k,t,i,del)=>`<div class="rw" onclick="P('${k}',${i})"><img loading="lazy" decoding="async" src="${esc(cov(t))}"><div><b>${esc(ct(t.title))}</b><small>${esc(t.artist)}${t.bpm?' · '+t.bpm+' BPM':''}${t.loc?'':t.yt?' · video':t.rec?(t.nf?' · belum ada versi putar':' · rekomendasi'):' · '+(SN[t.sn]||'online')}</small></div>${del?`${del==1?`<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();edS('${t.id}')">✎</button>`:''}<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();${del==2?'delV':'delS'}('${t.id}')">${ic('x',18)}</button>`:`<span class="ph">${cur&&cur.id==t.id&&!act.paused?'♪':''}</span><button class="ib" style="color:var(--mu);width:30px" onclick="event.stopPropagation();qAdd('${k}',${i})">${ic('plus',16)}</button>`}</div>`;
const rows=(k,a,del)=>(lists[k]=a,a.map((t,i)=>row(k,t,i,del)).join(''));
function P(k,i){const t=lists[k][i];if(t.rec){play(lists[k],i);openP();return}if(t.yt){const bg=!['vr','vd','sv'].includes(k);playV(lists[k],i,bg);if(bg)openP()}else{play(lists[k],i);openP()}}
let lq='',lres=null,lt='sg',pg='home',dt,smode='m';
async function doSearch(s){lq=s;const r=$('#res');if(!s.trim()){lres=null;r.innerHTML='';return}r.innerHTML=skel6(6);
try{lres=smode=='v'?await ytSearch(s):await srch(s);r.innerHTML=lres.length?rows('sr',lres):'<div class="em">Tidak ada hasil. Coba kata kunci lain.</div>'}catch(e){r.innerHTML='<div class="em">Tidak bisa terhubung. Periksa internet atau ganti sumber di Pengaturan.</div>'}}
const onS=v=>{clearTimeout(dt);dt=setTimeout(()=>doSearch(v),500)};
function link(){const u=$('#lk').value.trim();if(!u)return;const y=ytId(u);if(y){vAdd(y);return}const t={id:'l'+Date.now(),title:decodeURIComponent(u.split('/').pop().split('?')[0])||'Lagu dari link',artist:'Link kustom',url:u,h:hh(u)};play([t],0);openP()}
/* ===== Halaman ===== */
const gen=[['Pop',280],['Rock',215],['Indie',260],['EDM',300],['Jazz',190],['Hip-Hop',330]];
const logo='<svg width="30" height="26" viewBox="0 0 30 26"><path d="M1 25L11 3l5 10 4-6 9 18z" fill="none" stroke="#8b7bff" stroke-width="2.4" stroke-linejoin="round"/></svg>';
const addBtns=`<div style="display:flex;gap:8px"><button class="btn" onclick="pick()">+ Tambah Lagu</button><button class="btn g" onclick="pickDir()">Pindai Folder</button></div>`;
function sub(h){$('#sp').innerHTML=h;$('#sp').classList.add('on')}function csp(){csp0();if(rbP){rbP=0;openP()}else go(pg)}const csp0=()=>$('#sp').classList.remove('on');
const shd=t=>`<div class="hd"><button class="ib g" onclick="csp()">${ic('back')}</button><h3>${t}</h3><span style="width:38px"></span></div>`;
const nm=()=>cfg.name||'Pengguna';
const V={
home(){if(!trRes)trend(tg);const rec=hist.map(rs).filter(Boolean).slice(0,6);return`<div class="hd"><div class="logo">${logo}<span>MIDNIGHT<br>ACOUSTIC</span></div><div style="display:flex;gap:8px;align-items:center"><button class="ib g" onclick="tgTheme()">${document.documentElement.dataset.t=='dark'?'☀':'🌙'}</button><div class="av" onclick="go('profile')">${esc(nm()[0])}</div></div></div>
<div class="hero"><h1>Good Vibes<br>Only</h1><small>Putar sekarang dan nikmati momennya.</small><button class="pbtn" onclick="playAll()">${ic('play',24,1)}</button></div>${rsmCard()}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn g" onclick="openV()">▶ Tonton Video</button><button class="btn g" onclick="drOpen()">🚗 Berkendara</button></div><div class="sec"><h3>Rekomendasi Suasana</h3><small></small></div><div class="chips">${RC.map(x=>`<span class="chip rcc ${recSel==x[0]?'a':''}" data-k="${x[0]}" onclick="recGo('${x[0]}')">${x[1]}</span>`).join('')}</div><div id="rec">${recHtml()}</div>
<div class="sec"><h3>Trending</h3><a onclick="go('explore')">Lihat Semua</a></div><div class="hs" id="trh">${trCards()}</div>
${songs.length?`<div class="sec"><h3>Baru Ditambahkan</h3><a onclick="go('library')">Lihat Semua</a></div><div class="hs">${(lists.nw=sg().slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('nw',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`
:`<div class="pcard em" style="margin-top:18px">${ic('music',34)}<br><b style="color:var(--tx);font-size:14px">Belum ada lagu</b><br>Izinkan akses ke file musik di perangkatmu. Lagu yang kamu pilih tersimpan dan muncul otomatis di daftar setiap aplikasi dibuka.<div style="margin-top:14px">${addBtns}</div></div>`}
${rec.length?`<div class="sec"><h3>Terakhir Diputar</h3></div>${rows('rc',rec)}`:''}${vids.length?`<div class="sec"><h3>Video Tersimpan</h3><a onclick="lt='vd';go('library')">Lihat Semua</a></div><div class="hs">${(lists.hv=vids.slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('hv',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`:''}`},
explore(){const src='Lagu penuh';if(!trRes)trend(tg);return`<div class="srch">${ic('search',18)}<input id="qi" placeholder="Cari musik, artis, atau album…" value="${esc(lq)}" oninput="onS(this.value)"><button class="ib" onclick="vSr()">🎤</button></div>
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
profile(){const a=favs.map(rs).filter(Boolean);
return`<div class="hd"><h1>Profil</h1><button class="ib g" onclick="goSet()">⚙</button></div>
<div class="pcard" style="display:flex;gap:14px;align-items:center"><div class="av" style="width:56px;height:56px;font-size:22px;flex:none" onclick="setName()">${esc(nm()[0])}</div><div style="flex:1;min-width:0"><b style="font-size:16px">${esc(nm())}</b><br><small>Gratis, tanpa iklan · ketuk huruf untuk ganti nama</small></div></div>
<div class="gg" style="margin:12px 0"><div class="pcard" style="text-align:center;margin:0"><h1>${songs.length}</h1><small>Lagu</small></div><div class="pcard" style="text-align:center;margin:0"><h1>${favs.length}</h1><small>Favorit</small></div><div class="pcard" style="text-align:center;margin:0"><h1>${pls.length}</h1><small>Playlist</small></div></div>
<div><div class="ft" onclick="goSet()"><span>⚙</span><div>Pengaturan</div></div><div class="ft" onclick="goEq()"><span>🎚</span><div>Equalizer</div></div><div class="ft" onclick="goStat()"><span>📊</span><div>Statistik Dengar</div></div><div class="ft" onclick="goBk()"><span>💾</span><div>Cadangan Data</div></div><div class="ft" onclick="impOpen()"><span>⇩</span><div>Impor dari Spotify / YouTube</div></div></div>
${a.length?`<div class="sec"><h3>Favorit</h3><a onclick="lt='fav';go('library')">Lihat Semua</a></div>${rows('pf',a.slice(0,5))}`:''}`}
};
/* ===== Bagian di bawah ini dibangun ulang karena app.js sebelumnya terpotong ===== */
/* ----- Status global yang dipakai bagian lain ----- */
stt.pl=stt.pl||{};stt.ar=stt.ar||{};
let lastCt=0,fq=0,ab={a:null,b:null},lyI=-1,ly2={},lyTry={},lyS={},slEnd=0,sltm=0,rate=cfg.rate||1,vbg=0,fv=1,rbP=0,sess=0,svN=0,msT=0,pre=null;
let trRes=null,trBusy=null,tg=cfg.tg||'',recBusy='',recC={};
let vids=ls.get('vids',[]),yp=null,vq=[],vi=-1,vcur=null,vef=0;
let lsq='',lso=ls.get('lso','new'),dip=null,wl=null;
const hp=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
const isPlO=()=>$('#pl').classList.contains('on');
const fmtT=s=>{s=Math.round(s||0);const h=Math.floor(s/3600),m=Math.round(s%3600/60);return h?h+' j '+(m%60)+' mnt':m+' mnt'};
/* respons API: array biasa atau {data|tracks|results}; stasiun radio (id berbentuk UUID) diberi tanda radio */
function arrOf(j){const a=Array.isArray(j)?j:j&&Array.isArray(j.data)?j.data:j&&Array.isArray(j.tracks)?j.tracks:j&&Array.isArray(j.results)?j.results:[];return a.map(x=>{if(x&&x.title)x={...x,title:ct(x.title)};return x&&/^r[0-9a-f]{8}-[0-9a-f]{4}-/.test(String(x.id))?{...x,radio:1}:x})}
function toast(m,img){const t=$('#toast');if(!t)return;t.innerHTML=`<img src="${esc(img||'icon-192.png')}" alt=""><div><b>Midnight Acoustic</b><span>${esc(m)}</span></div><small>sekarang</small>`;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800)}
/* ----- Gambar ----- */
function shrink(f,m=320){return new Promise(res=>{try{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{try{const s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,im.width*s|0);c.height=Math.max(1,im.height*s|0);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82))}catch(e){res('')}};im.onerror=()=>{URL.revokeObjectURL(u);res('')};im.src=u}catch(e){res('')}})}
/* ----- Tag ID3 (MP3): judul, artis, cover ----- */
function id3txt(d){const e=d[0],b=d.subarray(1);let l='utf-8';if(e==0)l='iso-8859-1';else if(e==1)l=(b[0]==0xFE&&b[1]==0xFF)?'utf-16be':'utf-16le';else if(e==2)l='utf-16be';let s;try{s=new TextDecoder(l).decode(b)}catch(x){s=''}return s.replace(/\0[\s\S]*$/,'').replace(/^﻿/,'').trim()}
async function id3(f){const o={};try{const hd=new Uint8Array(await f.slice(0,10).arrayBuffer());if(hd[0]!=73||hd[1]!=68||hd[2]!=51)return o;const ver=hd[3];if(ver<3)return o;const ss=(b,p)=>((b[p]&127)<<21)|((b[p+1]&127)<<14)|((b[p+2]&127)<<7)|(b[p+3]&127);const sz=ss(hd,6);const buf=new Uint8Array(await f.slice(10,10+Math.min(sz,8e6)).arrayBuffer());const dv=new DataView(buf.buffer);let p=0;
if(hd[5]&0x40){p=ver==4?ss(buf,0):dv.getUint32(0)+4}
while(p+10<=buf.length){const id=String.fromCharCode(buf[p],buf[p+1],buf[p+2],buf[p+3]);if(!/^[A-Z0-9]{4}$/.test(id))break;const n=ver==4?ss(buf,p+4):dv.getUint32(p+4);if(n<=0||p+10+n>buf.length)break;const d=buf.subarray(p+10,p+10+n);
if(id=='TIT2')o.title=id3txt(d);else if(id=='TPE1')o.artist=id3txt(d);else if(id=='APIC'&&!o.img){const e=d[0];let i=1,mt='';while(i<d.length&&d[i]!=0)mt+=String.fromCharCode(d[i++]);i+=2;if(e==1||e==2){while(i+1<d.length&&!(d[i]==0&&d[i+1]==0))i+=2;i+=2}else{while(i<d.length&&d[i]!=0)i++;i++}if(i<d.length){mt=mt.indexOf('/')>0?mt:'image/jpeg';o.img=await shrink(new Blob([d.subarray(i)],{type:mt}))}}
p+=10+n}}catch(e){}return o}
/* ----- Suara, kecepatan, A-B, sleep timer ----- */
function nvA(){const c=window._cm;if(!c)return;const on=cfg.nv!==false;try{c.threshold.value=on?-20:0;c.ratio.value=on?6:1}catch(e){}}
function xf(){const a=act;if(!a||!cur||a===yAct){fv=1;return}const d=a.duration;let v=1;if(cfg.fade&&!cur.radio&&isFinite(d)&&d>8){const f=2.5,t=a.currentTime,r=d-t;v=Math.max(.05,Math.min(1,t/f+.1,r/f))}fv=v;
if(slEnd>0&&Date.now()>=slEnd)slFire();else if(slEnd==-1&&isFinite(d)&&d-a.currentTime<.6)slFire()}
function setVol(){if(act)act.volume=Math.max(0,Math.min(1,fv))}
function spd(){const R=[1,1.25,1.5,2,.75];rate=R[(R.indexOf(rate)+1)%R.length];A.defaultPlaybackRate=B.defaultPlaybackRate=rate;A.playbackRate=B.playbackRate=rate;cfg.rate=rate;ls.set('cfg',cfg);rp();toast('Kecepatan '+rate+'x')}
function abT(){if(!cur||cur.radio)return;if(ab.a==null){ab.a=act.currentTime;toast('Titik A ditandai, ketuk lagi untuk titik B')}else if(ab.b==null){const b=act.currentTime;if(b-ab.a<1){ab={a:null,b:null};toast('Jarak terlalu pendek');rp();return}ab.b=b;act.currentTime=ab.a;toast('Ulang A-B aktif')}else{ab={a:null,b:null};toast('Ulang A-B dimatikan')}rp()}
function abLoop(a){if(ab.b!=null&&a.currentTime>=ab.b)a.currentTime=ab.a}
function slFire(){clearTimeout(sltm);slEnd=0;A.pause();B.pause();try{yp&&yp.pauseVideo&&yp.pauseVideo()}catch(e){}toast('Sleep timer: pemutaran dihentikan');rp()}
function goSl(){rbP=isPlO();clp();slR()}
function slR(){const o=[15,30,45,60].map(m=>`<div class="ft" onclick="slSet(${m})"><span>⏱</span><div>${m} menit</div></div>`).join('');
sub(shd('Sleep Timer')+`<div class="em" style="padding:6px 0 12px">${slEnd>0?'Aktif: berhenti sekitar '+Math.max(1,Math.round((slEnd-Date.now())/60000))+' menit lagi':slEnd==-1?'Aktif: berhenti setelah lagu ini selesai':'Pilih kapan musik berhenti otomatis.'}</div>${o}<div class="ft" onclick="slSet(-1)"><span>🎵</span><div>Setelah lagu ini selesai</div></div>${slEnd?`<div class="ft" onclick="slSet(0)"><span>✕</span><div>Matikan timer</div></div>`:''}`)}
function slSet(m){clearTimeout(sltm);if(m>0){slEnd=Date.now()+m*60000;sltm=setTimeout(slFire,m*60000);toast('Berhenti dalam '+m+' menit')}else if(m<0){slEnd=-1;toast('Berhenti setelah lagu ini')}else{slEnd=0;toast('Sleep timer dimatikan')}csp()}
/* ----- Statistik, pramuat, lanjutkan ----- */
function stat(a){if(!cur||a!==act||a.paused){lastCt=a.currentTime||0;return}const d=a.currentTime-lastCt;lastCt=a.currentTime;if(!(d>0&&d<5))return;
stt.tot=(+stt.tot||0)+d;let e=stt.pl[cur.id];if(!e||typeof e!='object')e=stt.pl[cur.id]={s:+e||0,n:0};e.s=(+e.s||0)+d;e.t=cur.title;e.a=cur.artist;if(!cur._cn&&a.currentTime>20){cur._cn=1;e.n=(e.n||0)+1}
stt.ar[cur.artist]=(+stt.ar[cur.artist]||0)+d;
sess+=d;if(cfg.rem&&sess>=cfg.rem*60){sess=0;toast('Kamu sudah mendengarkan '+cfg.rem+' menit. Waktunya istirahat sebentar?')}
if(++svN%60==0)ls.set('stt',stt)}
function prel(a){if(!cur||a!==act||cur._pt||!isFinite(a.duration)||a.duration-a.currentTime>15||q.length<2)return;cur._pt=1;const n=q[(qi+1)%q.length];if(n&&n.url&&!n.loc&&!n.radio&&!n.yt){try{pre=new Audio();pre.preload='auto';pre.src=n.url}catch(e){}}}
function saveLast(){if(!cur||cur.radio||cur.yt)return;ls.set('last',{t:svt(cur),p:Math.floor(act.currentTime||0),ts:Date.now()})}
function rsmOk(){const l=ls.get('last',null);return l&&rs(l.t)}
function rsmCard(){if(cur)return'';const l=ls.get('last',null),t=l&&rs(l.t);if(!t)return'';return`<div class="pcard" style="display:flex;align-items:center;gap:12px;margin-top:12px;cursor:pointer" onclick="resume()"><img src="${esc(cov(t))}" alt="" style="width:46px;height:46px;border-radius:12px;object-fit:cover;flex:none"><div style="flex:1;min-width:0"><small>Lanjutkan</small><b style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.title)}</b><small>${esc(t.artist)}${l.p>3?' · '+f2(l.p):''}</small></div><span class="ib" style="background:var(--g);color:#fff">${ic('play',18,1)}</span></div>`}
function resume(){const l=ls.get('last',null),t=l&&rs(l.t);if(!t)return;play([t],0);openP();if(l.p>3){const on=()=>{act.removeEventListener('loadedmetadata',on);try{act.currentTime=l.p}catch(e){}};act.addEventListener('loadedmetadata',on)}}
/* ----- Media Session, tema dari cover ----- */
function ms(){if(!('mediaSession' in navigator)||!cur)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:cur.title,artist:cur.artist,album:'Midnight Acoustic',artwork:[cur.img?{src:cur.img}:{src:'icon-512.png',sizes:'512x512',type:'image/png'}]});
const h=(n,f)=>{try{navigator.mediaSession.setActionHandler(n,f)}catch(e){}};h('play',()=>act.play());h('pause',()=>act.pause());h('previoustrack',()=>nxt(-1));h('nexttrack',()=>nxt(1));h('seekto',d=>{if(d.seekTime!=null)act.currentTime=d.seekTime});h('seekbackward',d=>{act.currentTime=Math.max(0,act.currentTime-(d.seekOffset||10))});h('seekforward',d=>{act.currentTime=act.currentTime+(d.seekOffset||10)})}catch(e){}}
function mst(s){try{navigator.mediaSession.playbackState=s}catch(e){}}
function msPos(a){const n=Date.now();if(n-msT<1000)return;msT=n;try{if(isFinite(a.duration)&&a.duration>0)navigator.mediaSession.setPositionState({duration:a.duration,position:Math.min(a.currentTime,a.duration),playbackRate:a.playbackRate||1})}catch(e){}}
function thm(t){const p=$('#pl');if(!p)return;if(!t.img){p.style.removeProperty('--cv');p.style.removeProperty('--o1');return}
p.style.setProperty('--cv','url("'+String(t.img).replace(/["\\\n]/g,'')+'")');
const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{if(cur!==t)return;try{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(im,0,0,8,8);const d=x.getImageData(0,0,8,8).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}p.style.setProperty('--o1',`rgb(${r/n|0},${g/n|0},${b/n|0})`)}catch(e){}};im.src=t.img}
/* ----- Mini player, tombol navigasi ----- */
function mpP(a){const i=$('#mp i');if(i&&cur&&a===act&&isFinite(a.duration)&&a.duration>0)i.style.transform='scaleX('+Math.min(1,a.currentTime/a.duration)+')'}
[A,B].forEach(a=>a.addEventListener('timeupdate',()=>mpP(a)));
function rn(){const app=$('#app');let m=$('#mp');if(!m){m=document.createElement('div');m.id='mp';m.onclick=e=>{if(!e.target.closest('button'))openP()};app.appendChild(m)}
const p=!!cur&&!act.paused;
if(!cur){m.classList.remove('on');app.classList.remove('hmp','pl')}
else{m.innerHTML=`<img src="${esc(cov(cur))}" alt=""><div><b>${esc(cur.title)}</b><small>${esc(cur.artist)}</small></div><button class="ib" onclick="toggle()">${ic(p?'pause':'play',20,1)}</button><button class="ib" onclick="nxt()">${ic('next',20,1)}</button><i></i>`;m.classList.add('on');app.classList.add('hmp');app.classList.toggle('pl',p)}
const pb=$('#npb');if(pb)pb.innerHTML=ic(p?'pause':'play',24,1);drR();mpP(act)}
const NV=[['home','Beranda','home'],['explore','Cari','search'],0,['library','Library','lib'],['profile','Profil','user']];
function navR(){const n=$('#nav');if(!n)return;if(!n.firstChild)n.innerHTML=NV.map(x=>x?`<button data-p="${x[0]}" onclick="go('${x[0]}')">${ic(x[2],22)}<span>${x[1]}</span></button>`:`<button class="pbtn" id="npb" onclick="navPlay()" aria-label="Putar">${ic('play',24,1)}</button>`).join('');n.querySelectorAll('button[data-p]').forEach(b=>b.classList.toggle('a',b.dataset.p==pg))}
function navPlay(){if(cur)toggle();else if(songs.length)playAll();else if(rsmOk())resume();else{go('explore');toast('Cari lagu untuk mulai memutar')}}
function go(p){const v=$('#v');if(!v)return;const keep=p===pg?v.scrollTop:0;pg=p;let h;try{h=(V[p]||V.home)()}catch(e){console.error(e);h='<div class="em">Halaman gagal dimuat.<br><small>'+esc(e&&e.message||e)+'</small></div>'}v.innerHTML=h;v.scrollTop=keep;navR()}
/* ----- Lirik (LRCLIB), layar penuh ----- */
const isLrc=s=>/\[\d+:\d+(?:[.:]\d+)?\]/.test(s||'');
function parseLrc(s){const o=[];String(s).split(/\r?\n/).forEach(l=>{const ts=[...l.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];if(!ts.length)return;const w=l.replace(/\[[^\]]*\]/g,'').trim();ts.forEach(m=>o.push({t:+m[1]*60+parseFloat(m[2].replace(':','.')),s:w}))});return o.sort((a,b)=>a.t-b.t)}
function alOf(t){const L=lyc[t.id];if(!L||!isLrc(L))return null;const c=ly2[t.id];if(c&&c.src===L)return c.a;const a=parseLrc(L);ly2[t.id]={src:L,a};return a}
async function fetchLy(t){if(lyTry[t.id])return;lyTry[t.id]=1;if(t.radio){lyS[t.id]='none';return}lyS[t.id]='load';
const cl=s=>String(s||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\s+/g,' ').trim(),yy=t.yt?(()=>{const z=String(t.title||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip)\b/ig,' ').replace(/\s+/g,' ').trim(),m=z.split(/\s[-\u2013\u2014|]\s/);return m.length>1?{a:m[0].trim(),t:m.slice(1).join(' ').trim()}:{a:cl(t.artist),t:z}})():null,ar=yy?yy.a:(/^(Lagu Saya|Link kustom|Tidak diketahui|Radio|YouTube)$/i.test(t.artist)?'':cl(t.artist));let j=null;
try{if(ar){const p={artist_name:ar,track_name:yy?yy.t:cl(t.title)};if(cur&&cur.id==t.id&&isFinite(act.duration))p.duration=Math.round(act.duration);const r=await fetch('https://lrclib.net/api/get?'+new URLSearchParams(p));if(r.ok)j=await r.json()}
if(!j||!(j.syncedLyrics||j.plainLyrics)){const r=await fetch('https://lrclib.net/api/search?q='+encodeURIComponent((ar+' '+(yy?yy.t:cl(t.title))).trim()));if(r.ok){const a=await r.json();j=Array.isArray(a)?(a.find(x=>x.syncedLyrics)||a.find(x=>x.plainLyrics)||null):null}}}catch(e){}
const txt=j&&(j.syncedLyrics||j.plainLyrics);
if(txt){lyc[t.id]=txt;const k=Object.keys(lyc);if(k.length>150)k.slice(0,k.length-150).forEach(x=>delete lyc[x]);ls.set('ly',lyc);lyS[t.id]='ok'}else lyS[t.id]='none';
if(cur&&cur.id==t.id&&(pm||krOn()))rp()}
function lyHtml(t,L){const a=alOf(t);
if(a&&a.length)return`<div class="lyr" data-ly="1">${a.map((x,i)=>`<p data-i="${i}" onclick="lyGo(${i})">${esc(x.s||'♪')}</p>`).join('')}</div>`;
if(L&&L.trim()&&!isLrc(L))return`<div class="lyr">${L.split(/\r?\n/).map(l=>`<p>${l.trim()?esc(l):'&nbsp;'}</p>`).join('')}</div>`;
return`<div class="lyr"><p style="color:var(--mu);font-size:14px;line-height:1.7">${lyS[t.id]=='load'?'Mencari lirik…':'Lirik belum tersedia.<br>Ketuk "Tambah Lirik" untuk menempel sendiri.'}</p></div>`}
function lyGo(i){const al=cur&&alOf(cur);if(al&&al[i])act.currentTime=al[i].t}
function syncLy(a){if(!cur||a!==act)return;const al=alOf(cur);if(!al||!al.length)return;const ct=a.currentTime+.25;let i=-1;for(let k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}if(i===lyI)return;lyI=i;
document.querySelectorAll('#pl .lyr p[data-i],#kr .lyr p[data-i]').forEach(p=>{const on=+p.dataset.i===i;p.classList.toggle('on',on);if(on){const c=p.parentElement;c.scrollTo({top:p.getBoundingClientRect().top-c.getBoundingClientRect().top+c.scrollTop-c.clientHeight/2+p.clientHeight/2,behavior:'smooth'})}})}
const krOn=()=>$('#kr').classList.contains('on');
function openKr(){if(!cur)return;krRender();$('#kr').classList.add('on')}
function krX(){$('#kr').classList.remove('on')}
function krRender(){const t=cur;if(!t)return;const p=!act.paused;$('#kr').innerHTML=`<div class="hd"><button class="ib g" onclick="krX()">${ic('back')}</button><div style="flex:1;min-width:0;text-align:center"><b style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.title)}</b><small>${esc(t.artist)}</small></div><span style="width:38px"></span></div>${lyHtml(t,lyc[t.id])}<div class="ctl"><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button></div>`;lyI=-1}
/* ----- Resolusi rekomendasi, radio otomatis, simpan offline ----- */
async function resolveRec(t){try{const W=s=>new Set(String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').split(/[^\p{L}\p{N}]+/u).filter(w=>w.length>1)),qq=(t.title+' '+(t.artist&&t.artist!='Tidak diketahui'?t.artist:'')).trim().slice(0,80);
const r=await fetch('/api/music?src=audius&q='+encodeURIComponent(qq));if(!r.ok)throw 0;const a=arrOf(await r.json()),tw=W(t.title),aw=W(t.artist);let best=null,bs=0;
for(const c of a){if(!c||!c.url)continue;const cw=W(c.title+' '+c.artist);let n=0,m=0;tw.forEach(w=>{if(cw.has(w))n++});aw.forEach(w=>{if(cw.has(w))m++});const ts=tw.size?n/tw.size:0,as=aw.size?m/aw.size:0,s=ts>=.7?ts+as:0;if(s>bs){bs=s;best=c}}
if(best){t.url=best.url;t.img=t.img||best.img;t.dl=best.dl;t.sn=best.sn;t.nf=0;return true}}catch(e){}
try{const y=await ytSearch(qq),v=y&&y[0];if(v){Object.assign(t,{yt:1,vid:v.vid,img:t.img||v.img,rec:0,nf:0});return true}}catch(e){}
t.nf=1;return false}
function rrec(){const e=$('#rec');if(e)e.innerHTML=recHtml()}
async function autoRadio(force){const t=cur;if(!t||t.loc||t.radio||t.yt||(t.rec&&!t.url))return;if(!force&&cfg.ar===false)return;toast('Memutar lagu serupa…');
try{const r=await fetch('/api/music?src=audius&q='+encodeURIComponent(/^(Tidak diketahui|Lagu Saya)$/i.test(t.artist)?t.title:t.artist));if(!r.ok)throw 0;const a=arrOf(await r.json()).filter(x=>x&&x.url&&x.id!=t.id).map(x=>({...x,h:hh(x.title)}));for(let i=a.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]]}if(!a.length||(!force&&cur!==t))return;play(a.slice(0,15),0)}catch(e){}}
async function dlOff(t){const id='o'+t.id;if(songs.some(x=>x.id==id)){toast('Sudah tersimpan offline');return}toast('Menyimpan offline…');
try{const r=await fetch(t.url);if(!r.ok)throw 0;const b=await r.blob(),s={id,loc:1,blob:b,title:t.title,artist:t.artist,h:hh(t.title),added:Date.now(),off:1};if(t.img)s.img=t.img;await tx('readwrite',o=>o.put(s));songs.push(s);toast('Tersimpan offline di Library');if(pg=='library'||pg=='home')go(pg)}catch(e){toast('Gagal menyimpan offline')}}

/* ----- Tampilan pemutar ala YouTube Music (khusus lagu YouTube) ----- */
var ytTab=0,ytRelL=[],ytRelFor='';
const ytThumb=t=>{const i=vidOf(t);return i?'https://i.ytimg.com/vi/'+i+'/maxresdefault.jpg':(t.img||'')};
function ytSplit(t){const z=String(t.title||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip)\b/ig,' ').replace(/\s+/g,' ').trim(),m=z.split(/\s[-\u2013\u2014|]\s/);return m.length>1?{a:m[0].trim(),t:m.slice(1).join(' ').trim()}:{a:String(t.artist||'').trim(),t:z}}
function ytTabSet(n){ytTab=n;pm=n==1?1:0;rp()}
async function ytRel(){const t=cur;if(!t||ytRelFor==t.id)return;ytRelFor=t.id;ytRelL=[];const a=/^YouTube$/i.test(t.artist)?ytSplit(t).a:t.artist;try{const r=await ytSearch((a||'')+' lagu');ytRelL=r.filter(x=>x.id!=t.id).slice(0,15)}catch(e){ytRelFor=''}if(cur===t&&ytTab==2)rp()}
async function ytMenu(){if(!cur)return;const k=await uiPick('Menu',[isF(cur)?'Hapus dari Favorit':'Tambah ke Favorit','Tambah ke playlist','Kecepatan '+rate+'x','Sleep timer','Bagikan','Simpan ke video']);if(k==null)return;if(k==0)fav();else if(k==1)addPl();else if(k==2){spd();if(act===yAct)yAct.playbackRate=rate;rp()}else if(k==3)goSl();else if(k==4)shareCard();else vSave()}
function rpY(t){const p=!act.paused,L=lyc[t.id],AL=ly2[t.id],pl=$('#pl'),sc=pl.scrollTop;lyI=-1;if(ytTab==1&&!L)fetchLy(t);if(ytTab==2&&ytRelFor!=t.id)ytRel();
const n=q.length,ord=[];for(let k=0;k<Math.min(n,40);k++)ord.push((qi+k)%n);
const qr=ord.map((ix,k)=>{const u=q[ix];return `<div class="yr${k?'':' on'}" onclick="play(q,${ix})"><div class="yi"><img src="${esc(u.yt?u.img:cov(u))}" loading="lazy">${k?'':'<i class="eqb"><s></s><s></s><s></s></i>'}</div><div class="yt"><b>${esc(u.title)}</b><small>${esc(u.artist)}</small></div></div>`}).join('');
const body=ytTab==1?`${lyHtml(t,L,AL)}<button class="btn g" style="margin:12px 0" onclick="addLy()">${L?'Ubah Lirik':'Tambah Lirik'}</button>`:ytTab==2?(ytRelFor==t.id&&ytRelL.length?rows('rl',ytRelL):'<div class="em">Memuat lagu serupa…</div>'):qr;
pl.innerHTML=`<div class="yh"><button class="yb" onclick="clp()" style="transform:rotate(-90deg)">${ic('back')}</button><div class="ysw"><b class="a">🎧</b><b onclick="vFromSong()">▶</b></div><button class="yb" onclick="ytMenu()">⋮</button></div>
<div class="yc"><img src="${esc(ytThumb(t))}" onerror="this.onerror=null;this.src='${esc(t.img||'')}'"><div class="yg"></div><div class="yn"><h2>${esc(t.title)}</h2><p onclick="artistPg(cur&&cur.artist)">${esc(t.artist)}</p></div></div>
<div class="yp"><input type="range" id="sk" min="0" max="1000" value="0" oninput="if(isFinite(act.duration))act.currentTime=this.value/1000*act.duration"><div class="tm"><span id="ct">0:00</span><span id="du">0:00</span></div>
<div class="ctl"><button style="opacity:${shuf?1:.55}" onclick="shuf=!shuf;rp()">${ic('shuffle')}</button><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button><button style="opacity:${rep?1:.55}" onclick="rep=(rep+1)%3;rp();toast(['Ulangi: mati','Ulangi semua','Ulangi satu lagu'][rep])">${ic('repeat')}</button></div></div>
<div class="yq"><div class="yqh"><h3>Antrean · ${n} lagu</h3><button class="yb" onclick="addPl()">${ic('plus')}</button></div><div class="ych"><span class="chip${ytTab==0?' a':''}" onclick="ytTabSet(0)">Berikutnya</span><span class="chip${ytTab==1?' a':''}" onclick="ytTabSet(1)">Lirik</span><span class="chip${ytTab==2?' a':''}" onclick="ytTabSet(2)">Serupa</span></div>${body}</div>`;
pl.scrollTop=sc;if(krOn())krRender();tick()}

/* ----- Video YouTube ----- */
const mkV=(id,title,artist)=>({id:'y'+id,yt:1,vid:id,title:String(title||'Video YouTube').slice(0,200),artist:String(artist||'YouTube').slice(0,100),img:'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg',h:hh(title||id)});
const vidOf=t=>t.vid||(String(t.id).match(/[\w-]{11}$/)||[])[0];
function ytId(u){const m=String(u||'').trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);return m?m[1]:''}
async function ytSearch(s){for(const u of ['/api/yt-music','/api/yt-search']){const r=await fetch(u+'?q='+encodeURIComponent(s));if(r.status==404)continue;if(!r.ok)throw Object.assign(new Error('yt'),{status:r.status});return arrOf(await r.json()).map(x=>mkV(x.id,x.title,x.artist))}throw Object.assign(new Error('yt'),{status:404})}
const ytMsg=e=>e&&e.status==501?'Pencarian video belum diaktifkan di server (isi YOUTUBE_API_KEY di Vercel).':e&&e.status==429?'Kuota pencarian video hari ini habis. Tempel link YouTube langsung.':e&&e.status==404?'Pencarian video belum tersedia di server.':'Tidak bisa terhubung. Periksa internet.';
function ytLoad(cb){if(window.YT&&YT.Player){cb();return}(window._yq=window._yq||[]).push(cb);if(window._yl)return;window._yl=1;window.onYouTubeIframeAPIReady=()=>{(window._yq||[]).splice(0).forEach(f=>f())};const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{window._yl=0;window._yq=[];toast('Pemutar YouTube tidak bisa dimuat. Periksa internet.')};document.head.appendChild(s)}
var vS0=0;function vLoad(id){const st=vS0;vS0=0;ytLoad(()=>{try{if(yp&&yp.loadVideoById){yp.loadVideoById({videoId:id,startSeconds:st});return}yp=new YT.Player('player',{videoId:id,playerVars:{playsinline:1,rel:0,modestbranding:1,autoplay:1,start:Math.floor(st)},events:{onReady:e=>{try{e.target.playVideo()}catch(x){}},onStateChange:vSt,onError:vEr}})}catch(e){toast('Pemutar YouTube gagal dimuat')}})}
var yAct={
get paused(){return !vPlaying()},
get currentTime(){try{return yp.getCurrentTime()||0}catch(e){return 0}},
set currentTime(v){try{yp.seekTo(v,true)}catch(e){}},
get duration(){try{const d=yp.getDuration();return d>0?d:NaN}catch(e){return NaN}},
get volume(){return 1},set volume(v){},
get playbackRate(){try{return yp.getPlaybackRate()||1}catch(e){return 1}},
set playbackRate(v){try{yp.setPlaybackRate(Math.min(2,Math.max(.25,v)))}catch(e){}},
get ended(){try{return yp.getPlayerState()==0}catch(e){return false}},
play(){try{yp.playVideo()}catch(e){}return Promise.resolve()},
pause(){try{yp.pauseVideo()}catch(e){}}};
setInterval(()=>{if(act===yAct&&vPlaying())tick()},500);
function vPlaying(){try{return !!(yp&&yp.getPlayerState&&yp.getPlayerState()==1)}catch(e){return false}}
function vSt(e){if(e.data==1){vef=0;A.pause();B.pause();try{yp.setPlaybackRate(Math.min(2,Math.max(.25,rate)))}catch(x){}if(act===yAct){mst('playing');rp();rn()}}else if(e.data==2){if(act===yAct){mst('paused');rp();rn()}}else if(e.data==0){if(act===yAct){if(slEnd==-1){slFire();return}if(rep==2){yAct.currentTime=0;yAct.play()}else if(rep==1||qi<q.length-1)nxt();else{rp();rn()}return}if(vq.length>1){vNext(1);return}}mvUi()}
function vEr(){toast('Video ini tidak bisa diputar di sini');if(act===yAct){if(q.length>1&&++vef<q.length)setTimeout(()=>nxt(1),800);return}if(vq.length>1&&++vef<vq.length)setTimeout(()=>vNext(1),800)}
function stopV(){try{yp&&yp.pauseVideo&&yp.pauseVideo()}catch(e){}}
function mvUi(){const m=$('#mv');if(!m)return;m.classList.toggle('on',!!(vbg&&vcur&&act!==yAct));$('#mvt').textContent=vcur?vcur.title:'';const mi=$('#mvi'),ms=$('#mvs');if(mi&&vcur)mi.src=vcur.img||'';if(ms)ms.textContent=(vcur&&vcur.artist?vcur.artist+' \u00b7 ':'')+'YouTube';$('#mvp').innerHTML=ic(vPlaying()?'pause':'play',20,1)}
function vSv(){const b=$('#vsv');if(b)b.textContent=vcur&&vids.some(v=>v.id==vcur.id)?'★ Tersimpan':'☆ Simpan'}
function openV(){$('#vo').classList.add('on');vbg=0;mvUi();vSv()}
function playV(list,i,bg){const t=list[i];if(!t)return;vq=[...list];vi=i;vcur=t;A.pause();B.pause();$('#vtt').textContent=t.title;$('#vch').textContent=t.artist;if(bg){vbg=0;$('#vo').classList.remove('on');q=[...list];qi=i;cur=t;act=yAct;fq=0;ab={a:null,b:null};lastCt=0;cur._pt=0;cur._cn=0;cur._xf=0;try{hist=[svt(cur),...hist.filter(x=>x.id!=cur.id)].slice(0,12);ls.set('hist',hist)}catch(e){}try{ms();thm(cur)}catch(e){}rp();rn();mvUi();vSv()}else{if(act===yAct)act=A;vbg=0;openV()}vLoad(vidOf(t));setTimeout(mvUi,600)}
function vNext(d){if(act===yAct){nxt(d);return}if(!vq.length)return;vi=(vi+d+vq.length)%vq.length;const t=vq[vi];if(t&&!t.yt){stopV();vcur=null;vbg=0;mvUi();play(vq,vi);return}playV(vq,vi,vbg)}
function vSave(){if(!vcur)return;if(vids.some(v=>v.id==vcur.id)){vids=vids.filter(v=>v.id!=vcur.id);toast('Dihapus dari video tersimpan')}else{vids=[vcur,...vids].slice(0,200);toast('Video disimpan')}ls.set('vids',vids);vSv();if(pg=='library'&&lt=='vd')go('library')}
async function vGo(){const s=($('#vq').value||'').trim();if(!s)return;const y=ytId(s);if(y){vAdd(y);return}const r=$('#vr');r.innerHTML='<div class="em">Mencari video…</div>';try{const a=await ytSearch(s);r.innerHTML=a.length?rows('vr',a):'<div class="em">Tidak ada hasil.</div>'}catch(e){r.innerHTML=`<div class="em">${esc(ytMsg(e))}</div>`}}
async function vAdd(id){let t=mkV(id,'Video YouTube','YouTube');toast('Memuat video…');try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id));if(r.ok){const j=await r.json();t=mkV(id,j.title,j.author_name)}}catch(e){}
const ex=vids.find(v=>v.id==t.id);if(ex)t=ex;else{vids=[t,...vids].slice(0,200);ls.set('vids',vids)}playV([t],0);if(pg=='library'&&lt=='vd')go('library')}
async function delV(id){if(!await uiConfirm('Video ini akan dihapus dari daftar.',{title:'Hapus video?',ok:'Hapus',danger:1}))return;vids=vids.filter(v=>v.id!=id);ls.set('vids',vids);go(pg)}
function vBg(){if(act===yAct){$('#vo').classList.remove('on');openP();return}if(!vcur){toast('Belum ada video yang diputar');return}vbg=1;$('#vo').classList.remove('on');mvUi();toast('Mode audio aktif')}
function vBack(){vbg=0;mvUi();$('#vo').classList.add('on')}
function vTog(){try{vPlaying()?yp.pauseVideo():yp.playVideo()}catch(e){}setTimeout(mvUi,300)}
function vOff(){try{yp&&yp.stopVideo&&yp.stopVideo()}catch(e){}vcur=null;vbg=0;$('#vtt').textContent='Pilih video';$('#vch').textContent='Cari atau tempel link YouTube';mvUi();vSv()}
function vClose(){$('#vo').classList.remove('on');if(vcur&&vPlaying())vbg=1;mvUi()}
async function vFromSong(){if(cur&&cur.yt&&act===yAct){clp();vBack();return}const t=cur;let pos=0;try{pos=act.currentTime||0}catch(e){}clp();openV();if(!t)return;const a=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio)$/i.test(t.artist)?'':t.artist,qy=(t.title+' '+a).trim();$('#vq').value=qy;const r=$('#vr');r.innerHTML='<div class="em">Mencari video\u2026</div>';
try{const res=await ytSearch(qy);if(!res.length){r.innerHTML='<div class="em">Tidak ada hasil.</div>';return}r.innerHTML=rows('vr',res);try{if(!t.yt&&isFinite(act.currentTime))pos=act.currentTime}catch(e){}vS0=pos>2?pos:0;playV(res,0)}catch(e){r.innerHTML=`<div class="em">${esc(ytMsg(e))}</div>`}}
function ovc(){const o=['kr','dr','vo','pl','sp'].map(i=>$('#'+i)).find(e=>e&&e.classList.contains('on'));if(!o)return;if(o.id=='vo')vClose();else if(o.id=='pl')clp();else if(o.id=='sp')csp();else if(o.id=='kr')krX();else drClose()}
function qs(s){if(pg!='explore')go('explore');lq=s;const i=$('#qi');if(i)i.value=s;doSearch(s)}
function vSr(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Pencarian suara tidak didukung browser ini');return}try{const r=new R();r.lang='id-ID';r.interimResults=false;r.onresult=e=>qs(e.results[0][0].transcript);r.onerror=()=>toast('Suara tidak terbaca');r.start();toast('Silakan bicara…')}catch(e){toast('Pencarian suara gagal dimulai')}}
/* ----- Trending dan rekomendasi ----- */
const TG=[['','Semua'],['Pop','Pop'],['Rock','Rock'],['Electronic','Elektronik'],['Hip-Hop/Rap','Hip-Hop'],['Jazz','Jazz'],['Lo-Fi','Lo-Fi'],['Acoustic','Akustik']];
const tgChips=()=>TG.map(x=>`<span class="chip ${tg==x[0]?'a':''}" onclick="tgSet('${x[0]}')">${x[1]}</span>`).join('');
function trBody(){return trRes===null?skel6(4):trRes==='err'?'<div class="em">Tidak bisa memuat trending.<br><a style="color:var(--p2)" onclick="trRetry()">Coba lagi</a></div>':trRes.length?rows('tr',trRes):'<div class="em">Belum ada trending.</div>'}
function trCards(){if(trRes===null)return'<div class="em" style="flex:1">Memuat…</div>';if(trRes==='err')return'<div class="em" style="flex:1">Trending belum bisa dimuat.<br><a style="color:var(--p2)" onclick="trRetry()">Coba lagi</a></div>';return(lists.tc=trRes.slice(0,12)).map((t,i)=>`<div class="cd" onclick="P('tc',${i})"><img loading="lazy" src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}
function trR(){const a=$('#tr');if(a)a.innerHTML=trBody();const b=$('#trh');if(b)b.innerHTML=trCards();const c=$('#tgc');if(c)c.innerHTML=tgChips()}
async function trend(g){const k=g||'';if(trBusy===k)return;trBusy=k;let res;try{const r=await fetch('/api/music?src=audius&trending=1&genre='+encodeURIComponent(k));if(!r.ok)throw 0;res=arrOf(await r.json()).map(x=>({...x,h:hh(x.title)}))}catch(e){res='err'}if(trBusy!==k)return;trBusy=null;trRes=res;trR()}
function tgSet(g){tg=g;cfg.tg=g;ls.set('cfg',cfg);trRes=null;trBusy=null;trR();trend(g)}
function trRetry(){trRes=null;trBusy=null;trR();trend(tg)}
const RC=[['mood:happy','😊 Senang'],['mood:sad','😢 Sendu'],['mood:energetic','⚡ Semangat'],['mood:relaxed','😌 Santai'],['mood:danceable','💃 Joget'],['activity:workout','🏋 Olahraga'],['activity:study','📚 Belajar'],['activity:focus','🎯 Fokus'],['activity:party','🎉 Pesta'],['activity:sleep','😴 Tidur'],['time:morning','🌅 Pagi'],['time:afternoon','☀ Siang'],['time:evening','🌇 Sore'],['time:night','🌙 Malam']];
let recSel=(()=>{const h=new Date().getHours();return 'time:'+(h<11?'morning':h<15?'afternoon':h<18?'evening':'night')})();
async function recFetch(k,fresh){recBusy=k;const [ty,va]=k.split(':');let res;try{const r=await fetch('/api/soundstat?type='+ty+'&value='+va+(fresh?'&r='+Date.now():''));if(r.status==501)res={err:'Rekomendasi belum diaktifkan di server (isi SOUNDSTAT_API_KEY di Vercel).'};else if(!r.ok)throw 0;else res=arrOf(await r.json()).map(x=>({...x,rec:1,h:hh(x.title)}))}catch(e){res={err:'Rekomendasi belum bisa dimuat. Coba lagi nanti.'}}
recC[k]=res;if(recBusy===k)recBusy='';if(recSel==k)rrec()}
function recHtml(){const c=recC[recSel];if(!c){if(recBusy!=recSel)recFetch(recSel);return'<div class="em">Mencari lagu yang pas…</div>'}
if(c.err)return`<div class="em">${esc(c.err)}<br><a style="color:var(--p2)" onclick="recGo('${recSel}',1)">Coba lagi</a></div>`;
if(!c.length)return'<div class="em">Belum ada rekomendasi.</div>';
return`<div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn" onclick="recAll()">▶ Putar Semua</button><button class="btn g" onclick="recGo(recSel,1)">↻ Segarkan</button></div>${rows('rcm',c)}`}
function recGo(k,fresh){recSel=k;if(fresh)delete recC[k];document.querySelectorAll('.rcc').forEach(x=>x.classList.toggle('a',x.dataset.k==k));rrec()}
function recAll(){const c=recC[recSel];if(c&&c.length){play(c,0);openP()}}
/* ----- Library: cari, urut, edit, playlist otomatis ----- */
function sgList(){let a=sg();const k=lsq.trim().toLowerCase();if(k)a=a.filter(t=>(t.title+' '+t.artist).toLowerCase().includes(k));if(lso=='old')a.reverse();else if(lso=='az')a.sort((x,y)=>x.title.localeCompare(y.title));else if(lso=='ar')a.sort((x,y)=>x.artist.localeCompare(y.artist)||x.title.localeCompare(y.title));return a}
function lsBar(){if(songs.length<2)return'';return`<div class="srch" style="margin-top:12px">${ic('search',18)}<input placeholder="Cari di library…" value="${esc(lsq)}" oninput="lsF(this.value)"></div><div class="chips">${[['new','Terbaru'],['old','Terlama'],['az','A-Z'],['ar','Artis']].map(x=>`<span class="chip ${lso==x[0]?'a':''}" onclick="lsO('${x[0]}')">${x[1]}</span>`).join('')}</div>`}
function lsF(v){lsq=v;const e=$('#sgl');if(e){const a=sgList();e.innerHTML=a.length?rows('sg',a,1):'<div class="em">Tidak ada lagu yang cocok.</div>'}}
function lsO(o){lso=o;ls.set('lso',o);go('library')}
async function edS(id){const s=songs.find(x=>x.id==id);if(!s)return;const r=await uiForm('Ubah info lagu',[{label:'Judul lagu',value:s.title,max:200},{label:'Artis',value:s.artist,max:100}]);if(!r)return;const t=r[0],a=r[1];if(t.trim())s.title=t.trim().slice(0,200);if(a.trim())s.artist=a.trim().slice(0,100);s.h=hh(s.title);try{await tx('readwrite',o=>o.put(s))}catch(e){}if(cur&&cur.id==id){rp();rn();ms()}toast('Info lagu diperbarui');go(pg)}
function known(){const m=new Map();[...songs,...favs.map(rs),...hist.map(rs),...pls.flatMap(p=>p.tr.map(rs))].forEach(t=>{if(t&&t.id!=null&&!m.has(t.id))m.set(t.id,t)});return m}
const SMN={top:['🔥','Paling Sering Diputar'],new:['🆕','Baru Ditambahkan'],rec:['🕘','Terakhir Diputar']};
function smGet(k){if(k=='new')return sg().slice(0,50);if(k=='rec')return hist.map(rs).filter(Boolean);const m=known();return Object.entries(stt.pl||{}).map(([id,v])=>({t:m.get(id),s:v&&typeof v=='object'?+v.s||0:+v||0})).filter(x=>x.t&&x.s>10&&!x.t.yt).sort((a,b)=>b.s-a.s).slice(0,30).map(x=>x.t)}
function smBlock(){return`<div class="sec"><h3>Playlist Otomatis</h3></div>`+Object.keys(SMN).map(k=>`<div class="rw" onclick="smOpen('${k}')"><div class="mxi">${SMN[k][0]}</div><div><b>${SMN[k][1]}</b><small>${smGet(k).length} Lagu</small></div></div>`).join('')}
function smOpen(k){const a=smGet(k);sub(shd(SMN[k][1])+(a.length?`<button class="btn" onclick="play(lists.sm,0);openP()">▶ Putar</button><div style="height:8px"></div>${rows('sm',a)}`:'<div class="em">Belum ada lagu.</div>'))}
/* ----- Antrean ----- */
function qAdd(k,i){const t=lists[k]&&lists[k][i];if(!t)return;if(t.yt){toast('Video tidak bisa masuk antrean musik');return}if(!cur){play([t],0);openP();return}q.push(t);toast('Masuk antrean: '+t.title)}
function goQ(){rbP=isPlO();clp();qR()}
function qR(){const a=q.map((t,i)=>`<div class="rw" onclick="qGo(${i})" style="${i==qi?'background:var(--c)':''}"><img src="${esc(cov(t))}" alt=""><div><b>${esc(t.title)}</b><small>${esc(t.artist)}${i==qi?' · sedang diputar':''}</small></div>${i==qi?'':`<button class="ib" style="color:var(--mu)" title="Putar berikutnya" onclick="event.stopPropagation();qNext(${i})">⤒</button><button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();qRm(${i})">${ic('x',18)}</button>`}</div>`).join('');
sub(shd('Antrean')+(q.length?`<div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn g" onclick="qShuf()">Acak</button><button class="btn g" onclick="qClr()">Kosongkan</button></div>${a}`:'<div class="em">Antrean kosong.</div>')+(cur&&!cur.loc&&!cur.radio&&!cur.yt?`<button class="btn" style="margin-top:14px" onclick="csp0();rbP=0;autoRadio(1);openP()">📻 Radio dari lagu ini</button>`:''))}
function qGo(i){csp0();rbP=0;play(q,i);openP()}
function qRm(j){if(j==qi)return;q.splice(j,1);if(j<qi)qi--;qR()}
function qNext(j){if(j==qi)return;const [t]=q.splice(j,1);if(j<qi)qi--;q.splice(qi+1,0,t);qR();toast('Diputar berikutnya')}
function qShuf(){const h=q.slice(0,qi+1),r=q.slice(qi+1);for(let i=r.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[r[i],r[k]]=[r[k],r[i]]}q=[...h,...r];qR()}
function qClr(){if(!cur)return;q=[cur];qi=0;qR()}
/* ----- Playlist, cadangan ----- */
async function mkPl(){const n=((await uiPrompt('Beri nama untuk playlist barumu.','',{title:'Buat playlist',placeholder:'Contoh: Santai sore',ok:'Buat',max:60}))||'').trim().slice(0,60);if(!n)return;pls.push({n,tr:[]});ls.set('pls',pls);lt='pl';go('library');toast('Playlist dibuat')}
function plPlay(i){const p=pls[i];if(!p)return;const all=p.tr.map(rs).filter(Boolean).filter(t=>!(t.rec&&!t.url));if(!all.length){toast('Playlist kosong');return}if(all[0].yt){playV(all,0,1);openP()}else{play(all,0);openP()}}
function dl(name,obj){const b=new Blob([JSON.stringify(obj)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
function plExp(i){const p=pls[i];if(!p)return;dl('playlist-'+p.n.replace(/[^\w-]+/g,'_')+'.json',{app:'midnight-acoustic',type:'playlist',n:p.n,tr:p.tr,img:p.img||''});toast('Playlist diekspor')}
const okU=u=>/^https:\/\//i.test(u||'');
function cleanTr(x){if(!x||typeof x!='object'||x.id==null)return null;if(x.loc)return{id:String(x.id),loc:1};if(x.yt){const v=vidOf(x);return v&&/^[\w-]{11}$/.test(v)?mkV(v,x.title,x.artist):null}if(!okU(x.url))return null;return{id:String(x.id).slice(0,80),title:String(x.title||'Tanpa judul').slice(0,200),artist:String(x.artist||'Tidak diketahui').slice(0,100),img:okU(x.img)||/^data:image\//.test(x.img||'')?x.img:'',url:x.url,dl:x.dl,sn:x.sn,h:hh(x.title||''),...(x.radio?{radio:1}:{})}}
async function plImp(f){if(!f)return;try{const j=JSON.parse(await f.text());const n=String(j.n||j.name||'Playlist impor').slice(0,60),tr=(Array.isArray(j.tr)?j.tr:[]).map(cleanTr).filter(Boolean);if(!tr.length){toast('File playlist tidak berisi lagu yang valid');return}const p={n,tr};if(/^data:image\//.test(j.img||''))p.img=j.img;pls.push(p);ls.set('pls',pls);lt='pl';go('library');toast('Playlist diimpor: '+tr.length+' lagu')}catch(e){toast('File playlist tidak valid')}}
function plShare(i){const p=pls[i];if(!p)return;const a=p.tr.map(rs).filter(t=>t&&!t.loc&&(t.yt||okU(t.url)));if(!a.length){toast('Hanya lagu online atau video yang bisa dibagikan lewat tautan');return}
const raw=JSON.stringify({n:p.n,t:a.map(t=>[t.id,t.title,t.artist,t.url||'',okU(t.img)?t.img:'',t.yt?vidOf(t):'',t.radio?1:0])}),by=new TextEncoder().encode(raw);let s='';by.forEach(c=>s+=String.fromCharCode(c));const enc=btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
if(enc.length>7000){toast('Playlist terlalu besar untuk tautan. Pakai Ekspor.');return}
const url=location.origin+location.pathname+'?pl='+enc;if(navigator.share){navigator.share({title:p.n,text:'Dengarkan playlist "'+p.n+'" di Midnight Acoustic',url}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast('Tautan disalin'),()=>toast('Gagal menyalin tautan'))}else uiPrompt('Salin tautan ini dan bagikan.',url,{title:'Tautan playlist',ok:'Tutup',readonly:1,max:8000})}
async function plLink(enc){try{const s=atob(enc.replace(/-/g,'+').replace(/_/g,'/')),by=Uint8Array.from(s,c=>c.charCodeAt(0)),j=JSON.parse(new TextDecoder().decode(by)),tr=(j.t||[]).slice(0,100).map(a=>cleanTr(a[5]?{id:a[0],yt:1,vid:a[5],title:a[1],artist:a[2]}:{id:a[0],title:a[1],artist:a[2],url:a[3],img:a[4],radio:a[6]})).filter(Boolean);if(!tr.length)return;const n=String(j.n||'Playlist').slice(0,60);if(await uiConfirm('"'+n+'" ('+tr.length+' lagu) akan ditambahkan ke Library.',{title:'Tambah playlist?',ok:'Tambahkan',icon:'🎶'})){pls.push({n,tr});ls.set('pls',pls);lt='pl';go('library');toast('Playlist ditambahkan')}}catch(e){toast('Tautan playlist tidak valid')}}
function goBk(){rbP=0;sub(shd('Cadangan Data')+`<p style="color:var(--mu);font-size:13px;line-height:1.6;margin:4px 0 14px">Ekspor menyimpan favorit, playlist, riwayat, lirik, pengaturan, dan statistik ke satu file. File lagu di perangkat tidak ikut karena ukurannya besar.</p><button class="btn" onclick="bkExp()">Ekspor Data</button><button class="btn g" style="margin-top:10px" onclick="$('#fbk').click()">Pulihkan dari File</button>`)}
function bkExp(){ls.set('stt',stt);const d={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ma_'))d[k]=localStorage.getItem(k)}}catch(e){}dl('midnight-acoustic-backup-'+new Date().toISOString().slice(0,10)+'.json',{app:'midnight-acoustic',v:1,data:d});toast('Cadangan diekspor')}
async function bkImp(f){if(!f)return;try{const j=JSON.parse(await f.text());if(j.app!='midnight-acoustic'||!j.data)throw 0;if(!await uiConfirm('Data saat ini akan ditimpa dengan isi file cadangan.',{title:'Pulihkan data?',ok:'Pulihkan',danger:1,icon:'💾'}))return;window._noSave=1;Object.keys(j.data).forEach(k=>{if(k.startsWith('ma_')&&typeof j.data[k]=='string')localStorage.setItem(k,j.data[k])});location.reload()}catch(e){toast('File cadangan tidak valid')}}
/* ----- Equalizer ----- */
const EP={Flat:[[0,0,0,0,0,0],0,0],'Bass Boost':[[5,4,2,0,0,0],6,0],'Treble Boost':[[0,0,0,2,4,5],0,6],Vokal:[[-2,-1,2,4,2,-1],0,0],Rock:[[4,2,-1,-1,2,4],2,2],Pop:[[-1,2,4,2,-1,-2],0,0],Jazz:[[3,2,-2,2,3,4],0,1],Klasik:[[4,3,-1,-1,2,3],0,0],Elektronik:[[5,3,0,2,4,5],3,2],Akustik:[[3,3,2,0,2,3],0,0]};
const EB=['60','230','910','3.6k','8k','14k'],db=v=>(v>0?'+':'')+v;
let eqp=ls.get('eqp',{});
function goEq(){rbP=isPlO();clp();eqR()}
function eqR(){const us=Object.keys(eqp);
sub(shd('Equalizer')+`<div class="ft" style="cursor:default"><div>Equalizer aktif</div><i class="sw ${eq.on?'on':''}" onclick="eqTg()"></i></div>
<div class="chips">${Object.keys(EP).map(n=>`<span class="chip ${eq.pre==n?'a':''}" onclick="eqP('${n}')">${n}</span>`).join('')}${us.map((n,i)=>`<span class="chip ${eq.pre==n?'a':''}" onclick="eqPu(${i})">${esc(n)} <b onclick="event.stopPropagation();eqDel(${i})">×</b></span>`).join('')}</div>
<div class="eqs" style="height:214px">${EB.map((l,i)=>`<div><small id="ev${i}">${db(eq.v[i])}</small><input type="range" min="-12" max="12" step="1" value="${eq.v[i]}" oninput="eqB(${i},this.value)"><span>${l}</span></div>`).join('')}</div>
<div class="ft" style="cursor:default"><div>Bass</div><input type="range" min="-12" max="12" step="1" value="${eq.bass}" oninput="eqX('bass',this.value)" style="width:55%"></div>
<div class="ft" style="cursor:default"><div>Treble</div><input type="range" min="-12" max="12" step="1" value="${eq.treb}" oninput="eqX('treb',this.value)" style="width:55%"></div>
<button class="btn g" style="margin-top:14px" onclick="eqSave()">Simpan sebagai preset</button>
<p style="color:var(--mu);font-size:11px;line-height:1.6;margin-top:12px">Equalizer berlaku untuk lagu dari perangkat. Lagu online diputar langsung oleh browser sehingga tidak bisa diproses.</p>`)}
function eqSv(){ls.set('eq',eq);ap()}
function eqTg(){eq.on=!eq.on;eqSv();eqR()}
function eqSet(p){eq.v=[...p[0]];eq.bass=p[1];eq.treb=p[2]}
function eqP(n){eqSet(EP[n]);eq.pre=n;eqSv();eqR()}
function eqPu(i){const n=Object.keys(eqp)[i],p=eqp[n];if(!p)return;eqSet([p.v,p.bass,p.treb]);eq.pre=n;eqSv();eqR()}
async function eqDel(i){const n=Object.keys(eqp)[i];if(!n||!await uiConfirm('Preset "'+n+'" akan dihapus.',{title:'Hapus preset?',ok:'Hapus',danger:1}))return;delete eqp[n];ls.set('eqp',eqp);if(eq.pre==n)eq.pre='Kustom';eqR()}
function eqB(i,v){eq.v[i]=+v;eq.pre='Kustom';const e=$('#ev'+i);if(e)e.textContent=db(+v);eqSv();document.querySelectorAll('.chips .chip.a').forEach(c=>{if(c.closest('#sp'))c.classList.remove('a')})}
function eqX(k,v){eq[k]=+v;eq.pre='Kustom';eqSv()}
async function eqSave(){const n=((await uiPrompt('Simpan pengaturan equalizer saat ini.','',{title:'Simpan preset',placeholder:'Nama preset',max:24}))||'').trim().slice(0,24);if(!n)return;eqp[n]={v:[...eq.v],bass:eq.bass,treb:eq.treb};ls.set('eqp',eqp);eq.pre=n;eqSv();eqR();toast('Preset disimpan')}
/* ----- Statistik ----- */
function goStat(){rbP=0;const m=known(),tot=+stt.tot||0;
const pl=Object.entries(stt.pl||{}).map(([id,v])=>{const o=v&&typeof v=='object'?v:{s:+v||0},t=m.get(id);return{n:(t&&t.title)||o.t||id,a:(t&&t.artist)||o.a||'',s:+o.s||0,c:o.n||0}}).filter(x=>x.s>5).sort((a,b)=>b.s-a.s).slice(0,10);
const ar=Object.entries(stt.ar||{}).map(([n,s])=>({n,s:+s||0})).filter(x=>x.s>5).sort((a,b)=>b.s-a.s).slice(0,8);
const bar=(x,mx)=>`<div style="height:5px;border-radius:9px;background:var(--b);margin-top:5px"><div style="height:100%;width:${Math.max(4,x/mx*100)}%;border-radius:9px;background:var(--g)"></div></div>`;
sub(shd('Statistik Dengar')+`<div class="pcard" style="text-align:center"><small>Total waktu mendengar</small><h1 style="margin-top:4px">${fmtT(tot)}</h1></div>
<div class="sec"><h3>Lagu Teratas</h3></div>${pl.length?pl.map(x=>`<div style="padding:8px 4px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.n)}</b><small>${fmtT(x.s)}</small></div><small>${esc(x.a)}${x.c?' · '+x.c+'x diputar':''}</small>${bar(x.s,pl[0].s)}</div>`).join(''):'<div class="em">Belum ada data. Putar beberapa lagu dulu.</div>'}
<div class="sec"><h3>Artis Teratas</h3></div>${ar.length?ar.map(x=>`<div style="padding:8px 4px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.n)}</b><small>${fmtT(x.s)}</small></div>${bar(x.s,ar[0].s)}</div>`).join(''):'<div class="em">Belum ada data.</div>'}`)}
/* ----- Pengaturan ----- */
function applyCfg(){const d=document.documentElement;d.classList.toggle('eco',!!cfg.eco);d.style.setProperty('--lf',cfg.lf||1);nvA();th()}
function goSet(){rbP=0;setR()}
function setR(){const on=k=>k=='ar'?cfg.ar!==false:k=='nv'?cfg.nv!==false:!!cfg[k];
const sw=(k,l,s)=>`<div class="ft" onclick="cfgTg('${k}')"><div>${l}${s?`<br><small>${s}</small>`:''}</div><i class="sw ${on(k)?'on':''}"></i></div>`;
const v1=v=>typeof v=='number'?v:"'"+v+"'";
const ch=(k,arr)=>`<div class="chips">${arr.map(x=>`<span class="chip ${(cfg[k]==null?arr[0][2]:cfg[k])==x[0]?'a':''}" onclick="cfgSet('${k}',${v1(x[0])})">${x[1]}</span>`).join('')}</div>`;
sub(shd('Pengaturan')+`<div class="ft" onclick="setName()"><span>👤</span><div>Nama<br><small>${esc(nm())}</small></div></div>
<div class="sec"><h3>Tema</h3></div>${ch('theme',[['auto','Otomatis'],['dark','Gelap'],['light','Terang'],['amoled','AMOLED']])}
<div class="sec"><h3>Jenis musik</h3></div>${ch('src',[['all','Musik'],['radio','Radio']])}
<div class="sec"><h3>Pemutar</h3></div>${sw('fade','Transisi halus','Fade in/out di awal dan akhir lagu')}${sw('nv','Normalisasi volume','Meratakan volume lagu dari perangkat')}${sw('ar','Putar otomatis serupa','Saat antrean lagu online habis')}
<div class="sec"><h3>Ukuran lirik</h3></div>${ch('lf',[[.85,'Kecil'],[1,'Normal'],[1.2,'Besar'],[1.4,'Sangat besar']])}
<div class="sec"><h3>Pengingat waktu dengar</h3></div>${ch('rem',[[0,'Mati'],[30,'30 mnt'],[60,'60 mnt'],[90,'90 mnt'],[120,'120 mnt']])}
<div class="sec"><h3>Lainnya</h3></div>${sw('eco','Mode hemat','Matikan animasi dan efek blur')}<div class="ft" onclick="goBk()"><span>💾</span><div>Cadangan Data</div></div><div class="ft" onclick="histClr()"><span>🗑</span><div>Hapus riwayat putar</div></div>`)}
function cfgTg(k){cfg[k]=!(k=='ar'?cfg.ar!==false:k=='nv'?cfg.nv!==false:!!cfg[k]);ls.set('cfg',cfg);applyCfg();setR()}
function cfgSet(k,v){cfg[k]=v;ls.set('cfg',cfg);applyCfg();setR()}
async function setName(){const n=await uiPrompt('Nama ini tampil di beranda dan profil.',cfg.name||'',{title:'Nama kamu',placeholder:'Nama panggilan',max:30});if(n===null)return;cfg.name=n.trim().slice(0,30);ls.set('cfg',cfg);go(pg);if($('#sp').classList.contains('on'))setR()}
/* ----- Mode berkendara, kartu bagikan ----- */
function drR(){const d=$('#dr');if(!d||!d.classList.contains('on'))return;const p=cur&&!act.paused;
d.innerHTML=`<div class="hd"><button class="ib g" onclick="drClose()">${ic('back')}</button><h3>Berkendara</h3><span style="width:38px"></span></div>${cur?`<img class="drc" src="${esc(cov(cur))}" alt=""><h2 class="drt">${esc(cur.title)}</h2><p class="pa">${esc(cur.artist)}</p><div class="drb"><button onclick="nxt(-1)">${ic('prev',34,1)}</button><button class="dp" onclick="toggle()">${ic(p?'pause':'play',46,1)}</button><button onclick="nxt(1)">${ic('next',34,1)}</button></div>`:'<div class="em">Belum ada lagu yang diputar.</div>'}`}
function drOpen(){if(!cur){if(!songs.length&&!rsmOk()){toast('Putar lagu dulu untuk mode berkendara');return}if(songs.length){lists.sg=sg();play(lists.sg,0)}else resume()}
let d=$('#dr');if(!d){d=document.createElement('div');d.className='ov';d.id='dr';$('#app').appendChild(d)}d.classList.add('on');drR();try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>{wl=w}).catch(()=>{})}catch(e){}}
function drClose(){const d=$('#dr');if(d)d.classList.remove('on');try{wl&&wl.release();wl=null}catch(e){}}
async function shareCard(){if(!cur)return;const t=cur,url=location.origin+location.pathname,txt='Lagi dengerin '+t.title+' - '+t.artist;
const text=()=>navigator.share?navigator.share({title:t.title,text:txt,url}).catch(()=>{}):navigator.clipboard?navigator.clipboard.writeText(txt+' '+url).then(()=>toast('Teks disalin')):0;
try{const c=document.createElement('canvas');c.width=c.height=720;const x=c.getContext('2d'),h=t.h||hh(t.title),g=x.createLinearGradient(0,0,720,720);g.addColorStop(0,`hsl(${h},70%,38%)`);g.addColorStop(1,`hsl(${(h+50)%360},75%,14%)`);x.fillStyle=g;x.fillRect(0,0,720,720);x.fillStyle='#fff';x.font='700 26px Sora,system-ui,sans-serif';x.fillText('MIDNIGHT ACOUSTIC',56,84);
x.font='700 58px Sora,system-ui,sans-serif';const ws=t.title.split(' ');let ln='',y=330,n=0;for(const w of ws){const s=ln?ln+' '+w:w;if(x.measureText(s).width>608&&ln){x.fillText(ln,56,y);y+=70;ln=w;if(++n>=3)break}else ln=s}if(n<3)x.fillText(ln,56,y);
x.globalAlpha=.8;x.font='400 34px Sora,system-ui,sans-serif';x.fillText(t.artist.slice(0,36),56,y+70);
const b=await new Promise(r=>c.toBlob(r,'image/png'));if(!b)return text();const f=new File([b],'lagu.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:t.title,text:txt+' '+url}).catch(()=>{});return}text()}catch(e){text()}}
/* ----- Pasang aplikasi, pembaruan, pengantar ----- */
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;if(!ls.get('insx',0))setTimeout(insShow,5000)});
addEventListener('appinstalled',()=>insX());
function insShow(){if(!dip)return;let e=$('#ins');if(!e){e=document.createElement('div');e.id='ins';e.innerHTML='<img src="icon-192.png" alt=""><div><b>Pasang aplikasi</b><small>Buka lebih cepat dari layar utama</small></div><button class="btn" onclick="insGo()">Pasang</button><button class="ib" onclick="insX()">✕</button>';$('#app').appendChild(e)}requestAnimationFrame(()=>e.classList.add('on'))}
function insGo(){if(!dip)return;dip.prompt();dip.userChoice.finally(()=>{dip=null;insX()})}
function insX(){ls.set('insx',1);const e=$('#ins');if(e)e.classList.remove('on')}
function updShow(reg){if($('.upd'))return;const u=document.createElement('div');u.className='upd';u.textContent='Versi baru tersedia. Ketuk untuk memuat ulang.';u.onclick=()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());const w=reg.waiting;if(w)w.postMessage('skip');else location.reload()};$('#app').appendChild(u)}
const OB=[['🎧','Midnight Acoustic','Musik dan video gratis, tanpa iklan. Bisa dibuka offline.'],['📁','Bawa musikmu','Tambahkan lagu dari perangkat, atau cari lagu online dan radio.'],['✨','Siapa namamu?','Biar aplikasi terasa lebih personal.']];let obI=0;
function obR(){const e=$('#ob');if(!e)return;const s=OB[obI];e.innerHTML=`<div class="obc"><div class="obe">${s[0]}</div><h2>${s[1]}</h2><p>${s[2]}</p>${obI==2?'<input class="in" id="obn" placeholder="Nama kamu" maxlength="30" style="margin-bottom:18px;text-align:center">':''}<div class="obd">${OB.map((x,i)=>`<span class="${i==obI?'a':''}"></span>`).join('')}</div><button class="btn" onclick="obNext()">${obI==2?'Mulai':'Lanjut'}</button><a id="obs" onclick="obEnd()">Lewati</a></div>`}
function obNext(){if(obI<2){obI++;obR();return}const n=($('#obn')||{}).value;if(n&&n.trim()){cfg.name=n.trim().slice(0,30);ls.set('cfg',cfg)}obEnd()}
function obEnd(){ls.set('ob',1);const e=$('#ob');if(e){e.classList.add('x');setTimeout(()=>e.remove(),500)}go(pg)}
function obInit(){if(ls.get('ob',0))return;if(favs.length||pls.length||hist.length||songs.length||cfg.name){ls.set('ob',1);return}const e=document.createElement('div');e.id='ob';$('#app').appendChild(e);obR()}
/* ----- Gestur di pemutar ----- */
(function(){const p=$('#pl');let x0=0,y0=0,t0=0,ok=0;p.addEventListener('touchstart',e=>{const t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=Date.now();ok=!e.target.closest('input,textarea,.lyr,button')},{passive:true});
p.addEventListener('touchend',e=>{if(!ok)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;if(Date.now()-t0>700)return;if(Math.abs(dx)>80&&Math.abs(dy)<60){nxt(dx<0?1:-1);hp(10)}else if(dy>110&&Math.abs(dx)<60&&p.scrollTop<=0)clp()},{passive:true})})();
/* ----- Simpan data saat tab ditutup ----- */
addEventListener('pagehide',()=>{if(window._noSave)return;ls.set('stt',stt);saveLast()});
/* ----- Mulai ----- */
function boot(){th();applyCfg();A.defaultPlaybackRate=B.defaultPlaybackRate=rate;navR();
const u=new URLSearchParams(location.search),g=u.get('go');let p='home';if(g=='explore'||g=='library')p=g;go(p);
if(g=='resume'&&rsmOk())resume();
if(u.get('pl')){plLink(u.get('pl'));try{history.replaceState(null,'',location.pathname)}catch(e){}}
obInit();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').then(reg=>{reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state=='installed'&&navigator.serviceWorker.controller)updShow(reg)})})}).catch(()=>{})}}
document.readyState=='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
