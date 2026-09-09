(function(){
  'use strict';
  if(window.__vfDesktopLeadershipDistrictsV3117)return;
  window.__vfDesktopLeadershipDistrictsV3117=true;

  var style=document.createElement('style');
  style.id='vf-desktop-leadership-districts-v31-17';
  style.textContent=`
  @media (min-width:901px){
    /* ======================================================
       LIDERANCAS - desktop compacto e com acoes proporcionais
       ====================================================== */
    body.vf-desktop-mobile-mirror #view-table-liderancas.vf28-leadership-ready{
      padding:20px 28px 38px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-shell{
      width:min(100%,1240px)!important;
      margin:0 auto!important;
      gap:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-head h2{
      font-size:27px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-head p{
      margin-top:5px!important;
      font-size:13px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-stat{
      min-height:70px!important;
      padding:12px 16px!important;
      border-radius:15px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-stat span{
      font-size:9px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-stat strong{
      margin-top:7px!important;
      font-size:24px!important;
    }

    body.vf-desktop-mobile-mirror .vf28-leadership-tools{
      display:grid!important;
      grid-template-columns:minmax(300px,1fr) minmax(190px,240px) auto!important;
      align-items:center!important;
      padding:12px!important;
      gap:10px!important;
      border-radius:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-search input,
    body.vf-desktop-mobile-mirror .vf28-leadership-tools select{
      height:44px!important;
      border-radius:11px!important;
      font-size:13px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-search svg{
      width:18px!important;
      height:18px!important;
      left:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-search input{
      padding-left:42px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-tools > .vf28-leadership-actions{
      display:flex!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:8px!important;
      width:auto!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-tools > .vf28-leadership-actions button{
      width:auto!important;
      min-width:118px!important;
      min-height:42px!important;
      padding:0 16px!important;
      border-radius:11px!important;
      font-size:11px!important;
      white-space:nowrap!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-tools > .vf28-leadership-actions .vf28-new{
      min-width:145px!important;
    }

    body.vf-desktop-mobile-mirror .vf28-leadership-list{
      grid-template-columns:1fr!important;
      gap:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-card{
      min-height:0!important;
      padding:14px 15px!important;
      border-radius:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-top{
      grid-template-columns:52px minmax(0,1fr) auto!important;
      gap:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-avatar{
      width:52px!important;
      height:52px!important;
      border-radius:14px!important;
      font-size:15px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-copy strong{
      font-size:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-copy span{
      margin-top:3px!important;
      font-size:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-category{
      max-width:160px!important;
      padding:6px 9px!important;
      font-size:8px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-info{
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:8px!important;
      margin-top:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-info{
      min-height:50px!important;
      padding:9px 11px!important;
      border-radius:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-info small{
      font-size:7.5px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-info b{
      margin-top:4px!important;
      font-size:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-actions{
      display:flex!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:7px!important;
      margin-top:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-actions button{
      width:auto!important;
      min-width:118px!important;
      min-height:38px!important;
      padding:0 13px!important;
      border-radius:10px!important;
      font-size:9.5px!important;
      white-space:nowrap!important;
    }
    body.vf-desktop-mobile-mirror .vf31-delete-leader{
      border:1px solid rgba(248,113,113,.38)!important;
      background:rgba(127,29,29,.22)!important;
      color:#fecaca!important;
    }
    body.vf-desktop-mobile-mirror .vf31-delete-leader:hover{
      border-color:rgba(248,113,113,.7)!important;
      background:rgba(153,27,27,.34)!important;
      color:#fff!important;
    }

    /* Confirmacao de exclusao */
    .vf31-delete-backdrop{
      position:fixed;z-index:5200;inset:0;
      display:grid;place-items:center;
      padding:24px;
      background:rgba(2,6,23,.72);
      backdrop-filter:blur(5px);
    }
    .vf31-delete-dialog{
      width:min(100%,460px);
      padding:22px;
      border:1px solid rgba(248,113,113,.24);
      border-radius:18px;
      background:linear-gradient(180deg,#132139,#0b1526);
      box-shadow:0 26px 70px rgba(0,0,0,.5);
    }
    .vf31-delete-dialog h3{margin:0;color:#fff;font-size:20px;line-height:1.2}
    .vf31-delete-dialog p{margin:9px 0 0;color:#9fb0c6;font-size:13px;line-height:1.5}
    .vf31-delete-name{
      margin-top:14px;padding:12px 13px;border-radius:11px;
      background:rgba(127,29,29,.14);border:1px solid rgba(248,113,113,.17);
      color:#fecaca;font-size:13px;font-weight:800;
    }
    .vf31-delete-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
    .vf31-delete-dialog-actions button{
      min-width:112px;min-height:42px;padding:0 16px;border-radius:11px;
      font-size:12px;font-weight:800;
    }
    .vf31-delete-cancel{border:1px solid rgba(148,163,184,.2);background:#17263b;color:#dbe7f6}
    .vf31-delete-confirm{border:1px solid rgba(248,113,113,.5);background:#991b1b;color:#fff}

    /* =====================================
       DISTRITOS - desktop compacto
       ===================================== */
    body.vf-desktop-mobile-mirror #view-distritos-management{
      padding:20px 28px 38px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child,
    body.vf-desktop-mobile-mirror .vf24-dashboard,
    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      width:min(100%,1240px)!important;
      margin-left:auto!important;
      margin-right:auto!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child{
      margin-bottom:11px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child h2,
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child strong{
      font-size:25px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child p,
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child span{
      font-size:11.5px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child .btn-primary{
      width:auto!important;
      min-width:170px!important;
      min-height:42px!important;
      padding:0 15px!important;
      border-radius:11px!important;
      font-size:10.5px!important;
    }

    body.vf-desktop-mobile-mirror .vf24-summary{
      grid-template-columns:repeat(4,minmax(130px,180px))!important;
      justify-content:flex-start!important;
      gap:8px!important;
      margin-bottom:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-stat{
      min-height:60px!important;
      padding:10px 9px!important;
      border-radius:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-stat strong{font-size:19px!important}
    body.vf-desktop-mobile-mirror .vf24-stat span{margin-top:4px!important;font-size:8px!important}

    body.vf-desktop-mobile-mirror .vf24-filter-card{
      padding:11px!important;
      border-radius:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-filter-kicker{
      margin-bottom:6px!important;
      font-size:8px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger{
      min-height:62px!important;
      padding:9px 46px 9px 12px!important;
      gap:11px!important;
      border-radius:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger:after{
      right:16px!important;
      font-size:25px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-avatar{
      flex-basis:43px!important;
      width:43px!important;height:43px!important;
      border-radius:12px!important;
      font-size:13px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-copy strong{font-size:14px!important}
    body.vf-desktop-mobile-mirror .vf24-candidate-copy span{margin-top:3px!important;font-size:9px!important}

    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      gap:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card{
      border-top-width:3px!important;
      border-radius:15px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      display:grid!important;
      grid-template-columns:minmax(300px,.9fr) minmax(500px,1.1fr)!important;
      grid-template-areas:
        'head metrics'
        'status status'
        'chev chev'!important;
      align-items:center!important;
      column-gap:18px!important;
      row-gap:8px!important;
      padding:13px 15px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-head{
      grid-area:head!important;
      grid-template-columns:44px minmax(0,1fr) auto!important;
      gap:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-icon{
      width:44px!important;height:44px!important;
      border-radius:12px!important;
      font-size:20px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title strong{
      font-size:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title span{
      margin-top:3px!important;
      font-size:8.5px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-college-badge{
      padding:5px 7px!important;
      border-radius:8px!important;
      font-size:8px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-metrics{
      grid-area:metrics!important;
      grid-template-columns:repeat(3,minmax(120px,1fr))!important;
      gap:7px!important;
      margin-top:0!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric{
      min-height:50px!important;
      padding:8px 9px!important;
      border-radius:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric strong{font-size:13px!important}
    body.vf-desktop-mobile-mirror .vf24-metric span{margin-top:3px!important;font-size:7.5px!important}
    body.vf-desktop-mobile-mirror .vf24-status-row{
      grid-area:status!important;
      margin-top:0!important;
    }
    body.vf-desktop-mobile-mirror .vf24-status{
      padding:5px 8px!important;
      font-size:8px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-assigned{font-size:8px!important}
    body.vf-desktop-mobile-mirror .vf24-chevron{
      grid-area:chev!important;
      margin-top:0!important;
      font-size:11px!important;
      line-height:1!important;
    }
    body.vf-desktop-mobile-mirror .vf24-detail{
      padding:0 15px 15px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-detail-block{
      padding:12px!important;
      border-radius:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-actions{
      display:flex!important;
      justify-content:flex-end!important;
      gap:7px!important;
      margin-top:9px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-action{
      width:auto!important;
      min-width:145px!important;
      min-height:38px!important;
      padding:0 12px!important;
      border-radius:9px!important;
      font-size:8.5px!important;
    }
  }

  @media (min-width:901px) and (max-width:1080px){
    body.vf-desktop-mobile-mirror .vf28-leadership-tools{
      grid-template-columns:minmax(260px,1fr) 190px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-tools > .vf28-leadership-actions{
      grid-column:1/-1!important;
      justify-content:flex-start!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-info{
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      grid-template-columns:1fr!important;
      grid-template-areas:'head' 'metrics' 'status' 'chev'!important;
    }
  }
  `;
  document.head.appendChild(style);

  function currentUser(){
    try{if(typeof state!=='undefined'&&state&&state.currentUser)return state.currentUser;}catch(_){ }
    try{if(window.SupabaseService&&typeof window.SupabaseService.getCurrentUser==='function')return window.SupabaseService.getCurrentUser();}catch(_){ }
    return null;
  }
  function allLeaders(){
    try{if(typeof state!=='undefined'&&state&&Array.isArray(state.liderancas))return state.liderancas;}catch(_){ }
    try{return window.SupabaseService.getAllLiderancasRaw()||[];}catch(_){return [];}
  }
  function normalize(s){return String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase();}
  function leaderForCard(card){
    if(!card)return null;
    var nameEl=card.querySelector('.vf28-leader-copy strong');
    var bairroEl=card.querySelector('.vf28-leader-info .vf28-info:first-child b');
    var catEl=card.querySelector('.vf28-category');
    var name=normalize(nameEl&&nameEl.textContent),bairro=normalize(bairroEl&&bairroEl.textContent),cat=normalize(catEl&&catEl.textContent);
    var arr=allLeaders();
    return arr.find(function(l){
      if(normalize(l.nome)!==name)return false;
      if(bairro&&bairro!=='não informado'&&normalize(l.bairro)!==bairro)return false;
      if(cat&&cat!=='sem categoria'&&normalize(l.categoria)!==cat)return false;
      return true;
    })||arr.find(function(l){return normalize(l.nome)===name;})||null;
  }
  function canDelete(l,u){
    if(!l||!u)return false;
    if(u.role==='master')return true;
    if(u.role==='adm'){
      try{
        var visible=window.SupabaseService.getLiderancas(u)||[];
        return visible.some(function(x){return x.id===l.id;});
      }catch(_){return l.vereadorId===u.id;}
    }
    return false;
  }
  function refreshLeadershipState(u){
    try{
      var fresh=window.SupabaseService.getLiderancas(u)||[];
      if(typeof state!=='undefined'&&state)state.liderancas=fresh;
    }catch(_){ }
    try{if(typeof renderTableLiderancas==='function')renderTableLiderancas();}catch(_){ }
    try{if(typeof window.onCloudDataUpdated==='function')window.onCloudDataUpdated();}catch(_){ }
    setTimeout(enhanceLeadershipCards,80);
  }
  function deleteLeader(l,u){
    if(!window.SupabaseService)throw new Error('Serviço de dados indisponível.');
    if(u.role==='master'){
      var ok=window.SupabaseService.deleteLideranca(l.id,u);
      refreshLeadershipState(u);
      return ok;
    }
    if(u.role==='adm'){
      var visible=window.SupabaseService.getLiderancas(u)||[];
      if(!visible.some(function(x){return x.id===l.id;}))throw new Error('Você não tem permissão para excluir esta liderança.');
      var all=window.SupabaseService.getAllLiderancasRaw()||[];
      var item=all.find(function(x){return x.id===l.id;});
      if(!item)return false;
      all=all.filter(function(x){return x.id!==l.id;});
      localStorage.setItem('mapa_eleitoral_liderancas_v5',JSON.stringify(all));
      try{window.SupabaseService.logAudit(u,'lideranca','🗑️ Liderança Excluída','Liderança '+item.nome+' removida por '+u.nome);}catch(_){ }
      try{window.SupabaseService.notifyLocalChange();}catch(_){ }
      refreshLeadershipState(u);
      return true;
    }
    throw new Error('Somente ADM/Master pode excluir lideranças.');
  }
  function closeDeleteDialog(){
    var el=document.querySelector('.vf31-delete-backdrop');
    if(el)el.remove();
  }
  function openDeleteDialog(l,u){
    closeDeleteDialog();
    var back=document.createElement('div');back.className='vf31-delete-backdrop';
    var dialog=document.createElement('section');dialog.className='vf31-delete-dialog';
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
    dialog.innerHTML='<h3>Excluir liderança?</h3><p>Esta ação remove o cadastro da liderança e não deve ser usada por engano.</p><div class="vf31-delete-name"></div><div class="vf31-delete-dialog-actions"><button type="button" class="vf31-delete-cancel">Cancelar</button><button type="button" class="vf31-delete-confirm">Excluir</button></div>';
    dialog.querySelector('.vf31-delete-name').textContent=l.nome||'Liderança';
    back.appendChild(dialog);document.body.appendChild(back);
    back.addEventListener('click',function(e){if(e.target===back)closeDeleteDialog();});
    dialog.querySelector('.vf31-delete-cancel').addEventListener('click',closeDeleteDialog);
    dialog.querySelector('.vf31-delete-confirm').addEventListener('click',function(){
      var btn=this;btn.disabled=true;btn.textContent='Excluindo...';
      try{
        deleteLeader(l,u);
        closeDeleteDialog();
      }catch(err){
        btn.disabled=false;btn.textContent='Excluir';
        alert(err&&err.message?err.message:'Não foi possível excluir a liderança.');
      }
    });
  }
  function enhanceLeadershipCards(){
    if(!document.body||!document.body.classList.contains('vf-desktop-mobile-mirror'))return;
    var u=currentUser();
    document.querySelectorAll('#view-table-liderancas .vf28-leader-card').forEach(function(card){
      var l=leaderForCard(card),actions=card.querySelector('.vf28-leader-actions');
      if(!l||!actions||!canDelete(l,u))return;
      if(actions.querySelector('.vf31-delete-leader'))return;
      var b=document.createElement('button');b.type='button';b.className='vf31-delete-leader';b.textContent='🗑 Excluir';
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openDeleteDialog(l,u);});
      actions.appendChild(b);
    });
  }

  var observer=new MutationObserver(function(muts){
    var need=false;
    for(var i=0;i<muts.length;i++){
      if(muts[i].addedNodes&&muts[i].addedNodes.length){need=true;break;}
    }
    if(need)setTimeout(enhanceLeadershipCards,20);
  });
  function boot(){
    enhanceLeadershipCards();
    if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,100);},{once:true});
  else setTimeout(boot,100);
  setTimeout(enhanceLeadershipCards,700);
  setInterval(function(){
    try{if(document.body&&document.body.getAttribute('data-vf-view')==='liderancas')enhanceLeadershipCards();}catch(_){ }
  },1000);
})();