(() => {
  'use strict';
  if (window.__mpProfessionalLoaded) return;
  window.__mpProfessionalLoaded = true;

  const mq = window.matchMedia('(max-width: 900px)');
  if (!mq.matches) return;

  const body = document.body;
  const header = document.querySelector('header.topbar');
  const nav = document.querySelector('.topbar-nav-section');
  const user = document.querySelector('.topbar-user-section');
  const colegiosBody = document.getElementById('table-colegios-body');
  const liderancasBody = document.getElementById('table-liderancas-body');
  if (!header || !nav || !user) return;

  body.classList.add('mp-mobile');

  const icon = (name) => ({
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>',
    school:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/></svg>',
    people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M18 8v6M21 11h-6"/></svg>',
    compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z"/></svg>',
    more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
    whats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>'
  }[name] || '');

  const menu = document.createElement('button');
  menu.type='button'; menu.className='mp-menu-button'; menu.setAttribute('aria-label','Abrir menu'); menu.innerHTML=icon('menu');
  header.appendChild(menu);

  const overlay=document.createElement('button'); overlay.type='button'; overlay.className='mp-overlay'; overlay.setAttribute('aria-label','Fechar menu');
  const drawer=document.createElement('aside'); drawer.className='mp-drawer';
  drawer.innerHTML=`<div class="mp-drawer-handle"></div><div class="mp-drawer-head"><div><strong>Menu</strong><span>Filtros, conta e ferramentas</span></div><button class="mp-drawer-close" type="button">&times;</button></div><div class="mp-drawer-scroll"><div class="mp-section-label">Acesso rápido</div><div class="mp-menu-grid"><button data-view="users">${icon('user')}<span>Usuários</span></button><button data-view="audit">${icon('shield')}<span>Auditoria</span></button><button data-action="whatsapp">${icon('whats')}<span>WhatsApp</span></button><button data-action="new">${icon('people')}<span>Nova liderança</span></button></div><div class="mp-section-label">Filtros do mapa</div><div class="mp-control-stack"></div><div class="mp-section-label">Conta</div><div class="mp-account-card"></div></div>`;
  document.body.append(overlay,drawer);

  const controls=drawer.querySelector('.mp-control-stack');
  [...nav.children].forEach(el=>{
    if (el.classList.contains('view-tabs')) return;
    if (el.classList.contains('btn-topbar-whatsapp') || el.classList.contains('btn-topbar-primary')) return;
    controls.appendChild(el);
  });
  const account=drawer.querySelector('.mp-account-card');
  const profile=user.querySelector('.user-profile-pill');
  const accountActions=document.createElement('div'); accountActions.className='mp-account-actions';
  if(profile) account.appendChild(profile);
  [...user.querySelectorAll('.btn-topbar')].forEach(btn=>accountActions.appendChild(btn));
  account.appendChild(accountActions);

  const bottom=document.createElement('nav'); bottom.className='mp-bottom-nav';
  bottom.innerHTML=`<button data-view="map">${icon('map')}<span>Mapa</span></button><button data-view="colegios">${icon('school')}<span>Colégios</span></button><button data-view="liderancas">${icon('people')}<span>Lideranças</span></button><button data-view="distritos">${icon('compass')}<span>Distritos</span></button>`;
  document.body.appendChild(bottom);

  const fab=document.createElement('button'); fab.type='button'; fab.className='mp-fab'; fab.setAttribute('aria-label','Nova liderança'); fab.textContent='+';
  const listFab=document.createElement('button'); listFab.type='button'; listFab.className='mp-list-fab'; listFab.innerHTML=`${icon('list')}<span>Lideranças e metas</span>`;
  document.body.append(fab,listFab);

  const pill=document.createElement('div'); pill.className='mp-preview-pill'; pill.textContent='Preview mobile'; document.body.appendChild(pill);

  function openDrawer(){body.classList.add('mp-drawer-open')}
  function closeDrawer(){body.classList.remove('mp-drawer-open')}
  menu.onclick=openDrawer; overlay.onclick=closeDrawer; drawer.querySelector('.mp-drawer-close').onclick=closeDrawer;
  drawer.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.view && typeof window.switchView==='function'){window.switchView(b.dataset.view); closeDrawer(); syncView();}
    if(b.dataset.action==='whatsapp' && typeof window.openWhatsAppSenderModal==='function'){window.openWhatsAppSenderModal(); closeDrawer();}
    if(b.dataset.action==='new' && typeof window.openModalNewLideranca==='function'){window.openModalNewLideranca(); closeDrawer();}
  });
  fab.onclick=()=>typeof window.openModalNewLideranca==='function'&&window.openModalNewLideranca();
  listFab.onclick=()=>typeof window.switchView==='function'&&window.switchView('liderancas');
  bottom.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.dataset.view)return;window.switchView?.(b.dataset.view);syncView();setTimeout(()=>window.dispatchEvent(new Event('resize')),100)});

  function currentView(){
    const map=[['map','#tab-btn-map'],['colegios','#tab-btn-colegios'],['liderancas','#tab-btn-liderancas'],['distritos','#tab-btn-distritos'],['users','#tab-btn-users'],['audit','#tab-btn-audit']];
    return (map.find(([,s])=>document.querySelector(s)?.classList.contains('active'))||['map'])[0];
  }
  function syncView(){
    const view=currentView();
    body.classList.toggle('mp-map-view',view==='map');
    bottom.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  }

  function addSearch(viewId,placeholder,onInput){
    const view=document.getElementById(viewId); if(!view||view.querySelector('.mp-search-wrap'))return;
    const wrap=document.createElement('div'); wrap.className='mp-search-wrap'; wrap.innerHTML=`${icon('search')}<input type="search" placeholder="${placeholder}">`;
    const first=view.children[0]; first?.insertAdjacentElement('afterend',wrap);
    wrap.querySelector('input').addEventListener('input',onInput);
  }

  function enhanceCollegeRows(){
    if(!colegiosBody)return;
    [...colegiosBody.querySelectorAll('tr')].forEach((tr,idx)=>{
      if(tr.dataset.mpDone)return; tr.dataset.mpDone='1';
      const td=[...tr.children]; if(td.length<8)return;
      const name=td[1]?.innerText.trim()||''; const address=td[2]?.innerText.trim()||''; const sections=td[3]?.innerText.trim()||'-';
      const specific=td.length>=9;
      let primary,secondary,total,lids,action;
      if(specific){primary=td[4]?.innerText.trim()||'-';secondary=td[5]?.innerText.trim()||'-';total=td[6]?.innerText.trim()||'-';lids=td[7]?.innerText.trim()||'-';action=td[8]?.querySelector('button');}
      else{primary=td[4]?.innerText.trim()||'-';secondary=td[5]?.innerText.trim()||'-';total=td[6]?.innerText.trim()||'-';lids=td[7]?.innerText.trim()||'-';action=td[8]?.querySelector('button');}
      const card=document.createElement('td'); card.className='mp-college-card';
      card.innerHTML=`<div class="mp-card-main"><div class="mp-card-title-row"><div class="mp-index-badge">${idx+1}</div><div><div class="mp-card-title">${name}</div><div class="mp-card-address">${address}</div></div></div><div class="mp-metrics"><div class="mp-metric"><span>Seções</span><strong>${sections}</strong></div><div class="mp-metric"><span>Votos</span><strong class="blue">${primary}</strong></div><div class="mp-metric"><span>${specific?'Desempenho':'Adversário'}</span><strong class="${specific?'green':'amber'}">${secondary}</strong></div></div></div><div class="mp-card-footer"><span class="mp-card-footer-note">${lids}</span><button type="button" class="mp-details-btn">Detalhes ${icon('chevron')}</button></div><div class="mp-card-details"><div class="mp-detail-grid"><div class="mp-detail-item"><span>Total do colégio</span><strong>${total}</strong></div><div class="mp-detail-item"><span>Lideranças</span><strong>${lids}</strong></div></div><button type="button" class="mp-add-leader">+ Adicionar liderança</button></div>`;
      tr.appendChild(card);
      card.querySelector('.mp-details-btn').onclick=()=>card.classList.toggle('open');
      card.querySelector('.mp-add-leader').onclick=()=>action?.click();
      tr.dataset.mpSearch=`${name} ${address}`.toLowerCase();
    });
  }

  function enhanceLeaderRows(){
    if(!liderancasBody)return;
    [...liderancasBody.querySelectorAll('tr')].forEach((tr,idx)=>{
      if(tr.dataset.mpDone)return; const td=[...tr.children]; if(td.length<9)return; tr.dataset.mpDone='1';
      const name=td[1]?.innerText.replace('📍','').trim()||''; const resp=td[2]?.innerText.trim()||''; const bairro=td[3]?.innerText.trim()||''; const phone=td[4]?.innerText.trim()||''; const colegio=td[5]?.innerText.trim()||'-'; const meta=td[6]?.innerText.trim()||'-'; const cat=td[7]?.innerText.trim()||'';
      const buttons=td[8]?.querySelectorAll('button')||[];
      const card=document.createElement('td'); card.className='mp-leader-card';
      card.innerHTML=`<div class="mp-card-main"><div class="mp-leader-head"><div><div class="mp-leader-name">${name}</div><div class="mp-card-address">${bairro}</div></div><span class="mp-category">${cat}</span></div><div class="mp-leader-meta"><div class="mp-leader-meta-row"><span>Responsável</span><div>${resp}</div></div><div class="mp-leader-meta-row"><span>Colégio</span><div>${colegio}</div></div><div class="mp-leader-meta-row"><span>Meta</span><div style="color:#34d399;font-weight:800">${meta}</div></div><div class="mp-leader-meta-row"><span>WhatsApp</span><div>${phone}</div></div></div><div class="mp-leader-actions"><button class="map" type="button">Ver no mapa</button><button class="wa" type="button">WhatsApp</button></div></div>`;
      tr.appendChild(card); card.querySelector('.map').onclick=()=>buttons[0]?.click(); card.querySelector('.wa').onclick=()=>buttons[1]?.click()||td[4]?.querySelector('button')?.click();
      tr.dataset.mpSearch=`${name} ${resp} ${bairro} ${colegio} ${cat}`.toLowerCase();
    });
  }

  function filterRows(bodyEl,term){[...(bodyEl?.querySelectorAll('tr')||[])].forEach(tr=>tr.style.display=(!term||tr.dataset.mpSearch?.includes(term))?'block':'none')}
  addSearch('view-table-colegios','Buscar colégio ou endereço...',e=>filterRows(colegiosBody,e.target.value.trim().toLowerCase()));
  addSearch('view-table-liderancas','Buscar liderança, bairro ou vereador...',e=>filterRows(liderancasBody,e.target.value.trim().toLowerCase()));

  const observer=new MutationObserver(()=>{enhanceCollegeRows();enhanceLeaderRows();syncView()});
  if(colegiosBody)observer.observe(colegiosBody,{childList:true,subtree:true});
  if(liderancasBody)observer.observe(liderancasBody,{childList:true,subtree:true});
  document.querySelectorAll('.tab-btn').forEach(t=>observer.observe(t,{attributes:true,attributeFilter:['class','style']}));
  enhanceCollegeRows(); enhanceLeaderRows(); syncView();
  window.addEventListener('orientationchange',()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),150));
})();
