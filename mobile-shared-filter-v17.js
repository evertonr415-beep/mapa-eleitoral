(function(){
  'use strict';
  if(window.__vfSharedFilterV17)return;window.__vfSharedFilterV17=true;

  function syncCollegeSelectFromMain(main,college){
    if(!main||!college)return;
    college.innerHTML=main.innerHTML;
    college.value=main.value;
  }

  function ensureCollegeFilter(){
    if(!document.body.classList.contains('vf-mobile'))return;
    var main=document.getElementById('cand-select');
    var collegeView=document.getElementById('view-table-colegios');
    if(!main||!collegeView){setTimeout(ensureCollegeFilter,120);return;}

    var wrap=collegeView.querySelector('.vf-college-candidate-filter');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='vf-college-candidate-filter';
      wrap.innerHTML='<div class="vf-college-candidate-filter-copy"><strong>Vereador</strong><span>Filtro compartilhado</span></div><select id="vf-college-candidate-select" aria-label="Selecionar vereador ou candidato"></select><span class="vf-college-candidate-filter-badge">Mapa + Colégios</span>';
      collegeView.insertBefore(wrap,collegeView.firstChild);
    }

    var college=wrap.querySelector('#vf-college-candidate-select');
    syncCollegeSelectFromMain(main,college);

    if(!college.dataset.vfV17Bound){
      college.dataset.vfV17Bound='1';
      college.addEventListener('change',function(){
        if(main.value!==college.value){
          main.value=college.value;
          main.dispatchEvent(new Event('change',{bubbles:true}));
        }else{
          try{
            if(typeof state!=='undefined'&&state)state.selectedCandidate=college.value;
            if(typeof renderMapColegios==='function')renderMapColegios();
            if(typeof renderTableColegios==='function')renderTableColegios();
          }catch(_){ }
        }
      });
    }

    if(!main.dataset.vfV17Sync){
      main.dataset.vfV17Sync='1';
      main.addEventListener('change',function(){
        syncCollegeSelectFromMain(main,college);
      });
      var obs=new MutationObserver(function(){syncCollegeSelectFromMain(main,college);});
      obs.observe(main,{childList:true,subtree:true});
    }

    var sheet=document.querySelector('.vf-map-filter-sheet');
    if(sheet&&!sheet.querySelector('.vf-filter-college-shortcut')){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='vf-filter-college-shortcut';
      btn.innerHTML='<span>Ver resultado deste filtro em Colégios</span><span>›</span>';
      var body=sheet.querySelector('.vf-map-filter-sheet-body');
      if(body)body.appendChild(btn);
      btn.addEventListener('click',function(){
        document.body.classList.remove('vf-map-filter-sheet-open');
        if(typeof window.switchView==='function')window.switchView('colegios');
        setTimeout(function(){
          syncCollegeSelectFromMain(main,college);
          try{college.focus({preventScroll:true});}catch(_){ }
        },120);
      });
    }

    installMapStayFix(main);
  }

  function installMapStayFix(main){
    if(main.dataset.vfV17Stay==='1')return;
    main.dataset.vfV17Stay='1';

    main.addEventListener('change',function(){
      setTimeout(function(){
        var mapTab=document.getElementById('tab-btn-map');
        var currentMap=mapTab&&mapTab.classList.contains('active');
        if(!currentMap)return;
        try{
          if(typeof state!=='undefined'&&state)state.selectedCandidate=main.value;
          if(typeof renderMapColegios==='function')renderMapColegios();
          if(typeof renderTableColegios==='function')renderTableColegios();
        }catch(_){ }
      },0);
    },true);
  }

  /* The legacy preview helper forces switchView('colegios') on cand-select change.
     Re-dispatching from a clone would lose app listeners, so instead we wrap switchView
     only during a map candidate change and ignore that single forced navigation. */
  function protectForcedCollegeNavigation(){
    var main=document.getElementById('cand-select');
    if(!main||main.dataset.vfV17Protect==='1'){return;}
    main.dataset.vfV17Protect='1';
    var original=window.switchView;
    if(typeof original!=='function'){setTimeout(protectForcedCollegeNavigation,120);return;}
    var suppress=false;
    main.addEventListener('change',function(){
      var mapTab=document.getElementById('tab-btn-map');
      suppress=!!(mapTab&&mapTab.classList.contains('active'));
      setTimeout(function(){suppress=false;},50);
    },true);
    window.switchView=function(view){
      if(suppress&&view==='colegios')return;
      return original.apply(this,arguments);
    };
  }

  function init(){ensureCollegeFilter();protectForcedCollegeNavigation();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,220);},{once:true});else setTimeout(init,220);
  setTimeout(init,800);
  setTimeout(init,1600);
})();
