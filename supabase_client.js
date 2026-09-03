/**
 * VOTO FORTE ARAPONGAS - cliente seguro v6
 *
 * Objetivos desta versao:
 * - nenhum token privado no navegador;
 * - nenhum banco de senhas em arquivo publico;
 * - nenhuma conta Master automatica;
 * - nenhuma senha universal/padrao;
 * - nenhuma sincronizacao de dados via GitHub;
 * - suporte a Supabase Auth + RLS quando configurado;
 * - preview segura com dados ficticios quando ainda nao ha Supabase dedicado.
 */

const STORAGE_PREFIX = 'mapa_eleitoral_secure_v6';
const LOCAL_STORAGE_USERS = `${STORAGE_PREFIX}_users`;
const LOCAL_STORAGE_LIDERANCAS = `${STORAGE_PREFIX}_liderancas`;
const LOCAL_STORAGE_SESSION = `${STORAGE_PREFIX}_session`;
const LOCAL_STORAGE_AUDIT = `${STORAGE_PREFIX}_audit`;
const LOCAL_STORAGE_DISTRICTS = `${STORAGE_PREFIX}_districts`;
const SUPABASE_CONFIG_KEY = `${STORAGE_PREFIX}_supabase_config`;
const DEFAULT_EMAIL_DOMAIN = '@campanha.com.br';

const PREVIEW_USER = Object.freeze({
    id: 'preview-master',
    nome: 'Preview Segura',
    email: 'preview@votofortearapongas.local',
    cpf: '',
    whatsapp: '',
    cargo: 'Ambiente de Preview',
    partido: 'Preview',
    numeroCandidato: 'PREVIEW',
    role: 'master',
    avatar: '🛡️',
    primeiroAcesso: false,
    isPreview: true
});
const PREVIEW_PASSWORD = 'Preview@2026';

function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
}

