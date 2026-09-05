(function(){
  'use strict';
  if(window.__vfMapFiltersV16)return;window.__vfMapFiltersV16=true;

  function iconClose(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';}

  function ensureSheet(){
    if(!document.body.classList.contains('vf-mobile'))return;
    var map=document.getElementById('view-map-container');
    var drawer=document.querySelector('.vf-mobile-drawer');
    var drawerFilters=drawer&&drawer.querySelector('.vf-drawer-filters');
    if(!map||!drawerFilters){setTimeout(ensureSheet,100);return;}

    var sheet=document.querySelector('.vf-map-filter-sheet');
    if(!sheet){
      sheet=document.createElement('section');
      sheet.className='vf-map-filter-sheet';
      sheet.setAttribute('aria-label','Filtros do mapa');
      sheet.innerHTML='<div class="vf-map-filter-sheet-head"><div class="vf-map-filter-sheet-title"><strong>Filtros</strong><span>Camadas e vereador selecionado</span></div><button type="button" class="vf-map-filter-sheet-close" aria-label="Fechar filtros">'+iconClose()+'</button></div><div class="vf-map-filter-sheet-body"><div class="vf-map-filter-controls"></div><div class="vf-map-filter-sheet-note"><b>Vereador:</b> esta seleção continua valendo também para a aba Colégios.</div></div>';
      var backdrop=document.createElement('button');
      backdrop.type='button';
      backdrop.className='vf-map-filter-backdrop';
      backdrop.setAttribute('aria-label','Fechar filtros');
      document.body.append(backdrop,sheet);
      backdrop.addEventListener('click',closeSheet);
      sheet.querySelector('.vf-map-filter-sheet-close').addEventListener('click',closeSheet);
    }

    var controls=sheet.querySelector('.vf-map-filter-controls');
    if(drawerFilters.parentElement)drawerFilters.parentElement.classList.add('vf-filter-section-moved');
    if(drawerFilters.parentElement!==controls)controls.appendChild(drawerFilters);

    var cand=document.getElementById('cand-select');
    var ver=document.getElementById('filter-liderancas-vereador');
    if(cand&&!cand.previousElementSibling?.classList?.contains('vf-map-filter-field-label')){
      var lab=document.createElement('div');lab.className='vf-map-filter-field-label';lab.innerHTML='Vereador <small>filtra mapa e colégios</small>';cand.parentNode.insertBefore(lab,cand);
    }
    if(ver&&!ver.previousElementSibling?.classList?.contains('vf-map-filter-field-label')){
      var lab2=document.createElement('div');lab2.className='vf-map-filter-field-label vf-map-filter-secondary-label';lab2.textContent='Lideranças por vereador';ver.parentNode.insertBefore(lab2,ver);
    }
    syncSecondaryLabel();

    var filterBtn=document.querySelector('.vf-map-toolbar .vf-map-filter');
    if(filterBtn&&!filterBtn.dataset.vfV16Bound){
      filterBtn.dataset.vfV16Bound='1';
      filterBtn.addEventListener('click',function(ev){ev.stopPropagation();toggleSheet();},true);
    }

    if(cand&&!cand.dataset.vfV16Bound){
      cand.dataset.vfV16Bound='1';
      cand.addEventListener('change',function(){
        try{
          if(typeof state!=='undefined'&&state)state.selectedCandidate=cand.value;
          if(typeof renderMapColegios==='function')renderMapColegios();
          if(typeof renderTableColegios==='function')renderTableColegios();
        }catch(_){ }
        setTimeout(closeSheet,120);
      });
    }
    if(ver&&!ver.dataset.vfV16Bound){
      ver.dataset.vfV16Bound='1';
      ver.addEventListener('change',function(){setTimeout(closeSheet,120);});
    }
    drawerFilters.querySelectorAll('input[type="checkbox"]').forEach(function(el){
      if(el.dataset.vfV16Bound)return;
      el.dataset.vfV16Bound='1';
      el.addEventListener('change',function(){setTimeout(closeSheet,100);});
    });

    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeSheet();},{once:false});
  }

  function syncSecondaryLabel(){
    var ver=document.getElementById('filter-liderancas-vereador');
    var lab=document.querySelector('.vf-map-filter-secondary-label');
    if(!lab)return;
    lab.hidden=!ver||getComputedStyle(ver).display==='none';
  }
  function openSheet(){
    if(!document.body.classList.contains('vf-mobile'))return;
    document.body.classList.remove('vf-drawer-open');
    document.body.classList.add('vf-map-filter-sheet-open');
    syncSecondaryLabel();
  }
  function closeSheet(){document.body.classList.remove('vf-map-filter-sheet-open');}
  function toggleSheet(){document.body.classList.contains('vf-map-filter-sheet-open')?closeSheet():openSheet();}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(ensureSheet,180);},{once:true});else setTimeout(ensureSheet,180);
  setTimeout(ensureSheet,700);
  setTimeout(ensureSheet,1500);
})();
