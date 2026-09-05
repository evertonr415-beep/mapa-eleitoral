(function(){
  'use strict';
  if(window.__vfSharedFilterV17)return;window.__vfSharedFilterV17=true;

  var cleanMain=null;
  var collegeSelect=null;
  var collegeObserver=null;

  function renderCandidate(value){
    try{
      if(typeof state!=='undefined'&&state)state.selectedCandidate=value;
      if(typeof renderMapColegios==='function')renderMapColegios();
      if(typeof renderTableColegios==='function')renderTableColegios();
    }catch(_){ }
  }

  function syncCollegeSelectFromMain(main,college){
    if(!main||!college)return;
    var value=main.value;
    college.innerHTML=main.innerHTML;
    college.value=value;
  }

  function cleanLegacyCandidateSelect(){
    var current=document.getElementById('cand-select');
    if(!current)return null;
    if(current.dataset.vfV17Clean==='1'){
      cleanMain=current;
      return current;
    }

    var value=current.value;
    var clean=current.cloneNode(true);
    clean.value=value;

    /* Prevent delayed helpers from reattaching the old behavior. */
    clean.dataset.vfV17Clean='1';
    clean.dataset.vfV16Bound='1';
    clean.dataset.previewFixInstalled='1';
    delete clean.dataset.vfV17Sync;
    delete clean.dataset.vfV17Stay;
    delete clean.dataset.vfV17Protect;

    current.parentNode.replaceChild(clean,current);
    clean.value=value;
    cleanMain=clean;

    clean.addEventListener('change',function(ev){
      ev.stopImmediatePropagation();
      renderCandidate(clean.value);
      if(collegeSelect)syncCollegeSelectFromMain(clean,collegeSelect);
      document.body.classList.remove('vf-map-filter-sheet-open');
      /* Deliberately remain on the current view. Selecting a candidate is a filter,
         never a navigation action. */
    },true);

    return clean;
  }

  function ensureCollegeFilter(){
    if(!document.body.classList.contains('vf-mobile'))return;
    var main=cleanLegacyCandidateSelect();
    var collegeView=document.getElementById('view-table-colegios');
    if(!main||!collegeView){setTimeout(ensureCollegeFilter,120);return;}

    var wrap=collegeView.querySelector('.vf-college-candidate-filter');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='vf-college-candidate-filter';
      wrap.innerHTML='<div class="vf-college-candidate-filter-copy"><strong>Vereador</strong><span>Filtro compartilhado</span></div><select id="vf-college-candidate-select" aria-label="Selecionar vereador ou candidato"></select><span class="vf-college-candidate-filter-badge">Mapa + Colégios</span>';
      collegeView.insertBefore(wrap,collegeView.firstChild);
    }

    collegeSelect=wrap.querySelector('#vf-college-candidate-select');
    syncCollegeSelectFromMain(main,collegeSelect);

    if(!collegeSelect.dataset.vfV17Bound){
      collegeSelect.dataset.vfV17Bound='1';
      collegeSelect.addEventListener('change',function(ev){
        ev.stopImmediatePropagation();
        main.value=collegeSelect.value;
        renderCandidate(collegeSelect.value);
        syncCollegeSelectFromMain(main,collegeSelect);
        /* Stay inside Colégios when selection happens there. */
      },true);
    }

    if(!collegeObserver){
      collegeObserver=new MutationObserver(function(){
        if(cleanMain&&collegeSelect)syncCollegeSelectFromMain(cleanMain,collegeSelect);
      });
      collegeObserver.observe(main,{childList:true,subtree:true});
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
          syncCollegeSelectFromMain(main,collegeSelect);
          try{collegeSelect.focus({preventScroll:true});}catch(_){ }
        },120);
      });
    }
  }

  function init(){
    cleanLegacyCandidateSelect();
    ensureCollegeFilter();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,220);},{once:true});else setTimeout(init,220);
  setTimeout(init,650);
  setTimeout(init,1300);
})();
