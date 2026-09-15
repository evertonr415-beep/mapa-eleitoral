(function(){
  'use strict';
  if(window.__vfTseFullDataV19Ui)return;window.__vfTseFullDataV19Ui=true;

  var partyFix={dep_fed_angelica:'PROS',dep_est_pacheco:'REPUBLICANOS'};
  var replacement={
    oldKey:'70000',
    key:'70123',
    name:'Arnaldo do Povo',
    fullName:'Arnaldo Aparecido Pereira',
    party:'AVANTE',
    partyNumber:'70',
    ballotNumber:'70123',
    municipality:'Arapongas - PR',
    total:451,
    category:'Suplente (451 votos)',
    type:'suplente',
    color:'#64748b',
    optionText:'Arnaldo do Povo (Avante) - 451 votos (Suplente)'
  };
  var arnaldoPhoto='/assets/politicians/70123.svg';

  var uploadedTotals={
    pref_cita:30557,
    pref_milani:27532,
    '20220':2135,
    '55155':1720,
    '11234':1576,
    '44044':1212,
    '70123':451,
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
    if(out===text)out=text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?=v\s*(?:em\s+Arapongas)?)/i,f);
    return out;
  }

  function migrateCandidateModel(){
    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA.candidates)return;
    delete ELEICAO_2024_DATA.candidates[replacement.oldKey];
    ELEICAO_2024_DATA.candidates[replacement.key]={
      name:replacement.name,
      fullName:replacement.fullName,
      party:replacement.party,
      partyNumber:replacement.partyNumber,
      ballotNumber:replacement.ballotNumber,
      municipality:replacement.municipality,
      category:replacement.category,
      type:replacement.type,
      color:replacement.color,
      tseOfficialTotal:replacement.total
    };
    var locais=Array.isArray(ELEICAO_2024_DATA.locais)?ELEICAO_2024_DATA.locais:[];
    locais.forEach(function(loc){
      if(loc&&loc.votes&&Object.prototype.hasOwnProperty.call(loc.votes,replacement.oldKey))delete loc.votes[replacement.oldKey];
    });
    try{if(typeof state!=='undefined'&&state&&String(state.selectedCandidate||'')===replacement.oldKey)state.selectedCandidate='ALL';}catch(_){}
  }

  function migrateFullData(){
    var data=window.__vfTseFullDataV19;
    if(!data)return;
    if(data.totals){
      delete data.totals[replacement.oldKey];
      data.totals[replacement.key]=replacement.total;
    }
    if(data.votes&&Object.prototype.hasOwnProperty.call(data.votes,replacement.oldKey))delete data.votes[replacement.oldKey];
  }

  function migrateSelect(id){
    var select=document.getElementById(id);
    if(!select)return null;
    var oldOpt=Array.from(select.options||[]).find(function(o){return String(o.value||'')===replacement.oldKey;});
    var newOpt=Array.from(select.options||[]).find(function(o){return String(o.value||'')===replacement.key;});
    if(oldOpt&&newOpt&&oldOpt!==newOpt){oldOpt.remove();oldOpt=null;}
    if(oldOpt){oldOpt.value=replacement.key;oldOpt.textContent=replacement.optionText;newOpt=oldOpt;}
    if(newOpt)newOpt.textContent=replacement.optionText;
    return select;
  }

  function migrateRenderedPicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value="'+replacement.oldKey+'"]').forEach(function(btn){
      btn.dataset.value=replacement.key;
      var textEl=btn.querySelector('.vf-mobile-candidate-option-text');if(textEl)textEl.textContent=replacement.optionText;
      var meta=btn.querySelector('.vf-mobile-candidate-option-meta');if(meta)meta.textContent='451 votos oficiais';
      var status=btn.querySelector('.vf-mobile-candidate-status');if(status)status.textContent='Total';
    });
    document.querySelectorAll('.vf-mobile-candidate-option[data-value="'+replacement.key+'"]').forEach(function(btn){
      var textEl=btn.querySelector('.vf-mobile-candidate-option-text');if(textEl)textEl.textContent=replacement.optionText;
      var meta=btn.querySelector('.vf-mobile-candidate-option-meta');
      if(meta&&(/1\.210|João|Joao/i.test(meta.textContent)||!meta.textContent.trim()))meta.textContent='451 votos oficiais';
    });
  }

  function totals(){
    var base=(window.__vfTseFullDataV19&&window.__vfTseFullDataV19.totals)||{};
    var out=Object.assign({},base,uploadedTotals);
    delete out[replacement.oldKey];
    out[replacement.key]=replacement.total;
    return out;
  }

  function syncModel(all){
    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA.candidates)return;
    Object.keys(all).forEach(function(key){
      var c=ELEICAO_2024_DATA.candidates[key];if(!c)return;
      c.tseOfficialTotal=Number(all[key]);
      c.category=replaceTotal(c.category,c.tseOfficialTotal);
      if(partyFix[key])c.party=partyFix[key];
    });
  }

  function syncSelect(id,all){
    var select=migrateSelect(id);if(!select)return null;
    Array.from(select.options||[]).forEach(function(opt){
      var key=String(opt.value||'');if(!Object.prototype.hasOwnProperty.call(all,key))return;
      var c=(typeof ELEICAO_2024_DATA!=='undefined'&&ELEICAO_2024_DATA.candidates)?ELEICAO_2024_DATA.candidates[key]:null;
      var next=key===replacement.key?replacement.optionText:replaceTotal(opt.textContent,all[key]);
      if(c&&partyFix[key])next=next.replace(/\((?:REP|PP)\)/i,'('+c.party+')');
      if(opt.textContent!==next)opt.textContent=next;
    });
    return select;
  }

  function syncVisiblePicker(all,source){
    if(!source)return;
    migrateRenderedPicker();
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(btn){
      var key=String(btn.getAttribute('data-value')||'');if(!Object.prototype.hasOwnProperty.call(all,key))return;
      var src=Array.from(source.options||[]).find(function(o){return String(o.value||'')===key;});
      var textEl=btn.querySelector('.vf-mobile-candidate-option-text');
      if(src&&textEl&&textEl.textContent!==src.textContent)textEl.textContent=src.textContent;
    });
    var selected=source.options&&source.selectedIndex>=0?source.options[source.selectedIndex]:null;
    document.querySelectorAll('.vf-mobile-candidate-trigger-text').forEach(function(trigger){
      if(selected&&trigger.textContent!==selected.textContent)trigger.textContent=selected.textContent;
    });
  }

  function ensurePhotoStyle(){
    var id='vf-arnaldo-photo-override';
    if(document.getElementById(id))return;
    var s=document.createElement('style');s.id=id;
    s.textContent=
      '.vf-mobile-candidate-option[data-value="70000"] .vf-photo-v277-list,'+
      '.vf-mobile-candidate-option[data-value="70123"] .vf-photo-v277-list{background-image:url("'+arnaldoPhoto+'")!important;background-size:cover!important;background-position:center!important}'+
      '.vf-photo-v277:has(img[data-vf-key="70000"]),.vf-photo-v277:has(img[data-vf-key="70123"]){background-image:url("'+arnaldoPhoto+'")!important;background-size:cover!important;background-position:center!important}'+
      '.vf-photo-v277 img[data-vf-key="70000"],.vf-photo-v277 img[data-vf-key="70123"]{opacity:0!important}';
    document.head.appendChild(s);
  }

  function paintArnaldoPhoto(){
    ensurePhotoStyle();
    document.querySelectorAll('.vf-mobile-candidate-option[data-value="70000"],.vf-mobile-candidate-option[data-value="70123"]').forEach(function(row){
      row.dataset.value=replacement.key;
      var bg=row.querySelector('.vf-photo-v277-list');
      if(bg)bg.style.setProperty('background-image','url("'+arnaldoPhoto+'")','important');
      var img=row.querySelector('img');
      if(img){
        img.style.setProperty('opacity','0','important');
        var p=img.parentElement;
        if(p){
          p.style.setProperty('background-image','url("'+arnaldoPhoto+'")','important');
          p.style.setProperty('background-size','cover','important');
          p.style.setProperty('background-position','center','important');
        }
      }
    });
    document.querySelectorAll('img[data-vf-key="70000"],img[data-vf-key="70123"]').forEach(function(img){
      img.style.setProperty('opacity','0','important');
      var p=img.parentElement;
      if(p){
        p.style.setProperty('background-image','url("'+arnaldoPhoto+'")','important');
        p.style.setProperty('background-size','cover','important');
        p.style.setProperty('background-position','center','important');
      }
    });
  }

  function replaceJoaoVisible(){
    var root=document.body||document.documentElement;
    if(!root)return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    var nodes=[];
    while(walker.nextNode()){
      var v=walker.currentNode.nodeValue||'';
      if(/João Graça|Joao Graça|1\.210 votos/i.test(v))nodes.push(walker.currentNode);
    }
    nodes.forEach(function(n){
      var t=String(n.nodeValue||'');
      t=t.replace(/João Graça|Joao Graça/g,replacement.name);
      t=t.replace(/1\.210 votos oficiais/g,'451 votos oficiais');
      t=t.replace(/1\.210 votos/g,'451 votos');
      t=t.replace(/\(Eleito\)/g,'(Suplente)');
      n.nodeValue=t;
    });
    document.querySelectorAll('.vf-mobile-candidate-option').forEach(function(row){
      if(/Arnaldo do Povo|João Graça|Joao Graça/.test(row.textContent||'')){
        row.dataset.value=replacement.key;
        var textEl=row.querySelector('.vf-mobile-candidate-option-text');if(textEl)textEl.textContent=replacement.optionText;
        var meta=row.querySelector('.vf-mobile-candidate-option-meta');if(meta)meta.textContent='451 votos oficiais';
      }
    });
  }

  function sync(){
    try{
      if(!window.__vfTseFullDataV19Ready||!window.__vfTseFullDataV19||typeof ELEICAO_2024_DATA==='undefined')return;
      migrateFullData();
      migrateCandidateModel();
      var all=totals();
      syncModel(all);
      var source=syncSelect('cand-select',all);
      syncSelect('vf-college-candidate-select',all);
      syncVisiblePicker(all,source);
      replaceJoaoVisible();
      paintArnaldoPhoto();
      window.__vfUploadedResultsPreview={source:'arquivo-enviado',totals:uploadedTotals,aggregateOnly:true};
      window.__vfCandidateReplacement={from:replacement.oldKey,to:replacement.key,name:replacement.name,total:replacement.total,status:'suplente'};
      window.__vfTseFullDataV19UiReady=true;
    }catch(e){console.error('TSE v19 UI sync failed',e);}
  }

  function start(){
    sync();
    setTimeout(sync,120);
    setTimeout(sync,350);
    setTimeout(sync,900);
    setInterval(sync,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
