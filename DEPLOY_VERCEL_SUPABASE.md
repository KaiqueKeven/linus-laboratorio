# 🚀 Guia de Implantação: Supabase + Vercel
## Laboratório LINUS - Sistema de Cadastro & Fichas

Este guia ensina o passo a passo exato para colocar o sistema no ar na **Vercel** conectado ao banco de dados na nuvem **Supabase**, pronto para apresentar à empresa.

---

## 🗄️ PARTE 1: Configuração do Supabase (Banco de Dados na Nuvem)

### Passo 1: Criar o Projeto no Supabase
1. Acesse **[https://supabase.com](https://supabase.com)** e crie uma conta gratuita (ou faça login com GitHub).
2. Clique no botão **"New Project"**.
3. Dê um nome ao projeto (ex: `linus-laboratorio`).
4. Escolha uma senha forte para o banco de dados (guarde-a com você).
5. Selecione a região mais próxima (ex: `South America (São Paulo)`).
6. Clique em **"Create new project"** e aguarde cerca de 1 minuto para o provisionamento.

### Passo 2: Executar o Script de Criação das Tabelas
1. No menu lateral esquerdo do Supabase, clique no ícone **"SQL Editor"** (ícone `>_`).
2. Clique em **"+ New query"**.
3. Abra o arquivo `supabase_schema.sql` deste projeto, copie todo o código e cole no editor do Supabase.
4. Clique no botão verde **"RUN"** no canto inferior direito.
5. Você verá a mensagem `Success. No rows returned`.
   *(As tabelas `users` e `clients` foram criadas, com os usuários `admin`, `mariana`, `carlos`, `ana` e os dados de teste já inseridos!)*

### Passo 3: Copiar as Chaves de Conexão
1. No menu lateral do Supabase, clique na engrenagem **"Project Settings"** (no rodapé).
2. Clique em **"API"**.
3. Copie duas informações:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (uma chave longa começando com `eyJ...`)

---

## ☁️ PARTE 2: Publicação na Vercel (Hospedagem Web Gratuita)

### Opção A: Publicar pelo GitHub (Mais recomendado e automático)
1. Crie um repositório no seu GitHub (pode ser privado ou público) com os arquivos deste projeto:
   ```bash
   git add .
   git commit -m "Laboratorio LINUS pronto para producao"
   git push origin main
   ```
2. Acesse **[https://vercel.com](https://vercel.com)** e faça login com seu GitHub.
3. Clique em **"Add New..." ➔ "Project"**.
4. Importe o repositório do projeto `LINUS`.
5. Na tela de configuração **"Environment Variables"**, adicione as seguintes 3 variáveis:

| Nome da Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase (ex: `https://xyzcompany.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon key do Supabase (`eyJ...`) |
| `JWT_SECRET` | Qualquer código secreto longo (ex: `linus-laboratorio-secret-producao-2026`) |

6. Clique no botão azul **"Deploy"**!
7. Em cerca de 1 a 2 minutos o site estará online em um link gratuito (ex: `https://linus-laboratorio.vercel.app`).

---

### Opção B: Publicar diretamente pelo Terminal (Vercel CLI)
1. No terminal do projeto, execute:
   ```bash
   npx vercel
   ```
2. Siga as instruções no terminal (faça login se solicitado).
3. Quando perguntar para configurar o projeto, confirme com `Y` e aceite os padrões.
4. Após o primeiro deploy, adicione as variáveis no painel da Vercel ou via CLI:
   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx vercel env add JWT_SECRET
   ```
5. Suba para produção com:
   ```bash
   npx vercel --prod
   ```

---

## 🔑 Acessos Iniciais para a Empresa

Ao acessar o link da Vercel no celular ou computador:

| Colaborador | Função | Usuário | Senha Padrão |
|---|---|---|---|
| **Dr. Roberto Linus** | Administrador (Vê métricas semana/mês e todos) | `admin` | `1234` |
| **Mariana Souza** | Funcionária (Recepção) | `mariana` | `1234` |
| **Carlos Eduardo** | Funcionário (Atendimento) | `carlos` | `1234` |
| **Ana Beatriz** | Funcionária (Triagem) | `ana` | `1234` |

---

## 📱 Dica de Ouro para a Apresentação na Empresa
Como o app é **Mobile-First**, você pode orientar a equipe da empresa a abrir o link no celular (Safari no iPhone ou Chrome no Android) e selecionar **"Adicionar à Tela de Início"**. O sistema abrirá como um aplicativo de verdade sem a barra do navegador!
