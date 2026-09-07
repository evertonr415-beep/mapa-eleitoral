(function(){
  'use strict';
  if(window.__vfPoliticianPhotosV277)return;window.__vfPoliticianPhotosV277=true;

  var ASSET_COMMIT='5d8311088d437b110490562a78a40e8f8e704005';
  var CDN='https://cdn.jsdelivr.net/gh/evertonr415-beep/mapa-eleitoral@'+ASSET_COMMIT;
  var RAW='https://raw.githubusercontent.com/evertonr415-beep/mapa-eleitoral/'+ASSET_COMMIT;
  var paths={
    '10123':'/assets/politicians/10123.webp',
    '11234':'/assets/politicians/11234.jpg',
    '11444':'/assets/politicians/11444.jpg',
    '11500':'/assets/politicians/11500.jpg',
    '11555':'/assets/politicians/11555.jpg',
    '12500':'/assets/politicians/12500.jpg',
    '13100':'/assets/politicians/13100.jpg',
    '20120':'/assets/politicians/20120.jpg',
    '20220':'/assets/politicians/20220.jpg',
    '22123':'/assets/politicians/22123.webp',
    '22622':'/assets/politicians/22622.webp',
    '22777':'/assets/politicians/22777.jpg',
    '40133':'/assets/politicians/40133.jpg',
    '44044':'/assets/politicians/44044.jpg',
    '44190':'/assets/politicians/44190.jpg',
    '44567':'/assets/politicians/44567.jpg',
    '55120':'/assets/politicians/55120.jpg',
    '55147':'/assets/politicians/55147.jpg',
    '55155':'/assets/politicians/55155.jpg',
    '55456':'/assets/politicians/55456.webp',
    '55555':'/assets/politicians/55555.jpg',
    '70000':'/assets/politicians/70000.webp',
    'dep_est_arilson':'/assets/politicians/dep_est_arilson.jpg',
    'dep_est_bazana':'/assets/politicians/dep_est_bazana.jpg',
    'dep_est_cobra':'/assets/politicians/dep_est_cobra.jpg',
    'dep_est_curi':'/assets/politicians/dep_est_curi.jpg',
    'dep_est_jacovos':'/assets/politicians/dep_est_jacovos.jpg',
    'dep_est_pacheco':'/assets/politicians/dep_est_pacheco.jpg',
    'dep_est_tercilio':'/assets/politicians/dep_est_tercilio.jpg',
    'dep_est_tiago':'/assets/politicians/dep_est_tiago.jpg',
    'dep_fed_aliel':'/assets/politicians/dep_fed_aliel.jpg',
    'dep_fed_angelica':'/assets/politicians/dep_fed_angelica.webp',
    'dep_fed_beto':'/assets/politicians/dep_fed_beto.jpg',
    'dep_fed_deltan':'/assets/politicians/dep_fed_deltan.jpg',
    'dep_fed_fahur':'/assets/politicians/dep_fed_fahur.jpg',
    'dep_fed_filipe':'/assets/politicians/dep_fed_filipe.jpg',
    'dep_fed_francischini':'/assets/politicians/dep_fed_francischini.jpg',
    'dep_fed_luisa':'/assets/politicians/dep_fed_luisa.jpg',
    'dep_fed_lupion':'/assets/politicians/dep_fed_lupion.jpg',
    'dep_fed_sperafico':'/assets/politicians/dep_fed_sperafico.jpg',
    'dep_fed_zeca':'/assets/politicians/dep_fed_zeca.jpg',
    'pref_cita':'/assets/politicians/pref_cita.jpg',
    'pref_milani':'/assets/politicians/pref_milani.jpg'
  };
  var lastMain='',lastDistrict='';

  function getMainKey(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function getDistrictKey(){try{return window.VFDistrictsV24&&typeof window.VFDistrictsV24.getSelected==='function'?String(window.VFDistrictsV24.getSelected()||'ALL'):'ALL';}catch(_){return 'ALL';}}
  function pathFor(key){return paths[String(key||'')]||'';}
  function cdnUrl(key){var p=pathFor(key);return p?CDN+p:'';}
  function rawUrl(key){var p=pathFor(key);return p?RAW+p:'';}
  function bgFor(key){
    var a=cdnUrl(key),b=rawUrl(key);
    if(!a)return '';
    return 'url("'+a.replace(/"/g,'%22')+'"),url("'+b.replace(/"/g,'%22')+'")';
  }

  function clearAvatar(el){
    if(!el)return;
    el.classList.remove('vf-photo-v277');
    el.style.removeProperty('background-image');
  }

  function paintAvatar(el,key){
    if(!el)return;
    if(!key||key==='ALL'||!pathFor(key)){clearAvatar(el);return;}
    el.classList.add('vf-photo-v277');
    el.style.backgroundImage=bgFor(key);
  }

  function syncMain(){
    var key=getMainKey();
    var el=document.querySelector('.vf-college-candidate-avatar');
    paintAvatar(el,key);lastMain=key;
  }

  function syncDistrict(){
    var key=getDistrictKey();
    var el=document.querySelector('.vf24-candidate-avatar');
    paintAvatar(el,key);lastDistrict=key;
  }

  function decoratePicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(btn){
      var key=String(btn.dataset.value||'');
      var old=btn.querySelector('.vf-photo-v277-list');
      if(!pathFor(key)||key==='ALL'){
        if(old)old.remove();
        btn.classList.remove('vf-photo-v277-option');
        return;
      }
      if(!old){old=document.createElement('span');old.className='vf-photo-v277-list';old.setAttribute('aria-hidden','true');btn.appendChild(old);}
      old.style.backgroundImage=bgFor(key);
      btn.classList.add('vf-photo-v277-option');
    });
  }

  function sync(){syncMain();syncDistrict();decoratePicker();}

  window.__vfPoliticianPhotosV277Map={};
  Object.keys(paths).forEach(function(k){window.__vfPoliticianPhotosV277Map[k]=cdnUrl(k);});

  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('.vf-mobile-candidate-trigger,.vf-mobile-candidate-option,.vf24-candidate-trigger,.vf24-option'):null;
    if(t){setTimeout(sync,0);setTimeout(sync,80);}
  },true);
  document.addEventListener('change',function(ev){
    var id=ev.target&&ev.target.id||'';
    if(id==='cand-select'||id==='vf-college-candidate-select'){setTimeout(sync,0);setTimeout(sync,80);}
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(sync,0);},{once:true});else setTimeout(sync,0);
  setTimeout(sync,300);setTimeout(sync,900);setInterval(sync,650);
})();
