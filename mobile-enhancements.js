(() => {
    'use strict';

    if (window.__mapaEleitoralMobileEnhancementsLoaded) return;
    window.__mapaEleitoralMobileEnhancementsLoaded = true;

    const BREAKPOINT = 900;
    const header = document.querySelector('header.topbar');
    const navSection = document.querySelector('.topbar-nav-section');
    const userSection = document.querySelector('.topbar-user-section');
    const sidebar = document.querySelector('.sidebar-panel');

    if (!header || !navSection || !userSection) return;

    const navPlaceholder = document.createComment('mobile-nav-placeholder');
    const userPlaceholder = document.createComment('mobile-user-placeholder');
    navSection.parentNode.insertBefore(navPlaceholder, navSection);
    userSection.parentNode.insertBefore(userPlaceholder, userSection);

    const icon = (name) => {
        const icons = {
            menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
            map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
            school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/><path d="M21 10v6"/></svg>',
            people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
            compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
            list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>'
        };
        return icons[name] || icons.menu;
    };

    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Abrir menu e filtros');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = icon('menu');
    header.appendChild(menuToggle);

    const controlOverlay = document.createElement('button');
    controlOverlay.type = 'button';
    controlOverlay.id = 'mobile-control-overlay';
    controlOverlay.setAttribute('aria-label', 'Fechar menu');

    const drawer = document.createElement('aside');
    drawer.id = 'mobile-control-drawer';
    drawer.setAttribute('aria-label', 'Menu, filtros e conta');
    drawer.innerHTML = `
        <div class="mobile-drawer-header">
            <div>
                <strong>Menu e filtros</strong>
                <span>Mapa Eleitoral de Arapongas</span>
            </div>
            <button type="button" class="mobile-drawer-close" aria-label="Fechar menu">&times;</button>
        </div>
        <div class="mobile-control-content"></div>
    `;

    document.body.append(controlOverlay, drawer);
    const drawerContent = drawer.querySelector('.mobile-control-content');
    const drawerClose = drawer.querySelector('.mobile-drawer-close');

    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.setAttribute('aria-label', 'Navegação principal mobile');
    bottomNav.innerHTML = `
        <button type="button" data-mobile-view="map">${icon('map')}<span>Mapa</span></button>
        <button type="button" data-mobile-view="colegios">${icon('school')}<span>Colégios</span></button>
        <button type="button" data-mobile-view="liderancas">${icon('people')}<span>Lideranças</span></button>
        <button type="button" data-mobile-view="distritos">${icon('compass')}<span>Distritos</span></button>
        <button type="button" data-mobile-action="menu">${icon('menu')}<span>Menu</span></button>
    `;
    document.body.appendChild(bottomNav);

    const leadersToggle = document.createElement('button');
    leadersToggle.type = 'button';
    leadersToggle.className = 'mobile-leaders-toggle';
    leadersToggle.innerHTML = `${icon('list')}<span>Lista e metas</span>`;
    leadersToggle.setAttribute('aria-label', 'Abrir lista de lideranças e metas');
    document.body.appendChild(leadersToggle);

    const sidebarOverlay = document.createElement('button');
    sidebarOverlay.type = 'button';
    sidebarOverlay.id = 'mobile-sidebar-overlay';
    sidebarOverlay.setAttribute('aria-label', 'Fechar lista de lideranças');
    document.body.appendChild(sidebarOverlay);

    let sidebarClose = null;
    if (sidebar) {
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader) {
            sidebarClose = document.createElement('button');
            sidebarClose.type = 'button';
            sidebarClose.id = 'mobile-sidebar-close';
            sidebarClose.setAttribute('aria-label', 'Fechar lista');
            sidebarClose.innerHTML = '&times;';
            sidebarHeader.appendChild(sidebarClose);
        }
    }

    const previewBadge = document.createElement('div');
    previewBadge.className = 'mobile-preview-badge';
    previewBadge.textContent = 'Preview mobile';
    document.body.appendChild(previewBadge);

    const isMobile = () => window.matchMedia(`(max-width: ${BREAKPOINT}px)`).matches;

    const refreshMapLayout = () => {
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    };

    const closeDrawer = () => {
        document.body.classList.remove('mobile-drawer-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const openDrawer = () => {
        if (!isMobile()) return;
        document.body.classList.add('mobile-drawer-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        setTimeout(() => drawerClose.focus({ preventScroll: true }), 120);
    };

    const closeSidebar = () => {
        document.body.classList.remove('mobile-sidebar-open');
        leadersToggle.setAttribute('aria-expanded', 'false');
        refreshMapLayout();
    };

    const openSidebar = () => {
        if (!isMobile() || !sidebar) return;
        document.body.classList.add('mobile-sidebar-open');
        leadersToggle.setAttribute('aria-expanded', 'true');
        refreshMapLayout();
    };

    const activeView = () => {
        const candidates = [
            ['map', '#tab-btn-map'],
            ['colegios', '#tab-btn-colegios'],
            ['liderancas', '#tab-btn-liderancas'],
            ['distritos', '#tab-btn-distritos'],
            ['users', '#tab-btn-users'],
            ['audit', '#tab-btn-audit']
        ];
        const active = candidates.find(([, selector]) => document.querySelector(selector)?.classList.contains('active'));
        return active ? active[0] : 'map';
    };

    const syncActiveView = () => {
        const view = activeView();
        document.body.classList.toggle('mobile-map-active', view === 'map');
        bottomNav.querySelectorAll('button').forEach((button) => {
            const buttonView = button.dataset.mobileView;
            const menuActive = button.dataset.mobileAction === 'menu' && (view === 'users' || view === 'audit');
            button.classList.toggle('active', buttonView === view || menuActive);
        });
        if (view !== 'map') closeSidebar();
    };

    const enterMobile = () => {
        document.body.classList.add('mobile-ui-active');
        if (navSection.parentNode !== drawerContent) drawerContent.appendChild(navSection);
        if (userSection.parentNode !== drawerContent) drawerContent.appendChild(userSection);
        syncActiveView();
        refreshMapLayout();
    };

    const exitMobile = () => {
        closeDrawer();
        closeSidebar();
        document.body.classList.remove('mobile-ui-active', 'mobile-map-active');
        if (navPlaceholder.parentNode) navPlaceholder.parentNode.insertBefore(navSection, navPlaceholder.nextSibling);
        if (userPlaceholder.parentNode) userPlaceholder.parentNode.insertBefore(userSection, userPlaceholder.nextSibling);
        refreshMapLayout();
    };

    const applyLayout = () => {
        if (isMobile()) enterMobile();
        else exitMobile();
    };

    menuToggle.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-drawer-open')) closeDrawer();
        else openDrawer();
    });
    drawerClose.addEventListener('click', closeDrawer);
    controlOverlay.addEventListener('click', closeDrawer);
    leadersToggle.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-sidebar-open')) closeSidebar();
        else openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);
    sidebarClose?.addEventListener('click', closeSidebar);

    bottomNav.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.mobileAction === 'menu') {
            openDrawer();
            return;
        }
        const view = button.dataset.mobileView;
        if (view && typeof window.switchView === 'function') {
            closeDrawer();
            closeSidebar();
            window.switchView(view);
            setTimeout(syncActiveView, 60);
            setTimeout(refreshMapLayout, 100);
        }
    });

    navSection.addEventListener('click', () => {
        setTimeout(syncActiveView, 60);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeDrawer();
        closeSidebar();
    });

    const tabObserver = new MutationObserver(syncActiveView);
    document.querySelectorAll('.tab-btn').forEach((tab) => {
        tabObserver.observe(tab, { attributes: true, attributeFilter: ['class', 'style'] });
    });

    const media = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    if (typeof media.addEventListener === 'function') media.addEventListener('change', applyLayout);
    else media.addListener(applyLayout);

    window.addEventListener('orientationchange', () => setTimeout(applyLayout, 120));
    window.addEventListener('resize', () => {
        clearTimeout(window.__mapaMobileResizeTimer);
        window.__mapaMobileResizeTimer = setTimeout(syncActiveView, 100);
    }, { passive: true });

    applyLayout();
    setTimeout(syncActiveView, 250);
})();
