/* Loopify v4.62 - Lirik dari audio yang lebih cerdas (pasangan action=transcribe di api/jiosaavn.js).
   1) Selaraskan waktu: lirik teks biasa (atau yang waktunya cuma perkiraan) dicocokkan kata demi kata dengan hasil Whisper,
      sehingga tiap baris mendapat waktu nyata. Tombol "Selaraskan waktu dengan audio" muncul di panel lirik.
   2) Lirik dari audio untuk lagu yang liriknya tidak ketemu di mana pun: Whisper di server membuat lirik bertimestamp, lalu LLM
      merapikan kata yang salah dengar (jumlah baris dijaga). Hasil di-cache di server, jadi satu lagu cuma diproses sekali.
   3) Lagu YouTube: audio YouTube tidak bisa diambil, jadi server mencari versi lagu yang sama di JioSaavn lewat judul/artis.
      Kalau durasi versi itu beda lebih dari 6 detik dari yang diputar, hasilnya TIDAK dipakai (waktunya pasti meleset).
   Lagu dari perangkat tetap memakai tombol Groq milik sendiri dari extra50.js. Butuh GROQ_API_KEY dan JIOSAAVN_API_URL di Vercel. */
(function(){
  'use strict';
  var FLAG={},busy={};
  try{FLAG=ls.get('ly62',{})||{}}catch(e){}

  /* ---------- teks ---------- */
  function nrm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
  function tk(s){return nrm(s).replace(/ /g,'')}
  function cleanT(s){return String(s||'').replace(/\(.*?\)|\[.*?\]/g,' ').replace(/\b(official|lyric|lyrics|lirik|video|music|audio|mv|hd|hq|klip|clip|visuali[sz]er)\b/ig,' ').replace(/\s+/g,' ').trim()}
  function guess(t){
    var z=cleanT(t.title).replace(/\s+(feat\.?|ft\.?|featuring)\s+.*$/i,'').trim();
    var m=z.split(/\s[-–—|]\s/);
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
  function info(msg,title){
    return typeof uiConfirm=='function'?uiConfirm(msg,{title:title||'Lirik dari audio',ok:'Mengerti',cancel:'Tutup'}):Promise.resolve();
  }
  function plainLines(L){return String(L||'').split(/\r?\n/).map(function(l){return l.replace(/\[[^\]]*\]/g,'').trim()}).filter(Boolean)}
  function toLrc(a){return a.map(function(x){return'['+mmss(x.t)+']'+x.s}).join('\n')}

  /* ---------- pencocokan kata (selisih satu huruf atau awalan dianggap mirip) ---------- */
  function lev1(a,b){
    if(Math.abs(a.length-b.length)>1)return false;
    var i=0,j=0,d=0;
    while(i<a.length&&j<b.length){
      if(a[i]===b[j]){i++;j++;continue}
      if(++d>1)return false;
      if(a.length===b.length){i++;j++}else if(a.length>b.length)i++;else j++;
    }
    return d+(a.length-i)+(b.length-j)<=1;
  }
  function eq(a,b){
    if(a===b)return 1;
    if(a.length>=4&&b.length>=4){
      if(a.indexOf(b)===0||b.indexOf(a)===0)return .7;
      if(lev1(a,b))return .7;
    }
    return 0;
  }

  /* ---------- penyelarasan: lirik (teks) x kata bertimestamp dari Whisper ----------
     Penjajaran urutan (semi-global: kata ekstra di awal/akhir audio tidak dihukum). Mengembalikan {lines:[{t,s}],ratio} atau null. */
  function align(lines,words){
    var R=[];
    lines.forEach(function(l,li){String(l).split(/\s+/).forEach(function(x){var t=tk(x);if(t)R.push({t:t,li:li})})});
    var W=(words||[]).map(function(w){return{t:tk(w.w),s:+w.s||0}}).filter(function(w){return w.t});
    var n=R.length,m=W.length;
    if(!n||!m||n*m>1500000)return null;
    var C=m+1,S=new Float32Array((n+1)*C),T=new Uint8Array((n+1)*C),GAP=.4;
    for(var i=1;i<=n;i++){
      for(var j=1;j<=m;j++){
        var e=eq(R[i-1].t,W[j-1].t);
        var d=S[(i-1)*C+j-1]+(e?2*e:-1),u=S[(i-1)*C+j]-GAP,l=S[i*C+j-1]-GAP;
        var b=d,tr=1;
        if(u>b){b=u;tr=2}
        if(l>b){b=l;tr=3}
        S[i*C+j]=b;T[i*C+j]=tr;
      }
    }
    var bi=n,bj=m,bs=-1e9;
    for(j=1;j<=m;j++)if(S[n*C+j]>bs){bs=S[n*C+j];bi=n;bj=j}
    for(i=1;i<=n;i++)if(S[i*C+m]>bs){bs=S[i*C+m];bi=i;bj=m}
    var at=new Array(n),hit=0;
    i=bi;j=bj;
    while(i>0&&j>0){
      var t=T[i*C+j];
      if(t===1){if(eq(R[i-1].t,W[j-1].t)){at[i-1]=W[j-1].s;hit++}i--;j--}
      else if(t===2)i--;
      else j--;
    }
    var ratio=hit/n;
    if(ratio<.3)return null;
    var first=new Array(lines.length);
    for(var k=0;k<n;k++){
      if(at[k]!=null&&first[R[k].li]==null)first[R[k].li]=at[k];
    }
    var idx=[];
    first.forEach(function(v,li){if(v!=null)idx.push(li)});
    if(!idx.length)return null;
    var span=idx.length>1?(first[idx[idx.length-1]]-first[idx[0]])/(idx[idx.length-1]-idx[0]):3;
    if(!(span>.5&&span<15))span=3;
    var out=new Array(lines.length);
    for(var q=0;q<lines.length;q++){
      if(first[q]!=null){out[q]=first[q];continue}
      var p=q-1;while(p>=0&&first[p]==null)p--;
      var nx=q+1;while(nx<lines.length&&first[nx]==null)nx++;
      if(p>=0&&nx<lines.length)out[q]=first[p]+(first[nx]-first[p])*(q-p)/(nx-p);
      else if(p>=0)out[q]=first[p]+span*(q-p);
      else out[q]=Math.max(0,first[nx]-span*(nx-q));
    }
    for(q=1;q<out.length;q++)if(out[q]<=out[q-1])out[q]=out[q-1]+.05;
    return{ratio:ratio,lines:lines.map(function(s,i){return{t:out[i],s:s}})};
  }

  /* ---------- baris lirik dari hasil transkripsi ---------- */
  function linesFromSegments(segs,fixed,words){
    var out=[],rep=0,prev='';
    (segs||[]).forEach(function(s,i){
      var txt=String((fixed&&fixed[i])||s.t||'').trim();
      if(txt.length<2)return;
      var k=nrm(txt);
      rep=k===prev?rep+1:0;prev=k;
      if(rep>=2)return;                       /* ulangan identik berkali-kali = halusinasi Whisper */
      out.push({t:+s.s||0,s:txt});
    });
    if(out.length||!words||!words.length)return out;
    var cur2=null,last=0;
    words.forEach(function(w){
      if(!cur2||w.s-last>.9||cur2.n>=9){cur2={t:w.s,s:'',n:0};out.push(cur2)}
      cur2.s+=(cur2.s?' ':'')+w.w;cur2.n++;last=w.e||w.s;
    });
    return out.map(function(x){return{t:x.t,s:x.s}});
  }

  /* ---------- panggilan ke server ---------- */
  function eligible(t){return!!t&&!t.radio&&!t.loc&&!!(t.jid||guess(t).t)}
  async function remote(t,fix){
    var g=guess(t),e=encodeURIComponent;
    var qs='action=transcribe'+(t.jid?'&id='+e(t.jid):'')+'&t='+e(g.t)+'&a='+e(g.a)+(fix?'&fix=1':'');
    var c=new AbortController(),tm=setTimeout(function(){c.abort()},58000);
    try{
      var r=await fetch('/api/jiosaavn?'+qs,{signal:c.signal}),j=null;
      try{j=await r.json()}catch(e2){}
      if(!r.ok){var er=new Error((j&&j.error)||('HTTP '+r.status));er.code=(j&&j.code)||r.status;throw er}
      return j;
    }finally{clearTimeout(tm)}
  }
  function errMsg(e){
    var c=e&&e.code;
    if(c==='nokey'||c===501)return'Fitur ini belum aktif di server (GROQ_API_KEY atau JIOSAAVN_API_URL belum diatur).';
    if(c==='noaudio'||c===404)return'Versi audio lagu ini tidak ditemukan di sumber, jadi tidak bisa dibaca.';
    if(c==='big'||c===413)return'File audio terlalu besar untuk diproses.';
    if(c==='groq429'||c==='rl'||c===429)return'Batas pemakaian layanan tercapai. Coba lagi beberapa menit lagi.';
    if(e&&e.name==='AbortError')return'Server terlalu lama membalas. Coba lagi.';
    return'Gagal membaca audio. Periksa koneksi internet lalu coba lagi.';
  }
  function redraw(t){try{if(cur&&t&&cur.id==t.id&&(pm||krOn()))rp()}catch(e){}}
  function estimated(t){try{return!!(ls.get('ly50e',{})||{})[t.id]}catch(e){return false}}

  window.ly62=async function(mode){
    var t=cur;
    if(!t||busy[t.id]||!eligible(t))return;
    busy[t.id]=1;
    if(mode==='t')lyS[t.id]='load';
    redraw(t);
    try{
      var L=lyc[t.id],j=await remote(t,mode==='t'),d=dur();
      if(d>30&&j.duration>30&&Math.abs(d-j.duration)>6){
        if(mode==='t')lyS[t.id]='none';
        await info('Versi audio di sumber berdurasi '+Math.round(j.duration)+' detik, sedangkan lagu ini '+Math.round(d)+' detik. Waktu lirik pasti meleset, jadi hasilnya tidak dipakai.');
        return;
      }
      var arr;
      if(mode==='a'){
        var al=align(plainLines(L),j.words);
        if(!al){await info('Lirik dan audio terlalu berbeda (kurang dari 30% kata cocok), jadi waktunya tidak dipakai. Mungkin lirik ini milik lagu lain.');return}
        arr=al.lines;FLAG[t.id]='a';
      }else{
        arr=linesFromSegments(j.segments,j.fixed,j.words);
        if(!arr.length){lyS[t.id]='none';await info('Tidak ada suara yang terbaca dari lagu ini.');return}
        FLAG[t.id]=j.fixed?'tf':'t';
      }
      lyc[t.id]=toLrc(arr);
      var k=Object.keys(lyc);if(k.length>150)k.slice(0,k.length-150).forEach(function(x){delete lyc[x]});
      ls.set('ly',lyc);ls.set('ly62',FLAG);
      try{var E=ls.get('ly50e',{})||{};if(E[t.id]){delete E[t.id];ls.set('ly50e',E)}}catch(e3){}
      lyS[t.id]='ok';delete ly2[t.id];lyI=-1;
    }catch(e){
      if(mode==='t'&&lyS[t.id]==='load')lyS[t.id]='none';
      await info(errMsg(e));
    }finally{
      busy[t.id]=0;redraw(t);
    }
  };

  /* ---------- panel lirik: catatan + tombol ---------- */
  function btn(mode,label,hint){
    return'<div class="ly50a"><button class="btn g" onclick="ly62(\''+mode+'\')">'+label+'</button><small>'+hint+'</small></div>';
  }
  if(typeof lyHtml=='function'){
    var _lh=lyHtml;
    lyHtml=function(t,L){
      var h=_lh(t,L);
      try{
        if(!t)return h;
        var f=FLAG[t.id],note='';
        if(busy[t.id])note='Membaca audio di server… ini bisa makan waktu setengah menit.';
        else if(f==='a'&&L&&isLrc(L))note='Waktu lirik diselaraskan dengan audio (Whisper).';
        else if(f==='tf'&&L&&isLrc(L))note='Dibuat otomatis dari audio lalu dirapikan AI. Mungkin masih ada kata yang salah dengar.';
        else if(f==='t'&&L&&isLrc(L))note='Dibuat otomatis dari audio (AI). Mungkin ada kata yang salah dengar.';
        if(note){h=h.replace(/<div class="ly50n">[^<]*<\/div>/,'');return'<div class="ly50n">'+note+'</div>'+h}
        if(eligible(t)){
          if(/Lirik belum tersedia/.test(h))h+=btn('t','✨ Buat lirik dari audio','Whisper (AI) di server membaca suaranya. Hasil disimpan dan dipakai bersama.');
          else if(L&&(!isLrc(L)||estimated(t)))h+=btn('a','🎯 Selaraskan waktu dengan audio','Waktu tiap baris dicocokkan dengan suara aslinya, bukan perkiraan.');
        }
      }catch(e){}
      return h;
    };
  }
  window.__ly62={align:align,linesFromSegments:linesFromSegments,toLrc:toLrc,lev1:lev1};
})();
