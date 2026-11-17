/* v4.36: Profil lengkap — foto profil, bio, dan daftar lagu favorit (maks 5). Data di ma_pf36 (ikut Cadangan Data). Dimuat setelah extra35.js. */
(function(){
  var st=document.createElement('style');
  st.textContent='.x36a{width:104px;height:104px;border-radius:50%;margin:6px auto;background:linear-gradient(135deg,var(--p),var(--p2)) center/cover;display:grid;place-items:center;font-size:40px;font-weight:700;color:#fff}.x36h{font-size:13px;color:var(--mu);margin:14px 0 6px}.x36r.on{outline:2px solid var(--p2);border-radius:14px}.x36c{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.x36c .btn{flex:none;padding:9px 14px;font-size:13px}.x36b{margin:6px 0 10px;line-height:1.6;font-size:14px}';
  document.head.appendChild(st);
  var PF=ls.get('pf36',{photo:'',bio:'',top:[]});if(!Array.isArray(PF.top))PF.top=[];
  var E=null;
  function cap(){var n=document.getElementById('x36n'),b=document.getElementById('x36b');if(n)E.name=n.value;if(b)E.bio=b.value}
  function cands(){var a=favs.map(rs).concat(hist.map(rs),sg()),seen={},o=[];a.forEach(function(t){if(t&&!t.radio&&!seen[t.id]){seen[t.id]=1;o.push(t)}});return o.slice(0,40)}
  function render(){
    var h=shd('Edit profil')+'<div style="text-align:center"><div class="x36a"'+(E.photo?' style="background-image:url('+E.photo+')"':'')+'>'+(E.photo?'':esc((E.name||nm())[0]||'?'))+'</div>'+
      '<div class="x36c"><label class="btn g">📷 '+(E.photo?'Ganti foto':'Pilih foto')+'<input type="file" accept="image/*" hidden onchange="x36p(this.files[0])"></label>'+(E.photo?'<button class="btn g" onclick="x36d()">Hapus foto</button>':'')+'</div></div>'+
      '<div class="x36h">Nama</div><input class="in" id="x36n" maxlength="30" placeholder="Nama panggilan" value="'+esc(E.name)+'">'+
      '<div class="x36h">Bio</div><textarea class="in" id="x36b" rows="3" maxlength="120" placeholder="Ceritakan seleramu, maks 120 karakter">'+esc(E.bio)+'</textarea>'+
      '<div class="x36h">Lagu favorit ('+E.top.length+'/5)</div>'+
      (E.L.length?E.L.map(function(t,i){var k=E.top.indexOf(t.id);return '<div class="rw x36r'+(k>=0?' on':'')+'" onclick="x36t('+i+')"><img src="'+esc(cov(t))+'"><div><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small></div><span class="ph">'+(k>=0?'✓ '+(k+1):'')+'</span></div>'}).join(''):'<div class="em">Putar atau favoritkan beberapa lagu dulu, lalu pilih di sini.</div>')+
      '<button class="btn" style="margin-top:14px" onclick="x36s()">Simpan profil</button>';
    var v=document.getElementById('sp'),y=v?v.scrollTop:0;sub(h);if(v)v.scrollTop=y}
  window.goEditPf36=function(){rbP=0;E={photo:PF.photo||'',bio:PF.bio||'',name:cfg.name||'',top:[],L:cands()};
    (PF.top||[]).map(rs).filter(Boolean).forEach(function(t){if(E.L.every(function(x){return x.id!=t.id}))E.L.unshift(t);E.top.push(t.id)});render()};
  window.setName=window.goEditPf36;
  window.x36t=function(i){cap();var id=E.L[i].id,k=E.top.indexOf(id);if(k>=0)E.top.splice(k,1);else if(E.top.length<5)E.top.push(id);else toast('Maksimal 5 lagu');render()};
  window.x36d=function(){cap();E.photo='';render()};
  window.x36p=function(f){if(!f)return;cap();var u=URL.createObjectURL(f),im=new Image();
    im.onload=function(){var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d'),s=Math.min(im.width,im.height);
      x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);E.photo=c.toDataURL('image/jpeg',.82);URL.revokeObjectURL(u);render()};
    im.onerror=function(){toast('Foto tidak bisa dibuka')};im.src=u};
  window.x36s=function(){cap();var byId={};E.L.forEach(function(t){byId[t.id]=t});
    PF={photo:E.photo,bio:String(E.bio||'').trim().slice(0,120),top:E.top.map(function(id){return svt(byId[id])}).filter(Boolean)};
    ls.set('pf36',PF);cfg.name=String(E.name||'').trim().slice(0,30);ls.set('cfg',cfg);E=null;toast('Profil disimpan');csp0();go(pg)};

  function apply(){try{
    [].forEach.call(document.querySelectorAll('.av'),function(a){
      if(PF.photo){a.style.backgroundImage='url('+PF.photo+')';a.style.backgroundSize='cover';a.style.backgroundPosition='center';a.style.color='transparent'}
      else if(a.style.backgroundImage){a.style.backgroundImage='';a.style.color=''}});
    var v=document.getElementById('v');if(!v)return;var h=v.querySelector('h1');
    if(!h||h.textContent!=='Profil'||v.querySelector('[data-x36]'))return;
    var c=v.querySelector('.pcard');if(!c)return;
    var sm=c.querySelector('small');if(sm)sm.textContent=PF.bio||'Ketuk foto atau tombol Edit untuk mengisi bio';
    var T=(PF.top||[]).map(rs).filter(Boolean),d=document.createElement('div');d.setAttribute('data-x36','1');
    d.innerHTML='<div class="x36c" style="margin:10px 0"><button class="btn g" onclick="goEditPf36()">✎ Edit profil</button></div>'+
      (T.length?'<div class="sec"><h3>🎵 Lagu favoritku</h3></div>'+rows('x36',T):'');
    c.parentNode.insertBefore(d,c.nextSibling)}catch(e){}}
  var it;try{new MutationObserver(function(){clearTimeout(it);it=setTimeout(apply,120)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
  apply();
})();
