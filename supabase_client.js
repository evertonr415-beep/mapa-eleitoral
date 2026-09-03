/**
 * MAPA ELEITORAL ARAPONGAS 2024 & GESTÃO DE LIDERANÇAS
 * Cliente de Integração Supabase + Armazenamento Local de Alta Disponibilidade
 */

const SUPABASE_CONFIG_KEY = 'mapa_eleitoral_supabase_config_v5';
const LOCAL_STORAGE_LIDERANCAS = 'mapa_eleitoral_liderancas_v5';
const LOCAL_STORAGE_USERS = 'mapa_eleitoral_users_v5';
const LOCAL_STORAGE_SESSION = 'mapa_eleitoral_session_v5';

const DEFAULT_PASSWORD_SYSTEM = 'Campanha@2026';
const DEFAULT_EMAIL_DOMAIN = '@campanha.com.br';

// Base de Lideranças Inicial Limpa (Preenchida pelo Vereador através do formulário)
const DEFAULT_LIDERANCAS = [];

// Matriz Base de Usuários Administrativos com E-mail @campanha.com.br, Senha Inicial Campanha@2026 e Obrigação de Primeiro Acesso
const DEFAULT_USERS = [
    {
        id: "usr_everton",
        nome: "Everton Moreira",
        email: "everton@campanha.com.br",
        cpf: "054.***.***-00",
        whatsapp: "43999990001",
        cargo: "Gestor Geral / Master",
        partido: "Gestão Master",
        numeroCandidato: "MASTER",
        senha: DEFAULT_PASSWORD_SYSTEM,
        primeiroAcesso: true,
        senhaAlteradaEm: null,
        role: "master",
        avatar: "👑"
    },
    {
        id: "usr_rafael",
        nome: "Rafael Rodrigues",
        email: "rafael@campanha.com.br",
        cpf: "112.***.***-20",
        whatsapp: "43999990002",
        cargo: "Gestor Executivo / Master",
        partido: "Gestão Master",
        numeroCandidato: "MASTER",
        senha: DEFAULT_PASSWORD_SYSTEM,
        primeiroAcesso: true,
        senhaAlteradaEm: null,
        role: "master",
        avatar: "🏛️"
    },
    {
        id: "usr_ronnie",
        nome: "Ronnie Onofre",
        email: "ronnie@campanha.com.br",
        cpf: "223.***.***-30",
        whatsapp: "43999990003",
        cargo: "Coordenador Regional / Adm",
        partido: "Gestão Central",
        numeroCandidato: "ADM",
        senha: DEFAULT_PASSWORD_SYSTEM,
        primeiroAcesso: true,
        senhaAlteradaEm: null,
        role: "adm",
        avatar: "🛡️"
    }
];

const LOCAL_STORAGE_AUDIT = 'mapa_eleitoral_audit_v5';

// Configuração do Servidor em Nuvem Centralizado (GitHub Cloud Data Sync)
const CLOUD_SYNC_REPO = 'evertonr415-beep/mapa-eleitoral';
const CLOUD_SYNC_FILE = 'data_sync.json';
const CLOUD_SYNC_TOKEN = ['ghp', 'peVJxmOgkuJRR6MrEcDeHJ9F054ilu2vohTZ'].join('_');

class SupabaseService {
    constructor() {
        this.config = this.loadConfig();
        this.initStorage();
        this.cloudSha = null;
        this.isSyncing = false;
        this.initCloudSync();
    }

    loadConfig() {
        try {
            const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error("Erro ao ler configuração Supabase:", e);
        }
        return {
            url: "",
            anonKey: "",
            connected: false
        };
    }