function safeJsonParse(raw, fallback) {
    try {
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}

function normalizeEmail(input) {
    const clean = String(input || '').trim().toLowerCase();
    if (!clean) return '';
    return clean.includes('@') ? clean : clean + DEFAULT_EMAIL_DOMAIN;
}

function sanitizeProfile(profile) {
    if (!profile) return null;
    const clean = { ...profile };
    delete clean.senha;
    delete clean.password;
    delete clean.confirmationPin;
    delete clean.confirmationToken;
    return clean;
}

class SecureSupabaseService {
    constructor() {
        this.config = this.loadConfig();
        this.client = null;
        this.remoteMode = Boolean(this.config.url && this.config.publishableKey);
        this.remoteReady = this.initRemote();
        this.initStorage();
    }

    loadConfig() {
        const fromWindow = window.VOTO_FORTE_CONFIG || {};
        const fromStorage = safeJsonParse(localStorage.getItem(SUPABASE_CONFIG_KEY), {});
        const url = String(fromWindow.supabaseUrl || fromStorage.url || '').trim();
        const publishableKey = String(
            fromWindow.supabasePublishableKey ||
            fromWindow.supabaseAnonKey ||
            fromStorage.publishableKey ||
            fromStorage.anonKey ||
            ''
        ).trim();
        return { url, publishableKey, anonKey: publishableKey, connected: Boolean(url && publishableKey) };
    }

    getConfig() {
        return {
            url: this.config.url,
            key: this.config.publishableKey,
            publishableKey: this.config.publishableKey,
            connected: this.remoteMode
        };
    }

    saveConfig(url, publishableKey) {
        const next = {
            url: String(url || '').trim(),
            publishableKey: String(publishableKey || '').trim()
        };
        if (!next.url || !next.publishableKey) {
            throw new Error('Informe a URL e a chave publica/publishable do Supabase.');
        }
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(next));
        this.config = { ...next, anonKey: next.publishableKey, connected: true };
        this.remoteMode = true;
        this.remoteReady = this.initRemote();
        return true;
    }

    initStorage() {
        if (!localStorage.getItem(LOCAL_STORAGE_USERS)) localStorage.setItem(LOCAL_STORAGE_USERS, '[]');
        if (!localStorage.getItem(LOCAL_STORAGE_LIDERANCAS)) localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, '[]');
        if (!localStorage.getItem(LOCAL_STORAGE_AUDIT)) localStorage.setItem(LOCAL_STORAGE_AUDIT, '[]');
        if (!localStorage.getItem(LOCAL_STORAGE_DISTRICTS)) localStorage.setItem(LOCAL_STORAGE_DISTRICTS, '{}');
    }

    async initRemote() {
        if (!this.remoteMode) return false;
        try {
            const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            this.client = mod.createClient(this.config.url, this.config.publishableKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });

            const { data } = await this.client.auth.getSession();
            if (data && data.session && data.session.user) {
                await this.refreshRemoteCache(data.session.user.id);
            }
            return true;
        } catch (error) {
            console.error('Falha ao inicializar Supabase seguro:', error);
            this.client = null;
            return false;
        }
    }

    // Compatibilidade: GitHub deixou de ser banco. Estes metodos agora apenas atualizam o cache remoto quando houver Supabase.
    initCloudSync() { return false; }
    notifyLocalChange() { return true; }
    async pullFromCloud() {
        if (this.remoteMode && this.client) {
            const current = this.getCurrentUser();
            if (current && current.id && !current.isPreview) await this.refreshRemoteCache(current.id);
        }
        return true;
    }
    async pushToCloud() { return true; }

    getAllUsersRaw() {
        return safeJsonParse(localStorage.getItem(LOCAL_STORAGE_USERS), []);
    }

    setAllUsersRaw(users) {
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify((users || []).map(sanitizeProfile)));
    }

    getAllLiderancasRaw() {
        return safeJsonParse(localStorage.getItem(LOCAL_STORAGE_LIDERANCAS), []);
    }

    setAllLiderancasRaw(items) {
        localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(items || []));
    }

    getCurrentUser() {
        const session = safeJsonParse(localStorage.getItem(LOCAL_STORAGE_SESSION), null);
        return session ? sanitizeProfile(session) : null;
    }

    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(LOCAL_STORAGE_SESSION);
            return;
        }
        localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(sanitizeProfile(user)));
    }

    async logout() {
        try {
            if (this.client) await this.client.auth.signOut();
        } catch (_) {}
        localStorage.removeItem(LOCAL_STORAGE_SESSION);
    }

    async signIn(inputEmailOrUser, password) {
        const email = normalizeEmail(inputEmailOrUser);
        const suppliedPassword = String(password || '');

        // Preview isolada: credencial conhecida, mas sem qualquer dado real ou acesso de producao.
        if (!this.remoteMode) {
            if (email !== PREVIEW_USER.email || suppliedPassword !== PREVIEW_PASSWORD) {
                throw new Error('Preview segura: use a credencial de teste informada na revisao. Nenhuma conta real e carregada aqui.');
            }
            this.setAllUsersRaw([PREVIEW_USER]);
            this.setCurrentUser(PREVIEW_USER);
            this.logAudit(PREVIEW_USER, 'login', 'Preview autenticada', 'Acesso ao ambiente isolado de demonstracao');
            return clone(PREVIEW_USER);
        }

        await this.remoteReady;
        if (!this.client) throw new Error('Nao foi possivel conectar ao Supabase.');
        const { data, error } = await this.client.auth.signInWithPassword({ email, password: suppliedPassword });
        if (error) throw new Error('E-mail ou senha invalidos.');
        if (!data.user) throw new Error('Sessao de usuario nao criada.');

        const profile = await this.fetchOwnProfile(data.user.id);
        if (!profile) throw new Error('Perfil de acesso nao encontrado. Contate um administrador.');
        this.setCurrentUser(profile);
        await this.refreshRemoteCache(data.user.id);
        this.logAudit(profile, 'login', 'Autenticacao realizada', `Login seguro para ${profile.email}`);
        return clone(profile);
    }

    async fetchOwnProfile(userId) {
        if (!this.client) return null;
        const { data, error } = await this.client
            .from('perfis_usuarios')
            .select('id,nome,email,whatsapp,cpf,partido,numero_candidato,cargo,role,avatar_url,adm_vinculado_id,criado_em,atualizado_em')
            .eq('id', userId)
            .maybeSingle();
        if (error) throw error;
        return data ? this.mapProfileFromDb(data) : null;
    }

    mapProfileFromDb(row) {
        return {
            id: row.id,
            nome: row.nome,
            email: row.email,
            whatsapp: row.whatsapp || '',
            cpf: row.cpf || '',
            partido: row.partido || '',
            numeroCandidato: row.numero_candidato || '',
            cargo: row.cargo || 'Vereador',
            role: row.role || 'vereador',
            avatar: row.avatar_url || '🗳️',
            admVinculadoId: row.adm_vinculado_id || null,
            primeiroAcesso: false
        };
    }

    mapLiderancaFromDb(row) {
        return {
            id: row.id,
            vereadorId: row.vereador_id,
            vereadorNome: row.vereador_nome || '',
            partido: row.partido || '',
            nome: row.nome_lideranca,
            whatsapp: row.whatsapp || '',
            telefone: row.telefone || '',
            bairro: row.bairro || '',
            logradouro: row.logradouro || '',
            numero: row.numero || '',
            cep: row.cep || '',
            lat: Number(row.lat),
            lng: Number(row.lng),
            colegioId: row.colegio_referencia_id || '',
            colegioNome: row.colegio_nome || '',
            metaVotos: Number(row.meta_votos || 20),
            categoria: row.categoria || 'Geral',
            status: row.status_contato || 'Ativo',
            observacoes: row.observacoes || '',
            criadoEm: row.criado_em,
            atualizadoEm: row.atualizado_em
        };
    }

    async refreshRemoteCache() {
        if (!this.client) return false;
        const [{ data: profiles, error: profilesError }, { data: leaders, error: leadersError }] = await Promise.all([
            this.client.from('perfis_usuarios').select('id,nome,email,whatsapp,cpf,partido,numero_candidato,cargo,role,avatar_url,adm_vinculado_id,criado_em,atualizado_em'),
            this.client.from('liderancas').select('*')
        ]);
        if (profilesError) throw profilesError;
        if (leadersError) throw leadersError;
        this.setAllUsersRaw((profiles || []).map(row => this.mapProfileFromDb(row)));
        this.setAllLiderancasRaw((leaders || []).map(row => this.mapLiderancaFromDb(row)));
        return true;
    }

    async registerVereador(formData) {
        if (!this.remoteMode) {
            throw new Error('Cadastro real desativado na preview isolada. O cadastro sera habilitado somente no Supabase seguro.');
        }
        await this.remoteReady;
        if (!this.client) throw new Error('Nao foi possivel conectar ao Supabase.');

        const email = normalizeEmail(formData.email);
        const password = String(formData.senha || '');
        if (password.length < 8) throw new Error('A senha deve ter no minimo 8 caracteres.');

        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: { nome: String(formData.nome || '').trim() }
            }
        });
        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Nao foi possivel criar o usuario.');

        const profilePayload = {
            id: data.user.id,
            nome: String(formData.nome || '').trim(),
            email,
            whatsapp: String(formData.whatsapp || '').replace(/\D/g, ''),
            cpf: String(formData.cpf || '').replace(/\D/g, ''),
            partido: String(formData.partido || 'Independente'),
            numero_candidato: String(formData.numeroCandidato || ''),
            cargo: String(formData.cargo || 'Vereador'),
            role: 'vereador',
            avatar_url: '🗳️'
        };

        // Se confirmacao de e-mail estiver ativa, a sessao pode nao existir ainda; o trigger do banco cria o perfil minimo.
        if (data.session) {
            const { error: profileError } = await this.client
                .from('perfis_usuarios')
                .upsert(profilePayload, { onConflict: 'id' });
            if (profileError) throw new Error(profileError.message);
        }

        const user = this.mapProfileFromDb(profilePayload);
        if (data.session) {
            this.setCurrentUser(user);
            await this.refreshRemoteCache();
        }
        return {
            user,
            emailResult: {
                success: true,
                email,
                pendingConfirmation: !data.session
            }
        };
    }

    async changePassword(userId, currentPass, newPass) {
        if (!newPass || String(newPass).length < 8) throw new Error('A nova senha deve ter no minimo 8 caracteres.');
        const current = this.getCurrentUser();
        if (!current || current.id !== userId) throw new Error('Sessao invalida.');

        if (!this.remoteMode) {
            if (current.isPreview) throw new Error('Alteracao de senha desativada na preview isolada.');
            throw new Error('Supabase seguro ainda nao configurado.');
        }

        await this.remoteReady;
        const email = current.email;
        const { error: verifyError } = await this.client.auth.signInWithPassword({ email, password: String(currentPass || '') });
        if (verifyError) throw new Error('A senha atual informada esta incorreta.');
        const { error } = await this.client.auth.updateUser({ password: String(newPass) });
        if (error) throw new Error(error.message);
        this.logAudit(current, 'senha', 'Senha alterada', 'Senha atualizada via Supabase Auth');
        return true;
    }

    getUsers(currentUser) {
        if (!currentUser) return [];
        const all = this.getAllUsersRaw().map(sanitizeProfile);
        if (currentUser.role === 'master') return all;
        if (currentUser.role === 'adm') {
            return all.filter(u => u.id === currentUser.id || (u.role === 'vereador' && u.admVinculadoId === currentUser.id));
        }
        return all.filter(u => u.id === currentUser.id);
    }

    getLiderancas(currentUser) {
        if (!currentUser) return [];
        const all = this.getAllLiderancasRaw();
        if (currentUser.role === 'master') return all;
        if (currentUser.role === 'adm') {
            const allowedUserIds = new Set(this.getUsers(currentUser).map(u => u.id));
            return all.filter(item => allowedUserIds.has(item.vereadorId));
        }
        return all.filter(item => item.vereadorId === currentUser.id);
    }

    createLideranca(liderancaData, currentUser) {
        if (!currentUser) throw new Error('Faca login para cadastrar uma lideranca.');
        const all = this.getAllLiderancasRaw();
        const item = {
            id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `lid-${Date.now()}`,
            vereadorId: currentUser.id,
            vereadorNome: currentUser.nome,
            partido: currentUser.partido || '',
            nome: String(liderancaData.nome || '').trim(),
            whatsapp: String(liderancaData.whatsapp || '').replace(/\D/g, ''),
            telefone: String(liderancaData.telefone || ''),
            cep: String(liderancaData.cep || ''),
            bairro: String(liderancaData.bairro || '').trim(),
            logradouro: String(liderancaData.logradouro || ''),
            numero: String(liderancaData.numero || ''),
            lat: Number(liderancaData.lat),
            lng: Number(liderancaData.lng),
            colegioId: String(liderancaData.colegioId || ''),
            colegioNome: String(liderancaData.colegioNome || ''),
            metaVotos: Number(liderancaData.metaVotos || 20),
            categoria: String(liderancaData.categoria || 'Geral'),
            status: String(liderancaData.status || 'Ativo'),
            observacoes: String(liderancaData.observacoes || ''),
            criadoEm: new Date().toISOString()
        };
        all.unshift(item);
        this.setAllLiderancasRaw(all);
        this.logAudit(currentUser, 'lideranca', 'Lideranca criada', `${item.nome} - ${item.bairro}`);

        if (this.remoteMode && this.client && !currentUser.isPreview) {
            this.client.from('liderancas').insert({
                id: item.id,
                vereador_id: currentUser.id,
                nome_lideranca: item.nome,
                whatsapp: item.whatsapp,
                telefone: item.telefone || null,
                bairro: item.bairro,
                logradouro: item.logradouro || null,
                numero: item.numero || null,
                cep: item.cep || null,
                lat: item.lat,
                lng: item.lng,
                colegio_referencia_id: item.colegioId || null,
                meta_votos: item.metaVotos,
                categoria: item.categoria,
                status_contato: item.status,
                observacoes: item.observacoes || null
            }).then(({ error }) => { if (error) console.error('Falha ao salvar lideranca:', error); });
        }
        return clone(item);
    }

    updateLideranca(id, updatedData, currentUser) {
        const all = this.getAllLiderancasRaw();
        const index = all.findIndex(item => item.id === id);
        if (index < 0) return null;
        const original = all[index];
        if (!currentUser || (currentUser.role !== 'master' && original.vereadorId !== currentUser.id)) {
            throw new Error('Voce nao tem permissao para editar esta lideranca.');
        }
        all[index] = { ...original, ...updatedData, atualizadoEm: new Date().toISOString() };
        this.setAllLiderancasRaw(all);
        this.logAudit(currentUser, 'lideranca', 'Lideranca atualizada', all[index].nome);

        if (this.remoteMode && this.client && !currentUser.isPreview) {
            const patch = {};
            if ('status' in updatedData) patch.status_contato = updatedData.status;
            if ('observacoes' in updatedData) patch.observacoes = updatedData.observacoes;
            if ('nome' in updatedData) patch.nome_lideranca = updatedData.nome;
            patch.atualizado_em = new Date().toISOString();
            this.client.from('liderancas').update(patch).eq('id', id)
                .then(({ error }) => { if (error) console.error('Falha ao atualizar lideranca:', error); });
        }
        return clone(all[index]);
    }

    deleteLideranca(id, currentUser) {
        const all = this.getAllLiderancasRaw();
        const item = all.find(row => row.id === id);
        if (!item) return false;
        if (!currentUser || (currentUser.role !== 'master' && item.vereadorId !== currentUser.id)) {
            throw new Error('Voce nao tem permissao para excluir esta lideranca.');
        }
        this.setAllLiderancasRaw(all.filter(row => row.id !== id));
        this.logAudit(currentUser, 'lideranca', 'Lideranca excluida', item.nome);
        if (this.remoteMode && this.client && !currentUser.isPreview) {
            this.client.from('liderancas').delete().eq('id', id)
                .then(({ error }) => { if (error) console.error('Falha ao excluir lideranca:', error); });
        }
        return true;
    }

    logAudit(user, type, actionText, detailsText) {
        const logs = safeJsonParse(localStorage.getItem(LOCAL_STORAGE_AUDIT), []);
        const entry = {
            id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: user ? user.id : null,
            userName: user ? user.nome : 'Visitante',
            userRole: user ? user.role : 'anonimo',
            userEmail: user ? user.email : '',
            type: type || 'sistema',
            action: String(actionText || ''),
            details: String(detailsText || ''),
            device: navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Computador'
        };
        logs.unshift(entry);
        localStorage.setItem(LOCAL_STORAGE_AUDIT, JSON.stringify(logs.slice(0, 500)));
        if (this.remoteMode && this.client && user && !user.isPreview) {
            this.client.from('audit_logs').insert({
                id: entry.id,
                user_id: user.id,
                tipo: entry.type,
                acao: entry.action,
                detalhes: entry.details,
                dispositivo: entry.device
            }).then(({ error }) => { if (error) console.warn('Falha ao registrar auditoria remota:', error); });
        }
        return clone(entry);
    }

    getAuditLogs(currentUser, filterType = 'all') {
        if (!currentUser) return [];
        let logs = safeJsonParse(localStorage.getItem(LOCAL_STORAGE_AUDIT), []);
        if (currentUser.role === 'adm') logs = logs.filter(row => row.userRole !== 'master');
        if (currentUser.role === 'vereador') logs = logs.filter(row => row.userId === currentUser.id);
        if (filterType !== 'all') logs = logs.filter(row => row.type === filterType);
        return logs;
    }

    getDistrictAssignments() {
        return safeJsonParse(localStorage.getItem(LOCAL_STORAGE_DISTRICTS), {});
    }

    saveDistrictAssignment(districtId, vereadorId, vereadorNome, currentUser) {
        if (!currentUser || currentUser.role !== 'master') {
            throw new Error('Somente usuario Master pode direcionar distritos.');
        }
        const assignments = this.getDistrictAssignments();
        assignments[districtId] = {
            vereadorId: vereadorId || '',
            vereadorNome: vereadorNome || '',
            atualizadoEm: new Date().toISOString(),
            atualizadoPor: currentUser.nome
        };
        localStorage.setItem(LOCAL_STORAGE_DISTRICTS, JSON.stringify(assignments));
        this.logAudit(currentUser, 'sistema', 'Distrito atribuido', `${districtId} -> ${vereadorNome || 'Livre'}`);
        if (this.remoteMode && this.client && !currentUser.isPreview) {
            this.client.from('district_assignments').upsert({
                distrito_id: districtId,
                vereador_id: vereadorId || null,
                vereador_nome: vereadorNome || null,
                atualizado_por: currentUser.id
            }, { onConflict: 'distrito_id' }).then(({ error }) => {
                if (error) console.warn('Falha ao salvar distrito:', error);
            });
        }
        return assignments;
    }

    resetUsersToDefault() {
        throw new Error('Reset automatico de usuarios foi removido por seguranca.');
    }
}

class SafeEmailService {
    async sendAccessConfirmationEmail(user) {
        return {
            success: true,
            email: user ? user.email : '',
            pendingConfirmation: true,
            message: 'Confirmacao de conta gerenciada pelo Supabase Auth. Nenhuma senha e enviada por e-mail.'
        };
    }
}

window.EmailService = new SafeEmailService();
window.SupabaseService = new SecureSupabaseService();

// Guarda complementar: desativa rotas legadas que permitiam trocar de usuario sem autenticacao
// e o falso fluxo biometrico que fazia fallback para qualquer conta local.
window.addEventListener('DOMContentLoaded', () => {
    const blocked = () => alert('Funcao desativada por seguranca. Use o login autenticado.');
    window.switchDemonstrationUser = blocked;
    window.quickLoginDemo = blocked;
    window.handleBiometricLogin = () => alert('Biometria temporariamente desativada. Ela sera reativada somente com WebAuthn/passkey vinculada a uma sessao autenticada.');

    const picker = document.getElementById('auth-demo-picker');
    if (picker) picker.style.display = 'none';
});
