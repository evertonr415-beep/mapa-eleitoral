(async function(){
  'use strict';
  if(window.__vfLeadershipElectorsV35)return;window.__vfLeadershipElectorsV35=true;
  var auth;try{auth=await import('./auth-gate.js');}catch(e){console.warn('Eleitores v35 auth:',e);return;}
  var user=await auth.currentUser();if(!user)return;
  var role=user.vfProfile&&user.vfProfile.role||'';if(!['master','adm','vereador'].includes(role))return;
  var supa=await auth.client(),leaders=[],realVoters=[],demoVoters=[],layer=null,visible=true,activeLeader=null,pendingPoint=null,lastSignature='';
  var DEMO_PREFIX='vf_v35_demo_eleitores_';
  var PALETTE=['#2563eb','#16a34a','#f97316','#a855f7','#e11d48','#0891b2','#ca8a04','#4f46e5','#db2777','#0f766e','#9333ea','#ea580c'];
  var PREVIEW=/vercel\.app$/i.test(location.hostname)||location.hostname.indexOf('preview')>-1;

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function hash(s){var h=0,x=String(s||'');for(var i=0;i<x.length;i++)h=((h<<5)-h)+x.charCodeAt(i),h|=0;return Math.abs(h);}
  function colorOf(id){return PALETTE[hash(id)%PALETTE.length];}
  function leaderById(id){return leaders.find(function(x){return String(x.id)===String(id);})||null;}
  function voterLeader(v){return leaderById(v.lideranca_id);}
  function mapReady(){try{return typeof state!=='undefined'&&state&&state.map&&typeof L!=='undefined';}catch(_){return false;}}
  function allVoters(){return realVoters.map(function(v){return Object.assign({__demo:false},v);}).concat(demoVoters.map(function(v){return Object.assign({__demo:true},v);}));}
  function votersFor(id){return allVoters().filter(function(v){return String(v.lideranca_id)===String(id);});}
  function demoKey(id){return DEMO_PREFIX+String(id);}
  function readDemo(id){try{var a=JSON.parse(localStorage.getItem(demoKey(id))||'[]');return Array.isArray(a)?a:[];}catch(_){return [];}}
  function writeDemo(id,rows){try{localStorage.setItem(demoKey(id),JSON.stringify(rows));}catch(_){}}

  function ensureStyle(){if(document.getElementById('vf35-electors-css'))return;var l=document.createElement('link');l.id='vf35-electors-css';l.rel='stylesheet';l.href=location.origin+'/leadership-electors-v34.css?v=35';document.head.appendChild(l);}
  function menuButton(){return document.querySelector('.vf-drawer-nav-grid button[data-vf-nav="liderancas"]');}
  function syncMenu(){var b=menuButton();if(!b)return false;var s=b.querySelector('span');if(s)s.textContent='Lideranças';var badge=b.querySelector('.vf35-menu-badge');if(!badge){badge=document.createElement('b');badge.className='vf35-menu-badge';b.appendChild(badge);}badge.textContent=leaders.length?String(leaders.length):'';b.dataset.vfElectors='1';return true;}

  function ensureLayerToggle(){
    var box=document.querySelector('.layers-box-compact');if(!box||document.getElementById('chk-layer-eleitores-v35'))return;
    var label=document.createElement('label');label.className='layer-item-label vf35-layer-label';label.title='Exibir/Ocultar eleitores por liderança';label.innerHTML='<input type="checkbox" id="chk-layer-eleitores-v35" checked><span>Eleitores</span>';
    box.appendChild(label);label.querySelector('input').addEventListener('change',function(e){visible=e.target.checked;renderMap();});
  }
  function ensureLayer(){if(!mapReady())return false;if(!layer){layer=L.layerGroup().addTo(state.map);try{state.eleitoresLayerGroup=layer;}catch(_){}}ensureLayerToggle();return true;}
  function iconFor(color){return L.divIcon({className:'vf35-elector-marker',html:'<div class="vf35-elector-pin" style="--vf35-color:'+color+'"></div>',iconSize:[26,34],iconAnchor:[13,32],popupAnchor:[0,-27]});}
  function renderMap(){
    if(!ensureLayer())return;layer.clearLayers();if(!visible)return;
    allVoters().forEach(function(v){var lat=Number(v.lat),lng=Number(v.lng),lid=v.lideranca_id,l=leaderById(lid);if(!Number.isFinite(lat)||!Number.isFinite(lng)||!l)return;var color=colorOf(l.id);var m=L.marker([lat,lng],{icon:iconFor(color),title:v.nome||'Eleitor'});var where=[v.logradouro,v.numero,v.bairro].filter(Boolean).join(', ');m.bindPopup('<div class="vf35-popup"><div class="vf35-popup-leader"><i style="background:'+color+'"></i>'+esc(l.nome_lideranca||'Liderança')+'</div><strong>'+esc(v.nome||'Eleitor')+'</strong><span>'+esc(where||'Localização cadastrada')+'</span>'+(v.__demo?'<em>PREVIEW</em>':'')+'</div>');m.addTo(layer);});
    renderMapLegend();
  }
  function renderMapLegend(){
    var host=document.getElementById('view-map-container');if(!host)return;var old=document.getElementById('vf35-map-legend');if(!old){old=document.createElement('div');old.id='vf35-map-legend';old.className='vf35-map-legend';host.appendChild(old);}var shown=leaders.filter(function(l){return votersFor(l.id).length>0;});old.innerHTML='<div class="vf35-legend-title">Eleitores por liderança</div>'+shown.map(function(l){return '<button type="button" data-lid="'+esc(l.id)+'"><i style="background:'+colorOf(l.id)+'"></i><span>'+esc(l.nome_lideranca||'Liderança')+'</span><b>'+fmt(votersFor(l.id).length)+'</b></button>';}).join('');old.querySelectorAll('[data-lid]').forEach(function(b){b.onclick=function(){focusLeader(b.dataset.lid);};});old.style.display=shown.length?'block':'none';
  }
  function focusLeader(id){var rows=votersFor(id).filter(function(v){return Number.isFinite(Number(v.lat))&&Number.isFinite(Number(v.lng));});if(!rows.length)return;if(typeof window.switchView==='function')window.switchView('map');setTimeout(function(){if(!mapReady())return;var bounds=L.latLngBounds(rows.map(function(v){return [Number(v.lat),Number(v.lng)];}));if(bounds.isValid())state.map.fitBounds(bounds.pad(.25),{maxZoom:17});},160);}

  function ensurePanel(){
    var view=document.getElementById('view-table-liderancas');if(!view)return false;
    var panel=document.getElementById('vf35-leadership-hub');if(panel)return true;
    panel=document.createElement('section');panel.id='vf35-leadership-hub';panel.innerHTML='<header class="vf35-hub-head"><div><div class="vf35-kicker">Gestão da rede</div><h2>Lideranças</h2><p>Abra uma liderança para cadastrar e acompanhar os eleitores dela.</p></div><div class="vf35-hub-total"><strong data-vf35-total>0</strong><span>eleitores</span></div></header><div class="vf35-leader-list"></div>';
    view.insertBefore(panel,view.firstChild);
    document.body.classList.add('vf35-electors-ready');
    return true;
  }
  function renderPanel(){
    if(!ensurePanel())return;syncMenu();var panel=document.getElementById('vf35-leadership-hub'),list=panel.querySelector('.vf35-leader-list');panel.querySelector('[data-vf35-total]').textContent=fmt(allVoters().length);
    if(!leaders.length){list.innerHTML='<div class="vf35-empty">Nenhuma liderança cadastrada para este usuário.</div>';return;}
    list.innerHTML=leaders.map(function(l){var rows=votersFor(l.id),color=colorOf(l.id);return '<button type="button" class="vf35-leader-card" data-open-leader="'+esc(l.id)+'" style="--vf35-color:'+color+'"><span class="vf35-leader-color"></span><span class="vf35-leader-copy"><strong>'+esc(l.nome_lideranca||'Liderança')+'</strong><small>'+esc([l.bairro,l.vereador_nome].filter(Boolean).join(' • ')||'Rede vinculada')+'</small></span><span class="vf35-leader-count"><b>'+fmt(rows.length)+'</b><small>eleitores</small></span><span class="vf35-arrow">›</span></button>';}).join('');
    list.querySelectorAll('[data-open-leader]').forEach(function(b){b.onclick=function(){openLeader(b.dataset.openLeader);};});
  }

  function ensureDetail(){
    var d=document.getElementById('vf35-leader-detail');if(d)return d;
    d=document.createElement('section');d.id='vf35-leader-detail';d.className='vf35-detail';d.innerHTML='<div class="vf35-detail-backdrop" data-close-detail></div><article class="vf35-detail-sheet"><header class="vf35-detail-head"><button type="button" class="vf35-back" data-close-detail>‹</button><div class="vf35-detail-title"><span class="vf35-detail-dot"></span><div><strong data-name>Liderança</strong><small data-meta>Rede de eleitores</small></div></div><button type="button" class="vf35-close" data-close-detail>×</button></header><section class="vf35-detail-summary"><div><span>Eleitores cadastrados</span><strong data-count>0</strong></div><button type="button" data-map>Ver no mapa</button></section><div class="vf35-detail-actions"><button type="button" class="vf35-primary" data-new>＋ Cadastrar eleitor</button></div><div class="vf35-voter-list"></div></article>';
    document.body.appendChild(d);d.querySelectorAll('[data-close-detail]').forEach(function(x){x.onclick=closeLeader;});d.querySelector('[data-new]').onclick=openForm;d.querySelector('[data-map]').onclick=function(){if(activeLeader){var id=activeLeader.id;closeLeader();focusLeader(id);}};return d;
  }
  function openLeader(id){activeLeader=leaderById(id);if(!activeLeader)return;var d=ensureDetail(),color=colorOf(activeLeader.id);d.style.setProperty('--vf35-color',color);d.querySelector('[data-name]').textContent=activeLeader.nome_lideranca||'Liderança';d.querySelector('[data-meta]').textContent=[activeLeader.bairro,activeLeader.vereador_nome].filter(Boolean).join(' • ')||'Rede de eleitores';renderDetail();document.body.classList.add('vf35-detail-open');document.body.classList.remove('vf-drawer-open');}
  function closeLeader(){document.body.classList.remove('vf35-detail-open');activeLeader=null;pendingPoint=null;closeForm();}
  function renderDetail(){if(!activeLeader)return;var d=ensureDetail(),rows=votersFor(activeLeader.id);d.querySelector('[data-count]').textContent=fmt(rows.length);var box=d.querySelector('.vf35-voter-list');if(!rows.length){box.innerHTML='<div class="vf35-empty">Nenhum eleitor cadastrado nesta liderança.</div>';return;}box.innerHTML=rows.map(function(v){return '<article class="vf35-voter-row"><span class="vf35-voter-pin"></span><div><strong>'+esc(v.nome||'Eleitor')+'</strong><small>'+esc([v.logradouro,v.numero,v.bairro].filter(Boolean).join(', ')||'Localização cadastrada')+'</small></div><button type="button" data-focus="'+esc(v.id)+'">Mapa</button></article>';}).join('');box.querySelectorAll('[data-focus]').forEach(function(b){b.onclick=function(){var v=rows.find(function(x){return String(x.id)===String(b.dataset.focus);});if(!v)return;closeLeader();if(typeof window.switchView==='function')window.switchView('map');setTimeout(function(){if(mapReady())state.map.setView([Number(v.lat),Number(v.lng)],18);},160);};});}

  function ensureForm(){
    var m=document.getElementById('vf35-elector-form');if(m)return m;
    m=document.createElement('section');m.id='vf35-elector-form';m.className='vf35-form-modal';m.innerHTML='<div class="vf35-form-backdrop" data-form-close></div><form class="vf35-form-card"><header><div><strong>Cadastrar eleitor</strong><small data-form-leader>Liderança</small></div><button type="button" data-form-close>×</button></header><label>Nome do eleitor<input name="nome" required maxlength="120" placeholder="Nome completo"></label><div class="vf35-form-grid"><label>WhatsApp<input name="whatsapp" inputmode="tel" placeholder="(43) 99999-9999"></label><label>Bairro<input name="bairro" placeholder="Bairro"></label></div><label>Rua / logradouro<input name="logradouro" placeholder="Rua, avenida..."></label><div class="vf35-form-grid"><label>Número<input name="numero" placeholder="Nº"></label><label>CEP<input name="cep" placeholder="00000-000"></label></div><section class="vf35-location-box"><div><strong>Localização do alfinete</strong><span data-point>Ainda não definida</span></div><div class="vf35-location-actions"><button type="button" data-pick>Selecionar no mapa</button><button type="button" data-gps>Minha localização</button></div></section><button class="vf35-save" type="submit">Salvar eleitor nesta liderança</button><div class="vf35-form-status"></div></form>';
    document.body.appendChild(m);m.querySelectorAll('[data-form-close]').forEach(function(x){x.onclick=closeForm;});m.querySelector('[data-pick]').onclick=pickOnMap;m.querySelector('[data-gps]').onclick=useGps;m.querySelector('form').onsubmit=saveVoter;return m;
  }
  function openForm(){if(!activeLeader)return;pendingPoint=null;var m=ensureForm();m.querySelector('form').reset();m.querySelector('[data-form-leader]').textContent=activeLeader.nome_lideranca||'Liderança';m.querySelector('[data-point]').textContent='Ainda não definida';m.querySelector('.vf35-form-status').textContent=PREVIEW?'Preview: o cadastro ficará apenas neste navegador.':'';document.body.classList.add('vf35-form-open');}
  function closeForm(){document.body.classList.remove('vf35-form-open');}
  function pointLabel(){var m=ensureForm();m.querySelector('[data-point]').textContent=pendingPoint?'Ponto definido: '+pendingPoint.lat.toFixed(5)+', '+pendingPoint.lng.toFixed(5):'Ainda não definida';}
  function pickOnMap(){if(!activeLeader||!mapReady()){ensureForm().querySelector('.vf35-form-status').textContent='Abra o mapa e tente novamente.';return;}var keep=activeLeader;document.body.classList.remove('vf35-form-open','vf35-detail-open');if(typeof window.switchView==='function')window.switchView('map');var banner=document.getElementById('vf35-pick-banner');if(!banner){banner=document.createElement('div');banner.id='vf35-pick-banner';banner.className='vf35-pick-banner';document.body.appendChild(banner);}banner.innerHTML='<strong>Toque no mapa</strong><span>Escolha onde o eleitor será marcado.</span><button type="button">Cancelar</button>';banner.classList.add('show');var cancelled=false;banner.querySelector('button').onclick=function(){cancelled=true;banner.classList.remove('show');activeLeader=keep;openLeader(keep.id);openForm();};setTimeout(function(){if(!mapReady())return;state.map.once('click',function(e){if(cancelled)return;pendingPoint={lat:e.latlng.lat,lng:e.latlng.lng};banner.classList.remove('show');activeLeader=keep;openLeader(keep.id);openForm();pointLabel();});},180);}
  function useGps(){if(!navigator.geolocation){ensureForm().querySelector('.vf35-form-status').textContent='Localização indisponível neste aparelho.';return;}ensureForm().querySelector('.vf35-form-status').textContent='Obtendo localização...';navigator.geolocation.getCurrentPosition(function(p){pendingPoint={lat:p.coords.latitude,lng:p.coords.longitude};pointLabel();ensureForm().querySelector('.vf35-form-status').textContent='Localização definida.';},function(){ensureForm().querySelector('.vf35-form-status').textContent='Não foi possível obter a localização.';},{enableHighAccuracy:true,timeout:10000});}
  async function saveVoter(e){e.preventDefault();if(!activeLeader)return;var f=e.currentTarget,st=f.querySelector('.vf35-form-status');if(!pendingPoint){st.textContent='Defina a localização do alfinete antes de salvar.';return;}var fd=new FormData(f),row={id:'demo_'+Date.now(),lideranca_id:activeLeader.id,vereador_id:activeLeader.vereador_id,nome:String(fd.get('nome')||'').trim(),whatsapp:String(fd.get('whatsapp')||'').trim(),bairro:String(fd.get('bairro')||'').trim(),logradouro:String(fd.get('logradouro')||'').trim(),numero:String(fd.get('numero')||'').trim(),cep:String(fd.get('cep')||'').trim(),lat:pendingPoint.lat,lng:pendingPoint.lng,criado_em:new Date().toISOString()};if(!row.nome){st.textContent='Informe o nome do eleitor.';return;}
    if(PREVIEW){var arr=readDemo(activeLeader.id);arr.unshift(row);writeDemo(activeLeader.id,arr);demoVoters=demoVoters.filter(function(v){return String(v.lideranca_id)!==String(activeLeader.id);}).concat(arr);st.textContent='Eleitor adicionado à preview.';closeForm();renderPanel();renderDetail();renderMap();return;}
    st.textContent='Cadastro real será ativado após aprovação desta etapa.';
  }

  function seedPreview(){if(!PREVIEW)return;leaders.forEach(function(l){var arr=readDemo(l.id);if(arr.length||votersFor(l.id).some(function(v){return !v.__demo;}))return;var lat=Number(l.lat),lng=Number(l.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;arr=[{id:'seed_'+l.id+'_1',lideranca_id:l.id,vereador_id:l.vereador_id,nome:'Eleitor demonstração 01',bairro:l.bairro||'Bairro',logradouro:'Ponto de demonstração',numero:'',lat:lat+.0012,lng:lng+.0008,criado_em:new Date().toISOString()},{id:'seed_'+l.id+'_2',lideranca_id:l.id,vereador_id:l.vereador_id,nome:'Eleitor demonstração 02',bairro:l.bairro||'Bairro',logradouro:'Ponto de demonstração',numero:'',lat:lat-.0010,lng:lng-.0007,criado_em:new Date().toISOString()}];writeDemo(l.id,arr);});}

  async function load(){
    try{
      var lr=await supa.from('liderancas').select('id,vereador_id,nome_lideranca,bairro,vereador_nome,partido,lat,lng').order('nome_lideranca');if(lr.error)throw lr.error;leaders=lr.data||[];
      var vr=await supa.from('eleitores').select('id,lideranca_id,vereador_id,nome,whatsapp,bairro,logradouro,numero,cep,lat,lng,criado_em').order('criado_em',{ascending:false});if(vr.error)throw vr.error;realVoters=vr.data||[];
      demoVoters=[];leaders.forEach(function(l){readDemo(l.id).forEach(function(v){demoVoters.push(v);});});seedPreview();demoVoters=[];leaders.forEach(function(l){readDemo(l.id).forEach(function(v){demoVoters.push(v);});});
      var sig=[leaders.length,realVoters.length,demoVoters.length,leaders.map(function(l){return l.id+':'+l.nome_lideranca;}).join('|'),allVoters().map(function(v){return v.id+':'+v.lat+':'+v.lng;}).join('|')].join('~');if(sig!==lastSignature){lastSignature=sig;renderPanel();renderMap();if(activeLeader)renderDetail();}syncMenu();
    }catch(e){console.warn('Eleitores v35:',e);renderPanel();syncMenu();}
  }
  function boot(){ensureStyle();ensurePanel();ensureLayer();syncMenu();load();setTimeout(function(){syncMenu();ensureLayer();renderMap();},700);setTimeout(syncMenu,1400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('#tab-btn-map,#tab-btn-liderancas,[data-vf-view="map"],[data-vf-view="liderancas"],[data-vf-nav="liderancas"]'):null;if(t)setTimeout(function(){ensurePanel();ensureLayer();load();},120);},true);
  window.addEventListener('focus',load);window.addEventListener('storage',function(e){if(e.key&&e.key.indexOf(DEMO_PREFIX)===0)load();});setInterval(function(){if(!document.hidden)load();},15000);
  window.VFElectorsV35={refresh:load,openLeader:openLeader};
})();
