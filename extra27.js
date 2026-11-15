/* v4.25: tetap memutar saat layar mati / aplikasi di latar belakang (APK WebView).
   1) Pemutar YouTube yang dijeda sistem (bukan oleh pengguna) dilanjutkan otomatis.
   2) Audio senyap berulang menjaga WebView tetap dianggap "sedang memutar" oleh Android.
   Dimuat setelah extra26.js. */
(function(){
  var want=false,lastUser=0,silent=null;
  function mkSilent(){
    if(silent)return silent;
    try{
      var n=8000,b=new Uint8Array(44+n),d=new DataView(b.buffer);
      var w=function(o,s){for(var i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i)};
      w(0,'RIFF');d.setUint32(4,36+n,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);
      d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);w(36,'data');d.setUint32(40,n,true);
      for(var i=0;i<n;i++)b[44+i]=128;
      var s='';for(i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);
      silent=new Audio('data:audio/wav;base64,'+btoa(s));silent.loop=true;silent.volume=.01;
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
  document.addEventListener('visibilitychange',function(){
    if(document.hidden&&ytOn()&&want){setTimeout(function(){try{if(want&&yp.getPlayerState()===2)yp.playVideo()}catch(e){}},400)}
  });
})();
