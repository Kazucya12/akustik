/* ==== dialog.js ==== */
try{
/* Dialog modern: pengganti confirm() / prompt() bawaan browser.
   uiConfirm(pesan,{title,ok,cancel,danger,icon}) -> Promise<boolean>
   uiPrompt(pesan,nilaiAwal,{title,ok,placeholder,readonly,max}) -> Promise<string|null>
   uiForm(title,[{label,value,max}],{ok}) -> Promise<string[]|null>
   uiPick(title,[teks,...]) -> Promise<index|null> */
(function(){
  var css='.ud{position:fixed;left:0;right:0;top:0;height:100%;z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;padding-bottom:max(20px,env(safe-area-inset-bottom));background:rgba(3,5,22,.62);-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2);opacity:0;transition:opacity .22s ease;-webkit-tap-highlight-color:transparent}'
  +'.ud.on{opacity:1}'
  +'.udc{position:relative;width:min(100%,360px);max-height:100%;overflow:auto;border-radius:30px;padding:28px 22px 20px;background:var(--ov);border:1px solid var(--b);color:var(--tx);box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18);transform:translateY(26px) scale(.92);opacity:0;transition:transform .32s cubic-bezier(.2,1.1,.3,1),opacity .22s ease;text-align:center;font-family:inherit}'
  +'.udc:before{content:"";position:absolute;left:50%;top:-70px;width:240px;height:160px;margin-left:-120px;border-radius:50%;background:var(--p);opacity:.28;filter:blur(46px);pointer-events:none}'
  +'.ud.on .udc{transform:none;opacity:1}'
  +'.udi{position:relative;width:60px;height:60px;margin:0 auto 14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(145deg,rgba(255,255,255,.2),rgba(255,255,255,.05));border:1px solid var(--b);box-shadow:0 8px 24px rgba(0,0,0,.3);animation:udp .5s cubic-bezier(.2,1.4,.4,1) .08s both}'
  +'.udc.dg .udi{background:linear-gradient(145deg,rgba(255,95,126,.38),rgba(255,95,126,.1));border-color:rgba(255,95,126,.5)}'
  +'@keyframes udp{from{transform:scale(.4) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}'
  +'.udc h3{position:relative;margin:0 0 8px;font-size:19px;font-weight:700;letter-spacing:-.2px}'
  +'.udc p{position:relative;margin:0 0 18px;font-size:14px;line-height:1.5;color:var(--mu);word-break:break-word}'
  +'.udf{position:relative;display:block;text-align:left;margin:0 0 12px}'
  +'.udf span{display:block;font-size:12px;font-weight:600;color:var(--mu);margin:0 0 6px 4px}'
  +'.udf input{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:16px;border:1px solid var(--b);background:rgba(127,127,170,.14);color:var(--tx);font:inherit;font-size:16px;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}'
  +'.udf input:focus{border-color:var(--p2);background:rgba(127,127,170,.2);box-shadow:0 0 0 4px rgba(127,127,255,.16)}'
  +'.udl{position:relative;display:flex;flex-direction:column;gap:8px;margin:0 0 14px;max-height:46vh;overflow:auto;text-align:left}'
  +'.udl button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border-radius:16px;border:1px solid var(--b);background:rgba(127,127,170,.12);color:var(--tx);font:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:transform .15s,background .2s}'
  +'.udl button:active{transform:scale(.97);background:rgba(127,127,170,.26)}'
  +'.udl button i{flex:none;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff}'
  +'.udl button b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}'
  +'.udb{position:relative;display:flex;gap:10px}'
  +'.udb button{flex:1;height:50px;border:0;border-radius:18px;font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:transform .15s,filter .2s;-webkit-tap-highlight-color:transparent}'
  +'.udb button:active{transform:scale(.95)}'
  +'.udb .c{background:rgba(127,127,170,.18);color:var(--tx)}'
  +'.udb .o{background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;box-shadow:0 8px 22px rgba(109,93,252,.4)}'
  +'.udc.dg .udb .o{background:linear-gradient(135deg,#ff5f7e,#e0354f);box-shadow:0 8px 22px rgba(224,53,79,.42)}'
  +'.udb button:focus-visible{outline:2px solid var(--p2);outline-offset:2px}';
  css+='.sk6{display:flex;align-items:center;gap:12px;padding:8px}.sk6 i{flex:none;width:50px;height:50px;border-radius:13px}.sk6 div{flex:1;display:flex;flex-direction:column;gap:8px}.sk6 b,.sk6 u{display:block;height:11px;border-radius:6px;text-decoration:none}.sk6 u{height:9px}.sk6 i,.sk6 b,.sk6 u{background:linear-gradient(100deg,rgba(127,127,170,.14) 30%,rgba(255,255,255,.24) 50%,rgba(127,127,170,.14) 70%);background-size:220% 100%;animation:sk6 1.3s linear infinite}@keyframes sk6{from{background-position:120% 0}to{background-position:-120% 0}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var chain=Promise.resolve();
  function show(o){var p=chain.then(function(){return open(o)});chain=p.catch(function(){});return p}
  function open(o){return new Promise(function(done){
    var root=document.createElement('div');root.className='ud';
    var f=o.fields||[],list=o.list;
    var h='<div class="udc'+(o.danger?' dg':'')+'" role="dialog" aria-modal="true">'
      +(o.icon?'<div class="udi">'+esc(o.icon)+'</div>':'')
      +'<h3>'+esc(o.title)+'</h3>'+(o.msg?'<p>'+esc(o.msg)+'</p>':'');
    f.forEach(function(x,i){h+='<label class="udf">'+(x.label?'<span>'+esc(x.label)+'</span>':'')+'<input data-i="'+i+'" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="'+(x.max||200)+'" placeholder="'+esc(x.ph||'')+'" value="'+esc(x.value)+'"'+(x.ro?' readonly':'')+'></label>'});
    if(list){h+='<div class="udl">'+list.map(function(t,i){return'<button type="button" data-p="'+i+'"><i>'+(i+1)+'</i><b>'+esc(t)+'</b></button>'}).join('')+'</div>'}
    h+='<div class="udb"><button type="button" class="c">'+esc(o.cancel||'Batal')+'</button>'+(list?'':'<button type="button" class="o">'+esc(o.ok||'Oke')+'</button>')+'</div></div>';
    root.innerHTML=h;
    try{window.hap6&&window.hap6(10)}catch(e){}
    var prevFocus=document.activeElement,closed=0,vv=window.visualViewport;
    function fit(){if(vv){root.style.height=vv.height+'px';root.style.top=vv.offsetTop+'px'}}
    function close(v){if(closed)return;closed=1;
      document.removeEventListener('keydown',key,true);if(vv)vv.removeEventListener('resize',fit);
      root.classList.remove('on');
      setTimeout(function(){root.remove();try{prevFocus&&prevFocus.blur&&prevFocus.blur()}catch(e){}done(v)},210)}
    function value(){var r=[];root.querySelectorAll('input').forEach(function(i){r.push(i.value)});return r}
    function okv(){return f.length?(f.length==1?value()[0]:value()):true}
    function key(e){
      if(e.key=='Escape'){e.preventDefault();e.stopPropagation();close(o.dismiss)}
      else if(e.key=='Enter'&&!list&&e.target&&e.target.tagName!='BUTTON'){e.preventDefault();close(okv())}
    }
    document.addEventListener('keydown',key,true);
    root.addEventListener('mousedown',function(e){if(e.target===root)close(o.dismiss)});
    root.addEventListener('touchstart',function(e){if(e.target===root){e.preventDefault();close(o.dismiss)}},{passive:false});
    var b=root.querySelector('.udb');
    b.querySelector('.c').onclick=function(){close(o.dismiss)};
    var ok=b.querySelector('.o');if(ok)ok.onclick=function(){close(okv())};
    root.querySelectorAll('[data-p]').forEach(function(x){x.onclick=function(){close(+x.getAttribute('data-p'))}});
    (document.getElementById('app')||document.body).appendChild(root);
    fit();if(vv)vv.addEventListener('resize',fit);
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      root.classList.add('on');
      var i=root.querySelector('input');
      if(i){try{i.focus({preventScroll:true});i.select()}catch(e){}}
      else if(ok&&!o.danger)ok.focus({preventScroll:true});
    })});
  })}
  window.skel6=function(n){var h='';for(var i=0;i<(n||5);i++)h+='<div class="sk6"><i></i><div><b style="width:'+(52+(i*23)%36)+'%"></b><u style="width:'+(28+(i*17)%26)+'%"></u></div></div>';return'<div aria-busy="true" aria-label="Memuat">'+h+'</div>'};
  window.uiConfirm=function(msg,o){o=o||{};
    return show({title:o.title||'Konfirmasi',msg:msg,ok:o.ok,cancel:o.cancel,danger:o.danger,icon:o.icon||(o.danger?'🗑':'❓'),dismiss:false}).then(function(v){return v===true})};
  window.uiPrompt=function(msg,val,o){o=o||{};
    return show({title:o.title||msg,msg:o.title?msg:'',ok:o.ok||'Simpan',icon:o.icon,dismiss:null,
      fields:[{value:val||'',ph:o.placeholder,max:o.max,ro:o.readonly}]}).then(function(v){return v==null?null:v})};
  window.uiForm=function(title,fields,o){o=o||{};
    return show({title:title,ok:o.ok||'Simpan',icon:o.icon,dismiss:null,fields:fields}).then(function(v){return v==null?null:v})};
  window.uiPick=function(title,items,o){o=o||{};
    return show({title:title,list:items,icon:o.icon||'🎵',dismiss:null}).then(function(v){return v==null?null:v})};
})();
}catch(e){console.error('[loopify] dialog.js',e)}

/* ==== app.js ==== */
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem('ma_'+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('ma_'+k,JSON.stringify(v))}catch(e){}}};
let favs=ls.get('favs',[]),pls=ls.get('pls',[]),hist=ls.get('hist',[]),lyc=ls.get('ly',{}),cfg=ls.get('cfg',{src:'all',prem:false,name:'',theme:'auto'}),
eq=ls.get('eq',{on:true,v:[0,0,0,0,0,0],bass:0,treb:0,pre:'Flat'}),stt=ls.get('stt',{tot:0,pl:{},ar:{}});
const SRCS=['all','radio'],SN={radio:'Radio'};
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
function th(){const t=cfg.theme||'auto',d=t=='auto'?matchMedia('(prefers-color-scheme: dark)').matches:t!='light';document.documentElement.dataset.t=d?'dark':'light';document.documentElement.classList.toggle('am',t=='amoled');document.documentElement.classList.toggle('nu',t=='neutral')}
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
function tick(){xf();const a=act,s=$('#sk');setVol();abLoop(a);prel(a);stat(a);syncLy(a);msPos(a);if(!s)return;if(document.activeElement!==s)s.value=a.duration?a.currentTime/a.duration*1000:0;s.style.setProperty('--pg',s.value/10+'%');$('#ct').textContent=f2(a.currentTime);$('#du').textContent=cur&&cur.radio?'LIVE':f2(a.duration)}
const isF=t=>favs.some(x=>x.id==t.id);
function fav(){if(!cur)return;favs=isF(cur)?favs.filter(x=>x.id!=cur.id):[...favs,svt(cur)];ls.set('favs',favs);rp();toast(isF(cur)?'Masuk ke Favorit':'Dihapus dari Favorit')}
function dlc(){if(!cur)return;if(!cur.loc&&cur.dl===0){toast('Artis tidak mengizinkan unduhan lagu ini');return}if(!cur.loc&&cur.dl===1){dlOff(cur);return}if(!cur.loc){if(!okU(cur.url)){toast('Alamat lagu tidak valid');return}window.open(cur.url,'_blank','noopener');return}const a=document.createElement('a');a.href=urlOf(cur);a.download=cur.title;a.click()}
async function addPl(){if(!cur)return;if(!pls.length){toast('Buat playlist dulu di Library');return}const k=await uiPick('Tambah ke playlist',pls.map(p=>p.n));const p=k==null?null:pls[k];if(p){p.tr.push(svt(cur));ls.set('pls',pls);toast('Masuk ke '+p.n)}}
function addLy(){clp();sub(`${shd('Lirik')}<textarea class="in" id="lt" rows="14" placeholder="Tempel lirik di sini">${esc(lyc[cur.id]||'')}</textarea><button class="btn" style="margin-top:12px" onclick="lyc[cur.id]=$('#lt').value;ls.set('ly',lyc);csp0();openP()">Simpan</button>`)}
function rp(){const t=cur;if(!t)return;$('#pl').classList.remove('ytm');$('#pl').classList.toggle('pvm',!!t.yt);const p=!act.paused,L=lyc[t.id];lyI=-1;if(pm&&!L)fetchLy(t);const AL=ly2[t.id];
$('#pl').innerHTML=`<div class="hd"><button class="ib g" onclick="clp()">${ic('back')}</button><div class="seg">${t.yt?`<b class="${pm||vsh?'':'a'}" onclick="vsh=0;pm=0;rp()">Lagu</b><b class="${!pm&&vsh?'a':''}" onclick="vsh=1;pm=0;rp()">Video</b>`:`<b class="${pm?'':'a'}" onclick="pm=0;rp()">Lagu</b><b onclick="vFromSong()">Video</b>`}<b class="${pm?'a':''}" onclick="pm=1;rp()">Lirik</b></div><button class="ib g" onclick="addPl()">${ic('plus')}</button></div>
${pm?`${lyHtml(t,L,AL)}<div class="krr"><button class="btn g krb" onclick="openKr()">⛶ Layar Penuh</button><button class="btn g krb" onclick="ksOpen()">🎴 Kartu Musik</button></div>`:t.yt&&vsh?'<div class="pvs" id="pvs"></div>':`<div class="disc"><img src="${esc(cov(t))}"></div>`}
<h2 class="pt">${esc(t.title)}</h2><p class="pa" onclick="artistPg(cur&&cur.artist)" style="cursor:pointer">${esc(t.artist)} ›</p>
<input type="range" id="sk" min="0" max="1000" value="0" oninput="if(isFinite(act.duration))act.currentTime=this.value/1000*act.duration">
<div class="tm"><span id="ct">0:00</span><span id="du">0:00</span></div>
<div class="ctl"><button style="color:${shuf?'var(--p2)':'var(--mu)'}" onclick="shuf=!shuf;rp()">${ic('shuffle')}</button><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button><button style="color:${rep?'var(--p2)':'var(--mu)'}" onclick="rep=(rep+1)%3;rp();toast(['Ulangi: mati','Ulangi semua','Ulangi satu lagu'][rep])">${ic('repeat')}</button></div>
<div class="act"><button class="${isF(t)?'on-c':''}" onclick="fav()">${ic('heart',24,isF(t))}</button><button onclick="dlc()">${ic('dl',24)}</button><button onclick="goEq()">${ic('eq',24)}</button><button onclick="goQ()">${ic('q',24)}</button><button onclick="goSl()" style="color:${slEnd?'var(--p2)':'var(--mu)'}">${ic('moon',24)}</button><button onclick="spd()" style="font-weight:700;font-size:13px;color:${rate!=1?'var(--p2)':'var(--mu)'}">${rate}x</button><button onclick="shareCard()" style="font-size:18px;color:var(--mu)">⤴</button><button onclick="abT()" style="font-weight:700;font-size:12px;color:${ab.b!=null?'var(--p2)':ab.a!=null?'#ff6b9a':'var(--mu)'}">${ab.a!=null&&ab.b==null?'A→':'A-B'}</button></div>`;if(krOn())krRender();tick()}
function openP(){if(cur){rp();$('#pl').classList.add('on')}}function clp(){$('#pl').classList.remove('on')}

/* ===== Pencarian online ===== */
async function srch(s){const r=await fetch('/api/music?src='+cfg.src+'&q='+encodeURIComponent(s));if(!r.ok)throw 0;return (await r.json()).map(x=>({...x,h:hh(x.title)}))}
const lists={};
const row=(k,t,i,del)=>`<div class="rw" onclick="P('${k}',${i})"><img loading="lazy" decoding="async" src="${esc(cov(t))}"><div><b>${esc(ct(t.title))}</b><small>${esc(t.artist)}${t.bpm?' · '+(+t.bpm||0)+' BPM':''}${t.loc?'':t.yt?'':t.rec?(t.nf?' · belum ada versi putar':' · rekomendasi'):''}</small></div>${del?`${del==1?`<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();edS('${t.id}')">✎</button>`:''}<button class="ib" style="color:var(--mu)" onclick="event.stopPropagation();${del==2?'delV':'delS'}('${t.id}')">${ic('x',18)}</button>`:`<span class="ph">${cur&&cur.id==t.id&&!act.paused?'♪':''}</span><button class="ib" style="color:var(--mu);width:30px" onclick="event.stopPropagation();qAdd('${k}',${i})">${ic('plus',16)}</button>`}</div>`;
const rows=(k,a,del)=>(lists[k]=a,a.map((t,i)=>row(k,t,i,del)).join(''));
function P(k,i){const t=lists[k][i];if(t.rec){play(lists[k],i);openP();return}if(t.yt){const bg=!['vr','vd'].includes(k);if(bg)vsh=0;playV(lists[k],i,bg);if(bg)openP()}else{play(lists[k],i);openP()}}
let lq='',lres=null,lt='sg',pg='home',dt,smode='m';
async function doSearch(s){lq=s;const r=$('#res');if(!s.trim()){lres=null;r.innerHTML='';return}r.innerHTML=skel6(6);
try{lres=await srch(s);r.innerHTML=lres.length?rows('sr',lres):'<div class="em">Tidak ada hasil. Coba kata kunci lain.</div>'}catch(e){r.innerHTML='<div class="em">Tidak bisa terhubung. Periksa internet atau ganti sumber di Pengaturan.</div>'}}
const onS=v=>{clearTimeout(dt);dt=setTimeout(()=>{if(window.x24H)x24H();const n=String(v).trim().length;if(!n||n>=3)doSearch(v)},1100)};
function link(){const u=$('#lk').value.trim();if(!u)return;const y=ytId(u);if(y){vAdd(y);return}const t={id:'l'+Date.now(),title:decodeURIComponent(u.split('/').pop().split('?')[0])||'Lagu dari link',artist:'Link kustom',url:u,h:hh(u)};play([t],0);openP()}
/* ===== Halaman ===== */
const gen=[['Pop',280],['Rock',215],['Indie',260],['EDM',300],['Jazz',190],['Hip-Hop',330]];
const logo='<svg width="30" height="26" viewBox="0 0 30 26"><path d="M1 25L11 3l5 10 4-6 9 18z" fill="none" stroke="#8b7bff" stroke-width="2.4" stroke-linejoin="round"/></svg>';
const addBtns=`<div style="display:flex;gap:8px"><button class="btn" onclick="pick()">+ Tambah Lagu</button><button class="btn g" onclick="pickDir()">Pindai Folder</button></div>`;
function sub(h){$('#sp').innerHTML=h;$('#sp').classList.add('on')}function csp(){csp0();if(rbP){rbP=0;openP()}else go(pg)}const csp0=()=>$('#sp').classList.remove('on');
const shd=t=>`<div class="hd"><button class="ib g" onclick="csp()">${ic('back')}</button><h3>${t}</h3><span style="width:38px"></span></div>`;
const nm=()=>cfg.name||'Pengguna';
const V={
home(){if(!trRes)trend(tg);const rec=hist.map(rs).filter(Boolean).slice(0,6);return`<div class="hd"><div class="logo">${logo}<span>LOOPIFY</span></div><div style="display:flex;gap:8px;align-items:center"><button class="ib g" onclick="tgTheme()">${document.documentElement.dataset.t=='dark'?'☀':'🌙'}</button><div class="av" onclick="go('profile')">${esc(nm()[0])}</div></div></div>
<div class="hero"><h1>Good Vibes<br>Only</h1><small>Putar sekarang dan nikmati momennya.</small><button class="pbtn" onclick="playAll()">${ic('play',24,1)}</button></div>${rsmCard()}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn g" onclick="openV()">▶ Tonton Video</button><button class="btn g" onclick="drOpen()">🚗 Berkendara</button></div><div class="sec"><h3>Rekomendasi Suasana</h3><small></small></div><div class="chips">${RC.map(x=>`<span class="chip rcc ${recSel==x[0]?'a':''}" data-k="${x[0]}" onclick="recGo('${x[0]}')">${x[1]}</span>`).join('')}</div><div id="rec">${recHtml()}</div>
<div class="sec"><h3>Trending</h3><a onclick="go('explore')">Lihat Semua</a></div><div class="hs" id="trh">${trCards()}</div>
${songs.length?`<div class="sec"><h3>Baru Ditambahkan</h3><a onclick="go('library')">Lihat Semua</a></div><div class="hs">${(lists.nw=sg().slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('nw',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`
:`<div class="pcard em" style="margin-top:18px">${ic('music',34)}<br><b style="color:var(--tx);font-size:14px">Belum ada lagu</b><br>Izinkan akses ke file musik di perangkatmu. Lagu yang kamu pilih tersimpan dan muncul otomatis di daftar setiap aplikasi dibuka.<div style="margin-top:14px">${addBtns}</div></div>`}
${rec.length?`<div class="sec"><h3>Terakhir Diputar</h3></div>${rows('rc',rec)}`:''}${vids.length?`<div class="sec"><h3>Video Tersimpan</h3><a onclick="lt='vd';go('library')">Lihat Semua</a></div><div class="hs">${(lists.hv=vids.slice(0,10)).map((t,i)=>`<div class="cd" onclick="P('hv',${i})"><img src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}</div>`:''}`},
explore(){const src='Lagu penuh';if(!trRes)trend(tg);return`<div class="srch">${ic('search',18)}<input id="qi" placeholder="Cari musik, artis, atau album…" value="${esc(lq)}" oninput="onS(this.value)"><button class="ib" onclick="vSr()">🎤</button></div>
<div class="sec"><small>Hasil pencarian online menampilkan audio saja. Untuk menonton, gunakan tombol Video pada pemutar lagu.</small></div>
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
function toast(m,img){return;const t=$('#toast');if(!t)return;t.innerHTML=`<img src="${esc(img||'icon-192.png')}" alt=""><div><b>Loopify</b><span>${esc(m)}</span></div><small>sekarang</small>`;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),6000)}
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
function ms(){if(!('mediaSession' in navigator)||!cur)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:cur.title,artist:cur.artist,album:'Loopify',artwork:[cur.img?{src:cur.img}:{src:'icon-512.png',sizes:'512x512',type:'image/png'}]});
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
return`<div class="lyr"><p style="color:var(--mu);font-size:14px;line-height:1.7">${lyS[t.id]=='load'?'Mencari lirik…':'Lirik belum tersedia.<br><u onclick="addLy()" style="cursor:pointer">Tempel lirik sendiri</u>'}</p></div>`}
function lyGo(i){const al=cur&&alOf(cur);if(al&&al[i])act.currentTime=al[i].t}
function syncLy(a){if(!cur||a!==act)return;const al=alOf(cur);if(!al||!al.length)return;const ct=a.currentTime+.25;let i=-1;for(let k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}if(i===lyI)return;lyI=i;
document.querySelectorAll('#pl .lyr p[data-i],#kr .lyr p[data-i]').forEach(p=>{const on=+p.dataset.i===i;p.classList.toggle('on',on);if(on){const c=p.parentElement;c.scrollTo({top:p.getBoundingClientRect().top-c.getBoundingClientRect().top+c.scrollTop-c.clientHeight/2+p.clientHeight/2,behavior:'smooth'})}})}
const krOn=()=>$('#kr').classList.contains('on');
function openKr(){if(!cur)return;krRender();$('#kr').classList.add('on')}
function krX(){$('#kr').classList.remove('on')}
function krRender(){const t=cur;if(!t)return;const p=!act.paused;$('#kr').innerHTML=`<div class="hd"><button class="ib g" onclick="krX()">${ic('back')}</button><div style="flex:1;min-width:0;text-align:center"><b style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.title)}</b><small>${esc(t.artist)}</small></div><span style="width:38px"></span></div>${lyHtml(t,lyc[t.id])}<div class="ctl"><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button></div>`;lyI=-1}
/* ----- Resolusi rekomendasi, radio otomatis, simpan offline ----- */
async function resolveRec(t){const qq=(t.title+' '+(t.artist&&t.artist!='Tidak diketahui'?t.artist:'')).trim().slice(0,80);
try{const y=await ytSearch(qq),v=y&&y[0];if(v){Object.assign(t,{yt:1,vid:v.vid,img:t.img||v.img,rec:0,nf:0});return true}}catch(e){}
t.nf=1;return false}
function rrec(){const e=$('#rec');if(e)e.innerHTML=recHtml()}
async function autoRadio(force){const t=cur;if(!t||t.loc||t.radio||t.yt||(t.rec&&!t.url))return;if(!force&&cfg.ar===false)return;toast('Memutar lagu serupa…');
try{const a=(await ytSearch(/^(Tidak diketahui|Lagu Saya)$/i.test(t.artist)?t.title:t.artist)).filter(x=>x&&x.id!=t.id);for(let i=a.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]]}if(!a.length||(!force&&cur!==t))return;playV(a.slice(0,15),0,1)}catch(e){}}
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
const body=ytTab==1?`${lyHtml(t,L,AL)}`:ytTab==2?(ytRelFor==t.id&&ytRelL.length?rows('rl',ytRelL):'<div class="em">Memuat lagu serupa…</div>'):qr;
pl.innerHTML=`<div class="yh"><button class="yb" onclick="clp()" style="transform:rotate(-90deg)">${ic('back')}</button><div class="ysw"><b class="a">🎧</b><b onclick="vFromSong()">▶</b></div><button class="yb" onclick="ytMenu()">⋮</button></div>
<div class="yc"><img src="${esc(ytThumb(t))}" onerror="this.onerror=null;this.src='${esc(t.img||'')}'"><div class="yg"></div><div class="yn"><h2>${esc(t.title)}</h2><p onclick="artistPg(cur&&cur.artist)">${esc(t.artist)}</p></div></div>
<div class="yp"><input type="range" id="sk" min="0" max="1000" value="0" oninput="if(isFinite(act.duration))act.currentTime=this.value/1000*act.duration"><div class="tm"><span id="ct">0:00</span><span id="du">0:00</span></div>
<div class="ctl"><button style="opacity:${shuf?1:.55}" onclick="shuf=!shuf;rp()">${ic('shuffle')}</button><button onclick="nxt(-1)">${ic('prev',26,1)}</button><button class="m" onclick="toggle()">${ic(p?'pause':'play',30,1)}</button><button onclick="nxt()">${ic('next',26,1)}</button><button style="opacity:${rep?1:.55}" onclick="rep=(rep+1)%3;rp();toast(['Ulangi: mati','Ulangi semua','Ulangi satu lagu'][rep])">${ic('repeat')}</button></div></div>
<div class="yq"><div class="yqh"><h3>Antrean · ${n} lagu</h3><button class="yb" onclick="addPl()">${ic('plus')}</button></div><div class="ych"><span class="chip${ytTab==0?' a':''}" onclick="ytTabSet(0)">Berikutnya</span><span class="chip${ytTab==1?' a':''}" onclick="ytTabSet(1)">Lirik</span><span class="chip${ytTab==2?' a':''}" onclick="ytTabSet(2)">Serupa</span></div>${body}</div>`;
pl.scrollTop=sc;if(krOn())krRender();tick()}

/* ----- Video YouTube ----- */
const mkV=(id,title,artist)=>({id:'y'+id,yt:1,vid:id,title:String(title||'Video').slice(0,200),artist:String(artist||'YouTube').slice(0,100),img:'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg',h:hh(title||id)});
const vidOf=t=>t.vid||(String(t.id).match(/[\w-]{11}$/)||[])[0];
function ytId(u){const m=String(u||'').trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);return m?m[1]:''}
async function ytSearch(s,o,m){for(const u of ['/api/yt-music','/api/yt-search']){const r=await fetch(u+'?q='+encodeURIComponent(s)+(o?'&order='+o:'')+(m=='v'?'':'&songs='+(m==2?2:1)));if(r.status==404)continue;if(!r.ok){let c='';try{c=(await r.json()).code||''}catch(e){}throw Object.assign(new Error('yt'),{status:r.status,code:c})}return arrOf(await r.json()).map(x=>mkV(x.id,x.title,x.artist))}throw Object.assign(new Error('yt'),{status:404})}
const ytMsg=e=>e&&e.status==501?'Pencarian video belum diaktifkan di server (isi YOUTUBE_API_KEY di Vercel).':e&&e.status==429&&e.code=='rl'?'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.':e&&e.status==429?'Kuota pencarian video hari ini habis. Tempel link YouTube langsung.':e&&e.status==404?'Pencarian video belum tersedia di server.':'Tidak bisa terhubung. Periksa internet.';
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
function vSt(e){if(e.data==1){vef=0;A.pause();B.pause();try{yp.setPlaybackRate(Math.min(2,Math.max(.25,rate)))}catch(x){}if(act===yAct){mst('playing');rp();rn()}}else if(e.data==2){if(act===yAct){mst('paused');rp();rn()}}else if(e.data==0){if(act===yAct){if(slEnd==-1){slFire();return}if(rep==2){yAct.currentTime=0;yAct.play()}else if(rep==1||qi<q.length-1)nxt();else{rp();rn();autoRadio()}return}if(vq.length>1){vNext(1);return}}mvUi()}
function vEr(){toast('Video ini tidak bisa diputar di sini');if(act===yAct){if(q.length>1&&++vef<q.length)setTimeout(()=>nxt(1),800);return}if(vq.length>1&&++vef<vq.length)setTimeout(()=>vNext(1),800)}
function stopV(){try{yp&&yp.pauseVideo&&yp.pauseVideo()}catch(e){}}
function mvUi(){const m=$('#mv');if(!m)return;m.classList.toggle('on',!!(vbg&&vcur&&act!==yAct));$('#mvt').textContent=vcur?vcur.title:'';const mi=$('#mvi'),ms=$('#mvs');if(mi&&vcur)mi.src=vcur.img||'';if(ms)ms.textContent=(vcur&&vcur.artist?vcur.artist+' \u00b7 ':'')+'YouTube';$('#mvp').innerHTML=ic(vPlaying()?'pause':'play',20,1)}
function vSv(){const b=$('#vsv');if(b)b.textContent=vcur&&vids.some(v=>v.id==vcur.id)?'★ Tersimpan':'☆ Simpan'}
function openV(){$('#vo').classList.add('on');vbg=0;mvUi();vSv()}
function playV(list,i,bg){const t=list[i];if(!t)return;vq=[...list];vi=i;vcur=t;A.pause();B.pause();$('#vtt').textContent=t.title;$('#vch').textContent=t.artist;if(bg){vbg=0;$('#vo').classList.remove('on');q=[...list];qi=i;cur=t;act=yAct;fq=0;ab={a:null,b:null};lastCt=0;cur._pt=0;cur._cn=0;cur._xf=0;try{hist=[svt(cur),...hist.filter(x=>x.id!=cur.id)].slice(0,12);ls.set('hist',hist)}catch(e){}try{ms();thm(cur)}catch(e){}rp();rn();mvUi();vSv()}else{if(act===yAct)act=A;vbg=0;openV()}vLoad(vidOf(t));setTimeout(mvUi,600)}
function vNext(d){if(act===yAct){nxt(d);return}if(!vq.length)return;vi=(vi+d+vq.length)%vq.length;const t=vq[vi];if(t&&!t.yt){stopV();vcur=null;vbg=0;mvUi();play(vq,vi);return}playV(vq,vi,vbg)}
function vSave(){if(!vcur)return;if(vids.some(v=>v.id==vcur.id)){vids=vids.filter(v=>v.id!=vcur.id);toast('Dihapus dari video tersimpan')}else{vids=[vcur,...vids].slice(0,200);toast('Video disimpan')}ls.set('vids',vids);vSv();if(pg=='library'&&lt=='vd')go('library')}
async function vGo(){const s=($('#vq').value||'').trim();if(!s)return;const y=ytId(s);if(y){vAdd(y);return}const r=$('#vr');r.innerHTML='<div class="em">Mencari video…</div>';try{const a=await ytSearch(s,'','v');r.innerHTML=a.length?rows('vr',a):'<div class="em">Tidak ada hasil.</div>';if(a.length)playV(a,0)}catch(e){r.innerHTML=`<div class="em">${esc(ytMsg(e))}</div>`}}
async function vAdd(id){let t=mkV(id,'Video','');toast('Memuat video…');try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id));if(r.ok){const j=await r.json();t=mkV(id,j.title,j.author_name)}}catch(e){}
const ex=vids.find(v=>v.id==t.id);if(ex)t=ex;else{vids=[t,...vids].slice(0,200);ls.set('vids',vids)}playV([t],0);if(pg=='library'&&lt=='vd')go('library')}
async function delV(id){if(!await uiConfirm('Video ini akan dihapus dari daftar.',{title:'Hapus video?',ok:'Hapus',danger:1}))return;vids=vids.filter(v=>v.id!=id);ls.set('vids',vids);go(pg)}
function vBg(){if(act===yAct){$('#vo').classList.remove('on');openP();return}if(!vcur){toast('Belum ada video yang diputar');return}vbg=1;$('#vo').classList.remove('on');mvUi();toast('Mode audio aktif')}
function vBack(){vbg=0;mvUi();$('#vo').classList.add('on')}
function vTog(){try{vPlaying()?yp.pauseVideo():yp.playVideo()}catch(e){}setTimeout(mvUi,300)}
function vOff(){try{yp&&yp.stopVideo&&yp.stopVideo()}catch(e){}vcur=null;vbg=0;$('#vtt').textContent='Pilih video';$('#vch').textContent='Cari atau tempel link YouTube';mvUi();vSv()}
function vClose(){$('#vo').classList.remove('on');if(vcur&&vPlaying())vbg=1;mvUi()}
var vsh=0,pvBusy=0;
async function vFromSong(){if(cur&&cur.yt&&act===yAct){vsh=1;pm=0;rp();return}const t=cur;if(!t||pvBusy)return;pvBusy=1;const a=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio)$/i.test(t.artist)?'':t.artist,qy=(t.title+' '+a).trim();toast('Mencari video\u2026');
try{const res=await ytSearch(qy);if(!res.length){toast('Video tidak ditemukan');return}if(cur!==t)return;let pos=0;try{if(!t.radio&&isFinite(act.currentTime))pos=act.currentTime}catch(e){}vS0=pos>2?pos:0;vsh=1;pm=0;playV(res,0,1)}catch(e){toast(ytMsg(e))}finally{pvBusy=0}}
function vSync(){const h=$('#vh');if(!h)return;const vo=$('#vo'),pl=$('#pl');let s=null,z=21;if(vo&&vo.classList.contains('on')){s=$('#vos');z=23}else if(pl&&pl.classList.contains('on')&&cur&&cur.yt&&vsh&&!pm){s=$('#pvs')}
if(!s){if(h.classList.contains('on')){h.classList.remove('on');h.style.cssText=''}return}
const r=s.getBoundingClientRect(),ar=$('#app').getBoundingClientRect();if(r.width<10||r.bottom<60||r.top>innerHeight){h.classList.remove('on');return}
h.classList.add('on');h.style.zIndex=z;h.style.left=(r.left-ar.left)+'px';h.style.top=(r.top-ar.top)+'px';h.style.width=r.width+'px';h.style.height=r.height+'px'}
(function vLoop(){try{vSync()}catch(e){}requestAnimationFrame(vLoop)})();
function ovc(){const o=['kr','dr','vo','pl','sp'].map(i=>$('#'+i)).find(e=>e&&e.classList.contains('on'));if(!o)return;if(o.id=='vo')vClose();else if(o.id=='pl')clp();else if(o.id=='sp')csp();else if(o.id=='kr')krX();else drClose()}
function qs(s){if(pg!='explore')go('explore');lq=s;const i=$('#qi');if(i)i.value=s;doSearch(s)}
function vSr(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){toast('Pencarian suara tidak didukung browser ini');return}try{const r=new R();r.lang='id-ID';r.interimResults=false;r.onresult=e=>qs(e.results[0][0].transcript);r.onerror=()=>toast('Suara tidak terbaca');r.start();toast('Silakan bicara…')}catch(e){toast('Pencarian suara gagal dimulai')}}
/* ----- Trending dan rekomendasi ----- */
const TG=[['','Semua'],['Pop','Pop'],['Rock','Rock'],['Electronic','Elektronik'],['Hip-Hop/Rap','Hip-Hop'],['Jazz','Jazz'],['Lo-Fi','Lo-Fi'],['Acoustic','Akustik']];
const tgChips=()=>TG.map(x=>`<span class="chip ${tg==x[0]?'a':''}" onclick="tgSet('${x[0]}')">${x[1]}</span>`).join('');
function trBody(){return trRes===null?skel6(4):trRes==='err'?'<div class="em">Tidak bisa memuat trending.<br><a style="color:var(--p2)" onclick="trRetry()">Coba lagi</a></div>':trRes.length?rows('tr',trRes):'<div class="em">Belum ada trending.</div>'}
function trCards(){if(trRes===null)return'<div class="em" style="flex:1">Memuat…</div>';if(trRes==='err')return'<div class="em" style="flex:1">Trending belum bisa dimuat.<br><a style="color:var(--p2)" onclick="trRetry()">Coba lagi</a></div>';return(lists.tc=trRes.slice(0,12)).map((t,i)=>`<div class="cd" onclick="P('tc',${i})"><img loading="lazy" src="${esc(cov(t))}"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>`).join('')}
function trR(){const a=$('#tr');if(a)a.innerHTML=trBody();const b=$('#trh');if(b)b.innerHTML=trCards();const c=$('#tgc');if(c)c.innerHTML=tgChips()}
async function trend(g){const k=g||'';if(trBusy===k)return;trBusy=k;let res;const ck='trc_'+(k||'all');try{res=(await ytSearch(k?k.replace('/',' ')+' lagu populer':'lagu populer indonesia')).slice(0,25);if(res.length)ls.set(ck,{t:Date.now(),a:res})}catch(e){const c=ls.get(ck,null);res=c&&Array.isArray(c.a)&&c.a.length?c.a:'err'}if(trBusy!==k)return;trBusy=null;trRes=res;trR()}
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
// v4.30: bersihkan data dari luar (file cadangan, sinkron akun) sebelum disimpan. Lagu dengan alamat non-https dibuang
// (mencegah javascript: lewat tombol unduh), cover hanya https atau data:image. Data lain dibiarkan apa adanya.
const okImg=u=>okU(u)||/^data:image\//i.test(u||'')?u:'';
function scrubTr(t){if(!t||typeof t!='object')return t;if(t.loc||t.yt)return t;if(t.url&&!okU(t.url))return null;if(t.img&&!okImg(t.img))t=Object.assign({},t,{img:''});return t}
function scrubData(d){const o=Object.assign({},d),A=Array.isArray;
if(A(o.favs))o.favs=o.favs.map(scrubTr).filter(Boolean);
if(A(o.hist))o.hist=o.hist.map(scrubTr).filter(Boolean);
if(A(o.pls))o.pls=o.pls.filter(p=>p&&typeof p=='object').map(p=>Object.assign({},p,{n:String(p.n==null?'':p.n).slice(0,60),tr:A(p.tr)?p.tr.map(scrubTr).filter(Boolean):[]},p.img?{img:okImg(p.img)}:{}));
if(A(o.fol))o.fol=o.fol.filter(x=>x&&typeof x=='object').map(x=>x.img?Object.assign({},x,{img:okImg(x.img)}):x);
return o}
function scrubBk(k,v){try{const n=k.slice(3),o=scrubData({[n]:JSON.parse(v)});return JSON.stringify(o[n])}catch(e){return v}}
function cleanTr(x){if(!x||typeof x!='object'||x.id==null)return null;if(x.loc)return{id:String(x.id),loc:1};if(x.yt){const v=vidOf(x);return v&&/^[\w-]{11}$/.test(v)?mkV(v,x.title,x.artist):null}if(!okU(x.url))return null;return{id:String(x.id).slice(0,80),title:String(x.title||'Tanpa judul').slice(0,200),artist:String(x.artist||'Tidak diketahui').slice(0,100),img:okU(x.img)||/^data:image\//.test(x.img||'')?x.img:'',url:x.url,dl:x.dl,sn:x.sn,h:hh(x.title||''),...(x.radio?{radio:1}:{})}}
async function plImp(f){if(!f)return;try{const j=JSON.parse(await f.text());const n=String(j.n||j.name||'Playlist impor').slice(0,60),tr=(Array.isArray(j.tr)?j.tr:[]).map(cleanTr).filter(Boolean);if(!tr.length){toast('File playlist tidak berisi lagu yang valid');return}const p={n,tr};if(/^data:image\//.test(j.img||''))p.img=j.img;pls.push(p);ls.set('pls',pls);lt='pl';go('library');toast('Playlist diimpor: '+tr.length+' lagu')}catch(e){toast('File playlist tidak valid')}}
function plShare(i){const p=pls[i];if(!p)return;const a=p.tr.map(rs).filter(t=>t&&!t.loc&&(t.yt||okU(t.url)));if(!a.length){toast('Hanya lagu online atau video yang bisa dibagikan lewat tautan');return}
const raw=JSON.stringify({n:p.n,t:a.map(t=>[t.id,t.title,t.artist,t.url||'',okU(t.img)?t.img:'',t.yt?vidOf(t):'',t.radio?1:0])}),by=new TextEncoder().encode(raw);let s='';by.forEach(c=>s+=String.fromCharCode(c));const enc=btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
if(enc.length>7000){toast('Playlist terlalu besar untuk tautan. Pakai Ekspor.');return}
const url=location.origin+location.pathname+'?pl='+enc;if(navigator.share){navigator.share({title:p.n,text:'Dengarkan playlist "'+p.n+'" di Loopify',url}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>toast('Tautan disalin'),()=>toast('Gagal menyalin tautan'))}else uiPrompt('Salin tautan ini dan bagikan.',url,{title:'Tautan playlist',ok:'Tutup',readonly:1,max:8000})}
async function plLink(enc){try{const s=atob(enc.replace(/-/g,'+').replace(/_/g,'/')),by=Uint8Array.from(s,c=>c.charCodeAt(0)),j=JSON.parse(new TextDecoder().decode(by)),tr=(j.t||[]).slice(0,100).map(a=>cleanTr(a[5]?{id:a[0],yt:1,vid:a[5],title:a[1],artist:a[2]}:{id:a[0],title:a[1],artist:a[2],url:a[3],img:a[4],radio:a[6]})).filter(Boolean);if(!tr.length)return;const n=String(j.n||'Playlist').slice(0,60);if(await uiConfirm('"'+n+'" ('+tr.length+' lagu) akan ditambahkan ke Library.',{title:'Tambah playlist?',ok:'Tambahkan',icon:'🎶'})){pls.push({n,tr});ls.set('pls',pls);lt='pl';go('library');toast('Playlist ditambahkan')}}catch(e){toast('Tautan playlist tidak valid')}}
function goBk(){rbP=0;sub(shd('Cadangan Data')+`<p style="color:var(--mu);font-size:13px;line-height:1.6;margin:4px 0 14px">Ekspor menyimpan favorit, playlist, riwayat, lirik, pengaturan, dan statistik ke satu file. File lagu di perangkat tidak ikut karena ukurannya besar.</p><button class="btn" onclick="bkExp()">Ekspor Data</button><button class="btn g" style="margin-top:10px" onclick="$('#fbk').click()">Pulihkan dari File</button>`)}
function bkExp(){ls.set('stt',stt);const d={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ma_'))d[k]=localStorage.getItem(k)}}catch(e){}dl('loopify-backup-'+new Date().toISOString().slice(0,10)+'.json',{app:'midnight-acoustic',v:1,data:d});toast('Cadangan diekspor')}
async function bkImp(f){if(!f)return;try{const j=JSON.parse(await f.text());if(j.app!='midnight-acoustic'||!j.data)throw 0;if(!await uiConfirm('Data saat ini akan ditimpa dengan isi file cadangan.',{title:'Pulihkan data?',ok:'Pulihkan',danger:1,icon:'💾'}))return;window._noSave=1;Object.keys(j.data).forEach(k=>{if(k.startsWith('ma_')&&!/^ma_sync[TB]$/.test(k)&&typeof j.data[k]=='string')localStorage.setItem(k,scrubBk(k,j.data[k]))});location.reload()}catch(e){toast('File cadangan tidak valid')}}
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
<div class="sec"><h3>Lagu Teratas</h3></div>${pl.length?pl.map(x=>`<div style="padding:8px 4px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.n)}</b><small>${fmtT(x.s)}</small></div><small>${esc(x.a)}${x.c?' · '+(+x.c||0)+'x diputar':''}</small>${bar(x.s,pl[0].s)}</div>`).join(''):'<div class="em">Belum ada data. Putar beberapa lagu dulu.</div>'}
<div class="sec"><h3>Artis Teratas</h3></div>${ar.length?ar.map(x=>`<div style="padding:8px 4px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.n)}</b><small>${fmtT(x.s)}</small></div>${bar(x.s,ar[0].s)}</div>`).join(''):'<div class="em">Belum ada data.</div>'}`)}
/* ----- Pengaturan ----- */
function applyCfg(){const d=document.documentElement;d.classList.toggle('eco',!!cfg.eco);d.style.setProperty('--lf',cfg.lf||1);nvA();th()}
function goSet(){rbP=0;setR()}
function setR(){const on=k=>k=='ar'?cfg.ar!==false:k=='nv'?cfg.nv!==false:(k=='npn'||k=='lyn'||k=='dmx'||k=='rsm')?cfg[k]!==false:!!cfg[k];
const sw=(k,l,s)=>`<div class="ft" onclick="cfgTg('${k}')"><div>${l}${s?`<br><small>${s}</small>`:''}</div><i class="sw ${on(k)?'on':''}"></i></div>`;
const v1=v=>typeof v=='number'?v:"'"+v+"'";
const ch=(k,arr)=>`<div class="chips">${arr.map(x=>`<span class="chip ${(cfg[k]==null?arr[0][2]:cfg[k])==x[0]?'a':''}" onclick="cfgSet('${k}',${v1(x[0])})">${x[1]}</span>`).join('')}</div>`;
sub(shd('Pengaturan')+`<div class="ft" onclick="setName()"><span>👤</span><div>Nama<br><small>${esc(nm())}</small></div></div>
<div class="sec"><h3>Tema</h3></div>${ch('theme',[['auto','Otomatis'],['dark','Gelap'],['light','Terang'],['amoled','AMOLED'],['neutral','Netral']])}
<div class="sec"><h3>Jenis musik</h3></div>${ch('src',[['all','Musik'],['radio','Radio']])}
<div class="sec"><h3>Pemutar</h3></div>${sw('fade','Transisi halus','Fade in/out di awal dan akhir lagu')}${sw('nv','Normalisasi volume','Meratakan volume lagu dari perangkat')}${sw('npn','Banner "Sedang diputar"','Muncul di atas saat lagu baru dimulai')}${sw('lyn','Lirik di notifikasi','Baris lirik tampil di layar kunci dan bayangan notifikasi')}${sw('dmx','Daily Mix di beranda','Campuran lagu dari artis yang sering kamu dengar')}${sw('rsm','Lanjutkan dari perangkat lain','Tawarkan lagu terakhir yang diputar di akunmu')}${sw('ar','Putar otomatis serupa','Saat antrean lagu online habis')}
<div class="sec"><h3>Ukuran lirik</h3></div>${ch('lf',[[.85,'Kecil'],[1,'Normal'],[1.2,'Besar'],[1.4,'Sangat besar']])}
<div class="sec"><h3>Pengingat waktu dengar</h3></div>${ch('rem',[[0,'Mati'],[30,'30 mnt'],[60,'60 mnt'],[90,'90 mnt'],[120,'120 mnt']])}
<div class="sec"><h3>Lainnya</h3></div>${sw('eco','Mode hemat','Matikan animasi dan efek blur')}<div class="ft" onclick="goBk()"><span>💾</span><div>Cadangan Data</div></div><div class="ft" onclick="histClr()"><span>🗑</span><div>Hapus riwayat putar</div></div>`)}
function cfgTg(k){cfg[k]=!(k=='ar'?cfg.ar!==false:k=='nv'?cfg.nv!==false:(k=='npn'||k=='lyn'||k=='dmx'||k=='rsm')?cfg[k]!==false:!!cfg[k]);ls.set('cfg',cfg);applyCfg();setR();if(k=='dmx')try{go(pg)}catch(e){}}
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
const OB=[['🎧','Loopify','Musik dan video gratis, tanpa iklan. Bisa dibuka offline.'],['📁','Bawa musikmu','Tambahkan lagu dari perangkat, atau cari lagu online dan radio.'],['✨','Siapa namamu?','Biar aplikasi terasa lebih personal.']];let obI=0;
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
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').then(reg=>{if(reg.waiting&&navigator.serviceWorker.controller)updShow(reg);const chk=()=>{try{reg.update().catch(()=>{})}catch(e){}};setInterval(chk,30*60e3);document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()});reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state=='installed'&&navigator.serviceWorker.controller)updShow(reg)})})}).catch(()=>{})}}
document.readyState=='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
;

/* ==== extra.js ==== */
try{
/* ===== v3.1: sumber online campuran, pencarian gabungan + riwayat, halaman Artis, edit playlist, radio ===== */
(function(){
/* Migrasi sekali: pengguna lama yang masih di Audius dipindah ke "Semua" */
if(!ls.get('v31',0)){ls.set('v31',1);if(cfg.src=='audius'){cfg.src='all';ls.set('cfg',cfg)}}
smode='a';

const SRC=[['radio','Radio']];
const GENERIC=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
const uniq=a=>{const s=new Set();return a.filter(t=>t&&t.id!=null&&!s.has(t.id)&&s.add(t.id))};
const mineAll=()=>uniq([...songs,...favs.map(rs),...hist.map(rs),...pls.flatMap(p=>p.tr.map(rs))]).filter(t=>!t.yt);

/* ---------- Pencarian: sumber, kesalahan, gabungan, riwayat ---------- */
srch=async function(s){
  if(cfg.src!='radio')return[];
  const r=await fetch('/api/music?src='+cfg.src+'&q='+encodeURIComponent(s));
  if(r.status==501){toast('Sumber ini belum diaktifkan di server. Isi key-nya di Vercel');return[]}
  if(!r.ok)throw 0;
  return arrOf(await r.json()).map(x=>({...x,h:hh(x.title)}));
};

let agH='',sord='';
window.setOrd=k=>{sord=k;lres=null;agH='';go('explore');if(lq.trim()&&smode!='v')doSearch(lq)};
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
  const [on,vd]=await Promise.allSettled([srch(s),ytSearch(s,sord,2)]);
  if(lq!==s||smode!='a')return;
  const o=on.status=='fulfilled'?on.value.slice(0,20):[],v=vd.status=='fulfilled'?vd.value.slice(0,o.length<8?40:10):[];
  lres=null;
  const sec=t=>`<div class="sec"><h3>${t}</h3></div>`;
  agH=(loc.length?sec('Di Library')+rows('sl',loc):'')+(o.length?rows('sr',o):'')+(v.length?rows('sv',v):'');
  if(!agH)agH=vd.status=='rejected'?'<div class="em">'+esc(ytMsg(vd.reason))+'</div>':on.status=='rejected'?'<div class="em">Tidak bisa terhubung. Periksa internet atau ganti sumber.</div>':'<div class="em">Tidak ada hasil. Coba kata kunci lain.</div>';
  else shAdd(s);
  r.innerHTML=agH;shR();
};

window.setMode=m=>{smode=m;lres=null;agH='';go('explore');if(lq.trim())doSearch(lq)};
window.setSrc=k=>{cfg.src=cfg.src==k?'all':k;ls.set('cfg',cfg);lres=null;agH='';go('explore');if(lq.trim()&&smode!='v')doSearch(lq)};

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
    `<div class="chips">${[['a','Semua'],['v','Video']].map(x=>`<span class="chip ${smode==x[0]?'a':''}" onclick="setMode('${x[0]}')">${x[1]}</span>`).join('')}</div>`+
    (smode!='v'?`<div class="chips">${[['','Relevan'],['viewCount','Terpopuler'],['date','Terbaru']].map(x=>`<span class="chip ${sord==x[0]?'a':''}" onclick="setOrd('${x[0]}')">${x[1]}</span>`).join('')}</div>`:'')+(smode!='v'?`<div class="chips">${SRC.map(x=>`<span class="chip ${cfg.src==x[0]?'a':''}" onclick="setSrc('${x[0]}')">${x[1]}</span>`).join('')}</div>`:''));
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
  return a.length?a.map((x,i)=>`<div class="rw" onclick="artistPg(AN(${i}))"><img src="${esc(cov(x.t))}" style="border-radius:50%"><div><b>${esc(x.n)}</b><small>${+x.c||0} lagu</small></div></div>`).join(''):'<div class="em">Belum ada artis. Tambahkan lagu atau tandai favorit dulu.</div>';
};
window.artistPg=async function(n){
  n=String(n||'').trim();
  if(!n||GENERIC.test(n)){toast('Halaman artis tidak tersedia untuk ini');return}
  clp();
  const k=n.toLowerCase(),mine=mineAll().filter(t=>String(t.artist||'').trim().toLowerCase()==k);
  lists.am=mine;
  sub(`${shd(esc(n))}<div style="text-align:center;margin:4px 0 14px"><img src="${esc(cov(mine[0]||{h:hh(n)}))}" style="width:112px;height:112px;border-radius:50%;object-fit:cover;box-shadow:var(--sh)"><h2 style="margin-top:10px">${esc(n)}</h2><small>${mine.length?mine.length+' lagu di perangkat dan koleksimu':'Belum ada lagu di koleksimu'}</small></div>${mine.length?`<button class="btn" style="margin-bottom:8px" onclick="play(lists.am,0);openP()">▶ Putar Semua</button>${rows('am',mine)}`:''}<div class="sec"><h3>Lagu Online</h3></div><div id="ao"><div class="em">Memuat…</div></div>`);
  try{
    let a=await ytSearch(n);
    const m=a.filter(x=>String(x.artist||'').toLowerCase().includes(k));
    a=(m.length?m:a).slice(0,15);
    const e=$('#ao');if(!e)return;
    lists.ao=a;
    e.innerHTML=a.length?`<button class="btn g" style="margin-bottom:8px" onclick="play(lists.ao,0);openP()">▶ Putar Semua</button>${rows('ao',a)}`:'<div class="em">Tidak ada lagu online untuk artis ini.</div>';
  }catch(x){const e=$('#ao');if(e)e.innerHTML='<div class="em">'+esc(ytMsg(x))+'</div>'}
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

/* ---------- Setelah memilih lagu dari hasil pencarian, antrean diisi lagu terkait (seperti YouTube) ---------- */
(function(){
  const norm=s=>String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const BAD=/(full album|nonstop|non stop|kumpulan|compilation|playlist|\b\d+\s*(jam|hours?|hrs?)\b)/i;
  const GEN=/^(YouTube|Tidak diketahui|Lagu Saya|Radio)$/i;
  const _P0=P;
  P=function(k,i){
    const t=lists[k]&&lists[k][i];
    if(k!='sv'||!t||!t.yt)return _P0(k,i);
    lists.sv1=[t];          // putar lagu pilihan dulu, lagu terkait menyusul di antrean
    _P0('sv1',0);
    fill(t);
  };
  async function fill(t){
    try{
      const base=GEN.test(String(t.artist||'').trim())?t.title:t.artist;
      const r=await ytSearch(String(base||'').trim()+' lagu');
      if(cur!==t)return;      // lagu sudah diganti sebelum saran selesai dimuat
      const seen=new Set([norm(t.title)]);
      const rel=r.filter(x=>{if(!x||x.id==t.id||BAD.test(x.title))return false;const n=norm(x.title);if(!n||seen.has(n))return false;seen.add(n);return true}).slice(0,20);
      if(!rel.length)return;
      q=[t,...rel];qi=0;vq=[t,...rel];vi=0;
      try{rp()}catch(e){}
    }catch(e){}
  }
})();

/* ---------- Saran pencarian saat mengetik (ala YouTube/Spotify): koleksi sendiri + saran online gratis ---------- */
(function(){
  var st=document.createElement('style');
  st.textContent='.srch{position:relative}#x24{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:60;max-height:58vh;overflow:auto;border-radius:16px;background:var(--bg);border:1px solid var(--b);box-shadow:0 12px 32px rgba(0,0,0,.35)}#x24 .x24r{display:flex;align-items:center;gap:10px;padding:11px 14px;font-size:14px;color:var(--tx);cursor:pointer}#x24 .x24r img{width:34px;height:34px;border-radius:8px;object-fit:cover;flex:none}#x24 .x24r b{display:block;font-weight:600}#x24 .x24r small{display:block;color:var(--mu);font-size:11px}#x24 .x24r span{flex:1;min-width:0}';
  document.head.appendChild(st);
  var cache={},ctl=null,tm=null,cq='';
  function box(){var s=document.querySelector('.srch');if(!s)return null;var b=s.querySelector('#x24');if(!b){b=document.createElement('div');b.id='x24';s.appendChild(b)}return b}
  function hide(){var b=document.getElementById('x24');if(b)b.remove()}
  window.x24H=hide;
  function loc(q){
    var k=q.toLowerCase(),seen={},out=[];
    [].concat(songs||[],hist.map(rs),favs.map(rs)).forEach(function(t){
      if(!t||!t.title||out.length>=3||seen[t.id])return;
      if((t.title+' '+(t.artist||'')).toLowerCase().indexOf(k)<0)return;
      seen[t.id]=1;out.push(t);
    });
    return out;
  }
  function paint(q,rem){
    var L=loc(q),R=(rem||[]).filter(function(s){return s.toLowerCase()!=q.toLowerCase()}).slice(0,8);
    if(!L.length&&!R.length){hide();return}
    var b=box();if(!b)return;
    lists.x24=L;window.x24S=R;
    b.innerHTML=L.map(function(t,i){return'<div class="x24r" onclick="x24P('+i+')"><img src="'+esc(cov(t))+'" alt=""><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist||'')+' · di koleksimu</small></div></div>'}).join('')+
      R.map(function(s,i){return'<div class="x24r" onclick="x24G('+i+')">🔎 <span>'+esc(s)+'</span></div>'}).join('');
  }
  window.x24G=function(i){var s=(window.x24S||[])[i];if(!s)return;clearTimeout(dt);hide();qs(s)};
  window.x24P=function(i){hide();P('x24',i)};
  function ask(q){
    if(cache[q]){paint(q,cache[q]);return}
    if(ctl)ctl.abort();
    ctl=new AbortController();
    fetch('/api/suggest?q='+encodeURIComponent(q),{signal:ctl.signal}).then(function(r){return r.ok?r.json():[]}).then(function(a){
      a=Array.isArray(a)?a:[];cache[q]=a;if(cq==q&&document.getElementById('qi'))paint(q,a);
    }).catch(function(){});
  }
  document.addEventListener('input',function(e){
    var t=e.target;if(!t||t.id!='qi')return;
    var q=t.value.trim();cq=q;clearTimeout(tm);
    if(!q){hide();return}
    paint(q,cache[q]);
    tm=setTimeout(function(){ask(q)},150);
  },true);
  document.addEventListener('keydown',function(e){
    var t=e.target;if(!t||t.id!='qi'||e.key!='Enter')return;
    clearTimeout(dt);hide();t.blur();var q=t.value.trim();if(q)qs(q);
  },true);
  document.addEventListener('click',function(e){
    if(!document.getElementById('x24'))return;
    if(!(e.target&&e.target.closest&&e.target.closest('.srch')))hide();
  },true);
})();
}catch(e){console.error('[loopify] extra.js',e)}

/* ==== extra2.js ==== */
try{
/* ===== v3.2: pilih banyak lagu + impor playlist Spotify/YouTube ===== */
(function(){
/* ---------- Pilih banyak lagu ---------- */
const SEL={on:0,m:new Map(),k:new Map()};let PLOPEN=-1;
const app=$('#app');
const bar=document.createElement('div');bar.id='sb';app.appendChild(bar);
const sheet=document.createElement('div');sheet.id='ss';sheet.onclick=e=>{if(e.target==sheet)sheet.classList.remove('on')};app.appendChild(sheet);

const okP=t=>t&&!t.nf;
const pick=kind=>{
  const a=[...SEL.m.values()];
  const r=kind=='play'?a.filter(okP):kind=='queue'?a.filter(t=>okP(t)&&!t.yt):a.filter(t=>!t.yt);
  if(r.length<a.length)toast((a.length-r.length)+' item dilewati ('+(kind=='play'?'belum ada versi putar':'video tidak bisa masuk '+(kind=='queue'?'antrean':kind=='fav'?'Favorit':'playlist'))+')');
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
  if(SEL.m.has(t.id))SEL.m.delete(t.id);else{SEL.m.set(t.id,t);SEL.k.set(t.id,m[1])}
  hp(8);paint();barR();
},true);

window.selTog=function(){
  SEL.on=SEL.on?0:1;SEL.m.clear();document.body.classList.toggle('selm',!!SEL.on);sheet.classList.remove('on');
  if(SEL.on){barR();paint();toast('Ketuk lagu untuk memilih')}
};
window.selAll=function(){
  const els=[...document.querySelectorAll('.rw[onclick^="P("]')];const ts=[];
  els.forEach(el=>{const m=el.getAttribute('onclick').match(/^P\('(\w+)',(\d+)\)/);const t=m&&lists[m[1]]&&lists[m[1]][+m[2]];if(t){ts.push(t);SEL.k.set(t.id,m[1])}});
  if(!ts.length)return;
  const all=ts.every(t=>SEL.m.has(t.id));
  ts.forEach(t=>all?SEL.m.delete(t.id):SEL.m.set(t.id,t));paint();barR();
};
async function selDel(){
  const a=[...SEL.m.values()];
  const loc=[],vs=[],fv=[],hs=[];
  a.forEach(t=>{
    const k=SEL.k.get(t.id)||'';
    if(k=='fv'||k=='pf'){if(isF(t))fv.push(t);return}
    if(k=='rc'){hs.push(t);return}
    if(t.loc&&songs.some(s=>s.id==t.id))loc.push(t);
    else if(t.yt&&vids.some(v=>v.id==t.id))vs.push(t);
  });
  const total=loc.length+vs.length+fv.length+hs.length;
  if(!total){toast('Lagu dari pencarian atau rekomendasi tidak bisa dihapus. Simpan ke Favorit/Playlist dulu.');return}
  const parts=[];
  if(loc.length)parts.push(loc.length+' lagu dihapus dari aplikasi (file asli tidak disentuh)');
  if(vs.length)parts.push(vs.length+' video dihapus dari daftar');
  if(fv.length)parts.push(fv.length+' lagu dikeluarkan dari Favorit');
  if(hs.length)parts.push(hs.length+' lagu dihapus dari riwayat');
  if(!await uiConfirm(parts.join('. ')+'.',{title:'Hapus '+total+' item?',ok:'Hapus',danger:1}))return;
  for(const t of loc){try{await tx('readwrite',o=>o.delete(t.id))}catch(e){}if(cur&&cur.id==t.id){A.pause();cur=null;clp()}}
  if(loc.length){const ids=new Set(loc.map(t=>t.id));songs=songs.filter(s=>!ids.has(s.id))}
  if(vs.length){const vi2=new Set(vs.map(t=>t.id));vids=vids.filter(v=>!vi2.has(v.id));ls.set('vids',vids)}
  if(fv.length){const fi=new Set(fv.map(t=>t.id));favs=favs.filter(f=>!fi.has(f.id));ls.set('favs',favs)}
  if(hs.length){const hi=new Set(hs.map(t=>t.id));hist=hist.filter(x=>!hi.has(x.id));ls.set('hist',hist)}
  toast(total+' item dihapus');SEL.m.clear();barR();
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
  return null; // Audius dihapus: pencocokan lewat YouTube (ytFind)
}
window.impOpen=function(){
  clp();
  sub(`${shd('Impor Playlist')}<p style="color:var(--mu);font-size:13px;margin:4px 0 12px">Tempel link playlist atau album Spotify, atau link playlist YouTube. Lagu dicocokkan ke versi yang bisa diputar penuh. Playlist harus publik.</p><input class="in" id="iu" placeholder="open.spotify.com/playlist/… atau youtube.com/playlist?list=…"><div style="color:var(--mu);font-size:12px;text-align:center;margin:12px 0">atau tempel daftar lagu, satu per baris</div><textarea class="in" id="it" rows="6" placeholder="Judul - Artis"></textarea><button class="btn" id="imb" style="margin-top:12px" onclick="impRun()">Mulai Impor</button><div id="ip" style="margin-top:14px"></div>`);
};
const ytKey=w=>'impyt:'+clean(w.title+' '+w.artist);
async function ytFind(w){
  const k=ytKey(w);
  try{const c=JSON.parse(localStorage.getItem(k)||'null');if(c&&c.vid)return mkV(c.vid,c.title,c.artist)}catch(e){}
  const q=((w.title+' '+w.artist).trim()).slice(0,90);
  const a=await ytSearch(q);
  const t=a&&a[0];
  if(t){try{localStorage.setItem(k,JSON.stringify({vid:t.vid,title:t.title,artist:t.artist}))}catch(e){}}
  return t||null;
}
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
    const ytf=new Array(items.length);
    const miss=[];items.forEach((w,k)=>{if(!res[k]&&!(from=='youtube'&&w.id))miss.push(k)});
    if(miss.length){
      const cap=miss.slice(0,40);let j=0,d2=0,stop=0;
      const w2=async()=>{while(j<cap.length&&!stop){const k=cap[j++];try{ytf[k]=await ytFind(items[k])}catch(e){if(e&&(e.status==501||e.status==429||e.status==404))stop=1}d2++;prog('Mencari versi YouTube '+d2+' dari '+cap.length+'…',d2/cap.length*100)}};
      await Promise.all([w2(),w2()]);
    }
    const tr=[],seen=new Set(),skipped=[];let m=0,v=0;
    items.forEach((w,k)=>{
      let t=res[k];
      if(t)m++;else if(from=='youtube'&&w.id){t=mkV(w.id,w.rt,w.ra);v++}else if(ytf[k]){t=ytf[k];v++}
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
}catch(e){console.error('[loopify] extra2.js',e)}

/* ==== extra3.js ==== */
try{
/* Loopify v3.4 - Riwayat dengar + statistik mingguan (dimuat setelah extra2.js)
   Data disimpan lokal: ma_wk (detik per hari) dan ma_hlog (riwayat lagu, maks 300). Tidak mengubah data lama. */
(function(){
  var DAY=86400000,HN=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  var wk=ls.get('wk',{}),hlog=ls.get('hlog',[]),lastSave=0;
  function dk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function saveWk(force){var n=Date.now();if(!force&&n-lastSave<15000)return;lastSave=n;var ks=Object.keys(wk).sort();if(ks.length>60)ks.slice(0,ks.length-60).forEach(function(k){delete wk[k]});ls.set('wk',wk)}
  /* hitung detik mendengar per hari: bungkus stat() lama, ambil selisih stt.tot */
  var _stat=stat;
  stat=function(a){var b=stt.tot;_stat(a);var d=stt.tot-b;if(d>0&&d<5){var k=dk();wk[k]=(wk[k]||0)+d;saveWk()}};
  document.addEventListener('visibilitychange',function(){saveWk(true)});
  addEventListener('pagehide',function(){saveWk(true)});
  /* catat riwayat lagu: bungkus play() lama */
  var _play=play;
  play=function(list,i){_play(list,i);try{
    if(!cur||cur.yt||(!cur.loc&&!cur.url))return;
    var n=Date.now(),f=hlog[0];
    if(f&&f.t&&f.t.id==cur.id&&n-f.ts<30000)return;
    hlog.unshift({ts:n,t:svt(cur)});if(hlog.length>300)hlog.length=300;ls.set('hlog',hlog);
  }catch(e){}};
  /* menu: sisipkan "Riwayat & Mingguan" sebelum Statistik Dengar */
  function inject(){var v=$('#v');if(!v||v.querySelector('[data-hist]'))return;
    var s=v.querySelector('.ft[onclick="goStat()"]');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-hist','1');d.setAttribute('onclick','goHist()');
    d.innerHTML='<span>\uD83D\uDCC5</span><div>Riwayat &amp; Mingguan</div>';s.parentNode.insertBefore(d,s)}
  var _go=go;go=function(p){_go(p);inject()};inject();
  function fmt(sec){var h=Math.floor(sec/3600),m=Math.round(sec%3600/60);if(m==60){h++;m=0}return h?h+' j '+m+' mnt':m+' mnt'}
  function label(k){var t=dk(),y=dk(new Date(Date.now()-DAY));if(k==t)return 'Hari ini';if(k==y)return 'Kemarin';var p=k.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
  window.goHist=function(){
    saveWk(true);var now=new Date(),days=[],i,max=1,tot=0;
    for(i=6;i>=0;i--){var d=new Date(now.getTime()-i*DAY),k=dk(d),s=wk[k]||0;days.push({k:k,n:HN[d.getDay()],s:s});tot+=s;if(s>max)max=s}
    var streak=0;for(i=days.length-1;i>=0;i--){if(days[i].s>=30)streak++;else if(i==days.length-1)continue;else break}
    var wkStart=Date.now()-7*DAY,cnt={};hlog.forEach(function(e){if(e.ts>=wkStart&&e.t){var a=(rs(e.t)||e.t).artist;if(a)cnt[a]=(cnt[a]||0)+1}});
    var top=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]})[0];
    var bars=days.map(function(d){var h=Math.max(d.s?6:2,Math.round(d.s/max*84));
      return '<div style="flex:1;text-align:center"><div style="height:90px;display:flex;align-items:flex-end;justify-content:center"><div style="width:70%;height:'+h+'px;border-radius:8px 8px 4px 4px;background:'+(d.k==dk()?'var(--p2)':'var(--p)')+';opacity:'+(d.s?1:.25)+'"></div></div><small style="font-size:10px">'+d.n+'</small></div>'}).join('');
    var h='<div class="pcard" style="text-align:center"><small>7 hari terakhir</small><h1 style="margin-top:4px">'+fmt(tot)+'</h1><small>Rata-rata '+fmt(tot/7)+' per hari'+(streak>1?' · \uD83D\uDD25 '+streak+' hari beruntun':'')+'</small></div>'
      +'<div class="pcard" style="margin-top:12px"><div style="display:flex;gap:4px">'+bars+'</div>'+(top?'<small style="display:block;margin-top:10px;text-align:center">Artis minggu ini: <b>'+esc(top)+'</b></small>':'')+'</div>'
      +'<div class="sec"><h3>Riwayat Lagu</h3></div>';
    var items=[];hlog.slice(0,100).forEach(function(e){var t=rs(e.t);if(t)items.push({ts:e.ts,t:t})});
    lists.hl=items.map(function(x){return x.t});
    if(!items.length)h+='<div class="em">Belum ada riwayat. Lagu yang kamu putar akan muncul di sini.</div>';
    else{var g='';items.forEach(function(x,j){var k=dk(new Date(x.ts));if(k!=g){g=k;h+='<small style="display:block;margin:12px 0 4px;color:var(--p2);font-weight:700">'+label(k)+'</small>'}h+=row('hl',x.t,j)});
      h+='<button class="btn g" style="margin-top:16px" onclick="uiConfirm(\'Semua riwayat lagu akan dihapus.\',{title:\'Hapus riwayat?\',ok:\'Hapus\',danger:1}).then(function(o){if(o)ma3Clr()})">Hapus Riwayat</button>'}
    sub(shd('Riwayat &amp; Mingguan')+h)};
  window.ma3Clr=function(){hlog=[];ls.set('hlog',hlog);goHist()};
})();
}catch(e){console.error('[loopify] extra3.js',e)}

/* ==== extra4.js ==== */
try{
/* Loopify v3.5 - Daftar & Masuk (username/email + password, email diverifikasi kode Gmail). Dimuat setelah extra3.js.
   Sesi disimpan di localStorage kunci "mx_auth" (bukan awalan ma_), jadi tidak ikut Cadangan Data. */
(function(){
  var KEY='mx_auth',SKIP='mx_authskip',tm=0,st={step:'login',email:'',busy:0};
  function rd(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
  function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function rm(k){try{localStorage.removeItem(k)}catch(e){}}
  function sess(){var a=rd(KEY);return a&&a.email&&a.session&&a.exp>Date.now()?a:null}
  function api(body){
    return fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw{status:r.status,msg:j.error||'Terjadi kesalahan'};return j})},
        function(){throw{status:0,msg:'Tidak ada koneksi atau server belum aktif'}});
  }
  function css(){
    if(document.getElementById('lgcss'))return;
    var s=document.createElement('style');s.id='lgcss';
    s.textContent='#lg{position:absolute;inset:0;z-index:95;display:grid;place-items:center;padding:24px;overflow-y:auto;background:radial-gradient(80% 40% at 80% 0,var(--o1),transparent 70%),radial-gradient(80% 40% at 0 100%,var(--o2),transparent 70%),var(--bg);transition:opacity .35s}'
    +'#lg.x{opacity:0;pointer-events:none}#lg .lgc{width:100%;max-width:360px;text-align:center;margin:auto}'
    +'#lg h2{margin:14px 0 6px;font-size:22px}#lg p{margin:0 0 18px;color:var(--mu);font-size:13px;line-height:1.5}'
    +'#lg .in{text-align:left;font-size:15px;margin-bottom:10px}#lg .in.cd{text-align:center;font-size:26px;letter-spacing:.45em;text-indent:.45em;font-weight:700}'
    +'#lg .er{min-height:18px;margin:0 0 8px;color:#ff8a8a;font-size:12px}'
    +'#lg .lk{display:block;margin-top:14px;font-size:12px;color:var(--mu);cursor:pointer;background:none;border:0;width:100%}#lg .lk[disabled]{opacity:.5;cursor:default}#lg .lk b{color:var(--p2)}';
    document.head.appendChild(s);
  }
  var $i=function(id){return document.getElementById(id)};
  function field(id,ph,type,ac,val){return '<input class="in" id="'+id+'" type="'+type+'" autocomplete="'+ac+'" placeholder="'+ph+'" value="'+esc(val||'')+'" autocapitalize="none" spellcheck="false">'}
  function on(id,fn){var e=$i(id);if(e)e.onclick=fn}
  function enter(fn){var l=document.querySelectorAll('#lg .in');for(var i=0;i<l.length;i++)l[i].onkeydown=function(e){if(e.key=='Enter')fn()}}
  function go2(s){st.step=s;clearInterval(tm);view()}
  function view(){
    var c=document.querySelector('#lg .lgc');if(!c)return;var L=typeof logo!=='undefined'?logo:'',s=st.step;
    if(s=='login'){
      c.innerHTML=L+'<h2>Masuk</h2><p>Masuk dengan username atau Gmail dan password.</p>'
        +field('lgi','Username atau Gmail','text','username')+field('lgp','Password','password','current-password')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Masuk</button>'
        +'<button class="lk" id="lgf">Lupa password?</button><button class="lk" id="lgg">Belum punya akun? <b>Daftar</b></button><button class="lk" id="lgs">Lanjut tanpa masuk</button>';
      on('lgb',login);on('lgf',function(){go2('rst')});on('lgg',function(){go2('reg')});on('lgs',skip);enter(login);
    }else if(s=='reg'){
      c.innerHTML=L+'<h2>Daftar</h2><p>Buat akun. Kami kirim kode ke Gmail kamu untuk verifikasi.</p>'
        +field('lgu','Username (huruf kecil, angka, . atau _)','text','username')+field('lge','nama@gmail.com','email','email',st.email)+field('lgp','Password (min. 8 karakter)','password','new-password')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Kirim Kode</button>'
        +'<button class="lk" id="lgg">Sudah punya akun? <b>Masuk</b></button><button class="lk" id="lgs">Lanjut tanpa masuk</button>';
      on('lgb',regStart);on('lgg',function(){go2('login')});on('lgs',skip);enter(regStart);
    }else if(s=='regc'||s=='rstc'){
      var rs=s=='rstc';
      c.innerHTML=L+'<h2>Cek Gmail kamu</h2><p>Kode 6 digit dikirim ke<br><b>'+esc(st.email)+'</b><br>Cek juga folder Spam.</p>'
        +'<input class="in cd" id="lgc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000">'
        +(rs?field('lgp','Password baru (min. 8 karakter)','password','new-password'):'')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">'+(rs?'Ganti Password':'Verifikasi')+'</button>'
        +'<button class="lk" id="lgx" disabled></button><button class="lk" id="lgm">Kembali</button>';
      var go=rs?resetVerify:regVerify;on('lgb',go);on('lgm',function(){go2(rs?'rst':'reg')});enter(go);
      var i=$i('lgc');i.oninput=function(){i.value=i.value.replace(/\D/g,'').slice(0,6);if(!rs&&i.value.length==6)regVerify()};i.focus();
    }else{ // rst
      c.innerHTML=L+'<h2>Lupa password</h2><p>Masukkan Gmail akunmu. Kami kirim kode untuk membuat password baru.</p>'
        +field('lge','nama@gmail.com','email','email',st.email)
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Kirim Kode</button><button class="lk" id="lgg"><b>Kembali ke Masuk</b></button>';
      on('lgb',resetStart);on('lgg',function(){go2('login')});enter(resetStart);
    }
  }
  function err(m){var e=$i('lgr');if(e)e.textContent=m||''}
  function busy(on,t){st.busy=on;var b=$i('lgb');if(b){b.disabled=!!on;b.style.opacity=on?.6:1;if(t)b.textContent=t}}
  function val(id){var e=$i(id);return e?e.value:''}
  function cooldown(sec){
    clearInterval(tm);if(!$i('lgx'))return;
    function t(){var b=$i('lgx');if(!b){clearInterval(tm);return}
      if(sec>0){b.disabled=true;b.textContent='Kirim ulang kode ('+sec+' dtk)';sec--}
      else{clearInterval(tm);b.disabled=false;b.textContent='Kirim ulang kode';b.onclick=resend}}
    t();tm=setInterval(t,1000);
  }
  var pend=null; // data terakhir untuk kirim ulang
  function send(action,body,next,label){
    if(st.busy)return;err('');busy(1,'Memproses…');
    api(Object.assign({action:action},body)).then(function(j){st.busy=0;pend={a:action,b:body};st.email=body.email;if(next){go2(next)}view2(j.cooldown)}).catch(function(x){busy(0,label);err(x.msg)});
  }
  function view2(cd){cooldown(cd||45)}
  function regStart(){
    var u=val('lgu').trim().toLowerCase(),e=val('lge').trim().toLowerCase(),p=val('lgp');
    if(!/^[a-z0-9_.]{3,20}$/.test(u)){err('Username 3-20 karakter: huruf kecil, angka, titik, atau _');return}
    if(!/^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(e)){err('Masukkan alamat Gmail yang valid (@gmail.com)');return}
    if(p.length<8){err('Password minimal 8 karakter');return}
    st.email=e;send('register_start',{username:u,email:e,password:p},'regc','Kirim Kode');
  }
  function resetStart(){
    var e=val('lge').trim().toLowerCase();
    if(!/^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(e)){err('Masukkan alamat Gmail yang valid (@gmail.com)');return}
    st.email=e;send('reset_start',{email:e},'rstc','Kirim Kode');
  }
  function resend(){
    if(st.busy||!pend)return;err('');st.busy=1;
    api(Object.assign({action:pend.a},pend.b)).then(function(j){st.busy=0;toast('Kode baru dikirim');cooldown(j.cooldown||45)}).catch(function(x){st.busy=0;err(x.msg);cooldown(15)});
  }
  function done(j,msg){
    wr(KEY,{email:j.email,username:j.username,session:j.session,exp:j.exp});rm(SKIP);
    if(!cfg.name){cfg.name=String(j.username||'').slice(0,30);ls.set('cfg',cfg)}
    close();toast(msg||'Masuk sebagai '+j.username);refresh();
  }
  function fin(p,label){return p.catch(function(x){busy(0,label);err(x.msg)})}
  function login(){
    if(st.busy)return;var id=val('lgi').trim(),p=val('lgp');
    if(!id||!p){err('Isi username/email dan password');return}
    err('');busy(1,'Memeriksa…');fin(api({action:'login',id:id,password:p}).then(function(j){done(j)}),'Masuk');
  }
  function regVerify(){
    if(st.busy)return;var c=val('lgc').replace(/\D/g,'');if(c.length!=6){err('Masukkan kode 6 digit');return}
    err('');busy(1,'Memeriksa…');
    api({action:'register_verify',email:st.email,code:c}).then(function(j){done(j,'Akun dibuat. Selamat datang, '+j.username)})
      .catch(function(x){busy(0,'Verifikasi');err(x.msg);var i=$i('lgc');if(i){i.value='';i.focus()}});
  }
  function resetVerify(){
    if(st.busy)return;var c=val('lgc').replace(/\D/g,''),p=val('lgp');
    if(c.length!=6){err('Masukkan kode 6 digit');return}if(p.length<8){err('Password minimal 8 karakter');return}
    err('');busy(1,'Memproses…');fin(api({action:'reset_verify',email:st.email,code:c,password:p}).then(function(j){done(j,'Password diganti')}),'Ganti Password');
  }
  function skip(){wr(SKIP,1);close()}
  function close(){clearInterval(tm);var e=$i('lg');if(e){e.classList.add('x');setTimeout(function(){e.remove()},400)}}
  function refresh(){try{go(pg)}catch(e){}}
  window.lgOpen=function(){
    if($i('lg'))return;css();st={step:'login',email:'',busy:0};
    var e=document.createElement('div');e.id='lg';e.innerHTML='<div class="lgc"></div>';
    $i('app').appendChild(e);view();
  };
  window.lgOut=async function(){if(!await uiConfirm('Data lagu dan playlist di perangkat ini tetap ada.',{title:'Keluar dari akun?',ok:'Keluar',danger:1,icon:'👋'}))return;
    rm(KEY);rm(SKIP);toast('Berhasil keluar');refresh()};
  /* baris akun di halaman Profil */
  function inject(){
    var v=$i('v');if(!v)return;var h=v.querySelector('h1');
    if(!h||h.textContent!=='Profil'||v.querySelector('[data-acc]'))return;
    var f=v.querySelector('.ft');if(!f)return;var a=sess(),d=document.createElement('div');
    d.className='ft';d.setAttribute('data-acc','1');d.setAttribute('onclick',a?'lgOut()':'lgOpen()');
    d.innerHTML=a?'<span>✉</span><div>'+esc(a.username||a.email)+'<br><small>'+esc(a.email)+' · ketuk untuk keluar</small></div>'
      :'<span>✉</span><div>Masuk / Daftar<br><small>Akun dengan username dan Gmail</small></div>';
    f.parentNode.insertBefore(d,f);
  }
  var _go=go;go=function(p){_go(p);inject()};inject();
  /* mulai: tampilkan login bila belum masuk dan belum memilih lewati; cek sesi diam-diam */
  var a=sess();
  if(a){api({action:'me',session:a.session}).catch(function(x){if(x.status==401){rm(KEY);refresh()}})}
  else if(!rd(SKIP)&&/^https?:$/.test(location.protocol))lgOpen();
})();
}catch(e){console.error('[loopify] extra4.js',e)}

/* ==== extra5.js ==== */
try{
/* Loopify v3.5.2 - Geser kiri/kanan untuk pindah tab: Beranda - Cari - Library - Profil.
   Berlaku di isi halaman dan di bilah navigasi bawah. Tidak aktif saat panel/overlay terbuka, di kolom input,
   atau saat menggeser daftar yang bisa digulir ke samping (chip, kartu trending). Dimuat setelah extra4.js. */
(function(){
  var ORDER=['home','explore','library','profile'],x0=0,y0=0,t0=0,ok=0;
  function blocked(){
    if(document.querySelector('.ov.on,#ob,#lg'))return true;
    return ORDER.indexOf(pg)<0;
  }
  function scrollsX(el){
    var v=document.getElementById('v');
    for(;el&&el!==document.body;el=el.parentElement){
      if(el.scrollWidth>el.clientWidth+2){var o=getComputedStyle(el).overflowX;if(o=='auto'||o=='scroll')return true}
      if(el===v)break;
    }
    return false;
  }
  document.addEventListener('touchstart',function(e){
    ok=0;if(e.touches.length!=1||blocked())return;
    var t=e.target;if(!t.closest||!t.closest('#v,#nav'))return;
    if(t.closest('input,textarea,select,[contenteditable],.rw,#mp'))return;
    if(scrollsX(t))return;
    var p=e.touches[0];x0=p.clientX;y0=p.clientY;t0=Date.now();ok=1;
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!ok)return;ok=0;if(blocked())return;
    var p=e.changedTouches[0],dx=p.clientX-x0,dy=p.clientY-y0;
    if(Date.now()-t0>650||Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6)return;
    var i=ORDER.indexOf(pg)+(dx<0?1:-1);if(i<0||i>=ORDER.length)return;
    go(ORDER[i]);
    var v=document.getElementById('v');
    if(v&&v.animate)v.animate([{transform:'translateX('+(dx<0?28:-28)+'px)',opacity:.35},{transform:'none',opacity:1}],{duration:220,easing:'ease-out'});
    try{if(navigator.vibrate)navigator.vibrate(8)}catch(x){}
  },{passive:true});
})();
}catch(e){console.error('[loopify] extra5.js',e)}

/* ==== extra6.js ==== */
try{
/* Loopify v3.6 - Urungkan hapus, geser baris, geser mini-player, fade sleep timer, crossfade,
   warna aksen, tampilan kosong, getar halus, kontrol layar kunci, kartu bagikan. Dimuat setelah extra5.js. */
(function(){
  'use strict';
  var $1=function(s,r){return(r||document).querySelector(s)};
  function css(t){var s=document.createElement('style');s.textContent=t;document.head.appendChild(s)}
  var noClick=0;

  css('#un6{position:absolute;left:14px;right:14px;max-width:440px;margin:0 auto;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 142px);z-index:60;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 18px;border-radius:20px;overflow:hidden;background:var(--lgb,var(--c));color:var(--tx);border:1px solid var(--lgl,var(--b));-webkit-backdrop-filter:blur(22px) saturate(1.8);backdrop-filter:blur(22px) saturate(1.8);box-shadow:0 14px 36px var(--lgs,rgba(0,0,0,.35));font-size:13px;font-weight:600;transform:translateY(30px) scale(.96);opacity:0;pointer-events:none;transition:transform .4s cubic-bezier(.34,1.4,.64,1),opacity .25s}'
  +'#un6.on{transform:none;opacity:1;pointer-events:auto}'
  +'#un6 span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  +'#un6 button{flex:none;border:0;border-radius:14px;padding:9px 16px;font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--g,linear-gradient(135deg,var(--p),var(--p2)));cursor:pointer}'
  +'#un6 i{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--g,var(--p));transform-origin:left;transform:scaleX(0)}'
  +'#un6.on i{animation:un6 5.5s linear forwards}@keyframes un6{from{transform:scaleX(1)}to{transform:scaleX(0)}}'
  +'.rw{touch-action:pan-y}'
  +'html.sw6 #v,html.sw6 #sp{overflow-x:hidden}'
  +'.rw.swr,.rw.swl{position:relative;z-index:2;content-visibility:visible!important;contain:none!important}'
  +'.rw.swr:before,.rw.swl:before{position:absolute;top:2px;bottom:2px;width:170px;display:flex;align-items:center;font-size:12px;font-weight:700;color:#fff;border-radius:16px;opacity:.75;transition:opacity .15s,filter .15s}'
  +'.rw.swr:before{content:"\\FF0B  Antrean";right:100%;justify-content:flex-end;padding-right:14px;background:linear-gradient(90deg,transparent,var(--p))}'
  +'.rw.swl:before{content:"\\1F5D1  Hapus";left:100%;padding-left:14px;background:linear-gradient(90deg,#e0354f,transparent)}'
  +'.rw.swl.swf:before{content:"\\2665  Favorit";background:linear-gradient(90deg,#ff5f9e,transparent)}'
  +'.rw.rdy:before{opacity:1;filter:brightness(1.2)}'
  +'#mp.h6{display:none!important}'
  +'.ac6row{display:flex;flex-wrap:wrap;gap:12px;padding:6px 2px 10px}'
  +'.ac6{width:38px;height:38px;border-radius:50%;border:2px solid transparent;background:var(--c6);cursor:pointer;padding:0;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:transform .2s,border-color .2s;position:relative}'
  +'.ac6:active{transform:scale(.88)}.ac6.sel{border-color:var(--tx);transform:scale(1.08)}'
  +'.ac6.sel:after{content:"\\2713";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.5)}'
  +'.ac6.auto{background:conic-gradient(#ff5f6d,#ffc547,#2ed39a,#3da5ff,#8b7bff,#ff5fa2,#ff5f6d)}'
  +'.ac6.def{background:linear-gradient(135deg,#6d5dfc,#ff8a5b)}'
  +'.emp6{text-align:center;padding:26px 18px 22px;margin:14px 0;border-radius:26px;background:var(--c);border:1px solid var(--b)}'
  +'.emp6-i{width:118px;height:118px;display:block;margin:0 auto 10px;animation:emf 3.4s ease-in-out infinite}'
  +'@keyframes emf{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(2deg)}}'
  +'.emp6 b{display:block;font-size:17px;margin-bottom:6px}.emp6 small{display:block;color:var(--mu);line-height:1.55;margin:0 auto 16px;max-width:280px}'
  +'.emp6-b{display:flex;flex-direction:column;gap:8px}'
  +'.sc6{display:block;width:auto;max-width:100%;max-height:52vh;margin:0 auto 18px;border-radius:22px;box-shadow:0 14px 40px rgba(0,0,0,.45)}');

  /* ---------- Getar halus ---------- */
  window.hap6=function(n){if(cfg.hap===false)return;try{navigator.vibrate&&navigator.vibrate(n||6)}catch(e){}};
  window.hapTg=function(){cfg.hap=(cfg.hap===false);ls.set('cfg',cfg);if(cfg.hap!==false)hap6(14);setR()};
  document.addEventListener('click',function(e){
    if(Date.now()<noClick&&e.target.closest&&e.target.closest('#mp,.rw')){e.stopPropagation();e.preventDefault();return}
    var t=e.target.closest&&e.target.closest('button,.rw,.ft,.chip,.ib,.nav *,.ac6');
    if(t)hap6(t.matches('.dg .o,[onclick*="delS("],[onclick*="delV("]')?14:6)
  },true);

  /* ---------- Urungkan (undo) ---------- */
  var pend=null,unEl=null;
  function bar(){if(unEl&&unEl.isConnected)return unEl;unEl=document.createElement('div');unEl.id='un6';unEl.innerHTML='<span></span><button type="button">Urungkan</button><i></i>';
    unEl.querySelector('button').onclick=undoNow;(document.getElementById('app')||document.body).appendChild(unEl);return unEl}
  function hide(){if(unEl)unEl.classList.remove('on')}
  function flush(){if(!pend)return;clearTimeout(pend.t);var p=pend;pend=null;hide();try{p.commit&&p.commit()}catch(e){}}
  function undoNow(){if(!pend)return;clearTimeout(pend.t);var p=pend;pend=null;hide();hap6(12);try{p.revert&&p.revert()}catch(e){}}
  window.undo6=function(msg,commit,revert){flush();var el=bar();el.querySelector('span').textContent=msg;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
    pend={commit:commit,revert:revert,t:setTimeout(flush,5500)}};
  document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});
  addEventListener('pagehide',flush);

  window.delS=function(id){
    var s=songs.find(function(x){return x.id==id});if(!s)return;
    var idx=songs.indexOf(s);songs=songs.filter(function(x){return x.id!=id});
    if(cur&&cur.id==id){A.pause();B.pause();cur=null;clp();try{rn()}catch(e){}}
    go(pg);
    undo6('Lagu dihapus',function(){tx('readwrite',function(o){return o.delete(id)}).catch(function(){})},
      function(){songs.splice(Math.min(idx,songs.length),0,s);go(pg)});
  };
  window.delV=function(id){
    var v=vids.find(function(x){return x.id==id});if(!v)return;
    var idx=vids.indexOf(v);vids=vids.filter(function(x){return x.id!=id});ls.set('vids',vids);go(pg);
    undo6('Video dihapus',null,function(){vids.splice(Math.min(idx,vids.length),0,v);ls.set('vids',vids);go(pg)});
  };
  window.plDel=function(i){
    var p=pls[i];if(!p)return;pls.splice(i,1);ls.set('pls',pls);csp();
    undo6('Playlist dihapus',null,function(){pls.splice(Math.min(i,pls.length),0,p);ls.set('pls',pls);go(pg)});
  };
  window.histClr=function(){
    var old=hist;hist=[];ls.set('hist',hist);
    undo6('Riwayat putar dihapus',null,function(){hist=old;ls.set('hist',hist)});
  };

  /* ---------- Geser baris lagu: kanan = antrean, kiri = hapus / favorit ---------- */
  var sw={row:null};
  function selOn(){try{return !!(window.SEL&&SEL.on)}catch(e){return false}}
  document.addEventListener('touchstart',function(e){
    sw={row:null};if(e.touches.length!=1||selOn())return;
    var r=e.target.closest&&e.target.closest('.rw');if(!r||!r.closest('#v,#sp')||e.target.closest('input,select'))return;
    var m=(r.getAttribute('onclick')||'').match(/^P\('(\w+)',(\d+)\)/);if(!m)return;
    var t=lists[m[1]]&&lists[m[1]][+m[2]];if(!t)return;
    var p=e.touches[0];sw={row:r,t:t,x:p.clientX,y:p.clientY,dx:0,lock:0,del:null};
    var b=r.querySelector('button[onclick*="delS("],button[onclick*="delV("]');
    if(b){var mm=b.getAttribute('onclick').match(/(delS|delV)\('([^']+)'\)/);if(mm)sw.del=[mm[1],mm[2]]}
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!sw.row||!sw.t)return;var p=e.touches[0],dx=p.clientX-sw.x,dy=p.clientY-sw.y;
    if(!sw.lock){
      if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
      if(Math.abs(dx)>Math.abs(dy)*1.3){sw.lock=1;document.documentElement.classList.add('sw6');sw.row.style.transition='none'}else{sw.lock=-1;return}
    }
    if(sw.lock!==1)return;
    if(e.cancelable)e.preventDefault();
    sw.dx=dx;var d=Math.max(-170,Math.min(170,dx))*.85,r=sw.row;
    r.style.transform='translateX('+d+'px)';
    var right=dx>0,fav=!sw.del;
    r.classList.toggle('swr',right);r.classList.toggle('swl',!right);r.classList.toggle('swf',!right&&fav);
    var rdy=Math.abs(dx)>=90;if(rdy&&!r.classList.contains('rdy'))hap6(8);r.classList.toggle('rdy',rdy);
  },{passive:false});
  function swEnd(){
    var s=sw;sw={row:null};if(!s.row||s.lock!==1)return;
    noClick=Date.now()+400;var r=s.row,dx=s.dx;
    r.style.transition='transform .25s cubic-bezier(.2,.9,.3,1)';r.style.transform='';
    setTimeout(function(){r.classList.remove('swr','swl','swf','rdy');r.style.transition='';document.documentElement.classList.remove('sw6')},270);
    if(Math.abs(dx)<90)return;
    var t=s.t;
    if(dx>0){
      if(t.yt||t.radio){toast('Hanya lagu yang bisa masuk antrean');return}
      if(t.rec&&!t.url){toast('Lagu rekomendasi belum bisa diantrekan');return}
      hap6(14);
      if(!cur){play([t],0);toast('Diputar: '+ct(t.title))}else{q.push(t);toast('Masuk antrean: '+ct(t.title))}
    }else if(s.del){hap6(14);window[s.del[0]](s.del[1])}
    else{
      if(t.yt||t.radio||(t.rec&&!t.url)){toast('Ini belum bisa difavoritkan');return}
      hap6(14);
      if(isF(t)){favs=favs.filter(function(x){return x.id!=t.id});toast('Dihapus dari Favorit')}
      else{favs=favs.concat([svt(t)]);toast('Masuk Favorit')}
      ls.set('favs',favs);
    }
  }
  document.addEventListener('touchend',swEnd,{passive:true});
  document.addEventListener('touchcancel',function(){var s=sw;sw={row:null};if(s.row){s.row.style.transform='';s.row.classList.remove('swr','swl','swf','rdy');document.documentElement.classList.remove('sw6')}},{passive:true});

  /* ---------- Geser mini-player: atas = buka, bawah = tutup ---------- */
  var mpS=null;
  document.addEventListener('touchstart',function(e){
    mpS=null;var m=e.target.closest&&e.target.closest('#mp');if(!m||e.touches.length!=1||e.target.closest('button'))return;
    var p=e.touches[0];mpS={m:m,x:p.clientX,y:p.clientY,dy:0,lock:0};
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!mpS)return;var p=e.touches[0],dx=p.clientX-mpS.x,dy=p.clientY-mpS.y;
    if(!mpS.lock){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;mpS.lock=Math.abs(dy)>Math.abs(dx)?1:-1;if(mpS.lock===1)mpS.m.style.transition='none'}
    if(mpS.lock!==1)return;mpS.dy=dy;
    var d=dy>0?dy:dy*.4;mpS.m.style.transform='translateY('+d+'px)';mpS.m.style.opacity=dy>0?Math.max(.25,1-dy/160):1;
  },{passive:true});
  function mpEnd(){
    var s=mpS;mpS=null;if(!s||s.lock!==1)return;noClick=Date.now()+400;
    var m=s.m;m.style.transition='transform .25s ease,opacity .25s';m.style.transform='';m.style.opacity='';
    setTimeout(function(){m.style.transition=''},280);
    if(s.dy>56){hap6(12);try{A.pause();B.pause()}catch(e){}m.classList.add('h6');toast('Pemutar ditutup')}
    else if(s.dy<-48){hap6(8);openP()}
  }
  document.addEventListener('touchend',mpEnd,{passive:true});
  document.addEventListener('touchcancel',function(){var s=mpS;mpS=null;if(s){s.m.style.transform='';s.m.style.opacity=''}},{passive:true});
  [A,B].forEach(function(a){a.addEventListener('play',function(){var m=$('#mp');if(m)m.classList.remove('h6')})});

  /* ---------- Fade sleep timer + Crossfade (lewat xf yang dipanggil tiap tick) ---------- */
  var ghost=null,ghostT=0,cfIn=null,calling=0;
  function killGhost(){clearInterval(ghostT);if(ghost){try{ghost.pause();ghost.removeAttribute('src');ghost.load()}catch(e){}ghost=null}}
  function startCF(cf){
    var ni=shuf?Math.floor(Math.random()*q.length):qi+1;
    if(!shuf&&ni>=q.length){if(rep==1)ni=0;else return}
    var n=q[ni];if(!n||n.yt||n.radio||(n.rec&&!n.url)||(!n.loc&&!n.url))return;
    cur._cf6=1;killGhost();
    var o=act,g=new Audio(),v0=o.volume||1;
    try{g.src=o.currentSrc||o.src;g.currentTime=o.currentTime;g.volume=v0;g.playbackRate=o.playbackRate||1;g.play().catch(function(){})}catch(e){}
    ghost=g;g._t0=Date.now();
    calling=1;try{play(q,ni)}finally{calling=0}
    fv=.02;try{setVol()}catch(e){}
    cfIn={t0:performance.now(),ms:cf*1000};
    var t0=Date.now();ghostT=setInterval(function(){var p=(Date.now()-t0)/(cf*1000);if(p>=1||ghost!==g){killGhost();return}try{g.volume=Math.max(0,v0*(1-p))}catch(e){}},80);
  }
  var _play=play;
  play=function(l,i){if(!calling)killGhost();try{var t=l&&l[i];if(t)t._cf6=0}catch(e){}return _play.apply(this,arguments)};
  [A,B].forEach(function(a){a.addEventListener('pause',function(){setTimeout(function(){if(ghost&&act&&act.paused&&Date.now()-ghost._t0>400)killGhost()},450)})});
  var _xf=xf;
  xf=function(){
    _xf();var a=act;if(!a)return;
    try{
      if(slEnd){var rem=slEnd>0?(slEnd-Date.now())/1000:(isFinite(a.duration)?a.duration-a.currentTime:99),F=slEnd>0?20:8;if(rem<F)fv=Math.min(fv,Math.max(.02,rem/F))}
      if(cfIn){var p=(performance.now()-cfIn.t0)/cfIn.ms;if(p<1)fv=Math.min(fv,Math.max(.02,p));else cfIn=null}
      var cf=+cfg.cf||0;
      if(cf>0&&cur&&!a.paused&&!cur.radio&&!cur.yt&&!cur._cf6&&isFinite(a.duration)&&a.duration>cf*2+2&&q.length>1&&rep!==2&&slEnd!==-1&&!(ab&&(ab.a!=null||ab.b!=null))){
        var r2=a.duration-a.currentTime;if(r2<=cf&&r2>.4)startCF(cf);
      }
    }catch(e){}
  };
  var _slR=slR;
  slR=function(){_slR();var sp=$('#sp');if(!sp||sp.querySelector('[data-sl6]'))return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-sl6','1');d.setAttribute('onclick','slCustom()');
    d.innerHTML='<span>✎</span><div>Atur sendiri<br><small>Volume memudar pelan di 20 detik terakhir</small></div>';
    var last=sp.querySelector('.ft:last-of-type');if(last&&last.parentNode)last.parentNode.insertBefore(d,last);else sp.appendChild(d)};
  window.slCustom=function(){uiPrompt('Berapa menit lagi musik berhenti?','45',{title:'Sleep timer',placeholder:'Menit (1-720)',ok:'Atur',max:3}).then(function(v){
    if(v==null)return;var m=parseInt(v,10);if(!(m>=1&&m<=720)){toast('Masukkan 1 sampai 720 menit');return}slSet(m)})};

  /* ---------- Kontrol layar kunci ---------- */
  var _ms=ms;
  ms=function(){
    _ms();if(!('mediaSession' in navigator)||!cur)return;
    try{
      if(cur.img&&/^(https?:|data:|blob:)/.test(cur.img)){
        navigator.mediaSession.metadata=new MediaMetadata({title:cur.title,artist:cur.artist,album:'Loopify',
          artwork:['96x96','128x128','192x192','256x256','384x384','512x512'].map(function(z){return{src:cur.img,sizes:z}})});
      }
      var h=function(n,f){try{navigator.mediaSession.setActionHandler(n,f)}catch(e){}};
      if(cur.radio){h('seekbackward',null);h('seekforward',null)}
      else{
        h('seekbackward',function(d){act.currentTime=Math.max(0,act.currentTime-((d&&d.seekOffset)||10))});
        h('seekforward',function(d){if(isFinite(act.duration))act.currentTime=Math.min(act.duration,act.currentTime+((d&&d.seekOffset)||10))});
      }
      h('stop',function(){act.pause()});
    }catch(e){}
  };

  /* ---------- Warna aksen ---------- */
  var accAuto=null;
  function hexHsl(h){var r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,H=0;
    if(mx!=mn){var d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);H=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;H*=60}return[H,s*100,l*100]}
  function hslHex(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l);function f(n){var k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return('0'+Math.round(c*255).toString(16)).slice(-2)}return'#'+f(0)+f(8)+f(4)}
  function accApply(){
    var s=document.documentElement.style,c=cfg.acc==='auto'?accAuto:cfg.acc;
    if(!c||!/^#[0-9a-f]{6}$/i.test(c)){['--p','--p2','--g'].forEach(function(k){s.removeProperty(k)});return}
    var h=hexHsl(c),light=document.documentElement.dataset.t==='light';
    var p2=hslHex(h[0],Math.min(h[1],95),light?Math.max(h[2]-10,28):Math.min(h[2]+14,82)),p3=hslHex((h[0]+24)%360,h[1],h[2]);
    s.setProperty('--p',c);s.setProperty('--p2',p2);s.setProperty('--g','linear-gradient(135deg,'+c+','+p3+')');
  }
  function autoAcc(t){
    if(!t||!t.img){accAuto=null;accApply();return}
    var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){if(cur!==t)return;try{
      var c=document.createElement('canvas');c.width=c.height=24;var x=c.getContext('2d');x.drawImage(im,0,0,24,24);
      var d=x.getImageData(0,0,24,24).data,best=null,bs=-1;
      for(var i=0;i<d.length;i+=4){var hs=hexHsl('#'+('0'+d[i].toString(16)).slice(-2)+('0'+d[i+1].toString(16)).slice(-2)+('0'+d[i+2].toString(16)).slice(-2));
        if(hs[2]<18||hs[2]>88)continue;var sc=hs[1]*(1-Math.abs(hs[2]-50)/60);if(sc>bs){bs=sc;best=hs}}
      if(best&&bs>12){accAuto=hslHex(best[0],Math.max(55,Math.min(best[1],90)),light6()?42:58);accApply()}
    }catch(e){}};
    im.src=t.img;
  }
  function light6(){return document.documentElement.dataset.t==='light'}
  var _thm=thm;thm=function(t){_thm(t);if(cfg.acc==='auto')autoAcc(t)};
  var _ac=applyCfg;applyCfg=function(){_ac();accApply()};
  window.accSet=function(c){cfg.acc=c||'';ls.set('cfg',cfg);if(c==='auto'){accAuto=null;autoAcc(cur)}hap6(8);accApply();setR()};
  accApply();

  var SW=[['#ff8a5b','Oranye'],['#ff5f6d','Merah'],['#ff5fa2','Pink'],['#8b7bff','Ungu'],['#3da5ff','Biru'],['#2ed39a','Hijau'],['#1ed760','Hijau Spotify'],['#f5b301','Kuning']];
  function settingsHtml(){
    var cf=cfg.cf==null?0:+cfg.cf,ch=[[0,'Mati'],[3,'3 dtk'],[5,'5 dtk'],[8,'8 dtk']].map(function(x){return'<span class="chip '+(cf==x[0]?'a':'')+'" onclick="cfgSet(\'cf\','+x[0]+')">'+x[1]+'</span>'}).join('');
    var a=cfg.acc||'',sw='<button class="ac6 def'+(a?'':' sel')+'" aria-label="Bawaan" onclick="accSet(\'\')"></button>'
      +SW.map(function(x){return'<button class="ac6'+(a.toLowerCase()==x[0]?' sel':'')+'" style="--c6:'+x[0]+'" aria-label="'+x[1]+'" onclick="accSet(\''+x[0]+'\')"></button>'}).join('')
      +'<button class="ac6 auto'+(a==='auto'?' sel':'')+'" aria-label="Otomatis dari sampul" onclick="accSet(\'auto\')"></button>';
    return'<div class="sec"><h3>Crossfade antar lagu</h3></div><div class="chips">'+ch+'</div>'
      +'<div class="sec"><h3>Warna aksen</h3></div><div class="ac6row">'+sw+'</div><small style="display:block;margin:-2px 2px 8px">Bulat paling kanan: warna otomatis mengikuti sampul lagu.</small>'
      +'<div class="ft" onclick="hapTg()"><div>Getar halus<br><small>Getar singkat saat menekan tombol dan menggeser</small></div><i class="sw '+(cfg.hap!==false?'on':'')+'"></i></div>';
  }
  var _setR=setR;
  setR=function(){_setR();var sp=$('#sp');if(!sp)return;var tgt=null;sp.querySelectorAll('.sec h3').forEach(function(h){if(h.textContent==='Lainnya')tgt=h.parentNode});
    if(tgt&&!sp.querySelector('.ac6row'))tgt.insertAdjacentHTML('beforebegin',settingsHtml())};

  /* ---------- Tampilan kosong ---------- */
  function emptyCard(){
    return'<div class="emp6"><svg class="emp6-i" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="eg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--p2)"/><stop offset="1" style="stop-color:var(--p)"/></linearGradient></defs>'
      +'<circle cx="60" cy="60" r="54" fill="url(#eg6)" opacity=".16"/><circle cx="60" cy="60" r="40" fill="none" stroke="url(#eg6)" stroke-width="2" opacity=".55"/><circle cx="60" cy="60" r="26" fill="none" stroke="url(#eg6)" stroke-width="2" opacity=".35"/>'
      +'<path d="M54 78V42l28-8v32" fill="none" stroke="url(#eg6)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="47" cy="78" r="8" fill="url(#eg6)"/><circle cx="75" cy="66" r="8" fill="url(#eg6)"/></svg>'
      +'<b>Belum ada musik</b><small>Tambahkan lagu dari perangkatmu, cari musik online, atau bawa playlist dari Spotify.</small>'
      +'<div class="emp6-b"><button class="btn" onclick="pick()">＋ Tambah lagu</button><button class="btn g" onclick="go(\'explore\')">Cari musik online</button><button class="btn g" onclick="impOpen()">⇩ Impor dari Spotify / YouTube</button></div></div>';
  }
  var _prof=V.profile;
  V.profile=function(){var h=_prof.call(V);
    if(songs.length||favs.length||pls.length)return h;
    var m='<div><div class="ft" onclick="goSet()">';return h.indexOf(m)>-1?h.replace(m,emptyCard()+m):h};
  var _lib=V.library;
  V.library=function(){var h=_lib.call(V),e='<div class="em">Belum ada lagu. Tambahkan file musik atau pindai satu folder sekaligus.</div>';
    return h.indexOf(e)>-1?h.replace(e,emptyCard()):h};

  /* ---------- Kartu bagikan ---------- */
  function wrapTxt(x,t,w,max){var words=String(t).split(/\s+/),lines=[],l='';
    for(var i=0;i<words.length;i++){var n=l?l+' '+words[i]:words[i];if(x.measureText(n).width>w&&l){lines.push(l);l=words[i]}else l=n}
    if(l)lines.push(l);if(lines.length>max){lines=lines.slice(0,max);var s=lines[max-1];while(s.length>1&&x.measureText(s+'…').width>w)s=s.slice(0,-1);lines[max-1]=s+'…'}return lines}
  function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
  function drawCard(t,img){
    var W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
    var acc=getComputedStyle(document.documentElement).getPropertyValue('--p').trim()||'#6d5dfc',F='Sora, system-ui, -apple-system, sans-serif';
    var bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0b0f33');bg.addColorStop(1,'#04050f');x.fillStyle=bg;x.fillRect(0,0,W,H);
    if(img){x.save();x.globalAlpha=.5;try{x.filter='blur(70px)'}catch(e){}x.drawImage(img,-260,-60,W+520,W+520);x.restore()}
    x.save();x.globalAlpha=.4;var gl=x.createRadialGradient(W/2,730,40,W/2,730,820);gl.addColorStop(0,acc);gl.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gl;x.fillRect(0,0,W,H);x.restore();
    x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,W,H);
    x.textAlign='center';x.textBaseline='alphabetic';
    x.fillStyle='rgba(255,255,255,.72)';x.font='600 34px '+F;try{x.letterSpacing='9px'}catch(e){}x.fillText('SEDANG MENDENGARKAN',W/2,240);try{x.letterSpacing='0px'}catch(e){}
    var S=780,cx=(W-S)/2,cy=330;
    x.save();x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=90;x.shadowOffsetY=40;rr(x,cx,cy,S,S,72);x.fillStyle='#111';x.fill();x.restore();
    x.save();rr(x,cx,cy,S,S,72);x.clip();
    if(img){var m=Math.min(img.naturalWidth||S,img.naturalHeight||S)||S,sx=((img.naturalWidth||S)-m)/2,sy=((img.naturalHeight||S)-m)/2;x.drawImage(img,sx,sy,m,m,cx,cy,S,S)}
    else{var hu=(t.h!=null?t.h:hh(String(t.title||'')))%360,ga=x.createLinearGradient(cx,cy,cx+S,cy+S);ga.addColorStop(0,'hsl('+hu+',70%,52%)');ga.addColorStop(1,'hsl('+((hu+60)%360)+',70%,28%)');x.fillStyle=ga;x.fillRect(cx,cy,S,S);
      x.fillStyle='rgba(255,255,255,.85)';x.font='700 360px '+F;x.textBaseline='middle';x.fillText('\u266A',W/2,cy+S/2+10);x.textBaseline='alphabetic'}
    x.restore();
    x.fillStyle='#fff';x.font='700 68px '+F;var lines=wrapTxt(x,ct(t.title||'Tanpa judul'),900,2),y=1245;
    lines.forEach(function(l){x.fillText(l,W/2,y);y+=84});
    x.fillStyle='rgba(255,255,255,.72)';x.font='500 44px '+F;x.fillText(wrapTxt(x,t.artist||'',900,1)[0]||'',W/2,y+14);
    var seed=(typeof hh==='function'?hh(String(t.title||'')):7)||7,bw=16,gap=12,n=26,tw=n*bw+(n-1)*gap,bx=(W-tw)/2;
    x.fillStyle=acc;for(var i=0;i<n;i++){seed=(seed*1103515245+12345)&0x7fffffff;var bh=30+(seed%100)*1.1;x.globalAlpha=.55+(i%3)*.15;rr(x,bx+i*(bw+gap),1650-bh/2,bw,bh,8);x.fill()}x.globalAlpha=1;
    x.fillStyle='rgba(255,255,255,.9)';x.font='700 36px '+F;x.fillText('Loopify',W/2,1810);
    x.fillStyle='rgba(255,255,255,.5)';x.font='500 28px '+F;x.fillText('Musik gratis, tanpa iklan',W/2,1856);
    return c;
  }
  function cardModal(blob,t){
    var url=URL.createObjectURL(blob),root=document.createElement('div');root.className='ud';
    root.innerHTML='<div class="udc" role="dialog" aria-modal="true"><h3>Kartu bagikan</h3><img class="sc6" alt="" src="'+url+'"><div class="udb"><button type="button" class="c">Tutup</button><button type="button" class="o">Bagikan</button></div></div>';
    function close(){document.removeEventListener('keydown',key,true);root.classList.remove('on');setTimeout(function(){root.remove();URL.revokeObjectURL(url)},230)}
    function key(e){if(e.key=='Escape'){e.stopPropagation();close()}}
    document.addEventListener('keydown',key,true);
    root.addEventListener('mousedown',function(e){if(e.target===root)close()});
    root.querySelector('.c').onclick=close;
    root.querySelector('.o').onclick=function(){
      var f=new File([blob],'loopify.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:t.title,text:'Sedang mendengarkan '+t.title+' - '+t.artist}).catch(function(){});
      else{var a=document.createElement('a');a.href=url;a.download='loopify.png';document.body.appendChild(a);a.click();a.remove();toast('Gambar disimpan')}
    };
    (document.getElementById('app')||document.body).appendChild(root);
    requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('on')})});
    if(window.hap6)hap6(10);
  }
  window.shareCard=function(){
    var t=cur;if(!t){toast('Putar lagu dulu');return}
    var src='';try{src=cov(t)}catch(e){}
    var done=0;function go1(img){if(done)return;done=1;var c=drawCard(t,img);c.toBlob(function(b){if(b)cardModal(b,t);else toast('Gagal membuat kartu')},'image/png')}
    if(!src){go1(null);return}
    var im=new Image();im.crossOrigin='anonymous';im.onload=function(){go1(im)};im.onerror=function(){go1(null)};im.src=src;
    setTimeout(function(){go1(null)},4000);
  };
  var _rp=rp;
  rp=function(){_rp.apply(this,arguments);try{
    var a=$('#pl .act');if(!a||a.querySelector('[data-sc6]'))return;
    var b=document.createElement('button');b.setAttribute('data-sc6','1');b.setAttribute('aria-label','Bagikan kartu');b.setAttribute('onclick','shareCard()');
    b.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>';
    a.appendChild(b)}catch(e){}};
})();
}catch(e){console.error('[loopify] extra6.js',e)}

/* ==== extra7.js ==== */
try{
/* Loopify Patch — Rekomendasi Adaptif Suasana, Filter Chip, Pencarian Khusus Musik, & Opsi Lihat Video */
(function () {
  'use strict';

  var HIDE_CHIPS = ['video', 'pilih', 'radio', 'pop', 'rock', 'indie', 'jazz', 'edm'];

  // 1. Sembunyikan chip Video, Pilih, Radio, Pop, Rock, Indie, Jazz, EDM
  function hideUnwantedChips(root) {
    var scope = root || document;
    var chips = scope.querySelectorAll('.chip, button');
    for (var i = 0; i < chips.length; i++) {
      var el = chips[i];
      if (el.closest('#pl') || el.closest('#vo')) continue;
      var txt = (el.textContent || '').replace(/[^\w\s]/g, '').trim().toLowerCase();
      if (HIDE_CHIPS.indexOf(txt) !== -1) {
        el.style.setProperty('display', 'none', 'important');
        // Sembunyikan juga wadah .chips jika seluruh isinya adalah genre yang disembunyikan
        var parent = el.parentElement;
        if (parent && parent.classList.contains('chips')) {
          var visible = Array.prototype.filter.call(parent.children, function (c) {
            return c.style.display !== 'none';
          });
          if (!visible.length) parent.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  // 2. Deteksi otomatis suasana lagu yang sedang diputar / terakhir diputar
  function detectCurrentMood() {
    var t = (typeof cur !== 'undefined' && cur) || (typeof hist !== 'undefined' && hist[0]) || null;
    if (!t) {
      var hr = new Date().getHours();
      if (hr >= 5 && hr < 11) return { type: 'time', value: 'morning', label: 'Pagi Cerah' };
      if (hr >= 11 && hr < 16) return { type: 'time', value: 'afternoon', label: 'Siang Santai' };
      if (hr >= 16 && hr < 21) return { type: 'time', value: 'evening', label: 'Senja & Sore' };
      return { type: 'time', value: 'night', label: 'Malam Tenang' };
    }
    var text = ((t.title || '') + ' ' + (t.artist || '')).toLowerCase();
    var bpm = Number(t.bpm || 0);

    if (/galau|sad|sedih|hurt|cry|alone|broken|ballad|slow|piano|rain|hujan|rindu|kecewa/.test(text) || (bpm > 0 && bpm < 82)) {
      return { type: 'mood', value: 'sad', label: 'Melankolis & Syahdu' };
    }
    if (/dj|remix|party|club|edm|bass|jedag|jedug|dance|disco|house|funk/.test(text) || bpm >= 122) {
      return { type: 'mood', value: 'danceable', label: 'Upbeat & Dance' };
    }
    if (/rock|metal|punk|workout|gym|energi| semangat|fast/.test(text) || (bpm >= 108 && bpm < 122)) {
      return { type: 'mood', value: 'energetic', label: 'Penuh Energi' };
    }
    if (/chill|lofi|lo-fi|akustik|acoustic|santai|relax|sleep|tidur|senja|kopi/.test(text)) {
      return { type: 'mood', value: 'relaxed', label: 'Santai & Akustik' };
    }
    return { type: 'mood', value: 'happy', label: 'Ceria & Hangat' };
  }

  // Sinkronkan pilihan suasana rekomendasi dengan lagu yang sedang diputar
  var lastSyncId = '';
  function syncMoodRecommendation() {
    var t = typeof cur !== 'undefined' ? cur : null;
    var key = t ? String(t.id || t.title) : 'init';
    if (key === lastSyncId) return;
    lastSyncId = key;

    var m = detectCurrentMood();
    if (typeof window.recPick === 'function') {
      try {
        window.recPick(m.type, m.value);
      } catch (e) {}
    } else if (typeof window.loadRec === 'function') {
      try {
        window.loadRec(m.type, m.value, true);
      } catch (e) {}
    }
  }

  // 3. Pastikan pencarian online hanya mencari musik (bukan video/radio)
  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('/api/music') !== -1) {
        var u = new URL(url, location.origin);
        var src = u.searchParams.get('src');
        if (src === 'radio' || src === 'video') {
          u.searchParams.set('src', 'all');
          u.searchParams.delete('tag');
          u.searchParams.delete('cc');
          input = u.pathname + u.search;
        }
      }
    } catch (e) {}
    return origFetch.call(this, input, init);
  };

  // Pantau perubahan DOM & pemutaran lagu
  var obs = new MutationObserver(function () {
    hideUnwantedChips(document);
  });

  function init() {
    hideUnwantedChips(document);
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    if (typeof A !== 'undefined') A.addEventListener('play', syncMoodRecommendation);
    if (typeof B !== 'undefined') B.addEventListener('play', syncMoodRecommendation);
    setTimeout(syncMoodRecommendation, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
}catch(e){console.error('[loopify] extra7.js',e)}

/* ==== extra8.js ==== */
try{
/* Loopify v3.7 - Lirik berjalan di notifikasi pemutar + notifikasi sistem untuk pengingat waktu dengar.
   Dimuat setelah extra7.js. Notifikasi pemutar (layar kunci/bayangan notifikasi) digambar oleh sistem HP,
   jadi tampilannya mengikuti HP; yang bisa kita atur hanya isinya (judul, artis, cover, dan baris lirik). */
(function(){
  'use strict';
  function on(){return cfg.lyn!==false}

  /* ---------- Notifikasi sistem (hanya saat aplikasi tidak sedang dibuka) ---------- */
  function sysNotify(title,body,tag){
    try{
      if(!('Notification' in window)||Notification.permission!=='granted'||!navigator.serviceWorker)return;
      navigator.serviceWorker.ready.then(function(r){
        r.showNotification(title,{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag||'loopify',renotify:true,silent:false});
      }).catch(function(){});
    }catch(e){}
  }
  function askPerm(){
    try{
      if(!('Notification' in window)||Notification.permission!=='default')return;
      Notification.requestPermission().then(function(p){if(p==='granted')toast('Notifikasi diaktifkan')}).catch(function(){});
    }catch(e){}
  }
  var _toast=toast;
  toast=function(m,img){
    _toast(m,img);
    if(document.hidden&&/^Kamu sudah mendengarkan/.test(String(m)))sysNotify('Loopify',m,'loopify-rem');
  };
  /* minta izin saat pengingat dinyalakan */
  if(typeof cfgSet==='function'){
    var _cs=cfgSet;
    cfgSet=function(k,v){_cs(k,v);if(k==='rem'&&Number(v)>0)askPerm()};
  }

  /* ---------- Lirik di notifikasi pemutar ---------- */
  var lastI=-2,lastId='';
  function setMeta(line){
    if(!('mediaSession' in navigator)||!cur||typeof MediaMetadata==='undefined')return;
    try{
      var m=navigator.mediaSession.metadata,art=m&&m.artwork&&m.artwork.length?m.artwork:[{src:'icon-512.png',sizes:'512x512',type:'image/png'}];
      navigator.mediaSession.metadata=new MediaMetadata(line
        ?{title:cur.title,artist:'♪ '+line,album:cur.artist||'Loopify',artwork:art}
        :{title:cur.title,artist:cur.artist,album:'Loopify',artwork:art});
    }catch(e){}
  }
  function lyricNow(a){
    if(!on()||!cur||a!==act||cur.radio)return;
    var al=alOf(cur);
    if(!al||!al.length){
      if(lastI!==-2){lastI=-2;setMeta('')}
      return;
    }
    var ct=a.currentTime+.25,i=-1;
    for(var k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}
    if(i===lastI&&cur.id===lastId)return;
    lastI=i;lastId=cur.id;
    setMeta(i>=0?al[i].s:'');
  }
  var _sync=syncLy;
  syncLy=function(a){_sync(a);try{lyricNow(a)}catch(e){}};

  /* ganti lagu: muat lirik otomatis supaya notifikasi bisa menampilkannya */
  var _ms=ms;
  ms=function(){
    _ms();
    lastI=-2;lastId='';
    try{if(on()&&cur&&!cur.radio&&typeof fetchLy==='function')fetchLy(cur)}catch(e){}
    /* banner "Sedang diputar" di dalam aplikasi (gaya iPhone), sekali per lagu */
    try{
      if(cfg.npn!==false&&cur&&cur.id!==bannerId){
        bannerId=cur.id;
        if(!pm&&!document.getElementById('isl'))toast('Sedang diputar: '+cur.title+(cur.artist?' - '+cur.artist:''),cur.img||undefined);
      }
    }catch(e){}
  };
  var bannerId='';

  /* ---------- Tombol "Coba notifikasi" di Profil ---------- */
  window.notifTest=function(){
    toast('Notifikasi dalam aplikasi aktif. Ini contoh banner dari Loopify.');
    try{
      if(!('Notification' in window)){toast('Browser ini tidak mendukung notifikasi sistem');return}
      if(Notification.permission==='default'){askPerm();return}
      if(Notification.permission==='denied'){toast('Notifikasi diblokir. Aktifkan lewat pengaturan situs di browser');return}
      sysNotify('Loopify','Notifikasi sistem berfungsi.','loopify-test');
    }catch(e){}
  };
  function addBtn(){
    var v=document.getElementById('v');if(!v||v.querySelector('[data-notif]'))return;
    var hs=v.querySelectorAll('h3'),h=null;
    for(var i=0;i<hs.length;i++)if(/Pengingat waktu dengar/.test(hs[i].textContent)){h=hs[i];break}
    if(!h)return;
    var sec=h.closest('.sec')||h.parentNode,box=document.createElement('div');
    box.setAttribute('data-notif','1');box.style.margin='8px 0 4px';
    box.innerHTML='<button class="btn g" style="width:100%" onclick="notifTest()">Coba notifikasi</button>';
    sec.parentNode.insertBefore(box,sec);
  }
  var vv=document.getElementById('v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){addBtn()}).observe(vv,{childList:true,subtree:false});
  setTimeout(addBtn,300);
})();
}catch(e){console.error('[loopify] extra8.js',e)}

/* ==== extra9.js ==== */
try{
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
}catch(e){console.error('[loopify] extra9.js',e)}

/* ==== extra10.js ==== */
try{
/* Loopify v3.9 - fitur 5-10 ala Spotify (pasangan extra10.css). Dimuat setelah extra9.js. */
(function(){
  'use strict';
  var E=function(s){return esc(s)};
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

  /* ---------- gambar kartu (dipakai playlist & Wrapped) ---------- */
  function ensureImgModal(){
    var m=document.getElementById('wrimg');if(m)return m;
    m=document.createElement('div');m.id='wrimg';document.getElementById('app').appendChild(m);return m;
  }
  function showCard(canvas,name){
    canvas.toBlob(function(b){
      if(!b){toast('Gagal membuat gambar');return}
      var url=URL.createObjectURL(b),m=ensureImgModal();
      m.innerHTML='<img src="'+url+'" alt=""><div class="row"><button class="btn" id="wrimgS">Bagikan</button><button class="btn g" id="wrimgD">Simpan</button><button class="btn g" id="wrimgC">Tutup</button></div>';
      m.classList.add('on');
      document.getElementById('wrimgC').onclick=function(){m.classList.remove('on');setTimeout(function(){URL.revokeObjectURL(url)},500)};
      document.getElementById('wrimgD').onclick=function(){var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Gambar disimpan')};
      document.getElementById('wrimgS').onclick=function(){
        try{var f=new File([b],name,{type:'image/png'});
          if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Loopify'}).catch(function(){});return}}catch(e){}
        document.getElementById('wrimgD').click();
      };
    },'image/png');
  }
  function loadImg(src,cb){
    if(!src){cb(null);return}
    var im=new Image(),done=0;im.crossOrigin='anonymous';
    function f(v){if(done)return;done=1;cb(v)}
    im.onload=function(){f(im)};im.onerror=function(){f(null)};im.src=src;setTimeout(function(){f(null)},3500);
  }
  function wrapTxt(x,t,mx,fs,maxW){ /* potong teks agar muat */
    x.font=fs;if(x.measureText(t).width<=maxW)return t;
    while(t.length>1&&x.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t+'…';
  }

  /* ---------- 5. Antrean: seret untuk mengatur urutan + penanda + crossfade ---------- */
  var _qR=qR;
  qR=function(){
    _qR();
    try{
      var sp=document.getElementById('sp');if(!sp)return;
      var rowsEl=$$('.rw[onclick^="qGo("]',sp);if(!rowsEl.length)return;
      rowsEl.forEach(function(r){
        var i=+r.getAttribute('onclick').match(/\d+/)[0];r.setAttribute('data-qi',i);
        if(i!==qi){
          var h=document.createElement('span');h.className='q-h';h.textContent='≡';h.setAttribute('data-qh',i);h.setAttribute('aria-label','Geser');
          var b=r.querySelector('button');r.insertBefore(h,b||null);
        }
      });
      var cr=rowsEl.filter(function(r){return +r.getAttribute('data-qi')===qi})[0],nx=rowsEl.filter(function(r){return +r.getAttribute('data-qi')===qi+1})[0];
      function lb(t,before){var d=document.createElement('div');d.className='q-lb';d.textContent=t;before.parentNode.insertBefore(d,before)}
      if(cr)lb('Sedang diputar',cr);
      if(nx)lb('Berikutnya dari antrean',nx);
      /* crossfade cepat */
      var cf=cfg.cf==null?0:+cfg.cf,box=document.createElement('div');box.className='q-cf';
      box.innerHTML='<div class="q-lb" style="margin-left:0">Crossfade</div><div class="chips">'+[[0,'Mati'],[3,'3 dtk'],[5,'5 dtk'],[8,'8 dtk']].map(function(x){return'<span class="chip '+(cf==x[0]?'a':'')+'" onclick="cfgSet(\'cf\','+x[0]+');qR()">'+x[1]+'</span>'}).join('')+'</div>';
      sp.appendChild(box);
    }catch(e){}
  };
  var drag=null;
  document.addEventListener('pointerdown',function(e){
    var h=e.target.closest&&e.target.closest('.q-h');if(!h)return;
    var row=h.closest('.rw');if(!row)return;
    e.preventDefault();e.stopPropagation();
    drag={row:row,id:e.pointerId};row.classList.add('q-dg');
    try{h.setPointerCapture(e.pointerId)}catch(x){}
  },true);
  document.addEventListener('pointermove',function(e){
    if(!drag)return;e.preventDefault();
    var row=drag.row,list=row.parentNode;
    var others=$$('.rw[data-qi]',list).filter(function(r){return r!==row});
    for(var k=0;k<others.length;k++){
      var rc=others[k].getBoundingClientRect(),mid=rc.top+rc.height/2;
      if(e.clientY<mid){if(others[k].previousElementSibling!==row)list.insertBefore(row,others[k]);return}
    }
    var last=others[others.length-1];if(last&&last.nextElementSibling!==row)last.after(row);
  },{passive:false});
  function endDrag(){
    if(!drag)return;var row=drag.row;drag=null;row.classList.remove('q-dg');
    var order=$$('.rw[data-qi]',row.parentNode).map(function(r){return +r.getAttribute('data-qi')});
    var nq=order.map(function(i){return q[i]}),cu=q[qi];
    if(nq.some(function(t){return !t}))return;
    q=nq;qi=Math.max(0,q.indexOf(cu));qR();
  }
  document.addEventListener('pointerup',endDrag,true);document.addEventListener('pointercancel',endDrag,true);

  /* ---------- 6/9. Pemutar: tombol "Mirip lagu ini" ---------- */
  var _rp=rp;
  rp=function(){
    _rp();
    try{
      var p=document.getElementById('pl'),t=cur;if(!p||!t||p.querySelector('.q-sim'))return;
      if(t.loc||t.radio||t.yt||(t.rec&&!t.url))return;
      var act=p.querySelector('.act');if(!act)return;
      var b=document.createElement('button');b.className='btn g q-sim';b.textContent='✨ Mirip lagu ini';b.setAttribute('onclick','autoRadio(1)');
      act.after(b);
    }catch(e){}
  };

  /* ---------- 8. Kartu bagikan playlist ---------- */
  window.plCard=function(i){
    var p=pls[i];if(!p)return;
    var tr=p.tr.map(rs).filter(Boolean);
    if(!tr.length){toast('Playlist masih kosong');return}
    toast('Membuat kartu…');
    var srcs=(p.img?[p.img]:[]).concat(tr.map(function(t){return t.img}).filter(Boolean)).slice(0,4),imgs=[],n=0;
    function done(){
      var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
      var hue=hh(p.n),g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'hsl('+hue+',70%,34%)');g.addColorStop(1,'hsl('+((hue+50)%360)+',75%,14%)');x.fillStyle=g;x.fillRect(0,0,W,H);
      var S=520,X=(W-S)/2,Y=110;
      x.save();x.beginPath();x.rect(X,Y,S,S);x.clip();
      var ok=imgs.filter(Boolean);
      if(ok.length>=4){ok.slice(0,4).forEach(function(im,k){x.drawImage(im,X+(k%2)*S/2,Y+Math.floor(k/2)*S/2,S/2,S/2)})}
      else if(ok.length){x.drawImage(ok[0],X,Y,S,S)}
      else{var gg=x.createLinearGradient(X,Y,X+S,Y+S);gg.addColorStop(0,'hsl('+hue+',80%,55%)');gg.addColorStop(1,'hsl('+((hue+60)%360)+',70%,30%)');x.fillStyle=gg;x.fillRect(X,Y,S,S);x.fillStyle='rgba(255,255,255,.9)';x.font='700 200px sans-serif';x.textAlign='center';x.fillText('♪',W/2,Y+S/2+70)}
      x.restore();
      x.fillStyle='#fff';x.textAlign='left';
      x.font='800 64px sans-serif';x.fillText(wrapTxt(x,p.n,0,'800 64px sans-serif',W-160),80,Y+S+110);
      x.font='400 32px sans-serif';x.fillStyle='rgba(255,255,255,.75)';x.fillText(p.tr.length+' lagu',80,Y+S+160);
      x.font='600 36px sans-serif';
      tr.slice(0,5).forEach(function(t,k){
        x.fillStyle='rgba(255,255,255,.55)';x.fillText(String(k+1),80,Y+S+240+k*62);
        x.fillStyle='#fff';x.fillText(wrapTxt(x,t.title+' - '+t.artist,0,'600 36px sans-serif',W-240),140,Y+S+240+k*62);
      });
      x.textAlign='center';x.font='700 34px sans-serif';x.fillStyle='rgba(255,255,255,.9)';x.fillText('Loopify',W/2,H-50);
      showCard(c,'loopify-playlist.png');
    }
    if(!srcs.length)done();else srcs.forEach(function(s,k){loadImg(s,function(im){imgs[k]=im;if(++n===srcs.length)done()})});
  };
  var _op=openPl;
  openPl=function(i,keep){
    _op(i,keep);
    try{var sp=document.getElementById('sp'),b=sp&&sp.querySelector('[onclick^="plShare("]');
      if(b&&!sp.querySelector('[data-pc]')){var k=document.createElement('button');k.className='btn g';k.setAttribute('data-pc','1');k.setAttribute('onclick','plCard('+i+')');k.textContent='Kartu';b.after(k)}}catch(e){}
  };

  /* ---------- 9. Daily Mix ---------- */
  var dmCache={};
  function dayKey(){var d=new Date();return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
  function seeded(a,seed){ /* acak stabil per hari */
    var s=0;for(var i=0;i<seed.length;i++)s=(s*31+seed.charCodeAt(i))>>>0;
    function r(){s=(s*1664525+1013904223)>>>0;return s/4294967296}
    a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a;
  }
  function topArtists(){
    return Object.keys(stt.ar||{}).map(function(n){return{n:n,s:+stt.ar[n]||0}}).filter(function(x){return x.s>20&&x.n&&x.n!=='Tidak diketahui'}).sort(function(a,b){return b.s-a.s}).slice(0,3).map(function(x){return x.n});
  }
  function mixes(){
    var ar=topArtists();if(!ar.length)return[];
    var n=Math.min(3,ar.length),out=[];
    for(var i=0;i<n;i++){var a=[ar[i]];if(ar.length>1)a.push(ar[(i+1)%ar.length]);out.push(a)}
    return out;
  }
  function localFor(artists){
    var m=known(),res=[];
    m.forEach(function(t){if(t&&!t.yt&&!t.radio&&artists.indexOf(t.artist)>=0)res.push(t)});return res;
  }
  window.dmOpen=function(k){
    var mx=mixes()[k];if(!mx)return;
    var key=dayKey()+':'+k+':'+mx.join('|');
    function show(list){
      lists.dm=list;
      sub(shd('Daily Mix '+(k+1))+'<small style="display:block;margin:0 4px 10px;color:var(--mu)">'+E(mx.join(', '))+' dan lagu serupa</small>'+(list.length?'<button class="btn" onclick="play(lists.dm,0);openP()">▶ Putar</button><div style="height:8px"></div>'+rows('dm',list):'<div class="em">Belum ada lagu.</div>'));
    }
    if(dmCache[key]){show(dmCache[key]);return}
    var loc=localFor(mx);
    sub(shd('Daily Mix '+(k+1))+'<div class="em">Menyiapkan mix…</div>');
    Promise.all(mx.map(function(a){return ytSearch(a).catch(function(){return[]})})).then(function(rs2){
      var seen={},all=[];
      loc.concat([].concat.apply([],rs2).map(function(x){x.h=hh(x.title);return x})).forEach(function(t){if(t&&t.id!=null&&!seen[t.id]){seen[t.id]=1;all.push(t)}});
      dmCache[key]=seeded(all,key).slice(0,30);show(dmCache[key]);
    });
  };
  function addMixes(v){
    if(v.querySelector('[data-dm]')||cfg.dmx===false)return;
    var mx=mixes();if(!mx.length)return;
    var tr=null;$$('.sec h3',v).forEach(function(h){if(h.textContent.trim()==='Trending')tr=h.closest('.sec')});
    var w=document.createElement('div');w.setAttribute('data-dm','1');
    var m=known();
    w.innerHTML='<div class="sec"><h3>Daily Mix</h3></div><div class="hs">'+mx.map(function(a,k){
      var f=null;m.forEach(function(t){if(!f&&t&&a.indexOf(t.artist)>=0&&t.img)f=t});
      var im=f?'<img src="'+E(f.img)+'" alt="">':'',hue=hh(a[0]);
      return'<div class="dm-cd" onclick="dmOpen('+k+')"><div class="dm-cv" style="background:linear-gradient(135deg,hsl('+hue+',70%,45%),hsl('+((hue+60)%360)+',70%,22%))">'+im+'<span>Daily Mix '+(k+1)+'</span></div><small>'+E(a.join(', '))+'</small></div>';
    }).join('')+'</div>';
    if(tr)tr.parentNode.insertBefore(w,tr);else v.appendChild(w);
  }

  /* ---------- 10. Wrapped ---------- */
  function wrData(){
    var SS=(window.wrSrc&&window.wrSrc(window.wrPeriod||'all'))||stt;
    var mm=known(),tot=+SS.tot||0;
    var songs2=Object.keys(SS.pl||{}).map(function(id){var v=SS.pl[id],o=v&&typeof v==='object'?v:{s:+v||0},t=mm.get(id);return{n:(t&&t.title)||o.t||id,a:(t&&t.artist)||o.a||'',s:+o.s||0,c:o.n||0}}).filter(function(x){return x.s>5}).sort(function(a,b){return b.s-a.s}).slice(0,5);
    var arts=Object.keys(SS.ar||{}).map(function(n){return{n:n,s:+SS.ar[n]||0}}).filter(function(x){return x.s>5}).sort(function(a,b){return b.s-a.s}).slice(0,5);
    return{tot:tot,min:Math.round(tot/60),songs:songs2,arts:arts};
  }
  var WRC=[['#ff5f7e','#8b5cf6'],['#12b886','#2d8bff'],['#f59f00','#ff5f7e'],['#7048e8','#15aabf'],['#e64980','#f76707']];
  function wrSlides(d){
    var s=[];
    s.push('<h2>Loopify Wrapped</h2><p>Rangkuman dengarmu · '+(window.wrLabel?window.wrLabel(window.wrPeriod||'all'):'sepanjang waktu')+'</p><div class="big">'+d.min+'</div><p>menit mendengarkan musik'+(d.min>=60?' (sekitar '+(d.tot/3600).toFixed(1)+' jam)':'')+'</p>');
    if(d.songs[0])s.push('<p>Lagu nomor 1-mu</p><h2>'+E(d.songs[0].n)+'</h2><p>'+E(d.songs[0].a)+'</p><div class="big">'+Math.max(1,Math.round(d.songs[0].s/60))+'</div><p>menit diputar'+(d.songs[0].c?' · '+(+d.songs[0].c||0)+'x diputar':'')+'</p>');
    if(d.songs.length)s.push('<h2>5 lagu teratasmu</h2><div class="wr-l">'+d.songs.map(function(x,i){return'<div><em>'+(i+1)+'</em><span>'+E(x.n)+'<small>'+E(x.a)+'</small></span></div>'}).join('')+'</div>');
    if(d.arts.length)s.push('<p>Artis yang paling sering kamu dengar</p><h2>'+E(d.arts[0].n)+'</h2><div class="wr-l">'+d.arts.map(function(x,i){return'<div><em>'+(i+1)+'</em><span>'+E(x.n)+'<small>'+Math.max(1,Math.round(x.s/60))+' menit</small></span></div>'}).join('')+'</div>');
    s.push('<h2>Terima kasih sudah mendengarkan.</h2><p>Terus putar, terus temukan lagu baru.</p><button class="wr-btn" onclick="wrShare()">Bagikan ringkasan</button>');
    return s;
  }
  var wrS=[],wrI=0;
  function wrShow(){
    var w=document.getElementById('wr');if(!w)return;
    var c=WRC[wrI%WRC.length];
    w.style.background='linear-gradient(160deg,'+c[0]+','+c[1]+')';
    w.innerHTML='<div class="wr-bar">'+wrS.map(function(_,k){return'<i class="'+(k<wrI?'d':k===wrI?'a':'')+'"></i>'}).join('')+'</div><button class="wr-x" onclick="wrClose()" aria-label="Tutup">✕</button><div class="wr-s">'+wrS[wrI]+'</div><div class="wr-t"><b onclick="wrGo(-1)"></b><b onclick="wrGo(1)"></b></div>';
  }
  window.wrGo=function(d){var n=wrI+d;if(n<0)return;if(n>=wrS.length){wrClose();return}wrI=n;wrShow()};
  window.wrClose=function(){var w=document.getElementById('wr');if(w)w.classList.remove('on')};
  window.wrOpen=function(p){
    window.wrPeriod=p||'all';
    var d=wrData();if(d.tot<60){toast(window.wrPeriod==='all'?'Dengarkan beberapa lagu dulu, lalu buka Wrapped':'Belum ada data untuk periode ini. Data bulanan mulai dihitung sejak pembaruan ini');return}
    var w=document.getElementById('wr');if(!w){w=document.createElement('div');w.id='wr';document.getElementById('app').appendChild(w)}
    wrS=wrSlides(d);wrI=0;wrShow();w.classList.add('on');
  };
  window.wrShare=function(){
    var d=wrData(),W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5f7e');g.addColorStop(.55,'#8b5cf6');g.addColorStop(1,'#2d8bff');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#fff';x.textAlign='left';
    x.font='800 84px sans-serif';x.fillText('Loopify Wrapped',80,200);
    x.font='400 40px sans-serif';x.fillStyle='rgba(255,255,255,.85)';x.fillText('Rangkuman dengarmu · '+(window.wrLabel?window.wrLabel(window.wrPeriod||'all'):'sepanjang waktu'),80,262);
    x.fillStyle='#fff';x.font='800 190px sans-serif';x.fillText(String(d.min),80,520);
    x.font='400 42px sans-serif';x.fillText('menit mendengarkan',80,584);
    x.font='700 46px sans-serif';x.fillText('Lagu teratas',80,720);
    d.songs.forEach(function(t,k){x.font='700 44px sans-serif';x.fillStyle='rgba(255,255,255,.6)';x.fillText(String(k+1),80,800+k*86);x.fillStyle='#fff';x.fillText(wrapTxt(x,t.n,0,'700 44px sans-serif',W-240),150,800+k*86)});
    x.font='700 46px sans-serif';x.fillStyle='#fff';x.fillText('Artis teratas',80,1290);
    d.arts.forEach(function(t,k){x.font='700 44px sans-serif';x.fillStyle='rgba(255,255,255,.6)';x.fillText(String(k+1),80,1370+k*86);x.fillStyle='#fff';x.fillText(wrapTxt(x,t.n,0,'700 44px sans-serif',W-240),150,1370+k*86)});
    x.textAlign='center';x.font='700 40px sans-serif';x.fillText('Loopify',W/2,H-70);
    showCard(c,'loopify-wrapped.png');
  };
  function addWrapped(v){
    if(v.querySelector('[data-wr]'))return;
    var h1=v.querySelector('h1');if(!h1||h1.textContent.trim()!=='Profil')return;
    var first=v.querySelector('.pcard');if(!first)return;
    var d=document.createElement('div');d.className='wr-c';d.setAttribute('data-wr','1');d.setAttribute('onclick',"wrOpen('all')");
    d.innerHTML='<span class="wr-e">✨</span><div><b>Loopify Wrapped</b><br><small>Lihat rangkuman dengarmu</small><div class="wr-p"><span onclick="event.stopPropagation();wrOpen(\'all\')">Semua</span><span onclick="event.stopPropagation();wrOpen(\'m0\')">Bulan ini</span><span onclick="event.stopPropagation();wrOpen(\'m1\')">Bulan lalu</span></div></div>';
    first.after(d);
  }

  /* ---------- pengamat halaman ---------- */
  function deco(){var v=document.getElementById('v');if(!v)return;try{if(v.querySelector('.hero'))addMixes(v);addWrapped(v)}catch(e){}}
  var vv=document.getElementById('v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){setTimeout(deco,0)}).observe(vv,{childList:true});
  setTimeout(deco,300);
})();
}catch(e){console.error('[loopify] extra10.js',e)}

/* ==== extra14.js ==== */
try{
/* Loopify v4.3 - Putar otomatis lagu berikutnya (autoplay) saat antrean habis, untuk semua jenis lagu.
   Menggantikan autoRadio bawaan yang hanya jalan untuk lagu online dan hanya mencari di Audius.
   - Lagu online : cari lagu serupa (artis, lalu judul) dari semua sumber.
   - Video       : cari video serupa dan putar sebagai antrean video.
   - Lagu lokal  : lanjut ke lagu lain di perangkat (acak).
   Bisa dimatikan lewat Pengaturan > "Putar otomatis serupa". Dimuat setelah extra13.js. */
(function(){
  'use strict';
  var busy=0;
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[k];a[k]=t}return a}
  function usable(n){return n&&!/^(Tidak diketahui|Lagu Saya|YouTube|Internet Archive|Various Artists)$/i.test(String(n).trim())}
  function clean(t){return String(t||'').replace(/\(.*?\)|\[.*?\]|official|video|lyrics?|lirik|audio|mv/ig,' ').replace(/\s+/g,' ').trim()}
  async function onlineSearch(q,skip){
    var r=await fetch('/api/music?src=all&q='+encodeURIComponent(q));
    if(!r.ok)return[];
    return arrOf(await r.json()).filter(function(x){return x&&x.url&&!skip[x.id]}).map(function(x){return Object.assign({},x,{h:hh(x.title)})});
  }
  autoRadio=async function(force){
    var t=cur;
    if(!t||t.radio||busy)return;
    if(!force&&cfg.ar===false)return;
    if(t.rec&&!t.url)return;
    busy=1;
    try{
      var skip={};skip[t.id]=1;(q||[]).forEach(function(x){if(x)skip[x.id]=1});
      if(t.loc){
        var l=shuffle(songs.filter(function(s){return s&&!skip[s.id]})).slice(0,30);
        if(!l.length)return;
        if(!force&&cur!==t)return;
        toast('Memutar lagu berikutnya dari koleksimu…');
        play(l,0);return;
      }
      if(!t.loc){
        toast('Memutar video serupa…');
        var yq=(usable(t.artist)?t.artist+' ':'')+clean(t.title);
        var v=(await ytSearch(yq)).filter(function(x){return !skip[x.id]});
        if(!force&&cur!==t)return;
        if(v.length)playV(shuffle(v.slice(0,12)).slice(0,10),0,1);
        return;
      }
      toast('Memutar lagu serupa…');
      var queries=[];
      if(usable(t.artist))queries.push(t.artist);
      if(clean(t.title))queries.push(clean(t.title));
      var a=[];
      for(var i=0;i<queries.length&&!a.length;i++){try{a=await onlineSearch(queries[i],skip)}catch(e){}}
      if(!a.length||(!force&&cur!==t))return;
      play(shuffle(a).slice(0,15),0);
    }catch(e){}
    finally{busy=0}
  };
})();
}catch(e){console.error('[loopify] extra14.js',e)}

/* ==== extra15.js ==== */
try{
/* Loopify v4.5 - Dynamic Island: notifikasi "sedang diputar" gaya iPhone, interaktif.
   - Lagu ganti/mulai : pil membesar (foto penyanyi, judul, lirik berjalan, seekbar, prev/play/next), lalu mengecil sendiri.
   - Pil kecil        : foto + equalizer animasi. Ketuk untuk membuka, tahan untuk putar/jeda.
   - Lirik            : tersinkron (LRC) dengan baris aktif di tengah, ketuk baris = lompat. Lirik biasa bergulir mengikuti progres.
   - Foto             : cover asli lagu; kalau tidak ada / video YouTube, dicari foto yang cocok dengan penyanyi (iTunes), lalu inisial penyanyi.
   - Ringan           : animasi hanya transform/opacity, update progres via requestAnimationFrame hanya saat terbuka dan memutar.
   Mati lewat cfg.npn=false. Dimuat setelah extra14.js. */
(function(){
  'use strict';
  if(typeof document==='undefined')return;
  var app=document.getElementById('app');if(!app)return;
  var isl=document.createElement('div');isl.id='isl';
  var SV={prev:'<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    ly:'<svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1zm3 4v2h10V8zm0 4v2h7v-2z"/></svg>'};
  var EQ='<span class="eq"><i></i><i></i><i></i><i></i></span>';
  isl.innerHTML='<div class="bgc"><img alt="" id="islbg" decoding="async"></div><div class="ic"><img alt="" id="islc" decoding="async">'+EQ+'</div>'+
    '<div class="ex"><div class="tp"><img alt="" id="islc2" decoding="async"><div class="tt"><b><span class="mq" id="islt"></span></b><span id="isla"></span></div>'+EQ+'</div>'+
    '<div class="ly" id="islly"><div class="lst" id="isllst"></div><div class="lm" id="islm"></div></div>'+
    '<div class="sk"><em id="islct">0:00</em><div class="bar" id="islb"><u id="islu"></u></div><em id="isldu">0:00</em></div>'+
    '<div class="cb"><span></span><button id="islp" aria-label="Sebelumnya">'+SV.prev+'</button><button class="pp" id="islpp" aria-label="Putar atau jeda"><span class="i1">'+SV.play+'</span><span class="i2">'+SV.pause+'</span></button><button id="islnx" aria-label="Berikutnya">'+SV.next+'</button><button class="lb on" id="islly2" aria-label="Tampilkan lirik">'+SV.ly+'</button></div></div>';
  app.appendChild(isl);
  var $i=function(id){return document.getElementById(id)};
  var el={bg:$i('islbg'),c:$i('islc'),c2:$i('islc2'),t:$i('islt'),a:$i('isla'),ly:$i('islly'),lst:$i('isllst'),lm:$i('islm'),u:$i('islu'),ct:$i('islct'),du:$i('isldu'),bar:$i('islb'),lb:$i('islly2')};
  var started=0,big=false,hideT=0,lastId=null,lastTitle='',drag=0,dragRatio=0,lpT=0,lpFired=0,sx=0,sy=0,moved=0,raf=0,isPl=false,isShow=false,gone=0,vt=0;
  var lastR=-1,lastS=-1,lastD='',lyKey='',lyMode='',lyEls=[],lyT=[],lyI=-2,lyY=-1,lyOn=true;
  try{lyOn=localStorage.getItem('ma_isl_ly')!=='0'}catch(e){}
  el.lb.classList.toggle('on',lyOn);
  var fmt=function(s){return(typeof f2==='function')?f2(s):'0:00'};
  function enabled(){try{return cfg.npn!==false}catch(e){return true}}
  function vib(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
  function playing(){try{return !!(cur&&act&&!act.paused)}catch(e){return false}}
  function playerOpen(){var p=document.getElementById('pl'),v=document.getElementById('vo'),k=document.getElementById('kr');
    return !!((p&&p.classList.contains('on'))||(v&&v.classList.contains('on'))||(k&&k.classList.contains('on')))}

  /* ---------- foto sesuai penyanyi ---------- */
  var ART_KEY='ma_isl_art',artC={},artNeg={};
  try{artC=JSON.parse(localStorage.getItem(ART_KEY)||'{}')||{}}catch(e){artC={}}
  function saveArt(){try{var k=Object.keys(artC);if(k.length>160){k.slice(0,40).forEach(function(x){delete artC[x]})}localStorage.setItem(ART_KEY,JSON.stringify(artC))}catch(e){}}
  var BAD=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio|YouTube|Internet Archive|Various Artists|Unknown( Artist)?)$/i;
  function norm(s){return String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyrics?|lirik|video|music|audio|mv|hd|hq|klip|feat|ft|topic|vevo)\b/g,' ').replace(/[^a-z0-9À-￿ ]+/g,' ').replace(/\s+/g,' ').trim()}
  function who(t){
    var ti=String(t.title||''),ar=String(t.artist||'').replace(/\s*-\s*Topic$/i,'').replace(/VEVO$/i,'').trim();
    if(BAD.test(ar))ar='';
    if(t.yt||!ar){
      var z=ti.replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\s+/g,' ').trim(),m=z.split(/\s[-–—|]\s/);
      if(m.length>1){ar=m[0].trim();ti=m.slice(1).join(' ').trim()}
    }
    return{a:ar,t:ti}
  }
  function initials(name){
    var n=String(name||'').trim()||'♪',w=n.split(/\s+/).filter(Boolean),s=(w.length>1?w[0].charAt(0)+w[1].charAt(0):n.slice(0,2)).toUpperCase().replace(/[&<>"']/g,''),h=0;
    for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',70%,56%)"/><stop offset="1" stop-color="hsl('+((h+50)%360)+',70%,34%)"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><text x="48" y="61" font-family="Sora,Arial,sans-serif" font-size="38" font-weight="700" text-anchor="middle" fill="#fff">'+s+'</text></svg>';
    return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg)
  }
  var coverSrc='';
  function setCover(src,fb){
    if(src===coverSrc)return;coverSrc=src;
    [el.c,el.c2,el.bg].forEach(function(im){im.onerror=function(){this.onerror=null;this.src=fb};im.src=src});
  }
  async function itunes(term,entity){
    var ctl=typeof AbortController==='function'?new AbortController():null,to=setTimeout(function(){try{ctl&&ctl.abort()}catch(e){}},7000);
    try{
      var r=await fetch('https://itunes.apple.com/search?media=music&limit=8&entity='+entity+'&term='+encodeURIComponent(term),ctl?{signal:ctl.signal}:{});
      if(!r.ok)return null;var j=await r.json();return j.results||[];
    }catch(e){return null}finally{clearTimeout(to)}
  }
  function pickArt(rs,a,ti){
    var na=norm(a),nt=norm(ti),best=null;
    for(var i=0;i<(rs||[]).length;i++){
      var r=rs[i],ra=norm(r.artistName),rt=norm(r.trackName||r.collectionName);
      var am=!!(na&&ra&&(ra.indexOf(na)>=0||na.indexOf(ra)>=0)),tm=!!(nt&&rt&&(rt.indexOf(nt)>=0||nt.indexOf(rt)>=0));
      if(na?am:tm){if(!best)best=r;if(am&&tm){best=r;break}}
    }
    var u=best&&best.artworkUrl100;
    return(u&&/^https:\/\/[^\/]*mzstatic\.com\//.test(u))?u.replace(/\/\d+x\d+bb\.(jpg|png)/,'/600x600bb.$1'):'';
  }
  async function findArt(w,key,id){
    var u='',rs=await itunes((w.a+' '+w.t).trim(),'song');
    if(rs===null)return;                                   /* jaringan gagal: coba lagi lain waktu */
    u=pickArt(rs,w.a,w.t);
    if(!u&&w.a){rs=await itunes(w.a,'album');if(rs===null)return;u=pickArt(rs,w.a,'')}
    if(!u){artNeg[key]=1;return}
    artC[key]=u;saveArt();
    if(cur&&cur.id===id)setCover(u,initials(w.a||w.t));
  }
  function coverFor(t){
    var w=who(t),key=norm(w.a)+'|'+norm(w.t),fb=initials(w.a||t.artist||t.title);
    var real=t.img&&!/icon-(192|512)|maskable/.test(t.img)&&!t.yt;
    if(real){setCover(t.img,fb);return}
    if(artC[key]){setCover(artC[key],fb);return}
    setCover((t.yt&&t.img)?t.img:fb,fb);                    /* sementara: thumbnail video / inisial penyanyi */
    if(artNeg[key]||(!w.a&&!w.t)||t.radio)return;
    findArt(w,key,t.id).catch(function(){});
  }

  /* ---------- lirik ---------- */
  function lyState(t){
    if(t.radio)return'none';
    var L=lyc[t.id];if(L)return isLrc(L)?'sync':'plain';
    try{return lyS[t.id]==='none'?'none':'load'}catch(e){return'load'}
  }
  function buildLy(t,mode,L){
    el.lst.textContent='';lyEls=[];lyT=[];lyI=-2;lyY=-1;el.lst.style.transform='translate3d(0,0,0)';
    var frag=document.createDocumentFragment(),lines=[];
    if(mode==='sync'){var al=alOf(t)||[];al.forEach(function(x){lines.push(x.s||'♪');lyT.push(x.t)})}
    else lines=String(L).split(/\r?\n/).map(function(s){return s.trim()}).filter(Boolean).slice(0,300);
    lines.forEach(function(s,i){var p=document.createElement('p');p.textContent=s;p.setAttribute('data-i',i);frag.appendChild(p);lyEls.push(p)});
    el.lst.appendChild(frag);
    el.ly.classList.toggle('pn',mode==='plain');
  }
  function setLine(i){
    if(i===lyI)return;
    if(lyI>=0&&lyEls[lyI])lyEls[lyI].classList.remove('c');
    lyI=i;
    if(i>=0&&lyEls[i]){var p=lyEls[i];p.classList.add('c');el.lst.style.transform='translate3d(0,'+(-(p.offsetTop+p.offsetHeight/2-54))+'px,0)'}
    else el.lst.style.transform='translate3d(0,0,0)';
  }
  function syncLy(){
    var t=cur;if(!t)return;
    try{if(!t.radio&&!lyTry[t.id]&&typeof fetchLy==='function')fetchLy(t)}catch(e){}
    var st=lyState(t),L=lyc[t.id]||'',key=t.id+'|'+st+'|'+L.length;
    if(key!==lyKey){
      lyKey=key;lyMode=st;
      if(st==='sync'||st==='plain')buildLy(t,st,L);else{el.lst.textContent='';lyEls=[];lyT=[];lyI=-2}
      el.lm.textContent=st==='load'?'Memuat lirik…':(st==='none'?'Lirik tidak tersedia':'');
    }
    var nl=!(lyOn&&st!=='none');
    if(isl.classList.contains('nl')!==nl)isl.classList.toggle('nl',nl);
  }

  /* ---------- buka / tutup ---------- */
  function expand(auto){
    if(big)return;big=true;isl.classList.add('big');vib(10);
    lastR=-1;lastS=-1;lastD='';lyI=-2;marquee();arm(auto?5200:8000);upd();kick();
  }
  function stay(){clearTimeout(vt);if(isShow)vt=setTimeout(hideIsl,8000)}
  function hideIsl(){if(drag){stay();return}gone=1;collapse();slow()}
  function collapse(){if(!big)return;big=false;isl.classList.remove('big');clearTimeout(hideT)}
  function arm(ms){clearTimeout(hideT);hideT=setTimeout(function(){if(drag){arm(2000);return}collapse()},ms)}
  function marquee(){
    var m=el.t;m.classList.remove('run');m.style.removeProperty('--mx');
    setTimeout(function(){var w=m.parentNode.clientWidth,s=m.scrollWidth;if(s>w+2){m.style.setProperty('--mx',-(s-w+40)+'px');m.classList.add('run')}},560);
  }
  function setTrack(){
    var t=cur;if(!t)return;
    coverFor(t);
    var ti=t.title||'Tanpa judul';
    el.t.textContent=ti;el.a.textContent=who(t).a||t.artist||(t.radio?'Radio':(t.yt?'YouTube':'Loopify'));
    isl.title=ti;lastTitle=ti;lyKey='';if(big)marquee();
  }

  /* ---------- update (progres + lirik) ---------- */
  function upd(){
    var a=act;if(!big||!a||!cur)return;
    var c=a.currentTime||0,d=a.duration,live=!!cur.radio||!(d>0&&isFinite(d));
    if(isl.classList.contains('live')!==live)isl.classList.toggle('live',live);
    if(!drag){
      var r=live?0:Math.min(1,c/d);
      if(Math.abs(r-lastR)>.0004){lastR=r;el.u.style.transform='scaleX('+r+')'}
      var s=Math.floor(c);if(s!==lastS){lastS=s;el.ct.textContent=fmt(c)}
      var ds=cur.radio?'LIVE':fmt(d);if(ds!==lastD){lastD=ds;el.du.textContent=ds}
    }
    if(lyMode==='sync'&&lyT.length){
      var ct=c+.25,i=lyI<0?-1:lyI;
      if(i>=0&&lyT[i]>ct)i=-1;
      while(i+1<lyT.length&&lyT[i+1]<=ct)i++;
      setLine(i);
    }else if(lyMode==='plain'&&lyEls.length&&!live){
      var y=Math.round(Math.min(1,c/d)*Math.max(0,el.lst.scrollHeight-100));
      if(y!==lyY){lyY=y;el.lst.style.transform='translate3d(0,'+(-y)+'px,0)'}
    }
  }
  function frame(){raf=0;if(!big||document.hidden)return;upd();if(playing())raf=requestAnimationFrame(frame)}
  function kick(){if(!raf&&big&&!document.hidden&&playing())raf=requestAnimationFrame(frame)}

  /* ---------- sinkron ringan (status, ganti lagu) ---------- */
  function slow(){
    if(document.hidden)return;
    if(!started&&cur&&playing())started=1;
    var on=!!(enabled()&&started&&cur);
    if(on&&(cur.id!==lastId||(cur.title||'Tanpa judul')!==lastTitle))gone=0;
    var vis=on&&!playerOpen()&&!gone;
    if(vis!==isShow){isShow=vis;if(vis)stay();isl.classList.toggle('show',vis);document.body.classList.toggle('isl-on',vis)}
    if(!on){if(big)collapse();return}
    if(!vis&&big)collapse();
    var p=playing();if(p!==isPl){isPl=p;isl.classList.toggle('pl',p)}
    if(cur.id!==lastId||(cur.title||'Tanpa judul')!==lastTitle){lastId=cur.id;setTrack();if(vis){expand(true);stay()}}
    syncLy();
    if(big){upd();kick()}
  }
  setInterval(slow,400);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)slow()});
  function onPlay(){started=1;slow()}
  try{[A,B].forEach(function(a){a.addEventListener('play',onPlay);a.addEventListener('pause',slow)})}catch(e){}
  var _ms=window.ms;
  if(typeof _ms==='function'){window.ms=function(){var r=_ms.apply(this,arguments);if(cur&&(playing()||cur.yt))started=1;setTimeout(slow,60);return r}}

  /* ---------- interaksi ---------- */
  function press(e){
    if(e.target.closest('button')||e.target.closest('#islb'))return;
    var p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;moved=0;lpFired=0;
    if(!big){lpT=setTimeout(function(){lpFired=1;vib(14);try{toggle()}catch(e){}isl.classList.remove('pop');void isl.offsetWidth;isl.classList.add('pop');setTimeout(slow,120)},520)}
  }
  function mv(e){var p=e.touches?e.touches[0]:e;if(Math.abs(p.clientX-sx)+Math.abs(p.clientY-sy)>8){moved=1;clearTimeout(lpT)}}
  function rel(e){
    clearTimeout(lpT);
    var tg=e.target;
    if(tg.closest&&(tg.closest('button')||tg.closest('#islb')||tg.closest('#islly')))return;
    var p=(e.changedTouches&&e.changedTouches[0])||e,dy=p.clientY-sy;
    if(lpFired){lpFired=0;return}
    if(big){
      if(moved&&dy<-24){collapse();return}
      if(!moved){if(tg.closest('.tp')){collapse();try{openP()}catch(x){}}else arm(8000)}
    }else if(!moved||dy>16){expand(false)}
  }
  isl.addEventListener('touchstart',press,{passive:true});isl.addEventListener('touchmove',mv,{passive:true});isl.addEventListener('touchend',rel);
  isl.addEventListener('mousedown',press);isl.addEventListener('mousemove',function(e){if(e.buttons)mv(e)});isl.addEventListener('mouseup',rel);
  isl.addEventListener('mouseleave',function(){clearTimeout(lpT)});

  function btn(b,fn){var h=function(e){e.stopPropagation();vib(8);try{fn()}catch(x){}arm(8000);stay();setTimeout(slow,120)};
    b.addEventListener('click',h);['touchstart','mousedown','mouseup','touchend'].forEach(function(n){b.addEventListener(n,function(e){e.stopPropagation()},{passive:true})})}
  btn($i('islp'),function(){if(act&&act.currentTime>4&&!(cur&&cur.radio)){act.currentTime=0}else nxt(-1)});
  btn($i('islnx'),function(){nxt(1)});
  btn($i('islpp'),function(){toggle();var p=playing();isPl=p;isl.classList.toggle('pl',p);kick()});
  btn(el.lb,function(){lyOn=!lyOn;el.lb.classList.toggle('on',lyOn);try{localStorage.setItem('ma_isl_ly',lyOn?'1':'0')}catch(e){}syncLy();lyI=-2;setTimeout(upd,60)});

  /* ketuk baris lirik tersinkron = lompat ke baris itu */
  el.ly.addEventListener('click',function(e){
    var p=e.target.closest&&e.target.closest('p');arm(8000);
    if(!p||lyMode!=='sync')return;var i=+p.getAttribute('data-i');
    if(lyT[i]!=null){try{act.currentTime=Math.max(0,lyT[i])}catch(x){}vib(8);lyI=-2;setTimeout(function(){upd();kick()},60)}
  });

  /* seek: geser bar */
  var bar=el.bar;
  function ratioOf(e){var p=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e,r=bar.getBoundingClientRect();return Math.max(0,Math.min(1,(p.clientX-r.left)/r.width))}
  function dstart(e){e.stopPropagation();if(isl.classList.contains('live'))return;drag=1;bar.classList.add('drag');dmove(e);clearTimeout(hideT)}
  function dmove(e){if(!drag)return;e.stopPropagation();dragRatio=ratioOf(e);var d=act&&act.duration;el.u.style.transform='scaleX('+dragRatio+')';if(d>0&&isFinite(d))el.ct.textContent=fmt(dragRatio*d)}
  function dend(e){if(!drag)return;e.stopPropagation();drag=0;bar.classList.remove('drag');var d=act&&act.duration;if(d>0&&isFinite(d)){try{act.currentTime=dragRatio*d}catch(x){}}lastR=-1;lastS=-1;lyI=-2;arm(8000);stay();setTimeout(function(){upd();kick()},60)}
  bar.addEventListener('touchstart',dstart,{passive:true});bar.addEventListener('touchmove',dmove,{passive:true});bar.addEventListener('touchend',dend);
  bar.addEventListener('mousedown',dstart);window.addEventListener('mousemove',function(e){if(drag)dmove(e)});window.addEventListener('mouseup',function(e){if(drag)dend(e)});

  /* ketuk di luar island = tutup */
  document.addEventListener('pointerdown',function(e){if(big&&!isl.contains(e.target)){collapse();stay()}},true);

  /* tombol "Coba notifikasi" di Profil: tampilkan island */
  var _nt=window.notifTest;
  window.notifTest=function(){try{if(cur&&enabled()){started=1;lastId=null;slow();return}}catch(e){}if(_nt)_nt()};
  window.islandShow=function(){started=1;gone=0;slow();expand(false);stay()};
})();
}catch(e){console.error('[loopify] extra15.js',e)}

/* ==== extra16.js ==== */
try{
/* Loopify v4.6 - ala Spotify & YT Music: Jelajahi semua, filter hasil (Lagu/Artis/Playlist), Ikuti artis,
   Library (sematkan, urutkan, tampilan grid, Lagu Disukai), cover playlist mosaik, chip suasana di Beranda.
   Dimuat setelah extra15.js (pasangan extra16.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  function low(s){return String(s||'').trim().toLowerCase()}
  function mine(){var m={},o=[];[].concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(a,p){return a.concat(p.tr.map(rs))},[])).forEach(function(t){if(t&&t.id!=null&&!m[t.id]){m[t.id]=1;o.push(t)}});return o}
  function avatar(x){return E(cov(x.img?{img:x.img}:{h:hh(x.n||x.name)}))}

  /* ---------- 1. Jelajahi semua + filter hasil pencarian ---------- */
  var CAT=[['Pop',280],['Rock',215],['Indie',260],['EDM',300],['Jazz',190],['Hip-Hop',330],['Dangdut',20],['Santai',160],['Galau',240],['Semangat',35],['Gym',0],['Tidur',225],['Akustik',95],['Lo-Fi',200],['K-Pop',320],['Anime',350]];
  var FIL='all';
  var _ex=V.explore;
  V.explore=function(){
    var h=_ex.call(V);
    var g='<div id="x16cat"><div class="sec"><h3>Jelajahi semua</h3></div><div class="x16g2">'+CAT.map(function(c){return'<div class="x16c" style="background:linear-gradient(150deg,hsl('+c[1]+',75%,52%),hsl('+(c[1]+35)+',70%,26%))" onclick="qs(\''+c[0]+'\')"><b>'+c[0]+'</b></div>'}).join('')+'</div></div>';
    h=h.replace(/<div class="sec"><h3>Genre Populer<\/h3><\/div><div class="gg">(?:<div class="gt"[^>]*>[^<]*<\/div>)*<\/div>/,g);
    return h.replace('<div id="res">','<div id="x16f"></div><div id="x16"></div><div id="res">');
  };
  window.x16F=function(f){FIL=f;rnd()};
  function rnd(){
    var q=low(typeof lq=='string'?lq:''),f=Q('#x16f'),b=Q('#x16'),r=Q('#res'),cat=Q('#x16cat');
    if(!f||!b)return;
    if(cat)cat.style.display=q?'none':'';
    if(!q){f.innerHTML='';b.innerHTML='';if(r)r.style.display='';return}
    f.innerHTML='<div class="chips">'+[['all','Semua'],['sg','Lagu'],['ar','Artis'],['pl','Playlist']].map(function(x){return'<span class="chip '+(FIL==x[0]?'a':'')+'" onclick="x16F(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>';
    var qq=String(lq).trim();fetchArtists(qq);
    var A=(ARC[qq]||[]).slice(),S={};A.forEach(function(x){S[low(x.name)]=1});
    mine().filter(function(t){return low(t.artist).indexOf(q)>=0}).forEach(function(t){var n=String(t.artist||'').trim(),k=low(n);if(!n||GEN.test(n)||S[k])return;S[k]=1;A.push({src:'',id:'',name:n,img:t.img,subs:0,v:0})});
    A=A.slice(0,8);window.x16A=A;
    var P=pls.map(function(p,i){return{p:p,i:i}}).filter(function(x){return low(x.p.n).indexOf(q)>=0}),h='';
    var AL=FIL=='ar'?A:A.slice(0,4);
    if(FIL=='all'||FIL=='ar')h+=AL.length?'<div class="sec"><h3>Artis</h3></div>'+AL.map(function(x,i){return'<div class="rw" onclick="x16AG('+i+')"><img src="'+avatar(x)+'" style="border-radius:50%" alt=""><div><b>'+E(x.name)+(x.v?' ✓':'')+'</b><small>'+subT(x)+'</small></div></div>'}).join(''):FIL=='ar'?'<div class="em">'+(ARC[qq]===null?'Mencari artis…':'Tidak ada artis yang cocok.')+'</div>':'';
    if(FIL=='all'||FIL=='pl')h+=P.length?'<div class="sec"><h3>Playlist</h3></div>'+P.map(function(x){return'<div class="rw" onclick="openPl('+x.i+')"><img src="'+E(cov(x.p.img?{img:x.p.img}:(x.p.tr.map(rs).filter(Boolean)[0]||{h:hh(x.p.n)})))+'" alt=""><div><b>'+E(x.p.n)+'</b><small>'+x.p.tr.length+' lagu</small></div></div>'}).join(''):FIL=='pl'?'<div class="em">Tidak ada playlist yang cocok.</div>':'';
    if(FIL=='all'&&h)h+='<div class="sec"><h3>Lagu</h3></div>';
    b.innerHTML=h;if(r)r.style.display=(FIL=='ar'||FIL=='pl')?'none':'';
  }
  var _ds=doSearch;
  doSearch=async function(s){await _ds(s);try{rnd()}catch(e){}};

  /* ---------- 2. Profil artis seperti channel (Lagu / Remix / Koleksimu) + Ikuti ---------- */
  var ARC={},CH=null,CHC={},CHN={};
  function fmtN(n){n=+n||0;return n>=1e6?(n/1e6).toFixed(1).replace('.0','')+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}
  function subT(a){return a.src=='yt'?(a.subs?fmtN(a.subs)+' subscriber · ':'')+'YouTube':a.src=='au'?(a.subs?fmtN(a.subs)+' pengikut · ':'')+'Audius':'Di koleksimu'}
  function fetchArtists(q){
    if(!q||ARC[q]!==undefined)return;ARC[q]=null;
    fetch('/api/artist?q='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){ARC[q]=Array.isArray(a)?a:[];try{rnd()}catch(e){}});
  }
  window.x16AG=function(i){var a=(window.x16A||[])[i];if(!a)return;if(a.id)x16Ch(a);else artistPg(a.name)};
  function fol(){return ls.get('fol',[])}
  function isFol(n){return fol().some(function(x){return low(x.n)==low(n)})}
  function folTg(a){
    var l=fol(),k=low(a.name),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else{var m=mine().filter(function(t){return low(t.artist)==k&&t.img})[0];l.unshift({n:a.name,img:a.img||(m?m.img:''),s:a.src||'',i:a.id||''})}
    ls.set('fol',l);
  }
  function folBtn(a){
    var b=Q('#x16fb');if(!b)return;
    var paint=function(){var on=isFol(a.name);b.textContent=on?'Mengikuti':'Ikuti';b.className='x16fb'+(on?' on':'')};
    b.onclick=function(){folTg(a);paint()};paint();
  }
  function chBody(){
    var a=CH.a,tr=CH.tr,own=CH.own,L=CH.tab=='new'?(CH.nw||null):tr===null&&CH.tab!='own'?null:CH.tab=='rmx'?tr.filter(function(x){return x.rmx}):CH.tab=='own'?own:tr.filter(function(x){return!x.rmx});
    if(L===null)return'<div class="em">Memuat…</div>';
    if(!L.length)return'<div class="em">'+(CH.tab=='rmx'?'Belum ada remix.':CH.tab=='new'?'Belum ada rilis terbaru.':'Belum ada lagu.')+'</div>';
    return'<div class="x16pb"><button class="btn" onclick="P(\'ch\',0)">▶ Putar</button><button class="btn g" onclick="x16Shuf()">⤮ Acak</button></div>'+rows('ch',L);
  }
  function chTabs(){
    var T=[['lagu','Terpopuler']];if(CH.a&&CH.a.id&&CH.a.src=='yt')T.push(['new','Terbaru']);T.push(['rmx','Remix']);if(CH.own.length)T.push(['own','Koleksimu']);
    return T.map(function(x){return'<span class="chip '+(CH.tab==x[0]?'a':'')+'" onclick="x16Tab(\''+x[0]+'\')">'+x[1]+'</span>'}).join('');
  }
  function loadNew(){
    var a=CH.a,key=CH.key;
    if(CHN[key]){CH.nw=CHN[key];return}
    fetch('/api/artist?src='+a.src+'&id='+encodeURIComponent(a.id)+'&latest=1&n=25&name='+encodeURIComponent(a.name)).then(function(r){return r.ok?r.json():{tracks:[]}}).catch(function(){return{tracks:[]}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return Object.assign(mkV(x.id,x.title,x.artist),{ts:x.ts})}).sort(function(m,n){return(n.ts||0)-(m.ts||0)});
      CHN[key]=t;
      if(CH&&CH.key==key){CH.nw=t;if(CH.tab=='new'){var b=Q('#x16b');if(b)b.innerHTML=chBody()}}
    });
  }
  window.x16Tab=function(t){CH.tab=t;if(t=='new'&&CH.nw===undefined)loadNew();var c=Q('#x16t'),b=Q('#x16b');if(c)c.innerHTML=chTabs();if(b)b.innerHTML=chBody()};
  window.x16Shuf=function(){lists.ch=(lists.ch||[]).slice().sort(function(){return Math.random()-.5});P('ch',0)};
  window.x16Ch=function(a){
    clp();var key=a.src+a.id;
    CH={a:a,key:key,tab:'lagu',tr:CHC[key]||null,own:mine().filter(function(t){return low(t.artist)==low(a.name)})};
    sub(shd(E(a.name))+'<div class="x16hd"><img src="'+avatar(a)+'" alt=""><h2>'+E(a.name)+(a.v?' ✓':'')+'</h2><small>'+subT(a)+'</small><button id="x16fb"></button></div><div class="chips" id="x16t">'+chTabs()+'</div><div id="x16b">'+chBody()+'</div>');
    folBtn(a);
    if(CH.tr)return;
    fetch('/api/artist?src='+a.src+'&id='+encodeURIComponent(a.id)+'&name='+encodeURIComponent(a.name)).then(function(r){return r.ok?r.json():{tracks:[]}}).catch(function(){return{tracks:[]}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return a.src=='yt'?Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx}):Object.assign({},x,{h:hh(x.title)})});
      CHC[key]=t;if(CH&&CH.key==key){CH.tr=t;if(!t.length&&CH.own.length)CH.tab='own';x16Tab(CH.tab)}
    });
  };
  var _ap=artistPg;
  artistPg=function(n){
    n=String(n||'').trim();
    if(!n||GEN.test(n))return _ap(n);
    clp();sub(shd(E(n))+'<div class="em">Memuat artis…</div>');
    var old=function(){_ap(n);try{var h=Q('#sp h2');if(h&&!Q('#x16fb')){var b=document.createElement('button');b.id='x16fb';h.parentNode.appendChild(b);folBtn({name:n})}}catch(e){}};
    fetch('/api/artist?q='+encodeURIComponent(n)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){
      var m=(Array.isArray(a)?a:[]).filter(function(x){return low(x.name)==low(n)})[0];
      if(m)x16Ch(m);else old();
    });
  };
  window.x16FG=function(i){var f=fol()[i];if(!f)return;if(f.i&&f.s=='yt')x16Ch({src:f.s,id:f.i,name:f.n,img:f.img,subs:0,v:0});else artistPg(f.n)};
  var _al=window.arList;
  window.arList=function(){
    var h=_al(),f=fol();if(!f.length)return h;var seen={};
    var a=f.map(function(x,i){seen[low(E(x.n))]=1;return'<div class="rw" onclick="x16FG('+i+')"><img src="'+avatar(x)+'" style="border-radius:50%"><div><b>'+E(x.n)+'</b><small>Diikuti</small></div></div>'}).join('');
    var rest=(h.match(/<div class="rw" onclick="artistPg\(AN\(\d+\)\)">[\s\S]*?<\/small><\/div><\/div>/g)||[]).filter(function(r){var m=/<b>([\s\S]*?)<\/b>/.exec(r);return!(m&&seen[low(m[1])])}).join('');
    return a+rest;
  };

  /* ---------- 3. Beranda: chip suasana (ala YT Music) + artis yang diikuti ---------- */
  function home(v){
    var b=Q('[data-sp]',v)||Q('.hd',v);if(!b)return;
    var f=fol(),d=document.createElement('div');d.setAttribute('data-x16h','1');
    d.innerHTML='<div class="chips">'+['Santai','Energi','Fokus','Galau','Olahraga','Pesta','Tidur'].map(function(m){return'<span class="chip" onclick="qs(\''+m+'\')">'+m+'</span>'}).join('')+'</div>'+
      (f.length?'<div class="sec"><h3>Artis yang kamu ikuti</h3></div><div class="hs">'+f.map(function(x,i){return'<div class="cd x16a" onclick="x16FG('+i+')"><img src="'+avatar(x)+'" alt=""><b>'+E(x.n)+'</b></div>'}).join('')+'</div>':'');
    b.insertAdjacentElement('afterend',d);
  }

  /* ---------- 4. Library: Lagu Disukai, sematkan, urutkan, grid, cover mosaik ---------- */
  var SO={pl:[['new','Terbaru ditambahkan'],['rec','Terakhir diputar'],['az','Abjad']],ar:[['new','Terbanyak lagu'],['rec','Terakhir diputar'],['az','Abjad']]};
  function rec(i){var p=pls[i];if(!p)return;var r=ls.get('plr',{});r[low(p.n)]=Date.now();ls.set('plr',r)}
  var _pp=plPlay;plPlay=function(i){rec(i);return _pp(i)};
  var _op=window.openPl;window.openPl=function(i,k){if(!k)rec(i);return _op(i,k)};
  window.x16Fav=function(){
    var a=favs.map(rs).filter(Boolean);
    sub(shd('Lagu Disukai')+(a.length?'<button class="btn" onclick="P(\'fv\',0)">▶ Putar</button><div style="height:8px"></div>'+rows('fv',a):'<div class="em">Belum ada favorit. Ketuk ♥ di pemutar.</div>'));
  };
  function key(r){
    var o=r.getAttribute('onclick')||'',m,n;
    if(m=/^openPl\((\d+)\)/.exec(o)){var p=pls[+m[1]];return p?{k:'p:'+low(p.n),n:p.n,p:p}:null}
    if(m=/^artistPg\(AN\((\d+)\)\)/.exec(o)){n=window.AN(+m[1]);return n?{k:'a:'+low(n),n:n}:null}
    if(m=/^x16FG\((\d+)\)/.exec(o)){var fo=fol()[+m[1]];return fo?{k:'a:'+low(fo.n),n:fo.n}:null}
    return null;
  }
  function mosaic(p){
    if(p.img)return'';var im=[],S={};
    p.tr.map(rs).filter(Boolean).forEach(function(t){if(t.img&&!S[t.img]&&im.length<4){S[t.img]=1;im.push(t.img)}});
    return im.length==4?'<div class="x16m">'+im.map(function(s){return'<img src="'+E(s)+'" alt="">'}).join('')+'</div>':'';
  }
  function lib(v){
    var T=lt,ch=Q('.chips',v);if(!ch)return;
    var rows=QA('.rw',v).map(function(r){return{r:r,i:key(r)}}).filter(function(x){return x.i});
    rows.forEach(function(x,j){x.o=j});
    var S=ls.get('lsrt',{}),sm=S[T]||'new',grid=ls.get('lgrid',0),pin=ls.get('pin',[]);
    var lab=SO[T].filter(function(o){return o[0]==sm})[0]||SO[T][0];
    var d=document.createElement('div');d.className='x16tb';d.setAttribute('data-x16l','1');
    d.innerHTML='<span id="x16s">⇅ <b>'+lab[1]+'</b></span><span id="x16g">'+(grid?'☰':'▦')+'</span>';
    ch.insertAdjacentElement('afterend',d);
    Q('#x16s',d).onclick=function(){uiPick('Urutkan',SO[T].map(function(o){return o[1]})).then(function(k){if(k==null)return;S[T]=SO[T][k][0];ls.set('lsrt',S);go('library')})};
    Q('#x16g',d).onclick=function(){ls.set('lgrid',grid?0:1);go('library')};
    var anchor=rows[0]?rows[0].r:null,H=hist.map(function(t){return t&&low(rs(t)&&rs(t).artist)}),pr=ls.get('plr',{});
    function rc(x){if(T=='pl')return pr[low(x.i.n)]||0;var j=H.indexOf(low(x.i.n));return j<0?0:1e9-j}
    rows.sort(function(a,b){
      var pa=pin.indexOf(a.i.k),pb=pin.indexOf(b.i.k);
      if(pa>=0||pb>=0)return pa<0?1:pb<0?-1:pa-pb;
      if(sm=='az')return low(a.i.n).localeCompare(low(b.i.n));
      if(sm=='rec')return rc(b)-rc(a);
      return T=='pl'?b.o-a.o:a.o-b.o;
    });
    if(T=='pl'){
      var h=document.createElement('div');h.className='rw x16fav';h.setAttribute('onclick','x16Fav()');
      h.innerHTML='<div class="x16heart">♥</div><div><b>Lagu Disukai</b><small>'+favs.length+' lagu</small></div>';
      rows.unshift({r:h,i:{k:'fav',fav:1}});
    }
    var c=document.createElement('div');c.className='x16grid'+(grid?' x16gm':'');
    if(anchor)anchor.parentNode.insertBefore(c,anchor);else d.insertAdjacentElement('afterend',c);
    rows.forEach(function(x){
      var r=x.r,k=x.i.k;
      if(!x.i.fav){
        r.classList.add(k.charAt(0)=='a'?'ar':'pl');
        if(x.i.p){var m=mosaic(x.i.p),im=r.querySelector('img');if(m&&im){im.insertAdjacentHTML('beforebegin',m);im.remove()}}
        var b=document.createElement('button'),on=pin.indexOf(k)>=0;
        b.className='x16pin'+(on?' on':'');b.textContent='📌';
        b.onclick=function(e){e.stopPropagation();var P=ls.get('pin',[]),j=P.indexOf(k);if(j>=0)P.splice(j,1);else P.push(k);ls.set('pin',P);go('library')};
        r.appendChild(b);
      }
      c.appendChild(r);
    });
  }

  /* ---------- pengamat halaman ---------- */
  function deco(){
    var v=Q('#v');if(!v)return;
    if(Q('.hero',v)&&!Q('[data-x16h]',v))home(v);
    if(Q('#qi'))rnd();
    if(typeof pg!='undefined'&&pg=='library'&&!Q('[data-x16l]',v)&&(lt=='pl'||lt=='ar'))lib(v);
  }
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){try{deco()}catch(e){console.error(e)}}).observe(vv,{childList:true});
  setTimeout(function(){try{deco()}catch(e){}},300);
})();
}catch(e){console.error('[loopify] extra16.js',e)}

/* ==== extra17.js ==== */
try{
/* Loopify v4.7 - Sinkron akun, riwayat & saran pencarian (termasuk lirik), geser mini-player kiri/kanan,
   kartu "Tentang artis" + "Lagu serupa" di pemutar. Dimuat setelah extra16.js (pasangan extra17.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},E=function(s){return esc(s)};
  function low(s){return String(s||'').trim().toLowerCase()}

  /* ---------- 1. Sinkron lewat akun (butuh login; data: favorit, playlist, artis diikuti, pin, riwayat cari) ----------
     v4.30: gabung tiga arah (dasar = hasil sinkron terakhir 'syncB', lokal, server). Penambahan dan penghapusan dari
     dua perangkat sama-sama dipertahankan. Server menolak (409) simpanan yang berdasar versi lama, jadi tidak ada lagi yang saling menimpa. */
  var KS=['favs','pls','fol','pin','plr','lsrt','lgrid','qh'],last='',ready=0,busy=0;
  function J(x){return JSON.stringify(x)}
  function union(a,b,f){var s={},o=[];(a||[]).concat(b||[]).forEach(function(x){var k=f(x);if(!s[k]){s[k]=1;o.push(x)}});return o}
  function snap(){var o={};KS.forEach(function(k){var v=ls.get(k,null);if(v!==null)o[k]=v});return o}
  function auth(){try{var a=JSON.parse(localStorage.getItem('mx_auth'));return a&&a.session&&a.exp>Date.now()?a:null}catch(e){return null}}
  function call(b){return fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:J(b)}).then(function(r){return r.ok||r.status==409?r.json():null}).catch(function(){return null})}
  function tk(t){return t&&t.id!=null?String(t.id):J(t)}
  // daftar: unsur dasar yang hilang di salah satu sisi = dihapus di sisi itu; unsur baru di salah satu sisi = ditambah
  function m3(b,l,r,f,front){
    var B={},L={},R={},o=[],seen={},add=[];
    (b||[]).forEach(function(x){B[f(x)]=1});(l||[]).forEach(function(x){L[f(x)]=1});(r||[]).forEach(function(x){R[f(x)]=1});
    (r||[]).forEach(function(x){var k=f(x);if(seen[k])return;seen[k]=1;if(B[k]&&!L[k])return;o.push(x)});
    (l||[]).forEach(function(x){var k=f(x);if(seen[k])return;seen[k]=1;if(B[k])return;add.push(x)});
    return front?add.concat(o):o.concat(add);
  }
  function byName(a){var m={};(a||[]).forEach(function(p){if(p)m[String(p.n||'').trim().toLowerCase()]=p});return m}
  function mPl(b,l,r){
    var bm=byName(b),lm=byName(l),rm=byName(r);
    return m3(b,l,r,function(p){return String(p.n||'').trim().toLowerCase()}).map(function(p){
      var k=String(p.n||'').trim().toLowerCase(),B=bm[k],L=lm[k],R=rm[k];
      if(!L||!R)return p;
      if(B&&J(L)==J(B))return R;
      if(B&&J(R)==J(B))return L;
      var o=Object.assign({},R,L);o.tr=m3(B&&B.tr,L.tr,R.tr,tk);return o;
    });
  }
  function mo(b,l,r,max){
    b=b||{};l=l||{};r=r||{};var o=Object.assign({},r);
    Object.keys(l).forEach(function(k){if(max)o[k]=Math.max(+l[k]||0,+r[k]||0);else if(J(l[k])!=J(b[k]))o[k]=l[k]});
    return o;
  }
  function merge3(B,l,r){
    B=B||{};l=l||{};r=r||{};var o=Object.assign({},r);
    function has(k){return l[k]!==undefined||r[k]!==undefined}
    if(has('favs'))o.favs=m3(B.favs,l.favs,r.favs,tk);
    if(has('pls'))o.pls=mPl(B.pls,l.pls,r.pls);
    if(has('fol'))o.fol=m3(B.fol,l.fol,r.fol,function(x){return low(x.n)});
    if(has('pin'))o.pin=m3(B.pin,l.pin,r.pin,String);
    if(has('qh'))o.qh=m3(B.qh,l.qh,r.qh,low,1).slice(0,10);
    if(has('plr'))o.plr=mo(B.plr,l.plr,r.plr,1);
    if(has('lsrt'))o.lsrt=mo(B.lsrt,l.lsrt,r.lsrt);
    if(has('lgrid'))o.lgrid=l.lgrid!==undefined&&J(l.lgrid)!=J(B.lgrid)?l.lgrid:(r.lgrid!==undefined?r.lgrid:l.lgrid);
    return typeof scrubData=='function'?scrubData(o):o;
  }
  function apply(m){KS.forEach(function(k){if(m[k]!==undefined)ls.set(k,m[k])})}
  function push(f,n){
    var a=auth(),s=J(snap());
    if(!a||!ready||busy||(!f&&s==last))return Promise.resolve();
    busy=1;
    return call({action:'put',session:a.session,data:snap(),bt:ls.get('syncT',0)}).then(function(j){
      busy=0;
      if(j&&j.conflict){
        var l=snap(),m=merge3(ls.get('syncB',null),l,j.data||{});
        apply(m);var s2=snap(),ch=J(s2)!=J(l);
        ls.set('syncB',s2);ls.set('syncT',j.t);last='';
        if((n||0)>=2){if(ch)location.reload();return}
        return push(true,(n||0)+1).then(function(){if(ch)location.reload()});
      }
      if(j&&j.t){ls.set('syncT',j.t);ls.set('syncB',JSON.parse(s));last=s}
    });
  }
  function pull(){
    var a=auth();if(!a)return;
    call({action:'get',session:a.session}).then(function(j){
      if(!j||j.conflict)return;
      var T=ls.get('syncT',0),l=snap(),B=ls.get('syncB',null);
      if(!j.data){ready=1;last='';return}
      if(j.t<=T){ready=1;if(J(l)==J(j.data))last=J(l);return}
      var dirty=B?J(l)!=J(B):true;
      var m=(T&&!dirty)?j.data:merge3(T?B:null,l,j.data);
      if(typeof scrubData=='function')m=scrubData(m);
      var changed=J(m)!=J(l),need=J(m)!=J(j.data);
      apply(m);ready=1;
      var s=snap();ls.set('syncB',s);ls.set('syncT',j.t);last=need?'':J(s);
      var done=function(){if(changed)location.reload()};
      if(need)push(true).then(done);else done();
    });
  }
  setTimeout(pull,1500);
  setInterval(function(){push()},5000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)pull()});

  /* ---------- 8. Riwayat & saran pencarian ---------- */
  function qh(){return ls.get('qh',[])}
  var _ds=doSearch;
  doSearch=async function(s){
    await _ds(s);
    try{var t=String(s||'').trim();if(t&&typeof lres!='undefined'&&lres&&lres.length){ls.set('qh',[t].concat(qh().filter(function(x){return low(x)!=low(t)})).slice(0,10))}}catch(e){}
  };
  window.x17Q=function(i){var s=(window.x17S||[])[i];if(s!=null)qs(s)};
  window.x17Rm=function(i,e){if(e)e.stopPropagation();var h=qh();h.splice(i,1);ls.set('qh',h);sg17()};
  window.x17Cl=function(){ls.set('qh',[]);sg17()};
  function titles(q){
    var r=[],s={};
    function add(t,why){var k=low(t.title);if(s[k]||r.length>=6)return;s[k]=1;r.push({s:t.title+(t.artist&&!GEN17.test(t.artist)?' '+t.artist:''),t:t.title,w:why})}
    var all=[].concat(songs,favs.map(rs),hist.map(rs)).filter(Boolean);
    all.filter(function(t){return low(t.title).indexOf(q)>=0||low(t.artist).indexOf(q)>=0}).forEach(function(t){add(t,t.artist||'')});
    if(q.length>=4)all.forEach(function(t){var L=lyc[t.id];if(L&&JSON.stringify(L).toLowerCase().indexOf(q)>=0)add(t,'Cocok di lirik')});
    return r;
  }
  var GEN17=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  function sg17(){
    var b=Q('#x16');if(!b||!Q('#qi'))return;
    var q=low(typeof lq=='string'?lq:''),h='',S=[];
    if(!q){
      var H=qh();if(!H.length)return;S=H.slice();
      h='<div class="sec"><h3>Pencarian terakhir</h3><button class="ib g" style="font-size:12px;width:auto;padding:0 10px" onclick="x17Cl()">Hapus</button></div>'+H.map(function(x,i){return'<div class="rw x17s" onclick="x17Q('+i+')"><span class="x17i">⟲</span><div><b>'+E(x)+'</b></div><button class="ib g" onclick="x17Rm('+i+',event)">✕</button></div>'}).join('');
    }else{
      var P=union(qh().filter(function(x){return low(x).indexOf(q)==0&&low(x)!=q}).map(function(x){return{s:x,w:'Riwayat'}}),titles(q),function(x){return low(x.s)}).slice(0,6);
      if(!P.length||Q('[data-x17s]',b))return;S=P.map(function(x){return x.s});
      h='<div data-x17s="1">'+P.map(function(x,i){return'<div class="rw x17s" onclick="x17Q('+i+')"><span class="x17i">⌕</span><div><b>'+E(x.s)+'</b>'+(x.w?'<small>'+E(x.w)+'</small>':'')+'</div></div>'}).join('')+'</div>';
    }
    window.x17S=S;b.insertAdjacentHTML('afterbegin',h);
  }

  /* ---------- 7. Geser mini-player kiri/kanan = lagu berikutnya/sebelumnya ---------- */
  var sw=null;
  document.addEventListener('touchstart',function(e){var m=e.target.closest&&e.target.closest('#mp');sw=m&&e.touches.length==1&&!e.target.closest('button')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
  document.addEventListener('touchend',function(e){
    var s=sw;sw=null;if(!s||!e.changedTouches[0])return;
    var dx=e.changedTouches[0].clientX-s.x,dy=e.changedTouches[0].clientY-s.y;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2){try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}nxt(dx<0?1:-1)}
  },{passive:true});

  /* ---------- 6. Pemutar: Tentang artis + Lagu serupa ---------- */
  function isFolA(n){return ls.get('fol',[]).some(function(x){return low(x.n)==low(n)})}
  window.x17Fol=function(b){
    var t=cur;if(!t)return;var l=ls.get('fol',[]),k=low(t.artist),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else l.unshift({n:t.artist,img:t.img||'',s:'',i:''});
    ls.set('fol',l);b.textContent=j>=0?'Ikuti':'Mengikuti';b.classList.toggle('on',j<0);
  };
  window.x17Sim=function(b){
    var t=cur;if(!t)return;b.disabled=true;b.textContent='Mencari…';
    ytSearch(t.artist+' '+t.title.split(/[\(\[\-]/)[0]).catch(function(){return[]}).then(function(a){
      b.disabled=false;b.textContent='Lagu serupa';
      a=(Array.isArray(a)?a:[]).filter(function(x){return x&&x.id!=t.id}).slice(0,25).map(function(x){return Object.assign({h:hh(x.title)},x)});
      if(!a.length)return;lists.sim=a;clp();sub(shd('Lagu serupa')+rows('sim',a));
    });
  };
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{
      var p=document.getElementById('pl'),t=cur;
      if(!p||!t||t.yt&&0||Q('.x17ab',p)||!t.artist||GEN17.test(t.artist))return;
      var d=document.createElement('div'),on=isFolA(t.artist);d.className='x17ab';
      d.innerHTML='<div class="x17h">Tentang artis</div><div class="x17r"><img src="'+E(cov(t.img?{img:t.img}:{h:hh(t.artist)}))+'" alt=""><div><b>'+E(t.artist)+'</b><small>Ketuk untuk membuka profil</small></div></div>'+
        '<div class="x17b"><button class="btn g" onclick="clp();artistPg(cur.artist)">Buka artis</button><button class="btn g'+(on?' on':'')+'" onclick="x17Fol(this)">'+(on?'Mengikuti':'Ikuti')+'</button><button class="btn g" onclick="x17Sim(this)">Lagu serupa</button></div>';
      p.appendChild(d);
    }catch(e){}
  };

  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{sg17()}catch(e){}}).observe(v,{childList:true});
  var _rn=window.x16F;if(_rn)window.x16F=function(f){_rn(f);setTimeout(sg17,0)};
  setTimeout(function(){try{sg17()}catch(e){}},400);
  var qi=Q('#qi');if(qi)qi.addEventListener('input',function(){setTimeout(function(){var b=Q('#x16');if(b){var o=Q('[data-x17s]',b);if(o)o.remove()}sg17()},650)});
})();
}catch(e){console.error('[loopify] extra17.js',e)}

/* ==== extra18.js ==== */
try{
/* Loopify v4.8 - Halaman Album (tab Album di profil artis Audius) + playlist: deskripsi, folder, seret untuk mengurutkan.
   Dimuat setelah extra17.js (pasangan extra18.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function img(x){return E(cov(x.img?{img:x.img}:{h:hh(x.name||x.title||'')}))}
  function get(u,k){return fetch(u).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){return j[k]||[]})}

  /* ---------- 5. Album ---------- */
  var ca=null,AC={},_ch=window.x16Ch,_tb=window.x16Tab;
  function chip(){var t=Q('#x16t');if(ca&&ca.src&&t&&!Q('.x18ac',t)){var s=document.createElement('span');s.className='chip x18ac';s.textContent='Album';s.onclick=alb;t.appendChild(s)}}
  window.x16Ch=function(a){ca=a;_ch(a);chip()};
  window.x16Tab=function(t){_tb(t);chip()};
  function alb(){
    var t=Q('#x16t'),b=Q('#x16b');if(!t||!b||!ca)return;
    QA('.chip',t).forEach(function(c){c.classList.toggle('a',c.classList.contains('x18ac'))});
    var id=ca.id,show=function(l){window.x18A=l;b.innerHTML=l.length?'<div class="x16g2">'+l.map(function(x,i){return'<div class="x18c" onclick="x18Al('+i+')"><img src="'+img(x)+'" alt=""><b>'+E(x.name)+'</b><small>'+(+x.n?(+x.n)+' lagu':'Album')+'</small></div>'}).join('')+'</div>':'<div class="em">Belum ada album.</div>'};
    if(AC[id])return show(AC[id]);
    b.innerHTML='<div class="em">Memuat…</div>';
    get('/api/artist?src='+ca.src+'&albums=1&id='+encodeURIComponent(id),'albums').then(function(l){AC[id]=l;if(ca&&ca.id==id&&Q('.x18ac.a'))show(l)});
  }
  window.x18Shuf=function(){lists.al=(lists.al||[]).slice().sort(function(){return Math.random()-.5});P('al',0)};
  window.x18Al=function(i){
    var al=(window.x18A||[])[i];if(!al)return;var who=ca?ca.name:'';
    sub(shd(E(al.name))+'<div class="x16hd"><img src="'+img(al)+'" alt=""><h2>'+E(al.name)+'</h2><small>Album · '+E(who)+'</small></div><div id="x18t"><div class="em">Memuat…</div></div>');
    get('/api/artist?src='+(ca?ca.src:'au')+'&album='+encodeURIComponent(al.id),'tracks').then(function(a){
      a=a.map(function(x){return ca&&ca.src=='yt'?Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx}):Object.assign({h:hh(x.title)},x)});
      var el=Q('#x18t'),sm=Q('.x16hd small'),sec=a.reduce(function(s,x){return s+(x.d||0)},0);
      if(sm)sm.textContent='Album · '+who+' · '+a.length+' lagu'+(sec?' · '+Math.max(1,Math.round(sec/60))+' mnt':'');
      if(el)el.innerHTML=a.length?'<div class="x16pb"><button class="btn" onclick="P(\'al\',0)">▶ Putar</button><button class="btn g" onclick="x18Shuf()">⤮ Acak</button></div>'+rows('al',a):'<div class="em">Album kosong atau tidak bisa diputar.</div>';
    });
  };

  /* ---------- 4. Playlist: deskripsi, folder, seret urutan ---------- */
  var _op=window.openPl;
  window.openPl=function(i,k){_op(i,k);try{pl(i)}catch(e){}};
  function pl(i){
    var p=pls[i],sp=Q('#sp');if(!p||!sp||Q('[data-x18]',sp))return;
    var ch=Q('.chips',sp);if(!ch)return;
    var d=document.createElement('div');d.setAttribute('data-x18','1');d.className='x18d';d.textContent=p.d||'';d.style.display=p.d?'':'none';
    ch.parentNode.insertBefore(d,ch);
    ch.insertAdjacentHTML('beforeend','<span class="chip" onclick="x18Ds('+i+')">✎ Deskripsi</span><span class="chip" onclick="x18Fo('+i+')">📁 '+(p.f?E(p.f):'Folder')+'</span>');
    QA('.rw',sp).forEach(function(r){
      var up=r.querySelector('[onclick^="plMv("]'),m=up&&/plMv\((\d+),(\d+),-1\)/.exec(up.getAttribute('onclick'));if(!m)return;
      var h=document.createElement('span');h.className='x18dh';h.textContent='≡';h.dataset.i=m[1];h.dataset.j=m[2];r.insertBefore(h,r.firstChild);
    });
  }
  window.x18Ds=async function(i){var p=pls[i];if(!p)return;var v=await uiPrompt('Tulis deskripsi playlist.',p.d||'',{title:'Deskripsi playlist',max:160});if(v==null)return;p.d=String(v).trim().slice(0,160);if(!p.d)delete p.d;plSave();openPl(i,1)};
  window.x18Fo=async function(i){var p=pls[i];if(!p)return;var v=await uiPrompt('Nama folder. Kosongkan untuk melepas dari folder.',p.f||'',{title:'Folder playlist',max:30});if(v==null)return;p.f=String(v).trim().slice(0,30);if(!p.f)delete p.f;plSave();openPl(i,1)};
  var dg=null;
  document.addEventListener('pointerdown',function(e){
    var h=e.target.closest&&e.target.closest('.x18dh');if(!h)return;
    e.preventDefault();dg={i:+h.dataset.i,r:h.parentNode};dg.r.classList.add('x18drag');
    try{h.setPointerCapture(e.pointerId)}catch(x){}
  });
  document.addEventListener('pointermove',function(e){
    if(!dg)return;
    var el=document.elementFromPoint(e.clientX,e.clientY),row=el&&el.closest&&el.closest('#sp .rw');
    if(!row||row===dg.r||!row.querySelector('.x18dh'))return;
    var b=row.getBoundingClientRect();row.parentNode.insertBefore(dg.r,e.clientY>b.top+b.height/2?row.nextSibling:row);
  });
  function drop(){
    var s=dg;dg=null;if(!s)return;s.r.classList.remove('x18drag');
    var p=pls[s.i];if(!p)return;
    var ord=QA('#sp .x18dh').map(function(h){return+h.dataset.j}),old=p.tr.slice();
    if(ord.length==old.length)p.tr=ord.map(function(j){return old[j]});
    plSave();openPl(s.i,1);
  }
  document.addEventListener('pointerup',drop);document.addEventListener('pointercancel',drop);

  /* folder di Library > Playlist */
  var OP={};
  function fold(){
    var c=Q('#v .x16grid');if(!c||c.dataset.x18f||typeof lt=='undefined'||lt!='pl')return;
    c.dataset.x18f='1';var G={};
    QA('.rw.pl',c).forEach(function(r){var m=/^openPl\((\d+)\)/.exec(r.getAttribute('onclick')||''),p=m&&pls[+m[1]];if(p&&p.f)(G[p.f]=G[p.f]||[]).push(r)});
    Object.keys(G).forEach(function(n){
      var f=document.createElement('div');f.className='rw x18fd';
      f.innerHTML='<div class="x16heart x18fo">📁</div><div><b>'+E(n)+'</b><small>'+G[n].length+' playlist</small></div><span class="x18ch"></span>';
      G[n][0].parentNode.insertBefore(f,G[n][0]);
      var set=function(){G[n].forEach(function(r){r.style.display=OP[n]?'':'none';r.classList.add('x18in')});Q('.x18ch',f).textContent=OP[n]?'⌄':'›'};
      f.onclick=function(){OP[n]=!OP[n];set()};set();
    });
  }
  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{fold()}catch(e){}}).observe(v,{childList:true});
  setTimeout(function(){try{fold()}catch(e){}},500);
})();
}catch(e){console.error('[loopify] extra18.js',e)}

/* ==== extra19.js ==== */
try{
/* Loopify v4.9 - Playlist kolaboratif (tautan edit bersama) + Jam (dengar bareng). Butuh login. Dimuat setelah extra18.js. */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function auth(){try{var a=JSON.parse(localStorage.getItem('mx_auth'));return a&&a.session&&a.exp>Date.now()?a:null}catch(e){return null}}
  function api(b){
    var a=auth();if(!a)return Promise.reject({status:401});b.session=a.session;
    return fetch('/api/collab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw{status:r.status,msg:j.error};return j})});
  }
  function note(m){return uiPick(m,['OK'])}
  function need(){return note('Masuk dulu di tab Profil untuk memakai fitur ini.')}
  function err(e){return note(e&&e.status==401?'Sesi habis. Masuk lagi di tab Profil.':(e&&e.msg)||'Gagal. Coba lagi nanti.')}
  function clean(t){var o={id:t.id,title:t.title,artist:t.artist,img:t.img};if(t.yt){o.yt=1;o.vid=t.vid}else o.url=t.url;return o}
  function toLocal(t){var r=t.yt?mkV(t.vid,t.title,t.artist):Object.assign({h:hh(t.title)},t);if(t.by)r.by=t.by;return r}
  function ids(a){return a.map(function(x){return String(x&&typeof x=='object'?x.id:x)})}
  function url(k,c){return location.origin+location.pathname+'#'+k+'='+c}

  /* ---------- Playlist kolaboratif ---------- */
  function coSync(i){
    var p=pls[i];if(!p||!p.co)return Promise.resolve(0);
    var L=p.tr.map(rs).filter(Boolean),Ls=ids(L),Cs=p.cs||[];
    var add=L.filter(function(t){return!t.loc&&Cs.indexOf(String(t.id))<0}).slice(0,30).map(clean);
    var rm=Cs.filter(function(x){return Ls.indexOf(x)<0});
    return api({action:'co_sync',code:p.co,add:add,rm:rm}).then(function(d){
      var keep=p.tr.filter(function(x){var t=rs(x);return t&&t.loc});
      p.tr=d.tr.map(toLocal).concat(keep);p.cs=ids(d.tr);plSave();return d;
    });
  }
  var _op=window.openPl,busy={};
  window.openPl=function(i,k){
    _op(i,k);
    try{
      var p=pls[i],sp=Q('#sp'),ch=sp&&Q('.chips',sp);
      if(p&&ch&&!Q('[data-x19c]',sp))ch.insertAdjacentHTML('beforeend','<span class="chip" data-x19c="1" onclick="x19Co('+i+')">👥 Kolab'+(p.co?' · '+E(p.co):'')+'</span>');
      if(!k&&p&&p.co&&auth()&&!busy[i]){busy[i]=1;coSync(i).then(function(){busy[i]=0;if(Q('#sp [onclick^="plPlay('+i+')"]'))window.openPl(i,1)}).catch(function(){busy[i]=0})}
    }catch(e){}
  };
  window.x19Co=async function(i){
    var p=pls[i];if(!p)return;if(!auth())return need();
    var k=await uiPick('Playlist kolaboratif',p.co?['Salin tautan','Sinkronkan sekarang','Berhenti berkolaborasi']:['Buat tautan kolaborasi']);if(k==null)return;
    if(!p.co){
      var L=p.tr.map(rs).filter(function(t){return t&&!t.loc}).slice(0,200).map(clean);
      return api({action:'co_create',name:p.n,d:p.d||'',tracks:L}).then(function(d){p.co=d.code;p.cs=ids(d.tr);plSave();openPl(i,1);share('Kirim tautan ini ke temanmu. Mereka perlu masuk dulu agar bisa ikut menambah dan menghapus lagu.','collab',d.code)}).catch(err);
    }
    if(k==0)share('Kirim tautan ini ke temanmu.','collab',p.co);
    else if(k==1)coSync(i).then(function(){openPl(i,1)}).catch(err);
    else{delete p.co;delete p.cs;plSave();openPl(i,1)}
  };
  function share(msg,kind,c){return uiPrompt(msg,url(kind,c),{title:kind=='jam'?'Tautan Jam':'Tautan kolaborasi',max:200})}

  /* ---------- Jam (dengar bareng) ---------- */
  var J=null;
  function bar(){
    var b=Q('#x19b');if(!J){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.id='x19b';document.body.appendChild(b)}
    b.innerHTML='👥 Jam '+J.code+' · '+(J.role=='host'?'Host':'Tamu')+' <button class="ib g" onclick="x19End()">✕</button>';
  }
  window.x19End=function(){if(J){clearInterval(J.t);if(J.role=='host')api({action:'jam_end',code:J.code}).catch(function(){})}J=null;bar()};
  function pos(){return cur&&!cur.yt?+act.currentTime||0:0}
  function hostTick(){
    if(!J||J.role!='host'||!cur||cur.loc)return;
    api({action:'jam_put',code:J.code,track:clean(cur),pos:pos(),playing:cur.yt?true:!act.paused}).catch(function(e){if(e&&(e.status==404||e.status==401))x19End()});
  }
  function apply(s){
    if(!s||!s.track)return;var t=toLocal(s.track);
    if(!cur||String(cur.id)!=String(t.id)){play([t],0);return}
    if(t.yt)return;
    var tg=s.pos+(s.playing?(s.now-s.ts)/1000:0);
    if(Math.abs(act.currentTime-tg)>5)try{act.currentTime=tg}catch(e){}
    if(s.playing&&act.paused)act.play().catch(function(){});else if(!s.playing&&!act.paused)act.pause();
  }
  function guestTick(){if(!J)return;api({action:'jam_get',code:J.code}).then(apply).catch(function(e){if(e&&(e.status==404||e.status==401))x19End()})}
  function jamJoin(c){
    x19End();
    api({action:'jam_get',code:c}).then(function(s){J={role:'guest',code:c};J.t=setInterval(guestTick,3000);bar();apply(s)}).catch(function(e){err(e&&e.status==404?{msg:'Kode Jam tidak ditemukan atau sudah berakhir.'}:e)});
  }
  window.x19Jam=async function(){
    var k=await uiPick('Jam · dengar bareng',J?['Salin tautan Jam','Keluar dari Jam']:['Mulai Jam (jadi host)','Gabung dengan kode']);if(k==null)return;
    if(!auth())return need();
    if(J){if(k==0)share('Kirim tautan ini ke temanmu.','jam',J.code);else x19End();return}
    if(k==1){var c=((await uiPrompt('Masukkan kode Jam 6 huruf.','',{title:'Gabung Jam',max:6}))||'').trim().toUpperCase();if(c)jamJoin(c);return}
    if(!cur||cur.loc)return note('Putar lagu online dulu (bukan file dari perangkat), lalu mulai Jam.');
    api({action:'jam_start',track:clean(cur),pos:pos(),playing:cur.yt?true:!act.paused}).then(function(d){
      J={role:'host',code:d.code};J.t=setInterval(hostTick,3000);bar();share('Kirim tautan atau kode ini ke temanmu. Jam berakhir kalau kamu keluar.','jam',d.code);
    }).catch(err);
  };

  /* tombol Jam di pemutar dan di Beranda */
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x19j',b)){var j=document.createElement('button');j.className='btn g x19j';j.textContent='👥 Jam';j.onclick=window.x19Jam;b.appendChild(j)}}catch(e){}
  };
  function homeChip(){var c=Q('#v [data-x16h] .chips');if(c&&!Q('.x19j',c)){var s=document.createElement('span');s.className='chip x19j';s.textContent='👥 Jam';s.onclick=window.x19Jam;c.appendChild(s)}}
  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{homeChip()}catch(e){}}).observe(v,{childList:true});

  /* buka tautan #collab=KODE atau #jam=KODE */
  function hashJoin(){
    var m=/[#&](collab|jam)=([A-Za-z0-9]{6})/.exec(location.hash);if(!m)return;
    if(!auth())return need();
    history.replaceState(null,'',location.pathname+location.search);
    var c=m[2].toUpperCase();
    if(m[1]=='jam')return jamJoin(c);
    api({action:'co_sync',code:c,add:[],rm:[]}).then(function(d){
      if(!pls.some(function(p){return p.co==d.code})){pls.push({n:d.name,tr:d.tr.map(toLocal),co:d.code,cs:ids(d.tr),d:d.d||undefined});plSave()}
      lt='pl';go('library');
    }).catch(err);
  }
  setTimeout(hashJoin,2200);
})();
}catch(e){console.error('[loopify] extra19.js',e)}

/* ==== extra20.js ==== */
try{
/* Loopify v4.9.1 - Pemulih lagu online yang tersendat (stream Audius/online).
   Saat buffering macet >7 dtk, sambungan dimuat ulang dari posisi terakhir; preload lagu berikutnya
   dijeda ketika jaringan sedang lemah supaya tidak berebut kecepatan. Dimuat setelah extra19.js. */
(function(){
  'use strict';
  var S={tm:0,n:0,id:'',last:0};
  function online(a){return a===act&&cur&&!cur.loc&&!cur.yt&&!cur.radio}
  function fix(a,src,id){
    if(!online(a)||a.paused||a.readyState>=3||cur.id!==id||(a.currentSrc||a.src)!==src)return;
    if(S.id!==id){S.id=id;S.n=0}
    if(S.n>=3)return;S.n++;
    var ct=a.currentTime;
    try{
      a.src=src;a.load();
      a.addEventListener('loadedmetadata',function f(){a.removeEventListener('loadedmetadata',f);try{a.currentTime=ct}catch(e){}a.play().catch(function(){})});
    }catch(e){}
  }
  function wait(e){
    var a=e.target;if(!online(a))return;
    S.last=Date.now();
    try{if(typeof pre!='undefined'&&pre){pre.removeAttribute('src');pre.load();pre=null}}catch(x){}
    clearTimeout(S.tm);var src=a.currentSrc||a.src,id=cur.id;
    S.tm=setTimeout(function(){fix(a,src,id)},7000);
  }
  function ok(e){if(e.target===act)clearTimeout(S.tm)}
  [A,B].forEach(function(a){
    a.preload='auto';
    ['waiting','stalled'].forEach(function(n){a.addEventListener(n,wait)});
    ['playing','canplay','canplaythrough','pause','ended'].forEach(function(n){a.addEventListener(n,ok)});
  });
  var _pr=prel;
  prel=function(a){if(Date.now()-S.last<30000)return;return _pr.apply(this,arguments)};
})();
}catch(e){console.error('[loopify] extra20.js',e)}

/* ==== extra21.js ==== */
try{
/* Loopify v4.10 - Radio (dari lagu/artis, antrean terus bertambah), Rilis terbaru dari artis yang diikuti,
   dan alamat stream Audius langsung (mengurangi tersendat). Dimuat setelah extra20.js (pasangan extra21.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};
  function jget(u){return fetch(u).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}})}
  function toT(t){return t.yt?Object.assign(mkV(t.vid||t.id,t.title,t.artist),{ts:t.ts}):Object.assign({h:hh(t.title)},t)}
  function note(m){return uiPick(m,['OK'])}

  /* ---------- Radio ---------- */
  var RAD=null,mor=0;
  function sim(art,title,have){
    var qs=[art];if(title)qs.push(String(title).split(/[\(\[\-]/)[0]+' '+art);
    return Promise.all(qs.map(function(s){return ytSearch(s).catch(function(){return[]})})).then(function(r){
      var o=[],S={};r.forEach(function(a){(Array.isArray(a)?a:[]).forEach(function(x){if(x&&x.id&&(x.url||x.yt)&&!S[x.id]&&!have[x.id]){S[x.id]=1;o.push(toT(x))}})});
      return o.sort(function(){return Math.random()-.5});
    });
  }
  function bar(){
    var b=Q('#x21b');if(!RAD){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.id='x21b';document.body.appendChild(b)}
    b.innerHTML='📻 Radio · '+E(RAD.seed)+' <button class="ib g" onclick="x21End()">✕</button>';
  }
  window.x21End=function(){RAD=null;bar()};
  window.x21Radio=function(t){
    var seed=t&&typeof t=='object'?t:null,art=seed?seed.artist:String(t||'');if(!art)return;
    var have={};if(seed)have[seed.id]=1;
    sim(art,seed&&seed.title,have).then(function(l){
      if(!l.length)return note('Belum ada lagu mirip untuk radio ini.');
      var lst=(seed?[seed]:[]).concat(l.slice(0,24));RAD={seed:art,ids:{}};
      lst.forEach(function(x){RAD.ids[x.id]=1});play(lst,0);bar();
    });
  };
  function more(){
    if(mor||!RAD)return;mor=1;
    var A=[],S={},have={};q.forEach(function(x){have[x.id]=1});
    q.slice(-6).forEach(function(x){if(x.artist&&!S[x.artist]){S[x.artist]=1;A.push(x.artist)}});
    sim(A[Math.floor(Math.random()*A.length)]||RAD.seed,'',have).then(function(l){
      mor=0;if(!RAD)return;l.slice(0,15).forEach(function(x){q.push(x);RAD.ids[x.id]=1});
    }).catch(function(){mor=0});
  }

  /* ---------- Alamat stream Audius langsung ---------- */
  var RC={},INF={};
  function aid(t){var m=t&&!t.loc&&!t.yt&&typeof t.url=='string'&&/^https:\/\/api\.audius\.co\/v1\/tracks\/([\w-]+)\/stream/.exec(t.url);return m?m[1]:''}
  function resolve(list){
    var need=[];
    list.forEach(function(t){var id=aid(t);if(id&&!(RC[id]&&RC[id].e>Date.now())&&!INF[id]&&need.indexOf(id)<0)need.push(id)});
    need=need.slice(0,10);if(!need.length)return;
    need.forEach(function(id){INF[id]=1});
    jget('/api/stream?ids='+need.join(',')).then(function(m){need.forEach(function(id){delete INF[id];if(m&&m[id])RC[id]={u:m[id],e:Date.now()+4*60000}})});
  }
  var _play=play;
  play=function(l,i){
    var t=l&&l[i],id=aid(t),r=id&&RC[id];
    if(RAD&&t&&!RAD.ids[t.id])window.x21End();
    var o=_play.apply(this,arguments);
    try{
      if(r&&r.e>Date.now()&&act===B&&cur&&!cur.loc&&cur.id==t.id){B.src=r.u;B.play().catch(function(){})}
      resolve([cur].concat(q.slice(qi+1,qi+4)));
      if(RAD&&q.length-qi<=4)more();
    }catch(e){}
    return o;
  };
  window.x21Pre=resolve;

  /* ---------- Rilis terbaru dari artis yang diikuti ---------- */
  function fol(){return ls.get('fol',[])}
  function latest(){
    var f=fol().filter(function(x){return x.i&&x.s}).slice(0,8),key=f.map(function(x){return x.i}).join(),c=ls.get('newc',null);
    if(!f.length)return Promise.resolve([]);
    if(c&&c.k==key&&Date.now()-c.t<6*3600e3)return Promise.resolve(c.l);
    return Promise.all(f.map(function(x){return jget('/api/artist?latest=1&src='+x.s+'&id='+encodeURIComponent(x.i)+'&name='+encodeURIComponent(x.n)).then(function(j){return(j.tracks||[]).map(function(t){t._a=x.n;return t})})})).then(function(r){
      var l=[].concat.apply([],r).filter(function(t){return t.ts}).sort(function(a,b){return b.ts-a.ts}).slice(0,30);
      ls.set('newc',{t:Date.now(),k:key,l:l});return l;
    });
  }
  function ago(ts){var d=Math.floor((Date.now()-ts)/864e5);return d<1?'hari ini':d<7?d+' hari lalu':d<30?Math.floor(d/7)+' minggu lalu':Math.floor(d/30)+' bulan lalu'}
  function homeNew(){
    var h=Q('#v [data-x16h]');if(!h||Q('[data-x21n]',h)||!fol().some(function(x){return x.i}))return;
    var d=document.createElement('div');d.setAttribute('data-x21n','1');h.appendChild(d);
    latest().then(function(l){
      l=l.filter(function(t){return t.ts>Date.now()-90*864e5}).slice(0,12).map(toT);
      if(!l.length||!d.isConnected)return;
      lists.nw=l;
      d.innerHTML='<div class="sec"><h3>Rilis terbaru dari artis yang kamu ikuti</h3></div><div class="hs">'+l.map(function(t,i){return'<div class="cd" onclick="P(\'nw\','+i+')"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small>'+E(t.artist)+' · '+ago(t.ts)+'</small></div>'}).join('')+'</div>';
    });
  }
  function libBadge(){
    if(typeof pg=='undefined'||pg!='library'||lt!='ar')return;
    var c=ls.get('newc',null),f=fol();if(!c||!f.length)return;
    var fresh={};c.l.forEach(function(t){if(t.ts>Date.now()-14*864e5)fresh[String(t._a).toLowerCase()]=1});
    QA('#v .rw[onclick^="x16FG("]').forEach(function(r){
      var m=/x16FG\((\d+)\)/.exec(r.getAttribute('onclick')),x=m&&f[+m[1]];
      if(x&&fresh[String(x.n).toLowerCase()]&&!Q('.x21n',r)){var s=document.createElement('span');s.className='x21n';s.textContent='Baru';r.appendChild(s)}
    });
  }

  /* ---------- tombol Radio ---------- */
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x21r',b)){var r=document.createElement('button');r.className='btn g x21r';r.textContent='📻 Radio';r.onclick=function(){x21Radio(cur)};b.appendChild(r)}}catch(e){}
  };
  function inj(){
    var b=Q('#x16b .x16pb'),h=Q('.x16hd h2');
    if(b&&h&&!Q('.x21r',b)){var r=document.createElement('button');r.className='btn g x21r';r.textContent='📻 Radio';var n=h.textContent.replace(/ ✓$/,'');r.onclick=function(){x21Radio(n)};b.appendChild(r)}
  }
  var _ch=window.x16Ch,_tb=window.x16Tab;
  if(_ch)window.x16Ch=function(a){_ch(a);inj()};
  if(_tb)window.x16Tab=function(t){_tb(t);inj()};


  /* ---------- Beranda: Untuk kamu (saran dari riwayat dengar, dicari lewat YouTube, disimpan 12 jam) ---------- */
  var GENX=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i,BADX=/(full album|nonstop|non stop|kumpulan|compilation|playlist|\b\d+\s*(jam|hours?|hrs?)\b)/i;
  function nmx(s){return String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
  function seeds(){
    var out=[],S={};
    function add(n){n=String(n||'').trim();var k=n.toLowerCase();if(!n||GENX.test(n)||S[k])return;S[k]=1;out.push(n)}
    hist.map(rs).filter(Boolean).slice(0,6).forEach(function(t){add(t.artist)});
    Object.entries(stt.ar||{}).sort(function(a,b){return(+b[1]||0)-(+a[1]||0)}).slice(0,4).forEach(function(e){add(e[0])});
    favs.map(rs).filter(Boolean).slice(0,6).forEach(function(t){add(t.artist)});
    return out.slice(0,3);
  }
  function fyGet(sd,force){
    var c=ls.get('ufk2',null);
    if(!force&&c&&c.l&&Date.now()-c.t<c.ttl)return Promise.resolve(c.l.map(function(x){return mkV(x.v,x.t,x.a)}));
    return Promise.all(sd.map(function(a){return ytSearch(a+' lagu').catch(function(){return[]})})).then(function(R){
      var known={},S={};
      hist.concat(favs).map(rs).filter(Boolean).forEach(function(t){known[t.id]=1;known['t:'+nmx(t.title)]=1});
      var out=[];
      for(var i=0;out.length<15&&i<20;i++){
        R.forEach(function(l){var x=l[i];if(!x||known[x.id]||BADX.test(x.title))return;var k='t:'+nmx(x.title);if(known[k]||S[k])return;S[k]=1;out.push(x)});
      }
      out=out.slice(0,15);
      ls.set('ufk2',{t:Date.now(),ttl:out.length?12*3600e3:30*60e3,l:out.map(function(x){return{v:x.vid,t:x.title,a:x.artist}})});
      return out;
    });
  }
  function homeFy(force){
    var h=Q('#v [data-x16h]');if(!h||Q('[data-x23]',h))return;
    var sd=seeds();if(!sd.length)return;
    var d=document.createElement('div');d.setAttribute('data-x23','1');h.appendChild(d);
    fyGet(sd,force).then(function(l){
      if(!d.isConnected)return;
      if(!l.length){d.remove();return}
      lists.fy=l;
      d.innerHTML='<div class="sec"><h3>Untuk kamu</h3><a onclick="x23R()">Segarkan</a></div><div class="hs">'+l.map(function(t,i){return'<div class="cd" onclick="P(\'fy\','+i+')"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small>'+E(t.artist)+'</small></div>'}).join('')+'</div>';
    }).catch(function(){if(d.isConnected)d.remove()});
  }
  window.x23R=function(){var d=Q('[data-x23]');if(d)d.remove();homeFy(true)};

  var v=Q('#v');
  if(v&&window.MutationObserver)new MutationObserver(function(){try{homeNew();homeFy();libBadge()}catch(e){}}).observe(v,{childList:true});
  setTimeout(function(){try{homeNew();homeFy()}catch(e){}},700);
  setTimeout(function(){try{latest().then(libBadge)}catch(e){}},2500);
})();
}catch(e){console.error('[loopify] extra21.js',e)}

/* ==== extra22.js ==== */
try{
/* Loopify v4.11 - Antrean dua tingkat (dalam antrean / dari daftar putar), Lirik layar penuh + kartu bagikan,
   daftar panjang dirender bertahap (ringan di HP). Dimuat setelah extra21.js (pasangan extra22.css). */
(function(){
  'use strict';
  var Q=function(s,r){return(r||document).querySelector(s)},QA=function(s,r){return[].slice.call((r||document).querySelectorAll(s))},E=function(s){return esc(s)};

  /* ---------- 9. Antrean dua tingkat ---------- */
  var _qa=qAdd;
  qAdd=function(k,i){
    var t=lists[k]&&lists[k][i];
    if(!t||t.yt||!cur)return _qa(k,i);
    var c=Object.assign({},t,{_uq:1}),p=qi+1;
    while(q[p]&&q[p]._uq)p++;
    q.splice(p,0,c);try{toast('Masuk antrean: '+t.title)}catch(e){}
  };
  var _qn=qNext;
  qNext=function(j){if(j!=qi&&q[j]&&!q[j]._uq)q[j]=Object.assign({},q[j],{_uq:1});return _qn(j)};
  window.x22Cq=function(){q=q.filter(function(t,i){return i<=qi||!t._uq});qR()};
  var _qR=qR;
  qR=function(){
    _qR();
    try{
      var sp=Q('#sp');if(!sp)return;
      QA('.q-lb',sp).forEach(function(d){if(d.textContent=='Berikutnya dari antrean')d.remove()});
      var R=QA('.rw[data-qi]',sp).map(function(r){return{r:r,i:+r.dataset.qi}}).filter(function(x){return x.i>qi});
      var u=R.filter(function(x){return q[x.i]&&q[x.i]._uq})[0],p=R.filter(function(x){return!(q[x.i]&&q[x.i]._uq)})[0];
      function lb(h,b){var d=document.createElement('div');d.className='q-lb';d.innerHTML=h;b.parentNode.insertBefore(d,b)}
      if(u)lb('Berikutnya dalam antrean <span class="q-x" onclick="x22Cq()">Hapus semua</span>',u.r);
      if(p)lb('Berikutnya dari daftar putar',p.r);
    }catch(e){}
  };

  /* ---------- 5. Lirik layar penuh + kartu bagikan ---------- */
  var LY={a:null,idx:-1,id:'',had:false,t:0,wl:null};
  function ensure(){
    var el=Q('#x22l');if(el)return el;
    el=document.createElement('div');el.className='ov';el.id='x22l';
    el.innerHTML='<div class="x22h"><button class="ib g" onclick="x22Cl()" aria-label="Tutup">✕</button><div class="x22m"><b></b><small></small></div><button class="ib g" onclick="x22Sh()" aria-label="Bagikan lirik">⤴</button></div><div id="x22t"></div><div class="x22c"><button class="ib g" onclick="nxt(-1)">⏮</button><button class="ib g x22pp" onclick="toggle()">⏯</button><button class="ib g" onclick="nxt(1)">⏭</button></div>';
    var p=document.getElementById('pl');(p&&p.parentNode||document.body).appendChild(el);
    Q('#x22t',el).addEventListener('click',function(e){var l=e.target.closest('.x22ln'),s=l&&LY.a&&LY.a[+l.dataset.i];if(s)try{act.currentTime=s.t}catch(x){}});
    return el;
  }
  function render(){
    var el=ensure(),t=cur,box=Q('#x22t',el);if(!t)return;
    var L=lyc[t.id],hu=+hh(t.title)||260;
    LY.id=t.id;LY.had=!!L;LY.idx=-1;LY.a=null;
    Q('.x22m b',el).textContent=t.title;Q('.x22m small',el).textContent=t.artist||'';
    el.style.background='linear-gradient(180deg,hsl('+hu+',55%,24%),var(--ov) 85%)';
    if(!L){try{fetchLy(t)}catch(e){}box.innerHTML='<div class="em">'+(lyS[t.id]=='none'?'Lirik tidak tersedia untuk lagu ini.':'Memuat lirik…')+'</div>';return}
    var al=alOf(t);
    if(al&&al.length){LY.a=al;box.innerHTML=al.map(function(x,i){return'<div class="x22ln" data-i="'+i+'">'+E(x.s||'♪')+'</div>'}).join('')}
    else box.innerHTML=String(L).split(/\r?\n/).map(function(l){return l.trim()?'<div class="x22p">'+E(l)+'</div>':'<div class="x22g"></div>'}).join('');
  }
  function tick(){
    var el=Q('#x22l');
    if(!el||!el.classList.contains('on')){clearInterval(LY.t);LY.t=0;return}
    if(!cur)return;
    if(LY.id!==cur.id||(!!lyc[cur.id])!==LY.had)render();
    if(!LY.a)return;
    var ct=(+act.currentTime||0)+.25,i=-1;
    for(var k=0;k<LY.a.length;k++){if(LY.a[k].t<=ct)i=k;else break}
    if(i===LY.idx)return;
    LY.idx=i;QA('.x22ln.on',el).forEach(function(x){x.classList.remove('on')});
    var n=Q('.x22ln[data-i="'+i+'"]',el);if(n){n.classList.add('on');n.scrollIntoView({block:'center',behavior:'smooth'})}
  }
  window.x22Ly=function(){
    if(!cur)return;var el=ensure();render();el.classList.add('on');
    if(!LY.t)LY.t=setInterval(tick,250);tick();
    try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){LY.wl=w}).catch(function(){})}catch(e){}
  };
  window.x22Cl=function(){var el=Q('#x22l');if(el)el.classList.remove('on');try{if(LY.wl){LY.wl.release();LY.wl=null}}catch(e){}};
  function wrap(x,text,mw){
    var w=String(text).split(' '),l='',o=[];
    w.forEach(function(s){var n=l?l+' '+s:s;if(x.measureText(n).width>mw&&l){o.push(l);l=s}else l=n});
    if(l)o.push(l);return o;
  }
  window.x22Sh=function(){
    var t=cur;if(!t)return;var txt;
    if(LY.a)txt=LY.a.slice(Math.max(0,LY.idx),Math.max(0,LY.idx)+4).map(function(x){return x.s}).filter(Boolean);
    else txt=String(lyc[t.id]||'').split(/\r?\n/).map(function(s){return s.trim()}).filter(Boolean).slice(0,4);
    if(!txt.length)return;
    var W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;
    var x=c.getContext('2d'),hu=+hh(t.title)||260,g=x.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'hsl('+hu+',60%,34%)');g.addColorStop(1,'hsl('+((hu+50)%360)+',55%,14%)');x.fillStyle=g;x.fillRect(0,0,W,H);
    function fin(){
      x.fillStyle='#fff';x.textBaseline='top';x.font='800 64px system-ui,sans-serif';
      var y=320;txt.forEach(function(l){wrap(x,l,W-200).forEach(function(s){x.fillText(s,100,y);y+=84});y+=26});
      x.globalAlpha=.9;x.font='700 36px system-ui,sans-serif';x.fillText(String(t.title).slice(0,40),100,H-220);
      x.globalAlpha=.7;x.font='500 30px system-ui,sans-serif';x.fillText(String(t.artist||'').slice(0,50),100,H-166);
      x.font='700 28px system-ui,sans-serif';x.fillText('Loopify',100,H-96);
      c.toBlob(function(b){
        if(!b)return;var f=new File([b],'lirik.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:t.title}).catch(function(){});
        else{var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='lirik.png';a.click();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
      },'image/png');
    }
    if(!t.img||!/^https?:/.test(t.img))return fin();
    var im=new Image(),done=0,go=function(ok){
      if(done)return;done=1;
      if(ok){x.save();x.beginPath();if(x.roundRect)x.roundRect(100,110,170,170,26);else x.rect(100,110,170,170);x.clip();x.drawImage(im,100,110,170,170);x.restore()}
      fin();
    };
    im.crossOrigin='anonymous';im.onload=function(){go(1)};im.onerror=function(){go(0)};setTimeout(function(){go(0)},2500);im.src=t.img;
  };
  var _rp=rp;
  rp=function(){
    _rp.apply(this,arguments);
    try{var b=Q('#pl .x17b');if(b&&!Q('.x22b',b)){var r=document.createElement('button');r.className='btn g x22b';r.textContent='🎤 Lirik';r.onclick=window.x22Ly;b.appendChild(r)}}catch(e){}
  };

  /* ---------- 10. Daftar panjang dirender bertahap ---------- */
  function lz(r){var m=r.querySelector('img');if(m){m.loading='lazy';m.decoding='async'}}
  function lazy(){
    var all=QA('#v .rw,#sp .rw');if(all.length<=110)return;
    var P=[];all.forEach(function(r){var p=r.parentNode;if(P.indexOf(p)<0)P.push(p)});
    P.forEach(function(p){
      var rw=[].filter.call(p.children,function(c){return c.classList.contains('rw')});
      if(rw.length<=110||Q(':scope>.x22s',p))return;
      var rest=rw.slice(60),s=document.createElement('div');s.className='x22s';
      rest.forEach(function(r){r.remove()});rw.slice(0,60).forEach(lz);rw[59].after(s);
      var io=new IntersectionObserver(function(en){
        if(!en[0].isIntersecting)return;
        var ch=rest.splice(0,60);ch.forEach(function(r){lz(r);s.before(r)});
        if(!rest.length){io.disconnect();s.remove()}else{io.unobserve(s);io.observe(s)}
      },{rootMargin:'900px'});
      io.observe(s);
    });
  }
  var raf=0;
  function sched(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;try{lazy()}catch(e){}})}
  if(window.MutationObserver&&window.IntersectionObserver){
    var mo=new MutationObserver(sched);
    ['v','sp'].forEach(function(id){var n=document.getElementById(id);if(n)mo.observe(n,{childList:true,subtree:true})});
  }
})();
}catch(e){console.error('[loopify] extra22.js',e)}

/* ==== extra23.js ==== */
try{
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
}catch(e){console.error('[loopify] extra23.js',e)}

/* ==== extra24.js ==== */
try{
/* Loopify v4.22 - Semua Artis: kumpulkan semua nama artis dari koleksimu (lagu, favorit, riwayat, playlist, diikuti),
   lalu cari nama + foto channel YouTube-nya lewat /api/artist (hanya YouTube). Foto disimpan di perangkat 30 hari
   supaya kuota YouTube hemat. Plus pencarian artis bebas di YouTube. Dimuat setelah extra23.js (pasangan extra24.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  var DAY=864e5,TTL_HIT=30*DAY,TTL_MISS=3*DAY,STEP=24,BATCH=25,VM={};
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;return n>=1e6?(n/1e6).toFixed(1).replace('.0','')+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}

  /* ---------- cache foto di perangkat ---------- */
  var PC=ls.get('arp',{});
  function cget(n){var c=PC[low(n)];if(!c)return undefined;if(Date.now()-c.t>(c.m?TTL_MISS:TTL_HIT))return undefined;return c}
  function cset(n,v){PC[low(n)]=v?{t:Date.now(),id:v.id,name:v.name,img:v.img,subs:v.subs}:{t:Date.now(),m:1};}
  function csave(){
    var k=Object.keys(PC);
    if(k.length>600){k.sort(function(a,b){return PC[a].t-PC[b].t}).slice(0,k.length-600).forEach(function(x){delete PC[x]})}
    ls.set('arp',PC);
  }

  /* ---------- kumpulkan nama artis ---------- */
  function everything(){
    var a=[];
    try{a=a.concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(r,p){return r.concat(p.tr.map(rs))},[]))}catch(e){}
    return a.filter(function(t){return t&&typeof t==='object'});
  }
  function splitA(s){return String(s||'').split(/\s*(?:,|\bfeat\.?\s|\bft\.?\s|\bfeaturing\b)\s*/i).map(function(x){return x.trim()}).filter(Boolean)}
  function collect(){
    var m={};
    everything().forEach(function(t){
      splitA(t.artist).forEach(function(n){
        if(n.length<2||n.length>60||GEN.test(n))return;
        var k=low(n),o=m[k]||(m[k]={n:n,c:0,img:''});
        o.c++;if(!o.img&&t.img)o.img=t.img;
        if(t.yt&&t.vid&&!VM[k])VM[k]=t.vid;
      });
    });
    try{ls.get('fol',[]).forEach(function(f){var k=low(f.n);if(!f.n)return;var o=m[k]||(m[k]={n:f.n,c:0,img:f.img||''});o.f=1;if(!o.img&&f.img)o.img=f.img})}catch(e){}
    return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return(b.f?1:0)-(a.f?1:0)||b.c-a.c||a.n.localeCompare(b.n)});
  }

  /* ---------- ambil foto channel (bertahap, 8 nama per permintaan) ---------- */
  var busy=false,warnQuota=false,failKey=0;
  function resolve(names,done,deep){
    var todo=names.filter(function(n){var c=cget(n);return c===undefined||(deep&&c.m&&!c.deep)});
    if(!todo.length){done&&done();return}
    if(busy){setTimeout(function(){resolve(names,done,deep)},400);return}
    busy=true;
    var chunks=[],SZ=deep?8:BATCH;for(var i=0;i<todo.length;i+=SZ)chunks.push(todo.slice(i,i+SZ));
    var go=function(){
      var c=chunks.shift();
      if(!c){busy=false;csave();done&&done();return}
      fetch('/api/artist?names='+encodeURIComponent(c.map(function(n){var v=VM[low(n)];return n.replace(/[|~]/g,' ')+(v?'~'+v:'')}).join('|'))+(deep?'&s=1':'')).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(j){
        if(!j||!j.res){failKey++;chunks=[];}
        else{
          if(j.quota){warnQuota=true;chunks=[]}
          Object.keys(j.res).forEach(function(n){cset(n,j.res[n]);if(deep&&!j.res[n])PC[low(n)].deep=1});
        }
        csave();paint();go();
      });
    };
    go();
  }

  /* ---------- halaman Semua Artis ---------- */
  var L=[],SHOW=STEP,FQ='',YQ={},ytTimer=0;
  function sub1(x){var c=cget(x.n);return(x.c?x.c+' lagu':x.f?'Diikuti':'')+(c&&c.subs?(x.c?' · ':'')+fmtN(c.subs)+' subscriber':'')}
  function fb(n){return cov({h:hh(n)})}
  window.x24E=function(i){i.onerror=null;i.src=fb(i.getAttribute('data-n')||'')};
  function card(x,i){
    var c=cget(x.n),img=(c&&c.img)||x.img||'',loading=c===undefined&&busy;
    return'<div class="x24c'+(loading?' ld':'')+(c&&c.img?' yt':'')+'" onclick="x24Go('+i+')"><div class="x24r"><img src="'+E(img||fb(x.n))+'" data-n="'+E(x.n)+'" alt="" loading="lazy" onerror="x24E(this)"></div><b>'+E(x.n)+'</b><small>'+E(sub1(x))+'</small></div>';
  }
  function view(){
    var q=low(FQ),A=L.filter(function(x){return!q||low(x.n).indexOf(q)>=0});
    window.x24V=A;
    var vis=q?A:A.slice(0,SHOW),h='';
    h+=vis.length?'<div class="x24g">'+vis.map(function(x){return card(x,A.indexOf(x))}).join('')+'</div>':'<div class="em">'+(L.length?'Tidak ada artis dengan nama itu di koleksimu.':'Belum ada artis. Tambahkan lagu, favorit, atau putar video dulu.')+'</div>';
    var miss=L.filter(function(x){var c=cget(x.n);return c&&c.m&&!c.deep});
    if(!q&&miss.length)h+='<button class="btn g x24m" onclick="x24Deep()">Cari '+Math.min(8,miss.length)+' foto yang belum ketemu (pakai ±100 kuota YouTube per artis)</button>';
    if(!q&&A.length>SHOW)h+='<button class="btn g x24m" onclick="x24More()">Muat '+Math.min(STEP,A.length-SHOW)+' artis lagi ('+(A.length-SHOW)+' tersisa)</button>';
    return h;
  }
  function ytView(){
    var q=String(FQ).trim();
    if(q.length<2)return'';
    var r=YQ[q];
    if(r===undefined)return'<div class="sec"><h3>Di YouTube</h3></div><div class="em">Mencari “'+E(q)+'” di YouTube…</div>';
    if(!r.length)return'<div class="sec"><h3>Di YouTube</h3></div><div class="em">Tidak ada channel yang cocok.</div>';
    window.x24Y=r;
    return'<div class="sec"><h3>Di YouTube</h3></div><div class="x24g">'+r.map(function(x,i){
      return'<div class="x24c yt" onclick="x24GoY('+i+')"><div class="x24r"><img src="'+E(x.img||fb(x.name))+'" data-n="'+E(x.name)+'" alt="" loading="lazy" onerror="x24E(this)"></div><b>'+E(x.name)+'</b><small>'+(x.subs?fmtN(x.subs)+' subscriber':'Channel YouTube')+'</small></div>';
    }).join('')+'</div>';
  }
  function paint(){
    var g=Q('#x24l'),y=Q('#x24y'),s=Q('#x24s');
    if(!g)return;
    g.innerHTML=view();if(y)y.innerHTML=ytView();
    if(s){
      var got=L.filter(function(x){var c=cget(x.n);return c&&c.img}).length;
      s.textContent=L.length+' artis · '+got+' foto channel'+(busy?' · memuat…':'');
    }
    var w=Q('#x24w');if(w)w.style.display=warnQuota||failKey?'':'none';
  }
  function loadVisible(){
    var q=low(FQ),A=L.filter(function(x){return!q||low(x.n).indexOf(q)>=0});
    resolve((q?A.slice(0,12):A.slice(0,SHOW)).map(function(x){return x.n}),paint);
  }
  window.x24Deep=function(){
    var m=L.filter(function(x){var c=cget(x.n);return c&&c.m&&!c.deep}).slice(0,8).map(function(x){return x.n});
    resolve(m,paint,1);paint();
  };
  window.x24More=function(){SHOW+=STEP;paint();loadVisible()};
  window.x24Go=function(i){
    var x=(window.x24V||[])[i];if(!x)return;
    var c=cget(x.n);
    if(c&&c.id&&window.x16Ch)window.x16Ch({src:'yt',id:c.id,name:x.n,img:c.img,subs:c.subs||0,v:0});
    else artistPg(x.n);
  };
  window.x24GoY=function(i){
    var x=(window.x24Y||[])[i];if(!x)return;
    window.x16Ch?window.x16Ch(x):artistPg(x.name);
  };
  window.x24Q=function(v){
    FQ=v;paint();clearTimeout(ytTimer);
    var q=String(v).trim();
    if(q.length<2)return;
    loadVisible();
    ytTimer=setTimeout(function(){
      if(YQ[q]!==undefined){paint();return}
      fetch('/api/artist?q='+encodeURIComponent(q)).then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}).then(function(a){
        YQ[q]=Array.isArray(a)?a:[];if(String(FQ).trim()==q)paint();
      });
    },650);
  };
  window.x24Open=function(){
    try{clp()}catch(e){}
    L=collect();SHOW=STEP;FQ='';
    var top=L.filter(function(x){var c=cget(x.n);return c&&c.img}).slice(0,3);
    sub(shd('Semua Artis')+
      '<div class="x24h"><div class="x24hb"><b>Semua artis kamu</b><span id="x24s"></span></div></div>'+
      '<div class="x24sr"><input id="x24i" type="search" placeholder="Cari artis di koleksimu atau YouTube" autocomplete="off" oninput="x24Q(this.value)"></div>'+
      '<div id="x24w" class="x24w" style="display:none">Foto channel belum bisa dimuat. Cek <code>YOUTUBE_API_KEY</code> di Vercel atau kuota harian YouTube. Coba lagi besok atau buka ulang halaman ini.</div>'+
      '<div id="x24l"></div><div id="x24y"></div>');
    paint();loadVisible();
  };

  /* ---------- tombol masuk: Library > Artis dan Beranda ---------- */
  var _al=window.arList;
  window.arList=function(){
    var h=_al.apply(this,arguments);
    return'<div class="x24bn" onclick="x24Open()"><div class="x24bi">✨</div><div><b>Semua Artis</b><small>Nama dan foto channel YouTube</small></div><span>›</span></div>'+h;
  };
  function home(v){
    var all=collect().slice(0,12);if(!all.length)return;
    var anchor=Q('[data-x16h]',v)||Q('.hero',v);if(!anchor)return;
    var d=document.createElement('div');d.setAttribute('data-x24h','1');
    var draw=function(){
      window.x24HL=all;
      d.innerHTML='<div class="sec"><h3>Artis dari koleksimu</h3><a onclick="x24Open()">Lihat Semua</a></div><div class="hs x24hs">'+all.map(function(x,i){
        var c=cget(x.n),img=(c&&c.img)||x.img||'';
        return'<div class="cd x24a" onclick="x24GoH('+i+')"><div class="x24r"><img src="'+E(img||fb(x.n))+'" data-n="'+E(x.n)+'" alt="" onerror="x24E(this)"></div><b>'+E(x.n)+'</b></div>';
      }).join('')+'</div>';
    };
    draw();anchor.insertAdjacentElement('afterend',d);
    // hanya muat foto untuk 8 artis teratas di Beranda (hemat kuota); sisanya di halaman Semua Artis
    resolve(all.slice(0,8).map(function(x){return x.n}),function(){if(d.isConnected)draw()});
  }
  window.x24GoH=function(i){var x=(window.x24HL||[])[i];if(!x)return;window.x24V=[x];window.x24Go(0)};
  function deco(){
    var v=Q('#v');if(!v)return;
    if(Q('.hero',v)&&!Q('[data-x24h]',v))home(v);
  }
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){setTimeout(function(){try{deco()}catch(e){console.error(e)}},60)}).observe(vv,{childList:true});
  setTimeout(function(){try{deco()}catch(e){}},500);
})();
}catch(e){console.error('[loopify] extra24.js',e)}

/* ==== extra25.js ==== */
try{
/* Loopify v4.23 - Halaman artis ala Spotify: header foto besar berwarna dari foto, tombol Putar/Acak/Ikuti/Radio,
   Populer (bernomor, 5 lalu Lihat lainnya), Rilis terbaru, Diskografi (Album / Single / Remix),
   "Sering kamu putar bersama" (dihitung dari playlistmu, tanpa kuota), Koleksimu, dan Tentang.
   Menggantikan tampilan x16Ch dari extra16 untuk artis YouTube. Dimuat setelah extra24.js (pasangan extra25.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var GEN=/^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;var d=function(x){return x.toFixed(1).replace('.0','').replace('.',',')};return n>=1e9?d(n/1e9)+' M':n>=1e6?d(n/1e6)+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}
  function tgl(ts){try{return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return''}}
  function img(a){return E(cov(a.img?{img:a.img}:{h:hh(a.name||a.n||'x')}))}

  var DATA={},ALB={},S=null;

  /* ---------- data lokal: koleksi + artis yang sering diputar bersama ---------- */
  function everything(){
    var a=[];try{a=a.concat(songs,favs.map(rs),hist.map(rs),pls.reduce(function(r,p){return r.concat(p.tr.map(rs))},[]))}catch(e){}
    return a.filter(function(t){return t&&typeof t==='object'});
  }
  function own(name){
    var k=low(name),seen={};
    return everything().filter(function(t){var ok=low(t.artist)==k&&t.id!=null&&!seen[t.id];if(ok)seen[t.id]=1;return ok});
  }
  function together(name){
    var k=low(name),c={},nm={};
    var lists_=[];try{pls.forEach(function(p){lists_.push(p.tr.map(rs))});lists_.push(favs.map(rs));lists_.push(hist.map(rs))}catch(e){}
    lists_.forEach(function(l){
      var arts={};l.forEach(function(t){if(t&&t.artist&&!GEN.test(t.artist))arts[low(t.artist)]=t.artist});
      if(!arts[k])return;
      Object.keys(arts).forEach(function(x){if(x==k)return;c[x]=(c[x]||0)+1;nm[x]=arts[x]});
    });
    return Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,10).map(function(x){return{name:nm[x],n:c[x]}});
  }
  function photo(n){try{var c=(ls.get('arp',{}))[low(n)];return c&&c.img||''}catch(e){return''}}

  /* ---------- Ikuti (format sama dengan extra16) ---------- */
  function fol(){return ls.get('fol',[])}
  function isFol(n){return fol().some(function(x){return low(x.n)==low(n)})}
  function folTg(a){
    var l=fol(),k=low(a.name),j=l.findIndex(function(x){return low(x.n)==k});
    if(j>=0)l.splice(j,1);else l.unshift({n:a.name,img:a.img||'',s:'yt',i:a.id||''});
    ls.set('fol',l);
  }

  /* ---------- warna header dari foto artis ---------- */
  function tint(src,el){
    if(!src||!/^https:/.test(src))return;
    var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){
      try{
        var c=document.createElement('canvas');c.width=c.height=10;var x=c.getContext('2d');x.drawImage(im,0,0,10,10);
        var d=x.getImageData(0,0,10,10).data,r=0,g=0,b=0,n=0;
        for(var i=0;i<d.length;i+=4){if(d[i+3]<200)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++}
        if(n&&el.isConnected)el.style.setProperty('--hc','rgb('+Math.round(r/n*.8)+','+Math.round(g/n*.8)+','+Math.round(b/n*.8)+')');
      }catch(e){}
    };
    im.src=src;
  }

  /* ---------- halaman ---------- */
  function get(url,k){return fetch(url).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){return j[k]||[]})}
  function mk(x){return Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx,v:x.v,ts:x.ts,d:x.d})}
  function open(a){
    try{clp()}catch(e){}
    var key=a.id;
    S={a:a,key:key,more:false,tab:'',pop:null,all:null};
    var mine=own(a.name),tg=together(a.name);
    sub(shd(E(a.name))+
      '<div class="x25" id="x25">'+
        '<div class="x25h" id="x25h"><div class="x25bg" style="background-image:url(\''+img(a).replace(/'/g,'%27')+'\')"></div>'+
          '<div class="x25ph"><img src="'+img(a)+'" alt="" data-n="'+E(a.name)+'" onerror="x24E&&x24E(this)"></div>'+
          '<h1>'+E(a.name)+'</h1>'+
          '<small>'+(a.subs?fmtN(a.subs)+' subscriber · ':'')+'YouTube'+'</small></div>'+
        '<div class="x25ac"><button class="x25play" id="x25play" onclick="x25Play()" aria-label="Putar">▶</button>'+
          '<button class="x25ic" onclick="x25Shuf()" aria-label="Acak">⤮</button>'+
          '<button class="x25fb" id="x25fb"></button>'+
          '<button class="x25ic" onclick="x25Rad()" aria-label="Radio" title="Radio artis">📻</button></div>'+
        '<div id="x25pop"><div class="sec"><h3>Populer</h3></div><div class="x25sk"></div><div class="x25sk"></div><div class="x25sk"></div></div>'+
        '<div id="x25new"></div>'+
        '<div id="x25dis"></div>'+
        (mine.length?'<div class="sec"><h3>Koleksimu</h3></div><div id="x25own"></div>':'')+
        (tg.length?'<div class="sec"><h3>Sering kamu putar bersama</h3></div><div class="hs x25tg">'+tg.map(function(x,i){var p=photo(x.name);return'<div class="cd x25a" onclick="x25Sim('+i+')"><div class="x25r"><img src="'+E(p||cov({h:hh(x.name)}))+'" data-n="'+E(x.name)+'" alt="" onerror="x24E&&x24E(this)"></div><b>'+E(x.name)+'</b><small>'+(+x.n||0)+' playlist</small></div>'}).join('')+'</div>':'')+
        '<div id="x25ab"></div>'+
      '</div>');
    window.x25T=tg;
    if(mine.length){lists.x25o=mine;var o=Q('#x25own');if(o)o.innerHTML=rows('x25o',mine)}
    var b=Q('#x25fb');
    var paint=function(){var on=isFol(a.name);b.textContent=on?'Mengikuti':'Ikuti';b.className='x25fb'+(on?' on':'')};
    b.onclick=function(){folTg(a);paint()};paint();
    tint(a.img,Q('#x25'));
    about();
    if(DATA[key])fill(DATA[key]);
    else get('/api/artist?src=yt&id='+encodeURIComponent(a.id)+'&top=1&name='+encodeURIComponent(a.name),'tracks').then(function(t){
      if(t.length)return t;
      // cadangan: pencarian video channel (lebih mahal, hanya kalau jalur hemat kosong)
      return get('/api/artist?src=yt&id='+encodeURIComponent(a.id)+'&name='+encodeURIComponent(a.name),'tracks');
    }).then(function(t){
      DATA[key]=t.map(mk);
      if(S&&S.key==key)fill(DATA[key]);
    });
  }
  function popList(){return(S.all||[]).filter(function(t){return!t.rmx}).sort(function(a,b){return(b.v||0)-(a.v||0)})}
  function newList(){return(S.all||[]).filter(function(t){return t.ts}).sort(function(a,b){return b.ts-a.ts})}
  function fill(all){
    if(!S)return;
    S.all=all;
    var pop=popList();if(!pop.length)pop=all.slice();
    lists.x25p=pop.slice(0,30);
    paintPop();
    var nw=newList().filter(function(t){return!t.rmx}).slice(0,10);
    var el=Q('#x25new');
    if(el&&nw.length){
      lists.x25n=nw;
      var f=nw[0];
      el.innerHTML='<div class="sec"><h3>Rilis terbaru</h3></div>'+
        '<div class="x25nw" onclick="P(\'x25n\',0)"><img src="'+E(f.img)+'" alt=""><div><small>'+E(tgl(f.ts))+'</small><b>'+E(f.title)+'</b><span>▶ Putar</span></div></div>'+
        (nw.length>1?'<div class="hs">'+nw.slice(1).map(function(t,i){return'<div class="cd" onclick="P(\'x25n\','+(i+1)+')"><img src="'+E(t.img)+'" alt=""><b>'+E(t.title)+'</b><small>'+E(tgl(t.ts))+'</small></div>'}).join('')+'</div>':'');
    }
    S.tab=S.tab||'';
    disco();
  }
  function paintPop(){
    var el=Q('#x25pop');if(!el||!S)return;
    var L=lists.x25p||[];
    if(!L.length){el.innerHTML='<div class="sec"><h3>Populer</h3></div><div class="em">Belum ada lagu yang bisa diputar. Jika ini terus terjadi, cek kuota YouTube.</div>';return}
    var n=S.more?10:5,show=L.slice(0,n);
    lists.x25s=show;
    el.innerHTML='<div class="sec"><h3>Populer</h3></div><div class="x25ol">'+show.map(function(t,i){
      return'<div class="x25p" onclick="P(\'x25p\','+i+')"><span class="x25n">'+(i+1)+'</span><img src="'+E(t.img)+'" alt=""><div><b>'+E(t.title)+'</b><small>'+(t.v?fmtN(t.v)+' kali ditonton':'')+'</small></div><button class="x25mo" onclick="event.stopPropagation();x25Q('+i+')" aria-label="Tambah ke antrean">＋</button></div>';
    }).join('')+'</div>'+(L.length>5?'<button class="x25lm" onclick="x25More()">'+(S.more?'Lihat lebih sedikit':'Lihat lainnya')+'</button>':'');
  }
  function disco(){
    var el=Q('#x25dis');if(!el||!S)return;
    var a=S.a,all=S.all||[];
    var singles=newList().filter(function(t){return!t.rmx}),rmx=all.filter(function(t){return t.rmx});
    var albums=ALB[a.id];
    var tabs=[['alb','Album'],['sg','Single & Video'],['rmx','Remix']].filter(function(x){return x[0]=='alb'?albums===undefined||albums.length:x[0]=='sg'?singles.length:rmx.length});
    if(!tabs.length){el.innerHTML='';return}
    if(!S.tab||!tabs.some(function(x){return x[0]==S.tab}))S.tab=tabs[0][0];
    var body='';
    if(S.tab=='alb'){
      if(albums===undefined){
        body='<div class="em">Memuat album…</div>';
        get('/api/artist?src=yt&albums=1&id='+encodeURIComponent(a.id),'albums').then(function(l){ALB[a.id]=l;if(S&&S.a.id==a.id)disco()});
      }else{
        window.x25A=albums.map(function(x){return Object.assign({},x,{artist:a.name,aid:a.id})});
        body='<div class="hs">'+albums.map(function(x,i){return'<div class="cd" onclick="x25Al('+i+')"><img src="'+E(cov(x.img?{img:x.img}:{h:hh(x.name)}))+'" alt=""><b>'+E(x.name)+'</b><small>'+(+x.n?(+x.n)+' lagu':'Album')+'</small></div>'}).join('')+'</div>';
      }
    }else{
      var L=(S.tab=='sg'?singles:rmx).slice(0,30);lists.x25d=L;
      body='<div class="hs">'+L.map(function(t,i){return'<div class="cd" onclick="P(\'x25d\','+i+')"><img src="'+E(t.img)+'" alt=""><b>'+E(t.title)+'</b><small>'+(S.tab=='sg'?E(tgl(t.ts)):'Remix')+'</small></div>'}).join('')+'</div>';
    }
    el.innerHTML='<div class="sec"><h3>Diskografi</h3></div><div class="chips">'+tabs.map(function(x){return'<span class="chip '+(S.tab==x[0]?'a':'')+'" onclick="x25Tab(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+body;
  }
  function about(){
    var el=Q('#x25ab');if(!el||!S)return;
    var a=S.a,mine=own(a.name).length;
    el.innerHTML='<div class="sec"><h3>Tentang</h3></div><div class="x25ab"><div class="x25abi" style="background-image:url(\''+img(a).replace(/'/g,'%27')+'\')"><div><b>'+E(a.name)+'</b><small>'+(a.subs?fmtN(a.subs)+' subscriber':'Channel YouTube')+(mine?' · '+mine+' lagu di koleksimu':'')+'</small></div></div>'+
      (a.id?'<a class="btn g" href="https://www.youtube.com/channel/'+E(a.id)+'" target="_blank" rel="noopener noreferrer">Buka di YouTube</a>':'')+'</div>';
  }

  /* ---------- aksi ---------- */
  window.x25Play=function(){if(lists.x25p&&lists.x25p.length)P('x25p',0);else toast('Lagu belum selesai dimuat')};
  window.x25Shuf=function(){
    var l=(lists.x25p||[]).slice();if(!l.length){toast('Lagu belum selesai dimuat');return}
    lists.x25a=l.sort(function(){return Math.random()-.5});P('x25a',0);
  };
  window.x25Rad=function(){
    var t=(lists.x25p||[])[0];
    if(!t){toast('Lagu belum selesai dimuat');return}
    if(typeof window.x21Radio=='function')window.x21Radio(t);else P('x25p',0);
  };
  window.x25More=function(){S.more=!S.more;paintPop()};
  window.x25Q=function(i){
    var t=(lists.x25s||[])[i];if(!t)return;
    try{if(!cur){play([t],0);openP();return}q.push(t);toast('Ditambahkan ke antrean')}catch(e){}
  };
  window.x25Tab=function(t){S.tab=t;disco()};
  window.x25Sim=function(i){var x=(window.x25T||[])[i];if(x)artistPg(x.name)};
  window.x25Al=function(i){var al=(window.x25A||[])[i];if(al&&window.x26Alb)window.x26Alb(al)};

  /* ---------- pasang: ganti x16Ch untuk artis YouTube ---------- */
  var _ch=window.x16Ch;
  window.x16Ch=function(a){
    if(a&&a.src=='yt'&&a.id)return open(a);
    return _ch?_ch(a):undefined;
  };
})();
}catch(e){console.error('[loopify] extra25.js',e)}

/* ==== extra26.js ==== */
try{
/* Loopify v4.24 - (1) kartu "Hasil teratas" di pencarian, (2) simpan Album + tab Album di Library,
   (3) notifikasi rilis baru dari artis yang diikuti (cek saat aplikasi dibuka + Periodic Sync di PWA yang terpasang).
   Dimuat setelah extra25.js (pasangan extra26.css). */
(function(){
  'use strict';
  var E=function(s){return esc(s)},Q=function(s,r){return(r||document).querySelector(s)};
  var low=function(s){return String(s||'').trim().toLowerCase()};
  function fmtN(n){n=+n||0;var d=function(x){return x.toFixed(1).replace('.0','').replace('.',',')};return n>=1e9?d(n/1e9)+' M':n>=1e6?d(n/1e6)+' jt':n>=1e3?Math.round(n/1e3)+' rb':String(n)}

  /* ================= 1. Hasil teratas ================= */
  function top(){
    var b=Q('#x16'),qi=Q('#qi');if(!b||!qi)return;
    var q=low(typeof lq=='string'?lq:'');
    var old=Q('[data-x26t]',b);
    if(!q||q.length<2){if(old)old.remove();return}
    var f=Q('#x16f .chip.a');if(f&&f.textContent!=='Semua'){if(old)old.remove();return}
    var A=window.x16A||[],a=A[0],h='';
    var rel=function(n){var x=low(n);return x&&(x.indexOf(q)>=0||q.indexOf(x)>=0)};
    if(a&&rel(a.name)){
      h='<div class="x26t" onclick="x16AG(0)"><img src="'+E(cov(a.img?{img:a.img}:{h:hh(a.name)}))+'" class="r" alt=""><b>'+E(a.name)+'</b><small><i>Artis</i>'+(a.subs?' · '+fmtN(a.subs)+' subscriber':'')+'</small><span class="x26p">▶</span></div>';
    }else if(typeof lres!='undefined'&&lres&&lres[0]){
      var t=lres[0];
      h='<div class="x26t" onclick="P(\'sr\',0)"><img src="'+E(cov(t))+'" alt=""><b>'+E(t.title)+'</b><small><i>Lagu</i> · '+E(t.artist||'')+'</small><span class="x26p">▶</span></div>';
    }
    var sig=h?h.length+q:'';
    if(old&&old.getAttribute('data-x26t')==sig)return;
    if(old)old.remove();
    if(!h)return;
    var d=document.createElement('div');d.setAttribute('data-x26t',sig);
    d.innerHTML='<div class="sec"><h3>Hasil teratas</h3></div>'+h;
    b.insertBefore(d,b.firstChild);
  }

  /* ================= 2. Simpan Album + tab Album di Library ================= */
  function sal(){return ls.get('sal',[])}
  function isSaved(id){return sal().some(function(x){return x.id==id})}
  function saveTg(al){
    var l=sal(),j=l.findIndex(function(x){return x.id==al.id});
    if(j>=0)l.splice(j,1);else l.unshift({id:al.id,name:al.name,img:al.img||'',n:al.n||0,artist:al.artist||'',aid:al.aid||''});
    ls.set('sal',l);return j<0;
  }
  window.x26Alb=function(al){
    if(!al)return;
    sub(shd(E(al.name))+'<div class="x16hd"><img src="'+E(cov(al.img?{img:al.img}:{h:hh(al.name)}))+'" alt=""><h2>'+E(al.name)+'</h2><small>Album · '+E(al.artist||'')+'</small><button class="x26sv" id="x26sv"></button></div><div id="x26at"><div class="em">Memuat…</div></div>');
    var bt=Q('#x26sv');
    var paint=function(){var on=isSaved(al.id);bt.textContent=on?'✓ Tersimpan di Library':'＋ Simpan ke Library';bt.className='x26sv'+(on?' on':'')};
    bt.onclick=function(){var on=saveTg(al);toast(on?'Album disimpan':'Album dihapus dari Library');paint()};paint();
    fetch('/api/artist?src=yt&album='+encodeURIComponent(al.id)).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
      var t=(j.tracks||[]).map(function(x){return Object.assign(mkV(x.id,x.title,x.artist),{rmx:x.rmx})});
      lists.x26al=t;
      var el=Q('#x26at'),sm=Q('.x16hd small');
      if(sm)sm.textContent='Album · '+(al.artist||'')+' · '+t.length+' lagu';
      if(el)el.innerHTML=t.length?'<div class="x16pb"><button class="btn" onclick="P(\'x26al\',0)">▶ Putar</button><button class="btn g" onclick="lists.x26al=lists.x26al.slice().sort(function(){return Math.random()-.5});P(\'x26al\',0)">⤮ Acak</button></div>'+rows('x26al',t):'<div class="em">Album kosong atau tidak bisa diputar.</div>';
    });
  };
  window.x26AlG=function(i){window.x26Alb(sal()[i])};
  function albBody(){
    var l=sal();
    if(!l.length)return'<div class="em">Belum ada album. Buka halaman artis, ketuk sebuah album di Diskografi, lalu pilih “Simpan ke Library”.</div>';
    return'<div class="x16g2 x26ag">'+l.map(function(x,i){return'<div class="x26ac" onclick="x26AlG('+i+')"><img src="'+E(cov(x.img?{img:x.img}:{h:hh(x.name)}))+'" alt=""><b>'+E(x.name)+'</b><small>'+E(x.artist||'Album')+'</small></div>'}).join('')+'</div>';
  }
  var _lib=V.library;
  V.library=function(){
    var html,isAl=lt==='al';
    if(isAl){lt='fav';try{html=_lib()}finally{lt='al'}}else html=_lib();
    var i=html.indexOf('<div class="chips">');if(i<0)return html;
    var j=html.indexOf('</div>',i);
    var chips=html.slice(i,j);
    if(isAl)chips=chips.replace(/chip a"/g,'chip "').replace(/class="chip "/g,'class="chip "');
    chips+='<span class="chip '+(isAl?'a':'')+'" onclick="lt=\'al\';go(\'library\')">Album</span>';
    var out=html.slice(0,i)+chips+'</div>';
    return isAl?out+albBody():out+html.slice(j+6);
  };

  /* ================= 3. Notifikasi rilis baru ================= */
  function fol(){return ls.get('fol',[]).filter(function(x){return x.i&&x.s=='yt'})}
  function seen(){return ls.get('seen',{})}
  function syncCache(){
    try{
      if(!window.caches)return;
      var s=seen(),l=fol().slice(0,8).map(function(x){return{i:x.i,n:x.n,last:s[x.i]||''}});
      caches.open('ma-fol').then(function(c){return c.put('/__fol',new Response(JSON.stringify(l),{headers:{'Content-Type':'application/json'}}))}).catch(function(){});
    }catch(e){}
  }
  function notify(title,body,tag){
    try{
      if(!('Notification' in window)||Notification.permission!=='granted'||!navigator.serviceWorker)return;
      navigator.serviceWorker.ready.then(function(r){r.showNotification(title,{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag,renotify:true})}).catch(function(){});
    }catch(e){}
  }
  var checking=false;
  function check(){
    var f=fol().slice(0,8);if(!f.length||checking)return;
    var lc=ls.get('relchk',0);if(Date.now()-lc<4*3600e3)return;
    checking=true;
    var s=seen(),fresh=[];
    Promise.all(f.map(function(a){
      return fetch('/api/artist?src=yt&latest=1&n=1&id='+encodeURIComponent(a.i)+'&name='+encodeURIComponent(a.n)).then(function(r){return r.ok?r.json():{}}).catch(function(){return{}}).then(function(j){
        var t=(j.tracks||[])[0];if(!t)return;
        if(s[a.i]&&s[a.i]!==t.id)fresh.push({a:a,t:t});
        s[a.i]=t.id;
      });
    })).then(function(){
      ls.set('seen',s);ls.set('relchk',Date.now());checking=false;syncCache();
      if(!fresh.length)return;
      var n=fresh.length;
      toast(n==1?fresh[0].a.n+' merilis lagu baru: '+fresh[0].t.title:n+' artis yang kamu ikuti punya rilis baru');
      fresh.slice(0,3).forEach(function(x){notify(x.a.n+' rilis baru',x.t.title,'new-'+x.a.i)});
      ls.set('newc',null); // paksa Beranda memuat ulang rilis terbaru
    });
  }
  function askPerm(){
    try{
      if(!('Notification' in window)||Notification.permission!=='default')return;
      Notification.requestPermission().then(function(p){
        if(p==='granted'){toast('Notifikasi rilis baru aktif');regSync()}
      }).catch(function(){});
    }catch(e){}
  }
  function regSync(){
    try{
      if(!navigator.serviceWorker||!('periodicSync' in ServiceWorkerRegistration.prototype))return;
      navigator.serviceWorker.ready.then(function(r){return r.periodicSync.register('ma-new',{minInterval:12*3600e3})}).catch(function(){});
    }catch(e){}
  }
  // minta izin saat pertama kali mengetuk Ikuti (harus dari ketukan pengguna)
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('#x25fb,#x16fb');
    if(!b)return;
    setTimeout(function(){
      var l=fol();if(!l.length)return;
      syncCache();
      if('Notification' in window&&Notification.permission==='default'&&!ls.get('npAsk',0)){ls.set('npAsk',1);askPerm()}
      ls.set('relchk',0);setTimeout(check,400);
    },150);
  },true);

  /* ================= pasang ================= */
  var vv=Q('#v');
  if(vv&&window.MutationObserver)new MutationObserver(function(){try{top()}catch(e){}}).observe(vv,{childList:true,subtree:true});
  setTimeout(function(){try{syncCache();regSync();check()}catch(e){}},4000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(function(){try{check()}catch(e){}},1500)});
})();
}catch(e){console.error('[loopify] extra26.js',e)}

/* ==== extra27.js ==== */
try{
/* v4.25 (diperkuat v4.30): tetap memutar saat layar mati / aplikasi di latar belakang (APK WebView).
   1) Pemutar YouTube yang dijeda sistem (bukan oleh pengguna) dilanjutkan otomatis.
   2) Audio senyap berulang menjaga WebView tetap dianggap "sedang memutar" oleh Android.
   Dimuat setelah extra26.js. */
(function(){
  var want=false,lastUser=0,silent=null;
  /* v4.30: loop 10 detik dengan derau sangat halus (sekitar -70 dBFS, tidak terdengar) dan volume penuh.
     Versi lama persis nol dan volume .01, sehingga Chrome/WebView menganggapnya senyap total dan tidak menjaga proses tetap hidup. */
  function mkSilent(){
    if(silent)return silent;
    try{
      var sr=8000,n=sr*10,b=new Uint8Array(44+n*2),d=new DataView(b.buffer);
      var w=function(o,s){for(var i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i)};
      w(0,'RIFF');d.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);
      d.setUint32(24,sr,true);d.setUint32(28,sr*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*2,true);
      for(var i=0;i<n;i++)d.setInt16(44+i*2,Math.round((Math.random()*2-1)*10),true);
      silent=new Audio(URL.createObjectURL(new Blob([b],{type:'audio/wav'})));silent.loop=true;silent.volume=1;
    }catch(e){}
    return silent;
  }
  function keep(on){var a=mkSilent();if(!a)return;try{if(on){var p=a.play();p&&p.catch&&p.catch(function(){})}else a.pause()}catch(e){}}
  function ytOn(){try{return typeof act!=='undefined'&&typeof yAct!=='undefined'&&act===yAct&&typeof yp!=='undefined'&&yp&&yp.getPlayerState}catch(e){return false}}
  function userStop(){want=false;lastUser=Date.now();keep(false)}
  /* pause dari tombol aplikasi / notifikasi / sleep timer = kemauan pengguna */
  try{var op=yAct.pause;yAct.pause=function(){userStop();return op.apply(this,arguments)}}catch(e){}
  try{var osf=window.slFire;if(typeof osf==='function')window.slFire=function(){userStop();return osf.apply(this,arguments)}}catch(e){}
  try{var ov=window.vOff;if(typeof ov==='function')window.vOff=function(){userStop();return ov.apply(this,arguments)}}catch(e){}
  setInterval(function(){
    if(!ytOn())return;
    var s;try{s=yp.getPlayerState()}catch(e){return}
    if(s===1){want=true;keep(true);return}
    if(s===2&&want){
      /* jangan lawan pengguna yang menjeda lewat kontrol di dalam video YouTube */
      var ae=document.activeElement;
      if(!document.hidden&&ae&&ae.tagName==='IFRAME'&&Date.now()-lastUser>0&&document.hasFocus())return;
      try{yp.playVideo()}catch(e){}
    }
  },1000);
  /* v4.30: lanjutkan lewat EVENT, bukan hanya timer. Saat layar mati/di latar belakang, setInterval ditahan browser
     (bisa sampai 1x per menit), sedangkan callback status pemutar YouTube tetap datang. Jeda yang bukan dari pengguna
     (want masih true) dan terjadi saat halaman tersembunyi langsung dilanjutkan, dicoba beberapa kali. */
  function resumeHidden(){
    if(!want||!ytOn()||!document.hidden)return;
    [150,800,2500,6000].forEach(function(ms){setTimeout(function(){
      try{if(want&&document.hidden&&Date.now()-lastUser>1500&&yp.getPlayerState()===2)yp.playVideo()}catch(e){}
    },ms)});
  }
  try{var ovs=window.vSt;if(typeof ovs==='function')window.vSt=function(e){var r=ovs.apply(this,arguments);try{if(e&&e.data===2)resumeHidden()}catch(x){}return r}}catch(e){}
  document.addEventListener('visibilitychange',function(){if(document.hidden)resumeHidden()});
  addEventListener('pagehide',function(){resumeHidden()});
  ['pageshow','resume'].forEach(function(ev){document.addEventListener(ev,function(){
    try{if(want&&ytOn()&&Date.now()-lastUser>1500&&yp.getPlayerState()===2)yp.playVideo();if(want)keep(true)}catch(e){}
  })});
})();
}catch(e){console.error('[loopify] extra27.js',e)}

/* ==== extra28.js ==== */
try{
/* v4.26: fitur pemutaran.
   1) Transisi halus (fade in/out) juga untuk lagu YouTube, mengikuti pengaturan "transisi halus" yang sudah ada.
   2) Ingat posisi per lagu panjang (8 menit ke atas: mix, podcast, set DJ) dan lanjut otomatis.
   3) Tombol kecepatan membuka panel Kecepatan & Nada (geser 0.5x-2x, preset, opsi nada ikut berubah).
   Dimuat setelah extra27.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x28c{flex:1 1 auto;min-width:56px;padding:10px 0;border-radius:12px;border:0;background:var(--c);color:var(--tx,#fff);font-weight:700}'+
    '.x28c.on{background:var(--g,var(--p2));color:#fff}';
  document.head.appendChild(st);

  /* ---------- 1. fade in/out untuk lagu YouTube ---------- */
  var lastVol=100;
  setInterval(function(){
    try{
      if(typeof act==='undefined'||act!==yAct||!vPlaying())return;
      var d=yAct.duration,t=yAct.currentTime,v=1;
      if(cfg.fade&&isFinite(d)&&d>8)v=Math.max(.05,Math.min(1,t/2.5+.1,(d-t)/2.5));
      var n=Math.round(v*100);
      if(n!==lastVol){lastVol=n;yp.setVolume(n)}
    }catch(e){}
  },300);

  /* ---------- 2. ingat posisi per lagu panjang ---------- */
  var MIN=480,P=ls.get('pos28',{}),done=null,lastSave=0;
  function savePos(force){
    try{
      var k=Object.keys(P);
      if(k.length>60){k.sort(function(a,b){return P[a][1]-P[b][1]}).slice(0,k.length-60).forEach(function(x){delete P[x]})}
      ls.set('pos28',P);
    }catch(e){}
  }
  setInterval(function(){
    try{
      if(typeof cur==='undefined'||!cur||cur.radio||!act)return;
      var a=act,d=a.duration,t=a.currentTime;
      if(!isFinite(d)||d<MIN)return;
      if(a===yAct){
        var vd=yp.getVideoData&&yp.getVideoData();
        if(!vPlaying()&&done===cur.id)return;
        if(vd&&vd.video_id&&vd.video_id!==vidOf(cur))return;
      }
      if(done!==cur.id){
        if(a===yAct&&!vPlaying())return;
        done=cur.id;var s=P[cur.id];
        if(s&&s[0]>15&&s[0]<d-30&&t<5){a.currentTime=s[0];toast('Lanjut dari '+f2(s[0]))}
        return;
      }
      if(a.paused)return;
      if(t>d-20){delete P[cur.id];savePos();return}
      if(Date.now()-lastSave>5000){lastSave=Date.now();P[cur.id]=[Math.floor(t),Date.now()];savePos()}
    }catch(e){}
  },1000);
  function flush(){try{if(cur&&!cur.radio&&act&&isFinite(act.duration)&&act.duration>=MIN&&done===cur.id&&act.currentTime<act.duration-20){P[cur.id]=[Math.floor(act.currentTime),Date.now()];savePos()}}catch(e){}}
  addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});

  /* ---------- 3. panel Kecepatan & Nada ---------- */
  function pitchApply(){
    var keep=!cfg.pitchLink;
    [A,B].forEach(function(a){try{a.preservesPitch=keep;a.webkitPreservesPitch=keep;a.mozPreservesPitch=keep}catch(e){}});
  }
  pitchApply();
  function fmtR(v){return (Math.round(v*100)/100)+'x'}
  window.x28Rate=function(v){
    v=Math.max(.5,Math.min(2,Math.round(v*100)/100));rate=v;
    try{A.defaultPlaybackRate=B.defaultPlaybackRate=v;A.playbackRate=B.playbackRate=v}catch(e){}
    try{if(typeof yp!=='undefined'&&yp&&yp.setPlaybackRate)yp.setPlaybackRate(Math.max(.25,Math.min(2,v)))}catch(e){}
    cfg.rate=v;ls.set('cfg',cfg);
    var l=document.getElementById('x28v'),r=document.getElementById('x28r');
    if(l)l.textContent=fmtR(v);if(r&&+r.value!==v)r.value=v;
    [].forEach.call(document.querySelectorAll('.x28c'),function(b){b.classList.toggle('on',+b.dataset.v===v)});
  };
  window.x28Pitch=function(on){cfg.pitchLink=on?1:0;ls.set('cfg',cfg);pitchApply();toast(on?'Nada ikut berubah (khusus lagu file/radio)':'Nada tetap')};
  spd=function(){
    rbP=isPlO();clp();
    var pr=[.5,.75,1,1.25,1.5,1.75,2];
    sub(shd('Kecepatan & Nada')+
      '<div class="sec"><h3>Kecepatan: <span id="x28v">'+fmtR(rate)+'</span></h3></div>'+
      '<input type="range" id="x28r" min="0.5" max="2" step="0.05" value="'+rate+'" style="width:100%;accent-color:var(--p2)" oninput="x28Rate(+this.value)">'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0">'+pr.map(function(v){return '<button class="x28c'+(v===rate?' on':'')+'" data-v="'+v+'" onclick="x28Rate('+v+')">'+fmtR(v)+'</button>'}).join('')+'</div>'+
      '<label class="rw" style="gap:12px;cursor:pointer"><input type="checkbox" '+(cfg.pitchLink?'checked ':'')+'onchange="x28Pitch(this.checked)" style="width:20px;height:20px;accent-color:var(--p2)"><div><b>Nada ikut berubah</b><small>Seperti slowed / nightcore. Hanya untuk lagu file dan radio, video YouTube tidak bisa.</small></div></label>'+
      '<button class="btn g" style="margin-top:14px" onclick="x28Rate(1)">Kembali ke 1x</button>');
  };
})();
}catch(e){console.error('[loopify] extra28.js',e)}

/* ==== extra29.js ==== */
try{
/* v4.27: Library dan penemuan.
   1) Filter Library: Favorit, Baru (7 hari), Belum diputar, dan durasi (pendek / sedang / panjang), bisa digabung dengan pencarian dan urutan.
   2) Deteksi duplikat lagu di Library (judul+artis mirip atau ukuran file sama) + tombol Gabungkan; juga bersihkan duplikat di playlist.
   3) Playlist otomatis baru: Minggu Ini, Lama Tidak Diputar, Belum Pernah Diputar, Favorit Jarang Diputar.
   4) Tombol 🚫 di pemutar: "Jangan putar lagi" (disembunyikan dari mix/rekomendasi, dilewati saat lagu berikutnya, ada daftar untuk membatalkan).
   Dimuat setelah extra28.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x29t{display:flex;gap:8px;margin:10px 0 2px}.x29t .btn{flex:1;padding:10px 6px;font-size:13px}'+
    '.x29f{margin-top:8px}.x29b{font-size:16px!important}.x29g{margin:12px 0}.x29g .rw{cursor:default}';
  document.head.appendChild(st);
  var N=function(k,d){return ls.get(k,d)};
  var fil=N('f29','all');

  /* ---------- pelacak: kapan terakhir diputar ---------- */
  var LP=N('lp29',{}),lastId=null,lpT=0;
  setInterval(function(){
    try{
      if(!cur||cur.radio||cur.id===lastId)return;
      lastId=cur.id;LP[cur.id]=Date.now();
      var k=Object.keys(LP);
      if(k.length>400){k.sort(function(a,b){return LP[a]-LP[b]}).slice(0,k.length-400).forEach(function(x){delete LP[x]})}
      clearTimeout(lpT);lpT=setTimeout(function(){ls.set('lp29',LP)},1500);
    }catch(e){}
  },1000);
  addEventListener('pagehide',function(){try{ls.set('lp29',LP)}catch(e){}});

  /* ---------- daftar blokir ---------- */
  var BK=N('blk29',{});
  function bid(t){return t&&(t.vid?'y'+t.vid:t.id)}
  function isBlk(t){return !!(t&&(BK[t.id]||(t.vid&&BK['y'+t.vid])))}
  function saveBk(){ls.set('blk29',BK)}
  window.x29Blk=function(){
    if(!cur)return;
    var id=bid(cur);
    if(isBlk(cur)){delete BK[cur.id];delete BK[id];saveBk();toast('Lagu ini boleh diputar lagi')}
    else{BK[id]={t:cur.title,a:cur.artist};saveBk();toast('Tidak akan diputar lagi di mix dan rekomendasi');if(q.length>1)nxt(1)}
    rp();hideBlocked();
  };
  /* sembunyikan lagu terblokir dari daftar rekomendasi (kunci daftar di bawah). Library, favorit, playlist tetap utuh. */
  var HIDE=['dm','fy','sim','rc','rcm','rx','nw','tc','hv','am','ao','tr','sr','sv','al','ch','x24','x25p','x25n','x25d','x25o','x26al'];
  function hideBlocked(){
    try{
      if(!Object.keys(BK).length&&!document.querySelector('[data-x29h]'))return;
      [].forEach.call(document.querySelectorAll('[onclick^="P("]'),function(e){
        var m=/^P\('?([\w]+)'?,\s*(\d+)\)/.exec(e.getAttribute('onclick')||'');
        if(!m||HIDE.indexOf(m[1])<0)return;
        var t=lists[m[1]]&&lists[m[1]][+m[2]],h=!!(t&&isBlk(t));
        if(h){e.style.display='none';e.setAttribute('data-x29h','1')}else if(e.getAttribute('data-x29h')){e.style.display='';e.removeAttribute('data-x29h')}
      });
    }catch(e){}
  }
  var ot;try{new MutationObserver(function(){clearTimeout(ot);ot=setTimeout(hideBlocked,120)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  /* lompati lagu terblokir saat lanjut ke berikutnya */
  try{
    var _nxt=nxt;
    nxt=function(d){
      _nxt.apply(this,arguments);
      var g=0;
      while(cur&&isBlk(cur)&&q.length>1&&g++<q.length&&q.some(function(t){return !isBlk(t)}))_nxt.call(this,d||1);
    };
  }catch(e){}
  /* tombol 🚫 di baris aksi pemutar */
  try{
    var _rp=rp;
    rp=function(){
      _rp.apply(this,arguments);
      try{
        var a=document.querySelector('#pl .act');if(!a||!cur||a.querySelector('.x29b'))return;
        var b=document.createElement('button');b.className='x29b';b.title='Jangan putar lagi';b.textContent='🚫';
        b.style.color=isBlk(cur)?'#ff6b6b':'var(--mu)';b.setAttribute('onclick','x29Blk()');a.appendChild(b);
      }catch(e){}
    };
  }catch(e){}
  window.x29BlkList=function(){
    rbP=isPlO();clp();
    var k=Object.keys(BK),h=shd('Jangan Putar Lagi');
    h+=k.length?'<small style="display:block;margin:0 4px 10px;color:var(--mu)">Lagu ini disembunyikan dari mix dan rekomendasi, dan dilewati saat lagu berikutnya.</small>'+
      k.map(function(id){var v=BK[id]||{};return'<div class="rw" style="cursor:default"><div><b>'+esc(v.t||id)+'</b><small>'+esc(v.a||'')+'</small></div><button class="ib" style="color:var(--mu);width:auto;padding:0 12px" onclick="x29Un(\''+esc(id)+'\')">Batalkan</button></div>'}).join('')
      :'<div class="em">Belum ada. Ketuk 🚫 di pemutar untuk menandai lagu.</div>';
    sub(h);
  };
  window.x29Un=function(id){delete BK[id];saveBk();hideBlocked();x29BlkList()};

  /* ---------- durasi (dibaca sekali dari file, disimpan) ---------- */
  var DU=N('dur29',{});
  function readDurs(list,done){
    var todo=list.filter(function(t){return t.blob&&DU[t.id]==null}),n=todo.length,i=0,fin=0;
    if(!n){done();return}
    toast('Membaca durasi '+n+' lagu…');
    function nextOne(){
      if(i>=n){if(++fin===3){ls.set('dur29',DU);done()}return}
      var t=todo[i++],a=new Audio(),over=false;
      function end(v){if(over)return;over=true;DU[t.id]=v;try{a.removeAttribute('src');a.load()}catch(e){}nextOne()}
      a.preload='metadata';a.onloadedmetadata=function(){end(isFinite(a.duration)?Math.round(a.duration):0)};a.onerror=function(){end(0)};
      setTimeout(function(){end(0)},5000);
      try{a.src=urlOf(t)}catch(e){end(0)}
    }
    nextOne();nextOne();nextOne();
  }

  /* ---------- 1. filter Library ---------- */
  var FIL=[['all','Semua'],['fav','♥ Favorit'],['new','Baru (7 hari)'],['unp','Belum diputar'],['s','< 3 mnt'],['m','3–6 mnt'],['l','> 6 mnt']];
  function plays(t){var v=stt&&stt.pl&&stt.pl[t.id];return v&&typeof v=='object'?(+v.c||+v.s||0):+v||0}
  function passes(t){
    switch(fil){
      case'fav':return isF(t);
      case'new':return Date.now()-(t.added||0)<7*864e5;
      case'unp':return !stt.pl||!stt.pl[t.id];
      case's':return DU[t.id]>0&&DU[t.id]<180;
      case'm':return DU[t.id]>=180&&DU[t.id]<=360;
      case'l':return DU[t.id]>360;
    }
    return true;
  }
  try{var _sgList=sgList;sgList=function(){var a=_sgList.apply(this,arguments);return fil==='all'?a:a.filter(passes)}}catch(e){}
  window.x29F=function(k){
    fil=k;ls.set('f29',k);
    if(['s','m','l'].indexOf(k)>=0){readDurs(songs,function(){go(pg)})}else go(pg);
  };
  try{
    var _lsBar=lsBar;
    lsBar=function(){
      var base=_lsBar.apply(this,arguments);
      var nb=Object.keys(BK).length;
      return base+'<div class="chips x29f">'+FIL.map(function(x){return'<span class="chip '+(fil===x[0]?'a':'')+'" onclick="x29F(\''+x[0]+'\')">'+x[1]+'</span>'}).join('')+'</div>'+
        '<div class="x29t"><button class="btn g" onclick="x29Dup()">🔍 Cari duplikat</button><button class="btn g" onclick="x29BlkList()">🚫 Diblokir'+(nb?' ('+nb+')':'')+'</button></div>';
    };
  }catch(e){}

  /* ---------- 2. duplikat ---------- */
  var GEN=/^(lagu saya|link kustom|tidak diketahui|unknown( artist)?|various artists|youtube|)$/i;
  function norm(s){
    return String(s||'').toLowerCase().replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyrics?|lirik|video|music|audio|mv|hd|hq|remastered|remaster)\b/g,' ')
      .replace(/\b(feat|ft|featuring)\b.*$/,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  }
  var GR=[];
  function dupGroups(){
    var L=songs.slice(),par=L.map(function(_,i){return i});
    function f(x){while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x}
    function u(a,b){a=f(a);b=f(b);if(a!==b)par[b]=a}
    var tt={},sz={};
    L.forEach(function(t,i){
      var k=norm(t.title);
      if(k.length>=2){(tt[k]=tt[k]||[]).push(i)}
      if(t.blob&&t.blob.size>100000){(sz[t.blob.size]=sz[t.blob.size]||[]).push(i)}
    });
    Object.keys(tt).forEach(function(k){
      var b=tt[k];
      for(var x=0;x<b.length;x++)for(var y=x+1;y<b.length;y++){
        var A=norm(L[b[x]].artist),B=norm(L[b[y]].artist);
        if(A===B||GEN.test(A)||GEN.test(B))u(b[x],b[y]);
      }
    });
    Object.keys(sz).forEach(function(k){var b=sz[k];for(var x=1;x<b.length;x++)u(b[0],b[x])});
    var m={};L.forEach(function(t,i){var r=f(i);(m[r]=m[r]||[]).push(t)});
    return Object.keys(m).map(function(r){return m[r]}).filter(function(g){return g.length>1}).map(function(g){
      var keep=g.filter(function(t){return cur&&cur.id===t.id})[0]||g.slice().sort(function(a,b){return (b.blob?b.blob.size:0)-(a.blob?a.blob.size:0)||(a.added||0)-(b.added||0)})[0];
      return{items:g,keep:keep.id};
    });
  }
  function plDups(){
    var n=0,p=0;
    pls.forEach(function(pl){var s={},c=0;(pl.tr||[]).forEach(function(x){if(s[x.id])c++;else s[x.id]=1});if(c){n+=c;p++}});
    return{n:n,p:p};
  }
  function mb(t){return t.blob?(t.blob.size/1048576).toFixed(1)+' MB':''}
  window.x29Dup=function(){
    rbP=isPlO();clp();GR=dupGroups();
    var pd=plDups(),h=shd('Duplikat Lagu');
    if(!GR.length&&!pd.n)h+='<div class="em">Tidak ada duplikat ditemukan.</div>';
    else{
      if(GR.length)h+='<button class="btn" onclick="x29MergeAll()">Gabungkan semua ('+GR.length+' grup)</button><small style="display:block;margin:8px 4px 4px;color:var(--mu)">Yang ukurannya terbesar (biasanya kualitas terbaik) dipertahankan. Favorit, playlist, riwayat, dan statistik dipindah ke lagu itu.</small>';
      GR.forEach(function(g,gi){
        h+='<div class="pcard x29g"><small>Grup '+(gi+1)+' · '+g.items.length+' file</small>'+g.items.map(function(t){
          return'<div class="rw"><img src="'+esc(cov(t))+'" alt=""><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+' · '+mb(t)+' · '+new Date(t.added||0).toLocaleDateString('id-ID')+'</small></div>'+(t.id===g.keep?'<span class="ph" style="color:var(--p2)">✔ dipertahankan</span>':'<span class="ph" style="color:var(--mu)">dihapus</span>')+'</div>';
        }).join('')+'<button class="btn g" style="margin-top:8px" onclick="x29Merge('+gi+')">Gabungkan grup ini</button></div>';
      });
      if(pd.n)h+='<div class="sec"><h3>Duplikat di playlist</h3></div><button class="btn g" onclick="x29PlClean()">Bersihkan '+pd.n+' lagu ganda di '+pd.p+' playlist</button>';
    }
    sub(h);
  };
  function repl(arr,from,to){
    var seen={};
    return arr.map(function(x){return x&&from[x.id]?{id:to,loc:1}:x}).filter(function(x){if(!x)return false;if(seen[x.id])return false;seen[x.id]=1;return true});
  }
  function mergeGroup(g){
    var keep=g.keep,from={},keepT=songs.filter(function(t){return t.id===keep})[0];
    g.items.forEach(function(t){if(t.id!==keep)from[t.id]=1});
    var ids=Object.keys(from);if(!ids.length||!keepT)return 0;
    favs=repl(favs,from,keep);pls.forEach(function(p){p.tr=repl(p.tr||[],from,keep)});hist=repl(hist,from,keep);
    ls.set('favs',favs);ls.set('pls',pls);ls.set('hist',hist);
    try{var l=ls.get('last',null);if(l&&l.t&&from[l.t.id]){l.t={id:keep,loc:1};ls.set('last',l)}}catch(e){}
    try{
      stt.pl=stt.pl||{};
      ids.forEach(function(id){
        var o=stt.pl[id];if(o==null)return;var k=stt.pl[keep];
        if(k==null)stt.pl[keep]=o;
        else if(typeof k=='object')k.s=(+k.s||0)+(typeof o=='object'?+o.s||0:+o||0),k.c=(+k.c||0)+(typeof o=='object'?+o.c||0:0);
        else stt.pl[keep]=typeof o=='object'?{s:(+k||0)+(+o.s||0),c:+o.c||0}:(+k||0)+(+o||0);
        delete stt.pl[id];
      });
      ls.set('stt',stt);
    }catch(e){}
    q=q.map(function(t){return t&&from[t.id]?keepT:t});
    ids.forEach(function(id){
      try{tx('readwrite',function(o){return o.delete(id)}).catch(function(){})}catch(e){}
      try{if(urls[id]){URL.revokeObjectURL(urls[id]);delete urls[id]}}catch(e){}
      delete LP[id];delete DU[id];delete BK[id];
    });
    songs=songs.filter(function(t){return !from[t.id]});
    ls.set('lp29',LP);ls.set('dur29',DU);saveBk();
    return ids.length;
  }
  window.x29Merge=function(i){var g=GR[i];if(!g)return;var n=mergeGroup(g);toast(n+' file ganda dihapus');x29Dup()};
  window.x29MergeAll=function(){var n=0;GR.forEach(function(g){n+=mergeGroup(g)});toast(n+' file ganda dihapus');x29Dup()};
  window.x29PlClean=function(){
    var n=0;pls.forEach(function(p){var s={},o=[];(p.tr||[]).forEach(function(x){if(s[x.id]){n++}else{s[x.id]=1;o.push(x)}});p.tr=o});
    ls.set('pls',pls);toast(n+' lagu ganda dibersihkan');x29Dup();
  };

  /* ---------- 3. playlist otomatis baru ---------- */
  var DAY=864e5;
  SMN.wk=['📅','Minggu Ini'];SMN.old=['🕰','Lama Tidak Diputar'];SMN.unp=['🌱','Belum Pernah Diputar'];SMN.rare=['💎','Favorit Jarang Diputar'];
  try{
    var _smGet=smGet;
    smGet=function(k){
      if(['wk','old','unp','rare'].indexOf(k)<0)return _smGet.apply(this,arguments);
      var m=known(),out=[];
      function T(id){var t=m.get(id);return t&&!isBlk(t)?t:null}
      if(k==='wk'){
        out=Object.keys(LP).filter(function(id){return Date.now()-LP[id]<7*DAY}).sort(function(a,b){return LP[b]-LP[a]}).map(T).filter(Boolean);
      }else if(k==='old'){
        out=Object.keys(LP).filter(function(id){return Date.now()-LP[id]>14*DAY}).sort(function(a,b){return LP[a]-LP[b]}).map(T).filter(Boolean).slice(0,50);
      }else if(k==='unp'){
        out=sg().filter(function(t){return !stt.pl||!stt.pl[t.id]}).filter(function(t){return !isBlk(t)}).slice(0,100);
      }else{
        out=favs.map(rs).filter(Boolean).filter(function(t){return !isBlk(t)}).sort(function(a,b){return plays(a)-plays(b)}).slice(0,30);
      }
      return out;
    };
  }catch(e){}
})();
}catch(e){console.error('[loopify] extra29.js',e)}

/* ==== extra30.js ==== */
try{
/* v4.28: tampilan dan kenyamanan.
   1) Ketuk dua kali di layar pemutar: kiri = mundur 10 dtk, kanan = maju 10 dtk.
   2) Cuplikan 30 detik: tahan lama sebuah lagu di daftar untuk mendengar sebelum memutar.
   3) Mode mobil: layar penuh dengan tombol besar (tombol 🚗 di pemutar atau di Pengaturan).
   Dimuat setelah extra29.js. */
(function(){
  var st=document.createElement('style');
  st.textContent=
    '.rw,.cd{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}'+
    '.x30bb{position:fixed;left:50%;top:40%;transform:translateX(-50%);z-index:99998;background:rgba(0,0,0,.72);color:#fff;padding:12px 18px;border-radius:30px;font-weight:700;font-size:14px;pointer-events:none;transition:opacity .5s}'+
    '#x30pvb{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:99997;background:var(--ov,#0a0e24);color:var(--tx);border:1px solid var(--b);border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}'+
    '#x30pvb b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#x30pvb small{color:var(--mu)}#x30pvb div{flex:1;min-width:0}#x30pvb button{border:0;background:var(--g,var(--p));color:#fff;border-radius:12px;padding:8px 12px;font-weight:700}'+
    '#x30car{position:fixed;inset:0;z-index:99999;background:#000;color:#fff;display:none;flex-direction:column;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 14px) 20px calc(env(safe-area-inset-bottom,0px) + 18px);gap:10px}'+
    '#x30car.on{display:flex}#x30car .x30x{align-self:flex-end;border:0;background:#1c1c1e;color:#fff;border-radius:14px;padding:10px 16px;font-size:15px;font-weight:700}'+
    '#x30car .x30clk{font-size:15px;color:#9aa;letter-spacing:.06em}'+
    '#x30car .x30mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:0;width:100%}'+
    '#x30car img{width:min(46vh,70vw);height:min(46vh,70vw);border-radius:24px;object-fit:cover;box-shadow:0 10px 40px rgba(0,0,0,.6)}'+
    '#x30car .x30t{font-size:clamp(22px,6vw,34px);font-weight:800;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
    '#x30car .x30a{font-size:clamp(15px,4.2vw,22px);color:#aab;text-align:center}'+
    '#x30car input[type=range]{width:100%;height:38px}#x30car .x30tm{display:flex;justify-content:space-between;width:100%;font-size:14px;color:#aab;margin-top:-6px}'+
    '#x30car .x30b{display:flex;gap:18px;align-items:center;justify-content:center;width:100%}'+
    '#x30car .x30b button{border:0;background:#1c1c1e;color:#fff;border-radius:50%;width:min(24vw,110px);height:min(24vw,110px);font-size:min(10vw,44px);display:flex;align-items:center;justify-content:center}'+
    '#x30car .x30b button.m{width:min(34vw,150px);height:min(34vw,150px);font-size:min(14vw,60px);background:var(--g,var(--p))}'+
    '@media (orientation:landscape){#x30car .x30mid{flex-direction:row;gap:28px}#x30car img{width:min(52vh,30vw);height:min(52vh,30vw)}}';
  document.head.appendChild(st);

  /* ---------- pengaturan ---------- */
  window.x30Tg=function(k){cfg[k]=cfg[k]===false?true:false;ls.set('cfg',cfg);setR()};
  function settingsHtml(){
    var on=function(k){return cfg[k]!==false};
    var tg=function(k,l,s){return'<div class="ft" onclick="x30Tg(\''+k+'\')"><div>'+l+'<br><small>'+s+'</small></div><i class="sw '+(on(k)?'on':'')+'"></i></div>'};
    return'<div class="x30row"><div class="sec"><h3>Tampilan &amp; Kenyamanan</h3></div>'+
      tg('dtp','Ketuk dua kali di pemutar','Kiri mundur 10 dtk, kanan maju 10 dtk')+
      tg('prv','Cuplikan saat tahan lagu','Tahan lama lagu di daftar untuk dengar 30 detik')+
      '<div class="ft" onclick="x30Car()"><span>🚗</span><div>Mode mobil<br><small>Layar penuh dengan tombol besar</small></div></div></div>';
  }
  try{
    var _setR=setR;
    setR=function(){
      _setR.apply(this,arguments);
      var sp=document.getElementById('sp');if(!sp||sp.querySelector('.x30row'))return;
      var tgt=null;sp.querySelectorAll('.sec h3').forEach(function(h){if(h.textContent==='Lainnya')tgt=h.parentNode});
      if(tgt)tgt.insertAdjacentHTML('beforebegin',settingsHtml());
    };
  }catch(e){}

  /* ---------- ketuk dua kali untuk seek ---------- */
  var pl=document.getElementById('pl'),tl=0,tx0=0,ty0=0,sx=0,sy=0;
  function bubble(txt,left){
    var d=document.createElement('div');d.className='x30bb';d.textContent=txt;d.style.left=left?'22%':'78%';document.body.appendChild(d);
    setTimeout(function(){d.style.opacity='0'},450);setTimeout(function(){d.remove()},1000);
  }
  function seek(d){
    var a=act;if(!a)return;var du=a.duration;if(!isFinite(du)||du<=0)return;
    try{a.currentTime=Math.max(0,Math.min(du-1,a.currentTime+d))}catch(e){}
    bubble(d<0?'⏪ 10 dtk':'10 dtk ⏩',d<0);
  }
  if(pl){
    pl.addEventListener('touchstart',function(e){var t=e.touches[0];sx=t.clientX;sy=t.clientY},{passive:true});
    pl.addEventListener('touchend',function(e){
      try{
        if(cfg.dtp===false||!cur)return;
        if(e.target.closest&&e.target.closest('input,textarea,button,a,select,.lyr,.act,.ctl'))return;
        var t=e.changedTouches[0],now=Date.now();
        if(Math.abs(t.clientX-sx)>15||Math.abs(t.clientY-sy)>15){tl=0;return}
        if(now-tl<320&&Math.abs(t.clientX-tx0)<50&&Math.abs(t.clientY-ty0)<50){
          tl=0;var w=pl.clientWidth||innerWidth;
          if(t.clientX<w*.4)seek(-10);else if(t.clientX>w*.6)seek(10);
        }else{tl=now;tx0=t.clientX;ty0=t.clientY}
      }catch(x){}
    },{passive:true});
  }

  /* ---------- cuplikan 30 detik ---------- */
  var pvAud=null,pvYp=null,pvTm=0,pvFd=0,pvWas=false,pvOn=false,pressTm=0,px=0,py=0,swallow=0;
  function pvBanner(t){
    var b=document.getElementById('x30pvb');if(b)b.remove();
    b=document.createElement('div');b.id='x30pvb';
    b.innerHTML='<div><small>Cuplikan 30 detik</small><b></b></div><button>Berhenti</button>';
    b.querySelector('b').textContent=t.title||'';b.querySelector('button').onclick=function(){x30PvStop()};
    document.body.appendChild(b);
  }
  window.x30PvStop=function(noResume){
    if(noResume===true)pvWas=false;
    clearTimeout(pvTm);clearInterval(pvFd);
    if(pvAud){try{pvAud.pause();pvAud.removeAttribute('src');pvAud.load()}catch(e){}pvAud=null}
    if(pvYp){try{pvYp.destroy()}catch(e){}pvYp=null;var d=document.getElementById('x30pvy');if(d)d.remove()}
    var b=document.getElementById('x30pvb');if(b)b.remove();
    var was=pvWas;pvWas=false;
    if(pvOn&&was){try{if(act&&act.paused)act.play()}catch(e){}}
    pvOn=false;
  };
  function startPreview(t){
    if(t.radio){toast('Siaran radio tidak punya cuplikan');return}
    var url=t.loc?urlOf(t):t.url,isY=!!t.yt;
    if(!isY&&!url){toast('Cuplikan belum tersedia untuk lagu ini');return}
    x30PvStop(true);
    pvOn=true;pvWas=!!(act&&!act.paused);
    if(pvWas){try{act.pause()}catch(e){}}
    pvBanner(t);
    pvTm=setTimeout(function(){x30PvStop()},31000);
    if(isY){
      var id=vidOf(t);if(!id){x30PvStop();return}
      ytLoad(function(){
        if(!pvOn)return;
        var d=document.createElement('div');d.id='x30pvy';d.style.cssText='position:fixed;right:0;bottom:0;width:2px;height:2px;opacity:.01;pointer-events:none';
        var inner=document.createElement('div');d.appendChild(inner);document.body.appendChild(d);
        try{
          pvYp=new YT.Player(inner,{videoId:id,playerVars:{autoplay:1,playsinline:1,controls:0,start:30},events:{
            onReady:function(e){try{var du=e.target.getDuration();if(du>0)e.target.seekTo(Math.min(45,du*.3),true);e.target.playVideo()}catch(x){}},
            onError:function(){toast('Cuplikan tidak bisa diputar');x30PvStop()}}});
        }catch(e){x30PvStop()}
      });
      return;
    }
    var a=new Audio();pvAud=a;a.volume=0;a.preload='auto';
    a.onloadedmetadata=function(){
      try{var d=a.duration;if(isFinite(d)&&d>0)a.currentTime=Math.min(45,d*.3)}catch(e){}
      var p=a.play();if(p&&p.catch)p.catch(function(){toast('Cuplikan gagal diputar');x30PvStop()});
      var v=0;pvFd=setInterval(function(){v=Math.min(1,v+.1);try{a.volume=v}catch(e){}if(v>=1)clearInterval(pvFd)},100);
    };
    a.onerror=function(){toast('Cuplikan gagal dimuat');x30PvStop()};
    a.onended=function(){x30PvStop()};
    a.src=url;
  }
  document.addEventListener('pointerdown',function(e){
    try{
      if(cfg.prv===false)return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      var r=e.target.closest&&e.target.closest('[onclick^="P("]');if(!r||e.target.closest('button'))return;
      var m=/^P\('?(\w+)'?,\s*(\d+)\)/.exec(r.getAttribute('onclick')||'');if(!m)return;
      var t=lists[m[1]]&&lists[m[1]][+m[2]];if(!t)return;
      px=e.clientX;py=e.clientY;clearTimeout(pressTm);
      pressTm=setTimeout(function(){pressTm=0;swallow=Date.now();try{navigator.vibrate&&navigator.vibrate(18)}catch(x){}startPreview(t)},520);
    }catch(x){}
  },true);
  document.addEventListener('pointermove',function(e){if(pressTm&&(Math.abs(e.clientX-px)>10||Math.abs(e.clientY-py)>10)){clearTimeout(pressTm);pressTm=0}},true);
  ['pointerup','pointercancel'].forEach(function(n){document.addEventListener(n,function(){if(pressTm){clearTimeout(pressTm);pressTm=0}},true)});
  document.addEventListener('click',function(e){if(Date.now()-swallow<800){swallow=0;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('contextmenu',function(e){if(pressTm||Date.now()-swallow<1200){if(e.target.closest&&e.target.closest('.rw,.cd'))e.preventDefault()}},true);
  /* memutar lagu sungguhan menghentikan cuplikan (tanpa melanjutkan lagu lama) */
  try{var _play=play;play=function(){if(pvOn)x30PvStop(true);return _play.apply(this,arguments)}}catch(e){}
  try{var _playV=playV;playV=function(){if(pvOn)x30PvStop(true);return _playV.apply(this,arguments)}}catch(e){}

  /* ---------- mode mobil ---------- */
  var car=null,carIv=0,wl=null;
  function buildCar(){
    if(car)return car;
    car=document.createElement('div');car.id='x30car';
    car.innerHTML='<button class="x30x" onclick="x30CarOff()">✕ Keluar</button><div class="x30clk" id="x30clk"></div>'+
      '<div class="x30mid"><img id="x30i" alt=""><div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px"><div class="x30t" id="x30t">Belum ada lagu</div><div class="x30a" id="x30a"></div>'+
      '<input type="range" id="x30s" min="0" max="1000" value="0"><div class="x30tm"><span id="x30c">0:00</span><span id="x30d">0:00</span></div></div></div>'+
      '<div class="x30b"><button onclick="nxt(-1)" aria-label="Sebelumnya">⏮</button><button class="m" id="x30p" onclick="toggle()" aria-label="Putar/jeda">▶</button><button onclick="nxt(1)" aria-label="Berikutnya">⏭</button></div>';
    document.body.appendChild(car);
    car.querySelector('#x30s').addEventListener('input',function(){try{var a=act;if(a&&isFinite(a.duration)&&a.duration>0)a.currentTime=this.value/1000*a.duration}catch(e){}});
    return car;
  }
  function carTick(){
    try{
      var t=cur,a=act;
      document.getElementById('x30t').textContent=t?(ct?ct(t.title):t.title):'Belum ada lagu';
      document.getElementById('x30a').textContent=t?(t.artist||''):'Ketuk ▶ untuk mulai';
      var im=document.getElementById('x30i');if(t){var s=cov(t);if(im.getAttribute('src')!==s)im.src=s;im.style.display=''}else im.style.display='none';
      document.getElementById('x30p').textContent=(a&&!a.paused&&t)?'⏸':'▶';
      var d=a&&a.duration,c=a?a.currentTime:0,sl=document.getElementById('x30s');
      if(isFinite(d)&&d>0){if(document.activeElement!==sl)sl.value=c/d*1000;document.getElementById('x30c').textContent=f2(c);document.getElementById('x30d').textContent=f2(d);sl.disabled=false}
      else{sl.value=0;sl.disabled=true;document.getElementById('x30c').textContent=t&&t.radio?'LIVE':'0:00';document.getElementById('x30d').textContent=''}
      document.getElementById('x30clk').textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    }catch(e){}
  }
  function lock(){try{if(navigator.wakeLock&&car&&car.classList.contains('on'))navigator.wakeLock.request('screen').then(function(w){wl=w}).catch(function(){})}catch(e){}}
  window.x30Car=function(){
    buildCar();try{clp();csp0()}catch(e){}
    car.classList.add('on');carTick();clearInterval(carIv);carIv=setInterval(carTick,400);lock();
  };
  window.x30CarOff=function(){if(car)car.classList.remove('on');clearInterval(carIv);try{wl&&wl.release&&wl.release()}catch(e){}wl=null};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)lock()});
  /* tombol 🚗 di baris aksi pemutar */
  try{
    var _rp=rp;
    rp=function(){
      _rp.apply(this,arguments);
      try{
        var a=document.querySelector('#pl .act');if(!a||a.querySelector('.x30cb'))return;
        var b=document.createElement('button');b.className='x30cb';b.title='Mode mobil';b.textContent='🚗';b.style.fontSize='16px';b.setAttribute('onclick','x30Car()');a.appendChild(b);
      }catch(e){}
    };
  }catch(e){}
})();
}catch(e){console.error('[loopify] extra30.js',e)}

/* ==== extra31.js ==== */
try{
/* extra31.js - JioSaavn: hasil pencarian + lirik cadangan (v4.30)
   Butuh /api/jiosaavn (api/jiosaavn.js) dan env JIOSAAVN_API_URL di Vercel.
   1) Pencarian: hasil JioSaavn tampil bersama hasil YouTube. Lagunya ditandai rec:1 tanpa url,
      jadi saat diputar, aplikasi otomatis mencari versi YouTube-nya (resolveRec di app.js).
   2) Lirik: lrclib tetap dicoba lebih dulu (ada lirik berjalan). Kalau kosong, baru ambil dari JioSaavn (teks biasa).
   Kalau JIOSAAVN_API_URL belum diisi atau backend mati, semuanya diam-diam dilewati dan aplikasi jalan seperti biasa. */
(function () {
  /* ---------- 1. Pencarian ---------- */
  var _srch = srch;
  srch = async function (s) {
    if (cfg.src === 'radio') return _srch(s);   // sumber Radio tetap seperti semula
    try {
      var r = await fetch('/api/jiosaavn?action=search&q=' + encodeURIComponent(s));
      if (!r.ok) return [];                     // 501 (belum diatur) atau 502 (backend mati): lewati saja
      var a = await r.json();
      if (!Array.isArray(a)) return [];
      return a.slice(0, 15).map(function (x) {
        return {
          id: 'j' + x.id, jid: x.id, jio: 1, rec: 1,
          title: x.title, artist: x.artist || 'Tidak diketahui', img: x.img || '',
          h: hh(x.title)
        };
      });
    } catch (e) { return []; }
  };

  /* ---------- 2. Lirik cadangan ---------- */
  var JT = {};
  var _fl = fetchLy;
  fetchLy = async function (t) {
    try { await _fl(t); } catch (e) {}
    try {
      if (!t || t.radio || t.loc || JT[t.id]) return;
      if (lyS[t.id] !== 'none') return;         // lrclib berhasil, atau masih jalan: tidak perlu cadangan
      JT[t.id] = 1;
      lyS[t.id] = 'load';
      if (cur && cur.id == t.id && typeof rp === 'function') rp();

      var cl = function (x) { return String(x || '').replace(/\(.*?\)|\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim(); };
      var generic = /^(Lagu Saya|Link kustom|YouTube|Tidak diketahui|Radio)$/i;
      var title = cl(t.title), artist = generic.test(t.artist || '') ? '' : cl(t.artist);
      if (t.yt && !t.jio) {                      // judul video mentah: buang kata tambahan, pisahkan "Artis - Judul"
        title = title.replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip)\b/ig, ' ').replace(/\s+/g, ' ').trim();
        var m = title.split(/\s[-\u2013\u2014|]\s/);
        if (m.length > 1) { artist = m[0].trim(); title = m.slice(1).join(' ').trim(); }
      }
      var url = '/api/jiosaavn?action=lyrics' + (t.jid ? '&id=' + encodeURIComponent(t.jid)
        : '&t=' + encodeURIComponent(title) + '&a=' + encodeURIComponent(artist));
      var txt = '';
      if (title || t.jid) {
        var r = await fetch(url);
        if (r.ok) { var j = await r.json(); txt = String((j && j.lyrics) || '').trim(); }
      }
      if (txt) {
        lyc[t.id] = txt;
        var k = Object.keys(lyc);
        if (k.length > 150) k.slice(0, k.length - 150).forEach(function (x) { delete lyc[x]; });
        ls.set('ly', lyc);
        lyS[t.id] = 'ok';
      } else lyS[t.id] = 'none';
      if (cur && cur.id == t.id && typeof rp === 'function' && ((typeof pm !== 'undefined' && pm) || (typeof krOn === 'function' && krOn()))) rp();
    } catch (e) {
      try { if (lyS[t.id] === 'load') lyS[t.id] = 'none'; } catch (_) {}
    }
  };
})();
}catch(e){console.error('[loopify] extra31.js',e)}

/* ==== extra32.js ==== */
try{
/* v4.32: Rekap Loopify (kartu bulanan), Streak & Lencana, Kartu Lirik untuk dibagikan.
   Data baru: ma_rc32 (detik per lagu/artis bulan ini, detik larut malam). Streak dan menit harian dari ma_wk (extra3). Dimuat setelah extra31.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x32b{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:12px 0}.x32b div{padding:12px;border-radius:16px;background:var(--c);border:1px solid var(--b);text-align:center;font-size:12px;color:var(--mu)}.x32b div.off{opacity:.38;filter:grayscale(1)}.x32b i{display:block;font-style:normal;font-size:30px;margin-bottom:4px}.x32b b{display:block;color:var(--tx);font-size:13px}.x32i{width:100%;border-radius:18px;display:block;margin:10px 0}.x32k{position:absolute;right:16px;bottom:96px;z-index:5;padding:8px 14px;font-size:13px}';
  document.head.appendChild(st);
  var MN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function mk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function dk(d){return mk(d)+'-'+String(d.getDate()).padStart(2,'0')}
  function fmt(s){var h=Math.floor(s/3600),m=Math.round(s%3600/60);if(m==60){h++;m=0}return h?h+' j '+m+' mnt':m+' mnt'}
  var RC=ls.get('rc32',null);
  if(!RC||RC.m!==mk())RC={m:mk(),pl:{},ar:{},night:0,tot:0};
  var rcT=0;
  function saveRc(){ls.set('rc32',RC)}
  /* pelacak bulanan: bungkus stat() (selisih stt.tot, sama seperti extra3) */
  var _stat=stat;
  stat=function(a){var b=+stt.tot||0;_stat(a);var d=(+stt.tot||0)-b;
    try{if(d>0&&d<5&&cur){
      if(RC.m!==mk())RC={m:mk(),pl:{},ar:{},night:0,tot:0};
      var e=RC.pl[cur.id]||(RC.pl[cur.id]={s:0,t:cur.title,a:cur.artist});e.s+=d;
      RC.ar[cur.artist]=(RC.ar[cur.artist]||0)+d;RC.tot+=d;
      var h=new Date().getHours();if(h>=22||h<4)RC.night+=d;
      if(Date.now()-rcT>15000){rcT=Date.now();saveRc()}
    }}catch(e){}};
  addEventListener('pagehide',saveRc);document.addEventListener('visibilitychange',saveRc);

  function top(o,n,f){return Object.keys(o).map(function(k){return f(k,o[k])}).sort(function(a,b){return b.s-a.s}).slice(0,n)}
  function streak(){var wk=ls.get('wk',{}),n=0,d=new Date();if((wk[dk(d)]||0)<30)d=new Date(d.getTime()-864e5);
    while((wk[dk(d)]||0)>=30){n++;d=new Date(d.getTime()-864e5)}return n}
  function best(){var wk=ls.get('wk',{}),ks=Object.keys(wk).sort(),b=0,c=0,p=null;
    ks.forEach(function(k){if(wk[k]<30){c=0;p=null;return}var t=new Date(k+'T00:00:00').getTime();c=(p&&Math.round((t-p)/864e5)==1)?c+1:1;p=t;if(c>b)b=c});return b}
  function badges(){var s=Math.max(streak(),best()),tot=+stt.tot||0,np=Object.keys(stt.pl||{}).length,na=Object.keys(stt.ar||{}).length;
    return [['🔥','Streak 3 hari',s>=3],['⚡','Streak 7 hari',s>=7],['👑','Streak 30 hari',s>=30],['🎧','10 jam mendengar',tot>=36000],['🏆','50 jam mendengar',tot>=180000],
      ['🎵','100 lagu berbeda',np>=100],['🧭','Penjelajah (10 artis)',na>=10],['🌙','Pendengar Malam',(RC.night||0)>=3600]]}
  window.goStreak32=function(){rbP=0;var s=streak(),b=best(),h=badges(),n=h.filter(function(x){return x[2]}).length;
    sub(shd('Streak & Lencana')+'<div class="pcard" style="text-align:center"><h1 style="font-size:46px">🔥 '+s+'</h1><small>hari berturut-turut (min. 30 detik per hari)<br>Rekor terbaik: '+Math.max(b,s)+' hari</small></div>'+
      '<div class="sec"><h3>Lencana ('+n+'/'+h.length+')</h3></div><div class="x32b">'+h.map(function(x){return '<div class="'+(x[2]?'':'off')+'"><i>'+x[0]+'</i><b>'+esc(x[1])+'</b>'+(x[2]?'Terbuka':'Terkunci')+'</div>'}).join('')+'</div>')};

  /* ---------- gambar kanvas + bagikan ---------- */
  function wrap(c,t,x,y,w,lh,max){var ws=String(t).split(' '),l='',n=0;for(var i=0;i<ws.length;i++){var k=l?l+' '+ws[i]:ws[i];if(c.measureText(k).width>w&&l){c.fillText(l,x,y);y+=lh;l=ws[i];if(++n>=max-1&&i<ws.length-1){c.fillText(l+'…',x,y);return y+lh}}else l=k}c.fillText(l,x,y);return y+lh}
  function base(W,H){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),r=getComputedStyle(document.documentElement),g=c.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#060928');g.addColorStop(.55,(r.getPropertyValue('--p')||'#6d5dfc').trim());g.addColorStop(1,(r.getPropertyValue('--p2')||'#9a8cff').trim());c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(6,9,40,.45)';c.fillRect(0,0,W,H);return [cv,c]}
  function show(cv,title,name){var u=cv.toDataURL('image/png');
    sub(shd(title)+'<img class="x32i" src="'+u+'"><button class="btn" id="x32s">Bagikan gambar</button>');
    var b=document.getElementById('x32s');b.onclick=function(){cv.toBlob(function(bl){var f=new File([bl],name,{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Loopify'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=name;document.body.appendChild(a);a.click();a.remove()}},'image/png')}}
  function ready(f){try{document.fonts.load('700 40px Sora').then(f,f)}catch(e){f()}}

  window.rekap32=function(){ready(function(){
    var W=1080,H=1350,o=base(W,H),cv=o[0],c=o[1],now=new Date(),ar=top(RC.ar,3,function(k,v){return{n:k,s:v}}),pl=top(RC.pl,3,function(k,v){return{n:v.t,a:v.a,s:v.s}});
    var F='Sora, system-ui, sans-serif';c.fillStyle='#fff';c.textBaseline='alphabetic';
    c.font='700 40px '+F;c.fillText('REKAP LOOPIFY',80,120);c.font='400 34px '+F;c.globalAlpha=.8;c.fillText(MN[now.getMonth()]+' '+now.getFullYear(),80,172);c.globalAlpha=1;
    c.font='700 150px '+F;c.fillText(String(Math.round((RC.tot||0)/60)),80,380);c.font='400 38px '+F;c.fillText('menit mendengar bulan ini',80,436);
    var y=540;c.font='700 36px '+F;c.fillText('Artis teratas',80,y);y+=30;
    if(!ar.length){c.font='400 32px '+F;c.fillText('Belum ada data. Putar lagu dulu ya.',80,y+50);y+=80}
    ar.forEach(function(a,i){y+=62;c.font='700 42px '+F;c.fillText((i+1)+'. '+(a.n.length>24?a.n.slice(0,23)+'…':a.n),80,y)});
    y+=100;c.font='700 36px '+F;c.fillText('Lagu teratas',80,y);
    pl.forEach(function(p,i){y+=62;c.font='700 40px '+F;c.fillText((i+1)+'. '+(p.n.length>26?p.n.slice(0,25)+'…':p.n),80,y)});
    c.font='400 34px '+F;c.fillText('🔥 Streak '+streak()+' hari',80,H-130);c.globalAlpha=.7;c.fillText('loopify1.vercel.app',80,H-80);
    show(cv,'Rekap Loopify','loopify-rekap-'+mk()+'.png')})};

  window.kartuLirik32=function(){
    if(!cur){return}var i=0,ps=[].slice.call(document.querySelectorAll('#pl .lyr p[data-i]')),on=ps.filter(function(p){return p.classList.contains('on')})[0],L=[];
    if(on){i=+on.dataset.i;var a=alOf(cur)||[];L=a.slice(i,i+4).map(function(x){return x.s}).filter(Boolean)}
    else{var P=[].slice.call(document.querySelectorAll('#pl .lyr p')).map(function(p){return p.textContent.trim()}).filter(Boolean);L=P.slice(0,4)}
    if(!L.length){return}
    ready(function(){var W=1080,o=base(W,W),cv=o[0],c=o[1],F='Sora, system-ui, sans-serif';c.fillStyle='#fff';
      c.font='700 58px '+F;var y=190;L.forEach(function(l,k){c.globalAlpha=k?.62:1;y=wrap(c,l,80,y,W-160,78,3)+14});
      c.globalAlpha=1;c.font='700 36px '+F;c.fillText(String(cur.title).slice(0,38),80,W-150);c.font='400 32px '+F;c.globalAlpha=.75;c.fillText(String(cur.artist).slice(0,40),80,W-100);
      c.globalAlpha=.55;c.font='400 26px '+F;c.fillText('Loopify',80,W-52);show(cv,'Kartu lirik','loopify-lirik.png')})};

  /* ---------- sisipkan menu dan tombol ---------- */
  function inject(){try{
    var v=$('#v');if(v&&!v.querySelector('[data-x32]')){var s=v.querySelector('.ft[onclick="goStat()"]');
      if(s){[['🗓','Rekap Loopify','rekap32()'],['🔥','Streak & Lencana','goStreak32()']].forEach(function(m){var d=document.createElement('div');d.className='ft';d.setAttribute('data-x32','1');d.setAttribute('onclick',m[2]);d.innerHTML='<span>'+m[0]+'</span><div>'+m[1].replace('&','&amp;')+'</div>';s.parentNode.insertBefore(d,s)})}}
    var pl=$('#pl'),has=pl&&pl.querySelector('.lyr'),bt=pl&&pl.querySelector('.x32k');
    if(has&&!bt){bt=document.createElement('button');bt.className='btn x32k';bt.textContent='🖼 Kartu';bt.onclick=function(e){e.stopPropagation();kartuLirik32()};pl.appendChild(bt)}
    else if(!has&&bt)bt.remove();
  }catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(inject,150)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  inject();
})();
}catch(e){console.error('[loopify] extra32.js',e)}

/* ==== extra33.js ==== */
try{
/* v4.33: Mode Fokus & Tidur (suara ambient buatan WebAudio + layar redup + sleep timer), Playlist Bersama (label siapa menambah), Sambutan sesuai waktu di Beranda. Dimuat setelah extra32.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x33g{border-radius:20px;padding:16px;margin:12px 0;color:#fff;display:flex;gap:12px;align-items:center;background:linear-gradient(135deg,var(--a),var(--b))}.x33g b{font-size:18px;display:block}.x33g small{color:rgba(255,255,255,.85)}.x33g .e{font-size:34px}.x33c{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.x33c .btn{flex:none;padding:9px 14px;font-size:13px}.x33d{position:fixed;inset:0;background:#000;opacity:.6;pointer-events:none;z-index:9998}.x33x{position:fixed;right:14px;bottom:110px;z-index:9999;padding:8px 14px;font-size:13px}.x33o{font-size:13px;color:var(--mu);margin:8px 0 4px}';
  document.head.appendChild(st);
  var S={amb:'hujan',min:30,dim:true,on:false},ctx=null,node=null,gn=null,tm=0,dimEl=null,xBtn=null;
  var AMB=[['hujan','🌧 Hujan'],['ombak','🌊 Ombak'],['putih','📻 Noise putih'],['',' 🔇 Tanpa suara']];
  function noise(c,kind){var n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0),l=0;
    for(var i=0;i<n;i++){var w=Math.random()*2-1;if(kind=='ombak'){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w*.5}
    return b}
  function stopAmb(fade){try{
    if(!gn){return}var g=gn,s=node,c=ctx;gn=node=null;
    g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(g.gain.value,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+(fade?20:.4));
    setTimeout(function(){try{s.stop()}catch(e){}},(fade?20:.4)*1000+200)}catch(e){}}
  function startAmb(kind){stopAmb();if(!kind)return;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!ctx)ctx=new AC();if(ctx.state=='suspended')ctx.resume();
    var s=ctx.createBufferSource();s.buffer=noise(ctx,kind);s.loop=true;
    var f=ctx.createBiquadFilter(),g=ctx.createGain();
    if(kind=='hujan'){f.type='bandpass';f.frequency.value=2600;f.Q.value=.35}else if(kind=='ombak'){f.type='lowpass';f.frequency.value=700}else{f.type='lowpass';f.frequency.value=7000}
    g.gain.value=0;s.connect(f);f.connect(g);g.connect(ctx.destination);s.start();g.gain.linearRampToValueAtTime(kind=='ombak'?.9:.55,ctx.currentTime+3);
    if(kind=='ombak'){var o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=.11;og.gain.value=.35;o.connect(og);og.connect(g.gain);o.start()}
    node=s;gn=g}
  function setDim(on){if(on&&!dimEl){dimEl=document.createElement('div');dimEl.className='x33d';document.body.appendChild(dimEl)}else if(!on&&dimEl){dimEl.remove();dimEl=null}}
  function setX(on){if(on&&!xBtn){xBtn=document.createElement('button');xBtn.className='btn g x33x';xBtn.textContent='✕ Akhiri mode';xBtn.onclick=function(){stop33()};document.body.appendChild(xBtn)}else if(!on&&xBtn){xBtn.remove();xBtn=null}}
  function stop33(){clearTimeout(tm);stopAmb();setDim(false);setX(false);S.on=false;try{slSet(0)}catch(e){}}
  function render(){var h=shd('Mode Fokus & Tidur')+'<div class="x33o">Suara latar (dibuat langsung di HP, tanpa internet)</div><div class="x33c">'+
    AMB.map(function(a){return '<button class="btn'+(S.amb==a[0]?'':' g')+'" onclick="x33set(\'amb\',\''+a[0]+'\')">'+a[1]+'</button>'}).join('')+'</div>'+
    '<div class="x33o">Berhenti otomatis</div><div class="x33c">'+[15,30,60,90].map(function(m){return '<button class="btn'+(S.min==m?'':' g')+'" onclick="x33set(\'min\','+m+')">'+m+' mnt</button>'}).join('')+'</div>'+
    '<div class="x33o">Layar</div><div class="x33c"><button class="btn'+(S.dim?'':' g')+'" onclick="x33set(\'dim\','+(S.dim?0:1)+')">🌑 Redupkan layar</button></div>'+
    '<button class="btn" style="margin-top:14px" onclick="x33go(\'tidur\')">😴 Mulai mode Tidur</button><button class="btn g" style="margin-top:8px" onclick="x33go(\'fokus\')">🎯 Mulai mode Fokus</button>'+
    '<small style="display:block;margin-top:12px;color:var(--mu);line-height:1.6">Tidur: musik yang sedang diputar ikut berhenti sesuai waktu, volume memudar 20 detik terakhir. Fokus: hanya suara latar dan layar redup, musik tidak diubah. Browser bisa menghentikan suara latar kalau layar terkunci; kalau terjadi, biarkan layar menyala redup.</small>';
    sub(h)}
  window.goFocus33=function(){rbP=0;render()};
  window.x33set=function(k,v){S[k]=k=='dim'?!!v:v;render()};
  window.x33go=function(mode){clearTimeout(tm);S.on=true;startAmb(S.amb);setDim(S.dim);setX(true);
    tm=setTimeout(function(){stopAmb(true);setTimeout(function(){setDim(false);setX(false);S.on=false},20500)},Math.max(0,S.min*60000-20000));
    if(mode=='tidur'){try{slSet(S.min)}catch(e){csp()}}else csp()};

  /* ---------- Playlist Bersama: label siapa yang menambah ---------- */
  var _op=window.openPl;
  window.openPl=function(i,k){_op.apply(this,arguments);
    try{var p=pls[i],sp=document.getElementById('sp');if(!p||!p.co||!sp||sp.querySelector('[data-x33b]'))return;
      var cnt={},first=null;
      [].forEach.call(sp.querySelectorAll('.rw[onclick^="P("]'),function(e){
        var m=/^P\('?(\w+)'?,\s*(\d+)\)/.exec(e.getAttribute('onclick')||'');if(!m)return;
        var t=lists[m[1]]&&lists[m[1]][+m[2]];if(!first)first=e;
        if(t&&t.by){cnt[t.by]=(cnt[t.by]||0)+1;var s=e.querySelector('small');if(s)s.textContent+=' · oleh '+t.by}});
      var ks=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]});
      if(first&&ks.length){var d=document.createElement('div');d.className='pcard';d.setAttribute('data-x33b','1');
        d.innerHTML='<b>👥 Playlist bersama</b><br><small>'+ks.map(function(n){return esc(n)+' '+cnt[n]+' lagu'}).join(' · ')+'</small>';
        first.parentNode.insertBefore(d,first)}
    }catch(e){}};

  /* ---------- Sambutan sesuai waktu ---------- */
  var SL=[[4,'🌅','Selamat pagi','Mulai hari dengan semangat','#ff9a5b','#ffcf6b','mood:energetic','Putar lagu semangat'],
    [11,'☀️','Selamat siang','Waktunya fokus','#2f9bff','#6bd3ff','activity:focus','Putar lagu fokus'],
    [15,'🌇','Selamat sore','Santai dulu sebentar','#ff6b8b','#ffb36b','mood:relaxed','Putar lagu santai'],
    [18,'🌙','Selamat malam','Waktunya rileks','#4f46e5','#8b5cf6','mood:relaxed','Putar lagu rileks'],
    [24,'🌌','Masih terjaga?','Larut malam, pelan-pelan saja','#1e1b4b','#4338ca','activity:sleep','Putar lagu pengantar tidur']];
  function slot(){var h=new Date().getHours();if(h<4)return SL[4];for(var i=3;i>=0;i--)if(h>=SL[i][0])return SL[i];return SL[0]}
  window.x33Play=function(k){recSel=k;var go=function(){var c=recC[k];if(c&&c.length)recAll();else toast('Rekomendasi belum bisa dimuat')};
    if(recC[k]&&recC[k].length)go();else{delete recC[k];recFetch(k,1).then(go,go)}};
  var _home=V.home;
  V.home=function(){var h=_home.apply(this,arguments);
    try{var s=slot(),late=new Date().getHours()<4||new Date().getHours()>=18,
      c='<div class="x33g" style="--a:'+s[4]+';--b:'+s[5]+'"><div class="e">'+s[1]+'</div><div style="flex:1;min-width:0"><b>'+s[2]+', '+esc(nm())+'</b><small>'+s[3]+'</small>'+
      '<div class="x33c" style="margin:10px 0 0"><button class="btn" onclick="x33Play(\''+s[6]+'\')">▶ '+s[7]+'</button>'+(late?'<button class="btn g" onclick="goFocus33()">😴 Mode Tidur</button>':'')+'</div></div></div>';
      var k='</div></div></div>',i=h.indexOf(k);return i<0?c+h:h.slice(0,i+k.length)+c+h.slice(i+k.length)}catch(e){return h}};

  /* ---------- menu Profil ---------- */
  function inject(){try{var v=document.getElementById('v');if(!v||v.querySelector('[data-x33]'))return;
    var s=v.querySelector('.ft[onclick="goStat()"]');if(!s)return;
    var d=document.createElement('div');d.className='ft';d.setAttribute('data-x33','1');d.setAttribute('onclick','goFocus33()');d.innerHTML='<span>🌙</span><div>Mode Fokus &amp; Tidur</div>';s.parentNode.insertBefore(d,s)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(inject,150)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  inject();
})();
}catch(e){console.error('[loopify] extra33.js',e)}

/* ==== extra34.js ==== */
try{
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
}catch(e){console.error('[loopify] extra34.js',e)}

/* ==== web.js ==== */
try{
/* Loopify - pintasan keyboard untuk versi website (tidak aktif saat mengetik di kolom input) */
(function(){
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target,tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    var k=e.key;
    if(k===' '||k==='k'||k==='K'){e.preventDefault();toggle();}
    else if(k==='ArrowRight'){if(act&&isFinite(act.duration)){e.preventDefault();act.currentTime=Math.min(act.duration,act.currentTime+5);}}
    else if(k==='ArrowLeft'){if(act){e.preventDefault();act.currentTime=Math.max(0,act.currentTime-5);}}
    else if(k==='n'||k==='N'){nxt(1);}
    else if(k==='p'||k==='P'){nxt(-1);}
    else if(k==='/'){e.preventDefault();go('explore');setTimeout(function(){var i=document.querySelector('#v input');if(i)i.focus();},120);}
    else if(k==='Escape'){var o=document.querySelector('.ov.on');if(o)ovc();}
  });
})();
}catch(e){console.error('[loopify] web.js',e)}

/* ==== a11y.js ==== */
try{
/* Loopify v4.29 - aksesibilitas: nama untuk tombol ikon, akses keyboard untuk elemen yang bisa diketuk,
   label kolom isi, alt gambar, dan pengumuman toast. Satu pengamat DOM ringan, hanya memproses node baru.
   Dimuat paling akhir (pasangan a11y.css). */
(function(){
  'use strict';
  var GL={'⚙':'Pengaturan','⋮':'Menu lainnya','✕':'Tutup','×':'Tutup','✖':'Tutup','‹':'Kembali','›':'Lanjut',
    '▶':'Putar','⏸':'Jeda','⏯':'Putar atau jeda','⏮':'Lagu sebelumnya','⏭':'Lagu berikutnya','⏪':'Mundur','⏩':'Maju',
    '⤴':'Bagikan','⤓':'Simpan','⤒':'Putar berikutnya','☑':'Pilih beberapa lagu','🎧':'Mode audio','🎚':'Equalizer',
    '🎤':'Cari dengan suara','✎':'Ubah','▲':'Naikkan','▼':'Turunkan','▢':'Kembali ke video','≡':'Seret untuk mengurutkan',
    '♡':'Favorit','♥':'Favorit','+':'Tambah','＋':'Tambah','⇩':'Impor'};
  /* tombol berisi SVG saja: nama diambil dari fungsi yang dipanggil */
  var OC=[[/toggle\(\)/,'Putar atau jeda'],[/nxt\(-1\)|prv\(/,'Lagu sebelumnya'],[/nxt\((1)?\)/,'Lagu berikutnya'],
    [/addPl\(/,'Playlist baru'],[/(^|[^a-zA-Z])(csp|clp|krX|drClose|ksClose|ovc|vBack)\(/,'Kembali'],
    [/qAdd\(/,'Tambah ke antrean'],[/qRm\(|plRm\(|delS\(|delV\(/,'Hapus'],[/tgTheme\(/,'Ganti tema'],[/goSet\(/,'Pengaturan']];
  var SKIP={BUTTON:1,A:1,INPUT:1,SELECT:1,TEXTAREA:1,LABEL:1,SUMMARY:1,OPTION:1};
  var CLK='[onclick],.rw,.cd,.pcard,.ft,.chip,.x18c';
  var INNER='button,a,[onclick],input,select,textarea,[role="button"]';

  function nameBtn(b){
    if(b.hasAttribute('aria-label')||b.hasAttribute('aria-labelledby')||b.title)return;
    var t=(b.textContent||'').replace(/[\uFE0F\s]/g,'');
    if(t){if(GL[t])b.setAttribute('aria-label',GL[t]);return}
    var oc=b.getAttribute('onclick')||'';
    for(var i=0;i<OC.length;i++)if(OC[i][0].test(oc)){b.setAttribute('aria-label',OC[i][1]);return}
  }
  function keyable(el){
    if(el.hasAttribute('data-a11y')||SKIP[el.tagName]||el.hasAttribute('role'))return;
    if(el.id==='app'||el.classList.contains('ov')||el.getAttribute('aria-hidden')==='true')return;
    el.setAttribute('data-a11y','1');
    if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
    if(!el.querySelector(INNER))el.setAttribute('role','button');
  }
  function field(f){
    if(f.type==='hidden'||f.type==='file'||f.hasAttribute('aria-label')||f.hasAttribute('aria-labelledby'))return;
    if(f.id&&document.querySelector('label[for="'+f.id+'"]'))return;
    var n=f.getAttribute('placeholder')||f.title;if(n)f.setAttribute('aria-label',n);
  }
  function scan(r){
    if(!r||r.nodeType!==1||!r.isConnected)return;
    var l,i;
    if(r.tagName==='BUTTON')nameBtn(r);
    l=r.querySelectorAll('button');for(i=0;i<l.length;i++)nameBtn(l[i]);
    if(r.matches(CLK))keyable(r);
    l=r.querySelectorAll(CLK);for(i=0;i<l.length;i++)keyable(l[i]);
    if(r.matches('input,select,textarea'))field(r);
    l=r.querySelectorAll('input,select,textarea');for(i=0;i<l.length;i++)field(l[i]);
    l=r.querySelectorAll('img:not([alt])');for(i=0;i<l.length;i++)l[i].setAttribute('alt','');
  }

  /* Enter / Spasi pada elemen yang difokuskan = ketuk (ditangkap lebih dulu supaya Spasi tidak memicu pintasan putar/jeda) */
  document.addEventListener('keydown',function(e){
    var t=e.target;
    if(!t||t.nodeType!==1||!t.hasAttribute('data-a11y'))return;
    if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();e.stopPropagation();t.click()}
  },true);

  var q=[],tm=0;
  function flush(){tm=0;var a=q;q=[];for(var i=0;i<a.length;i++){try{scan(a[i])}catch(x){}}}
  function init(){
    var app=document.getElementById('app')||document.body;
    var toast=document.getElementById('toast');
    if(toast){toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true')}
    try{scan(app)}catch(x){}
    if(!window.MutationObserver)return;
    new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){var n=ms[i].addedNodes;for(var j=0;j<n.length;j++)if(n[j].nodeType===1)q.push(n[j])}
      if(q.length&&!tm)tm=setTimeout(flush,100);
    }).observe(app,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
}catch(e){console.error('[loopify] a11y.js',e)}