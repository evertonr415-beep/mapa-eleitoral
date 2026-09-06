(function(){
  'use strict';
  if(window.__vfMobileCollegesCandidateV20)return;window.__vfMobileCollegesCandidateV20=true;

  var view=null;
  var panel=null;
  var collegeSelect=null;
  var boundCollege=null;
  var boundMain=null;
  var renderHookInstalled=false;
  var lastPanelKey=null;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function initials(name){var a=String(name||'').trim().split(/\s+/).filter(Boolean);return ((a[0]||'C')[0]+(a.length>1?a[a.length-1][0]:'')).toUpperCase();}
  function selected(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function info(key){try{return ELEICAO_2024_DATA&&ELEICAO_2024_DATA.candidates?ELEICAO_2024_DATA.candidates[key]||null:null;}catch(_){return null;}}
  function totalFor(key,c){
    try{
      if(window.__vfTseFullDataV19&&window.__vfTseFullDataV19.totals&&Object.prototype.hasOwnProperty.call(window.__vfTseFullDataV19.totals,key))return Number(window.__vfTseFullDataV19.totals[key])||0;
    }catch(_){ }
    var m=String(c&&c.category||'').match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:votos?|v\b)/i);
    return m?Number(m[1].replace(/\./g,''))||0:0;
  }

  function cleanOldV20(){
    if(!view)return;
    view.querySelectorAll('.vf-college-mobile-results').forEach(function(el){el.remove();});
    view.classList.remove('vf-college-selected','vf-college-show-table');
  }

  function ensure(){
    if(!isMobile())return false;
    view=document.getElementById('view-table-colegios');
    collegeSelect=document.getElementById('vf-college-candidate-select');
    if(!view||!collegeSelect)return false;

    cleanOldV20();
    panel=view.querySelector('.vf-college-candidate-panel');
    if(!panel){
      panel=document.createElement('section');
      panel.className='vf-college-candidate-panel';
      panel.innerHTML='<div class="vf-college-candidate-kicker"><span>Resultado por colégio</span><span>Toque para filtrar</span></div><button type="button" class="vf-college-candidate-open" aria-label="Selecionar candidato"><span class="vf-college-candidate-avatar">C</span><span class="vf-college-candidate-copy"><strong class="vf-college-candidate-name">Selecionar candidato</strong><span class="vf-college-candidate-meta">Escolha um nome para ver os votos por colégio</span></span></button>';
      var old=view.querySelector('.vf-college-candidate-filter');
      if(old)old.insertAdjacentElement('afterend',panel); else view.insertBefore(panel,view.firstChild);
      panel.querySelector('.vf-college-candidate-open').addEventListener('click',openFilter);
    }
    return true;
  }

  function openFilter(){
    collegeSelect=document.getElementById('vf-college-candidate-select');
    if(!collegeSelect)return;
    var trigger=document.querySelector('.vf-mobile-candidate-trigger[data-target-select="vf-college-candidate-select"]');
    if(trigger){trigger.click();return;}
    try{collegeSelect.click();}catch(_){ }
  }

  function renderMobileGrid(){
    try{
      if(window.VFCollegeV7&&typeof window.VFCollegeV7.render==='function'){
        window.VFCollegeV7.render();
      }
    }catch(_){ }
  }

  function renderPanel(force){
    if(!ensure())return;
    var key=selected();
    if(!force&&key===lastPanelKey)return;
    lastPanelKey=key;
    var c=info(key);
    var btn=panel.querySelector('.vf-college-candidate-open');
    var avatar=panel.querySelector('.vf-college-candidate-avatar');
    var name=panel.querySelector('.vf-college-candidate-name');
    var meta=panel.querySelector('.vf-college-candidate-meta');

    if(key==='ALL'||!c){
      avatar.textContent='VF';
      avatar.style.setProperty('--vf-cand-color','#3b82f6');
      btn.style.setProperty('--vf-cand-color','#3b82f6');
      name.textContent='Selecionar candidato';
      meta.textContent='Toque aqui e escolha um nome para ver os votos por colégio';
      btn.setAttribute('aria-label','Selecionar candidato para ver votos por colégio');
      renderMobileGrid();
      return;
    }

    var total=totalFor(key,c);
    avatar.textContent=initials(c.name);
    avatar.style.setProperty('--vf-cand-color',c.color||'#3b82f6');
    btn.style.setProperty('--vf-cand-color',c.color||'#3b82f6');
    name.textContent=c.name;
    meta.textContent=(c.party?c.party+' • ':'')+(total?fmt(total)+' votos em Arapongas':'Resultado por colégio');
    btn.setAttribute('aria-label','Candidato '+c.name+'. Toque para escolher outro candidato.');
    renderMobileGrid();
  }

  function syncControls(value){
    var main=document.getElementById('cand-select');
    collegeSelect=document.getElementById('vf-college-candidate-select');
    if(main&&main.value!==value)main.value=value;
    if(collegeSelect&&collegeSelect.value!==value)collegeSelect.value=value;
  }

  function renderSelected(value,renderMapToo){
    value=String(value||'ALL');
    try{if(typeof state!=='undefined'&&state)state.selectedCandidate=value;}catch(_){ }
    syncControls(value);
    try{if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){ }
    renderMobileGrid();
    if(renderMapToo){try{if(typeof renderMapColegios==='function')renderMapColegios();}catch(_){ }}
    setTimeout(function(){renderPanel(true);renderMobileGrid();},20);
  }

  function installRenderHook(){
    if(renderHookInstalled)return;
    if(typeof window.renderTableColegios!=='function'){setTimeout(installRenderHook,120);return;}
    renderHookInstalled=true;
    var original=window.renderTableColegios;
    window.renderTableColegios=function(){
      var out=original.apply(this,arguments);
      setTimeout(function(){
        syncControls(selected());
        renderPanel(true);
        renderMobileGrid();
      },0);
      return out;
    };
  }

  function bind(){
    if(!ensure()){setTimeout(bind,120);return;}
    installRenderHook();

    collegeSelect=document.getElementById('vf-college-candidate-select');
    if(collegeSelect&&collegeSelect!==boundCollege){
      boundCollege=collegeSelect;
      collegeSelect.addEventListener('change',function(){
        var value=String(collegeSelect.value||'ALL');
        setTimeout(function(){renderSelected(value,true);},0);
      });
    }

    var main=document.getElementById('cand-select');
    if(main&&main!==boundMain){
      boundMain=main;
      main.addEventListener('change',function(){
        var value=String(main.value||'ALL');
        setTimeout(function(){
          syncControls(value);
          renderPanel(true);
          renderMobileGrid();
        },0);
      });
    }

    cleanOldV20();
    syncControls(selected());
    renderPanel(true);
    try{if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){ }
    renderMobileGrid();
  }

  /* v17 replaces the main selector and blocks later change listeners. The v7 mobile
     college grid was bound to the old selector, so re-render it from authoritative state. */
  setInterval(function(){
    if(!isMobile())return;
    var key=selected();
    if(key!==lastPanelKey){
      syncControls(key);
      renderPanel(true);
      renderMobileGrid();
    }
  },180);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bind,520)},{once:true});else setTimeout(bind,520);
  setTimeout(bind,1000);
  setTimeout(bind,1800);
})();
