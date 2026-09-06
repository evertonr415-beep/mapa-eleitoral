(function(){
  'use strict';
  if(window.__vfBrandFlagV25)return;window.__vfBrandFlagV25=true;
  var SRC='/assets/bandeira_arapongas.png';

  function flag(el){
    if(!el)return;
    el.classList.add('vf-brand-flag-avatar');
    if(el.querySelector('img[data-vf-brand-flag="1"]'))return;
    el.innerHTML='';
    var img=document.createElement('img');img.src=SRC;img.alt='Bandeira de Arapongas';img.dataset.vfBrandFlag='1';img.decoding='async';el.appendChild(img);
  }
  function initials(name){var p=String(name||'').trim().split(/\s+/).filter(Boolean);return ((p[0]||'C')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}

  function applyCollege(){
    var el=document.querySelector('.vf-college-candidate-avatar');if(!el)return;
    var key='ALL';try{key=String(state&&state.selectedCandidate||'ALL');}catch(_){ }
    if(key==='ALL'){flag(el);return;}
    el.classList.remove('vf-brand-flag-avatar');
    if(el.querySelector('img[data-vf-brand-flag="1"]'))el.innerHTML='';
    try{var c=ELEICAO_2024_DATA&&ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];if(c)el.textContent=initials(c.name);}catch(_){ }
  }

  function applyDistrict(){
    var el=document.querySelector('.vf24-candidate-avatar');if(!el)return;
    var key='ALL';try{key=window.VFDistrictsV24&&typeof window.VFDistrictsV24.getSelected==='function'?String(window.VFDistrictsV24.getSelected()||'ALL'):'ALL';}catch(_){ }
    if(key==='ALL'){flag(el);return;}
    el.classList.remove('vf-brand-flag-avatar');
    if(el.querySelector('img[data-vf-brand-flag="1"]'))el.innerHTML='';
    try{var c=ELEICAO_2024_DATA&&ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];if(c)el.textContent=initials(c.name);}catch(_){ }
  }

  function apply(){applyCollege();applyDistrict();}

  var obs=new MutationObserver(function(){setTimeout(apply,0);});
  function install(){if(document.body)obs.observe(document.body,{childList:true,subtree:true});apply();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setInterval(apply,500);
})();
