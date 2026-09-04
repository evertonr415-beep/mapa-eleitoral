(function () {
  'use strict';
  if (window.__vfMobileProfessionalLoaded) return;
  window.__vfMobileProfessionalLoaded = true;

  var BREAKPOINT = 900;
  var body = document.body;
  var header = document.querySelector('header.topbar');
  var navSection = document.querySelector('.topbar-nav-section');
  var userSection = document.querySelector('.topbar-user-section');
  var sidebar = document.querySelector('.sidebar-panel');
  if (!body || !header || !navSection || !userSection) return;

  var moved = [];
  var shellCreated = false;
  var tableObserver = null;
  var usersObserver = null;
  var profileLock = false;

  function icon(name) {
    var icons = {
      menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
      close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5l5-2.5 8 3 5-2.5v13L16 20l-8-3-5 2.5zM8 4v13M16 7v13"/></svg>',
      school: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10l9-5 9 5-9 5zM7 13v5c3 1.8 7 1.8 10 0v-5M21 10v7"/></svg>',
      people: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6"/></svg>',
      compass: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
      filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
      plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
      list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
      shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6zM9 12l2 2 4-4"/></svg>',
      arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    };
    return icons[name] || icons.menu;
  }

  function isMobile() {
    return window.matchMedia('(max-width:' + BREAKPOINT + 'px)').matches;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function currentUser() {
    try {
      if (typeof state !== 'undefined' && state && state.currentUser) return state.currentUser;
    } catch (_) {}
    try {
      if (window.SupabaseService && typeof window.SupabaseService.getCurrentUser === 'function') {
        return window.SupabaseService.getCurrentUser();
      }
    } catch (_) {}
    return null;
  }

  function leaders() {
    try {
      if (typeof state !== 'undefined' && state && Array.isArray(state.liderancas)) return state.liderancas;
    } catch (_) {}
    try {
      if (window.SupabaseService && typeof window.SupabaseService.getAllLiderancasRaw === 'function') {
        return window.SupabaseService.getAllLiderancasRaw() || [];
      }
    } catch (_) {}
    return [];
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  function makeButton(className, label, iconName) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon(iconName) + '<span>' + escapeHtml(label) + '</span>';
    return button;
  }

  function moveNode(node, target) {
    if (!node || !target || node.dataset.vfMoved === '1') return;
    var marker = document.createComment('vf-mobile-placeholder');
    node.parentNode.insertBefore(marker, node);
    moved.push({ node: node, marker: marker });
    node.dataset.vfMoved = '1';
    target.appendChild(node);
  }

  function restoreNodes() {
    moved.forEach(function (item) {
      if (item.marker.parentNode) item.marker.parentNode.insertBefore(item.node, item.marker.nextSibling);
      delete item.node.dataset.vfMoved;
    });
    moved = [];
  }

  function createShell() {
    if (shellCreated) return;
    shellCreated = true;

    var menuButton = makeButton('vf-mobile-menu-button', 'Menu', 'menu');
    menuButton.querySelector('span').className = 'vf-sr-only';
    header.insertBefore(menuButton, header.firstChild);

    var profileButton = document.createElement('button');
    profileButton.type = 'button';
    profileButton.className = 'vf-mobile-profile-button';
    profileButton.setAttribute('aria-label', 'Abrir perfil');
    profileButton.innerHTML = '<span class="vf-mobile-avatar">?</span>';
    header.appendChild(profileButton);

    var overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'vf-mobile-overlay';
    overlay.setAttribute('aria-label', 'Fechar menu');

    var drawer = document.createElement('aside');
    drawer.className = 'vf-mobile-drawer';
    drawer.setAttribute('aria-label', 'Menu e filtros');
    drawer.innerHTML =
      '<div class="vf-drawer-head">' +
        '<div class="vf-drawer-brand"><img src="assets/bandeira_arapongas.png" alt=""><div><strong>Mapa Eleitoral</strong><span>Arapongas</span></div></div>' +
        '<button type="button" class="vf-drawer-close" aria-label="Fechar menu">' + icon('close') + '</button>' +
      '</div>' +
      '<div class="vf-drawer-scroll">' +
        '<section class="vf-drawer-account">' +
          '<div class="vf-drawer-account-avatar">?</div>' +
          '<div class="vf-drawer-account-copy"><strong>Carregando...</strong><span>Conta</span></div>' +
          '<button type="button" class="vf-drawer-profile-link" aria-label="Abrir perfil">' + icon('arrow') + '</button>' +
        '</section>' +
        '<section class="vf-drawer-section"><div class="vf-drawer-label">A&ccedil;&otilde;es r&aacute;pidas</div><div class="vf-drawer-actions"></div></section>' +
        '<section class="vf-drawer-section"><div class="vf-drawer-label">Filtros do mapa</div><div class="vf-drawer-filters"></div></section>' +
        '<section class="vf-drawer-section"><div class="vf-drawer-label">Conta e seguran&ccedil;a</div><div class="vf-drawer-security"></div></section>' +
        '<div class="vf-drawer-preview">' + icon('shield') + '<span>Ambiente de pr&eacute;via mobile</span></div>' +
      '</div>';

    var bottomNav = document.createElement('nav');
    bottomNav.className = 'vf-mobile-bottom-nav';
    bottomNav.setAttribute('aria-label', 'Navegacao principal');
    bottomNav.innerHTML =
      '<button type="button" data-vf-view="map">' + icon('map') + '<span>Mapa</span></button>' +
      '<button type="button" data-vf-view="colegios">' + icon('school') + '<span>Col&eacute;gios</span></button>' +
      '<button type="button" data-vf-view="liderancas">' + icon('people') + '<span>Lideran&ccedil;as</span></button>' +
      '<button type="button" data-vf-view="distritos">' + icon('compass') + '<span>Distritos</span></button>' +
      '<button type="button" data-vf-view="users">' + icon('user') + '<span>Perfil</span></button>';

    var mapToolbar = document.createElement('div');
    mapToolbar.className = 'vf-map-toolbar';
    mapToolbar.innerHTML =
      '<button type="button" class="vf-map-filter">' + icon('filter') + '<span>Filtros</span></button>' +
      '<button type="button" class="vf-map-add">' + icon('plus') + '<span>Nova lideran&ccedil;a</span></button>';

    var leadersButton = document.createElement('button');
    leadersButton.type = 'button';
    leadersButton.className = 'vf-map-leaders-button';
    leadersButton.innerHTML = icon('list') + '<span>Lideran&ccedil;as e metas</span><b id="vf-mobile-leader-count">0</b>';

    var leaderOverlay = document.createElement('button');
    leaderOverlay.type = 'button';
    leaderOverlay.className = 'vf-leader-overlay';
    leaderOverlay.setAttribute('aria-label', 'Fechar lista de liderancas');

    document.body.append(overlay, drawer, leaderOverlay, bottomNav, leadersButton);
    document.getElementById('view-map-container').appendChild(mapToolbar);

    if (sidebar && !sidebar.querySelector('.vf-leader-sheet-close')) {
      var sheetClose = document.createElement('button');
      sheetClose.type = 'button';
      sheetClose.className = 'vf-leader-sheet-close';
      sheetClose.setAttribute('aria-label', 'Fechar lista');
      sheetClose.innerHTML = icon('close');
      var sidebarHeader = sidebar.querySelector('.sidebar-header');
      if (sidebarHeader) sidebarHeader.appendChild(sheetClose);
      sheetClose.addEventListener('click', closeLeaderSheet);
    }

    var actions = drawer.querySelector('.vf-drawer-actions');
    var filters = drawer.querySelector('.vf-drawer-filters');
    var security = drawer.querySelector('.vf-drawer-security');
    moveNode(navSection.querySelector('.btn-topbar-primary'), actions);
    moveNode(navSection.querySelector('.btn-topbar-whatsapp'), actions);
    moveNode(navSection.querySelector('.layers-box-compact'), filters);
    moveNode(document.getElementById('cand-select'), filters);
    moveNode(document.getElementById('filter-liderancas-vereador'), filters);
    moveNode(userSection.querySelector('.btn-topbar-secondary'), security);
    moveNode(userSection.querySelector('.btn-topbar-danger'), security);

    menuButton.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.vf-drawer-close').addEventListener('click', closeDrawer);
    drawer.querySelector('.vf-drawer-account').addEventListener('click', openProfile);
    profileButton.addEventListener('click', openProfile);
    mapToolbar.querySelector('.vf-map-filter').addEventListener('click', openDrawer);
    mapToolbar.querySelector('.vf-map-add').addEventListener('click', function () {
      var original = drawer.querySelector('.btn-topbar-primary');
      if (original) original.click();
      else if (typeof window.openModalNewLideranca === 'function') window.openModalNewLideranca();
    });
    leadersButton.addEventListener('click', toggleLeaderSheet);
    leaderOverlay.addEventListener('click', closeLeaderSheet);

    bottomNav.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-vf-view]');
      if (!button) return;
      var view = button.dataset.vfView;
      if (view === 'users') {
        openProfile();
        return;
      }
      closeDrawer();
      closeLeaderSheet();
      if (typeof window.switchView === 'function') window.switchView(view);
      setTimeout(syncUi, 30);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeDrawer();
        closeLeaderSheet();
      }
    });
  }

  function openDrawer() {
    if (!isMobile()) return;
    closeLeaderSheet();
    body.classList.add('vf-drawer-open');
  }
  function closeDrawer() { body.classList.remove('vf-drawer-open'); }
  function toggleLeaderSheet() {
    if (!sidebar || !isMobile()) return;
    closeDrawer();
    body.classList.toggle('vf-leader-sheet-open');
    refreshMap();
  }
  function closeLeaderSheet() {
    body.classList.remove('vf-leader-sheet-open');
    refreshMap();
  }
  function openProfile() {
    closeDrawer();
    closeLeaderSheet();
    var user = currentUser();
    if (!user) {
      if (typeof window.openModal === 'function') window.openModal('modal-auth-flow');
      if (typeof window.toggleAuthTab === 'function') window.toggleAuthTab('login');
      return;
    }
    if (typeof window.switchView === 'function') window.switchView('users');
    setTimeout(syncUi, 40);
  }

  function activeView() {
    var map = [
      ['map', 'tab-btn-map'], ['colegios', 'tab-btn-colegios'], ['liderancas', 'tab-btn-liderancas'],
      ['distritos', 'tab-btn-distritos'], ['users', 'tab-btn-users'], ['audit', 'tab-btn-audit']
    ];
    for (var i = 0; i < map.length; i += 1) {
      var tab = document.getElementById(map[i][1]);
      if (tab && tab.classList.contains('active')) return map[i][0];
    }
    return 'map';
  }

  function syncActiveNav() {
    var view = activeView();
    body.dataset.vfView = view;
    document.querySelectorAll('.vf-mobile-bottom-nav button').forEach(function (button) {
      button.classList.toggle('active', button.dataset.vfView === view);
    });
    if (view !== 'map') closeLeaderSheet();
  }

  function updateAccountUi() {
    var user = currentUser();
    var name = user && user.nome ? user.nome : 'Acessar conta';
    var role = user && user.role ? String(user.role) : 'Login';
    var short = initials(name);
    document.querySelectorAll('.vf-mobile-avatar,.vf-drawer-account-avatar').forEach(function (node) { node.textContent = short; });
    var copy = document.querySelector('.vf-drawer-account-copy');
    if (copy) {
      copy.querySelector('strong').textContent = name;
      copy.querySelector('span').textContent = role;
    }
  }

  function updateLeaderCount() {
    var count = leaders().length;
    var node = document.getElementById('vf-mobile-leader-count');
    if (node) node.textContent = String(count);
  }

  function setPageTitles() {
    var configs = [
      ['view-table-colegios', 'Col\u00e9gios eleitorais', 'Locais de vota\u00e7\u00e3o e desempenho por se\u00e7\u00e3o'],
      ['view-table-liderancas', 'Lideran\u00e7as', 'Contatos, metas e geolocaliza\u00e7\u00e3o'],
      ['view-distritos-management', 'Distritos e redutos', 'Cobertura territorial da campanha'],
      ['view-audit-logs', 'Auditoria', 'Hist\u00f3rico de acessos e atividades']
    ];
    configs.forEach(function (config) {
      var view = document.getElementById(config[0]);
      var head = view && view.firstElementChild;
      if (!head) return;
      head.classList.add('vf-mobile-page-head');
      var h2 = head.querySelector('h2');
      var p = head.querySelector('p');
      if (h2) h2.textContent = config[1];
      if (p) p.textContent = config[2];
    });
  }

  function labelTable(table) {
    if (!table) return;
    var headers = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
      return th.textContent.trim();
    });
    if (!headers.length) return;
    var firstIsIndex = headers[0] === '#' || /^n[\u00ba\u00b0]?$/i.test(headers[0] || '');
    var titleIndex = -1;
    headers.some(function (text, index) {
      if (/col[e\u00e9]gio eleitoral|nome da lideran[c\u00e7]a|distrito|usu[a\u00e1]rio/i.test(text)) {
        titleIndex = index;
        return true;
      }
      return false;
    });
    if (titleIndex < 0) titleIndex = firstIsIndex ? 1 : 0;
    table.querySelectorAll('tbody tr').forEach(function (row) {
      var cells = row.querySelectorAll('td');
      cells.forEach(function (cell, index) {
        cell.dataset.label = headers[index] || '';
        cell.classList.toggle('vf-card-index', firstIsIndex && index === 0);
        cell.classList.toggle('vf-card-title', index === titleIndex);
        cell.classList.toggle('vf-card-actions', index === cells.length - 1 && /a[c\u00e7][o\u00f5]es?/i.test(headers[index] || ''));
      });
    });
  }

  function labelAllTables() {
    document.querySelectorAll('.custom-table,.colegios-table').forEach(labelTable);
  }

  function installTableObserver() {
    if (tableObserver) return;
    tableObserver = new MutationObserver(function () { window.requestAnimationFrame(labelAllTables); });
    ['table-colegios-body', 'table-liderancas-body', 'table-distritos-body', 'table-audit-body'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) tableObserver.observe(node, { childList: true, subtree: true });
    });
  }

  function enhanceUsersView() {
    if (profileLock) return;
    var view = document.getElementById('view-users-management');
    var list = document.getElementById('users-management-list');
    if (!view || !list) return;
    var head = view.firstElementChild;
    if (head) head.classList.add('vf-mobile-page-head');
    var h2 = head && head.querySelector('h2');
    var p = head && head.querySelector('p');
    var createButton = head && head.querySelector('button');
    var user = currentUser();
    var role = String(user && user.role ? user.role : '').toLowerCase();
    var selfMode = role === 'vereador';

    if (!selfMode) {
      list.classList.remove('vf-user-self-mode');
      var oldDashboard = list.querySelector(':scope > .vf-profile-dashboard');
      if (oldDashboard) oldDashboard.remove();
      if (h2) h2.textContent = 'Gest\u00e3o de usu\u00e1rios';
      if (p) p.textContent = 'Perfis, permiss\u00f5es e acessos da equipe';
      if (createButton) createButton.style.removeProperty('display');
      return;
    }

    if (h2) h2.textContent = 'Meu perfil';
    if (p) p.textContent = 'Sua conta, lideran\u00e7as e metas';
    if (createButton) createButton.style.setProperty('display', 'none', 'important');
    list.classList.add('vf-user-self-mode');

    var all = leaders();
    var mine = user && user.id ? all.filter(function (item) { return !item.vereadorId || item.vereadorId === user.id; }) : all;
    var goal = mine.reduce(function (sum, item) { return sum + (Number(item.metaVotos) || 0); }, 0);
    var signature = [user && user.id, user && user.nome, mine.length, goal].join('|');
    var existing = list.querySelector(':scope > .vf-profile-dashboard');
    if (existing && list.dataset.vfProfileSignature === signature) return;

    profileLock = true;
    if (existing) existing.remove();
    var dashboard = document.createElement('section');
    dashboard.className = 'vf-profile-dashboard';
    dashboard.innerHTML =
      '<article class="vf-profile-hero">' +
        '<div class="vf-profile-avatar">' + escapeHtml(initials(user && user.nome)) + '</div>' +
        '<div class="vf-profile-copy"><span class="vf-profile-eyebrow">Vereador(a)</span><h3>' + escapeHtml(user && user.nome ? user.nome : 'Meu perfil') + '</h3><p>' + escapeHtml(user && user.email ? user.email : 'Conta autenticada') + (user && user.partido ? ' &bull; ' + escapeHtml(user.partido) : '') + '</p></div>' +
        '<span class="vf-profile-status">Ativo</span>' +
      '</article>' +
      '<div class="vf-profile-stats">' +
        '<article><span>Lideran\u00e7as</span><strong>' + mine.length + '</strong><small>cadastradas</small></article>' +
        '<article><span>Meta de votos</span><strong>+' + goal.toLocaleString('pt-BR') + '</strong><small>estimativa atual</small></article>' +
      '</div>' +
      '<div class="vf-profile-actions"><button type="button" data-vf-profile-action="password">Alterar senha</button><button type="button" data-vf-profile-action="logout">Sair da conta</button></div>' +
      '<div class="vf-profile-privacy">' + icon('shield') + '<div><strong>Dados protegidos</strong><span>Seu acesso e suas lideran\u00e7as permanecem isolados.</span></div></div>';
    list.prepend(dashboard);
    list.dataset.vfProfileSignature = signature;
    dashboard.querySelector('[data-vf-profile-action="password"]').addEventListener('click', function () {
      if (typeof window.openModal === 'function') window.openModal('modal-change-password');
    });
    dashboard.querySelector('[data-vf-profile-action="logout"]').addEventListener('click', function () {
      if (typeof window.handleLogout === 'function') window.handleLogout();
    });
    profileLock = false;
  }

  function installUsersObserver() {
    if (usersObserver) return;
    var list = document.getElementById('users-management-list');
    if (!list) return;
    usersObserver = new MutationObserver(function () {
      if (!profileLock) window.requestAnimationFrame(enhanceUsersView);
    });
    usersObserver.observe(list, { childList: true });
  }

  function refreshMap() {
    window.dispatchEvent(new Event('resize'));
    window.setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 180);
  }

  function syncUi() {
    if (!isMobile()) return;
    syncActiveNav();
    updateAccountUi();
    updateLeaderCount();
    setPageTitles();
    labelAllTables();
    enhanceUsersView();
    refreshMap();
  }

  function enterMobile() {
    createShell();
    document.documentElement.classList.add('vf-mobile-root');
    body.classList.add('vf-mobile');
    var title = document.querySelector('.brand-info h1');
    var subtitle = document.querySelector('.brand-info p');
    if (title) title.textContent = 'MAPA ELEITORAL';
    if (subtitle) subtitle.textContent = 'Arapongas \u2022 Intelig\u00eancia territorial';
    installTableObserver();
    installUsersObserver();
    syncUi();
  }

  function exitMobile() {
    closeDrawer();
    closeLeaderSheet();
    document.documentElement.classList.remove('vf-mobile-root');
    body.classList.remove('vf-mobile');
    delete body.dataset.vfView;
    restoreNodes();
  }

  function applyLayout() {
    if (isMobile()) enterMobile(); else exitMobile();
  }

  var originalSwitchView = window.switchView;
  if (typeof originalSwitchView === 'function' && !originalSwitchView.__vfMobileWrapped) {
    var wrapped = function () {
      var result = originalSwitchView.apply(this, arguments);
      window.setTimeout(syncUi, 25);
      return result;
    };
    wrapped.__vfMobileWrapped = true;
    window.switchView = wrapped;
  }

  var tabObserver = new MutationObserver(function () { window.setTimeout(syncActiveNav, 10); });
  document.querySelectorAll('.tab-btn').forEach(function (tab) {
    tabObserver.observe(tab, { attributes: true, attributeFilter: ['class', 'style'] });
  });

  var accountObserver = new MutationObserver(function () { window.requestAnimationFrame(updateAccountUi); });
  ['current-user-name', 'current-user-role', 'stat-total-liderancas', 'stat-total-meta-votos'].forEach(function (id) {
    var node = document.getElementById(id);
    if (node) accountObserver.observe(node, { childList: true, subtree: true, characterData: true });
  });

  var media = window.matchMedia('(max-width:' + BREAKPOINT + 'px)');
  if (typeof media.addEventListener === 'function') media.addEventListener('change', applyLayout);
  else media.addListener(applyLayout);
  window.addEventListener('orientationchange', function () { window.setTimeout(syncUi, 140); });
  window.addEventListener('resize', function () {
    window.clearTimeout(window.__vfMobileResizeTimer);
    window.__vfMobileResizeTimer = window.setTimeout(function () { applyLayout(); syncUi(); }, 100);
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.setTimeout(applyLayout, 30); }, { once: true });
  } else {
    window.setTimeout(applyLayout, 30);
  }
  window.setTimeout(syncUi, 350);
  window.setTimeout(syncUi, 1000);
}());
