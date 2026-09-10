(function(){
  'use strict';
  if(window.__vfMobileStabilityV326)return;
  window.__vfMobileStabilityV326=true;

  var boundHome=null;

  function isMobile(){
    return document.body&&document.body.classList.contains('vf-mobile')&&!document.body.classList.contains('vf-desktop-mobile-mirror')&&matchMedia('(max-width:900px)').matches;
  }

  function adminHomeActive(){
    return isMobile()&&document.body.classList.contains('vf-admin-home-active');
  }

  function bindHome(home){
    if(!home||home===boundHome)return;
    boundHome=home;
    home.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
    home.addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});
  }

  function repair(){
    if(!adminHomeActive())return;
    var body=document.body;
    var home=document.getElementById('vf-admin-home');
    if(!home)return;

    /* Menu lateral e painel de lideranças não podem permanecer ativos atrás da visão geral. */
    body.classList.remove('vf-drawer-open');
    body.classList.remove('vf-leader-sheet-open');

    var menuOverlay=document.querySelector('.vf-mobile-overlay');
    if(menuOverlay)menuOverlay.style.setProperty('pointer-events','none','important');
    var leaderOverlay=document.querySelector('.vf-leader-overlay');
    if(leaderOverlay)leaderOverlay.style.setProperty('pointer-events','none','important');

    bindHome(home);
    home.style.setProperty('overflow-y','auto','important');
    home.style.setProperty('overflow-x','hidden','important');
    home.style.setProperty('touch-action','pan-y','important');
    home.style.setProperty('-webkit-overflow-scrolling','touch','important');
    home.style.setProperty('pointer-events','auto','important');
  }

  function releaseOverlayOverrides(){
    if(!isMobile())return;
    if(document.body.classList.contains('vf-drawer-open')){
      var m=document.querySelector('.vf-mobile-overlay');if(m)m.style.removeProperty('pointer-events');
    }
    if(document.body.classList.contains('vf-leader-sheet-open')){
      var l=document.querySelector('.vf-leader-overlay');if(l)l.style.removeProperty('pointer-events');
    }
  }

  function schedule(){
    requestAnimationFrame(function(){repair();releaseOverlayOverrides();});
  }

  function boot(){
    schedule();
    if(document.body){
      var mo=new MutationObserver(schedule);
      mo.observe(document.body,{attributes:true,attributeFilter:['class','data-vf-view'],childList:true,subtree:false});
    }
    window.addEventListener('pageshow',schedule,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(schedule,120);},{passive:true});
    window.addEventListener('resize',function(){setTimeout(schedule,80);},{passive:true});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
    setTimeout(schedule,250);setTimeout(schedule,800);setTimeout(schedule,1800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();