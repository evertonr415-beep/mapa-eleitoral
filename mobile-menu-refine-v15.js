(function(){
  'use strict';
  if(window.__vfMenuRefineV15)return;window.__vfMenuRefineV15=true;
  function closeDrawerSoon(){setTimeout(function(){document.body.classList.remove('vf-drawer-open');},90);}
  function loadAdminIntegration(){
    if(!document.getElementById('vf-admin-integrated-v302-css')){
      var l=document.createElement('link');l.id='vf-admin-integrated-v302-css';l.rel='stylesheet';l.href=location.origin+'/mobile-admin-integrated-v30-2.css?v=30.2';document.head.appendChild(l);
    }
    import(location.origin+'/mobile-admin-integrated-v30-2.js?v=30.2').catch(function(e){console.warn('Admin mobile:',e);});
  }
  function applyPendingView(){
    var target='';try{target=sessionStorage.getItem('vf_admin_open_view')||'';}catch(_){ }
    if(!target)return;
    var tries=0,t=setInterval(function(){tries++;if(typeof window.switchView==='function'){try{window.switchView(target);sessionStorage.removeItem('vf_admin_open_view');}catch(_){ }clearInterval(t);}else if(tries>30)clearInterval(t);},120);
  }
  function install(){
    var drawer=document.querySelector('.vf-mobile-drawer');if(!drawer){setTimeout(install,80);return;}
    drawer.querySelectorAll('.vf-admin-panel-entry').forEach(function(n){n.remove();});
    var wa=drawer.querySelector('.vf-drawer-actions .btn-topbar-whatsapp');if(wa&&!wa.dataset.vfCloseBound){wa.dataset.vfCloseBound='1';wa.addEventListener('click',closeDrawerSoon);}
    drawer.querySelectorAll('.vf-drawer-filters input,.vf-drawer-filters select').forEach(function(el){if(el.dataset.vfCloseBound)return;el.dataset.vfCloseBound='1';el.addEventListener('change',closeDrawerSoon);});
    loadAdminIntegration();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){install();applyPendingView();},120);},{once:true});else setTimeout(function(){install();applyPendingView();},120);
  setTimeout(install,600);
})();
