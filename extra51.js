/* Loopify v4.41 - Album penuh dipecah jadi lagu per track (seperti Spotify).
   Server (api/yt-music.js) membaca daftar waktu di deskripsi video panjang dan mengirim `tracks: [[mulai, selesai, judul], ...]`.
   Di sini tiap track menjadi lagu sendiri di hasil pencarian. Videonya tetap satu: pemutar hanya loncat ke detik mulai track,
   dan pindah ke track berikutnya saat detik selesai tercapai. Durasi, posisi, lirik, dan layar kunci memakai waktu track (bukan waktu video).
   Album tanpa daftar waktu tetap tampil sebagai satu video, seperti sebelumnya. */
(function(){
  'use strict';
  var MAXALB=2; /* album yang dipecah per pencarian (supaya daftar tidak membanjir) */

  /* ---------- 1. Pencarian: pecah album jadi track ---------- */
  function expand(arr){
    var out=[],n=0;
    arr.forEach(function(x){
      var tr=x&&Array.isArray(x.tracks)?x.tracks:null;
      if(!tr||!tr.length||n>=MAXALB){out.push(mkV(x.id,x.title,x.artist));return}
      n++;
      tr.forEach(function(t,i){
        var v=mkV(x.id,t[2],x.artist);
        v.id='y'+x.id+'@'+t[0];  /* id unik per track (video yang sama bisa punya banyak track) */
        v.ss=t[0];v.se=t[1];     /* detik mulai & selesai di dalam video */
        v.alb=String(x.title||'').slice(0,120);v.tn=i+1;
        out.push(v);
      });
    });
    return out;
  }
  ytSearch=async function(s,o,m){
    for(const u of ['/api/yt-music','/api/yt-search']){
      const r=await fetch(u+'?q='+encodeURIComponent(s)+(o?'&order='+o:'')+(m=='v'?'':'&songs='+(m==2?2:1)));
      if(r.status==404)continue;
      if(!r.ok){let c='',d='';try{const j=await r.json();c=j.code||'';d=j.error||''}catch(e){}throw Object.assign(new Error('yt'),{status:r.status,code:c,detail:d})}
      return expand(arrOf(await r.json()));
    }
    throw Object.assign(new Error('yt'),{status:404});
  };

  /* ---------- 2. Pemutar: waktu relatif terhadap track ---------- */
  function trk(){return cur&&cur.se&&act===yAct?cur:null}
  function raw(){try{return yp.getCurrentTime()||0}catch(e){return 0}}
  function dsc(k,g,s){var d=Object.getOwnPropertyDescriptor(yAct,k)||{};Object.defineProperty(yAct,k,{configurable:true,enumerable:true,get:g(d.get),set:s?s(d.set):d.set})}
  dsc('currentTime',function(og){return function(){
    var t=trk();if(!t)return og.call(yAct);
    return Math.max(0,Math.min(raw()-t.ss,t.se-t.ss));
  }},function(os){return function(v){
    var t=trk();if(!t){os.call(yAct,v);return}
    v=Math.max(0,Math.min(+v||0,t.se-t.ss-1));
    try{yp.seekTo(t.ss+v,true)}catch(e){}
  }});
  dsc('duration',function(og){return function(){
    var t=trk();return t?t.se-t.ss:og.call(yAct);
  }});

  /* ---------- 3. Mulai track: loncat ke detik mulai (tanpa memuat ulang video yang sama) ---------- */
  var fk='';
  var _vL=vLoad;
  vLoad=function(id){
    var t=cur&&cur.se&&vidOf(cur)===id?cur:null;
    if(t){
      var off=vS0>0?vS0:0;vS0=0;fk='';
      try{
        if(yp&&yp.getVideoData&&yp.getVideoData().video_id===id&&yp.seekTo){yp.seekTo(t.ss+off,true);yp.playVideo();return}
      }catch(e){}
      vS0=t.ss+off;
    }
    return _vL(id);
  };

  /* ---------- 4. Akhir track: lanjut ke track berikutnya ---------- */
  setInterval(function(){
    var t=trk();
    if(!t||!vPlaying())return;
    var c=raw();
    if(c<t.se-1.5){fk='';return}
    if(c<t.se-.35||fk===t.id)return;
    var d=0;try{d=yp.getDuration()||0}catch(e){}
    if(d&&t.se>=d-1.5)return; /* track terakhir sampai akhir video: biarkan peristiwa "selesai" YouTube yang menanganinya */
    fk=t.id;
    try{vSt({data:0})}catch(e){}
    /* antrean habis dan tidak diulang: hentikan, jangan biarkan video lanjut ke bagian luar track */
    if(cur===t&&rep!=2&&slEnd!=-1){try{yp.pauseVideo()}catch(e){}}
  },300);
})();
