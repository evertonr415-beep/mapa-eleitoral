(function(){
  'use strict';
  if(window.__vfTseFullDataV19Ui)return;
  window.__vfTseFullDataV19Ui=true;

  // Protege a lista de candidatos ANTES do mobile-candidate-picker-v18 criar seu observer.
  // Mudancas apenas de texto no select nao devem reconstruir a lista nem chamar scrollIntoView.
  (function installCandidateObserverGuard(){
    if(window.__vfCandidateObserverGuardV33)return;
    window.__vfCandidateObserverGuardV33=true;
    var NativeMO=window.MutationObserver;
    if(!NativeMO)return;

    function underCandidateSelect(node){
      var sel=document.getElementById('cand-select');
      return !!(sel&&node&&(node===sel||sel.contains(node)));
    }
    function structural(records){
      return records.some(function(r){
        if(r.type!=='childList')return false;
        var nodes=Array.prototype.slice.call(r.addedNodes||[]).concat(Array.prototype.slice.call(r.removedNodes||[]));
        return nodes.some(function(n){
          if(!n||n.nodeType!==1)return false;
          var tag=String(n.tagName||'').toLowerCase();
          return tag==='option'||tag==='optgroup'||!!(n.querySelector&&n.querySelector('option,optgroup'));
        });
      });
    }
    function restore(y){
      if(y==null)return;
      var apply=function(){
        var list=document.querySelector('.vf-mobile-candidate-list');
        if(list&&document.body.classList.contains('vf-mobile-candidate-open'))list.scrollTop=y;
      };
      requestAnimationFrame(apply);setTimeout(apply,0);setTimeout(apply,50);setTimeout(apply,100);
    }
    function GuardedMO(cb){
      return new NativeMO(function(records,obs){
        var src=(records||[]).filter(function(r){return underCandidateSelect(r.target);});
        if(src.length){
          if(!structural(src))return;
          var list=document.querySelector('.vf-mobile-candidate-list');
          var y=document.body.classList.contains('vf-mobile-candidate-open')&&list?list.scrollTop:null;
          cb(records,obs);restore(y);return;
        }
        cb(records,obs);
      });
    }
    GuardedMO.prototype=NativeMO.prototype;
    try{Object.setPrototypeOf(GuardedMO,NativeMO);}catch(_){ }
    window.MutationObserver=GuardedMO;

    var nativeScroll=Element.prototype.scrollIntoView;
    if(nativeScroll&&!Element.prototype.__vfNoCandidateJumpV33){
      try{Object.defineProperty(Element.prototype,'__vfNoCandidateJumpV33',{value:true,configurable:true});}catch(_){ }
      Element.prototype.scrollIntoView=function(){
        try{
          if(this.classList&&this.classList.contains('vf-mobile-candidate-option')&&this.closest('.vf-mobile-candidate-list')&&document.body.classList.contains('vf-mobile-candidate-open')){
            var list=this.closest('.vf-mobile-candidate-list');
            if(list&&list.scrollTop>12)return;
          }
        }catch(_){ }
        return nativeScroll.apply(this,arguments);
      };
    }
  })();

  var replacement={oldKey:'70000',key:'70123',name:'Arnaldo do Povo',party:'AVANTE',total:451,category:'Suplente (451 votos)',type:'suplente',color:'#64748b',optionText:'Arnaldo do Povo (Avante) - 451 votos (Suplente)'};
  var partyFix={dep_fed_angelica:'PROS',dep_est_pacheco:'REPUBLICANOS'};
  var uploadedTotals={
    pref_cita:30557,pref_milani:27532,
    '20220':2135,'55155':1720,'11234':1576,'44044':1212,'70123':451,'40133':1102,'20120':1024,'11555':1010,'44567':943,'55555':913,'55147':877,'22777':858,'44190':853,'55120':849,'12500':832,
    dep_fed_lupion:14066,dep_fed_filipe:5901,dep_fed_beto:4060,dep_fed_angelica:3731,dep_fed_deltan:2228,dep_fed_fahur:2225,dep_fed_luisa:1777,
    dep_est_tiago:15471,dep_est_bazana:9843,dep_est_cobra:2190,dep_est_jacovos:1403,dep_est_arilson:818,dep_est_tercilio:617,dep_est_curi:248
  };

  function fmt(n){try{return Number(n).toLocaleString('pt-BR');}catch(_){return String(n);}}
  function replaceTotal(text,total){
    text=String(text||'');var f=fmt(total);
    var out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?=(?:votos?|v\b))/i,f+' ');
    if(out===text)out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?=v\s*(?:em\s+Arapongas)?)/i,f);
    return out;
  }

  function migrateModel(){
    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA.candidates)return false;
    var old=ELEICAO_2024_DATA.candidates[replacement.oldKey];
    delete ELEICAO_2024_DATA.candidates[replacement.oldKey];
    ELEICAO_2024_DATA.candidates[replacement.key]={name:replacement.name,party:replacement.party,category:replacement.category,type:replacement.type,color:replacement.color,tseOfficialTotal:replacement.total};
    (ELEICAO_2024_DATA.locais||[]).forEach(function(loc){if(loc&&loc.votes&&Object.prototype.hasOwnProperty.call(loc.votes,replacement.oldKey))delete loc.votes[replacement.oldKey];});
    Object.keys(uploadedTotals).forEach(function(key){
      var c=ELEICAO_2024_DATA.candidates[key];if(!c)return;
      c.tseOfficialTotal=Number(uploadedTotals[key]);
      c.category=replaceTotal(c.category,c.tseOfficialTotal);
      if(partyFix[key])c.party=partyFix[key];
    });
    try{if(typeof state!=='undefined'&&state&&String(state.selectedCandidate||'')===replacement.oldKey)state.selectedCandidate='ALL';}catch(_){ }
    return true;
  }

  function migrateFullData(){
    var d=window.__vfTseFullDataV19;if(!d)return;
    if(d.totals){delete d.totals[replacement.oldKey];d.totals[replacement.key]=replacement.total;}
    if(d.votes)delete d.votes[replacement.oldKey];
  }

  function updateSelect(id){
    var sel=document.getElementById(id);if(!sel)return false;
    var oldOpt=Array.from(sel.options||[]).find(function(o){return String(o.value||'')===replacement.oldKey;});
    var newOpt=Array.from(sel.options||[]).find(function(o){return String(o.value||'')===replacement.key;});
    if(oldOpt&&newOpt&&oldOpt!==newOpt){oldOpt.remove();oldOpt=null;}
    if(oldOpt){oldOpt.value=replacement.key;oldOpt.textContent=replacement.optionText;newOpt=oldOpt;}
    if(newOpt&&newOpt.textContent!==replacement.optionText)newOpt.textContent=replacement.optionText;
    Array.from(sel.options||[]).forEach(function(opt){
      var key=String(opt.value||'');if(!Object.prototype.hasOwnProperty.call(uploadedTotals,key))return;
      var next=key===replacement.key?replacement.optionText:replaceTotal(opt.textContent,uploadedTotals[key]);
      if(opt.textContent!==next)opt.textContent=next;
    });
    return true;
  }

  function updateVisibleRows(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value="70000"]').forEach(function(row){row.dataset.value=replacement.key;});
    document.querySelectorAll('.vf-mobile-candidate-option[data-value="70123"]').forEach(function(row){
      var text=row.querySelector('.vf-mobile-candidate-option-text');if(text)text.textContent=replacement.optionText;
      var meta=row.querySelector('.vf-mobile-candidate-option-meta');if(meta)meta.textContent='451 votos oficiais • sem detalhamento por colégio';
      var badge=row.querySelector('.vf-mobile-candidate-status');if(badge)badge.textContent='Total';
    });
  }

  function sync(){
    try{
      if(!window.__vfTseFullDataV19Ready||!window.__vfTseFullDataV19||typeof ELEICAO_2024_DATA==='undefined')return false;
      migrateFullData();migrateModel();updateSelect('cand-select');updateSelect('vf-college-candidate-select');updateVisibleRows();
      window.__vfUploadedResultsPreview={source:'arquivo-enviado',totals:uploadedTotals,aggregateOnly:true};
      window.__vfCandidateReplacement={from:replacement.oldKey,to:replacement.key,name:replacement.name,total:replacement.total,status:'suplente'};
      window.__vfTseFullDataV19UiReady=true;
      return true;
    }catch(e){console.error('TSE v19 UI sync failed',e);return false;}
  }

  function start(){
    sync();setTimeout(sync,80);setTimeout(sync,250);setTimeout(sync,700);setTimeout(sync,1400);
  }
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('.vf-mobile-candidate-trigger,.vf24-candidate-trigger'):null;
    if(t)setTimeout(function(){sync();},0);
  },true);
  document.addEventListener('change',function(ev){var id=ev.target&&ev.target.id||'';if(id==='cand-select'||id==='vf-college-candidate-select')setTimeout(sync,0);},true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
