(function(){
  'use strict';
  if(window.__vfMenuScrollHotfixLoaded)return;
  window.__vfMenuScrollHotfixLoaded=true;

  var openedAt=0;
  var bound=false;

  function bind(){
    if(bound)return true;
    var body=document.body;
    var menu=document.querySelector('.vf-mobile-menu-button');
    var filter=document.querySelector('.vf-map-filter');
    var overlay=document.querySelector('.vf-mobile-overlay');
    var drawer=document.querySelector('.vf-mobile-drawer');
    var close=document.querySelector('.vf-drawer-close');
    var scroll=document.querySelector('.vf-drawer-scroll');
    if(!body||!menu||!overlay||!drawer||!close||!scroll)return false;

    bound=true;

    function open(ev){
      if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
      body.classList.remove('vf-leader-sheet-open');
      openedAt=Date.now();
      body.classList.add('vf-drawer-open');
      requestAnimationFrame(function(){
        scroll.style.overflowY='scroll';
        scroll.style.touchAction='pan-y';
      });
    }

    function closeDrawer(ev){
      if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
      body.classList.remove('vf-drawer-open');
    }

    menu.addEventListener('click',open,true);
    if(filter)filter.addEventListener('click',open,true);

    overlay.addEventListener('click',function(ev){
      if(Date.now()-openedAt<450){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      closeDrawer(ev);
    },true);

    close.addEventListener('click',closeDrawer,true);

    /* Impede que um gesto vertical dentro do menu seja reaproveitado pela página/mapa. */
    scroll.addEventListener('touchstart',function(ev){
      ev.stopPropagation();
    },{passive:true,capture:true});
    scroll.addEventListener('touchmove',function(ev){
      ev.stopPropagation();
    },{passive:true,capture:true});

    /* Mantém a posição rolada ao interagir com selects/botões no drawer. */
    drawer.addEventListener('click',function(ev){
      if(ev.target.closest('.vf-drawer-scroll'))ev.stopPropagation();
    },false);

    return true;
  }

  if(!bind()){
    var tries=0;
    var timer=setInterval(function(){
      tries+=1;
      if(bind()||tries>80)clearInterval(timer);
    },50);
  }
})();
