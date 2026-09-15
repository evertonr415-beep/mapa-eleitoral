(function(){
  'use strict';
  if(window.__vfTseFullDataV19Ui)return;window.__vfTseFullDataV19Ui=true;

  var partyFix={dep_fed_angelica:'PROS',dep_est_pacheco:'REPUBLICANOS'};

  // PREVIEW: números do arquivo enviado pelo usuário.
  var uploadedTotals={
    pref_cita:30557,
    pref_milani:27532,

    '20220':2135,
    '55155':1720,
    '11234':1576,
    '44044':1212,
    '40133':1102,
    '20120':1024,
    '11555':1010,
    '44567':943,
    '55555':913,
    '55147':877,
    '22777':858,
    '44190':853,
    '55120':849,
    '12500':832,

    dep_fed_lupion:14066,
    dep_fed_filipe:5901,
    dep_fed_beto:4060,
    dep_fed_angelica:3731,
    dep_fed_deltan:2228,
    dep_fed_fahur:2225,
    dep_fed_luisa:1777,

    dep_est_tiago:15471,
    dep_est_bazana:9843,
    dep_est_cobra:2190,
    dep_est_jacovos:1403,
    dep_est_arilson:818,
    dep_est_tercilio:617,
    dep_est_curi:248
  };

  function fmt(n){
    try{return Number(n).toLocaleString('pt-BR');}
    catch(_){return String(n);}
  }

  function replaceTotal(text,total){
    text=String(text||'');
    var f=fmt(total);
    var out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?=(?:votos?|v\b))/i,f+' ');
    if(out===text){
      out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?=v\s*(?:em\s+Arapongas)?)/i,f);
    }
    return out;
  }

  function totals(){
    var base=(window.__vfTseFullDataV19&&window.__vfTseFullDataV19.totals)||{};
    return Object.assign({},base,uploadedTotals);
  }

  function syncModel(all){
    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA.candidates)return;
    Object.keys(all).forEach(function(key){
      var c=ELEICAO_2024_DATA.candidates[key];
      if(!c)return;
      c.tseOfficialTotal=Number(all[key]);
      c.category=replaceTotal(c.category,c.tseOfficialTotal);
      if(partyFix[key])c.party=partyFix[key];
    });
  }

  function syncSelect(id,all){
    var select=document.getElementById(id);
    if(!select)return null;
    Array.from(select.options||[]).forEach(function(opt){
      var key=String(opt.value||'');
      if(!Object.prototype.hasOwnProperty.call(all,key))return;
      var c=(typeof ELEICAO_2024_DATA!=='undefined'&&ELEICAO_2024_DATA.candidates)?ELEICAO_2024_DATA.candidates[key]:null;
      var next=replaceTotal(opt.textContent,all[key]);
      if(c&&partyFix[key])next=next.replace(/\((?:REP|PP)\)/i,'('+c.party+')');
      if(opt.textContent!==next)opt.textContent=next;
    });
    return select;
  }

  function syncVisiblePicker(all,source){
    if(!source)return;
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(btn){
      var key=String(btn.getAttribute('data-value')||'');
      if(!Object.prototype.hasOwnProperty.call(all,key))return;
      var src=Array.from(source.options||[]).find(function(o){return String(o.value||'')===key;});
      var textEl=btn.querySelector('.vf-mobile-candidate-option-text');
      if(src&&textEl&&textEl.textContent!==src.textContent)textEl.textContent=src.textContent;
    });

    var selected=source.options&&source.selectedIndex>=0?source.options[source.selectedIndex]:null;
    var trigger=document.querySelector('.vf-mobile-candidate-trigger-text');
    if(selected&&trigger&&trigger.textContent!==selected.textContent)trigger.textContent=selected.textContent;
  }

  function sync(){
    try{
      if(!window.__vfTseFullDataV19Ready||!window.__vfTseFullDataV19||typeof ELEICAO_2024_DATA==='undefined')return;
      var all=totals();
      syncModel(all);
      var source=syncSelect('cand-select',all);
      syncSelect('vf-college-candidate-select',all);
      syncVisiblePicker(all,source);
      window.__vfUploadedResultsPreview={source:'arquivo-enviado',totals:uploadedTotals,aggregateOnly:true};
      window.__vfTseFullDataV19UiReady=true;
    }catch(e){console.error('TSE v19 UI sync failed',e);}
  }

  function start(){
    sync();
    setTimeout(sync,120);
    setTimeout(sync,350);
    setTimeout(sync,900);
    setInterval(sync,700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
