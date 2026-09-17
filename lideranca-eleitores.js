import{client,currentUser,signOut}from'./auth-gate.js';

const qs=new URLSearchParams(location.search);
const preview=qs.get('preview')==='1';
const requestedLeadership=qs.get('lideranca')||'';
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const DEMO_KEY='vf_v34_demo_eleitores_';
let supa,user,profile,leaderships=[],active=null,voters=[],map,markers,pickMarker,demoMode=false;

function setStatus(msg,ok=false){const e=$('#vfStatus');e.textContent=msg||'';e.className='vf-status'+(ok?' ok':'');}
function coords(lat,lng){$('#vfLat').value=Number(lat).toFixed(6);$('#vfLng').value=Number(lng).toFixed(6);}
function markerIcon(){return L.divIcon({className:'vf-pin-wrap',html:'<div class="vf-pin-icon"></div>',iconSize:[26,34],iconAnchor:[13,32],popupAnchor:[0,-28]});}
function roleName(r){return r==='master'?'Master':r==='adm'?'Administrador':r==='vereador'?'Vereador':r==='lideranca'?'Liderança':r||'Usuário';}
function address(v){return [v.logradouro,v.numero,v.bairro].filter(Boolean).join(', ')||'Localização cadastrada';}
function demoKey(){return DEMO_KEY+(active?.id||'none');}
function readDemo(){try{return JSON.parse(localStorage.getItem(demoKey())||'[]')}catch(_){return[]}}
function writeDemo(rows){localStorage.setItem(demoKey(),JSON.stringify(rows));}

async function boot(){
  user=await currentUser();
  if(!user){location.replace('./?login=1');return;}
  profile=user.vfProfile||{};
  $('#vfUser').textContent=(profile.nome||user.email||'Usuário')+' • '+roleName(profile.role);
  $('#vfExit').addEventListener('click',()=>signOut());
  supa=await client();
  initMap();
  bind();
  await loadLeaderships();
}

function initMap(){
  map=L.map('vfMap',{zoomControl:true,attributionControl:true}).setView([-23.4150,-51.4280],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'&copy; OpenStreetMap'}).addTo(map);
  markers=L.layerGroup().addTo(map);
  map.on('click',e=>setPickedPoint(e.latlng.lat,e.latlng.lng,true));
}

function bind(){
  $('#vfLeadership').addEventListener('change',async e=>{active=leaderships.find(x=>x.id===e.target.value)||null;await activateLeadership();});
  $('#vfLocate').addEventListener('click',()=>{
    if(!navigator.geolocation){setStatus('Este aparelho não disponibilizou a localização.');return;}
    setStatus('Obtendo sua localização...');
    navigator.geolocation.getCurrentPosition(p=>{setPickedPoint(p.coords.latitude,p.coords.longitude,true);map.setView([p.coords.latitude,p.coords.longitude],17);setStatus('Localização posicionada no mapa.',true);},()=>setStatus('Não foi possível obter a localização deste aparelho.'),{enableHighAccuracy:true,timeout:10000});
  });
  $('#vfForm').addEventListener('submit',saveVoter);
  $('#vfSearch').addEventListener('input',renderList);
}

async function loadLeaderships(){
  const role=profile.role;
  let q=supa.from('liderancas').select('id,vereador_id,nome_lideranca,whatsapp,bairro,logradouro,numero,lat,lng,usuario_id,vereador_nome,partido').order('nome_lideranca');
  if(role==='lideranca')q=q.eq('usuario_id',user.id);
  const{data,error}=await q;
  if(error){setStatus('Não foi possível carregar a liderança: '+error.message);return;}
  leaderships=data||[];
  if(!leaderships.length){
    $('#vfLeadership').innerHTML='<option value="">Nenhuma liderança vinculada</option>';
    $('.vf-preview-note').textContent='Seu acesso ainda não está vinculado a uma liderança. O vereador ou administrador precisa concluir a vinculação.';
    $('.vf-preview-note').hidden=false;
    disableForm(true);
    return;
  }
  const sel=$('#vfLeadership');
  sel.innerHTML=leaderships.map(l=>'<option value="'+esc(l.id)+'">'+esc(l.nome_lideranca)+(l.bairro?' • '+esc(l.bairro):'')+'</option>').join('');
  let target=leaderships.find(l=>l.id===requestedLeadership)||leaderships[0];
  if(role==='lideranca')target=leaderships[0];
  active=target;sel.value=active.id;
  if(role==='lideranca'||leaderships.length===1)$('.vf-leader-select').style.display='none';
  await activateLeadership();
}

