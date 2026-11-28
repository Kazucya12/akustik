/* Loopify v4.54 - ganti emoji/simbol di tombol, chip, dan pintasan dengan ikon garis (gaya sama dengan navigasi bawah).
   Hanya menyentuh .btn .chip .sp-i .ib .obe dan sampul lagu bawaan (.rw img); teks lain tidak diubah. Aman dijalankan berulang (tidak mengubah yang sudah bersih). */
(function(){
  'use strict';
  var A='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  function svg(d,n){return '<svg class="x65i" width="'+(n||18)+'" height="'+(n||18)+'" viewBox="0 0 24 24" '+A+' aria-hidden="true">'+d+'</svg>'}
  var D={
    play:'<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    car:'<path d="M5 17h14M6 17l1-6h10l1 6M7.5 11L9 7h6l1.5 4"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/>',
    moon:'<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    award:'<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
    pencil:'<path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    heart:'<path d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 00-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 000-7.1z" fill="currentColor"/>',
    shuffle:'<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    trend:'<path d="M7 17L17 7M8 7h9v9"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    check:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'
  };
  var BTN={'▶':'play','🚗':'car','😴':'moon','🏅':'award','🖼':'image','✎':'pencil'};
  var SPI={'♥':'heart','⤮':'shuffle','↗':'trend','▶':'play'};
  var IB={'☀':'sun','🌙':'moon','⚙':'gear','🚗':'car','👤':'user','☑':'check'};
  var EM='(?:[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B50}])\\uFE0F?(?:\\u200D[\\u{1F000}-\\u{1FAFF}\\u2640\\u2642\\u2695-\\u2708]\\uFE0F?)*';
  var RE_ALL=new RegExp(EM+'\\s*','gu');
  var RE_LEAD=new RegExp('^\\s*(▶|'+EM+')\\s*','u');

  function textNodes(el){
    var o=[],n=el.firstChild;
    for(;n;n=n.nextSibling)if(n.nodeType===3)o.push(n);
    return o;
  }
  function fixBtn(b){
    var t=b.firstChild;
    if(!t||t.nodeType!==3)return;
    var m=t.nodeValue.match(RE_LEAD);
    if(!m)return;
    var k=BTN[m[1].replace(/\uFE0F/g,'')];
    t.nodeValue=t.nodeValue.slice(m[0].length);
    textNodes(b).forEach(function(n){n.nodeValue=n.nodeValue.replace(RE_ALL,'')});
    if(k)b.insertAdjacentHTML('afterbegin',svg(D[k]));
  }
  function fixChip(c){
    textNodes(c).forEach(function(n){
      if(RE_ALL.test(n.nodeValue)){RE_ALL.lastIndex=0;n.nodeValue=n.nodeValue.replace(RE_ALL,'').replace(/^\s+/,'')}
      RE_ALL.lastIndex=0;
    });
  }
  function fixIcon(el,map,size){
    var s=el.textContent.trim();
    if(el.children.length||!map[s])return;
    el.innerHTML=svg(D[map[s]],size);
  }
  function fixObe(e){
    if(e.querySelector('img'))return;
    var s=e.textContent.trim();
    if(!s)return;
    e.innerHTML='<img class="x65logo" src="icon-192.png" alt="" onerror="this.style.display=\'none\'">';
  }
  /* sampul lagu tanpa gambar: petak netral dengan huruf awal judul (bukan ikon not yang sama untuk semua) */
  function fixThumb(img){
    var s=img.getAttribute('src')||'';
    if(s.indexOf('data:image/svg+xml')!==0||s.indexOf('M40%2070V32')<0)return;
    var par=img.parentElement,b=par&&par.querySelector('.pt,b,strong,h2,h3'),t=((b&&b.textContent)||img.alt||'').trim();
    if(!t&&img.closest('.disc')){var pt=document.querySelector('#pl .pt');if(pt)t=pt.textContent.trim()}
    if(!t){try{if(typeof cur!=='undefined'&&cur&&cur.title)t=String(cur.title)}catch(e){}}
    var ch=(t.match(/[A-Za-z0-9]/)||['\u266A'])[0].toUpperCase(),h=0,i;
    for(i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%360;
    img.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl('+h+',16%,22%)"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="36" fill="hsl('+h+',28%,78%)">'+ch+'</text></svg>');
  }
  function scan(root){
    var q=(root||document).querySelectorAll('.btn,.chip,.sp-i,.ib,.obe,img[src^="data:image/svg+xml"],.ov button,.ov span,.ov i,.hd button,.wr-c b'),i,e;
    for(i=0;i<q.length;i++){
      e=q[i];
      if(e.tagName==='IMG')fixThumb(e);
      else if(e.tagName==='B'&&e.parentElement&&e.parentElement.classList.contains('wr-c')){if(e.textContent.trim()==='Loopify Wrapped')e.textContent='Rekap Dengar'}
      else if(e.classList.contains('obe'))fixObe(e);
      else if(e.classList.contains('sp-i'))fixIcon(e,SPI,20);
      else if(e.classList.contains('ib')||(!e.children.length&&IB[e.textContent.trim()]))fixIcon(e,IB,20);
      else if(e.classList.contains('chip'))fixChip(e);
      else if(e.classList.contains('btn'))fixBtn(e);
    }
  }
  var pend=0;
  function later(){if(pend)return;pend=1;requestAnimationFrame(function(){pend=0;try{scan(document.body)}catch(e){}})}
  try{
    new MutationObserver(later).observe(document.body,{childList:true,subtree:true,characterData:true});
    scan(document.body);
  }catch(e){}
})();
