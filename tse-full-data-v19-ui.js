(function(){
  'use strict';
  if(window.__vfTseFullDataV19Ui)return;window.__vfTseFullDataV19Ui=true;

  var partyFix={dep_fed_angelica:'PROS',dep_est_pacheco:'REPUBLICANOS'};

  // PREVIEW: números do arquivo enviado pelo usuário.
  // Só substituímos candidatos que possuem correspondência segura no cadastro atual.
  // Candidatos que não existem hoje no mapa permanecem inalterados até confirmação.
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

  function fmt(n){try{return Number(n).toLocaleString('pt-BR');}catch(_){return String(n);}}
  function replaceTotal(text,total){
    text=String(text||'');
    var f=fmt(total);
    var out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?=(?:votos?|v\b))/i,f+' ');
    if(out===text){
      out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?=v\s*(?:em\s+Arapongas)?)/i,f);
    }
    return out;
  }

  function apply(){
    try{
      if(!window.__vfTseFullDataV19Ready||!window.__vfTseFullDataV19||typeof ELEICAO_2024_DATA==='undefined')return setTimeout(apply,70);

      var totals=Object.assign({},window.__vfTseFullDataV19.totals||{},uploadedTotals);

      Object.keys(totals).forEach(function(key){
        var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];
        if(!c)return;
        c.tseOfficialTotal=Number(totals[key]);
        c.category=replaceTotal(c.category,c.tseOfficialTotal);
        if(partyFix[key])c.party=partyFix[key];
      });

      // Mantém a porcentagem já exibida para prefeito, alterando apenas o total de votos.
      // O arquivo enviado não contém distribuição por colégio para prefeito, portanto
      // não inventamos nem rateamos votos locais nesta prévia.

      var select=document.getElementById('cand-select');
      if(!select)return setTimeout(apply,70);
      Array.from(select.options||[]).forEach(function(opt){
        var key=String(opt.value||'');
        if(!Object.prototype.hasOwnProperty.call(totals,key))return;
        var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];
        var text=replaceTotal(opt.textContent,totals[key]);
        if(c&&partyFix[key]){
          text=text.replace(/\((?:REP|PP)\)/i,'('+c.party+')');
        }
        opt.textContent=text;
      });

      var college=document.getElementById('vf-college-candidate-select');
      if(college){
        Array.from(college.options||[]).forEach(function(opt){
          var key=String(opt.value||'');
          if(Object.prototype.hasOwnProperty.call(totals,key))opt.textContent=replaceTotal(opt.textContent,totals[key]);
        });
      }

      window.__vfUploadedResultsPreview={source:'arquivo-enviado',totals:uploadedTotals,aggregateOnly:true};
      window.__vfTseFullDataV19UiReady=true;
    }catch(e){console.error('TSE v19 UI sync failed',e);setTimeout(apply,120);}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,120)},{once:true});else setTimeout(apply,120);
  setTimeout(apply,350);
})();