async function activateLeadership(){
  if(!active)return;
  $('#vfLeaderName').textContent=active.nome_lideranca||'Liderança';
  $('#vfLeaderMeta').textContent=[active.bairro,active.vereador_nome].filter(Boolean).join(' • ')||'Rede de eleitores';
  demoMode=Boolean(preview&&profile.role!=='lideranca'&&!active.usuario_id);
  const note=$('.vf-preview-note');
  if(demoMode){note.hidden=false;note.innerHTML='<strong>Modo demonstração.</strong> Esta liderança ainda não possui uma conta vinculada. Os cadastros feitos aqui ficam somente neste navegador para você aprovar o fluxo e o visual.';}
  else if(preview&&profile.role!=='lideranca'){note.hidden=false;note.innerHTML='<strong>Preview administrativa.</strong> Você está visualizando o painel da liderança com suas permissões administrativas atuais.';}
  else note.hidden=true;
  if(Number.isFinite(Number(active.lat))&&Number.isFinite(Number(active.lng)))map.setView([Number(active.lat),Number(active.lng)],15);
  resetForm();
  await loadVoters();
}

async function loadVoters(){
  if(!active)return;
  if(demoMode){voters=readDemo();renderAll();return;}
  const{data,error}=await supa.from('eleitores').select('id,lideranca_id,lideranca_usuario_id,vereador_id,nome,whatsapp,bairro,logradouro,numero,cep,lat,lng,observacoes,criado_em').eq('lideranca_id',active.id).order('criado_em',{ascending:false});
  if(error){setStatus('Erro ao carregar eleitores: '+error.message);voters=[];}else voters=data||[];
  renderAll();
}

function renderAll(){
  $('#vfTotal').textContent=fmt(voters.length);
  $('#vfMapped').textContent=fmt(voters.filter(v=>Number.isFinite(Number(v.lat))&&Number.isFinite(Number(v.lng))).length);
  $('#vfLeaderCount').textContent=fmt(leaderships.length);
  markers.clearLayers();
  const bounds=[];
  voters.forEach(v=>{
    const lat=Number(v.lat),lng=Number(v.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
    const m=L.marker([lat,lng],{icon:markerIcon(),title:v.nome||'Eleitor'}).addTo(markers);
    m.bindPopup('<div class="vf-popup"><strong>'+esc(v.nome||'Eleitor')+'</strong><span>'+esc(address(v))+'</span><span>Liderança: '+esc(active?.nome_lideranca||'')+'</span></div>');
    bounds.push([lat,lng]);
  });
  if(bounds.length>1)map.fitBounds(bounds,{padding:[35,35],maxZoom:16});
  renderList();
}

function renderList(){
  const box=$('#vfList'),q=String($('#vfSearch').value||'').trim().toLowerCase();
  const rows=voters.filter(v=>!q||[v.nome,v.bairro,v.logradouro,v.whatsapp].some(x=>String(x||'').toLowerCase().includes(q)));
  if(!rows.length){box.innerHTML='<div class="vf-empty">Nenhum eleitor cadastrado'+(q?' para esta busca':' nesta liderança')+'.</div>';return;}
  box.innerHTML=rows.map(v=>'<article class="vf-voter"><div><strong>'+esc(v.nome)+'</strong><small>'+esc(address(v))+(v.whatsapp?' • '+esc(v.whatsapp):'')+'</small></div><div class="vf-voter-actions"><button class="vf-mini" data-focus="'+esc(v.id)+'">Mapa</button><button class="vf-mini danger" data-delete="'+esc(v.id)+'">Excluir</button></div></article>').join('');
  box.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>focusVoter(b.dataset.focus));
  box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteVoter(b.dataset.delete));
}

