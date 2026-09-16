(function(){
  'use strict';
  if(window.__vfMenuRefineV15)return;window.__vfMenuRefineV15=true;
  function closeDrawerSoon(){setTimeout(function(){document.body.classList.remove('vf-drawer-open');},90);}
  function loadAdminIntegration(){
    if(!document.getElementById('vf-admin-integrated-v302-css')){var l=document.createElement('link');l.id='vf-admin-integrated-v302-css';l.rel='stylesheet';l.href=location.origin+'/mobile-admin-integrated-v30-2.css?v=30.2';document.head.appendChild(l);}
    import(location.origin+'/mobile-admin-integrated-v30-2.js?v=30.2').catch(function(e){console.warn('Admin mobile:',e);});
  }
  function campaignIcon(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5l5-2.5 8 2.5 5-2.5v13.5l-5 2.5-8-2.5-5 2.5z"/><path d="M8 4v13.5M16 6.5V20"/></svg>';}
  function addCampaignDivision(drawer){
    if(drawer.querySelector('[data-vf-campaign-division]'))return;
    var nav=drawer.querySelector('.vf-drawer-navigation')||drawer.querySelector('.vf-drawer-scroll');if(!nav)return;
    var grid=drawer.querySelector('.vf-drawer-nav-grid');
    if(grid){
      var b=document.createElement('button');b.type='button';b.setAttribute('data-vf-campaign-division','1');b.innerHTML=campaignIcon()+'<span>Divisão Campanha</span>';b.addEventListener('click',function(){location.href=location.origin+'/divisao-campanha.html';});grid.appendChild(b);return;
    }
    var a=document.createElement('a');a.setAttribute('data-vf-campaign-division','1');a.href=location.origin+'/divisao-campanha.html';a.style.cssText='display:flex;align-items:center;gap:9px;margin:6px 0;min-height:40px;padding:0 11px;border-radius:11px;border:1px solid rgba(91,141,206,.24);background:linear-gradient(135deg,#12233c 0%,#0e1c31 100%);color:#c7d4e8;text-decoration:none;font-weight:780;font-size:10.5px';a.innerHTML=campaignIcon()+'<span>Divisão Campanha</span>';nav.appendChild(a);
  }
  function applyPendingView(){var target='';try{target=sessionStorage.getItem('vf_admin_open_view')||'';}catch(_){ }if(!target)return;var tries=0,t=setInterval(function(){tries++;if(typeof window.switchView==='function'){try{window.switchView(target);sessionStorage.removeItem('vf_admin_open_view');}catch(_){ }clearInterval(t);}else if(tries>30)clearInterval(t);},120);}
  function install(){var drawer=document.querySelector('.vf-mobile-drawer');if(!drawer){setTimeout(install,80);return;}drawer.querySelectorAll('.vf-admin-panel-entry').forEach(function(n){n.remove();});var wa=drawer.querySelector('.vf-drawer-actions .btn-topbar-whatsapp');if(wa&&!wa.dataset.vfCloseBound){wa.dataset.vfCloseBound='1';wa.addEventListener('click',closeDrawerSoon);}drawer.querySelectorAll('.vf-drawer-filters input,.vf-drawer-filters select').forEach(function(el){if(el.dataset.vfCloseBound)return;el.dataset.vfCloseBound='1';el.addEventListener('change',closeDrawerSoon);});addCampaignDivision(drawer);loadAdminIntegration();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){install();applyPendingView();},120);},{once:true});else setTimeout(function(){install();applyPendingView();},120);setTimeout(install,600);
})();
