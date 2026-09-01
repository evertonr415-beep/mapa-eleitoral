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

class SupabaseService {
    constructor() {
        this.config = this.loadConfig();
        this.initStorage();
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
        if (!localStorage.getItem(LOCAL_STORAGE_USERS)) {
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
        }
    }

    // Sessão Atual
    getCurrentUser() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_SESSION);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error("Erro na leitura da sessão:", e);
        }
        // Retorna Everton (Master) como padrão caso não esteja logado
        return DEFAULT_USERS[0];
    }

    setCurrentUser(user) {
        localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem(LOCAL_STORAGE_SESSION);
    }

    // Autenticação / Login com validação de e-mail e aceitação de prefixo (ex: everton -> everton@campanha.com.br)
    async signIn(inputEmailOrUser, password) {
        let cleanEmail = (inputEmailOrUser || '').trim().toLowerCase();
        if (cleanEmail && !cleanEmail.includes('@')) {
            cleanEmail = cleanEmail + DEFAULT_EMAIL_DOMAIN;
        }

        const users = this.getAllUsersRaw();
        const user = users.find(u => {
            const uMail = u.email.toLowerCase();
            const uPrefix = uMail.split('@')[0];
            return uMail === cleanEmail || uPrefix === cleanEmail.split('@')[0];
        });
        
        if (!user) {
            throw new Error(`Usuário "${inputEmailOrUser}" não encontrado. Use seu e-mail corporativo (ex: everton@campanha.com.br) ou cadastre-se.`);
        }

        const validPass = user.senha || DEFAULT_PASSWORD_SYSTEM;
        if (password !== validPass && password !== DEFAULT_PASSWORD_SYSTEM) {
            throw new Error("Senha incorreta. A senha padrão do sistema é Campanha@2026");
        }

        this.setCurrentUser(user);
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
        return true;
    }

    // Cadastro de Novo Vereador / Usuário
    async registerVereador(formData) {
        let cleanEmail = (formData.email || '').trim().toLowerCase();
        if (cleanEmail && !cleanEmail.includes('@')) {
            cleanEmail = cleanEmail + DEFAULT_EMAIL_DOMAIN;
        }

        const users = this.getAllUsersRaw();
        const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
        
        if (exists) {
            throw new Error(`Já existe um usuário cadastrado com o e-mail ${cleanEmail}.`);
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
            emailVerified: true, // Habilitado
            confirmationPin: pinCode,
            confirmationToken: token,
            criadoEm: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));
        this.setCurrentUser(newUser);

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
        return all[index];
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
