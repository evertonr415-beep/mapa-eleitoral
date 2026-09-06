(function(){
  'use strict';
  if(window.__vfGoogleMapsV23)return;window.__vfGoogleMapsV23=true;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}

  function normalizeText(v){return String(v||'').replace(/\s+/g,' ').trim();}

  function findLocationFromPopup(popup){
    if(!popup)return null;
    var text=normalizeText(popup.textContent);
    try{
      if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return null;
      var best=null;
      ELEICAO_2024_DATA.locais.forEach(function(loc){
        if(!loc||!loc.name)return;
        var name=normalizeText(loc.name);
        if(text.indexOf(name)!==-1){
          if(!best||name.length>normalizeText(best.name).length)best=loc;
        }
      });
      return best;
    }catch(_){return null;}
  }

  function googleMapsUrl(loc){
    if(!loc)return '#';
    var query=[loc.name,loc.address,'Arapongas','PR'].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
  }

  function patchPopup(root){
    if(!root||!isMobile())return;
    root.querySelectorAll('.leaflet-popup-content a').forEach(function(a){
      var label=normalizeText(a.textContent);
      if(!/Google\s*Maps/i.test(label))return;
      var popup=a.closest('.leaflet-popup-content');
      var loc=findLocationFromPopup(popup);
      if(!loc)return;
      a.classList.add('vf-google-maps-link');
      a.href=googleMapsUrl(loc);
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.setAttribute('aria-label','Abrir '+loc.name+' no Google Maps');
    });
  }

  function install(){
    if(!isMobile())return;
    patchPopup(document);
    var obs=new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes&&m.addedNodes.forEach(function(n){if(n&&n.nodeType===1)patchPopup(n);});
      });
    });
    obs.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
