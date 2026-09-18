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

  var view=null,shell=null,searchInput=null,categorySelect=null,lastSignature='',activeSubtab='leaders',selectedAdminLeadershipId=null,activeAdminMemberTab='leaders';
  function mobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function initials(name){var p=String(name||'').trim().split(/\s+/).filter(Boolean);return ((p[0]||'L')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}
  function list(){try{return Array.isArray(state.liderancas)?state.liderancas:[];}catch(_){return [];}}
  function categoryColor(cat){var s=String(cat||'').toLowerCase();if(s.indexOf('relig')>-1)return '#a78bfa';if(s.indexOf('esport')>-1)return '#22c55e';if(s.indexOf('comér')>-1||s.indexOf('comer')>-1)return '#f59e0b';if(s.indexOf('saúde')>-1||s.indexOf('saude')>-1)return '#06b6d4';if(s.indexOf('educ')>-1)return '#60a5fa';if(s.indexOf('familiar')>-1)return '#f472b6';return '#3b82f6';}
  var teamPalette=['#2563eb','#16a34a','#f97316','#a855f7','#e11d48','#0891b2','#ca8a04','#4f46e5','#db2777','#0f766e'];
  function leadershipColor(l){var key=String((l&&l.id)||'')+'|'+String((l&&l.nome)||'');var h=0;for(var i=0;i<key.length;i++)h=((h<<5)-h)+key.charCodeAt(i)|0;return teamPalette[Math.abs(h)%teamPalette.length];}
  function geolocated(l){return Number.isFinite(Number(l&&l.lat))&&Number.isFinite(Number(l&&l.lng))&&Math.abs(Number(l.lat))>0&&Math.abs(Number(l.lng))>0;}
  function switchSubtab(which){
    activeSubtab=which==='admin'?'admin':'leaders';
    if(!shell)return;
    shell.querySelectorAll('[data-vf28-subtab]').forEach(function(b){b.classList.toggle('active',b.dataset.vf28Subtab===activeSubtab);});
    var leadersPane=shell.querySelector('.vf28-pane-leaders');
    var adminPane=shell.querySelector('.vf28-pane-admin');
    if(leadersPane)leadersPane.hidden=activeSubtab!=='leaders';
    if(adminPane)adminPane.hidden=activeSubtab!=='admin';
    if(activeSubtab==='admin'){renderAdmin();var selected=adminLeadershipById(selectedAdminLeadershipId);if(selected)openAdminLeadership(selected);}
  }
  function ensure(){
    if(!mobile())return false;
    view=document.getElementById('view-table-liderancas');if(!view)return false;
    if(shell&&shell.isConnected)return true;
    view.classList.add('vf28-leadership-ready');
    shell=document.createElement('section');shell.className='vf28-leadership-shell';
    shell.innerHTML='\
      <header class="vf28-leadership-head"><h2>Lideranças</h2><p>Contatos, metas e geolocalização</p></header>\
      <nav class="vf28-subtabs" aria-label="Navegação de Lideranças">\
        <button type="button" class="active" data-vf28-subtab="leaders">Lideranças</button>\
        <button type="button" data-vf28-subtab="admin">ADM de Lideranças</button>\
      </nav>\
      <section class="vf28-pane vf28-pane-leaders">\
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
        <div class="vf28-leadership-list"></div>\
      </section>\
      <section class="vf28-pane vf28-pane-admin" hidden>\
        <div class="vf28-adm-overview">\
          <div class="vf28-admin-head">\
            <div><strong>Organização das equipes</strong><span>Selecione uma liderança para gerenciar sua rede de líderes e eleitores.</span></div>\
          </div>\
          <div class="vf28-admin-stats">\
            <article><small>Lideranças</small><b data-vf28-adm-leaders>0</b></article>\
            <article><small>Líderes</small><b data-vf28-adm-coords>0</b></article>\
            <article><small>Eleitores</small><b data-vf28-adm-electors>0</b></article>\
          </div>\
          <div class="vf28-admin-list"></div>\
        </div>\
        <div class="vf28-adm-detail" hidden></div>\
      </section>';
    view.appendChild(shell);
    searchInput=shell.querySelector('input');categorySelect=shell.querySelector('select');
    var original=document.getElementById('sel-category-filter');
    if(original){categorySelect.innerHTML=original.innerHTML;categorySelect.value=original.value||'ALL';}
    shell.querySelectorAll('[data-vf28-subtab]').forEach(function(b){b.addEventListener('click',function(){switchSubtab(b.dataset.vf28Subtab);});});
    searchInput.addEventListener('input',function(){render(true);});
    categorySelect.addEventListener('change',function(){
      var o=document.getElementById('sel-category-filter');if(o)o.value=categorySelect.value;
      try{if(typeof renderTableLiderancas==='function')renderTableLiderancas();}catch(_){ }
      render(true);
    });
    shell.querySelector('.vf28-new').addEventListener('click',function(){try{openModalNewLideranca();}catch(_){ }});
    shell.querySelector('.vf28-export').addEventListener('click',function(){try{exportLiderancasCSV();}catch(_){ }});
    switchSubtab(activeSubtab);
    render(true);return true;
  }
  function renderAdmin(){
    if(!shell)return;
    var all=list();
    var listBox=shell.querySelector('.vf28-admin-list');
    var leadersTotal=shell.querySelector('[data-vf28-adm-leaders]');
    var coordsTotal=shell.querySelector('[data-vf28-adm-coords]');
    var electorsTotal=shell.querySelector('[data-vf28-adm-electors]');
    if(leadersTotal)leadersTotal.textContent=fmt(all.length);
    if(coordsTotal)coordsTotal.textContent='0';
    if(electorsTotal)electorsTotal.textContent='0';
    if(!listBox)return;
    listBox.innerHTML='';
    if(!all.length){
      listBox.innerHTML='<div class="vf28-adm-empty"><strong>Nenhuma liderança cadastrada</strong><span>Cadastre uma liderança na aba Lideranças para ela aparecer aqui.</span></div>';
      return;
    }
    all.forEach(function(l){
      var color=leadershipColor(l);
      var card=document.createElement('article');
      card.className='vf28-adm-card';
      card.style.setProperty('--vf28-team',color);
      card.innerHTML='<div class="vf28-adm-card-main">'+
        '<div class="vf28-adm-color"><span></span></div>'+
        '<div class="vf28-adm-copy"><small>Liderança</small><strong>'+esc(l.nome||'Liderança')+'</strong><span>'+esc(l.bairro||'Região não informada')+'</span></div>'+
        '<div class="vf28-adm-teamtag"><i></i><span>Equipe</span></div>'+
      '</div>'+
      '<div class="vf28-adm-counts">'+
        '<div><small>Líderes</small><b>0</b></div>'+
        '<div><small>Eleitores</small><b>0</b></div>'+
        '<div><small>Cor no mapa</small><b class="vf28-adm-colorname"><i></i> definida</b></div>'+
      '</div>'+
      '<button type="button" class="vf28-adm-manage">Gerenciar <span>›</span></button>';
      card.querySelector('.vf28-adm-manage').addEventListener('click',function(){
        selectedAdminLeadershipId=String(l.id||'');
        activeAdminMemberTab='leaders';
        openAdminLeadership(l);
      });
      listBox.appendChild(card);
    });
  }
  function adminLeadershipById(id){
    return list().find(function(l){return String(l&&l.id||'')===String(id||'');})||null;
  }
  function showAdminOverview(){
    selectedAdminLeadershipId=null;
    var overview=shell&&shell.querySelector('.vf28-adm-overview');
    var detail=shell&&shell.querySelector('.vf28-adm-detail');
    if(overview)overview.hidden=false;
    if(detail){detail.hidden=true;detail.innerHTML='';}
    renderAdmin();
  }
  function setAdminMemberTab(which){
    activeAdminMemberTab=which==='electors'?'electors':'leaders';
    var detail=shell&&shell.querySelector('.vf28-adm-detail');
    if(!detail)return;
    detail.querySelectorAll('[data-vf28-member-tab]').forEach(function(btn){
      btn.classList.toggle('active',btn.dataset.vf28MemberTab===activeAdminMemberTab);
    });
    var title=detail.querySelector('[data-vf28-member-empty-title]');
    var text=detail.querySelector('[data-vf28-member-empty-text]');
    var icon=detail.querySelector('[data-vf28-member-empty-icon]');
    if(activeAdminMemberTab==='leaders'){
      if(title)title.textContent='Nenhum líder cadastrado';
      if(text)text.textContent='Os líderes vinculados a esta liderança aparecerão aqui.';
      if(icon)icon.textContent='◆';
    }else{
      if(title)title.textContent='Nenhum eleitor cadastrado';
      if(text)text.textContent='Os eleitores vinculados a esta liderança aparecerão aqui.';
      if(icon)icon.textContent='●';
    }
  }
  function previewNextStep(type,leadership){
    var detail=shell&&shell.querySelector('.vf28-adm-detail');
    if(!detail)return;
    var note=detail.querySelector('.vf28-adm-step-note');
    if(!note)return;
    note.hidden=false;
    note.innerHTML='<strong>Próxima etapa</strong><span>O formulário de cadastro de '+esc(type)+' para '+esc((leadership&&leadership.nome)||'esta liderança')+' será conectado aqui.</span>';
    clearTimeout(previewNextStep._t);
    previewNextStep._t=setTimeout(function(){if(note)note.hidden=true;},3200);
  }
  function openAdminLeadership(l){
    if(!shell||!l)return;
    var overview=shell.querySelector('.vf28-adm-overview');
    var detail=shell.querySelector('.vf28-adm-detail');
    if(!detail)return;
    var color=leadershipColor(l);
    if(overview)overview.hidden=true;
    detail.hidden=false;
    detail.style.setProperty('--vf28-team',color);
    detail.innerHTML='<div class="vf28-adm-detail-top">'+
      '<button type="button" class="vf28-adm-back">‹ <span>Voltar</span></button>'+
      '<div class="vf28-adm-detail-ident"><div class="vf28-adm-detail-color"><i></i></div><div><small>Liderança</small><strong>'+esc(l.nome||'Liderança')+'</strong><span>'+esc(l.bairro||'Região não informada')+'</span></div></div>'+
      '<div class="vf28-adm-detail-tag"><i></i> Equipe</div>'+
    '</div>'+
    '<div class="vf28-adm-detail-summary">'+
      '<article><small>Líderes</small><b>0</b></article>'+
      '<article><small>Eleitores</small><b>0</b></article>'+
      '<article><small>Cor da equipe</small><b class="vf28-adm-detail-colorlabel"><i></i> definida</b></article>'+
    '</div>'+
    '<div class="vf28-adm-create-actions">'+
      '<button type="button" class="vf28-adm-create-leader"><span>◆</span><div><small>Novo cadastro</small><strong>+ Cadastrar Líder</strong></div></button>'+
      '<button type="button" class="vf28-adm-create-elector"><span>●</span><div><small>Novo cadastro</small><strong>+ Cadastrar Eleitor</strong></div></button>'+
    '</div>'+
    '<div class="vf28-adm-member-tabs">'+
      '<button type="button" class="active" data-vf28-member-tab="leaders">Líderes <b>0</b></button>'+
      '<button type="button" data-vf28-member-tab="electors">Eleitores <b>0</b></button>'+
    '</div>'+
    '<div class="vf28-adm-member-empty"><div data-vf28-member-empty-icon>◆</div><strong data-vf28-member-empty-title>Nenhum líder cadastrado</strong><span data-vf28-member-empty-text>Os líderes vinculados a esta liderança aparecerão aqui.</span></div>'+
    '<div class="vf28-adm-step-note" hidden></div>';
    detail.querySelector('.vf28-adm-back').addEventListener('click',showAdminOverview);
    detail.querySelector('.vf28-adm-create-leader').addEventListener('click',function(){previewNextStep('Líder',l);});
    detail.querySelector('.vf28-adm-create-elector').addEventListener('click',function(){previewNextStep('Eleitor',l);});
    detail.querySelectorAll('[data-vf28-member-tab]').forEach(function(btn){btn.addEventListener('click',function(){setAdminMemberTab(btn.dataset.vf28MemberTab);});});
    setAdminMemberTab(activeAdminMemberTab);
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
    renderAdmin();
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
