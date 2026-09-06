(function(){
  'use strict';
  if(window.__vfMobileDistrictsV24)return;window.__vfMobileDistrictsV24=true;

  var view=null,cards=null,dashboard=null,summary=null,filterTrigger=null,sheet=null,backdrop=null,selected='ALL',openCard=null;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function fmt(n){try{return Number(n||0).toLocaleString('pt-BR');}catch(_){return String(n||0);}}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function initials(name){var p=String(name||'').trim().split(/\s+/).filter(Boolean);return ((p[0]||'C')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();}
  function candInfo(key){try{return key==='ALL'?null:(ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key])||null;}catch(_){return null;}}
  function totalCandidate(key){
    if(key==='ALL')return 0;
    try{
      if(window.__vfTseFullDataV19&&window.__vfTseFullDataV19.totals&&Object.prototype.hasOwnProperty.call(window.__vfTseFullDataV19.totals,key))return Number(window.__vfTseFullDataV19.totals[key])||0;
    }catch(_){ }
    var c=candInfo(key),m=String(c&&c.category||'').match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:votos?|v\b)/i);
    return m?Number(m[1].replace(/\./g,''))||0:0;
  }
  function data(){
    var lids=[],assignments={};
    try{lids=window.SupabaseService.getAllLiderancasRaw()||[];}catch(_){ }
    try{assignments=window.SupabaseService.getDistrictAssignments()||{};}catch(_){ }
    return {lids:lids,assignments:assignments};
  }
  function distLids(dist,lids){
    return lids.filter(function(l){
      var matchColegio=dist.colegiosIds.indexOf(l.colegioId)!==-1;
      var bairro=String(l.bairro||'').toLowerCase();
      var matchBairro=dist.bairros.some(function(b){return bairro.indexOf(String(b).toLowerCase())!==-1;});
      return matchColegio||matchBairro;
    });
  }
  function coveredColleges(dist,lids){
    var seen={};
    distLids(dist,lids).forEach(function(l){if(l.colegioId&&dist.colegiosIds.indexOf(l.colegioId)!==-1)seen[l.colegioId]=1;});
    return Object.keys(seen).length;
  }
  function districtVotes(dist,key){
    if(key==='ALL')return 0;
    try{
      return ELEICAO_2024_DATA.locais.filter(function(l){return dist.colegiosIds.indexOf(l.id)!==-1;}).reduce(function(sum,l){return sum+Number(l.votes&&l.votes[key]||0);},0);
    }catch(_){return 0;}
  }
  function colleges(dist,key){
    var out=[];
    try{
      ELEICAO_2024_DATA.locais.forEach(function(l){if(dist.colegiosIds.indexOf(l.id)!==-1)out.push({id:l.id,name:l.name,address:l.address,votes:key==='ALL'?0:Number(l.votes&&l.votes[key]||0)});});
    }catch(_){ }
    if(key!=='ALL')out.sort(function(a,b){return b.votes-a.votes;});
    return out;
  }
  function coverage(dist,lids){
    var count=coveredColleges(dist,lids),total=dist.colegiosIds.length;
    if(count===0)return {cls:'empty',text:'Descoberto',dot:'🔴',count:count,total:total};
    var ratio=count/Math.max(1,total);
    if(ratio>=.66)return {cls:'strong',text:'Cobertura forte',dot:'🟢',count:count,total:total};
    return {cls:'medium',text:'Cobertura média',dot:'🟡',count:count,total:total};
  }
  function groups(){
    var all=[];
    try{all=Array.prototype.slice.call(document.getElementById('cand-select').options||[]);}catch(_){ }
    var out=[],seen={};
    all.forEach(function(o){
      var v=String(o.value||'');if(!v||seen[v])return;
      var label=o.parentElement&&o.parentElement.tagName==='OPTGROUP'?o.parentElement.label:'';
      if(/cadastrados\s+na\s+plataforma/i.test(label))return;
      if(v!=='ALL'){
        try{
          if(!ELEICAO_2024_DATA.candidates||!ELEICAO_2024_DATA.candidates[v])return;
          var has=ELEICAO_2024_DATA.locais.some(function(l){return l.votes&&Object.prototype.hasOwnProperty.call(l.votes,v);});
          if(!has)return;
        }catch(_){return;}
      }
      seen[v]=1;out.push({value:v,text:String(o.textContent||'').replace(/\s+/g,' ').trim(),group:label||'Outros'});
    });
    return out;
  }
  function ensureShell(){
    if(sheet)return;
    backdrop=document.createElement('button');backdrop.type='button';backdrop.className='vf24-sheet-backdrop';backdrop.setAttribute('aria-label','Fechar candidatos');
    sheet=document.createElement('section');sheet.className='vf24-sheet';sheet.innerHTML='<div class="vf24-sheet-head"><div><strong>Selecionar candidato</strong><span>Compare votos e cobertura por região</span></div><button type="button" class="vf24-sheet-close" aria-label="Fechar">×</button></div><div class="vf24-sheet-list"></div>';
    document.body.append(backdrop,sheet);
    backdrop.addEventListener('click',closeSheet);sheet.querySelector('.vf24-sheet-close').addEventListener('click',closeSheet);
  }
  function closeSheet(){document.body.classList.remove('vf24-sheet-open');}
  function openSheet(){ensureShell();buildSheet();document.body.classList.add('vf24-sheet-open');}
  function buildSheet(){
    var list=sheet.querySelector('.vf24-sheet-list');list.innerHTML='';var last='';
    groups().forEach(function(o){
      if(o.group!==last){var g=document.createElement('div');g.className='vf24-group-label';g.textContent=o.group;list.appendChild(g);last=o.group;}
      var b=document.createElement('button');b.type='button';b.className='vf24-option'+(o.value===selected?' selected':'');
      var c=candInfo(o.value),total=o.value==='ALL'?0:totalCandidate(o.value);
      b.innerHTML='<div><strong>'+esc(o.value==='ALL'?'Visão geral territorial':(c&&c.name)||o.text)+'</strong><span>'+esc(o.value==='ALL'?'Lideranças, metas e cobertura dos distritos':((c&&c.party)||''))+'</span></div><em>'+esc(o.value==='ALL'?'Todas as regiões':fmt(total)+' votos')+'</em>';
      b.addEventListener('click',function(){selected=o.value;closeSheet();renderAll();});list.appendChild(b);
    });
  }
  function ensure(){
    if(!isMobile())return false;
    view=document.getElementById('view-distritos-management');cards=document.getElementById('distritos-macro-cards');if(!view||!cards)return false;
    var legacy=cards.nextElementSibling;if(legacy)legacy.classList.add('vf24-legacy-table');
    dashboard=view.querySelector('.vf24-dashboard');
    if(!dashboard){
      dashboard=document.createElement('section');dashboard.className='vf24-dashboard';
      dashboard.innerHTML='<div class="vf24-summary"></div><div class="vf24-filter-card"><div class="vf24-filter-kicker"><span>Inteligência territorial</span><b>Toque para filtrar</b></div><button type="button" class="vf24-candidate-trigger"><span class="vf24-candidate-avatar">VF</span><span class="vf24-candidate-copy"><strong>Visão geral territorial</strong><span>Lideranças, metas e cobertura dos distritos</span></span></button></div>';
      cards.parentNode.insertBefore(dashboard,cards);filterTrigger=dashboard.querySelector('.vf24-candidate-trigger');filterTrigger.addEventListener('click',openSheet);
    }else filterTrigger=dashboard.querySelector('.vf24-candidate-trigger');
    ensureShell();return true;
  }
  function renderSummary(ds){
    summary=dashboard.querySelector('.vf24-summary');
    var totalL=ds.lids.length,totalMeta=ds.lids.reduce(function(s,l){return s+Number(l.metaVotos||0);},0),opps=0;
    try{ARAPONGAS_DISTRITOS_DATA.forEach(function(d){if(coveredColleges(d,ds.lids)===0)opps++;});}catch(_){ }
    summary.innerHTML='<div class="vf24-stat"><strong>'+fmt((window.ARAPONGAS_DISTRITOS_DATA||ARAPONGAS_DISTRITOS_DATA).length)+'</strong><span>Regiões</span></div><div class="vf24-stat"><strong>'+fmt(totalL)+'</strong><span>Lideranças</span></div><div class="vf24-stat"><strong>+'+fmt(totalMeta)+'</strong><span>Meta votos</span></div><div class="vf24-stat vf24-opportunity"><strong>'+fmt(opps)+'</strong><span>Oportunidades</span></div>';
  }
  function renderFilter(){
    var c=candInfo(selected),avatar=filterTrigger.querySelector('.vf24-candidate-avatar'),name=filterTrigger.querySelector('.vf24-candidate-copy strong'),meta=filterTrigger.querySelector('.vf24-candidate-copy span');
    if(selected==='ALL'||!c){avatar.textContent='VF';avatar.style.setProperty('--vf24-cand','#3b82f6');filterTrigger.style.setProperty('--vf24-cand','#3b82f6');name.textContent='Visão geral territorial';meta.textContent='Lideranças, metas e cobertura dos distritos';}
    else{avatar.textContent=initials(c.name);avatar.style.setProperty('--vf24-cand',c.color||'#3b82f6');filterTrigger.style.setProperty('--vf24-cand',c.color||'#3b82f6');name.textContent=c.name;meta.textContent=(c.party?c.party+' • ':'')+fmt(totalCandidate(selected))+' votos em Arapongas';}
  }
  function openLeader(dist){
    try{
      if(typeof openNewLiderancaWithColegio==='function'&&dist.colegiosIds&&dist.colegiosIds[0]){openNewLiderancaWithColegio(dist.colegiosIds[0]);return;}
      if(typeof openModalNewLideranca==='function')openModalNewLideranca();
    }catch(_){ }
  }
  function focusDistrict(dist){
    try{
      if(!state||!state.map)return;
      window.switchView('map');
      var pts=ELEICAO_2024_DATA.locais.filter(function(l){return dist.colegiosIds.indexOf(l.id)!==-1;}).map(function(l){return [l.lat,l.lng];});
      if(pts.length&&window.L){state.map.fitBounds(L.latLngBounds(pts),{padding:[28,28],maxZoom:14});}
      else if(typeof window.focusDistrictInMap==='function')window.focusDistrictInMap(dist.id);
    }catch(_){if(typeof window.focusDistrictInMap==='function')window.focusDistrictInMap(dist.id);}
  }
  function renderCards(ds){
    cards.innerHTML='';
    ARAPONGAS_DISTRITOS_DATA.forEach(function(dist){
      var lids=distLids(dist,ds.lids),metaVotes=lids.reduce(function(s,l){return s+Number(l.metaVotos||0);},0),cov=coverage(dist,ds.lids),assign=ds.assignments[dist.id],assignedName=assign&&assign.vereadorNome?assign.vereadorNome:'Região livre',votes=districtVotes(dist,selected),total=totalCandidate(selected),pct=selected==='ALL'||!total?0:(votes/total*100),cols=colleges(dist,selected),id='vf24-'+dist.id;
      var card=document.createElement('article');card.className='vf24-card'+(openCard===dist.id?' open':'');card.id=id;card.style.setProperty('--vf24-color',dist.cor||'#3b82f6');
      card.innerHTML='<button type="button" class="vf24-card-main"><div class="vf24-card-head"><span class="vf24-card-icon">'+esc(dist.icone)+'</span><span class="vf24-card-title"><strong>'+esc(dist.nome)+'</strong><span>'+esc(dist.descricao)+'</span></span><span class="vf24-college-badge">'+dist.colegiosIds.length+' colégios</span></div><div class="vf24-card-metrics"><span class="vf24-metric"><strong>'+lids.length+'</strong><span>Lideranças</span></span><span class="vf24-metric '+(selected==='ALL'?'meta':'votes')+'"><strong>'+esc(selected==='ALL'?('+'+fmt(metaVotes)):fmt(votes))+'</strong><span>'+(selected==='ALL'?'Meta de votos':'Votos do candidato')+'</span></span><span class="vf24-metric"><strong>'+esc(selected==='ALL'?(cov.count+'/'+cov.total):(pct.toFixed(1).replace('.',',')+'%'))+'</strong><span>'+(selected==='ALL'?'Colégios cobertos':'Do total do candidato')+'</span></span></div><div class="vf24-status-row"><span class="vf24-status '+cov.cls+'">'+cov.dot+' '+cov.text+'</span><span class="vf24-assigned">'+esc(assign?'👤 '+assignedName:'🟢 '+assignedName)+'</span></div><span class="vf24-chevron">⌄</span></button><div class="vf24-detail"><div class="vf24-detail-block"><div class="vf24-detail-title">Colégios desta região'+(selected==='ALL'?'':' • votos do candidato')+'</div><div class="vf24-college-list"></div><div class="vf24-neighborhoods"></div><div class="vf24-assign-wrap"></div><div class="vf24-actions"><button type="button" class="vf24-action vf24-map-action">🗺️ Ver região no mapa</button><button type="button" class="vf24-action vf24-leader-action">+ Liderança</button></div></div></div>';
      card.querySelector('.vf24-card-main').addEventListener('click',function(){openCard=openCard===dist.id?null:dist.id;renderCards(ds);});
      var list=card.querySelector('.vf24-college-list');cols.forEach(function(c){var r=document.createElement('div');r.className='vf24-college-row';r.innerHTML='<div><strong>'+esc(c.name)+'</strong><span>'+esc(c.address||'')+'</span></div>'+(selected==='ALL'?'':'<span class="vf24-college-votes">'+fmt(c.votes)+' votos</span>');list.appendChild(r);});
      var n=card.querySelector('.vf24-neighborhoods');dist.bairros.forEach(function(b){var s=document.createElement('span');s.textContent=b;n.appendChild(s);});
      var aw=card.querySelector('.vf24-assign-wrap');
      try{
        var isMaster=state.currentUser&&state.currentUser.role==='master';
        if(isMaster){
          var users=window.SupabaseService.getAllUsersRaw().filter(function(u){return u.role==='vereador';});var sel=document.createElement('select');sel.className='vf24-assign-select';sel.innerHTML='<option value="">Livre / Toda coligação</option>'+users.map(function(u){return '<option value="'+esc(u.id)+'"'+(assign&&assign.vereadorId===u.id?' selected':'')+'>'+esc(u.nome)+' ('+esc(u.partido||'')+')</option>';}).join('');var lab=document.createElement('label');lab.textContent='Vereador responsável';aw.append(lab,sel);sel.addEventListener('change',function(){window.handleAssignDistrict(dist.id,sel);setTimeout(renderAll,50);});
        }else{aw.innerHTML='<label>Responsável pelo reduto</label><div class="vf24-assigned" style="text-align:left;font-size:8px">'+esc(assignedName)+'</div>';}
      }catch(_){ }
      card.querySelector('.vf24-map-action').addEventListener('click',function(e){e.stopPropagation();focusDistrict(dist);});
      card.querySelector('.vf24-leader-action').addEventListener('click',function(e){e.stopPropagation();openLeader(dist);});
      cards.appendChild(card);
    });
  }
  function renderAll(){if(!ensure())return;var ds=data();renderSummary(ds);renderFilter();renderCards(ds);}
  function install(){if(!isMobile())return;if(!ensure()){setTimeout(install,150);return;}renderAll();
    var orig=window.renderDistritosView;if(typeof orig==='function'&&!orig.__vf24){var wrapped=function(){var out=orig.apply(this,arguments);setTimeout(renderAll,0);return out;};wrapped.__vf24=true;window.renderDistritosView=wrapped;}
  }
  window.VFDistrictsV24={render:renderAll,getSelected:function(){return selected;},setSelected:function(v){selected=String(v||'ALL');renderAll();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,900)},{once:true});else setTimeout(install,900);
  setTimeout(install,1600);setTimeout(install,2600);
})();
