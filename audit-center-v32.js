(async function(){
  'use strict';
  if(window.__vfAuditCenterV32)return;window.__vfAuditCenterV32=true;

  var mod;
  try{mod=await import('./auth-gate.js');}catch(e){console.warn('Auditoria v32:',e);return;}
  var session=await mod.currentUser();
  var role=session&&session.vfProfile?String(session.vfProfile.role||''):'';
  if(role!=='master'&&role!=='adm')return;

  var overlay=null,allLogs=[],profiles={},remoteCount=0,loading=false;
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function norm(v){try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return String(v||'').toLowerCase();}}
  function person(id){var p=profiles[String(id||'')];return p?(p.nome||p.email||'Usuário'):(id?'Usuário':'Sistema');}
  function personRole(id){var p=profiles[String(id||'')];return p&&p.role?p.role:'';}
  function when(v){try{return new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(_){return String(v||'');}}
  function icon(t){return {login:'↪',usuario:'👤',senha:'🔑',lideranca:'📍',sistema:'⚙',whatsapp:'💬'}[String(t||'').toLowerCase()]||'•';}
  function typeLabel(t){return {login:'Acesso',usuario:'Usuário',senha:'Senha',lideranca:'Liderança',sistema:'Sistema',whatsapp:'WhatsApp'}[String(t||'').toLowerCase()]||String(t||'Atividade');}
  function todayStart(){var d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function actorText(a){
    var userId=String(a.user_id||''),actorId=String(a.actor_user_id||''),targetId=String(a.target_user_id||'');
    if(a.dispositivo==='Tela de login'&&String(a.tipo)==='senha')return 'Solicitação para '+person(userId);
    var actor=actorId||userId,target=targetId||(actorId&&userId!==actorId?userId:'');
    if(target&&target!==actor)return person(actor)+' → '+person(target);
    return person(actor);
  }
  function involvesMaster(a){var ids=[a.user_id,a.actor_user_id,a.target_user_id].filter(Boolean);return ids.some(function(id){return personRole(id)==='master';});}

  function build(){
    if(overlay)return;
    overlay=document.createElement('div');overlay.className='vf32-audit-overlay';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<section class="vf32-audit-sheet" role="dialog" aria-modal="true" aria-label="Auditoria do sistema">'
      +'<header class="vf32-audit-head"><div><div class="vf32-audit-kicker">Segurança e rastreabilidade</div><h2>Auditoria do sistema</h2><p>'+(role==='master'?'Master visualiza todas as movimentações registradas.':'Histórico administrativo permitido para este perfil.')+'</p></div><button type="button" class="vf32-audit-close" aria-label="Fechar">×</button></header>'
      +'<div class="vf32-audit-stats"><article><span>Total registrado</span><strong data-vf32-total>—</strong></article><article><span>Hoje</span><strong data-vf32-today>—</strong></article><article><span>Usuários no histórico</span><strong data-vf32-people>—</strong></article><article><span>Última atividade</span><strong class="small" data-vf32-last>—</strong></article></div>'
      +'<div class="vf32-audit-tools"><label><span>Tipo</span><select data-vf32-type><option value="all">Todos</option><option value="login">Acesso</option><option value="usuario">Usuário</option><option value="senha">Senha</option><option value="lideranca">Liderança</option><option value="sistema">Sistema</option><option value="whatsapp">WhatsApp</option></select></label><label><span>Usuário</span><select data-vf32-user><option value="all">Todos os usuários</option></select></label><label><span>Período</span><select data-vf32-period><option value="all">Todo o histórico</option><option value="1">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select></label><label class="vf32-audit-search"><span>Buscar</span><input type="search" data-vf32-search placeholder="Ação, nome ou detalhe"></label><button type="button" class="vf32-audit-refresh">↻ Atualizar</button></div>'
      +'<div class="vf32-audit-meta"><span data-vf32-result>Carregando...</span><span class="vf32-audit-scope">'+(role==='master'?'MASTER • VISÃO GLOBAL':'ADMINISTRADOR')+'</span></div>'
      +'<div class="vf32-audit-list"><div class="vf32-audit-empty">Carregando histórico...</div></div>'
      +'</section>';
    document.body.appendChild(overlay);
    overlay.querySelector('.vf32-audit-close').addEventListener('click',close);
    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    overlay.querySelector('.vf32-audit-refresh').addEventListener('click',load);
    overlay.querySelectorAll('select,input').forEach(function(x){x.addEventListener(x.tagName==='INPUT'?'input':'change',render);});
  }

  function populateUsers(){
    var sel=overlay.querySelector('[data-vf32-user]'),current=sel.value||'all',used={};
    allLogs.forEach(function(a){[a.user_id,a.actor_user_id,a.target_user_id].filter(Boolean).forEach(function(id){used[String(id)]=1;});});
    var arr=Object.keys(used).map(function(id){return {id:id,name:person(id),role:personRole(id)};}).sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
    sel.innerHTML='<option value="all">Todos os usuários</option>'+arr.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.name)+(x.role?' • '+esc(x.role):'')+'</option>';}).join('');
    if(Array.from(sel.options).some(function(o){return o.value===current;}))sel.value=current;
  }

  function filtered(){
    var type=overlay.querySelector('[data-vf32-type]').value,userId=overlay.querySelector('[data-vf32-user]').value,period=overlay.querySelector('[data-vf32-period]').value,q=norm(overlay.querySelector('[data-vf32-search]').value),now=Date.now();
    return allLogs.filter(function(a){
      if(role==='adm'&&involvesMaster(a))return false;
      if(type!=='all'&&String(a.tipo)!==type)return false;
      if(userId!=='all'&&![a.user_id,a.actor_user_id,a.target_user_id].map(String).includes(userId))return false;
      if(period!=='all'){
        var t=new Date(a.criado_em).getTime();
        if(period==='1'){if(t<todayStart())return false;}else if(t<now-Number(period)*86400000)return false;
      }
      if(q){var hay=norm([a.acao,a.detalhes,a.tipo,a.dispositivo,actorText(a),person(a.user_id),person(a.actor_user_id),person(a.target_user_id)].join(' '));if(hay.indexOf(q)===-1)return false;}
      return true;
    });
  }

  function renderHomeRecent(){
    var home=document.getElementById('vfAdmRecentAudit');if(!home)return;
    var rows=allLogs.filter(function(a){return role!=='adm'||!involvesMaster(a);}).slice(0,3);
    home.innerHTML=rows.length?rows.map(function(a){return '<div class="vf-admin-mini-row"><strong>'+esc(a.acao||typeLabel(a.tipo))+'</strong><span>'+esc(actorText(a))+' • '+esc(when(a.criado_em))+(a.detalhes?' • '+esc(a.detalhes):'')+'</span></div>';}).join(''):'<div class="vf-admin-empty">Nenhuma atividade disponível.</div>';
    var n=document.getElementById('vfAdmAudit');if(n)n.textContent=String(remoteCount||allLogs.length);
  }

  function render(){
    if(!overlay)return;
    var rows=filtered(),list=overlay.querySelector('.vf32-audit-list');
    overlay.querySelector('[data-vf32-total]').textContent=String(remoteCount||allLogs.length);
    overlay.querySelector('[data-vf32-today]').textContent=String(allLogs.filter(function(a){return new Date(a.criado_em).getTime()>=todayStart()&&(role!=='adm'||!involvesMaster(a));}).length);
    var people={};allLogs.forEach(function(a){var id=a.actor_user_id||a.user_id;if(id&&(role!=='adm'||personRole(id)!=='master'))people[id]=1;});
    overlay.querySelector('[data-vf32-people]').textContent=String(Object.keys(people).length);
    overlay.querySelector('[data-vf32-last]').textContent=allLogs.length?when(allLogs[0].criado_em):'—';
    overlay.querySelector('[data-vf32-result]').textContent=rows.length+' atividade'+(rows.length===1?'':'s')+' exibida'+(rows.length===1?'':'s');
    if(!rows.length){list.innerHTML='<div class="vf32-audit-empty">Nenhuma atividade encontrada com esses filtros.</div>';return;}
    list.innerHTML=rows.map(function(a){
      var actor=a.actor_user_id||a.user_id,target=a.target_user_id||(a.actor_user_id&&a.user_id!==a.actor_user_id?a.user_id:null),who=actorText(a),detail=a.detalhes||'',device=a.dispositivo||'Dispositivo não informado';
      return '<article class="vf32-audit-row"><div class="vf32-audit-icon type-'+esc(a.tipo)+'">'+icon(a.tipo)+'</div><div class="vf32-audit-copy"><div class="vf32-audit-rowtop"><strong>'+esc(a.acao||typeLabel(a.tipo))+'</strong><span class="vf32-audit-type">'+esc(typeLabel(a.tipo))+'</span></div><div class="vf32-audit-who">'+esc(who)+'</div>'+(detail?'<div class="vf32-audit-detail">'+esc(detail)+'</div>':'')+'<div class="vf32-audit-foot"><span>'+esc(when(a.criado_em))+'</span><span>'+esc(device)+'</span>'+(target&&target!==actor?'<span>Alvo: '+esc(person(target))+'</span>':'')+'</div></div></article>';
    }).join('');
  }

  async function load(){
    if(loading)return;loading=true;build();
    var list=overlay.querySelector('.vf32-audit-list');list.innerHTML='<div class="vf32-audit-empty">Atualizando auditoria...</div>';
    try{
      var s=await mod.client();
      var results=await Promise.all([
        s.from('audit_logs').select('id,user_id,actor_user_id,target_user_id,tipo,acao,detalhes,dispositivo,criado_em',{count:'exact'}).order('criado_em',{ascending:false}).limit(250),
        s.from('perfis_usuarios').select('id,nome,email,role')
      ]);
      if(results[0].error)throw results[0].error;if(results[1].error)throw results[1].error;
      profiles={};(results[1].data||[]).forEach(function(p){profiles[String(p.id)]=p;});
      allLogs=results[0].data||[];remoteCount=Number(results[0].count||allLogs.length);
      populateUsers();render();renderHomeRecent();
    }catch(e){console.warn('Auditoria v32:',e);list.innerHTML='<div class="vf32-audit-empty error">Não foi possível carregar a auditoria. '+esc(e.message||e)+'</div>';}
    finally{loading=false;}
  }

  async function open(){
    build();
    document.querySelectorAll('.vf-admin-sheet-overlay.show').forEach(function(x){x.classList.remove('show');});
    document.body.classList.remove('vf-drawer-open');
    overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
    document.querySelectorAll('[data-vf-admin-nav="audit"]').forEach(function(b){b.classList.add('active');});
    await load();
  }
  function close(){if(!overlay)return;overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');}

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('[data-vf-admin-nav="audit"],[data-vf-admin-open="audit"],#tab-btn-audit,[data-vf-nav="audit"]'):null;
    if(!t)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open();
  },true);

  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay&&overlay.classList.contains('show'))close();});
  setTimeout(function(){load();},1200);
  setInterval(function(){if(overlay&&overlay.classList.contains('show'))load();},30000);
  window.VFAuditCenterV32={open:open,refresh:load};
})();
