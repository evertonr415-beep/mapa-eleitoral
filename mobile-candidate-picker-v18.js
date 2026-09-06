(function(){
  'use strict';
  if(window.__vfMobileCandidatePickerV18)return;window.__vfMobileCandidatePickerV18=true;

  var sourceSelect=null;
  var collegeSelect=null;
  var sheet=null;
  var list=null;
  var backdrop=null;
  var sourceObserver=null;
  var notice=null;
  var partialBanner=null;
  var renderGuardInstalled=false;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function textForOption(opt){return String(opt&&opt.textContent||'').replace(/\s+/g,' ').trim();}

  function totalColleges(){
    try{return Array.isArray(ELEICAO_2024_DATA.locais)?ELEICAO_2024_DATA.locais.length:0;}catch(_){return 0;}
  }

  function candidateInfo(value){
    try{return ELEICAO_2024_DATA&&ELEICAO_2024_DATA.candidates?ELEICAO_2024_DATA.candidates[String(value)]||null:null;}catch(_){return null;}
  }

  function isPlatformOnlyOption(opt){
    var parent=opt&&opt.parentElement;
    if(!parent||String(parent.tagName).toLowerCase()!=='optgroup')return false;
    return /cadastrados\s+na\s+plataforma/i.test(String(parent.label||''));
  }

  function isElectionOption(opt){
    if(!opt)return false;
    if(opt.disabled&&opt.value==='')return false;
    if(isPlatformOnlyOption(opt))return false;
    if(String(opt.value)==='ALL')return true;
    return !!candidateInfo(String(opt.value));
  }

  function coverageFor(value){
    value=String(value);
    var total=totalColleges();
    if(value==='ALL')return {count:total,total:total,mode:'complete',sum:0};
    try{
      var locais=Array.isArray(ELEICAO_2024_DATA.locais)?ELEICAO_2024_DATA.locais:[];
      var count=0,sum=0;
      locais.forEach(function(loc){
        if(loc&&loc.votes&&Object.prototype.hasOwnProperty.call(loc.votes,value)){
          count++;
          sum+=Number(loc.votes[value])||0;
        }
      });
      return {count:count,total:locais.length,mode:count===locais.length&&locais.length?'complete':count>0?'partial':'total',sum:sum};
    }catch(_){return {count:0,total:total,mode:'total',sum:0};}
  }

  function optionForValue(value){
    if(!sourceSelect)return null;
    value=String(value);
    var found=null;
    Array.from(sourceSelect.options||[]).some(function(opt){
      if(String(opt.value)===value&&isElectionOption(opt)){found=opt;return true;}
      return false;
    });
    return found;
  }

  function selectableOption(value){
    var opt=optionForValue(value);
    if(!opt)return null;
    var mode=coverageFor(value).mode;
    return mode==='complete'||mode==='partial'?opt:null;
  }

  function sanitizeValue(value){
    value=String(value==null?'ALL':value);
    if(value==='ALL')return 'ALL';
    return selectableOption(value)?value:'ALL';
  }

  function officialTotal(value,opt){
    if(String(value)==='ALL')return '';
    var info=candidateInfo(value);
    var hay=[info&&info.category||'',opt&&textForOption(opt)||''].join(' ');
    var m=hay.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:votos?|v\b)/i);
    return m?m[1]:'';
  }

  function officialTotalLabel(value,opt){
    var total=officialTotal(value,opt);
    return total?total+' votos oficiais':'';
  }

  function ensureShell(){
    if(sheet)return;
    backdrop=document.createElement('button');
    backdrop.type='button';
    backdrop.className='vf-mobile-candidate-backdrop';
    backdrop.setAttribute('aria-label','Fechar lista de candidatos');

    sheet=document.createElement('section');
    sheet.className='vf-mobile-candidate-sheet';
    sheet.setAttribute('role','dialog');
    sheet.setAttribute('aria-modal','true');
    sheet.setAttribute('aria-label','Selecionar candidato');
    sheet.innerHTML='<div class="vf-mobile-candidate-head"><div><strong>Selecionar candidato</strong><span>Todos os nomes da base eleitoral</span></div><button type="button" class="vf-mobile-candidate-close" aria-label="Fechar">×</button></div><div class="vf-mobile-candidate-legend"><span><i class="ok"></i>29/29: mapa completo</span><span><i class="warn"></i>Parcial: mapa disponível</span><span><i class="info"></i>Só total</span></div><div class="vf-mobile-candidate-data-note" hidden></div><div class="vf-mobile-candidate-list" role="listbox"></div>';
    list=sheet.querySelector('.vf-mobile-candidate-list');
    notice=sheet.querySelector('.vf-mobile-candidate-data-note');
    document.body.append(backdrop,sheet);

    backdrop.addEventListener('click',closePicker);
    sheet.querySelector('.vf-mobile-candidate-close').addEventListener('click',closePicker);
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closePicker();});
  }

  function ensurePartialBanner(){
    if(partialBanner&&partialBanner.isConnected)return partialBanner;
    var mapView=document.getElementById('view-map-container');
    if(!mapView)return null;
    partialBanner=document.createElement('div');
    partialBanner.className='vf-partial-map-banner';
    partialBanner.hidden=true;
    mapView.appendChild(partialBanner);
    return partialBanner;
  }

  function hidePartialBanner(){
    var b=ensurePartialBanner();
    if(b)b.hidden=true;
    document.body.classList.remove('vf-partial-map-active');
  }

  function showPartialBanner(value){
    var info=coverageFor(value);
    if(info.mode!=='partial'){hidePartialBanner();return;}
    var opt=optionForValue(value);
    var total=officialTotalLabel(value,opt)||'Total oficial cadastrado';
    var b=ensurePartialBanner();
    if(!b)return;
    var cand=candidateInfo(value);
    var name=cand&&cand.name?cand.name:textForOption(opt);
    b.innerHTML='<div class="vf-partial-map-title"><span>Mapa parcial</span><strong>'+escapeHtml(name)+'</strong></div><div class="vf-partial-map-stats"><span><b>'+escapeHtml(total)+'</b><small>Total oficial</small></span><span><b>'+info.count+' de '+info.total+'</b><small>Colégios com detalhe</small></span><span><b>'+formatNumber(info.sum)+' votos</b><small>Soma exibida no mapa</small></span></div><div class="vf-partial-map-warning">Somente os colégios com dados disponíveis aparecem abaixo. A soma do mapa é parcial e não substitui o total oficial.</div>';
    b.hidden=false;
    document.body.classList.add('vf-partial-map-active');
  }

  function formatNumber(n){
    try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}
  }

  function syncSourceRefs(){
    sourceSelect=document.getElementById('cand-select');
    collegeSelect=document.getElementById('vf-college-candidate-select');
    return !!sourceSelect;
  }

  function dispatchSelect(select,value){
    if(!select)return;
    value=sanitizeValue(value);
    if(select.value!==value)select.value=value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function normalizeCurrentSelection(){
    if(!sourceSelect)return;
    var safe=sanitizeValue(sourceSelect.value);
    if(sourceSelect.value!==safe){
      sourceSelect.value=safe;
      sourceSelect.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(collegeSelect&&collegeSelect.value!==safe)collegeSelect.value=safe;
    if(coverageFor(safe).mode==='partial')showPartialBanner(safe);else hidePartialBanner();
  }

  function updateTriggers(){
    document.querySelectorAll('.vf-mobile-candidate-trigger').forEach(function(btn){
      var targetId=btn.dataset.targetSelect;
      var sel=document.getElementById(targetId);
      if(!sel)return;
      var safe=sanitizeValue(sel.value);
      if(sel.value!==safe)sel.value=safe;
      var opt=optionForValue(safe)||(sel.options&&sel.options[sel.selectedIndex]);
      var text=opt?textForOption(opt):'Visão Geral dos 29 Colégios';
      var span=btn.querySelector('.vf-mobile-candidate-trigger-text');
      if(span)span.textContent=text;
      btn.setAttribute('aria-label','Candidato selecionado: '+text+'. Toque para alterar.');
    });
  }

  function clearNotice(){
    if(!notice)return;
    notice.hidden=true;
    notice.className='vf-mobile-candidate-data-note';
    notice.innerHTML='';
  }

  function showDataNotice(opt,info){
    if(!notice)return;
    var text=textForOption(opt);
    var total=officialTotalLabel(opt.value,opt);
    notice.hidden=false;
    notice.className='vf-mobile-candidate-data-note is-total';
    notice.innerHTML='<strong>'+escapeHtml(text)+'</strong><span>'+(total?'<b>'+escapeHtml(total)+'.</b> ':'')+'Esta base não possui distribuição por colégio para este nome. O total continua disponível para consulta, mas o sistema não cria um mapa com zeros artificiais.</span>';
    try{notice.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(_){ }
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]||ch;});
  }

  function makeGroup(label){
    var h=document.createElement('div');
    h.className='vf-mobile-candidate-group';
    h.textContent=String(label||'Candidatos').replace(/^\s+/,'').trim();
    list.appendChild(h);
  }

  function addOptionButton(opt,selectedValue){
    if(!isElectionOption(opt))return false;
    var value=String(opt.value);
    var info=coverageFor(value);
    var b=document.createElement('button');
    b.type='button';
    b.className='vf-mobile-candidate-option vf-data-'+info.mode;
    b.setAttribute('role','option');
    b.setAttribute('aria-selected',String(value===selectedValue&&(info.mode==='complete'||info.mode==='partial')));
    b.dataset.value=value;
    b.dataset.mode=info.mode;

    var main=document.createElement('span');
    main.className='vf-mobile-candidate-option-main';
    var text=document.createElement('span');
    text.className='vf-mobile-candidate-option-text';
    text.textContent=textForOption(opt);
    var meta=document.createElement('span');
    meta.className='vf-mobile-candidate-option-meta';
    var totalLabel=officialTotalLabel(value,opt);
    if(value==='ALL')meta.textContent='Visão geral';
    else if(info.mode==='complete')meta.textContent=(totalLabel?totalLabel+' • ':'')+info.total+'/'+info.total+' colégios';
    else if(info.mode==='partial')meta.textContent=(totalLabel?totalLabel+' • ':'')+info.count+'/'+info.total+' colégios detalhados';
    else meta.textContent=(totalLabel?totalLabel+' • ':'')+'sem detalhamento por colégio';
    main.append(text,meta);

    var badge=document.createElement('span');
    badge.className='vf-mobile-candidate-status';
    badge.textContent=value==='ALL'||info.mode==='complete'?'Mapa':info.mode==='partial'?'Parcial':'Total';
    b.append(main,badge);

    b.addEventListener('click',function(){
      clearNotice();
      if(info.mode==='total'){
        showDataNotice(opt,info);
        return;
      }
      syncSourceRefs();
      var currentTarget=document.getElementById(sheet.dataset.targetSelect||'cand-select');
      if(currentTarget)dispatchSelect(currentTarget,value);
      if(sourceSelect&&sourceSelect!==currentTarget)sourceSelect.value=value;
      if(collegeSelect&&collegeSelect!==currentTarget)collegeSelect.value=value;
      updateTriggers();
      if(info.mode==='partial')showPartialBanner(value);else hidePartialBanner();
      closePicker();
    });
    list.appendChild(b);
    return true;
  }

  function rebuildList(targetSelect){
    if(!targetSelect||!list||!sourceSelect)return;
    list.innerHTML='';
    clearNotice();
    var selectedValue=sanitizeValue(targetSelect.value);
    var seen={};

    Array.from(sourceSelect.children||[]).forEach(function(node){
      var tag=String(node.tagName||'').toLowerCase();
      if(tag==='option'){
        if(seen[node.value])return;
        if(addOptionButton(node,selectedValue))seen[node.value]=true;
        return;
      }
      if(tag!=='optgroup')return;
      if(/cadastrados\s+na\s+plataforma/i.test(String(node.label||'')))return;
      var valid=Array.from(node.children||[]).filter(function(opt){return !seen[opt.value]&&isElectionOption(opt);});
      if(!valid.length)return;
      makeGroup(node.label);
      valid.forEach(function(opt){if(addOptionButton(opt,selectedValue))seen[opt.value]=true;});
    });

    var selected=list.querySelector('[aria-selected="true"]');
    if(selected)setTimeout(function(){try{selected.scrollIntoView({block:'center'});}catch(_){ }},40);
  }

  function openPicker(targetId){
    if(!isMobile())return;
    ensureShell();
    syncSourceRefs();
    normalizeCurrentSelection();
    var target=document.getElementById(targetId);
    if(!target)return;
    sheet.dataset.targetSelect=targetId;
    rebuildList(target);
    document.body.classList.add('vf-mobile-candidate-open');
  }
  function closePicker(){document.body.classList.remove('vf-mobile-candidate-open');clearNotice();}

  function installTrigger(select){
    if(!select||select.dataset.vfPickerV18==='1')return;
    select.dataset.vfPickerV18='1';
    select.classList.add('vf-native-candidate-hidden');

    var btn=document.createElement('button');
    btn.type='button';
    btn.className='vf-mobile-candidate-trigger';
    btn.dataset.targetSelect=select.id;
    btn.innerHTML='<span class="vf-mobile-candidate-trigger-text"></span>';
    select.insertAdjacentElement('afterend',btn);
    btn.addEventListener('click',function(){openPicker(select.id);});
    select.addEventListener('change',function(){
      syncSourceRefs();
      var safe=sanitizeValue(select.value);
      if(select.value!==safe)select.value=safe;
      if(sourceSelect&&collegeSelect){
        if(select===sourceSelect)collegeSelect.value=safe;
        else if(select===collegeSelect)sourceSelect.value=safe;
      }
      updateTriggers();
      if(coverageFor(safe).mode==='partial')showPartialBanner(safe);else hidePartialBanner();
    });
  }

  function withPartialLocales(original,ctx,args){
    var value='ALL';
    try{value=String(state&&state.selectedCandidate||'ALL');}catch(_){value='ALL';}
    var info=coverageFor(value);
    if(info.mode!=='partial')return original.apply(ctx,args);
    var full;
    try{
      full=ELEICAO_2024_DATA.locais;
      ELEICAO_2024_DATA.locais=full.filter(function(loc){return !!(loc&&loc.votes&&Object.prototype.hasOwnProperty.call(loc.votes,value));});
      return original.apply(ctx,args);
    }finally{
      if(full)ELEICAO_2024_DATA.locais=full;
    }
  }

  function installPartialRenderGuard(){
    if(renderGuardInstalled)return;
    if(typeof window.renderMapColegios!=='function'){setTimeout(installPartialRenderGuard,120);return;}
    renderGuardInstalled=true;
    var originalMap=window.renderMapColegios;
    window.renderMapColegios=function(){return withPartialLocales(originalMap,this,arguments);};
    if(typeof window.renderTableColegios==='function'){
      var originalTable=window.renderTableColegios;
      window.renderTableColegios=function(){return withPartialLocales(originalTable,this,arguments);};
    }
  }

  function observeOptions(){
    if(!sourceSelect||sourceObserver)return;
    sourceObserver=new MutationObserver(function(){
      syncSourceRefs();
      normalizeCurrentSelection();
      updateTriggers();
      if(document.body.classList.contains('vf-mobile-candidate-open')){
        var target=document.getElementById(sheet&&sheet.dataset.targetSelect||'cand-select');
        rebuildList(target||sourceSelect);
      }
    });
    sourceObserver.observe(sourceSelect,{childList:true,subtree:true});
  }

  function install(){
    if(!isMobile())return;
    installPartialRenderGuard();
    if(!syncSourceRefs()){setTimeout(install,100);return;}
    ensureShell();
    ensurePartialBanner();
    normalizeCurrentSelection();
    installTrigger(sourceSelect);
    if(collegeSelect)installTrigger(collegeSelect);
    observeOptions();
    updateTriggers();
    setTimeout(function(){
      syncSourceRefs();
      normalizeCurrentSelection();
      if(collegeSelect)installTrigger(collegeSelect);
      updateTriggers();
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,350);},{once:true});else setTimeout(install,350);
  setTimeout(install,900);
  setTimeout(install,1700);
})();
