(function(){
  'use strict';
  if(window.__vfDesktopMobileForceV314)return;
  window.__vfDesktopMobileForceV314=true;

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
      body.vf-desktop-mobile-mirror .vf-mobile-header,body.vf-desktop-mobile-mirror .vf-mobile-topbar{width:100%!important;max-width:none!important;min-height:76px!important;padding-left:28px!important;padding-right:28px!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-header button,body.vf-desktop-mobile-mirror .vf-mobile-topbar button{min-width:46px!important;min-height:46px!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer{width:min(470px,36vw)!important;max-width:470px!important}\
      body.vf-desktop-mobile-mirror .vf-drawer-backdrop{left:0!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer .vf-drawer-label{font-size:12px!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer .vf-drawer-navigation button,body.vf-desktop-mobile-mirror .vf-mobile-drawer .vf-admin-nav-grid button{min-height:50px!important;font-size:14px!important;padding-left:15px!important;padding-right:15px!important}\
      body.vf-desktop-mobile-mirror .vf-mobile-drawer .vf-drawer-navigation button svg,body.vf-desktop-mobile-mirror .vf-mobile-drawer .vf-admin-nav-grid button svg{width:20px!important;height:20px!important}\
      body.vf-desktop-mobile-mirror #vf-admin-home{width:100%!important;max-width:none!important;margin:0!important;padding:24px clamp(38px,5vw,86px) 40px!important}\
      body.vf-desktop-mobile-mirror #vf-admin-home .vf-admin-content,body.vf-desktop-mobile-mirror #vf-admin-home .vf-admin-inner{width:100%!important;max-width:none!important}\
      body.vf-desktop-mobile-mirror .vf-admin-overview-head{gap:18px!important;margin-bottom:18px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-kicker{font-size:12px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-overview-head h2{font-size:30px!important;margin-top:6px!important;margin-bottom:5px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-overview-head p{font-size:15px!important;line-height:1.45!important}\
      body.vf-desktop-mobile-mirror .vf-admin-role-chip{padding:10px 13px!important;font-size:12px!important;border-radius:12px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-stats{gap:14px!important;margin-bottom:20px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-stat{min-height:102px!important;padding:17px 18px!important;border-radius:17px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-stat span{font-size:11px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-stat strong{margin-top:10px!important;font-size:30px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-section-title{margin:20px 2px 11px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-section-title h3{font-size:18px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-section-title span{font-size:12px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-actions{gap:14px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-action{min-height:118px!important;padding:18px!important;border-radius:17px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-action .ico{font-size:25px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-action strong{margin-top:11px!important;font-size:16px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-action small{margin-top:5px!important;font-size:12px!important;line-height:1.4!important}\
      body.vf-desktop-mobile-mirror .vf-admin-badge{min-width:23px!important;height:23px!important;font-size:11px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-mini-card{padding:16px 18px!important;border-radius:17px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-mini-row{padding:11px 0!important}\
      body.vf-desktop-mobile-mirror .vf-admin-mini-row strong{font-size:14px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-mini-row span{margin-top:4px!important;font-size:12px!important;line-height:1.45!important}\
      body.vf-desktop-mobile-mirror .vf-admin-empty{padding:14px 4px!important;font-size:13px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-sheet{width:min(900px,calc(100vw - 96px))!important;max-width:900px!important;margin:0 auto!important;border-radius:22px 22px 0 0!important;padding:22px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-sheet-head h3{font-size:20px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-sheet-close{width:42px!important;height:42px!important;font-size:22px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-field{margin-top:14px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-field label{font-size:12px!important;margin-bottom:7px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-field input,body.vf-desktop-mobile-mirror .vf-admin-field select{height:50px!important;font-size:16px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-save{height:50px!important;font-size:14px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-user-row,body.vf-desktop-mobile-mirror .vf-admin-request-row{padding:14px 0!important}\
      body.vf-desktop-mobile-mirror .vf-admin-user-row strong,body.vf-desktop-mobile-mirror .vf-admin-request-row strong{font-size:14px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-user-row span,body.vf-desktop-mobile-mirror .vf-admin-request-row span{font-size:11px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-row-btn{padding:9px 11px!important;font-size:11px!important}\
      body.vf-desktop-mobile-mirror .vf-admin-toolbar-btn{height:46px!important;font-size:13px!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-sheet{width:min(820px,calc(100vw - 96px))!important;max-width:820px!important;margin:0 auto!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-head h2{font-size:22px!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-head p{font-size:13px!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-card{padding:18px!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-field label{font-size:12px!important}\
      body.vf-desktop-mobile-mirror .vf29-wa-field select,body.vf-desktop-mobile-mirror .vf29-wa-field input,body.vf-desktop-mobile-mirror .vf29-wa-field textarea{font-size:16px!important}\
      body.vf-desktop-mobile-mirror .view-table-container{font-size:13px!important}\
      body.vf-desktop-mobile-mirror .custom-table{font-size:13px!important}\
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
