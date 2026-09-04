/**
 * VOTO FORTE ARAPONGAS - release estavel aprovado em 03/09/2026
 *
 * Esta ponte preserva integralmente o HTML/app.js/styles do ponto estavel
 * e carrega o cliente Supabase seguro validado na preview.
 *
 * IMPORTANTE: os dois ajustes posteriores (ocultar "Cadastrar Novo Vereador"
 * e isolar calculos de Distritos por vereador) NAO fazem parte desta release.
 */

// Carrega de forma sincrona o cliente seguro exato usado na preview.
document.write('<script src="secure_client_stable_v6.js?v=0ebef349"><\/script>');

(function installStablePreviewCompatibility() {
    'use strict';

    let synced = false;
    let candidateInstalled = false;

    async function waitForRemoteAndSync() {
        const svc = window.SupabaseService;
        if (!svc) return false;

        try {
            if (svc.remoteReady) await svc.remoteReady;
        } catch (err) {
            console.warn('Supabase: falha ao restaurar sessao.', err);
        }

        // app.js declara state no escopo global classico. Neste ponto ele ja deve existir.
        if (typeof state === 'undefined') return false;

        const current = svc.getCurrentUser ? svc.getCurrentUser() : null;
        state.currentUser = current || null;

        try {
            if (current) {
                if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
                if (typeof loadLiderancas === 'function') loadLiderancas();
                if (typeof populateCandidateSelect === 'function') populateCandidateSelect();
                if (typeof renderAllViews === 'function') renderAllViews();
                if (typeof closeModal === 'function') closeModal('modal-auth-flow');
            } else {
                if (typeof openModal === 'function') openModal('modal-auth-flow');
                if (typeof toggleAuthTab === 'function') toggleAuthTab('login');
            }
        } catch (err) {
            console.warn('Supabase: falha ao sincronizar sessao com a interface.', err);
        }

        synced = true;
        return true;
    }

    function disableLegacyIdentitySwitching() {
        window.switchDemonstrationUser = function() {
            alert('Troca demonstrativa desativada. Use e-mail e senha.');
        };
        window.quickLoginDemo = function() {
            alert('Acesso rapido desativado. Use e-mail e senha.');
        };
        window.handleBiometricLogin = function() {
            alert('Biometria temporariamente desativada. Use e-mail e senha.');
        };

        const picker = document.getElementById('auth-demo-picker');
        if (picker) picker.style.display = 'none';
        const demoTab = document.getElementById('btn-tab-auth-demo');
        if (demoTab) demoTab.style.display = 'none';
    }

    function installRealLogout() {
        window.handleLogout = async function() {
            if (!confirm('Deseja realmente sair da sua conta e desconectar deste aparelho?')) return;

            const svc = window.SupabaseService;
            const current = svc && svc.getCurrentUser ? svc.getCurrentUser() : null;
            try {
                if (current && svc && svc.logAudit) {
                    svc.logAudit(current, 'login', 'Logout realizado', `Usuario ${current.nome || ''} encerrou a sessao no dispositivo`);
                }
                if (svc && svc.logout) await svc.logout();
            } catch (err) {
                console.warn('Falha ao encerrar sessao Supabase.', err);
            }

            try {
                if (typeof state !== 'undefined') state.currentUser = null;
            } catch (_) {}
            localStorage.removeItem('mapa_eleitoral_current_user_v5');
            localStorage.removeItem('mapa_eleitoral_last_active_user');
            location.reload();
        };
    }

    function installCandidateCollegeBehavior() {
        if (candidateInstalled) return;
        const sel = document.getElementById('cand-select');
        if (!sel) return;

        candidateInstalled = true;
        sel.addEventListener('change', function(e) {
            try {
                // O listener original do app atualiza state.selectedCandidate primeiro.
                if (typeof state !== 'undefined') state.selectedCandidate = e.target.value;
                if (typeof renderMapColegios === 'function') renderMapColegios();
                if (typeof renderTableColegios === 'function') renderTableColegios();
                if (typeof switchView === 'function') switchView('colegios');
                setTimeout(function() {
                    if (typeof renderTableColegios === 'function') renderTableColegios();
                }, 40);
            } catch (err) {
                console.error('Filtro de candidato:', err);
            }
        });
    }

    function finalizeStableBehavior() {
        disableLegacyIdentitySwitching();
        installRealLogout();
        installCandidateCollegeBehavior();
    }

    async function bootAfterApp() {
        // Espera o listener DOMContentLoaded do app.js terminar antes de reassociar a sessao.
        setTimeout(async function retrySync() {
            const ok = await waitForRemoteAndSync();
            finalizeStableBehavior();
            if (!ok) setTimeout(retrySync, 120);
        }, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootAfterApp, { once: true });
    } else {
        bootAfterApp();
    }

    // Fallback para navegadores/dispositivos lentos.
    window.addEventListener('load', function() {
        if (!synced) waitForRemoteAndSync();
        finalizeStableBehavior();
    }, { once: true });
})();
