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
