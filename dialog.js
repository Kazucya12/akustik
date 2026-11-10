/* Dialog modern: pengganti confirm() / prompt() bawaan browser.
   uiConfirm(pesan,{title,ok,cancel,danger,icon}) -> Promise<boolean>
   uiPrompt(pesan,nilaiAwal,{title,ok,placeholder,readonly,max}) -> Promise<string|null>
   uiForm(title,[{label,value,max}],{ok}) -> Promise<string[]|null>
   uiPick(title,[teks,...]) -> Promise<index|null> */
(function(){
  var css='.ud{position:fixed;left:0;right:0;top:0;height:100%;z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;padding-bottom:max(20px,env(safe-area-inset-bottom));background:rgba(3,5,22,.62);-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2);opacity:0;transition:opacity .22s ease;-webkit-tap-highlight-color:transparent}'
  +'.ud.on{opacity:1}'
  +'.udc{position:relative;width:min(100%,360px);max-height:100%;overflow:auto;border-radius:30px;padding:28px 22px 20px;background:var(--ov);border:1px solid var(--b);color:var(--tx);box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.18);transform:translateY(26px) scale(.92);opacity:0;transition:transform .32s cubic-bezier(.2,1.1,.3,1),opacity .22s ease;text-align:center;font-family:inherit}'
  +'.udc:before{content:"";position:absolute;left:50%;top:-70px;width:240px;height:160px;margin-left:-120px;border-radius:50%;background:var(--p);opacity:.28;filter:blur(46px);pointer-events:none}'
  +'.ud.on .udc{transform:none;opacity:1}'
  +'.udi{position:relative;width:60px;height:60px;margin:0 auto 14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(145deg,rgba(255,255,255,.2),rgba(255,255,255,.05));border:1px solid var(--b);box-shadow:0 8px 24px rgba(0,0,0,.3);animation:udp .5s cubic-bezier(.2,1.4,.4,1) .08s both}'
  +'.udc.dg .udi{background:linear-gradient(145deg,rgba(255,95,126,.38),rgba(255,95,126,.1));border-color:rgba(255,95,126,.5)}'
  +'@keyframes udp{from{transform:scale(.4) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}'
  +'.udc h3{position:relative;margin:0 0 8px;font-size:19px;font-weight:700;letter-spacing:-.2px}'
  +'.udc p{position:relative;margin:0 0 18px;font-size:14px;line-height:1.5;color:var(--mu);word-break:break-word}'
  +'.udf{position:relative;display:block;text-align:left;margin:0 0 12px}'
  +'.udf span{display:block;font-size:12px;font-weight:600;color:var(--mu);margin:0 0 6px 4px}'
  +'.udf input{width:100%;box-sizing:border-box;padding:14px 16px;border-radius:16px;border:1px solid var(--b);background:rgba(127,127,170,.14);color:var(--tx);font:inherit;font-size:16px;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}'
  +'.udf input:focus{border-color:var(--p2);background:rgba(127,127,170,.2);box-shadow:0 0 0 4px rgba(127,127,255,.16)}'
  +'.udl{position:relative;display:flex;flex-direction:column;gap:8px;margin:0 0 14px;max-height:46vh;overflow:auto;text-align:left}'
  +'.udl button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border-radius:16px;border:1px solid var(--b);background:rgba(127,127,170,.12);color:var(--tx);font:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:transform .15s,background .2s}'
  +'.udl button:active{transform:scale(.97);background:rgba(127,127,170,.26)}'
  +'.udl button i{flex:none;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff}'
  +'.udl button b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}'
  +'.udb{position:relative;display:flex;gap:10px}'
  +'.udb button{flex:1;height:50px;border:0;border-radius:18px;font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:transform .15s,filter .2s;-webkit-tap-highlight-color:transparent}'
  +'.udb button:active{transform:scale(.95)}'
  +'.udb .c{background:rgba(127,127,170,.18);color:var(--tx)}'
  +'.udb .o{background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;box-shadow:0 8px 22px rgba(109,93,252,.4)}'
  +'.udc.dg .udb .o{background:linear-gradient(135deg,#ff5f7e,#e0354f);box-shadow:0 8px 22px rgba(224,53,79,.42)}'
  +'.udb button:focus-visible{outline:2px solid var(--p2);outline-offset:2px}';
  css+='.sk6{display:flex;align-items:center;gap:12px;padding:8px}.sk6 i{flex:none;width:50px;height:50px;border-radius:13px}.sk6 div{flex:1;display:flex;flex-direction:column;gap:8px}.sk6 b,.sk6 u{display:block;height:11px;border-radius:6px;text-decoration:none}.sk6 u{height:9px}.sk6 i,.sk6 b,.sk6 u{background:linear-gradient(100deg,rgba(127,127,170,.14) 30%,rgba(255,255,255,.24) 50%,rgba(127,127,170,.14) 70%);background-size:220% 100%;animation:sk6 1.3s linear infinite}@keyframes sk6{from{background-position:120% 0}to{background-position:-120% 0}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var chain=Promise.resolve();
  function show(o){var p=chain.then(function(){return open(o)});chain=p.catch(function(){});return p}
  function open(o){return new Promise(function(done){
    var root=document.createElement('div');root.className='ud';
    var f=o.fields||[],list=o.list;
    var h='<div class="udc'+(o.danger?' dg':'')+'" role="dialog" aria-modal="true">'
      +(o.icon?'<div class="udi">'+esc(o.icon)+'</div>':'')
      +'<h3>'+esc(o.title)+'</h3>'+(o.msg?'<p>'+esc(o.msg)+'</p>':'');
    f.forEach(function(x,i){h+='<label class="udf">'+(x.label?'<span>'+esc(x.label)+'</span>':'')+'<input data-i="'+i+'" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="'+(x.max||200)+'" placeholder="'+esc(x.ph||'')+'" value="'+esc(x.value)+'"'+(x.ro?' readonly':'')+'></label>'});
    if(list){h+='<div class="udl">'+list.map(function(t,i){return'<button type="button" data-p="'+i+'"><i>'+(i+1)+'</i><b>'+esc(t)+'</b></button>'}).join('')+'</div>'}
    h+='<div class="udb"><button type="button" class="c">'+esc(o.cancel||'Batal')+'</button>'+(list?'':'<button type="button" class="o">'+esc(o.ok||'Oke')+'</button>')+'</div></div>';
    root.innerHTML=h;
    try{window.hap6&&window.hap6(10)}catch(e){}
    var prevFocus=document.activeElement,closed=0,vv=window.visualViewport;
    function fit(){if(vv){root.style.height=vv.height+'px';root.style.top=vv.offsetTop+'px'}}
    function close(v){if(closed)return;closed=1;
      document.removeEventListener('keydown',key,true);if(vv)vv.removeEventListener('resize',fit);
      root.classList.remove('on');
      setTimeout(function(){root.remove();try{prevFocus&&prevFocus.blur&&prevFocus.blur()}catch(e){}done(v)},210)}
    function value(){var r=[];root.querySelectorAll('input').forEach(function(i){r.push(i.value)});return r}
    function okv(){return f.length?(f.length==1?value()[0]:value()):true}
    function key(e){
      if(e.key=='Escape'){e.preventDefault();e.stopPropagation();close(o.dismiss)}
      else if(e.key=='Enter'&&!list&&e.target&&e.target.tagName!='BUTTON'){e.preventDefault();close(okv())}
    }
    document.addEventListener('keydown',key,true);
    root.addEventListener('mousedown',function(e){if(e.target===root)close(o.dismiss)});
    root.addEventListener('touchstart',function(e){if(e.target===root){e.preventDefault();close(o.dismiss)}},{passive:false});
    var b=root.querySelector('.udb');
    b.querySelector('.c').onclick=function(){close(o.dismiss)};
    var ok=b.querySelector('.o');if(ok)ok.onclick=function(){close(okv())};
    root.querySelectorAll('[data-p]').forEach(function(x){x.onclick=function(){close(+x.getAttribute('data-p'))}});
    (document.getElementById('app')||document.body).appendChild(root);
    fit();if(vv)vv.addEventListener('resize',fit);
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      root.classList.add('on');
      var i=root.querySelector('input');
      if(i){try{i.focus({preventScroll:true});i.select()}catch(e){}}
      else if(ok&&!o.danger)ok.focus({preventScroll:true});
    })});
  })}
  window.skel6=function(n){var h='';for(var i=0;i<(n||5);i++)h+='<div class="sk6"><i></i><div><b style="width:'+(52+(i*23)%36)+'%"></b><u style="width:'+(28+(i*17)%26)+'%"></u></div></div>';return'<div aria-busy="true" aria-label="Memuat">'+h+'</div>'};
  window.uiConfirm=function(msg,o){o=o||{};
    return show({title:o.title||'Konfirmasi',msg:msg,ok:o.ok,cancel:o.cancel,danger:o.danger,icon:o.icon||(o.danger?'🗑':'❓'),dismiss:false}).then(function(v){return v===true})};
  window.uiPrompt=function(msg,val,o){o=o||{};
    return show({title:o.title||msg,msg:o.title?msg:'',ok:o.ok||'Simpan',icon:o.icon,dismiss:null,
      fields:[{value:val||'',ph:o.placeholder,max:o.max,ro:o.readonly}]}).then(function(v){return v==null?null:v})};
  window.uiForm=function(title,fields,o){o=o||{};
    return show({title:title,ok:o.ok||'Simpan',icon:o.icon,dismiss:null,fields:fields}).then(function(v){return v==null?null:v})};
  window.uiPick=function(title,items,o){o=o||{};
    return show({title:title,list:items,icon:o.icon||'🎵',dismiss:null}).then(function(v){return v==null?null:v})};
})();
