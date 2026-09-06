(function(){
  'use strict';
  if(window.__vfTseFullDataV19Ui)return;window.__vfTseFullDataV19Ui=true;

  var partyFix={dep_fed_angelica:'PROS',dep_est_pacheco:'REPUBLICANOS'};
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
      var totals=window.__vfTseFullDataV19.totals||{};
      Object.keys(totals).forEach(function(key){
        var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];
        if(!c)return;
        c.tseOfficialTotal=Number(totals[key]);
        c.category=replaceTotal(c.category,c.tseOfficialTotal);
        if(partyFix[key])c.party=partyFix[key];
      });
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
      window.__vfTseFullDataV19UiReady=true;
    }catch(e){console.error('TSE v19 UI sync failed',e);setTimeout(apply,120);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,120)},{once:true});else setTimeout(apply,120);
  setTimeout(apply,350);
})();
