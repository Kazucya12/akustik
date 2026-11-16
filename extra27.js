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
