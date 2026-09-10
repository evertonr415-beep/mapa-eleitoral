(function(){
  'use strict';
  if(window.__vfDesktopStabilityV326)return;
  window.__vfDesktopStabilityV326=true;

  var switchTimer=0,lastAdminState=null,revealed=false;

  function desktop(){
    return !!(document.body&&(document.body.classList.contains('vf-desktop-mobile-mirror')||window.innerWidth>900));
  }

  function finishSwitch(delay){
    clearTimeout(switchTimer);
    switchTimer=setTimeout(function(){
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        if(document.body)document.body.classList.remove('vf-desktop-switching');
      });});
    },delay==null?70:delay);
  }

  function beginSwitch(){
    if(!desktop()||!document.body)return;
    document.body.classList.add('vf-desktop-switching');
    finishSwitch(70);
  }

  function wrapSwitch(){
    var fn=window.switchView;
    if(typeof fn!=='function'||fn.__vfDesktopStability326)return;
    var wrapped=function(){
      beginSwitch();
      try{return fn.apply(this,arguments);}finally{finishSwitch(80);}
    };
    wrapped.__vfDesktopStability326=true;
    wrapped.__vfDesktopStabilityOriginal=fn;
    window.switchView=wrapped;
  }

  function reveal(force){
    if(revealed)return;
    var root=document.documentElement;
    var app=document.getElementById('app-root');
    var mirror=document.body&&document.body.classList.contains('vf-desktop-mobile-mirror');
    var patched=document.querySelectorAll('style[data-vf-desktop-mobile-css]').length;
    if(!force&&(!app||!mirror||patched<2))return;
    revealed=true;
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      root.classList.remove('vf-desktop-booting');
      root.classList.add('vf-desktop-ready');
      if(document.body)document.body.classList.remove('vf-desktop-switching');
    });});
  }

  function tick(){
    wrapSwitch();
    reveal(false);
    if(!document.body)return;
    var admin=document.body.classList.contains('vf-admin-home-active');
    if(lastAdminState!==null&&admin!==lastAdminState){beginSwitch();finishSwitch(80);}
    lastAdminState=admin;
  }

  function boot(){
    var mo=new MutationObserver(tick);
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    tick();
    var tries=0,timer=setInterval(function(){tries++;tick();if(revealed&&tries>8)clearInterval(timer);if(tries>40)clearInterval(timer);},50);
    setTimeout(function(){reveal(true);},1000);
    window.addEventListener('pageshow',function(){setTimeout(tick,30);},{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();