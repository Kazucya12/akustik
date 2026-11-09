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
a.addEventListener('error',()=>{if(a.getAttribute('src')&&cur)toast('Sumber lagu tidak bisa dimuat')});
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
profile(){const a=favs.map(rs).filter(Boolean);return`<div style="text-align:center;margin-top:8px"><div class="av" style="width:88px;height:88px;font-size:34px;margin:auto">${esc(nm()[0])}</div><h3 style="margin-top:10px">${esc(nm())}</h3><small>${cfg.name?'@'+esc(cfg.name.toLowerCase().replace(/\s/g,'')):'Ketuk Edit Profil untuk mengisi nama'}</small></div>
<div style="display:flex;justify-content:space-around;text-align:center;margin:16px 0"><div><b>${songs.length}</b><br><small>Lagu</small></div><div><b>${favs.length}</b><br><small>Favorit</small></div><div><b>${pls.length}</b><br><small>Playlist</small></div></div>
<div class="pcard" onclick="goPrem()" style="cursor:pointer"><b>GEMA Premium</b><br><small>${cfg.prem?'Aktif · mode demo':'Belum aktif · ketuk untuk melihat'}</small></div>
<button class="btn g" onclick="cfg.name=(prompt('Nama profil:',cfg.name)||cfg.name).trim();ls.set('cfg',cfg);go('profile')">Edit Profil</button>
<div style="margin-top:14px"><div class="ft" onclick="goEq()"><span>🎚</span><div>Equalizer</div></div><div class="ft" onclick="goStat()"><span>📊</span><div>Statistik Dengar</div></div><div class="ft" onclick="goSet()"><span>⚙</span><div>Pengaturan</div></div></div>
<div class="sec"><h3>Disukai</h3></div>${a.length?rows('fp',a):'<div class="em">Lagu favoritmu muncul di sini.</div>'}`}};
function go(p){pg=p;$('#v').innerHTML=V[p]();$('#v').scrollTop=0;rn()}
function rn(){const n=[['home','Home'],['explore','Explore'],0,['library','Library'],['profile','Profile']];$('#nav').innerHTML=n.map(x=>x?`<button class="${pg==x[0]?'a':''}" onclick="csp0();go('${x[0]}')">${ic({home:'home',explore:'search',library:'lib',profile:'user'}[x[0]],22)}${x[1]}</button>`:`<button class="pbtn" onclick="cur?openP():toggle()">${ic(cur&&!act.paused?'pause':'play',24,1)}</button>`).join('')}
function qs(s){lq=s;go('explore');$('#qi').value=s;doSearch(s)}
function mkPl(){const n=prompt('Nama playlist:');if(n&&n.trim()){pls.push({n:n.trim(),tr:[]});ls.set('pls',pls);go('library')}}
function openPl(i){const p=pls[i],a=p.tr.map(rs).filter(Boolean);sub(shd(esc(p.n))+`<div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn" onclick="plPlay(${i})">▶ Putar</button><button class="btn g" onclick="plExp(${i})">Ekspor</button><button class="btn g" onclick="plShare(${i})">Bagikan</button></div>`+(a.length?rows('pp',a):'<div class="em">Playlist kosong. Buka pemutar lalu ketuk + untuk menambah lagu.</div>')+`<button class="btn g" style="margin-top:14px" onclick="if(confirm('Hapus playlist?')){pls.splice(${i},1);ls.set('pls',pls);csp()}">Hapus Playlist</button>`)}
const PR={Flat:[0,0,0,0,0,0],'Bass Boost':[6,4,1,0,0,0],Vokal:[-2,0,3,4,2,0],Treble:[0,0,0,2,5,6],Rock:[4,3,-1,-2,2,4],Pop:[-1,2,4,3,1,-1],Jazz:[3,1,-1,2,3,4],Klasik:[4,3,-2,-2,0,3],Elektronik:[5,3,0,-2,3,5],Akustik:[4,3,1,2,3,3],Malam:[3,2,0,-1,-2,-4]},sv=()=>ls.set('eq',eq);
function goEq(){clp();const fr=['60Hz','230Hz','910Hz','3.6kHz','8kHz','14kHz'];
sub(`<div class="hd"><button class="ib g" onclick="csp()">${ic('back')}</button><h3>Equalizer</h3><div class="sw ${eq.on?'on':''}" onclick="eq.on=!eq.on;ap();sv();goEq()"></div></div>
<select onchange="eqPre(this.value)">${['Custom',...Object.keys(PR),...Object.keys(eq.cust||{}).map(k=>'★ '+k)].map(p=>`<option ${eq.pre==p?'selected':''}>${esc(p)}</option>`).join('')}</select>
<div class="eqs">${fr.map((f,i)=>`<div><input type="range" min="-12" max="12" value="${eq.v[i]}" oninput="eq.v[${i}]=+this.value;eq.pre='Custom';ap();sv()"><span>${f}</span></div>`).join('')}</div>
<div class="pcard">Bass <b id="bv">${eq.bass>0?'+':''}${eq.bass}dB</b><input type="range" min="-12" max="12" value="${eq.bass}" oninput="eq.bass=+this.value;ap();sv();$('#bv').textContent=(this.value>0?'+':'')+this.value+'dB'"></div>
<div class="pcard">Treble <b id="tv">${eq.treb>0?'+':''}${eq.treb}dB</b><input type="range" min="-12" max="12" value="${eq.treb}" oninput="eq.treb=+this.value;ap();sv();$('#tv').textContent=(this.value>0?'+':'')+this.value+'dB'"></div>
<div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn g" onclick="eqSave()">★ Simpan Preset</button>${String(eq.pre).startsWith('★ ')?'<button class="btn g" onclick="eqDel()">Hapus Preset</button>':''}</div><button class="btn g" onclick="eq={on:eq.on,v:[0,0,0,0,0,0],bass:0,treb:0,pre:'Flat',cust:eq.cust};ap();sv();goEq()">Reset</button><small style="display:block;margin-top:10px;text-align:center">Equalizer berlaku untuk lagu dari perangkat. Lagu online diputar tanpa efek.</small>`)}
function goPrem(){sub(`${shd('GEMA Premium')}<div class="crown">👑</div><p style="text-align:center;color:var(--mu);margin:6px 0 16px;font-size:13px">Nikmati pengalaman musik tanpa batas</p>${['Tanpa Iklan','Download Offline','Kualitas Audio Hi-Res','Akses Konten Eksklusif','Mode Gelap Pro'].map(x=>`<div class="ft"><span style="color:var(--p)">✔</span><div>${x}</div></div>`).join('')}<button class="btn" style="margin-top:18px" onclick="cfg.prem=true;ls.set('cfg',cfg);toast('Premium aktif (mode demo)');csp()">${cfg.prem?'Premium Aktif':'Upgrade Sekarang'}</button>`)}
function goSet(){sub(`${shd('Pengaturan')}<div class="pcard"><small>Tampilan</small><select style="margin-top:8px" onchange="cfg.theme=this.value;ls.set('cfg',cfg);th()">${[['auto','Otomatis (ikut perangkat)'],['dark','Gelap'],['amoled','Hitam pekat (AMOLED)'],['light','Terang']].map(s=>`<option value="${s[0]}" ${cfg.theme==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>

<div class="pcard"><small>Crossfade antar lagu (lagu berikutnya masuk halus)</small><select style="margin-top:8px" onchange="cfg.cf=+this.value;ls.set('cfg',cfg)">${[[0,'Mati'],[3,'3 detik'],[6,'6 detik'],[10,'10 detik']].map(s=>`<option value="${s[0]}" ${(cfg.cf||0)==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>
<div class="pcard"><small>Kecepatan putar</small><select style="margin-top:8px" onchange="rate=+this.value;ls.set('rate',rate);A.defaultPlaybackRate=B.defaultPlaybackRate=rate;act.playbackRate=rate">${RS.map(r=>`<option value="${r}" ${rate==r?'selected':''}>${r}x</option>`).join('')}</select></div><div class="pcard"><small>Alat</small><div style="display:flex;gap:8px;margin-top:8px"><button class="btn g" onclick="goEq()">Equalizer</button><button class="btn g" onclick="goSl()">Sleep timer</button><button class="btn g" onclick="goStat()">Statistik</button></div></div><div class="pcard"><small>Penyimpanan</small><div id="stg" style="margin:8px 0;font-size:13px">Menghitung\u2026</div><div style="display:flex;gap:8px"><button class="btn g" onclick="stCache()">Bersihkan cache</button><button class="btn g" onclick="stUpd()">Cek pembaruan</button></div></div><button class="btn g" style="margin-bottom:12px" onclick="stReset()">Reset pengaturan (lagu tetap aman)</button><div class="pcard"><small>Wrapped pribadi</small><button class="btn g" style="margin-top:8px" onclick="wrapped()">Buat kartu Wrapped</button></div><div class="pcard"><small>Warna aksen</small><select style="margin-top:8px" onchange="cfg.ac=+this.value;ls.set('cfg',cfg);acA()">${[[0,'Otomatis (ikut cover)'],[12,'Coral'],[215,'Biru'],[150,'Hijau'],[265,'Ungu'],[330,'Pink']].map(s=>`<option value="${s[0]}" ${(cfg.ac||0)==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>${[['Mode hemat baterai (matikan blur dan animasi)','eco',0],['Getaran saat menekan tombol','hp',1],['Warna aplikasi mengikuti cover lagu','dyn',1],['Autoplay lagu serupa saat antrean habis','ap',1],['Notifikasi dalam aplikasi','nt',1],['Normalisasi volume (rata-kan keras dan pelan)','nv',1],['Layar tetap menyala saat memutar','wl',0]].map(([l,k,d])=>`<div class="pcard"><small>${l}</small><select style="margin-top:8px" onchange="cfg['${k}']=+this.value;ls.set('cfg',cfg);ecoA()">${[[1,'Aktif'],[0,'Mati']].map(s=>`<option value="${s[0]}" ${(cfg[k]==null?d:+cfg[k])==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>`).join('')}<div class="pcard"><small>Ukuran teks lirik</small><select style="margin-top:8px" onchange="cfg.lf=+this.value;ls.set('cfg',cfg);lfA()">${[[.85,'Kecil'],[1,'Normal'],[1.25,'Besar'],[1.5,'Sangat besar']].map(s=>`<option value="${s[0]}" ${(cfg.lf||1)==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div><div class="pcard"><small>Pengingat waktu dengar</small><select style="margin-top:8px" onchange="cfg.rem=+this.value;ls.set('cfg',cfg);sess=0">${[[0,'Mati'],[1,'Setiap 1 jam'],[2,'Setiap 2 jam'],[3,'Setiap 3 jam']].map(s=>`<option value="${s[0]}" ${(cfg.rem||0)==s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>
<div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn g" onclick="bkExp()">Ekspor Cadangan</button><button class="btn g" onclick="$('#fbk').click()">Pulihkan</button></div>
<button class="btn g" onclick="if(confirm('Hapus semua lagu, playlist, dan pengaturan?')){try{indexedDB.deleteDatabase('ma')}catch(e){};Object.keys(localStorage).filter(k=>k.startsWith('ma_')).forEach(k=>localStorage.removeItem(k));location.reload()}">Kosongkan Semua Data</button><div class="ft"><span>ℹ</span><div>Tentang Midnight Acoustic<br><small>Versi 3.2.0</small></div></div>`)}
/* ===== Video YouTube (IFrame Player API) ===== */
let vbg=0,vids=ls.get('vids',[]),vq=[],vi=0,vres=null,ytp=null,ytReady=false,ytLoading=false;
const ytId=u=>{const m=u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);return m?m[1]:(/^[\w-]{11}$/.test(u)?u:null)};
const dec=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value};
const mkV=(id,title,artist)=>({id,yt:1,title:title||'Video YouTube',artist:artist||'YouTube',img:'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg'});
function loadYT(){if(ytLoading||ytp)return;ytLoading=true;var tag=document.createElement('script');tag.src="https://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag)}
var player;
function onYouTubeIframeAPIReady(){ytp=player=new YT.Player('player',{height:'100%',width:'100%',videoId:(vq[vi]&&vq[vi].id)||'M7lc1UVf-VE',playerVars:{playsinline:1,rel:0},events:{'onReady':onPlayerReady,'onStateChange':onPlayerStateChange,'onError':onPlayerError}})}
function onPlayerReady(e){ytReady=true;if(vq.length)e.target.loadVideoById(vq[vi].id)}
function onPlayerStateChange(e){if(e.data===1){A.pause();B.pause();vMeta()}else if(e.data===0&&vq.length>1)vNext(1);mvUi()}
function onPlayerError(){toast('Video ini tidak bisa disematkan di sini');if(vq.length>1)vNext(1)}
function stopV(){try{if(ytReady)ytp.pauseVideo()}catch(e){}}
function vMeta(){try{const d=ytp.getVideoData(),c=vq[vi];if(!c||!d||!d.title)return;c.title=d.title;if(d.author)c.artist=d.author;const s=vids.find(x=>x.id==c.id);if(s){s.title=c.title;s.artist=c.artist;ls.set('vids',vids)}vui()}catch(e){}}
function vui(){const c=vq[vi];$('#vtt').textContent=c?c.title:'Pilih video';$('#vch').textContent=c?c.artist:'Cari atau tempel link YouTube';const on=c&&vids.some(x=>x.id==c.id);$('#vsv').className=on?'on-c':'';$('#vsv').innerHTML=ic('heart',26,on)}
function vList(){$('#vr').innerHTML=vres?rows('vs',vres):(vids.length?'<div class="sec" style="margin-top:4px"><h3>Video Tersimpan</h3></div>'+rows('vd',vids):'<div class="em">Cari video atau tempel link YouTube.</div>')}
function openV(){vbg=0;mvUi();$('#vo').classList.add('on');loadYT();vui();vList()}
function ovc(){vbg=0;mvUi();$('#vo').classList.remove('on');stopV()}
function playV(list,i){vq=list;vi=i;A.pause();B.pause();openV();if(ytReady)ytp.loadVideoById(vq[vi].id)}
function vNext(d){if(!vq.length)return;vi=(vi+d+vq.length)%vq.length;if(ytReady)ytp.loadVideoById(vq[vi].id);vui()}
function vSave(){const c=vq[vi];if(!c)return;vids=vids.some(x=>x.id==c.id)?vids.filter(x=>x.id!=c.id):[{...c},...vids];ls.set('vids',vids);vui();if(!vres)vList();toast('Daftar video diperbarui')}
function delV(id){vids=vids.filter(x=>x.id!=id);ls.set('vids',vids);go(pg)}
function vAdd(id){let t=vids.find(x=>x.id==id);if(!t){t=mkV(id);vids.unshift(t);ls.set('vids',vids)}vres=null;lists.vd=vids;playV(vids,vids.indexOf(t));if(pg=='library')go(pg)}
async function ytSearch(s){const r=await fetch('/api/yt-search?q='+encodeURIComponent(s));if(!r.ok)throw 0;return (await r.json()).map(x=>mkV(x.id,x.title,x.artist))}
async function vGo(){const v=$('#vq').value.trim();if(!v)return;const id=ytId(v);if(id){vAdd(id);return}const r=$('#vr');
r.innerHTML='<div class="em">Mencari\u2026</div>';try{vres=await ytSearch(v);vList();if(!vres.length)r.innerHTML='<div class="em">Tidak ada hasil.</div>'}catch(e){r.innerHTML='<div class="em">Gagal mencari video. Pastikan server API aktif dan YOUTUBE_API_KEY sudah diatur.</div>'}}
function vFromSong(){if(!cur)return;clp();openV();$('#vq').value=cur.title+' '+cur.artist;vGo()}
/* ===== Rekomendasi SoundStat (lewat /api/soundstat, key ada di server) ===== */
const RC=[['now','Sekarang','time'],['happy','Bahagia','mood'],['sad','Sedih','mood'],['energetic','Semangat','mood'],['relaxed','Santai','mood'],['danceable','Dansa','mood'],['workout','Olahraga','activity'],['study','Belajar','activity'],['focus','Fokus','activity'],['sleep','Tidur','activity'],['party','Pesta','activity']];
let recSel='',recRes=null;
const tod=()=>{const h=new Date().getHours();return h<11?'morning':h<17?'afternoon':h<21?'evening':'night'};
function recHtml(){return recRes=='load'?'<div class="em">Mencari rekomendasi\u2026</div>':recRes=='err'?'<div class="em">Rekomendasi belum tersedia. Pastikan SOUNDSTAT_API_KEY sudah diatur di server.</div>':recRes?(recRes.length?recBar()+rows('sd',recRes):'<div class="em">Belum ada hasil untuk suasana ini.</div>'):'<div class="em">Pilih suasana untuk mendapat rekomendasi lagu.</div>'}
function rrec(){const el=$('#rec');if(!el)return;el.innerHTML=recHtml();document.querySelectorAll('.rcc').forEach(e=>e.classList.toggle('a',e.dataset.k==recSel))}
async function recGo(v,fresh){recSel=v;recRes='load';rrec();const c=RC.find(x=>x[0]==v);
try{const r=await fetch('/api/soundstat?type='+c[2]+'&value='+(v=='now'?tod():v)+(fresh?'&r='+Date.now():''));if(!r.ok)throw 0;recRes=(await r.json()).map(x=>({...x,rec:1,h:hh(x.title)}))}catch(e){recRes='err'}rrec();if(Array.isArray(recRes))prefRec(recRes)}
function prefRec(a){a.forEach(async t=>{if(await resolveRec(t))rrec();else rrec()})}
async function resolveRec(t){if(t.url)return true;if(t.nf)return false;try{const r=await fetch('/api/music?src=audius&q='+encodeURIComponent(t.title+' '+t.artist));const a=r.ok?await r.json():[];const k=x=>String(x).toLowerCase();const m=a.find(x=>k(x.title).includes(k(t.title)))||a[0];if(!m){t.nf=1;return false}t.url=m.url;t.img=t.img||m.img;return true}catch(e){return false}}
const recBar=()=>`<div style="display:flex;gap:8px;margin:8px 0"><button class="btn" onclick="recAll()">▶ Putar Semua</button><button class="btn g" onclick="recGo(recSel,1)">↻ Segarkan</button></div>`;
function recAll(){if(!Array.isArray(recRes)||!recRes.length)return;lists.sd=recRes;P('sd',0)}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}
/* ===== v2.4: volume/fade, statistik, Media Session ===== */
let rate=ls.get('rate',1),sf=1,slT=null,slEnd=0,fq=0,lastCt=0,lastSave=0,lastPos=0,lyI=-1;
A.defaultPlaybackRate=B.defaultPlaybackRate=rate;
function setVol(){const a=act;if(!a)return;let v=sf;const c=cfg.cf||0;if(c&&a.duration&&isFinite(a.duration)&&a.duration>c*3){const rem=a.duration-a.currentTime;v*=Math.min(1,Math.max(.12,a.currentTime/c),Math.max(0,rem/c))}a.volume=Math.max(0,Math.min(1,v))}
function stat(a){if(!cur||a.paused){lastCt=a.currentTime;return}const d=a.currentTime-lastCt;lastCt=a.currentTime;if(d>0&&d<2){stt.tot+=d;sess+=d;if(cfg.rem&&sess>=cfg.rem*3600){sess=0;toast('Sudah '+cfg.rem+' jam mendengar. Istirahat sebentar ya?')}cur._pt=(cur._pt||0)+d;
if(!cur._cn&&cur._pt>=20){cur._cn=1;const e=stt.pl[cur.id]||(stt.pl[cur.id]={n:0});e.n++;e.t=cur.title;e.a=cur.artist;e.i=cur.img||'';e.l=cur.loc?1:0;e.u=cur.loc?'':(cur.url||'');e.ts=[...(e.ts||[]),Date.now()].slice(-10);stt.ar[cur.artist]=(stt.ar[cur.artist]||0)+1;
const ks=Object.keys(stt.pl);if(ks.length>300){ks.sort((x,y)=>stt.pl[x].n-stt.pl[y].n).slice(0,60).forEach(k=>delete stt.pl[k])}}
if(Date.now()-lastSave>10000){lastSave=Date.now();ls.set('stt',stt);saveLast()}}}
document.addEventListener('visibilitychange',()=>{ls.set('stt',stt);saveLast()});
function goStat(){const e=Object.entries(stt.pl).sort((a,b)=>b[1].n-a[1].n).slice(0,5),ar=Object.entries(stt.ar).sort((a,b)=>b[1]-a[1]).slice(0,5),h=Math.floor(stt.tot/3600),m=Math.floor(stt.tot%3600/60);
sub(shd('Statistik Dengar')+`<div class="pcard" style="text-align:center"><small>Total waktu mendengar</small><h1 style="margin-top:4px">${h?h+' j ':''}${m} mnt</h1></div>`+(e.length?`<div class="sec"><h3>Lagu Terbanyak</h3></div>`+e.map((x,i)=>`<div class="rw" style="cursor:default"><b style="width:18px;color:var(--p2)">${i+1}</b><img src="${esc(cov({img:x[1].i,h:hh(x[1].t||'')}))}"><div><b>${esc(x[1].t)}</b><small>${esc(x[1].a)} · ${x[1].n}x diputar</small></div></div>`).join('')+`<div class="sec"><h3>Artis Terbanyak</h3></div>`+ar.map((x,i)=>`<div class="ft" style="cursor:default"><span style="color:var(--p2);font-weight:700">${i+1}</span><div>${esc(x[0])}<br><small>${x[1]}x diputar</small></div></div>`).join(''):'<div class="em">Belum ada data. Lagu dihitung setelah diputar minimal 20 detik.</div>')+`<button class="btn g" style="margin-top:16px" onclick="if(confirm('Reset statistik?')){stt={tot:0,pl:{},ar:{}};ls.set('stt',stt);goStat()}">Reset Statistik</button>`)}
function ms(){if(!('mediaSession' in navigator)||!cur)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:cur.title,artist:cur.artist,album:'Midnight Acoustic',artwork:cur.img?[{src:cur.img,sizes:'512x512'}]:[]})}catch(e){}}
function mst(x){try{if('mediaSession' in navigator)navigator.mediaSession.playbackState=x}catch(e){}}
function msPos(a){if(!('mediaSession' in navigator)||!navigator.mediaSession.setPositionState)return;const n=Date.now();if(n-lastPos<1000)return;lastPos=n;try{if(a.duration&&isFinite(a.duration))navigator.mediaSession.setPositionState({duration:a.duration,playbackRate:a.playbackRate||1,position:Math.min(a.currentTime,a.duration)})}catch(e){}}
(function(){if(!('mediaSession' in navigator))return;const h=(n,f)=>{try{navigator.mediaSession.setActionHandler(n,f)}catch(e){}};
h('play',()=>{act.play().catch(()=>{})});h('pause',()=>{act.pause()});h('previoustrack',()=>nxt(-1));h('nexttrack',()=>nxt(1));
h('seekto',d=>{if(d.seekTime!=null)act.currentTime=d.seekTime});h('seekbackward',d=>{act.currentTime=Math.max(0,act.currentTime-(d.seekOffset||10))});h('seekforward',d=>{act.currentTime+=d.seekOffset||10})})();
/* ===== Kecepatan putar & sleep timer ===== */
const RS=[.75,1,1.25,1.5,2];
function spd(){rate=RS[(RS.indexOf(rate)+1)%RS.length];A.defaultPlaybackRate=B.defaultPlaybackRate=rate;A.playbackRate=B.playbackRate=rate;ls.set('rate',rate);rp();toast('Kecepatan '+rate+'x')}
function goSl(){clp();const r=slEnd?Math.max(0,Math.round((slEnd-Date.now())/60000)):0;
sub(`<div class="hd"><button class="ib g" onclick="csp0();openP()">${ic('back')}</button><h3>Sleep Timer</h3><span style="width:38px"></span></div>${slEnd?`<div class="pcard" style="text-align:center"><small>Berhenti dalam ± ${r} menit</small></div>`:'<div class="em">Musik berhenti otomatis, volume mengecil pelan di 15 detik terakhir.</div>'}`+[15,30,60].map(m=>`<button class="btn g" style="margin-bottom:8px" onclick="slSet(${m})">${m} menit</button>`).join('')+(slEnd?`<button class="btn" onclick="slSet(0)">Matikan Timer</button>`:''))}
function slSet(m){clearInterval(slT);slT=null;sf=1;setVol();if(!m){slEnd=0;toast('Sleep timer dimatikan');goSl();return}slEnd=Date.now()+m*60000;slT=setInterval(slTick,1000);toast('Musik berhenti dalam '+m+' menit');goSl()}
function slTick(){const r=slEnd-Date.now();if(r<=0){clearInterval(slT);slT=null;slEnd=0;try{act.pause()}catch(e){}stopV();sf=1;setVol();rp();rn();toast('Sleep timer selesai');return}sf=r<15000?Math.max(.05,r/15000):1;setVol()}
/* ===== Antrean ===== */
function qAdd(k,i){const t=lists[k]&&lists[k][i];if(!t)return;if(t.yt){toast('Video tidak bisa masuk antrean musik');return}if(!cur){play([t],0);openP();return}q.push(t);toast('Masuk ke antrean')}
function goQ(){if(!q.length){toast('Antrean kosong');return}clp();
sub(`<div class="hd"><button class="ib g" onclick="csp0();openP()">${ic('back')}</button><h3>Antrean (${q.length})</h3><span style="width:38px"></span></div><button class="btn g" style="margin-bottom:8px" onclick="radio()">📻 Mulai Radio dari Lagu Ini</button><small style="display:block;margin-bottom:8px">Ketuk lagu untuk memutar · ⤒ putar berikutnya · ✕ hapus</small>`+q.map((t,i)=>`<div class="rw" data-qi="${i}" onclick="qGo(${i})"><span class="dh" data-d="${i}">⠿</span><img src="${esc(cov(t))}"><div><b style="${i==qi?'color:var(--p2)':''}">${i==qi?'♪ ':''}${esc(t.title)}</b><small>${esc(t.artist)}</small></div>${i==qi?'':`<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();qNx(${i})">⤒</button><button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();qDel(${i})">${ic('x',18)}</button>`}</div>`).join(''))}
function qGo(i){play(q,i);goQ()}
function qNx(i){const [t]=q.splice(i,1);if(i<qi)qi--;q.splice(qi+1,0,t);toast('Diputar berikutnya');goQ()}
function qDel(i){q.splice(i,1);if(i<qi)qi--;goQ()}
/* ===== Lirik otomatis (LRCLIB, tanpa key) ===== */
const ly2={},parseLrc=t=>t.split('\n').map(l=>{const m=l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);return m?[+m[1]*60+ +m[2],m[3].trim()]:null}).filter(Boolean);
async function fetchLy(t){const id=t.id;if(ly2[id])return;ly2[id]='load';
try{const p=new URLSearchParams({track_name:t.title});if(t.artist&&!['Lagu Saya','Link kustom','Tidak diketahui','YouTube'].includes(t.artist))p.set('artist_name',t.artist);
const r=await fetch('https://lrclib.net/api/search?'+p),a=r.ok?await r.json():[];const m=a.find(x=>x.syncedLyrics)||a.find(x=>x.plainLyrics);
ly2[id]=m?{syn:m.syncedLyrics?parseLrc(m.syncedLyrics):null,txt:m.plainLyrics||''}:'none'}catch(e){ly2[id]='none'}
if(cur&&cur.id==id&&(pm||krOn()))rp()}
function lyHtml(t,L,AL){const Pp=l=>`<p>${esc(l)||'&nbsp;'}</p>`;
if(L)return`<div class="lyr" data-ly="1">${L.split('\n').map(Pp).join('')}</div>`;
if(AL&&AL.syn&&AL.syn.length)return`<div class="lyr" data-ly="1">${AL.syn.map((x,i)=>`<p data-i="${i}" style="cursor:pointer" onclick="act.currentTime=${x[0]}">${esc(x[1])||'&nbsp;'}</p>`).join('')}</div><small style="display:block;text-align:center">Lirik dari LRCLIB · ketuk baris untuk melompat</small>`;
if(AL&&AL.txt)return`<div class="lyr" data-ly="1">${AL.txt.split('\n').map(Pp).join('')}</div><small style="display:block;text-align:center">Lirik dari LRCLIB</small>`;
return`<div class="lyr"><p style="color:var(--mu)">${AL=='load'?'Mencari lirik\u2026':'Belum ada lirik untuk lagu ini'}</p></div>`}
function syncLy(a){if(!pm||!cur||lyc[cur.id])return;const L=ly2[cur.id];if(!L||!L.syn)return;const t=a.currentTime;let i=-1;for(let k=0;k<L.syn.length;k++){if(L.syn[k][0]<=t)i=k;else break}
if(i==lyI)return;lyI=i;document.querySelectorAll('[data-ly] p').forEach(p=>p.classList.toggle('on',+p.dataset.i==i));document.querySelectorAll('[data-ly] p.on').forEach(e=>{const ov=e.closest('.ov');if(!ov||ov.classList.contains('on'))e.scrollIntoView({block:'center',behavior:'smooth'})})}
/* ===== Equalizer: preset tambahan & simpan preset sendiri ===== */
function eqPre(p){eq.pre=p;if(PR[p])eq.v=[...PR[p]];else if(p.startsWith('★ ')){const c=(eq.cust||{})[p.slice(2)];if(c){eq.v=[...c.v];eq.bass=c.bass;eq.treb=c.treb}}ap();sv();goEq()}
function eqSave(){const n=(prompt('Nama preset:')||'').trim().slice(0,20);if(!n)return;eq.cust=eq.cust||{};eq.cust[n]={v:[...eq.v],bass:eq.bass,treb:eq.treb};eq.pre='★ '+n;sv();toast('Preset disimpan');goEq()}
function eqDel(){const n=String(eq.pre).slice(2);if(eq.cust&&eq.cust[n]&&confirm('Hapus preset "'+n+'"?')){delete eq.cust[n];eq.pre='Custom';sv();goEq()}}
/* ===== Playlist: ekspor, impor, bagikan ===== */
const okU=u=>/^https?:\/\//i.test(String(u||''));
function cleanTr(a){return(Array.isArray(a)?a:[]).slice(0,300).map((t,i)=>{if(!t||typeof t!='object')return null;
if(t.loc&&t.id)return{id:String(t.id).slice(0,80),loc:1};
if(t.yt&&/^[\w-]{11}$/.test(t.id))return mkV(t.id,String(t.title||'').slice(0,200),String(t.artist||'').slice(0,100));
if(!okU(t.url))return null;const ti=String(t.title||'Tanpa judul').slice(0,200);
return{id:String(t.id||('x'+Date.now()+i)).slice(0,80),title:ti,artist:String(t.artist||'Tidak diketahui').slice(0,100),img:okU(t.img)?String(t.img).slice(0,500):'',url:String(t.url).slice(0,1000),h:hh(ti)}}).filter(Boolean)}
function plPlay(i){const a=pls[i].tr.map(rs).filter(Boolean);if(!a.length){toast('Playlist kosong');return}lists.pp=a;P('pp',0)}
function plExp(i){const p=pls[i],b=new Blob([JSON.stringify({app:'midnight-acoustic',v:1,name:p.n,tracks:p.tr})],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=p.n.replace(/[^\w\- ]+/g,'_')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Playlist diekspor')}
async function plShare(i){const p=pls[i],tr=p.tr.filter(t=>!t.loc).map(t=>t.yt?{id:t.id,yt:1,title:t.title,artist:t.artist}:{id:t.id,title:t.title,artist:t.artist,img:t.img||'',url:t.url}).filter(t=>t.yt||t.url);
if(!tr.length){toast('Lagu dari perangkat tidak bisa dibagikan lewat tautan');return}
const u=location.href.split('#')[0]+'#pl='+btoa(unescape(encodeURIComponent(JSON.stringify({name:p.n,tracks:tr}))));
if(u.length>8000){toast('Playlist terlalu panjang untuk tautan. Pakai Ekspor.');return}
try{if(navigator.share){await navigator.share({title:p.n,url:u});return}await navigator.clipboard.writeText(u);toast('Tautan disalin')}catch(e){toast('Gagal membagikan tautan')}}
function plImpData(o){if(!o||!Array.isArray(o.tracks)){toast('File playlist tidak valid');return}const tr=cleanTr(o.tracks);if(!tr.length){toast('Tidak ada lagu yang bisa diimpor');return}
pls.push({n:String(o.name||'Playlist impor').slice(0,60),tr});ls.set('pls',pls);toast('Playlist diimpor ('+tr.length+' lagu)');if(pg=='library')go(pg)}
function plImp(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{plImpData(JSON.parse(r.result))}catch(e){toast('File playlist tidak valid')}};r.readAsText(f)}
(function(){const m=location.hash.match(/^#pl=(.+)$/);if(!m)return;try{const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));history.replaceState(null,'',location.pathname+location.search);setTimeout(()=>{if(confirm('Impor playlist "'+String(o.name||'')+'" ('+(Array.isArray(o.tracks)?o.tracks.length:0)+' lagu)?'))plImpData(o)},400)}catch(e){}})();
/* ===== Trending Audius ===== */
const TG=['','Pop','Rock','Electronic','Hip-Hop/Rap','Jazz','Lo-Fi','Acoustic'];let tg='',trRes=null;
const trArr=()=>Array.isArray(trRes)?trRes.slice(0,15):[];
const tgChips=()=>TG.map(g=>`<span class="chip ${tg==g?'a':''}" onclick="trend('${g}')">${g||'Semua'}</span>`).join('');
const trBody=()=>trRes=='load'?'<div class="em">Memuat trending\u2026</div>':trRes=='err'?'<div class="em">Trending belum tersedia. Periksa koneksi dan AUDIUS_API_KEY di server.</div>':rows('tr',trArr());
const trCards=()=>trRes=='load'||!trRes?'<div class="em" style="padding:12px">Memuat\u2026</div>':trRes=='err'?'<div class="em" style="padding:12px">Trending belum tersedia.</div>':(lists.tr=trArr()).slice(0,10).map((t,i)=>`<div class="cd" onclick="P('tr',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('');
function rtr(){const a=$('#tr'),b=$('#trh'),c=$('#tgc');if(a)a.innerHTML=trBody();if(b)b.innerHTML=trCards();if(c)c.innerHTML=tgChips()}
async function trend(g){tg=g;trRes='load';rtr();try{const r=await fetch('/api/music?src=audius&trending=1&genre='+encodeURIComponent(g));if(!r.ok)throw 0;trRes=(await r.json()).map(x=>({...x,h:hh(x.title)}))}catch(e){trRes='err'}rtr()}
/* ===== Mode audio untuk video YouTube ===== */
function mvUi(){const m=$('#mv');if(!m)return;const c=vq[vi];m.classList.toggle('on',!!(vbg&&c));if(c)$('#mvt').textContent=c.title;let pl=0;try{pl=ytReady&&ytp.getPlayerState()==1}catch(e){}$('#mvp').innerHTML=ic(pl?'pause':'play',20,1)}
function vBg(){if(!vq.length){toast('Pilih video dulu');return}$('#vo').classList.remove('on');vbg=1;mvUi();toast('Mode audio: video tetap diputar')}
function vTog(){try{ytp.getPlayerState()==1?ytp.pauseVideo():ytp.playVideo()}catch(e){}setTimeout(mvUi,400)}
function vBack(){openV()}
function vOff(){stopV();vbg=0;mvUi()}
/* ===== PWA ===== */
const hadC=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{const ask=w=>{if($('.upd'))return;const d=document.createElement('div');d.className='upd';d.textContent='Versi baru tersedia · ketuk untuk update';d.onclick=()=>{d.remove();w.postMessage('skip')};$('#app').appendChild(d)};if(r.waiting&&hadC)ask(r.waiting);r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state=='installed'&&navigator.serviceWorker.controller)ask(w)})})}).catch(()=>{}));let rl=0;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadC&&!rl){rl=1;location.reload()}})}

/* ===== v2.5 ===== */
let sess=0,ab={a:null,b:null},preU='';const pre=new Audio();pre.preload='auto';
const arrOf=x=>Array.isArray(x)?x:[];
/* Lanjutkan terakhir diputar */
function saveLast(){if(cur)ls.set('last',{t:svt(cur),pos:act.currentTime||0})}
function rsmCard(){if(cur)return'';const l=ls.get('last',null);if(!l||!l.t||!(l.pos>=5))return'';const t=rs(l.t);if(!t)return'';return`<div class="pcard" onclick="resume()" style="cursor:pointer;display:flex;gap:12px;align-items:center"><img src="${esc(cov(t))}" style="width:46px;height:46px;border-radius:12px;object-fit:cover"><div style="flex:1;min-width:0"><small>Lanjutkan</small><b style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.title)}</b><small>${f2(l.pos)}</small></div>${ic('play',22,1)}</div>`}
function resume(){const l=ls.get('last',null);if(!l)return;const t=rs(l.t);if(!t)return;play([t],0);openP();const a=act,p=l.pos;a.addEventListener('loadedmetadata',()=>{a.currentTime=p},{once:true})}
/* Library: cari & urutkan, edit info, baca tag */
let lsq='',lso='new';
const sgList=()=>{let a=sg();const k=lsq.trim().toLowerCase();if(k)a=a.filter(s=>(s.title+' '+s.artist).toLowerCase().includes(k));if(lso=='az')a.sort((x,y)=>x.title.localeCompare(y.title));else if(lso=='ar')a.sort((x,y)=>x.artist.localeCompare(y.artist));return a};
function rsgl(){const e=$('#sgl');if(!e)return;const a=sgList();e.innerHTML=a.length?rows('sg',a,1):'<div class="em">Tidak ada hasil.</div>'}
const lsBar=()=>songs.length?`<div class="srch" style="margin:12px 0 0;height:40px">${ic('search',16)}<input placeholder="Cari di Library\u2026" value="${esc(lsq)}" oninput="lsq=this.value;rsgl()"></div><div class="chips">${[['new','Terbaru'],['az','Judul A-Z'],['ar','Artis']].map(x=>`<span class="chip ${lso==x[0]?'a':''}" onclick="lso='${x[0]}';go('library')">${x[1]}</span>`).join('')}<span class="chip" onclick="reTag()">Baca Tag</span></div>`:''
let edImg=null;
function edS(id){const s=songs.find(x=>x.id==id);if(!s)return;edImg=s.img||null;sub(`${shd('Edit Lagu')}<input class="in" id="et" value="${esc(s.title)}" placeholder="Judul"><div style="height:8px"></div><input class="in" id="ea" value="${esc(s.artist)}" placeholder="Artis"><img id="ei" src="${esc(cov(s))}" style="width:90px;height:90px;border-radius:16px;object-fit:cover;display:block;margin:14px auto"><button class="btn g" onclick="$('#efi').click()">Pilih Cover</button><input type="file" id="efi" accept="image/*" hidden onchange="edPick(this.files[0])"><button class="btn" style="margin-top:12px" onclick="edSave('${esc(id)}')">Simpan</button>`)}
async function edPick(f){if(!f)return;const d=await shrink(f);if(d){edImg=d;$('#ei').src=d}}
async function edSave(id){const s=songs.find(x=>x.id==id);if(!s)return;s.title=($('#et').value.trim()||s.title).slice(0,200);s.artist=($('#ea').value.trim()||s.artist).slice(0,100);if(edImg)s.img=edImg;s.h=hh(s.title);s.ed=1;try{await tx('readwrite',o=>o.put(s))}catch(e){}if(cur&&cur.id==id)ms();toast('Info lagu disimpan');csp()}
const shrink=async b=>{try{const bm=await createImageBitmap(b),sc=Math.min(1,320/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bm.width*sc));c.height=Math.max(1,Math.round(bm.height*sc));c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.82)}catch(e){return''}};
/* Tag ID3 (judul, artis, cover) dari file MP3 */
async function id3(f){const o={};try{const hd=new Uint8Array(await f.slice(0,10).arrayBuffer());if(String.fromCharCode(hd[0],hd[1],hd[2])!='ID3')return o;const ver=hd[3],sz=((hd[6]&127)<<21)|((hd[7]&127)<<14)|((hd[8]&127)<<7)|(hd[9]&127);if(sz<=0||sz>8e6)return o;
const b=new Uint8Array(await f.slice(10,10+sz).arrayBuffer()),dv=new DataView(b.buffer),v2=ver==2,hl=v2?6:10;let p=0;
const dec=(a,e)=>{try{return new TextDecoder(['iso-8859-1','utf-16','utf-16be','utf-8'][e]||'utf-8').decode(a).replace(/\0+$/,'').replace(/^\uFEFF/,'')}catch(x){return''}};
while(p+hl<=b.length){const id=String.fromCharCode(...b.slice(p,p+(v2?3:4)));if(!/^[A-Z0-9]+$/.test(id))break;
const fs=v2?(b[p+3]<<16|b[p+4]<<8|b[p+5]):(ver==4?((b[p+4]&127)<<21|(b[p+5]&127)<<14|(b[p+6]&127)<<7|(b[p+7]&127)):dv.getUint32(p+4));
const d=b.slice(p+hl,p+hl+fs);p+=hl+fs;if(!d.length)continue;
if(id=='TIT2'||id=='TT2')o.title=dec(d.slice(1),d[0]);else if(id=='TPE1'||id=='TP1')o.artist=dec(d.slice(1),d[0]);
else if((id=='APIC'||id=='PIC')&&!o.raw){let i,mime;if(v2){mime='image/'+String.fromCharCode(...d.slice(1,4)).toLowerCase();i=4}else{let e=1;while(e<d.length&&d[e])e++;mime=String.fromCharCode(...d.slice(1,e));i=e+1}
i++;const enc=d[0];if(enc==1||enc==2){while(i+1<d.length&&(d[i]||d[i+1]))i+=2;i+=2}else{while(i<d.length&&d[i])i++;i++}
o.raw=new Blob([d.slice(i)],{type:mime.includes('/')?mime:'image/jpeg'})}}
if(o.raw){o.img=await shrink(o.raw);delete o.raw}}catch(e){}return o}
async function reTag(){if(!songs.length||!confirm('Baca ulang tag ID3 semua lagu? Judul dan artis yang belum kamu edit sendiri akan diganti jika tag tersedia.'))return;let n=0;
for(const s of songs){if(!s.loc||s.off||s.ed)continue;const m=await id3(s.blob);let ch=0;if(m.title&&m.title.trim()){s.title=m.title.trim();ch=1}if(m.artist&&m.artist.trim()){s.artist=m.artist.trim();ch=1}if(m.img&&!s.img){s.img=m.img;ch=1}if(ch){s.h=hh(s.title);n++;try{await tx('readwrite',o=>o.put(s))}catch(e){}}}
toast(n?n+' lagu diperbarui dari tag':'Tidak ada tag yang bisa dibaca');go(pg)}
/* Playlist otomatis */
const wk=()=>Date.now()-7*864e5;
const smTr=(e,id)=>e.l?songs.find(s=>s.id==id):(e.u?{id,title:e.t,artist:e.a,img:e.i,url:e.u,h:hh(e.t||'')}:null);
function smart(k){if(k=='new')return sg().slice(0,30);const en=Object.entries(stt.pl);let a;
if(k=='top')a=en.sort((x,y)=>y[1].n-x[1].n).map(x=>[x[0],x[1]]);else a=en.map(([id,e])=>[id,e,arrOf(e.ts).filter(t=>t>wk()).length]).filter(x=>x[2]>0).sort((x,y)=>y[2]-x[2]);
return a.slice(0,30).map(x=>smTr(x[1],x[0])).filter(Boolean)}
const SMT={top:'Paling Sering Diputar','new':'Baru Ditambahkan',wk:'Favorit Minggu Ini'};
const smBlock=()=>`<div class="sec"><h3>Otomatis</h3></div>`+Object.keys(SMT).map(k=>`<div class="ft" onclick="openSm('${k}')"><span>✨</span><div>${SMT[k]}</div></div>`).join('');
function openSm(k){const a=smart(k);sub(shd(SMT[k])+(a.length?`<button class="btn" style="margin-bottom:10px" onclick="lists.sm=smart('${k}');P('sm',0)">▶ Putar Semua</button>`+rows('sm',a):'<div class="em">Belum ada data. Putar beberapa lagu dulu (minimal 20 detik per lagu).</div>'))}
/* Gestur di pemutar */
(function(){const p=$('#pl');let x0=0,y0=0,ok=0;p.addEventListener('touchstart',e=>{const t=e.touches[0];x0=t.clientX;y0=t.clientY;ok=!e.target.closest('input,textarea,.lyr,.eqs,button,select')},{passive:true});
p.addEventListener('touchend',e=>{if(!ok||!cur)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;if(Math.abs(dx)>70&&Math.abs(dy)<60)nxt(dx<0?1:-1);else if(dy>120&&Math.abs(dx)<60&&p.scrollTop<=0)clp()},{passive:true})})();
/* Warna tema dari cover */
const thc={};
async function thm(t){let hu=thc[t.id];if(hu==null){hu=t.h!=null?t.h:hh(t.title||'');if(t.img){try{const im=new Image();im.crossOrigin='anonymous';await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=t.img});const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.drawImage(im,0,0,16,16);const d=x.getImageData(0,0,16,16).data;let R=0,G=0,B=0,n=0;
for(let i=0;i<d.length;i+=4){if(Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])>40){R+=d[i];G+=d[i+1];B+=d[i+2];n++}}
if(n){R/=n;G/=n;B/=n;const mx=Math.max(R,G,B),dd=mx-Math.min(R,G,B);let h=dd?(mx==R?((G-B)/dd)%6:mx==G?(B-R)/dd+2:(R-G)/dd+4)*60:hu;if(h<0)h+=360;hu=h}}catch(e){}}thc[t.id]=hu}
if(cur&&cur.id!=t.id)return;const dk=document.documentElement.dataset.t=='dark',p=$('#pl');p.style.setProperty('--o1',`hsl(${hu},70%,${dk?32:78}%)`);p.style.setProperty('--o2',`hsl(${(hu+50)%360},65%,${dk?30:80}%)`)}
/* Ulang A-B, loop, preload lagu berikutnya */
function abT(){if(!cur)return;if(ab.a==null){ab.a=act.currentTime;toast('Titik A diset. Ketuk lagi untuk titik B')}else if(ab.b==null){if(act.currentTime<=ab.a+1){toast('Titik B harus setelah titik A');return}ab.b=act.currentTime;toast('Mengulang bagian A-B')}else{ab={a:null,b:null};toast('Ulang A-B dimatikan')}rp()}
function abLoop(a){if(ab.b!=null&&a.currentTime>=ab.b)a.currentTime=ab.a}
function prel(a){if(!cur||!a.duration||!isFinite(a.duration)||a.duration-a.currentTime>20||shuf||rep==2)return;const ni=qi<q.length-1?qi+1:(rep==1?0:-1);if(ni<0)return;const n=q[ni];if(!n)return;if(n.rec&&!n.url){resolveRec(n);return}if(n.url&&n.url!=preU){preU=n.url;pre.src=n.url;try{pre.load()}catch(e){}}}
/* Lirik layar penuh */
const krOn=()=>$('#kr').classList.contains('on');
function openKr(){if(!cur)return;$('#kr').classList.add('on');krRender()}
function krClose(){$('#kr').classList.remove('on')}
function krRender(){const t=cur;if(!t)return;const L=lyc[t.id];if(!L)fetchLy(t);const AL=ly2[t.id],p=!act.paused;lyI=-1;
$('#kr').innerHTML=`<div class="hd"><button class="ib g" onclick="krClose()">${ic('x')}</button><div style="text-align:center;min-width:0"><b style="display:block;font-size:13px">${esc(t.title)}</b><small>${esc(t.artist)}</small></div><span style="width:38px"></span></div>${lyHtml(t,L,AL)}<div class="ctl"><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button></div>`}
/* Radio dari lagu */
async function radio(){if(!cur)return;const s=cur;toast('Menyiapkan radio\u2026');
try{const g=async u=>{try{const r=await fetch(u);return arrOf(r.ok?await r.json():[])}catch(e){return[]}};
const [a,b,c]=await Promise.all([g('/api/music?src=audius&q='+encodeURIComponent(s.artist)),g('/api/music?src=audius&q='+encodeURIComponent(s.title)),g('/api/soundstat?type=time&value='+tod())]);
const seen=new Set([s.id]);const l=[...a,...b].filter(x=>x&&!seen.has(x.id)&&seen.add(x.id)).map(x=>({...x,h:hh(x.title)}));
const mix=[...l.sort(()=>Math.random()-.5).slice(0,20),...c.slice(0,5).map(x=>({...x,rec:1,h:hh(x.title)}))].sort(()=>Math.random()-.5);
if(!mix.length){toast('Belum ada lagu serupa');return}if(cur!==s)return;q=[s,...mix];qi=0;toast('Radio: '+mix.length+' lagu ditambahkan');goQ()}catch(e){toast('Gagal menyiapkan radio')}}
/* Simpan offline (hanya lagu Audius yang diizinkan artisnya) */
async function dlOff(t){const id='o'+t.id;if(songs.some(s=>s.id==id)){toast('Lagu ini sudah tersimpan offline');return}if(!confirm('Simpan "'+t.title+'" ke perangkat untuk didengar offline? Artis lagu ini mengizinkan unduhan.'))return;toast('Mengunduh\u2026');
try{const r=await fetch('https://api.audius.co/v1/tracks/'+t.id.slice(1)+'/download?app_name=MidnightAcoustic');if(!r.ok)throw 0;const bl=await r.blob();if(!bl.size)throw 0;let img='';try{if(t.img)img=await shrink(await(await fetch(t.img)).blob())}catch(e){}
const s={id,loc:1,blob:new Blob([bl],{type:'audio/mpeg'}),title:t.title,artist:t.artist,img,h:hh(t.title),added:Date.now(),off:1};await tx('readwrite',o=>o.put(s));songs.push(s);toast('Tersimpan di Library > Lagu');if(pg=='library')go(pg)}catch(e){toast('Gagal mengunduh lagu ini')}}
/* Cadangan data */
const BK=['favs','pls','hist','ly','cfg','eq','stt','vids','rate'];
function bkExp(){ls.set('lbk',Date.now());const d={};BK.forEach(k=>{const v=ls.get(k,null);if(v!=null)d[k]=v});const b=new Blob([JSON.stringify({app:'midnight-acoustic-backup',v:1,at:Date.now(),data:d})],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='midnight-acoustic-cadangan.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Cadangan diekspor')}
const cl=n=>Math.max(-12,Math.min(12,+n||0)),okI=u=>okU(u)||/^data:image\//.test(String(u||''));
function bkImp(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||o.app!='midnight-acoustic-backup'||!o.data||typeof o.data!='object')throw 0;const d=o.data;
if(!confirm('Pulihkan cadangan? Data saat ini akan diganti (lagu dari perangkat tidak ikut dicadangkan).'))return;
ls.set('favs',cleanTr(d.favs));ls.set('pls',arrOf(d.pls).slice(0,100).map(p=>({n:String(p&&p.n||'Playlist').slice(0,60),tr:cleanTr(p&&p.tr)})));ls.set('hist',cleanTr(d.hist).slice(0,12));ls.set('vids',cleanTr(d.vids));
const ly={};if(d.ly&&typeof d.ly=='object')Object.entries(d.ly).slice(0,500).forEach(([k,v])=>{ly[String(k).slice(0,80)]=String(v).slice(0,20000)});ls.set('ly',ly);
const c=d.cfg||{};ls.set('cfg',{src:SRCS.includes(c.src)?c.src:'all',prem:!!c.prem,name:String(c.name||'').slice(0,40),theme:['auto','dark','light'].includes(c.theme)?c.theme:'auto',cf:[3,6,10].includes(+c.cf)?+c.cf:0,rem:[1,2,3].includes(+c.rem)?+c.rem:0});
const e=d.eq||{},v6=x=>Array.isArray(x)&&x.length==6?x.map(cl):[0,0,0,0,0,0],cu={};if(e.cust&&typeof e.cust=='object')Object.entries(e.cust).slice(0,30).forEach(([k,x])=>{if(x)cu[String(k).slice(0,20)]={v:v6(x.v),bass:cl(x.bass),treb:cl(x.treb)}});
ls.set('eq',{on:e.on!==false,v:v6(e.v),bass:cl(e.bass),treb:cl(e.treb),pre:String(e.pre||'Flat').slice(0,30),cust:cu});
const s=d.stt||{},st={tot:Math.max(0,+s.tot||0),pl:{},ar:{}};if(s.pl&&typeof s.pl=='object')Object.entries(s.pl).slice(0,300).forEach(([k,x])=>{if(x)st.pl[String(k).slice(0,80)]={n:Math.max(0,+x.n||0),t:String(x.t||'').slice(0,200),a:String(x.a||'').slice(0,100),i:okI(x.i)?String(x.i).slice(0,200000):'',l:x.l?1:0,u:okU(x.u)?String(x.u).slice(0,1000):'',ts:arrOf(x.ts).slice(-10).map(Number).filter(isFinite)}});
if(s.ar&&typeof s.ar=='object')Object.entries(s.ar).slice(0,300).forEach(([k,x])=>{st.ar[String(k).slice(0,100)]=Math.max(0,+x||0)});ls.set('stt',st);
ls.set('rate',RS.includes(+d.rate)?+d.rate:1);toast('Cadangan dipulihkan');setTimeout(()=>location.reload(),700)}catch(err){toast('File cadangan tidak valid')}};r.readAsText(f)}

th();go('home');

/* ===== v2.6 ===== */
const lfA=()=>document.documentElement.style.setProperty('--lf',cfg.lf||1);lfA();
/* Antrean: seret untuk mengurutkan */
(function(){let from=-1,to=-1;const m=e=>{const el=document.elementFromPoint(e.clientX,e.clientY),r=el&&el.closest('[data-qi]');document.querySelectorAll('.dt').forEach(x=>x.classList.remove('dt'));if(r){to=+r.dataset.qi;r.classList.add('dt')}};
document.addEventListener('pointerdown',e=>{const h=e.target.closest('.dh');if(!h)return;e.stopPropagation();from=to=+h.dataset.d;h.setPointerCapture&&h.setPointerCapture(e.pointerId);h.parentNode.classList.add('dg')});
document.addEventListener('pointermove',e=>{if(from>=0){e.preventDefault();m(e)}},{passive:false});
const end=()=>{if(from<0)return;const c=q[qi];if(to!==from&&q[to]){const[t]=q.splice(from,1);q.splice(to,0,t);qi=q.indexOf(c)}from=-1;goQ()};
document.addEventListener('pointerup',end);document.addEventListener('pointercancel',()=>{from=-1;goQ()});
document.addEventListener('click',e=>{if(e.target.closest('.dh'))e.stopPropagation()},true)})();
/* Kartu bagikan lagu */
async function shareCard(){const t=cur;if(!t){toast('Putar lagu dulu');return}toast('Membuat kartu\u2026');
const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d'),h=t.h!=null?t.h:hh(t.title||''),g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,`hsl(${h},60%,30%)`);g.addColorStop(1,'#070a1f');x.fillStyle=g;x.fillRect(0,0,1080,1350);
try{const im=new Image();im.crossOrigin='anonymous';await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=cov(t)});x.save();x.beginPath();x.roundRect?x.roundRect(140,150,800,800,48):x.rect(140,150,800,800);x.clip();x.drawImage(im,140,150,800,800);x.restore()}catch(e){}
x.fillStyle='#fff';x.textAlign='center';x.font='700 56px Sora,system-ui,sans-serif';x.fillText(String(t.title).slice(0,28),540,1060);x.fillStyle='rgba(255,255,255,.7)';x.font='400 38px Sora,system-ui,sans-serif';x.fillText(String(t.artist).slice(0,34),540,1125);x.font='700 28px Sora,system-ui,sans-serif';x.fillStyle='rgba(255,255,255,.45)';x.fillText('MIDNIGHT ACOUSTIC',540,1270);
let b;try{b=await new Promise((r,j)=>c.toBlob(o=>o?r(o):j(),'image/png'))}catch(e){toast('Kartu gagal dibuat');return}
const f=new File([b],'kartu-lagu.png',{type:'image/png'});
try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:t.title});return}}catch(e){if(e&&e.name=='AbortError')return}
const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kartu-lagu.png';a.click();toast('Kartu tersimpan')}

/* ===== v3.0.0 ===== */
if(!SRCS.includes(cfg.src)){cfg.src='all';ls.set('cfg',cfg)}
/* Notifikasi gaya iPhone (banner dari atas, geser ke atas untuk menutup) */
let tLast=0,tMsg='',tQ=0;
function toast(m){if(cfg.nt===0)return;const n=Date.now();if(m===tMsg&&n-tLast<6000)return;if(n-tLast<1800){clearTimeout(tQ);tQ=setTimeout(()=>toast(m),1800-(n-tLast)+30);return}tMsg=m;tLast=n;const t=$('#toast');t.innerHTML='<img src="icon-192.png" alt=""><div><b>Midnight Acoustic</b><span>'+esc(m)+'</span></div><small>sekarang</small>';t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)}
(function(){const t=$('#toast');let y0=0;t.addEventListener('touchstart',e=>{y0=e.touches[0].clientY},{passive:true});t.addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-y0<-18){clearTimeout(tt);t.classList.remove('on')}},{passive:true})})();


/* ===== v2.7 ===== */
const ecoA=()=>{document.documentElement.classList.toggle('eco',!!cfg.eco);if(window._cm)nvA()};ecoA();
/* 1. Crossfade: lagu berikutnya masuk halus, lagu lama memudar */
function xf(){const a=act,c=cfg.cf||0;if(!c||!cur||cur._xf||a.paused||!a.src||rep==2||ab.b!=null||!a.duration||!isFinite(a.duration)||a.duration<c*3)return;const rem=a.duration-a.currentTime;if(rem>c||rem<.5||!(qi<q.length-1||rep==1||shuf))return;cur._xf=1;const g=new Audio(a.src);g.currentTime=a.currentTime;g.volume=a.volume;g.play().catch(()=>{});const v0=g.volume,t0=Date.now(),d=rem*1000,i=setInterval(()=>{const k=1-(Date.now()-t0)/d;if(k<=0||g.ended){clearInterval(i);g.pause();return}g.volume=Math.max(0,v0*k)},100);nxt(1)}
/* 2. Getaran halus */
const hp=n=>{if(cfg.hp!==0&&navigator.vibrate)try{navigator.vibrate(n)}catch(e){}};
document.addEventListener('click',e=>{if(e.target.closest('.pbtn,.ib,.btn,.act button,.ctl button,.nav button,.chip,.sw'))hp(8)},true);
/* 3. Geser baris lagu: kanan = putar berikutnya, kiri = tambah ke antrean */
(function(){let el,x0,y0,dx=0,on=0,sT=0;const gt=r=>{const m=/P\('(\w+)',(\d+)\)/.exec(r.getAttribute('onclick')||'');return m&&lists[m[1]]&&lists[m[1]][+m[2]]};
document.addEventListener('touchstart',e=>{el=e.target.closest('.rw');if(!el||el.dataset.qi!=null||e.target.closest('button,.dh')){el=null;return}const t=e.touches[0];x0=t.clientX;y0=t.clientY;dx=0;on=0},{passive:true});
document.addEventListener('touchmove',e=>{if(!el)return;const t=e.touches[0];dx=t.clientX-x0;if(!on&&Math.abs(t.clientY-y0)>Math.abs(dx)){el=null;return}if(Math.abs(dx)>12){on=1;el.style.transition='none';el.style.transform=`translate3d(${dx/2.2}px,0,0)`}},{passive:true});
document.addEventListener('touchend',()=>{if(!el)return;const r=el;r.style.transition='transform .25s';r.style.transform='';if(on){sT=Date.now();if(Math.abs(dx)>80){const t=gt(r);if(t&&!t.yt&&!(t.rec&&!t.url)){hp(15);if(!cur)play([t],0);else{q.splice(dx>0?qi+1:q.length,0,t);toast(dx>0?'Diputar berikutnya':'Ditambah ke antrean')}}else toast('Tidak bisa ditambah ke antrean')}}el=null},{passive:true});
document.addEventListener('click',e=>{if(Date.now()-sT<400){e.stopPropagation();e.preventDefault()}},true)})();
/* 4. Mini player melayang */
(function(){const m=document.createElement('div');m.id='mp';m.innerHTML='<img alt=""><div><b></b><small></small></div><button class="ib"></button><i></i>';$('#app').appendChild(m);
m.onclick=e=>{if(e.target.closest('button'))toggle();else openP()};
window.mpU=()=>{const s=!!cur&&!cur.yt&&!$('#pl').classList.contains('on');m.classList.toggle('on',s);$('#app').classList.toggle('hmp',s);if(!cur)return;m.querySelector('img').src=cov(cur);m.querySelector('b').textContent=cur.title;m.querySelector('small').textContent=cur.artist;m.querySelector('button').innerHTML=ic(act.paused?'play':'pause',20,1)};
setInterval(()=>{if(m.classList.contains('on')&&act.duration)m.querySelector('i').style.transform='scaleX('+act.currentTime/act.duration+')'},500);
const o=rn,op=openP,cp=clp;rn=function(){o();mpU()};openP=function(){op();mpU()};clp=function(){cp();mpU()};
[A,B].forEach(a=>{a.addEventListener('play',()=>{mpU();$('#app').classList.add('pl')});a.addEventListener('pause',()=>{mpU();$('#app').classList.remove('pl')})})})();
/* 5. Warna aplikasi mengikuti cover */
const _thm=thm;thm=async function(t){await _thm(t);if(cfg.dyn===0||(cur&&cur.id!=t.id))return;const hu=thc[t.id];if(hu==null)return;const a=$('#app').style,p=$('#pl').style;a.setProperty('--p',`hsl(${hu},85%,64%)`);a.setProperty('--p2',`hsl(${hu},90%,78%)`);a.setProperty('--g',`linear-gradient(135deg,hsl(${hu},85%,62%),hsl(${(hu+40)%360},80%,58%))`);['--o1','--o2'].forEach(k=>a.setProperty(k,p.getPropertyValue(k)))};
/* 10. Onboarding */
(function(){if(ls.get('ob',0))return;const S=[['🎧','Putar apa saja','Cari lagu di Explore, atau tempel link YouTube di Tonton Video.'],['📂','Tambah dari perangkat','Di Library ketuk Tambah Lagu. Lagumu tersimpan di HP dan bisa diputar offline.'],['🎨','Atur gayamu','Pilih mode terang/gelap, ukuran lirik, dan mode hemat baterai di Profil, lalu Pengaturan.']];let i=0;const o=document.createElement('div');o.id='ob';$('#app').appendChild(o);
const end=()=>{ls.set('ob',1);o.classList.add('x');setTimeout(()=>o.remove(),400)};
const r=()=>{const s=S[i];o.innerHTML=`<div class="obc"><div class="obe">${s[0]}</div><h2>${s[1]}</h2><p>${s[2]}</p><div class="obd">${S.map((_,k)=>`<span class="${k==i?'a':''}"></span>`).join('')}</div><button class="btn" id="obn">${i<2?'Lanjut':'Mulai'}</button><a id="obs">Lewati</a></div>`;$('#obn').onclick=()=>{if(i<2){i++;r()}else end()};$('#obs').onclick=end};r()})();


/* ===== v2.8 ===== */
/* 1. Autoplay serupa */
async function autoRadio(){if(cfg.ap===0||!cur||cur.yt||cur.loc)return;const s=cur;try{const r=await fetch('/api/music?src=audius&q='+encodeURIComponent(s.artist));const a=arrOf(r.ok?await r.json():[]).filter(x=>x&&x.id!=s.id).map(x=>({...x,h:hh(x.title)}));if(!a.length||cur!==s)return;a.sort(()=>Math.random()-.5);toast('Autoplay: lagu serupa');play(a.slice(0,15),0)}catch(e){}}
/* 2. Mix Harian */
const mixL=()=>{const seen=new Set(),o=[];[...favs,...hist,...smart('top')].forEach(x=>{const t=rs(x);if(t&&!t.yt&&(t.loc||t.url)&&!seen.has(t.id)){seen.add(t.id);o.push(t)}});let s=+new Date().toISOString().slice(0,10).replace(/-/g,'')%9973;return o.map(t=>[(s=(s*9301+49297)%233280),t]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]).slice(0,20)};
const mixCard=()=>{const n=mixL().length;return n<3?'':`<div class="pcard" onclick="lists.mx=mixL();play(lists.mx,0);openP()" style="cursor:pointer;display:flex;gap:12px;align-items:center"><div class="mxi">✨</div><div><b>Mix Harian</b><br><small>${n} lagu dari favorit dan riwayatmu</small></div></div>`};
const _hm=V.home;V.home=function(){return _hm.call(V).replace('<div class="sec"><h3>Rekomendasi Suasana</h3>',mixCard()+'<div class="sec"><h3>Rekomendasi Suasana</h3>')};
/* 3. Pencarian suara */
function vSr(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Pencarian suara belum didukung browser ini');return}const r=new R();r.lang='id-ID';r.onresult=e=>{const v=e.results[0][0].transcript,i=$('#qi');if(i)i.value=v;onS(v)};r.onerror=()=>toast('Suara tidak terdengar');r.start();toast('Silakan bicara\u2026')}
/* 4. Warna aksen manual */
function acA(){const a=$('#app').style;if(cfg.ac){const h=cfg.ac;a.setProperty('--p',`hsl(${h},85%,62%)`);a.setProperty('--p2',`hsl(${h},90%,76%)`);a.setProperty('--g',`linear-gradient(135deg,hsl(${h},85%,60%),hsl(${(h+40)%360},80%,56%))`)}else['--p','--p2','--g'].forEach(k=>a.removeProperty(k))}
const _th2=thm;thm=async function(t){await _th2(t);if(cfg.ac){acA();return}try{if(cur&&cur.id!=t.id)return;const im=new Image();im.crossOrigin='anonymous';await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=cov(t)});const c=document.createElement('canvas');c.width=c.height=24;c.getContext('2d').drawImage(im,0,0,24,24);$('#pl').style.setProperty('--cv',`url(${c.toDataURL()})`)}catch(e){$('#pl').style.removeProperty('--cv')}};
acA();
/* 5. Mode berkendara */
(function(){const d=document.createElement('div');d.id='dr';d.className='ov';d.style.zIndex=40;$('#app').appendChild(d);
window.drU=()=>{if(!cur)return;d.innerHTML=`<div class="hd"><button class="ib g" onclick="$('#dr').classList.remove('on')">${ic('x')}</button><h3>Mode Berkendara</h3><span style="width:38px"></span></div><img class="drc" src="${esc(cov(cur))}"><h1 class="drt">${esc(cur.title)}</h1><p class="pa">${esc(cur.artist)}</p><div class="drb"><button onclick="nxt(-1)">⏮</button><button class="dp" onclick="toggle()">${act.paused?'▶':'⏸'}</button><button onclick="nxt(1)">⏭</button></div>`};
window.drOpen=()=>{if(!cur){toast('Putar lagu dulu');return}d.classList.add('on');d.dataset.k='';drU()};
setInterval(()=>{if(d.classList.contains('on')&&cur){const k=cur.id+'|'+act.paused;if(d.dataset.k!=k){d.dataset.k=k;drU()}}},500)})();
/* 6. Wrapped */
async function cvShare(c,n){const b=await new Promise(r=>c.toBlob(r,'image/png'));if(!b){toast('Gagal membuat gambar');return}const f=new File([b],n,{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){if(e&&e.name=='AbortError')return}const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();toast('Gambar tersimpan')}
function wrapped(){const s=stt,sg2=Object.values(s.pl).sort((a,b)=>b.n-a.n).slice(0,5),ar=Object.entries(s.ar).sort((a,b)=>b[1]-a[1]).slice(0,5);if(!sg2.length){toast('Dengarkan beberapa lagu dulu');return}const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#ff5f7e');g.addColorStop(.5,'#5b4bff');g.addColorStop(1,'#070a1f');x.fillStyle=g;x.fillRect(0,0,1080,1920);x.fillStyle='#fff';x.textAlign='left';x.font='700 64px Sora,system-ui,sans-serif';x.fillText('Wrapped '+new Date().getFullYear(),90,200);x.font='400 36px Sora,system-ui,sans-serif';x.globalAlpha=.8;x.fillText(Math.floor(s.tot/3600)+' jam '+Math.floor(s.tot%3600/60)+' menit mendengar',90,270);x.globalAlpha=1;const L=(h,y,a)=>{x.font='700 40px Sora,system-ui,sans-serif';x.fillText(h,90,y);x.font='400 38px Sora,system-ui,sans-serif';a.forEach((t,i)=>x.fillText((i+1)+'. '+String(t).slice(0,30),90,y+70+i*64))};L('Lagu teratas',420,sg2.map(e=>e.t));L('Artis teratas',900,ar.map(e=>e[0]));x.font='700 30px Sora,system-ui,sans-serif';x.globalAlpha=.5;x.fillText('MIDNIGHT ACOUSTIC',90,1800);cvShare(c,'wrapped.png')}
/* 7. Pintasan ikon aplikasi */
(function(){const g=new URLSearchParams(location.search).get('go');if(g=='explore'||g=='library')go(g);else if(g=='resume'){go('home');setTimeout(()=>{try{resume()}catch(e){}},400)}})();
/* 10. Pengingat cadangan */
setTimeout(()=>{const l=ls.get('lbk',0);if(!l){ls.set('lbk',Date.now());return}if(Date.now()-l>21*864e5&&(favs.length||pls.length)){toast('Sudah 3 minggu tanpa cadangan. Ekspor di Pengaturan ya');ls.set('lbk',Date.now()-14*864e5)}},6000);


/* ===== v2.9 ===== */
function nvA(){const c=window._cm;if(!c)return;const on=cfg.nv!==0;c.threshold.value=on?-26:0;c.ratio.value=on?4:1}
let wkL=null;setInterval(()=>{try{const want=cfg.wl===1&&cur&&!act.paused&&!document.hidden;if(want&&!wkL&&navigator.wakeLock){wkL='p';navigator.wakeLock.request('screen').then(s=>{wkL=s;s.onrelease=()=>{wkL=null}}).catch(()=>{wkL=null})}else if(!want&&wkL&&wkL!=='p'){wkL.release();wkL=null}}catch(e){wkL=null}},3000);
const _gs=goSet;goSet=function(){_gs();if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>{const el=$('#stg');if(el)el.textContent=(e.usage/1048576).toFixed(1)+' MB terpakai dari '+(e.quota/1073741824).toFixed(1)+' GB'}).catch(()=>{})};
async function stCache(){try{const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));toast('Cache dibersihkan. Muat ulang untuk mengambil versi terbaru')}catch(e){toast('Gagal membersihkan cache')}}
async function stUpd(){try{const r=await navigator.serviceWorker.getRegistration();if(!r){toast('Pembaruan hanya tersedia di aplikasi yang dipasang');return}toast('Memeriksa pembaruan\u2026');await r.update();setTimeout(()=>{if(!r.waiting&&!$('.upd'))toast('Kamu sudah memakai versi terbaru')},1500)}catch(e){toast('Gagal memeriksa pembaruan')}}
function stReset(){if(!confirm('Reset semua pengaturan ke bawaan? Lagu, playlist, dan favorit tidak dihapus.'))return;['cfg','eq','rate'].forEach(k=>{try{localStorage.removeItem('ma_'+k)}catch(e){}});location.reload()}


/* ===== v3.0 ===== */
/* 1. Ajakan pasang aplikasi */
let dip=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e});
(function(){const st=matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(st)return;const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
setTimeout(()=>{const d=ls.get('inst',0);if((d&&Date.now()-d<14*864e5)||!ls.get('ob',0)||(!dip&&!ios)||$('#ins'))return;const c=document.createElement('div');c.id='ins';c.innerHTML=`<img src="icon-192.png" alt=""><div><b>Pasang Midnight Acoustic</b><small>${ios?'Ketuk Bagikan, lalu Tambah ke Layar Utama':'Buka cepat dari layar utama dan bisa offline'}</small></div>${ios?'':'<button class="btn" id="insy">Pasang</button>'}<button class="ib" id="insn">✕</button>`;$('#app').appendChild(c);requestAnimationFrame(()=>c.classList.add('on'));
const x=()=>{ls.set('inst',Date.now());c.classList.remove('on');setTimeout(()=>c.remove(),400)};$('#insn').onclick=x;if(!ios)$('#insy').onclick=async()=>{x();try{dip.prompt();await dip.userChoice}catch(e){}}},150000)})();
addEventListener('appinstalled',()=>{ls.set('inst',Date.now()+365*864e5);const c=$('#ins');if(c)c.remove()});
/* 5. Koleksi pilihan di Home */
const KP=[['Santai Sore','🌇','/api/music?src=audius&trending=1&genre=Acoustic',25],['Fokus Belajar','📚','/api/music?src=audius&trending=1&genre=Lo-Fi',215],['Semangat Pagi','☀️','/api/music?src=audius&trending=1&genre=Electronic',45],['Malam Tenang','🌙','/api/music?src=audius&trending=1&genre=Jazz',255],['Musik Indonesia','🇮🇩','/api/music?src=audius&q=indonesia',350],['Pop Hari Ini','🎤','/api/music?src=audius&trending=1&genre=Pop',320]],kc={};
const curSec=()=>`<div class="sec"><h3>Koleksi Pilihan</h3><small>Audius</small></div><div class="hs">${KP.map((k,i)=>`<div class="kp" onclick="kpGo(${i})" style="background:linear-gradient(135deg,hsl(${k[3]},70%,50%),hsl(${(k[3]+40)%360},65%,30%))"><span>${k[1]}</span>${k[0]}</div>`).join('')}</div>`;
async function kpGo(i){const k=KP[i];toast('Memuat '+k[0]+'\u2026');try{let a=kc[i];if(!a){const r=await fetch(k[2]);if(!r.ok)throw 0;a=arrOf(await r.json()).filter(x=>x&&x.id).map(x=>({...x,h:hh(x.title)}));kc[i]=a}if(!a.length){toast('Koleksi belum tersedia');return}lists.kp=a;sub(shd(esc(k[0]))+'<button class="btn" style="margin-bottom:10px" onclick="play(lists.kp,0);openP()">▶ Putar Semua</button>'+rows('kp',a))}catch(e){toast('Gagal memuat koleksi. Periksa koneksi')}}
const _hm3=V.home;V.home=function(){return _hm3.call(V).replace('<div class="sec"><h3>Rekomendasi Suasana</h3>',curSec()+'<div class="sec"><h3>Rekomendasi Suasana</h3>')};
if(pg=='home')go('home');
