(function () {
  'use strict';

  function service() { return window.SupabaseService || null; }
  function currentUser() {
    try { return service() && service().getCurrentUser ? service().getCurrentUser() : null; }
    catch (_) { return null; }
  }
  function canManageUsers(u) { return !!u && (u.role === 'master' || u.role === 'adm'); }

  function findButtonsByText(text) {
    const needle = String(text || '').toLowerCase();
    return Array.from(document.querySelectorAll('button')).filter(btn =>
      String(btn.textContent || '').toLowerCase().includes(needle)
    );
  }

  function applyRoleUi() {
    const u = currentUser();
    const manager = canManageUsers(u);

    // Vereador comum nunca recebe o cadastro de outro vereador.
    findButtonsByText('cadastrar novo vereador').forEach(btn => {
      btn.style.display = manager ? '' : 'none';
      btn.disabled = !manager;
      btn.setAttribute('aria-hidden', manager ? 'false' : 'true');
    });

    // Cadastro no modal só existe para Master/Adm logado. Desconectado vê apenas Login.
    const regTab = document.getElementById('btn-tab-auth-register');
    const regForm = document.getElementById('form-auth-register');
    const loginTab = document.getElementById('btn-tab-auth-login');
    const loginForm = document.getElementById('form-auth-login');
    if (!manager) {
      if (regTab) regTab.style.display = 'none';
      if (regForm) regForm.style.display = 'none';
      if (loginTab) loginTab.style.display = '';
      if (loginForm && document.getElementById('modal-auth-flow')?.style.display !== 'none') loginForm.style.display = 'block';
    } else {
      if (regTab) regTab.style.display = '';
    }

    // Remove caminhos antigos inseguros da interface.
    const bio = document.getElementById('btn-biometric-login');
    if (bio) bio.style.display = 'none';
    const demo = document.getElementById('auth-demo-picker');
    if (demo) demo.style.display = 'none';
    document.querySelectorAll('a').forEach(a => {
      const t = String(a.textContent || '').toLowerCase();
      if (t.includes('acesso master') || t.includes('administradores de campanha')) a.style.display = 'none';
    });

    // Normaliza o rótulo duplicado do botão superior.
    document.querySelectorAll('.btn-new-lideranca span').forEach(span => {
      if (String(span.textContent || '').trim() === '+ Liderança') span.textContent = 'Liderança';
    });
  }

  function installServiceGuards() {
    const svc = service();
    if (!svc || svc.__vfRecoveryGuardsInstalled) return;
    svc.__vfRecoveryGuardsInstalled = true;

    if (typeof svc.registerVereador === 'function') {
      const originalRegister = svc.registerVereador.bind(svc);
      svc.registerVereador = async function(formData) {
        const actor = currentUser();
        if (!canManageUsers(actor)) {
          throw new Error('Apenas Master ou Administrador pode cadastrar novos vereadores.');
        }
        return originalRegister(formData);
      };
    }
  }

  function installLegacyBlocks() {
    // Desativa os atalhos locais antigos que podiam trocar identidade sem Auth real.
    window.handleBiometricLogin = function() {
      alert('Biometria temporariamente desativada nesta preview segura. Use e-mail e senha.');
    };
    window.quickLoginDemo = function() {
      alert('Acesso rápido desativado. Use autenticação segura por e-mail e senha.');
    };
    window.switchDemonstrationUser = function() {
      alert('Troca demonstrativa desativada na preview segura.');
    };

    const originalToggleAuthTab = window.toggleAuthTab;
    if (typeof originalToggleAuthTab === 'function') {
      window.toggleAuthTab = function(tab) {
        const u = currentUser();
        if (tab === 'demo') tab = 'login';
        if (tab === 'register' && !canManageUsers(u)) tab = 'login';
        return originalToggleAuthTab.call(this, tab);
      };
    }

    const originalOpenModal = window.openModal;
    if (typeof originalOpenModal === 'function') {
      window.openModal = function(id) {
        if (id === 'modal-auth-flow' && currentUser() && !canManageUsers(currentUser())) {
          applyRoleUi();
          alert('Seu perfil de Vereador pode cadastrar somente lideranças.');
          return;
        }
        const result = originalOpenModal.apply(this, arguments);
        setTimeout(applyRoleUi, 0);
        return result;
      };
    }
  }

  function installCandidateBehavior() {
    const sel = document.getElementById('cand-select');
    if (!sel || sel.__vfRecoveryCandidateHandler) return;
    sel.__vfRecoveryCandidateHandler = true;
    sel.addEventListener('change', function(e) {
      try {
        if (window.state) window.state.selectedCandidate = e.target.value;
        if (typeof window.renderMapColegios === 'function') window.renderMapColegios();
        if (typeof window.renderTableColegios === 'function') window.renderTableColegios();
        if (typeof window.switchView === 'function') window.switchView('colegios');
        setTimeout(function() {
          if (typeof window.renderTableColegios === 'function') window.renderTableColegios();
        }, 40);
      } catch (err) { console.error('Filtro de candidato:', err); }
    });
  }

  function installUiRefreshHook() {
    if (typeof window.updateUserProfileUI === 'function' && !window.updateUserProfileUI.__vfRecoveryWrapped) {
      const original = window.updateUserProfileUI;
      const wrapped = function() {
        const r = original.apply(this, arguments);
        applyRoleUi();
        return r;
      };
      wrapped.__vfRecoveryWrapped = true;
      window.updateUserProfileUI = wrapped;
    }
  }

  function installPreviewBadge() {
    if (document.getElementById('vf-recovery-preview-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'vf-recovery-preview-badge';
    badge.textContent = 'PREVIEW RECUPERADA · NÃO PUBLICADA';
    badge.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:99999;background:#7f1d1d;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:8px;padding:6px 10px;font:700 11px/1.2 Inter,sans-serif;box-shadow:0 5px 20px rgba(0,0,0,.4);pointer-events:none;';
    document.body.appendChild(badge);
  }

  function boot() {
    installServiceGuards();
    installLegacyBlocks();
    installCandidateBehavior();
    installUiRefreshHook();
    installPreviewBadge();
    applyRoleUi();

    // Após o cliente Supabase restaurar a sessão, reaplica a UI correta.
    setTimeout(applyRoleUi, 250);
    setTimeout(applyRoleUi, 900);

    if (document.body && typeof MutationObserver !== 'undefined') {
      const obs = new MutationObserver(function() { applyRoleUi(); });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
