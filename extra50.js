/* Loopify v4.40 - Lirik otomatis.
   1) Pencarian lirik berlapis: kalau lrclib/JioSaavn tidak menemukan, dicoba lagi dengan variasi judul/artis (tanpa "feat.", judul saja,
      artis-judul terbalik) dan hasilnya dipilih lewat kemiripan judul + durasi, supaya tidak salah lagu.
   2) Waktu perkiraan: lirik tanpa penanda waktu otomatis diberi waktu perkiraan (dibagi menurut panjang baris dan durasi lagu), jadi lirik
      ikut berjalan di pemutar dan di layar kunci. Ditandai "Waktu lirik diperkiraan otomatis".
   3) Lirik dari audio (AI): khusus lagu dari perangkat, memakai Whisper di Groq dengan API key milikmu (gratis, disimpan hanya di perangkat).
      Lagu YouTube tidak bisa dibaca otomatis: audionya tidak dapat diambil dari browser.
   Lirik di layar kunci sudah ada sejak v3.7 (extra8.js, Profil > Pengaturan > "Lirik di notifikasi"): baris yang sedang dinyanyikan tampil
   di kolom artis notifikasi pemutar. Semua lirik di atas otomatis ikut tampil di sana. */
(function(){
  'use strict';
  var E=function(s){return esc(s)};
  var EST={},AUTO={},tried={},cdone={},busy={};
  try{EST=ls.get('ly50e',{})||{};AUTO=ls.get('ly50a',{})||{}}catch(e){}
  function on(){return cfg.ly50!==false}

  /* ---------- teks ---------- */
  function nrm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
  function toks(s){return nrm(s).split(' ').filter(Boolean)}
  function sim(a,b){
    var x=toks(a),y=toks(b);if(!x.length||!y.length)return 0;
    var m={},n=0,u={};
    y.forEach(function(w){m[w]=1;u[w]=1});
    x.forEach(function(w){if(m[w])n++;u[w]=1});
    return n/Object.keys(u).length;
  }
  function cleanT(s){return String(s||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip|clip|visuali[sz]er)\b/ig,' ').replace(/\s+/g,' ').trim()}
  function guess(t){
    var z=cleanT(t.title).replace(/\s+(feat\.?|ft\.?|featuring)\s+.*$/i,'').trim();
    var m=z.split(/\s[-\u2013\u2014|]\s/);
    if(t.yt&&m.length>1)return{a:m[0].trim(),t:m.slice(1).join(' ').trim()};
    var ar=/^(Lagu Saya|Link kustom|Tidak diketahui|Radio|YouTube)$/i.test(t.artist||'')?'':cleanT(t.artist).replace(/\s*-\s*Topic$/i,'').replace(/\s+(feat\.?|ft\.?)\s+.*$/i,'');
    return{a:ar,t:z};
  }
  function dur(){
    try{var d=act&&act.duration;if(isFinite(d)&&d>0)return d}catch(e){}
    try{if(yp&&yp.getDuration){var y=yp.getDuration();if(y>0)return y}}catch(e){}
    return 0;
  }
  function mmss(t){var cs=Math.max(0,Math.round(t*100)),m=Math.floor(cs/6000),s=(cs%6000)/100;return(m<10?'0':'')+m+':'+(s<10?'0':'')+s.toFixed(2)}

  /* ---------- 1. Pencarian lirik berlapis ---------- */
  function pick(list,g,d){
    var best=null,bs=0;
    (Array.isArray(list)?list:[list]).forEach(function(x){
      if(!x||!(x.syncedLyrics||x.plainLyrics))return;
      var ts=sim(g.t,x.trackName||x.name||'');if(ts<.6)return;
      var s=ts*2+(g.a?sim(g.a,x.artistName||''):.5);
      if(d&&x.duration){var df=Math.abs(x.duration-d);s+=df<=3?1:df<=8?.4:df>25?-1:0}
      if(x.syncedLyrics)s+=.3;
      if(s>bs){bs=s;best=x}
    });
    return bs>=1.6?best:null;
  }
  function lr(params){
    return fetch('https://lrclib.net/api/search?'+new URLSearchParams(params)).then(function(r){return r.ok?r.json():null}).catch(function(){return null});
  }
  async function cascade(t){
    var g=guess(t),d=dur(),tries=[],sw={a:g.t,t:g.a};
    if(!g.t)return null;
    if(g.a)tries.push([{track_name:g.t,artist_name:g.a},g]);
    tries.push([{q:((g.a?g.a+' ':'')+g.t).trim()},g]);
    tries.push([{track_name:g.t},g]);
    if(g.a)tries.push([{track_name:g.a,artist_name:g.t},sw]);   /* "Judul - Artis" yang tertukar */
    var short=g.t.replace(/\s+(x|&|and|dan|vs\.?)\s+.*$/i,'').trim();
    if(short&&short!==g.t)tries.push([{track_name:short},g]);
    for(var i=0;i<tries.length;i++){
      var b=pick(await lr(tries[i][0]),tries[i][1],d);
      if(b)return b.syncedLyrics||b.plainLyrics;
    }
    return null;
  }
  if(typeof fetchLy=='function'){
    var _fl=fetchLy;
    fetchLy=async function(t){
      await _fl(t);
      try{
        if(!on()||!t||t.radio||lyS[t.id]!=='none'||cdone[t.id])return;
        cdone[t.id]=1;
        var txt=await cascade(t);
        if(txt){
          lyc[t.id]=txt;ls.set('ly',lyc);lyS[t.id]='ok';delete ly2[t.id];
          if(cur&&cur.id==t.id&&(pm||krOn()))rp();
        }
      }catch(e){}
    };
  }

  /* ---------- 2. Waktu perkiraan untuk lirik biasa ---------- */
  function estLrc(txt,d){
    var out=[],gap=0;
    String(txt).split(/\r?\n/).forEach(function(l){
      var s=l.trim();
      if(!s){gap=1;return}
      if(/^[\[(][^\])]{1,40}[\])]$/.test(s)&&!/\d+:\d+/.test(s)){gap=1;return}
      out.push({s:s,w:Math.max(10,s.length)+(gap&&out.length?14:0)});gap=0;
    });
    if(out.length<3)return'';
    var intro=Math.min(18,d*.07),outro=Math.min(14,d*.05),use=Math.max(10,d-intro-outro),tot=0,t=intro,lrc=[];
    out.forEach(function(o){tot+=o.w});
    out.forEach(function(o){lrc.push('['+mmss(t)+']'+o.s);t+=use*o.w/tot});
    return lrc.join('\n');
  }
  function estTick(){
    try{
      if(!on()||!cur||cur.radio)return;
      var L=lyc[cur.id];
      if(typeof L!=='string'||!L||isLrc(L)||tried[cur.id])return;
      var d=dur();if(!(d>30))return;
      tried[cur.id]=1;
      var lrc=estLrc(L,d);if(!lrc)return;
      lyc[cur.id]=lrc;EST[cur.id]=1;ls.set('ly',lyc);ls.set('ly50e',EST);delete ly2[cur.id];lyI=-1;
      if(pm||krOn())rp();
    }catch(e){}
  }
  window.ly50Tick=estTick;
  setInterval(estTick,2000);

  /* ---------- 3. Lirik dari audio (Whisper di Groq, lagu dari perangkat) ---------- */
  function info(msg,title){
    return typeof uiConfirm=='function'?uiConfirm(msg,{title:title||'Lirik otomatis',ok:'Mengerti',cancel:'Tutup'}):Promise.resolve();
  }
  window.lyAuto=async function(){
    var t=cur;
    if(!t||busy[t.id])return;
    if(!t.loc||!t.blob){await info('Lirik dari audio hanya untuk lagu yang kamu unggah dari perangkat. Audio lagu YouTube tidak bisa diambil oleh browser.');return}
    if(t.blob.size>24*1048576){await info('File lagu lebih dari 24 MB, melebihi batas layanan transkripsi.');return}
    var key=String(cfg.groqKey||'').trim();
    if(!key){
      key=typeof uiPrompt=='function'?await uiPrompt('Tempel API key Groq (gratis di console.groq.com). Kunci hanya disimpan di perangkat ini dan dipakai langsung dari browsermu.','',{title:'Lirik otomatis',ok:'Simpan',placeholder:'gsk_…'}):'';
      key=String(key||'').trim();
      if(!key)return;
      cfg.groqKey=key;ls.set('cfg',cfg);
    }
    busy[t.id]=1;lyS[t.id]='load';AUTO.busy=t.id;
    try{if(pm||krOn())rp()}catch(e){}
    try{
      var fd=new FormData();
      fd.append('file',t.blob,String(t.title||'lagu').replace(/[^\w.-]+/g,'_')+'.mp3');
      fd.append('model','whisper-large-v3-turbo');fd.append('response_format','verbose_json');fd.append('temperature','0');
      var r=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+key},body:fd});
      if(r.status===401){cfg.groqKey='';ls.set('cfg',cfg);lyS[t.id]='none';await info('API key ditolak. Periksa kuncinya lalu coba lagi.');return}
      if(r.status===429){lyS[t.id]='none';await info('Batas pemakaian Groq tercapai. Coba lagi nanti.');return}
      if(!r.ok)throw new Error('HTTP '+r.status);
      var j=await r.json(),segs=Array.isArray(j.segments)?j.segments:[];
      var lrc=segs.map(function(s){return{t:+s.start||0,s:String(s.text||'').trim()}}).filter(function(x){return x.s.length>2}).map(function(x){return'['+mmss(x.t)+']'+x.s}).join('\n');
      if(!lrc&&j.text)lrc=String(j.text).trim();
      if(!lrc){lyS[t.id]='none';await info('Tidak ada suara yang terbaca dari lagu ini.');return}
      lyc[t.id]=lrc;AUTO[t.id]=1;ls.set('ly',lyc);ls.set('ly50a',AUTO);lyS[t.id]='ok';delete ly2[t.id];tried[t.id]=isLrc(lrc)?1:0;
    }catch(e){
      lyS[t.id]='none';await info('Gagal membuat lirik. Periksa koneksi internet lalu coba lagi.');
    }finally{
      busy[t.id]=0;delete AUTO.busy;
      try{if(cur&&cur.id==t.id&&(pm||krOn()))rp()}catch(e){}
    }
  };
  if(typeof addLy=='function'){
    var _al=addLy;
    addLy=async function(){
      if(cur&&cur.loc&&cur.blob&&typeof uiPick=='function'){
        var k=await uiPick('Lirik',['Tempel lirik sendiri','Buat otomatis dari audio (AI)']);
        if(k===1){window.lyAuto();return}
        if(k!==0)return;
      }
      _al();
    };
  }

  /* ---------- Catatan & tombol di panel lirik ---------- */
  if(typeof lyHtml=='function'){
    var _lh=lyHtml;
    lyHtml=function(t,L){
      var h=_lh(t,L),note='';
      try{
        if(t&&AUTO[t.id])note='Dibuat otomatis dari audio (AI). Mungkin ada kata yang salah dengar.';
        else if(t&&EST[t.id])note='Waktu lirik diperkirakan otomatis.';
        if(note)h='<div class="ly50n">'+note+'</div>'+h;
        else if(t&&t.loc&&t.blob&&/Lirik belum tersedia/.test(h))h+='<div class="ly50a"><button class="btn g" onclick="lyAuto()">✨ Buat lirik otomatis dari audio</button><small>Memakai AI (Groq Whisper) dengan API key milikmu.</small></div>';
        else if(t&&busy[t.id])h='<div class="ly50n">Membaca audio dan menulis lirik… ini bisa makan waktu satu menit.</div>'+h;
      }catch(e){}
      return h;
    };
  }
})();
