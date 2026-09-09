(function(){
  'use strict';
  if(window.__vfDesktopHeaderPolishV3112)return;
  window.__vfDesktopHeaderPolishV3112=true;

  function important(el,prop,value){
    if(!el)return;
    try{el.style.setProperty(prop,value,'important');}catch(_){ }
  }

  function apply(){
    if(window.innerWidth<=900)return;
    var body=document.body;
    if(!body||!body.classList.contains('vf-desktop-mobile-mirror'))return;

    var header=document.querySelector('header.topbar');
    important(header,'overflow','visible');

    var brand=document.querySelector('header.topbar .brand-section');
    important(brand,'transform','scale(1.24)');
    important(brand,'transform-origin','center center');
    important(brand,'position','relative');
    important(brand,'z-index','3');

    var profile=document.querySelector('header.topbar .vf-mobile-profile-button');
    important(profile,'transform','scale(1.48)');
    important(profile,'transform-origin','center center');
    important(profile,'position','relative');
    important(profile,'z-index','6');
    important(profile,'overflow','hidden');
    important(profile,'border-radius','50%');

    var avatar=document.querySelector('header.topbar .vf-mobile-avatar');
    important(avatar,'width','100%');
    important(avatar,'height','100%');
    important(avatar,'overflow','hidden');
    important(avatar,'border-radius','50%');

    var img=document.querySelector('header.topbar .vf-mobile-avatar img');
    important(img,'width','100%');
    important(img,'height','100%');
    important(img,'min-width','100%');
    important(img,'min-height','100%');
    important(img,'object-fit','cover');
    important(img,'object-position','center center');
    important(img,'border-radius','50%');
  }

  var queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;apply();});
  }

  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('resize',queue,{passive:true});
  var mo=new MutationObserver(queue);
  mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','src']});
  setTimeout(apply,100);setTimeout(apply,400);setTimeout(apply,1000);setTimeout(apply,2200);
})();
