/* Loopify — MusicAPI / YouTube Music integration */
(function(){
  'use strict';
  var KEY='ma_musicapi_uuid', NAME='ma_musicapi_name';
  function getId(){try{return localStorage.getItem(KEY)||''}catch(e){return ''}}
  function setId(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function clearId(){try{localStorage.removeItem(KEY);localStorage.removeItem(NAME)}catch(e){}}
  function decode64(s){var b=atob(s.replace(/-/g,'+').replace(/_/g,'/'));var bytes=Uint8Array.from(b,function(c){return c.charCodeAt(0)});return new TextDecoder().decode(bytes)}
  function callback(){
    var p=new URLSearchParams(location.search), data=p.get('data64');
    if(!data)return;
    try{
      var obj=JSON.parse(decode64(data));
      if(obj && obj.authModel && obj.authModel.status==='success' && obj.integration && obj.integration.type==='youtube' && obj.integrationUserUUID){
        setId(obj.integrationUserUUID); toast('YouTube Music berhasil dihubungkan');
      } else { toast('Autentikasi YouTube Music belum berhasil'); }
    }catch(e){toast('Data autentikasi MusicAPI tidak valid')}
    p.delete('data64');p.delete('musicapi_callback');var q=p.toString();history.replaceState({},'',location.pathname+(q?'?'+q:'')+location.hash);
  }
  async function api(action){
    var id=getId(); if(action!=='auth'&&!id)throw new Error('Hubungkan akun YouTube Music terlebih dahulu.');
    var url='/api/musicapi?action='+encodeURIComponent(action)+(id?'&uuid='+encodeURIComponent(id):'');
    var r=await fetch(url,{cache:'no-store'}),j=await r.json().catch(function(){return {}});
    if(!r.ok)throw new Error(j.error||'Permintaan MusicAPI gagal ('+r.status+').'); return j;
  }
  window.musicApiConnect=async function(){try{var j=await api('auth');location.href=j.authUrl}catch(e){toast(e.message||'Gagal membuka autentikasi MusicAPI')}};
  window.musicApiDisconnect=async function(){if(!confirm('Putuskan koneksi YouTube Music dari perangkat ini?'))return;clearId();toast('Koneksi YouTube Music diputus');render();};
  function extractArray(j){if(Array.isArray(j))return j;for(var k of ['data','items','playlists','tracks','results'])if(j&&Array.isArray(j[k]))return j[k];return []}
  function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function render(){
    if(typeof pg!=='undefined'&&pg!=='profile')return;
    var v=document.getElementById('v');if(!v||!v.querySelector('h1')||v.querySelector('h1').textContent.trim()!=='Profil')return;
    var old=v.querySelector('[data-musicapi]');if(old)old.remove();
    var anchor=v.querySelector('.gg');if(!anchor)return;
    var id=getId(), box=document.createElement('div');box.setAttribute('data-musicapi','1');box.className='pcard';box.style.margin='12px 0';
    box.innerHTML='<div style="display:flex;align-items:center;gap:12px"><div style="font-size:25px">♫</div><div style="flex:1;min-width:0"><b>YouTube Music</b><br><small style="color:var(--mu)">'+(id?'Akun terhubung':'Hubungkan akun melalui MusicAPI')+'</small></div><span style="font-size:11px;color:'+(id?'#25b879':'var(--mu)')+'">'+(id?'TERHUBUNG':'BELUM')+'</span></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+(id?'<button class="btn" style="flex:1" onclick="musicApiLoad(\'playlists\')">Playlist</button><button class="btn g" style="flex:1" onclick="musicApiLoad(\'liked\')">Lagu disukai</button><button class="btn g" onclick="musicApiDisconnect()">Putuskan</button>':'<button class="btn" style="width:100%" onclick="musicApiConnect()">Hubungkan YouTube Music</button>')+'</div><div id="musicapi-results" style="margin-top:10px"></div>';
    anchor.insertAdjacentElement('afterend',box);
  }
  window.musicApiLoad=async function(kind){
    var out=document.getElementById('musicapi-results');if(!out)return;out.innerHTML='<small>Memuat data YouTube Music…</small>';
    try{var j=await api(kind),a=extractArray(j);if(!a.length){out.innerHTML='<small style="color:var(--mu)">Belum ada data atau respons kosong dari MusicAPI.</small>';return;}
      out.innerHTML='<div style="font-weight:700;margin:8px 0">'+(kind==='playlists'?'Playlist YouTube Music':'Lagu yang disukai')+' ('+a.length+')</div>'+a.slice(0,30).map(function(x){var title=x.title||x.name||x.playlistName||x.track&&x.track.title||'Tanpa judul';var sub=x.artist||x.description||x.owner&&x.owner.name||x.track&&x.track.artist||'';return '<div style="padding:9px 0;border-top:1px solid var(--b);display:flex;gap:10px;align-items:center"><div style="width:34px;height:34px;border-radius:9px;background:var(--c);display:grid;place-items:center">♫</div><div style="min-width:0"><b style="font-size:13px">'+safe(title)+'</b><br><small style="color:var(--mu)">'+safe(sub)+'</small></div></div>'}).join('');
    }catch(e){out.innerHTML='<small style="color:#e77">'+safe(e.message)+'</small>'}
  };
  var oldGo=window.go;if(typeof oldGo==='function'){window.go=function(p){oldGo(p);setTimeout(render,0)}}
  callback();setTimeout(render,150);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(render,100)});
})();
