(function(){
  'use strict';
  if(window.__vfPoliticianPhotosV27)return;window.__vfPoliticianPhotosV27=true;

  var photos={},loaded=false,loading=false;

  async function loadPhotos(){
    if(loaded||loading)return;loading=true;
    try{
      var r=await fetch(location.origin+'/assets/politicians/photos.json?v=27.6',{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      var data=await r.json();
      photos=data&&typeof data==='object'?data:{};
    }catch(e){
      console.warn('Local politician photos unavailable',e);
      photos={};
    }
    loaded=true;loading=false;
    window.__vfPoliticianPhotosV27Map=photos;
    apply();
  }

  function keySelected(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function clearAvatar(el){
    if(!el)return;
    el.classList.remove('vf-politician-photo-avatar');
    el.style.removeProperty('background-image');
  }
  function setAvatar(el,key){
    if(!el)return;
    var u=photos[String(key||'')];
    if(!u){clearAvatar(el);return;}
    el.classList.add('vf-politician-photo-avatar');
    el.style.backgroundImage='url("'+String(u).replace(/"/g,'%22')+'")';
  }
  function applySelected(){
    var key=keySelected();
    if(key==='ALL')return;
    setAvatar(document.querySelector('.vf-college-candidate-avatar'),key);
    setAvatar(document.querySelector('.vf24-candidate-avatar'),key);
  }
  function applyPicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(b){
      var key=String(b.dataset.value||'');
      if(key==='ALL')return;
      var u=photos[key],old=b.querySelector('.vf-politician-list-photo');
      if(!u){
        if(old)old.remove();
        b.classList.remove('vf-has-politician-photo');
        return;
      }
      if(!old){
        old=document.createElement('span');
        old.className='vf-politician-list-photo';
        old.setAttribute('aria-hidden','true');
        b.appendChild(old);
      }
      old.style.backgroundImage='url("'+String(u).replace(/"/g,'%22')+'")';
      b.classList.add('vf-has-politician-photo');
    });
  }
  function apply(){if(!loaded)return;applySelected();applyPicker();}

  var obs=new MutationObserver(function(){if(loaded)requestAnimationFrame(apply);});
  function start(){
    if(document.body)obs.observe(document.body,{childList:true,subtree:true});
    loadPhotos();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
