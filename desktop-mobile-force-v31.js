(function(){
  'use strict';
  if(window.__vfDesktopMobileForceV313)return;
  window.__vfDesktopMobileForceV313=true;

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
      body.vf-desktop-mobile-mirror #app-root{width:100vw!important;max-width:none!important;height:100vh!important;margin:0!important;position:relative!important;overflow:hidden!important;background:#080d17!important;box-shadow:none!important}\
      body.vf-desktop-mobile-mirror .workspace-main{width:100%!important;max-width:none!important;min-height:0!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-header,body.vf-desktop-mobile-mirror .vf-mobile-topbar{width:100%!important;max-width:none!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer{width:min(430px,34vw)!important;max-width:430px!important}\
      body.vf-desktop-mobile-mirror .vf-drawer-backdrop{left:0!important}\
      body.vf-desktop-mobile-mirror #vf-admin-home{width:100%!important;max-width:none!important;margin:0!important;padding-left:clamp(28px,4vw,72px)!important;padding-right:clamp(28px,4vw,72px)!important}\
      body.vf-desktop-mobile-mirror #vf-admin-home .vf-admin-content,body.vf-desktop-mobile-mirror #vf-admin-home .vf-admin-inner{width:100%!important;max-width:none!important}\
      body.vf-desktop-mobile-mirror .vf-admin-sheet{width:min(820px,calc(100vw - 72px))!important;max-width:820px!important;margin:0 auto!important;border-radius:20px 20px 0 0!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-sheet{width:min(760px,calc(100vw - 72px))!important;max-width:760px!important;margin:0 auto!important}\
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
