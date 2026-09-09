(function(){
  'use strict';
  if(window.__vfDesktopMobileForceV312)return;
  window.__vfDesktopMobileForceV312=true;

  function rewriteMobileMedia(css){
    return String(css||'')
      .replace(/@media\s*\(\s*max-width\s*:\s*900px\s*\)/gi,'@media (min-width:0px)')
      .replace(/@media\s*\(\s*max-width\s*:\s*900px\s*\)\s*and/gi,'@media (min-width:0px) and');
  }

  var seen=new Set();
  async function patchLink(link){
    if(!link||!link.href||seen.has(link.href))return;
    var href=link.href;
    if(!/mobile-|tse-full-data/i.test(href))return;
    seen.add(href);
    try{
      var r=await fetch(href,{cache:'no-store'});
      if(!r.ok)return;
      var css=rewriteMobileMedia(await r.text());
      var st=document.createElement('style');
      st.setAttribute('data-vf-desktop-mobile-css',href);
      st.textContent=css;
      document.head.appendChild(st);
    }catch(e){console.warn('Desktop mirror CSS:',e);}
  }

  function scan(){
    document.querySelectorAll('link[rel="stylesheet"]').forEach(patchLink);
    document.documentElement.classList.add('vf-desktop-mobile-root');
    if(document.body)document.body.classList.add('vf-desktop-mobile-mirror');
  }

  var baseStyle=document.createElement('style');
  baseStyle.id='vf-desktop-mobile-force-style';
  baseStyle.textContent='\
    @media (min-width:901px){\
      html,body{width:100%!important;height:100%!important;margin:0!important;background:#080d17!important;overflow:hidden!important}\
      body.vf-desktop-mobile-mirror{background:#080d17!important}\
      body.vf-desktop-mobile-mirror #app-root{width:min(1180px,100vw)!important;max-width:1180px!important;height:100vh!important;margin:0 auto!important;position:relative!important;overflow:hidden!important;background:#080d17!important;box-shadow:0 0 70px rgba(0,0,0,.38)!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer{width:min(420px,42vw)!important;max-width:420px!important}\
      body.vf-desktop-mobile-mirror .vf-drawer-backdrop{left:0!important}\
      body.vf-desktop-mobile-mirror .workspace-main{min-height:0!important}\
      body.vf-desktop-mobile-mirror #vf-admin-home{max-width:1100px!important;margin:0 auto!important}\
      body.vf-desktop-mobile-mirror .vf-admin-sheet{width:min(720px,calc(100vw - 48px))!important;max-width:720px!important;margin:0 auto!important;border-radius:20px 20px 0 0!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-sheet{width:min(680px,calc(100vw - 48px))!important;max-width:680px!important;margin:0 auto!important}\
    }';
  document.head.appendChild(baseStyle);

  scan();
  var mo=new MutationObserver(function(ms){
    ms.forEach(function(m){m.addedNodes.forEach(function(n){
      if(n.nodeType!==1)return;
      if(n.matches&&n.matches('link[rel="stylesheet"]'))patchLink(n);
      if(n.querySelectorAll)n.querySelectorAll('link[rel="stylesheet"]').forEach(patchLink);
    });});
    scan();
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(scan,150);setTimeout(scan,500);setTimeout(scan,1200);setTimeout(scan,2500);
})();