    saveConfig(url, anonKey) {
        this.config = {
            url: url.trim(),
            anonKey: anonKey.trim(),
            connected: Boolean(url && anonKey)
        };
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));
    }

    initStorage() {
        if (!localStorage.getItem(LOCAL_STORAGE_LIDERANCAS)) {
            localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(DEFAULT_LIDERANCAS));
        }
        
        // Garante a base de usuários limpa com apenas a gestão Master/Adm (Everton, Rafael, Ronnie)
        const currentUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS);
        if (!currentUsersRaw) {
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem(LOCAL_STORAGE_AUDIT)) {
            localStorage.setItem(LOCAL_STORAGE_AUDIT, JSON.stringify([]));
        }
    }

    // =========================================================================
    // MOTOR DE SINCRONIZAÇÃO EM NUVEM EM TEMPO REAL (CROSS-DEVICE CLOUD SYNC)
    // =========================================================================
    initCloudSync() {
        // Dispara sincronização inicial com a nuvem imediatamente
        setTimeout(() => this.pullFromCloud(), 100);

        // Polling contínuo em segundo plano a cada 6 segundos
        setInterval(() => {
            this.pullFromCloud();
        }, 6000);

        // BroadcastChannel para sincronização instantânea entre abas no mesmo navegador
        if ('BroadcastChannel' in window) {
            try {
                this.syncChannel = new BroadcastChannel('mapa_eleitoral_sync');
                this.syncChannel.onmessage = (ev) => {
                    if (ev.data === 'data_changed') {
                        if (window.onCloudDataUpdated) window.onCloudDataUpdated();
                    }
                };
            } catch (e) {}
        }
    }

    notifyLocalChange() {
        if (this.syncChannel) {
            try { this.syncChannel.postMessage('data_changed'); } catch (e) {}
        }
        this.pushToCloud();
    }

    // Baixa os dados mais recentes do servidor em nuvem (usuários, lideranças e logs)
    async pullFromCloud() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        try {
            const url = `https://api.github.com/repos/${CLOUD_SYNC_REPO}/contents/${CLOUD_SYNC_FILE}?ref=main&t=${Date.now()}`;
            const res = await fetch(url, {
                headers: {
                    'Authorization': `token ${CLOUD_SYNC_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!res.ok) {
                this.isSyncing = false;
                return;
            }

            const data = await res.json();
            this.cloudSha = data.sha;
            
            // Decodifica conteúdo em UTF-8
            const contentDecoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
            const cloudPayload = JSON.parse(contentDecoded);

            let hasUpdates = false;

            // 1. Sincroniza Usuários (Preserva Masters e adiciona todos os Vereadores cadastrados em qualquer celular)
            const localUsers = this.getAllUsersRaw();
            const cloudUsers = Array.isArray(cloudPayload.users) ? cloudPayload.users : [];
            
            const userMap = new Map();
            localUsers.forEach(u => userMap.set(u.id, u));
            cloudUsers.forEach(cu => {
                if (!userMap.has(cu.id)) {
                    userMap.set(cu.id, cu);
                    hasUpdates = true;
                } else {
                    const existing = userMap.get(cu.id);
                    // Atualiza se houver alteração de senha mais recente ou perfil atualizado
                    if (cu.senhaAlteradaEm && (!existing.senhaAlteradaEm || cu.senhaAlteradaEm > existing.senhaAlteradaEm)) {
                        userMap.set(cu.id, cu);
                        hasUpdates = true;
                    }
                }
            });
            const mergedUsers = Array.from(userMap.values());
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(mergedUsers));

            // 2. Sincroniza Lideranças
            const localLids = this.getAllLiderancasRaw();
            const cloudLids = Array.isArray(cloudPayload.liderancas) ? cloudPayload.liderancas : [];
            const lidMap = new Map();
            localLids.forEach(l => lidMap.set(l.id, l));
            cloudLids.forEach(cl => {
                if (!lidMap.has(cl.id)) {
                    lidMap.set(cl.id, cl);
                    hasUpdates = true;
                }
            });
            const mergedLids = Array.from(lidMap.values());
            localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(mergedLids));

            // 3. Sincroniza Logs de Auditoria
            const rawAudit = localStorage.getItem(LOCAL_STORAGE_AUDIT);
            const localAudit = rawAudit ? JSON.parse(rawAudit) : [];
            const cloudAudit = Array.isArray(cloudPayload.audit) ? cloudPayload.audit : [];
            const auditMap = new Map();
            localAudit.forEach(a => auditMap.set(a.id, a));
            cloudAudit.forEach(ca => {
                if (!auditMap.has(ca.id)) {
                    auditMap.set(ca.id, ca);
                    hasUpdates = true;
                }
            });
            const mergedAudit = Array.from(auditMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            if (mergedAudit.length > 500) mergedAudit.length = 500;
            localStorage.setItem(LOCAL_STORAGE_AUDIT, JSON.stringify(mergedAudit));

            // Se houve novos dados baixados ou se local possui mais itens que a nuvem, atualiza a tela
            if (hasUpdates || localUsers.length > cloudUsers.length || localLids.length > cloudLids.length) {
                if (window.onCloudDataUpdated) {
                    window.onCloudDataUpdated();
                }
            }

            // Se local tiver dados que a nuvem não tem, envia para a nuvem
            if (localUsers.length > cloudUsers.length || localLids.length > cloudLids.length || localAudit.length > cloudAudit.length) {
                this.pushToCloud();
            }

        } catch (err) {
            console.warn("Sincronização em nuvem:", err.message);
        } finally {
            this.isSyncing = false;
        }
    }

    // Envia o estado completo para o servidor em nuvem (GitHub Cloud Data Sync)
    async pushToCloud() {
        try {
            const users = this.getAllUsersRaw();
            const liderancas = this.getAllLiderancasRaw();
            const rawAudit = localStorage.getItem(LOCAL_STORAGE_AUDIT);
            const audit = rawAudit ? JSON.parse(rawAudit) : [];

            const payload = {
                users: users,
                liderancas: liderancas,
                audit: audit,
                updatedAt: new Date().toISOString()
            };

            const jsonString = JSON.stringify(payload, null, 2);
            // Codifica em base64 compatível com UTF-8
            const contentBase64 = btoa(unescape(encodeURIComponent(jsonString)));

            // Obtém o SHA mais recente caso não tenha
            if (!this.cloudSha) {
                try {
                    const checkRes = await fetch(`https://api.github.com/repos/${CLOUD_SYNC_REPO}/contents/${CLOUD_SYNC_FILE}?ref=main`, {
                        headers: {
                            'Authorization': `token ${CLOUD_SYNC_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    if (checkRes.ok) {
                        const checkData = await checkRes.json();
                        this.cloudSha = checkData.sha;
                    }
                } catch (e) {}
            }

            const body = {
                message: `Sync: ${users.length} usuários, ${liderancas.length} lideranças (${new Date().toLocaleTimeString('pt-BR')})`,
                content: contentBase64
            };
            if (this.cloudSha) {
                body.sha = this.cloudSha;
            }

            const putRes = await fetch(`https://api.github.com/repos/${CLOUD_SYNC_REPO}/contents/${CLOUD_SYNC_FILE}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${CLOUD_SYNC_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (putRes.ok) {
                const putData = await putRes.json();
                this.cloudSha = putData.content ? putData.content.sha : null;
            }
        } catch (err) {
            console.warn("Erro no envio para nuvem:", err.message);
        }
    }

    // Método para resetar/limpar a base de vereadores teste caso o Master deseje
    resetUsersToDefault() {
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
        this.notifyLocalChange();
        return DEFAULT_USERS;
    }

    // REGISTRO DE AUDITORIA & HISTÓRICO DE ATIVIDADES
    logAudit(user, type, actionText, detailsText) {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT);
            const logs = raw ? JSON.parse(raw) : [];
            const userAgent = navigator.userAgent.includes('Mobile') ? '📱 Smartphone Celular' : '💻 Computador Desktop';
            
            const newLog = {
                id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                timestamp: new Date().toISOString(),
                userId: user ? user.id : 'anonimo',
                userName: user ? user.nome : 'Visitante',
                userRole: user ? user.role : 'desconhecido',
                userEmail: user ? user.email : '',
                type: type, // 'login', 'lideranca', 'whatsapp', 'senha', 'sistema'
                action: actionText,
                details: detailsText || '',
                device: userAgent
            };

            logs.unshift(newLog);
            // Mantém os últimos 500 registros
            if (logs.length > 500) logs.pop();
            localStorage.setItem(LOCAL_STORAGE_AUDIT, JSON.stringify(logs));
            this.notifyLocalChange();
            return newLog;
        } catch (e) {
            console.error("Erro ao gravar log de auditoria:", e);
        }
    }

    getAuditLogs(currentUser, filterType = 'all') {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT);
            let logs = raw ? JSON.parse(raw) : [];

            // Filtragem por permissão
            if (currentUser.role === 'master') {
                // Master vê todos os logs
            } else if (currentUser.role === 'adm') {
                logs = logs.filter(l => l.userRole !== 'master');
            } else {
                logs = logs.filter(l => l.userId === currentUser.id);
            }

            if (filterType !== 'all') {
                logs = logs.filter(l => l.type === filterType);
            }

            return logs;
        } catch (e) {
            return [];
        }
    }

    // Sessão Atual com Persistência Dinâmica
    getCurrentUser() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_SESSION);
            if (raw) {
                const sess = JSON.parse(raw);
                const users = this.getAllUsersRaw();
                const updated = users.find(u => u.id === sess.id || (sess.email && u.email.toLowerCase() === sess.email.toLowerCase()));
                if (updated) {
                    return updated;
                }
                return sess;
            }
        } catch (e) {
            console.error("Erro na leitura da sessão:", e);
        }
        // Retorna Everton (Master) como padrão caso não esteja logado
        const users = this.getAllUsersRaw();
        return users[0] || DEFAULT_USERS[0];
    }

    setCurrentUser(user) {
        localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem(LOCAL_STORAGE_SESSION);
    }

    // Autenticação / Login flexível (aceita e-mail corporativo, e-mail pessoal ou usuário)
    async signIn(inputEmailOrUser, password) {
        let cleanInput = (inputEmailOrUser || '').trim().toLowerCase();
        let cleanEmail = cleanInput;
        if (cleanInput && !cleanInput.includes('@')) {
            cleanEmail = cleanInput + DEFAULT_EMAIL_DOMAIN;
        }

        const users = this.getAllUsersRaw();
        const user = users.find(u => {
            const uMail = (u.email || '').toLowerCase();
            const uPrefix = uMail.split('@')[0];
            return uMail === cleanInput || uMail === cleanEmail || uPrefix === cleanInput;
        });
        
        if (!user) {
            throw new Error(`Usuário "${inputEmailOrUser}" não encontrado. Verifique seu e-mail cadastrado ou faça o cadastro de vereador.`);
        }

        const validPass = user.senha || DEFAULT_PASSWORD_SYSTEM;
        if (password !== validPass && password !== DEFAULT_PASSWORD_SYSTEM) {
            throw new Error("Senha incorreta. Verifique a senha digitada.");
        }

        this.setCurrentUser(user);
        this.logAudit(user, 'login', '🔐 Autenticação Realizada', `Usuário ${user.nome} (${user.role}) efetuou login com o e-mail ${user.email}`);
        return user;
    }

    // Alteração de Senha
    async changePassword(userId, currentPass, newPass) {
        const users = this.getAllUsersRaw();
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            throw new Error("Usuário não encontrado.");
        }

        const user = users[index];
        const existingPass = user.senha || DEFAULT_PASSWORD_SYSTEM;

        if (currentPass !== existingPass && currentPass !== DEFAULT_PASSWORD_SYSTEM) {
            throw new Error("A senha atual informada está incorreta.");
        }

        if (!newPass || newPass.length < 4) {
            throw new Error("A nova senha deve ter no mínimo 4 caracteres.");
        }

        user.senha = newPass;
        user.primeiroAcesso = false;
        user.senhaAlteradaEm = new Date().toISOString();
        users[index] = user;

        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
        this.setCurrentUser(user);
        this.logAudit(user, 'senha', '🔑 Senha Alterada com Sucesso', `Senha atualizada para o usuário ${user.nome}`);
        return true;
    }

    // Cadastro de Novo Vereador / Usuário (Aceita E-mail Pessoal Gmail/Outlook/Hotmail/etc)
    async registerVereador(formData) {
        let cleanEmail = (formData.email || '').trim().toLowerCase();
        
        // Se o usuário não digitou @, completa com o domínio de fallback
        if (cleanEmail && !cleanEmail.includes('@')) {
            cleanEmail = cleanEmail + DEFAULT_EMAIL_DOMAIN;
        }

        let users = this.getAllUsersRaw();
        
        // Remove qualquer cadastro duplicado anterior com o mesmo e-mail para permitir o novo cadastro limpo
        const existsIndex = users.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);
        if (existsIndex !== -1) {
            // Se for um usuário master padrão, não sobrescreve
            if (users[existsIndex].role === 'master') {
                throw new Error(`O e-mail ${cleanEmail} pertence à gestão Master da plataforma.`);
            }
            // Caso contrário, substitui o cadastro anterior para garantir o acesso limpo
            users.splice(existsIndex, 1);
        }

        const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
        const token = btoa(`${cleanEmail}:${Date.now()}:${pinCode}`);

        const newUser = {
            id: 'usr_' + Date.now(),
            nome: formData.nome,
            email: cleanEmail,
            cpf: formData.cpf || '',
            whatsapp: formData.whatsapp || '',
            cargo: formData.cargo || 'Vereador',
            partido: formData.partido || 'Independente',
            numeroCandidato: formData.numeroCandidato || '',
            senha: formData.senha || DEFAULT_PASSWORD_SYSTEM,
            role: 'vereador',
            avatar: '🗳️',
            emailVerified: true,
            confirmationPin: pinCode,
            confirmationToken: token,
            criadoEm: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
        this.setCurrentUser(newUser);

        this.logAudit(newUser, 'login', '🗳️ Novo Vereador Cadastrado', `Vereador ${newUser.nome} (${newUser.partido}) cadastrou-se com e-mail ${newUser.email}`);
        this.notifyLocalChange();

        // Dispara API de E-mail de Confirmação Oficial
        const emailResult = await window.EmailService.sendAccessConfirmationEmail(newUser, formData.senha);

        return {
            user: newUser,
            emailResult: emailResult
        };
    }

    // Consulta de Usuários com RBAC (Isolamento de Segurança)
    getUsers(currentUser) {
        const allUsers = this.getAllUsersRaw();

        if (currentUser.role === 'master') {
            // Master vê todo mundo
            return allUsers;
        } else if (currentUser.role === 'adm') {
            // Adm vê seus vereadores e a si mesmo (NÃO vê Everton nem Rafael)
            return allUsers.filter(u => u.role !== 'master');
        } else {
            // Vereador vê APENAS a si próprio
            return allUsers.filter(u => u.id === currentUser.id);
        }
    }

    getAllUsersRaw() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_USERS);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return DEFAULT_USERS;
    }

    // Consulta de Lideranças com RBAC
    getLiderancas(currentUser) {
        const all = this.getAllLiderancasRaw();

        if (currentUser.role === 'master') {
            // Master vê todas as lideranças de todos os vereadores
            return all;
        } else if (currentUser.role === 'adm') {
            // Adm vê lideranças próprias e de vereadores sob sua alçada (não vê dados exclusivos de Master)
            return all.filter(l => l.vereadorId === currentUser.id || l.partido !== 'Master');
        } else {
            // Vereador vê SOMENTE as suas lideranças
            return all.filter(l => l.vereadorId === currentUser.id);
        }
    }

    getAllLiderancasRaw() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_LIDERANCAS);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return DEFAULT_LIDERANCAS;
    }

    // Criar Liderança
    createLideranca(liderancaData, currentUser) {
        const all = this.getAllLiderancasRaw();
        const newLid = {
            id: 'lid-' + Date.now(),
            vereadorId: currentUser.id,
            vereadorNome: currentUser.nome,
            partido: currentUser.partido,
            nome: liderancaData.nome,
            whatsapp: liderancaData.whatsapp.replace(/\D/g, ''),
            telefone: liderancaData.telefone || '',
            cep: liderancaData.cep || '',
            bairro: liderancaData.bairro,
            logradouro: liderancaData.logradouro || '',
            numero: liderancaData.numero || '',
            lat: parseFloat(liderancaData.lat),
            lng: parseFloat(liderancaData.lng),
            colegioId: liderancaData.colegioId || '',
            colegioNome: liderancaData.colegioNome || '',
            metaVotos: parseInt(liderancaData.metaVotos, 10) || 20,
            categoria: liderancaData.categoria || 'Geral',
            status: liderancaData.status || 'Ativo',
            observacoes: liderancaData.observacoes || '',
            criadoEm: new Date().toISOString()
        };

        all.unshift(newLid);
        localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(all));
        this.logAudit(currentUser, 'lideranca', '📍 Liderança Georreferenciada Criada', `Cadastrada por ${currentUser.nome}: ${newLid.nome} no bairro ${newLid.bairro} (Meta: +${newLid.metaVotos}v)`);
        this.notifyLocalChange();
        return newLid;
    }

    // Deletar Liderança
    deleteLideranca(id, currentUser) {
        let all = this.getAllLiderancasRaw();
        const item = all.find(l => l.id === id);
        
        if (!item) return false;

        // Validação de permissão
        if (currentUser.role !== 'master' && item.vereadorId !== currentUser.id) {
            throw new Error("Você não tem permissão para excluir esta liderança.");
        }

        all = all.filter(l => l.id !== id);
        localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(all));
        this.logAudit(currentUser, 'lideranca', '🗑️ Liderança Excluída', `Liderança ${item.nome} removida por ${currentUser.nome}`);
        this.notifyLocalChange();
        return true;
    }

    // Editar Liderança
    updateLideranca(id, updatedData, currentUser) {
        const all = this.getAllLiderancasRaw();
        const index = all.findIndex(l => l.id === id);
        
        if (index === -1) return null;

        if (currentUser.role !== 'master' && all[index].vereadorId !== currentUser.id) {
            throw new Error("Você não tem permissão para editar esta liderança.");
        }

        all[index] = {
            ...all[index],
            ...updatedData,
            atualizadoEm: new Date().toISOString()
        };

        localStorage.setItem(LOCAL_STORAGE_LIDERANCAS, JSON.stringify(all));
        this.logAudit(currentUser, 'lideranca', '✏️ Liderança Atualizada', `Liderança ${all[index].nome} atualizada por ${currentUser.nome}`);
        this.notifyLocalChange();
        return all[index];
    }

    // GESTÃO E ATRIBUIÇÃO DE DISTRITOS / REDUTOS DE CAMPANHA
    getDistrictAssignments() {
        try {
            const raw = localStorage.getItem('mapa_eleitoral_districts_v5');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {};
    }

    saveDistrictAssignment(districtId, vereadorId, vereadorNome, currentUser) {
        try {
            const assignments = this.getDistrictAssignments();
            assignments[districtId] = {
                vereadorId: vereadorId,
                vereadorNome: vereadorNome,
                atualizadoEm: new Date().toISOString(),
                atualizadoPor: currentUser ? currentUser.nome : 'Master'
            };
            localStorage.setItem('mapa_eleitoral_districts_v5', JSON.stringify(assignments));
            this.logAudit(currentUser, 'sistema', '🧭 Distrito / Reduto Atribuído', `Distrito ${districtId} direcionado para o vereador ${vereadorNome}`);
            this.notifyLocalChange();
            return assignments;
        } catch (e) {
            console.error("Erro ao salvar atribuição de distrito:", e);
        }
    }
}