function focusVoter(id){const v=voters.find(x=>String(x.id)===String(id));if(!v)return;map.setView([Number(v.lat),Number(v.lng)],18);}
function setPickedPoint(lat,lng,pan){coords(lat,lng);if(pickMarker)pickMarker.setLatLng([lat,lng]);else pickMarker=L.marker([lat,lng],{draggable:true}).addTo(map).bindTooltip('Novo eleitor',{permanent:false});pickMarker.on('dragend',e=>{const p=e.target.getLatLng();coords(p.lat,p.lng)});if(pan)map.panTo([lat,lng]);setStatus('Ponto definido. Complete os dados e salve.',true);}
function resetForm(){
  $('#vfForm').reset();coords(active?.lat||-23.4150,active?.lng||-51.4280);if(pickMarker){map.removeLayer(pickMarker);pickMarker=null;}disableForm(!active);setStatus('');
}
function disableForm(v){$('#vfForm').querySelectorAll('input,textarea,button').forEach(e=>e.disabled=Boolean(v));}

async function saveVoter(ev){
  ev.preventDefault();if(!active)return;
  const btn=$('#vfSave'),name=$('#vfName').value.trim(),lat=Number($('#vfLat').value),lng=Number($('#vfLng').value);
  if(name.length<2){setStatus('Informe o nome do eleitor.');return;}
  if(!Number.isFinite(lat)||!Number.isFinite(lng)){setStatus('Defina o alfinete do eleitor no mapa.');return;}
  const row={
    id:demoMode?'demo_'+Date.now()+'_'+Math.random().toString(36).slice(2,6):undefined,
    lideranca_id:active.id,
    lideranca_usuario_id:active.usuario_id||user.id,
    vereador_id:active.vereador_id,
    cadastrado_por:user.id,
    nome:name,
    whatsapp:$('#vfWhatsapp').value.trim()||null,
    bairro:$('#vfBairro').value.trim()||null,
    logradouro:$('#vfLogradouro').value.trim()||null,
    numero:$('#vfNumero').value.trim()||null,
    cep:$('#vfCep').value.trim()||null,
    lat,lng,
    observacoes:$('#vfObs').value.trim()||null,
    criado_em:new Date().toISOString()
  };
  btn.disabled=true;btn.textContent='Salvando...';setStatus('');
  try{
    if(demoMode){const list=readDemo();list.unshift(row);writeDemo(list);voters=list;}
    else{
      if(!active.usuario_id)throw new Error('Esta liderança ainda não possui acesso vinculado.');
      delete row.id;delete row.criado_em;
      const{data,error}=await supa.from('eleitores').insert(row).select('id,lideranca_id,lideranca_usuario_id,vereador_id,nome,whatsapp,bairro,logradouro,numero,cep,lat,lng,observacoes,criado_em').single();
      if(error)throw error;voters.unshift(data);
    }
    renderAll();resetForm();setStatus(demoMode?'Eleitor adicionado à demonstração.':'Eleitor cadastrado e alfinete criado no mapa.',true);
  }catch(e){setStatus(e.message||'Não foi possível salvar o eleitor.');}
  finally{btn.disabled=false;btn.textContent='Cadastrar eleitor';}
}

async function deleteVoter(id){
  const v=voters.find(x=>String(x.id)===String(id));if(!v||!confirm('Excluir o cadastro de '+v.nome+'?'))return;
  try{
    if(demoMode){voters=voters.filter(x=>String(x.id)!==String(id));writeDemo(voters);}
    else{const{error}=await supa.from('eleitores').delete().eq('id',id);if(error)throw error;voters=voters.filter(x=>String(x.id)!==String(id));}
    renderAll();setStatus('Cadastro excluído.',true);
  }catch(e){setStatus(e.message||'Não foi possível excluir.');}
}

boot().catch(e=>{console.error(e);setStatus('Falha ao carregar o painel: '+(e.message||e));});
