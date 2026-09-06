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
    sheet.innerHTML='<div class="vf-mobile-candidate-head"><div><strong>Selecionar vereador</strong><span>Escolha um nome para aplicar o filtro</span></div><button type="button" class="vf-mobile-candidate-close" aria-label="Fechar">×</button></div><div class="vf-mobile-candidate-list" role="listbox"></div>';
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
    if(select.value!==value)select.value=value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function updateTriggers(){
    document.querySelectorAll('.vf-mobile-candidate-trigger').forEach(function(btn){
      var targetId=btn.dataset.targetSelect;
      var sel=document.getElementById(targetId);
      if(!sel)return;
      var opt=sel.options[sel.selectedIndex];
      var text=opt?textForOption(opt):'Selecionar vereador';
      var span=btn.querySelector('.vf-mobile-candidate-trigger-text');
      if(span)span.textContent=text;
      btn.setAttribute('aria-label','Vereador selecionado: '+text+'. Toque para alterar.');
    });
  }

  function rebuildList(targetSelect){
    if(!targetSelect||!list)return;
    list.innerHTML='';
    Array.from(targetSelect.options).forEach(function(opt){
      if(opt.disabled&&opt.value==='')return;
      var b=document.createElement('button');
      b.type='button';
      b.className='vf-mobile-candidate-option';
      b.setAttribute('role','option');
      b.setAttribute('aria-selected',String(opt.value===targetSelect.value));
      b.dataset.value=opt.value;
      var span=document.createElement('span');
      span.className='vf-mobile-candidate-option-text';
      span.textContent=textForOption(opt);
      b.appendChild(span);
      b.addEventListener('click',function(){
        var value=b.dataset.value;
        syncSourceRefs();
        var currentTarget=document.getElementById(sheet.dataset.targetSelect||'cand-select');
        if(currentTarget)dispatchSelect(currentTarget,value);
        if(sourceSelect&&sourceSelect!==currentTarget){sourceSelect.value=value;}
        if(collegeSelect&&collegeSelect!==currentTarget){collegeSelect.value=value;}
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
      if(sourceSelect&&collegeSelect){
        if(select===sourceSelect)collegeSelect.value=sourceSelect.value;
        else if(select===collegeSelect)sourceSelect.value=collegeSelect.value;
      }
      updateTriggers();
    });
  }

  function observeOptions(){
    if(!sourceSelect||sourceObserver)return;
    sourceObserver=new MutationObserver(function(){
      syncSourceRefs();
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
    installTrigger(sourceSelect);
    if(collegeSelect)installTrigger(collegeSelect);
    observeOptions();
    updateTriggers();
    setTimeout(function(){
      syncSourceRefs();
      if(collegeSelect)installTrigger(collegeSelect);
      updateTriggers();
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,350);},{once:true});else setTimeout(install,350);
  setTimeout(install,900);
  setTimeout(install,1700);
})();
