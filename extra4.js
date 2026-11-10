/* Midnight Acoustic v3.5 - Daftar & Masuk (username/email + password, email diverifikasi kode Gmail). Dimuat setelah extra3.js.
   Sesi disimpan di localStorage kunci "mx_auth" (bukan awalan ma_), jadi tidak ikut Cadangan Data. */
(function(){
  var KEY='mx_auth',SKIP='mx_authskip',tm=0,st={step:'login',email:'',busy:0};
  function rd(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
  function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function rm(k){try{localStorage.removeItem(k)}catch(e){}}
  function sess(){var a=rd(KEY);return a&&a.email&&a.session&&a.exp>Date.now()?a:null}
  function api(body){
    return fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw{status:r.status,msg:j.error||'Terjadi kesalahan'};return j})},
        function(){throw{status:0,msg:'Tidak ada koneksi atau server belum aktif'}});
  }
  function css(){
    if(document.getElementById('lgcss'))return;
    var s=document.createElement('style');s.id='lgcss';
    s.textContent='#lg{position:absolute;inset:0;z-index:95;display:grid;place-items:center;padding:24px;overflow-y:auto;background:radial-gradient(80% 40% at 80% 0,var(--o1),transparent 70%),radial-gradient(80% 40% at 0 100%,var(--o2),transparent 70%),var(--bg);transition:opacity .35s}'
    +'#lg.x{opacity:0;pointer-events:none}#lg .lgc{width:100%;max-width:360px;text-align:center;margin:auto}'
    +'#lg h2{margin:14px 0 6px;font-size:22px}#lg p{margin:0 0 18px;color:var(--mu);font-size:13px;line-height:1.5}'
    +'#lg .in{text-align:left;font-size:15px;margin-bottom:10px}#lg .in.cd{text-align:center;font-size:26px;letter-spacing:.45em;text-indent:.45em;font-weight:700}'
    +'#lg .er{min-height:18px;margin:0 0 8px;color:#ff8a8a;font-size:12px}'
    +'#lg .lk{display:block;margin-top:14px;font-size:12px;color:var(--mu);cursor:pointer;background:none;border:0;width:100%}#lg .lk[disabled]{opacity:.5;cursor:default}#lg .lk b{color:var(--p2)}';
    document.head.appendChild(s);
  }
  var $i=function(id){return document.getElementById(id)};
  function field(id,ph,type,ac,val){return '<input class="in" id="'+id+'" type="'+type+'" autocomplete="'+ac+'" placeholder="'+ph+'" value="'+esc(val||'')+'" autocapitalize="none" spellcheck="false">'}
  function on(id,fn){var e=$i(id);if(e)e.onclick=fn}
  function enter(fn){var l=document.querySelectorAll('#lg .in');for(var i=0;i<l.length;i++)l[i].onkeydown=function(e){if(e.key=='Enter')fn()}}
  function go2(s){st.step=s;clearInterval(tm);view()}
  function view(){
    var c=document.querySelector('#lg .lgc');if(!c)return;var L=typeof logo!=='undefined'?logo:'',s=st.step;
    if(s=='login'){
      c.innerHTML=L+'<h2>Masuk</h2><p>Masuk dengan username atau Gmail dan password.</p>'
        +field('lgi','Username atau Gmail','text','username')+field('lgp','Password','password','current-password')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Masuk</button>'
        +'<button class="lk" id="lgf">Lupa password?</button><button class="lk" id="lgg">Belum punya akun? <b>Daftar</b></button><button class="lk" id="lgs">Lanjut tanpa masuk</button>';
      on('lgb',login);on('lgf',function(){go2('rst')});on('lgg',function(){go2('reg')});on('lgs',skip);enter(login);
    }else if(s=='reg'){
      c.innerHTML=L+'<h2>Daftar</h2><p>Buat akun. Kami kirim kode ke Gmail kamu untuk verifikasi.</p>'
        +field('lgu','Username (huruf kecil, angka, . atau _)','text','username')+field('lge','nama@gmail.com','email','email',st.email)+field('lgp','Password (min. 8 karakter)','password','new-password')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Kirim Kode</button>'
        +'<button class="lk" id="lgg">Sudah punya akun? <b>Masuk</b></button><button class="lk" id="lgs">Lanjut tanpa masuk</button>';
      on('lgb',regStart);on('lgg',function(){go2('login')});on('lgs',skip);enter(regStart);
    }else if(s=='regc'||s=='rstc'){
      var rs=s=='rstc';
      c.innerHTML=L+'<h2>Cek Gmail kamu</h2><p>Kode 6 digit dikirim ke<br><b>'+esc(st.email)+'</b><br>Cek juga folder Spam.</p>'
        +'<input class="in cd" id="lgc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000">'
        +(rs?field('lgp','Password baru (min. 8 karakter)','password','new-password'):'')
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">'+(rs?'Ganti Password':'Verifikasi')+'</button>'
        +'<button class="lk" id="lgx" disabled></button><button class="lk" id="lgm">Kembali</button>';
      var go=rs?resetVerify:regVerify;on('lgb',go);on('lgm',function(){go2(rs?'rst':'reg')});enter(go);
      var i=$i('lgc');i.oninput=function(){i.value=i.value.replace(/\D/g,'').slice(0,6);if(!rs&&i.value.length==6)regVerify()};i.focus();
    }else{ // rst
      c.innerHTML=L+'<h2>Lupa password</h2><p>Masukkan Gmail akunmu. Kami kirim kode untuk membuat password baru.</p>'
        +field('lge','nama@gmail.com','email','email',st.email)
        +'<div class="er" id="lgr"></div><button class="btn" id="lgb">Kirim Kode</button><button class="lk" id="lgg"><b>Kembali ke Masuk</b></button>';
      on('lgb',resetStart);on('lgg',function(){go2('login')});enter(resetStart);
    }
  }
  function err(m){var e=$i('lgr');if(e)e.textContent=m||''}
  function busy(on,t){st.busy=on;var b=$i('lgb');if(b){b.disabled=!!on;b.style.opacity=on?.6:1;if(t)b.textContent=t}}
  function val(id){var e=$i(id);return e?e.value:''}
  function cooldown(sec){
    clearInterval(tm);if(!$i('lgx'))return;
    function t(){var b=$i('lgx');if(!b){clearInterval(tm);return}
      if(sec>0){b.disabled=true;b.textContent='Kirim ulang kode ('+sec+' dtk)';sec--}
      else{clearInterval(tm);b.disabled=false;b.textContent='Kirim ulang kode';b.onclick=resend}}
    t();tm=setInterval(t,1000);
  }
  var pend=null; // data terakhir untuk kirim ulang
  function send(action,body,next,label){
    if(st.busy)return;err('');busy(1,'Memproses…');
    api(Object.assign({action:action},body)).then(function(j){st.busy=0;pend={a:action,b:body};st.email=body.email;if(next){go2(next)}view2(j.cooldown)}).catch(function(x){busy(0,label);err(x.msg)});
  }
  function view2(cd){cooldown(cd||45)}
  function regStart(){
    var u=val('lgu').trim().toLowerCase(),e=val('lge').trim().toLowerCase(),p=val('lgp');
    if(!/^[a-z0-9_.]{3,20}$/.test(u)){err('Username 3-20 karakter: huruf kecil, angka, titik, atau _');return}
    if(!/^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(e)){err('Masukkan alamat Gmail yang valid (@gmail.com)');return}
    if(p.length<8){err('Password minimal 8 karakter');return}
    st.email=e;send('register_start',{username:u,email:e,password:p},'regc','Kirim Kode');
  }
  function resetStart(){
    var e=val('lge').trim().toLowerCase();
    if(!/^[a-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/.test(e)){err('Masukkan alamat Gmail yang valid (@gmail.com)');return}
    st.email=e;send('reset_start',{email:e},'rstc','Kirim Kode');
  }
  function resend(){
    if(st.busy||!pend)return;err('');st.busy=1;
    api(Object.assign({action:pend.a},pend.b)).then(function(j){st.busy=0;toast('Kode baru dikirim');cooldown(j.cooldown||45)}).catch(function(x){st.busy=0;err(x.msg);cooldown(15)});
  }
  function done(j,msg){
    wr(KEY,{email:j.email,username:j.username,session:j.session,exp:j.exp});rm(SKIP);
    if(!cfg.name){cfg.name=String(j.username||'').slice(0,30);ls.set('cfg',cfg)}
    close();toast(msg||'Masuk sebagai '+j.username);refresh();
  }
  function fin(p,label){return p.catch(function(x){busy(0,label);err(x.msg)})}
  function login(){
    if(st.busy)return;var id=val('lgi').trim(),p=val('lgp');
    if(!id||!p){err('Isi username/email dan password');return}
    err('');busy(1,'Memeriksa…');fin(api({action:'login',id:id,password:p}).then(function(j){done(j)}),'Masuk');
  }
  function regVerify(){
    if(st.busy)return;var c=val('lgc').replace(/\D/g,'');if(c.length!=6){err('Masukkan kode 6 digit');return}
    err('');busy(1,'Memeriksa…');
    api({action:'register_verify',email:st.email,code:c}).then(function(j){done(j,'Akun dibuat. Selamat datang, '+j.username)})
      .catch(function(x){busy(0,'Verifikasi');err(x.msg);var i=$i('lgc');if(i){i.value='';i.focus()}});
  }
  function resetVerify(){
    if(st.busy)return;var c=val('lgc').replace(/\D/g,''),p=val('lgp');
    if(c.length!=6){err('Masukkan kode 6 digit');return}if(p.length<8){err('Password minimal 8 karakter');return}
    err('');busy(1,'Memproses…');fin(api({action:'reset_verify',email:st.email,code:c,password:p}).then(function(j){done(j,'Password diganti')}),'Ganti Password');
  }
  function skip(){wr(SKIP,1);close()}
  function close(){clearInterval(tm);var e=$i('lg');if(e){e.classList.add('x');setTimeout(function(){e.remove()},400)}}
  function refresh(){try{go(pg)}catch(e){}}
  window.lgOpen=function(){
    if($i('lg'))return;css();st={step:'login',email:'',busy:0};
    var e=document.createElement('div');e.id='lg';e.innerHTML='<div class="lgc"></div>';
    $i('app').appendChild(e);view();
  };
  window.lgOut=function(){if(!confirm('Keluar dari akun? Data lagu dan playlist di perangkat ini tetap ada.'))return;
    rm(KEY);rm(SKIP);toast('Berhasil keluar');refresh()};
  /* baris akun di halaman Profil */
  function inject(){
    var v=$i('v');if(!v)return;var h=v.querySelector('h1');
    if(!h||h.textContent!=='Profil'||v.querySelector('[data-acc]'))return;
    var f=v.querySelector('.ft');if(!f)return;var a=sess(),d=document.createElement('div');
    d.className='ft';d.setAttribute('data-acc','1');d.setAttribute('onclick',a?'lgOut()':'lgOpen()');
    d.innerHTML=a?'<span>✉</span><div>'+esc(a.username||a.email)+'<br><small>'+esc(a.email)+' · ketuk untuk keluar</small></div>'
      :'<span>✉</span><div>Masuk / Daftar<br><small>Akun dengan username dan Gmail</small></div>';
    f.parentNode.insertBefore(d,f);
  }
  var _go=go;go=function(p){_go(p);inject()};inject();
  /* mulai: tampilkan login bila belum masuk dan belum memilih lewati; cek sesi diam-diam */
  var a=sess();
  if(a){api({action:'me',session:a.session}).catch(function(x){if(x.status==401){rm(KEY);refresh()}})}
  else if(!rd(SKIP)&&/^https?:$/.test(location.protocol))lgOpen();
})();
