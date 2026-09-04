(function () {
  'use strict';

  if (window.__vfMobileCandidateVotesLoaded) return;
  window.__vfMobileCandidateVotesLoaded = true;

  var BREAKPOINT = 900;

  function isMobile() { return window.matchMedia('(max-width:' + BREAKPOINT + 'px)').matches; }
  function closeMobilePanels() { document.body.classList.remove('vf-drawer-open','vf-leader-sheet-open'); }
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function candidateInfo(key) { try { return (typeof ELEICAO_2024_DATA !== 'undefined' && ELEICAO_2024_DATA.candidates) ? (ELEICAO_2024_DATA.candidates[key] || null) : null; } catch (_) { return null; } }
  function locations() { try { return (typeof ELEICAO_2024_DATA !== 'undefined' && Array.isArray(ELEICAO_2024_DATA.locais)) ? ELEICAO_2024_DATA.locais : []; } catch (_) { return []; } }
  function leaders() { try { return (typeof state !== 'undefined' && state && Array.isArray(state.liderancas)) ? state.liderancas : []; } catch (_) { return []; } }
  function setCandidateState(value) { try { if (typeof state !== 'undefined' && state) state.selectedCandidate = value; } catch (_) {} }
  function selectedOptionLabel() { var select=document.getElementById('cand-select'); return (!select||select.selectedIndex<0)?'':(select.options[select.selectedIndex].textContent||'').trim(); }
  function fallbackCandidateName(label) { var clean=String(label||'').replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').trim(); var cut=clean.indexOf(' - '); if(cut>-1)clean=clean.slice(0,cut); return clean||'Candidato selecionado'; }
  function getCollegeLeadershipStats(loc) { var list=leaders().filter(function(item){ if(item.colegioId===loc.id)return true; if(!item.colegioNome||!loc.name)return false; return String(item.colegioNome).toLowerCase().indexOf(String(loc.name).toLowerCase().split(' ')[0])>-1; }); return {count:list.length,votes:list.reduce(function(sum,item){return sum+(Number(item.metaVotos)||0);},0)}; }

  function ensureMobileList(view) {
    var list=view.querySelector('.vf-candidate-mobile-list');
    if(list)return list;
    list=document.createElement('section');
    list.className='vf-candidate-mobile-list';
    list.setAttribute('aria-label','Votação por colégio eleitoral');
    var table=view.querySelector('.colegios-table');
    if(table&&table.parentNode)table.parentNode.insertBefore(list,table); else view.appendChild(list);
    return list;
  }

  function ensureDetailSheet() {
    var sheet=document.querySelector('.vf-college-detail-sheet');
    if(sheet)return sheet;
    var overlay=document.createElement('button');
    overlay.type='button'; overlay.className='vf-college-detail-overlay'; overlay.setAttribute('aria-label','Fechar detalhes do colégio');
    sheet=document.createElement('section'); sheet.className='vf-college-detail-sheet'; sheet.setAttribute('aria-live','polite');
    document.body.append(overlay,sheet);
    overlay.addEventListener('click',closeDetailSheet);
    return sheet;
  }

  function closeDetailSheet(){ document.body.classList.remove('vf-college-detail-open'); }

  function openDetailSheet(loc,value,info){
    var sheet=ensureDetailSheet();
    var votes=Number(loc.votes&&loc.votes[value])||0;
    var totalCollege=Number(loc.total_pref)||Number(loc.total_ver)||0;
    var pct=totalCollege>0?((votes/totalCollege)*100).toFixed(1).replace('.',','):'0,0';
    var leadership=getCollegeLeadershipStats(loc);
    sheet.innerHTML=''+
      '<div class="vf-college-sheet-head"><div><span>Colégio eleitoral</span><strong>'+escapeHtml(loc.name)+'</strong></div><button type="button" class="vf-college-sheet-close" aria-label="Fechar">×</button></div>'+
      '<div class="vf-college-sheet-stats">'+
        '<div class="vf-blue"><span>Votos</span><strong>'+votes.toLocaleString('pt-BR')+' ('+pct+'%)</strong></div>'+
        '<div><span>Seções</span><strong>'+(Number(loc.sections)||0)+'</strong></div>'+
        '<div><span>Total</span><strong>'+totalCollege.toLocaleString('pt-BR')+'</strong></div>'+
        '<div class="vf-green"><span>Lideranças</span><strong>'+leadership.count+'</strong></div>'+
        '<div class="vf-green"><span>Meta</span><strong>+'+leadership.votes+'v</strong></div>'+
        '<div><span>Candidato</span><strong>'+escapeHtml(info&&info.name?info.name:fallbackCandidateName(selectedOptionLabel()))+'</strong></div>'+
      '</div>'+
      '<div class="vf-college-sheet-address">'+escapeHtml(loc.address||'Endereço não informado')+'</div>'+
      '<button type="button" class="vf-college-sheet-action" data-vf-sheet-add="'+escapeHtml(loc.id)+'">+ Adicionar liderança neste colégio</button>';
    sheet.querySelector('.vf-college-sheet-close').addEventListener('click',closeDetailSheet);
    sheet.querySelector('[data-vf-sheet-add]').addEventListener('click',function(){
      var id=this.getAttribute('data-vf-sheet-add'); closeDetailSheet();
      try { if(typeof openNewLiderancaWithColegio==='function') openNewLiderancaWithColegio(id); else if(typeof window.openNewLiderancaWithColegio==='function') window.openNewLiderancaWithColegio(id); } catch(_){}
    });
    document.body.classList.add('vf-college-detail-open');
  }

  function renderCompactCandidateList(value,info){
    var view=document.getElementById('view-table-colegios'); if(!view)return;
    var listRoot=ensureMobileList(view), locs=locations();
    var name=info&&info.name?info.name:fallbackCandidateName(selectedOptionLabel());
    var party=info&&info.party?info.party:'';
    var totalVotes=locs.reduce(function(sum,loc){return sum+(Number(loc.votes&&loc.votes[value])||0);},0);
    var eyeIcon='<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/></svg>';
    var plusIcon='<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
    var rows=locs.map(function(loc,index){
      var votes=Number(loc.votes&&loc.votes[value])||0, totalCollege=Number(loc.total_pref)||Number(loc.total_ver)||0;
      var pct=totalCollege>0?((votes/totalCollege)*100).toFixed(1).replace('.',','):'0,0';
      return '<article class="vf-candidate-college-item">'+
        '<div class="vf-candidate-college-row">'+
          '<span class="vf-candidate-college-index">'+String(index+1).padStart(2,'0')+'</span>'+
          '<span class="vf-candidate-college-copy"><strong>'+escapeHtml(loc.name)+'</strong></span>'+
          '<span class="vf-candidate-vote-box"><strong>'+votes.toLocaleString('pt-BR')+' v</strong><span>'+pct+'%</span></span>'+
          '<span class="vf-candidate-row-actions">'+
            '<button type="button" class="vf-candidate-row-action vf-detail-btn" data-vf-detail="'+escapeHtml(loc.id)+'" aria-label="Ver detalhes">'+eyeIcon+'</button>'+
            '<button type="button" class="vf-candidate-row-action vf-add-btn" data-vf-add-leader="'+escapeHtml(loc.id)+'" aria-label="Adicionar liderança">'+plusIcon+'</button>'+
          '</span>'+
        '</div></article>';
    }).join('');
    listRoot.innerHTML='<div class="vf-candidate-summary"><div class="vf-candidate-summary-copy"><strong>'+escapeHtml(name)+'</strong><small>'+escapeHtml(party?party+' • '+locs.length+' colégios':locs.length+' colégios')+'</small></div><div class="vf-candidate-summary-total"><span>Total</span><strong>'+totalVotes.toLocaleString('pt-BR')+'</strong></div></div><div class="vf-candidate-college-list">'+rows+'</div>';
    listRoot.querySelectorAll('[data-vf-detail]').forEach(function(button){ button.addEventListener('click',function(){ var id=button.getAttribute('data-vf-detail'); var loc=locs.find(function(x){return x.id===id;}); if(loc)openDetailSheet(loc,value,info); }); });
    listRoot.querySelectorAll('[data-vf-add-leader]').forEach(function(button){ button.addEventListener('click',function(){ var id=button.getAttribute('data-vf-add-leader'); try { if(typeof openNewLiderancaWithColegio==='function') openNewLiderancaWithColegio(id); else if(typeof window.openNewLiderancaWithColegio==='function') window.openNewLiderancaWithColegio(id); } catch(_){} }); });
    document.body.classList.add('vf-candidate-list-active');
  }

  function clearCompactList(){ document.body.classList.remove('vf-candidate-list-active'); closeDetailSheet(); var view=document.getElementById('view-table-colegios'); var list=view&&view.querySelector('.vf-candidate-mobile-list'); if(list)list.innerHTML=''; }

  function renderCandidateVotePage(value){
    var info=candidateInfo(value); setCandidateState(value); closeMobilePanels();
    try{if(typeof renderMapColegios==='function')renderMapColegios();}catch(_){}
    try{if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){}
    if(typeof window.switchView==='function')window.switchView('colegios');
    window.setTimeout(function(){
      try{if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){}
      if(value==='ALL')clearCompactList(); else renderCompactCandidateList(value,info);
      var view=document.getElementById('view-table-colegios'); if(view)view.scrollTop=0;
      window.dispatchEvent(new Event('resize'));
    },220);
  }

  function onCandidateChanged(event){ if(!isMobile())return; var select=event.currentTarget; renderCandidateVotePage(select&&select.value?select.value:'ALL'); }
  function install(){ var select=document.getElementById('cand-select'); if(!select||select.dataset.vfCandidateVotesBound==='1')return; select.dataset.vfCandidateVotesBound='1'; select.addEventListener('change',onCandidateChanged); }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){window.setTimeout(install,120);},{once:true}); else window.setTimeout(install,120);
  window.setTimeout(install,450); window.setTimeout(install,1100);
}());