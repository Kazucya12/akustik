/* Loopify v4.63 - Pencarian rapi seperti Spotify: daftar dari katalog lagu (Deezer), diputar lewat versi YouTube yang tepat.
   1) Hasil pencarian: judul + artis + cover + durasi dari katalog (/api/artist?dsearch=), bukan judul video mentah.
      Hasil YouTube yang menggandakan lagu katalog, atau berupa cover/live/remix yang tidak diminta, disaring dan dibatasi.
      Kalau katalog kosong/gagal (lagu indie, offline), hasil YouTube tampil seperti biasa.
   2) Saat lagu katalog diputar, versi YouTube-nya dipilih dengan skor: judul mirip, artis cocok, channel "Artis - Topic",
      durasi hampir sama dengan katalog (selisih <= 3 detik), dan bukan cover/live/remix. Tidak ada yang cukup cocok: jatuh ke cara lama.
   Dimuat setelah extra62.js. Mati lewat cfg.dz63 = false. */
(function(){
  'use strict';
  function on(){return cfg.dz63!==false}
  var CAT={},RAW={},LIST={},NOISE=/\b(cover|live|remix|acoustic|akustik|karaoke|instrumental|sped up|slowed|nightcore|reverb|8d|lofi|lo-fi|tribute|reaction|piano version)\b/i;

  /* ---------- teks ---------- */
  function nrm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
  function cleanT(s){return String(s||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\s+(feat\.?|ft\.?|featuring)\s+.*$/i,' ').replace(/\s+/g,' ').trim()}
  function toks(s){return nrm(s).split(' ').filter(Boolean)}
  function sim(a,b){
    var x=toks(a),y=toks(b);if(!x.length||!y.length)return 0;
    var m={},u={},n=0;
    y.forEach(function(w){m[w]=1;u[w]=1});
    x.forEach(function(w){if(m[w])n++;u[w]=1});
    return n/Object.keys(u).length;
  }
  /* nama artis dinormalkan: "Tulus Official", "Tulus - Topic", "Tulus & Band", "Tulus x Raisa" -> "tulus" */
  function artistN(a){return nrm(String(a||'').replace(/\s*-\s*Topic$/i,'').split(/,|&|\bfeat\b|\bft\b|\bx\b/i)[0].replace(/\b(official|topic|vevo|channel|records?|entertainment)\b/ig,' '))}
  function key(t,a){return nrm(cleanT(t))+'|'+artistN(a)}
  /* lagu yang sama? judul hampir sama (>=0,8) dan artis cocok; kalau judul hampir persis (>=0,9) dan pencarian menyebut nama artisnya,
     artis yang beda/cuma nama channel diabaikan (upload ulang) */
  function isDup(t,c,q){
    var ts=sim(cleanT(t.title),cleanT(c.title));
    if(ts<.8)return false;
    if(sim(artistN(t.artist),artistN(c.artist))>=.5)return true;
    if(ts>=.9&&q){
      var qt=toks(q),ca=toks(artistN(c.artist)).filter(function(w){return w.length>=3});
      if(ca.length&&ca.some(function(w){return qt.indexOf(w)>=0}))return true;
    }
    return false;
  }
  function dupIn(list,t,q){for(var i=0;i<list.length;i++){if(isDup(t,list[i],q))return true}return false}

  /* ---------- katalog ---------- */
  function mk(x){
    return{id:'d'+x.id,dz:1,did:x.id,rec:1,title:String(x.title||'').slice(0,200),artist:String(x.artist||'Tidak diketahui').slice(0,100),
      img:x.img||'',dalb:x.album||'',dur:+x.d||0,h:hh(x.title||x.id)};
  }
  function cat(s){
    var k=String(s).trim().toLowerCase();
    if(CAT[k])return CAT[k];
    var ks=Object.keys(CAT);if(ks.length>40)delete CAT[ks[0]];
    return CAT[k]=fetch('/api/artist?dsearch='+encodeURIComponent(s)).then(function(r){return r.ok?r.json():[]})
      .then(function(a){return Array.isArray(a)?a.filter(function(x){return x&&x.id&&x.title}).map(mk):[]}).catch(function(){return[]});
  }

  /* ---------- hasil pencarian: katalog dulu ---------- */
  if(typeof srch=='function'){
    var _sr=srch;
    srch=async function(s){
      if(!on()||cfg.src==='radio')return _sr(s);
      var p=cat(s),ie=null,k=String(s).trim().toLowerCase();
      var inner=Promise.resolve().then(function(){return _sr(s)}).catch(function(e){ie=e;return[]});
      var all=LIST[k]=Promise.all([p,inner]).then(function(r){
        var a=r[0],b=r[1];
        if(!a.length)return b||[];
        var seen={};
        return a.concat((b||[]).filter(function(t){return t&&!seen[key(t.title,t.artist)]&&!dupIn(a,t,s)})).slice(0,25);
      });
      var ks=Object.keys(LIST);if(ks.length>40)delete LIST[ks[0]];
      var out=await all;
      if(!out.length&&ie)throw ie;
      return out;
    };
  }
  /* hasil video YouTube di halaman pencarian: buang duplikat lagu katalog dan cover/live/remix yang tidak diminta */
  if(typeof ytSearch=='function'){
    var _ys=ytSearch;
    ytSearch=async function(s,o,m){
      var r=await _ys(s,o,m);
      try{
        if(!on()||m!=2||typeof lq!='string'||String(s).trim()!==lq.trim()||cfg.src==='radio')return r;
        var kk=String(s).trim().toLowerCase();
        var c=await (LIST[kk]||cat(s)).catch(function(){return[]});   /* gabungan Deezer + JioSaavn untuk kata kunci ini */
        if(c.length<3)return r;
        var asked=NOISE.test(s);
        var out=(r||[]).filter(function(v){
          if(!v)return false;
          if(v.se)return true;                                   /* track dari album/video panjang: biarkan */
          if(NOISE.test(v.title))return asked;                   /* cover/live/remix: dibuang kecuali memang diminta di pencarian */
          return !dupIn(c,v,s);
        });
        return out.slice(0,8);
      }catch(e){return r}
    };
  }

  /* ---------- pilih versi YouTube yang tepat ---------- */
  function yraw(q){
    if(RAW[q])return RAW[q];
    var ks=Object.keys(RAW);if(ks.length>40)delete RAW[ks[0]];
    return RAW[q]=fetch('/api/yt-music?q='+encodeURIComponent(q)+'&songs=1').then(function(r){
      if(!r.ok){delete RAW[q];throw new Error('yt '+r.status)}
      return r.json();
    }).then(function(a){return Array.isArray(a)?a:[]}).catch(function(e){delete RAW[q];throw e});
  }
  function score(x,t){
    var tt=cleanT(t.title),ts=sim(cleanT(x.title),tt);
    if(ts<.5)return-9;
    var s=ts*2;
    var an=toks(String(t.artist||'').replace(/,|&/g,' ')).filter(function(w){return w.length>=3});
    var hay=' '+nrm((x.artist||'')+' '+(x.title||''))+' ';
    if(an.some(function(w){return hay.indexOf(' '+w+' ')>=0}))s+=1;
    if(x.tp)s+=.8;
    if(x.d&&t.dur){var df=Math.abs(x.d-t.dur);s+=df<=3?1.2:df<=8?.4:df>=20?-2:0}
    if(NOISE.test(x.title||'')&&!NOISE.test(t.title||''))s-=2.5;
    return s;
  }
  function pickBest(items,t){
    var best=null,bs=-9;
    (items||[]).forEach(function(x){if(!x||!x.id)return;var s=score(x,t);if(s>bs){bs=s;best=x}});
    return bs>=1.8?best:null;
  }
  if(typeof resolveRec=='function'){
    var _rr=resolveRec;
    resolveRec=async function(t){
      if(on()&&t&&t.dz&&!t.url&&!t.vid){
        try{
          var q=(t.artist&&!/^Tidak diketahui$/i.test(t.artist)?t.artist+' ':'')+cleanT(t.title);
          var v=pickBest(await yraw(q),t);
          if(v){Object.assign(t,{yt:1,vid:v.id,img:t.img||('https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg'),rec:0,nf:0});return true}
        }catch(e){}
      }
      return _rr(t);
    };
  }
  window.__dz63={score:score,pickBest:pickBest,key:key,sim:sim,mk:mk,isDup:isDup,artistN:artistN};
})();
