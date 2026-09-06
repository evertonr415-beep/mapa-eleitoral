(function(){
  'use strict';
  if(window.__vfMobileCandidatePickerV18)return;window.__vfMobileCandidatePickerV18=true;

  var sourceSelect=null;
  var collegeSelect=null;
  var sheet=null;
  var list=null;
  var backdrop=null;
  var sourceObserver=null;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function textForOption(opt){return String(opt&&opt.textContent||'').replace(/\s+/g,' ').trim();}

  function hasMapBreakdown(value){
    if(value==='ALL')return true;
    try{
      if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA)return false;
      if(!ELEICAO_2024_DATA.candidates||!ELEICAO_2024_DATA.candidates[value])return false;
      var locais=Array.isArray(ELEICAO_2024_DATA.locais)?ELEICAO_2024_DATA.locais:[];
      return locais.some(function(loc){
        return !!(loc&&loc.votes&&Object.prototype.hasOwnProperty.call(loc.votes,value));
      });
    }catch(_){return false;}
  }

  function isPlatformOnlyOption(opt){
    var parent=opt&&opt.parentElement;
    if(!parent||String(parent.tagName).toLowerCase()!=='optgroup')return false;
    return /cadastrados\s+na\s+plataforma/i.test(String(parent.label||''));
  }

  function isValidMapOption(opt){
    if(!opt)return false;
    if(opt.disabled&&opt.value==='')return false;
    if(isPlatformOnlyOption(opt))return false;
    return hasMapBreakdown(String(opt.value));
  }

  function canonicalOption(value){
    if(!sourceSelect)return null;
    var found=null;
    Array.from(sourceSelect.options||[]).some(function(opt){
      if(String(opt.value)===String(value)&&isValidMapOption(opt)){found=opt;return true;}
      return false;
    });
    return found;
  }

  function sanitizeValue(value){
    value=String(value==null?'ALL':value);
    if(value==='ALL')return 'ALL';
    return canonicalOption(value)?value:'ALL';
  }

  function ensureShell(){
    if(sheet)return;
    backdrop=document.createElement('button');
    backdrop.type='button';
    backdrop.className='vf-mobile-candidate-backdrop';
    backdrop.setAttribute('aria-label','Fechar lista de vereadores');

    sheet=document.createElement('section');
    sheet.className='vf-mobile-candidate-sheet';
    sheet.setAttribute('role','dialog');
    sheet.setAttribute('aria-modal','true');
    sheet.setAttribute('aria-label','Selecionar vereador ou candidato');
    sheet.innerHTML='<div class="vf-mobile-candidate-head"><div><strong>Selecionar vereador</strong><span>Apenas nomes com votos detalhados por colégio</span></div><button type="button" class="vf-mobile-candidate-close" aria-label="Fechar">×</button></div><div class="vf-mobile-candidate-list" role="listbox"></div>';
    list=sheet.querySelector('.vf-mobile-candidate-list');
    document.body.append(backdrop,sheet);

    backdrop.addEventListener('click',closePicker);
    sheet.querySelector('.vf-mobile-candidate-close').addEventListener('click',closePicker);
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closePicker();});
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
  }

  function updateTriggers(){
    document.querySelectorAll('.vf-mobile-candidate-trigger').forEach(function(btn){
      var targetId=btn.dataset.targetSelect;
      var sel=document.getElementById(targetId);
      if(!sel)return;
      var safe=sanitizeValue(sel.value);
      if(sel.value!==safe)sel.value=safe;
      var opt=canonicalOption(safe)||(sel.options&&sel.options[sel.selectedIndex]);
      var text=opt?textForOption(opt):'Visão Geral dos 29 Colégios';
      var span=btn.querySelector('.vf-mobile-candidate-trigger-text');
      if(span)span.textContent=text;
      btn.setAttribute('aria-label','Vereador selecionado: '+text+'. Toque para alterar.');
    });
  }

  function rebuildList(targetSelect){
    if(!targetSelect||!list)return;
    list.innerHTML='';
    var selectedValue=sanitizeValue(targetSelect.value);
    var seen={};
    var options=sourceSelect?Array.from(sourceSelect.options||[]):Array.from(targetSelect.options||[]);

    options.forEach(function(opt){
      var value=String(opt.value);
      if(seen[value]||!isValidMapOption(opt))return;
      seen[value]=true;

      var b=document.createElement('button');
      b.type='button';
      b.className='vf-mobile-candidate-option';
      b.setAttribute('role','option');
      b.setAttribute('aria-selected',String(value===selectedValue));
      b.dataset.value=value;

      var span=document.createElement('span');
      span.className='vf-mobile-candidate-option-text';
      span.textContent=textForOption(opt);
      b.appendChild(span);

      b.addEventListener('click',function(){
        var safe=sanitizeValue(b.dataset.value);
        syncSourceRefs();
        var currentTarget=document.getElementById(sheet.dataset.targetSelect||'cand-select');
        if(currentTarget)dispatchSelect(currentTarget,safe);
        if(sourceSelect&&sourceSelect!==currentTarget)sourceSelect.value=safe;
        if(collegeSelect&&collegeSelect!==currentTarget)collegeSelect.value=safe;
        updateTriggers();
        closePicker();
      });
      list.appendChild(b);
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
  function closePicker(){document.body.classList.remove('vf-mobile-candidate-open');}

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
    });
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
    if(!syncSourceRefs()){setTimeout(install,100);return;}
    ensureShell();
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
