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
