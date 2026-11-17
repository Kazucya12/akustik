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
