# 🧬 Laboratório LINUS - Sistema de Gestão e Cadastro de Clientes

Sistema moderno desenvolvido para o **Laboratório LINUS**, com autenticação simplificada (Usuário e Senha) e suporte ao banco de dados na nuvem **Supabase (PostgreSQL)** ou banco local integrado.

---

## 🚀 Acesso Simplificado (Usuário & Senha)

Não é mais necessário e-mail! Cada colaborador acessa o sistema diretamente com seu **Nome de Usuário** e **Senha**:

| Perfil | Colaborador | Nome de Usuário | Senha Padrão |
|---|---|---|---|
| **Administrador (ADM)** | Dr. Roberto Linus | `admin` | `1234` |
| **Funcionário (Recepção)** | Mariana Souza | `mariana` | `1234` |
| **Funcionário (Atendimento)** | Carlos Eduardo Lima | `carlos` | `1234` |
| **Funcionário (Triagem)** | Ana Beatriz Faria | `ana` | `1234` |

Na tela de login, você também pode clicar nos botões de **"Acesso Rápido"** para preencher automaticamente com 1 clique.

---

## 🗄️ Configuração do Banco de Dados Supabase (PostgreSQL)

O sistema já está preparado para conectar diretamente ao seu projeto no **Supabase**:

1. Acesse **[supabase.com](https://supabase.com)** e crie um projeto gratuito.
2. Abra a aba **SQL Editor** no painel do Supabase.
3. Abra o arquivo `supabase_schema.sql` deste projeto, copie todo o conteúdo, cole no SQL Editor do Supabase e clique em **RUN**.
4. No Supabase, vá em **Project Settings ➔ API** e copie:
   - `Project URL`
   - `anon public key`
5. Abra o arquivo `.env.local` na raiz deste projeto e cole as credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```
6. Pronto! O sistema passará a sincronizar diretamente com o banco de dados PostgreSQL na nuvem do Supabase.

*(Caso ainda não tenha configurado as chaves do Supabase, o sistema funciona normalmente usando o banco de dados local integrado sem quebrar nada!)*

---

## 🌟 Principais Funcionalidades

### 1. 🧑‍⚕️ Para o Funcionário / Atendente
- **Login Rápido**: Apenas nome de usuário e senha.
- **Ficha do Colaborador ("Meus Pacientes")**:
  - Lista exclusiva de todos os pacientes cadastrados por aquele atendente.
  - Busca em tempo real por **nome, CPF, telefone ou exames**.
  - Filtros rápidos por período (**Hoje, Esta Semana, Este Mês**).
  - Filtro por status do atendimento (*Aguardando*, *Em Coleta*, *Em Análise*, *Laudo Pronto*, *Concluído*).
- **Cadastro Laboratorial Completo**:
  - **Dados Pessoais**: Nome completo, CPF (máscara automática), RG, Data de Nascimento e Sexo.
  - **Contato & Localização**: WhatsApp formatado, E-mail, CEP e Endereço.
  - **Faturamento**: Seleção entre **Particular** e **Convênio** (com operadoras como Unimed, Bradesco, SulAmérica, Amil, etc., e nº da carteirinha).
  - **Exames Solicitados**: Atalhos de 1 clique para exames frequentes (*Hemograma, Glicemia, Perfil Lipídico, TSH, Urina, Beta HCG, Toxicológico, PSA*, etc.) e observações de jejum/alergias.
- **Emissão e Impressão de Protocolo**: Geração com 1 clique de protocolo de atendimento laboratorial timbrado para imprimir ou salvar em PDF.
- **Minhas Métricas**: Painel pessoal com volume de atendimentos de hoje, da semana e do mês.

---

### 2. 🛡️ Para o Administrador (ADM)
- **Dashboard de Métricas (Semana e Mês)**:
  - 📊 **Cadastros na Semana** (total consolidado dos últimos 7 dias).
  - 📆 **Cadastros no Mês** (total de atendimentos no mês vigente).
  - ⚡ **Cadastros Hoje** (tempo real).
  - 👥 **Total Histórico** de clientes na base.
  - 📈 **Gráfico diário**: evolução dia a dia da semana.
  - 🏆 **Ranking de Produtividade dos Funcionários**: comparativo visual detalhado de quantos clientes cada funcionário cadastrou **na semana**, **no mês** e no total.
  - 💳 **Distribuição por Modalidade**: percentual de Particular vs Convênios.
- **Gestão de Funcionários**:
  - Lista de colaboradores com departamento, usuário `@username` e métricas de cada um.
  - Botão **"Ver Ficha de Pacientes"**: permite ao ADM abrir a ficha de qualquer funcionário e inspecionar exatamente os pacientes que ele cadastrou.
  - Ativação / desativação de acessos.
  - Cadastro de novos colaboradores apenas com **Usuário**, **Nome**, **Senha** e **Departamento**.
- **Visão Geral e Exportação**:
  - Filtro por colaborador, período e exportação completa para **planilha CSV**.

---

## 💻 Como Iniciar o Sistema

Abra o terminal na pasta do projeto e execute:
```bash
npm run dev
```

Acesse no navegador:
👉 **[http://localhost:3000](http://localhost:3000)**
