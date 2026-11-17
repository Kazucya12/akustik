/* v4.40: Bagikan / simpan di aplikasi Android. WebView tidak punya navigator.share dan tidak menangani unduhan blob,
   jadi di APK kita sambungkan ke jembatan native (LoopifyNative.shareImg / shareText). Di browser biasa file ini tidak berbuat apa-apa. */
(function(){
  try{
    var N=window.LoopifyNative;if(!N||!N.shareImg||navigator.canShare)return;
    function b64(f){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){var s=String(r.result||'');ok(s.slice(s.indexOf(',')+1))};r.onerror=no;r.readAsDataURL(f)})}
    navigator.canShare=function(d){return !!(d&&d.files&&d.files.length)};
    navigator.share=function(d){d=d||{};
      if(d.files&&d.files.length){var f=d.files[0];return b64(f).then(function(x){N.shareImg(x,f.name||'loopify.png',f.type||'image/png')})}
      var t=[d.title,d.text,d.url].filter(Boolean).join('\n');if(N.shareText)N.shareText(t);return Promise.resolve()};
    /* tautan unduhan blob (a[download]) → simpan ke Galeri bila berupa gambar */
    document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[download]');
      if(!a||!/^blob:/.test(a.href))return;
      e.preventDefault();e.stopPropagation();
      fetch(a.href).then(function(r){return r.blob()}).then(function(bl){
        if(/^image\//.test(bl.type))return b64(bl).then(function(x){N.shareImg(x,a.download||'loopify.png',bl.type)});
        if(typeof toast==='function')toast('Unduhan file belum didukung di aplikasi')}).catch(function(){})},true);
  }catch(e){}
})();
