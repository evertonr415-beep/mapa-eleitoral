(function(){
  'use strict';
  if(window.__vfMobileStabilityV327)return;
  window.__vfMobileStabilityV327=true;

  var boundHome=null;

  function loadOnce(src,id){
    if(id&&document.getElementById(id))return;
    var s=document.createElement('script');
    if(id)s.id=id;
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  }

  function ensureCandidateSupport(){
    loadOnce(location.origin+'/candidate-picker-scroll-guard-v33.js?v=33.2','vf-candidate-scroll-guard-v33');
    loadOnce(location.origin+'/mobile-politician-photos-v27-7.js?v=27.8','vf-politician-photos-v27-8');
  }

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
    ensureCandidateSupport();
    if(!adminHomeActive())return;
    var home=document.getElementById('vf-admin-home');
    if(!home)return;
    document.body.classList.remove('vf-leader-sheet-open');
    bindHome(home);
    home.style.setProperty('overflow-y','auto','important');
    home.style.setProperty('overflow-x','hidden','important');
    home.style.setProperty('touch-action','pan-y','important');
    home.style.setProperty('-webkit-overflow-scrolling','touch','important');
    home.style.setProperty('pointer-events','auto','important');
  }

  function schedule(){requestAnimationFrame(repair);}

  function boot(){
    ensureCandidateSupport();
    schedule();
    if(document.body){
      var mo=new MutationObserver(schedule);
      mo.observe(document.body,{attributes:true,attributeFilter:['class','data-vf-view']});
    }
    window.addEventListener('pageshow',schedule,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(schedule,120);},{passive:true});
    window.addEventListener('resize',function(){setTimeout(schedule,80);},{passive:true});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
    setTimeout(schedule,250);setTimeout(schedule,800);setTimeout(schedule,1800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
