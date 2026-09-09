(function(){
  'use strict';
  if(window.__vfMenuRefineV15)return;window.__vfMenuRefineV15=true;
  function closeDrawerSoon(){setTimeout(function(){document.body.classList.remove('vf-drawer-open');},90);}

  function applyPendingView(){
    var target='';
    try{target=sessionStorage.getItem('vf_admin_open_view')||'';}catch(_){ }
    if(!target)return;
    var tries=0;
    var t=setInterval(function(){
      tries++;
      if(typeof window.switchView==='function'){
        try{window.switchView(target);sessionStorage.removeItem('vf_admin_open_view');}catch(_){ }
        clearInterval(t);
      }else if(tries>30){clearInterval(t);}
    },120);
  }

  async function installAdminShortcut(drawer){
    if(!drawer||drawer.querySelector('.vf-admin-panel-entry'))return;
    try{
      var mod=await import('./auth-gate.js');
      var u=await mod.currentUser();
      var role=u&&u.vfProfile?u.vfProfile.role:'';
      if(role!=='master'&&role!=='adm')return;
      var nav=drawer.querySelector('.vf-drawer-nav-grid');
      if(!nav)return;
      var b=document.createElement('button');
      b.type='button';
      b.className='vf-admin-panel-entry';
      b.innerHTML='<span style="font-size:16px;line-height:1">⚙️</span><span>Painel ADM</span>';
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();location.href='./mobile-admin.html';});
      nav.insertBefore(b,nav.firstChild);
    }catch(_){ }
  }

  function install(){
    var drawer=document.querySelector('.vf-mobile-drawer');
    if(!drawer){setTimeout(install,80);return;}
    var wa=drawer.querySelector('.vf-drawer-actions .btn-topbar-whatsapp');
    if(wa&&!wa.dataset.vfCloseBound){wa.dataset.vfCloseBound='1';wa.addEventListener('click',closeDrawerSoon);}
    drawer.querySelectorAll('.vf-drawer-filters input,.vf-drawer-filters select').forEach(function(el){
      if(el.dataset.vfCloseBound)return;el.dataset.vfCloseBound='1';el.addEventListener('change',closeDrawerSoon);
    });
    installAdminShortcut(drawer);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){install();applyPendingView();},120);},{once:true});else setTimeout(function(){install();applyPendingView();},120);
  setTimeout(install,600);setTimeout(install,1300);
})();
