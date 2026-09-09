(async function(){
  'use strict';
  if(window.__vfAdminIntegratedV302)return;window.__vfAdminIntegratedV302=true;

  var mod;
  try{mod=await import('./auth-gate.js');}catch(_){return;}
  var user=await mod.currentUser();
  var role=user&&user.vfProfile?user.vfProfile.role:'';
  if(role!=='master'&&role!=='adm')return;

  var profile=user.vfProfile||{};
  var users=[],requests=[],audit=[],leaderCount=0,auditCount=0;
  var originalSwitch=null,home=null,installed=false;

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function icon(kind){
    var x={
      home:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/></svg>',
      users:'<svg viewBox="0 0 24 24"><path d="M15 20v-1.5a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4V20M8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6"/></svg>',
      key:'<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l3 3"/></svg>',
      audit:'<svg viewBox="0 0 24 24"><path d="M7 3h10v4H7zM5 5H3v16h18V5h-2M7 12h10M7 16h7"/></svg>'
    };return x[kind]||x.home;
  }
  function closeDrawer(){document.body.classList.remove('vf-drawer-open');}
  function roleLabel(){return role==='master'?'Master':'Administrador';}
  function firstName(){return String(profile.nome||user.email||'Administrador').trim().split(/\s+/)[0];}

  function setBrand(homeMode,label){
    var h=document.querySelector('.brand-info h1');var p=document.querySelector('.brand-info p');
    if(h)h.textContent='VOTO FORTE ARAPONGAS';
    if(p)p.textContent=homeMode?'Painel Administrativo':(label||'Sistema eleitoral');
  }

  function buildHome(workspace){
    if(document.getElementById('vf-admin-home'))return document.getElementById('vf-admin-home');
    var el=document.createElement('section');el.id='vf-admin-home';el.setAttribute('aria-label','Visão geral administrativa');
    el.innerHTML=''
      +'<div class="vf-admin-overview-head"><div class="copy"><div class="vf-admin-kicker">Gestão do sistema</div><h2>Olá, '+esc(firstName())+'</h2><p>Visão geral do VotoForte e acessos administrativos.</p></div><span class="vf-admin-role-chip">'+esc(roleLabel().toUpperCase())+'</span></div>'
      +'<div class="vf-admin-stats">'
        +'<div class="vf-admin-stat"><span>Usuários</span><strong id="vfAdmUsers">—</strong></div>'
        +'<div class="vf-admin-stat warn"><span>Senhas pendentes</span><strong id="vfAdmReq">—</strong></div>'
        +'<div class="vf-admin-stat ok"><span>Lideranças</span><strong id="vfAdmLeaders">—</strong></div>'
        +'<div class="vf-admin-stat"><span>Atividades</span><strong id="vfAdmAudit">—</strong></div>'
      +'</div>'
      +'<div class="vf-admin-section-title"><h3>Administração</h3><span>ADM / Master</span></div>'
      +'<div class="vf-admin-actions">'
        +'<button type="button" class="vf-admin-action primary" data-vf-admin-open="create"><span class="ico">👤＋</span><strong>Novo usuário</strong><small>Criar conta e liberar acesso.</small></button>'
        +'<button type="button" class="vf-admin-action" data-vf-admin-open="users"><span class="ico">👥</span><strong>Usuários</strong><small>Contas e redefinição de acesso.</small></button>'
        +'<button type="button" class="vf-admin-action alert" data-vf-admin-open="requests"><span class="ico">🔑</span><strong>Solicitações <b id="vfAdmReqBadge" class="vf-admin-badge">0</b></strong><small>Pedidos feitos no login.</small></button>'
        +'<button type="button" class="vf-admin-action" data-vf-admin-open="audit"><span class="ico">📋</span><strong>Auditoria</strong><small>Movimentações recentes.</small></button>'
      +'</div>'
      +'<div class="vf-admin-section-title"><h3>Solicitações recentes</h3><span id="vfAdmReqHint">Atualizado</span></div><div id="vfAdmRecentRequests" class="vf-admin-mini-card"><div class="vf-admin-empty">Carregando...</div></div>'
      +'<div class="vf-admin-section-title"><h3>Atividades recentes</h3><span>Auditoria</span></div><div id="vfAdmRecentAudit" class="vf-admin-mini-card"><div class="vf-admin-empty">Carregando...</div></div>';
    workspace.insertBefore(el,workspace.firstChild);return el;
  }

  function buildSheets(){
    if(document.getElementById('vfAdmCreateSheet'))return;
    var wrap=document.createElement('div');
    wrap.innerHTML=''
      +'<div class="vf-admin-sheet-overlay" id="vfAdmCreateSheet"><section class="vf-admin-sheet"><div class="vf-admin-sheet-head"><h3>Novo usuário</h3><button class="vf-admin-sheet-close" data-vf-sheet-close>×</button></div><form id="vfAdmCreateForm"><div class="vf-admin-field"><label>Nome</label><input id="vfAdmNome" required></div><div class="vf-admin-field"><label>E-mail</label><input id="vfAdmEmail" type="email" required></div><div class="vf-admin-field"><label>WhatsApp</label><input id="vfAdmWhatsapp" inputmode="tel"></div><div class="vf-admin-field"><label>Perfil</label><select id="vfAdmRole"><option value="vereador">Usuário / Vereador</option><option value="adm">Administrador</option></select></div><div class="vf-admin-field"><label>Senha temporária</label><input id="vfAdmPassword" type="password" minlength="8" required placeholder="Mínimo 8 caracteres"></div><button class="vf-admin-save" id="vfAdmCreateBtn">Criar e liberar acesso</button><div id="vfAdmCreateStatus" class="vf-admin-status"></div></form></section></div>'
      +'<div class="vf-admin-sheet-overlay" id="vfAdmUsersSheet"><section class="vf-admin-sheet"><div class="vf-admin-sheet-head"><h3>Usuários</h3><button class="vf-admin-sheet-close" data-vf-sheet-close>×</button></div><button class="vf-admin-toolbar-btn" data-vf-open-create>＋ Novo usuário</button><div id="vfAdmUsersList"></div></section></div>'
      +'<div class="vf-admin-sheet-overlay" id="vfAdmRequestsSheet"><section class="vf-admin-sheet"><div class="vf-admin-sheet-head"><h3>Solicitações de senha</h3><button class="vf-admin-sheet-close" data-vf-sheet-close>×</button></div><div id="vfAdmRequestsList"></div></section></div>'
      +'<div class="vf-admin-sheet-overlay" id="vfAdmAuditSheet"><section class="vf-admin-sheet"><div class="vf-admin-sheet-head"><h3>Auditoria recente</h3><button class="vf-admin-sheet-close" data-vf-sheet-close>×</button></div><div id="vfAdmAuditList"></div></section></div>';
    while(wrap.firstChild)document.body.appendChild(wrap.firstChild);
    document.querySelectorAll('[data-vf-sheet-close]').forEach(function(b){b.addEventListener('click',function(){b.closest('.vf-admin-sheet-overlay').classList.remove('show');});});
    document.querySelectorAll('.vf-admin-sheet-overlay').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)o.classList.remove('show');});});
    var oc=document.querySelector('[data-vf-open-create]');if(oc)oc.addEventListener('click',function(){openSheet('create');});
    var form=document.getElementById('vfAdmCreateForm');if(form)form.addEventListener('submit',createUser);
  }

  function openSheet(which){
    closeDrawer();
    var ids={create:'vfAdmCreateSheet',users:'vfAdmUsersSheet',requests:'vfAdmRequestsSheet',audit:'vfAdmAuditSheet'};
    if(which==='users')renderUsers();if(which==='requests')renderRequests();if(which==='audit')renderAudit();
    var el=document.getElementById(ids[which]);if(el)el.classList.add('show');
  }

  async function createUser(e){
    e.preventDefault();var btn=document.getElementById('vfAdmCreateBtn'),st=document.getElementById('vfAdmCreateStatus');
    var pass=document.getElementById('vfAdmPassword').value;if(pass.length<8){st.textContent='A senha precisa ter pelo menos 8 caracteres.';return;}
    btn.disabled=true;btn.textContent='Criando...';st.className='vf-admin-status';st.textContent='';
    try{
      await mod.adminAction('create_user',{nome:document.getElementById('vfAdmNome').value.trim(),email:document.getElementById('vfAdmEmail').value.trim(),whatsapp:document.getElementById('vfAdmWhatsapp').value.trim(),role:document.getElementById('vfAdmRole').value,password:pass,cargo:document.getElementById('vfAdmRole').value==='adm'?'Administrador':'Usuário'});
      st.className='vf-admin-status ok';st.textContent='Usuário criado e acesso liberado. A senha é temporária.';e.target.reset();await loadData();
    }catch(err){st.textContent='Erro: '+(err.message||err);}finally{btn.disabled=false;btn.textContent='Criar e liberar acesso';}
  }

  async function resetPassword(id,name){
    var p=prompt('Digite uma senha temporária para '+name+' (mínimo 8 caracteres):');if(!p)return;if(p.length<8){alert('A senha precisa ter pelo menos 8 caracteres.');return;}
    try{await mod.adminAction('reset_password',{user_id:id,password:p});alert('Senha temporária definida. O usuário deverá criar uma nova senha no próximo acesso.');await loadData();renderUsers();renderRequests();}catch(e){alert('Não foi possível redefinir: '+(e.message||e));}
  }

  function renderUsers(){
    var box=document.getElementById('vfAdmUsersList');if(!box)return;
    box.innerHTML=users.length?users.map(function(x){return '<div class="vf-admin-user-row"><div class="copy"><strong>'+esc(x.nome||x.email)+'</strong><span>'+esc(x.email)+' • '+esc(x.role||'usuário')+(x.troca_senha_obrigatoria?' • troca obrigatória':'')+'</span></div><button class="vf-admin-row-btn" data-reset-user="'+esc(x.id)+'" data-name="'+esc(x.nome||x.email)+'">Nova senha</button></div>';}).join(''):'<div class="vf-admin-empty">Nenhum usuário encontrado.</div>';
    box.querySelectorAll('[data-reset-user]').forEach(function(b){b.onclick=function(){resetPassword(b.dataset.resetUser,b.dataset.name);};});
  }
  function renderRequests(){
    var box=document.getElementById('vfAdmRequestsList');if(!box)return;
    box.innerHTML=requests.length?requests.map(function(x){var p=x.perfis_usuarios||{};var n=p.nome||x.email;return '<div class="vf-admin-request-row"><div class="copy"><strong>'+esc(n)+'</strong><span>'+esc(x.email)+' • '+new Date(x.solicitado_em).toLocaleString('pt-BR')+'</span></div><button class="vf-admin-row-btn" data-reset-req="'+esc(x.user_id)+'" data-name="'+esc(n)+'">Redefinir</button></div>';}).join(''):'<div class="vf-admin-empty">Nenhuma solicitação pendente.</div>';
    box.querySelectorAll('[data-reset-req]').forEach(function(b){b.onclick=function(){resetPassword(b.dataset.resetReq,b.dataset.name);};});
  }
  function renderAudit(){
    var box=document.getElementById('vfAdmAuditList');if(!box)return;
    box.innerHTML=audit.length?audit.map(function(a){return '<div class="vf-admin-mini-row"><strong>'+esc(a.acao||a.tipo||'Atividade')+'</strong><span>'+new Date(a.criado_em).toLocaleString('pt-BR')+(a.detalhes?' • '+esc(a.detalhes):'')+'</span></div>';}).join(''):'<div class="vf-admin-empty">Nenhuma atividade disponível.</div>';
  }
  function renderHomeData(){
    var set=function(id,v){var e=document.getElementById(id);if(e)e.textContent=String(v);};
    set('vfAdmUsers',users.length);set('vfAdmReq',requests.length);set('vfAdmLeaders',leaderCount);set('vfAdmAudit',auditCount);set('vfAdmReqBadge',requests.length);
    var r=document.getElementById('vfAdmRecentRequests');if(r)r.innerHTML=requests.length?requests.slice(0,2).map(function(x){var p=x.perfis_usuarios||{};return '<div class="vf-admin-mini-row"><strong>'+esc(p.nome||x.email)+'</strong><span>'+new Date(x.solicitado_em).toLocaleString('pt-BR')+' • aguardando redefinição</span></div>';}).join(''):'<div class="vf-admin-empty">Nenhuma solicitação pendente.</div>';
    var a=document.getElementById('vfAdmRecentAudit');if(a)a.innerHTML=audit.length?audit.slice(0,3).map(function(x){return '<div class="vf-admin-mini-row"><strong>'+esc(x.acao||x.tipo||'Atividade')+'</strong><span>'+new Date(x.criado_em).toLocaleString('pt-BR')+(x.detalhes?' • '+esc(x.detalhes):'')+'</span></div>';}).join(''):'<div class="vf-admin-empty">Nenhuma atividade disponível.</div>';
    renderUsers();renderRequests();renderAudit();syncBadges();
  }

  async function loadData(){
    try{
      var c=await mod.client();
      var res=await Promise.all([
        mod.adminAction('list_users'),mod.adminAction('list_requests'),
        c.from('liderancas').select('id',{count:'exact',head:true}),
        c.from('audit_logs').select('id',{count:'exact',head:true}),
        c.from('audit_logs').select('tipo,acao,detalhes,criado_em').order('criado_em',{ascending:false}).limit(8)
      ]);
      users=res[0].users||[];requests=res[1].requests||[];leaderCount=res[2].count||0;auditCount=res[3].count||0;audit=(res[4].data||[]);
    }catch(e){console.warn('Painel ADM:',e);}
    renderHomeData();
  }

  function syncBadges(){
    document.querySelectorAll('[data-vf-admin-nav="requests"] .vf-admin-nav-count').forEach(function(e){e.textContent=requests.length;});
  }

  function buildAdminNav(drawer){
    drawer.querySelectorAll('.vf-admin-panel-entry').forEach(function(n){n.remove();});
    var existing=drawer.querySelectorAll('.vf-admin-nav-section');for(var i=1;i<existing.length;i++)existing[i].remove();
    var nav=drawer.querySelector('.vf-drawer-navigation');if(!nav)return false;
    var opLabel=nav.querySelector('.vf-drawer-label');if(opLabel)opLabel.textContent='Operação';
    var scroll=drawer.querySelector('.vf-drawer-scroll');if(!scroll)return false;
    var sec=drawer.querySelector('.vf-admin-nav-section');
    if(!sec){
      sec=document.createElement('section');sec.className='vf-drawer-section vf-admin-nav-section';
      sec.innerHTML='<div class="vf-drawer-label">Administração</div><div class="vf-admin-nav-grid">'
        +'<button type="button" data-vf-admin-nav="home">'+icon('home')+'<span>Visão Geral</span></button>'
        +'<button type="button" data-vf-admin-nav="users">'+icon('users')+'<span>Usuários</span></button>'
        +'<button type="button" data-vf-admin-nav="requests">'+icon('key')+'<span>Solicitações <b class="vf-admin-nav-count">0</b></span></button>'
        +'<button type="button" data-vf-admin-nav="audit">'+icon('audit')+'<span>Auditoria</span></button>'
        +'</div>';
      scroll.insertBefore(sec,nav);
      sec.querySelectorAll('[data-vf-admin-nav]').forEach(function(b){b.addEventListener('click',function(){var a=b.dataset.vfAdminNav;if(a==='home')showHome();else openSheet(a);markAdminActive(a);closeDrawer();});});
    }
    var acct=drawer.querySelector('.vf-drawer-account-copy');if(acct){var st=acct.querySelector('strong'),sp=acct.querySelector('span');if(st)st.textContent=profile.nome||user.email||'Administrador';if(sp)sp.textContent=roleLabel();}
    var security=drawer.querySelector('.vf-drawer-security');if(security&&security.parentElement){var lab=security.parentElement.querySelector('.vf-drawer-label');if(lab)lab.textContent='Conta';}
    nav.querySelectorAll('button[data-vf-nav]').forEach(function(b){if(b.dataset.vfAdminBound)return;b.dataset.vfAdminBound='1';b.addEventListener('click',function(){hideHome();markAdminActive('');setBrand(false,labelForView(b.dataset.vfNav));},true);});
    syncBadges();return true;
  }

  function markAdminActive(which){document.querySelectorAll('[data-vf-admin-nav]').forEach(function(b){b.classList.toggle('active',b.dataset.vfAdminNav===which);});}
  function labelForView(v){return {map:'Mapa eleitoral',colegios:'Colégios eleitorais',liderancas:'Lideranças',distritos:'Distritos',users:'Meu perfil',audit:'Auditoria'}[v]||'Sistema eleitoral';}
  function hideHome(){document.body.classList.remove('vf-admin-home-active');markAdminActive('');}
  function showHome(){
    if(!home)return;document.body.classList.add('vf-admin-home-active');document.body.dataset.vfView='admin';markAdminActive('home');closeDrawer();setBrand(true);loadData();
  }

  function hookSwitch(){
    if(originalSwitch||typeof window.switchView!=='function')return;
    originalSwitch=window.switchView;
    window.switchView=function(view){hideHome();setBrand(false,labelForView(view));var r=originalSwitch.apply(this,arguments);return r;};
  }

  function bindHomeActions(){
    if(!home||home.dataset.bound)return;home.dataset.bound='1';
    home.querySelectorAll('[data-vf-admin-open]').forEach(function(b){b.addEventListener('click',function(){openSheet(b.dataset.vfAdminOpen);});});
  }

  function install(){
    if(installed)return;
    var body=document.body,workspace=document.querySelector('.workspace-main'),drawer=document.querySelector('.vf-mobile-drawer');
    if(!body||!body.classList.contains('vf-mobile')||!workspace||!drawer||!drawer.querySelector('.vf-drawer-navigation'))return;
    installed=true;body.classList.add('vf-admin-role');
    home=buildHome(workspace);buildSheets();bindHomeActions();buildAdminNav(drawer);hookSwitch();
    setBrand(true);showHome();
    setTimeout(function(){buildAdminNav(drawer);hookSwitch();if(document.body.classList.contains('vf-admin-home-active'))setBrand(true);},500);
  }

  var tries=0;var timer=setInterval(function(){tries++;install();if(installed||tries>60)clearInterval(timer);},100);
})();
