/**
 * VOTO FORTE ARAPONGAS - secure client compatibility loader
 *
 * Loads the previously tested secure client and adds role-based privacy
 * guards required by the security preview.
 */
(function () {
    'use strict';

    var PREVIOUS_SECURE_CLIENT = 'https://cdn.jsdelivr.net/gh/evertonr415-beep/mapa-eleitoral@0ebef3492e8f18e44f64c702e3d4c418643fda8d/supabase_client.js';

    function installRuntimePatch() {
        'use strict';

        var service = window.SupabaseService;
        if (!service || service.__vfRolePrivacyPatchInstalled) return;
        service.__vfRolePrivacyPatchInstalled = true;

        function getCurrent() {
            try {
                return service.getCurrentUser ? service.getCurrentUser() : null;
            } catch (_) {
                return null;
            }
        }

        function canManageUsers(user) {
            return !!user && (user.role === 'master' || user.role === 'adm');
        }

        // Defense in depth for leadership privacy. Any legacy screen that asks for
        // the raw leadership cache receives only the scope allowed for the session.
        if (typeof service.getAllLiderancasRaw === 'function') {
            var getRawLeadersUnsafe = service.getAllLiderancasRaw.bind(service);
            service.__vfGetAllLiderancasRawUnsafe = getRawLeadersUnsafe;
            service.getAllLiderancasRaw = function () {
                var all = getRawLeadersUnsafe() || [];
                var current = getCurrent();
                if (!current) return [];
                if (current.role === 'master') return all;

                if (current.role === 'adm') {
                    var users = [];
                    try {
                        users = typeof service.getAllUsersRaw === 'function' ? (service.getAllUsersRaw() || []) : [];
                    } catch (_) {}
                    var allowed = new Set([current.id]);
                    users.forEach(function (user) {
                        if (user && user.role === 'vereador' && user.admVinculadoId === current.id) {
                            allowed.add(user.id);
                        }
                    });
                    return all.filter(function (item) {
                        return item && allowed.has(item.vereadorId);
                    });
                }

                return all.filter(function (item) {
                    return item && item.vereadorId === current.id;
                });
            };
        }

        // A basic/vereador account can never create another vereador, even if
        // someone tries to call the registration method directly from devtools.
        if (typeof service.registerVereador === 'function') {
            var originalRegisterVereador = service.registerVereador.bind(service);
            service.registerVereador = async function (formData) {
                var current = getCurrent();
                if (!current || !canManageUsers(current)) {
                    throw new Error('Novos vereadores so podem ser cadastrados por Master/Administrador.');
                }
                return originalRegisterVereador(formData);
            };
        }

        function findRegisterButton() {
            var root = document.getElementById('view-users-management');
            if (!root) return null;
            var buttons = root.querySelectorAll('button');
            for (var i = 0; i < buttons.length; i += 1) {
                if ((buttons[i].textContent || '').toLowerCase().indexOf('cadastrar novo vereador') !== -1) {
                    return buttons[i];
                }
            }
            return null;
        }

        function enforceRoleUi() {
            var current = getCurrent();
            var allowed = canManageUsers(current);
            var registerButton = findRegisterButton();
            if (registerButton) {
                registerButton.style.display = allowed ? '' : 'none';
                registerButton.setAttribute('aria-hidden', allowed ? 'false' : 'true');
                registerButton.disabled = !allowed;
            }

            // Registration is only exposed to Master/Adm. Logged-out users see
            // the login path only; Vereador users keep leadership management only.
            var regTab = document.getElementById('btn-tab-auth-register');
            var regForm = document.getElementById('form-auth-register');
            if (!allowed) {
                if (regTab) regTab.style.display = 'none';
                if (regForm) regForm.style.display = 'none';
            } else {
                if (regTab) regTab.style.display = '';
            }
        }

        function installUiHooks() {
            if (window.__vfRoleUiHooksInstalled) {
                enforceRoleUi();
                return;
            }
            window.__vfRoleUiHooksInstalled = true;

            if (typeof window.openModal === 'function') {
                var originalOpenModal = window.openModal;
                window.openModal = function (id) {
                    var current = getCurrent();
                    if (id === 'modal-auth-flow' && current && !canManageUsers(current)) {
                        enforceRoleUi();
                        alert('Seu perfil de Vereador pode cadastrar somente liderancas. Novos usuarios sao gerenciados por Master/Administrador.');
                        return;
                    }
                    return originalOpenModal.apply(this, arguments);
                };
            }

            if (typeof window.toggleAuthTab === 'function') {
                var originalToggleAuthTab = window.toggleAuthTab;
                window.toggleAuthTab = function (tab) {
                    var current = getCurrent();
                    if (tab === 'register' && !canManageUsers(current)) {
                        enforceRoleUi();
                        return originalToggleAuthTab.call(this, 'login');
                    }
                    return originalToggleAuthTab.apply(this, arguments);
                };
            }

            if (typeof window.updateUserProfileUI === 'function') {
                var originalUpdateUserProfileUI = window.updateUserProfileUI;
                window.updateUserProfileUI = function () {
                    var result = originalUpdateUserProfileUI.apply(this, arguments);
                    enforceRoleUi();
                    return result;
                };
            }

            if (typeof window.renderDistritosView === 'function') {
                var originalRenderDistritosView = window.renderDistritosView;
                window.renderDistritosView = function () {
                    // The legacy renderer reads the leadership cache. The cache is
                    // role-scoped above, so counts/meta cannot leak other users.
                    return originalRenderDistritosView.apply(this, arguments);
                };
            }

            enforceRoleUi();

            if (document.body && typeof MutationObserver !== 'undefined') {
                var observer = new MutationObserver(function (mutations) {
                    var shouldCheck = mutations.some(function (m) {
                        return m.type === 'childList' && m.addedNodes && m.addedNodes.length > 0;
                    });
                    if (shouldCheck) enforceRoleUi();
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', installUiHooks, { once: true });
        } else {
            installUiHooks();
        }

        window.VotoForteRolePrivacy = {
            enforce: enforceRoleUi,
            canManageUsers: canManageUsers
        };
    }

    if (document.readyState === 'loading') {
        document.write('<script src="' + PREVIOUS_SECURE_CLIENT + '"><\\/script>');
        document.write('<script>(' + installRuntimePatch.toString() + ')();<\\/script>');
    } else {
        var oldScript = document.createElement('script');
        oldScript.src = PREVIOUS_SECURE_CLIENT;
        oldScript.onload = installRuntimePatch;
        oldScript.onerror = function () {
            console.error('Falha ao carregar o cliente seguro base.');
        };
        document.head.appendChild(oldScript);
    }
})();
