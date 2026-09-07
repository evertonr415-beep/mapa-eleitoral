(function(){
  'use strict';
  if(window.__vfPoliticianPhotosV277)return;window.__vfPoliticianPhotosV277=true;

  var photos={},ready=false,lastMain='',lastDistrict='';

  function getMainKey(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function getDistrictKey(){try{return window.VFDistrictsV24&&typeof window.VFDistrictsV24.getSelected==='function'?String(window.VFDistrictsV24.getSelected()||'ALL'):'ALL';}catch(_){return 'ALL';}}
  function urlFor(key){return photos[String(key||'')]||'';}

  function clearAvatar(el){
    if(!el)return;
    el.classList.remove('vf-photo-v277');
    el.style.removeProperty('background-image');
  }

  function paintAvatar(el,key){
    if(!el)return;
    if(!key||key==='ALL'){clearAvatar(el);return;}
    var url=urlFor(key);
    if(!url){clearAvatar(el);return;}
    el.classList.add('vf-photo-v277');
    el.style.backgroundImage='url("'+String(url).replace(/"/g,'%22')+'")';
  }

  function syncMain(){
    var key=getMainKey();
    var el=document.querySelector('.vf-college-candidate-avatar');
    if(key!==lastMain||el){paintAvatar(el,key);lastMain=key;}
  }

  function syncDistrict(){
    var key=getDistrictKey();
    var el=document.querySelector('.vf24-candidate-avatar');
    if(key!==lastDistrict||el){paintAvatar(el,key);lastDistrict=key;}
  }

  function decoratePicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(btn){
      var key=String(btn.dataset.value||'');
      var url=urlFor(key);
      var old=btn.querySelector('.vf-photo-v277-list');
      if(!url||key==='ALL'){
        if(old)old.remove();
        btn.classList.remove('vf-photo-v277-option');
        return;
      }
      if(!old){old=document.createElement('span');old.className='vf-photo-v277-list';old.setAttribute('aria-hidden','true');btn.appendChild(old);}
      old.style.backgroundImage='url("'+String(url).replace(/"/g,'%22')+'")';
      btn.classList.add('vf-photo-v277-option');
    });
  }

  function sync(){if(!ready)return;syncMain();syncDistrict();decoratePicker();}

  async function load(){
    try{
      var r=await fetch(location.origin+'/assets/politicians/photos.json?v=27.7',{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      var data=await r.json();
      photos=data&&typeof data==='object'?data:{};
      ready=true;
      window.__vfPoliticianPhotosV277Map=photos;
      sync();
    }catch(e){console.warn('Politician photos v27.7 unavailable',e);}
  }

  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('.vf-mobile-candidate-trigger,.vf-mobile-candidate-option,.vf24-candidate-trigger,.vf24-option'):null;
    if(t)setTimeout(sync,0);
  },true);
  document.addEventListener('change',function(ev){
    var id=ev.target&&ev.target.id||'';
    if(id==='cand-select'||id==='vf-college-candidate-select')setTimeout(sync,0);
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
  setInterval(sync,500);
})();
