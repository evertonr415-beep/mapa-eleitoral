(function(){
  'use strict';
  if(window.__vfTseOfficialTotalsV19)return;window.__vfTseOfficialTotalsV19=true;

  var totals={
    '20220':2135,'55155':1720,'11234':1576,'44044':1212,'70000':1210,'40133':1102,'20120':1024,'11555':1010,'44567':943,'55555':913,'55147':877,'22777':858,'44190':853,'55120':849,'12500':832,
    '11500':772,'11444':761,'13100':739,'55456':731,'10123':723,'22622':700,'22123':673,
    'dep_fed_lupion':14066,'dep_fed_filipe':5901,'dep_fed_beto':4060,'dep_fed_angelica':3731,'dep_fed_deltan':2228,'dep_fed_luisa':1777,'dep_fed_fahur':2225,'dep_fed_zeca':84,'dep_fed_aliel':316,'dep_fed_francischini':913,'dep_fed_sperafico':20,
    'dep_est_tiago':15471,'dep_est_bazana':9843,'dep_est_tercilio':617,'dep_est_curi':390,'dep_est_jacovos':1403,'dep_est_cobra':2190,'dep_est_pacheco':42,'dep_est_arilson':818
  };

  function fmt(n){try{return Number(n).toLocaleString('pt-BR');}catch(_){return String(n);}}
  function candidateInfo(k){try{return ELEICAO_2024_DATA&&ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[k]||null;}catch(_){return null;}}

  function categoryFor(k,info){
    var n=fmt(totals[k]);
    var old=String(info&&info.category||'');
    if(info&&info.type==='vereador')return 'Vereador Eleito ('+n+' votos)';
    if(info&&info.type==='suplente')return 'Suplente ('+n+' votos)';
    if(info&&info.type==='dep_federal')return (/^Deputada Federal/i.test(old)?'Deputada Federal':'Deputado Federal')+' ('+n+'v em Arapongas)';
    if(info&&info.type==='dep_estadual')return (/^Deputada Estadual/i.test(old)?'Deputada Estadual':'Deputado Estadual')+' ('+n+'v em Arapongas)';
    return old;
  }

  function optionLabel(k,info){
    var n=fmt(totals[k]);
    var base=(info&&info.name?info.name:k)+(info&&info.party?' ('+info.party+')':'')+' - '+n+' votos';
    if(info&&info.type==='vereador')base+=' (Eleito)';
    else if(info&&info.type==='suplente')base+=' (Suplente)';
    return base;
  }

  function patchData(){
    Object.keys(totals).forEach(function(k){var info=candidateInfo(k);if(info)info.category=categoryFor(k,info);});
    window.__VF_TSE_OFFICIAL_TOTALS_V19=totals;
  }

  function patchSelect(){
    var s=document.getElementById('cand-select');
    if(!s)return false;
    Object.keys(totals).forEach(function(k){
      var info=candidateInfo(k); if(!info)return;
      Array.from(s.options||[]).forEach(function(opt){if(String(opt.value)===k)opt.textContent=optionLabel(k,info);});
    });
    var c=document.getElementById('vf-college-candidate-select');
    if(c){c.innerHTML=s.innerHTML;c.value=s.value;}
    return true;
  }

  patchData();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(patchSelect,120);},{once:true});
  setTimeout(patchSelect,220);setTimeout(patchSelect,700);setTimeout(patchSelect,1400);
})();
