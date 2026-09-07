(function(){
  'use strict';
  if(window.__vfMobileLeadershipV28)return;window.__vfMobileLeadershipV28=true;

  /* v29 mobile WhatsApp hub: loaded only in this preview branch. */
  try{
    if(!document.querySelector('link[data-vf-wa29="1"]')){
      var waCss=document.createElement('link');waCss.rel='stylesheet';waCss.href=location.origin+'/mobile-whatsapp-hub-v29.css?v=29';waCss.dataset.vfWa29='1';document.head.appendChild(waCss);
    }
    if(!document.querySelector('script[data-vf-wa29="1"]')){
      var waJs=document.createElement('script');waJs.src=location.origin+'/mobile-whatsapp-hub-v29.js?v=29';waJs.defer=true;waJs.dataset.vfWa29='1';document.head.appendChild(waJs);
    }
  }catch(_){ }

  var view=null,shell=null,searchInput=null,categorySelect=null,lastSignature='';
  function mobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function initials(name){var p=String(name||'').trim().split(/\s+/).filter(Boolean);return ((p[0]||'L')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}
  function list(){try{return Array.isArray(state.liderancas)?state.liderancas:[];}catch(_){return [];}}
  function categoryColor(cat){var s=String(cat||'').toLowerCase();if(s.indexOf('relig')>-1)return '#a78bfa';if(s.indexOf('esport')>-1)return '#22c55e';if(s.indexOf('comér')>-1||s.indexOf('comer')>-1)return '#f59e0b';if(s.indexOf('saúde')>-1||s.indexOf('saude')>-1)return '#06b6d4';if(s.indexOf('educ')>-1)return '#60a5fa';if(s.indexOf('familiar')>-1)return '#f472b6';return '#3b82f6';}
  function geolocated(l){return Number.isFinite(Number(l&&l.lat))&&Number.isFinite(Number(l&&l.lng))&&Math.abs(Number(l.lat))>0&&Math.abs(Number(l.lng))>0;}
  function ensure(){
    if(!mobile())return false;
    view=document.getElementById('view-table-liderancas');if(!view)return false;
    if(shell&&shell.isConnected)return true;
    view.classList.add('vf28-leadership-ready');
    shell=document.createElement('section');shell.className='vf28-leadership-shell';
    shell.innerHTML='\
      <header class="vf28-leadership-head"><h2>Lideranças</h2><p>Contatos, metas e geolocalização</p></header>\
      <div class="vf28-leadership-stats">\
        <article class="vf28-leadership-stat"><span>Lideranças</span><strong data-vf28-total>0</strong></article>\
        <article class="vf28-leadership-stat"><span>Meta de votos</span><strong data-vf28-meta>+0</strong></article>\
        <article class="vf28-leadership-stat"><span>Localizadas</span><strong data-vf28-geo>0</strong></article>\
      </div>\
      <div class="vf28-leadership-tools">\
        <label class="vf28-leadership-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input type="search" placeholder="Buscar por nome, bairro ou vereador" autocomplete="off"></label>\
        <select class="vf28-category-select"></select>\
        <div class="vf28-leadership-actions"><button type="button" class="vf28-new">+ Nova Liderança</button><button type="button" class="vf28-export">📥 Exportar</button></div>\
      </div>\
      <div class="vf28-leadership-list"></div>';
    view.appendChild(shell);
    searchInput=shell.querySelector('input');categorySelect=shell.querySelector('select');
    var original=document.getElementById('sel-category-filter');
    if(original){categorySelect.innerHTML=original.innerHTML;categorySelect.value=original.value||'ALL';}
    searchInput.addEventListener('input',function(){render(true);});
    categorySelect.addEventListener('change',function(){
      var o=document.getElementById('sel-category-filter');if(o)o.value=categorySelect.value;
      try{if(typeof renderTableLiderancas==='function')renderTableLiderancas();}catch(_){ }
      render(true);
    });
    shell.querySelector('.vf28-new').addEventListener('click',function(){try{openModalNewLideranca();}catch(_){ }});
    shell.querySelector('.vf28-export').addEventListener('click',function(){try{exportLiderancasCSV();}catch(_){ }});
    render(true);return true;
  }
  function visibleList(){
    var q=String(searchInput&&searchInput.value||'').trim().toLowerCase(),cat=String(categorySelect&&categorySelect.value||'ALL');
    return list().filter(function(l){
      if(cat!=='ALL'&&String(l.categoria||'').toLowerCase().indexOf(cat.toLowerCase())===-1)return false;
      if(!q)return true;
      return [l.nome,l.bairro,l.vereadorNome,l.partido,l.categoria,l.colegioNome,l.whatsapp].some(function(v){return String(v||'').toLowerCase().indexOf(q)>-1;});
    });
  }
  function render(force){
    if(!ensure())return;
    var all=list(),filtered=visibleList(),meta=all.reduce(function(s,l){return s+Number(l.metaVotos||0);},0),geo=all.filter(geolocated).length;
    var sig=[all.length,meta,geo,filtered.length,categorySelect&&categorySelect.value,searchInput&&searchInput.value,all.map(function(l){return [l.id,l.nome,l.metaVotos,l.bairro,l.categoria,l.lat,l.lng].join(':');}).join('|')].join('~');
    if(!force&&sig===lastSignature)return;lastSignature=sig;
    shell.querySelector('[data-vf28-total]').textContent=fmt(all.length);
    shell.querySelector('[data-vf28-meta]').textContent='+'+fmt(meta);
    shell.querySelector('[data-vf28-geo]').textContent=fmt(geo)+'/'+fmt(all.length);
    var box=shell.querySelector('.vf28-leadership-list');box.innerHTML='';
    if(!filtered.length){box.innerHTML='<div class="vf28-empty"><div class="vf28-empty-icon">📍</div><strong>Nenhuma liderança encontrada</strong><span>Ajuste a busca ou o filtro de categoria, ou cadastre uma nova liderança.</span></div>';return;}
    filtered.forEach(function(l){
      var card=document.createElement('article');card.className='vf28-leader-card';card.style.setProperty('--vf28-accent',categoryColor(l.categoria));
      var hasGeo=geolocated(l),responsavel=[l.vereadorNome,l.partido].filter(Boolean).join(' • ')||'Sem responsável informado';
      card.innerHTML='<div class="vf28-leader-top"><div class="vf28-leader-avatar">'+esc(initials(l.nome))+'</div><div class="vf28-leader-copy"><strong>'+esc(l.nome||'Liderança')+'</strong><span>'+esc(responsavel)+'</span></div><span class="vf28-category">'+esc(l.categoria||'Sem categoria')+'</span></div>'+ 
        '<div class="vf28-leader-info"><div class="vf28-info"><small>Bairro</small><b>'+esc(l.bairro||'Não informado')+'</b></div><div class="vf28-info meta"><small>Meta</small><b>+'+fmt(l.metaVotos||0)+' votos</b></div><div class="vf28-info"><small>Colégio</small><b>'+esc(l.colegioNome||'Não vinculado')+'</b></div><div class="vf28-info geo"><small>Localização</small><b>'+(hasGeo?'● Geolocalizada':'○ Sem localização')+'</b></div></div>'+ 
        '<div class="vf28-leader-actions"><button type="button" class="vf28-map"'+(hasGeo?'':' disabled')+'>🎯 Ver no mapa</button><button type="button" class="vf28-whatsapp">💬 WhatsApp</button></div>';
      var mapBtn=card.querySelector('.vf28-map');if(hasGeo)mapBtn.addEventListener('click',function(){try{focusLiderancaInMap(l.id);}catch(_){ }});
      card.querySelector('.vf28-whatsapp').addEventListener('click',function(){
        try{
          if(typeof window.openWhatsAppSenderModal==='function')window.openWhatsAppSenderModal(l.id);
        }catch(_){ }
      });
      box.appendChild(card);
    });
  }
  function boot(){if(ensure())render(true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,50);},{once:true});else setTimeout(boot,50);
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('#tab-btn-liderancas,[data-view="liderancas"],.vf-drawer-item'):null;if(t)setTimeout(function(){render(true);},100);},true);
  setTimeout(boot,500);setTimeout(boot,1200);setInterval(function(){if(document.body&&document.body.getAttribute('data-vf-view')==='liderancas')render(false);},900);
})();
