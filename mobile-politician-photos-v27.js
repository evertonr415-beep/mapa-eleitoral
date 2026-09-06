(function(){
  'use strict';
  if(window.__vfPoliticianPhotosV27)return;window.__vfPoliticianPhotosV27=true;

  var photos={},loaded=false,loading=false,pending={},queue=[],active=0,maxActive=4;
  var CACHE_KEY='vf-politician-photo-cache-v27-4';
  var names={
    pref_cita:'Rafael Cita',pref_milani:'Jair Milani',
    '20220':'Décio Rosanelli','55155':'Levi do Handebol','11234':'Paulo Grassano','44044':'Toninho da Ambulância','70000':'João Graça','40133':'Márcio Nicke','20120':'Aroldo Pagan','11555':'Professor Marcelo','44567':'Alexandre Juliani Sorriso','55555':'Simone Sponton','55147':'Luisinho da Saúde','22777':'Marilsa Staub','44190':'Pardini','55120':'Cecéu','12500':'Meiry Farias','11500':'Marcos Antonio de Souza','11444':'Silvano dos Santos Alves','13100':'Márcio Diniz','55456':'Milton Xavier','10123':'Rodrigo de Deus','22622':'Rubens Franzin','22123':'Ricardo Botelho',
    dep_fed_lupion:'Pedro Lupion',dep_fed_filipe:'Filipe Barros',dep_fed_beto:'Beto Preto',dep_fed_angelica:'Angélica Enfermeira',dep_fed_deltan:'Deltan Dallagnol',dep_fed_luisa:'Luísa Canziani',dep_fed_fahur:'Sargento Fahur',dep_fed_zeca:'Zeca Dirceu',dep_fed_aliel:'Aliel Machado',dep_fed_francischini:'Felipe Francischini',dep_fed_sperafico:'Dilceu Sperafico',
    dep_est_tiago:'Tiago Amaral',dep_est_bazana:'Pedro Paulo Bazana',dep_est_tercilio:'Tercilio Turini',dep_est_curi:'Alexandre Curi',dep_est_jacovos:'Delegado Jacovós',dep_est_cobra:'Cobra Repórter',dep_est_pacheco:'Márcio Pacheco',dep_est_arilson:'Arilson Chiorato'
  };

  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();}
  function isMunicipal(key){return key==='pref_cita'||key==='pref_milani'||/^\d{5}$/.test(String(key));}
  function yearFor(key){return isMunicipal(key)?'2024':'2022';}
  function loadCache(){try{var x=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');if(x&&typeof x==='object')Object.assign(photos,x);}catch(_){}}
  function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify(photos));}catch(_){}}

  async function loadPrimary(){
    if(loading)return;loading=true;
    loadCache();
    try{
      var local=await fetch(location.origin+'/assets/politicians/photos.json?v=27.4',{cache:'no-store'});
      if(local.ok){var lm=await local.json();if(lm&&typeof lm==='object')Object.assign(photos,lm);}
    }catch(_){ }
    try{
      var r=await fetch(location.origin+'/api/tse-candidate-photos',{cache:'no-store'});
      if(r.ok){var data=await r.json();if(data&&data.photos)Object.assign(photos,data.photos);window.__vfPoliticianPhotosV27Diagnostics=data&&data.diagnostics||[];}
    }catch(_){ }
    loaded=true;loading=false;window.__vfPoliticianPhotosV27Map=photos;saveCache();apply();
  }

  function buildQuery(key){var n=names[key];if(!n)return '';return yearFor(key)+' '+n+(isMunicipal(key)?' ARAPONGAS PR ':' PR ')+' TSE';}
  function scoreTitle(title,key){
    var t=norm(title),n=norm(names[key]||'');if(!n||!t.includes(yearFor(key))||!t.includes('TSE'))return -1;
    var parts=n.split(' ').filter(function(x){return x.length>2;});var score=0;
    parts.forEach(function(p){if(t.includes(p))score+=3;});
    if(isMunicipal(key)&&t.includes('ARAPONGAS'))score+=8;
    if(key.indexOf('dep_fed_')===0&&t.includes('DEPUTADO FEDERAL'))score+=4;
    if(key.indexOf('dep_est_')===0&&t.includes('DEPUTADO ESTADUAL'))score+=4;
    if(t.includes('CANDIDATO'))score+=1;
    return score;
  }
  async function commonsLookup(key){
    var q=buildQuery(key);if(!q)return '';
    var url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch='+encodeURIComponent(q)+'&prop=imageinfo&iiprop=url&iiurlwidth=160&format=json&origin=*';
    try{
      var r=await fetch(url,{cache:'force-cache'});if(!r.ok)return '';
      var data=await r.json(),pages=data&&data.query&&data.query.pages?Object.values(data.query.pages):[];
      pages.sort(function(a,b){return scoreTitle(b.title,key)-scoreTitle(a.title,key);});
      for(var i=0;i<pages.length;i++){
        var p=pages[i],s=scoreTitle(p.title,key),ii=p.imageinfo&&p.imageinfo[0];
        if(s<4||!ii)continue;
        return ii.thumburl||ii.url||'';
      }
    }catch(_){ }
    return '';
  }
  function ensurePhoto(key){
    key=String(key||'');if(!key||key==='ALL'||photos[key]||pending[key]||!names[key])return;
    pending[key]=true;queue.push(key);pump();
  }
  function pump(){
    while(active<maxActive&&queue.length){
      (function(key){active++;commonsLookup(key).then(function(u){if(u){photos[key]=u;saveCache();window.__vfPoliticianPhotosV27Map=photos;}}).finally(function(){delete pending[key];active--;apply();pump();});})(queue.shift());
    }
  }

  function keySelected(){try{return String(state&&state.selectedCandidate||'ALL');}catch(_){return 'ALL';}}
  function clearAvatar(el){if(!el)return;el.classList.remove('vf-politician-photo-avatar');el.style.removeProperty('background-image');}
  function setAvatar(el,key){
    if(!el)return;var u=photos[String(key||'')];
    if(!u){clearAvatar(el);ensurePhoto(key);return;}
    el.classList.add('vf-politician-photo-avatar');el.style.backgroundImage='url("'+String(u).replace(/"/g,'%22')+'")';
  }
  function applySelected(){var key=keySelected();if(key==='ALL')return;setAvatar(document.querySelector('.vf-college-candidate-avatar'),key);setAvatar(document.querySelector('.vf24-candidate-avatar'),key);}
  function applyPicker(){
    document.querySelectorAll('.vf-mobile-candidate-option[data-value]').forEach(function(b){
      var key=String(b.dataset.value||'');if(key==='ALL')return;
      var u=photos[key],old=b.querySelector('.vf-politician-list-photo');
      if(!u){if(old)old.remove();b.classList.remove('vf-has-politician-photo');ensurePhoto(key);return;}
      if(!old){old=document.createElement('span');old.className='vf-politician-list-photo';old.setAttribute('aria-hidden','true');b.appendChild(old);}
      old.style.backgroundImage='url("'+String(u).replace(/"/g,'%22')+'")';b.classList.add('vf-has-politician-photo');
    });
  }
  function apply(){if(!loaded)return;applySelected();applyPicker();}

  var obs=new MutationObserver(function(){if(loaded)requestAnimationFrame(apply);});
  function start(){if(document.body)obs.observe(document.body,{childList:true,subtree:true});loadPrimary();setInterval(apply,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
