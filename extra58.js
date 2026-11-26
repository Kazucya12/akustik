/* Loopify v4.51 - Profil dan Library dirapikan (pasangan extra57.js untuk Pengaturan).
   Profil: menu yang tadinya berderet panjang dikelompokkan jadi 3 grup lipat (Aktivitas, Musik & Suara, Akun & Data);
           baris "Pengaturan" dihapus karena sudah ada ikon ⚙ di pojok atas.
   Library: tab diurutkan Playlist, Album, Artis, Lagu, Unduhan, Video (Favorit tetap bisa dibuka lewat kartu "Lagu Disukai"
           di tab Playlist, dan chip-nya muncul kalau sedang dibuka); urut + filter + alat di tab Lagu dilipat jadi satu panel.
   Hanya memindahkan elemen yang sudah dibuat modul lain, jadi fungsi tidak berubah. Dimuat setelah extra57.js. */
(function(){
  'use strict';
  var GROUPS=[['akt','Aktivitas'],['musik','Musik & Suara'],['akun','Akun & Data']];
  var MAP={goHist:'akt',goKolase34:'akt',goStat:'akt',rekap32:'akt',goStreak32:'akt',goChal43:'akt',goBadge43:'akt',
    goOff41:'musik',goEq:'musik',goFocus33:'musik',
    lgOpen:'akun',lgOut:'akun',goBk:'akun',impOpen:'akun'};
  var ORDER=['goHist','goKolase34','goStat','rekap32','goStreak32','goChal43','goBadge43','goOff41','goEq','goFocus33','lgOpen','lgOut','goBk','impOpen'];
  var TABS=['Playlist','Album','Artis','Lagu','Unduhan','Video'];

  function kids(e){return Array.prototype.slice.call(e.children||[])}
  function all(r,o){o=o||[];kids(r).forEach(function(c){o.push(c);all(c,o)});return o}
  function cls(e){return typeof e.className==='string'?e.className:''}
  function has(e,c){return(' '+cls(e)+' ').indexOf(' '+c+' ')>=0}
  function txt(e){return(e.textContent||'').trim()}
  function fn(e){var o=e.getAttribute?e.getAttribute('onclick'):'',m=/^\s*(\w+)\(/.exec(o||'');return m?m[1]:''}
  var OPEN={}; /* tidak disimpan: grup tertutup lagi setelah pindah halaman */
  function isOpen(k){return !!OPEN[k]}
  function title(A,t){for(var i=0;i<A.length;i++)if(A[i].tagName==='H1'&&txt(A[i])===t)return A[i];return null}
  function small(e){var A=all(e);for(var i=0;i<A.length;i++)if(A[i].tagName==='SMALL')return txt(A[i]);return''}
  function sameList(a,b){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}

  function makeBox(k,name){
    var on=isOpen(k),box=document.createElement('div');
    box.className='x57g'+(on?' on':'');box.setAttribute('data-g',k);
    var b=document.createElement('button');b.type='button';b.className='x57h';
    b.setAttribute('aria-expanded',on?'true':'false');b.setAttribute('onclick',"x58T('"+k+"')");
    var t=document.createElement('span');t.className='x57t';t.textContent=name;
    var s=document.createElement('small');s.className='x57s';
    var i=document.createElement('i');i.className='x57c';i.setAttribute('aria-hidden','true');
    b.appendChild(t);b.appendChild(s);b.appendChild(i);
    var body=document.createElement('div');body.className='x57b';
    box.appendChild(b);box.appendChild(body);
    return box;
  }
  function boxParts(box){var k=kids(box);return{head:k[0],sum:kids(k[0])[1],body:k[1]}}
  function setSum(box,v){var s=boxParts(box).sum;if(s&&s.textContent!==v)s.textContent=v}

  /* ---------- Profil ---------- */
  function sumProfil(g,rows){
    var i,r;
    if(g==='akt'){for(i=0;i<rows.length;i++)if(fn(rows[i])==='goChal43'){r=small(rows[i]).replace(' selesai minggu ini','');if(r)return'Tantangan '+r}return rows.length+' menu'}
    if(g==='musik'){for(i=0;i<rows.length;i++)if(fn(rows[i])==='goOff41'){r=small(rows[i]);if(r)return'Unduhan '+r}return rows.length+' menu'}
    for(i=0;i<rows.length;i++){
      if(fn(rows[i])==='lgOut'){var d=all(rows[i]).filter(function(e){return e.tagName==='DIV'})[0];r=d&&d.firstChild?(d.firstChild.textContent||'').trim():'';return r||'Sudah masuk'}
      if(fn(rows[i])==='lgOpen')return'Belum masuk';
    }
    return rows.length+' menu';
  }
  function profil(v){
    var A=all(v);if(!title(A,'Profil'))return;
    var rows=A.filter(function(e){return has(e,'ft')&&MAP[fn(e)]});
    var dup=A.filter(function(e){return has(e,'ft')&&fn(e)==='goSet'});
    if(!rows.length&&!dup.length)return;
    var wrap=A.filter(function(e){return has(e,'x58w')})[0],boxes={},changed=false;
    if(!wrap){
      if(!rows.length)return;
      wrap=document.createElement('div');wrap.className='x58w';
      rows[0].parentNode.insertBefore(wrap,rows[0]);
      GROUPS.forEach(function(g){boxes[g[0]]=makeBox(g[0],g[1]);wrap.appendChild(boxes[g[0]])});
      changed=true;
    }else{
      kids(wrap).forEach(function(b){boxes[b.getAttribute('data-g')]=b});
    }
    GROUPS.forEach(function(g){
      var want=rows.filter(function(r){return MAP[fn(r)]===g[0]}).sort(function(a,b){return ORDER.indexOf(fn(a))-ORDER.indexOf(fn(b))});
      var box=boxes[g[0]],body=boxParts(box).body;
      /* Bandingkan hanya baris yang dikenal: elemen lain di dalam grup tidak boleh memicu pemindahan berulang tanpa henti. */
      var now=kids(body).filter(function(r){return want.indexOf(r)>=0});
      if(!sameList(now,want)){want.forEach(function(r){body.appendChild(r)});changed=true}
      var show=want.length?'':'none';if(box.style.display!==show)box.style.display=show;
      setSum(box,sumProfil(g[0],want));
    });
    dup.forEach(function(e){if(e.parentNode){e.parentNode.removeChild(e);changed=true}});
    return changed;
  }

  /* ---------- Library ---------- */
  function tabRow(A){
    return A.filter(function(e){if(!has(e,'chips'))return false;var t=kids(e).map(txt);return t.indexOf('Playlist')>=0&&t.indexOf('Lagu')>=0})[0];
  }
  function tabOrder(chips){
    var out=[],used=[];
    TABS.forEach(function(t){
      chips.forEach(function(c){if(txt(c)===t){out.push(c);used.push(c)}});
      if(t==='Playlist')chips.forEach(function(c){if(txt(c)==='Favorit'&&has(c,'a')){out.push(c);used.push(c)}});
    });
    chips.forEach(function(c){if(used.indexOf(c)<0&&txt(c)!=='Favorit')out.push(c)});
    return out;
  }
  function activeText(row){var k=kids(row).filter(function(c){return has(c,'a')})[0];return k?txt(k):''}
  function library(v){
    var A=all(v);if(!title(A,'Library'))return;
    var changed=false,row=tabRow(A);
    if(row){
      var cur=kids(row),want=tabOrder(cur);
      if(!sameList(cur,want)){
        cur.forEach(function(c){if(want.indexOf(c)<0)row.removeChild(c)});
        want.forEach(function(c){row.appendChild(c)});
        changed=true;
      }
    }
    var f=A.filter(function(e){return has(e,'chips')&&has(e,'x29f')})[0];
    if(f&&!A.some(function(e){return has(e,'x58fp')})&&f.parentNode){
      var p=f.parentNode,ks=kids(p),i=ks.indexOf(f);
      var sort=(i>0&&has(ks[i-1],'chips'))?ks[i-1]:null,tools=(i+1<ks.length&&has(ks[i+1],'x29t'))?ks[i+1]:null;
      var box=makeBox('f','Filter & urutkan'),body=boxParts(box).body,ref=sort||f;
      box.className+=' x58fp';
      var a=[];if(sort&&activeText(sort))a.push(activeText(sort));
      var ft=activeText(f);if(ft&&ft!=='Semua')a.push(ft);
      setSum(box,a.join(' \u00B7 '));
      p.insertBefore(box,ref);
      if(sort)body.appendChild(sort);body.appendChild(f);if(tools)body.appendChild(tools);
      changed=true;
    }
    return changed;
  }

  window.x58T=function(k){
    try{
      var v=document.getElementById('v'),box=v&&all(v).filter(function(e){return has(e,'x57g')&&e.getAttribute('data-g')===k})[0];
      if(!box)return;
      var on=!has(box,'on');
      if(on)box.className+=' on';else box.className=cls(box).replace(/(^|\s)on(?=\s|$)/g,'');
      var b=boxParts(box).head;if(b)b.setAttribute('aria-expanded',on?'true':'false');
      OPEN[k]=on;
    }catch(e){}
  };

  /* Dicek langsung (tanpa mengubah tampilan) supaya pindah halaman secepat apa pun tetap menutup grup. */
  function forget(v){
    var A=all(v);
    if(!title(A,'Profil'))OPEN.akt=OPEN.musik=OPEN.akun=false;
    if(!title(A,'Library'))OPEN.f=false;
  }
  var tm;
  function run(){
    var v1=document.getElementById('v');if(v1)forget(v1);
    clearTimeout(tm);
    tm=setTimeout(function(){
      try{
        var v=document.getElementById('v');if(!v)return;
        profil(v);library(v);
      }catch(e){console.error('[loopify] x58',e)}
    },120);
  }
  var v0=document.getElementById('v');
  if(v0&&window.MutationObserver)new MutationObserver(run).observe(v0,{childList:true,subtree:true});
  run();
  window.x58=window.x58||{};window.x58.profil=profil;window.x58.library=library;window.x58.tabOrder=tabOrder;
})();
