(function(){
  'use strict';
  if(window.__vfPoliticianPhotosV27)return;window.__vfPoliticianPhotosV27=true;

  var API='https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/';
  var endpoints=[
    {url:API+'2024/74276/2045202024/13/candidatos',kind:'municipal'},
    {url:API+'2022/PR/2040602022/6/candidatos',kind:'federal'},
    {url:API+'2022/PR/2040602022/7/candidatos',kind:'estadual'}
  ];
  var photos={},loaded=false,loading=false;
  var nums2022={
    dep_fed_lupion:'1111',dep_fed_filipe:'2201',dep_fed_beto:'5501',dep_fed_angelica:'9020',dep_fed_deltan:'1919',dep_fed_luisa:'5511',dep_fed_fahur:'5590',dep_fed_zeca:'1310',dep_fed_aliel:'4343',dep_fed_francischini:'4444',dep_fed_sperafico:'1122',
    dep_est_tiago:'55155',dep_est_bazana:'55600',dep_est_tercilio:'55043',dep_est_curi:'55128',dep_est_jacovos:'22038',dep_est_cobra:'55055',dep_est_pacheco:'10100',dep_est_arilson:'13000'
  };

  function photoUrl(c){
    var u=c&&(c.fotoUrl||c.urlFoto||c.foto);
    if(!u)return '';
    u=String(u);
    if(/^https?:\/\//i.test(u))return u;
    if(u.charAt(0)==='/')return 'https://divulgacandcontas.tse.jus.br'+u;
    return u;
  }
  function candidates(payload){return payload&&Array.isArray(payload.candidatos)?payload.candidatos:[];}
  function addMunicipal(list){
    list.forEach(function(c){var n=String(c.numero||c.nrCandidato||'');var u=photoUrl(c);if(n&&u)photos[n]=u;});
  }
  function add2022(list,kind){
    var byNumber={};list.forEach(function(c){var n=String(c.numero||c.nrCandidato||'');var u=photoUrl(c);if(n&&u)byNumber[n]=u;});
    Object.keys(nums2022).forEach(function(k){if(kind==='federal'&&k.indexOf('dep_fed_')!==0)return;if(kind==='estadual'&&k.indexOf('dep_est_')!==0)return;var u=byNumber[nums2022[k]];if(u)photos[k]=u;});
  }
  async function load(){
    if(loaded||loading)return;loading=true;
    try{
      var results=await Promise.all(endpoints.map(async function(e){
        try{var r=await fetch(e.url,{cache:'force-cache',mode:'cors'});if(!r.ok)throw Error(String(r.status));return {kind:e.kind,data:await r.json()};}
        catch(_){return {kind:e.kind,data:null};}
      }));
      results.forEach(function(x){var list=candidates(x.data);if(x.kind==='municipal')addMunicipal(list);else add2022(list,x.kind);});
      loaded=true;window.__vfPoliticianPhotosV27Map=photos;apply();
    }finally{loading=false;}
  }
  function keySelected(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function clearAvatar(el){
    if(!el)return;el.classList.remove('vf-politician-photo-avatar');el.style.removeProperty('background-image');
  }
  function setAvatar(el,key){
    if(!el)return;var u=photos[String(key||'')];if(!u){clearAvatar(el);return;}
    el.classList.add('vf-politician-photo-avatar');el.style.backgroundImage='url("'+u.replace(/"/g,'%22')+'")';
  }
  function applySelected(){
    var key=keySelected();
    if(key==='ALL')return;
    setAvatar(document.querySelector('.vf-college-candidate-avatar'),key);
    setAvatar(document.querySelector('.vf24-candidate-avatar'),key);
  }
  function applyPicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(b){
      var key=String(b.dataset.value||'');var u=photos[key];var old=b.querySelector('.vf-politician-list-photo');
      if(!u){if(old)old.remove();b.classList.remove('vf-has-politician-photo');return;}
      if(!old){old=document.createElement('span');old.className='vf-politician-list-photo';old.setAttribute('aria-hidden','true');b.appendChild(old);}
      old.style.backgroundImage='url("'+u.replace(/"/g,'%22')+'")';b.classList.add('vf-has-politician-photo');
    });
  }
  function apply(){if(!loaded)return;applySelected();applyPicker();}

  var obs=new MutationObserver(function(){if(loaded)requestAnimationFrame(apply);});
  function start(){if(document.body)obs.observe(document.body,{childList:true,subtree:true});load();setInterval(apply,700);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
