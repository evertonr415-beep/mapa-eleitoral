# Auditoria de Segurança — Mapa Eleitoral Arapongas

Data: 2026-09-03

## Status

Risco atual: **CRÍTICO**.

## Achados críticos

1. **Token de acesso do GitHub no frontend**
   - Existe um token de acesso embutido em `supabase_client.js`.
   - Como o repositório e o JavaScript são públicos, o token deve ser considerado comprometido.
   - Revogar o token atual e nunca colocar o substituto no frontend.

2. **Credenciais de usuários em texto puro no repositório público**
   - `data_sync.json` armazena senhas e outros dados de cadastro em formato legível.
   - O histórico Git também preserva versões anteriores.
   - Trocar todas as senhas expostas, remover o arquivo como banco e avaliar reescrita do histórico.

3. **Senha padrão funciona como senha universal**
   - A rotina de login aceita a senha padrão mesmo após alteração da senha individual.
   - A troca de senha também aceita a senha padrão como substituta da senha atual.
   - Remover esse bypass e usar autenticação real no servidor.

4. **Fallback automático para usuário Master**
   - Sem sessão válida, `getCurrentUser()` pode retornar um usuário Master padrão.
   - Sem sessão válida, o sistema deve retornar `null` e exibir login.

5. **Login rápido/demonstração sem autenticação**
   - Existem funções de troca/login de usuário que selecionam perfis diretamente no cliente.
   - Remover do ambiente de produção.

6. **Autorização/RBAC apenas no navegador**
   - Master/Adm/Vereador são controlados em JavaScript/localStorage.
   - Isso não é controle de acesso confiável.
   - Migrar para Supabase Auth + RLS ou backend equivalente.

7. **Supabase ainda não está efetivamente conectado ao projeto auditado**
   - O código possui esquema SQL planejado, mas a aplicação atual usa principalmente `localStorage` e GitHub como armazenamento.
   - O projeto Supabase atualmente conectado nesta sessão não contém as tabelas esperadas.

## Plano de correção

### Fase 1 — Contenção
- Revogar o token GitHub exposto.
- Trocar todas as senhas que apareceram em `data_sync.json` ou no histórico.
- Retirar `data_sync.json` de uso como banco de dados.
- Remover o token do JavaScript público.
- Remover senha universal e logins rápidos.
- Invalidar sessões locais antigas.

### Fase 2 — Backend seguro
- Criar/identificar o projeto Supabase correto.
- Usar Supabase Auth para login, cadastro, troca e recuperação de senha.
- Nunca armazenar senha em JSON, tabela de perfil ou localStorage.
- Criar tabelas de perfis, lideranças, colégios e auditoria no PostgreSQL.
- Aplicar RLS por proprietário e hierarquia.

### Fase 3 — Hardening
- Escapar dados de usuário antes de inseri-los via `innerHTML`.
- Adicionar CSP adequada.
- Revisar biometria e WhatsApp para garantir que não simulem autenticação/pareamento sem backend real.
- Proteger a branch `main`.

## Regra principal

Nenhum segredo (GitHub PAT, service-role, senha, chave privada ou token administrativo) pode ser enviado ao navegador. Operações privilegiadas devem ser validadas no servidor.
