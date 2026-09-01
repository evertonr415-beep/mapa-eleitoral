-- ==============================================================================
-- PROJETO: MAPA ELEITORAL ARAPONGAS 2024 & GESTÃO DE LIDERANÇAS
-- BANCO DE DADOS: SUPABASE (PostgreSQL + RLS Security Policies)
-- ==============================================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS (Vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.perfis_usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    cpf TEXT,
    partido TEXT,
    numero_candidato TEXT,
    cargo TEXT DEFAULT 'Vereador',
    role TEXT NOT NULL CHECK (role IN ('master', 'adm', 'vereador')),
    avatar_url TEXT,
    adm_vinculado_id UUID REFERENCES public.perfis_usuarios(id),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE COLÉGIOS ELEITORAIS (29 Locais Oficiais de Arapongas)
CREATE TABLE IF NOT EXISTS public.colegios_eleitorais (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    secoes INT NOT NULL DEFAULT 1,
    total_pref INT NOT NULL DEFAULT 0,
    total_ver INT NOT NULL DEFAULT 0,
    brancos_pref INT DEFAULT 0,
    nulos_pref INT DEFAULT 0,
    brancos_ver INT DEFAULT 0,
    nulos_ver INT DEFAULT 0,
    outros_ver INT DEFAULT 0,
    votos_candidatos JSONB DEFAULT '{}'::jsonb
);

-- 3. TABELA DE LIDERANÇAS POLÍTICAS GEORREFERENCIADAS
CREATE TABLE IF NOT EXISTS public.liderancas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vereador_id UUID NOT NULL REFERENCES public.perfis_usuarios(id) ON DELETE CASCADE,
    nome_lideranca TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    telefone TEXT,
    bairro TEXT NOT NULL,
    logradouro TEXT,
    numero TEXT,
    cep TEXT,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    colegio_referencia_id TEXT REFERENCES public.colegios_eleitorais(id),
    meta_votos INT NOT NULL DEFAULT 20,
    categoria TEXT DEFAULT 'Geral', -- Comunitária, Religiosa, Saúde, Esporte, Familiar, Empresarial
    status_contato TEXT DEFAULT 'Ativo', -- Ativo, Em Contato, A Confirmar
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) - SEGURANÇA E ISOLAMENTO DE DADOS
-- ==============================================================================

ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colegios_eleitorais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liderancas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA COLÉGIOS ELEITORAIS
CREATE POLICY "Leitura de Colégios Eleitorais"
    ON public.colegios_eleitorais FOR SELECT
    TO authenticated
    USING (true);

-- POLÍTICAS PARA PERFIS DE USUÁRIOS
-- Master enxerga todos os perfis
CREATE POLICY "Master visualiza todos os perfis"
    ON public.perfis_usuarios FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis_usuarios
            WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Adm enxerga apenas a si mesmo e aos seus vereadores vinculados (NÃO enxerga usuários Master)
CREATE POLICY "Adm visualiza seus vereadores e próprio perfil"
    ON public.perfis_usuarios FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR (
            adm_vinculado_id = auth.uid() AND
            EXISTS (SELECT 1 FROM public.perfis_usuarios WHERE id = auth.uid() AND role = 'adm')
        )
    );

-- Vereador enxerga apenas o seu próprio perfil (NÃO enxerga Adm nem Master)
CREATE POLICY "Vereador visualiza somente seu perfil"
    ON public.perfis_usuarios FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- POLÍTICAS PARA LIDERANÇAS
-- Master enxerga e gerencia todas as lideranças
CREATE POLICY "Master gerencia todas as lideranças"
    ON public.liderancas FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis_usuarios
            WHERE id = auth.uid() AND role = 'master'
        )
    );

-- Adm gerencia lideranças próprias e de seus vereadores vinculados
CREATE POLICY "Adm gerencia lideranças vinculadas"
    ON public.liderancas FOR ALL
    TO authenticated
    USING (
        vereador_id = auth.uid() OR
        vereador_id IN (
            SELECT id FROM public.perfis_usuarios
            WHERE adm_vinculado_id = auth.uid()
        )
    );

-- Vereador gerencia SOMENTE as suas próprias lideranças
CREATE POLICY "Vereador gerencia somente suas próprias lideranças"
    ON public.liderancas FOR ALL
    TO authenticated
    USING (vereador_id = auth.uid())
    WITH CHECK (vereador_id = auth.uid());
