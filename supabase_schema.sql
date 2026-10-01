-- ==========================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS NO SUPABASE (POSTGRESQL)
-- LABORATÓRIO LINUS - SISTEMA DE CADASTRO E FICHAS
-- ==========================================================
-- Instruções:
-- 1. Acesse https://supabase.com e crie um projeto gratuito.
-- 2. Vá em 'SQL Editor' no menu lateral do Supabase.
-- 3. Cole este script e clique em 'RUN'.
-- 4. Copie a URL do projeto e a ANON KEY para o Vercel ou .env.local
-- ==========================================================

-- 1. TABELA DE USUÁRIOS / COLABORADORES (Login simplificado: Usuário + Senha)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'FUNCIONARIO', -- 'ADM' ou 'FUNCIONARIO'
  department TEXT NOT NULL DEFAULT 'Recepção',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. TABELA DE CLIENTES / PACIENTES (Ficha individual de cada funcionário)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  doctor_request TEXT NOT NULL,
  rg TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  gender TEXT DEFAULT 'Não informado',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT 'Belo Horizonte',
  state TEXT DEFAULT 'MG',
  payment_type TEXT NOT NULL DEFAULT 'Particular', -- 'Particular' ou 'Convênio'
  health_insurance_name TEXT DEFAULT '',
  insurance_card_number TEXT DEFAULT '',
  requested_exams TEXT DEFAULT 'Atendimento / Encaminhamento Clínico',
  clinical_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Aguardando Atendimento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) E PERMISSÕES PÚBLICAS DA API
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso total para a anon key (utilizada pela API Next.js na Vercel)
DROP POLICY IF EXISTS "Permitir todas operacoes em users" ON public.users;
CREATE POLICY "Permitir todas operacoes em users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todas operacoes em clients" ON public.clients;
CREATE POLICY "Permitir todas operacoes em clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- 4. USUÁRIOS INICIAIS (Senha padrão: 1234)
-- Hash bcrypt para '1234': $2a$10$j8dFfH0qT7e704B1XjSRO.0D16B30C.s9o1gUjB7C6n6wzW00b2y6
INSERT INTO public.users (id, username, name, password_hash, role, department, active)
VALUES 
  ('usr_adm_01', 'admin', 'Dr. Roberto Linus', '$2a$10$j8dFfH0qT7e704B1XjSRO.0D16B30C.s9o1gUjB7C6n6wzW00b2y6', 'ADM', 'Diretoria Geral', 1),
  ('usr_func_01', 'mariana', 'Mariana Souza', '$2a$10$j8dFfH0qT7e704B1XjSRO.0D16B30C.s9o1gUjB7C6n6wzW00b2y6', 'FUNCIONARIO', 'Recepção e Coleta', 1),
  ('usr_func_02', 'carlos', 'Carlos Eduardo Lima', '$2a$10$j8dFfH0qT7e704B1XjSRO.0D16B30C.s9o1gUjB7C6n6wzW00b2y6', 'FUNCIONARIO', 'Atendimento ao Paciente', 1),
  ('usr_func_03', 'ana', 'Ana Beatriz Faria', '$2a$10$j8dFfH0qT7e704B1XjSRO.0D16B30C.s9o1gUjB7C6n6wzW00b2y6', 'FUNCIONARIO', 'Triagem e Exames', 1)
ON CONFLICT (username) DO NOTHING;

-- 5. PACIENTES INICIAIS PARA TESTE DE MÉTRICAS (SEMANA E MÊS)
INSERT INTO public.clients (
  id, user_id, name, cpf, doctor_request, created_at, updated_at
) VALUES 
  ('cli_001', 'usr_func_01', 'Clara Mendes de Oliveira', '123.456.789-01', 'Dra. Vanessa Martins - CRM 45890', NOW(), NOW()),
  ('cli_002', 'usr_func_01', 'João Pedro Carvalho', '234.567.890-12', 'Dr. Lucas Silveira - CRM 38910', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('cli_003', 'usr_func_01', 'Helena Duarte Santos', '345.678.901-23', 'Dra. Camila Nogueira - CRM 52410', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('cli_004', 'usr_func_02', 'Fernanda Rocha Ribeiro', '567.890.123-45', 'Dr. André Vilela', NOW(), NOW()),
  ('cli_005', 'usr_func_02', 'Rodrigo Alcantara Prado', '678.901.234-56', 'Dr. Paulo Guimarães', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('cli_006', 'usr_func_03', 'Gabriel Vasconcelos Toledo', '890.123.456-78', 'Dra. Renata Figueiredo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
