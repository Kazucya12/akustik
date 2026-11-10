/* ===== v3.2: pilih banyak lagu + impor playlist Spotify/YouTube ===== */
(function(){
/* ---------- Pilih banyak lagu ---------- */
const SEL={on:0,m:new Map()};let PLOPEN=-1;
const app=$('#app');
const bar=document.createElement('div');bar.id='sb';app.appendChild(bar);
const sheet=document.createElement('div');sheet.id='ss';sheet.onclick=e=>{if(e.target==sheet)sheet.classList.remove('on')};app.appendChild(sheet);

const okT=t=>t&&!(t.rec&&!t.url);
const pick=kind=>{
  const a=[...SEL.m.values()];
  const r=kind=='play'||kind=='queue'?a.filter(t=>!t.yt&&okT(t)):a.filter(t=>!t.yt);
  if(r.length<a.length)toast((a.length-r.length)+' item dilewati (video atau belum ada versi putar)');
  return r;
};
function barR(){
  const n=SEL.m.size,d=n?'':'dis';
  bar.innerHTML=`<div class="sbt"><b>${n} dipilih</b><button onclick="selAll()">Semua</button><button onclick="selTog()">Batal</button></div><div class="sba">
<button class="${d}" onclick="selAct('play')"><span>▶</span>Putar</button>
<button class="${d}" onclick="selAct('queue')"><span>＋</span>Antrean</button>
<button class="${d}" onclick="selAct('fav')"><span>♥</span>Favorit</button>
<button class="${d}" onclick="selAct('pl')"><span>☰</span>Playlist</button>
${PLOPEN>=0?`<button class="${d}" onclick="selAct('out')"><span>➖</span>Keluarkan</button>`:`<button class="${d}" onclick="selAct('del')"><span>🗑</span>Hapus</button>`}</div>`;
}
function paint(){
  if(!SEL.on)return;
  document.querySelectorAll('.rw[onclick^="P("]').forEach(el=>{
    const m=el.getAttribute('onclick').match(/^P\('(\w+)',(\d+)\)/);if(!m)return;
    const t=lists[m[1]]&&lists[m[1]][+m[2]];el.classList.toggle('sel',!!(t&&SEL.m.has(t.id)));
  });
}
let pq=0;new MutationObserver(()=>{if(!SEL.on||pq)return;pq=requestAnimationFrame(()=>{pq=0;paint()})}).observe(app,{childList:true,subtree:true});

document.addEventListener('click',e=>{
  if(!SEL.on)return;
  const el=e.target.closest('.rw[onclick^="P("]');if(!el)return;
  e.preventDefault();e.stopPropagation();
  const m=el.getAttribute('onclick').match(/^P\('(\w+)',(\d+)\)/);if(!m)return;
  const t=lists[m[1]]&&lists[m[1]][+m[2]];if(!t)return;
  if(SEL.m.has(t.id))SEL.m.delete(t.id);else SEL.m.set(t.id,t);
  hp(8);paint();barR();
},true);

window.selTog=function(){
  SEL.on=SEL.on?0:1;SEL.m.clear();document.body.classList.toggle('selm',!!SEL.on);sheet.classList.remove('on');
  if(SEL.on){barR();paint();toast('Ketuk lagu untuk memilih')}
};
window.selAll=function(){
  const els=[...document.querySelectorAll('.rw[onclick^="P("]')];const ts=[];
  els.forEach(el=>{const m=el.getAttribute('onclick').match(/^P\('(\w+)',(\d+)\)/);const t=m&&lists[m[1]]&&lists[m[1]][+m[2]];if(t)ts.push(t)});
  if(!ts.length)return;
  const all=ts.every(t=>SEL.m.has(t.id));
  ts.forEach(t=>all?SEL.m.delete(t.id):SEL.m.set(t.id,t));paint();barR();
};
async function selDel(){
  const a=[...SEL.m.values()];
  const loc=a.filter(t=>t.loc&&songs.some(s=>s.id==t.id)),vs=a.filter(t=>t.yt&&vids.some(v=>v.id==t.id));
  if(!loc.length&&!vs.length){toast('Hanya lagu di perangkat dan video tersimpan yang bisa dihapus');return}
  if(!await uiConfirm('Lagu di perangkat hanya dihapus dari aplikasi, file aslinya tidak disentuh.',{title:'Hapus '+(loc.length+vs.length)+' item?',ok:'Hapus',danger:1}))return;
  for(const t of loc){try{await tx('readwrite',o=>o.delete(t.id))}catch(e){}if(cur&&cur.id==t.id){A.pause();cur=null;clp()}}
  const ids=new Set(loc.map(t=>t.id));songs=songs.filter(s=>!ids.has(s.id));
  if(vs.length){const vi2=new Set(vs.map(t=>t.id));vids=vids.filter(v=>!vi2.has(v.id));ls.set('vids',vids)}
  toast((loc.length+vs.length)+' item dihapus');SEL.m.clear();barR();
  if(PLOPEN>=0)openPl(PLOPEN,1);else go(pg);
}
window.selAct=function(k){
  if(!SEL.m.size)return;
  if(k=='play'){const a=pick('play');if(!a.length)return;const n=a.length;const l=a.slice();selTog();play(l,0);openP();toast(n+' lagu diputar');return}
  if(k=='queue'){const a=pick('queue');if(!a.length)return;if(!cur){const l=a.slice();selTog();play(l,0);openP();return}q.push(...a);toast(a.length+' lagu masuk antrean');selTog();return}
  if(k=='fav'){const a=pick('fav');if(!a.length)return;let n=0;a.forEach(t=>{if(!isF(t)){favs=[...favs,svt(t)];n++}});ls.set('favs',favs);toast(n?n+' lagu masuk Favorit':'Semuanya sudah di Favorit');selTog();return}
  if(k=='pl'){if(!pick('pl').length)return;selPl();return}
  if(k=='out'){
    const i=PLOPEN,p=pls[i];if(!p)return;const ids=new Set([...SEL.m.keys()]);
    const n=p.tr.length;p.tr=p.tr.filter(x=>!ids.has(x.id));ls.set('pls',pls);toast((n-p.tr.length)+' lagu dikeluarkan');SEL.m.clear();barR();openPl(i,1);return;
  }
  if(k=='del')selDel();
};
function selPl(){
  sheet.innerHTML=`<div class="ssi"><h3>Tambah ke playlist</h3>${pls.map((p,i)=>`<div class="rw" onclick="selPlGo(${i})"><img src="${esc(cov(p.img?{img:p.img}:(p.tr.map(rs).filter(Boolean)[0]||{h:260+i*25})))}"><div><b>${esc(p.n)}</b><small>${p.tr.length} lagu</small></div></div>`).join('')}<div class="rw" onclick="selPlGo(-1)"><div><b>＋ Playlist baru</b></div></div><button class="btn g" style="margin-top:10px" onclick="$('#ss').classList.remove('on')">Batal</button></div>`;
  sheet.classList.add('on');
}
window.selPlGo=async function(i){
  const a=pick('pl');if(!a.length)return;
  if(i<0){const n=((await uiPrompt('Beri nama untuk playlist barumu.','',{title:'Buat playlist',placeholder:'Contoh: Santai sore',ok:'Buat',max:60}))||'').trim().slice(0,60);if(!n)return;pls.push({n,tr:[]});i=pls.length-1}
  const p=pls[i],have=new Set(p.tr.map(x=>x.id));let n=0;
  a.forEach(t=>{if(!have.has(t.id)){p.tr.push(svt(t));have.add(t.id);n++}});
  ls.set('pls',pls);sheet.classList.remove('on');toast(n+' lagu masuk ke '+p.n);selTog();
};

/* tombol Pilih di Library, Explore, Playlist, Artis */
const _lib=V.library;
V.library=function(){return _lib.call(V).replace('<h1>Library</h1><button class="ib g" onclick="goSet()">⚙</button>','<h1>Library</h1><div style="display:flex;gap:8px"><button class="ib g" onclick="selTog()" style="'+(SEL.on?'color:var(--p2)':'')+'">☑</button><button class="ib g" onclick="goSet()">⚙</button></div>')
  .replace('onclick="$(\'#fpl\').click()">Impor</button></div>','onclick="$(\'#fpl\').click()">Impor</button></div><button class="btn g" style="margin-top:8px" onclick="impOpen()">⇩ Impor dari Spotify / YouTube</button>')};
const _ex=V.explore;
V.explore=function(){return _ex.call(V).replace(/(onclick="setMode\('v'\)">Video<\/span>)/,'$1<span class="chip '+(SEL.on?'a':'')+'" onclick="selTog();go(\'explore\')">☑ Pilih</span>')};
const hdSel=()=>{const s=document.querySelector('#sp .hd span');if(s){s.style.width='auto';s.innerHTML='<button class="ib g" onclick="selTog()">☑</button>'}};
const _op=openPl;openPl=function(i,k){PLOPEN=i;_op(i,k);hdSel();if(SEL.on)barR()};
const _ap=artistPg;artistPg=function(n){PLOPEN=-1;const r=_ap(n);hdSel();return r};
const _csp=csp;csp=function(){PLOPEN=-1;if(SEL.on)barR();_csp()};

/* ---------- Impor playlist ---------- */
const clean=s=>String(s||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|video|audio|lyrics?|lyric|visualizer|hd|4k|remaster(ed)?|feat\.?|ft\.?)\b.*$/gi,' ').replace(/[^\p{L}\p{N} ]+/gu,' ').replace(/\s+/g,' ').trim().toLowerCase();
const words=s=>new Set(clean(s).split(' ').filter(w=>w.length>1));
const inter=(a,b)=>{let n=0;a.forEach(x=>{if(b.has(x))n++});return n};
function score(w,c){
  const cw=words(c.title+' '+c.artist),tw=words(w.title),fw=words(w.title+' '+w.artist);
  const t=tw.size?inter(tw,cw)/tw.size:0,f=fw.size?inter(fw,cw)/fw.size:0;
  return t>=.7&&f>=.6?t+f-(cw.size-inter(fw,cw))*.02:-1;
}
async function matchOne(w){
  const qq=((clean(w.title)+' '+clean(w.artist)).trim()||w.title).slice(0,80);
  const r=await fetch('/api/music?src=audius&q='+encodeURIComponent(qq));
  if(!r.ok)return null;
  const a=arrOf(await r.json());let best=null,bs=-1;
  a.forEach(c=>{if(!c||!c.url)return;const s=score(w,c);if(s>bs){bs=s;best=c}});
  return bs>0?{...best,h:hh(best.title)}:null;
}
window.impOpen=function(){
  clp();
  sub(`${shd('Impor Playlist')}<p style="color:var(--mu);font-size:13px;margin:4px 0 12px">Tempel link playlist atau album Spotify, atau link playlist YouTube. Lagu dicocokkan ke versi yang bisa diputar penuh. Playlist harus publik.</p><input class="in" id="iu" placeholder="open.spotify.com/playlist/… atau youtube.com/playlist?list=…"><div style="color:var(--mu);font-size:12px;text-align:center;margin:12px 0">atau tempel daftar lagu, satu per baris</div><textarea class="in" id="it" rows="6" placeholder="Judul - Artis"></textarea><button class="btn" id="imb" style="margin-top:12px" onclick="impRun()">Mulai Impor</button><div id="ip" style="margin-top:14px"></div>`);
};
let busy=0;
window.impRun=async function(){
  if(busy)return;
  const u=($('#iu').value||'').trim(),txt=($('#it').value||'').trim();
  if(!u&&!txt){toast('Tempel link atau daftar lagu dulu');return}
  busy=1;const b=$('#imb');if(b)b.disabled=true;
  const prog=(t,p)=>{const e=$('#ip');if(e)e.innerHTML=`<small>${t}</small>${p!=null?`<div class="ipb"><i style="width:${Math.round(p)}%"></i></div>`:''}`};
  try{
    let name='Impor '+new Date().toLocaleDateString('id-ID'),items=[],from='';
    if(u){
      prog('Mengambil daftar lagu…');
      const r=await fetch('/api/import?url='+encodeURIComponent(u));const j=await r.json().catch(()=>({}));
      if(!r.ok){prog(esc(j.error||'Gagal mengambil playlist. Coba tempel daftar lagu manual.'));return}
      name=j.name||name;from=j.src;
      items=arrOf(j.tracks).map(x=>{
        let t=String(x.title||''),a=String(x.artist||'');
        if(from=='youtube'){a=a.replace(/\s*-\s*Topic$|VEVO$/i,'').trim();const m=t.match(/^(.{2,60}?)\s[-–—]\s(.+)$/);if(m){a=m[1];t=m[2]}}
        return{title:t,artist:a,id:x.id,img:x.img,rt:x.title,ra:x.artist};
      });
    }else{
      items=txt.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,100).map(l=>({title:l,artist:''}));
    }
    if(!items.length){prog('Tidak ada lagu yang terbaca.');return}
    const res=new Array(items.length);let done=0,idx=0;
    const worker=async()=>{while(idx<items.length){const k=idx++;try{res[k]=await matchOne(items[k])}catch(e){res[k]=null}done++;prog('Mencocokkan '+done+' dari '+items.length+'…',done/items.length*100)}};
    await Promise.all([worker(),worker(),worker(),worker()]);
    const tr=[],seen=new Set(),skipped=[];let m=0,v=0;
    items.forEach((w,k)=>{
      let t=res[k];
      if(t)m++;else if(from=='youtube'&&w.id){t=mkV(w.id,w.rt,w.ra);v++}
      if(!t){skipped.push(w.title+(w.artist?' - '+w.artist:''));return}
      if(seen.has(t.id))return;seen.add(t.id);tr.push(svt(t));
    });
    if(!tr.length){prog('Tidak ada lagu yang cocok di sumber yang tersedia. Coba sumber lain atau daftar manual.');return}
    pls.push({n:name.slice(0,60),tr});ls.set('pls',pls);const pi=pls.length-1;
    prog('',null);
    const e=$('#ip');
    if(e)e.innerHTML=`<div class="pcard"><b>${esc(name.slice(0,60))}</b><br><small>${m} lagu cocok${v?', '+v+' dipakai sebagai video YouTube':''}${skipped.length?', '+skipped.length+' dilewati':''}</small>${skipped.length?`<small style="display:block;margin-top:8px;opacity:.8">Dilewati: ${skipped.slice(0,6).map(esc).join('; ')}${skipped.length>6?'…':''}</small>`:''}</div><button class="btn" style="margin-top:10px" onclick="openPl(${pi})">Buka Playlist</button>`;
    toast('Playlist diimpor: '+tr.length+' lagu');
  }catch(e){prog('Gagal mengimpor. Periksa koneksi lalu coba lagi.')}
  finally{busy=0;const b2=$('#imb');if(b2)b2.disabled=false}
};
})();
