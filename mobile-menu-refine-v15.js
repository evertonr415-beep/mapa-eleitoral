(function(){
  'use strict';
  if(window.__vfMenuRefineV15)return;window.__vfMenuRefineV15=true;
  function closeDrawerSoon(){setTimeout(function(){document.body.classList.remove('vf-drawer-open');},90);}
  function install(){
    var drawer=document.querySelector('.vf-mobile-drawer');
    if(!drawer){setTimeout(install,80);return;}
    var wa=drawer.querySelector('.vf-drawer-actions .btn-topbar-whatsapp');
    if(wa&&!wa.dataset.vfCloseBound){wa.dataset.vfCloseBound='1';wa.addEventListener('click',closeDrawerSoon);}
    drawer.querySelectorAll('.vf-drawer-filters input,.vf-drawer-filters select').forEach(function(el){
      if(el.dataset.vfCloseBound)return;el.dataset.vfCloseBound='1';el.addEventListener('change',closeDrawerSoon);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,120);},{once:true});else setTimeout(install,120);
  setTimeout(install,600);
})();
