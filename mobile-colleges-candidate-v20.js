(function(){
  'use strict';
  if(window.__vfMobileCollegesCandidateV20)return;window.__vfMobileCollegesCandidateV20=true;

  var view=null;
  var panel=null;
  var results=null;
  var collegeSelect=null;
  var renderInstalled=false;
  var lastKey='';

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
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

  function ensure(){
    if(!isMobile())return false;
    view=document.getElementById('view-table-colegios');
    collegeSelect=document.getElementById('vf-college-candidate-select');
    if(!view||!collegeSelect)return false;

    if(!panel){
      panel=document.createElement('section');
      panel.className='vf-college-candidate-panel';
      panel.innerHTML='<div class="vf-college-candidate-kicker"><span>Resultado por colégio</span><span>Toque para filtrar</span></div><button type="button" class="vf-college-candidate-open" aria-label="Selecionar candidato"><span class="vf-college-candidate-avatar">C</span><span class="vf-college-candidate-copy"><strong class="vf-college-candidate-name">Selecionar candidato</strong><span class="vf-college-candidate-meta">Escolha um nome para ver os votos por colégio</span></span></button>';
      var old=view.querySelector('.vf-college-candidate-filter');
      if(old)old.insertAdjacentElement('afterend',panel); else view.insertBefore(panel,view.firstChild);
      panel.querySelector('.vf-college-candidate-open').addEventListener('click',openFilter);
    }

    if(!results){
      results=document.createElement('section');
      results.className='vf-college-mobile-results';
      panel.insertAdjacentElement('afterend',results);
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

  function renderPanel(){
    if(!ensure())return;
    var key=selected();
    var c=info(key);
    var btn=panel.querySelector('.vf-college-candidate-open');
    var avatar=panel.querySelector('.vf-college-candidate-avatar');
    var name=panel.querySelector('.vf-college-candidate-name');
    var meta=panel.querySelector('.vf-college-candidate-meta');

    if(key==='ALL'||!c){
      avatar.textContent='VF';
      avatar.style.setProperty('--vf-cand-color','#3b82f6');
      name.textContent='Selecionar candidato';
      meta.textContent='Toque aqui e escolha um nome para ver os votos por colégio';
      btn.setAttribute('aria-label','Selecionar candidato para ver votos por colégio');
      view.classList.remove('vf-college-selected','vf-college-show-table');
      results.innerHTML='<div class="vf-college-empty-state"><strong>Escolha um candidato</strong><span>O filtro acima abre a mesma lista usada no mapa. Depois de escolher, os votos aparecem aqui separados por cada colégio eleitoral.</span></div>';
      return;
    }

    var total=totalFor(key,c);
    avatar.textContent=initials(c.name);
    avatar.style.setProperty('--vf-cand-color',c.color||'#3b82f6');
    btn.style.setProperty('--vf-cand-color',c.color||'#3b82f6');
    name.textContent=c.name;
    meta.textContent=(c.party?c.party+' • ':'')+(total?fmt(total)+' votos em Arapongas':'Resultado por colégio');
    btn.setAttribute('aria-label','Candidato '+c.name+'. Toque para escolher outro candidato.');
    renderResults(key,c,total);
  }

  function renderResults(key,c,total){
    var locais=[];
    try{locais=Array.isArray(ELEICAO_2024_DATA.locais)?ELEICAO_2024_DATA.locais.slice():[];}catch(_){locais=[];}
    locais.sort(function(a,b){return (Number(b&&b.votes&&b.votes[key])||0)-(Number(a&&a.votes&&a.votes[key])||0);});
    var sum=0;
    var cards=locais.map(function(loc,idx){
      var votes=Number(loc&&loc.votes&&loc.votes[key])||0;sum+=votes;
      var base=Number(loc&&loc.total_pref)||0;
      var pct=base>0?(votes/base*100).toFixed(1).replace('.',',')+'%':'';
      return '<article class="vf-college-result-card" style="--vf-cand-color:'+esc(c.color||'#60a5fa')+'"><span class="vf-college-result-rank">'+(idx+1)+'</span><span class="vf-college-result-info"><strong class="vf-college-result-name">'+esc(loc.name)+'</strong><span class="vf-college-result-sub">'+esc(loc.address||'')+(loc.sections?' • '+esc(loc.sections)+' seções':'')+'</span></span><span class="vf-college-result-votes"><strong>'+fmt(votes)+'</strong><span>'+esc(pct||'votos')+'</span></span></article>';
    }).join('');

    results.innerHTML='<div class="vf-college-results-head"><div><strong>'+esc(c.name)+'</strong><span>Votos em cada colégio eleitoral</span></div><span class="vf-college-results-total">'+fmt(total||sum)+' votos</span></div><div class="vf-college-result-list">'+cards+'</div><button type="button" class="vf-college-table-toggle">Ver tabela completa</button>';
    view.classList.add('vf-college-selected');
    view.classList.remove('vf-college-show-table');
    var toggle=results.querySelector('.vf-college-table-toggle');
    if(toggle)toggle.addEventListener('click',function(){view.classList.toggle('vf-college-show-table');toggle.textContent=view.classList.contains('vf-college-show-table')?'Voltar para visualização mobile':'Ver tabela completa';});
  }

  function sync(){
    if(!isMobile())return;
    var key=selected();
    if(key!==lastKey){lastKey=key;renderPanel();return;}
    renderPanel();
  }

  function bind(){
    if(!ensure()){setTimeout(bind,120);return;}
    if(!collegeSelect.dataset.vfCollegeV20){
      collegeSelect.dataset.vfCollegeV20='1';
      collegeSelect.addEventListener('change',function(){setTimeout(sync,30);});
    }
    var main=document.getElementById('cand-select');
    if(main&&!main.dataset.vfCollegeV20){main.dataset.vfCollegeV20='1';main.addEventListener('change',function(){setTimeout(sync,30);});}
    sync();
    installRenderHook();
  }

  function installRenderHook(){
    if(renderInstalled)return;
    if(typeof window.renderTableColegios!=='function'){setTimeout(installRenderHook,120);return;}
    renderInstalled=true;
    var original=window.renderTableColegios;
    window.renderTableColegios=function(){var r=original.apply(this,arguments);setTimeout(sync,20);return r;};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bind,520)},{once:true});else setTimeout(bind,520);
  setTimeout(bind,1000);
  setTimeout(bind,1800);
})();
