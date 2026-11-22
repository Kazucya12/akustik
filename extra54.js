/* Loopify v4.47 - Mode mobil: lirik besar yang berjalan + layar tetap menyala (di APK lewat LoopifyNative.awake).
   Menambah dua baris di bawah artis pada layar mode mobil (extra30.js): baris yang sedang dinyanyikan dan baris berikutnya.
   Jam dan tombol juga dibuat lebih besar. Tanpa lirik, area itu kosong. */
(function(){
  'use strict';
  if(typeof window.x30Car!=='function')return;
  var N=window.LoopifyNative,iv=0,lc='',ln='';

  function css(){
    if(document.getElementById('x54css'))return;
    var s=document.createElement('style');s.id='x54css';
    s.textContent='#x30car .x30clk{font-size:clamp(28px,9vw,56px);font-weight:300;color:#dde;letter-spacing:.02em}'+
      '#x54ly{width:100%;text-align:center;display:flex;flex-direction:column;gap:6px;min-height:4.4em;justify-content:center}'+
      '#x54ly .c{font-size:clamp(22px,6.4vw,38px);font-weight:800;line-height:1.15;color:#fff}'+
      '#x54ly .n{font-size:clamp(15px,4.4vw,24px);font-weight:700;line-height:1.2;color:#778}'+
      '@media (orientation:landscape){#x54ly{min-height:3.6em}}';
    document.head.appendChild(s);
  }
  function build(){
    var car=document.getElementById('x30car');
    if(!car||car.querySelector('#x54ly'))return;
    var a=car.querySelector('.x30a');if(!a||!a.parentNode)return;
    var d=document.createElement('div');d.id='x54ly';d.innerHTML='<div class="c" id="x54c"></div><div class="n" id="x54n"></div>';
    a.parentNode.insertBefore(d,a.nextSibling);
  }
  function stop(){clearInterval(iv);iv=0}
  function tick(){
    var car=document.getElementById('x30car');
    if(!car||!car.classList.contains('on')){stop();return}
    try{
      var c=document.getElementById('x54c'),n=document.getElementById('x54n');if(!c||!n)return;
      var a='',b='';
      if(cur&&!cur.radio&&typeof alOf==='function'&&typeof act!=='undefined'&&act){
        var al=alOf(cur);
        if(al&&al.length){
          var ct=act.currentTime+.25,i=-1;
          for(var k=0;k<al.length;k++){if(al[k].t<=ct)i=k;else break}
          a=i>=0?String(al[i].s||'♪'):'♪';
          b=al[i+1]?String(al[i+1].s||''):'';
        }
      }
      if(a!==lc){lc=a;c.textContent=a}
      if(b!==ln){ln=b;n.textContent=b}
    }catch(e){}
  }

  var _on=window.x30Car;
  window.x30Car=function(){
    _on.apply(this,arguments);
    try{css();build();lc='\u0000';ln='\u0000';stop();iv=setInterval(tick,300);tick()}catch(e){}
    try{if(N&&N.awake)N.awake(true)}catch(e){}
  };
  var _off=window.x30CarOff;
  window.x30CarOff=function(){
    stop();
    try{if(_off)_off.apply(this,arguments)}catch(e){}
    try{if(N&&N.awake)N.awake(false)}catch(e){}
  };
})();
