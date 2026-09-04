(function(){
  'use strict';
  if(window.__vfMobileCollegeGridFixedV2Loaded)return;
  window.__vfMobileCollegeGridFixedV2Loaded=true;

  var BREAKPOINT=900;
  var renderTimer=null;
  var lastViewportWidth=window.innerWidth;
  var resetScrollRequested=false;

  function isMobile(){return window.matchMedia('(max-width:'+BREAKPOINT+'px)').matches;}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function fmt(n){return (Number(n)||0).toLocaleString('pt-BR');}

  function data(){
    try{return typeof ELEICAO_2024_DATA!=='undefined'?ELEICAO_2024_DATA:null;}catch(_){return null;}
  }

  function currentCandidate(){
    var select=document.getElementById('cand-select');
    if(!select||!select.value||select.value==='ALL')return null;
    var d=data();
    return {key:select.value,info:d&&d.candidates?d.candidates[select.value]:null,select:select};
  }

  function candidateName(ctx){
    if(ctx&&ctx.info&&ctx.info.name)return ctx.info.name;
    if(!ctx||!ctx.select||ctx.select.selectedIndex<0)return 'Candidato';
    var t=(ctx.select.options[ctx.select.selectedIndex].textContent||'').trim();
    var p=t.indexOf(' - ');
    return p>0?t.slice(0,p):t;
  }

  function candidateParty(ctx){return ctx&&ctx.info&&ctx.info.party?ctx.info.party:'';}

  function collegeTotal(loc,ctx){
    if(ctx&&ctx.info&&ctx.info.type==='prefeito')return Number(loc.total_pref)||0;
    return Number(loc.total_ver)||Number(loc.total_pref)||0;
  }

  function leadershipStats(loc){
    var all=[];
    try{if(typeof state!=='undefined'&&state&&Array.isArray(state.liderancas))all=state.liderancas;}catch(_){}
    var matches=all.filter(function(item){
      if(item&&item.colegioId&&String(item.colegioId)===String(loc.id))return true;
      if(item&&item.colegioNome&&loc.name&&String(item.colegioNome).trim().toLowerCase()===String(loc.name).trim().toLowerCase())return true;
      return false;
    });
    return {
      count:matches.length,
      votes:matches.reduce(function(sum,item){return sum+(Number(item.metaVotos)||0);},0)
    };
  }

  function ensureWrap(){
    var view=document.getElementById('view-table-colegios');
    if(!view)return null;
    var wrap=view.querySelector('.vf-mobile-college-grid-wrap');
    if(!wrap){
      wrap=document.createElement('section');
      wrap.className='vf-mobile-college-grid-wrap';
      wrap.setAttribute('aria-label','Votação por colégio eleitoral');
      var first=view.firstElementChild;
      if(first&&first.nextSibling)view.insertBefore(wrap,first.nextSibling);
      else view.appendChild(wrap);
    }
    return wrap;
  }

  function ensureSheet(){
    var sheet=document.querySelector('.vf-mcg-sheet');
    if(sheet)return sheet;
    var overlay=document.createElement('button');
    overlay.type='button';
    overlay.className='vf-mcg-overlay';
    overlay.setAttribute('aria-label','Fechar informações');
    sheet=document.createElement('section');
    sheet.className='vf-mcg-sheet';
    sheet.setAttribute('aria-live','polite');
    document.body.appendChild(overlay);
    document.body.appendChild(sheet);
    overlay.addEventListener('click',closeSheet);
    return sheet;
  }

  function closeSheet(){document.body.classList.remove('vf-mcg-sheet-open');}

  function openSheet(loc,ctx,mode){
    var sheet=ensureSheet();
    var votes=Number(loc.votes&&loc.votes[ctx.key])||0;
    var total=collegeTotal(loc,ctx);
    var pct=total>0?((votes/total)*100).toFixed(1).replace('.',','):'0,0';
    var leaders=leadershipStats(loc);
    var eyebrow=mode==='leaders'?'Lideranças cadastradas':'Total do colégio';

    sheet.innerHTML=''+
      '<div class="vf-mcg-sheet-head">'+
        '<div><span>'+esc(eyebrow)+'</span><strong>'+esc(loc.name)+'</strong></div>'+
        '<button type="button" class="vf-mcg-sheet-close" aria-label="Fechar">×</button>'+
      '</div>'+
      '<div class="vf-mcg-sheet-grid">'+
        '<div><span>Seções</span><strong>'+fmt(loc.sections)+'</strong></div>'+
        '<div><span>Total do colégio</span><strong>'+fmt(total)+'</strong></div>'+
        '<div class="blue"><span>Votos</span><strong>'+fmt(votes)+' v</strong></div>'+
        '<div class="blue"><span>Desempenho</span><strong>'+pct+'%</strong></div>'+
        '<div class="green"><span>Lideranças</span><strong>'+fmt(leaders.count)+'</strong></div>'+
        '<div class="green"><span>Meta das lideranças</span><strong>+'+fmt(leaders.votes)+' v</strong></div>'+
      '</div>'+
      '<div class="vf-mcg-sheet-address">'+esc(loc.address||'Endereço não informado')+'</div>'+
      '<button type="button" class="vf-mcg-sheet-action">+ Adicionar liderança neste colégio</button>';

    sheet.querySelector('.vf-mcg-sheet-close').addEventListener('click',closeSheet);
    sheet.querySelector('.vf-mcg-sheet-action').addEventListener('click',function(){
      closeSheet();
      openAddLeadership(loc.id);
    });
    document.body.classList.add('vf-mcg-sheet-open');
  }

  function openAddLeadership(collegeId){
    try{
      if(typeof window.openNewLiderancaWithColegio==='function'){
        window.openNewLiderancaWithColegio(collegeId);
        return;
      }
      if(typeof openNewLiderancaWithColegio==='function'){
        openNewLiderancaWithColegio(collegeId);
        return;
      }
    }catch(_){}
    try{
      if(typeof window.openModalNewLideranca==='function')window.openModalNewLideranca();
      else if(typeof openModalNewLideranca==='function')openModalNewLideranca();
      var select=document.getElementById('inp-lid-colegio');
      if(select){select.value=collegeId;select.dispatchEvent(new Event('change',{bubbles:true}));}
    }catch(_){}
  }

  function icons(){
    return {
      total:'<svg viewBox="0 0 24 24"><path d="M4 19h16M6 16V9M12 16V5M18 16v-4"/></svg>',
      leaders:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.7-3.3 2.5-5 5.5-5s4.8 1.7 5.5 5M17 8v6M14 11h6"/></svg>',
      add:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'
    };
  }

  function render(){
    renderTimer=null;
    if(!isMobile()){
      document.body.classList.remove('vf-mobile-college-grid');
      return;
    }

    var ctx=currentCandidate();
    var d=data();
    var wrap=ensureWrap();
    if(!wrap)return;

    if(!ctx||!d||!Array.isArray(d.locais)){
      document.body.classList.remove('vf-mobile-college-grid');
      wrap.innerHTML='';
      return;
    }

    var view=document.getElementById('view-table-colegios');
    var previousScrollTop=view?view.scrollTop:0;
    var name=candidateName(ctx);
    var party=candidateParty(ctx);
    var totalCandidateVotes=0;
    var ico=icons();

    var rows=d.locais.map(function(loc,index){
      var votes=Number(loc.votes&&loc.votes[ctx.key])||0;
      var total=collegeTotal(loc,ctx);
      var pct=total>0?((votes/total)*100).toFixed(1).replace('.',','):'0,0';
      var leaders=leadershipStats(loc);
      totalCandidateVotes+=votes;
      return ''+
        '<div class="vf-mcg-row" data-college-id="'+esc(loc.id)+'">'+
          '<div class="vf-mcg-cell vf-mcg-number">'+(index+1)+'</div>'+
          '<div class="vf-mcg-cell vf-mcg-name"><strong>'+esc(loc.name)+'</strong></div>'+
          '<div class="vf-mcg-cell vf-mcg-sections">'+fmt(loc.sections)+'</div>'+
          '<div class="vf-mcg-cell vf-mcg-votes">'+fmt(votes)+' v</div>'+
          '<div class="vf-mcg-cell vf-mcg-pct"><span>'+pct+'%</span></div>'+
          '<div class="vf-mcg-cell vf-mcg-actions">'+
            '<button type="button" class="vf-mcg-btn vf-mcg-btn-total" data-total="'+esc(loc.id)+'" aria-label="Ver total do colégio" title="Total do colégio">'+ico.total+'</button>'+
            '<button type="button" class="vf-mcg-btn vf-mcg-btn-leaders" data-leaders="'+esc(loc.id)+'" aria-label="Ver lideranças cadastradas" title="Lideranças cadastradas">'+ico.leaders+(leaders.count?'<span class="vf-mcg-btn-badge">'+leaders.count+'</span>':'')+'</button>'+
            '<button type="button" class="vf-mcg-btn vf-mcg-btn-add" data-add="'+esc(loc.id)+'" aria-label="Adicionar liderança" title="Adicionar liderança">'+ico.add+'</button>'+
          '</div>'+
        '</div>';
    }).join('');

    wrap.innerHTML=''+
      '<div class="vf-mcg-summary">'+
        '<div class="vf-mcg-summary-copy"><strong>Votos por colégio • '+esc(name)+(party?' ('+esc(party)+')':'')+'</strong><span>'+d.locais.length+' colégios eleitorais</span></div>'+
        '<div class="vf-mcg-summary-total">'+fmt(totalCandidateVotes)+' votos</div>'+
      '</div>'+
      '<div class="vf-mcg-table">'+
        '<div class="vf-mcg-head"><span>#</span><span>Colégio</span><span>Seç.</span><span>Votos</span><span>%</span><span>Info</span></div>'+
        rows+
      '</div>';

    wrap.querySelectorAll('[data-total]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=btn.getAttribute('data-total');
        var loc=d.locais.find(function(x){return String(x.id)===String(id);});
        if(loc)openSheet(loc,ctx,'total');
      });
    });
    wrap.querySelectorAll('[data-leaders]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=btn.getAttribute('data-leaders');
        var loc=d.locais.find(function(x){return String(x.id)===String(id);});
        if(loc)openSheet(loc,ctx,'leaders');
      });
    });
    wrap.querySelectorAll('[data-add]').forEach(function(btn){
      btn.addEventListener('click',function(){openAddLeadership(btn.getAttribute('data-add'));});
    });

    document.body.classList.add('vf-mobile-college-grid');

    /* V2: nunca fecha o drawer durante renderizações automáticas. */
    if(view){
      if(resetScrollRequested){
        view.scrollTop=0;
        resetScrollRequested=false;
      }else if(previousScrollTop>0){
        window.requestAnimationFrame(function(){view.scrollTop=previousScrollTop;});
      }
    }
  }

  function schedule(delay){clearTimeout(renderTimer);renderTimer=setTimeout(render,delay==null?100:delay);}

  function install(){
    var select=document.getElementById('cand-select');
    if(!select){setTimeout(install,150);return;}
    if(!select.dataset.vfMobileCollegeGridFixedV2Bound){
      select.dataset.vfMobileCollegeGridFixedV2Bound='1';
      select.addEventListener('change',function(){
        /* Fechar o menu aqui é intencional: o usuário acabou de escolher um candidato. */
        document.body.classList.remove('vf-drawer-open');
        resetScrollRequested=true;
        schedule(140);
        setTimeout(render,360);
      });
    }
    var tbody=document.getElementById('table-colegios-body');
    if(tbody&&!tbody.dataset.vfMobileCollegeGridFixedV2Observed){
      tbody.dataset.vfMobileCollegeGridFixedV2Observed='1';
      new MutationObserver(function(){schedule(90);}).observe(tbody,{childList:true,subtree:true});
    }
    schedule(250);
    setTimeout(render,900);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  /* Safari iOS altera apenas a altura do viewport durante o scroll. Isso não deve recriar a lista. */
  window.addEventListener('resize',function(){
    var width=window.innerWidth;
    if(Math.abs(width-lastViewportWidth)>4){
      lastViewportWidth=width;
      schedule(120);
    }
  },{passive:true});

  window.addEventListener('orientationchange',function(){
    lastViewportWidth=window.innerWidth;
    schedule(180);
  },{passive:true});
}());
