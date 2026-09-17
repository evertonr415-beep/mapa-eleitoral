(async function(){
  'use strict';
  if(window.__vfLeadershipElectorsV34)return;window.__vfLeadershipElectorsV34=true;
  var auth;try{auth=await import('./auth-gate.js');}catch(e){console.warn('Eleitores v34 auth:',e);return;}
  var user=await auth.currentUser();if(!user)return;
  var role=user.vfProfile&&user.vfProfile.role||'';if(role==='lideranca')return;
  var supa=await auth.client(),leaders=[],realVoters=[],demoVoters=[],layer=null,visible=true,lastSignature='';
  var DEMO_KEY='vf_v34_demo_eleitores_';
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function leaderName(id){var l=leaders.find(function(x){return String(x.id)===String(id)});return l?l.nome_lideranca:'Liderança';}
  function readDemo(id){try{var x=JSON.parse(localStorage.getItem(DEMO_KEY+id)||'[]');return Array.isArray(x)?x:[];}catch(_){return [];}}
  function mapReady(){try{return typeof state!=='undefined'&&state&&state.map&&typeof L!=='undefined';}catch(_){return false;}}
  function ensureStyle(){if(document.getElementById('vf34-electors-css'))return;var l=document.createElement('link');l.id='vf34-electors-css';l.rel='stylesheet';l.href=location.origin+'/leadership-electors-v34.css?v=34';document.head.appendChild(l);}
  function ensureLayerToggle(){
    var box=document.querySelector('.layers-box-compact');if(!box||document.getElementById('chk-layer-eleitores-v34'))return;
    var label=document.createElement('label');label.className='layer-item-label vf34-layer-label';label.title='Exibir/Ocultar alfinetes de eleitores';label.innerHTML='<input type="checkbox" id="chk-layer-eleitores-v34" checked><span>Eleitores</span>';
    box.appendChild(label);label.querySelector('input').addEventListener('change',function(e){visible=e.target.checked;renderMap();});
  }
  function ensureLayer(){
    if(!mapReady())return false;
    if(!layer){layer=L.layerGroup().addTo(state.map);try{state.eleitoresLayerGroup=layer;}catch(_){}}
    ensureLayerToggle();return true;
  }
  function icon(demo){return L.divIcon({className:'vf34-elector-marker',html:'<div class="vf34-elector-pin'+(demo?' demo':'')+'"></div>',iconSize:[24,32],iconAnchor:[12,30],popupAnchor:[0,-26]});}
  function renderMap(){
    if(!ensureLayer())return;layer.clearLayers();if(!visible)return;
    var all=realVoters.map(function(v){return Object.assign({__demo:false},v)}).concat(demoVoters.map(function(v){return Object.assign({__demo:true},v)}));
    all.forEach(function(v){var lat=Number(v.lat),lng=Number(v.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;var m=L.marker([lat,lng],{icon:icon(v.__demo),title:v.nome||'Eleitor'});var where=[v.logradouro,v.numero,v.bairro].filter(Boolean).join(', ');m.bindPopup('<div class="vf34-popup"><strong>'+esc(v.nome||'Eleitor')+'</strong><span>'+esc(where||'Localização cadastrada')+'</span><span>Liderança: '+esc(leaderName(v.lideranca_id))+'</span>'+(v.__demo?'<em>PREVIEW / DEMO</em>':'')+'</div>');m.addTo(layer);});
  }
  function injectPanel(){
    var view=document.getElementById('view-table-liderancas');if(!view)return false;
    var old=document.getElementById('vf34-elector-network');if(old)return true;
    var panel=document.createElement('section');panel.id='vf34-elector-network';panel.innerHTML='<div class="vf34-net-head"><div class="vf34-net-copy"><div class="vf34-net-kicker">Rede de eleitores</div><h3>Lideranças → Eleitores → Mapa</h3><p>Cada eleitor fica ligado à liderança responsável e aparece como alfinete no mapa.</p></div><div class="vf34-net-total"><strong data-vf34-total>0</strong><span>eleitores</span></div></div><div class="vf34-net-list"><div class="vf34-net-empty">Carregando redes...</div></div>';
    view.insertBefore(panel,view.firstChild);return true;
  }
  function renderPanel(){
    if(!injectPanel())return;
    var panel=document.getElementById('vf34-elector-network'),list=panel.querySelector('.vf34-net-list');
    var allCount=realVoters.length+demoVoters.length;panel.querySelector('[data-vf34-total]').textContent=fmt(allCount);
    if(!leaders.length){list.innerHTML='<div class="vf34-net-empty">Nenhuma liderança disponível para este usuário.</div>';return;}
    list.innerHTML=leaders.map(function(l){var real=realVoters.filter(function(v){return String(v.lideranca_id)===String(l.id)}).length,demo=demoVoters.filter(function(v){return String(v.lideranca_id)===String(l.id)}).length,total=real+demo;return '<article class="vf34-leader-network"><div><strong>'+esc(l.nome_lideranca||'Liderança')+'</strong><small>'+esc([l.bairro,l.vereador_nome].filter(Boolean).join(' • ')||'Rede vinculada')+'</small><span class="vf34-count">'+fmt(total)+' eleitor'+(total===1?'':'es')+(demo?' • '+demo+' demo':'')+'</span></div><button type="button" data-vf34-open="'+esc(l.id)+'">Abrir painel</button></article>';}).join('');
    list.querySelectorAll('[data-vf34-open]').forEach(function(b){b.addEventListener('click',function(){window.open(location.origin+'/lideranca.html?preview=1&lideranca='+encodeURIComponent(b.dataset.vf34Open),'_blank','noopener');});});
  }
  async function load(){
    try{
      var lr=await supa.from('liderancas').select('id,vereador_id,nome_lideranca,bairro,usuario_id,vereador_nome,partido').order('nome_lideranca');
      if(lr.error)throw lr.error;leaders=lr.data||[];
      var vr=await supa.from('eleitores').select('id,lideranca_id,lideranca_usuario_id,vereador_id,nome,whatsapp,bairro,logradouro,numero,lat,lng,criado_em').order('criado_em',{ascending:false});
      if(vr.error)throw vr.error;realVoters=vr.data||[];
      demoVoters=[];leaders.forEach(function(l){readDemo(l.id).forEach(function(v){demoVoters.push(v);});});
      var sig=[leaders.length,realVoters.length,demoVoters.length,realVoters.map(function(v){return v.id+':'+v.lat+':'+v.lng}).join('|'),demoVoters.map(function(v){return v.id+':'+v.lat+':'+v.lng}).join('|')].join('~');
      if(sig!==lastSignature){lastSignature=sig;renderPanel();renderMap();}
    }catch(e){console.warn('Eleitores v34:',e);renderPanel();}
  }
  function boot(){ensureStyle();injectPanel();ensureLayer();load();setTimeout(function(){ensureLayer();renderMap();},700);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('#tab-btn-map,#tab-btn-liderancas,[data-view="map"],[data-view="liderancas"]'):null;if(t)setTimeout(function(){injectPanel();ensureLayer();load();},120);},true);
  window.addEventListener('storage',function(e){if(e.key&&e.key.indexOf(DEMO_KEY)===0)load();});
  window.addEventListener('focus',function(){load();});
  setInterval(function(){if(!document.hidden)load();},12000);
  window.VFElectorsV34={refresh:load,open:function(id){window.open(location.origin+'/lideranca.html?preview=1&lideranca='+encodeURIComponent(id),'_blank','noopener');}};
})();
