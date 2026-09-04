(function(){
  'use strict';
  if(window.__vfMobilePolishLoaded)return;
  window.__vfMobilePolishLoaded=true;

  function icon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';}
  function isVisible(node){
    if(!node)return false;
    var style=window.getComputedStyle(node);
    return style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0';
  }
  function syncAuth(){
    var modal=document.getElementById('modal-auth-flow');
    document.body.classList.toggle('vf-auth-visible',isVisible(modal));
  }
  function openMenu(){
    document.body.classList.remove('vf-leader-sheet-open');
    document.body.classList.add('vf-drawer-open');
  }
  function install(){
    if(!document.body.classList.contains('vf-mobile'))return;
    if(!document.querySelector('.vf-auth-menu-button')){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='vf-auth-menu-button';
      btn.setAttribute('aria-label','Abrir menu');
      btn.innerHTML=icon();
      btn.addEventListener('click',openMenu);
      document.body.appendChild(btn);
    }
    var modal=document.getElementById('modal-auth-flow');
    if(modal&&!modal.__vfAuthObserver){
      modal.__vfAuthObserver=true;
      new MutationObserver(syncAuth).observe(modal,{attributes:true,attributeFilter:['style','class']});
    }
    syncAuth();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,80);},{once:true});
  else setTimeout(install,80);
  setTimeout(install,450);
  setTimeout(install,1100);
  window.addEventListener('resize',function(){setTimeout(install,60);},{passive:true});
}());