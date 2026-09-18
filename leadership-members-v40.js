(async function(){
  'use strict';
  if(window.__vfLeadershipMembersV40)return; window.__vfLeadershipMembersV40=true;

  var mod;
  try{ mod=await import('./auth-gate.js'); }catch(e){ console.warn('Membros liderança: auth indisponível',e); return; }
  var sb=await mod.client();
  var members=[], dbLeaders=[], memberLayer=null, photoLayer=null, activeForm=null, pendingMapPick=null;
  var palette=['#2563eb','#16a34a','#f97316','#a855f7','#e11d48','#0891b2','#ca8a04','#4f46e5','#db2777','#0f766e'];

  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();}
  function validCoord(lat,lng){lat=Number(lat);lng=Number(lng);return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-23.50&&lat<=-23.34&&lng>=-51.55&&lng<=-51.32;}
  function leadershipColor(l){var name=norm((l&&((l.nome_lideranca||l.nome)))||'');var vereador=String((l&&((l.vereador_id||l.vereadorId)))||'');var key=vereador+'|'+name;var h=0;for(var i=0;i<key.length;i++)h=((h<<5)-h)+key.charCodeAt(i)|0;return palette[Math.abs(h)%palette.length];}
  function frontendLeaders(){try{return Array.isArray(state.liderancas)?state.liderancas:[];}catch(_){return [];}}
  function dbLeaderForFrontend(l){
    if(!l)return null;
    return dbLeaders.find(function(x){return String(x.id)===String(l.id);}) ||
      dbLeaders.find(function(x){return norm(x.nome_lideranca)===norm(l.nome) && (!l.bairro||!x.bairro||norm(x.bairro)===norm(l.bairro));}) || null;
  }
  function frontendForDbLeaderId(id){
    var db=dbLeaders.find(function(x){return String(x.id)===String(id);});
    if(!db)return null;
    return frontendLeaders().find(function(l){return String(l.id)===String(db.id);}) ||
      frontendLeaders().find(function(l){return norm(l.nome)===norm(db.nome_lideranca);}) || null;
  }
  function countFor(l,type){
    var db=dbLeaderForFrontend(l); if(!db)return 0;
    return members.filter(function(m){return String(m.lideranca_id)===String(db.id)&&m.tipo===type;}).length;
  }

  async function loadData(){
    try{
      var r=await Promise.all([
        sb.from('liderancas').select('id,vereador_id,nome_lideranca,bairro,lat,lng,foto_url'),
        sb.from('lideranca_membros').select('id,lideranca_id,vereador_id,tipo,nome,whatsapp,cep,logradouro,numero,bairro,lat,lng,observacoes,criado_em').order('criado_em',{ascending:true})
      ]);
      if(r[0].error)throw r[0].error;if(r[1].error)throw r[1].error;
      dbLeaders=r[0].data||[];members=r[1].data||[];
      syncUI(); renderPins(); renderLeadershipPhotos();
    }catch(e){console.warn('Membros liderança:',e);}
  }

  function ensureLayer(){
    try{
      if(!state.map||typeof L==='undefined')return null;
      if(!memberLayer){memberLayer=L.layerGroup().addTo(state.map); state.vfLeadershipMembersLayer=memberLayer;}
      return memberLayer;
    }catch(_){return null;}
  }
  function ensurePhotoLayer(){
    try{
      if(!state.map||typeof L==='undefined')return null;
      if(!photoLayer){photoLayer=L.layerGroup().addTo(state.map);state.vfLeadershipPhotoLayer=photoLayer;}
      return photoLayer;
    }catch(_){return null;}
  }
  function initials(name){
    var p=String(name||'').trim().split(/\s+/).filter(Boolean);
    return ((p[0]||'L')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();
  }
  function photoMarkerHtml(db,color){
    var name=db&&db.nome_lideranca||'Liderança';
    if(db&&db.foto_url){
      return '<div class="vf42-photo-pin" style="--vf42-team:'+color+'"><img src="'+esc(db.foto_url)+'" alt="'+esc(name)+'"><i></i></div>';
    }
    return '<div class="vf42-photo-pin fallback" style="--vf42-team:'+color+'"><span>'+esc(initials(name))+'</span><i></i></div>';
  }
  function renderLeadershipPhotos(){
    var layer=ensurePhotoLayer();if(!layer)return;
    layer.clearLayers();
    dbLeaders.forEach(function(db){
      if(!db||!db.foto_url||!validCoord(db.lat,db.lng))return;
      var fl=frontendForDbLeaderId(db.id);
      var color=leadershipColor(fl||db);
      var icon=L.divIcon({
        className:'vf42-photo-pin-wrap',
        html:photoMarkerHtml(db,color),
        iconSize:[50,56],
        iconAnchor:[25,52],
        popupAnchor:[0,-48]
      });
      var marker=L.marker([Number(db.lat),Number(db.lng)],{icon:icon,zIndexOffset:1500});
      marker.bindTooltip('<b>'+esc(db.nome_lideranca||'Liderança')+'</b><br><small>Liderança</small>',{direction:'top',offset:[0,-46]});
      var f=fl;
      if(f&&typeof buildLiderancaPopup==='function')marker.bindPopup(buildLiderancaPopup(f));
      else marker.bindPopup('<div class="popup-lideranca-card"><div class="popup-title">'+esc(db.nome_lideranca||'Liderança')+'</div><div class="popup-detail-row"><strong>Liderança</strong></div></div>');
      layer.addLayer(marker);
    });
    setTimeout(function(){
      document.querySelectorAll('.pin-lideranca-marker').forEach(function(el){
        var title=norm(el.getAttribute('title')||'');
        var hasPhoto=dbLeaders.some(function(db){return !!db.foto_url&&title.indexOf(norm(db.nome_lideranca||''))>-1;});
        el.style.opacity=hasPhoto?'0':'1';
        el.style.pointerEvents=hasPhoto?'none':'';
      });
    },0);
  }
  function compressPhoto(file){
    return new Promise(function(resolve,reject){
      if(!file||!/^image\//.test(file.type||''))return reject(new Error('Selecione uma imagem válida.'));
      if(file.size>8*1024*1024)return reject(new Error('A imagem deve ter no máximo 8 MB.'));
      var url=URL.createObjectURL(file),img=new Image();
      img.onload=function(){
        try{
          var size=Math.min(img.naturalWidth||img.width,img.naturalHeight||img.height);
          var sx=((img.naturalWidth||img.width)-size)/2,sy=((img.naturalHeight||img.height)-size)/2;
          var canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;
          var ctx=canvas.getContext('2d');
          ctx.drawImage(img,sx,sy,size,size,0,0,180,180);
          var data=canvas.toDataURL('image/jpeg',0.82);
          URL.revokeObjectURL(url);resolve(data);
        }catch(e){URL.revokeObjectURL(url);reject(e);}
      };
      img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('Não foi possível ler a imagem.'));};
      img.src=url;
    });
  }
  function ensurePhotoControl(l){
    var detail=document.querySelector('.vf28-adm-detail:not([hidden])');if(!detail||!l)return;
    var db=dbLeaderForFrontend(l);if(!db)return;
    var existing=detail.querySelector('.vf42-photo-control');if(existing)existing.remove();
    var color=leadershipColor(l),wrap=document.createElement('div');
    wrap.className='vf42-photo-control';wrap.style.setProperty('--vf42-team',color);
    wrap.innerHTML='<div class="vf42-photo-preview">'+
      (db.foto_url?'<img src="'+esc(db.foto_url)+'" alt="'+esc(l.nome||db.nome_lideranca||'Liderança')+'">':'<span>'+esc(initials(l.nome||db.nome_lideranca))+'</span>')+
      '</div><div class="vf42-photo-copy"><small>Foto da liderança</small><strong>'+(db.foto_url?'Foto configurada':'Adicionar foto no mapa')+'</strong><span>Será exibida somente no marcador da Liderança principal.</span></div>'+
      '<button type="button" class="vf42-photo-btn">'+(db.foto_url?'Trocar foto':'Adicionar foto')+'</button><input type="file" accept="image/*" class="vf42-photo-input" hidden>';
    var anchor=detail.querySelector('.vf28-adm-detail-summary');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(wrap,anchor.nextSibling);else detail.appendChild(wrap);
    var input=wrap.querySelector('.vf42-photo-input'),btn=wrap.querySelector('.vf42-photo-btn');
    btn.onclick=function(){input.click();};
    input.onchange=async function(){
      var file=input.files&&input.files[0];if(!file)return;
      btn.disabled=true;btn.textContent='Salvando...';
      try{
        var data=await compressPhoto(file);
        var r=await sb.from('liderancas').update({foto_url:data}).eq('id',db.id).select('id,foto_url').single();
        if(r.error)throw r.error;
        db.foto_url=r.data&&r.data.foto_url||data;
        ensurePhotoControl(l);renderLeadershipPhotos();
      }catch(e){alert('Não foi possível salvar a foto: '+(e.message||e));}
      finally{btn.disabled=false;}
    };
  }

  function renderPins(){
    var layer=ensureLayer(); if(!layer)return;
    layer.clearLayers();
    var coordCounts={};
    members.forEach(function(m){
      if(!validCoord(m.lat,m.lng))return;
      var key=Number(m.lat).toFixed(6)+','+Number(m.lng).toFixed(6);
      coordCounts[key]=(coordCounts[key]||0)+1;
    });
    var coordIndex={};
    members.forEach(function(m){
      if(!validCoord(m.lat,m.lng))return;
      var fl=frontendForDbLeaderId(m.lideranca_id), db=dbLeaders.find(function(x){return String(x.id)===String(m.lideranca_id);});
      var color=leadershipColor(fl||db||{vereador_id:m.vereador_id,nome_lideranca:db&&db.nome_lideranca});
      var isLeader=m.tipo==='lider';
      var lat=Number(m.lat),lng=Number(m.lng);
      var ckey=lat.toFixed(6)+','+lng.toFixed(6), total=coordCounts[ckey]||1, idx=coordIndex[ckey]||0;
      coordIndex[ckey]=idx+1;
      var ox=0,oy=0;
      if(total>1){
        var angle=(Math.PI*2*idx/total)-Math.PI/2;
        var radiusPx=isLeader?20:19;
        ox=Math.round(Math.cos(angle)*radiusPx);
        oy=Math.round(Math.sin(angle)*radiusPx);
      }
      var pinClass=isLeader?'vf41-pin-leader':'vf41-pin-elector';
      var pinSymbol=isLeader?'L':'';
      var html='<div class="vf41-pin '+pinClass+'" style="--vf41-team:'+color+';--vf41-ox:'+ox+'px;--vf41-oy:'+oy+'px"><span class="vf41-pin-core">'+pinSymbol+'</span></div>';
      var icon=L.divIcon({
        className:'vf41-pin-wrap '+(isLeader?'vf41-leader-wrap':'vf41-elector-wrap'),
        html:html,
        iconSize:isLeader?[32,32]:[30,30],
        iconAnchor:isLeader?[16,16]:[15,15],
        popupAnchor:isLeader?[0,-20]:[0,-19]
      });
      var marker=L.marker([lat,lng],{icon:icon,zIndexOffset:isLeader?1000:850});
      var role=isLeader?'Líder':'Eleitor';
      marker.bindTooltip('<b>'+(isLeader?'◆ ':'● ')+esc(m.nome)+'</b><br><small>'+role+' • '+esc(m.bairro||'')+'</small>',{direction:'top',offset:isLeader?[0,-19]:[0,-18]});
      marker.bindPopup('<div class="popup-lideranca-card"><div class="popup-title">'+esc(m.nome)+'</div><div class="popup-detail-row"><strong>'+role+'</strong> • Equipe '+esc(db&&db.nome_lideranca||'Liderança')+'</div><div class="popup-detail-row">🏡 '+esc(m.bairro||'')+(m.logradouro?' • '+esc(m.logradouro):'')+(m.numero?', '+esc(m.numero):'')+'</div>'+(m.whatsapp?'<div class="popup-detail-row">📞 '+esc(m.whatsapp)+'</div>':'')+'</div>');
      layer.addLayer(marker);
    });
  }

  function syncUI(){
    var allLeaders=frontendLeaders();
    var totalL=members.filter(function(m){return m.tipo==='lider';}).length;
    var totalE=members.filter(function(m){return m.tipo==='eleitor';}).length;
    var t=document.querySelector('[data-vf28-adm-coords]');if(t)t.textContent=String(totalL);
    t=document.querySelector('[data-vf28-adm-electors]');if(t)t.textContent=String(totalE);
    document.querySelectorAll('.vf28-adm-card[data-vf28-lid]').forEach(function(card){
      var l=allLeaders.find(function(x){return String(x.id)===String(card.dataset.vf28Lid);});if(!l)return;
      var a=card.querySelector('[data-vf40-card-leaders]'),b=card.querySelector('[data-vf40-card-electors]');
      if(a)a.textContent=String(countFor(l,'lider'));if(b)b.textContent=String(countFor(l,'eleitor'));
    });
    syncDetail();
  }

  function syncDetail(){
    var d=document.querySelector('.vf28-adm-detail:not([hidden])');if(!d)return;
    var l=frontendLeaders().find(function(x){return String(x.id)===String(d.dataset.vf28Lid);});if(!l)return;
    var db=dbLeaderForFrontend(l);if(!db)return;
    var lm=members.filter(function(m){return String(m.lideranca_id)===String(db.id);});
    var leaders=lm.filter(function(m){return m.tipo==='lider';}), electors=lm.filter(function(m){return m.tipo==='eleitor';});
    var nums=d.querySelectorAll('.vf28-adm-detail-summary article b');if(nums[0])nums[0].textContent=leaders.length;if(nums[1])nums[1].textContent=electors.length;
    d.querySelectorAll('[data-vf28-member-tab]').forEach(function(btn){
      var b=btn.querySelector('b');if(b)b.textContent=btn.dataset.vf28MemberTab==='leaders'?leaders.length:electors.length;
    });
    var active=d.querySelector('[data-vf28-member-tab].active');
    var arr=active&&active.dataset.vf28MemberTab==='electors'?electors:leaders;
    var box=d.querySelector('[data-vf40-member-box]')||d.querySelector('.vf28-adm-member-empty')||d.querySelector('.vf40-member-list');if(!box)return;
    if(!arr.length){
      var isE=active&&active.dataset.vf28MemberTab==='electors';
      box.className='vf28-adm-member-empty';box.setAttribute('data-vf40-member-box','1');
      box.innerHTML='<div>'+(isE?'●':'◆')+'</div><strong>'+(isE?'Nenhum eleitor cadastrado':'Nenhum líder cadastrado')+'</strong><span>'+(isE?'Os eleitores vinculados a esta liderança aparecerão aqui.':'Os líderes vinculados a esta liderança aparecerão aqui.')+'</span>';
      return;
    }
    box.className='vf40-member-list';box.setAttribute('data-vf40-member-box','1');
    box.innerHTML=arr.map(function(m){
      return '<article class="vf40-member-row"><span class="vf40-member-symbol">'+(m.tipo==='lider'?'◆':'●')+'</span><div><strong>'+esc(m.nome)+'</strong><small>'+esc(m.bairro||'')+(m.logradouro?' • '+esc(m.logradouro):'')+(m.numero?', '+esc(m.numero):'')+'</small></div><button type="button" data-vf40-focus="'+esc(m.id)+'">Mapa</button></article>';
    }).join('');
    box.querySelectorAll('[data-vf40-focus]').forEach(function(btn){btn.onclick=function(){focusMember(btn.dataset.vf40Focus);};});
  }

  function focusMember(id){
    var m=members.find(function(x){return String(x.id)===String(id);});if(!m||!state.map)return;
    try{window.switchView('map');state.map.flyTo([Number(m.lat),Number(m.lng)],17,{duration:.7});}catch(_){}
  }

  function ensureModal(){
    var el=document.getElementById('vf40-member-modal');if(el)return el;
    el=document.createElement('div');el.id='vf40-member-modal';el.className='vf40-modal';
    el.innerHTML='<section class="vf40-sheet"><header><div><small id="vf40-form-kicker">Cadastro</small><h3 id="vf40-form-title">Novo membro</h3><p id="vf40-form-team"></p></div><button type="button" class="vf40-close">×</button></header><form id="vf40-member-form">'+
      '<label>Nome completo<input id="vf40-name" required maxlength="120"></label>'+
      '<label>WhatsApp<input id="vf40-whatsapp" inputmode="tel" placeholder="(43) 99999-9999"></label>'+
      '<div class="vf40-grid"><label>CEP<input id="vf40-cep" inputmode="numeric" maxlength="9" placeholder="00000-000"></label><button type="button" id="vf40-cep-btn" class="vf40-aux">Buscar CEP</button></div>'+
      '<label>Rua / Logradouro<input id="vf40-street" required></label>'+
      '<div class="vf40-grid two"><label>Número<input id="vf40-number" placeholder="S/N"></label><label>Bairro<input id="vf40-neighborhood" required></label></div>'+
      '<label>Observações<textarea id="vf40-notes" rows="2"></textarea></label>'+
      '<div class="vf40-location"><strong>Localização do alfinete</strong><span id="vf40-location-status">Informe o endereço e clique em Localizar endereço.</span><div class="vf40-location-actions"><button type="button" id="vf40-geocode">📍 Localizar endereço</button><button type="button" id="vf40-gps">◎ Localização atual</button><button type="button" id="vf40-map-pick">🗺 Ajustar no mapa</button></div><div class="vf40-coords"><span id="vf40-lat">Lat: —</span><span id="vf40-lng">Lng: —</span></div></div>'+
      '<footer><button type="button" class="vf40-cancel">Cancelar</button><button type="submit" id="vf40-save">Salvar cadastro</button></footer><div id="vf40-form-msg"></div>'+
      '</form></section>';
    document.body.appendChild(el);
    el.querySelector('.vf40-close').onclick=closeForm;el.querySelector('.vf40-cancel').onclick=closeForm;
    el.addEventListener('click',function(e){if(e.target===el)closeForm();});
    el.querySelector('#vf40-member-form').addEventListener('submit',saveForm);
    el.querySelector('#vf40-cep-btn').onclick=lookupCep;
    el.querySelector('#vf40-geocode').onclick=geocodeCurrentForm;
    el.querySelector('#vf40-gps').onclick=useGps;
    el.querySelector('#vf40-map-pick').onclick=startMapPick;
    return el;
  }

  function readForm(){
    var q=function(id){return document.getElementById(id).value.trim();};
    return {nome:q('vf40-name'),whatsapp:q('vf40-whatsapp'),cep:q('vf40-cep'),logradouro:q('vf40-street'),numero:q('vf40-number'),bairro:q('vf40-neighborhood'),observacoes:q('vf40-notes'),lat:activeForm&&activeForm.lat,lng:activeForm&&activeForm.lng};
  }
  function writeCoords(lat,lng,msg,ok){
    activeForm.lat=Number(lat);activeForm.lng=Number(lng);
    document.getElementById('vf40-lat').textContent='Lat: '+Number(lat).toFixed(6);
    document.getElementById('vf40-lng').textContent='Lng: '+Number(lng).toFixed(6);
    var s=document.getElementById('vf40-location-status');s.textContent=msg||'Localização definida.';s.className=ok===false?'bad':'ok';
  }

  function openForm(type,l){
    var db=dbLeaderForFrontend(l);
    if(!db){alert('Esta liderança ainda não está sincronizada com o banco. Atualize a tela e tente novamente.');loadData();return;}
    activeForm={type:type==='lider'?'lider':'eleitor',leadership:l,dbLeader:db,lat:null,lng:null};
    var m=ensureModal();m.classList.add('show');
    m.style.setProperty('--vf40-team',leadershipColor(l));
    document.getElementById('vf40-member-form').reset();
    document.getElementById('vf40-form-kicker').textContent=activeForm.type==='lider'?'Novo líder':'Novo eleitor';
    document.getElementById('vf40-form-title').textContent=activeForm.type==='lider'?'Cadastrar Líder':'Cadastrar Eleitor';
    document.getElementById('vf40-form-team').textContent='Equipe de '+(l.nome||'Liderança');
    document.getElementById('vf40-location-status').className='';
    document.getElementById('vf40-location-status').textContent='Informe o endereço e clique em Localizar endereço.';
    document.getElementById('vf40-lat').textContent='Lat: —';document.getElementById('vf40-lng').textContent='Lng: —';
    document.getElementById('vf40-form-msg').textContent='';
  }
  function closeForm(){var m=document.getElementById('vf40-member-modal');if(m)m.classList.remove('show');}

  async function lookupCep(){
    var cep=document.getElementById('vf40-cep').value.replace(/\D/g,'');if(cep.length!==8){setMsg('Informe um CEP válido com 8 dígitos.',true);return;}
    var b=document.getElementById('vf40-cep-btn');b.disabled=true;b.textContent='Buscando...';
    try{
      var r=await fetch('https://viacep.com.br/ws/'+cep+'/json/');var d=await r.json();if(d.erro)throw new Error('CEP não encontrado');
      if((d.localidade&&norm(d.localidade)!=='arapongas')||(d.uf&&String(d.uf).toUpperCase()!=='PR'))throw new Error('CEP fora de Arapongas/PR');
      if(d.logradouro)document.getElementById('vf40-street').value=d.logradouro;
      if(d.bairro)document.getElementById('vf40-neighborhood').value=d.bairro;
      await geocodeCurrentForm();
    }catch(e){setMsg('Não foi possível localizar o CEP. Preencha o endereço manualmente.',true);}
    finally{b.disabled=false;b.textContent='Buscar CEP';}
  }

  async function geocodeAddress(rua,numero,bairro){
    var viewbox='-51.49,-23.46,-51.37,-23.38';
    var tries=[];
    if(rua){
      tries.push({street:(numero?numero+' ':'')+rua,city:'Arapongas',state:'Paraná',countrycodes:'br',bounded:'1',viewbox:viewbox});
      tries.push({street:rua,city:'Arapongas',state:'Paraná',countrycodes:'br',bounded:'1',viewbox:viewbox});
    }
    tries.push({q:[rua,numero,bairro,'Arapongas','Paraná','Brasil'].filter(Boolean).join(', '),countrycodes:'br',bounded:'1',viewbox:viewbox});
    for(var i=0;i<tries.length;i++){
      var p=new URLSearchParams(Object.assign({format:'json',limit:'3',addressdetails:'1'},tries[i]));
      var r=await fetch('https://nominatim.openstreetmap.org/search?'+p.toString());var a=await r.json();
      var hit=(a||[]).find(function(x){return validCoord(parseFloat(x.lat),parseFloat(x.lon));});
      if(hit)return {lat:parseFloat(hit.lat),lng:parseFloat(hit.lon),display:hit.display_name};
    }
    return null;
  }
  async function geocodeCurrentForm(){
    var d=readForm();if(!d.logradouro&&!d.bairro){setMsg('Preencha rua ou bairro primeiro.',true);return;}
    var s=document.getElementById('vf40-location-status');s.className='';s.textContent='Localizando endereço em Arapongas...';
    try{var hit=await geocodeAddress(d.logradouro,d.numero,d.bairro);if(!hit){s.className='bad';s.textContent='Endereço não localizado. Use “Ajustar no mapa”.';return;}writeCoords(hit.lat,hit.lng,'Endereço localizado. Confira o ponto no mapa se necessário.',true);}
    catch(e){s.className='bad';s.textContent='Falha ao localizar endereço. Use “Ajustar no mapa”.';}
  }
  function useGps(){
    if(!navigator.geolocation){setMsg('Geolocalização não disponível neste aparelho.',true);return;}
    var s=document.getElementById('vf40-location-status');s.className='';s.textContent='Obtendo localização atual...';
    navigator.geolocation.getCurrentPosition(function(p){
      if(!validCoord(p.coords.latitude,p.coords.longitude)){s.className='bad';s.textContent='A localização atual está fora da área de Arapongas.';return;}
      writeCoords(p.coords.latitude,p.coords.longitude,'Localização atual definida.',true);
    },function(){s.className='bad';s.textContent='Não foi possível acessar a localização atual.';},{enableHighAccuracy:true,timeout:10000});
  }

  function startMapPick(){
    if(!activeForm||!state.map)return;
    pendingMapPick={form:readForm(),type:activeForm.type,leadership:activeForm.leadership,dbLeader:activeForm.dbLeader};
    closeForm();
    try{window.switchView('map');}catch(_){}
    var banner=document.getElementById('vf40-map-banner');
    if(!banner){banner=document.createElement('div');banner.id='vf40-map-banner';banner.className='vf40-map-banner';banner.innerHTML='<strong>Toque no ponto exato do mapa</strong><span>O alfinete será usado no cadastro.</span><button type="button">Cancelar</button>';document.body.appendChild(banner);banner.querySelector('button').onclick=cancelMapPick;}
    banner.classList.add('show');
    setTimeout(function(){try{state.map.invalidateSize();}catch(_){}},120);
    state.map.once('click',finishMapPick);
  }
  function cancelMapPick(){var b=document.getElementById('vf40-map-banner');if(b)b.classList.remove('show');pendingMapPick=null;}
  function finishMapPick(e){
    if(!pendingMapPick)return;
    if(!validCoord(e.latlng.lat,e.latlng.lng)){alert('Selecione um ponto dentro de Arapongas.');state.map.once('click',finishMapPick);return;}
    var p=pendingMapPick;pendingMapPick=null;var b=document.getElementById('vf40-map-banner');if(b)b.classList.remove('show');
    openForm(p.type,p.leadership);
    document.getElementById('vf40-name').value=p.form.nome;document.getElementById('vf40-whatsapp').value=p.form.whatsapp;document.getElementById('vf40-cep').value=p.form.cep;document.getElementById('vf40-street').value=p.form.logradouro;document.getElementById('vf40-number').value=p.form.numero;document.getElementById('vf40-neighborhood').value=p.form.bairro;document.getElementById('vf40-notes').value=p.form.observacoes;
    writeCoords(e.latlng.lat,e.latlng.lng,'Ponto definido manualmente no mapa.',true);
  }

  function setMsg(msg,bad){var e=document.getElementById('vf40-form-msg');if(!e)return;e.className=bad?'bad':'ok';e.textContent=msg;}
  async function saveForm(e){
    e.preventDefault();if(!activeForm)return;
    var d=readForm();if(!d.nome||!d.logradouro||!d.bairro){setMsg('Preencha nome, rua e bairro.',true);return;}
    if(!validCoord(d.lat,d.lng)){await geocodeCurrentForm();d=readForm();if(!validCoord(d.lat,d.lng)){setMsg('Defina a localização do alfinete antes de salvar.',true);return;}}
    var btn=document.getElementById('vf40-save');btn.disabled=true;btn.textContent='Salvando...';
    try{
      var u=await mod.currentUser();if(!u)throw new Error('Sessão expirada');
      var row={lideranca_id:activeForm.dbLeader.id,vereador_id:activeForm.dbLeader.vereador_id,cadastrado_por:u.id,tipo:activeForm.type,nome:d.nome,whatsapp:d.whatsapp||null,cep:d.cep||null,logradouro:d.logradouro,numero:d.numero||null,bairro:d.bairro,lat:Number(d.lat),lng:Number(d.lng),observacoes:d.observacoes||null};
      var r=await sb.from('lideranca_membros').insert(row).select('id').single();if(r.error)throw r.error;
      setMsg((activeForm.type==='lider'?'Líder':'Eleitor')+' cadastrado com sucesso.',false);
      await loadData();setTimeout(closeForm,450);
    }catch(err){console.error(err);setMsg('Não foi possível salvar: '+(err.message||err),true);}
    finally{btn.disabled=false;btn.textContent='Salvar cadastro';}
  }

  document.addEventListener('click',function(e){
    var tab=e.target.closest&&e.target.closest('[data-vf28-member-tab]');if(tab)setTimeout(syncUI,0);
    var mapNav=e.target.closest&&e.target.closest('[data-vf-nav="map"],#tab-btn-map,[data-view="map"]');
    if(mapNav)setTimeout(function(){renderPins();renderLeadershipPhotos();},180);
  },true);

  window.VFLeadershipMembers={
    openForm:openForm,
    onDetailOpened:function(l){setTimeout(function(){syncUI();ensurePhotoControl(l);},0);},
    refresh:loadData,
    renderPins:renderPins,
    renderLeadershipPhotos:renderLeadershipPhotos,
    syncUI:syncUI
  };

  function boot(){
    loadData();
    var tries=0,t=setInterval(function(){tries++;if(ensureLayer()){renderPins();renderLeadershipPhotos();clearInterval(t);}else if(tries>40)clearInterval(t);},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();