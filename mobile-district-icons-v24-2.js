(function(){
  'use strict';
  if(window.__vfDistrictIconsV242)return;window.__vfDistrictIconsV242=true;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}

  function territorySvg(id){
    var common='<path class="vf24-territory-outline" d="M7.4 3.8 14 2.9l5.5 3.3 1.2 6.3-2.6 6.3-6.9 2.4-6-3.8-1.1-7.2Z"/><path class="vf24-territory-grid" d="M7.6 8.2 18.7 7M6.2 13.2l13.4.5M10.1 4.3l-.7 15M14.9 4.1l1.1 15.1"/>';
    var sector='';
    if(id==='dist_centro') sector='<path class="vf24-territory-sector" d="M9.7 9.1h5.1l1.7 2.8-1.8 3.5-4.7.3-2.1-3.1Z"/><circle class="vf24-territory-core" cx="12.4" cy="12.3" r="1.5"/>';
    else if(id==='dist_norte') sector='<path class="vf24-territory-sector" d="M7.6 4.8 14 3.5l4 2.4-.8 4.2-4.7 1.3-4.4-1.1Z"/><circle class="vf24-territory-core" cx="12.5" cy="7.5" r="1.35"/>';
    else if(id==='dist_sul_aricanduva') sector='<path class="vf24-territory-sector" d="M8.2 14.2 13 13.6l5 1.7-.4 4-6 1.5-4.3-2.8Z"/><circle class="vf24-territory-core" cx="12.2" cy="17.1" r="1.35"/>';
    else if(id==='dist_leste_petropolis') sector='<path class="vf24-territory-sector" d="M14 6.2 18.8 7l1.1 5-2.1 5.2-4.4-1.3.6-5.3Z"/><circle class="vf24-territory-core" cx="17" cy="12.1" r="1.35"/>';
    else if(id==='dist_oeste_daleffe') sector='<path class="vf24-territory-sector" d="M5.6 7.3 10 6.2l.7 4.8-1.4 5-4.2 1.1-1-6Z"/><circle class="vf24-territory-core" cx="7.4" cy="12.2" r="1.35"/>';
    else sector='<circle class="vf24-territory-core" cx="12" cy="12" r="2"/>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+common+sector+'</svg>';
  }

  function replaceIcons(){
    if(!isMobile())return;
    document.querySelectorAll('.vf24-card').forEach(function(card){
      var id=String(card.id||'').replace(/^vf24-/,'');
      var icon=card.querySelector('.vf24-card-icon');
      if(!icon)return;
      icon.classList.add('vf24-territory-icon');
      var key=icon.dataset.vf242Id||'';
      if(key===id&&icon.querySelector('svg'))return;
      icon.dataset.vf242Id=id;
      icon.innerHTML=territorySvg(id);
      icon.setAttribute('aria-label','Posição territorial');
    });
  }

  var queued=false;
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(function(){queued=false;replaceIcons();});
  }

  function install(){
    if(!isMobile())return;
    replaceIcons();
    var root=document.getElementById('distritos-macro-cards');
    if(root&&!root.__vf242Observer){
      root.__vf242Observer=new MutationObserver(schedule);
      root.__vf242Observer.observe(root,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,950)},{once:true});else setTimeout(install,950);
  setTimeout(install,1700);setTimeout(install,2800);
})();
