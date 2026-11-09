/* Midnight Acoustic - pintasan keyboard untuk versi website (tidak aktif saat mengetik di kolom input) */
(function(){
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    var t=e.target,tag=t&&t.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    var k=e.key;
    if(k===' '||k==='k'||k==='K'){e.preventDefault();toggle();}
    else if(k==='ArrowRight'){if(act&&isFinite(act.duration)){e.preventDefault();act.currentTime=Math.min(act.duration,act.currentTime+5);}}
    else if(k==='ArrowLeft'){if(act){e.preventDefault();act.currentTime=Math.max(0,act.currentTime-5);}}
    else if(k==='n'||k==='N'){nxt(1);}
    else if(k==='p'||k==='P'){nxt(-1);}
    else if(k==='/'){e.preventDefault();go('explore');setTimeout(function(){var i=document.querySelector('#v input');if(i)i.focus();},120);}
    else if(k==='Escape'){var o=document.querySelector('.ov.on');if(o)ovc();}
  });
})();
