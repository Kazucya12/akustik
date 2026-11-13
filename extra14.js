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
      if(t.yt){
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