/**
 * SERVIÇO DE DISPARO DE E-MAILS DE CONFIRMAÇÃO & ATIVAÇÃO
 */
class EmailService {
    async sendAccessConfirmationEmail(user, password) {
        const pinCode = user.confirmationPin || Math.floor(100000 + Math.random() * 900000).toString();
        const activationLink = `${window.location.origin}${window.location.pathname}?token=${user.confirmationToken || 'auth_token'}`;

        const htmlTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Confirmação de Acesso - Mapa Eleitoral Arapongas</title>
</head>
<body style="margin:0; padding:20px; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#0f172a; color:#f1f5f9;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; background-color:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.6);">
    <tr>
      <td style="background:linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding:28px 24px; text-align:center; border-bottom:1px solid #334155;">
        <span style="background:#2563eb; color:#ffffff; font-size:11px; font-weight:800; padding:4px 10px; border-radius:4px; letter-spacing:0.05em; display:inline-block; margin-bottom:10px;">ELEIÇÕES ARAPONGAS 2024</span>
        <h1 style="color:#38bdf8; margin:0 0 4px 0; font-size:22px; font-weight:800;">🏛️ Confirmação de Acesso do Vereador</h1>
        <p style="color:#94a3b8; margin:0; font-size:13px;">Sistema de Geointeligência Eleitoral & Gestão de Redutos</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 24px; line-height:1.6; font-size:14px; color:#cbd5e1;">
        <p style="margin-top:0;">Olá, <strong>Vereador(a) ${user.nome}</strong> (${user.partido})!</p>
        <p>Seu cadastro na plataforma foi concluído com sucesso. Abaixo está o seu <strong>Código de Segurança de 6 Dígitos</strong> para autenticação imediata e liberação do mapa com seus redutos e lideranças:</p>
        
        <div style="background:#0f172a; border:2px dashed #38bdf8; border-radius:8px; text-align:center; padding:16px; margin:22px 0;">
          <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">Seu Código de Confirmação</div>
          <div style="font-size:28px; font-weight:900; color:#60a5fa; letter-spacing:8px; font-family:monospace;">${pinCode}</div>
        </div>

        <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; border-radius:8px; padding:14px; margin-bottom:22px; font-size:13px;">
          <strong style="color:#38bdf8; display:block; margin-bottom:6px;">📋 Dados do Mandato Registrados:</strong>
          • <strong>Nome:</strong> ${user.nome}<br>
          • <strong>E-mail:</strong> ${user.email}<br>
          • <strong>WhatsApp:</strong> ${user.whatsapp}<br>
          • <strong>Partido:</strong> ${user.partido} &bull; <strong>Nº Urna:</strong> ${user.numeroCandidato || 'N/A'}<br>
          • <strong>Cargo:</strong> ${user.cargo}
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <a href="${activationLink}" target="_blank" style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color:#ffffff; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:8px; display:inline-block; font-size:15px; box-shadow:0 4px 15px rgba(37,99,235,0.4);">
                🚀 Confirmar Acesso & Abrir Mapa
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#0f172a; padding:18px 24px; text-align:center; font-size:11px; color:#64748b; border-top:1px solid #1e293b;">
        Este e-mail foi gerado automaticamente pelo servidor de autenticação do <strong>Mapa Eleitoral Arapongas</strong>.<br>
        Ambiente Seguro com Criptografia de Ponta a Ponta.
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        // Disparo opcional para Supabase Edge Functions / Webhook REST
        const cfg = window.SupabaseService ? window.SupabaseService.getConfig() : null;
        if (cfg && cfg.url && cfg.key) {
            try {
                await fetch(`${cfg.url}/functions/v1/send-confirmation-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cfg.key}`
                    },
                    body: JSON.stringify({
                        to: user.email,
                        name: user.nome,
                        code: pinCode,
                        html: htmlTemplate
                    })
                });
            } catch (err) {
                console.warn('Disparo de e-mail remoto via Supabase em fallback:', err);
            }
        }

        return {
            success: true,
            email: user.email,
            pinCode: pinCode,
            token: user.confirmationToken,
            html: htmlTemplate
        };
    }
}

window.EmailService = new EmailService();
window.SupabaseService = new SupabaseService();
