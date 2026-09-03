(function () {
  'use strict';

  function currentUser() {
    try {
      return window.SupabaseService && window.SupabaseService.getCurrentUser
        ? window.SupabaseService.getCurrentUser()
        : null;
    } catch (_) {
      return null;
    }
  }

  function canManageUsers(user) {
    return !!user && (user.role === 'master' || user.role === 'adm');
  }

  function findRegisterButtons() {
    return Array.from(document.querySelectorAll('button')).filter(function (btn) {
      return (btn.textContent || '').toLowerCase().includes('cadastrar novo vereador');
    });
  }

  function normalizeLeadershipLabels() {
    Array.from(document.querySelectorAll('button')).forEach(function (btn) {
      var text = (btn.textContent || '').trim();
      if (text === '+ Liderança' || text === '+ + Liderança') {
        var span = btn.querySelector('span');
        if (span) span.textContent = 'Liderança';
        else btn.textContent = 'Liderança';
      }
    });
  }

  function enforceUi() {
    var user = currentUser();
    var allowed = canManageUsers(user);

    findRegisterButtons().forEach(function (btn) {
      btn.style.display = allowed ? '' : 'none';
      btn.disabled = !allowed;
      btn.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    });

    var regTab = document.getElementById('btn-tab-auth-register');
    var regForm = document.getElementById('form-auth-register');
    if (user && !allowed) {
      if (regTab) regTab.style.display = 'none';
      if (regForm) regForm.style.display = 'none';
    } else if (allowed) {
      if (regTab) regTab.style.display = '';
    }

    normalizeLeadershipLabels();
  }

  function installGuards() {
    if (window.__vfPreviewRolePatchInstalled) {
      enforceUi();
      return;
    }
    window.__vfPreviewRolePatchInstalled = true;

    var service = window.SupabaseService;
    if (service && typeof service.registerVereador === 'function' && !service.__vfRegisterGuardInstalled) {
      service.__vfRegisterGuardInstalled = true;
      var originalRegister = service.registerVereador.bind(service);
      service.registerVereador = async function (formData) {
        var user = currentUser();
        if (user && !canManageUsers(user)) {
          throw new Error('Seu perfil pode cadastrar apenas liderancas. Novos vereadores sao gerenciados por Master/Administrador.');
        }
        return originalRegister(formData);
      };
    }

    document.addEventListener('click', function (event) {
      var btn = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!btn) return;
      if ((btn.textContent || '').toLowerCase().includes('cadastrar novo vereador')) {
        var user = currentUser();
        if (user && !canManageUsers(user)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          enforceUi();
          alert('Seu perfil de Vereador pode cadastrar somente liderancas.');
        }
      }
    }, true);

    if (typeof window.openModal === 'function' && !window.__vfOpenModalGuardInstalled) {
      window.__vfOpenModalGuardInstalled = true;
      var originalOpenModal = window.openModal;
      window.openModal = function (id) {
        var user = currentUser();
        if (id === 'modal-auth-flow' && user && !canManageUsers(user)) {
          enforceUi();
          alert('Seu perfil de Vereador pode cadastrar somente liderancas.');
          return;
        }
        return originalOpenModal.apply(this, arguments);
      };
    }

    if (typeof MutationObserver !== 'undefined' && document.body) {
      var observer = new MutationObserver(enforceUi);
      observer.observe(document.body, { childList: true, subtree: true, attributes: false });
    }

    window.setInterval(enforceUi, 500);
    enforceUi();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installGuards, { once: true });
  } else {
    installGuards();
  }
})();
