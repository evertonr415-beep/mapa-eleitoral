# 🗺️ MAPA ELEITORAL ARAPONGAS 2024 & GESTÃO DE LIDERANÇAS

Plataforma integrada de **Geointeligência Eleitoral & Mapeamento de Lideranças Políticas** do Município de Arapongas / PR (Eleições 2024).

---

## 👥 Matriz de Hierarquia & Permissões (RBAC)

1. 👑 **Master (Super Admin)**:
   - `Everton Moreira` & `Rafael Cita` (Prefeito Eleito).
   - Acesso irrestrito a todos os 29 colégios, todos os vereadores, todas as lideranças da cidade e relatórios executivos.
2. 🛡️ **Administrador (Adm)**:
   - `Ronnie Onofre`.
   - Acesso exclusivo aos vereadores e lideranças da sua coordenação. Não visualiza o usuário de Everton nem as métricas exclusivas de Master.
3. 🗳️ **Vereadores / Mandatários**:
   - Vereadores eleitos e candidatos.
   - Cada vereador gerencia **apenas as suas próprias lideranças georreferenciadas**.
   - Não visualizam lideranças de outros vereadores nem os usuários de nível administrativo acima (Ronnie / Everton).

---

## 📍 Funcionalidades Principais

- **Alfinetes de Lideranças no Mapa**:
  - Cadastro com captura automática de endereço / CEP via Nominatim OSM ou clique direto no mapa (*Pin Drop Mode*).
  - Alfinetes customizados com as cores do partido/vereador.
  - Ficha da Liderança com botão de conversa direta no **WhatsApp** (`wa.me`).
  - Associação com os 29 Colégios Eleitorais de Arapongas.
- **Geointeligência dos 29 Colégios**:
  - Votação oficial das Eleições 2024 (Rafael Cita vs Jair Milani).
  - Votos dos 15 vereadores eleitos e 12 suplentes.
  - Círculos proporcionais com mapas de calor e densidade.
- **Tela Inicial de Autenticação & Cadastro**:
  - Login com e-mail/senha.
  - Auto-cadastro para novos vereadores com dados pessoais e partido.

---

## 🚀 Integração Supabase & Deploy na Vercel

1. **Supabase**:
   - Execute o script `supabase_schema.sql` no SQL Editor do seu projeto Supabase para criar as tabelas `perfis_usuarios`, `colegios_eleitorais` e `liderancas` com as políticas **Row Level Security (RLS)** ativas.
2. **Vercel / GitHub**:
   - O projeto possui `vercel.json` pré-configurado para deploy estático com segurança e cabeçalhos otimizados.
