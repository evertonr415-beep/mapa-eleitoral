/**
 * VOTO FORTE ARAPONGAS - ponte de compatibilidade da versao segura
 * Mantem a interface estavel e reassocia a sessao real do Supabase ao estado do app.
 */

document.write('<script src="secure_client_core.js"><\/script>');

window.addEventListener('load', async () => {
    const svc = window.SupabaseService;
    if (!svc) return;

    try {
        if (svc.remoteReady) await svc.remoteReady;
    } catch (err) {
        console.warn('Falha ao restaurar sessao Supabase:', err);
    }

    // Reassocia a sessao autenticada ao estado do aplicativo depois que app.js terminou de carregar.
    try {
        const current = svc.getCurrentUser ? svc.getCurrentUser() : null;
        if (typeof state !== 'undefined') state.currentUser = current || null;

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
        console.warn('Falha ao sincronizar sessao com a interface:', err);
    }

    // Atalhos locais antigos ficam desativados; login deve passar pelo Supabase Auth.
    window.switchDemonstrationUser = function() {
        alert('Troca demonstrativa desativada. Use e-mail e senha.');
    };
    window.quickLoginDemo = function() {
        alert('Acesso rápido desativado. Use e-mail e senha.');
    };
    window.handleBiometricLogin = function() {
        alert('Biometria temporariamente desativada. Use e-mail e senha.');
    };

    const demo = document.getElementById('auth-demo-picker');
    if (demo) demo.style.display = 'none';
    const demoTab = document.getElementById('btn-tab-auth-demo');
    if (demoTab) demoTab.style.display = 'none';

    // Logout real: encerra a sessao Supabase antes de recarregar a pagina.
    window.handleLogout = async function() {
        if (!confirm('Deseja realmente sair da sua conta e desconectar deste aparelho?')) return;
        const current = svc.getCurrentUser ? svc.getCurrentUser() : null;
        try {
            if (current && svc.logAudit) {
                svc.logAudit(current, 'login', 'Logout realizado', `Usuário ${current.nome || ''} encerrou a sessão no dispositivo`);
            }
            if (svc.logout) await svc.logout();
        } catch (err) {
            console.warn('Falha ao encerrar sessao:', err);
        }
        localStorage.removeItem('mapa_eleitoral_current_user_v5');
        localStorage.removeItem('mapa_eleitoral_last_active_user');
        location.reload();
    };

    // Comportamento validado na preview: selecionar candidato abre Colegios e atualiza os votos por local.
    const sel = document.getElementById('cand-select');
    if (sel && !sel.__vfStableCandidateHandler) {
        sel.__vfStableCandidateHandler = true;
        sel.addEventListener('change', function() {
            try {
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
});
