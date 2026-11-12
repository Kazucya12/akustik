
/* ===== v3.1: sumber online campuran, pencarian gabungan + riwayat, halaman Artis, edit playlist, radio ===== */
(function(){
/* Migrasi sekali: pengguna lama yang masih di Audius dipindah ke "Semua" */
if(!ls.get('v31',0)){ls.set('v31',1);if(cfg.src=='audius'){cfg.src='all';ls.set('cfg',cfg)}}
smode='a';

const SRC=[['all','Musik'],['radio','Radio']];
const GENERIC=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
const uniq=a=>{const s=new Set();return a.filter(t=>t&&t.id!=null&&!s.has(t.id)&&s.add(t.id))};
const mineAll=()=>uniq([...songs,...favs.map(rs),...hist.map(rs),...pls.flatMap(p=>p.tr.map(rs))]).filter(t=>!t.yt);

/* ---------- Pencarian: sumber, kesalahan, gabungan, riwayat ---------- */
srch=async function(s){
  const r=await fetch('/api/music?src='+cfg.src+'&q='+encodeURIComponent(s));
  if(r.status==501){toast('Sumber ini belum diaktifkan di server. Isi key-nya di Vercel');return[]}
  if(!r.ok)throw 0;
  return arrOf(await r.json()).map(x=>({...x,h:hh(x.title)}));
};

let agH='';
const shG=()=>ls.get('sh',[]);
window.SH=i=>shG()[i];
function shAdd(s){s=String(s||'').trim().slice(0,60);if(s.length<2)return;ls.set('sh',[s,...shG().filter(x=>x.toLowerCase()!=s.toLowerCase())].slice(0,10))}
window.shClr=()=>{ls.set('sh',[]);shR()};
function shHtml(){
  const k=(lq||'').trim().toLowerCase();
  const a=shG().map((x,i)=>[x,i]).filter(([x])=>!k||(x.toLowerCase().includes(k)&&x.toLowerCase()!=k)).slice(0,8);
  if(!a.length)return'';
  return`<div class="sec"><h3>${k?'Saran':'Riwayat Pencarian'}</h3>${k?'':'<a onclick="shClr()">Hapus</a>'}</div><div class="chips">${a.map(([x,i])=>`<span class="chip" onclick="qs(SH(${i}))">${esc(x)}</span>`).join('')}</div>`;
}
function shR(){const e=$('#sh');if(e)e.innerHTML=shHtml()}

const _ds=doSearch;
doSearch=async function(s){
  if(smode=='m'){
    await _ds(s);
    if(lq!==s||smode!='m')return;
    const r0=$('#res');
    if(r0&&r0.querySelector('.rw'))shAdd(s);
    shR();return;
  }
  if(smode!='a'){await _ds(s);if(lres&&lres.length)shAdd(s);shR();return}
  lq=s;const r=$('#res');if(!r)return;
  if(!s.trim()){lres=null;agH='';r.innerHTML='';shR();return}
  r.innerHTML=skel6(6);shR();
  const k=s.trim().toLowerCase();
  const loc=mineAll().filter(t=>(t.title+' '+t.artist).toLowerCase().includes(k)).slice(0,8);
  const [on,vd]=await Promise.allSettled([srch(s),ytSearch(s)]);
  if(lq!==s||smode!='a')return;
  const o=on.status=='fulfilled'?on.value.slice(0,20):[],v=vd.status=='fulfilled'?vd.value.slice(0,o.length<8?15:5):[];
  lres=null;
  const sec=t=>`<div class="sec"><h3>${t}</h3></div>`;
  agH=(loc.length?sec('Di Library')+rows('sl',loc):'')+(o.length?sec('Musik Online')+rows('sr',o):'')+(v.length?sec(o.length<8?'Video YouTube':'Video')+rows('sv',v):'');
  if(!agH)agH=on.status=='rejected'?'<div class="em">Tidak bisa terhubung. Periksa internet atau ganti sumber.</div>':'<div class="em">Tidak ada hasil. Coba kata kunci lain.</div>';
  else shAdd(s);
  r.innerHTML=agH;shR();
};

window.setMode=m=>{smode=m;lres=null;agH='';go('explore');if(lq.trim())doSearch(lq)};
window.setSrc=k=>{cfg.src=k;ls.set('cfg',cfg);lres=null;agH='';go('explore');if(lq.trim()&&smode!='v')doSearch(lq)};

/* ---------- Radio ---------- */
const RD=[['ID','','Indonesia'],['','','Dunia'],['','pop','Pop'],['','rock','Rock'],['','jazz','Jazz'],['','news','Berita']];
let rdSel=0,rdRes=null;
const rdBody=()=>rdRes=='load'?skel6(5):rdRes=='err'?'<div class="em">Daftar radio belum tersedia. Coba lagi nanti.</div>':Array.isArray(rdRes)?(rdRes.length?rows('rd',rdRes):'<div class="em">Tidak ada stasiun.</div>'):'';
function rdR(){const e=$('#rd');if(e)e.innerHTML=rdBody();document.querySelectorAll('.rdc').forEach(x=>x.classList.toggle('a',+x.dataset.i==rdSel))}
window.rdGo=async function(i){
  rdSel=i;rdRes='load';rdR();const c=RD[i];
  try{const r=await fetch('/api/music?src=radio&trending=1&cc='+c[0]+'&tag='+c[1]);if(!r.ok)throw 0;rdRes=arrOf(await r.json()).map(x=>({...x,h:hh(x.title)}))}catch(e){rdRes='err'}
  rdR();
};
const rdSec=()=>{if(!rdRes)rdGo(rdSel);return`<div class="sec"><h3>Stasiun Radio</h3><small>Siaran langsung</small></div><div class="chips">${RD.map((c,i)=>`<span class="chip rdc ${rdSel==i?'a':''}" data-i="${i}" onclick="rdGo(${i})">${c[2]}</span>`).join('')}</div><div id="rd">${rdBody()}</div>`};

/* ---------- Halaman Explore ---------- */
const _ex=V.explore;
V.explore=function(){
  let h=_ex.call(V);
  h=h.replace(/<small style="display:block;margin-top:10px">Sumber pencarian:[^<]*<\/small>/,'');
  /* Pilihan Semua/Musik saja disembunyikan: pencarian selalu mode Semua (musik + video YouTube diputar sebagai audio) */
  h=h.replace(/<div class="sec"><small>Hasil pencarian online[^<]*<\/small><\/div>/,'');
  h=h.replace(/<div class="chips"><span class="chip [^"]*" onclick="smode='m';go\('explore'\)">Musik<\/span><span class="chip [^"]*" onclick="smode='v';go\('explore'\)">Video<\/span><\/div>/,
    `<div class="chips">${[['a','Semua'],['m','Musik'],['v','Video']].map(x=>`<span class="chip ${smode==x[0]?'a':''}" onclick="setMode('${x[0]}')">${x[1]}</span>`).join('')}</div>`+
    (smode!='v'?`<div class="chips">${SRC.map(x=>`<span class="chip ${cfg.src==x[0]?'a':''}" onclick="setSrc('${x[0]}')">${x[1]}</span>`).join('')}</div>`:''));
  h=h.replace('<div id="res">',`<div id="sh">${shHtml()}</div>${cfg.src=='radio'&&smode!='v'?rdSec():''}<div id="res">${smode=='a'?agH:''}`);
  return h;
};

/* ---------- Halaman Artis ---------- */
let alist=[];
window.AN=i=>alist[i];
window.arList=function(){
  const m=new Map();
  uniq([...songs,...favs.map(rs).filter(Boolean)]).forEach(t=>{const n=String(t.artist||'').trim();if(!n||GENERIC.test(n))return;const k=n.toLowerCase();if(!m.has(k))m.set(k,{n,c:0,t});m.get(k).c++});
  const a=[...m.values()].sort((x,y)=>y.c-x.c||x.n.localeCompare(y.n));
  alist=a.map(x=>x.n);
  return a.length?a.map((x,i)=>`<div class="rw" onclick="artistPg(AN(${i}))"><img src="${esc(cov(x.t))}" style="border-radius:50%"><div><b>${esc(x.n)}</b><small>${x.c} lagu</small></div></div>`).join(''):'<div class="em">Belum ada artis. Tambahkan lagu atau tandai favorit dulu.</div>';
};
window.artistPg=async function(n){
  n=String(n||'').trim();
  if(!n||GENERIC.test(n)){toast('Halaman artis tidak tersedia untuk ini');return}
  clp();
  const k=n.toLowerCase(),mine=mineAll().filter(t=>String(t.artist||'').trim().toLowerCase()==k);
  lists.am=mine;
  sub(`${shd(esc(n))}<div style="text-align:center;margin:4px 0 14px"><img src="${esc(cov(mine[0]||{h:hh(n)}))}" style="width:112px;height:112px;border-radius:50%;object-fit:cover;box-shadow:var(--sh)"><h2 style="margin-top:10px">${esc(n)}</h2><small>${mine.length?mine.length+' lagu di perangkat dan koleksimu':'Belum ada lagu di koleksimu'}</small></div>${mine.length?`<button class="btn" style="margin-bottom:8px" onclick="play(lists.am,0);openP()">▶ Putar Semua</button>${rows('am',mine)}`:''}<div class="sec"><h3>Lagu Online</h3></div><div id="ao"><div class="em">Memuat…</div></div>`);
  try{
    const r=await fetch('/api/music?src=all&q='+encodeURIComponent(n));
    let a=r.ok?arrOf(await r.json()).map(x=>({...x,h:hh(x.title)})):[];
    const m=a.filter(x=>String(x.artist||'').toLowerCase().includes(k));
    a=(m.length?m:a).slice(0,15);
    const e=$('#ao');if(!e)return;
    lists.ao=a;
    e.innerHTML=a.length?`<button class="btn g" style="margin-bottom:8px" onclick="play(lists.ao,0);openP()">▶ Putar Semua</button>${rows('ao',a)}`:'<div class="em">Tidak ada lagu online untuk artis ini.</div>';
  }catch(x){const e=$('#ao');if(e)e.innerHTML='<div class="em">Tidak bisa terhubung.</div>'}
};

/* ---------- Edit playlist: nama, cover, urutan, hapus lagu ---------- */
let plEd=0;
const plSave=()=>ls.set('pls',pls);
window.openPl=function(i,keep){
  const p=pls[i];if(!p)return;if(!keep)plEd=0;
  const a=p.tr.map(rs);
  const hd=`${shd(esc(p.n))}<div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn" onclick="plPlay(${i})">▶ Putar</button><button class="btn g" onclick="plExp(${i})">Ekspor</button><button class="btn g" onclick="plShare(${i})">Bagikan</button></div><div class="chips"><span class="chip" onclick="plRn(${i})">✎ Nama</span><span class="chip" onclick="plCv(${i})">🖼 Cover</span><span class="chip ${plEd?'a':''}" onclick="plEd=${plEd?0:1};openPl(${i},1)">↕ Atur Urutan</span><span class="chip" onclick="plSt(${i},'az')">A-Z</span><span class="chip" onclick="plSt(${i},'ar')">Artis</span><span class="chip" onclick="plSt(${i},'rv')">Balik</span></div>`;
  let b;
  if(!p.tr.length)b='<div class="em">Playlist kosong. Buka pemutar lalu ketuk + untuk menambah lagu.</div>';
  else if(plEd)b=p.tr.map((x,j)=>{const t=a[j];return`<div class="rw" style="cursor:default"><img src="${esc(cov(t||{h:200}))}"><div><b>${esc(t?t.title:'Lagu tidak ditemukan')}</b><small>${esc(t?t.artist:'')}</small></div><button class="ib" style="color:var(--mu)" onclick="plMv(${i},${j},-1)">▲</button><button class="ib" style="color:var(--mu)" onclick="plMv(${i},${j},1)">▼</button><button class="ib" style="color:var(--mu)" onclick="plRm(${i},${j})">${ic('x',18)}</button></div>`}).join('');
  else b=rows('pp',a.filter(Boolean));
  sub(hd+b+`<button class="btn g" style="margin-top:14px" onclick="plDel(${i})">Hapus Playlist</button>`);
};
window.plRn=async i=>{const p=pls[i];if(!p)return;const n=((await uiPrompt('Masukkan nama baru playlist.',p.n,{title:'Ubah nama playlist',max:60}))||'').trim().slice(0,60);if(n){p.n=n;plSave();openPl(i,1)}};
window.plMv=(i,j,d)=>{const t=pls[i].tr,k=j+d;if(k<0||k>=t.length)return;[t[j],t[k]]=[t[k],t[j]];plSave();openPl(i,1)};
window.plRm=(i,j)=>{pls[i].tr.splice(j,1);plSave();openPl(i,1)};
window.plSt=(i,m)=>{
  const p=pls[i];if(p.tr.length<2)return;
  const key=x=>{const t=rs(x);return t?(m=='ar'?t.artist+' '+t.title:t.title).toLowerCase():'\uffff'};
  if(m=='rv')p.tr.reverse();else p.tr.sort((x,y)=>key(x).localeCompare(key(y)));
  plSave();openPl(i,1);toast(m=='rv'?'Urutan dibalik':'Playlist diurutkan');
};
window.plCv=i=>{
  const f=document.createElement('input');f.type='file';f.accept='image/*';
  f.onchange=async()=>{const x=f.files[0];if(!x)return;const d=await shrink(x);if(!d){toast('Gagal membaca gambar');return}pls[i].img=d;plSave();toast('Cover playlist diganti');openPl(i,1)};
  f.click();
};
})();
